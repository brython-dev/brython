// brython.js brython.info
// version [3, 3, 0, 'alpha', 0]
// implementation [3, 2, 5, 'alpha', 0]
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
$B.$py_module_path={}
$B.$py_src={}
$B.path=[$path+'Lib',$path+'libs',$script_dir,$path+'Lib/site-packages']
$B.bound={}
$B.type={}
$B.async_enabled=false
if($B.async_enabled)$B.block={}
$B.modules={}
$B.imported={}
$B.vars={}
$B._globals={}
$B.frames_stack=[]
$B.builtins={__repr__:function(){return "<module 'builtins>'"},__str__:function(){return "<module 'builtins'>"},}
$B.builtins_block={id:'__builtins__',module:'__builtins__'}
$B.modules['__builtins__']=$B.builtins_block
$B.bound['__builtins__']={'__BRYTHON__':true,'$eval':true,'$open': true}
$B.bound['__builtins__']['BaseException']=true
$B.type['__builtins__']={}
$B.builtin_funcs={}
$B.__getattr__=function(attr){return this[attr]}
$B.__setattr__=function(attr,value){
if(['debug','stdout','stderr'].indexOf(attr)>-1){$B[attr]=value}
else{throw $B.builtins.AttributeError('__BRYTHON__ object has no attribute '+attr)}}
$B.language=window.navigator.userLanguage ||window.navigator.language
$B.charset=document.characterSet ||document.inputEncoding ||"utf-8"
$B.max_int=Math.pow(2,53)-1
$B.min_int=-$B.max_int
$B.$py_next_hash=Math.pow(2,53)-1
$B.$py_UUID=0
$B.lambda_magic=Math.random().toString(36).substr(2,8)
$B.callbacks={}
var has_storage=typeof(Storage)!=="undefined"
if(has_storage){$B.has_local_storage=false
try{
if(localStorage){$B.local_storage=localStorage
$B.has_local_storage=true}}catch(err){}
$B.has_session_storage=false
try{
if(sessionStorage){$B.session_storage=sessionStorage
$B.has_session_storage=true}}catch(err){}}else{
$B.has_local_storage=false
$B.has_session_storage=false}
$B.globals=function(){
return $B.frames_stack[$B.frames_stack.length-1][3]}})(__BRYTHON__)
__BRYTHON__.implementation=[3,2,5,'alpha',0]
__BRYTHON__.__MAGIC__="3.2.5"
__BRYTHON__.version_info=[3,3,0,'alpha',0]
__BRYTHON__.compiled_date="2016-02-28 21:38:25.337382"
__BRYTHON__.builtin_module_names=["posix","sys","errno","time","_ajax","_browser","_html","_jsre","_multiprocessing","_posixsubprocess","_svg","_sys","builtins","dis","hashlib","javascript","json","long_int","math","modulefinder","random","_abcoll","_codecs","_collections","_csv","_functools","_imp","_io","_random","_socket","_sre","_string","_struct","_sysconfigdata","_testcapi","_thread","_warnings","_weakref"]

;(function($B){var js,$pos,res,$op
var keys=$B.keys=function(obj){var res=[],pos=0
for(var attr in obj){res[pos++]=attr}
res.sort()
return res}
var clone=$B.clone=function(obj){var res={}
for(var attr in obj){res[attr]=obj[attr]}
return res}
$B.last=function(table){return table[table.length-1]}
$B.list2obj=function(list,value){var res={},i=list.length
if(value===undefined){value=true}
while(i-->0){res[list[i]]=value}
return res}
var $operators={"//=":"ifloordiv",">>=":"irshift","<<=":"ilshift","**=":"ipow","**":"pow","//":"floordiv","<<":"lshift",">>":"rshift","+=":"iadd","-=":"isub","*=":"imul","/=":"itruediv","%=":"imod","&=":"iand","|=":"ior","^=":"ixor","+":"add","-":"sub","*":"mul","/":"truediv","%":"mod","&":"and","|":"or","~":"invert","^":"xor","<":"lt",">":"gt","<=":"le",">=":"ge","==":"eq","!=":"ne","or":"or","and":"and","in":"in","not": "not","is":"is","not_in":"not_in","is_not":"is_not" }
var $augmented_assigns={"//=":"ifloordiv",">>=":"irshift","<<=":"ilshift","**=":"ipow","+=":"iadd","-=":"isub","*=":"imul","/=":"itruediv","%=":"imod","&=":"iand","|=":"ior","^=":"ixor"}
var noassign=$B.list2obj(['True','False','None','__debug__'])
var $op_order=[['or'],['and'],['not'],['in','not_in'],['<','<=','>','>=','!=','==','is','is_not'],['|'],['^'],['&'],['>>','<<'],['+'],['-'],['*','/','//','%'],['unary_neg','unary_inv','unary_pos'],['**']
]
var $op_weight={}
var $weight=1
for(var $i=0;$i<$op_order.length;$i++){var _tmp=$op_order[$i]
for(var $j=0;$j<_tmp.length;$j++){$op_weight[_tmp[$j]]=$weight}
$weight++}
var $loop_num=0
$B.func_magic=Math.random().toString(36).substr(2,8)
function $_SyntaxError(C,msg,indent){
var ctx_node=C
while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
var module=tree_node.module
var line_num=tree_node.line_num
if(indent!==undefined){line_num++}
if(indent===undefined){if(Array.isArray(msg)){$B.$SyntaxError(module,msg[0],$pos)}
if(msg==="Triple string end not found"){
$B.$SyntaxError(module,'invalid syntax : triple string end not found',$pos)}
$B.$SyntaxError(module,'invalid syntax',$pos)}else{throw $B.$IndentationError(module,msg,$pos)}}
function $Node(type){this.type=type
this.children=[]
this.yield_atoms=[]
this.add=function(child){
this.children[this.children.length]=child
child.parent=this
child.module=this.module}
this.insert=function(pos,child){
this.children.splice(pos,0,child)
child.parent=this
child.module=this.module}
this.toString=function(){return "<object 'Node'>"}
this.show=function(indent){
var res=''
if(this.type==='module'){for(var i=0;i<this.children.length;i++){res +=this.children[i].show(indent)}
return res}
indent=indent ||0
res +=' '.repeat(indent)
res +=this.C
if(this.children.length>0)res +='{'
res +='\n'
for(var i=0;i<this.children.length;i++){res +='['+i+'] '+this.children[i].show(indent+4)}
if(this.children.length>0){res +=' '.repeat(indent)
res+='}\n'}
return res}
this.to_js=function(indent){
if(this.js!==undefined)return this.js
this.res=[]
var pos=0
this.unbound=[]
if(this.type==='module'){for(var i=0;i<this.children.length;i++){this.res[pos++]=this.children[i].to_js()
this.children[i].js_index=pos }
this.js=this.res.join('')
return this.js}
indent=indent ||0
var ctx_js=this.C.to_js()
if(ctx_js){
this.res[pos++]=' '.repeat(indent)
this.res[pos++]=ctx_js
this.js_index=pos 
if(this.children.length>0)this.res[pos++]='{'
this.res[pos++]='\n'
for(var i=0;i<this.children.length;i++){this.res[pos++]=this.children[i].to_js(indent+4)
this.children[i].js_index=pos }
if(this.children.length>0){this.res[pos++]=' '.repeat(indent)
this.res[pos++]='}\n'}}
this.js=this.res.join('')
return this.js}
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
offset +=3}
this.parent.insert(rank+offset,this)
this.yield_atoms=[]
return offset+1}
if(this.type==='module'){
this.doc_string=$get_docstring(this)
var i=0
while(i<this.children.length){var offset=this.children[i].transform(i)
if(offset===undefined){offset=1}
i +=offset}}else{var elt=this.C.tree[0],ctx_offset
if(elt.transform !==undefined){ctx_offset=elt.transform(this,rank)}
var i=0
while(i<this.children.length){var offset=this.children[i].transform(i)
if(offset===undefined){offset=1}
i +=offset}
if(ctx_offset===undefined){ctx_offset=1}
return ctx_offset}}
this.clone=function(){var res=new $Node(this.type)
for(var attr in this){res[attr]=this[attr]}
return res}}
function $AbstractExprCtx(C,with_commas){this.type='abstract_expr'
this.with_commas=with_commas
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){return '(abstract_expr '+with_commas+') '+this.tree}
this.to_js=function(){this.js_processed=true
if(this.type==='list')return '['+$to_js(this.tree)+']'
return $to_js(this.tree)}}
function $AliasCtx(C){
this.type='ctx_manager_alias'
this.parent=C
this.tree=[]
C.tree[C.tree.length-1].alias=this}
function $AnnotationCtx(C){
this.type='annotation'
this.parent=C
this.tree=[]
C.annotation=this
this.toString=function(){return '(annotation) '+this.tree}
this.to_js=function(){return $to_js(this.tree)}}
function $AssertCtx(C){
this.type='assert'
this.toString=function(){return '(assert) '+this.tree}
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.transform=function(node,rank){if(this.tree[0].type==='list_or_tuple'){
var condition=this.tree[0].tree[0]
var message=this.tree[0].tree[1]}else{var condition=this.tree[0]
var message=null}
var new_ctx=new $ConditionCtx(node.C,'if')
var not_ctx=new $NotCtx(new_ctx)
not_ctx.tree=[condition]
node.C=new_ctx
var new_node=new $Node()
var js='throw AssertionError("AssertionError")'
if(message !==null){js='throw AssertionError(str('+message.to_js()+'))'}
new $NodeJSCtx(new_node,js)
node.add(new_node)}}
function $AssignCtx(C){
var ctx=C
while(ctx){if(ctx.type=='assert'){$_SyntaxError(C,'invalid syntax - assign')}
ctx=ctx.parent}
this.type='assign'
C.parent.tree.pop()
C.parent.tree[C.parent.tree.length]=this
this.parent=C.parent
this.tree=[C]
var scope=$get_scope(this)
if(C.type=='expr' && C.tree[0].type=='call'){$_SyntaxError(C,["can't assign to function call "])}else if(C.type=='list_or_tuple' ||
(C.type=='expr' && C.tree[0].type=='list_or_tuple')){if(C.type=='expr'){C=C.tree[0]}
for(var name in C.ids()){$B.bound[scope.id][name]=true}}else if(C.type=='assign'){for(var i=0;i<C.tree.length;i++){var assigned=C.tree[i].tree[0]
if(assigned.type=='id'){$B.bound[scope.id][assigned.value]=true}}}else{var assigned=C.tree[0]
if(assigned && assigned.type=='id'){if(noassign[assigned.value]===true){$_SyntaxError(C,["can't assign to keyword"])}
assigned.bound=true
if(!$B._globals[scope.id]||
$B._globals[scope.id][assigned.value]===undefined){
var node=$get_node(this)
node.bound_before=$B.keys($B.bound[scope.id])
$B.bound[scope.id][assigned.value]=true}}}
this.guess_type=function(){if(this.tree[0].type=="expr" && this.tree[0].tree[0].type=="id"){$set_type(scope,this.tree[0],this.tree[1])}else if(this.tree[0].type=='assign'){var left=this.tree[0].tree[0].tree[0]
var right=this.tree[0].tree[1].tree[0]
$set_type(scope,right,this.tree[1].tree[0])
this.tree[0].guess_type()}else{}}
this.toString=function(){return '(assign) '+this.tree[0]+'='+this.tree[1]}
this.transform=function(node,rank){
var scope=$get_scope(this)
var left=this.tree[0],right=this.tree[1],assigned=[]
while(left.type=='assign'){assigned.push(left.tree[1])
left=left.tree[0]}
if(assigned.length>0){assigned.push(left)
var ctx=node.C
ctx.tree=[]
var nleft=new $RawJSCtx(ctx,'var $temp'+$loop_num)
nleft.tree=ctx.tree
nassign=new $AssignCtx(nleft)
nassign.tree[1]=right
for(var i=0;i<assigned.length;i++){var new_node=new $Node(),node_ctx=new $NodeCtx(new_node)
node.parent.insert(rank+1,new_node)
assigned[i].parent=node_ctx
var assign=new $AssignCtx(assigned[i])
new $RawJSCtx(assign,'$temp'+$loop_num)}
return assigned.length-1}
var left_items=null
switch(left.type){case 'expr':
if(left.tree.length>1){left_items=left.tree}else if(left.tree[0].type==='list_or_tuple'||left.tree[0].type==='target_list'){left_items=left.tree[0].tree}else if(left.tree[0].type=='id'){
var name=left.tree[0].value
if($B._globals && $B._globals[scope.id]
&& $B._globals[scope.id][name]){void(0)}else{left.tree[0].bound=true}}
break
case 'target_list': 
case 'list_or_tuple':
left_items=left.tree}
if(left_items===null){return}
var right=this.tree[1]
var right_items=null
if(right.type==='list'||right.type==='tuple'||
(right.type==='expr' && right.tree.length>1)){right_items=right.tree}
if(right_items!==null){
if(right_items.length>left_items.length){throw Error('ValueError : too many values to unpack (expected '+left_items.length+')')}else if(right_items.length<left_items.length){throw Error('ValueError : need more than '+right_items.length+' to unpack')}
var new_nodes=[],pos=0
var new_node=new $Node()
new $NodeJSCtx(new_node,'void(0)')
new_nodes[pos++]=new_node
var $var='$temp'+$loop_num
var new_node=new $Node()
new $NodeJSCtx(new_node,'var '+$var+'=[], $pos=0')
new_nodes[pos++]=new_node
for(var i=0;i<right_items.length;i++){var js=$var+'[$pos++]='+right_items[i].to_js()
var new_node=new $Node()
new $NodeJSCtx(new_node,js)
new_nodes[pos++]=new_node}
for(var i=0;i<left_items.length;i++){var new_node=new $Node()
new_node.id=$get_node(this).module
var C=new $NodeCtx(new_node)
left_items[i].parent=C
var assign=new $AssignCtx(left_items[i],false)
assign.tree[1]=new $JSCode($var+'['+i+']')
new_nodes[pos++]=new_node}
node.parent.children.splice(rank,1)
for(var i=new_nodes.length-1;i>=0;i--){node.parent.insert(rank,new_nodes[i])}
$loop_num++}else{
var new_node=new $Node()
new_node.line_num=node.line_num
var js='var $right'+$loop_num+'=getattr'
js +='(iter('+right.to_js()+'),"__next__");'
new $NodeJSCtx(new_node,js)
var new_nodes=[new_node],pos=1
var rlist_node=new $Node()
var $var='$rlist'+$loop_num
js='var '+$var+'=[], $pos=0;'
js +='while(1){try{'+$var+'[$pos++]=$right'
js +=$loop_num+'()}catch(err){break}};'
new $NodeJSCtx(rlist_node,js)
new_nodes[pos++]=rlist_node
var packed=null
for(var i=0;i<left_items.length;i++){var expr=left_items[i]
if(expr.type=='packed' ||
(expr.type=='expr' && expr.tree[0].type=='packed')){packed=i
break}}
var check_node=new $Node()
var min_length=left_items.length
if(packed!==null){min_length--}
js='if($rlist'+$loop_num+'.length<'+min_length+')'
js +='{throw ValueError("need more than "+$rlist'+$loop_num
js +='.length+" value" + ($rlist'+$loop_num+'.length>1 ?'
js +=' "s" : "")+" to unpack")}'
new $NodeJSCtx(check_node,js)
new_nodes[pos++]=check_node
if(packed==null){var check_node=new $Node()
var min_length=left_items.length
js='if($rlist'+$loop_num+'.length>'+min_length+')'
js +='{throw ValueError("too many values to unpack '
js +='(expected '+left_items.length+')")}'
new $NodeJSCtx(check_node,js)
new_nodes[pos++]=check_node}
var j=0
for(var i=0;i<left_items.length;i++){var new_node=new $Node()
new_node.id=scope.id
var C=new $NodeCtx(new_node)
left_items[i].parent=C
var assign=new $AssignCtx(left_items[i],false)
var js='$rlist'+$loop_num
if(packed==null ||i<packed){js +='['+i+']'}else if(i==packed){js +='.slice('+i+',$rlist'+$loop_num+'.length-'
js +=(left_items.length-i-1)+')'}else{js +='[$rlist'+$loop_num+'.length-'+(left_items.length-i)+']'}
assign.tree[1]=new $JSCode(js)
new_nodes[pos++]=new_node}
node.parent.children.splice(rank,1)
for(var i=new_nodes.length-1;i>=0;i--){node.parent.insert(rank,new_nodes[i])}
$loop_num++}}
this.to_js=function(){this.js_processed=true
if(this.parent.type==='call'){
return '{$nat:"kw",name:'+this.tree[0].to_js()+',value:'+this.tree[1].to_js()+'}'}
var left=this.tree[0]
if(left.type==='expr')left=left.tree[0]
var right=this.tree[1]
if(left.type=='attribute' ||left.type=='sub'){
var node=$get_node(this),right_js=right.to_js()
var res='',rvar='',$var='$temp'+$loop_num
if(right.type=='expr' && right.tree[0]!==undefined &&
right.tree[0].type=='call' &&
('eval'==right.tree[0].func.value ||
'exec'==right.tree[0].func.value)){res +='var '+$var+'='+right_js+';\n'
rvar=$var}else if(right.type=='expr' && right.tree[0]!==undefined &&
right.tree[0].type=='sub'){res +='var '+$var+'='+right_js+';\n'
rvar=$var}else{rvar=right_js}
if(left.type==='attribute'){
$loop_num++
left.func='setattr'
res +=left.to_js()
left.func='getattr'
res=res.substr(0,res.length-1)
return res + ','+rvar+');None;'}
if(left.type==='sub'){
var seq=left.value.to_js(),temp='$temp'+$loop_num,type
if(left.value.type=='id'){type=$get_node(this).locals[left.value.value]}
$loop_num++
var res='var '+temp+'='+seq+'\n'
if(type!=='list'){res +='if(Array.isArray('+temp+') && !'+temp+'.__class__){'}
if(left.tree.length==1){res +='$B.set_list_key('+temp+','+
(left.tree[0].to_js()+''||'null')+','+
right.to_js()+')'}else if(left.tree.length==2){res +='$B.set_list_slice('+temp+','+
(left.tree[0].to_js()+''||'null')+','+
(left.tree[1].to_js()+''||'null')+','+
right.to_js()+')'}else if(left.tree.length==3){res +='$B.set_list_slice_step('+temp+','+
(left.tree[0].to_js()+''||'null')+','+
(left.tree[1].to_js()+''||'null')+','+
(left.tree[2].to_js()+''||'null')+','+
right.to_js()+')'}
if(type=='list'){return res}
res +='\n}else{'
if(left.tree.length==1){res +='$B.$setitem('+left.value.to_js()
res +=','+left.tree[0].to_js()+','+right_js+')};None;'}else{left.func='setitem' 
res +=left.to_js()
res=res.substr(0,res.length-1)
left.func='getitem' 
res +=','+right_js+')};None;'}
return res}}
return left.to_js()+'='+right.to_js()}}
function $AttrCtx(C){
this.type='attribute'
this.value=C.tree[0]
this.parent=C
C.tree.pop()
C.tree[C.tree.length]=this
this.tree=[]
this.func='getattr' 
this.toString=function(){return '(attr) '+this.value+'.'+this.name}
this.to_js=function(){this.js_processed=true
return this.func+'('+this.value.to_js()+',"'+this.name+'")'}}
function $AugmentedAssignCtx(C,op){
this.type='augm_assign'
this.parent=C.parent
C.parent.tree.pop()
C.parent.tree[C.parent.tree.length]=this
this.op=op
this.tree=[C]
var scope=this.scope=$get_scope(this)
if(C.type=='expr' && C.tree[0].type=='id'){var name=C.tree[0].value
if(noassign[name]===true){$_SyntaxError(C,["can't assign to keyword"])}else if((scope.ntype=='def'||scope.ntype=='generator')&&
$B.bound[scope.id][name]===undefined){if(scope.globals===undefined ||scope.globals.indexOf(name)==-1){
C.tree[0].unbound=true}}}
$get_node(this).bound_before=$B.keys($B.bound[scope.id])
this.module=scope.module
this.toString=function(){return '(augm assign) '+this.tree}
this.transform=function(node,rank){var func='__'+$operators[op]+'__'
var offset=0,parent=node.parent
var line_num=node.line_num,lnum_set=false
parent.children.splice(rank,1)
var left_is_id=(this.tree[0].type=='expr' && 
this.tree[0].tree[0].type=='id')
if(left_is_id){
this.tree[0].tree[0].augm_assign=true
if($B.debug>0){var check_node=$NodeJS('if('+this.tree[0].to_js()+
'===undefined){throw NameError("name \''+
                    this.tree[0].tree[0].value+'\' is not defined")}')
node.parent.insert(rank,check_node)
offset++}
var left_id=this.tree[0].tree[0].value,was_bound=$B.bound[this.scope.id][left_id]!==undefined,left_id_unbound=this.tree[0].tree[0].unbound}
var right_is_int=(this.tree[1].type=='expr' && 
this.tree[1].tree[0].type=='int')
var right=right_is_int ? this.tree[1].tree[0].to_js(): '$temp'
if(!right_is_int){
var new_node=new $Node()
new_node.line_num=line_num
lnum_set=true
new $NodeJSCtx(new_node,'var $temp,$left;')
parent.insert(rank,new_node)
offset++
var new_node=new $Node()
new_node.id=this.scope.id
var new_ctx=new $NodeCtx(new_node)
var new_expr=new $ExprCtx(new_ctx,'js',false)
var _id=new $RawJSCtx(new_expr,'$temp')
var assign=new $AssignCtx(new_expr)
assign.tree[1]=this.tree[1]
_id.parent=assign
parent.insert(rank+offset,new_node)
offset++}
var prefix='',in_class=false
switch(op){case '+=':
case '-=':
case '*=':
case '/=':
if(left_is_id){var scope=this.scope,local_ns='$local_'+scope.id.replace(/\./g,'_'),global_ns='$local_'+scope.module.replace(/\./g,'_'),prefix
switch(scope.ntype){case 'module':
prefix=global_ns
break
case 'def':
case 'generator':
if(scope.globals && scope.globals.indexOf(C.tree[0].value)>-1){prefix=global_ns}else{prefix='$locals'}
break;
case 'class':
var new_node=new $Node()
if(!lnum_set){new_node.line_num=line_num;lnum_set=true}
new $NodeJSCtx(new_node,'var $left='+C.to_js())
parent.insert(rank+offset,new_node)
in_class=true
offset++}}}
var left=C.tree[0].to_js()
prefix=prefix && !C.tree[0].unknown_binding && left_id_unbound===undefined
var op1=op.charAt(0)
if(prefix){var left1=in_class ? '$left' : left
var new_node=new $Node()
if(!lnum_set){new_node.line_num=line_num;lnum_set=true}
js=right_is_int ? 'if(' : 'if(typeof $temp.valueOf()=="number" && '
js +=left1+'.constructor===Number' 
js +='&& '+left+op1+right+'>$B.min_int && '+left+op1+right+
'< $B.max_int){'
js +=right_is_int ? '(' : '(typeof $temp=="number" && '
js +='typeof '+left1+'=="number") ? '
js +=left+op+right
js +=' : ('+left1+'.constructor===Number ? '
js +=left+'=float('+left+op1
js +=right_is_int ? right : right+'.valueOf()'
js +=') : '+left + op
js +=right_is_int ? right : right+'.valueOf()'
js +=')}'
new $NodeJSCtx(new_node,js)
parent.insert(rank+offset,new_node)
offset++}
var aaops={'+=':'add','-=':'sub','*=':'mul'}
if(C.tree[0].type=='sub' &&
('+='==op ||'-='==op ||'*='==op)&& 
C.tree[0].tree.length==1){var js1='$B.augm_item_'+aaops[op]+'('
js1 +=C.tree[0].value.to_js()
js1 +=','+C.tree[0].tree[0].to_js()+','
js1 +=right+');None;'
var new_node=new $Node()
if(!lnum_set){new_node.line_num=line_num;lnum_set=true}
new $NodeJSCtx(new_node,js1)
parent.insert(rank+offset,new_node)
offset++
return}
var new_node=new $Node()
if(!lnum_set){new_node.line_num=line_num;lnum_set=true}
var js=''
if(prefix){js +='else '}
js +='if(!hasattr('+C.to_js()+',"'+func+'"))'
new $NodeJSCtx(new_node,js)
parent.insert(rank+offset,new_node)
offset ++
var aa1=new $Node()
aa1.id=this.scope.id
var ctx1=new $NodeCtx(aa1)
var expr1=new $ExprCtx(ctx1,'clone',false)
if(left_id_unbound){new $RawJSCtx(expr1,'$locals["'+left_id+'"]')}else{expr1.tree=C.tree
for(var i=0;i<expr1.tree.length;i++){expr1.tree[i].parent=expr1}}
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
var js3='getattr('+C.to_js()+',"'+func+'")('+right+')'
new $NodeJSCtx(aa3,js3)
aa2.add(aa3)
if(left_is_id && !was_bound && !this.scope.blurred){$B.bound[this.scope.id][left_id]=undefined}
return offset}
this.to_js=function(){return ''}}
function $BodyCtx(C){
var ctx_node=C.parent
while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
var body_node=new $Node()
body_node.line_num=tree_node.line_num
tree_node.insert(0,body_node)
return new $NodeCtx(body_node)}
function $BreakCtx(C){
this.type='break'
this.toString=function(){return 'break '}
this.parent=C
C.tree[C.tree.length]=this
var ctx_node=C
while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
var loop_node=tree_node.parent
var break_flag=false
while(1){if(loop_node.type==='module'){
$_SyntaxError(C,'break outside of a loop')}else{var ctx=loop_node.C.tree[0]
if(ctx.type==='condition' && ctx.token==='while'){this.loop_ctx=ctx
ctx.has_break=true
break}
switch(ctx.type){case 'for':
this.loop_ctx=ctx
ctx.has_break=true
break_flag=true
break
case 'def':
case 'generator':
case 'class':
$_SyntaxError(C,'break outside of a loop')
default:
loop_node=loop_node.parent}
if(break_flag)break}}
this.to_js=function(){this.js_processed=true
var scope=$get_scope(this)
var res=';$locals_'+scope.id.replace(/\./g,'_')
return res + '["$no_break'+this.loop_ctx.loop_num+'"]=false;break;'}}
function $CallArgCtx(C){
this.type='call_arg'
this.toString=function(){return 'call_arg '+this.tree}
this.parent=C
this.start=$pos
this.tree=[]
C.tree[C.tree.length]=this
this.expect='id'
this.to_js=function(){this.js_processed=true
return $to_js(this.tree)}}
function $CallCtx(C){
this.type='call'
this.func=C.tree[0]
if(this.func!==undefined){
this.func.parent=this}
this.parent=C
if(C.type!='class'){C.tree.pop()
C.tree[C.tree.length]=this}else{
C.args=this}
this.expect='id'
this.tree=[]
this.start=$pos
this.toString=function(){return '(call) '+this.func+'('+this.tree+')'}
this.to_js=function(){this.js_processed=true
if(this.tree.length>0){if(this.tree[this.tree.length-1].tree.length==0){
this.tree.pop()}}
var func_js=this.func.to_js()
if(this.func!==undefined){switch(this.func.value){case 'classmethod':
return 'classmethod('+$to_js(this.tree)+')'
case '$$super':
if(this.tree.length==0){
var scope=$get_scope(this)
if(scope.ntype=='def' ||scope.ntype=='generator'){var def_scope=$get_scope(scope.C.tree[0])
if(def_scope.ntype=='class'){new $IdCtx(this,def_scope.C.tree[0].name)}}}
if(this.tree.length==1){
var scope=$get_scope(this)
if(scope.ntype=='def' ||scope.ntype=='generator'){var args=scope.C.tree[0].args
if(args.length>0){new $IdCtx(this,args[0])}}}
break
default:
if(this.func.type=='unary'){
switch(this.func.op){case '+':
return 'getattr('+$to_js(this.tree)+',"__pos__")()'
case '-':
return 'getattr('+$to_js(this.tree)+',"__neg__")()'
case '~':
return 'getattr('+$to_js(this.tree)+',"__invert__")()'}}}
var _block=false
if($B.async_enabled){var scope=$get_scope(this.func)
if($B.block[scope.id]===undefined){}
else if($B.block[scope.id][this.func.value])_block=true}
var pos_args=[],kw_args=[],star_args=null,dstar_args=null
for(var i=0;i<this.tree.length;i++){var arg=this.tree[i],type
switch(arg.type){case 'star_arg':
star_args=arg.tree[0].tree[0].to_js()
break
case 'double_star_arg':
dstar_args=arg.tree[0].tree[0].to_js()
break
case 'id':
pos_args.push(arg.to_js())
break
default:
if(arg.tree[0]===undefined){console.log('bizarre',arg)}
else{type=arg.tree[0].type}
switch(type){case 'expr':
pos_args.push(arg.to_js())
break
case 'kwarg':
kw_args.push(arg.tree[0].tree[0].value+':'+arg.tree[0].tree[1].to_js())
break
case 'list_or_tuple':
case 'op':
pos_args.push(arg.to_js())
break
case 'star_arg':
star_args=arg.tree[0].tree[0].to_js()
break
case 'double_star_arg':
dstar_args=arg.tree[0].tree[0].to_js()
break
default:
pos_args.push(arg.to_js())
break}
break}}
var args_str=pos_args.join(', ')
if(star_args){args_str='$B.extend_list('+args_str
if(pos_args.length>0){args_str +=','}
args_str +='_b_.list('+star_args+'))'}
if(this.func.value=="fghjk"){console.log('fghjk')
var kw_args_str='{'+kw_args.join(', ')+'}'
if(dstar_args){kw_args_str='$B.extend("'+this.func.value+'",'+kw_args_str
kw_args_str +=','+dstar_args+')'}else if(kw_args_str=='{}'){kw_args_str=''}
var res='getattr('+func_js+',"__call__")(['+args_str+']'
if(kw_args_str.length>0){res +=', '+kw_args_str}
return res + ')'}
var kw_args_str='{'+kw_args.join(', ')+'}'
if(dstar_args){kw_args_str='{$nat:"kw",kw:$B.extend("'+this.func.value+'",'+kw_args_str
kw_args_str +=','+dstar_args+')}'}else if(kw_args_str!=='{}'){kw_args_str='{$nat:"kw",kw:'+kw_args_str+'}'}else{kw_args_str=''}
if(star_args && kw_args_str){args_str +='.concat(['+kw_args_str+'])' }else{if(args_str && kw_args_str){args_str +=','+kw_args_str}
else if(!args_str){args_str=kw_args_str}}
if(star_args){
args_str='.apply(null,'+args_str+')'}else{args_str='('+args_str+')'}
if($B.debug>0){
var res=""
if(_block){
res="@@;$B.execution_object.$append($jscode, 10); "
res+="$B.execution_object.$execute_next_segment(); "
res+="$jscode=@@"}
res +='getattr('+func_js+',"__call__")'
return res+args_str}
if(this.tree.length>-1){if(this.func.type=='id'){if(this.func.is_builtin){
if($B.builtin_funcs[this.func.value]!==undefined){return func_js+args_str}}else{var bound_obj=this.func.found
if(bound_obj &&(bound_obj.type=='class' ||
bound_obj.type=='def')){return func_js+args_str}}
var res='('+func_js+'.$is_func ? '
res +=func_js+' : '
res +='getattr('+func_js+',"__call__"))'+args_str}else{var res='getattr('+func_js+',"__call__")'+args_str}
return res}
return 'getattr('+func_js+',"__call__")()'}}}
function $ClassCtx(C){
this.type='class'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.expect='id'
this.toString=function(){return '(class) '+this.name+' '+this.tree+' args '+this.args}
var scope=this.scope=$get_scope(this)
this.parent.node.parent_block=scope
this.parent.node.bound={}
this.set_name=function(name){this.random=$B.UUID()
this.name=name
this.id=C.node.module+'_'+name+'_'+this.random
$B.bound[this.id]={}
$B.type[this.id]={}
if($B.async_enabled)$B.block[this.id]={}
$B.modules[this.id]=this.parent.node
this.parent.node.id=this.id
var parent_block=scope
while(parent_block.C && parent_block.C.tree[0].type=='class'){parent_block=parent_block.parent}
while(parent_block.C && 
'def' !=parent_block.C.tree[0].type &&
'generator' !=parent_block.C.tree[0].type){parent_block=parent_block.parent}
this.parent.node.parent_block=parent_block
$B.bound[this.scope.id][name]=this
$B.type[this.scope.id][name]='class'
if(scope.is_function){if(scope.C.tree[0].locals.indexOf(name)==-1){scope.C.tree[0].locals.push(name)}}}
this.transform=function(node,rank){
this.doc_string=$get_docstring(node)
var instance_decl=new $Node()
var local_ns='$locals_'+this.id.replace(/\./g,'_')
var js=';var '+local_ns+'={}'
js +=', $locals = '+local_ns+';'
new $NodeJSCtx(instance_decl,js)
node.insert(0,instance_decl)
var ret_obj=new $Node()
new $NodeJSCtx(ret_obj,'return '+local_ns+';')
node.insert(node.children.length,ret_obj)
var run_func=new $Node()
new $NodeJSCtx(run_func,')();')
node.parent.insert(rank+1,run_func)
var scope=$get_scope(this)
var name_ref=';$locals_'+scope.id.replace(/\./g,'_')
name_ref +='["'+this.name+'"]'
if(this.name=="FF"){
var js=[name_ref +'=$B.$class_constructor1("'+this.name],pos=1}else{var js=[name_ref +'=$B.$class_constructor("'+this.name],pos=1}
js[pos++]='",$'+this.name+'_'+this.random
if(this.args!==undefined){
var arg_tree=this.args.tree,args=[],kw=[]
for(var i=0;i<arg_tree.length;i++){var _tmp=arg_tree[i]
if(_tmp.tree[0].type=='kwarg'){kw.push(_tmp.tree[0])}
else{args.push(_tmp.to_js())}}
js[pos++]=',tuple(['+args.join(',')+']),['
var _re=new RegExp('"','g')
var _r=[],rpos=0
for(var i=0;i<args.length;i++){_r[rpos++]='"'+args[i].replace(_re,'\\"')+'"'}
js[pos++]=_r.join(',')+ ']'
_r=[],rpos=0
for(var i=0;i<kw.length;i++){var _tmp=kw[i]
_r[rpos++]='["'+_tmp.tree[0].value+'",'+_tmp.tree[1].to_js()+']'}
js[pos++]=',[' + _r.join(',')+ ']'}else{
js[pos++]=',tuple([]),[],[]'}
js[pos++]=')'
var cl_cons=new $Node()
new $NodeJSCtx(cl_cons,js.join(''))
rank++
node.parent.insert(rank+1,cl_cons)
rank++
var ds_node=new $Node()
js=name_ref+'.$dict.__doc__='
js +=(this.doc_string ||'None')+';'
new $NodeJSCtx(ds_node,js)
node.parent.insert(rank+1,ds_node)
rank++
js=name_ref+'.$dict.__module__=$locals_'+
$get_module(this).module.replace(/\./g,'_')+'.__name__'
var mod_node=new $Node()
new $NodeJSCtx(mod_node,js)
node.parent.insert(rank+1,mod_node)
if(scope.ntype==='module'){var w_decl=new $Node()
new $NodeJSCtx(w_decl,'$locals["'+ this.name+'"]='+this.name)}
var end_node=new $Node()
new $NodeJSCtx(end_node,'None;')
node.parent.insert(rank+2,end_node)
this.transformed=true}
this.to_js=function(){this.js_processed=true
return 'var $'+this.name+'_'+this.random+'=(function()'}}
function $CompIfCtx(C){
this.type='comp_if'
C.parent.intervals.push($pos)
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){return '(comp if) '+this.tree}
this.to_js=function(){this.js_processed=true
return $to_js(this.tree)}}
function $ComprehensionCtx(C){
this.type='comprehension'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){return '(comprehension) '+this.tree}
this.to_js=function(){this.js_processed=true
var _i=[],pos=0 
for(var j=0;j<this.tree.length;j++)_i[pos++]=this.tree[j].start
return _i}}
function $CompForCtx(C){
this.type='comp_for'
C.parent.intervals.push($pos)
this.parent=C
this.tree=[]
this.expect='in'
C.tree[C.tree.length]=this
this.toString=function(){return '(comp for) '+this.tree}
this.to_js=function(){this.js_processed=true
return $to_js(this.tree)}}
function $CompIterableCtx(C){
this.type='comp_iterable'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){return '(comp iter) '+this.tree}
this.to_js=function(){this.js_processed=true
return $to_js(this.tree)}}
function $ConditionCtx(C,token){
this.type='condition'
this.token=token
this.parent=C
this.tree=[]
if(token==='while'){this.loop_num=$loop_num++}
C.tree[C.tree.length]=this
this.toString=function(){return this.token+' '+this.tree}
this.transform=function(node,rank){var scope=$get_scope(this)
if(this.token=="while"){if(scope.ntype=='generator'){this.parent.node.loop_start=this.loop_num}
var new_node=new $Node()
var js='$locals["$no_break'+this.loop_num+'"]=true'
new $NodeJSCtx(new_node,js)
node.parent.insert(rank,new_node)
return 2}}
this.to_js=function(){this.js_processed=true
var tok=this.token
if(tok==='elif'){tok='else if'}
var res=[tok+'(bool('],pos=1
if(tok=='while'){
if(__BRYTHON__.loop_timeout){var h='\n'+' '.repeat($get_node(this).indent),h4=h+' '.repeat(4),num=this.loop_num,test_timeout=h+'var $time'+num+' = new Date()'+h+
'function $test_timeout'+num+'()'+h4+
'{if((new Date())-$time'+num+'>'+
__BRYTHON__.loop_timeout*1000+
'){throw _b_.RuntimeError("script timeout")}'+
h4+'return true'+h+'}\n'
res.splice(0,0,test_timeout)
res.push('$test_timeout'+num+'() && ')}
res.push('$locals["$no_break'+this.loop_num+'"] && ')}
if(this.tree.length==1){res.push($to_js(this.tree)+'))')}else{
res.push(this.tree[0].to_js()+'))')
if(this.tree[1].tree.length>0){res.push('{'+this.tree[1].to_js()+'}')}}
return res.join('')}}
function $ContinueCtx(C){
this.type='continue'
this.parent=C
C.tree[C.tree.length]=this
this.toString=function(){return '(continue)'}
this.to_js=function(){this.js_processed=true
return 'continue'}}
function $DebuggerCtx(C){
this.type='continue'
this.parent=C
C.tree[C.tree.length]=this
this.toString=function(){return '(debugger)'}
this.to_js=function(){this.js_processed=true
return 'debugger'}}
function $DecoratorCtx(C){
this.type='decorator'
this.parent=C
C.tree[C.tree.length]=this
this.tree=[]
this.toString=function(){return '(decorator) '+this.tree}
this.transform=function(node,rank){var func_rank=rank+1,children=node.parent.children
var decorators=[this.tree]
while(1){if(func_rank>=children.length){$_SyntaxError(C,['decorator expects function'])}
else if(children[func_rank].C.type=='node_js'){func_rank++}
else if(children[func_rank].C.tree[0].type==='decorator'){decorators.push(children[func_rank].C.tree[0].tree)
children.splice(func_rank,1)}else{break}}
this.dec_ids=[]
var pos=0
for(var i=0;i<decorators.length;i++){this.dec_ids[pos++]='$id'+ $B.UUID()}
if($B.async_enabled){var _block_async_flag=false;
for(var i=0;i<decorators.length;i++){try{
var name=decorators[i][0].tree[0].value
if(name=="brython_block" ||name=="brython_async")_block_async_flag=true}catch(err){console.log(i);console.log(decorators[i][0])}}}
var obj=children[func_rank].C.tree[0]
if(obj.type=='def'){obj.decorated=true
obj.alias='$dec'+$B.UUID()}
var callable=children[func_rank].C
var tail=''
var scope=$get_scope(this)
var ref='$locals["'+obj.name+'"]'
var res=ref+'='
for(var i=0;i<decorators.length;i++){
res +=this.dec_ids[i]+'('
tail +=')'}
res +=(obj.decorated ? obj.alias : ref)+tail+';'
$B.bound[scope.id][obj.name]=true
var decor_node=new $Node()
new $NodeJSCtx(decor_node,res)
node.parent.insert(func_rank+1,decor_node)
this.decorators=decorators
if($B.async_enabled && _block_async_flag){
if($B.block[scope.id]===undefined)$B.block[scope.id]={}
$B.block[scope.id][obj.name]=true}}
this.to_js=function(){if($B.async_enabled){if(this.processing !==undefined)return ""}
this.js_processed=true
var res=[],pos=0
for(var i=0;i<this.decorators.length;i++){res[pos++]='var '+this.dec_ids[i]+'='+$to_js(this.decorators[i])+';'}
return res.join('')}}
function $DefCtx(C){this.type='def'
this.name=null
this.parent=C
this.tree=[]
this.locals=[]
this.yields=[]
C.tree[C.tree.length]=this
this.enclosing=[]
var scope=this.scope=$get_scope(this)
var parent_block=scope
while(parent_block.C && parent_block.C.tree[0].type=='class'){parent_block=parent_block.parent}
while(parent_block.C && 
'def' !=parent_block.C.tree[0].type &&
'generator' !=parent_block.C.tree[0].type){parent_block=parent_block.parent}
this.parent.node.parent_block=parent_block
var pb=parent_block
while(pb && pb.C){if(pb.C.tree[0].type=='def'){this.inside_function=true
break}
pb=pb.parent_block}
this.module=scope.module
this.positional_list=[]
this.default_list=[]
this.other_args=null
this.other_kw=null
this.after_star=[]
this.set_name=function(name){var id_ctx=new $IdCtx(this,name)
this.name=name
this.id=this.scope.id+'_'+name
this.id=this.id.replace(/\./g,'_')
this.id +='_'+ $B.UUID()
this.parent.node.id=this.id
this.parent.node.module=this.module
$B.modules[this.id]=this.parent.node
$B.bound[this.id]={}
$B.type[this.id]={}
$B.bound[this.scope.id][name]=this
try{$B.type[this.scope.id][name]='function'}catch(err){console.log(err,this.scope.id)}
id_ctx.bound=true
if(scope.is_function){if(scope.C.tree[0].locals.indexOf(name)==-1){scope.C.tree[0].locals.push(name)}}}
this.toString=function(){return 'def '+this.name+'('+this.tree+')'}
this.transform=function(node,rank){
if(this.transformed!==undefined)return
var scope=this.scope
var pb=this.parent.node
var flag=this.name.substr(0,4)=='func'
while(pb && pb.C){if(pb.C.tree[0].type=='def'){this.inside_function=true
break}
pb=pb.parent}
this.doc_string=$get_docstring(node)
this.rank=rank 
var fglobs=this.parent.node.globals
var indent=node.indent+16
var header=$ws(indent)
if(this.name.substr(0,15)=='lambda_'+$B.lambda_magic){var pblock=$B.modules[scope.id].parent_block
if(pblock.C && pblock.C.tree[0].type=="def"){this.enclosing.push(pblock)}}
var pnode=this.parent.node
while(pnode.parent && pnode.parent.is_def_func){this.enclosing.push(pnode.parent.parent)
pnode=pnode.parent.parent}
var defaults=[],apos=0,dpos=0,defs1=[],dpos1=0
this.argcount=0
this.kwonlyargcount=0 
this.varnames={}
this.args=[]
this.__defaults__=[]
this.slots=[]
var slot_list=[]
var annotations=[]
if(this.annotation){annotations.push('"return":'+this.annotation.to_js())}
var func_args=this.tree[1].tree
for(var i=0;i<func_args.length;i++){var arg=func_args[i]
this.args[apos++]=arg.name
this.varnames[arg.name]=true
if(arg.type==='func_arg_id'){if(this.star_arg){this.kwonlyargcount++}
else{this.argcount++}
this.slots.push(arg.name+':null')
slot_list.push('"'+arg.name+'"')
if(arg.tree.length>0){defaults[dpos++]='"'+arg.name+'"'
defs1[dpos1++]=arg.name+':'+$to_js(arg.tree)
this.__defaults__.push($to_js(arg.tree))}}else if(arg.type=='func_star_arg'){if(arg.op=='*'){this.star_arg=arg.name}
else if(arg.op=='**'){this.kw_arg=arg.name}}
if(arg.annotation){annotations.push(arg.name+': '+arg.annotation.to_js())}}
var flags=67
if(this.star_arg){flags |=4}
if(this.kw_arg){flags |=8}
if(this.type=='generator'){flags |=32}
var positional_str=[],positional_obj=[],pos=0
for(var i=0,_len=this.positional_list.length;i<_len;i++){positional_str[pos]='"'+this.positional_list[i]+'"'
positional_obj[pos++]=this.positional_list[i]+':null'}
positional_str=positional_str.join(',')
positional_obj='{'+positional_obj.join(',')+'}'
var dobj=[],pos=0
for(var i=0;i<this.default_list.length;i++){dobj[pos++]=this.default_list[i]+':null'}
dobj='{'+dobj.join(',')+'}'
var nodes=[],js
var global_scope=scope
if(global_scope.parent_block===undefined){alert('undef '+global_scope);console.log(global_scope)}
while(global_scope.parent_block.id !=='__builtins__'){global_scope=global_scope.parent_block}
var global_ns='$locals_'+global_scope.id.replace(/\./g,'_')
var local_ns='$locals_'+this.id
js='var '+local_ns+'={}, '
js +='$local_name="'+this.id+'",$locals='+local_ns+';'
var new_node=new $Node()
new_node.locals_def=true
new $NodeJSCtx(new_node,js)
nodes.push(new_node)
var enter_frame_node=new $Node(),enter_frame_node_rank=nodes.length
var js=';$B.enter_frame([$local_name, $locals,'+
'"'+global_scope.id+'", '+global_ns+']);' 
enter_frame_node.enter_frame=true
new $NodeJSCtx(enter_frame_node,js)
nodes.push(enter_frame_node)
this.env=[]
var make_args_nodes=[]
var func_ref='$locals_'+scope.id.replace(/\./g,'_')+'["'+this.name+'"]'
if(this.name=='fghjk'){var js='var $ns = $B.argsfast("'+this.name+'", '}else{var js='var $ns = $B.args("'+this.name+'", '}
js +=this.argcount+', {'+this.slots.join(', ')+'}, '
js +='['+slot_list.join(', ')+'], '
if(this.name=='fghjk'){js +='pos_args, kw_args, '}else{js +='arguments, '}
if(defs1.length){js +='$defaults, '}
else{js +='{}, '}
js +=this.other_args+', '+this.other_kw+');'
var new_node=new $Node()
new $NodeJSCtx(new_node,js)
make_args_nodes.push(new_node)
var new_node=new $Node()
new $NodeJSCtx(new_node,'for(var $var in $ns){$locals[$var]=$ns[$var]};')
make_args_nodes.push(new_node)
var only_positional=false
if(defaults.length==0 && this.other_args===null && this.other_kw===null &&
this.after_star.length==0){
only_positional=true
var pos_nodes=[]
if($B.debug>0 ||this.positional_list.length>0){
var new_node=new $Node()
var js='if(arguments.length>0 && arguments[arguments.length-1].$nat)'
new $NodeJSCtx(new_node,js)
nodes.push(new_node)
new_node.add(make_args_nodes[0])
new_node.add(make_args_nodes[1])
var else_node=new $Node()
new $NodeJSCtx(else_node,'else')
nodes.push(else_node)}
if($B.debug>0){
var pos_len=this.positional_list.length
js='if(arguments.length!='+pos_len+')'
var wrong_nb_node=new $Node()
new $NodeJSCtx(wrong_nb_node,js)
else_node.add(wrong_nb_node)
if(pos_len>0){
js='if(arguments.length<'+pos_len+')'
js +='{var $missing='+pos_len+'-arguments.length;'
js +='throw TypeError("'+this.name+'() missing "+$missing+'
js +='" positional argument"+($missing>1 ? "s" : "")+": "'
js +='+new Array('+positional_str+').slice(arguments.length))}'
new_node=new $Node()
new $NodeJSCtx(new_node,js)
wrong_nb_node.add(new_node)
js='else if'}else{js='if'}
js +='(arguments.length>'+pos_len+')'
js +='{throw TypeError("'+this.name+'() takes '+pos_len
js +=' positional argument'
js +=(pos_len>1 ? "s" : "")
js +=' but more were given")}'
new_node=new $Node()
new $NodeJSCtx(new_node,js)
wrong_nb_node.add(new_node)}
for(var i=0;i<this.positional_list.length;i++){var arg=this.positional_list[i]
var new_node=new $Node()
var js='$locals["'+arg+'"]=('+arg+
'.is_float ? _b_.float('+arg+'.value) : '+arg+')'
js='$locals["'+arg+'"]='+arg
new $NodeJSCtx(new_node,js)
else_node.add(new_node)}}else{nodes.push(make_args_nodes[0])
nodes.push(make_args_nodes[1])}
for(var i=nodes.length-1;i>=0;i--){node.children.splice(0,0,nodes[i])}
var def_func_node=new $Node()
if(only_positional){var params=Object.keys(this.varnames).concat(['$extra']).join(', ')
new $NodeJSCtx(def_func_node,'return function('+params+')')}else{new $NodeJSCtx(def_func_node,'return function(pos_args, kw_args)')}
def_func_node.is_def_func=true
def_func_node.module=this.module
for(var i=0;i<node.children.length;i++){def_func_node.add(node.children[i])}
var last_instr=node.children[node.children.length-1].C.tree[0]
if(last_instr.type!=='return' && this.type!='generator'){def_func_node.add($NodeJS('return None'))}
node.children=[]
var default_node=new $Node()
var js=';_b_.None;'
if(defs1.length>0){js='var $defaults = {'+defs1.join(',')+'};'}
new $NodeJSCtx(default_node,js)
node.insert(0,default_node)
node.add(def_func_node)
var ret_node=new $Node()
new $NodeJSCtx(ret_node,')();')
node.parent.insert(rank+1,ret_node)
var offset=2
if(this.type==='generator' && !this.declared){var sc=scope
var env=[],pos=0
while(sc && sc.id!=='__builtins__'){var sc_id=sc.id.replace(/\./g,'_')
if(sc===scope){env[pos++]='["'+sc_id+'",$locals]'}else{env[pos++]='["'+sc_id+'",$locals_'+sc_id+']'}
sc=sc.parent_block}
var env_string='['+env.join(', ')+']'
js='$B.$BRgenerator('+env_string+',"'+this.name+'","'+this.id+'")'
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
offset++}
var prefix=this.tree[0].to_js()
if(this.decorated){prefix=this.alias}
var indent=node.indent
js=prefix+'.$infos = {'
var name_decl=new $Node()
new $NodeJSCtx(name_decl,js)
node.parent.insert(rank+offset,name_decl)
offset++
js='    __name__:"'
if(this.scope.ntype=='class'){js+=this.scope.C.tree[0].name+'.'}
js +=this.name+'",'
var name_decl=new $Node()
new $NodeJSCtx(name_decl,js)
node.parent.insert(rank+offset,name_decl)
offset++
var module=$get_module(this)
new_node=new $Node()
new $NodeJSCtx(new_node,'    __defaults__ : ['+this.__defaults__.join(', ')+'],')
node.parent.insert(rank+offset,new_node)
offset++
var module=$get_module(this)
new_node=new $Node()
new $NodeJSCtx(new_node,'    __module__ : "'+module.module+'",')
node.parent.insert(rank+offset,new_node)
offset++
js='    __doc__: '+(this.doc_string ||'None')+','
new_node=new $Node()
new $NodeJSCtx(new_node,js)
node.parent.insert(rank+offset,new_node)
offset++
js='    __annotations__: {'+annotations.join(',')+'},'
new_node=new $Node()
new $NodeJSCtx(new_node,js)
node.parent.insert(rank+offset,new_node)
offset++
for(var attr in $B.bound[this.id]){this.varnames[attr]=true}
var co_varnames=[]
for(var attr in this.varnames){co_varnames.push('"'+attr+'"')}
var h='\n'+' '.repeat(indent+8)
js='    __code__:{'+h+'__class__:$B.$CodeDict'
h=','+h
js +=h+'co_argcount:'+this.argcount
js +=h+'co_filename:$locals_'+scope.module.replace(/\./g,'_')+'["__file__"]'
js +=h+'co_firstlineno:'+node.line_num
js +=h+'co_flags:'+flags
js +=h+'co_kwonlyargcount:'+this.kwonlyargcount
js +=h+'co_name: "'+this.name+'"'
js +=h+'co_nlocals: '+co_varnames.length
js +=h+'co_varnames: ['+co_varnames.join(', ')+']'
js +='}\n};'
js +='None;'
new_node=new $Node()
new $NodeJSCtx(new_node,js)
node.parent.insert(rank+offset,new_node)
if(this.type=='def'){var parent=enter_frame_node.parent
for(var pos=0;pos<parent.children.length && 
parent.children[pos]!==enter_frame_node;pos++){}
var try_node=new $Node(),children=parent.children.slice(pos+1,parent.children.length),ctx=new $NodeCtx(try_node)
parent.insert(pos+1,try_node)
new $TryCtx(ctx)
for(var i=0;i<children.length;i++){try_node.add(children[i])}
parent.children.splice(pos+2,parent.children.length)
var finally_node=new $Node(),ctx=new $NodeCtx(finally_node)
new $SingleKwCtx(ctx,'finally')
finally_node.add($NodeJS('$B.leave_frame($local_name)'))
parent.add(finally_node)}
this.transformed=true
return offset}
this.to_js=function(func_name){this.js_processed=true
func_name=func_name ||this.tree[0].to_js()
if(this.decorated){func_name='var '+this.alias}
return func_name+'=(function()'}}
function $DelCtx(C){
this.type='del'
this.parent=C
C.tree[C.tree.length]=this
this.tree=[]
this.toString=function(){return 'del '+this.tree}
this.to_js=function(){this.js_processed=true
if(this.tree[0].type=='list_or_tuple'){
var res=[],pos=0
for(var i=0;i<this.tree[0].tree.length;i++){var subdel=new $DelCtx(C)
subdel.tree=[this.tree[0].tree[i]]
res[pos++]=subdel.to_js()
C.tree.pop()}
this.tree=[]
return res.join(';')}else{var expr=this.tree[0].tree[0]
var scope=$get_scope(this)
switch(expr.type){case 'id':
return 'delete '+expr.to_js()+';'
case 'list_or_tuple':
var res=[],pos=0
for(var i=0;i<expr.tree.length;i++){res[pos++]='delete '+expr.tree[i].to_js()}
return res.join(';')
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
$_SyntaxError(this,["can't delete "+expr.type])}}}}
function $DictOrSetCtx(C){
this.type='dict_or_set'
this.real='dict_or_set'
this.expect='id'
this.closed=false
this.start=$pos
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){switch(this.real){case 'dict':
return '(dict) {'+this.items+'}'
case 'set':
return '(set) {'+this.tree+'}'}
return '(dict_or_set) {'+this.tree+'}'}
this.to_js=function(){this.js_processed=true
switch(this.real){case 'dict':
var res=[],pos=0
for(var i=0;i<this.items.length;i+=2){res[pos++]='['+this.items[i].to_js()+','+this.items[i+1].to_js()+']'}
return 'dict(['+res.join(',')+'])'+$to_js(this.tree)
case 'set_comp':
return 'set('+$to_js(this.items)+')'+$to_js(this.tree)
case 'dict_comp':
return 'dict('+$to_js(this.items)+')'+$to_js(this.tree)}
return 'set(['+$to_js(this.items)+'])'+$to_js(this.tree)}}
function $DoubleStarArgCtx(C){
this.type='double_star_arg'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){return '**'+this.tree}
this.to_js=function(){this.js_processed=true
return '{$nat:"pdict",arg:'+$to_js(this.tree)+'}'}}
function $EllipsisCtx(C){
this.type='ellipsis'
this.parent=C
this.nbdots=1
C.tree[C.tree.length]=this
this.toString=function(){return 'ellipsis'}
this.to_js=function(){this.js_processed=true
return '$B.builtins["Ellipsis"]'}}
function $ExceptCtx(C){
this.type='except'
this.parent=C
C.tree[C.tree.length]=this
this.tree=[]
this.expect='id'
this.scope=$get_scope(this)
this.toString=function(){return '(except) '}
this.set_alias=function(alias){this.tree[0].alias=alias
$B.bound[this.scope.id][alias]=true
try{$B.type[this.scope.id][alias]='exception'}catch(err){console.log(err,this.scope.id)}}
this.to_js=function(){
this.js_processed=true
switch(this.tree.length){case 0:
return 'else'
case 1:
if(this.tree[0].name==='Exception')return 'else if(1)'}
var res=[],pos=0
for(var i=0;i<this.tree.length;i++){res[pos++]=this.tree[i].to_js()}
return 'else if($B.is_exc('+this.error_name+',['+res.join(',')+']))'}}
function $ExprCtx(C,name,with_commas){
this.type='expr'
this.name=name
this.with_commas=with_commas
this.expect=',' 
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){return '(expr '+with_commas+') '+this.tree}
this.to_js=function(arg){this.js_processed=true
if(this.type==='list')return '['+$to_js(this.tree)+']'
if(this.tree.length===1)return this.tree[0].to_js(arg)
return 'tuple('+$to_js(this.tree)+')'}}
function $ExprNot(C){
this.type='expr_not'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){return '(expr_not)'}}
function $FloatCtx(C,value){
this.type='float'
this.value=value
this.toString=function(){return 'float '+this.value}
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.to_js=function(){this.js_processed=true
return 'float('+this.value+')'}}
function $ForExpr(C){
this.type='for'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.loop_num=$loop_num
this.module=$get_scope(this).module
$loop_num++
this.toString=function(){return '(for) '+this.tree}
this.transform=function(node,rank){var scope=$get_scope(this),mod_name=scope.module,target=this.tree[0],target_is_1_tuple=target.tree.length==1 && target.expect=='id',iterable=this.tree[1],num=this.loop_num,local_ns='$locals_'+scope.id.replace(/\./g,'_'),h='\n'+' '.repeat(node.indent+4)
if(__BRYTHON__.loop_timeout){
var test_timeout='var $time'+num+' = new Date()'+h+
'function $test_timeout'+num+'(){if((new Date())-$time'+
num+'>'+__BRYTHON__.loop_timeout*1000+
'){throw _b_.RuntimeError("script timeout")}'+h+'return true}'}
var $range=false
if(target.tree.length==1 &&
target.expct !='id' &&
iterable.type=='expr' &&
iterable.tree[0].type=='expr' &&
iterable.tree[0].tree[0].type=='call'){var call=iterable.tree[0].tree[0]
if(call.func.type=='id'){var func_name=call.func.value
if(func_name=='range' && call.tree.length<3){$range=call}}}
var new_nodes=[],pos=0
var children=node.children
var offset=1
if($range && scope.ntype!='generator'){if(this.has_break){
new_node=new $Node()
new $NodeJSCtx(new_node,local_ns+'["$no_break'+num+'"]=true')
new_nodes[pos++]=new_node}
var range_is_builtin=false
if(!scope.blurred){var _scope=$get_scope(this),found=[],fpos=0
while(1){if($B.bound[_scope.id]['range']){found[fpos++]=_scope.id}
if(_scope.parent_block){_scope=_scope.parent_block}
else{break}}
range_is_builtin=found.length==1 && found[0]=="__builtins__"
if(found==['__builtins__']){range_is_builtin=true}}
var test_range_node=new $Node()
if(range_is_builtin){new $NodeJSCtx(test_range_node,'if(1)')}else{new $NodeJSCtx(test_range_node,'if('+call.func.to_js()+'===$B.builtins.range)')}
new_nodes[pos++]=test_range_node
var idt=target.to_js()
if($range.tree.length==1){var start=0,stop=$range.tree[0].to_js()}else{var start=$range.tree[0].to_js(),stop=$range.tree[1].to_js()}
var js=idt+'='+start+';'+h+'var $stop_'+num +'=$B.int_or_bool('+
stop+'),'+h+
'    $next'+num+'= '+idt+','+h+
'    $safe'+num+'= typeof $next'+num+'=="number" && typeof '+
'$stop_'+num+'=="number";'+h
if(__BRYTHON__.loop_timeout){js +=test_timeout+h+'while($test_timeout'+num+'())'}else{js +='while(true)'}
var for_node=new $Node()
new $NodeJSCtx(for_node,js)
for_node.add($NodeJS('if($safe'+num+' && $next'+num+'>= $stop_'+
num+'){break}'))
for_node.add($NodeJS('else if(!$safe'+num+
' && $B.ge($next'+num+', $stop_'+num+
')){break}'))
for_node.add($NodeJS(idt+' = $next'+num))
for_node.add($NodeJS('if($safe'+num+'){$next'+num+'+=1'+'}'))
for_node.add($NodeJS('else{$next'+num+'=$B.add($next'+num+',1)}'))
for(var i=0;i<children.length;i++){for_node.add(children[i].clone())}
for_node.add($NodeJS('$locals.line_info="'+node.line_num+','+
scope.id+'"'))
var in_loop=false
if(scope.ntype=='module'){var pnode=node.parent
while(pnode){if(pnode.for_wrapper){in_loop=true;break}
pnode=pnode.parent}}
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
func_node.add(new_node)}
var end_func_node=new $Node()
new $NodeJSCtx(end_func_node,'var $res'+num+'=$f'+num+'();')
test_range_node.add(end_func_node)
if(this.has_break){var no_break=new $Node()
new $NodeJSCtx(no_break,'$no_break'+num+'=$res'+num)
test_range_node.add(no_break)}}else{
test_range_node.add(for_node)}
if(range_is_builtin){node.parent.children.splice(rank,1)
var k=0
if(this.has_break){node.parent.insert(rank,new_nodes[0])
k++}
for(var i=new_nodes[k].children.length-1;i>=0;i--){node.parent.insert(rank+k,new_nodes[k].children[i])}
node.parent.children[rank].line_num=node.line_num
node.children=[]
return 0}
var else_node=new $Node()
new $NodeJSCtx(else_node,'else')
new_nodes[pos++]=else_node
for(var i=new_nodes.length-1;i>=0;i--){node.parent.insert(rank+1,new_nodes[i])}
this.test_range=true
new_nodes=[],pos=0}
var new_node=new $Node()
new_node.line_num=$get_node(this).line_num
var js='$locals["$next'+num+'"]'
js +='=getattr(iter('+iterable.to_js()+'),"__next__");\n'
new $NodeJSCtx(new_node,js)
new_nodes[pos++]=new_node
if(this.has_break){
new_node=new $Node()
new $NodeJSCtx(new_node,local_ns+'["$no_break'+num+'"]=true;')
new_nodes[pos++]=new_node}
var while_node=new $Node()
if(__BRYTHON__.loop_timeout){js=test_timeout+h
if(this.has_break){js +='while($test_timeout'+num+'() && '+
local_ns+'["$no_break'+num+'"])'}
else{js +='while($test_timeout'+num+'())'}}else{if(this.has_break){js='while('+local_ns+'["$no_break'+num+'"])'}
else{js='while(1)'}}
new $NodeJSCtx(while_node,js)
while_node.C.loop_num=num 
while_node.C.type='for' 
while_node.line_num=node.line_num
if(scope.ntype=='generator'){
while_node.loop_start=num}
new_nodes[pos++]=while_node
node.parent.children.splice(rank,1)
if(this.test_range){for(var i=new_nodes.length-1;i>=0;i--){else_node.insert(0,new_nodes[i])}}else{for(var i=new_nodes.length-1;i>=0;i--){node.parent.insert(rank,new_nodes[i])
offset +=new_nodes.length}}
var try_node=new $Node()
new $NodeJSCtx(try_node,'try')
while_node.add(try_node)
var iter_node=new $Node()
iter_node.parent=$get_node(this).parent
iter_node.id=this.module
var C=new $NodeCtx(iter_node)
var target_expr=new $ExprCtx(C,'left',true)
if(target_is_1_tuple){
var t=new $ListOrTupleCtx(target_expr)
t.real='tuple'
t.tree=target.tree}else{target_expr.tree=target.tree}
var assign=new $AssignCtx(target_expr)
assign.tree[1]=new $JSCode('$locals["$next'+num+'"]()')
try_node.add(iter_node)
var catch_node=new $Node()
var js='catch($err){if($B.is_exc($err,[StopIteration]))'
js +='{delete $locals["$next'+num+'"];$B.clear_exc();break;}'
js +='else{throw($err)}}' 
new $NodeJSCtx(catch_node,js)
while_node.add(catch_node)
for(var i=0;i<children.length;i++){while_node.add(children[i].clone())}
node.children=[]
return 0}
this.to_js=function(){this.js_processed=true
var iterable=this.tree.pop()
return 'for '+$to_js(this.tree)+' in '+iterable.to_js()}}
function $FromCtx(C){
this.type='from'
this.parent=C
this.module=''
this.names=[]
this.aliases={}
C.tree[C.tree.length]=this
this.expect='module'
this.scope=$get_scope(this)
this.add_name=function(name){this.names[this.names.length]=name
if(name=='*'){this.scope.blurred=true}}
this.transform=function(node,rank){if(!this.blocking){
var mod_name=this.module.replace(/\$/g,'')
if(this.names[0]=='*'){node.add($NodeJS('for(var $attr in $B.imported["'+mod_name+
'"]){if($attr.charAt(0)!=="_"){$locals[$attr]=$B.imported["'+mod_name+'"][$attr]}};'))}else{for(var i=0;i<this.names.length;i++){var name=this.names[i]
node.add($NodeJS('$locals["'+(this.aliases[name]||name)+
'"]=$B.imported["'+mod_name+'"]["'+name+'"]'))}}
for(var i=rank+1;i<node.parent.children.length;i++){node.add(node.parent.children[i])}
node.parent.children.splice(rank+1,node.parent.children.length)
node.parent.add($NodeJS(')'))}}
this.bind_names=function(){
var scope=$get_scope(this)
for(var i=0;i<this.names.length;i++){var name=this.aliases[this.names[i]]||this.names[i]
$B.bound[scope.id][name]=true
$B.type[scope.id][name]=false }}
this.toString=function(){return '(from) '+this.module+' (import) '+this.names+'(as)'+this.aliases}
this.to_js=function(){this.js_processed=true
var scope=$get_scope(this),mod=$get_module(this).module,res=[],pos=0,indent=$get_node(this).indent,head=' '.repeat(indent);
var _mod=this.module.replace(/\$/g,''),package,packages=[]
while(_mod.length>0){if(_mod.charAt(0)=='.'){if(package===undefined){if($B.imported[mod]!==undefined){package=$B.imported[mod].__package__}}else{package=$B.imported[package]}
if(package===undefined){return 'throw SystemError("Parent module \'\' not loaded,'+
' cannot perform relative import")'}else if(package=='None'){console.log('package is None !')}else{packages.push(package)}
_mod=_mod.substr(1)}else{break}}
if(_mod){packages.push(_mod)}
this.module=packages.join('.')
var mod_name=this.module.replace(/\$/g,''),localns='$locals_'+scope.id.replace(/\./g,'_');
if(this.blocking){res[pos++]='$B.$import("';
res[pos++]=mod_name+'",["';
res[pos++]=this.names.join('","')+'"], {';
var sep='';
for(var attr in this.aliases){res[pos++]=sep + '"'+attr+'": "'+this.aliases[attr]+'"';
sep=',';}
res[pos++]='}, {}, true);';
if(this.names[0]=='*'){res[pos++]='\n'+head+'for(var $attr in $B.imported["'+mod_name+
'"]){if($attr.charAt(0)!=="_"){'+
'$locals[$attr]=$B.imported["'+mod_name+'"][$attr]}};'}else{for(var i=0;i<this.names.length;i++){var name=this.names[i]
res[pos++]='\n'+head+'$locals["'+(this.aliases[name]||name)+
'"]=$B.imported["'+mod_name+'"]["'+name+'"];'}}
res[pos++]='\n'+head+'None;';}else{res[pos++]='$B.$import_non_blocking("'+mod_name+'", function()'}
if(this.names[0]=='*'){
scope.blurred=true}
return res.join('');}}
function $FuncArgs(C){
this.type='func_args'
this.parent=C
this.tree=[]
this.names=[]
C.tree[C.tree.length]=this
this.toString=function(){return 'func args '+this.tree}
this.expect='id'
this.has_default=false
this.has_star_arg=false
this.has_kw_arg=false
this.to_js=function(){this.js_processed=true
return $to_js(this.tree)}}
function $FuncArgIdCtx(C,name){
this.type='func_arg_id'
this.name=name
this.parent=C
if(C.has_star_arg){C.parent.after_star.push('"'+name+'"')}else{C.parent.positional_list.push(name)}
var node=$get_node(this)
if($B.bound[node.id][name]){$_SyntaxError(C,["duplicate argument '"+name+"' in function definition"])}
$B.bound[node.id][name]='arg'
$B.type[node.id][name]=false
this.tree=[]
C.tree[C.tree.length]=this
var ctx=C
while(ctx.parent!==undefined){if(ctx.type==='def'){ctx.locals.push(name)
break}
ctx=ctx.parent}
this.expect='='
this.toString=function(){return 'func arg id '+this.name +'='+this.tree}
this.to_js=function(){this.js_processed=true
return this.name+$to_js(this.tree)}}
function $FuncStarArgCtx(C,op){
this.type='func_star_arg'
this.op=op
this.parent=C
this.node=$get_node(this)
C.has_star_arg=op=='*'
C.has_kw_arg=op=='**'
C.tree[C.tree.length]=this
this.toString=function(){return '(func star arg '+this.op+') '+this.name}
this.set_name=function(name){this.name=name
if(name=='$dummy'){return}
if($B.bound[this.node.id][name]){$_SyntaxError(C,["duplicate argument '"+name+"' in function definition"])}
$B.bound[this.node.id][name]='arg'
$B.type[this.node.id][name]=false
var ctx=C
while(ctx.parent!==undefined){if(ctx.type==='def'){ctx.locals.push(name)
break}
ctx=ctx.parent}
if(op=='*'){ctx.other_args='"'+name+'"'}
else{ctx.other_kw='"'+name+'"'}}}
function $GlobalCtx(C){
this.type='global'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.expect='id'
this.toString=function(){return 'global '+this.tree}
this.scope=$get_scope(this)
$B._globals[this.scope.id]=$B._globals[this.scope.id]||{}
this.add=function(name){$B._globals[this.scope.id][name]=true}
this.to_js=function(){this.js_processed=true
return ''}}
function $IdCtx(C,value){
this.type='id'
this.toString=function(){return '(id) '+this.value+':'+(this.tree||'')}
this.value=value
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
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
ctx=ctx.parent}
var scope=this.scope=$get_scope(this)
if(C.type=='target_list' ||C.type=='packed' ||
(C.type=='expr' && C.parent.type=='target_list')){
$B.bound[scope.id][value]=true
$B.type[scope.id][value]=false 
this.bound=true}
if(scope.ntype=='def' ||scope.ntype=='generator'){
var _ctx=this.parent
while(_ctx){if(_ctx.type=='list_or_tuple' && _ctx.is_comp())return
_ctx=_ctx.parent}
if(C.type=='expr' && C.parent.type=='comp_if'){
return}else if(C.type=='global'){if(scope.globals===undefined){scope.globals=[value]}else if(scope.globals.indexOf(value)==-1){scope.globals.push(value)}}}
this.to_js=function(arg){this.js_processed=true
var val=this.value
var is_local=$B.bound[this.scope.id][val]!==undefined
var bound_before=$get_node(this).bound_before
if(this.scope.nonlocals && this.scope.nonlocals[val]!==undefined){this.nonlocal=true}
this.unbound=this.unbound ||(is_local && !this.bound && 
bound_before && bound_before.indexOf(val)==-1)
if(this.unbound && !this.nonlocal){if(this.scope.ntype=='def' ||this.scope.ntype=='generator'){return '$B.$local_search("'+val+'")'}else{return '$B.$search("'+val+'")'}}
if(val=='eval')val='$eval'
else if(val=='__BRYTHON__' ||val=='$B'){return val}
var innermost=$get_scope(this)
var scope=innermost,found=[],module=scope.module
var gs=innermost
while(gs.parent_block && gs.parent_block.id!=='__builtins__'){gs=gs.parent_block}
var global_ns='$locals_'+gs.id.replace(/\./g,'_')
while(1){if($B.bound[scope.id]===undefined){console.log('name '+val+' undef '+scope.id)}
if($B.type[scope.id]===undefined){console.log('name '+val+' type undef '+scope.id)}
if($B._globals[scope.id]!==undefined &&
$B._globals[scope.id][val]!==undefined){
if($B.bound[gs.id][val]!==undefined ||this.bound){return global_ns+'["'+val+'"]'}else{return '$B.$global_search("'+val+'")'}
found=[gs]
break}
if(scope===innermost){
var bound_before=$get_node(this).bound_before
if(bound_before && !this.bound){if(bound_before.indexOf(val)>-1){found.push(scope)}
else if(scope.C &&
scope.C.tree[0].type=='def' &&
scope.C.tree[0].env.indexOf(val)>-1){found.push(scope)}}else{if($B.bound[scope.id][val]){found.push(scope)}}}else{if($B.bound[scope.id][val]){found.push(scope)}}
if(scope.parent_block){scope=scope.parent_block}
else{break}}
this.found=found
if(this.nonlocal && found[0]===innermost){found.shift()}
if(val=='fghj'){console.log('found for',val,found)}
if(found.length>0){
if(!this.bound && found[0].C && found[0]===innermost
&& val.charAt(0)!='$'){var locs=$get_node(this).locals ||{},nonlocs=innermost.nonlocals
if(locs[val]===undefined && 
(nonlocs===undefined ||nonlocs[val]===undefined)){return '$B.$local_search("'+val+'")'}}
if(found.length>1 && found[0].C){if(found[0].C.tree[0].type=='class' && !this.bound){var ns0='$locals_'+found[0].id.replace(/\./g,'_'),ns1='$locals_'+found[1].id.replace(/\./g,'_'),res
if(bound_before){if(bound_before.indexOf(val)>-1){this.found=$B.bound[found[0].id][val]
res=ns0}else{this.found=$B.bound[found[1].id][val]
res=ns1}
return res+'["'+val+'"]'}else{this.found=false
var res=ns0 + '["'+val+'"]!==undefined ? '
res +=ns0 + '["'+val+'"] : '
return res + ns1 + '["'+val+'"]'}}}
var scope=found[0]
this.found=$B.bound[scope.id][val]
var scope_ns='$locals_'+scope.id.replace(/\./g,'_')
if(scope.C===undefined){
if(scope.id=='__builtins__'){if(gs.blurred){
val='('+global_ns+'["'+val+'"] || '+val+')'}else{
this.is_builtin=true}}else if(scope.id==scope.module){if(val=='fghj'){console.log('module level',this.augm_assign)}
if(this.bound ||this.augm_assign){if(val=='fghj'){console.log('simple',val)}
val=scope_ns+'["'+val+'"]'}else{if(scope===innermost && this.env[val]===undefined){var locs=$get_node(this).locals ||{}
if(locs[val]===undefined){
if(found.length>1 && found[1].id=='__builtins__'){this.is_builtin=true
return val+$to_js(this.tree,'')}}
return '$B.$search("'+val+'")'}else{
val='$B.$check_def("'+val+'",'+scope_ns+'["'+val+'"])'}}}else{val=scope_ns+'["'+val+'"]'}}else if(scope===innermost){if($B._globals[scope.id]&& $B._globals[scope.id][val]){val=global_ns+'["'+val+'"]'}else if(!this.bound && !this.augm_assign){val='$B.$check_def_local("'+val+'",$locals["'+val+'"])'}else{val='$locals["'+val+'"]'}}else if(!this.bound && !this.augm_assign){
val='$B.$check_def_free("'+val+'",'+scope_ns+'["'+val+'"])'}else{val=scope_ns+'["'+val+'"]'}
return val+$to_js(this.tree,'')}else{
this.unknown_binding=true
return '$B.$search("'+val+'")'}}}
function $ImaginaryCtx(C,value){
this.type='imaginary'
this.value=value
this.toString=function(){return 'imaginary '+this.value}
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.to_js=function(){this.js_processed=true
return 'complex(0,'+this.value+')'}}
function $ImportCtx(C){
this.type='import'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.expect='id'
this.toString=function(){return 'import '+this.tree}
this.bind_names=function(){
var scope=$get_scope(this)
for(var i=0;i<this.tree.length;i++){if(this.tree[i].name==this.tree[i].alias){var name=this.tree[i].name,parts=name.split('.'),bound=name
if(parts.length>1){bound=parts[0]}}else{bound=this.tree[i].alias}
$B.bound[scope.id][bound]=true
$B.type[scope.id][bound]='module'}}
this.to_js=function(){this.js_processed=true
var scope=$get_scope(this)
var mod=scope.module
var res=[],pos=0
for(var i=0;i<this.tree.length;i++){var mod_name=this.tree[i].name,aliases=(this.tree[i].name==this.tree[i].alias)?
'{}' :('{"' + mod_name + '" : "' +
this.tree[i].alias + '"}'),localns='$locals_'+scope.id.replace(/\./g,'_');
res[pos++]='$B.$import("'+mod_name+'", [],'+aliases+',' +
localns + ', true);'}
return res.join('')+ 'None;'}}
function $IMPRTCtx(C){
this.type='import'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.expect='id'
this.toString=function(){return 'import '+this.tree}
this.bind_names=function(){
var scope=$get_scope(this)
for(var i=0;i<this.tree.length;i++){if(this.tree[i].name==this.tree[i].alias){var name=this.tree[i].name,parts=name.split('.'),bound=name
if(parts.length>1){bound=parts[0]}}else{bound=this.tree[i].alias}
$B.bound[scope.id][bound]=true
$B.type[scope.id][bound]='module'}}
this.transform=function(node,rank){
for(var i=1;i<this.tree.length;i++){var new_node=new $Node()
var ctx=new $IMPRTCtx(new $NodeCtx(new_node))
ctx.tree=[this.tree[i]]
node.parent.insert(rank+1,new_node)}
this.tree.splice(1,this.tree.length)
var name=this.tree[0].name,js='$locals["'+this.tree[0].alias+'"]= $B.imported["'+name+'"]'
node.add($NodeJS(js))
for(var i=rank+1;i<node.parent.children.length;i++){node.add(node.parent.children[i])}
node.parent.children.splice(rank+1,node.parent.children.length)
node.parent.add($NodeJS(')'))}
this.to_js=function(){this.js_processed=true
var scope=$get_scope(this)
var mod=scope.module
var res=[],pos=0
for(var i=0;i<this.tree.length;i++){var mod_name=this.tree[i].name,aliases=(this.tree[i].name==this.tree[i].alias)?
'{}' :('{"' + mod_name + '" : "' +
this.tree[i].alias + '"}'),localns='$locals_'+scope.id.replace(/\./g,'_');
res[pos++]='$B.$import_non_blocking("'+mod_name+'", function()'}
return res.join('')}}
function $ImportedModuleCtx(C,name){this.type='imported module'
this.toString=function(){return ' (imported module) '+this.name}
this.parent=C
this.name=name
this.alias=name
C.tree[C.tree.length]=this
this.to_js=function(){this.js_processed=true
return '"'+this.name+'"'}}
function $IntCtx(C,value){
this.type='int'
this.value=value
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){return 'int '+this.value}
this.to_js=function(){this.js_processed=true
var v=parseInt(value[1],value[0])
if(v>$B.min_int && v<$B.max_int){return v}
else{return '$B.LongInt("'+value[1]+'", '+value[0]+')'}}}
function $JSCode(js){this.js=js
this.toString=function(){return this.js}
this.to_js=function(){this.js_processed=true
return this.js}}
function $KwArgCtx(C){
this.type='kwarg'
this.parent=C.parent
this.tree=[C.tree[0]]
C.parent.tree.pop()
C.parent.tree.push(this)
var value=this.tree[0].value
var ctx=C.parent.parent 
if(ctx.kwargs===undefined){ctx.kwargs=[value]}
else if(ctx.kwargs.indexOf(value)===-1){ctx.kwargs.push(value)}
else{$_SyntaxError(C,['keyword argument repeated'])}
var scope=$get_scope(this)
this.toString=function(){return 'kwarg '+this.tree[0]+'='+this.tree[1]}
this.to_js=function(){this.js_processed=true
var key=this.tree[0].value
if(key.substr(0,2)=='$$'){key=key.substr(2)}
var res='{$nat:"kw",name:"'+key+'",'
return res + 'value:'+$to_js(this.tree.slice(1,this.tree.length))+'}'}}
function $LambdaCtx(C){
this.type='lambda'
this.parent=C
C.tree[C.tree.length]=this
this.tree=[]
this.args_start=$pos+6
this.vars=[]
this.locals=[]
this.toString=function(){return '(lambda) '+this.args_start+' '+this.body_start}
this.to_js=function(){this.js_processed=true
var module=$get_module(this)
var src=$B.$py_src[module.id]
var qesc=new RegExp('"',"g"),
args=src.substring(this.args_start,this.body_start).replace(qesc,'\\"'),body=src.substring(this.body_start+1,this.body_end).replace(qesc,'\\"')
body=body.replace(/\n/g,' ')
var scope=$get_scope(this),sc=scope,env=[],pos=0
while(sc && sc.id!=='__builtins__'){env[pos++]='["'+sc.id+'",$locals_'+sc.id.replace(/\./g,'_')+']'
sc=sc.parent_block}
var env_string='['+env.join(', ')+']'
return '$B.$lambda('+env_string+',"'+args+'","'+body+'")'}}
function $ListOrTupleCtx(C,real){
this.type='list_or_tuple'
this.start=$pos
this.real=real
this.expect='id'
this.closed=false
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){switch(this.real){case 'list':
return '(list) ['+this.tree+']'
case 'list_comp':
case 'gen_expr':
return '('+this.real+') ['+this.intervals+'-'+this.tree+']'
default: 
return '(tuple) ('+this.tree+')'}}
this.is_comp=function(){switch(this.real){case 'list_comp':
case 'gen_expr':
case 'dict_or_set_comp':
return true}
return false}
this.get_src=function(){
var scope=$get_scope(this)
var ident=scope.id
while($B.$py_src[ident]===undefined && $B.modules[ident].parent_block){ident=$B.modules[ident].parent_block.id}
if($B.$py_src[ident]===undefined){
return $B.$py_src[scope.module]}
return $B.$py_src[ident]}
this.ids=function(){
var _ids={}
for(var i=0;i<this.tree.length;i++){var item=this.tree[i]
if(item.type=='id'){_ids[item.value]=true}
else if(item.type=='expr' && item.tree[0].type=="id"){_ids[item.tree[0].value]=true}else if(item.type=='list_or_tuple' ||
(item.type=="expr" && item.tree[0].type=='list_or_tuple')){if(item.type=="expr"){item=item.tree[0]}
for(var attr in item.ids()){_ids[attr]=true}}}
return _ids}
this.to_js=function(){this.js_processed=true
var scope=$get_scope(this)
var sc=scope
var env=[],pos=0
while(sc && sc.id!=='__builtins__'){if(sc===scope){env[pos++]='["'+sc.id+'",$locals]'}else{env[pos++]='["'+sc.id+'",$locals_'+sc.id.replace(/\./g,'_')+']'}
sc=sc.parent_block}
var env_string='['+env.join(', ')+']'
var module=$get_module(this),module_name=module.id.replace(/\./g,'_')
switch(this.real){case 'list':
return '$B.$list(['+$to_js(this.tree)+'])'
case 'list_comp':
case 'gen_expr':
case 'dict_or_set_comp':
var src=this.get_src()
var res1=[],items=[]
var qesc=new RegExp('"',"g")
for(var i=1;i<this.intervals.length;i++){var txt=src.substring(this.intervals[i-1],this.intervals[i])
var lines=txt.split('\n')
var res2=[],pos=0
for(var j=0;j<lines.length;j++){var txt=lines[j]
if(txt.replace(/ /g,'').length==0){continue}
txt=txt.replace(/\n/g,' ')
txt=txt.replace(/\\/g,'\\\\')
txt=txt.replace(qesc,'\\"')
res2[pos++]='"'+txt+'"'}
res1.push('['+res2.join(',')+']')}
switch(this.real){case 'list_comp':
return '$B.$list_comp('+env_string+','+res1+')'
case 'dict_or_set_comp':
if(this.expression.length===1){return '$B.$gen_expr('+env_string+','+res1+')'}
return '$B.$dict_comp('+env_string+','+res1+')'}
return '$B.$gen_expr('+env_string+','+res1+')'
case 'tuple':
if(this.tree.length===1 && this.has_comma===undefined){return this.tree[0].to_js()}
return 'tuple(['+$to_js(this.tree)+'])'}}}
function $NodeCtx(node){
this.node=node
node.C=this
this.tree=[]
this.type='node'
var scope=null
var tree_node=node
while(tree_node.parent && tree_node.parent.type!=='module'){var ntype=tree_node.parent.C.tree[0].type
var _break_flag=false
switch(ntype){case 'def':
case 'class':
case 'generator':
scope=tree_node.parent
_break_flag=true}
if(_break_flag)break
tree_node=tree_node.parent}
if(scope==null){scope=tree_node.parent ||tree_node }
this.node.locals=clone($B.bound[scope.id])
this.toString=function(){return 'node '+this.tree}
this.to_js=function(){this.js_processed=true
if(this.tree.length>1){var new_node=new $Node()
var ctx=new $NodeCtx(new_node)
ctx.tree=[this.tree[1]]
new_node.indent=node.indent+4
this.tree.pop()
node.add(new_node)}
if(node.children.length==0){return $to_js(this.tree)+';'}
return $to_js(this.tree)}}
function $NodeJS(js){var node=new $Node()
new $NodeJSCtx(node,js)
return node}
function $NodeJSCtx(node,js){
this.node=node
node.C=this
this.type='node_js'
this.tree=[js]
this.toString=function(){return 'js '+js}
this.to_js=function(){this.js_processed=true
return js}}
function $NonlocalCtx(C){
this.type='global'
this.parent=C
this.tree=[]
this.names={}
C.tree[C.tree.length]=this
this.expect='id'
this.scope=$get_scope(this)
this.scope.nonlocals=this.scope.nonlocals ||{}
if(this.scope.C===undefined){$_SyntaxError(C,["nonlocal declaration not allowed at module level"])}
this.toString=function(){return 'global '+this.tree}
this.add=function(name){if($B.bound[this.scope.id][name]=='arg'){$_SyntaxError(C,["name '"+name+"' is parameter and nonlocal"])}
this.names[name]=[false,$pos]
this.scope.nonlocals[name]=true}
this.transform=function(node,rank){var pscope=this.scope.parent_block
if(pscope.C===undefined){$_SyntaxError(C,["no binding for nonlocal '"+
$B.last(Object.keys(this.names))+"' found"])}else{while(pscope!==undefined && pscope.C!==undefined){for(var name in this.names){if($B.bound[pscope.id][name]!==undefined){this.names[name]=[true]}}
pscope=pscope.parent_block}
for(var name in this.names){if(!this.names[name][0]){console.log('nonlocal error, C '+C)
$pos=this.names[name][1]
$_SyntaxError(C,["no binding for nonlocal '"+name+"' found"])}}}}
this.to_js=function(){this.js_processed=true
return ''}}
function $NotCtx(C){
this.type='not'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){return 'not ('+this.tree+')'}
this.to_js=function(){this.js_processed=true
return '!bool('+$to_js(this.tree)+')'}}
function $OpCtx(C,op){
this.type='op'
this.op=op
this.parent=C.parent
this.tree=[C]
this.scope=$get_scope(this)
if(C.type=="expr"){if(['int','float','str'].indexOf(C.tree[0].type)>-1){this.left_type=C.tree[0].type}else if(C.tree[0].type=="id"){var binding=$B.bound[this.scope.id][C.tree[0].value]
if(binding){this.left_type=binding.type}}}
C.parent.tree.pop()
C.parent.tree.push(this)
this.toString=function(){return '(op '+this.op+') ['+this.tree+']'}
this.to_js=function(){this.js_processed=true
var comps={'==':'eq','!=':'ne','>=':'ge','<=':'le','<':'lt','>':'gt'}
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
return res}
break;
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
return res}
break;
case 'id':
if(t0.type=='id'){var res='typeof '+t0.to_js()+'!="object" && '
res +='typeof '+t0.to_js()+'==typeof '+t1.to_js()
res +=' ? '+t0.to_js()+this.op+t1.to_js()+' : '
res +='getattr('+this.tree[0].to_js()
res +=',"__'+method+'__")('+this.tree[1].to_js()+')'
return res}
break;}}}
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
case 'unary_pos':
case 'unary_inv':
var op,method
if(this.op=='unary_neg'){op='-';method='__neg__'}
else if(this.op=='unary_pos'){op='-';method='__pos__'}
else{op='~';method='__invert__'}
if(this.tree[1].type=="expr"){var x=this.tree[1].tree[0]
switch(x.type){case 'int':
var v=parseInt(x.value[1],x.value[0])
if(v>$B.min_int && v<$B.max_int){return op+v}
return 'getattr('+x.to_js()+', "'+method+'")()'
case 'float':
return 'float('+op+x.value+')'
case 'imaginary':
return 'complex(0,'+op+x.value+')'}}
return 'getattr('+this.tree[1].to_js()+',"'+method+'")()'
case 'is':
return this.tree[0].to_js()+ '===' + this.tree[1].to_js()
case 'is_not':
return this.tree[0].to_js()+ '!==' + this.tree[1].to_js()
case '*':
case '+':
case '-':
var op=this.op,vars=[],has_float_lit=false,scope=$get_scope(this)
function is_simple(elt){if(elt.type=='expr' && elt.tree[0].type=='int'){return true}
else if(elt.type=='expr' && elt.tree[0].type=='float'){has_float_lit=true
return true}else if(elt.type=='expr' && elt.tree[0].type=='list_or_tuple'
&& elt.tree[0].real=='tuple'
&& elt.tree[0].tree.length==1
&& elt.tree[0].tree[0].type=='expr'){return is_simple(elt.tree[0].tree[0].tree[0])}else if(elt.type=='expr' && elt.tree[0].type=='id'){var _var=elt.tree[0].to_js()
if(vars.indexOf(_var)==-1){vars.push(_var)}
return true}else if(elt.type=='op' &&['*','+','-'].indexOf(elt.op)>-1){for(var i=0;i<elt.tree.length;i++){if(!is_simple(elt.tree[i])){return false}}
return true}
return false}
function get_type(ns,v){var t
if(['int','float','str'].indexOf(v.type)>-1){t=v.type}else if(v.type=='id' && ns[v.value]){t=ns[v.value].type}
return t}
var e0=this.tree[0],e1=this.tree[1]
if(is_simple(this)){var v0=this.tree[0].tree[0]
var v1=this.tree[1].tree[0]
if(vars.length==0 && !has_float_lit){
return this.simple_js()}else if(vars.length==0){
return 'new Number('+this.simple_js()+')'}else{
var ns=$B.bound[scope.id],t0=get_type(ns,v0),t1=get_type(ns,v1)
if((t0=='float' && t1=='float')||
(this.op=='+' && t0=='str' && t1=='str')){this.result_type=t0
return v0.to_js()+this.op+v1.to_js()}else if(['int','float'].indexOf(t0)>-1 &&
['int','float'].indexOf(t1)>-1){if(t0=='int' && t1=='int'){this.result_type='int'}
else{this.result_type='float'}
switch(this.op){case '+':
return '$B.add('+v0.to_js()+','+v1.to_js()+')'
case '-':
return '$B.sub('+v0.to_js()+','+v1.to_js()+')'
case '*':
return '$B.mul('+v0.to_js()+','+v1.to_js()+')'}}
var tests=[],tests1=[],pos=0
for(var i=0;i<vars.length;i++){
tests[pos]='typeof '+vars[i]+'.valueOf() == "number"'
tests1[pos++]='typeof '+vars[i]+' == "number"'}
var res=[tests.join(' && ')+' ? '],pos=1
res[pos++]='('+tests1.join(' && ')+' ? '
res[pos++]=this.simple_js()
res[pos++]=' : new $B.$FloatClass('+this.simple_js()+')'
res[pos++]=')'
if(this.op=='+'){res[pos++]=' : (typeof '+this.tree[0].to_js()+'=="string"'
res[pos++]=' && typeof '+this.tree[1].to_js()
res[pos++]='=="string") ? '+this.tree[0].to_js()
res[pos++]='+'+this.tree[1].to_js()}
res[pos++]=': getattr('+this.tree[0].to_js()+',"__'
res[pos++]=$operators[this.op]+'__")'+'('+this.tree[1].to_js()+')'
return '('+res.join('')+')'}}
var res='getattr('+e0.to_js()+',"__'
return res + $operators[this.op]+'__")'+'('+e1.to_js()+')'
default:
var res='getattr('+this.tree[0].to_js()+',"__'
return res + $operators[this.op]+'__")'+'('+this.tree[1].to_js()+')'}}
this.simple_js=function(){function sjs(elt){if(elt.type=='op'){return elt.simple_js()}
else if(elt.type=='expr' && elt.tree[0].type=='list_or_tuple' 
&& elt.tree[0].real=='tuple'
&& elt.tree[0].tree.length==1 
&& elt.tree[0].tree[0].type=='expr'){return '('+elt.tree[0].tree[0].tree[0].simple_js()+')'}else{return elt.tree[0].to_js()}}
if(op=='+'){return '$B.add('+sjs(this.tree[0])+','+sjs(this.tree[1])+')'}
else if(op=='-'){return '$B.sub('+sjs(this.tree[0])+','+sjs(this.tree[1])+')'}
else if(op=='*'){return '$B.mul('+sjs(this.tree[0])+','+sjs(this.tree[1])+')'}
else if(op=='/'){return '$B.div('+sjs(this.tree[0])+','+sjs(this.tree[1])+')'}
else{return sjs(this.tree[0])+op+sjs(this.tree[1])}}}
function $PackedCtx(C){
this.type='packed'
if(C.parent.type=='list_or_tuple'){for(var i=0;i<C.parent.tree.length;i++){var child=C.parent.tree[i]
if(child.type=='expr' && child.tree.length>0 
&& child.tree[0].type=='packed'){$_SyntaxError(C,["two starred expressions in assignment"])}}}
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){return '(packed) '+this.tree}
this.to_js=function(){this.js_processed=true
return $to_js(this.tree)}}
function $PassCtx(C){
this.type='pass'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){return '(pass)'}
this.to_js=function(){this.js_processed=true
return 'void(0)'}}
function $RaiseCtx(C){
this.type='raise'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){return ' (raise) '+this.tree}
this.to_js=function(){this.js_processed=true
var res=''
if(this.tree.length===0)return '$B.$raise()'
var exc=this.tree[0],exc_js=exc.to_js()
if(exc.type==='id' ||
(exc.type==='expr' && exc.tree[0].type==='id')){res='if(isinstance('+exc_js+',type)){throw '+exc_js+'()}'
return res + 'else{throw '+exc_js+'}'}
while(this.tree.length>1)this.tree.pop()
return res+'throw '+$to_js(this.tree)}}
function $RawJSCtx(C,js){this.type="raw_js"
C.tree[C.tree.length]=this
this.parent=C
this.toString=function(){return '(js) '+js}
this.to_js=function(){this.js_processed=true
return js}}
function $ReturnCtx(C){
this.type='return'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
var node=$get_node(this)
while(node.parent){if(node.parent.C && node.parent.C.tree[0].type=='for'){node.parent.C.tree[0].has_return=true
break}
node=node.parent}
this.toString=function(){return 'return '+this.tree}
this.to_js=function(){this.js_processed=true
if(this.tree.length==1 && this.tree[0].type=='abstract_expr'){
this.tree.pop()
new $IdCtx(new $ExprCtx(this,'rvalue',false),'None')}
var scope=$get_scope(this)
if(scope.ntype=='generator'){return 'return [$B.generator_return(' + $to_js(this.tree)+')]'}
var node=$get_node(this),leave_frame=true,in_try=false
while(node && leave_frame){if(node.is_try){in_try=true
pnode=node.parent,flag=false
for(var i=0;i<pnode.children.length;i++){var child=pnode.children[i]
if(!flag && child===node){flag=true;continue}
if(flag){if(child.C.tree[0].type=="single_kw" &&
child.C.tree[0].token=="finally"){leave_frame=false
break}}}}
node=node.parent}
if(leave_frame && !in_try){
var res='try{var $res = '+$to_js(this.tree)+';'+
'$B.leave_frame($local_name);return $res}catch(err){'+
'$B.leave_frame($local_name);throw err}'}else if(leave_frame){var res='var $res = '+$to_js(this.tree)+';'+
'$B.leave_frame($local_name);return $res'}else{var res="return "+$to_js(this.tree)}
var res="return "+$to_js(this.tree)
return res}}
function $SingleKwCtx(C,token){
this.type='single_kw'
this.token=token
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
if(token=="else"){var node=C.node
var pnode=node.parent
for(var rank=0;rank<pnode.children.length;rank++){if(pnode.children[rank]===node)break}
var pctx=pnode.children[rank-1].C
if(pctx.tree.length>0){var elt=pctx.tree[0]
if(elt.type=='for' ||
(elt.type=='condition' && elt.token=='while')){elt.has_break=true
this.loop_num=elt.loop_num}}}
this.toString=function(){return this.token}
this.to_js=function(){this.js_processed=true
if(this.token=='finally')return this.token
if(this.loop_num!==undefined){var scope=$get_scope(this)
var res='if($locals_'+scope.id.replace(/\./g,'_')
return res +'["$no_break'+this.loop_num+'"])'}
return this.token}}
function $StarArgCtx(C){
this.type='star_arg'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.toString=function(){return '(star arg) '+this.tree}
this.to_js=function(){this.js_processed=true
return '{$nat:"ptuple",arg:'+$to_js(this.tree)+'}'}}
function $StringCtx(C,value){
this.type='str'
this.parent=C
this.tree=[value]
this.raw=false
C.tree[C.tree.length]=this
this.toString=function(){return 'string '+(this.tree||'')}
this.to_js=function(){this.js_processed=true
var res='',type=null
for(var i=0;i<this.tree.length;i++){if(this.tree[i].type=="call"){
var js='(function(){throw TypeError("'+"'str'"+
' object is not callable")}())'
return js}else{var value=this.tree[i],is_bytes=value.charAt(0)=='b'
if(type==null){type=is_bytes
if(is_bytes){res+='bytes('}}else if(type!=is_bytes){return '$B.$TypeError("can\'t concat bytes to str")'}
if(!is_bytes){res +=value.replace(/\n/g,'\\n\\\n')}else{res +=value.substr(1).replace(/\n/g,'\\n\\\n')}
if(i<this.tree.length-1){res+='+'}}}
if(is_bytes){res +=',"ISO-8859-1")'}
return res}}
function $SubCtx(C){
this.type='sub'
this.func='getitem' 
this.value=C.tree[0]
C.tree.pop()
C.tree[C.tree.length]=this
this.parent=C
this.tree=[]
this.toString=function(){return '(sub) (value) '+this.value+' (tree) '+this.tree}
this.to_js=function(){this.js_processed=true
if(this.func=='getitem' && this.value.type=='id'){var type=$get_node(this).locals[this.value.value],val=this.value.to_js()
if(type=='list'||type=='tuple'){if(this.tree.length==1){return '$B.list_key('+val+
', '+this.tree[0].to_js()+')'}else if(this.tree.length==2){return '$B.list_slice('+val+
', '+(this.tree[0].to_js()||"null")+','+
(this.tree[1].to_js()||"null")+')'}else if(this.tree.length==3){return '$B.list_slice_step('+val+
', '+(this.tree[0].to_js()||"null")+','+
(this.tree[1].to_js()||"null")+','+
(this.tree[2].to_js()||"null")+')'}}}
if(this.func=='getitem' && this.tree.length==1){return '$B.$getitem('+this.value.to_js()+',' + this.tree[0].to_js()+')'}
var res='',shortcut=false
if(this.func!=='delitem' && Array.isArray && 
this.tree.length==1 && !this.in_sub){var expr='',x=this
shortcut=true
while(x.value.type=='sub'){expr +='['+x.tree[0].to_js()+']'
x.value.in_sub=true
x=x.value}
var subs=x.value.to_js()+'['+x.tree[0].to_js()+']'
res +='((Array.isArray('+x.value.to_js()+') || '
res +='typeof '+x.value.to_js()+'=="string")'
res +=' && '+subs+'!==undefined ?'
res +=subs+expr+ ' : '}
var val=this.value.to_js()
res +='getattr('+val+',"__'+this.func+'__")('
if(this.tree.length===1){res +=this.tree[0].to_js()+')'}else{var res1=[],pos=0
for(var i=0;i<this.tree.length;i++){if(this.tree[i].type==='abstract_expr'){res1[pos++]='None'}
else{res1[pos++]=this.tree[i].to_js()}}
res +='slice(' + res1.join(',')+ '))'}
return shortcut ? res+')' : res}}
function $TargetListCtx(C){
this.type='target_list'
this.parent=C
this.tree=[]
this.expect='id'
C.tree[C.tree.length]=this
this.toString=function(){return '(target list) '+this.tree}
this.to_js=function(){this.js_processed=true
return $to_js(this.tree)}}
function $TernaryCtx(C){
this.type='ternary'
this.parent=C.parent
C.parent.tree.pop()
C.parent.tree.push(this)
C.parent=this
this.tree=[C]
this.toString=function(){return '(ternary) '+this.tree}
this.to_js=function(){this.js_processed=true
var res='bool('+this.tree[1].to_js()+') ? ' 
res +=this.tree[0].to_js()+' : ' 
return res + this.tree[2].to_js()}}
function $TryCtx(C){
this.type='try'
this.parent=C
C.tree[C.tree.length]=this
this.toString=function(){return '(try) '}
this.transform=function(node,rank){if(node.parent.children.length===rank+1){$_SyntaxError(C,"missing clause after 'try' 1")}else{var next_ctx=node.parent.children[rank+1].C.tree[0]
switch(next_ctx.type){case 'except':
case 'finally':
case 'single_kw':
break
default:
$_SyntaxError(C,"missing clause after 'try' 2")}}
var scope=$get_scope(this)
var $var='$B.$failed'+$loop_num
var js=$var+'=false;'+
'try'
new $NodeJSCtx(node,js)
node.is_try=true 
var catch_node=new $Node()
new $NodeJSCtx(catch_node,'catch($err'+$loop_num+')')
catch_node.is_catch=true
node.parent.insert(rank+1,catch_node)
var new_node=new $Node()
new $NodeJSCtx(new_node,$var+'=true;$B.pmframe=$B.last($B.frames_stack);if(0){}')
catch_node.insert(0,new_node)
var pos=rank+2
var has_default=false 
var has_else=false 
var has_finally=false
while(1){if(pos===node.parent.children.length){break}
var ctx=node.parent.children[pos].C.tree[0]
if(ctx.type==='except'){
if(has_else){$_SyntaxError(C,"'except' or 'finally' after 'else'")}
if(has_finally){$_SyntaxError(C,"'except' after 'finally'")}
ctx.error_name='$err'+$loop_num
if(ctx.tree.length>0 && ctx.tree[0].alias!==null
&& ctx.tree[0].alias!==undefined){
var new_node=new $Node()
var alias=ctx.tree[0].alias
var js='$locals["'+alias+'"]'
js +='=$B.exception($err'+$loop_num+')'
new $NodeJSCtx(new_node,js)
node.parent.children[pos].insert(0,new_node)}
catch_node.insert(catch_node.children.length,node.parent.children[pos])
if(ctx.tree.length===0){if(has_default){$_SyntaxError(C,'more than one except: line')}
has_default=true}
node.parent.children.splice(pos,1)}else if(ctx.type==='single_kw' && ctx.token==='finally'){has_finally=true
pos++}else if(ctx.type==='single_kw' && ctx.token==='else'){if(has_else){$_SyntaxError(C,"more than one 'else'")}
if(has_finally){$_SyntaxError(C,"'else' after 'finally'")}
has_else=true
var else_body=node.parent.children[pos]
node.parent.children.splice(pos,1)}else{break}}
if(!has_default){
var new_node=new $Node(),ctx=new $NodeCtx(new_node)
catch_node.insert(catch_node.children.length,new_node)
new $SingleKwCtx(ctx,'else')
new_node.add($NodeJS('throw $err'+$loop_num))}
if(has_else){var else_node=new $Node()
else_node.module=scope.module
new $NodeJSCtx(else_node,'if(!$B.$failed'+$loop_num+')')
for(var i=0;i<else_body.children.length;i++){else_node.add(else_body.children[i])}
node.parent.insert(pos,else_node)
pos++}
$loop_num++}
this.to_js=function(){this.js_processed=true
return 'try'}}
function $UnaryCtx(C,op){
this.type='unary'
this.op=op
this.parent=C
C.tree[C.tree.length]=this
this.toString=function(){return '(unary) '+this.op}
this.to_js=function(){this.js_processed=true
return this.op}}
function $WithCtx(C){
this.type='with'
this.parent=C
C.tree[C.tree.length]=this
this.tree=[]
this.expect='as'
this.scope=$get_scope(this)
this.toString=function(){return '(with) '+this.tree}
this.set_alias=function(arg){this.tree[this.tree.length-1].alias=arg
$B.bound[this.scope.id][arg]=true
$B.type[this.scope.id][arg]=false
if(this.scope.ntype !=='module'){
this.scope.C.tree[0].locals.push(arg)}}
this.transform=function(node,rank){while(this.tree.length>1){
var suite=node.children,item=this.tree.pop(),new_node=new $Node(),ctx=new $NodeCtx(new_node),with_ctx=new $WithCtx(ctx)
item.parent=with_ctx
with_ctx.tree=[item]
for(var i=0;i<suite.length;i++){new_node.add(suite[i])}
node.children=[new_node]}
node.is_try=true 
if(this.transformed)return 
if(this.tree.length>1){var nw=new $Node()
var ctx=new $NodeCtx(nw)
nw.parent=node
nw.module=node.module
nw.indent=node.indent+4
var wc=new $WithCtx(ctx)
wc.tree=this.tree.slice(1)
for(var i=0;i<node.children.length;i++){nw.add(node.children[i])}
node.children=[nw]
this.transformed=true
return}
var num=this.num=$loop_num 
if(this.tree[0].alias===null){this.tree[0].alias='$temp'}
if(this.tree[0].type=='expr' && 
this.tree[0].tree[0].type=='list_or_tuple'){if(this.tree[1].type!='expr' ||
this.tree[1].tree[0].type!='list_or_tuple'){$_SyntaxError(C)}
if(this.tree[0].tree[0].tree.length!=this.tree[1].tree[0].tree.length){$_SyntaxError(C,['wrong number of alias'])}
var ids=this.tree[0].tree[0].tree
var alias=this.tree[1].tree[0].tree
this.tree.shift()
this.tree.shift()
for(var i=ids.length-1;i>=0;i--){ids[i].alias=alias[i].value
this.tree.splice(0,0,ids[i])}}
var block=node.children 
node.children=[]
var try_node=new $Node()
try_node.is_try=true
new $NodeJSCtx(try_node,'try')
node.add(try_node)
if(this.tree[0].alias){var alias=this.tree[0].alias
var js='$locals'+'["'+alias+'"] = $value'+num
var value_node=new $Node()
new $NodeJSCtx(value_node,js)
try_node.add(value_node)}
for(var i=0;i<block.length;i++){try_node.add(block[i])}
var catch_node=new $Node()
catch_node.is_catch=true 
new $NodeJSCtx(catch_node,'catch($err'+$loop_num+')')
var fbody=new $Node(),indent=node.indent+4
var js='$exc'+num+' = false;$err'+$loop_num+'=$B.exception($err'+
$loop_num+')\n'+' '.repeat(indent)+
'if(!bool($ctx_manager_exit'+num+'($err'+$loop_num+
'.__class__.$factory,'+'$err'+$loop_num+
',getattr($err'+$loop_num+',"traceback"))))'
js +='{throw $err'+$loop_num+'}'
new $NodeJSCtx(fbody,js)
catch_node.add(fbody)
node.add(catch_node)
var finally_node=new $Node()
new $NodeJSCtx(finally_node,'finally')
finally_node.C.type='single_kw'
finally_node.C.token='finally'
finally_node.is_except=true
var fbody=new $Node()
new $NodeJSCtx(fbody,'if($exc'+num+'){$ctx_manager_exit'+num+
'(None,None,None)}')
finally_node.add(fbody)
node.parent.insert(rank+1,finally_node)
$loop_num++
this.transformed=true}
this.to_js=function(){this.js_processed=true
var indent=$get_node(this).indent,h=' '.repeat(indent),num=this.num,scope=$get_scope(this)
var res='var $ctx_manager'+num+' = '+this.tree[0].to_js()+
'\n'+h+'var $ctx_manager_exit'+num+
'= getattr($ctx_manager'+num+',"__exit__")\n'+
h+'var $value'+num+' = getattr($ctx_manager'+num+
',"__enter__")()\n'
res +=h+'var $exc'+num+' = true\n'
return res + h+'try'}}
function $YieldCtx(C){
this.type='yield'
this.toString=function(){return '(yield) '+this.tree}
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
switch(C.type){case 'node':
break;
case 'assign':
case 'tuple':
case 'list_or_tuple': 
var ctx=C
while(ctx.parent)ctx=ctx.parent
ctx.node.yield_atoms.push(this)
break;
default:
$_SyntaxError(C,'yield atom must be inside ()')}
var scope=$get_scope(this)
if(!scope.is_function){$_SyntaxError(C,["'yield' outside function"])}else if(scope.has_return_with_arguments){$_SyntaxError(C,["'return' with argument inside generator"])}
var def=scope.C.tree[0]
def.type='generator'
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
$loop_num++}else{var new_node=new $Node()
new $NodeJSCtx(new_node,'// placeholder for generator sent value')
new_node.set_yield_value=true
node.parent.insert(rank+1,new_node)}}
this.to_js=function(){this.js_processed=true
if(this.from===undefined)return $to_js(this.tree)||'None'
return $to_js(this.tree)}}
function $add_line_num(node,rank){if(node.type==='module'){var i=0
while(i<node.children.length){i +=$add_line_num(node.children[i],i)}}else{var elt=node.C.tree[0],offset=1
var flag=true
var pnode=node
while(pnode.parent!==undefined){pnode=pnode.parent}
var mod_id=pnode.id
if(node.line_num===undefined){flag=false}
if(elt.type==='condition' && elt.token==='elif'){flag=false}
else if(elt.type==='except'){flag=false}
else if(elt.type==='single_kw'){flag=false}
if(flag){
var js=';$locals.$line_info="'+node.line_num+','+mod_id+'";'
var new_node=new $Node()
new $NodeJSCtx(new_node,js)
node.parent.insert(rank,new_node)
offset=2}
var i=0
while(i<node.children.length)i+=$add_line_num(node.children[i],i)
if((elt.type=='condition' && elt.token=="while")
||node.C.type=='for'){node.add($NodeJS('$locals.$line_info="'+node.line_num+','+
mod_id+'";'))}
return offset}}
function $previous(C){var previous=C.node.parent.children[C.node.parent.children.length-2]
if(!previous ||!previous.C){$_SyntaxError(C,'keyword not following correct keyword')}
return previous.C.tree[0]}
function $get_docstring(node){var doc_string=''
if(node.children.length>0){var firstchild=node.children[0]
if(firstchild.C.tree && firstchild.C.tree[0].type=='expr'){if(firstchild.C.tree[0].tree[0].type=='str')
doc_string=firstchild.C.tree[0].tree[0].to_js()}}
return doc_string}
function $get_scope(C){
var ctx_node=C.parent
while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
var scope=null
while(tree_node.parent && tree_node.parent.type!=='module'){var ntype=tree_node.parent.C.tree[0].type
switch(ntype){case 'def':
case 'class':
case 'generator':
var scope=tree_node.parent
scope.ntype=ntype
scope.elt=scope.C.tree[0]
scope.is_function=ntype!='class'
return scope}
tree_node=tree_node.parent}
var scope=tree_node.parent ||tree_node 
scope.ntype="module"
scope.elt=scope.module
return scope}
function $get_module(C){
var ctx_node=C.parent
while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
var scope=null
while(tree_node.parent.type!=='module'){tree_node=tree_node.parent}
var scope=tree_node.parent 
scope.ntype="module"
return scope}
function $get_node(C){var ctx=C
while(ctx.parent){ctx=ctx.parent}
return ctx.node}
function $get_blocks(name,scope){var res=[]
while(true){if($B.bound[scope.id][name]!==undefined){res.push(scope.id)}
if(scope.parent_block){if(scope.parent_block.id=='__builtins__'){if(scope.blurred){return false}}}else{break}
scope=scope.parent_block}
return res}
function $set_type(scope,expr,value){
if(expr.type=='expr'){expr=expr.tree[0]}
while(value.type=='expr' && value.tree.length==1){value=value.tree[0]}
if(value.type=='list_or_tuple' && value.real=='tuple' && 
value.tree.length==1){return $set_type(scope.id,expr,value.tree[0])}
if($B.type[scope.id]===undefined){return}
if(expr.type=="id"){switch(value.type){case 'int':
case 'str':
$B.type[scope.id][expr.value]=value.type
return
case 'list_or_tuple':
case 'dict_or_set':
$B.type[scope.id][expr.value]=value.real
return
case 'id':
$B.type[scope.id][expr.value]=$B.type[scope.id][value.value]
return
case 'call':
var func_name=value.func.value
if($B.bound.__builtins__[func_name]!==undefined){var blocks=$get_blocks(func_name,scope)
if(blocks.length==1 && blocks[0]=='__builtins__'){switch(func_name){case 'int':
case 'list':
case 'str':
$B.type[scope.id][expr.value]=func_name
return}}}
break
default:
break}}
$B.type[scope.id][expr.value]=false}
function $ws(n){return ' '.repeat(n)}
function $to_js_map(tree_element){if(tree_element.to_js !==undefined)return tree_element.to_js()
throw Error('no to_js() for '+tree_element)}
function $to_js(tree,sep){if(sep===undefined){sep=','}
return tree.map($to_js_map).join(sep)}
var $expr_starters=['id','imaginary','int','float','str','bytes','[','(','{','not','lambda']
function $arbo(ctx){while(ctx.parent!=undefined){ctx=ctx.parent}
return ctx}
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
case '.':
case 'not':
case 'lambda':
case 'yield':
C.parent.tree.pop()
var commas=C.with_commas
C=C.parent}
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
case '.':
return new $EllipsisCtx(new $ExprCtx(C,'ellipsis',commas))
case 'not':
if(C.type==='op'&&C.op==='is'){
C.op='is_not'
return C}
return new $NotCtx(new $ExprCtx(C,'not',commas))
case 'lambda':
return new $LambdaCtx(new $ExprCtx(C,'lambda',commas))
case 'op':
var tg=arguments[2]
switch(tg){case '*':
C.parent.tree.pop()
var commas=C.with_commas
C=C.parent
return new $PackedCtx(new $ExprCtx(C,'expr',commas))
case '-':
case '~':
case '+':
C.parent.tree.pop()
var left=new $UnaryCtx(C.parent,tg)
if(tg=='-'){var op_expr=new $OpCtx(left,'unary_neg')}
else if(tg=='+'){var op_expr=new $OpCtx(left,'unary_pos')}
else{var op_expr=new $OpCtx(left,'unary_inv')}
return new $AbstractExprCtx(op_expr,false)
case 'not':
C.parent.tree.pop()
var commas=C.with_commas
C=C.parent
return new $NotCtx(new $ExprCtx(C,'not',commas))}
$_SyntaxError(C,'token '+token+' after '+C)
case '=':
$_SyntaxError(C,token)
case 'yield':
return new $AbstractExprCtx(new $YieldCtx(C),true)
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
$_SyntaxError(C,token)}}
return $transition(C.parent,token,arguments[2])
case 'annotation':
return $transition(C.parent,token)
case 'assert':
if(token==='eol')return $transition(C.parent,token)
$_SyntaxError(C,token)
case 'assign':
if(token==='eol'){if(C.tree[1].type=='abstract_expr'){$_SyntaxError(C,'token '+token+' after '+C)}
C.guess_type()
return $transition(C.parent,'eol')}
$_SyntaxError(C,'token '+token+' after '+C)
case 'attribute':
if(token==='id'){var name=arguments[2]
if(noassign[name]===true){$_SyntaxError(C,["cannot assign to "+name])}
C.name=name
return C.parent}
$_SyntaxError(C,token)
case 'augm_assign':
if(token==='eol'){if(C.tree[1].type=='abstract_expr'){$_SyntaxError(C,'token '+token+' after '+C)}
return $transition(C.parent,'eol')}
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
case '.':
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
case '+':
C.expect=','
return $transition(new $CallArgCtx(C),token,arguments[2])
case '*':
C.has_star=true;
return new $StarArgCtx(C)
case '**':
C.has_dstar=true
return new $DoubleStarArgCtx(C)}
throw Error('SyntaxError')}
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
case '.':
case 'not':
case 'lambda':
if(C.expect==='id'){C.expect=','
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])}
break
case '=':
if(C.expect===','){return new $ExprCtx(new $KwArgCtx(C),'kw_value',false)}
break
case 'for':
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
case '~':
return $transition(new $AbstractExprCtx(C,false),token,op)
case '*':
return new $StarArgCtx(C)
case '**':
return new $DoubleStarArgCtx(C)}}
$_SyntaxError(C,'token '+token+' after '+C)
case ')':
if(C.parent.kwargs &&
$B.last(C.parent.tree).tree[0]&& 
['kwarg','star_arg','double_star_arg'].indexOf($B.last(C.parent.tree).tree[0].type)==-1){$_SyntaxError(C,['non-keyword arg after keyword arg'])}
if(C.tree.length>0){var son=C.tree[C.tree.length-1]
if(son.type==='list_or_tuple'&&son.real==='gen_expr'){son.intervals.push($pos)}}
return $transition(C.parent,token)
case ':':
if(C.expect===',' && C.parent.parent.type==='lambda'){return $transition(C.parent.parent,token)}
break
case ',':
if(C.expect===','){if(C.parent.kwargs && 
['kwarg','star_arg','double_star_arg'].indexOf($B.last(C.parent.tree).tree[0].type)==-1){console.log('err2')
$_SyntaxError(C,['non-keyword arg after keyword arg'])}
return $transition(C.parent,token,arguments[2])}
console.log('C '+C+'token '+token+' expect '+C.expect)}
$_SyntaxError(C,'token '+token+' after '+C)
case 'class':
switch(token){case 'id':
if(C.expect==='id'){C.set_name(arguments[2])
C.expect='(:'
return C}
break
case '(':
return new $CallCtx(C)
case ':':
return $BodyCtx(C)}
$_SyntaxError(C,'token '+token+' after '+C)
case 'comp_if':
return $transition(C.parent,token,arguments[2])
case 'comp_for':
if(token==='in' && C.expect==='in'){C.expect=null
return new $AbstractExprCtx(new $CompIterableCtx(C),true)}
if(C.expect===null){
return $transition(C.parent,token,arguments[2])}
$_SyntaxError(C,'token '+token+' after '+C)
case 'comp_iterable':
return $transition(C.parent,token,arguments[2])
case 'comprehension':
switch(token){case 'if':
return new $AbstractExprCtx(new $CompIfCtx(C),false)
case 'for':
return new $TargetListCtx(new $CompForCtx(C))}
return $transition(C.parent,token,arguments[2])
case 'condition':
if(token===':')return $BodyCtx(C)
$_SyntaxError(C,'token '+token+' after '+C)
case 'continue':
if(token=='eol')return C.parent
$_SyntaxError(C,'token '+token+' after '+C)
case 'ctx_manager_alias':
switch(token){case ',':
case ':':
return $transition(C.parent,token,arguments[2])}
$_SyntaxError(C,'token '+token+' after '+C)
case 'decorator':
if(token==='id' && C.tree.length===0){return $transition(new $AbstractExprCtx(C,false),token,arguments[2])}
if(token==='eol'){return $transition(C.parent,token)}
$_SyntaxError(C,'token '+token+' after '+C)
case 'def':
switch(token){case 'id':
if(C.name){$_SyntaxError(C,'token '+token+' after '+C)}
C.set_name(arguments[2])
return C
case '(':
if(C.name===null){$_SyntaxError(C,'token '+token+' after '+C)}
C.has_args=true;
return new $FuncArgs(C)
case 'annotation':
return new $AbstractExprCtx(new $AnnotationCtx(C),true)
case ':':
if(C.has_args)return $BodyCtx(C)}
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
return new $AbstractExprCtx(new $OpCtx(C,arguments[2]),false)}
return $transition(C.parent,token,arguments[2])}else{if(C.expect===','){switch(token){case '}':
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
return C}}
$_SyntaxError(C,'token '+token+' after '+C)
case ',':
if(C.real==='dict_or_set'){C.real='set'}
if(C.real==='dict' && C.tree.length%2){$_SyntaxError(C,'token '+token+' after '+C)}
C.expect='id'
return C
case ':':
if(C.real==='dict_or_set'){C.real='dict'}
if(C.real==='dict'){C.expect=','
return new $AbstractExprCtx(C,false)}else{$_SyntaxError(C,'token '+token+' after '+C)}
case 'for':
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
return new $TargetListCtx(new $CompForCtx(comp))}
$_SyntaxError(C,'token '+token+' after '+C)}else if(C.expect==='id'){switch(token){case '}':
if(C.tree.length==0){
C.items=[]
C.real='dict'}else{
C.items=C.tree}
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
case '.':
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
else if(arguments[2]=='+'){var op_expr=new $OpCtx(left,'unary_pos')}
else{var op_expr=new $OpCtx(left,'unary_inv')}
return new $AbstractExprCtx(op_expr,false)}
$_SyntaxError(C,'token '+token+' after '+C)}
$_SyntaxError(C,'token '+token+' after '+C)}
return $transition(C.parent,token,arguments[2])}
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
case '.':
case 'not':
case 'lambda':
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
case ',':
return C.parent
case ')':
return $transition(C.parent,token)
case ':':
if(C.parent.parent.type==='lambda'){return $transition(C.parent.parent,token)}}
$_SyntaxError(C,'token '+token+' after '+C)
case 'ellipsis':
if(token=='.'){C.nbdots++;return C}
else{if(C.nbdots!=3){$pos--;$_SyntaxError(C,'token '+token+' after '+C)}else{return $transition(C.parent,token,arguments[2])}}
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
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])}
case 'as':
if(C.expect==='as' && C.has_alias===undefined){C.expect='alias'
C.has_alias=true
return C}
case 'id':
if(C.expect==='alias'){C.expect=':'
C.set_alias(arguments[2])
return C}
break
case ':':
var _ce=C.expect
if(_ce=='id' ||_ce=='as' ||_ce==':'){return $BodyCtx(C)}
break
case '(':
if(C.expect==='id' && C.tree.length===0){C.parenth=true
return C}
break
case ')':
if(C.expect==',' ||C.expect=='as'){C.expect='as'
return C}
case ',':
if(C.parenth!==undefined && C.has_alias===undefined &&
(C.expect=='as' ||C.expect==',')){C.expect='id'
return C}}
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
case '.':
case 'not':
case 'lamdba':
if(C.expect==='expr'){C.expect=','
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])}}
switch(token){case 'not':
if(C.expect===',')return new $ExprNot(C)
break
case 'in':
if(C.parent.type=='target_list'){
return $transition(C.parent,token)}
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
return tuple}}
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
return new $AbstractExprCtx(new_op,false)}
var op1=C.parent,repl=null
while(1){if(op1.type==='expr'){op1=op1.parent}
else if(op1.type==='op'
&&$op_weight[op1.op]>=$op_weight[op]
&& !(op1.op=='**' && op=='**')
){repl=op1;op1=op1.parent}else{break}}
if(repl===null){if(op==='and' ||op==='or'){while(C.parent.type==='not'||
(C.parent.type==='expr'&&C.parent.parent.type==='not')){
C=C.parent
op_parent=C.parent}}else{while(1){if(C.parent!==op1){C=C.parent
op_parent=C.parent}else{break}}}
C.parent.tree.pop()
var expr=new $ExprCtx(op_parent,'operand',C.with_commas)
expr.expect=','
C.parent=expr
var new_op=new $OpCtx(C,op)
return new $AbstractExprCtx(new_op,false)}else{
if(op==='and' ||op==='or'){while(repl.parent.type==='not'||
(repl.parent.type==='expr'&&repl.parent.parent.type==='not')){
repl=repl.parent
op_parent=repl.parent}}}
if(repl.type==='op'){var _flag=false
switch(repl.op){case '<':
case '<=':
case '==':
case '!=':
case 'is':
case '>=':
case '>':
_flag=true}
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
while(repl.parent && repl.parent.type=='op'){if($op_weight[repl.parent.op]<$op_weight[repl.op]){repl=repl.parent}else{break}}
repl.parent.tree.pop()
var and_expr=new $OpCtx(repl,'and')
c2_clone.parent=and_expr
and_expr.tree.push('xxx')
var new_op=new $OpCtx(c2_clone,op)
return new $AbstractExprCtx(new_op,false)}}}
repl.parent.tree.pop()
var expr=new $ExprCtx(repl.parent,'operand',false)
expr.tree=[op1]
repl.parent=expr
var new_op=new $OpCtx(repl,op)
return new $AbstractExprCtx(new_op,false)
case 'augm_assign':
if(C.expect===','){return new $AbstractExprCtx(new $AugmentedAssignCtx(C,arguments[2]),true)}
break
case '=':
if(C.expect===','){if(C.parent.type==="call_arg"){return new $AbstractExprCtx(new $KwArgCtx(C),true)}else if(C.parent.type=="annotation"){return $transition(C.parent.parent,token,arguments[2])}
while(C.parent!==undefined)C=C.parent
C=C.tree[0]
return new $AbstractExprCtx(new $AssignCtx(C),true)}
break
case 'if':
if(C.parent.type!=='comp_iterable'){
var ctx=C
while(ctx.parent && ctx.parent.type=='op'){ctx=ctx.parent
if(ctx.type=='expr' && ctx.parent && ctx.parent.type=='op'){ctx=ctx.parent}}
return new $AbstractExprCtx(new $TernaryCtx(ctx),false)}}
return $transition(C.parent,token)
case 'expr_not':
if(token=='in'){
C.parent.tree.pop()
return new $AbstractExprCtx(new $OpCtx(C.parent,'not_in'),false)}
$_SyntaxError(C,'token '+token+' after '+C)
case 'for': 
switch(token){case 'in':
return new $AbstractExprCtx(new $ExprCtx(C,'target list',true),false)
case ':':
return $BodyCtx(C)}
$_SyntaxError(C,'token '+token+' after '+C)
case 'from':
switch(token){case 'id':
if(C.expect=='id'){C.add_name(arguments[2])
C.expect=','
return C}
if(C.expect==='alias'){C.aliases[C.names[C.names.length-1]]=arguments[2]
C.expect=','
return C}
case '.':
if(C.expect=='module'){if(token=='id'){C.module +=arguments[2]}
else{C.module +='.'}
return C}
case 'import':
case 'IMPRT':
C.blocking=token=='import'
if(C.expect=='module'){C.expect='id'
return C}
case 'op':
if(arguments[2]=='*' && C.expect=='id' 
&& C.names.length==0){if($get_scope(C).ntype!=='module'){$_SyntaxError(C,["import * only allowed at module level"])}
C.add_name('*')
C.expect='eol'
return C}
case ',':
if(C.expect==','){C.expect='id'
return C}
case 'eol':
switch(C.expect){case ',':
case 'eol':
C.bind_names()
return $transition(C.parent,token)}
case 'as':
if(C.expect==',' ||C.expect=='eol'){C.expect='alias'
return C}
case '(':
if(C.expect=='id'){C.expect='id'
return C}
case ')':
if(C.expect==',' ||C.expect=='id'){C.expect='eol'
return C}}
$_SyntaxError(C,'token '+token+' after '+C)
case 'func_arg_id':
switch(token){case '=':
if(C.expect==='='){C.parent.has_default=true
var def_ctx=C.parent.parent
if(C.parent.has_star_arg){def_ctx.default_list.push(def_ctx.after_star.pop())}else{def_ctx.default_list.push(def_ctx.positional_list.pop())}
return new $AbstractExprCtx(C,false)}
break
case ',':
case ')':
if(C.parent.has_default && C.tree.length==0 &&
C.parent.has_star_arg===undefined){console.log('parent '+C.parent,C.parent)
$pos -=C.name.length
$_SyntaxError(C,['non-default argument follows default argument'])}else{return $transition(C.parent,token)}
case ':':
return new $AbstractExprCtx(new $AnnotationCtx(C),false)}
$_SyntaxError(C,'token '+token+' after '+C)
case 'func_args':
switch(token){case 'id':
if(C.expect==='id'){C.expect=','
if(C.names.indexOf(arguments[2])>-1){$_SyntaxError(C,['duplicate argument '+arguments[2]+' in function definition'])}}
return new $FuncArgIdCtx(C,arguments[2])
case ',':
if(C.has_kw_arg)$_SyntaxError(C,'duplicate kw arg')
if(C.expect===','){C.expect='id'
return C}
$_SyntaxError(C,'token '+token+' after '+C)
case ')':
return C.parent
case 'op':
var op=arguments[2]
C.expect=','
if(op=='*'){if(C.has_star_arg){$_SyntaxError(C,'duplicate star arg')}
return new $FuncStarArgCtx(C,'*')}
if(op=='**')return new $FuncStarArgCtx(C,'**')
$_SyntaxError(C,'token '+op+' after '+C)}
$_SyntaxError(C,'token '+token+' after '+C)
case 'func_star_arg':
switch(token){case 'id':
if(C.name===undefined){if(C.parent.names.indexOf(arguments[2])>-1){$_SyntaxError(C,['duplicate argument '+arguments[2]+' in function definition'])}}
C.set_name(arguments[2])
C.parent.names.push(arguments[2])
return C 
case ',':
case ')':
if(C.name===undefined){
C.set_name('$dummy')
C.parent.names.push('$dummy')}
return $transition(C.parent,token)
case ':':
if(C.name===undefined){$_SyntaxError(C,'annotation on an unnamed parameter')}
return new $AbstractExprCtx(new $AnnotationCtx(C),false)}
$_SyntaxError(C,'token '+token+' after '+C)
case 'global':
switch(token){case 'id':
if(C.expect==='id'){new $IdCtx(C,arguments[2])
C.add(arguments[2])
C.expect=','
return C}
break
case ',': 
if(C.expect===','){C.expect='id'
return C}
break
case 'eol':
if(C.expect===','){return $transition(C.parent,token)}
break}
$_SyntaxError(C,'token '+token+' after '+C)
case 'id':
switch(token){case '=':
if(C.parent.type==='expr' &&
C.parent.parent !==undefined &&
C.parent.parent.type==='call_arg'){return new $AbstractExprCtx(new $KwArgCtx(C.parent),false)}
return $transition(C.parent,token,arguments[2])
case 'op':
return $transition(C.parent,token,arguments[2])
case 'id':
case 'str':
case 'int':
case 'float':
case 'imaginary':
$_SyntaxError(C,'token '+token+' after '+C)}
return $transition(C.parent,token,arguments[2])
case 'import':
switch(token){case 'id':
if(C.expect==='id'){new $ImportedModuleCtx(C,arguments[2])
C.expect=','
return C}
if(C.expect==='qual'){C.expect=','
C.tree[C.tree.length-1].name +='.'+arguments[2]
C.tree[C.tree.length-1].alias +='.'+arguments[2]
return C}
if(C.expect==='alias'){C.expect=','
C.tree[C.tree.length-1].alias=arguments[2]
return C}
break
case '.':
if(C.expect===','){C.expect='qual'
return C}
break
case ',':
if(C.expect===','){C.expect='id'
return C}
break
case 'as':
if(C.expect===','){C.expect='alias'
return C}
break
case 'eol':
if(C.expect===','){C.bind_names()
return $transition(C.parent,token)}
break}
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
$_SyntaxError(C,'token '+token+' after '+C)}
return $transition(C.parent,token,arguments[2])
case 'kwarg':
if(token===',')return new $CallArgCtx(C.parent.parent)
return $transition(C.parent,token)
case 'lambda':
if(token===':' && C.args===undefined){C.args=C.tree
C.tree=[]
C.body_start=$pos
return new $AbstractExprCtx(C,false)}
if(C.args!==undefined){
C.body_end=$pos
return $transition(C.parent,token)}
if(C.args===undefined){return $transition(new $CallCtx(C),token,arguments[2])}
$_SyntaxError(C,'token '+token+' after '+C)
case 'list_or_tuple':
if(C.closed){if(token==='[')return new $SubCtx(C.parent)
if(token==='(')return new $CallCtx(C)
return $transition(C.parent,token,arguments[2])}else{if(C.expect===','){switch(C.real){case 'tuple':
case 'gen_expr':
if(token===')'){C.closed=true
if(C.real==='gen_expr'){C.intervals.push($pos)}
return C.parent}
break
case 'list':
case 'list_comp':
if(token===']'){C.closed=true
if(C.real==='list_comp'){C.intervals.push($pos)}
return C}
break
case 'dict_or_set_comp':
if(token==='}'){C.intervals.push($pos)
return $transition(C.parent,token)}
break}
switch(token){case ',':
if(C.real==='tuple'){C.has_comma=true}
C.expect='id'
return C
case 'for':
if(C.real==='list'){C.real='list_comp'}
else{C.real='gen_expr'}
C.intervals=[C.start+1]
C.expression=C.tree
C.tree=[]
var comp=new $ComprehensionCtx(C)
return new $TargetListCtx(new $CompForCtx(comp))}
return $transition(C.parent,token,arguments[2])}else if(C.expect==='id'){switch(C.real){case 'tuple':
if(token===')'){C.closed=true
return C.parent}
if(token=='eol' && C.implicit===true){C.closed=true
return $transition(C.parent,token)}
break
case 'gen_expr':
if(token===')'){C.closed=true
return $transition(C.parent,token)}
break
case 'list':
if(token===']'){C.closed=true
return C}
break}
switch(token){case '=':
if(C.real=='tuple' && C.implicit===true){C.closed=true
C.parent.tree.pop()
var expr=new $ExprCtx(C.parent,'tuple',false)
expr.tree=[C]
C.parent=expr
return $transition(C.parent,token)}
break
case ')':
break
case ']':
if(C.real=='tuple' && C.implicit===true){
return $transition(C.parent,token,arguments[2])}else{break}
case ',':
$_SyntaxError(C,'unexpected comma inside list')
default:
C.expect=','
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])}}else{return $transition(C.parent,token,arguments[2])}}
case 'list_comp':
switch(token){case ']':
return C.parent
case 'in':
return new $ExprCtx(C,'iterable',true)
case 'if':
return new $ExprCtx(C,'condition',true)}
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
case '.':
var expr=new $AbstractExprCtx(C,true)
return $transition(expr,token,arguments[2])
case 'op':
switch(arguments[2]){case '*':
case '+':
case '-':
case '~':
var expr=new $AbstractExprCtx(C,true)
return $transition(expr,token,arguments[2])}
break
case 'class':
return new $ClassCtx(C)
case 'continue':
return new $ContinueCtx(C)
case '__debugger__':
return new $DebuggerCtx(C)
case 'break':
return new $BreakCtx(C)
case 'def':
return new $DefCtx(C)
case 'for':
return new $TargetListCtx(new $ForExpr(C))
case 'if':
case 'while':
return new $AbstractExprCtx(new $ConditionCtx(C,token),false)
case 'elif':
var previous=$previous(C)
if(['condition'].indexOf(previous.type)==-1 ||
previous.token=='while'){$_SyntaxError(C,'elif after '+previous.type)}
return new $AbstractExprCtx(new $ConditionCtx(C,token),false)
case 'else':
var previous=$previous(C)
if(['condition','except','for'].indexOf(previous.type)==-1){$_SyntaxError(C,'else after '+previous.type)}
return new $SingleKwCtx(C,token)
case 'finally':
var previous=$previous(C)
if(['try','except'].indexOf(previous.type)==-1 &&
(previous.type!='single_kw' ||previous.token!='else')){$_SyntaxError(C,'finally after '+previous.type)}
return new $SingleKwCtx(C,token)
case 'try':
return new $TryCtx(C)
case 'except':
var previous=$previous(C)
if(['try','except'].indexOf(previous.type)==-1){$_SyntaxError(C,'except after '+previous.type)}
return new $ExceptCtx(C)
case 'assert':
return new $AbstractExprCtx(new $AssertCtx(C),'assert',true)
case 'from':
return new $FromCtx(C)
case 'import':
return new $ImportCtx(C)
case 'IMPRT': 
return new $IMPRTCtx(C)
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
return C.node.parent.C}
return C}
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
case '.':
case 'not':
case 'lamdba':
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])
case 'op':
var a=arguments[2]
if('+'==a ||'-'==a ||'~'==a){var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])}}
return $transition(C.parent,token)
case 'op':
if(C.op===undefined){$_SyntaxError(C,['C op undefined '+C])}
if(C.op.substr(0,5)=='unary'){if(C.parent.type=='assign' ||C.parent.type=='return'){
C.parent.tree.pop()
var t=new $ListOrTupleCtx(C.parent,'tuple')
t.tree.push(C)
C.parent=t
return t}}
switch(token){case 'id':
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
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
case 'op':
switch(arguments[2]){case '+':
case '-':
case '~':
return new $UnaryCtx(C,arguments[2])}
default:
if(C.tree[C.tree.length-1].type=='abstract_expr'){$_SyntaxError(C,'token '+token+' after '+C)}}
var t0=C.tree[0],t1=C.tree[1]
if(t0.tree && t1.tree){t0=t0.tree[0]
t1=t1.tree[0]}
return $transition(C.parent,token)
case 'packed':
if(token==='id'){new $IdCtx(C,arguments[2])
C.parent.expect=','
return C.parent}
$_SyntaxError(C,'token '+token+' after '+C)
case 'pass':
if(token==='eol')return C.parent
$_SyntaxError(C,'token '+token+' after '+C)
case 'raise':
switch(token){case 'id':
if(C.tree.length===0){return new $IdCtx(new $ExprCtx(C,'exc',false),arguments[2])}
break
case 'from': 
if(C.tree.length>0){return new $AbstractExprCtx(C,false)}
break
case 'eol':
return $transition(C.parent,token)}
$_SyntaxError(C,'token '+token+' after '+C)
case 'return':
var no_args=C.tree[0].type=='abstract_expr'
if(!no_args){var scope=$get_scope(C)
if(scope.ntype=='generator'){$_SyntaxError(C,["'return' with argument inside generator"])}
scope.has_return_with_arguments=true}
return $transition(C.parent,token)
case 'single_kw':
if(token===':')return $BodyCtx(C)
$_SyntaxError(C,'token '+token+' after '+C)
case 'star_arg':
switch(token){case 'id':
if(C.parent.type=="target_list"){C.tree.push(arguments[2])
C.parent.expect=','
console.log('return parent',C.parent)
return C.parent}
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
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
if(C.parent.parent.type==='lambda'){return $transition(C.parent.parent,token)}}
$_SyntaxError(C,'token '+token+' after '+C)
case 'str':
switch(token){case '[':
return new $AbstractExprCtx(new $SubCtx(C.parent),false)
case '(':
C.parent.tree[0]=C
return new $CallCtx(C.parent)
case 'str':
C.tree.push(arguments[2])
return C}
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
case '.':
case 'not':
case 'lamdba':
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])
case ']':
return C.parent
case ':':
if(C.tree.length==0){new $AbstractExprCtx(C,false)}
return new $AbstractExprCtx(C,false)}
$_SyntaxError(C,'token '+token+' after '+C)
case 'target_list':
switch(token){case 'id':
if(C.expect==='id'){C.expect=','
return new $IdCtx(new $ExprCtx(C,'target',false),arguments[2])}
case 'op':
if(C.expect=='id' && arguments[2]=='*'){
return new $PackedCtx(C)}
case '(':
case '[':
if(C.expect==='id'){C.expect=','
return new $TargetListCtx(C)}
case ')':
case ']':
if(C.expect===',')return C.parent
case ',':
if(C.expect==','){C.expect='id'
return C}}
if(C.expect===','){return $transition(C.parent,token,arguments[2])}else if(token=='in'){
return $transition(C.parent,token,arguments[2])}
$_SyntaxError(C,'token '+token+' after '+C)
case 'ternary':
if(token==='else'){C.in_else=true
return new $AbstractExprCtx(C,false)}
return $transition(C.parent,token,arguments[2])
case 'try':
if(token===':')return $BodyCtx(C)
$_SyntaxError(C,'token '+token+' after '+C)
case 'unary':
switch(token){case 'int':
case 'float':
case 'imaginary':
console.log(token,arguments[2],'after',C)
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
if(true){
var repl=new $AttrCtx(expr)
if(C.op==='+'){repl.name='__pos__'}
else if(C.op==='-'){repl.name='__neg__'}
else{repl.name='__invert__'}
var call=new $CallCtx(expr)
return expr1}
return C.parent
case 'op':
if('+'==arguments[2]||'-'==arguments[2]){var op=arguments[2]
if(C.op===op){C.op='+'}else{C.op='-'}
return C}}
return $transition(C.parent,token,arguments[2])
case 'with':
switch(token){case 'id':
if(C.expect==='id'){C.expect='as'
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])}
if(C.expect==='alias'){if(C.parenth!==undefined){C.expect=','}
else{C.expect=':'}
C.set_alias(arguments[2])
return C}
break
case 'as':
return new $AbstractExprCtx(new $AliasCtx(C))
case ':':
switch(C.expect){case 'id':
case 'as':
case ':':
return $BodyCtx(C)}
break
case '(':
if(C.expect==='id' && C.tree.length===0){C.parenth=true
return C}else if(C.expect=='alias'){console.log('C',C,'token',token)
C.expect=':'
return new $TargetListCtx(C,false)}
break
case ')':
if(C.expect==',' ||C.expect=='as'){C.expect=':'
return C}
break
case ',':
if(C.parenth!==undefined && C.has_alias===undefined &&
(C.expect==',' ||C.expect=='as')){C.expect='id'
return C}else if(C.expect=='as'){C.expect='id'
return C}else if(C.expect==':'){C.expect='id'
return C}
break}
$_SyntaxError(C,'token '+token+' after '+C.expect)
case 'yield':
if(token=='from'){
if(C.tree[0].type!='abstract_expr'){
$_SyntaxError(C,"'from' must follow 'yield'")}
C.from=true
C.tree=[]
return new $AbstractExprCtx(C,true)}
return $transition(C.parent,token)}}
$B.forbidden=['case','catch','constructor','Date','delete','default','enum','extends','Error','history','function','location','Math','new','null','Number','RegExp','super','this','throw','var','toString']
var s_escaped='abfnrtvxuU"'+"'"+'\\',is_escaped={}
for(var i=0;i<s_escaped.length;i++){is_escaped[s_escaped.charAt(i)]=true}
function $tokenize(src,module,locals_id,parent_block_id,line_info){var delimiters=[["#","\n","comment"],['"""','"""',"triple_string"],["'","'","string"],['"','"',"string"],["r'","'","raw_string"],['r"','"',"raw_string"]]
var br_open={"(":0,"[":0,"{":0}
var br_close={")":"(","]":"[","}":"{"}
var br_stack=""
var br_pos=[]
var kwdict=["class","return","break","for","lambda","try","finally","raise","def","from","nonlocal","while","del","global","with","as","elif","else","if","yield","assert","import","except","raise","in",
"pass","with","continue","__debugger__","IMPRT" 
]
var unsupported=[]
var $indented=['class','def','for','condition','single_kw','try','except','with']
var punctuation={',':0,':':0}
int_pattern=new RegExp("^\\d+(j|J)?"),float_pattern1=new RegExp("^\\d+\\.\\d*([eE][+-]?\\d+)?(j|J)?"),float_pattern2=new RegExp("^\\d+([eE][+-]?\\d+)(j|J)?"),hex_pattern=new RegExp("^0[xX]([0-9a-fA-F]+)"),octal_pattern=new RegExp("^0[oO]([0-7]+)"),binary_pattern=new RegExp("^0[bB]([01]+)"),id_pattern=new RegExp("[\\$_a-zA-Z]\\w*"),qesc=new RegExp('"',"g"),
sqesc=new RegExp("'","g"),
dummy={}
var C=null
var root=new $Node('module')
root.module=module
root.id=locals_id
$B.modules[root.id]=root
if(locals_id==parent_block_id){root.parent_block=$B.modules[parent_block_id].parent_block ||$B.modules['__builtins__']}else{root.parent_block=$B.modules[parent_block_id]||$B.modules['__builtins__']}
root.line_info=line_info
root.indent=-1
if(locals_id!==module){$B.bound[locals_id]={}}
var new_node=new $Node(),current=root,name="",_type=null,pos=0,indent=null,string_modifier=false
var lnum=1
while(pos<src.length){var flag=false
var car=src.charAt(pos)
if(indent===null){var indent=0
while(pos<src.length){var _s=src.charAt(pos)
if(_s==" "){indent++;pos++}
else if(_s=="\t"){
indent++;pos++
if(indent%8>0)indent+=8-indent%8}else{break}}
var _s=src.charAt(pos)
if(_s=='\n'){pos++;lnum++;indent=null;continue}
else if(_s==='#'){
var offset=src.substr(pos).search(/\n/)
if(offset===-1){break}
pos+=offset+1;lnum++;indent=null;continue}
new_node.indent=indent
new_node.line_num=lnum
new_node.module=module
if(indent>current.indent){
if(C!==null){if($indented.indexOf(C.tree[0].type)==-1){$pos=pos
$_SyntaxError(C,'unexpected indent',pos)}}
current.add(new_node)}else if(indent<=current.indent &&
$indented.indexOf(C.tree[0].type)>-1 &&
C.tree.length<2){$pos=pos
$_SyntaxError(C,'expected an indented block',pos)}else{
while(indent!==current.indent){current=current.parent
if(current===undefined ||indent>current.indent){$pos=pos
$_SyntaxError(C,'unexpected indent',pos)}}
current.parent.add(new_node)}
current=new_node
C=new $NodeCtx(new_node)
continue}
if(car=="#"){var end=src.substr(pos+1).search('\n')
if(end==-1){end=src.length-1}
pos +=end+1;continue}
if(car=='"' ||car=="'"){var raw=C.type=='str' && C.raw,bytes=false ,end=null;
if(string_modifier){switch(string_modifier){case 'r': 
raw=true
break
case 'u':
break
case 'b':
bytes=true
break
case 'rb':
case 'br':
bytes=true;raw=true
break}
string_modifier=false}
if(src.substr(pos,3)==car+car+car){_type="triple_string";end=pos+3}
else{_type="string";end=pos+1}
var escaped=false
var zone=car
var found=false
while(end<src.length){if(escaped){zone+=src.charAt(end)
if(raw && src.charAt(end)=='\\'){zone+='\\'}
escaped=false;end+=1}else if(src.charAt(end)=="\\"){if(raw){if(end<src.length-1 && src.charAt(end+1)==car){zone +='\\\\'+car
end +=2}else{zone +='\\\\'
end++}
escaped=true}else{
if(src.charAt(end+1)=='\n'){
end +=2
lnum++}else{
if(end < src.length-1 &&
is_escaped[src.charAt(end+1)]==undefined){zone +='\\'}
zone+='\\'
escaped=true;end+=1}}}else if(src.charAt(end)=='\n' && _type!='triple_string'){
$pos=end
$_SyntaxError(C,["EOL while scanning string literal"])}else if(src.charAt(end)==car){if(_type=="triple_string" && src.substr(end,3)!=car+car+car){zone +=src.charAt(end)
end++}else{
found=true
$pos=pos
var $string=zone.substr(1),string=''
for(var i=0;i<$string.length;i++){var $car=$string.charAt(i)
if($car==car &&
(raw ||(i==0 ||$string.charAt(i-1)!=='\\'))){string +='\\'}
string +=$car}
if(bytes){C=$transition(C,'str','b'+car+string+car)}else{C=$transition(C,'str',car+string+car)}
C.raw=raw;
pos=end+1
if(_type=="triple_string"){pos=end+3}
break}}else{
zone +=src.charAt(end)
if(src.charAt(end)=='\n'){lnum++}
end++}}
if(!found){if(_type==="triple_string"){$_SyntaxError(C,"Triple string end not found")}else{$_SyntaxError(C,"String end not found")}}
continue}
if(name=="" && car!='$'){try{eval("dummy."+car+"=0")
var idpos=pos+1
while(idpos<src.length){var idcar=src.charAt(idpos)
if(idcar==' '||idcar=='\n'||idcar==';'||idcar=='$'){name=src.substring(pos,idpos)
break}
try{eval("dummy."+src.substring(pos,idpos+1))
idpos++}catch(err){name=src.substring(pos,idpos)
break}}}catch(err){}
if(name){pos +=name.length
if(kwdict.indexOf(name)>-1){$pos=pos-name.length
if(unsupported.indexOf(name)>-1){$_SyntaxError(C,"Unsupported Python keyword '"+name+"'")}
C=$transition(C,name)}else if($operators[name]!==undefined 
&& $B.forbidden.indexOf(name)==-1){
if(name=='is'){
var re=/^\s+not\s+/
var res=re.exec(src.substr(pos))
if(res!==null){pos +=res[0].length
$pos=pos-name.length
C=$transition(C,'op','is_not')}else{$pos=pos-name.length
C=$transition(C,'op',name)}}else if(name=='not'){
var re=/^\s+in\s+/
var res=re.exec(src.substr(pos))
if(res!==null){pos +=res[0].length
$pos=pos-name.length
C=$transition(C,'op','not_in')}else{$pos=pos-name.length
C=$transition(C,name)}}else{$pos=pos-name.length
C=$transition(C,'op',name)}}else if((src.charAt(pos)=='"'||src.charAt(pos)=="'")
&&['r','b','u','rb','br'].indexOf(name.toLowerCase())!==-1){string_modifier=name.toLowerCase()
name=""
continue}else{
if($B.forbidden.indexOf(name)>-1){name='$$'+name}
$pos=pos-name.length
C=$transition(C,'id',name)}
name=""
continue}}
switch(car){case ' ':
case '\t':
pos++
break
case '.':
if(pos<src.length-1 && /^\d$/.test(src.charAt(pos+1))){
var j=pos+1
while(j<src.length && src.charAt(j).search(/\d|e|E/)>-1){j++}
C=$transition(C,'float','0'+src.substr(pos,j-pos))
pos=j
break}
$pos=pos
C=$transition(C,'.')
pos++
break
case '0':
var res=hex_pattern.exec(src.substr(pos))
if(res){C=$transition(C,'int',[16,res[1]])
pos +=res[0].length
break}
var res=octal_pattern.exec(src.substr(pos))
if(res){C=$transition(C,'int',[8,res[1]])
pos +=res[0].length
break}
var res=binary_pattern.exec(src.substr(pos))
if(res){C=$transition(C,'int',[2,res[1]])
pos +=res[0].length
break}
if(src.charAt(pos+1).search(/\d/)>-1){
if(parseInt(src.substr(pos))===0){res=int_pattern.exec(src.substr(pos))
$pos=pos
C=$transition(C,'int',[10,res[0]])
pos +=res[0].length
break}else{$_SyntaxError(C,('invalid literal starting with 0'))}}
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
var res=float_pattern1.exec(src.substr(pos))
if(res){$pos=pos
if(res[2]!==undefined){C=$transition(C,'imaginary',res[0].substr(0,res[0].length-1))}else{C=$transition(C,'float',res[0])}}else{res=float_pattern2.exec(src.substr(pos))
if(res){$pos=pos
if(res[2]!==undefined){C=$transition(C,'imaginary',res[0].substr(0,res[0].length-1))}else{C=$transition(C,'float',res[0])}}else{res=int_pattern.exec(src.substr(pos))
$pos=pos
if(res[1]!==undefined){C=$transition(C,'imaginary',res[0].substr(0,res[0].length-1))}else{C=$transition(C,'int',[10,res[0]])}}}
pos +=res[0].length
break
case '\n':
lnum++
if(br_stack.length>0){
pos++;}else{
if(current.C.tree.length>0){$pos=pos
C=$transition(C,'eol')
indent=null
new_node=new $Node()}else{new_node.line_num=lnum}
pos++}
break
case '(':
case '[':
case '{':
br_stack +=car
br_pos[br_stack.length-1]=[C,pos]
$pos=pos
C=$transition(C,car)
pos++
break
case ')':
case ']':
case '}':
if(br_stack==""){$_SyntaxError(C,"Unexpected closing bracket")}else if(br_close[car]!=br_stack.charAt(br_stack.length-1)){$_SyntaxError(C,"Unbalanced bracket")}else{
br_stack=br_stack.substr(0,br_stack.length-1)
$pos=pos
C=$transition(C,car)
pos++}
break
case '=':
if(src.charAt(pos+1)!="="){$pos=pos
C=$transition(C,'=')
pos++;}else{
$pos=pos
C=$transition(C,'op','==')
pos+=2}
break
case ',':
case ':': 
$pos=pos
C=$transition(C,car)
pos++
break
case ';':
$transition(C,'eol')
if(current.C.tree.length===0){
$pos=pos
$_SyntaxError(C,'invalid syntax')}
var pos1=pos+1
var ends_line=false
while(pos1<src.length){var _s=src.charAt(pos1)
if(_s=='\n' ||_s=='#'){ends_line=true;break}
else if(_s==' '){pos1++}
else{break}}
if(ends_line){pos++;break}
new_node=new $Node()
new_node.indent=$get_node(C).indent
new_node.line_num=lnum
new_node.module=module
$get_node(C).parent.add(new_node)
current=new_node
C=new $NodeCtx(new_node)
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
if(car=='-' && src.charAt(pos+1)=='>'){C=$transition(C,'annotation')
pos +=2
continue}
var op_match=""
for(var op_sign in $operators){if(op_sign==src.substr(pos,op_sign.length)
&& op_sign.length>op_match.length){op_match=op_sign}}
$pos=pos
if(op_match.length>0){if(op_match in $augmented_assigns){C=$transition(C,'augm_assign',op_match)}else{C=$transition(C,'op',op_match)}
pos +=op_match.length}else{$_SyntaxError(C,'invalid character: '+car)}
break
case '\\':
if(src.charAt(pos+1)=='\n'){lnum++ 
pos+=2
break}
case '@':
$pos=pos
C=$transition(C,car)
pos++
break
default:
$pos=pos;$_SyntaxError(C,'unknown token ['+car+']')}}
if(br_stack.length!=0){var br_err=br_pos[0]
$pos=br_err[1]
$_SyntaxError(br_err[0],["Unbalanced bracket "+br_stack.charAt(br_stack.length-1)])}
if(C!==null && $indented.indexOf(C.tree[0].type)>-1){$pos=pos-1
$_SyntaxError(C,'expected an indented block',pos)}
return root}
$B.py2js=function(src,module,locals_id,parent_block_id,line_info){
var t0=new Date().getTime()
src=src.replace(/\r\n/gm,'\n')
if(src.charAt(src.length-1)!="\n"){src+='\n'}
var locals_is_module=Array.isArray(locals_id)
if(locals_is_module){locals_id=locals_id[0]}
var internal=locals_id.charAt(0)=='$'
var local_ns='$locals_'+locals_id.replace(/\./g,'_')
var global_ns='$locals_'+module.replace(/\./g,'_')
$B.bound[module]=$B.bound[module]||{}
$B.bound[module]['__doc__']=true
$B.bound[module]['__name__']=true
$B.bound[module]['__file__']=true
$B.type[module]=$B.type[module]||{}
$B.type[locals_id]=$B.type[locals_id]||{}
$B.$py_src[locals_id]=$B.$py_src[locals_id]||src
var root=$tokenize(src,module,locals_id,parent_block_id,line_info)
root.transform()
var js=['var $B = __BRYTHON__;\n'],pos=1
js[pos++]='eval(__BRYTHON__.InjectBuiltins());\n\n'
js[pos]='var '
if(locals_is_module){js[pos]+=local_ns+'=$locals_'+module+', '}else if(!internal){js[pos]+=local_ns+'=$B.imported["'+locals_id+'"] || {}, '}
js[pos]+='$locals='+local_ns+';'
var offset=0
root.insert(0,$NodeJS(js.join('')))
offset++
var ds_node=new $Node()
new $NodeJSCtx(ds_node,local_ns+'["__doc__"]='+(root.doc_string||'None')+';')
root.insert(offset++,ds_node)
var name_node=new $Node()
var lib_module=module
new $NodeJSCtx(name_node,local_ns+'["__name__"]='+local_ns+'["__name__"] || "'+locals_id+'";')
root.insert(offset++,name_node)
var file_node=new $Node()
new $NodeJSCtx(file_node,local_ns+'["__file__"]="'+$B.$py_module_path[module]+'";None;\n')
root.insert(offset++,file_node)
var enter_frame_pos=offset
root.insert(offset++,$NodeJS('$B.enter_frame(["'+locals_id+'", '+local_ns+','+
'"'+module+'", '+global_ns+']);\n'))
var try_node=new $Node(),children=root.children.slice(enter_frame_pos+1,root.children.length),ctx=new $NodeCtx(try_node)
root.insert(enter_frame_pos+1,try_node)
new $TryCtx(ctx)
if(children.length==0){children=[$NodeJS('')]}
for(var i=0;i<children.length;i++){try_node.add(children[i])}
root.children.splice(enter_frame_pos+2,root.children.length)
var finally_node=new $Node(),ctx=new $NodeCtx(finally_node)
new $SingleKwCtx(ctx,'finally')
finally_node.add($NodeJS('$B.leave_frame("'+locals_id+'")'))
root.add(finally_node)
if($B.debug>0){$add_line_num(root,null,module)}
if($B.debug>=2){var t1=new Date().getTime()
console.log('module '+module+' translated in '+(t1 - t0)+' ms')}
return root}
function load_scripts(scripts){
function callback(ev){req=ev.target
if(req.readyState==4){if(req.status==200){run_script({name:req.module_name,url:req.responseURL,src:req.responseText})
if(scripts.length>0){load_scripts(scripts)}}else{throw Error("cannot load script "+
req.module_name+' at '+req.responseURL+
': error '+req.status)}}}
if(scripts.length>0){var script=scripts.shift()
if(script['src']===undefined){
var req=new XMLHttpRequest()
req.onreadystatechange=callback
req.module_name=script.name
req.open('GET',script.url,true)
req.send()}else{
run_script(script)
load_scripts(scripts)}}}
function run_script(script){
$B.$py_module_path[script.name]=script.url
try{
var $root=$B.py2js(script.src,script.name,script.name,'__builtins__')
var $js=$root.to_js()
if($B.debug>1){console.log($js)}
eval($js)
$B.imported[script.name]=$locals}catch($err){if($B.debug>1){console.log($err)
for(var attr in $err){console.log(attr+' : ',$err[attr])}}
if($err.$py_error===undefined){console.log('Javascript error',$err)
$err=_b_.RuntimeError($err+'')}
var name=$err.__name__
var $trace=_b_.getattr($err,'info')+'\n'+name+': '
if(name=='SyntaxError' ||name=='IndentationError'){$trace +=$err.args[0]}else{$trace +=$err.args}
try{_b_.getattr($B.stderr,'write')($trace)}catch(print_exc_err){console.log($trace)}
throw $err}}
function brython(options){var _b_=$B.builtins
if($B.meta_path===undefined){$B.meta_path=[]}
$B.$options={}
if(options===undefined)options={'debug':0}
if(typeof options==='number')options={'debug':options}
if(options.debug===undefined){options.debug=0 }
$B.debug=options.debug
_b_.__debug__=$B.debug>0
if(options.static_stdlib_import===undefined){options.static_stdlib_import=true}
$B.static_stdlib_import=options.static_stdlib_import
if(options.open !==undefined)_b_.open=options.open
$B.$CORS=false 
if(options.CORS !==undefined)$B.$CORS=options.CORS
$B.$options=options
var meta_path=[]
var path_hooks=[]
if($B.use_VFS){meta_path.push($B.$meta_path[0])
path_hooks.push($B.$path_hooks[0])}
if(options.static_stdlib_import!==false){
meta_path.push($B.$meta_path[1])
if($B.path.length>3){$B.path.shift()
$B.path.shift()}}
meta_path.push($B.$meta_path[2])
$B.meta_path=meta_path
path_hooks.push($B.$path_hooks[1])
$B.path_hooks=path_hooks 
if(options.ipy_id!==undefined){var $elts=[];
for(var $i=0;$i<options.ipy_id.length;$i++){$elts.push(document.getElementById(options.ipy_id[$i]));}}else{var scripts=document.getElementsByTagName('script'),$elts=[]
for(var i=0;i<scripts.length;i++){var script=scripts[i]
if(script.type=="text/python" ||script.type=="text/python3"){$elts.push(script)}}}
var $href=$B.script_path=window.location.href
var $href_elts=$href.split('/')
$href_elts.pop()
if(options.pythonpath!==undefined)$B.path=options.pythonpath
if(options.re_module !==undefined){if(options.re_module=='pyre' ||options.re_module=='jsre'){$B.$options.re=options.re}}
$B.scripts=[]
$B.js={}
var kk=Object.keys(window)
var first_script=true,module_name;
if(options.ipy_id!==undefined){module_name='__main__';
var $src="";
$B.$py_module_path[module_name]=$href;
for(var $i=0;$i<$elts.length;$i++){var $elt=$elts[$i];
$src +=($elt.innerHTML ||$elt.textContent);}
try{
var $root=$B.py2js($src,module_name,module_name,'__builtins__')
var $js=$root.to_js()
if($B.debug>1)console.log($js)
if($B.async_enabled){$js=$B.execution_object.source_conversion($js)
eval($js)}else{
eval($js)}}catch($err){if($B.debug>1){console.log($err)
for(var attr in $err){console.log(attr+' : ',$err[attr])}}
if($err.$py_error===undefined){console.log('Javascript error',$err)
$err=_b_.RuntimeError($err+'')}
var $trace=_b_.getattr($err,'info')+'\n'+$err.__name__+
': ' +$err.args
try{_b_.getattr($B.stderr,'write')($trace)}catch(print_exc_err){console.log($trace)}
throw $err}}else{
var defined_ids={}
for(var i=0;i<$elts.length;i++){var elt=$elts[i]
if(elt.id){if(defined_ids[elt.id]){throw Error("Brython error : Found 2 scripts with the same id '"+
elt.id+"'")}else{defined_ids[elt.id]=true}}}
var scripts=[]
for(var $i=0;$i<$elts.length;$i++){var $elt=$elts[$i]
if($elt.type=="text/python"||$elt.type==="text/python3"){if($elt.id){module_name=$elt.id}
else{if(first_script){module_name='__main__';first_script=false}
else{module_name='__main__'+$B.UUID()}
while(defined_ids[module_name]!==undefined){module_name='__main__'+$B.UUID()}}
$B.scripts.push(module_name)
var $src=null
if($elt.src){
scripts.push({name:module_name,url:$elt.src})}else{
var $src=($elt.innerHTML ||$elt.textContent)
$B.$py_module_path[module_name]=$href
scripts.push({name: module_name,src: $src,url: $href})}}}}
load_scripts(scripts)}
$B.$operators=$operators
$B.$Node=$Node
$B.$NodeJSCtx=$NodeJSCtx
$B.brython=brython})(__BRYTHON__)
var brython=__BRYTHON__.brython

__BRYTHON__.$__new__=function(factory){return function(cls){
var res=factory.apply(null,[])
res.__class__=cls.$dict
var init_func=null
try{init_func=__BRYTHON__.builtins.getattr(res,'__init__')}
catch(err){}
if(init_func!==null){var args=[],pos=0
for(var i=1,_len_i=arguments.length;i < _len_i;i++){args[pos++]=arguments[i]}
init_func.apply(null,args)
res.__initialized__=true}
return res}}
__BRYTHON__.builtins.object=(function($B){var _b_=$B.builtins
var $ObjectDict={
__name__:'object',$native:true}
var reverse_func={'__lt__':'__gt__','__gt__':'__lt__','__le__': '__ge__','__ge__': '__le__'}
var $ObjectNI=function(name,op){return function(self,other){var klass=$B.get_class(other),other_comp=_b_.getattr(klass,reverse_func[name])
if(other_comp.__func__===$ObjectDict[reverse_func[name]]){throw _b_.TypeError('unorderable types: object() '+op+
' '+ _b_.str($B.get_class(other).__name__)+'()')}else{return other_comp(other,self)}}}
var opnames=['add','sub','mul','truediv','floordiv','mod','pow','lshift','rshift','and','xor','or']
var opsigns=['+','-','*','/','//','%','**','<<','>>','&','^','|']
$ObjectDict.__delattr__=function(self,attr){_b_.getattr(self,attr)
delete self[attr];
return _b_.None}
$ObjectDict.__dir__=function(self){var objects=[self],pos=1
var mro=$B.get_class(self).__mro__
for(var i=0,_len_i=mro.length;i < _len_i;i++){objects[pos++]=mro[i]}
var res=[],pos=0
for(var i=0,_len_i=objects.length;i < _len_i;i++){for(var attr in objects[i]){
if(attr.charAt(0)=='$' && attr.charAt(1)!='$'){
continue}
if(!isNaN(parseInt(attr.charAt(0)))){
continue}
if(attr=='__mro__'){continue}
res[pos++]=attr}}
res=_b_.list(_b_.set(res))
_b_.list.$dict.sort(res)
return res}
$ObjectDict.__eq__=function(self,other){
var _class=$B.get_class(self)
if(_class.$native ||_class.__name__=='function'){var _class1=$B.get_class(other)
if(!_class1.$native && _class1.__name__ !='function'){return _b_.getattr(other,'__eq__')(self)}}
return self===other}
$ObjectDict.__format__=function(){var $=$B.args('__format__',2,{self:null,spec:null},['self','spec'],arguments,{},null,null)
if($.spec!==''){throw _b_.TypeError("non-empty format string passed to object.__format__")}
return _b_.getattr($.self,'__repr__')()}
$ObjectDict.__ge__=$ObjectNI('__ge__','>=')
$ObjectDict.__getattribute__=function(obj,attr){var klass=$B.get_class(obj)
if(attr==='__class__'){return klass.$factory}
var res=obj[attr],args=[]
if(res===undefined){
var mro=klass.__mro__
for(var i=0,_len_i=mro.length;i < _len_i;i++){if(mro[i].$methods){var method=mro[i].$methods[attr]
if(method!==undefined){return method(obj)}}
var v=mro[i][attr]
if(v!==undefined){res=v
break}else if(attr=='__str__' && mro[i]['__repr__']!==undefined){
res=mro[i]['repr']
break}}}else{if(res.__set__===undefined){
return res}}
if(res!==undefined){if(res.__class__===_b_.property.$dict){return res.__get__(res,obj,klass)}
var __get__=_b_.getattr(res,'__get__',null)
if(__get__!==null){try{return __get__.apply(null,[obj,klass])}
catch(err){console.log('error in get.apply',err)
console.log(__get__+'')
throw err}}
if(typeof res=='object'){if(__get__ &&(typeof __get__=='function')){get_func=function(x,y){return __get__.apply(x,[y,klass])}}}
if(__get__===null &&(typeof res=='function')){__get__=function(x){return x}}
if(__get__!==null){
res.__name__=attr
if(attr=='__new__'){res.$type='staticmethod'}
var res1=__get__.apply(null,[res,obj,klass])
if(typeof res1=='function'){
if(res1.__class__===$B.$factory)return res
else if(res1.__class__===$B.$MethodDict)return res
return $B.make_method(attr,klass,res,res1)(obj)}else{
return res1}}
return res}else{
var _ga=obj['__getattr__']
if(_ga===undefined){var mro=klass.__mro__
if(mro===undefined){console.log('in getattr mro undefined for '+obj)}
for(var i=0,_len_i=mro.length;i < _len_i;i++){var v=mro[i]['__getattr__']
if(v!==undefined){_ga=v
break}}}
if(_ga!==undefined){try{return _ga(obj,attr)}
catch(err){}}
if(attr.substr(0,2)=='__' && attr.substr(attr.length-2)=='__'){var attr1=attr.substr(2,attr.length-4)
var rank=opnames.indexOf(attr1)
if(rank > -1){var rop='__r'+opnames[rank]+'__' 
var func=function(){try{
if($B.get_class(arguments[0])===klass){throw Error('')}
return _b_.getattr(arguments[0],rop)(obj)}catch(err){var msg="unsupported operand types for "+
opsigns[rank]+": '"+ klass.__name__+"' and '"+
$B.get_class(arguments[0]).__name__+"'"
throw _b_.TypeError(msg)}}
func.$infos={__name__ : klass.__name__+'.'+attr}
return func}}}}
$ObjectDict.__gt__=$ObjectNI('__gt__','>')
$ObjectDict.__hash__=function(self){$B.$py_next_hash--;
return $B.$py_next_hash;}
$ObjectDict.__init__=function(){return _b_.None}
$ObjectDict.__le__=$ObjectNI('__le__','<=')
$ObjectDict.__lt__=$ObjectNI('__lt__','<')
$ObjectDict.__mro__=[$ObjectDict]
$ObjectDict.__new__=function(cls){if(cls===undefined){throw _b_.TypeError('object.__new__(): not enough arguments')}
return{__class__ : cls.$dict}}
$ObjectDict.__ne__=function(self,other){return !_b_.getattr(self,'__eq__')(other)}
$ObjectDict.__or__=function(self,other){if(_b_.bool(self))return self
return other}
$ObjectDict.__repr__=function(self){if(self===object)return "<class 'object'>"
if(self.__class__===$B.$factory)return "<class '"+self.$dict.__name__+"'>"
if(self.__class__.__module__!==undefined){return "<"+self.__class__.__module__+"."+self.__class__.__name__+" object>"}else{return "<"+self.__class__.__name__+" object>"}}
$ObjectDict.__setattr__=function(self,attr,val){if(val===undefined){
throw _b_.TypeError("can't set attributes of built-in/extension type 'object'")}else if(self.__class__===$ObjectDict){
if($ObjectDict[attr]===undefined){throw _b_.AttributeError("'object' object has no attribute '"+attr+"'")}else{throw _b_.AttributeError("'object' object attribute '"+attr+"' is read-only")}}
self[attr]=val
return _b_.None}
$ObjectDict.__setattr__.__str__=function(){return 'method object.setattr'}
$ObjectDict.__str__=$ObjectDict.__repr__
$ObjectDict.__subclasshook__=function(){return _b_.NotImplemented}
function object(){return{__class__:$ObjectDict}}
object.$dict=$ObjectDict
$ObjectDict.$factory=object
object.__repr__=object.__str__=function(){return "<class 'object'>"}
$B.make_class=function(class_obj){
function A(){var res={__class__:A.$dict}
if(class_obj.init){class_obj.init.apply(null,[res].concat(Array.prototype.slice.call(arguments)))}
return res}
A.__class__=$B.$factory
A.$dict={$factory: A,__class__: $B.type,__name__: class_obj.name}
A.$dict.__mro__=[A.$dict,object.$dict]
return A}
return object})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
$B.$class_constructor=function(class_name,class_obj,parents,parents_names,kwargs){var cl_dict=_b_.dict(),bases=null
var setitem=_b_.dict.$dict.__setitem__
for(var attr in class_obj){setitem(cl_dict,attr,class_obj[attr])}
if(parents!==undefined){for(var i=0;i<parents.length;i++){if(parents[i]===undefined){
$B.line_info=class_obj.$def_line
throw _b_.NameError("name '"+parents_names[i]+"' is not defined")}}}
bases=parents
var metaclass=_b_.type
for(var i=0;i<kwargs.length;i++){var key=kwargs[i][0],val=kwargs[i][1]
if(key=='metaclass'){metaclass=val}}
var class_dict={__name__ : class_name.replace('$$',''),__bases__ : bases,__dict__ : cl_dict}
var items=$B.$dict_items(cl_dict);
for(var i=0;i<items.length;i++){class_dict[items[i][0]]=items[i][1]}
class_dict.__mro__=[class_dict].concat(make_mro(bases,cl_dict))
var is_instanciable=true,non_abstract_methods={},abstract_methods={}
for(var i=0;i<class_dict.__mro__.length;i++){var kdict=class_dict.__mro__[i]
for(var attr in kdict){if(non_abstract_methods[attr]){continue}
var v=kdict[attr]
if(typeof v=='function' && v.__class__!==$B.$factory){if(v.__isabstractmethod__===true){is_instanciable=false
abstract_methods[attr]=true}else{non_abstract_methods[attr]=true}}}}
var slots=[]
for(var i=0;i<class_dict.__mro__.length;i++){var _slots=class_dict.__mro__[i].__slots__
if(_slots!==undefined){_slots=_b_.list(_slots)
for(var j=0;j<_slots.length;j++){cl_dict.$slots=cl_dict.$slots ||{}
cl_dict.$slots[_slots[j]]=class_dict.__mro__[i]}}}
for(var i=1;i<class_dict.__mro__.length;i++){if(class_dict.__mro__[i].__class__ !==$B.$type){metaclass=class_dict.__mro__[i].__class__.$factory}}
class_dict.__class__=metaclass.$dict
var meta_new=$B.$type.__getattribute__(metaclass.$dict,'__new__')
if(meta_new.__func__===$B.$type.__new__){var factory=_b_.type.$dict.__new__(_b_.type,class_name,bases,cl_dict)}else{var factory=meta_new(metaclass,class_name,bases,cl_dict)}
class_dict.$factory=factory
for(var i=0;i<parents.length;i++){parents[i].$dict.$subclasses=parents[i].$dict.$subclasses ||[]
parents[i].$dict.$subclasses.push(factory)}
if(metaclass===_b_.type)return factory
for(var attr in class_dict){factory.$dict[attr]=class_dict[attr]}
factory.$dict.$factory=factory
for(var member in metaclass.$dict){if(typeof metaclass.$dict[member]=='function' && member !='__new__'){metaclass.$dict[member].$type='classmethod'}}
factory.$is_func=true
if(!is_instanciable){function nofactory(){throw _b_.TypeError("Can't instantiate abstract class interface"+
" with abstract methods "+Object.keys(abstract_methods).join(', '))}
for(var attr in factory){nofactory[attr]=factory[attr]}
return nofactory}
return factory}
$B.$class_constructor1=function(class_name,class_obj){if(class_obj.__init__===undefined){var creator=function(){this.__class__=class_obj}}else{var creator=function(args){this.__class__=class_obj
class_obj.__init__.apply(null,[this].concat(Array.prototype.slice.call(args)))}}
var factory=function(){return new creator(arguments)}
factory.__class__=$B.$factory
factory.__name__=class_name
factory.$dict=class_obj
class_obj.__class__=$B.$type
class_obj.__name__=class_name
class_obj.__mro__=[class_obj,_b_.object.$dict]
for(var attr in class_obj){factory.prototype[attr]=class_obj[attr]}
class_obj.$factory=factory
return factory}
$B.make_method=function(attr,klass,func,func1){
var __self__,__func__=func,__repr__,__str__,method
switch(func.$type){case undefined:
case 'function':
method=function(instance){var instance_method=function(){var local_args=[instance]
var pos=local_args.length
for(var i=0,_len_i=arguments.length;i < _len_i;i++){local_args[pos++]=arguments[i]}
var f=_b_.getattr(func,'__get__',func)
return f.apply(null,local_args)}
instance_method.__class__=$B.$MethodDict
instance_method.$infos={__class__:klass.$factory,__func__:func,__name__:attr,__self__:instance}
return instance_method}
break
case 'instancemethod':
return func
case 'classmethod':
method=function(){var class_method=function(){var local_args=[klass]
var pos=local_args.length
for(var i=0,_len_i=arguments.length;i < _len_i;i++){local_args[pos++]=arguments[i]}
return func.apply(null,local_args)}
class_method.__class__=$B.$MethodDict
class_method.$infos={__class__:klass.$factory,__func__:func,__name__:attr}
return class_method}
break
case 'staticmethod':
method=function(){return func}
break}
return method}
function make_mro(bases,cl_dict){
var seqs=[],pos1=0
for(var i=0;i<bases.length;i++){
if(bases[i]===_b_.str)bases[i]=$B.$StringSubclassFactory
else if(bases[i]===_b_.list)bases[i]=$B.$ListSubclassFactory
var bmro=[],pos=0
var _tmp=bases[i].$dict.__mro__
for(var k=0;k<_tmp.length;k++){bmro[pos++]=_tmp[k]}
seqs[pos1++]=bmro}
if(bases.indexOf(_b_.object)==-1){bases=bases.concat(_b_.tuple([_b_.object]))}
for(var i=0;i<bases.length;i++)seqs[pos1++]=bases[i].$dict
var mro=[],mpos=0
while(1){var non_empty=[],pos=0
for(var i=0;i<seqs.length;i++){if(seqs[i].length>0)non_empty[pos++]=seqs[i]}
if(non_empty.length==0)break
for(var i=0;i<non_empty.length;i++){var seq=non_empty[i],candidate=seq[0],not_head=[],pos=0
for(var j=0;j<non_empty.length;j++){var s=non_empty[j]
if(s.slice(1).indexOf(candidate)>-1){not_head[pos++]=s}}
if(not_head.length>0){candidate=null}
else{break}}
if(candidate===null){throw _b_.TypeError("inconsistent hierarchy, no C3 MRO is possible")}
mro[mpos++]=candidate
for(var i=0;i<seqs.length;i++){var seq=seqs[i]
if(seq[0]===candidate){
seqs[i].shift()}}}
if(mro[mro.length-1]!==_b_.object.$dict){mro[mpos++]=_b_.object.$dict}
return mro}
_b_.type=function(obj,bases,cl_dict){if(arguments.length==1){if(obj.__class__===$B.$factory){
return obj.$dict.__class__.$factory}
return $B.get_class(obj).$factory}
return $B.$type.__new__(_b_.type,obj,bases,cl_dict)}
_b_.type.__class__=$B.$factory
$B.$type={$factory: _b_.type,__name__:'type'}
$B.$type.__class__=$B.$type
$B.$type.__mro__=[$B.$type,_b_.object.$dict]
_b_.type.$dict=$B.$type
$B.$type.__new__=function(cls,name,bases,cl_dict){
var class_dict={__class__ : $B.$type,__name__ : name.replace('$$',''),__bases__ : bases,__dict__ : cl_dict,$methods :{},$slots: cl_dict.$slots}
var items=$B.$dict_items(cl_dict);
for(var i=0;i<items.length;i++){var name=items[i][0],v=items[i][1]
class_dict[name]=v
if(typeof v=='function' 
&& v.__class__!==$B.$factory
&& v.__class__!==$B.$MethodDict){class_dict.$methods[name]=$B.make_method(name,class_dict,v,v)}}
class_dict.__mro__=[class_dict].concat(make_mro(bases,cl_dict))
class_dict.__class__=class_dict.__mro__[1].__class__
var factory=$instance_creator(class_dict)
factory.__class__=$B.$factory
factory.$dict=class_dict
factory.$is_func=true 
factory.__eq__=function(other){return other===factory.__class__}
class_dict.$factory=factory
return factory}
$B.$factory={__class__:$B.$type,$factory:_b_.type,is_class:true}
$B.$factory.__mro__=[$B.$factory,$B.$type,_b_.object.$dict]
_b_.type.__class__=$B.$factory
_b_.object.$dict.__class__=$B.$type
_b_.object.__class__=$B.$factory
$B.$type.__getattribute__=function(klass,attr){
switch(attr){case '__call__':
return $instance_creator(klass)
case '__eq__':
return function(other){return klass.$factory===other}
case '__ne__':
return function(other){return klass.$factory!==other}
case '__class__':
return klass.__class__.$factory
case '__doc__':
return klass.__doc__ ||_b_.None
case '__setattr__':
if(klass['__setattr__']!==undefined)return klass['__setattr__']
return function(key,value){klass[key]=value}
case '__delattr__':
if(klass['__delattr__']!==undefined)return klass['__delattr__']
return function(key){delete klass[key]}
case '__hash__':
return function(){if(arguments.length==0)return klass.__hashvalue__ ||$B.$py_next_hash--}}
var res=klass[attr],is_class=true
if(res===undefined){
var mro=klass.__mro__
if(mro===undefined){console.log('attr '+attr+' mro undefined for class '+klass+' name '+klass.__name__,klass,klass.__class__)}
for(var i=0;i<mro.length;i++){var v=mro[i][attr]
if(v!==undefined){res=v
break}}
var cl_mro=klass.__class__.__mro__
if(res===undefined){
var cl_mro=klass.__class__.__mro__
if(cl_mro!==undefined){for(var i=0;i<cl_mro.length;i++){var v=cl_mro[i][attr]
if(v!==undefined){res=v
break}}}}
if(res===undefined){
var getattr=null
for(var i=0;i<cl_mro.length;i++){if(cl_mro[i].__getattr__!==undefined){getattr=cl_mro[i].__getattr__
break}}
if(getattr!==null){if(getattr.$type=='classmethod'){return getattr(klass.$factory,attr)}
return getattr(attr)}}}
if(res===undefined && klass.$slots && klass.$slots[attr]!==undefined){return member_descriptor(klass.$slots[attr],attr)}
if(res!==undefined){
if(res.__class__===$B.$PropertyDict)return res
var get_func=res.__get__
if(get_func===undefined &&(typeof res=='function')){get_func=function(x){return x}}
if(get_func===undefined)return res
if(attr=='__new__'){res.$type='staticmethod'}
var res1=get_func.apply(null,[res,$B.builtins.None,klass])
if(res1.__class__===$B.$factory){
return res1 }
if(typeof res1=='function'){res.__name__=attr
var __self__,__func__=res1,__repr__,__str__,args
switch(res.$type){case undefined:
case 'function':
case 'instancemethod':
args=[]
__repr__=__str__=function(attr){return function(){return '<function '+klass.__name__+'.'+attr+'>' }}(attr)
break;
case 'classmethod':
args=[klass.$factory]
__self__=klass
__repr__=__str__=function(){var x='<bound method '+klass.__name__+'.'+attr
x +=' of '+klass.__name__+'>'
return x}
break;
case 'staticmethod':
args=[]
__repr__=__str__=function(attr){return function(){return '<function '+klass.__name__+'.'+attr+'>'}}(attr)
break;}
var method=(function(initial_args){return function(){
var local_args=initial_args.slice()
var pos=local_args.length
for(var i=0;i < arguments.length;i++){local_args[pos++]=arguments[i]}
return res.apply(null,local_args)}})(args)
method.__class__=$B.$FunctionDict
method.__eq__=function(other){return other.__func__===__func__}
for(var attr in res){method[attr]=res[attr]}
method.__func__=__func__
method.__repr__=__repr__
method.__self__=__self__
method.__str__=__str__
method.__code__={'__class__': $B.CodeDict}
method.__doc__=res.__doc__ ||''
method.im_class=klass
return method}}}
function $instance_creator(klass){
if(klass.$instanciable!==undefined){console.log('klass',klass.__name__,'not instanciable')
return function(){throw _b_.TypeError("Can't instantiate abstract "+
"class interface with abstract methods")}}
var new_func=null
try{new_func=_b_.getattr(klass,'__new__')}
catch(err){}
var init_func=null
try{init_func=_b_.getattr(klass,'__init__')}
catch(err){}
var simple=false
if(klass.__bases__.length==0){simple=true}
else if(klass.__bases__.length==1){switch(klass.__bases__[0]){case _b_.object:
case _b_.type:
simple=true
break
default:
simple=false
break}}
if(simple && klass.__new__==undefined && init_func!==null){
return function(){var obj={__class__:klass}
init_func.apply(null,[obj].concat(Array.prototype.slice.call(arguments)))
return obj}}
return function(){var obj
var _args=Array.prototype.slice.call(arguments)
if(simple && klass.__new__==undefined){obj={__class__:klass}}else{if(new_func!==null){obj=new_func.apply(null,[klass.$factory].concat(_args))}}
if(!obj.__initialized__){if(init_func!==null){init_func.apply(null,[obj].concat(_args))}}
return obj}}
function member_descriptor(klass,attr){return{__class__:member_descriptor.$dict,klass: klass,attr: attr}}
member_descriptor.__class__=$B.$factory
member_descriptor.$dict={__class__: $B.$type,__name__: 'member_descriptor',$factory: member_descriptor,__str__: function(self){return "<member '"+self.attr+"' of '"+self.klass.__name__+
"' objects>"}}
member_descriptor.$dict.__mro__=[member_descriptor.$dict ,_b_.object.$dict]
function $MethodFactory(){}
$MethodFactory.__class__=$B.$factory
$B.$MethodDict={__class__:$B.$type,__name__:'method',$factory:$MethodFactory}
$B.$MethodDict.__eq__=function(self,other){return self.$infos !==undefined &&
other.$infos !==undefined &&
self.$infos.__func__===other.$infos.__func__ && 
self.$infos.__self__===other.$infos.__self__}
$B.$MethodDict.__ne__=function(self,other){return !$B.$MethodDict.__eq__(self,other)}
$B.$MethodDict.__getattribute__=function(self,attr){
var infos=self.$infos.__func__.$infos
if(infos && infos[attr]){if(attr=='__code__'){var res={__class__:$B.$CodeDict}
for(var attr in infos.__code__){res[attr]=infos.__code__[attr]}
return res}else{return infos[attr]}}else{return _b_.object.$dict.__getattribute__(self,attr)}}
$B.$MethodDict.__mro__=[$B.$MethodDict,_b_.object.$dict]
$B.$MethodDict.__repr__=$B.$MethodDict.__str__=function(self){var res='<bound method '+self.$infos.__class__.$dict.__name__+'.' 
res +=self.$infos.__name__+' of '
return res+_b_.str(self.$infos.__self__)+'>'}
$MethodFactory.$dict=$B.$MethodDict
$B.$InstanceMethodDict={__class__:$B.$type,__name__:'instancemethod',__mro__:[_b_.object.$dict],$factory:$MethodFactory}})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
$B.args=function($fname,argcount,slots,var_names,$args,$dobj,extra_pos_args,extra_kw_args){
var has_kw_args=false,nb_pos=$args.length,$ns
if(nb_pos>0 && $args[nb_pos-1].$nat=='kw'){has_kw_args=true
nb_pos--
var kw_args=$args[nb_pos].kw}
if(extra_pos_args){slots[extra_pos_args]=[]}
if(extra_kw_args){slots[extra_kw_args]=_b_.dict()}
if(nb_pos>argcount){
if(extra_pos_args===null){
msg=$fname+"() takes "+argcount+' positional argument'+
(argcount> 1 ? '' : 's')+ ' but more were given'
throw _b_.TypeError(msg)}else{
slots[extra_pos_args]=_b_.tuple(Array.prototype.slice.call($args,argcount,nb_pos))
nb_pos=argcount}}
for(var i=0;i<nb_pos;i++){slots[var_names[i]]=$args[i]}
if(has_kw_args){for(var key in kw_args){var value=kw_args[key],key=key.replace(/\$/g,'')
if(slots[key]===undefined){
if(extra_kw_args){
slots[extra_kw_args].$string_dict[key]=value}else{throw _b_.TypeError($fname+"() got an unexpected keyword argument '"+key+"'")}}else if(slots[key]!==null){
throw _b_.TypeError($fname+"() got multiple values for argument '"+key+"'")}else{
slots[key]=value}}}
var missing=[]
for(var attr in slots){if(slots[attr]===null){if($dobj[attr]!==undefined){slots[attr]=$dobj[attr]}
else{missing.push("'"+attr+"'")}}}
if(missing.length>0){if(missing.length==1){throw _b_.TypeError($fname+" missing 1 positional argument: "+missing[0])}else{var msg=$fname+" missing "+missing.length+" positional arguments: "
msg +=missing.join(' and ')
throw _b_.TypeError(msg)}}
return slots}
$B.argsfast=function($fname,argcount,slots,var_names,pos_args,kw_args,$dobj,extra_pos_args,extra_kw_args){
var nb_pos_args=pos_args.length,nb_var_names=var_names.length
if(extra_pos_args!==null){slots[extra_pos_args]=[]}
if(extra_kw_args!==null){slots[extra_kw_args]=_b_.dict()}
if(nb_pos_args<=nb_var_names){for(var i=0;i<nb_pos_args;i++){slots[var_names[i]]=pos_args[i]}}else if(nb_pos_args>nb_var_names){if(extra_pos_args!==null){for(var i=0;i<nb_var_names;i++){slots[var_names[i]]=pos_args[i]}
slots[extra_pos_args]=pos_args.slice(nb_var_names)}}
for(var attr in kw_args){if(slots[attr]===undefined){if(extra_kw_args){slots[extra_kw_args].$string_dict[attr]=kw_args[attr]}
else{throw _b_.TypeError($fname+"() got an unexpected keyword argument '"+key+"'")}}else{if(slots[attr]!==null){throw _b_.TypeError($fname+"() got multiple values for argument '"+attr+"'")}
slots[attr]=kw_args[i]}}
var missing=[]
for(var attr in slots){if(slots[attr]===null){if($dobj[attr]===undefined){missing.push(attr)}
slots[attr]=$dobj[attr]}}
if(missing.length>0){if(missing.length==1){throw _b_.TypeError($fname+" missing 1 positional argument: "+missing[0])}else{var msg=$fname+" missing "+missing.length+" positional arguments: "
msg +=missing.join(' and ')
throw _b_.TypeError(msg)}}
return slots}
$B.get_class=function(obj){
if(obj===null){return $B.$NoneDict}
var klass=obj.__class__
if(klass===undefined){switch(typeof obj){case 'number':
if(obj % 1===0){
obj.__class__=_b_.int.$dict
return _b_.int.$dict}
obj.__class__=_b_.float.$dict
return _b_.float.$dict
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
return _b_.list.$dict}
else if(obj.constructor===Number)return _b_.float.$dict
break}}
return klass}
$B.$mkdict=function(glob,loc){var res={}
for(var arg in glob)res[arg]=glob[arg]
for(var arg in loc)res[arg]=loc[arg]
return res}
function clear(ns){
delete $B.vars[ns],$B.bound[ns],$B.modules[ns],$B.imported[ns]}
$B.$list_comp=function(env){
var $ix=$B.UUID()
var $py="x"+$ix+"=[]\n",indent=0
for(var $i=2,_len_$i=arguments.length;$i < _len_$i;$i++){$py +=' '.repeat(indent)
$py +=arguments[$i].join('')+':\n'
indent +=4}
$py +=' '.repeat(indent)
$py +='x'+$ix+'.append('+arguments[1].join('\n')+')\n'
for(var i=0;i<env.length;i++){var sc_id='$locals_'+env[i][0].replace(/\./,'_')
eval('var '+sc_id+'=env[i][1]')}
var locals_id=env[0][0],module_obj=env[env.length-1],globals_id=module_obj[0]
var listcomp_name='lc'+$ix
var $root=$B.py2js($py,globals_id,listcomp_name,locals_id,$B.line_info)
$root.caller=$B.line_info
var $js=$root.to_js()
try{eval($js)
var res=eval('$locals_'+listcomp_name+'["x"+$ix]')}
catch(err){throw $B.exception(err)}
finally{clear(listcomp_name)}
return res}
$B.$list_comp1=function(items){
var $ix=$B.UUID()
var $py="x"+$ix+"=[]\n",indent=0
for(var $i=1,_len_$i=items.length;$i < _len_$i;$i++){$py +=' '.repeat(indent)
$py +=items[$i]+':\n'
indent +=4}
$py +=' '.repeat(indent)
$py +='x'+$ix+'.append('+items[0]+')\n'
return[$py,$ix]}
$B.$dict_comp=function(env){
var $ix=$B.UUID()
var $res='res'+$ix
var $py=$res+"={}\n"
var indent=0
for(var $i=2,_len_$i=arguments.length;$i < _len_$i;$i++){$py+=' '.repeat(indent)
$py +=arguments[$i]+':\n'
indent +=4}
$py+=' '.repeat(indent)
$py +=$res+'.update({'+arguments[1].join('\n')+'})'
for(var i=0;i<env.length;i++){var sc_id='$locals_'+env[i][0].replace(/\./,'_')
eval('var '+sc_id+'=env[i][1]')}
var local_name=env[0][0]
var module_env=env[env.length-1]
var module_name=module_env[0]
var dictcomp_name='dc'+$ix
var $root=$B.py2js($py,module_name,dictcomp_name,local_name,$B.line_info)
$root.caller=$B.line_info
var $js=$root.to_js()
eval($js)
var res=eval('$locals_'+dictcomp_name+'["'+$res+'"]')
return res}
$B.$gen_expr=function(env){
var $ix=$B.UUID()
var $res='res'+$ix
var $py=$res+"=[]\n"
var indent=0
for(var $i=2,_len_$i=arguments.length;$i < _len_$i;$i++){$py+=' '.repeat(indent)
$py +=arguments[$i].join(' ')+':\n'
indent +=4}
$py+=' '.repeat(indent)
$py +=$res+'.append('+arguments[1].join('\n')+')'
for(var i=0;i<env.length;i++){var sc_id='$locals_'+env[i][0].replace(/\./g,'_')
eval('var '+sc_id+'=env[i][1]')}
var local_name=env[0][0]
var module_env=env[env.length-1]
var module_name=module_env[0]
var genexpr_name='ge'+$ix
var $root=$B.py2js($py,module_name,genexpr_name,local_name,$B.line_info)
var $js=$root.to_js()
eval($js)
var $res1=eval('$locals_ge'+$ix)["res"+$ix]
var $GenExprDict={__class__:$B.$type,__name__:'generator',toString:function(){return '(generator)'}}
$GenExprDict.__mro__=[$GenExprDict,_b_.object.$dict]
$GenExprDict.__iter__=function(self){return self}
$GenExprDict.__next__=function(self){self.$counter +=1
if(self.$counter==self.value.length){throw _b_.StopIteration('')}
return self.value[self.$counter]}
$GenExprDict.$factory={__class__:$B.$factory,$dict:$GenExprDict}
var $res2={value:$res1,__class__:$GenExprDict,$counter:-1}
$res2.toString=function(){return 'ge object'}
return $res2}
$B.$lambda=function(env,args,body){
var rand=$B.UUID()
var $res='lambda_'+$B.lambda_magic+'_'+rand
var $py='def '+$res+'('+args+'):\n'
$py +='    return '+body
for(var i=0;i<env.length;i++){var sc_id='$locals_'+env[i][0].replace(/\./g,'_')
eval('var '+sc_id+'=env[i][1]')}
var local_name=env[0][0]
var module_env=env[env.length-1]
var module_name=module_env[0]
var lambda_name='lambda'+rand
var $js=$B.py2js($py,module_name,lambda_name,local_name).to_js()
eval($js)
var $res=eval('$locals_'+lambda_name+'["'+$res+'"]')
$res.__module__=module_name
$res.__name__='<lambda>'
return $res}
$B.$search=function(name,global_ns){
var frame=$B.last($B.frames_stack)
if(frame[1][name]!==undefined){return frame[1][name]}
else if(frame[3][name]!==undefined){return frame[3][name]}
else if(_b_[name]!==undefined){return _b_[name]}
else{if(frame[0]==frame[2]){throw _b_.NameError(name)}
else{throw _b_.UnboundLocalError("local variable '"+name+
"' referenced before assignment")}}}
$B.$global_search=function(name){
var frame=$B.last($B.frames_stack)
if(frame[3][name]!==undefined){return frame[3][name]}
else{throw _b_.NameError(name)}}
$B.$local_search=function(name){
var frame=$B.last($B.frames_stack)
if(frame[1][name]!==undefined){return frame[1][name]}
else{throw _b_.UnboundLocalError("local variable '"+name+
"' referenced before assignment")}}
$B.$check_def=function(name,value){
if(value!==undefined){return value}
throw _b_.NameError(name)}
$B.$check_def_local=function(name,value){
if(value!==undefined){return value}
throw _b_.UnboundLocalError("local variable '"+name+
"' referenced before assignment")}
$B.$check_def_free=function(name,value){
if(value!==undefined){return value}
throw _b_.NameError("free variable '"+name+
"' referenced before assignment in enclosing scope")}
$B.$JS2Py=function(src){if(typeof src==='number'){if(src%1===0)return src
return _b_.float(src)}
if(src===null||src===undefined)return _b_.None
var klass=$B.get_class(src)
if(klass!==undefined){if(klass===_b_.list.$dict){for(var i=0,_len_i=src.length;i< _len_i;i++)src[i]=$B.$JS2Py(src[i])}else if(klass===$B.JSObject.$dict){src=src.js}else{return src}}
if(typeof src=="object"){if($B.$isNode(src))return $B.DOMNode(src)
if($B.$isEvent(src))return $B.DOMEvent(src)
if(src.constructor===Array||$B.$isNodeList(src)){var res=[],pos=0
for(var i=0,_len_i=src.length;i<_len_i;i++)res[pos++]=$B.$JS2Py(src[i])
return res}}
return $B.JSObject(src)}
$B.list_key=function(obj,key){key=$B.$GetInt(key)
if(key<0){key +=obj.length}
var res=obj[key]
if(res===undefined){throw _b_.IndexError("list index out of range")}
return res}
$B.list_slice=function(obj,start,stop){if(start===null){start=0}
else{start=$B.$GetInt(start)
if(start<0){start=Math.max(0,start+obj.length)}}
if(stop===null){return obj.slice(start)}
stop=$B.$GetInt(stop)
if(stop<0){stop=Math.max(0,stop+obj.length)}
return obj.slice(start,stop)}
$B.list_slice_step=function(obj,start,stop,step){if(step===null||step==1){return $B.list_slice(obj,start,stop)}
if(step==0){throw _b_.ValueError("slice step cannot be zero")}
step=$B.$GetInt(step)
if(start===null){start=step >=0 ? 0 : obj.length-1}
else{start=$B.$GetInt(start)
if(start<0){start=Math.min(0,start+obj.length)}}
if(stop===null){stop=step >=0 ? obj.length : -1}
else{stop=$B.$GetInt(stop)
if(stop<0){stop=Math.max(0,stop+obj.length)}}
var res=[],len=obj.length
if(step>0){for(var i=start;i<stop;i+=step){res.push(obj[i])}}else{for(var i=start;i>stop;i+=step){res.push(obj[i])}}
return res}
function index_error(obj){var type=typeof obj=='string' ? 'string' : 'list'
throw _b_.IndexError(type+" index out of range")}
$B.$getitem=function(obj,item){if(typeof item=='number'){if(Array.isArray(obj)||typeof obj=='string'){item=item >=0 ? item : obj.length+item
if(obj[item]!==undefined){return obj[item]}
else{index_error(obj)}}}
try{item=$B.$GetInt(item)}catch(err){}
if((Array.isArray(obj)||typeof obj=='string')
&& typeof item=='number'){item=item >=0 ? item : obj.length+item
if(obj[item]!==undefined){return obj[item]}
else{index_error(obj)}}
return _b_.getattr(obj,'__getitem__')(item)}
$B.set_list_key=function(obj,key,value){try{key=$B.$GetInt(key)}
catch(err){if(_b_.isinstance(key,_b_.slice)){var s=_b_.slice.$dict.$conv_for_seq(key,obj.length)
return $B.set_list_slice_step(obj,s.start,s.stop,s.step,value)}}
if(key<0){key+=obj.length}
if(obj[key]===undefined){console.log(obj,key)
throw _b_.IndexError('list assignment index out of range')}
obj[key]=value}
$B.set_list_slice=function(obj,start,stop,value){if(start===null){start=0}
else{start=$B.$GetInt(start)
if(start<0){start=Math.max(0,start+obj.length)}}
if(stop===null){stop=obj.length}
stop=$B.$GetInt(stop)
if(stop<0){stop=Math.max(0,stop+obj.length)}
var res=_b_.list(value)
obj.splice.apply(obj,[start,stop-start].concat(res))}
$B.set_list_slice_step=function(obj,start,stop,step,value){if(step===null||step==1){return $B.set_list_slice(obj,start,stop,value)}
if(step==0){throw _b_.ValueError("slice step cannot be zero")}
step=$B.$GetInt(step)
if(start===null){start=step>0 ? 0 : obj.length-1}
else{start=$B.$GetInt(start)
if(start<0){start=Math.min(0,start+obj.length)}}
if(stop===null){stop=step>0 ? obj.length : -1}
else{stop=$B.$GetInt(stop)
if(stop<0){stop=Math.max(0,stop+obj.length)}}
var repl=_b_.list(value),j=0,test,nb=0
if(step>0){test=function(i){return i<stop}}
else{test=function(i){return i>stop}}
for(var i=start;test(i);i+=step){nb++}
if(nb!=repl.length){throw _b_.ValueError('attempt to assign sequence of size '+
repl.length+' to extended slice of size '+nb)}
for(var i=start;test(i);i+=step){obj[i]=repl[j]
j++}}
$B.$setitem=function(obj,item,value){if(Array.isArray(obj)&& typeof item=='number' && !_b_.isinstance(obj,_b_.tuple)){if(item<0){item+=obj.length}
if(obj[item]===undefined){throw _b_.IndexError("list assignment index out of range")}
obj[item]=value
return}else if(obj.__class__===_b_.dict.$dict){obj.__class__.__setitem__(obj,item,value)
return}
_b_.getattr(obj,'__setitem__')(item,value)}
$B.augm_item_add=function(obj,item,incr){if(Array.isArray(obj)&& typeof item=="number" &&
obj[item]!==undefined){obj[item]+=incr
return}
var ga=_b_.getattr
try{var augm_func=ga(ga(obj,'__getitem__')(item),'__iadd__')
console.log('has augmfunc')}catch(err){ga(obj,'__setitem__')(item,ga(ga(obj,'__getitem__')(item),'__add__')(incr))
return}
augm_func(value)}
var augm_item_src=''+$B.augm_item_add
var augm_ops=[['-=','sub'],['*=','mul']]
for(var i=0,_len_i=augm_ops.length;i < _len_i;i++){var augm_code=augm_item_src.replace(/add/g,augm_ops[i][1])
augm_code=augm_code.replace(/\+=/g,augm_ops[i][0])
eval('$B.augm_item_'+augm_ops[i][1]+'='+augm_code)}
$B.$raise=function(){
var es=$B.current_exception
if(es!==undefined)throw es
throw _b_.RuntimeError('No active exception to reraise')}
$B.$syntax_err_line=function(exc,module,pos){
var pos2line={}
var lnum=1
var src=$B.$py_src[module]
if(src===undefined){console.log('no src for',module)}
var line_pos={1:0}
for(var i=0,_len_i=src.length;i < _len_i;i++){pos2line[i]=lnum
if(src.charAt(i)=='\n'){line_pos[++lnum]=i}}
var line_num=pos2line[pos]
exc.$line_info=line_num+','+module
var lines=src.split('\n')
var line=lines[line_num-1]
var lpos=pos-line_pos[line_num]
var len=line.length
line=line.replace(/^\s*/,'')
lpos-=len-line.length
exc.args=_b_.tuple([$B.$getitem(exc.args,0),module,line_num,lpos,line])}
$B.$SyntaxError=function(module,msg,pos){var exc=_b_.SyntaxError(msg)
$B.$syntax_err_line(exc,module,pos)
throw exc}
$B.$IndentationError=function(module,msg,pos){var exc=_b_.IndentationError(msg)
$B.$syntax_err_line(exc,module,pos)
throw exc}
$B.extend=function(fname,arg,mapping){var it=_b_.iter(mapping),getter=_b_.getattr(mapping,'__getitem__')
while(true){try{var key=_b_.next(it)
if(typeof key!=='string'){throw _b_.TypeError(fname+"() keywords must be strings")}
if(arg[key]!==undefined){throw _b_.TypeError(
fname+"() got multiple values for argument '"+key+"'")}
arg[key]=getter(key)}catch(err){if(_b_.isinstance(err,[_b_.StopIteration])){break}
throw err}}
return arg}
$B.extend_list=function(){
var res=Array.prototype.slice.call(arguments,0,arguments.length-1),last=$B.last(arguments)
var it=_b_.iter(last)
while(true){try{res.push(_b_.next(it))}catch(err){if(_b_.isinstance(err,[_b_.StopIteration])){break}
throw err}}
return res}
$B.$test_item=function(expr){
$B.$test_result=expr
return _b_.bool(expr)}
$B.$test_expr=function(){
return $B.$test_result}
$B.$is_member=function(item,_set){
var f,_iter
try{f=_b_.getattr(_set,"__contains__")}
catch(err){}
if(f)return f(item)
try{_iter=_b_.iter(_set)}
catch(err){}
if(_iter){while(1){try{var elt=_b_.next(_iter)
if(_b_.getattr(elt,"__eq__")(item))return true}catch(err){if(err.__name__=="StopIteration")return false
throw err}}}
try{f=_b_.getattr(_set,"__getitem__")}
catch(err){throw _b_.TypeError("'"+$B.get_class(_set).__name__+"' object is not iterable")}
if(f){var i=-1
while(1){i++
try{var elt=f(i)
if(_b_.getattr(elt,"__eq__")(item))return true}catch(err){if(err.__name__=='IndexError')return false
throw err}}}}
var $io={__class__:$B.$type,__name__:'io'}
$io.__mro__=[$io,_b_.object.$dict]
$B.stderr={__class__:$io,write:function(data){console.log(data)},flush:function(){}}
$B.stderr_buff='' 
$B.stdout={__class__:$io,write: function(data){console.log(data)},flush:function(){}}
$B.stdin={__class__: $io,__original__:true,closed: false,len:1,pos:0,read: function(){return '';},readline: function(){return '';}}
$B.jsobject2pyobject=function(obj){switch(obj){case null:
return _b_.None
case true:
return _b_.True
case false:
return _b_.False}
if(_b_.isinstance(obj,_b_.list)){var res=[],pos=0
for(var i=0,_len_i=obj.length;i < _len_i;i++){res[pos++]=$B.jsobject2pyobject(obj[i])}
return res}
if(obj.__class__!==undefined){if(obj.__class__===_b_.list){for(var i=0,_len_i=obj.length;i < _len_i;i++){obj[i]=$B.jsobject2pyobject(obj[i])}
return obj}
return obj}
if(obj._type_==='iter'){
return _b_.iter(obj.data)}
if(typeof obj==='object' && obj.__class__===undefined){
var res=_b_.dict()
var si=_b_.dict.$dict.__setitem__
for(var attr in obj){si(res,attr,$B.jsobject2pyobject(obj[attr]))}
return res}
return $B.JSObject(obj)}
$B.pyobject2jsobject=function(obj){
switch(obj){case _b_.None:
return null
case _b_.True:
return true
case _b_.False:
return false}
if(_b_.isinstance(obj,[_b_.int,_b_.float,_b_.str]))return obj
if(_b_.isinstance(obj,[_b_.list,_b_.tuple])){var res=[],pos=0
for(var i=0,_len_i=obj.length;i < _len_i;i++){res[pos++]=$B.pyobject2jsobject(obj[i])}
return res}
if(_b_.isinstance(obj,_b_.dict)){var res={}
var items=_b_.list(_b_.dict.$dict.items(obj))
for(var i=0,_len_i=items.length;i < _len_i;i++){res[$B.pyobject2jsobject(items[i][0])]=$B.pyobject2jsobject(items[i][1])}
return res}
if(_b_.hasattr(obj,'__iter__')){
var _a=[],pos=0
while(1){try{
_a[pos++]=$B.pyobject2jsobject(_b_.next(obj))}catch(err){if(err.__name__ !=="StopIteration")throw err
break}}
return{'_type_': 'iter',data: _a}}
if(_b_.hasattr(obj,'__getstate__')){return _b_.getattr(obj,'__getstate__')()}
if(_b_.hasattr(obj,'__dict__')){return $B.pyobject2jsobject(_b_.getattr(obj,'__dict__'))}
throw _b_.TypeError(_b_.str(obj)+' is not JSON serializable')}
$B.set_line=function(line_num,module_name){$B.line_info=line_num+','+module_name
return _b_.None}
$B.$iterator=function(items,klass){var res={__class__:klass,__iter__:function(){return res},__len__:function(){return items.length},__next__:function(){res.counter++
if(res.counter<items.length)return items[res.counter]
throw _b_.StopIteration("StopIteration")},__repr__:function(){return "<"+klass.__name__+" object>"},counter:-1}
res.__str__=res.toString=res.__repr__
return res}
$B.$iterator_class=function(name){var res={__class__:$B.$type,__name__:name,}
res.__mro__=[res,_b_.object.$dict]
function as_array(s){var _a=[],pos=0
var _it=_b_.iter(s)
while(1){try{
_a[pos++]=_b_.next(_it)}catch(err){if(err.__name__=='StopIteration'){break}}}
return _a}
function as_list(s){return _b_.list(as_array(s))}
function as_set(s){return _b_.set(as_array(s))}
res.__eq__=function(self,other){if(_b_.isinstance(other,[_b_.tuple,_b_.set,_b_.list])){return _b_.getattr(as_list(self),'__eq__')(other)}
if(_b_.hasattr(other,'__iter__')){return _b_.getattr(as_list(self),'__eq__')(as_list(other))}
_b_.NotImplementedError("__eq__ not implemented yet for list and " + _b_.type(other))}
var _ops=['eq','ne']
var _f=res.__eq__+''
for(var i=0;i < _ops.length;i++){var _op='__'+_ops[i]+'__'
eval('res.'+_op+'='+_f.replace(new RegExp('__eq__','g'),_op))}
res.__or__=function(self,other){if(_b_.isinstance(other,[_b_.tuple,_b_.set,_b_.list])){return _b_.getattr(as_set(self),'__or__')(other)}
if(_b_.hasattr(other,'__iter__')){return _b_.getattr(as_set(self),'__or__')(as_set(other))}
_b_.NotImplementedError("__or__ not implemented yet for set and " + _b_.type(other))}
var _ops=['sub','and','xor','gt','ge','lt','le']
var _f=res.__or__+''
for(var i=0;i < _ops.length;i++){var _op='__'+_ops[i]+'__'
eval('res.'+_op+'='+_f.replace(new RegExp('__or__','g'),_op))}
res.$factory={__class__:$B.$factory,$dict:res}
return res}
$B.$CodeDict={__class__:$B.$type,__name__:'code'}
$B.$CodeDict.__mro__=[$B.$CodeDict,_b_.object.$dict]
function _code(){}
_code.__class__=$B.$factory
_code.$dict=$B.$CodeDict
$B.$CodeDict.$factory=_code
function $err(op,klass,other){var msg="unsupported operand type(s) for "+op
msg +=": '"+klass.__name__+"' and '"+$B.get_class(other).__name__+"'"
throw _b_.TypeError(msg)}
var ropnames=['add','sub','mul','truediv','floordiv','mod','pow','lshift','rshift','and','xor','or']
var ropsigns=['+','-','*','/','//','%','**','<<','>>','&','^','|']
$B.make_rmethods=function(klass){for(var j=0,_len_j=ropnames.length;j < _len_j;j++){if(klass['__'+ropnames[j]+'__']===undefined){
klass['__'+ropnames[j]+'__']=(function(name,sign){return function(self,other){try{return _b_.getattr(other,'__r'+name+'__')(self)}
catch(err){$err(sign,klass,other)}}})(ropnames[j],ropsigns[j])}}}
$B.set_func_names=function(klass){var name=klass.__name__
for(var attr in klass){if(typeof klass[attr]=='function'){klass[attr].$infos={__name__ : name+'.'+attr}}}}
$B.UUID=function(){return $B.$py_UUID++}
$B.InjectBuiltins=function(){var _str=["var _b_=$B.builtins"],pos=1
for(var $b in $B.builtins)_str[pos++]='var ' + $b +'=_b_["'+$b+'"]'
return _str.join(';')}
$B.$GetInt=function(value){
if(typeof value=="number"||value.constructor===Number){return value}
else if(typeof value==="boolean"){return value ? 1 : 0}
else if(_b_.isinstance(value,_b_.int)){return value}
else if(_b_.isinstance(value,_b_.float)){return value.valueOf()}
try{var v=_b_.getattr(value,'__int__')();return v}catch(e){}
try{var v=_b_.getattr(value,'__index__')();return v}catch(e){}
throw _b_.TypeError("'"+$B.get_class(value).__name__+
"' object cannot be interpreted as an integer")}
$B.PyNumber_Index=function(item){switch(typeof item){case "boolean":
return item ? 1 : 0
case "number":
return item
case "object":
if(item.__class__===$B.LongInt.$dict){return item}
var method=_b_.getattr(item,'__index__',null)
if(method!==null){return $B.int_or_bool(_b_.getattr(method,'__call__')())}
default:
throw _b_.TypeError("'"+$B.get_class(item).__name__+
"' object cannot be interpreted as an integer")}}
$B.int_or_bool=function(v){switch(typeof v){case "boolean":
return v ? 1 : 0
case "number":
return v
case "object":
if(v.__class__===$B.LongInt.$dict){return v}
else{throw _b_.TypeError("'"+$B.get_class(v).__name__+
"' object cannot be interpreted as an integer")}
default:
throw _b_.TypeError("'"+$B.get_class(v).__name__+
"' object cannot be interpreted as an integer")}}
$B.int_value=function(v){
try{return $B.int_or_bool(v)}
catch(err){if(_b_.isinstance(v,_b_.complex)&& v.imag==0){return $B.int_or_bool(v.real)}else if(isinstance(v,_b_.float)&& v==Math.floor(v)){return Math.floor(v)}else{throw _b_.TypeError("'"+$B.get_class(v).__name__+
"' object cannot be interpreted as an integer")}}}
$B.enter_frame=function(frame){
if($B.frames_stack===undefined){alert('frames stack udef')}
$B.frames_stack[$B.frames_stack.length]=frame}
$B.leave_frame=function(arg){
if($B.frames_stack.length==0){console.log('empty stack');return}
var last=$B.last($B.frames_stack)
if(last[0]!=arg){
console.log('leave error','leaving',arg,'last on stack',last[0])}
$B.frames_stack.pop()}
var min_int=Math.pow(-2,53),max_int=Math.pow(2,53)-1
$B.is_safe_int=function(){for(var i=0;i<arguments.length;i++){var arg=arguments[i]
if(arg<min_int ||arg>max_int){return false}}
return true}
$B.add=function(x,y){var z=x+y
if(x>min_int && x<max_int && y>min_int && y<max_int
&& z>min_int && z<max_int){return z}
else if((typeof x=='number' ||x.__class__===$B.LongInt.$dict)
&&(typeof y=='number' ||y.__class__===$B.LongInt.$dict)){if((typeof x=='number' && isNaN(x))||
(typeof y=='number' && isNaN(y))){return _b_.float('nan')}
var res=$B.LongInt.$dict.__add__($B.LongInt(x),$B.LongInt(y))
return res}else{return z}}
$B.div=function(x,y){var z=x/y
if(x>min_int && x<max_int && y>min_int && y<max_int
&& z>min_int && z<max_int){return z}
else{return $B.LongInt.$dict.__truediv__($B.LongInt(x),$B.LongInt(y))}}
$B.eq=function(x,y){if(x>min_int && x<max_int && y>min_int && y<max_int){return x==y}
return $B.LongInt.$dict.__eq__($B.LongInt(x),$B.LongInt(y))}
$B.floordiv=function(x,y){var z=x/y
if(x>min_int && x<max_int && y>min_int && y<max_int
&& z>min_int && z<max_int){return Math.floor(z)}
else{return $B.LongInt.$dict.__floordiv__($B.LongInt(x),$B.LongInt(y))}}
$B.mul=function(x,y){var z=x*y
if(x>min_int && x<max_int && y>min_int && y<max_int
&& z>min_int && z<max_int){return z}
else if((typeof x=='number' ||x.__class__===$B.LongInt.$dict)
&&(typeof y=='number' ||y.__class__===$B.LongInt.$dict)){if((typeof x=='number' && isNaN(x))||
(typeof y=='number' && isNaN(y))){return _b_.float('nan')}
return $B.LongInt.$dict.__mul__($B.LongInt(x),$B.LongInt(y))}else{return z}}
$B.sub=function(x,y){var z=x-y
if(x>min_int && x<max_int && y>min_int && y<max_int
&& z>min_int && z<max_int){return z}
else if((typeof x=='number' ||x.__class__===$B.LongInt.$dict)
&&(typeof y=='number' ||y.__class__===$B.LongInt.$dict)){if((typeof x=='number' && isNaN(x))||
(typeof y=='number' && isNaN(y))){return _b_.float('nan')}
return $B.LongInt.$dict.__sub__($B.LongInt(x),$B.LongInt(y))}else{return z}}
$B.ge=function(x,y){if(typeof x=='number' && typeof y=='number'){return x>=y}
else if(typeof x=='number' && typeof y!='number'){return !y.pos}
else if(typeof x !='number' && typeof y=='number'){return x.pos===true}
else{return $B.LongInt.$dict.__ge__(x,y)}}
$B.gt=function(x,y){if(typeof x=='number' && typeof y=='number'){return x>y}
else if(typeof x=='number' && typeof y!='number'){return !y.pos}
else if(typeof x !='number' && typeof y=='number'){return x.pos===true}
else{return $B.LongInt.$dict.__gt__(x,y)}}
window.is_none=function(o){return o===undefined ||o==_b_.None;}
window.is_none=function(o){return o===undefined ||o==_b_.None;}})(__BRYTHON__)
if(!Array.indexOf){Array.prototype.indexOf=function(obj){for(var i=0,_len_i=this.length;i < _len_i;i++)if(this[i]==obj)return i
return -1}}
if(!String.prototype.repeat){String.prototype.repeat=function(count){if(count < 1)return '';
var result='',pattern=this.valueOf()
while(count > 1){if(count & 1)result +=pattern
count >>=1,pattern +=pattern}
return result + pattern;}}

;(function($B){eval($B.InjectBuiltins())
_b_.__debug__=false
var $ObjectDict=_b_.object.$dict
$B.$comps={'>':'gt','>=':'ge','<':'lt','<=':'le'}
$B.$inv_comps={'>': 'le','>=': 'lt','<': 'ge','<=': 'gt'}
function abs(obj){if(isinstance(obj,_b_.int))return _b_.int(Math.abs(obj));
if(isinstance(obj,_b_.float))return _b_.float(Math.abs(obj));
if(hasattr(obj,'__abs__')){return getattr(obj,'__abs__')()};
throw _b_.TypeError("Bad operand type for abs(): '"+$B.get_class(obj)+"'")}
function all(obj){var iterable=iter(obj)
while(1){try{var elt=next(iterable)
if(!bool(elt))return false}catch(err){return true}}}
function any(obj){var iterable=iter(obj)
while(1){try{var elt=next(iterable)
if(bool(elt))return true}catch(err){return false}}}
function ascii(obj){var res=repr(obj),res1='',cp
for(var i=0;i<res.length;i++){cp=res.charCodeAt(i)
if(cp<128){res1 +=res.charAt(i)}
else if(cp<256){res1 +='\\x'+cp.toString(16)}
else{res1 +='\\u'+cp.toString(16)}}
return res1}
function $builtin_base_convert_helper(obj,base){var prefix="";
switch(base){case 2:
prefix='0b';break;
case 8:
prefix='0o';break;
case 16:
prefix='0x';break;
default:
console.log('invalid base:' + base)}
if(obj.__class__===$B.LongInt.$dict){if(obj.pos)return prefix + $B.LongInt.$dict.to_base(obj,base)
return '-' + prefix + $B.LongInt.$dict.to_base(-obj,base)}
var value=$B.$GetInt(obj)
if(value===undefined){
throw _b_.TypeError('Error, argument must be an integer or contains an __index__ function')}
if(value >=0)return prefix + value.toString(base);
return '-' + prefix +(-value).toString(base);}
function bin(obj){if(isinstance(obj,_b_.int)){return $builtin_base_convert_helper(obj,2)}
return getattr(obj,'__index__')()}
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
catch(err){try{return getattr(obj,'__len__')()>0}
catch(err){return true}}}}
function callable(obj){return hasattr(obj,'__call__')}
function chr(i){if(i < 0 ||i > 1114111)_b_.ValueError('Outside valid range')
return String.fromCharCode(i)}
function classmethod(func){func.$type='classmethod'
return func}
classmethod.__class__=$B.$factory
classmethod.$dict={__class__:$B.$type,__name__:'classmethod',$factory: classmethod}
classmethod.$dict.__mro__=[classmethod.$dict,$ObjectDict]
$B.$CodeObjectDict={__class__:$B.$type,__name__:'code',__repr__:function(self){return '<code object '+self.name+', file '+self.filename+'>'},}
$B.$CodeObjectDict.__str__=$B.$CodeObjectDict.__repr__
$B.$CodeObjectDict.__mro__=[$B.$CodeObjectDict,$ObjectDict]
function compile(source,filename,mode){var $=$B.args('compile',6,{source:null,filename:null,mode:null,flags:null,dont_inherit:null,optimize:null},['source','filename','mode','flags','dont_inherit','optimize'],arguments,{flags:0,dont_inherit:false,optimize:-1},null,null)
var module_name='exec_' + $B.UUID()
var local_name=module_name;
var root=$B.py2js(source,module_name,[module_name],local_name)
$.__class__=$B.$CodeObjectDict
return $}
compile.__class__=$B.factory
$B.$CodeObjectDict.$factory=compile
compile.$dict=$B.$CodeObjectDict
var __debug__=$B.debug>0
function delattr(obj,attr){
var klass=$B.get_class(obj)
var res=obj[attr]
if(res===undefined){var mro=klass.__mro__
for(var i=0;i<mro.length;i++){var res=mro[i][attr]
if(res!==undefined){break}}}
if(res!==undefined && res.__delete__!==undefined){res.__delete__(res,obj,attr)}else{getattr(obj,'__delattr__')(attr)}
return None}
function dir(obj){if(obj===undefined){
var frame=$B.last($B.frames_stack),globals_obj=frame[3],res=_b_.list(),pos=0
for(var attr in globals_obj){if(attr.charAt(0)=='$' && attr.charAt(1)!='$'){
continue}
res[pos++]=attr}
_b_.list.$dict.sort(res)
return res}
var klass=$B.get_class(obj)
if(klass && klass.is_class){obj=obj.$dict}
else{
try{
var res=getattr(obj,'__dir__')()
res=_b_.list(res)
res.sort()
return res}catch(err){}}
var res=[],pos=0
for(var attr in obj){if(attr.charAt(0)!=='$' && attr!=='__class__'){res[pos++]=attr}}
res.sort()
return res}
function divmod(x,y){var klass=$B.get_class(x)
return _b_.tuple([getattr(klass,'__floordiv__')(x,y),getattr(klass,'__mod__')(x,y)])}
var $EnumerateDict={__class__:$B.$type,__name__:'enumerate'}
$EnumerateDict.__mro__=[$EnumerateDict,$ObjectDict]
function enumerate(){var $ns=$B.args("enumerate",2,{iterable:null,start:null},['iterable','start'],arguments,{start:0},null,null)
var _iter=iter($ns["iterable"])
var _start=$ns["start"]
var res={__class__:$EnumerateDict,__getattr__:function(attr){return res[attr]},__iter__:function(){return res},__name__:'enumerate iterator',__next__:function(){res.counter++
return _b_.tuple([res.counter,next(_iter)])},__repr__:function(){return "<enumerate object>"},__str__:function(){return "<enumerate object>"},counter:_start-1}
for(var attr in res){if(typeof res[attr]==='function' && attr!=="__class__"){res[attr].__str__=(function(x){return function(){return "<method wrapper '"+x+"' of enumerate object>"}})(attr)}}
return res}
enumerate.__class__=$B.$factory
enumerate.$dict=$EnumerateDict
$EnumerateDict.$factory=enumerate
function $eval(src,_globals,_locals){var current_frame=$B.frames_stack[$B.frames_stack.length-1]
if(current_frame!==undefined){var current_locals_id=current_frame[0].replace(/\./,'_'),current_globals_id=current_frame[2].replace(/\./,'_')}
var is_exec=arguments[3]=='exec',leave=false
if(src.__class__===$B.$CodeObjectDict){src=src.source}
var globals_id='$exec_'+$B.UUID(),locals_id,parent_block_id
if(_locals===_globals ||_locals===undefined){locals_id=globals_id}else{locals_id='$exec_'+$B.UUID()}
eval('var $locals_'+globals_id+' = {}')
eval('var $locals_'+locals_id+' = {}')
if(_globals===undefined){for(var attr in current_frame[3]){eval('$locals_'+globals_id+'["'+attr+
'"] = current_frame[3]["'+attr+'"]')}
parent_block_id=current_globals_id
eval('var $locals_'+current_globals_id+'=current_frame[3]')}else{$B.bound[globals_id]={}
var items=_b_.dict.$dict.items(_globals),item
while(1){try{var item=next(items)
eval('$locals_'+globals_id+'["'+item[0]+'"] = item[1]')
$B.bound[globals_id][item[0]]=true}catch(err){break}}
parent_block_id='__builtins__'}
if(_locals===undefined){if(_globals!==undefined){eval('var $locals_'+locals_id+' = $locals_'+globals_id)}else{for(var attr in current_frame[1]){eval('$locals_'+locals_id+'["'+attr+
'"] = current_frame[1]["'+attr+'"]')}}}else{var items=_b_.dict.$dict.items(_locals),item
while(1){try{var item=next(items)
eval('$locals_'+locals_id+'["'+item[0]+'"] = item[1]')}catch(err){break}}}
var root=$B.py2js(src,globals_id,locals_id,parent_block_id),leave_frame=true
try{
if(!is_exec){var try_node=root.children[root.children.length-2],instr=$B.last(try_node.children)
var type=instr.C.tree[0].type
if(!('expr'==type ||'list_or_tuple'==type ||'op'==type)){leave_frame=false
throw _b_.SyntaxError("eval() argument must be an expression",'<string>',1,1,src)}else{
var children=try_node.children
root.children.splice(root.children.length-2,2)
for(var i=0;i<children.length;i++){root.add(children[i])}}}
var js=root.to_js()
if($B.async_enabled)js=$B.execution_object.source_conversion(js)
var res=eval(js)
var gns=eval('$locals_'+globals_id)
if(_locals!==undefined){var lns=eval('$locals_'+locals_id)
var setitem=getattr(_locals,'__setitem__')
for(var attr in lns){setitem(attr,lns[attr])}}else{for(var attr in lns){current_frame[1][attr]=lns[attr]}}
if(_globals!==undefined){
var setitem=getattr(_globals,'__setitem__')
for(var attr in gns){setitem(attr,gns[attr])}}else{for(var attr in gns){current_frame[3][attr]=gns[attr]}}
if(res===undefined)return _b_.None
return res}catch(err){if(err.$py_error===undefined){throw $B.exception(err)}
throw err}finally{if(!is_exec && leave_frame){
$B.leave_frame(locals_id)}}}
$eval.$is_func=true
function exec(src,globals,locals){return $eval(src,globals,locals,'exec')||_b_.None}
exec.$is_func=true
var $FilterDict={__class__:$B.$type,__name__:'filter'}
$FilterDict.__iter__=function(self){return self}
$FilterDict.__repr__=$FilterDict.__str__=function(){return "<filter object>"},$FilterDict.__mro__=[$FilterDict,$ObjectDict]
function filter(){if(arguments.length!=2){throw _b_.TypeError(
"filter expected 2 arguments, got "+arguments.length)}
var func=arguments[0],iterable=iter(arguments[1])
if(func===_b_.None)func=bool
var __next__=function(){while(true){var _item=next(iterable)
if(func(_item)){return _item}}}
return{
__class__: $FilterDict,__next__: __next__}}
function format(value,format_spec){if(hasattr(value,'__format__'))return getattr(value,'__format__')(format_spec)
throw _b_.NotImplementedError("__format__ is not implemented for object '" + _b_.str(value)+ "'")}
function attr_error(attr,cname){var msg="bad operand type for unary #: '"+cname+"'"
switch(attr){case '__neg__':
throw _b_.TypeError(msg.replace('#','-'))
case '__pos__':
throw _b_.TypeError(msg.replace('#','+'))
case '__invert__':
throw _b_.TypeError(msg.replace('#','~'))
case '__call__':
throw _b_.TypeError("'"+cname+"'"+' object is not callable')
default:
throw _b_.AttributeError("'"+cname+"' object has no attribute '"+attr+"'")}}
function getattr(obj,attr,_default){var klass=$B.get_class(obj)
if(klass===undefined){
if(obj[attr]!==undefined)return $B.$JS2Py(obj[attr])
if(_default!==undefined)return _default
throw _b_.AttributeError('object has no attribute '+attr)}
switch(attr){case '__call__':
if(typeof obj=='function'){if(obj.$blocking){console.log('calling blocking function '+obj.__name__)}
return obj}else if(klass===$B.JSObject.$dict && typeof obj.js=='function'){return function(){return $B.JSObject(obj.js.apply(null,arguments))}}
break
case '__class__':
return klass.$factory
case '__dict__':
return $B.obj_dict(obj)
case '__doc__':
for(var i=0;i<builtin_names.length;i++){if(obj===_b_[builtin_names[i]]){_get_builtins_doc()
return $B.builtins_doc[builtin_names[i]]}}
break
case '__mro__':
if(klass===$B.$factory){
var res=[],pos=0
for(var i=0;i<obj.$dict.__mro__.length;i++){res[pos++]=obj.$dict.__mro__[i].$factory}
return res}
break
case '__subclasses__':
if(klass===$B.$factory){var subclasses=obj.$dict.$subclasses ||[]
return function(){return subclasses}}
break}
if(typeof obj=='function'){if(attr !==undefined && obj[attr]!==undefined){if(attr=='__module__'){
return obj[attr]}}}
if(klass.$native){if(klass[attr]===undefined){var object_attr=_b_.object.$dict[attr]
if(object_attr!==undefined){klass[attr]=object_attr}
else{if(_default===undefined){attr_error(attr,klass.__name__)}
return _default}}
if(klass.descriptors && klass.descriptors[attr]!==undefined){return klass[attr](obj)}
if(typeof klass[attr]=='function'){
if(attr=='__new__')return klass[attr].apply(null,arguments)
var method=function(){var args=[obj],pos=1
for(var i=0;i<arguments.length;i++){args[pos++]=arguments[i]}
return klass[attr].apply(null,args)}
method.__class__=$B.$MethodDict
method.$infos={__class__: klass.$factory,__func__ : klass[attr],__name__ : attr,__self__ : obj}
method.__str__=method.__repr__=function(){return '<built-in method '+attr+' of '+klass.__name__+' object>'}
return method}
return klass[attr]}
var is_class=klass.is_class,mro,attr_func
if(is_class){attr_func=$B.$type.__getattribute__
if(obj.$dict===undefined){console.log('obj '+obj+' $dict undefined')}
obj=obj.$dict}else{var mro=klass.__mro__
if(mro===undefined){console.log('in getattr '+attr+' mro undefined for '+obj+' dir '+dir(obj)+' class '+obj.__class__)
for(var _attr in obj){console.log('obj attr '+_attr+' : '+obj[_attr])}
console.log('obj class '+dir(klass)+' str '+klass)}
for(var i=0;i<mro.length;i++){attr_func=mro[i]['__getattribute__']
if(attr_func!==undefined){break}}}
if(typeof attr_func!=='function'){console.log(attr+' is not a function '+attr_func)}
try{var res=attr_func(obj,attr)}
catch(err){if(_default!==undefined)return _default
throw err}
if(res!==undefined){return res}
if(_default !==undefined)return _default
var cname=klass.__name__
if(is_class)cname=obj.__name__
attr_error(attr,cname)}
function globals(){
return $B.obj_dict($B.last($B.frames_stack)[3])}
function hasattr(obj,attr){try{getattr(obj,attr);return true}
catch(err){return false}}
function hash(obj){if(arguments.length!=1){throw _b_.TypeError("hash() takes exactly one argument ("+
arguments.length+" given)")}
if(obj===undefined)console.log('hash:obj is undefined',obj)
if(obj.__hashvalue__ !==undefined)return obj.__hashvalue__
if(isinstance(obj,_b_.int))return obj.valueOf()
if(isinstance(obj,bool))return _b_.int(obj)
if(obj.__hash__ !==undefined){return obj.__hashvalue__=obj.__hash__()}
var hashfunc=getattr(obj,'__hash__',_b_.None)
if(hashfunc==_b_.None)return $B.$py_next_hash--
if(hashfunc.$infos===undefined){return obj.__hashvalue__=hashfunc()}
if(hashfunc.$infos.__func__===_b_.object.$dict.__hash__){if(getattr(obj,'__eq__').$infos.__func__!==_b_.object.$dict.__eq__){throw _b_.TypeError("unhashable type: '"+
$B.get_class(obj).__name__+"'")}else{return $B.$py_next_hash--}}else{return obj.__hashvalue__=hashfunc()}}
function _get_builtins_doc(){if($B.builtins_doc===undefined){
var url=$B.brython_path
if(url.charAt(url.length-1)=='/'){url=url.substr(0,url.length-1)}
url +='/builtins_docstrings.js'
var f=_b_.open(url)
eval(f.$content)
$B.builtins_doc=docs}}
function help(obj){if(obj===undefined)obj='help'
if(typeof obj=='string' && _b_[obj]!==undefined){_get_builtins_doc()
var _doc=$B.builtins_doc[obj]
if(_doc !==undefined && _doc !=''){_b_.print(_doc)
return}}
for(var i=0;i<builtin_names.length;i++){if(obj===_b_[builtin_names[i]]){_get_builtins_doc()
_b_.print(_doc=$B.builtins_doc[builtin_names[i]])}}
if(typeof obj=='string'){$B.$import("pydoc");
var pydoc=$B.imported["pydoc"]
getattr(getattr(pydoc,"help"),"__call__")(obj)
return}
try{return getattr(obj,'__doc__')}
catch(err){console.log('help err '+err);return ''}}
function hex(x){return $builtin_base_convert_helper(x,16)}
function id(obj){if(isinstance(obj,[_b_.str,_b_.int,_b_.float])){return getattr(_b_.str(obj),'__hash__')()}else if(obj.$id!==undefined){return obj.$id}
else{return obj.$id=$B.UUID()}}
function __import__(mod_name,globals,locals,fromlist,level){
var $=$B.args('__import__',5,{name:null,globals:null,locals:null,fromlist:null,level:null},['name','globals','locals','fromlist','level'],arguments,{globals:None,locals:None,fromlist:_b_.tuple(),level:0},null,null)
return $B.$__import__($.name,$.globals,$.locals,$.fromlist);}
function input(src){var stdin=($B.imported.sys && $B.imported.sys.stdin ||$B.stdin);
if(stdin.__original__){return prompt(src);}
var val=_b_.getattr(stdin,'readline')();
val=val.split('\n')[0];
if(stdin.len===stdin.pos){_b_.getattr(stdin,'close')();}
return val;}
function isinstance(obj,arg){if(obj===null)return arg===None
if(obj===undefined)return false
if(arg.constructor===Array){for(var i=0;i<arg.length;i++){if(isinstance(obj,arg[i]))return true}
return false}
if(arg===_b_.int &&(obj===True ||obj===False)){return True}
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
default:
return false}}
if(arg.$dict===undefined){return false}
if(klass==$B.$factory){klass=obj.$dict.__class__}
for(var i=0;i<klass.__mro__.length;i++){var kl=klass.__mro__[i]
if(kl===arg.$dict){return true}
else if(arg===_b_.str && 
kl===$B.$StringSubclassFactory.$dict){return true}
else if(arg===_b_.list && 
kl===$B.$ListSubclassFactory.$dict){return true}}
var hook=getattr(arg,'__instancecheck__',null)
if(hook!==null){return hook(obj)}
return false}
function issubclass(klass,classinfo){if(arguments.length!==2){throw _b_.TypeError("issubclass expected 2 arguments, got "+arguments.length)}
if(!klass.__class__ ||klass.__class__!==$B.$factory){throw _b_.TypeError("issubclass() arg 1 must be a class")}
if(isinstance(classinfo,_b_.tuple)){for(var i=0;i<classinfo.length;i++){if(issubclass(klass,classinfo[i]))return true}
return false}
if(classinfo.__class__.is_class){if(klass.$dict.__mro__.indexOf(classinfo.$dict)>-1){return true}}
var hook=getattr(classinfo,'__subclasscheck__',null)
if(hook!==null){return hook(klass)}
return false}
var iterator_class=$B.make_class({name:'iterator',init:function(self,getitem,len){self.getitem=getitem
self.len=len
self.counter=-1}})
iterator_class.$dict.__next__=function(self){self.counter++
if(self.len!==null && self.counter==self.len){throw _b_.StopIteration('')}
try{return self.getitem(self.counter)}
catch(err){throw _b_.StopIteration('')}}
function iter(obj){try{var _iter=getattr(obj,'__iter__')}
catch(err){var gi=getattr(obj,'__getitem__',null),ln=getattr(obj,'__len__',null)
if(gi!==null){if(ln!==null){var len=getattr(ln,'__call__')()
return iterator_class(gi,len)}else{return iterator_class(gi,null)}}
throw _b_.TypeError("'"+$B.get_class(obj).__name__+"' object is not iterable")}
var res=_iter()
try{getattr(res,'__next__')}
catch(err){if(isinstance(err,_b_.AttributeError)){throw _b_.TypeError(
"iter() returned non-iterator of type '"+
$B.get_class(res).__name__+"'")}}
return res}
function len(obj){try{return getattr(obj,'__len__')()}
catch(err){throw _b_.TypeError("object of type '"+$B.get_class(obj).__name__+
"' has no len()")}}
function locals(){
var locals_obj=$B.last($B.frames_stack)[1]
return $B.obj_dict(locals_obj)}
var $MapDict={__class__:$B.$type,__name__:'map'}
$MapDict.__mro__=[$MapDict,$ObjectDict]
$MapDict.__iter__=function(self){return self}
function map(){var func=getattr(arguments[0],'__call__')
var iter_args=[],pos=0
for(var i=1;i<arguments.length;i++){iter_args[pos++]=iter(arguments[i])}
var __next__=function(){var args=[],pos=0
for(var i=0;i<iter_args.length;i++){args[pos++]=next(iter_args[i])}
return func.apply(null,args)}
var obj={__class__:$MapDict,__repr__:function(){return "<map object>"},__str__:function(){return "<map object>"},__next__: __next__}
return obj}
function $extreme(args,op){
var $op_name='min'
if(op==='__gt__')$op_name="max"
if(args.length==0){throw _b_.TypeError($op_name+" expected 1 arguments, got 0")}
var last_arg=args[args.length-1]
var nb_args=args.length
var has_kw_args=false
var has_default=false
var func=false
if(last_arg.$nat=='kw'){nb_args--
last_arg=last_arg.kw
for(var attr in last_arg){switch(attr){case 'key':
var func=last_arg[attr]
has_key=true
break
case '$$default': 
var default_value=last_arg[attr]
has_default=true
break
default:
throw _b_.TypeError("'"+attr+"' is an invalid keyword argument for this function")
break}}}
if(!func){func=function(x){return x}}
if(nb_args==0){throw _b_.TypeError($op_name+" expected 1 arguments, got 0")}else if(nb_args==1){
var $iter=iter(args[0]),res=null
while(true){try{var x=next($iter)
if(res===null ||bool(getattr(func(x),op)(func(res)))){res=x}}catch(err){if(err.__name__=="StopIteration"){if(res===null){if(has_default){return default_value}
else{throw _b_.ValueError($op_name+"() arg is an empty sequence")}}else{return res}}
throw err}}}else{if(has_default){throw _b_.TypeError("Cannot specify a default for "+$op_name+"() with multiple positional arguments")}
var res=null
for(var i=0;i<nb_args;i++){var x=args[i]
if(res===null ||bool(getattr(func(x),op)(func(res)))){res=x}}
return res}}
function max(){var args=[],pos=0
for(var i=0;i<arguments.length;i++){args[pos++]=arguments[i]}
return $extreme(args,'__gt__')}
function memoryview(obj){throw NotImplementedError('memoryview is not implemented')}
function min(){var args=[],pos=0
for(var i=0;i<arguments.length;i++){args[pos++]=arguments[i]}
return $extreme(args,'__lt__')}
function next(obj){var ga=getattr(obj,'__next__')
if(ga!==undefined)return ga()
throw _b_.TypeError("'"+$B.get_class(obj).__name__+
"' object is not an iterator")}
function _NotImplemented(){return{__class__:_NotImplemented.$dict}}
_NotImplemented.__class__=$B.$factory
_NotImplemented.$dict={$factory: _NotImplemented,__class__: $B.$type,__name__: 'NotImplementedType'}
_NotImplemented.$dict.__mro__=[_NotImplemented.$dict,$ObjectDict]
var NotImplemented={__class__ : _NotImplemented.$dict,__str__: function(){return 'NotImplemented'}}
function $not(obj){return !bool(obj)}
function oct(x){return $builtin_base_convert_helper(x,8)}
function ord(c){
switch($B.get_class(c)){case _b_.str.$dict:
if(c.length==1)return c.charCodeAt(0)
throw _b_.TypeError('ord() expected a character, but string of length ' + 
c.length + ' found')
case _b_.bytes.$dict:
case _b_.bytearray.$dict:
if(c.source.length==1)return c.source[0]
throw _b_.TypeError('ord() expected a character, but string of length ' + 
c.source.length + ' found')
default:
throw _b_.TypeError('ord() expected a character, but ' + 
$B.get_class(c).__name__ + ' was found')}}
function pow(){var $ns=$B.args('pow',3,{x:null,y:null,z:null},['x','y','z'],arguments,{z:null},null,null)
var x=$ns['x'],y=$ns['y'],z=$ns['z']
var res=getattr(x,'__pow__')(y)
if(z===null){return res}
else{if(!isinstance(x,_b_.int)||!isinstance(y,_b_.int)){throw _b_.TypeError("pow() 3rd argument not allowed unless "+
"all arguments are integers")}
return getattr(res,'__mod__')(z)}}
function $print(){var $ns=$B.args('print',0,{},[],arguments,{},'args','kw')
var ks=$ns['kw'].$string_dict
var end=ks['end']===undefined ? '\n' : ks['end'],sep=ks['sep']===undefined ? ' ' : ks['sep'],file=ks['file']===undefined ? $B.stdout : ks['file'],args=$ns['args']
getattr(file,'write')(args.map(_b_.str).join(sep)+end)
return None}
$print.__name__='print'
$print.is_func=true
var $PropertyDict={__class__ : $B.$type,__name__ : 'property',}
$PropertyDict.__mro__=[$PropertyDict,$ObjectDict]
$B.$PropertyDict=$PropertyDict
function property(fget,fset,fdel,doc){var p={__class__ : $PropertyDict,__doc__ : doc ||"",$type:fget.$type,fget:fget,fset:fset,fdel:fdel,toString:function(){return '<property>'}}
p.__get__=function(self,obj,objtype){if(obj===undefined)return self
if(self.fget===undefined)throw _b_.AttributeError("unreadable attribute")
return getattr(self.fget,'__call__')(obj)}
if(fset!==undefined){p.__set__=function(self,obj,value){if(self.fset===undefined)throw _b_.AttributeError("can't set attribute")
getattr(self.fset,'__call__')(obj,value)}}
p.__delete__=fdel;
p.getter=function(fget){return property(fget,p.fset,p.fdel,p.__doc__)}
p.setter=function(fset){return property(p.fget,fset,p.fdel,p.__doc__)}
p.deleter=function(fdel){return property(p.fget,p.fset,fdel,p.__doc__)}
return p}
property.__class__=$B.$factory
property.$dict=$PropertyDict
$PropertyDict.$factory=property
function repr(obj){if(obj.__class__===$B.$factory){
var func=$B.$type.__getattribute__(obj.$dict.__class__,'__repr__')
return func(obj)}
var func=getattr(obj,'__repr__')
if(func!==undefined){return func()}
throw _b_.AttributeError("object has no attribute __repr__")}
var $ReversedDict={__class__:$B.$type,__name__:'reversed'}
$ReversedDict.__mro__=[$ReversedDict,$ObjectDict]
$ReversedDict.__iter__=function(self){return self}
$ReversedDict.__next__=function(self){self.$counter--
if(self.$counter<0)throw _b_.StopIteration('')
return self.getter(self.$counter)}
function reversed(seq){
try{return getattr(seq,'__reversed__')()}
catch(err){if(err.__name__!='AttributeError'){throw err}}
try{var res={__class__:$ReversedDict,$counter : getattr(seq,'__len__')(),getter:getattr(seq,'__getitem__')}
return res}catch(err){throw _b_.TypeError("argument to reversed() must be a sequence")}}
reversed.__class__=$B.$factory
reversed.$dict=$ReversedDict
$ReversedDict.$factory=reversed
function round(arg,n){if(!isinstance(arg,[_b_.int,_b_.float])){throw _b_.TypeError("type "+arg.__class__+" doesn't define __round__ method")}
if(isinstance(arg,_b_.float)&&(arg.value===Infinity ||arg.value===-Infinity)){throw _b_.OverflowError("cannot convert float infinity to integer")}
if(n===undefined)return _b_.int(Math.round(arg))
if(!isinstance(n,_b_.int)){throw _b_.TypeError(
"'"+n.__class__+"' object cannot be interpreted as an integer")}
var mult=Math.pow(10,n)
return _b_.int.$dict.__truediv__(Number(Math.round(arg.valueOf()*mult)),mult)}
function setattr(obj,attr,value){if(!isinstance(attr,_b_.str)){throw _b_.TypeError("setattr(): attribute name must be string")}
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
break
case '__class__':
obj.__class__=value.$dict;return None
break}
if(obj.__class__===$B.$factory){
if(obj.$dict.$methods && typeof value=='function' 
&& value.__class__!==$B.$factory){
obj.$dict.$methods[attr]=$B.make_method(attr,obj.$dict,value,value)
return None}else{obj.$dict[attr]=value;return None}}
var res=obj[attr],klass=$B.get_class(obj)
if(res===undefined && klass){var mro=klass.__mro__,_len=mro.length
for(var i=0;i<_len;i++){res=mro[i][attr]
if(res!==undefined)break}}
if(res!==undefined){
if(res.__set__!==undefined){res.__set__(res,obj,value);return None}
var __set__=getattr(res,'__set__',null)
if(__set__ &&(typeof __set__=='function')){__set__.apply(res,[obj,value]);return None}}
if(klass && klass.$slots && klass.$slots[attr]===undefined){throw _b_.AttributeError("'"+klass.__name__+"' object has no attribute'"+
attr+"'")}
var setattr=false
if(klass!==undefined){for(var i=0,_len=klass.__mro__.length;i<_len;i++){setattr=klass.__mro__[i].__setattr__
if(setattr){break}}}
if(!setattr){obj[attr]=value}else{setattr(obj,attr,value)}
return None}
function sorted(){var $=$B.args('sorted',1,{iterable:null},['iterable'],arguments,{},null,'kw')
var _list=_b_.list(iter($.iterable)),args=[_list]
for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
_b_.list.$dict.sort.apply(null,args)
return _list}
var $StaticmethodDict={__class__:$B.$type,__name__:'staticmethod'}
$StaticmethodDict.__mro__=[$StaticmethodDict,$ObjectDict]
function staticmethod(func){func.$type='staticmethod'
return func}
staticmethod.__class__=$B.$factory
staticmethod.$dict=$StaticmethodDict
$StaticmethodDict.$factory=staticmethod
function sum(iterable,start){if(start===undefined){start=0}else{
if(typeof start==='str'){throw _b_.TypeError("TypeError: sum() can't sum strings [use ''.join(seq) instead]")}
if(_b_.isinstance(start,_b_.bytes)){throw _b_.TypeError("TypeError: sum() can't sum bytes [use b''.join(seq) instead]")}}
var res=start
var iterable=iter(iterable)
while(1){try{var _item=next(iterable)
res=getattr(res,'__add__')(_item)}catch(err){if(err.__name__==='StopIteration'){break}
else{throw err}}}
return res}
var $SuperDict={__class__:$B.$type,__name__:'super'}
$SuperDict.__getattribute__=function(self,attr){if($SuperDict[attr]!==undefined){
return function(){return $SuperDict[attr](self)}}
var mro=self.__thisclass__.$dict.__mro__,res
for(var i=1;i<mro.length;i++){
res=mro[i][attr]
if(res!==undefined){
if(res.__class__===$PropertyDict){return res.__get__(res,self.__self_class__)}
if(self.__self_class__!==None){var _args=[self.__self_class__]
if(attr=='__new__'){_args=[]}
var method=(function(initial_args){return function(){
var local_args=initial_args.slice()
var pos=initial_args.length
for(var i=0;i<arguments.length;i++){local_args[pos++]=arguments[i]}
var x=res.apply(null,local_args)
if(x===undefined)return None
return x}})(_args)
method.__class__={__class__:$B.$type,__name__:'method',__mro__:[$ObjectDict]}
method.__func__=res
method.__self__=self
return method}
return res}}
throw _b_.AttributeError("object 'super' has no attribute '"+attr+"'")}
$SuperDict.__mro__=[$SuperDict,$ObjectDict]
$SuperDict.__repr__=$SuperDict.__str__=function(self){var res="<super: <class '"+self.__thisclass__.$dict.__name__+"'"
if(self.__self_class__!==undefined){res +=', <'+self.__self_class__.__class__.__name__+' object>'}
return res+'>'}
function $$super(_type1,_type2){return{__class__:$SuperDict,__thisclass__:_type1,__self_class__:(_type2 ||None)}}
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
if(self.$bin){var res=self.$content.source.slice(self.$counter-nb,self.$counter)
return _b_.bytes(res)}
return self.$content.substr(self.$counter-nb,nb)}
$Reader.readable=function(self){return true}
$Reader.readline=function(self,limit){
self.$lc=self.$lc===undefined ? -1 : self.$lc
if(self.closed===true)throw _b_.ValueError('I/O operation on closed file')
if(self.$lc==self.$lines.length-1){return self.$bin ? _b_.bytes(): ''}
self.$lc++
var res=self.$lines[self.$lc]
self.$counter +=(self.$bin ? res.source.length : res.length)
return res}
$Reader.readlines=function(self,hint){if(self.closed===true)throw _b_.ValueError('I/O operation on closed file')
self.$lc=self.$lc===undefined ? -1 : self.$lc
return self.$lines.slice(self.$lc+1)}
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
var $ns=$B.args('open',3,{file:null,mode:null,encoding:null},['file','mode','encoding'],arguments,{mode:'r',encoding:'utf-8'},'args','kw')
for(var attr in $ns){eval('var '+attr+'=$ns["'+attr+'"]')}
if(args.length>0)var mode=args[0]
if(args.length>1)var encoding=args[1]
var is_binary=mode.search('b')>-1
if(isinstance(file,$B.JSObject))return new $OpenFile(file.js,mode,encoding)
if(isinstance(file,_b_.str)){
if(window.XMLHttpRequest){
var req=new XMLHttpRequest();}else{
var req=new ActiveXObject("Microsoft.XMLHTTP");}
req.onreadystatechange=function(){var status=req.status
if(status===404){$res=_b_.IOError('File '+file+' not found')}else if(status!==200){$res=_b_.IOError('Could not open file '+file+' : status '+status)}else{$res=req.responseText
if(is_binary){$res=_b_.str.$dict.encode($res,'utf-8')}}}
var fake_qs='?foo='+$B.UUID()
req.open('GET',file+fake_qs,false)
if(is_binary){req.overrideMimeType('text/plain; charset=utf-8');}
req.send()
if($res.constructor===Error)throw $res
if(is_binary){var lf=_b_.bytes('\n','ascii'),lines=_b_.bytes.$dict.split($res,lf)
for(var i=0;i<lines.length-1;i++){lines[i].source.push(10)}}else{var lines=$res.split('\n')
for(var i=0;i<lines.length-1;i++){lines[i]+='\n'}}
var res={$content:$res,$counter:0,$lines:lines,$bin:is_binary,closed:False,encoding:encoding,mode:mode,name:file}
res.__class__=is_binary ? $BufferedReader : $TextIOWrapper
return res}}
var $ZipDict={__class__:$B.$type,__name__:'zip'}
var $zip_iterator=$B.$iterator_class('zip_iterator')
$ZipDict.__iter__=function(self){
return self.$iterator=self.$iterator ||
$B.$iterator(self.items,$zip_iterator)}
$ZipDict.__mro__=[$ZipDict,$ObjectDict]
function zip(){var res={__class__:$ZipDict,items:[]}
if(arguments.length==0)return res
var $ns=$B.args('zip',0,{},[],arguments,{},'args','kw')
var _args=$ns['args']
var args=[],pos=0
for(var i=0;i<_args.length;i++){args[pos++]=iter(_args[i])}
var kw=$ns['kw']
var rank=0,items=[]
while(1){var line=[],flag=true,pos=0
for(var i=0;i<args.length;i++){try{line[pos++]=next(args[i])}catch(err){if(err.__name__==='StopIteration'){flag=false;break}
else{throw err}}}
if(!flag)break
items[rank++]=_b_.tuple(line)}
res.items=items
return res}
zip.__class__=$B.$factory
zip.$dict=$ZipDict
$ZipDict.$factory=zip
function no_set_attr(klass,attr){if(klass[attr]!==undefined){throw _b_.AttributeError("'"+klass.__name__+"' object attribute '"+
attr+"' is read-only")}else{throw _b_.AttributeError("'"+klass.__name__+
"' object has no attribute '"+attr+"'")}}
var $BoolDict=$B.$BoolDict={__class__:$B.$type,__dir__:$ObjectDict.__dir__,__name__:'bool',$native:true}
$BoolDict.__mro__=[$BoolDict,$ObjectDict]
bool.__class__=$B.$factory
bool.$dict=$BoolDict
$BoolDict.$factory=bool
$BoolDict.__add__=function(self,other){if(self.valueOf())return other + 1;
return other;}
var True=true
var False=false
$BoolDict.__eq__=function(self,other){if(self.valueOf())return !!other
return !other}
$BoolDict.__ne__=function(self,other){if(self.valueOf())return !other
return !!other}
$BoolDict.__ge__=function(self,other){return _b_.int.$dict.__ge__($BoolDict.__hash__(self),other)}
$BoolDict.__gt__=function(self,other){return _b_.int.$dict.__gt__($BoolDict.__hash__(self),other)}
$BoolDict.__hash__=$BoolDict.__index__=$BoolDict.__int__=function(self){if(self.valueOf())return 1
return 0}
$BoolDict.__le__=function(self,other){return !$BoolDict.__gt__(self,other)}
$BoolDict.__lshift__=function(self,other){return self.valueOf()<< other}
$BoolDict.__lt__=function(self,other){return !$BoolDict.__ge__(self,other)}
$BoolDict.__mul__=function(self,other){if(self.valueOf())return other
return 0;}
$BoolDict.__neg__=function(self){return -$B.int_or_bool(self)}
$BoolDict.__pos__=$B.int_or_bool
$BoolDict.__repr__=$BoolDict.__str__=function(self){if(self.valueOf())return "True"
return "False"}
$BoolDict.__setattr__=function(self,attr){return no_set_attr($BoolDict,attr)}
$BoolDict.__sub__=function(self,other){if(self.valueOf())return 1-other;
return -other;}
$BoolDict.__xor__=function(self,other){return self.valueOf()!=other.valueOf()}
var $EllipsisDict={__class__:$B.$type,__name__:'Ellipsis',}
$EllipsisDict.__mro__=[$ObjectDict]
$EllipsisDict.$factory=$EllipsisDict
var Ellipsis={__bool__ : function(){return True},__class__ : $EllipsisDict,__repr__ : function(){return 'Ellipsis'},__str__ : function(){return 'Ellipsis'},toString : function(){return 'Ellipsis'}}
for(var $key in $B.$comps){
switch($B.$comps[$key]){case 'ge':
case 'gt':
case 'le':
case 'lt':
Ellipsis['__'+$B.$comps[$key]+'__']=(function(k){return function(other){throw _b_.TypeError("unorderable types: ellipsis() "+k+" "+
$B.get_class(other).__name__)}})($key)}}
for(var $func in Ellipsis){if(typeof Ellipsis[$func]==='function'){Ellipsis[$func].__str__=(function(f){return function(){return "<method-wrapper "+f+" of Ellipsis object>"}})($func)}}
var $NoneDict={__class__:$B.$type,__name__:'NoneType'}
$NoneDict.__mro__=[$NoneDict,$ObjectDict]
$NoneDict.__setattr__=function(self,attr){return no_set_attr($NoneDict,attr)}
var None={__bool__ : function(){return False},__class__ : $NoneDict,__hash__ : function(){return 0},__repr__ : function(){return 'None'},__str__ : function(){return 'None'},toString : function(){return 'None'}}
$NoneDict.$factory=function(){return None}
$NoneDict.$factory.__class__=$B.$factory
$NoneDict.$factory.$dict=$NoneDict
for(var $op in $B.$comps){
var key=$B.$comps[$op]
switch(key){case 'ge':
case 'gt':
case 'le':
case 'lt':
$NoneDict['__'+key+'__']=(function(op){return function(other){throw _b_.TypeError("unorderable types: NoneType() "+op+" "+
$B.get_class(other).__name__+"()")}})($op)}}
for(var $func in None){if(typeof None[$func]==='function'){None[$func].__str__=(function(f){return function(){return "<method-wrapper "+f+" of NoneType object>"}})($func)}}
var $FunctionCodeDict={__class__:$B.$type,__name__:'function code'}
$FunctionCodeDict.__mro__=[$FunctionCodeDict,$ObjectDict]
$FunctionCodeDict.$factory={__class__:$B.$factory,$dict:$FunctionCodeDict}
var $FunctionGlobalsDict={__class:$B.$type,__name__:'function globals'}
$FunctionGlobalsDict.__mro__=[$FunctionGlobalsDict,$ObjectDict]
$FunctionGlobalsDict.$factory={__class__:$B.$factory,$dict:$FunctionGlobalsDict}
var $FunctionDict=$B.$FunctionDict={__class__:$B.$type,__code__:{__class__:$FunctionCodeDict,__name__:'function code'},__globals__:{__class__:$FunctionGlobalsDict,__name__:'function globals'},__name__:'function'}
$FunctionDict.__getattribute__=function(self,attr){
if(self.$infos && self.$infos[attr]!==undefined){if(attr=='__code__'){var res={__class__:$B.$CodeDict}
for(var attr in self.$infos.__code__){res[attr]=self.$infos.__code__[attr]}
return res}else if(attr=='__annotations__'){
return $B.obj_dict(self.$infos[attr])}else{return self.$infos[attr]}}else{return _b_.object.$dict.__getattribute__(self,attr)}}
$FunctionDict.__repr__=$FunctionDict.__str__=function(self){return '<function '+self.$infos.__name__+'>'}
$FunctionDict.__mro__=[$FunctionDict,$ObjectDict]
var $Function=function(){}
$Function.__class__=$B.$factory
$FunctionDict.$factory=$Function
$Function.$dict=$FunctionDict
_b_.__BRYTHON__=__BRYTHON__
var builtin_funcs=['abs','all','any','ascii','bin','bool','bytearray','bytes','callable','chr','classmethod','compile','complex','delattr','dict','dir','divmod','enumerate','eval','exec','exit','filter','float','format','frozenset','getattr','globals','hasattr','hash','help','hex','id','input','int','isinstance','issubclass','iter','len','list','locals','map','max','memoryview','min','next','object','oct','open','ord','pow','print','property','quit','range','repr','reversed','round','set','setattr','slice','sorted','staticmethod','str','sum','$$super','tuple','type','vars','zip']
for(var i=0;i<builtin_funcs.length;i++){var name=builtin_funcs[i]
if(name=='open'){name1='$url_open'}
if(name=='super'){name='$$super'}
if(name=='eval'){name='$eval'}
$B.builtin_funcs[name]=true}
$B.builtin_funcs['$eval']=true
var other_builtins=['Ellipsis','False','None','True','__debug__','__import__','copyright','credits','license','NotImplemented','type']
var builtin_names=builtin_funcs.concat(other_builtins)
for(var i=0;i<builtin_names.length;i++){var name=builtin_names[i]
var orig_name=name
var name1=name
if(name=='open'){name1='$url_open'}
if(name=='super'){name='$$super'}
if(name=='eval'){name=name1='$eval'}
if(name=='print'){name1='$print'}
$B.bound['__builtins__'][name]=true
try{_b_[name]=eval(name1)
if($B.builtin_funcs[name]!==undefined){
if(_b_[name].__repr__===undefined){
_b_[name].__repr__=_b_[name].__str__=(function(x){return function(){return '<built-in function '+x+'>'}})(orig_name)}
_b_[name].__module__='builtins'
_b_[name].__name__=name
_b_[name].__defaults__=_b_[name].__defaults__ ||[]
_b_[name].__kwdefaults__=_b_[name].__kwdefaults__ ||{}
_b_[name].__annotations__=_b_[name].__annotations__ ||{}}
_b_[name].__doc__=_b_[name].__doc__ ||''}
catch(err){}}
_b_['$eval']=$eval
_b_['open']=$url_open
_b_['print']=$print
_b_['$$super']=$$super})(__BRYTHON__)
;(function($B){eval($B.InjectBuiltins())
var $TracebackDict={__class__:$B.$type,__name__:'traceback'}
$TracebackDict.__getattribute__=function(self,attr){if(self.stack.length==0){alert('no stack',attr)}
var last_frame=$B.last(self.stack)
if(last_frame==undefined){alert('last frame undef ');console.log(self.stack,Object.keys(self.stack))}
var line_info=last_frame[1].$line_info
switch(attr){case 'tb_frame':
return frame(self.stack)
case 'tb_lineno':
if(line_info===undefined){return -1}
else{return parseInt(line_info.split(',')[0])}
case 'tb_lasti':
if(line_info===undefined){return '<unknown>'}
else{var info=line_info.split(',')
var src=$B.$py_src[info[1]]
if(src!==undefined){return src.split('\n')[parseInt(info[0]-1)].trim()}else{return '<unknown>'}}
case 'tb_next':
if(self.stack.length==1){return None}
else{return traceback(self.stack.slice(0,self.stack.length-1))}
default:
return $TracebackDict[attr]}}
$TracebackDict.__mro__=[$TracebackDict,_b_.object.$dict]
$TracebackDict.__str__=function(self){return '<traceback object>'}
function traceback(stack){return{__class__ : $TracebackDict,stack : stack}}
traceback.__class__=$B.$factory
traceback.$dict=$TracebackDict
$TracebackDict.$factory=traceback
var $FrameDict={__class__:$B.$type,__name__:'frame'}
$FrameDict.__getattr__=function(self,attr){
if(attr=='f_back'){if(self.$pos>0){return frame(self.$stack,self.$pos-1)}}}
$FrameDict.__mro__=[$FrameDict,_b_.object.$dict]
function to_dict(obj){var res=_b_.dict()
var setitem=_b_.dict.$dict.__setitem__
for(var attr in obj){if(attr.charAt(0)=='$'){continue}
setitem(res,attr,obj[attr])}
return res}
function frame(stack,pos){var mod_name=stack[2]
var fs=stack
var res={__class__:$FrameDict,f_builtins :{},
$stack: stack,}
if(pos===undefined){pos=fs.length-1}
res.$pos=pos
if(fs.length){var _frame=fs[pos]
var locals_id=_frame[0]
try{res.f_locals=$B.obj_dict(_frame[1])}catch(err){console.log('err '+err)
throw err}
res.f_globals=$B.obj_dict(_frame[3])
if($B.debug>0){if(_frame[1].$line_info===undefined){res.f_lineno=-1}
else{res.f_lineno=parseInt(_frame[1].$line_info.split(',')[0])}}else{res.f_lineno=-1}
res.f_code={__class__:$B.$CodeDict,co_code:None,
co_name: locals_id,
co_filename: _frame[3].__name__ }
if(res.f_code.co_filename===undefined){console.log(_frame[0],_frame[1],_frame[2],_frame[3]);alert('no cofilename')}}
return res}
frame.__class__=$B.$factory
frame.$dict=$FrameDict
$FrameDict.$factory=frame
$B._frame=frame
var $BaseExceptionDict={__class__:$B.$type,__bases__ :[_b_.object],__module__:'builtins',__name__:'BaseException'}
$BaseExceptionDict.__init__=function(self){self.args=_b_.tuple([arguments[1]])}
$BaseExceptionDict.__repr__=function(self){return self.__class__.__name__+repr(self.args)}
$BaseExceptionDict.__str__=function(self){return _b_.str(self.args[0])}
$BaseExceptionDict.__mro__=[$BaseExceptionDict,_b_.object.$dict]
$BaseExceptionDict.__new__=function(cls){var err=_b_.BaseException()
err.__name__=cls.$dict.__name__
err.__class__=cls.$dict
return err}
$BaseExceptionDict.__getattr__=function(self,attr){if(attr=='info'){var name=self.__class__.__name__
if(name=='SyntaxError' ||name=='IndentationError'){return 'File "'+self.args[1]+'", line '+self.args[2]+'\n    '+
self.args[4]}
var info='Traceback (most recent call last):'
if(self.$js_exc!==undefined){for(var attr in self.$js_exc){if(attr==='message')continue
try{info +='\n    '+attr+' : '+self.$js_exc[attr]}
catch(_err){}}
info+='\n'}
for(var i=0;i<self.$stack.length;i++){var frame=self.$stack[i]
if(frame[1].$line_info===undefined){continue}
var line_info=frame[1].$line_info.split(',')
var lines=$B.$py_src[line_info[1]].split('\n')
info +='\n  module '+line_info[1]+' line '+line_info[0]
var line=lines[parseInt(line_info[0])-1]
if(line)line=line.replace(/^[ ]+/g,'')
if(line===undefined){console.log('line undef...',line_info,$B.$py_src[line_info[1]])}
info +='\n    '+line}
return info}else if(attr=='traceback'){
return traceback(self.$stack)}else{throw AttributeError(self.__class__.__name__+
"has no attribute '"+attr+"'")}}
$BaseExceptionDict.with_traceback=function(self,tb){self.traceback=tb
return self}
$B.set_func_names($BaseExceptionDict)
var BaseException=function(){var err=Error()
err.__name__='BaseException'
err.args=_b_.tuple(Array.prototype.slice.call(arguments))
err.$message=arguments[0]
err.__class__=$BaseExceptionDict
err.$py_error=true
err.$stack=$B.frames_stack.slice()
$B.current_exception=err
return err}
BaseException.__class__=$B.$factory
BaseException.$dict=$BaseExceptionDict
$BaseExceptionDict.$factory=BaseException
_b_.BaseException=BaseException
$B.exception=function(js_exc){
if(!js_exc.$py_error){
if($B.debug>0 && js_exc.info===undefined){var _frame=$B.last($B.frames_stack)
if(_frame===undefined){_frame=$B.pmframe}
if(_frame && _frame[1].$line_info!==undefined){var line_info=_frame[1].$line_info.split(',')
var mod_name=line_info[1]
var module=$B.modules[mod_name]
if(module){if(module.caller!==undefined){
var mod_name=line_info[1]}
var lib_module=mod_name
var line_num=parseInt(line_info[0])
if($B.$py_src[mod_name]===undefined){console.log('pas de py_src pour '+mod_name)}
var lines=$B.$py_src[mod_name].split('\n'),msg=js_exc.message.toString()
msg +="\n  module '"+lib_module+"' line "+line_num
msg +='\n'+lines[line_num-1]
js_exc.msg=msg
js_exc.info_in_msg=true}}else{console.log('error ',js_exc)}}
var exc=Error()
exc.__name__='Internal Javascript error: '+(js_exc.__name__ ||js_exc.name)
exc.__class__=_b_.Exception.$dict
exc.$js_exc=js_exc
if(js_exc.name=='ReferenceError'){exc.__name__='NameError'
exc.__class__=_b_.NameError.$dict
js_exc.message=js_exc.message.replace('$$','')}else if(js_exc.name=="InternalError"){exc.__name__='RuntimeError'
exc.__class__=_b_.RuntimeError.$dict}
exc.$message=js_exc.msg ||'<'+js_exc+'>'
exc.args=_b_.tuple([exc.$message])
exc.info=''
exc.$py_error=true
exc.$stack=$B.frames_stack.slice()}else{var exc=js_exc}
$B.current_exception=exc
return exc}
$B.is_exc=function(exc,exc_list){
if(exc.__class__===undefined)exc=$B.exception(exc)
var exc_class=exc.__class__.$factory
for(var i=0;i<exc_list.length;i++){if(issubclass(exc_class,exc_list[i]))return true}
return false}
$B.clear_exc=function(){$B.current_exception=null}
function $make_exc(names,parent){
var _str=[],pos=0
for(var i=0;i<names.length;i++){var name=names[i]
$B.bound['__builtins__'][name]=true
var $exc=(BaseException+'').replace(/BaseException/g,name)
_str[pos++]='var $'+name+'Dict={__class__:$B.$type,__name__:"'+name+'"}'
_str[pos++]='$'+name+'Dict.__bases__ = [parent]'
_str[pos++]='$'+name+'Dict.__module__ = "builtins"'
_str[pos++]='$'+name+'Dict.__mro__=[$'+name+'Dict].concat(parent.$dict.__mro__)'
_str[pos++]='_b_.'+name+'='+$exc
_str[pos++]='_b_.'+name+'.__class__=$B.$factory'
_str[pos++]='$'+name+'Dict.$factory=_b_.'+name
_str[pos++]='_b_.'+name+'.$dict=$'+name+'Dict'}
eval(_str.join(';'))}
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
throw _b_.NameError(name)}
$B.$TypeError=function(msg){throw _b_.TypeError(msg)}})(__BRYTHON__)

;(function($B){var _b_=$B.builtins,None=_b_.None,$RangeDict={__class__:$B.$type,__dir__:_b_.object.$dict.__dir__,__name__:'range',$native:true,descriptors:{start:true,step:true,stop:true}}
$RangeDict.__contains__=function(self,other){if($RangeDict.__len__(self)==0){return false}
try{other=$B.int_or_bool(other)}
catch(err){
try{$RangeDict.index(self,other);return true}
catch(err){return false}}
var sub=$B.sub(other,self.start),fl=$B.floordiv(sub,self.step),res=$B.mul(self.step,fl)
if($B.eq(res,sub)){if($B.gt(self.stop,self.start)){return $B.ge(other,self.start)&& $B.gt(self.stop,other)}else{return $B.ge(self.start,other)&& $B.gt(other,self.stop)}}else{return false}}
$RangeDict.__delattr__=function(self,attr,value){throw _b_.AttributeError('readonly attribute')}
$RangeDict.__eq__=function(self,other){if(_b_.isinstance(other,range)){var len=$RangeDict.__len__(self)
if(!$B.eq(len,$RangeDict.__len__(other))){return false}
if(len==0){return true}
if(!$B.eq(self.start,other.start)){return false}
if(len==1){return true}
return $B.eq(self.step,other.step)}
return false}
function compute_item(r,i){var len=$RangeDict.__len__(r)
if(len==0){return r.start}
else if(i>len){return r.stop}
return $B.add(r.start,$B.mul(r.step,i))}
$RangeDict.__getitem__=function(self,rank){if(_b_.isinstance(rank,_b_.slice)){var norm=_b_.slice.$dict.$conv_for_seq(rank,$RangeDict.__len__(self)),substep=$B.mul(self.step,norm.step),substart=compute_item(self,norm.start),substop=compute_item(self,norm.stop)
return range(substart,substop,substep)}
if(typeof rank !="number"){rank=$B.$GetInt(rank)}
if($B.gt(0,rank)){rank=$B.add(rank,$RangeDict.__len__(self))}
var res=$B.add(self.start,$B.mul(rank,self.step))
if(($B.gt(self.step,0)&&($B.ge(res,self.stop)||$B.gt(self.start,res)))||
($B.gt(0,self.step)&&($B.ge(self.stop,res)||$B.gt(res,self.start)))){throw _b_.IndexError('range object index out of range')}
return res }
$RangeDict.__hash__=function(self){var len=$RangeDict.__len__(self)
if(len==0){return _b_.hash(_b_.tuple([0,None,None]))}
if(len==1){return _b_.hash(_b_.tuple([1,self.start,None]))}
return _b_.hash(_b_.tuple([len,self.start,self.step]))}
$RangeIterator=function(obj){return{__class__:$RangeIterator.$dict,obj: obj}}
$RangeIterator.__class__=$B.$factory
$RangeIterator.$dict={__class__: $B.$type,__name__: 'range_iterator',$factory: $RangeIterator,__iter__: function(self){return self},__next__: function(self){return _b_.next(self.obj)}}
$RangeIterator.$dict.__mro__=[$RangeIterator.$dict,_b_.object.$dict]
$RangeDict.__iter__=function(self){var res={__class__ : $RangeDict,start:self.start,stop:self.stop,step:self.step}
if(self.$safe){res.$counter=self.start-self.step}else{res.$counter=$B.sub(self.start,self.step)}
return $RangeIterator(res)}
$RangeDict.__len__=function(self){var len
if($B.gt(self.step,0)){if($B.ge(self.start,self.stop)){return 0}
var n=$B.sub(self.stop,$B.add(1,self.start)),q=$B.floordiv(n,self.step)
len=$B.add(1,q)}else{if($B.ge(self.stop,self.start)){return 0}
var n=$B.sub(self.start,$B.add(1,self.stop)),q=$B.floordiv(n,$B.mul(-1,self.step))
len=$B.add(1,q)}
if($B.maxsize===undefined){$B.maxsize=$B.LongInt.$dict.__pow__($B.LongInt(2),63)
$B.maxsize=$B.LongInt.$dict.__sub__($B.maxsize,1)}
return len}
$RangeDict.__next__=function(self){if(self.$safe){self.$counter +=self.step
if((self.step>0 && self.$counter >=self.stop)
||(self.step<0 && self.$counter <=self.stop)){throw _b_.StopIteration('')}}else{self.$counter=$B.add(self.$counter,self.step)
if(($B.gt(self.step,0)&& $B.ge(self.$counter,self.stop))
||($B.gt(0,self.step)&& $B.ge(self.stop,self.$counter))){throw _b_.StopIteration('')}}
return self.$counter}
$RangeDict.__mro__=[$RangeDict,_b_.object.$dict]
$RangeDict.__reversed__=function(self){var n=$B.sub($RangeDict.__len__(self),1)
return range($B.add(self.start,$B.mul(n,self.step)),$B.sub(self.start,self.step),$B.mul(-1,self.step))}
$RangeDict.__repr__=$RangeDict.__str__=function(self){var res='range('+_b_.str(self.start)+', '+_b_.str(self.stop)
if(self.step!=1)res +=', '+_b_.str(self.step)
return res+')'}
$RangeDict.__setattr__=function(self,attr,value){throw _b_.AttributeError('readonly attribute')}
$RangeDict.start=function(self){return self.start}
$RangeDict.step=function(self){return self.step},$RangeDict.stop=function(self){return self.stop}
$RangeDict.count=function(self,ob){if(_b_.isinstance(ob,[_b_.int,_b_.float,_b_.bool])){return _b_.int($RangeDict.__contains__(self,ob))}else{var comp=_b_.getattr(ob,'__eq__'),it=$RangeDict.__iter__(self)
_next=$RangeIterator.$dict.__next__,nb=0
while(true){try{if(comp(_next(it))){nb++}}catch(err){if(_b_.isinstance(err,_b_.StopIteration)){return nb}
throw err}}}}
$RangeDict.index=function(self,other){var $=$B.args('index',2,{self:null,other:null},['self','other'],arguments,{},null,null),self=$.self,other=$.other
try{other=$B.int_or_bool(other)}catch(err){var comp=_b_.getattr(other,'__eq__'),it=$RangeDict.__iter__(self),_next=$RangeIterator.$dict.__next__,nb=0
while(true){try{if(comp(_next(it))){return nb}
nb++}catch(err){if(_b_.isinstance(err,_b_.StopIteration)){throw _b_.ValueError(_b_.str(other)+' not in range')}
throw err}}}
var sub=$B.sub(other,self.start),fl=$B.floordiv(sub,self.step),res=$B.mul(self.step,fl)
if($B.eq(res,sub)){if(($B.gt(self.stop,self.start)&& $B.ge(other,self.start)
&& $B.gt(self.stop,other))||
($B.ge(self.start,self.stop)&& $B.ge(self.start,other)
&& $B.gt(other,self.stop))){return fl}else{throw _b_.ValueError(_b_.str(other)+' not in range')}}else{throw _b_.ValueError(_b_.str(other)+' not in range')}}
function range(){var $=$B.args('range',3,{start:null,stop:null,step:null},['start','stop','step'],arguments,{stop:null,step:null},null,null),start=$.start,stop=$.stop,step=$.step,safe
if(stop===null && step===null){stop=$B.PyNumber_Index(start)
safe=typeof stop==="number"
return{__class__:$RangeDict,start: 0,stop: stop,step: 1,$is_range: true,$safe: safe}}
if(step===null){step=1}
start=$B.PyNumber_Index(start)
stop=$B.PyNumber_Index(stop)
step=$B.PyNumber_Index(step)
if(step==0){throw _b_.ValueError("range() arg 3 must not be zero")}
safe=(typeof start=='number' && typeof stop=='number' &&
typeof step=='number')
return{__class__: $RangeDict,start: start,stop: stop,step: step,$is_range: true,$safe: safe}}
range.__class__=$B.$factory
range.$dict=$RangeDict
$RangeDict.$factory=range
range.$is_func=true
var $SliceDict={__class__:$B.$type,	__name__:'slice',	$native:true,	descriptors:{start:true,step:true,stop:true}}
$SliceDict.__mro__=[$SliceDict,_b_.object.$dict]
$SliceDict.__repr__=$SliceDict.__str__=function(self){return 'slice('+_b_.str(self.start)+','+
_b_.str(self.stop)+','+_b_.str(self.step)+')'}
$SliceDict.__setattr__=function(self,attr,value){throw _b_.AttributeError('readonly attribute')}
$SliceDict.$conv=function(self,len){
return{start: self.start===_b_.None ? 0 : self.start,stop: self.stop===_b_.None ? len : self.stop,step: self.step===_b_.None ? 1 : self.step}}
$SliceDict.$conv_for_seq=function(self,len){
var step=self.step===None ? 1 : $B.PyNumber_Index(self.step),step_is_neg=$B.gt(0,step),len_1=$B.sub(len,1)
if(step==0){throw Error('ValueError : slice step cannot be zero');}
var start,end;
if(self.start===None){start=step_is_neg ? len_1 : 0;}else{
start=$B.PyNumber_Index(self.start);
if($B.gt(0,start))start=$B.add(start,len);
if($B.gt(0,start))start=step<0 ? -1 : 0
if($B.ge(start,len))start=step<0 ? len_1 : len;}
if(self.stop===None){stop=step_is_neg ? -1 : len;}else{
stop=$B.PyNumber_Index(self.stop);
if($B.gt(0,stop))stop +=len
if($B.gt(0,stop))stop=step<0 ? -1 : 0
if($B.ge(stop,len))stop=step_is_neg ? len_1 : len;}
return{start: start,stop: stop,step: step}}
$SliceDict.start=function(self){return self.start}
$SliceDict.step=function(self){return self.step}
$SliceDict.stop=function(self){return self.stop}
$SliceDict.indices=function(self,length){var len=$B.$GetInt(length)
if(len < 0)_b_.ValueError('length should not be negative')
if(self.step > 0){var _len=_b_.min(len,self.stop)
return _b_.tuple([self.start,_len,self.step])}else if(self.step==_b_.None){var _len=_b_.min(len,self.stop)
var _start=self.start
if(_start==_b_.None)_start=0
return _b_.tuple([_start,_len,1])}
_b_.NotImplementedError("Error! negative step indices not implemented yet")}
function slice(){var $=$B.args('slice',3,{start:null,stop:null,step:null},['start','stop','step'],arguments,{stop:null,step:null},null,null),start,stop,step
if($.stop===null && $.step===null){start=_b_.None
stop=$.start
step=_b_.None}else{start=$.start
stop=$.stop
step=$.step===null ? _b_.None : $.step}
var res={__class__ : $SliceDict,start:start,stop:stop,step:step}
return res}
slice.__class__=$B.$factory
slice.$dict=$SliceDict
$SliceDict.$factory=slice
slice.$is_func=true
_b_.range=range
_b_.slice=slice})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
var $ObjectDict=_b_.object.$dict
var isinstance=_b_.isinstance,getattr=_b_.getattr,None=_b_.None
var from_unicode={},to_unicode={}
var $BytearrayDict={__class__:$B.$type,__name__:'bytearray'}
var mutable_methods=['__delitem__','clear','copy','count','index','pop','remove','reverse','sort']
for(var i=0,_len_i=mutable_methods.length;i < _len_i;i++){var method=mutable_methods[i]
$BytearrayDict[method]=(function(m){return function(self){var args=[self.source],pos=1
for(var i=1,_len_i=arguments.length;i < _len_i;i++)args[pos++]=arguments[i]
return _b_.list.$dict[m].apply(null,args)}})(method)}
var $bytearray_iterator=$B.$iterator_class('bytearray_iterator')
$BytearrayDict.__iter__=function(self){return $B.$iterator(self.source,$bytearray_iterator)}
$BytearrayDict.__mro__=[$BytearrayDict,$ObjectDict]
$BytearrayDict.__repr__=$BytearrayDict.__str__=function(self){return 'bytearray('+$BytesDict.__repr__(self)+")"}
$BytearrayDict.__setitem__=function(self,arg,value){if(isinstance(arg,_b_.int)){if(!isinstance(value,_b_.int)){throw _b_.TypeError('an integer is required')}else if(value>255){throw _b_.ValueError("byte must be in range(0, 256)")}
var pos=arg
if(arg<0)pos=self.source.length+pos
if(pos>=0 && pos<self.source.length){self.source[pos]=value}
else{throw _b_.IndexError('list index out of range')}}else if(isinstance(arg,_b_.slice)){var start=arg.start===None ? 0 : arg.start
var stop=arg.stop===None ? self.source.length : arg.stop
var step=arg.step===None ? 1 : arg.step
if(start<0)start=self.source.length+start
if(stop<0)stop=self.source.length+stop
self.source.splice(start,stop-start)
if(_b_.hasattr(value,'__iter__')){var $temp=_b_.list(value)
for(var i=$temp.length-1;i>=0;i--){if(!isinstance($temp[i],_b_.int)){throw _b_.TypeError('an integer is required')}else if($temp[i]>255){throw ValueError("byte must be in range(0, 256)")}
self.source.splice(start,0,$temp[i])}}else{throw _b_.TypeError("can only assign an iterable")}}else{
throw _b_.TypeError('list indices must be integer, not '+$B.get_class(arg).__name__)}}
$BytearrayDict.append=function(self,b){if(arguments.length!=2){throw _b_.TypeError(
"append takes exactly one argument ("+(arguments.length-1)+" given)")}
if(!isinstance(b,_b_.int))throw _b_.TypeError("an integer is required")
if(b>255)throw ValueError("byte must be in range(0, 256)")
self.source[self.source.length]=b}
$BytearrayDict.insert=function(self,pos,b){if(arguments.length!=3){throw _b_.TypeError(
"insert takes exactly 2 arguments ("+(arguments.length-1)+" given)")}
if(!isinstance(b,_b_.int))throw _b_.TypeError("an integer is required")
if(b>255)throw ValueError("byte must be in range(0, 256)")
_b_.list.$dict.insert(self.source,pos,b)}
function bytearray(source,encoding,errors){var _bytes=bytes(source,encoding,errors)
var obj={__class__:$BytearrayDict}
$BytearrayDict.__init__(obj,source,encoding,errors)
return obj}
bytearray.__class__=$B.$factory
bytearray.$dict=$BytearrayDict
$BytearrayDict.$factory=bytearray
bytearray.__code__={}
bytearray.__code__.co_argcount=1
bytearray.__code__.co_consts=[]
bytearray.__code__.co_varnames=['i']
var $BytesDict={__class__ : $B.$type,__name__ : 'bytes'}
$BytesDict.__add__=function(self,other){if(!isinstance(other,bytes)){throw _b_.TypeError("can't concat bytes to " + _b_.str(other))}
self.source=self.source.concat(other.source)
return self}
var $bytes_iterator=$B.$iterator_class('bytes_iterator')
$BytesDict.__iter__=function(self){return $B.$iterator(self.source,$bytes_iterator)}
$BytesDict.__eq__=function(self,other){return getattr(self.source,'__eq__')(other.source)}
$BytesDict.__ge__=function(self,other){return _b_.list.$dict.__ge__(self.source,other.source)}
$BytesDict.__getitem__=function(self,arg){var i
if(isinstance(arg,_b_.int)){var pos=arg
if(arg<0)pos=self.source.length+pos
if(pos>=0 && pos<self.source.length)return self.source[pos]
throw _b_.IndexError('index out of range')}else if(isinstance(arg,_b_.slice)){var step=arg.step===None ? 1 : arg.step
if(step>0){var start=arg.start===None ? 0 : arg.start
var stop=arg.stop===None ? getattr(self.source,'__len__')(): arg.stop}else{var start=arg.start===None ? 
getattr(self.source,'__len__')()-1 : arg.start
var stop=arg.stop===None ? 0 : arg.stop}
if(start<0)start=self.source.length+start
if(stop<0)stop=self.source.length+stop
var res=[],i=null,pos=0
if(step>0){if(stop<=start)return ''
for(i=start;i<stop;i+=step)res[pos++]=self.source[i]}else{
if(stop>=start)return ''
for(i=start;i>=stop;i+=step)res[pos++]=self.source[i]}
return bytes(res)}else if(isinstance(arg,bool)){return self.source.__getitem__(_b_.int(arg))}}
$BytesDict.__gt__=function(self,other){return _b_.list.$dict.__gt__(self.source,other.source)}
$BytesDict.__hash__=function(self){if(self===undefined){return $BytesDict.__hashvalue__ ||$B.$py_next_hash-- }
var hash=1;
for(var i=0,_len_i=self.length;i < _len_i;i++){hash=(101*hash + self.source[i])& 0xFFFFFFFF}
return hash}
$BytesDict.__init__=function(self,source,encoding,errors){var int_list=[],pos=0
if(source===undefined){}else if(isinstance(source,_b_.int)){var i=source
while(i--)int_list[pos++]=0}else{if(isinstance(source,_b_.str)){if(encoding===undefined)
throw _b_.TypeError("string argument without an encoding")
int_list=encode(source,encoding)}else{
int_list=_b_.list(source)}}
self.source=int_list
self.encoding=encoding
self.errors=errors}
$BytesDict.__le__=function(self,other){return _b_.list.$dict.__le__(self.source,other.source)}
$BytesDict.__len__=function(self){return self.source.length}
$BytesDict.__lt__=function(self,other){return _b_.list.$dict.__lt__(self.source,other.source)}
$BytesDict.__mro__=[$BytesDict,$ObjectDict]
$BytesDict.__mul__=function(){var $=$B.args('__mul__',2,{self:null,other:null},['self','other'],arguments,{},null,null),other=$B.PyNumber_Index($.other),res=bytes()
for(var i=0;i<other;i++){res.source=res.source.concat($.self.source)}
return res}
$BytesDict.__ne__=function(self,other){return !$BytesDict.__eq__(self,other)}
$BytesDict.__repr__=$BytesDict.__str__=function(self){var res="b'"
for(var i=0,_len_i=self.source.length;i < _len_i;i++){var s=self.source[i]
if(s<32 ||s>=128){var hx=s.toString(16)
hx=(hx.length==1 ? '0' : '')+ hx
res +='\\x'+hx}else{res +=String.fromCharCode(s)}}
return res+"'"}
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
default:}}
$BytesDict.join=function(){var $ns=$B.args('join',2,{self:null,iterable:null},['self','iterable'],arguments,{}),self=$ns['self'],iterable=$ns['iterable']
var next_func=_b_.getattr(_b_.iter(iterable),'__next__'),res=bytes(),empty=true
while(true){try{var item=next_func()
if(empty){empty=false}
else{res=$BytesDict.__add__(res,self)}
res=$BytesDict.__add__(res,item)}catch(err){if(isinstance(err,_b_.StopIteration)){break}
throw err}}
return res}
$BytesDict.maketrans=function(from,to){var _t=[]
for(var i=0;i < 256;i++)_t[i]=i
for(var i=0,_len_i=from.source.length;i < _len_i;i++){var _ndx=from.source[i]
_t[_ndx]=to.source[i]}
return bytes(_t)}
$BytesDict.split=function(){var $=$B.args('split',2,{self:null,sep:null},['self','sep'],arguments,{},null,null),res=[],start=0,stop=0
var seps=$.sep.source,len=seps.length,src=$.self.source,blen=src.length
while(stop<blen){var match=true
for(var i=0;i<len && match;i++){if(src[stop+i]!=seps[i]){match=false}}
if(match){res.push(bytes(src.slice(start,stop)))
start=stop+len
stop=start}else{stop++}}
if(match ||(stop>start)){res.push(bytes(src.slice(start,stop)))}
return res}
function _strip(self,cars,lr){if(cars===undefined){cars=[],pos=0
var ws='\r\n \t'
for(var i=0,_len_i=ws.length;i < _len_i;i++)cars[pos++]=ws.charCodeAt(i)}else if(isinstance(cars,bytes)){cars=cars.source}else{throw _b_.TypeError("Type str doesn't support the buffer API")}
if(lr=='l'){for(var i=0,_len_i=self.source.length;i < _len_i;i++){if(cars.indexOf(self.source[i])==-1)break}
return bytes(self.source.slice(i))}
for(var i=self.source.length-1;i>=0;i--){if(cars.indexOf(self.source[i])==-1)break}
return bytes(self.source.slice(0,i+1))}
$BytesDict.lstrip=function(self,cars){return _strip(self,cars,'l')}
$BytesDict.rstrip=function(self,cars){return _strip(self,cars,'r')}
$BytesDict.startswith=function(){var $=$B.args('startswith',2,{self: null,start: null},['self','start'],arguments,{},null,null)
if(_b_.isinstance($.start,bytes)){var res=true
for(var i=0;i<$.start.source.length && res;i++){res=$.self.source[i]==$.start.source[i]}
return res}else if(_b_.isinstance($.start,_b_.tuple)){var items=[]
for(var i=0;i<$.start.length;i++){if(_b_.isinstance($.start[i],bytes)){items=items.concat($.start[i].source)}else{throw _b_.TypeError("startswith first arg must be bytes or "+
"a tuple of bytes, not "+$B.get_class($.start).__name__)}}
var start=bytes(items)
return $BytesDict.startswith($.self,start)}else{throw _b_.TypeError("startswith first arg must be bytes or a tuple of bytes, not "+
$B.get_class($.start).__name__)}}
$BytesDict.strip=function(self,cars){var res=$BytesDict.lstrip(self,cars)
return $BytesDict.rstrip(res,cars)}
$BytesDict.translate=function(self,table,_delete){if(_delete===undefined){_delete=[]}
else if(isinstance(_delete,bytes)){_delete=_delete.source}
else{throw _b_.TypeError("Type "+$B.get_class(_delete).__name+" doesn't support the buffer API")}
var res=[],pos=0
if(isinstance(table,bytes)&& table.source.length==256){for(var i=0,_len_i=self.source.length;i < _len_i;i++){if(_delete.indexOf(self.source[i])>-1)continue
res[pos++]=table.source[self.source[i]]}}
return bytes(res)}
$BytesDict.upper=function(self){var _res=[],pos=0
for(var i=0,_len_i=self.source.length;i < _len_i;i++)_res[pos++]=self.source[i].toUpperCase()
return bytes(_res)}
function $UnicodeEncodeError(encoding,code_point,position){throw _b_.UnicodeEncodeError("'"+encoding+
"' codec can't encode character "+_b_.hex(code_point)+
" in position "+position)}
function $UnicodeDecodeError(encoding,position){throw _b_.UnicodeDecodeError("'"+encoding+
"' codec can't decode bytes in position "+position)}
function _hex(int){return int.toString(16)}
function _int(hex){return parseInt(hex,16)}
function normalise(encoding){var enc=encoding.toLowerCase()
if(enc.substr(0,7)=='windows'){enc='cp'+enc.substr(7)}
enc=enc.replace('-','')
enc=enc.replace('-','_')
return enc}
function load_decoder(enc){
if(to_unicode[enc]===undefined){load_encoder(enc)
to_unicode[enc]={}
for(var attr in from_unicode[enc]){to_unicode[enc][from_unicode[enc][attr]]=attr}}}
function load_encoder(enc){
if(from_unicode[enc]===undefined){var mod=_b_.__import__('encodings.'+enc),table=mod[enc].decoding_table
from_unicode[enc]={}
for(var i=0;i<table.length;i++){from_unicode[enc][table.charCodeAt(i)]=i}}}
function decode(b,encoding,errors){var s='',enc=normalise(encoding)
switch(enc){case 'utf_8':
case 'utf-8':
case 'utf8':
case 'U8':
case 'UTF':
var i=0,cp
var _int_800=_int('800'),_int_c2=_int('c2'),_int_1000=_int('1000')
var _int_e0=_int('e0'),_int_e1=_int('e1'),_int_e3=_int('e3')
var _int_a0=_int('a0'),_int_80=_int('80'),_int_2000=_int('2000')
while(i<b.length){if(b[i]<=127){s +=String.fromCharCode(b[i])
i +=1}else if(b[i]<_int_e0){if(i<b.length-1){cp=b[i+1]+ 64*(b[i]-_int_c2)
s +=String.fromCharCode(cp)
i +=2}else{$UnicodeDecodeError(encoding,i)}}else if(b[i]==_int_e0){if(i<b.length-2){var zone=b[i+1]-_int_a0
cp=b[i+2]-_int_80+_int_800+64*zone
s +=String.fromCharCode(cp)
i +=3}else{$UnicodeDecodeError(encoding,i)}}else if(b[i]<_int_e3){if(i<b.length-2){var zone=b[i+1]-_int_80
cp=b[i+2]-_int_80+_int_1000+64*zone
s +=String.fromCharCode(cp)
i +=3}else{$UnicodeDecodeError(encoding,i)}}else{if(i<b.length-2){var zone1=b[i]-_int_e1-1
var zone=b[i+1]-_int_80+64*zone1
cp=b[i+2]-_int_80+_int_2000+64*zone
s +=String.fromCharCode(cp)
i +=3}else{if(errors=='surrogateescape'){s+='\\udc' + _hex(b[i])
i+=1}else{
$UnicodeDecodeError(encoding,i)}}}}
break;
case 'latin_1':
case 'windows1252':
case 'iso-8859-1':
case 'iso8859-1':
case '8859':
case 'cp819':
case 'latin':
case 'latin1':
case 'L1':
for(var i=0,_len_i=b.length;i < _len_i;i++)s +=String.fromCharCode(b[i])
break;
case 'ascii':
for(var i=0,_len_i=b.length;i < _len_i;i++){var cp=b[i]
if(cp<=127){s +=String.fromCharCode(cp)}
else{var msg="'ascii' codec can't decode byte 0x"+cp.toString(16)
msg +=" in position "+i+": ordinal not in range(128)"
throw _b_.UnicodeDecodeError(msg)}}
break;
default:
try{load_decoder(enc)}
catch(err){throw _b_.LookupError("unknown encoding: "+ enc)}
for(var i=0,_len_i=b.length;i < _len_i;i++){var u=to_unicode[enc][b[i]]
if(u!==undefined){s+=String.fromCharCode(u)}
else{s +=String.fromCharCode(b[i])}}
break;
throw _b_.LookupError("unknown encoding: "+encoding)}
return s}
function encode(s,encoding){var t=[],pos=0,enc=normalise(encoding)
switch(enc){case 'utf-8':
case 'utf8':
var _int_800=_int('800'),_int_c2=_int('c2'),_int_1000=_int('1000')
var _int_e0=_int('e0'),_int_e1=_int('e1'),_int_a0=_int('a0'),_int_80=_int('80')
var _int_2000=_int('2000'),_int_D000=_int('D000')
for(var i=0,_len_i=s.length;i < _len_i;i++){var cp=s.charCodeAt(i)
if(cp<=127){t[pos++]=cp}else if(cp<_int_800){var zone=Math.floor((cp-128)/64)
t[pos++]=_int_c2+zone
t[pos++]=cp -64*zone}else if(cp<_int_1000){var zone=Math.floor((cp-_int_800)/64)
t[pos++]=_int_e0
t[pos++]=_int_a0+zone
t[pos++]=_int_80 + cp - _int_800 - 64 * zone}else if(cp<_int_2000){var zone=Math.floor((cp-_int_1000)/64)
t[pos++]=_int_e1+Math.floor((cp-_int_1000)/_int_1000)
t[pos++]=_int_80+zone
t[pos++]=_int_80 + cp - _int_1000 -64*zone}else if(cp<_int_D000){var zone=Math.floor((cp-_int_2000)/64)
var zone1=Math.floor((cp-_int_2000)/_int_1000)
t[pos++]=_int_e1+Math.floor((cp-_int_1000)/_int_1000)
t[pos++]=_int_80+zone-zone1*64
t[pos++]=_int_80 + cp - _int_2000 - 64 * zone}}
break;
case 'latin1': 
case 'iso8859_1': 
case 'windows1252': 
for(var i=0,_len_i=s.length;i < _len_i;i++){var cp=s.charCodeAt(i)
if(cp<=255){t[pos++]=cp}
else{$UnicodeEncodeError(encoding,i)}}
break;
case 'ascii':
for(var i=0,_len_i=s.length;i < _len_i;i++){var cp=s.charCodeAt(i)
if(cp<=127){t[pos++]=cp}
else{$UnicodeEncodeError(encoding,i)}}
break;
default:
try{load_encoder(enc)}
catch(err){throw _b_.LookupError("unknown encoding: "+ enc)}
for(var i=0,_len_i=s.length;i < _len_i;i++){var cp=s.charCodeAt(i)
if(from_unicode[enc][cp]===undefined){$UnicodeEncodeError(encoding,cp,i)}
t[pos++]=from_unicode[enc][cp]}
break}
return t}
function bytes(source,encoding,errors){
var obj={__class__:$BytesDict}
$BytesDict.__init__(obj,source,encoding,errors)
return obj}
bytes.__class__=$B.$factory
bytes.$dict=$BytesDict
$BytesDict.$factory=bytes
bytes.__code__={}
bytes.__code__.co_argcount=1
bytes.__code__.co_consts=[]
bytes.__code__.co_varnames=['i']
for(var $attr in $BytesDict){if($BytearrayDict[$attr]===undefined){$BytearrayDict[$attr]=(function(attr){return function(){return $BytesDict[attr].apply(null,arguments)}})($attr)}}
$B.set_func_names($BytesDict)
$B.set_func_names($BytearrayDict)
_b_.bytes=bytes
_b_.bytearray=bytearray})(__BRYTHON__)
;(function($B){eval($B.InjectBuiltins())
var $ObjectDict=_b_.object.$dict
var $LocationDict={__class__:$B.$type,__name__:'Location'}
$LocationDict.__mro__=[$LocationDict,$ObjectDict]
function $Location(){
var obj={}
for(var x in window.location){if(typeof window.location[x]==='function'){obj[x]=(function(f){return function(){return f.apply(window.location,arguments)}})(window.location[x])}else{obj[x]=window.location[x]}}
if(obj['replace']===undefined){
obj['replace']=function(url){window.location=url}}
obj.__class__=$LocationDict
obj.toString=function(){return window.location.toString()}
obj.__repr__=obj.__str__=obj.toString
return obj}
$LocationDict.$factory=$Location
$Location.$dict=$LocationDict
var $JSConstructorDict={__class__:$B.$type,__name__:'JSConstructor'}
$JSConstructorDict.__call__=function(self){
var args=[null]
for(var i=1,_len_i=arguments.length;i < _len_i;i++){args.push(pyobj2jsobj(arguments[i]))}
var factory=self.func.bind.apply(self.func,args)
var res=new factory()
return $B.$JS2Py(res)}
$JSConstructorDict.__mro__=[$JSConstructorDict,$ObjectDict]
function JSConstructor(obj){return{
__class__:$JSConstructorDict,func:obj.js_func}}
JSConstructor.__class__=$B.$factory
JSConstructor.$dict=$JSConstructorDict
$JSConstructorDict.$factory=JSConstructor
var jsobj2pyobj=$B.jsobj2pyobj=function(jsobj){switch(jsobj){case true:
case false:
return jsobj}
if(Array.isArray(jsobj))return _b_.list(jsobj)
if(typeof jsobj==='number'){if(jsobj.toString().indexOf('.')==-1)return _b_.int(jsobj)
return _b_.float(jsobj)}
return $B.JSObject(jsobj)}
var pyobj2jsobj=$B.pyobj2jsobj=function(pyobj){
if(pyobj===true ||pyobj===false)return pyobj
if(pyobj===_b_.None)return null
var klass=$B.get_class(pyobj)
if(klass===undefined){
return pyobj;}
if(klass===$JSObjectDict ||klass===$JSConstructorDict){
if(pyobj.js_func!==undefined){return pyobj.js_func}
return pyobj.js}else if(klass.__mro__.indexOf($B.DOMNodeDict)>-1){
return pyobj.elt}else if([_b_.list.$dict,_b_.tuple.$dict].indexOf(klass)>-1){
var res=[]
for(var i=0,_len_i=pyobj.length;i < _len_i;i++){res.push(pyobj2jsobj(pyobj[i]))}
return res}else if(klass===_b_.dict.$dict){
var jsobj={}
var items=_b_.list(_b_.dict.$dict.items(pyobj))
for(var j=0,_len_j=items.length;j < _len_j;j++){jsobj[items[j][0]]=pyobj2jsobj(items[j][1])}
return jsobj}else if(klass===$B.builtins.float.$dict){
return pyobj.valueOf()}else if(klass===$B.$FunctionDict){
return function(){try{var args=[]
for(var i=0;i<arguments.length;i++){if(arguments[i]===undefined){args.push(_b_.None)}
else{args.push(jsobj2pyobj(arguments[i]))}}
return pyobj.apply(null,args)}catch(err){console.log(err)
console.log(_b_.getattr(err,'info'))
console.log(err.__name__+':',err.args[0])
throw err}}}else{
return pyobj}}
var $JSObjectDict={__class__:$B.$type,__name__:'JSObject',toString:function(){return '(JSObject)'}}
$JSObjectDict.__bool__=function(self){return(new Boolean(self.js)).valueOf()}
$JSObjectDict.__delattr__=function(self,attr){_b_.getattr(self,attr)
delete self.js[attr]
return _b_.None}
$JSObjectDict.__dir__=function(self){return Object.keys(self.js)}
$JSObjectDict.__getattribute__=function(self,attr){if(attr.substr(0,2)=='$$')attr=attr.substr(2)
if(self.js===null)return $ObjectDict.__getattribute__(None,attr)
if(attr==='__class__')return $JSObjectDict
if(self.__class__===$JSObjectDict && attr=="$bind" && 
self.js[attr]===undefined &&
self.js['addEventListener']!==undefined){attr='addEventListener'}
var js_attr=self.js[attr]
if(self.js_func && self.js_func[attr]!==undefined){js_attr=self.js_func[attr]}
if(js_attr !==undefined){if(typeof js_attr=='function'){
var res=function(){var args=[],arg
for(var i=0,_len_i=arguments.length;i < _len_i;i++){if(arguments[i].$nat!=undefined){
throw TypeError("A Javascript function can't "+
"take keyword arguments")}else{args.push(pyobj2jsobj(arguments[i]))}}
if(attr==='replace' && self.js===location){location.replace(args[0])
return}
return $B.$JS2Py(js_attr.apply(self.js,args))}
res.__repr__=function(){return '<function '+attr+'>'}
res.__str__=function(){return '<function '+attr+'>'}
return{__class__:$JSObjectDict,js:res,js_func:js_attr}}else{if(Array.isArray(self.js[attr])){return self.js[attr]}
return $B.$JS2Py(self.js[attr])}}else if(self.js===window && attr==='$$location'){
return $Location()}
var res
var mro=self.__class__.__mro__
for(var i=0,_len_i=mro.length;i < _len_i;i++){var v=mro[i][attr]
if(v!==undefined){res=v
break}}
if(res!==undefined){if(typeof res==='function'){
return function(){var args=[self],arg
for(var i=0,_len_i=arguments.length;i < _len_i;i++){arg=arguments[i]
if(arg &&(arg.__class__===$JSObjectDict ||arg.__class__===$JSConstructorDict)){args.push(arg.js)}else{args.push(arg)}}
return res.apply(self,args)}}
return $B.$JS2Py(res)}else{
throw _b_.AttributeError("no attribute "+attr+' for '+self.js)}}
$JSObjectDict.__getitem__=function(self,rank){if(typeof self.js.length=='number' &&
typeof self.js.item=='function'){var rank_to_int=_b_.int(rank)
if(rank_to_int<0){rank_to_int+=self.js.length}
var res=self.js.item(rank_to_int)
if(res===undefined){throw _b_.KeyError(rank)}
return res}
try{return getattr(self.js,'__getitem__')(rank)}
catch(err){if(self.js[rank]!==undefined){return JSObject(self.js[rank])}
throw _b_.KeyError(rank)}}
var $JSObject_iterator=$B.$iterator_class('JS object iterator')
$JSObjectDict.__iter__=function(self){var items=[]
if(window.Symbol && self.js[Symbol.iterator]!==undefined){
if(self.js.length!==undefined && self.js.item!==undefined){for(var i=0;i<self.js.length ;i++){items.push(self.js[i])}}else{for(var item in self.js){if(self.js.hasOwnProperty(item )){items.push(jsobj2pyobj(item))}}}
return $B.$iterator(items,$JSObject_iterator)}else if(self.js.length!==undefined && self.js.item !==undefined){
for(var i=0;i<self.js.length ;i++){items.push(self.js[i])}
return $B.$iterator(items,$JSObject_iterator)}
var _dict=$JSObjectDict.to_dict(self)
return _b_.dict.$dict.__iter__(_dict)}
$JSObjectDict.__len__=function(self){if(typeof self.js.length=='number'){return self.js.length}
try{return getattr(self.js,'__len__')()}
catch(err){throw _b_.AttributeError(self.js+' has no attribute __len__')}}
$JSObjectDict.__mro__=[$JSObjectDict,$ObjectDict]
$JSObjectDict.__repr__=function(self){return "<JSObject wraps "+self.js+">"}
$JSObjectDict.__setattr__=function(self,attr,value){if(isinstance(value,JSObject)){self.js[attr]=value.js}
else{self.js[attr]=value
if(typeof value=='function'){self.js[attr]=function(){var args=[]
for(var i=0,len=arguments.length;i<len;i++){args.push($B.$JS2Py(arguments[i]))}
try{return value.apply(null,args)}
catch(err){err=$B.exception(err)
var info=_b_.getattr(err,'info')
err.toString=function(){return info+'\n'+err.__class__.__name__+
': '+_b_.repr(err.args[0])}
console.log(err+'')
throw err}}}}}
$JSObjectDict.__setitem__=$JSObjectDict.__setattr__
$JSObjectDict.__str__=$JSObjectDict.__repr__
var no_dict={'string':true,'function':true,'number':true,'boolean':true}
$JSObjectDict.bind=function(self,evt,func){var f=function(){try{func.apply(null,arguments)}catch(err){throw $B.exception(err)}}
return $JSObjectDict.__getattribute__(self,'addEventListener').js(evt,f)}
$JSObjectDict.to_dict=function(self){
var res=_b_.dict()
for(var key in self.js){var value=self.js[key]
if(typeof value=='object' && !Array.isArray(value)){_b_.dict.$dict.__setitem__(res,key,$JSObjectDict.to_dict(JSObject(value)))}else{_b_.dict.$dict.__setitem__(res,key,value)}}
return res}
function JSObject(obj){if(obj===null){return _b_.None}
if(typeof obj=='function'){return{__class__:$JSObjectDict,js:obj}}
var klass=$B.get_class(obj)
if(klass===_b_.float.$dict)return _b_.float(obj)
if(klass!==undefined)return obj
return{__class__:$JSObjectDict,js:obj}}
JSObject.__class__=$B.$factory
JSObject.$dict=$JSObjectDict
$JSObjectDict.$factory=JSObject
$B.JSObject=JSObject
$B.JSConstructor=JSConstructor})(__BRYTHON__)
;(function($B){$B.stdlib={}
var pylist=['VFS_import','__future__','_abcoll','_codecs','_collections','_csv','_dummy_thread','_functools','_imp','_io','_markupbase','_random','_socket','_sre','_string','_strptime','_struct','_sysconfigdata','_testcapi','_thread','_threading_local','_warnings','_weakref','_weakrefset','abc','antigravity','argparse','atexit','base64','bdb','binascii','bisect','calendar','cmd','code','codecs','codeop','colorsys','configparser','Clib','copy','copyreg','csv','datetime','decimal','difflib','doctest','errno','external_import','fnmatch','formatter','fractions','functools','gc','genericpath','getopt','gettext','glob','heapq','imp','inspect','io','itertools','keyword','linecache','locale','marshal','numbers','opcode','operator','optparse','os','pdb','pickle','platform','posix','posixpath','pprint','pwd','pydoc','queue','re','reprlib','select','shutil','signal','site','site-packages.__future__','site-packages.docs','site-packages.header','site-packages.highlight','site-packages.test_sp','site-packages.turtle','socket','sre_compile','sre_constants','sre_parse','stat','string','struct','subprocess','sys','sysconfig','tarfile','tempfile','test.namespace_pkgs.module_and_namespace_package.a_test','textwrap','this','threading','time','timeit','token','tokenize','traceback','types','uuid','warnings','weakref','webbrowser','zipfile','zlib']
for(var i=0;i<pylist.length;i++)$B.stdlib[pylist[i]]=['py']
var js=['_ajax','_browser','_html','_jsre','_multiprocessing','_posixsubprocess','_svg','_sys','aes','builtins','dis','hashlib','hmac-md5','hmac-ripemd160','hmac-sha1','hmac-sha224','hmac-sha256','hmac-sha3','hmac-sha384','hmac-sha512','javascript','json','long_int','math','md5','modulefinder','pbkdf2','rabbit','rabbit-legacy','random','rc4','ripemd160','sha1','sha224','sha256','sha3','sha384','sha512','tripledes']
for(var i=0;i<js.length;i++)$B.stdlib[js[i]]=['js']
var pkglist=['browser','collections','encodings','html','http','importlib','jqueryui','logging','multiprocessing','multiprocessing.dummy','pydoc_data','site-packages.ui','test','test.encoded_modules','test.leakers','test.namespace_pkgs.not_a_namespace_pkg.foo','test.support','test.test_email','test.test_importlib','test.test_importlib.builtin','test.test_importlib.extension','test.test_importlib.frozen','test.test_importlib.import_','test.test_importlib.source','test.test_json','test.tracedmodules','unittest','unittest.test','unittest.test.testmock','urllib','xml','xml.dom','xml.etree','xml.parsers','xml.sax']
for(var i=0;i<pkglist.length;i++)$B.stdlib[pkglist[i]]=['py',true]})(__BRYTHON__)

;(function($B){var _b_=$B.builtins
$B.$ModuleDict={__class__ : $B.$type,__name__ : 'module'}
$B.$ModuleDict.__repr__=$B.$ModuleDict.__str__=function(self){return '<module '+self.__name__+'>'}
$B.$ModuleDict.__mro__=[$B.$ModuleDict,_b_.object.$dict]
function module(name,doc,package){return{__class__:$B.$ModuleDict,__name__:name,__doc__:doc||_b_.None,__package__:package||_b_.None}}
module.__class__=$B.$factory
module.$dict=$B.$ModuleDict
$B.$ModuleDict.$factory=module
var loader=function(){}
var Loader={__class__:$B.$type,__name__ : 'Loader'}
Loader.__mro__=[Loader,_b_.object.$dict]
Loader.$factory=loader
loader.$dict=Loader
loader.__class__=$B.$factory
function parent_package(mod_name){var parts=mod_name.split('.');
parts.pop();
return parts.join('.');}
function $importer(){
var $xmlhttp=new XMLHttpRequest();
if($B.$CORS && "withCredentials" in $xmlhttp){}else if($B.$CORS && typeof window.XDomainRequest !="undefined"){
$xmlhttp=new window.XDomainRequest();}else if(window.XMLHttpRequest){}else{
$xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");}
var fake_qs;
switch($B.$options.cache){case 'version':
fake_qs="?v="+$B.version_info[2]
break;
case 'browser':
fake_qs=''
break;
default:
fake_qs="?v="+$B.UUID()}
var timer=setTimeout(function(){$xmlhttp.abort()
throw _b_.ImportError("No module named '"+module+"'")},5000)
return[$xmlhttp,fake_qs,timer]}
function $download_module(module,url,package,blocking){var imp=$importer(),$xmlhttp=imp[0],fake_qs=imp[1],timer=imp[2],res=null,mod_name=module.__name__,no_block=Array.isArray(blocking)||blocking===false
if(no_block){console.log('download non blocking',mod_name)
$xmlhttp.open('GET',url+fake_qs,true)}else{$xmlhttp.open('GET',url+fake_qs,false)}
if($B.$CORS){$xmlhttp.onload=function(){if($xmlhttp.status==200 ||$xmlhttp.status==0){res=$xmlhttp.responseText}else{
res=_b_.FileNotFoundError("No module named '"+mod_name+"'")}}
$xmlhttp.onerror=function(){res=_b_.FileNotFoundError("No module named '"+mod_name+"'")}}else{
$xmlhttp.onreadystatechange=function(){if($xmlhttp.readyState==4){window.clearTimeout(timer)
if($xmlhttp.status==200 ||$xmlhttp.status==0){res=$xmlhttp.responseText
module.$last_modified=$xmlhttp.getResponseHeader('Last-Modified')
if(no_block){var ext=url.substr(url.length-2)
if(ext=='py'){try{import_py1(module,mod_name,url,package,res)}
catch(err){console.log(err);throw err}}else if(ext=='js'){try{run_js(res,url,module)}
catch(err){console.log(err);throw err}}
console.log('non blocking ok',mod_name)
blocking[1]()
return}}else{
console.log('Error '+$xmlhttp.status+
' means that Python module '+mod_name+
' was not found at url '+url)
res=_b_.FileNotFoundError("No module named '"+mod_name+"'")}}}}
if('overrideMimeType' in $xmlhttp){$xmlhttp.overrideMimeType("text/plain")}
$xmlhttp.send()
if(!no_block){
if(res==null)throw _b_.FileNotFoundError("No module named '"+mod_name+"' (res is null)")
if(res.constructor===Error){throw res}
return res}}
$B.$download_module=$download_module
function import_js(module,path,blocking){try{var module_contents=$download_module(module,path,undefined,blocking)
if(Array.isArray(blocking)){return}}catch(err){return null}
run_js(module_contents,path,module)
return true}
function run_js(module_contents,path,module){
try{eval(module_contents);}catch(err){console.log(err)
throw err}
try{$module}
catch(err){console.log('no $module')
throw _b_.ImportError("name '$module' is not defined in module")}
if(module !==undefined){
for(var attr in $module){module[attr]=$module[attr];}
$module=module;}
else{
$module.__class__=$B.$ModuleDict
$module.__name__=module.name
$module.__repr__=$module.__str__=function(){if($B.builtin_module_names.indexOf(module.name)> -1){return "<module '"+module.name+"' (built-in)>"}
return "<module '"+module.name+"' from "+path+" >"}
$module.toString=function(){return "<module '"+module.name+"' from "+path+" >"}
if(module.name !='builtins'){
$module.__file__=path}}
$B.imported[module.__name__]=$module
return true}
function show_ns(){var kk=Object.keys(window)
for(var i=0,_len_i=kk.length;i < _len_i;i++){console.log(kk[i])
if(kk[i].charAt(0)=='$'){console.log(eval(kk[i]))}}
console.log('---')}
function import_py1(module,mod_name,path,package,module_contents){console.log('importpy1',mod_name)
$B.imported[mod_name].$is_package=module.$is_package
$B.imported[mod_name].$last_modified=module.$last_modified
if(path.substr(path.length-12)=='/__init__.py'){
$B.imported[mod_name].__package__=mod_name
$B.imported[mod_name].__path__=path
$B.imported[mod_name].$is_package=module.$is_package=true}else if(package){$B.imported[mod_name].__package__=package}else{var mod_elts=mod_name.split('.')
mod_elts.pop()
$B.imported[mod_name].__package__=mod_elts.join('.')}
$B.imported[mod_name].__file__=path
return run_py(module_contents,path,module)}
function import_py(module,path,package,blocking){
var mod_name=module.__name__,module_contents=$download_module(module,path,package,blocking)
if(Array.isArray(blocking)){return}
$B.imported[mod_name].$is_package=module.$is_package
$B.imported[mod_name].$last_modified=module.$last_modified
if(path.substr(path.length-12)=='/__init__.py'){
$B.imported[mod_name].__package__=mod_name
$B.imported[mod_name].__path__=path
$B.imported[mod_name].$is_package=module.$is_package=true}else if(package){$B.imported[mod_name].__package__=package}else{var mod_elts=mod_name.split('.')
mod_elts.pop()
$B.imported[mod_name].__package__=mod_elts.join('.')}
$B.imported[mod_name].__file__=path
return run_py(module_contents,path,module)}
$B.run_py=run_py=function(module_contents,path,module,compiled){if(!compiled){var $Node=$B.$Node,$NodeJSCtx=$B.$NodeJSCtx
$B.$py_module_path[module.__name__]=path
var root=$B.py2js(module_contents,module.__name__,module.__name__,'__builtins__')
var body=root.children
root.children=[]
var mod_node=new $Node('expression')
new $NodeJSCtx(mod_node,'var $module=(function()')
root.insert(0,mod_node)
for(var i=0,_len_i=body.length;i < _len_i;i++){mod_node.add(body[i])}
var ret_node=new $Node('expression')
new $NodeJSCtx(ret_node,'return $locals_'+module.__name__.replace(/\./g,'_'))
mod_node.add(ret_node)
var ex_node=new $Node('expression')
new $NodeJSCtx(ex_node,')(__BRYTHON__)')
root.add(ex_node)}
try{var js=(compiled)? module_contents : root.to_js()
if($B.$options.debug==10){console.log('code for module '+module.__name__)
console.log(js)}
eval(js)}catch(err){
throw err}
try{
var mod=eval('$module')
for(var attr in mod){module[attr]=mod[attr];}
module.__initializing__=false
$B.imported[module.__name__]=module
return true}catch(err){console.log(''+err+' '+' for module '+module.name)
for(var attr in err)console.log(attr+' '+err[attr])
if($B.debug>0){console.log('line info '+__BRYTHON__.line_info)}
throw err}}
function new_spec(fields){
fields.__class__=$B.$ModuleDict
return fields;}
function finder_VFS(){return{__class__:finder_VFS.$dict}}
finder_VFS.__class__=$B.$factory
finder_VFS.$dict={$factory: finder_VFS,__class__: $B.$type,__name__: 'VFSFinder',create_module : function(cls,spec){
return _b_.None;},exec_module : function(cls,module){var stored=module.__spec__.loader_state.stored;
delete module.__spec__['loader_state'];
var ext=stored[0],module_contents=stored[1];
module.$is_package=stored[2];
var path=$B.brython_path+'Lib/'+module.__name__
if(module.$is_package){path +='/__init__.py'}
module.__file__=path
if(ext=='.js'){run_js(module_contents,module.__path__,module)}
else{run_py(module_contents,module.__path__,module,ext=='.pyc.js')}
if($B.debug>1){console.log('import '+module.__name__+' from VFS')}},find_module: function(cls,name,path){return{__class__:Loader,load_module:function(name,path){var spec=cls.$dict.find_spec(cls,name,path)
var mod=module(name)
$B.imported[name]=mod
mod.__spec__=spec
cls.$dict.exec_module(cls,mod)}}},find_spec : function(cls,fullname,path,prev_module){if(!$B.use_VFS){return _b_.None;}
var stored=$B.VFS[fullname];
if(stored===undefined){return _b_.None;}
var is_package=stored[2],is_builtin=$B.builtin_module_names.indexOf(fullname)> -1;
return new_spec({name : fullname,loader: cls,
origin : is_builtin? 'built-in' : 'py_VFS',
submodule_search_locations: is_package?[]: _b_.None,loader_state:{stored: stored},
cached: _b_.None,parent: is_package? fullname : parent_package(fullname),has_location: _b_.False});}}
finder_VFS.$dict.__mro__=[finder_VFS.$dict,_b_.object.$dict]
finder_VFS.$dict.create_module.$type='classmethod'
finder_VFS.$dict.exec_module.$type='classmethod'
finder_VFS.$dict.find_module.$type='classmethod'
finder_VFS.$dict.find_spec.$type='classmethod'
function finder_stdlib_static(){return{__class__:finder_stdlib_static.$dict}}
finder_stdlib_static.__class__=$B.$factory
finder_stdlib_static.$dict={$factory : finder_stdlib_static,__class__ : $B.$type,__name__ : 'StdlibStatic',create_module : function(cls,spec){
return _b_.None;},exec_module : function(cls,module,blocking){var metadata=module.__spec__.loader_state;
module.$is_package=metadata.is_package;
if(metadata.ext=='py'){import_py(module,metadata.path,module.__package__,blocking);}
else{
import_js(module,metadata.path,blocking);}
delete module.__spec__['loader_state'];},find_module: function(cls,name,path){var spec=cls.$dict.find_spec(cls,name,path)
if(spec===_b_.None){return _b_.None}
return{__class__:Loader,load_module:function(name,path){var mod=module(name)
$B.imported[name]=mod
mod.__spec__=spec
mod.__package__=spec.parent
cls.$dict.exec_module(cls,mod,spec.blocking)}}},find_spec: function(cls,fullname,path,prev_module){if($B.stdlib){var address=$B.stdlib[fullname];
if(address===undefined){var elts=fullname.split('.')
if(elts.length>1){var mod_name=elts.pop()
var package=$B.stdlib[elts.join('.')]
if(package && package[1]){address=['py']}}}
if(address !==undefined){var ext=address[0],is_pkg=address[1]!==undefined,path=$B.brython_path +((ext=='py')? 'Lib/' : 'libs/')+
fullname.replace(/\./g,'/'),metadata={ext: ext,is_package: is_pkg,path: path +(is_pkg? '/__init__.py' :
((ext=='py')? '.py' : '.js')),address: address}
var res=new_spec(
{name : fullname,loader: cls,
origin : metadata.path,submodule_search_locations: is_pkg?[path]: _b_.None,loader_state: metadata,
cached: _b_.None,parent: is_pkg? fullname :
parent_package(fullname),has_location: _b_.True});
return res}}
return _b_.None;}}
finder_stdlib_static.$dict.__mro__=[finder_stdlib_static.$dict,_b_.object.$dict]
finder_stdlib_static.$dict.create_module.$type='classmethod'
finder_stdlib_static.$dict.exec_module.$type='classmethod'
finder_stdlib_static.$dict.find_module.$type='classmethod'
finder_stdlib_static.$dict.find_spec.$type='classmethod'
function finder_path(){return{__class__:finder_path.$dict}}
finder_path.__class__=$B.$factory
finder_path.$dict={$factory: finder_path,__class__: $B.$type,__name__: 'ImporterPath',create_module : function(cls,spec){
return _b_.None;},exec_module : function(cls,module){var _spec=_b_.getattr(module,'__spec__'),code=_spec.loader_state.code;
module.$is_package=_spec.loader_state.is_package,delete _spec.loader_state['code'];
var src_type=_spec.loader_state.type
if(src_type=='py' ||src_type=='pyc.js'){run_py(code,_spec.origin,module,src_type=='pyc.js');}
else if(_spec.loader_state.type=='js'){run_js(code,_spec.origin,module)}},find_module: function(cls,name,path){return finder_path.$dict.find_spec(cls,name,path)},find_spec : function(cls,fullname,path,prev_module){if(is_none(path)){
path=$B.path}
for(var i=0,li=path.length;i<li;++i){var path_entry=path[i];
if(path_entry[path_entry.length - 1]!='/'){path_entry +='/'}
var finder=$B.path_importer_cache[path_entry];
if(finder===undefined){var finder_notfound=true;
for(var j=0,lj=$B.path_hooks.length;
j < lj && finder_notfound;
++j){var hook=$B.path_hooks[j];
try{
finder=_b_.getattr(hook,'__call__')(path_entry)
finder_notfound=false;}
catch(e){if(e.__class__ !==_b_.ImportError.$dict){throw e;}}}
if(finder_notfound){$B.path_importer_cache[path_entry]=_b_.None;}}
var spec=_b_.getattr(_b_.getattr(finder,'find_spec'),'__call__')(fullname,prev_module);
if(!is_none(spec)){return spec;}}
return _b_.None;}}
finder_path.$dict.__mro__=[finder_path.$dict,_b_.object.$dict]
finder_path.$dict.create_module.$type='classmethod'
finder_path.$dict.exec_module.$type='classmethod'
finder_path.$dict.find_module.$type='classmethod'
finder_path.$dict.find_spec.$type='classmethod'
function vfs_hook(path){if(path.substr(-1)=='/'){path=path.slice(0,-1);}
var ext=path.substr(-7);
if(ext !='.vfs.js'){throw _b_.ImportError('VFS file URL must end with .vfs.js extension');}
self={__class__: vfs_hook.$dict,path: path};
vfs_hook.$dict.load_vfs(self);
return self;}
vfs_hook.__class__=$B.$factory
vfs_hook.$dict={$factory: vfs_hook,__class__: $B.$type,__name__: 'VfsPathFinder',load_vfs: function(self){try{var code=$download_module({__name__:'<VFS>'},self.path)}
catch(e){self.vfs=undefined;
throw new _b_.ImportError(e.$message ||e.message);}
eval(code);
try{
self.vfs=$vfs;}
catch(e){throw new _b_.ImportError('Expecting $vfs var in VFS file');}
$B.path_importer_cache[self.path + '/']=self;},find_spec: function(self,fullname,module){if(self.vfs===undefined){try{vfs_hook.$dict.load_vfs(self)}
catch(e){console.log("Could not load VFS while importing '" + fullname + "'");
return _b_.None;}}
var stored=self.vfs[fullname];
if(stored===undefined){return _b_.None;}
var is_package=stored[2];
return new_spec({name : fullname,loader: finder_VFS,
origin : self.path + '#' + fullname,
submodule_search_locations: is_package?[self.path]:
_b_.None,loader_state:{stored: stored},
cached: _b_.None,parent: is_package? fullname : parent_package(fullname),has_location: _b_.True});},invalidate_caches: function(self){self.vfs=undefined;}}
vfs_hook.$dict.__mro__=[vfs_hook.$dict,_b_.object.$dict]
function url_hook(path_entry,hint){return{__class__: url_hook.$dict,path_entry:path_entry,hint:hint }}
url_hook.__class__=$B.$factory
url_hook.$dict={$factory: url_hook,__class__: $B.$type,__name__ : 'UrlPathFinder',__repr__: function(self){return '<UrlPathFinder' +(self.hint? " for '" + self.hint + "'":
"(unbound)")+ ' at ' + self.path_entry + '>'},find_spec : function(self,fullname,module){var loader_data={},notfound=true,hint=self.hint,base_path=self.path_entry + fullname.match(/[^.]+$/g)[0],modpaths=[];
var tryall=hint===undefined;
if(tryall ||hint=='js'){
modpaths=[[base_path + '.js','js',false]];}
if(tryall ||hint=='pyc.js'){
modpaths=modpaths.concat([[base_path + '.pyc.js','pyc.js',false],[base_path + '/__init__.pyc.js','pyc.js',true]]);}
if(tryall ||hint=='py'){
modpaths=modpaths.concat([[base_path + '.py','py',false],[base_path + '/__init__.py','py',true]]);}
for(var j=0;notfound && j < modpaths.length;++j){try{var file_info=modpaths[j];
loader_data.code=$download_module({__name__:fullname},file_info[0]);
notfound=false;
loader_data.type=file_info[1];
loader_data.is_package=file_info[2];
if(hint===undefined){self.hint=file_info[1];
$B.path_importer_cache[self.path_entry]=self;}
if(loader_data.is_package){
$B.path_importer_cache[base_path + '/']=
url_hook(base_path + '/',self.hint);}
loader_data.path=file_info[0];}catch(err){}}
if(!notfound){return new_spec({name : fullname,loader: finder_path,origin : loader_data.path,
submodule_search_locations: loader_data.is_package?[base_path]:
_b_.None,loader_state: loader_data,
cached: _b_.None,parent: loader_data.is_package? fullname :
parent_package(fullname),has_location: _b_.True});}
return _b_.None;},invalidate_caches : function(self){}}
url_hook.$dict.__mro__=[url_hook.$dict,_b_.object.$dict]
$B.$path_hooks=[vfs_hook,url_hook];
$B.path_importer_cache={};
var _sys_paths=[[$B.script_dir + '/','py'],[$B.brython_path + 'Lib/','py'],[$B.brython_path + 'Lib/site-packages/','py'],[$B.brython_path + 'libs/','js']];
for(i=0;i < _sys_paths.length;++i){var _path=_sys_paths[i],_type=_path[1];
_path=_path[0];
$B.path_importer_cache[_path]=url_hook(_path,_type);}
delete _path;
delete _type;
delete _sys_paths;
$B.is_none=function(o){return o===undefined ||o==_b_.None;}
$B.$__import__=function(mod_name,globals,locals,fromlist,level,blocking){
var modobj=$B.imported[mod_name],parsed_name=mod_name.split('.');
if(modobj==_b_.None){
throw _b_.ImportError(mod_name)}
if(modobj===undefined){
if(is_none(fromlist)){fromlist=[];}
for(var i=0,modsep='',_mod_name='',len=parsed_name.length - 1,__path__=_b_.None;i <=len;++i){var _parent_name=_mod_name;
_mod_name +=modsep + parsed_name[i];
modsep='.';
var modobj=$B.imported[_mod_name];
if(modobj==_b_.None){
throw _b_.ImportError(_mod_name)}
else if(modobj===undefined){try{$B.import_hooks(_mod_name,__path__,undefined,blocking)}
catch(err){delete $B.imported[_mod_name]
throw err}
if(is_none($B.imported[_mod_name])){throw _b_.ImportError(_mod_name)}
else{
if(_parent_name){_b_.setattr($B.imported[_parent_name],parsed_name[i],$B.imported[_mod_name]);}}}
if(i < len){try{__path__=_b_.getattr($B.imported[_mod_name],'__path__')}
catch(e){
if(i==len-1 && $B.imported[_mod_name][parsed_name[len]]&& 
$B.imported[_mod_name][parsed_name[len]].__class__===$B.$ModuleDict){return $B.imported[_mod_name][parsed_name[len]]}
throw _b_.ImportError(_mod_name)}}}}
else if(Array.isArray(blocking)){var frames=$B.frames_stack
for(var i=0;i<frames.length;i++){var locals_id='$locals_'+frames[i][0].replace(/\./g,'_')
eval('var '+locals_id+'=frames[i][1]')}
eval('var $locals='+locals_id)
blocking[1]()}
if(fromlist.length > 0){
return $B.imported[mod_name]}
else{
return $B.imported[parsed_name[0]]}}
$B.$import=function(mod_name,fromlist,aliases,locals,blocking){var parts=mod_name.split('.');
if(mod_name[mod_name.length - 1]=='.'){parts.pop()}
var norm_parts=[],prefix=true;
for(var i=0,_len_i=parts.length;i < _len_i;i++){var p=parts[i];
if(prefix && p==''){
elt=norm_parts.pop();
if(elt===undefined){throw _b_.ImportError("Parent module '' not loaded, cannot perform relative import");}}
else{
prefix=false;
norm_parts.push(p.substr(0,2)=='$$' ? p.substr(2): p)}}
var mod_name=norm_parts.join('.')
if($B.$options.debug==10){console.log('$import '+mod_name)
console.log('use VFS ? '+$B.use_VFS)
console.log('use static stdlib paths ? '+$B.static_stdlib_import)}
var current_frame=$B.frames_stack[$B.frames_stack.length-1],_globals=current_frame[3],__import__=_globals['__import__'],globals=$B.obj_dict(_globals);
if(__import__===undefined){
__import__=$B.$__import__;}
var modobj=_b_.getattr(__import__,'__call__')(mod_name,globals,undefined,fromlist,0);
if(!fromlist ||fromlist.length==0){
var alias=aliases[mod_name];
if(alias){locals[alias]=$B.imported[mod_name];}
else{
locals[norm_parts[0]]=modobj;}}
else{
var __all__=fromlist,thunk={};
if(fromlist && fromlist[0]=='*'){__all__=_b_.getattr(modobj,'__all__',thunk);
if(__all__ !==thunk){
aliases={};}}
if(__all__===thunk){
for(var attr in modobj){if(attr[0]!=='_'){locals[attr]=modobj[attr];}}}
else{
for(var i=0,l=__all__.length;i < l;++i){var name=__all__[i];
var alias=aliases[name]||name;
try{
locals[alias]=_b_.getattr(modobj,name);}
catch($err1){
try{_b_.getattr(__import__,'__call__')(mod_name + '.' + name,globals,undefined,[],0);
locals[alias]=_b_.getattr(modobj,name);}
catch($err3){
throw _b_.ImportError("cannot import name '"+name+"'")}}}}}}
$B.$import_non_blocking=function(mod_name,func){console.log('import non blocking',mod_name)
$B.$import(mod_name,[],[],{},[false,func])}
$B.$meta_path=[finder_VFS,finder_stdlib_static,finder_path];
function optimize_import_for_path(path,filetype){if(path.slice(-1)!='/'){path=path + '/' }
$B.path_importer_cache[path]=url_hook(path,filetype);}
_importlib_module={__class__ : $B.$ModuleDict,__name__ : '_importlib',Loader: Loader,VFSFinder: finder_VFS,StdlibStatic: finder_stdlib_static,ImporterPath: finder_path,VFSPathFinder : vfs_hook,UrlPathFinder: url_hook,optimize_import_for_path : optimize_import_for_path}
_importlib_module.__repr__=_importlib_module.__str__=function(){return "<module '_importlib' (built-in)>"}
$B.imported['_importlib']=$B.modules['_importlib']=_importlib_module})(__BRYTHON__)
;(function($B){eval($B.InjectBuiltins())
var $ObjectDict=_b_.object.$dict
function $err(op,other){var msg="unsupported operand type(s) for "+op
msg +=": 'float' and '"+$.get_class(other).__name__+"'"
throw _b_.TypeError(msg)}
var $FloatDict={__class__:$B.$type,__dir__:$ObjectDict.__dir__,__name__:'float',$native:true}
$FloatDict.as_integer_ratio=function(self){if(self.valueOf()==Number.POSITIVE_INFINITY ||
self.valueOf()==Number.NEGATIVE_INFINITY){throw _b_.OverflowError("Cannot pass infinity to float.as_integer_ratio.")}
if(!Number.isFinite(self.valueOf())){throw _b_.ValueError("Cannot pass NaN to float.as_integer_ratio.")}
var tmp=_b_.$frexp(self.valueOf())
var fp=tmp[0]
var exponent=tmp[1]
for(var i=0;i < 300;i++){if(fp==Math.floor(fp)){break}else{
fp *=2
exponent--}}
numerator=float(fp)
py_exponent=abs(exponent)
denominator=1
py_exponent=_b_.getattr(int(denominator),"__lshift__")(py_exponent)
if(exponent > 0){numerator=numerator * py_exponent}else{
denominator=py_exponent}
return _b_.tuple([_b_.int(numerator),_b_.int(denominator)])}
$FloatDict.__bool__=function(self){return _b_.bool(self.valueOf())}
$FloatDict.__class__=$B.$type
$FloatDict.__eq__=function(self,other){if(isNaN(self)&& isNaN(other)){return true}
if(isinstance(other,_b_.int))return self==other
if(isinstance(other,float)){
return self.valueOf()==other.valueOf()}
if(isinstance(other,_b_.complex)){if(other.imag !=0)return false
return self==other.real}
if(_b_.hasattr(other,'__eq__')){return _b_.getattr(other,'__eq__')(self.value)}
return self.value===other}
$FloatDict.__floordiv__=function(self,other){if(isinstance(other,[_b_.int,float])){if(other.valueOf()==0)throw ZeroDivisionError('division by zero')
return float(Math.floor(self/other))}
if(hasattr(other,'__rfloordiv__')){return getattr(other,'__rfloordiv__')(self)}
$err('//',other)}
$FloatDict.fromhex=function(arg){
if(!isinstance(arg,_b_.str)){throw _b_.ValueError('argument must be a string')}
var value=arg.trim()
switch(value.toLowerCase()){case '+inf':
case 'inf':
case '+infinity':
case 'infinity':
return $FloatClass(Infinity)
case '-inf':
case '-infinity':
return $FloatClass(-Infinity)
case '+nan':
case 'nan':
return $FloatClass(Number.NaN)
case '-nan':
return $FloatClass(-Number.NaN)
case '':
throw _b_.ValueError('count not convert string to float')}
var _m=/^(\d*\.?\d*)$/.exec(value)
if(_m !==null)return $FloatClass(parseFloat(_m[1]))
var _m=/^(\+|-)?(0x)?([0-9A-F]+\.?)?(\.[0-9A-F]+)?(p(\+|-)?\d+)?$/i.exec(value)
if(_m==null)throw _b_.ValueError('invalid hexadecimal floating-point string')
var _sign=_m[1]
var _int=parseInt(_m[3]||'0',16)
var _fraction=_m[4]||'.0'
var _exponent=_m[5]||'p0'
if(_sign=='-'){_sign=-1}else{_sign=1}
var _sum=_int
for(var i=1,_len_i=_fraction.length;i < _len_i;i++){_sum+=parseInt(_fraction.charAt(i),16)/Math.pow(16,i)}
return new Number(_sign * _sum * Math.pow(2,parseInt(_exponent.substring(1))))}
$FloatDict.__getformat__=function(arg){if(arg=='double' ||arg=='float')return 'IEEE, little-endian'
throw _b_.ValueError("__getformat__() argument 1 must be 'double' or 'float'")}
function preformat(self,fmt){if(fmt.empty){return _b_.str(self)}
if(fmt.type && 'eEfFgGn%'.indexOf(fmt.type)==-1){throw _b_.ValueError("Unknown format code '"+fmt.type+
"' for object of type 'float'")}
if(isNaN(self)){if(fmt.type=='f'||fmt.type=='g'){return 'nan'}
else{return 'NAN'}}
if(self==Number.POSITIVE_INFINITY){if(fmt.type=='f'||fmt.type=='g'){return 'inf'}
else{return 'INF'}}
if(fmt.precision===undefined && fmt.type !==undefined){fmt.precision=6}
if(fmt.type=='%'){self *=100}
if(fmt.type=='e'){var res=self.toExponential(fmt.precision),exp=parseInt(res.substr(res.search('e')+1))
if(Math.abs(exp)<10){res=res.substr(0,res.length-1)+'0'+
res.charAt(res.length-1)}
return res }
if(fmt.precision!==undefined){
var prec=fmt.precision
if(prec && 'fF%'.indexOf(fmt.type)>-1){var pos_pt=Math.abs(self).toString().search(/\./)
if(pos_pt>-1){prec+=pos_pt}else{prec=Math.abs(self).toString().length}}
var res=self.toPrecision(prec),pt_pos=res.indexOf('.')
if(fmt.type!==undefined && 
(fmt.type=='%' ||fmt.type.toLowerCase()=='f')){if(pt_pos==-1){res +='.'+'0'.repeat(fmt.precision)}
else{missing=fmt.precision-res.length+pt_pos+1
if(missing>0)res +='0'.repeat(missing)}}else{var res1=self.toExponential(fmt.precision-1),exp=parseInt(res1.substr(res1.search('e')+1))
if(exp<-4 ||exp>=fmt.precision-1){res=res1
if(Math.abs(exp)<10){res=res.substr(0,res.length-1)+'0'+
res.charAt(res.length-1)}}}}else{var res=_b_.str(self)}
if(fmt.type===undefined||'gGn'.indexOf(fmt.type)!=-1){
while(res.charAt(res.length-1)=='0'){res=res.substr(0,res.length-1)}
if(res.charAt(res.length-1)=='.'){if(fmt.type===undefined){res +='0'}
else{res=res.substr(0,res.length-1)}}}
if(fmt.sign!==undefined){if((fmt.sign==' ' ||fmt.sign=='+')&& self>0){res=fmt.sign+res}}
if(fmt.type=='%'){res+='%'}
return res}
$FloatDict.__format__=function(self,format_spec){var fmt=new $B.parse_format_spec(format_spec)
fmt.align=fmt.align ||'>'
var raw=preformat(self,fmt).split('.'),_int=raw[0]
if(fmt.comma){var len=_int.length,nb=Math.ceil(_int.length/3),chunks=[]
for(var i=0;i<nb;i++){chunks.push(_int.substring(len-3*i-3,len-3*i))}
chunks.reverse()
raw[0]=chunks.join(',')}
return $B.format_width(raw.join('.'),fmt)}
$FloatDict.__hash__=function(self){if(self===undefined){return $FloatDict.__hashvalue__ ||$B.$py_next_hash-- }
var _v=self.valueOf()
if(_v===Infinity)return 314159
if(_v===-Infinity)return -271828
if(isNaN(_v))return 0
if(_v==Math.round(_v))return Math.round(_v)
var r=_b_.$frexp(_v)
r[0]*=Math.pow(2,31)
var hipart=_b_.int(r[0])
r[0]=(r[0]- hipart)* Math.pow(2,31)
var x=hipart + _b_.int(r[0])+(r[1]<< 15)
return x & 0xFFFFFFFF}
_b_.$isninf=function(x){var x1=x
if(isinstance(x,float))x1=x.valueOf()
return x1==-Infinity ||x1==Number.NEGATIVE_INFINITY}
_b_.$isinf=function(x){var x1=x
if(isinstance(x,float))x1=x.valueOf()
return x1==Infinity ||x1==-Infinity ||x1==Number.POSITIVE_INFINITY ||x1==Number.NEGATIVE_INFINITY}
_b_.$fabs=function(x){return x>0?float(x):float(-x)}
_b_.$frexp=function(x){var x1=x
if(isinstance(x,float))x1=x.valueOf()
if(isNaN(x1)||_b_.$isinf(x1)){return[x1,-1]}
if(x1==0)return[0,0]
var sign=1,ex=0,man=x1
if(man < 0.){sign=-sign
man=-man}
while(man < 0.5){man *=2.0
ex--}
while(man >=1.0){man *=0.5
ex++}
man *=sign
return[man ,ex]}
_b_.$ldexp=function(x,i){if(_b_.$isninf(x))return float('-inf')
if(_b_.$isinf(x))return float('inf')
var y=x
if(isinstance(x,float))y=x.valueOf()
if(y==0)return y
var j=i
if(isinstance(i,float))j=i.valueOf()
return y * Math.pow(2,j)}
$FloatDict.hex=function(self){
var DBL_MANT_DIG=53 
var TOHEX_NBITS=DBL_MANT_DIG + 3 -(DBL_MANT_DIG+2)%4;
switch(self.valueOf()){case Infinity:
case -Infinity:
case Number.NaN:
case -Number.NaN:
return self
case -0:
return '-0x0.0p0'
case 0:
return '0x0.0p0'}
var _a=_b_.$frexp(_b_.$fabs(self.valueOf()))
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
_m-=Math.floor(_m)}
var _esign='+'
if(_e < 0){_esign='-'
_e=-_e}
if(self.value < 0)return "-0x" + _s + 'p' + _esign + _e;
return "0x" + _s + 'p' + _esign + _e;}
$FloatDict.__init__=function(self,value){self=new Number(value)}
$FloatDict.__int__=function(self){return parseInt(self)}
$FloatDict.is_integer=function(self){return _b_.int(self)==self}
$FloatDict.__mod__=function(self,other){
if(other==0){throw ZeroDivisionError('float modulo')}
if(isinstance(other,_b_.int))return new Number((self%other+other)%other)
if(isinstance(other,float)){
var q=Math.floor(self/other),r=self-other*q
return new Number(r)}
if(isinstance(other,_b_.bool)){var bool_value=0;
if(other.valueOf())bool_value=1;
return new Number((self%bool_value+bool_value)%bool_value)}
if(hasattr(other,'__rmod__'))return getattr(other,'__rmod__')(self)
$err('%',other)}
$FloatDict.__mro__=[$FloatDict,$ObjectDict]
$FloatDict.__mul__=function(self,other){if(isinstance(other,_b_.int)){if(other.__class__==$B.LongInt.$dict){return new Number(self*parseFloat(other.value))}
return new Number(self*other)}
if(isinstance(other,float))return new Number(self*other)
if(isinstance(other,_b_.bool)){var bool_value=0;
if(other.valueOf())bool_value=1;
return new Number(self*bool_value)}
if(isinstance(other,_b_.complex)){return _b_.complex(float(self*other.real),float(self*other.imag))}
if(hasattr(other,'__rmul__'))return getattr(other,'__rmul__')(self)
$err('*',other)}
$FloatDict.__ne__=function(self,other){return !$FloatDict.__eq__(self,other)}
$FloatDict.__neg__=function(self,other){return float(-self)}
$FloatDict.__pos__=function(self){return self}
$FloatDict.__pow__=function(self,other){var other_int=isinstance(other,_b_.int)
if(other_int ||isinstance(other,float)){if(self==1){return self}
if(other==0){return new Number(1)}
if(self==-1 && 
(!isFinite(other)||other.__class__===$B.LongInt.$dict ||!$B.is_safe_int(other))
&& !isNaN(other)){return new Number(1)}
else if(self==0 && isFinite(other)&& other<0){throw _b_.ZeroDivisionError("0.0 cannot be raised to a negative power")}else if(self==Number.NEGATIVE_INFINITY && !isNaN(other)){if(other<0 && other%2==1){return new Number(-0.0)}else if(other<0){return new Number(0)}
else if(other>0 && other%2==1){return Number.NEGATIVE_INFINITY}else{return Number.POSITIVE_INFINITY}}else if(self==Number.POSITIVE_INFINITY && !isNaN(other)){return other>0 ? self : new Number(0)}
if(other==Number.NEGATIVE_INFINITY && !isNaN(self)){return Math.abs(self)<1 ? Number.POSITIVE_INFINITY : new Number(0)}else if(other==Number.POSITIVE_INFINITY && !isNaN(self)){return Math.abs(self)<1 ? new Number(0): Number.POSITIVE_INFINITY}
if(self<0 && !_b_.getattr(other,'__eq__')(_b_.int(other))){
return _b_.complex.$dict.__pow__(_b_.complex(self,0),other)}
return float(Math.pow(self,other))}
if(hasattr(other,'__rpow__'))return getattr(other,'__rpow__')(self)
$err("** or pow()",other)}
$FloatDict.__repr__=$FloatDict.__str__=function(self){if(self===float)return "<class 'float'>"
if(self.valueOf()==Infinity)return 'inf'
if(self.valueOf()==-Infinity)return '-inf'
if(isNaN(self.valueOf()))return 'nan'
var res=self.valueOf()+'' 
if(res.indexOf('.')==-1)res+='.0'
return _b_.str(res)}
$FloatDict.__setattr__=function(self,attr,value){if(self.constructor===Number){if($FloatDict[attr]===undefined){throw _b_.AttributeError("'float' object has no attribute '"+attr+"'")}else{throw _b_.AttributeError("'float' object attribute '"+attr+"' is read-only")}}
self[attr]=value
return $N}
$FloatDict.__truediv__=function(self,other){if(isinstance(other,[_b_.int,float])){if(other.valueOf()==0)throw ZeroDivisionError('division by zero')
return float(self/other)}
if(isinstance(other,_b_.complex)){var cmod=other.real*other.real+other.imag*other.imag
if(cmod==0)throw ZeroDivisionError('division by zero')
return _b_.complex(float(self*other.real/cmod),float(-self*other.imag/cmod))}
if(hasattr(other,'__rtruediv__'))return getattr(other,'__rtruediv__')(self)
$err('/',other)}
var $op_func=function(self,other){if(isinstance(other,_b_.int)){if(other.__class__===$B.LongInt.$dict){return float(self-parseInt(other.value))}else{return float(self-other)}}
if(isinstance(other,float))return float(self-other)
if(isinstance(other,_b_.bool)){var bool_value=0;
if(other.valueOf())bool_value=1;
return float(self-bool_value)}
if(isinstance(other,_b_.complex)){return _b_.complex(self - other.real,-other.imag)}
if(hasattr(other,'__rsub__'))return getattr(other,'__rsub__')(self)
$err('-',other)}
$op_func +='' 
var $ops={'+':'add','-':'sub'}
for(var $op in $ops){var $opf=$op_func.replace(/-/gm,$op)
$opf=$opf.replace(/__rsub__/gm,'__r'+$ops[$op]+'__')
eval('$FloatDict.__'+$ops[$op]+'__ = '+$opf)}
var $comp_func=function(self,other){if(isinstance(other,_b_.int)){if(other.__class__===$B.LongInt.$dict){return self > parseInt(other.value)}
return self > other.valueOf()}
if(isinstance(other,float))return self > other
if(isinstance(other,_b_.bool)){return self.valueOf()> _b_.bool.$dict.__hash__(other)}
if(hasattr(other,'__int__')||hasattr(other,'__index__')){return $IntDict.__gt__(self,$B.$GetInt(other))}
var inv_op=getattr(other,'__le__',null)
if(inv_op !==null){return inv_op(self)}
var inv_op=getattr(other,'__le__',null)
if(inv_op !==null){return inv_op(self)}
throw _b_.TypeError(
"unorderable types: "+self.__class__.__name__+'() > '+$B.get_class(other).__name__+"()")}
$comp_func +='' 
for(var $op in $B.$comps){eval("$FloatDict.__"+$B.$comps[$op]+'__ = '+
$comp_func.replace(/>/gm,$op).
replace(/__gt__/gm,'__'+$B.$comps[$op]+'__').
replace(/__le__/,'__'+$B.$inv_comps[$op]+'__'))}
$B.make_rmethods($FloatDict)
var $notimplemented=function(self,other){throw _b_.TypeError(
"unsupported operand types for OPERATOR: '"+self.__class__.__name__+
"' and '"+$B.get_class(other).__name__+"'")}
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
if($FloatDict[$opfunc]===undefined){eval('$FloatDict.'+$opfunc+"="+$notimplemented.replace(/OPERATOR/gm,$op))}}}
function $FloatClass(value){return new Number(value)}
function to_digits(s){
var arabic_digits='\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669',res=''
for(var i=0;i<s.length;i++){var x=arabic_digits.indexOf(s[i])
if(x>-1){res +=x}
else{res +=s[i]}}
return res}
var float=function(value){switch(value){case undefined:
return $FloatClass(0.0)
case Number.MAX_VALUE:
return $FloatClass(Infinity)
case -Number.MAX_VALUE:
return $FloatClass(-Infinity)}
if(typeof value=="number")return $FloatClass(value)
if(isinstance(value,float)){return value}
if(isinstance(value,_b_.bytes)){var s=getattr(value,'decode')('latin-1')
return float(getattr(value,'decode')('latin-1'))}
if(hasattr(value,'__float__')){return $FloatClass(getattr(value,'__float__')())}
if(typeof value=='string'){value=value.trim()
switch(value.toLowerCase()){case '+inf':
case 'inf':
case '+infinity':
case 'infinity':
return Number.POSITIVE_INFINITY
case '-inf':
case '-infinity':
return Number.NEGATIVE_INFINITY
case '+nan':
case 'nan':
return Number.NaN
case '-nan':
return -Number.NaN
case '':
throw _b_.ValueError('count not convert string to float')
default:
value=to_digits(value)
if(isFinite(value))return $FloatClass(eval(value))
else{
_b_.str.$dict.encode(value,'latin-1')
throw _b_.ValueError("Could not convert to float(): '"+_b_.str(value)+"'")}}}
throw _b_.TypeError("float() argument must be a string or a number, not '"+
$B.get_class(value).__name__+"'")}
float.__class__=$B.$factory
float.$dict=$FloatDict
$FloatDict.$factory=float
$FloatDict.__new__=$B.$__new__(float)
$B.$FloatClass=$FloatClass
_b_.float=float})(__BRYTHON__)
;(function($B){eval($B.InjectBuiltins())
var $ObjectDict=_b_.object.$dict,$N=_b_.None
function $err(op,other){var msg="unsupported operand type(s) for "+op
msg +=": 'int' and '"+$B.get_class(other).__name__+"'"
throw _b_.TypeError(msg)}
var $IntDict={__class__:$B.$type,__name__:'int',__dir__:$ObjectDict.__dir__,toString:function(){return '$IntDict'},$native:true,descriptors:{'numerator':true,'denominator':true,'imag':true,'real':true}}
$IntDict.from_bytes=function(){var $=$B.args("from_bytes",3,{bytes:null,byteorder:null,signed:null},['bytes','byteorder','signed'],arguments,{signed:False},null,null)
var x=$.bytes,byteorder=$.byteorder,signed=$.signed
var _bytes,_len
if(isinstance(x,[_b_.list,_b_.tuple])){_bytes=x
_len=len(x)}else if(isinstance(x,[_b_.bytes,_b_.bytearray])){_bytes=x.source
_len=x.source.length}else{
_b_.TypeError("Error! " + _b_.type(x)+ " is not supported in int.from_bytes. fix me!")}
switch(byteorder){case 'big':
var num=_bytes[_len - 1];
var _mult=256
for(var i=(_len - 2);i >=0;i--){
num=$B.add($B.mul(_mult,_bytes[i]),num)
_mult=$B.mul(_mult,256)}
if(!signed)return num
if(_bytes[0]< 128)return num
return $B.sub(num,_mult)
case 'little':
var num=_bytes[0]
if(num >=128)num=num - 256
var _mult=256
for(var i=1;i < _len;i++){num=$B.add($B.mul(_mult,_bytes[i]),num)
_mult=$B.mul(_mult,256)}
if(!signed)return num
if(_bytes[_len - 1]< 128)return num
return $B.sub(num,_mult)}
throw _b_.ValueError("byteorder must be either 'little' or 'big'");}
$IntDict.to_bytes=function(length,byteorder,star){
throw _b_.NotImplementedError("int.to_bytes is not implemented yet")}
$IntDict.__abs__=function(self){return abs(self)}
$IntDict.__bool__=function(self){return new Boolean(self.valueOf())}
$IntDict.__ceil__=function(self){return Math.ceil(self)}
$IntDict.__class__=$B.$type
$IntDict.__divmod__=function(self,other){return divmod(self,other)}
$IntDict.__eq__=function(self,other){
if(other===undefined)return self===int
if(isinstance(other,int))return self.valueOf()==other.valueOf()
if(isinstance(other,_b_.float))return self.valueOf()==other.valueOf()
if(isinstance(other,_b_.complex)){if(other.imag !=0)return False
return self.valueOf()==other.real}
if(hasattr(other,'__eq__'))return getattr(other,'__eq__')(self)
return self.valueOf()===other}
function preformat(self,fmt){if(fmt.empty){return _b_.str(self)}
if(fmt.type && 'bcdoxXn'.indexOf(fmt.type)==-1){throw _b_.ValueError("Unknown format code '"+fmt.type+
"' for object of type 'int'")}
switch(fmt.type){case undefined:
case 'd':
return self.toString()
case 'b':
return(fmt.alternate ? '0b' : '')+ self.toString(2)
case 'c':
return _b_.chr(self)
case 'o':
return(fmt.alternate ? '0o' : '')+ self.toString(8)
case 'x':
return(fmt.alternate ? '0x' : '')+ self.toString(16)
case 'X':
return(fmt.alternate ? '0X' : '')+ self.toString(16).toUpperCase()
case 'n':
return self }
return res}
$IntDict.__format__=function(self,format_spec){var fmt=new $B.parse_format_spec(format_spec)
if(fmt.type && 'eEfFgG%'.indexOf(fmt.type)!=-1){
return _b_.float.$dict.__format__(self,format_spec)}
fmt.align=fmt.align ||'>'
var res=preformat(self,fmt)
if(fmt.comma){var len=res.length,nb=Math.ceil(res.length/3),chunks=[]
for(var i=0;i<nb;i++){chunks.push(res.substring(len-3*i-3,len-3*i))}
chunks.reverse()
res=chunks.join(',')}
return $B.format_width(res,fmt)}
$IntDict.__floordiv__=function(self,other){if(isinstance(other,int)){if(other==0)throw ZeroDivisionError('division by zero')
return Math.floor(self/other)}
if(isinstance(other,_b_.float)){if(!other.valueOf())throw ZeroDivisionError('division by zero')
return Math.floor(self/other)}
if(hasattr(other,'__rfloordiv__')){return getattr(other,'__rfloordiv__')(self)}
$err("//",other)}
$IntDict.__hash__=function(self){if(self===undefined){return $IntDict.__hashvalue__ ||$B.$py_next_hash-- }
return self.valueOf()}
$IntDict.__index__=function(self){return self}
$IntDict.__init__=function(self,value){if(value===undefined){value=0}
self.toString=function(){return value}
return $N}
$IntDict.__int__=function(self){return self}
$IntDict.__invert__=function(self){return ~self}
$IntDict.__lshift__=function(self,other){if(isinstance(other,int)){return int($B.LongInt.$dict.__lshift__($B.LongInt(self),$B.LongInt(other)))}
var rlshift=getattr(other,'__rlshift__',null)
if(rlshift!==null){return rlshift(self)}
$err('<<',other)}
$IntDict.__mod__=function(self,other){
if(isinstance(other,_b_.tuple)&& other.length==1)other=other[0]
if(isinstance(other,[int,_b_.float,bool])){if(other===false){other=0}else if(other===true){other=1}
if(other==0){throw _b_.ZeroDivisionError(
"integer division or modulo by zero")}
return(self%other+other)%other}
if(hasattr(other,'__rmod__'))return getattr(other,'__rmod__')(self)
$err('%',other)}
$IntDict.__mro__=[$IntDict,$ObjectDict]
$IntDict.__mul__=function(self,other){var val=self.valueOf()
if(typeof other==="string"){return other.repeat(val)}
if(isinstance(other,int)){var res=self*other
if(res>$B.min_int && res<$B.max_int){return res}
else{return int($B.LongInt.$dict.__mul__($B.LongInt(self),$B.LongInt(other)))}}
if(isinstance(other,_b_.float)){return new Number(self*other)}
if(isinstance(other,_b_.bool)){if(other.valueOf())return self
return int(0)}
if(isinstance(other,_b_.complex)){return _b_.complex($IntDict.__mul__(self,other.real),$IntDict.__mul__(self,other.imag))}
if(isinstance(other,[_b_.list,_b_.tuple])){var res=[]
var $temp=other.slice(0,other.length)
for(var i=0;i<val;i++)res=res.concat($temp)
if(isinstance(other,_b_.tuple))res=_b_.tuple(res)
return res}
if(hasattr(other,'__rmul__'))return getattr(other,'__rmul__')(self)
$err("*",other)}
$IntDict.__name__='int'
$IntDict.__neg__=function(self){return -self}
$IntDict.__new__=function(cls){if(cls===undefined){throw _b_.TypeError('int.__new__(): not enough arguments')}
return{__class__:cls.$dict}}
$IntDict.__pos__=function(self){return self}
$IntDict.__pow__=function(self,other){if(isinstance(other,int)){switch(other.valueOf()){case 0:
return int(1)
case 1:
return int(self.valueOf())}
var res=Math.pow(self.valueOf(),other.valueOf())
if(!isFinite(res)){return res}
if(res>$B.min_int && res<$B.max_int){return res}
else{return int($B.LongInt.$dict.__pow__($B.LongInt(self),$B.LongInt(other)))}}
if(isinstance(other,_b_.float)){if(self>=0){return new Number(Math.pow(self,other.valueOf()))}
else{
return _b_.complex.$dict.__pow__(_b_.complex(self,0),other)}}
if(hasattr(other,'__rpow__'))return getattr(other,'__rpow__')(self)
$err("**",other)}
$IntDict.__repr__=function(self){if(self===int)return "<class 'int'>"
return self.toString()}
$IntDict.__rshift__=function(self,other){if(isinstance(other,int)){return int($B.LongInt.$dict.__rshift__($B.LongInt(self),$B.LongInt(other)))}
var rrshift=getattr(other,'__rrshift__',null)
if(rrshift!==null){return rrshift(self)}
$err('>>',other)}
$IntDict.__setattr__=function(self,attr,value){if(typeof self=="number"){if($IntDict[attr]===undefined){throw _b_.AttributeError("'int' object has no attribute '"+attr+"'")}else{throw _b_.AttributeError("'int' object attribute '"+attr+"' is read-only")}}
self[attr]=value
return $N}
$IntDict.__str__=$IntDict.__repr__
$IntDict.__truediv__=function(self,other){if(isinstance(other,int)){if(other==0)throw ZeroDivisionError('division by zero')
if(other.__class__==$B.LongInt.$dict){return new Number(self/parseInt(other.value))}
return new Number(self/other)}
if(isinstance(other,_b_.float)){if(!other.valueOf())throw ZeroDivisionError('division by zero')
return new Number(self/other)}
if(isinstance(other,_b_.complex)){var cmod=other.real*other.real+other.imag*other.imag
if(cmod==0)throw ZeroDivisionError('division by zero')
return _b_.complex(self*other.real/cmod,-self*other.imag/cmod)}
if(hasattr(other,'__rtruediv__'))return getattr(other,'__rtruediv__')(self)
$err("/",other)}
$IntDict.bit_length=function(self){s=bin(self)
s=getattr(s,'lstrip')('-0b')
return s.length }
$IntDict.numerator=function(self){return self}
$IntDict.denominator=function(self){return int(1)}
$IntDict.imag=function(self){return int(0)}
$IntDict.real=function(self){return self}
$B.max_int32=(1<<30)* 2 - 1
$B.min_int32=- $B.max_int32
var $op_func=function(self,other){if(isinstance(other,int)){if(other.__class__===$B.LongInt.$dict){return $B.LongInt.$dict.__sub__($B.LongInt(self),$B.LongInt(other))}
if(self > $B.max_int32 ||self < $B.min_int32 ||
other > $B.max_int32 ||other < $B.min_int32){return $B.LongInt.$dict.__sub__($B.LongInt(self),$B.LongInt(other))}
return self-other}
if(isinstance(other,_b_.bool))return self-other
if(hasattr(other,'__rsub__'))return getattr(other,'__rsub__')(self)
$err("-",other)}
$op_func +='' 
var $ops={'&':'and','|':'or','^':'xor'}
for(var $op in $ops){var opf=$op_func.replace(/-/gm,$op)
opf=opf.replace(new RegExp('sub','gm'),$ops[$op])
eval('$IntDict.__'+$ops[$op]+'__ = '+opf)}
var $op_func=function(self,other){if(isinstance(other,int)){if(typeof other=='number'){var res=self.valueOf()-other.valueOf()
if(res>=$B.min_int && res<=$B.max_int){return res}
else{return $B.LongInt.$dict.__sub__($B.LongInt(self),$B.LongInt(other))}}else{return $B.LongInt.$dict.__sub__($B.LongInt(self),$B.LongInt(other))}}
if(isinstance(other,_b_.float)){return new Number(self-other)}
if(isinstance(other,_b_.complex)){return _b_.complex(self-other.real,-other.imag)}
if(isinstance(other,_b_.bool)){var bool_value=0;
if(other.valueOf())bool_value=1;
return self-bool_value}
if(isinstance(other,_b_.complex)){return _b_.complex(self.valueOf()- other.real,other.imag)}
if(hasattr(other,'__rsub__'))return getattr(other,'__rsub__')(self)
throw $err('-',other)}
$op_func +='' 
var $ops={'+':'add','-':'sub'}
for(var $op in $ops){var opf=$op_func.replace(/-/gm,$op)
opf=opf.replace(new RegExp('sub','gm'),$ops[$op])
eval('$IntDict.__'+$ops[$op]+'__ = '+opf)}
var $comp_func=function(self,other){if(other.__class__===$B.LongInt.$dict)return $B.LongInt.$dict.__gt__($B.LongInt(self),other)
if(isinstance(other,int))return self.valueOf()> other.valueOf()
if(isinstance(other,_b_.float))return self.valueOf()> other.valueOf()
if(isinstance(other,_b_.bool)){return self.valueOf()> _b_.bool.$dict.__hash__(other)}
if(hasattr(other,'__int__')||hasattr(other,'__index__')){return $IntDict.__gt__(self,$B.$GetInt(other))}
var inv_op=getattr(other,'__le__',null)
if(inv_op !==null){return inv_op(self)}
throw _b_.TypeError(
"unorderable types: int() > "+$B.get_class(other).__name__+"()")}
$comp_func +='' 
for(var $op in $B.$comps){eval("$IntDict.__"+$B.$comps[$op]+'__ = '+
$comp_func.replace(/>/gm,$op).
replace(/__gt__/gm,'__'+$B.$comps[$op]+'__').
replace(/__le__/,'__'+$B.$inv_comps[$op]+'__'))}
$B.make_rmethods($IntDict)
var $valid_digits=function(base){var digits=''
if(base===0)return '0'
if(base < 10){for(var i=0;i < base;i++)digits+=String.fromCharCode(i+48)
return digits}
var digits='0123456789'
for(var i=10;i < base;i++)digits+=String.fromCharCode(i+55)
return digits}
var int=function(value,base){
if(value===undefined){return 0}
if(typeof value=='number' && 
(base===undefined ||base==10)){return parseInt(value)}
if(base!==undefined){if(!isinstance(value,[_b_.str,_b_.bytes,_b_.bytearray])){throw TypeError("int() can't convert non-string with explicit base")}}
if(isinstance(value,_b_.complex)){throw TypeError("can't convert complex to int")}
var $ns=$B.args('int',2,{x:null,base:null},['x','base'],arguments,{'base':10},'null','null')
var value=$ns['x']
var base=$ns['base']
if(isinstance(value,_b_.float)&& base===10){if(value<$B.min_int ||value>$B.max_int){return $B.LongInt.$dict.$from_float(value)}
else{return value>0 ? Math.floor(value): Math.ceil(value)}}
if(!(base >=2 && base <=36)){
if(base !=0)throw _b_.ValueError("invalid base")}
if(typeof value=='number'){if(base==10){if(value < $B.min_int ||value > $B.max_int)return $B.LongInt(value)
return value}else if(value.toString().search('e')>-1){
throw _b_.OverflowError("can't convert to base "+base)}else{var res=parseInt(value,base)
if(res < $B.min_int ||res > $B.max_int)return $B.LongInt(value,base)
return res}}
if(value===true)return Number(1)
if(value===false)return Number(0)
if(value.__class__===$B.LongInt.$dict){var z=parseInt(value.value)
if(z>$B.min_int && z<$B.max_int){return z}
else{return value}}
base=$B.$GetInt(base)
if(isinstance(value,_b_.str))value=value.valueOf()
if(typeof value=="string"){var _value=value.trim()
if(_value.length==2 && base==0 &&(_value=='0b' ||_value=='0o' ||_value=='0x')){throw _b_.ValueError('invalid value')}
if(_value.length >2){var _pre=_value.substr(0,2).toUpperCase()
if(base==0){if(_pre=='0B')base=2
if(_pre=='0O')base=8
if(_pre=='0X')base=16}
if(_pre=='0B' ||_pre=='0O' ||_pre=='0X'){_value=_value.substr(2)}}
var _digits=$valid_digits(base)
var _re=new RegExp('^[+-]?['+_digits+']+$','i')
if(!_re.test(_value)){throw _b_.ValueError(
"invalid literal for int() with base "+base +": '"+_b_.str(value)+"'")}
if(base <=10 && !isFinite(value)){throw _b_.ValueError(
"invalid literal for int() with base "+base +": '"+_b_.str(value)+"'")}
var res=parseInt(_value,base)
if(res < $B.min_int ||res > $B.max_int)return $B.LongInt(_value,base)
return res}
if(isinstance(value,[_b_.bytes,_b_.bytearray])){var _digits=$valid_digits(base)
for(var i=0;i<value.source.length;i++){if(_digits.indexOf(String.fromCharCode(value.source[i]))==-1){throw _b_.ValueError("invalid literal for int() with base "+
base +": "+_b_.repr(value))}}
return Number(parseInt(getattr(value,'decode')('latin-1'),base))}
if(hasattr(value,'__int__'))return getattr(value,'__int__')()
if(hasattr(value,'__index__'))return getattr(value,'__index__')()
if(hasattr(value,'__trunc__')){var res=getattr(value,'__trunc__')(),int_func=_b_.getattr(res,'__int__',null)
if(int_func===null){throw TypeError('__trunc__ returned non-Integral (type '+
$B.get_class(res).__name__+')')}
var res=int_func()
if(isinstance(res,int)){return res}
throw TypeError('__trunc__ returned non-Integral (type '+
$B.get_class(res).__name__+')')}
throw _b_.ValueError(
"invalid literal for int() with base "+base +": '"+_b_.str(value)+"'")}
int.$dict=$IntDict
int.__class__=$B.$factory
$IntDict.$factory=int
_b_.int=int})(__BRYTHON__)
;(function($B){
eval($B.InjectBuiltins())
var $LongIntDict={__class__:$B.$type,__name__:'int'}
function add_pos(v1,v2){
var res='',carry=0,iself=v1.length,sv=0,x
for(var i=v2.length-1;i>=0;i--){iself--
if(iself<0){sv=0}else{sv=parseInt(v1.charAt(iself))}
x=(carry+sv+parseInt(v2.charAt(i))).toString()
if(x.length==2){res=x.charAt(1)+res;carry=parseInt(x.charAt(0))}
else{res=x+res;carry=0}}
while(iself>0){iself--
x=(carry+parseInt(v1.charAt(iself))).toString()
if(x.length==2){res=x.charAt(1)+res;carry=parseInt(x.charAt(0))}
else{res=x+res;carry=0}}
if(carry){res=carry+res}
return{__class__:$LongIntDict,value:res,pos:true}}
function check_shift(shift){
if(!isinstance(shift,LongInt)){throw TypeError("shift must be int, not '"+
$B.get_class(shift).__name__+"'")}
if(!shift.pos){throw ValueError("negative shift count")}}
function clone(obj){
var obj1={}
for(var attr in obj){obj1[attr]=obj[attr]}
return obj1}
function comp_pos(v1,v2){
if(v1.length>v2.length){return 1}
else if(v1.length<v2.length){return -1}
else{if(v1>v2){return 1}
else if(v1<v2){return -1}}
return 0}
function divmod_pos(v1,v2){
var v1_init=v1,quotient,mod
if(comp_pos(v1,v2)==-1){
quotient='0'
mod=LongInt(v1)}else if(v2==v1){
quotient='1';
mod=LongInt('0')}else{var quotient='',v1_init=v1
var left=v1.substr(0,v2.length)
if(v1<v2){left=v1.substr(0,v2.length+1)}
var right=v1.substr(left.length)
var mv2={}
while(true){
var candidate=Math.floor(parseInt(left)/parseInt(v2))+''
if(mv2[candidate]===undefined){mv2[candidate]=mul_pos(v2,candidate).value}
if(comp_pos(left,mv2[candidate])==-1){
candidate--
if(mv2[candidate]===undefined){mv2[candidate]=mul_pos(v2,candidate).value}}
quotient +=candidate
left=sub_pos(left,mv2[candidate]).value
if(right.length==0){break}
left +=right.charAt(0)
right=right.substr(1)}
mod=sub_pos(v1,mul_pos(quotient,v2).value)}
return[LongInt(quotient),mod]}
function split_chunks(s,size){var nb=Math.ceil(s.length/size),chunks=[],len=s.length
for(var i=0;i<nb;i++){var pos=len-size*(i+1)
if(pos<0){size +=pos;pos=0}
chunks.push(parseInt(s.substr(pos,size)))}
return chunks}
function mul_pos(x,y){
var chunk_size=6
var cx=split_chunks(x,chunk_size),cy=split_chunks(y,chunk_size)
var products={},len=cx.length+cy.length
for(var i=0;i<len-1;i++){products[i]=0}
for(var i=0;i<cx.length;i++){for(var j=0;j<cy.length;j++){products[i+j]+=cx[i]*cy[j]}}
var nb=len-1,pos
for(var i=0;i<len-1;i++){var chunks=split_chunks(products[i].toString(),chunk_size)
for(var j=1;j<chunks.length;j++){pos=i+j
if(products[pos]===undefined){products[pos]=parseInt(chunks[j]);nb=pos}
else{products[pos]+=parseInt(chunks[j])}}
products[i]=chunks[0]}
var result='',i=0,s
while(products[i]!==undefined){s=products[i].toString()
if(products[i+1]!==undefined){s='0'.repeat(chunk_size-s.length)+s}
result=s+result;
i++}
return LongInt(result)}
function sub_pos(v1,v2){
var res='',carry=0,i1=v1.length,sv=0,x
for(var i=v2.length-1;i>=0;i--){i1--
sv=parseInt(v1.charAt(i1))
x=(sv-carry-parseInt(v2.charAt(i)))
if(x<0){res=(10+x)+res;carry=1}
else{res=x+res;carry=0}}
while(i1>0){i1--
x=(parseInt(v1.charAt(i1))-carry)
if(x<0){res=(10+x)+res;carry=1}
else{res=x+res;carry=0}}
while(res.charAt(0)=='0' && res.length>1){res=res.substr(1)}
return{__class__:$LongIntDict,value:res,pos:true}}
$LongIntDict.$from_float=function(value){var s=Math.abs(value).toString(),v=s
if(s.search('e')>-1){var t=/-?(\d)(\.\d+)?e([+-])(\d*)/.exec(s),n1=t[1],n2=t[2],pos=t[3],exp=t[4]
if(pos=='+'){if(n2===undefined){v=n1+'0'.repeat(exp-1)}else{v=n1+n2+'0'.repeat(exp-1-n2.length)}}}
return{__class__:$LongIntDict,value: v,pos: value >=0}}
$LongIntDict.__abs__=function(self){return{__class__:$LongIntDict,value: self.value,pos:true}}
$LongIntDict.__add__=function(self,other){if(isinstance(other,_b_.float)){return _b_.float(parseInt(self.value)+other.value)}
if(typeof other=='number')other=LongInt(_b_.str(other))
var res
if(self.pos&&other.pos){
return add_pos(self.value,other.value)}else if(!self.pos&&!other.pos){
res=add_pos(self.value,other.value)
res.pos=false
return intOrLong(res)}else if(self.pos && !other.pos){
switch(comp_pos(self.value,other.value)){case 1:
res=sub_pos(self.value,other.value)
break
case 0:
res={__class__:$LongIntDict,value:0,pos:true}
break
case -1:
res=sub_pos(other.value,self.value)
res.pos=false
break}
return intOrLong(res)}else{
switch(comp_pos(self.value,other.value)){case 1:
res=sub_pos(self.value,other.value)
res.pos=false
break
case 0:
res={__class__:$LongIntDict,value:0,pos:true}
break
case -1:
res=sub_pos(other.value,self.value)
break}
return intOrLong(res)}}
$LongIntDict.__and__=function(self,other){if(typeof other=='number')other=LongInt(_b_.str(other))
var v1=$LongIntDict.__index__(self)
var v2=$LongIntDict.__index__(other)
if(v1.length<v2.length){var temp=v2;v2=v1;v1=temp}
var start=v1.length-v2.length
var res=''
for(var i=0;i<v2.length;i++){if(v1.charAt(start+i)=='1' && v2.charAt(i)=='1'){res +='1'}
else{res +='0'}}
return intOrLong(LongInt(res,2))}
$LongIntDict.__divmod__=function(self,other){if(typeof other=='number')other=LongInt(_b_.str(other))
var dm=divmod_pos(self.value,other.value)
if(self.pos!==other.pos){if(dm[0].value!='0'){dm[0].pos=false}
if(dm[1].value!='0'){
dm[0]=$LongIntDict.__sub__(dm[0],LongInt('1'))
dm[1]=$LongIntDict.__add__(dm[1],LongInt('1'))}}
return[intOrLong(dm[0]),intOrLong(dm[1])]}
$LongIntDict.__eq__=function(self,other){if(typeof other=='number')other=LongInt(_b_.str(other))
return self.value==other.value && self.pos==other.pos}
$LongIntDict.__float__=function(self){return new Number(parseFloat(self.value))}
$LongIntDict.__floordiv__=function(self,other){if(isinstance(other,_b_.float)){return _b_.float(parseInt(self.value)/other)}
if(typeof other=='number')other=LongInt(_b_.str(other))
return intOrLong($LongIntDict.__divmod__(self,other)[0])}
$LongIntDict.__ge__=function(self,other){if(typeof other=='number')other=LongInt(_b_.str(other))
if(self.pos !=other.pos){return !other.pos}
if(self.value.length>other.value.length){return self.pos}
else if(self.value.length<other.value.length){return !self.pos}
else{return self.pos ? self.value >=other.value : self.value <=other.value}}
$LongIntDict.__gt__=function(self,other){return !$LongIntDict.__le__(self,other)}
$LongIntDict.__index__=function(self){
var res='',pos=self.value.length,temp=self.value,d
while(true){d=divmod_pos(temp,'2')
res=d[1].value + res
temp=d[0].value
if(temp=='0'){break}}
return intOrLong(res)}
$LongIntDict.__invert__=function(self){return $LongIntDict.__sub__(LongInt('-1'),self)}
$LongIntDict.__le__=function(self,other){if(typeof other=='number')other=LongInt(_b_.str(other))
if(self.pos !==other.pos){return !self.pos}
if(self.value.length>other.value.length){return !self.pos}
else if(self.value.length<other.value.length){return self.pos}
else{return self.pos ? self.value <=other.value : self.value >=other.value}}
$LongIntDict.__lt__=function(self,other){return !$LongIntDict.__ge__(self,other)}
$LongIntDict.__lshift__=function(self,shift){var is_long=shift.__class__==$LongIntDict
if(is_long){var shift_value=parseInt(shift.value)
if(shift_value<0){throw _b_.ValueError('negative shift count')}
if(shift_value < $B.max_int){shift_safe=true;shift=shift_value}}
if(shift_safe){if(shift_value==0){return self}}else{shift=LongInt(shift)
if(shift.value=='0'){return self}}
var res=self.value
while(true){var x,carry=0,res1=''
for(var i=res.length-1;i>=0;i--){x=(carry+parseInt(res.charAt(i))*2).toString()
if(x.length==2){res1=x.charAt(1)+res1;carry=parseInt(x.charAt(0))}
else{res1=x+res1;carry=0}}
if(carry){res1=carry+res1}
res=res1
if(shift_safe){shift--
if(shift==0){break}}else{shift=sub_pos(shift.value,'1')
if(shift.value=='0'){break}}}
return intOrLong({__class__:$LongIntDict,value:res,pos:self.pos})}
$LongIntDict.__mod__=function(self,other){return intOrLong($LongIntDict.__divmod__(self,other)[1])}
$LongIntDict.__mro__=[$LongIntDict,_b_.int.$dict,_b_.object.$dict]
$LongIntDict.__mul__=function(self,other){switch(self){case Number.NEGATIVE_INFINITY:
case Number.POSITIVE_INFINITY:
var eq=_b_.getattr(other,'__eq__')
if(eq(0)){return NaN}
else if(_b_.getattr(other,'__gt__')(0)){return self}
else{return -self}}
if(isinstance(other,_b_.float)){return _b_.float(parseInt(self.value)*other)}
if(typeof other=='number')other=LongInt(_b_.str(other))
var res=mul_pos(self.value,other.value)
if(self.pos==other.pos){return intOrLong(res)}
res.pos=false
return intOrLong(res)}
$LongIntDict.__neg__=function(obj){return{__class__:$LongIntDict,value:obj.value,pos:!obj.pos}}
$LongIntDict.__or__=function(self,other){other=LongInt(other)
var v1=$LongIntDict.__index__(self)
var v2=$LongIntDict.__index__(other)
if(v1.length<v2.length){var temp=v2;v2=v1;v1=temp}
var start=v1.length-v2.length
var res=v1.substr(0,start)
for(var i=0;i<v2.length;i++){if(v1.charAt(start+i)=='1' ||v2.charAt(i)=='1'){res +='1'}
else{res +='0'}}
return intOrLong(LongInt(res,2))}
$LongIntDict.__pos__=function(self){return self}
$LongIntDict.__pow__=function(self,power){if(typeof power=="number"){power=LongInt(_b_.str(power))}else if(!isinstance(power,LongInt)){var msg="power must be a LongDict, not '"
throw TypeError(msg+$B.get_class(power).__name__+"'")}
if(!power.pos){if(self.value=='1'){return self}
return LongInt('0')}else if(power.value=='0'){return LongInt('1')}
var res={__class__:$LongIntDict,value:self.value,pos:self.pos}
var pow=power.value
while(true){pow=sub_pos(pow,'1').value
if(pow=='0'){break}
res=LongInt($LongIntDict.__mul__(res,self))}
return intOrLong(res)}
$LongIntDict.__rshift__=function(self,shift){shift=LongInt(shift)
if(shift.value=='0'){return self}
var res=self.value
while(true){res=divmod_pos(res,'2')[0].value
if(res.value=='0'){break}
shift=sub_pos(shift.value,'1')
if(shift.value=='0'){break}}
return intOrLong({__class__:$LongIntDict,value:res,pos:self.pos})}
$LongIntDict.__str__=$LongIntDict.__repr__=function(self){var res=""
if(!self.pos){res +='-'}
return res+self.value}
$LongIntDict.__sub__=function(self,other){if(isinstance(other,_b_.float)){return _b_.float(parseInt(self.value)-other.value)}
if(typeof other=='number')other=LongInt(_b_.str(other))
var res
if(self.pos && other.pos){switch(comp_pos(self.value,other.value)){case 1:
res=sub_pos(self.value,other.value)
break
case 0:
res={__class__:$LongIntDict,value:'0',pos:true}
break
case -1:
res=sub_pos(other.value,self.value)
res.pos=false
break}
return intOrLong(res)}else if(!self.pos && !other.pos){switch(comp_pos(self.value,other.value)){case 1:
res=sub_pos(self.value,other.value)
res.pos=false
break
case 0:
res={__class__:$LongIntDict,value:'0',pos:true}
break
case -1:
res=sub_pos(other.value,self.value)
break}
return intOrLong(res)}else if(self.pos && !other.pos){return intOrLong(add_pos(self.value,other.value))}else{res=add_pos(self.value,other.value)
res.pos=false
return intOrLong(res)}}
$LongIntDict.__truediv__=function(self,other){if(isinstance(other,LongInt)){return _b_.float(parseInt(self.value)/parseInt(other.value))}else if(isinstance(other,_b_.int)){return _b_.float(parseInt(self.value)/other)}else if(isinstance(other,_b_.float)){return _b_.float(parseInt(self.value)/other)}else{throw TypeError("unsupported operand type(s) for /: 'int' and '"+
$B.get_class(other).__name__+"'")}}
$LongIntDict.__xor__=function(self,other){other=LongInt(other)
var v1=$LongIntDict.__index__(self)
var v2=$LongIntDict.__index__(other)
if(v1.length<v2.length){var temp=v2;v2=v1;v1=temp}
var start=v1.length-v2.length
var res=v1.substr(0,start)
for(var i=0;i<v2.length;i++){if(v1.charAt(start+i)=='1' && v2.charAt(i)=='0'){res +='1'}
else if(v1.charAt(start+i)=='0' && v2.charAt(i)=='1'){res +='1'}
else{res +='0'}}
return intOrLong(LongInt(res,2))}
$LongIntDict.to_base=function(self,base){
var res='',v=self.value
while(v>0){var dm=divmod_pos(v,base.toString())
res=parseInt(dm[1].value).toString(base)+res
v=dm[0].value
if(v==0){break}}
return res}
function digits(base){
var is_digits={}
for(var i=0;i<base;i++){if(i==10){break}
is_digits[i]=true}
if(base>10){
for(var i=0;i<base-10;i++){is_digits[String.fromCharCode(65+i)]=true
is_digits[String.fromCharCode(97+i)]=true}}
return is_digits}
var MAX_SAFE_INTEGER=Math.pow(2,53)-1;
var MIN_SAFE_INTEGER=-MAX_SAFE_INTEGER;
function isSafeInteger(n){return(typeof n==='number' &&
Math.round(n)===n &&
MIN_SAFE_INTEGER <=n &&
n <=MAX_SAFE_INTEGER);}
function intOrLong(long){
var v=parseInt(long.value)*(long.pos ? 1 : -1)
if(v>MIN_SAFE_INTEGER && v<MAX_SAFE_INTEGER){return v}
return long}
function LongInt(value,base){if(arguments.length>2){throw _b_.TypeError("LongInt takes at most 2 arguments ("+
arguments.length+" given)")}
if(base===undefined){base=10}
else if(!isinstance(base,int)){throw TypeError("'"+$B.get_class(base).__name__+"' object cannot be interpreted as an integer")}
if(base<0 ||base==1 ||base>36){throw ValueError("LongInt() base must be >= 2 and <= 36")}
if(isinstance(value,_b_.float)){if(value===Number.POSITIVE_INFINITY ||value===Number.NEGATIVE_INFINITY){return value}
if(value>=0){value=new Number(Math.round(value.value))}
else{value=new Number(Math.ceil(value.value))}}else if(isinstance(value,_b_.bool)){if(value.valueOf())return int(1)
return int(0)}
if(typeof value=='number'){if(isSafeInteger(value)){value=value.toString()}
else if(value.constructor==Number){console.log('big number',value);value=value.toString()}
else{console.log('wrong value',value);throw ValueError("argument of long_int is not a safe integer")}}else if(value.__class__===$LongIntDict){return value}
else if(isinstance(value,_b_.bool)){value=_b_.bool.$dict.__int__(value)+''}
else if(typeof value!='string'){throw ValueError("argument of long_int must be a string, not "+
$B.get_class(value).__name__)}
var has_prefix=false,pos=true,start=0
while(value.charAt(0)==' ' && value.length){value=value.substr(1)}
while(value.charAt(value.length-1)==' ' && value.length){value=value.substr(0,value.length-1)}
if(value.charAt(0)=='+'){has_prefix=true}
else if(value.charAt(0)=='-'){has_prefix=true;pos=false}
if(has_prefix){
if(value.length==1){
throw ValueError('LongInt argument is not a valid number: "'+value+'"')}else{value=value.substr(1)}}
while(start<value.length-1 && value.charAt(start)=='0'){start++}
value=value.substr(start)
var is_digits=digits(base),point=-1
for(var i=0;i<value.length;i++){if(value.charAt(i)=='.' && point==-1){point=i}
else if(!is_digits[value.charAt(i)]){throw ValueError('LongInt argument is not a valid number: "'+value+'"')}}
if(point!=-1){value=value.substr(0,point)}
if(base!=10){
var coef='1',v10=LongInt(0),pos=value.length,digit_base10
while(pos--){digit_base10=parseInt(value.charAt(pos),base).toString()
digit_by_coef=mul_pos(coef,digit_base10).value
v10=add_pos(v10.value,digit_by_coef)
coef=mul_pos(coef,base.toString()).value}
return v10}
return{__class__:$LongIntDict,value:value,pos:pos}}
LongInt.__class__=$B.$factory
LongInt.$dict=$LongIntDict
$LongIntDict.$factory=LongInt
$B.LongInt=LongInt})(__BRYTHON__)
;(function($B){eval($B.InjectBuiltins())
var $ObjectDict=_b_.object.$dict
function $UnsupportedOpType(op,class1,class2){throw _b_.TypeError("unsupported operand type(s) for "+op+": '"+class1+"' and '"+class2+"'")}
var $ComplexDict={__class__:$B.$type,__dir__:$ObjectDict.__dir__,__name__:'complex',$native:true,descriptors:{real:true,imag:true}}
$ComplexDict.__abs__=function(self,other){return complex(abs(self.real),abs(self.imag))}
$ComplexDict.__bool__=function(self){return new Boolean(self.real ||self.imag)}
$ComplexDict.__class__=$B.$type
$ComplexDict.__eq__=function(self,other){if(isinstance(other,complex))return self.real==other.real && self.imag==other.imag
if(isinstance(other,_b_.int)){if(self.imag !=0)return False
return self.real==other.valueOf()}
if(isinstance(other,_b_.float)){if(self.imag !=0)return False
return self.real==other.value}
$UnsupportedOpType("==","complex",$B.get_class(other))}
$ComplexDict.__floordiv__=function(self,other){$UnsupportedOpType("//","complex",$B.get_class(other))}
$ComplexDict.__hash__=function(self){
if(self===undefined){return $ComplexDict.__hashvalue__ ||$B.$py_next_hash--}
return self.imag*1000003+self.real}
$ComplexDict.__init__=function(self,real,imag){self.toString=function(){return '('+real+'+'+imag+'j)'}}
$ComplexDict.__invert__=function(self){return ~self}
$ComplexDict.__mod__=function(self,other){throw _b_.TypeError("TypeError: can't mod complex numbers.")}
$ComplexDict.__mro__=[$ComplexDict,$ObjectDict]
$ComplexDict.__mul__=function(self,other){if(isinstance(other,complex))
return complex(self.real*other.real-self.imag*other.imag,self.imag*other.real + self.real*other.imag)
if(isinstance(other,_b_.int))
return complex(self.real*other.valueOf(),self.imag*other.valueOf())
if(isinstance(other,_b_.float))
return complex(self.real*other.value,self.imag*other.value)
if(isinstance(other,_b_.bool)){if(other.valueOf())return self
return complex(0)}
$UnsupportedOpType("*",complex,other)}
$ComplexDict.__name__='complex'
$ComplexDict.__ne__=function(self,other){return !$ComplexDict.__eq__(self,other)}
$ComplexDict.__neg__=function(self){return complex(-self.real,-self.imag)}
$ComplexDict.__new__=function(cls){if(cls===undefined)throw _b_.TypeError('complex.__new__(): not enough arguments')
return{__class__:cls.$dict}}
$ComplexDict.__pos__=function(self){return self}
$ComplexDict.__pow__=function(self,other){
var norm=Math.sqrt((self.real*self.real)+(self.imag*self.imag)),sin=self.imag/norm,cos=self.real/norm,res=Math.pow(norm,other),angle
if(cos==0){angle=sin==1 ? Math.PI/2 : 3*Math.PI/2}
else if(sin==0){angle=cos==1 ? 0 : Math.PI}
else{angle=Math.atan(sin/cos)}
return complex(res*Math.cos(angle*other),res*Math.sin(angle*other))}
$ComplexDict.__str__=$ComplexDict.__repr__=function(self){if(self.real==0)return self.imag+'j'
if(self.imag>=0)return '('+self.real+'+'+self.imag+'j)'
return '('+self.real+'-'+(-self.imag)+'j)'}
$ComplexDict.__sqrt__=function(self){if(self.imag==0)return complex(Math.sqrt(self.real))
var r=self.real,i=self.imag
var _sqrt=Math.sqrt(r*r+i*i)
var _a=Math.sqrt((r + sqrt)/2)
var _b=Number.sign(i)* Math.sqrt((-r + sqrt)/2)
return complex(_a,_b)}
$ComplexDict.__truediv__=function(self,other){if(isinstance(other,complex)){if(other.real==0 && other.imag==0){throw ZeroDivisionError('division by zero')}
var _num=self.real*other.real + self.imag*other.imag
var _div=other.real*other.real + other.imag*other.imag
var _num2=self.imag*other.real - self.real*other.imag
return complex(_num/_div,_num2/_div)}
if(isinstance(other,_b_.int)){if(!other.valueOf())throw ZeroDivisionError('division by zero')
return $ComplexDict.__truediv__(self,complex(other.valueOf()))}
if(isinstance(other,_b_.float)){if(!other.value)throw ZeroDivisionError('division by zero')
return $ComplexDict.__truediv__(self,complex(other.value))}
$UnsupportedOpType("//","complex",other.__class__)}
var $op_func=function(self,other){throw _b_.TypeError("TypeError: unsupported operand type(s) for -: 'complex' and '" + 
$B.get_class(other).__name__+"'")}
$op_func +='' 
var $ops={'&':'and','|':'ior','<<':'lshift','>>':'rshift','^':'xor'}
for(var $op in $ops){eval('$ComplexDict.__'+$ops[$op]+'__ = '+$op_func.replace(/-/gm,$op))}
$ComplexDict.__ior__=$ComplexDict.__or__
var $op_func=function(self,other){if(isinstance(other,complex))return complex(self.real-other.real,self.imag-other.imag)
if(isinstance(other,_b_.int))return complex($B.sub(self.real,other.valueOf()),self.imag)
if(isinstance(other,_b_.float))return complex(self.real - other.value,self.imag)
if(isinstance(other,_b_.bool)){var bool_value=0;
if(other.valueOf())bool_value=1;
return complex(self.real - bool_value,self.imag)}
throw _b_.TypeError("unsupported operand type(s) for -: "+self.__repr__()+
" and '"+$B.get_class(other).__name__+"'")}
$ComplexDict.__sub__=$op_func
$op_func +='' 
$op_func=$op_func.replace(/-/gm,'+').replace(/sub/gm,'add')
eval('$ComplexDict.__add__ = '+$op_func)
var $comp_func=function(self,other){throw _b_.TypeError("TypeError: unorderable types: complex() > " + 
$B.get_class(other).__name__ + "()")}
$comp_func +='' 
for(var $op in $B.$comps){eval("$ComplexDict.__"+$B.$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))}
$B.make_rmethods($ComplexDict)
$ComplexDict.real=function(self){return new Number(self.real)}
$ComplexDict.imag=function(self){return new Number(self.imag)}
var complex_re=/^(\d*\.?\d*)([\+\-]?)(\d*\.?\d*)(j?)$/
var complex=function(real,imag){if(typeof real=='string'){if(imag!==undefined){throw _b_.TypeError("complex() can't take second arg if first is a string")}
var parts=complex_re.exec(real)
if(parts===null){throw _b_.ValueError("complex() arg is a malformed string")}else if(parts[1]=='.' ||parts[3]=='.'){throw _b_.ValueError("complex() arg is a malformed string")}else if(parts[4]=='j'){if(parts[2]==''){real=0;imag=parseFloat(parts[1])}else{real=parseFloat(parts[1])
imag=parts[3]=='' ? 1 : parseFloat(parts[3])
imag=parts[2]=='-' ? -imag : imag}}else{real=parseFloat(parts[1])
imag=0}}
var res={__class__:$ComplexDict,real:real ||0,imag:imag ||0}
res.__repr__=res.__str__=function(){if(real==0)return imag + 'j'
return '('+real+'+'+imag+'j)'}
return res}
complex.$dict=$ComplexDict
complex.__class__=$B.$factory
$ComplexDict.$factory=complex
$B.set_func_names($ComplexDict)
_b_.complex=complex})(__BRYTHON__)
;(function($B){eval($B.InjectBuiltins())
var $ObjectDict=_b_.object.$dict,$N=_b_.None
function $list(){
var args=[],pos=0
for(var i=0,_len_i=arguments.length;i < _len_i;i++){args[pos++]=arguments[i]}
return new $ListDict(args)}
var $ListDict={__class__:$B.$type,__name__:'list',$native:true,__dir__:$ObjectDict.__dir__}
$ListDict.__add__=function(self,other){var res=self.valueOf().concat(other.valueOf())
if(isinstance(self,tuple))res=tuple(res)
return res}
$ListDict.__contains__=function(self,item){var $=$B.args('__contains__',2,{self:null,item:null},['self','item'],arguments,{},null,null),self=$.self,item=$.item
var _eq=getattr(item,'__eq__')
var i=self.length
while(i--){if(_eq(self[i]))return true}
return false}
$ListDict.__delitem__=function(self,arg){if(isinstance(arg,_b_.int)){var pos=arg
if(arg<0)pos=self.length+pos
if(pos>=0 && pos<self.length){self.splice(pos,1)
return $N}
throw _b_.IndexError('list index out of range')}
if(isinstance(arg,_b_.slice)){var step=arg.step;if(step===None){step=1}
var start=arg.start
if(start===None){start=step>0 ? 0 : self.length}
var stop=arg.stop
if(stop===None){stop=step >0 ? self.length : 0}
if(start<0)start=self.length+start
if(stop<0)stop=self.length+stop
var res=[],i=null,pos=0
if(step>0){if(stop>start){for(var i=start;i<stop;i+=step){if(self[i]!==undefined){res[pos++]=i}}}}else{
if(stop<start){for(var i=start;i>stop;i+=step){if(self[i]!==undefined){res[pos++]=i}}
res.reverse()}}
var i=res.length
while(i--){
self.splice(res[i],1)}
return $N}
if(hasattr(arg,'__int__')||hasattr(arg,'__index__')){$ListDict.__delitem__(self,_b_.int(arg))
return $N}
throw _b_.TypeError('list indices must be integer, not '+_b_.str(arg.__class__))}
$ListDict.__eq__=function(self,other){if(isinstance(other,$B.get_class(self).$factory)){if(other.length==self.length){var i=self.length
while(i--){if(!getattr(self[i],'__eq__')(other[i]))return false}
return true}}
return false}
$ListDict.__getitem__=function(self,arg){var $=$B.args('__getitem__',2,{self:null,key:null},['self','key'],arguments,{},null,null),self=$.self,key=$.key
if(isinstance(key,_b_.int)){var items=self.valueOf()
var pos=key
if(key<0)pos=items.length+pos
if(pos>=0 && pos<items.length)return items[pos]
throw _b_.IndexError('list index out of range')}
if(isinstance(key,_b_.slice)){
var s=_b_.slice.$dict.$conv_for_seq(key,self.length)
var res=[],i=null,items=self.valueOf(),pos=0,start=s.start,stop=s.stop,step=s.step
if(step > 0){if(stop <=start)return res;
for(var i=start;i<stop;i+=step){res[pos++]=items[i]}
return res;}else{
if(stop > start)return res;
for(var i=start;i>stop;i+=step){res[pos++]=items[i]}
return res;}}
if(hasattr(key,'__int__')||hasattr(key,'__index__')){return $ListDict.__getitem__(self,_b_.int(key))}
throw _b_.TypeError('list indices must be integer, not '+
$B.get_class(key).__name__)}
$ListDict.__ge__=function(self,other){if(!isinstance(other,[list,_b_.tuple])){throw _b_.TypeError("unorderable types: list() >= "+
$B.get_class(other).__name__+'()')}
var i=0
while(i<self.length){if(i>=other.length)return true
if(getattr(self[i],'__eq__')(other[i])){i++}
else return(getattr(self[i],"__ge__")(other[i]))}
return other.length==self.length}
$ListDict.__gt__=function(self,other){if(!isinstance(other,[list,_b_.tuple])){throw _b_.TypeError("unorderable types: list() > "+
$B.get_class(other).__name__+'()')}
var i=0
while(i<self.length){if(i>=other.length)return true
if(getattr(self[i],'__eq__')(other[i])){i++}
else return(getattr(self[i],'__gt__')(other[i]))}
return false}
$ListDict.__iadd__=function(){var $=$B.args('__iadd__',2,{self:null,x:null},['self','x'],arguments,{},null,null)
var x=list(iter($.x))
for(var i=0;i < x.length;i++){$.self.push(x[i])}
return $.self}
$ListDict.__imul__=function(){var $=$B.args('__imul__',2,{self:null,x:null},['self','x'],arguments,{},null,null)
var x=$B.$GetInt($.x),len=$.self.length,pos=len
if(x==0){$ListDict.clear($.self);return $.self}
for(var i=1;i < x;i++){for(j=0;j<len;j++){$.self[pos++]=$.self[j]}}
return $.self}
$ListDict.__init__=function(self,arg){var len_func=getattr(self,'__len__'),pop_func=getattr(self,'pop')
while(len_func())pop_func()
if(arg===undefined)return $N
var arg=iter(arg)
var next_func=getattr(arg,'__next__')
var pos=len_func()
while(1){try{self[pos++]=next_func()}
catch(err){if(err.__name__=='StopIteration'){break}
else{throw err}}}
return $N}
var $list_iterator=$B.$iterator_class('list_iterator')
$ListDict.__iter__=function(self){return $B.$iterator(self,$list_iterator)}
$ListDict.__le__=function(self,other){return !$ListDict.__gt__(self,other)}
$ListDict.__len__=function(self){return self.length}
$ListDict.__lt__=function(self,other){return !$ListDict.__ge__(self,other)}
$ListDict.__mro__=[$ListDict,$ObjectDict]
$ListDict.__mul__=function(self,other){if(isinstance(other,_b_.int)){
var res=[],$temp=self.slice(),len=$temp.length
for(var i=0;i<other;i++){for(var j=0;j<len;j++){res.push($temp[j])}}
res.__class__=self.__class__
return res}
if(hasattr(other,'__int__')||hasattr(other,'__index__')){return $ListDict.__mul__(self,_b_.int(other))}
throw _b_.TypeError("can't multiply sequence by non-int of type '"+
$B.get_class(other).__name__+"'")}
$ListDict.__ne__=function(self,other){return !$ListDict.__eq__(self,other)}
$ListDict.__repr__=function(self){if(self===undefined)return "<class 'list'>"
var _r=[]
for(var i=0;i<self.length;i++){if(self[i]===self){_r.push('[...]')}
else{_r.push(_b_.repr(self[i]))}}
if(self.__class__===$TupleDict){if(self.length==1){return '('+_r[0]+',)'}
return '('+_r.join(', ')+')'}
return '['+_r.join(', ')+']'}
$ListDict.__setitem__=function(){var $=$B.args('__setitem__',3,{self:null,key:null,value:null},['self','key','value'],arguments,{},null,null),self=$.self,arg=$.key,value=$.value
if(isinstance(arg,_b_.int)){var pos=arg
if(arg<0)pos=self.length+pos
if(pos>=0 && pos<self.length){self[pos]=value}
else{throw _b_.IndexError('list index out of range')}
return $N}
if(isinstance(arg,_b_.slice)){var s=_b_.slice.$dict.$conv_for_seq(arg,self.length)
if(arg.step===null){$B.set_list_slice(self,s.start,s.stop,value)}
else{$B.set_list_slice_step(self,s.start,s.stop,s.step,value)}
return $N}
if(hasattr(arg,'__int__')||hasattr(arg,'__index__')){$ListDict.__setitem__(self,_b_.int(arg),value)
return $N}
throw _b_.TypeError('list indices must be integer, not '+arg.__class__.__name__)}
$ListDict.__str__=$ListDict.__repr__
$B.make_rmethods($ListDict)
var _ops=['add','sub']
$ListDict.append=function(){var $=$B.args('append',2,{self:null,x:null},['self','x'],arguments,{},null,null)
$.self[$.self.length]=$.x
return $N}
$ListDict.clear=function(){var $=$B.args('clear',1,{self:null},['self'],arguments,{},null,null)
while($.self.length){$.self.pop()}
return $N}
$ListDict.copy=function(){var $=$B.args('copy',1,{self:null},['self'],arguments,{},null,null)
return $.self.slice()}
$ListDict.count=function(){var $=$B.args('count',2,{self:null,x:null},['self','x'],arguments,{},null,null)
var res=0
_eq=getattr($.x,'__eq__')
var i=$.self.length
while(i--)if(_eq($.self[i]))res++
return res}
$ListDict.extend=function(){var $=$B.args('extend',2,{self:null,t:null},['self','t'],arguments,{},null,null)
other=list(iter($.t))
for(var i=0;i<other.length;i++){$.self.push(other[i])}
return $N}
$ListDict.index=function(){var $=$B.args('index',4,{self:null,x:null,start:null,stop:null},['self','x','start','stop'],arguments,{start:null,stop:null},null,null),self=$.self,start=$.start,stop=$.stop
var _eq=getattr($.x,'__eq__')
if(start===null){start=0}
else{if(start.__class__===$B.LongInt.$dict){start=parseInt(start.value)*(start.pos ? 1 : -1)}
if(start<0){start=Math.max(0,start+self.length)}}
if(stop===null){stop=self.length}
else{if(stop.__class__===$B.LongInt.$dict){stop=parseInt(stop.value)*(stop.pos ? 1 : -1)}
if(stop<0){stop=Math.min(self.length,stop+self.length)}}
for(var i=start;i < stop;i++){if(_eq(self[i]))return i}
throw _b_.ValueError(_b_.str($.x)+" is not in list")}
$ListDict.insert=function(){var $=$B.args('insert',3,{self:null,i:null,item:null},['self','i','item'],arguments,{},null,null)
$.self.splice($.i,0,$.item)
return $N}
$ListDict.pop=function(){var $=$B.args('pop',2,{self:null,pos:null},['self','pos'],arguments,{pos:null},null,null),self=$.self,pos=$.pos
if(pos===null){pos=self.length-1}
pos=$B.$GetInt(pos)
if(pos<0){pos+=self.length}
var res=self[pos]
if(res===undefined){throw _b_.IndexError('pop index out of range')}
self.splice(pos,1)
return res}
$ListDict.remove=function(){var $=$B.args('remove',2,{self:null,x:null},['self','x'],arguments,{},null,null)
var _eq=getattr($.x,'__eq__')
for(var i=0,_len_i=$.self.length;i < _len_i;i++){if(getattr($.self[i],'__eq__')($.x)){$.self.splice(i,1)
return $N}}
throw _b_.ValueError(_b_.str($.x)+" is not in list")}
$ListDict.reverse=function(self){var $=$B.args('reverse',1,{self:null},['self'],arguments,{},null,null),_len=$.self.length-1,i=parseInt($.self.length/2)
while(i--){var buf=$.self[i]
$.self[i]=$.self[_len-i]
$.self[_len-i]=buf}
return $N}
function $partition(arg,array,begin,end,pivot)
{var piv=array[pivot];
array=swap(array,pivot,end-1);
var store=begin;
if(arg===null){if(array.$cl!==false){
var le_func=_b_.getattr(array.$cl,'__le__')
for(var ix=begin;ix<end-1;++ix){if(le_func(array[ix],piv)){array=swap(array,store,ix);
++store;}}}else{for(var ix=begin;ix<end-1;++ix){if(getattr(array[ix],'__le__')(piv)){array=swap(array,store,ix);
++store;}}}}else{var len=array.length
for(var ix=begin;ix<end-1;++ix){var x=arg(array[ix])
if(array.length!==len){throw ValueError('list modified during sort')}
if(getattr(x,'__le__')(arg(piv))){array=swap(array,store,ix);
++store;}}}
array=swap(array,end-1,store);
return store;}
function swap(_array,a,b){var tmp=_array[a];
_array[a]=_array[b];
_array[b]=tmp;
return _array}
function $qsort(arg,array,begin,end)
{if(end-1>begin){var pivot=begin+Math.floor(Math.random()*(end-begin)),len=array.length
pivot=$partition(arg,array,begin,end,pivot);
$qsort(arg,array,begin,pivot);
$qsort(arg,array,pivot+1,end);}}
function $elts_class(self){
if(self.length==0){return null}
var cl=$B.get_class(self[0]),i=self.length
while(i--){
if($B.get_class(self[i])!==cl)return false}
return cl}
$ListDict.sort=function(self){var $=$B.args('sort',1,{self:null},['self'],arguments,{},null,'kw')
var func=null
var reverse=false
var kw_args=$.kw,keys=_b_.list(_b_.dict.$dict.keys(kw_args))
for(var i=0;i<keys.length;i++){if(keys[i]=="key"){func=getattr(kw_args.$string_dict[keys[i]],'__call__')}
else if(keys[i]=='reverse'){reverse=kw_args.$string_dict[keys[i]]}
else{throw _b_.TypeError("'"+keys[i]+
"' is an invalid keyword argument for this function")}}
if(self.length==0)return
self.$cl=$elts_class(self)
if(func===null && self.$cl===_b_.str.$dict){self.sort()}
else if(func===null && self.$cl===_b_.int.$dict){self.sort(function(a,b){return a-b})}
else{$qsort(func,self,0,self.length)}
if(reverse)$ListDict.reverse(self)
return(self.__brython__ ? $N : self)}
$B.set_func_names($ListDict)
$B.$list=function(t){t.__brython__=true;
return t}
function list(){var $=$B.args('list',1,{obj:null},['obj'],arguments,{obj:null},null,null),obj=$.obj
if(obj===null)return[]
if(Array.isArray(obj)){
obj=obj.slice()
obj.__brython__=true;
if(obj.__class__==$TupleDict){var res=obj.slice()
res.__class__=$ListDict
return res}
return obj}
var res=[],pos=0,arg=iter(obj),next_func=getattr(arg,'__next__')
while(1){try{res[pos++]=next_func()}
catch(err){if(!isinstance(err,_b_.StopIteration)){throw err}
break}}
res.__brython__=true 
return res}
list.__class__=$B.$factory
list.$dict=$ListDict
$ListDict.$factory=list
list.$is_func=true
list.__module__='builtins'
list.__bases__=[]
var $ListSubclassDict={__class__:$B.$type,__name__:'list',__new__: function(cls){return{__class__:cls.$dict,$t:[]}}}
for(var $attr in $ListDict){if(typeof $ListDict[$attr]=='function' && 
$ListDict[$attr].__class__!==$B.$factory){
$ListDict[$attr]=(function(attr){var method=$ListDict[attr],func=function(){var self=arguments[0]
if(self.$t!==undefined){var args=[self.$t]
for(var i=1,len=arguments.length;i<len;i++){args.push(arguments[i])}
return method.apply(null,args)}else{return method.apply(null,arguments)}}
return func})($attr)
$ListSubclassDict[$attr]=(function(attr){return function(){var args=[]
if(arguments.length>0){var args=[arguments[0].$t]
var pos=1
for(var i=1,_len_i=arguments.length;i < _len_i;i++){args[pos++]=arguments[i]}}
return $ListDict[attr].apply(null,args)}})($attr)}}
$ListSubclassDict.__mro__=[$ListSubclassDict,$ObjectDict]
$B.$ListSubclassFactory={__class__:$B.$factory,$dict:$ListSubclassDict}
function $tuple(arg){return arg}
var $TupleDict={__class__:$B.$type,__name__:'tuple',$native:true}
$TupleDict.__iter__=function(self){return $B.$iterator(self,$tuple_iterator)}
var $tuple_iterator=$B.$iterator_class('tuple_iterator')
function tuple(){var obj=list.apply(null,arguments)
obj.__class__=$TupleDict
return obj}
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
if($TupleDict[attr]===undefined){if(typeof $ListDict[attr]=='function'){$TupleDict[attr]=(function(x){return function(){return $ListDict[x].apply(null,arguments)}})(attr)}else{$TupleDict[attr]=$ListDict[attr]}}}}
$TupleDict.__delitem__=function(){throw _b_.TypeError("'tuple' object doesn't support item deletion")}
$TupleDict.__setitem__=function(){throw _b_.TypeError("'tuple' object does not support item assignment")}
$TupleDict.__eq__=function(self,other){
if(other===undefined)return self===tuple
return $ListDict.__eq__(self,other)}
$TupleDict.__hash__=function(self){
var x=0x345678
for(var i=0,_len_i=self.length;i < _len_i;i++){var y=_b_.hash(self[i]);
x=(1000003 * x)^ y & 0xFFFFFFFF;}
return x}
$TupleDict.__mro__=[$TupleDict,$ObjectDict]
$TupleDict.__name__='tuple'
$B.set_func_names($TupleDict)
_b_.list=list
_b_.tuple=tuple
_b_.object.$dict.__bases__=tuple()})(__BRYTHON__)
;(function($B){eval($B.InjectBuiltins())
var $ObjectDict=object.$dict
var $StringDict={__class__:$B.$type,__dir__:$ObjectDict.__dir__,__name__:'str',$native:true}
function normalize_start_end($){if($.start===null||$.start===_b_.None){$.start=0}
else if($.start<0){$.start +=$.self.length;$.start=Math.max(0,$.start)}
if($.end===null||$.end===_b_.None){$.end=$.self.length}
else if($.end<0){$.end +=$.self.length;$.end=Math.max(0,$.end)}
if(!isinstance($.start,_b_.int)||!isinstance($.end,_b_.int)){throw _b_.TypeError(
"slice indices must be integers or None or have an __index__ method")}}
function reverse(s){
return s.split('').reverse().join('')}
function check_str(obj){if(!_b_.isinstance(obj,str)){throw _b_.TypeError("can't convert '"+
$B.get_class(obj).__name__+"' object to str implicitely")}}
$StringDict.__add__=function(self,other){if(!(typeof other==="string")){try{return getattr(other,'__radd__')(self)}
catch(err){throw _b_.TypeError(
"Can't convert "+$B.get_class(other).__name__+" to str implicitely")}}
return self+other}
$StringDict.__contains__=function(self,item){if(!(typeof item==="string")){throw _b_.TypeError(
"'in <string>' requires string as left operand, not "+item.__class__)}
var nbcar=item.length
if(nbcar==0)return true 
if(self.length==0)return nbcar==0
for(var i=0,_len_i=self.length;i < _len_i;i++){if(self.substr(i,nbcar)==item)return true}
return false}
$StringDict.__delitem__=function(){throw _b_.TypeError("'str' object doesn't support item deletion")}
$StringDict.__dir__=$ObjectDict.__dir__ 
$StringDict.__eq__=function(self,other){if(other===undefined){
return self===str}
if(_b_.isinstance(other,_b_.str)){return other.valueOf()==self.valueOf()}
return other===self.valueOf()}
function preformat(self,fmt){if(fmt.empty){return _b_.str(self)}
if(fmt.type && fmt.type!='s'){throw _b_.ValueError("Unknown format code '"+fmt.type+
"' for object of type 'str'")}
return self}
$StringDict.__format__=function(self,format_spec){var fmt=new $B.parse_format_spec(format_spec)
fmt.align=fmt.align ||'<'
return $B.format_width(preformat(self,fmt),fmt)}
$StringDict.__getitem__=function(self,arg){if(isinstance(arg,_b_.int)){var pos=arg
if(arg<0)pos+=self.length
if(pos>=0 && pos<self.length)return self.charAt(pos)
throw _b_.IndexError('string index out of range')}
if(isinstance(arg,slice)){var s=_b_.slice.$dict.$conv_for_seq(arg,self.length),start=s.start,stop=s.stop,step=s.step
var res='',i=null
if(step>0){if(stop<=start)return ''
for(var i=start;i<stop;i+=step)res +=self.charAt(i)}else{
if(stop>=start)return ''
for(var i=start;i>stop;i+=step)res +=self.charAt(i)}
return res}
if(isinstance(arg,bool))return self.__getitem__(_b_.int(arg))
throw _b_.TypeError('string indices must be integers')}
$StringDict.__hash__=function(self){if(self===undefined){return $StringDict.__hashvalue__ ||$B.$py_next_hash-- }
var hash=1;
for(var i=0,_len_i=self.length;i < _len_i;i++){hash=(101*hash + self.charCodeAt(i))& 0xFFFFFFFF}
return hash}
$StringDict.__init__=function(self,arg){self.valueOf=function(){return arg}
self.toString=function(){return arg}
return _b_.None}
var $str_iterator=$B.$iterator_class('str_iterator')
$StringDict.__iter__=function(self){var items=self.split('')
return $B.$iterator(items,$str_iterator)}
$StringDict.__len__=function(self){return self.length}
var kwarg_key=new RegExp('([^\\)]*)\\)')
var NotANumber=function(){this.name='NotANumber'}
var number_check=function(s){if(!isinstance(s,[_b_.int,_b_.float])){throw new NotANumber()}}
var get_char_array=function(size,char){if(size <=0)
return ''
return new Array(size + 1).join(char)}
var format_padding=function(s,flags,minus_one){var padding=flags.padding
if(!padding){
return s}
s=s.toString()
padding=parseInt(padding,10)
if(minus_one){
padding -=1}
if(!flags.left){return get_char_array(padding - s.length,flags.pad_char)+ s}else{
return s + get_char_array(padding - s.length,flags.pad_char)}}
var format_int_precision=function(val,flags){var precision=flags.precision
if(!precision){return val.toString()}
precision=parseInt(precision,10)
var s
if(val.__class__===$B.LongInt.$dict){s=$B.LongInt.$dict.to_base(val,10)}else{
s=val.toString()}
var sign=s[0]
if(s[0]==='-'){return '-' + get_char_array(precision - s.length + 1,'0')+ s.slice(1)}
return get_char_array(precision - s.length,'0')+ s}
var format_float_precision=function(val,upper,flags,modifier){var precision=flags.precision
if(isFinite(val)){val=modifier(val,precision,flags,upper)
return val}
if(val===Infinity){val='inf'}else if(val===-Infinity){val='-inf'}else{
val='nan'}
if(upper){return val.toUpperCase()}
return val}
var format_sign=function(val,flags){if(flags.sign){if(val >=0){return "+"}}else if(flags.space){if(val >=0){return " "}}
return ""}
var str_format=function(val,flags){
flags.pad_char=" " 
return format_padding(str(val),flags)}
var num_format=function(val,flags){number_check(val)
if(val.__class__===$B.LongInt.$dict){val=$B.LongInt.$dict.to_base(val,10)}else{
val=parseInt(val)}
var s=format_int_precision(val,flags)
if(flags.pad_char==='0'){if(val < 0){s=s.substring(1)
return '-' + format_padding(s,flags,true)}
var sign=format_sign(val,flags)
if(sign !==''){return sign + format_padding(s,flags,true)}}
return format_padding(format_sign(val,flags)+ s,flags)}
var repr_format=function(val,flags){flags.pad_char=" " 
return format_padding(repr(val),flags)}
var ascii_format=function(val,flags){flags.pad_char=" " 
return format_padding(ascii(val),flags)}
var _float_helper=function(val,flags){number_check(val)
if(!flags.precision){if(!flags.decimal_point){flags.precision=6}else{
flags.precision=0}}else{
flags.precision=parseInt(flags.precision,10)
validate_precision(flags.precision)}
return parseFloat(val)}
var trailing_zeros=/(.*?)(0+)([eE].*)/
var leading_zeros=/\.(0*)/
var trailing_dot=/\.$/
var validate_precision=function(precision){
if(precision > 20){precision=20 }}
var floating_point_format=function(val,upper,flags){val=_float_helper(val,flags)
var v=val.toString()
var v_len=v.length
var dot_idx=v.indexOf('.')
if(dot_idx < 0){dot_idx=v_len}
if(val < 1 && val > -1){var zeros=leading_zeros.exec(v)
var numzeros
if(zeros){numzeros=zeros[1].length}else{
numzeros=0}
if(numzeros >=4){val=format_sign(val,flags)+ format_float_precision(val,upper,flags,_floating_g_exp_helper)
if(!flags.alternate){var trl=trailing_zeros.exec(val)
if(trl){val=trl[1].replace(trailing_dot,'')+ trl[3]}}else{
if(flags.precision <=1){val=val[0]+ '.' + val.substring(1)}}
return format_padding(val,flags)}
flags.precision +=numzeros
return format_padding(format_sign(val,flags)+ format_float_precision(val,upper,flags,function(val,precision){val=val.toFixed(min(precision,v_len - dot_idx)+ numzeros)}),flags)}
if(dot_idx > flags.precision){val=format_sign(val,flags)+ format_float_precision(val,upper,flags,_floating_g_exp_helper)
if(!flags.alternate){var trl=trailing_zeros.exec(val)
if(trl){val=trl[1].replace(trailing_dot,'')+ trl[3]}}else{
if(flags.precision <=1){val=val[0]+ '.' + val.substring(1)}}
return format_padding(val,flags)}
return format_padding(format_sign(val,flags)+ format_float_precision(val,upper,flags,function(val,precision){if(!flags.decimal_point){precision=min(v_len - 1,6)}else if(precision > v_len){if(!flags.alternate){precision=v_len}}
if(precision < dot_idx){precision=dot_idx}
return val.toFixed(precision - dot_idx)}),flags)}
var _floating_g_exp_helper=function(val,precision,flags,upper){if(precision){--precision}
val=val.toExponential(precision)
var e_idx=val.lastIndexOf('e')
if(e_idx > val.length - 4){val=val.substring(0,e_idx + 2)+ '0' + val.substring(e_idx + 2)}
if(upper){return val.toUpperCase()}
return val}
var floating_point_decimal_format=function(val,upper,flags){val=_float_helper(val,flags)
return format_padding(format_sign(val,flags)+ format_float_precision(val,upper,flags,function(val,precision,flags){val=val.toFixed(precision)
if(precision===0 && flags.alternate){val +='.'}
return val}),flags)}
var _floating_exp_helper=function(val,precision,flags,upper){val=val.toExponential(precision)
var e_idx=val.lastIndexOf('e')
if(e_idx > val.length - 4){val=val.substring(0,e_idx + 2)+ '0' + val.substring(e_idx + 2)}
if(upper){return val.toUpperCase()}
return val}
var floating_point_exponential_format=function(val,upper,flags){val=_float_helper(val,flags)
return format_padding(format_sign(val,flags)+ format_float_precision(val,upper,flags,_floating_exp_helper),flags)}
var signed_hex_format=function(val,upper,flags){var ret
number_check(val)
if(val.__class__===$B.LongInt.$dict){ret=$B.LongInt.$dict.to_base(val,16)}else{
ret=parseInt(val)
ret=ret.toString(16)}
ret=format_int_precision(ret,flags)
if(upper){ret=ret.toUpperCase()}
if(flags.pad_char==='0'){if(val < 0){ret=ret.substring(1)
ret='-' + format_padding(ret,flags,true)}
var sign=format_sign(val,flags)
if(sign !==''){ret=sign + format_padding(ret,flags,true)}}
if(flags.alternate){if(ret.charAt(0)==='-'){if(upper){ret="-0X" + ret.slice(1)}else{
ret="-0x" + ret.slice(1)}}else{
if(upper){ret="0X" + ret}else{
ret="0x" + ret}}}
return format_padding(format_sign(val,flags)+ ret,flags)}
var octal_format=function(val,flags){number_check(val)
var ret 
if(val.__class__===$B.LongInt.$dict){ret=$B.LongInt.$dict.to_base(8)}else{
ret=parseInt(val)
ret=ret.toString(8)}
ret=format_int_precision(ret,flags)
if(flags.pad_char==='0'){if(val < 0){ret=ret.substring(1)
ret='-' + format_padding(ret,flags,true)}
var sign=format_sign(val,flags)
if(sign !==''){ret=sign + format_padding(ret,flags,true)}}
if(flags.alternate){if(ret.charAt(0)==='-'){ret="-0o" + ret.slice(1)}else{
ret="0o" + ret}}
return format_padding(ret,flags)}
var single_char_format=function(val,flags){if(isinstance(val,str)&& val.length==1)return val
try{
val=_b_.int(val)}catch(err){throw _b_.TypeError('%c requires int or char')}
return format_padding(chr(val),flags)}
var num_flag=function(c,flags){if(c==='0' && !flags.padding && !flags.decimal_point && !flags.left){flags.pad_char='0'
return}
if(!flags.decimal_point){flags.padding=(flags.padding ||"")+ c}else{
flags.precision=(flags.precision ||"")+ c}}
var decimal_point_flag=function(val,flags){if(flags.decimal_point){
throw new UnsupportedChar()}
flags.decimal_point=true}
var neg_flag=function(val,flags){flags.pad_char=' ' 
flags.left=true}
var space_flag=function(val,flags){flags.space=true}
var sign_flag=function(val,flags){flags.sign=true}
var alternate_flag=function(val,flags){flags.alternate=true}
var char_mapping={'s': str_format,'d': num_format,'i': num_format,'u': num_format,'o': octal_format,'r': repr_format,'a': ascii_format,'g': function(val,flags){return floating_point_format(val,false,flags)},'G': function(val,flags){return floating_point_format(val,true,flags)},'f': function(val,flags){return floating_point_decimal_format(val,false,flags)},'F': function(val,flags){return floating_point_decimal_format(val,true,flags)},'e': function(val,flags){return floating_point_exponential_format(val,false,flags)},'E': function(val,flags){return floating_point_exponential_format(val,true,flags)},'x': function(val,flags){return signed_hex_format(val,false,flags)},'X': function(val,flags){return signed_hex_format(val,true,flags)},'c': single_char_format,'0': function(val,flags){return num_flag('0',flags)},'1': function(val,flags){return num_flag('1',flags)},'2': function(val,flags){return num_flag('2',flags)},'3': function(val,flags){return num_flag('3',flags)},'4': function(val,flags){return num_flag('4',flags)},'5': function(val,flags){return num_flag('5',flags)},'6': function(val,flags){return num_flag('6',flags)},'7': function(val,flags){return num_flag('7',flags)},'8': function(val,flags){return num_flag('8',flags)},'9': function(val,flags){return num_flag('9',flags)},'-': neg_flag,' ': space_flag,'+': sign_flag,'.': decimal_point_flag,'#': alternate_flag}
var UnsupportedChar=function(){this.name="UnsupportedChar"}
$StringDict.__mod__=function(self,args){var length=self.length,pos=0 |0,argpos=null,getitem
if(_b_.isinstance(args,_b_.tuple)){argpos=0 |0}else{getitem=_b_.getattr(args,'__getitem__',null)}
var ret=''
var $get_kwarg_string=function(s){
++pos
var rslt=kwarg_key.exec(s.substring(newpos))
if(!rslt){throw _b_.ValueError("incomplete format key")}
var key=rslt[1]
newpos +=rslt[0].length
try{
var self=getitem(key)}catch(err){if(err.name==="KeyError"){throw err}
throw _b_.TypeError("format requires a mapping")}
return get_string_value(s,self)}
var $get_arg_string=function(s){
var self
if(argpos===null){
self=args}else{
self=args[argpos++]
if(self===undefined){throw _b_.TypeError("not enough arguments for format string")}}
return get_string_value(s,self)}
var get_string_value=function(s,self){
var flags={'pad_char': ' '}
do{
var func=char_mapping[s[newpos]]
try{
if(func===undefined){throw new UnsupportedChar()}else{
var ret=func(self,flags)
if(ret !==undefined){return ret}
++newpos}}catch(err){if(err.name==="UnsupportedChar"){invalid_char=s[newpos]
if(invalid_char===undefined){throw _b_.ValueError("incomplete format")}
throw _b_.ValueError("unsupported format character '" + invalid_char + 
"' (0x" + invalid_char.charCodeAt(0).toString(16)+ ") at index " + newpos)}else if(err.name==="NotANumber"){var try_char=s[newpos]
var cls=self.__class__
if(!cls){if(typeof(self)==='string'){cls='str'}else{
cls=typeof(self)}}else{
cls=cls.__name__}
throw _b_.TypeError("%" + try_char + " format: a number is required, not " + cls)}else{
throw err}}}while(true)}
var nbph=0 
do{
var newpos=self.indexOf('%',pos)
if(newpos < 0){ret +=self.substring(pos)
break}
ret +=self.substring(pos,newpos)
++newpos
if(newpos < length){if(self[newpos]==='%'){ret +='%'}else{
nbph++
if(self[newpos]==='('){++newpos
ret +=$get_kwarg_string(self)}else{
ret +=$get_arg_string(self)}}}else{
throw _b_.ValueError("incomplete format")}
pos=newpos + 1}while(pos < length)
if(argpos!==null){if(args.length>argpos){throw _b_.TypeError('not enough arguments for format string')}else if(args.length<argpos){throw _b_.TypeError('not all arguments converted during string formatting')}}else if(nbph==0){throw _b_.TypeError('not all arguments converted during string formatting')}
return ret}
$StringDict.__mro__=[$StringDict,$ObjectDict]
$StringDict.__mul__=function(self,other){var $=$B.args('__mul__',2,{self:null,other:null},['self','other'],arguments,{},null,null)
if(!isinstance(other,_b_.int)){throw _b_.TypeError(
"Can't multiply sequence by non-int of type '"+
$B.get_class(other).__name__+"'")}
$res=''
for(var i=0;i<other;i++){$res+=self.valueOf()}
return $res}
$StringDict.__ne__=function(self,other){return other!==self.valueOf()}
$StringDict.__repr__=function(self){var res=self.replace(/\n/g,'\\\\n')
res=res.replace(/\\/g,'\\\\')
if(res.search('"')==-1 && res.search("'")==-1){return "'"+res+"'"}else if(self.search('"')==-1){return '"'+res+'"'}
var qesc=new RegExp("'","g")
res="'"+res.replace(qesc,"\\'")+"'" 
return res}
$StringDict.__setattr__=function(self,attr,value){return setattr(self,attr,value)}
$StringDict.__setitem__=function(self,attr,value){throw _b_.TypeError("'str' object does not support item assignment")}
$StringDict.__str__=function(self){if(self===undefined)return "<class 'str'>"
return self.toString()}
$StringDict.toString=function(){return 'string!'}
var $comp_func=function(self,other){if(typeof other !=="string"){throw _b_.TypeError(
"unorderable types: 'str' > "+$B.get_class(other).__name__+"()")}
return self > other}
$comp_func +='' 
var $comps={'>':'gt','>=':'ge','<':'lt','<=':'le'}
for(var $op in $comps){eval("$StringDict.__"+$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))}
$B.make_rmethods($StringDict)
var $notimplemented=function(self,other){throw NotImplementedError("OPERATOR not implemented for class str")}
$StringDict.capitalize=function(self){if(self.length==0)return ''
return self.charAt(0).toUpperCase()+self.substr(1).toLowerCase()}
$StringDict.casefold=function(self){throw _b_.NotImplementedError("function casefold not implemented yet");}
$StringDict.center=function(self,width,fillchar){var $=$B.args("center",3,{self:null,width:null,fillchar:null},['self','width','fillchar'],arguments,{fillchar:' '},null,null)
if($.width<=self.length)return self
var pad=parseInt(($.width-self.length)/2)
var res=$.fillchar.repeat(pad)
res +=self + res
if(res.length<$.width){res +=$.fillchar}
return res}
$StringDict.count=function(){var $=$B.args('count',4,{self:null,sub:null,start:null,stop:null},['self','sub','start','stop'],arguments,{start:null,stop:null},null,null)
if(!(typeof $.sub==="string")){throw _b_.TypeError(
"Can't convert '"+$B.get_class($.sub).__name__+"' object to str implicitly")}
var substr=$.self
if($.start!==null){var _slice
if($.stop!==null){_slice=_b_.slice($.start,$.stop)}
else{_slice=_b_.slice($.start,$.self.length)}
substr=$StringDict.__getitem__.apply(null,[$.self].concat(_slice))}else{if($.self.length+$.sub.length==0){return 1}}
if($.sub.length==0){if($.start==$.self.length){return 1}
else if(substr.length==0){return 0}
return substr.length+1}
var n=0,pos=0
while(pos<substr.length){pos=substr.indexOf($.sub,pos)
if(pos>=0){n++;pos+=$.sub.length}else break;}
return n}
$StringDict.encode=function(self,encoding){if(encoding===undefined)encoding='utf-8'
if(encoding=='rot13' ||encoding=='rot_13'){
var res=''
for(var i=0,_len=self.length;i<_len ;i++){var char=self.charAt(i)
if(('a'<=char && char<='m')||('A'<=char && char<='M')){res +=String.fromCharCode(String.charCodeAt(char)+13)}else if(('m'<char && char<='z')||('M'<char && char<='Z')){res +=String.fromCharCode(String.charCodeAt(char)-13)}else{res +=char}}
return res}
return _b_.bytes(self,encoding)}
$StringDict.endswith=function(){
var $=$B.args("endswith",4,{self:null,suffix:null,start:null,end:null},['self','suffix','start','end'],arguments,{start:0,end:null},null,null)
normalize_start_end($)
var suffixes=$.suffix
if(!isinstance(suffixes,_b_.tuple)){suffixes=[suffixes]}
var s=$.self.substring($.start,$.end)
for(var i=0,_len_i=suffixes.length;i < _len_i;i++){suffix=suffixes[i]
if(!_b_.isinstance(suffix,str)){throw _b_.TypeError(
"endswith first arg must be str or a tuple of str, not int")}
if(suffix.length<=s.length &&
s.substr(s.length-suffix.length)==suffix)return true}
return false}
$StringDict.expandtabs=function(self,tabsize){var $=$B.args('expandtabs',2,{self:null,tabsize:null},['self','tabsize'],arguments,{tabsize:8},null,null)
var s=$B.$GetInt($.tabsize),col=0,pos=0,res=''
if(s==1){return self.replace(/\t/g,' ')}
while(pos<self.length){var car=self.charAt(pos)
switch(car){case '\t':
while(col%s > 0){res +=' ';col++}
break
case '\r':
case '\n':
res +=car
col=0
break
default:
res +=car
col++
break}
pos++}
return res}
$StringDict.find=function(){
var $=$B.args("$StringDict.find",4,{self:null,sub:null,start:null,end:null},['self','sub','start','end'],arguments,{start:0,end:null},null,null)
check_str($.sub)
normalize_start_end($)
if(!isinstance($.start,_b_.int)||!isinstance($.end,_b_.int)){throw _b_.TypeError(
"slice indices must be integers or None or have an __index__ method")}
var s=$.self.substring($.start,$.end)
if($.sub.length==0 && $.start==$.self.length){return $.self.length}
if(s.length+$.sub.length==0){return -1}
var last_search=s.length-$.sub.length
for(var i=0;i<=last_search;i++){if(s.substr(i,$.sub.length)==$.sub){return $.start+i}}
return -1}
function parse_format(fmt_string){
var elts=fmt_string.split(':'),name,conv,spec,name_ext=[]
if(elts.length==1){
name=fmt_string}else{
name=elts[0]
spec=elts.splice(1).join(':')}
var elts=name.split('!')
if(elts.length>1){name=elts[0]
conv=elts[1]
if(conv.length!==1 ||'ras'.search(conv)==-1){throw _b_.ValueError('wrong conversion flag '+conv)}}
if(name!==undefined){
function name_repl(match){name_ext.push(match)
return ''}
var name_ext_re=/\.[_a-zA-Z][_a-zA-Z0-9]*|\[[_a-zA-Z][_a-zA-Z0-9]*\]|\[[0-9]+\]/g
name=name.replace(name_ext_re,name_repl)}
return{name: name,name_ext: name_ext,conv: conv,spec: spec||''}}
$StringDict.format=function(self){var $=$B.args('format',1,{self:null},['self'],arguments,{},'args','kw')
var pos=0,_len=self.length,car,text='',parts=[],rank=0,defaults={}
while(pos<_len){car=self.charAt(pos)
if(car=='{' && self.charAt(pos+1)=='{'){
text +='{'
pos+=2}else if(car=='}' && self.charAt(pos+1)=='}'){
text +='}'
pos+=2}else if(car=='{'){
parts.push(text)
var end=pos+1,nb=1
while(end<_len){if(self.charAt(end)=='{'){nb++;end++}
else if(self.charAt(end)=='}'){nb--;end++
if(nb==0){
var fmt_string=self.substring(pos+1,end-1)
var fmt_obj=parse_format(fmt_string)
if(!fmt_obj.name){fmt_obj.name=rank+''
rank++}
if(fmt_obj.spec!==undefined){
function replace_nested(name,key){if(/\d+/.exec(key)){
return _b_.tuple.$dict.__getitem__($.args,parseInt(key))}else{
return _b_.dict.$dict.__getitem__($.kw,key)}}
fmt_obj.spec=fmt_obj.spec.replace(/\{(.+?)\}/g,replace_nested)}
parts.push(fmt_obj)
text=''
break}}else{end++}}
if(nb>0){throw ValueError("wrong format "+self)}
pos=end}else{text +=car;pos++}}
if(text){parts.push(text)}
var res='',fmt
for(var i=0;i<parts.length;i++){
if(typeof parts[i]=='string'){res +=parts[i];continue}
fmt=parts[i]
if(fmt.name.charAt(0).search(/\d/)>-1){
var pos=parseInt(fmt.name),value=_b_.tuple.$dict.__getitem__($.args,pos)}else{
var value=_b_.dict.$dict.__getitem__($.kw,fmt.name)}
for(var j=0;j<fmt.name_ext.length;j++){var ext=fmt.name_ext[j]
if(ext.charAt(0)=='.'){
value=_b_.getattr(value,ext.substr(1))}else{
var key=ext.substr(1,ext.length-2)
if(key.charAt(0).search(/\d/)>-1){key=parseInt(key)}
value=_b_.getattr(value,'__getitem__')(key)}}
if(fmt.conv=='a'){value=_b_.ascii(value)}
else if(fmt.conv=='r'){value=_b_.repr(value)}
else if(fmt.conv=='s'){value=_b_.str(value)}
res +=_b_.getattr(value,'__format__')(fmt.spec)}
return res}
$StringDict.format_map=function(self){throw NotImplementedError("function format_map not implemented yet");}
$StringDict.index=function(self){
var res=$StringDict.find.apply(null,arguments)
if(res===-1)throw _b_.ValueError("substring not found")
return res}
$StringDict.isalnum=function(){var $=$B.args('isalnum',1,{self:null},['self'],arguments,{},null,null)
return /^[a-z0-9]+$/i.test($.self)}
$StringDict.isalpha=function(self){var $=$B.args('isalpha',1,{self:null},['self'],arguments,{},null,null)
return /^[a-z]+$/i.test($.self)}
$StringDict.isdecimal=function(){var $=$B.args('isdecimal',1,{self:null},['self'],arguments,{},null,null)
return /^[0-9]+$/.test($.self)}
$StringDict.isdigit=function(){var $=$B.args('isdigit',1,{self:null},['self'],arguments,{},null,null)
return /^[0-9]+$/.test($.self)}
$StringDict.isidentifier=function(){var $=$B.args('isidentifier',1,{self:null},['self'],arguments,{},null,null)
if($.self.search(/\$/)>-1){return false}
var last=$.self.charAt($.self.length-1)
if(' \n;'.search(last)>-1){return false}
var dummy={}
try{eval("dummy."+$.self);return true}
catch(err){return false}}
$StringDict.islower=function(){var $=$B.args('islower',1,{self:null},['self'],arguments,{},null,null)
return $.self==$.self.toLowerCase()&& $.self.search(/^\s*$/)==-1}
$StringDict.isnumeric=function(){var $=$B.args('isnumeric',1,{self:null},['self'],arguments,{},null,null)
return /^[0-9]+$/.test($.self)}
$StringDict.isprintable=function(){var $=$B.args('isprintable',1,{self:null},['self'],arguments,{},null,null)
return !/[^ -~]/.test($.self)}
$StringDict.isspace=function(){var $=$B.args('isspace',1,{self:null},['self'],arguments,{},null,null)
return /^\s+$/i.test($.self)}
$StringDict.istitle=function(){var $=$B.args('istitle',1,{self:null},['self'],arguments,{},null,null)
if($.self.search(/^\s*$/)>-1){return false}
function get_case(char){if(char.toLowerCase()==char.toUpperCase()){return false}
else if(char==char.toLowerCase()){return 'lower'}
else{return 'upper'}}
var pos=0,char,previous=false
while(pos<$.self.length){char=$.self.charAt(pos)
if(previous===undefined){previous=get_case(char)}
else{_case=get_case(char)
if(_case=='upper' && previous){return false}
else if(_case=='lower' && !previous){return false}
previous=_case}
pos++}
return true}
$StringDict.isupper=function(){var $=$B.args('isupper',1,{self:null},['self'],arguments,{},null,null)
return $.self==$.self.toUpperCase()&& $.self.search(/^\s*$/)==-1}
$StringDict.join=function(){var $=$B.args('join',2,{self:null,iterable:null},['self','iterable'],arguments,{},null,null)
var iterable=_b_.iter($.iterable)
var res=[],count=0
while(1){try{var obj2=_b_.next(iterable)
if(!isinstance(obj2,str)){throw _b_.TypeError(
"sequence item "+count+": expected str instance, "+$B.get_class(obj2).__name__+" found")}
res.push(obj2)}catch(err){if(_b_.isinstance(err,_b_.StopIteration)){break}
else{throw err}}}
return res.join($.self)}
$StringDict.ljust=function(self){var $=$B.args('ljust',3,{self:null,width:null,fillchar:null},['self','width','fillchar'],arguments,{fillchar:' '},null,null)
if($.width <=self.length)return self
return self + $.fillchar.repeat($.width - self.length)}
$StringDict.lower=function(){var $=$B.args('lower',1,{self:null},['self'],arguments,{},null,null)
return $.self.toLowerCase()}
$StringDict.lstrip=function(self,x){var $=$B.args('lstrip',2,{self:null,chars:null},['self','chars'],arguments,{chars:_b_.None},null,null)
if($.chars===_b_.None){return $.self.replace(/^\s+/,'')}
return $.self.replace(new RegExp("^["+$.chars+"]*"),"")}
$StringDict.maketrans=function(){var $=$B.args('maketrans',3,{x:null,y:null,z:null},['x','y','z'],arguments,{y:null,z:null},null,null)
var _t=_b_.dict()
for(var i=0;i < 256;i++)_t.$numeric_dict[i]=i
if($.y===null && $.z===null){
if(!_b_.isinstance($.x,_b_.dict)){throw _b_.TypeError('maketrans only argument must be a dict')}
var items=_b_.list(_b_.dict.$dict.items($.x))
for(var i=0,len=items.length;i<len;i++){var k=items[i][0],v=items[i][1]
if(!_b_.isinstance(k,_b_.int)){if(_b_.isinstance(k,_b_.str)&& k.length==1){k=_b_.ord(k)}
else{throw _b_.TypeError("dictionary key "+k+
" is not int or 1-char string")}}
if(v!==_b_.None && !_b_.isinstance(v,[_b_.int,_b_.str])){throw _b_.TypeError("dictionary value "+v+
" is not None, integer or string")}
_t.$numeric_dict[k]=v}
return _t}else{
if(!(_b_.isinstance($.x,_b_.str)&& _b_.isinstance($.y,_b_.str))){throw _b_.TypeError("maketrans arguments must be strings")}else if($.x.length!==$.y.length){throw _b_.TypeError("maketrans arguments must be strings or same length")}else{var toNone={}
if($.z!==null){
if(!_b_.isinstance($.z,_b_.str)){throw _b_.TypeError('maketrans third argument must be a string')}
for(var i=0,len=$.z.length;i<len;i++){toNone[_b_.ord($.z.charAt(i))]=true}}
for(var i=0,len=$.x.length;i<len;i++){_t.$numeric_dict[_b_.ord($.x.charAt(i))]=_b_.ord($.y.charAt(i))}
for(var k in toNone){_t.$numeric_dict[k]=_b_.None}
return _t}}}
$StringDict.partition=function(){var $=$B.args('partition',2,{self:null,sep:null},['self','sep'],arguments,{},null,null)
if($.sep==''){throw _b_.ValueError('empty separator')}
check_str($.sep)
var i=$.self.indexOf($.sep)
if(i==-1)return _b_.tuple([$.self,'',''])
return _b_.tuple([$.self.substring(0,i),$.sep,$.self.substring(i+$.sep.length)])}
function $re_escape(str)
{var specials="[.*+?|()$^"
for(var i=0,_len_i=specials.length;i < _len_i;i++){var re=new RegExp('\\'+specials.charAt(i),'g')
str=str.replace(re,"\\"+specials.charAt(i))}
return str}
$StringDict.replace=function(self,old,_new,count){
var $=$B.args('replace',4,{self:null,old:null,$$new:null,count:null},['self','old','$$new','count'],arguments,{count:-1},null,null),count=$.count,self=$.self,old=$.old,_new=$.$$new
check_str(old)
check_str(_new)
if(!isinstance(count,[_b_.int,_b_.float])){throw _b_.TypeError("'" + $B.get_class(count).__name__ + 
"' object cannot be interpreted as an integer");}else if(isinstance(count,_b_.float)){throw _b_.TypeError("integer argument expected, got float");}
if(count==0){return self}
if(count.__class__==$B.LongInt.$dict){count=parseInt(count.value)}
if(old==''){if(_new==''){return self}
if(self==''){return _new}
var elts=self.split('')
if(count>-1 && elts.length>=count){var rest=elts.slice(count).join('')
return _new+elts.slice(0,count).join(_new)+rest}else{return _new+elts.join(_new)+_new}}else{var elts=$StringDict.split(self,old,count)}
var res=self,pos=-1
if(old.length==0){var res=_new
for(var i=0;i<elts.length;i++){res +=elts[i]+_new}
return res+rest}
if(count < 0)count=res.length;
while(count > 0){pos=res.indexOf(old,pos);
if(pos < 0)
break;
res=res.substr(0,pos)+ _new + res.substr(pos + old.length);
pos=pos + _new.length;
count--;}
return res;}
$StringDict.rfind=function(self){
var $=$B.args("rfind",4,{self:null,sub:null,start:null,end:null},['self','sub','start','end'],arguments,{start:0,end:null},null,null)
normalize_start_end($)
check_str($.sub)
if($.sub.length==0){if($.start>$.self.length){return -1}
else{return $.self.length}}
var sublen=$.sub.length
for(var i=$.end-sublen;i>=$.start;i--){if($.self.substr(i,sublen)==$.sub){return i}}
return -1}
$StringDict.rindex=function(){
var res=$StringDict.rfind.apply(null,arguments)
if(res==-1){throw _b_.ValueError("substring not found")}
return res}
$StringDict.rjust=function(self){var $=$B.args("rjust",3,{self:null,width:null,fillchar:null},['self','width','fillchar'],arguments,{fillchar:' '},null,null)
if($.width <=self.length)return self
return $.fillchar.repeat($.width - self.length)+ self}
$StringDict.rpartition=function(self,sep){var $=$B.args('rpartition',2,{self:null,sep:null},['self','sep'],arguments,{},null,null)
check_str($.sep)
var self=reverse($.self),sep=reverse($.sep)
var items=$StringDict.partition(self,sep).reverse()
for(var i=0;i<items.length;i++){items[i]=items[i].split('').reverse().join('')}
return items}
$StringDict.rsplit=function(self){var $=$B.args("rsplit",3,{self:null,sep:null,maxsplit:null},['self','sep','maxsplit'],arguments,{sep:_b_.None,maxsplit:-1},null,null),sep=$.sep,maxsplit=$.maxsplit,self=$.self
var rev_str=reverse($.self),rev_sep=sep===_b_.None ? sep : reverse($.sep),rev_res=$StringDict.split(rev_str,rev_sep,$.maxsplit)
rev_res.reverse()
for(var i=0;i<rev_res.length;i++){rev_res[i]=reverse(rev_res[i])}
return rev_res}
$StringDict.rstrip=function(self,x){var $=$B.args('rstrip',2,{self:null,chars:null},['self','chars'],arguments,{chars:_b_.None},null,null)
if($.chars===_b_.None){return $.self.replace(/\s+$/,'')}
return $.self.replace(new RegExp("["+$.chars+"]*$"),"")}
$StringDict.split=function(){var args=[],pos=0
var $=$B.args("split",3,{self:null,sep:null,maxsplit:null},['self','sep','maxsplit'],arguments,{sep:_b_.None,maxsplit:-1},null,null)
var sep=$.sep,maxsplit=$.maxsplit,self=$.self
if(maxsplit.__class__===$B.LongInt.$dict){maxsplit=parseInt(maxsplit.value)}
if(sep=='')throw _b_.ValueError('empty separator')
if(sep===_b_.None){var res=[]
var pos=0
while(pos<self.length&&self.charAt(pos).search(/\s/)>-1){pos++}
if(pos===self.length-1){return[self]}
var name=''
while(1){if(self.charAt(pos).search(/\s/)===-1){if(name===''){name=self.charAt(pos)}
else{name+=self.charAt(pos)}}else{if(name!==''){res.push(name)
if(maxsplit!==-1&&res.length===maxsplit+1){res.pop()
res.push(name+self.substr(pos))
return res}
name=''}}
pos++
if(pos>self.length-1){if(name){res.push(name)}
break}}
return res}else{var res=[],s='',pos=0,seplen=sep.length
if(maxsplit==0){return[self]}
while(pos<self.length){if(self.substr(pos,seplen)==sep){res.push(s)
pos +=seplen
if(maxsplit>-1 && res.length>=maxsplit){res.push(self.substr(pos))
return res}
s=''}else{s +=self.charAt(pos)
pos++}}
res.push(s)
return res}}
$StringDict.splitlines=function(self){var $=$B.args('splitlines',2,{self:null,keepends:null},['self','keepends'],arguments,{keepends:false},null,null)
if(!_b_.isinstance($.keepends,[_b_.bool,_b_.int])){throw _b_.TypeError('integer argument expected, got '+
$B.get_class($.keepends).__name)}
var keepends=_b_.int($.keepends)
if(keepends){var res=[],start=pos,pos=0,x,self=$.self
while(pos<self.length){if(self.substr(pos,2)=='\r\n'){res.push(self.substring(start,pos+2))
start=pos+2
pos=start}else if(self.charAt(pos)=='\r' ||self.charAt(pos)=='\n'){res.push(self.substring(start,pos+1))
start=pos+1
pos=start}else{pos++}}
var rest=self.substr(start)
if(rest){res.push(rest)}
return res}else{var self=$.self.replace(/[\r\n]$/,'')
return self.split(/\n|\r\n|\r/)}}
$StringDict.startswith=function(){
var $=$B.args("startswith",4,{self:null,prefix:null,start:null,end:null},['self','prefix','start','end'],arguments,{start:0,end:null},null,null)
normalize_start_end($)
var prefixes=$.prefix
if(!isinstance(prefixes,_b_.tuple)){prefixes=[prefixes]}
var s=$.self.substring($.start,$.end)
for(var i=0,_len_i=prefixes.length;i < _len_i;i++){prefix=prefixes[i]
if(!_b_.isinstance(prefix,str)){throw _b_.TypeError(
"endswith first arg must be str or a tuple of str, not int")}
if(s.substr(0,prefix.length)==prefix)return true}
return false}
$StringDict.strip=function(){var $=$B.args('strip',2,{self:null,chars:null},['self','chars'],arguments,{chars:_b_.None},null,null)
return $StringDict.rstrip($StringDict.lstrip($.self,$.chars),$.chars)}
$StringDict.swapcase=function(self){var $=$B.args('swapcase',1,{self:null},['self'],arguments,{},null,null)
return $.self.replace(/([a-z])|([A-Z])/g,function($0,$1,$2)
{return($1)? $0.toUpperCase(): $0.toLowerCase()})}
$StringDict.title=function(self){var $=$B.args('title',1,{self:null},['self'],arguments,{},null,null)
var res='',previous=false
function is_cased(c){return c.toLowerCase()!=c.toUpperCase()}
for(var i=0;i<$.self.length;i++){var char=$.self.charAt(i),cased=is_cased(char)
if(!previous && cased){res +=char.toUpperCase()}else if(previous){res+=char.toLowerCase()}
else{res+=char}
previous=cased}
return res}
$StringDict.translate=function(self,table){var res=[],pos=0
if(isinstance(table,_b_.dict)){for(var i=0,_len_i=self.length;i < _len_i;i++){var repl=_b_.dict.$dict.get(table,self.charCodeAt(i),-1)
if(repl==-1){res[pos++]=self.charAt(i)}
else if(repl!==None){res[pos++]=_b_.chr(repl)}}}
return res.join('')}
$StringDict.upper=function(){var $=$B.args('lower',1,{self:null},['self'],arguments,{},null,null)
return $.self.toUpperCase()}
$StringDict.zfill=function(self,width){var $=$B.args('zfill',2,{self:null,width:null},['self','width'],arguments,{},null,null)
if($.width <=self.length){return self}
switch(self.charAt(0)){case '+':
case '-':
return self.charAt(0)+'0'.repeat($.width-self.length)+self.substr(1)
default:
return '0'.repeat(width - self.length)+self}}
function str(arg){if(arg===undefined)return ''
switch(typeof arg){case 'string':
return arg
case 'number': 
if(isFinite(arg)){return arg.toString()}}
try{if(arg.__class__===$B.$factory){
var func=$B.$type.__getattribute__(arg.$dict.__class__,'__str__')
if(func.__func__===_b_.object.$dict.__str__){return func(arg)}
return func()}
var f=getattr(arg,'__str__')
return f()}
catch(err){
try{
var f=getattr(arg,'__repr__')
return getattr(f,'__call__')()}catch(err){if($B.debug>1){console.log(err)}
console.log('Warning - no method __str__ or __repr__, default to toString',arg)
return arg.toString()}}}
str.__class__=$B.$factory
str.$dict=$StringDict
$StringDict.$factory=str
$StringDict.__new__=function(cls){if(cls===undefined){throw _b_.TypeError('str.__new__(): not enough arguments')}
return{__class__:cls.$dict}}
$B.set_func_names($StringDict)
var $StringSubclassDict={__class__:$B.$type,__name__:'str'}
for(var $attr in $StringDict){if(typeof $StringDict[$attr]=='function'){$StringSubclassDict[$attr]=(function(attr){return function(){var args=[],pos=0
if(arguments.length>0){var args=[arguments[0].valueOf()],pos=1
for(var i=1,_len_i=arguments.length;i < _len_i;i++){args[pos++]=arguments[i]}}
return $StringDict[attr].apply(null,args)}})($attr)}}
$StringSubclassDict.__mro__=[$StringSubclassDict,$ObjectDict]
$B.$StringSubclassFactory={__class__:$B.$factory,$dict:$StringSubclassDict}
_b_.str=str
$B.parse_format_spec=function(spec){if(spec==''){this.empty=true}
else{var pos=0,aligns='<>=^',digits='0123456789',types='bcdeEfFgGnosxX%',align_pos=aligns.indexOf(spec.charAt(0))
if(align_pos!=-1){if(spec.charAt(1)&& aligns.indexOf(spec.charAt(1))!=-1){
this.fill=spec.charAt(0)
this.align=spec.charAt(1)
pos=2}else{
this.align=aligns[align_pos];
this.fill=' ';
pos++}}else{align_pos=aligns.indexOf(spec.charAt(1))
if(spec.charAt(1)&& align_pos!=-1){
this.align=aligns[align_pos]
this.fill=spec.charAt(0)
pos=2}}
var car=spec.charAt(pos)
if(car=='+'||car=='-'||car==' '){this.sign=car;
pos++;
car=spec.charAt(pos);}
if(car=='#'){this.alternate=true;pos++;car=spec.charAt(pos)}
if(car=='0'){
this.fill='0'
this.align='='
pos++;car=spec.charAt(pos)}
while(car && digits.indexOf(car)>-1){if(this.width===undefined){this.width=car}
else{this.width+=car}
pos++;car=spec.charAt(pos)}
if(this.width!==undefined){this.width=parseInt(this.width)}
if(car==','){this.comma=true;pos++;car=spec.charAt(pos)}
if(car=='.'){if(digits.indexOf(spec.charAt(pos+1))==-1){throw _b_.ValueError("Missing precision in format spec")}
this.precision=spec.charAt(pos+1)
pos+=2;car=spec.charAt(pos)
while(car && digits.indexOf(car)>-1){this.precision+=car;pos++;car=spec.charAt(pos)}
this.precision=parseInt(this.precision)}
if(car && types.indexOf(car)>-1){this.type=car;pos++;car=spec.charAt(pos)}
if(pos!==spec.length){
throw _b_.ValueError("Invalid format specifier")}}
this.toString=function(){return(this.fill===undefined ? '' : _b_.str(this.fill))+
(this.align||'')+
(this.sign||'')+
(this.alternate ? '#' : '')+
(this.sign_aware ? '0' : '')+
(this.width ||'')+
(this.comma ? ',' : '')+
(this.precision ? '.'+this.precision : '')+
(this.type ||'')}}
$B.format_width=function(s,fmt){if(fmt.width && s.length<fmt.width){var fill=fmt.fill ||' ',align=fmt.align ||'<',missing=fmt.width-s.length
switch(align){case '<':
return s+fill.repeat(missing)
case '>':
return fill.repeat(missing)+s
case '=':
if('+-'.indexOf(s.charAt(0))>-1){return s.charAt(0)+fill.repeat(missing)+s.substr(1)}else{return fill.repeat(missing)+s }
case '^':
left=parseInt(missing/2)
return fill.repeat(left)+s+fill.repeat(missing-left)}}
return s}})(__BRYTHON__)
;(function($B){eval($B.InjectBuiltins())
var $ObjectDict=_b_.object.$dict,str_hash=_b_.str.$dict.__hash__,$N=_b_.None
function $DictClass($keys,$values){this.iter=null
this.__class__=$DictDict
$DictDict.clear(this)
var setitem=$DictDict.__setitem__
var i=$keys.length
while(i--)setitem($keys[i],$values[i])}
var $DictDict={__class__:$B.$type,__name__ : 'dict',$native:true,__dir__:$ObjectDict.__dir__}
var $key_iterator=function(d){this.d=d
this.current=0
this.iter=new $item_generator(d)}
$key_iterator.prototype.length=function(){return this.iter.length }
$key_iterator.prototype.next=function(){return this.iter.next()[0]}
var $value_iterator=function(d){this.d=d
this.current=0
this.iter=new $item_generator(d)}
$value_iterator.prototype.length=function(){return this.iter.length }
$value_iterator.prototype.next=function(){return this.iter.next()[1]}
var $item_generator=function(d){this.i=0
if(d.$jsobj){this.items=[]
for(var attr in d.$jsobj){if(attr.charAt(0)!='$'){this.items.push([attr,d.$jsobj[attr]])}}
this.length=this.items.length;
return}
var items=[]
var pos=0
for(var k in d.$numeric_dict){items[pos++]=[parseFloat(k),d.$numeric_dict[k]]}
for(var k in d.$string_dict){items[pos++]=[k,d.$string_dict[k]]}
for(var k in d.$object_dict){items[pos++]=d.$object_dict[k]}
this.items=items
this.length=items.length}
$item_generator.prototype.next=function(){if(this.i < this.items.length){return this.items[this.i++]}
throw _b_.StopIteration("StopIteration")}
$item_generator.prototype.as_list=function(){return this.items}
var $item_iterator=function(d){this.d=d
this.current=0
this.iter=new $item_generator(d)}
$item_iterator.prototype.length=function(){return this.iter.items.length }
$item_iterator.prototype.next=function(){return _b_.tuple(this.iter.next())}
var $copy_dict=function(left,right){var _l=new $item_generator(right).as_list()
var si=$DictDict.__setitem__
var i=_l.length
while(i--)si(left,_l[i][0],_l[i][1])}
$iterator_wrapper=function(items,klass){var res={__class__:klass,__iter__:function(){items.iter.i=0;return res},__len__:function(){return items.length()},__next__:function(){return items.next()},__repr__:function(){return klass.__name__+'('+ new $item_generator(items).as_list().join(',')+ ')'},}
res.__str__=res.toString=res.__repr__
return res}
$DictDict.__bool__=function(self){var $=$B.args('__bool__',1,{self:null},['self'],arguments,{},null,null)
return $DictDict.__len__(self)> 0}
$DictDict.__contains__=function(){var $=$B.args('__contains__',2,{self:null,item:null},['self','item'],arguments,{},null,null),self=$.self,item=$.item
if(self.$jsobj)return self.$jsobj[item]!==undefined
switch(typeof item){case 'string':
return self.$string_dict[item]!==undefined
case 'number':
return self.$numeric_dict[item]!==undefined}
var _key=hash(item)
if(self.$str_hash[_key]!==undefined &&
_b_.getattr(item,'__eq__')(self.$str_hash[_key])){return true}
if(self.$numeric_dict[_key]!==undefined &&
_b_.getattr(item,'__eq__')(_key)){return true}
if(self.$object_dict[_key]!==undefined){
var _eq=getattr(item,'__eq__')
if(_eq(self.$object_dict[_key][0])){return true}}
return false}
$DictDict.__delitem__=function(){var $=$B.args('__eq__',2,{self:null,arg:null},['self','arg'],arguments,{},null,null),self=$.self,arg=$.arg
if(self.$jsobj){if(self.$jsobj[arg]===undefined){throw KeyError(arg)}
delete self.$jsobj[arg]
return $N}
switch(typeof arg){case 'string':
if(self.$string_dict[arg]===undefined)throw KeyError(_b_.str(arg))
delete self.$string_dict[arg]
delete self.$str_hash[str_hash(arg)]
return $N
case 'number':
if(self.$numeric_dict[arg]===undefined)throw KeyError(_b_.str(arg))
delete self.$numeric_dict[arg]
return $N}
var _key=hash(arg)
if(self.$object_dict[_key]!==undefined){delete self.$object_dict[_key]}
if(self.$jsobj)delete self.$jsobj[arg]
return $N}
$DictDict.__eq__=function(){var $=$B.args('__eq__',2,{self:null,other:null},['self','other'],arguments,{},null,null),self=$.self,other=$.other
if(!isinstance(other,dict))return false
if($DictDict.__len__(self)!=$DictDict.__len__(other)){return false}
if((self.$numeric_dict.length!=other.$numeric_dict.length)||
(self.$string_dict.length!=other.$string_dict.length)||
(self.$object_dict.length!=other.$object_dict.length)){return false}
for(var k in self.$numeric_dict){if(!_b_.getattr(other.$numeric_dict[k],'__eq__')(self.$numeric_dict[k])){return false}}
for(var k in self.$string_dict){if(!_b_.getattr(other.$string_dict[k],'__eq__')(self.$string_dict[k])){return false}}
for(var k in self.$object_dict){if(!_b_.getattr(other.$object_dict[k][1],'__eq__')(self.$object_dict[k][1])){return false}}
return true}
$DictDict.__getitem__=function(){var $=$B.args('__getitem__',2,{self:null,arg:null},['self','arg'],arguments,{},null,null),self=$.self,arg=$.arg
if(self.$jsobj){if(self.$jsobj[arg]===undefined){return None}
return self.$jsobj[arg]}
switch(typeof arg){case 'string':
if(self.$string_dict[arg]!==undefined)return self.$string_dict[arg]
break
case 'number':
if(self.$numeric_dict[arg]!==undefined)return self.$numeric_dict[arg]}
var _key=hash(arg)
var sk=self.$str_hash[_key]
if(sk!==undefined && _b_.getattr(arg,'__eq__')(sk)){return self.$string_dict[sk]}
if(self.$numeric_dict[_key]!==undefined &&
_b_.getattr(arg,'__eq__')(_key)){return self.$numeric_dict[_key]}
if(self.$object_dict[_key]!==undefined){return self.$object_dict[_key][1]}
if(self.__class__!==$DictDict){try{var missing_method=getattr(self.__class__.$factory,'__missing__')
return missing_method(self,arg)}catch(err){}}
throw KeyError(_b_.str(arg))}
$DictDict.__hash__=function(self){if(self===undefined){return $DictDict.__hashvalue__ ||$B.$py_next_hash-- }
throw _b_.TypeError("unhashable type: 'dict'");}
$DictDict.__init__=function(self){var args=[],pos=0
for(var i=1;i<arguments.length;i++){args[pos++]=arguments[i]}
$DictDict.clear(self)
switch(args.length){case 0:
return
case 1:
var obj=args[0]
if(Array.isArray(obj)){var i=obj.length
var si=$DictDict.__setitem__
while(i-->0)si(self,obj[i-1][0],obj[i-1][1])
return $N}else if(isinstance(obj,dict)){$copy_dict(self,obj)
return $N}
if(obj.__class__===$B.JSObject.$dict){
var si=$DictDict.__setitem__
for(var attr in obj.js)si(self,attr,obj.js[attr])
self.$jsobj=obj.js
return $N}}
var $ns=$B.args('dict',0,{},[],args,{},'args','kw')
var args=$ns['args']
var kw=$ns['kw']
if(args.length>0){if(isinstance(args[0],dict)){$B.$copy_dict(self,args[0])
return $N}
if(Array.isArray(args[0])){var src=args[0]
var i=src.length -1
var si=$DictDict.__setitem__
while(i-->0)si(self,src[i-1][0],src[i-1][1])}else{var iterable=iter(args[0])
while(1){try{var elt=next(iterable)
var key=getattr(elt,'__getitem__')(0)
var value=getattr(elt,'__getitem__')(1)
$DictDict.__setitem__(self,key,value)}catch(err){if(err.__name__==='StopIteration'){break}
throw err}}}}
if($DictDict.__len__(kw)> 0)$copy_dict(self,kw)
return $N}
var $dict_iterator=$B.$iterator_class('dict iterator')
$DictDict.__iter__=function(self){return $DictDict.keys(self)}
$DictDict.__len__=function(self){var _count=0
if(self.$jsobj){for(var attr in self.$jsobj){if(attr.charAt(0)!='$'){_count++}}
return _count}
for(var k in self.$numeric_dict)_count++
for(var k in self.$string_dict)_count++
for(var k in self.$object_dict)_count+=self.$object_dict[k].length
return _count}
$DictDict.__mro__=[$DictDict,$ObjectDict]
$DictDict.__ne__=function(self,other){return !$DictDict.__eq__(self,other)}
$DictDict.__next__=function(self){if(self.$iter==null){self.$iter=new $item_generator(self)}
try{
return self.$iter.next()}catch(err){if(err.__name__ !=="StopIteration"){throw err }}}
$DictDict.__repr__=function(self){if(self===undefined)return "<class 'dict'>"
if(self.$jsobj){
var res=[]
for(var attr in self.$jsobj){if(attr.charAt(0)=='$' ||attr=='__class__'){continue}
else{try{res.push("'"+attr+"': "+_b_.repr(self.$jsobj[attr]))}catch(err){}}}
return '{'+res.join(', ')+'}'}
var _objs=[self]
var res=[],pos=0
var items=new $item_generator(self).as_list()
for(var i=0;i < items.length;i++){var itm=items[i]
if(itm[1]===self){res[pos++]=repr(itm[0])+': {...}'}
else{res[pos++]=repr(itm[0])+': '+repr(itm[1])}}
return '{'+ res.join(', ')+'}'}
$DictDict.__setitem__=function(self,key,value){var $=$B.args('__setitem__',3,{self:null,key:null,value:null},['self','key','value'],arguments,{},null,null),self=$.self,key=$.key,value=$.value
if(self.$jsobj){self.$jsobj[key]=value;return}
switch(typeof key){case 'string':
self.$string_dict[key]=value
self.$str_hash[str_hash(key)]=key
return $N
case 'number':
self.$numeric_dict[key]=value
return $N}
var _key=hash(key)
var _eq=getattr(key,'__eq__')
if(self.$numeric_dict[_key]!==undefined && _eq(_key)){self.$numeric_dict[_key]=value
return $N}
var sk=self.$str_hash[_key]
if(sk!==undefined && _eq(sk)){self.$string_dict[sk]=value
return $N}
self.$object_dict[_key]=[key,value]
return $N}
$DictDict.__str__=$DictDict.__repr__
$B.make_rmethods($DictDict)
$DictDict.clear=function(){
var $=$B.args('clear',1,{self:null},['self'],arguments,{},null,null),self=$.self
self.$numeric_dict={}
self.$string_dict={}
self.$str_hash={}
self.$object_dict={}
if(self.$jsobj)self.$jsobj={}
return $N}
$DictDict.copy=function(self){
var $=$B.args('copy',1,{self:null},['self'],arguments,{},null,null),self=$.self,res=_b_.dict()
$copy_dict(res,self)
return res}
$DictDict.fromkeys=function(){var $=$B.args('fromkeys',3,{cls:null,keys:null,value:null},['cls','keys','value'],arguments,{value:_b_.None},null,null),keys=$.keys,value=$.value
var res=dict()
var keys_iter=_b_.iter(keys)
while(1){try{var key=_b_.next(keys_iter)
$DictDict.__setitem__(res,key,value)}catch(err){if($B.is_exc(err,[_b_.StopIteration])){return res}
throw err}}}
$DictDict.fromkeys.$type='classmethod'
$DictDict.get=function(){var $=$B.args('get',3,{self:null,key:null,_default:null},['self','key','_default'],arguments,{_default:$N},null,null)
try{return $DictDict.__getitem__($.self,$.key)}
catch(err){if(_b_.isinstance(err,_b_.KeyError)){return $._default}
else{throw err}}}
var $dict_itemsDict=$B.$iterator_class('dict_items')
$DictDict.items=function(self){if(arguments.length > 1){var _len=arguments.length - 1
var _msg="items() takes no arguments ("+_len+" given)"
throw _b_.TypeError(_msg)}
return $iterator_wrapper(new $item_iterator(self),$dict_itemsDict)}
var $dict_keysDict=$B.$iterator_class('dict_keys')
$DictDict.keys=function(self){if(arguments.length > 1){var _len=arguments.length - 1
var _msg="keys() takes no arguments ("+_len+" given)"
throw _b_.TypeError(_msg)}
return $iterator_wrapper(new $key_iterator(self),$dict_keysDict)}
$DictDict.pop=function(){var $=$B.args('pop',3,{self:null,key: null,_default:null},['self','key','_default'],arguments,{_default:$N},null,null),self=$.self,key=$.key,_default=$._default
try{var res=$DictDict.__getitem__(self,key)
$DictDict.__delitem__(self,key)
return res}catch(err){if(err.__name__==='KeyError'){if(_default!==undefined)return _default
throw err}
throw err}}
$DictDict.popitem=function(self){try{var itm=new $item_iterator(self).next()
$DictDict.__delitem__(self,itm[0])
return _b_.tuple(itm)}catch(err){if(err.__name__=="StopIteration"){throw KeyError("'popitem(): dictionary is empty'")}}}
$DictDict.setdefault=function(){var $=$B.args('setdefault',3,{self:null,key: null,_default:null},['self','key','_default'],arguments,{},null,null),self=$.self,key=$.key,_default=$._default
try{return $DictDict.__getitem__(self,key)}
catch(err){if(_default===undefined)_default=None
$DictDict.__setitem__(self,key,_default)
return _default}}
$DictDict.update=function(self){var $=$B.args('update',1,{'self':null},['self'],arguments,{},'args','kw'),self=$.self,args=$.args,kw=$.kw
if(args.length>0){var o=args[0]
if(isinstance(o,dict)){$copy_dict(self,o)}else if(hasattr(o,'__getitem__')&& hasattr(o,'keys')){var _keys=_b_.list(getattr(o,'keys')())
var si=$DictDict.__setitem__
var i=_keys.length
while(i--){
var _value=getattr(o,'__getitem__')(_keys[i])
si(self,_keys[i],_value)}}}
$copy_dict(self,kw)
return $N}
var $dict_valuesDict=$B.$iterator_class('dict_values')
$DictDict.values=function(self){if(arguments.length > 1){var _len=arguments.length - 1
var _msg="values() takes no arguments ("+_len+" given)"
throw _b_.TypeError(_msg)}
return $iterator_wrapper(new $value_iterator(self),$dict_valuesDict)}
function dict(args,second){if(second===undefined && Array.isArray(args)){
var res={__class__:$DictDict,$numeric_dict :{},$object_dict :{},$string_dict :{},$str_hash:{},length: 0}
var i=-1,stop=args.length-1
var si=$DictDict.__setitem__
while(i++<stop){var item=args[i]
switch(typeof item[0]){case 'string':
res.$string_dict[item[0]]=item[1]
res.$str_hash[str_hash(item[0])]=item[0]
break;
case 'number':
res.$numeric_dict[item[0]]=item[1]
break
default:
si(res,item[0],item[1])
break}}
return res}
var res={__class__:$DictDict}
$DictDict.clear(res)
var _args=[res],pos=1
for(var i=0,_len_i=arguments.length;i < _len_i;i++){_args[pos++]=arguments[i]}
$DictDict.__init__.apply(null,_args)
return res}
dict.__class__=$B.$factory
dict.$dict=$DictDict
$DictDict.$factory=dict
$DictDict.__new__=$B.$__new__(dict)
_b_.dict=dict
$B.$dict_iterator=function(d){return new $item_generator(d)}
$B.$dict_length=$DictDict.__len__
$B.$dict_getitem=$DictDict.__getitem__
$B.$dict_get=$DictDict.get
$B.$dict_set=$DictDict.__setitem__
$B.$dict_contains=$DictDict.__contains__
$B.$dict_items=function(d){return new $item_generator(d).as_list()}
$B.$copy_dict=$copy_dict 
$B.$dict_get_copy=$DictDict.copy 
var mappingproxyDict={__class__ : $B.$type,__name__ : "mappingproxy"}
mappingproxyDict.__mro__=[mappingproxyDict,_b_.object.$dict]
mappingproxyDict.__setitem__=function(){throw _b_.TypeError("'mappingproxy' object does not support item assignment")}
function mappingproxy(obj){var res=obj_dict(obj)
res.__class__=mappingproxyDict
return res}
mappingproxy.__class__=$B.$factory
mappingproxy.$dict=mappingproxyDict
mappingproxyDict.$factory=mappingproxy
$B.mappingproxy=mappingproxy
$B.obj_dict=function(obj){var res=dict()
res.$jsobj=obj
return res}})(__BRYTHON__)
;(function($B){var _=$B.builtins,$N=_.None
function create_type(obj){return $B.get_class(obj).$factory()}
function clone(obj){var res=create_type(obj)
res.$items=obj.$items.slice()
return res }
var $SetDict={__class__:$B.$type,__dir__:_.object.$dict.__dir__,__name__:'set',$native:true}
$SetDict.__add__=function(self,other){throw _.TypeError("unsupported operand type(s) for +: 'set' and " + 
typeof other )}
$SetDict.__and__=function(self,other,accept_iter){$test(accept_iter,other)
var res=create_type(self)
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if(_.getattr(other,'__contains__')(self.$items[i])){$SetDict.add(res,self.$items[i])}}
return res}
$SetDict.__contains__=function(self,item){if(self.$num &&(typeof item=='number')){if(isNaN(item)){
for(var i=self.$items.length-1;i>=0;i--){if(isNaN(self.$items[i])){return true}}
return false}else{return self.$items.indexOf(item)>-1}}
if(self.$str &&(typeof item=='string')){return self.$items.indexOf(item)>-1}
if(! _b_.isinstance(item,set)){_b_.hash(item)}
var eq_func=_b_.getattr(item,'__eq__')
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if(_.getattr(self.$items[i],'__eq__')(item))return true}
return false}
$SetDict.__eq__=function(self,other){
if(other===undefined)return self===set
if(_.isinstance(other,_.set)){if(other.$items.length==self.$items.length){for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if($SetDict.__contains__(self,other.$items[i])===false)return false}
return true}
return false}
if(_.isinstance(other,[_.list])){if(_.len(other)!=self.$items.length)return false
for(var i=0,_len_i=_.len(other);i < _len_i;i++){var _value=getattr(other,'__getitem__')(i)
if($SetDict.__contains__(self,_value)===false)return false}
return true}
if(_.hasattr(other,'__iter__')){
if(_.len(other)!=self.$items.length)return false
var _it=_.iter(other)
while(1){try{
var e=_.next(_it)
if(!$SetDict.__contains__(self,e))return false}catch(err){if(err.__name__=="StopIteration"){break}
throw err}}
return true}
return false}
$SetDict.__format__=function(self,format_string){return $SetDict.__str__(self)}
$SetDict.__ge__=function(self,other){if(_b_.isinstance(other,[set,frozenset])){return !$SetDict.__lt__(self,other)}else{return _b_.object.$dict.__ge__(self,other)}}
$SetDict.__gt__=function(self,other){if(_b_.isinstance(other,[set,frozenset])){return !$SetDict.__le__(self,other)}else{return _b_.object.$dict.__gt__(self,other)}}
$SetDict.__init__=function(self){var $=$B.args('__init__',2,{self:null,iterable:null},['self','iterable'],arguments,{iterable:[]},null,null),self=$.self,iterable=$.iterable
if(_.isinstance(iterable,[set,frozenset])){self.$items=iterable.$items
return $N}
var it=_b_.iter(iterable),obj={$items:[],$str:true,$num:true}
while(1){try{var item=_.next(it)
$SetDict.add(obj,item)}catch(err){if(_b_.isinstance(err,_b_.StopIteration)){break}
throw err}}
self.$items=obj.$items
return $N}
var $set_iterator=$B.$iterator_class('set iterator')
$SetDict.__iter__=function(self){var it=$B.$iterator(self.$items,$set_iterator),len=self.$items.length,nxt=it.__next__
it.__next__=function(){if(it.__len__()!=len){throw _b_.RuntimeError("size changed during iteration")}
return nxt()}
return it}
$SetDict.__le__=function(self,other){if(_b_.isinstance(other,[set,frozenset])){var cfunc=_.getattr(other,'__contains__')
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if(!cfunc(self.$items[i]))return false}
return true}else{return _b_.object.$dict.__le__(self,other)}}
$SetDict.__len__=function(self){return self.$items.length}
$SetDict.__lt__=function(self,other){if(_b_.isinstance(other,[set,frozenset])){return($SetDict.__le__(self,other)&&
$SetDict.__len__(self)<_.getattr(other,'__len__')())}else{return _b_.object.$dict['__lt__'](self,other)}}
$SetDict.__mro__=[$SetDict,_.object.$dict]
$SetDict.__ne__=function(self,other){return !$SetDict.__eq__(self,other)}
$SetDict.__or__=function(self,other,accept_iter){
var res=clone(self)
var func=_.getattr(_.iter(other),'__next__')
while(1){try{$SetDict.add(res,func())}
catch(err){if(_.isinstance(err,_.StopIteration)){break}
throw err}}
res.__class__=self.__class__
return res}
$SetDict.__str__=$SetDict.toString=$SetDict.__repr__=function(self){frozen=self.$real==='frozen'
self.$cycle=self.$cycle===undefined ? 0 : self.$cycle+1
if(self.$items.length===0){if(frozen)return 'frozenset()'
return 'set()'}
var klass_name=$B.get_class(self).__name__,head=klass_name+'({',tail='})'
if(head=='set('){head='{';tail='}'}
var res=[]
if(self.$cycle){self.$cycle--
return klass_name+'(...)'}
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){var r=_.repr(self.$items[i])
if(r===self||r===self.$items[i]){res.push('{...}')}
else{res.push(r)}}
res=res.join(', ')
self.$cycle--
return head+res+tail}
$SetDict.__sub__=function(self,other,accept_iter){
$test(accept_iter,other,'-')
var res=create_type(self)
var cfunc=_.getattr(other,'__contains__')
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if(!cfunc(self.$items[i])){res.$items.push(self.$items[i])}}
return res}
$SetDict.__xor__=function(self,other,accept_iter){
$test(accept_iter,other,'^')
var res=create_type(self)
var cfunc=_.getattr(other,'__contains__')
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if(!cfunc(self.$items[i])){$SetDict.add(res,self.$items[i])}}
for(var i=0,_len_i=other.$items.length;i < _len_i;i++){if(!$SetDict.__contains__(self,other.$items[i])){$SetDict.add(res,other.$items[i])}}
return res}
function $test(accept_iter,other,op){if(accept_iter===undefined && !_.isinstance(other,[set,frozenset])){throw _b_.TypeError("unsupported operand type(s) for "+op+
": 'set' and '"+$B.get_class(other).__name__+"'")}}
$B.make_rmethods($SetDict)
$SetDict.add=function(){var $=$B.args('add',2,{self:null,item:null},['self','item'],arguments,{},null,null),self=$.self,item=$.item
_b_.hash(item)
if(self.$str && !(typeof item=='string')){self.$str=false}
if(self.$num && !(typeof item=='number')){self.$num=false}
if(self.$num||self.$str){if(self.$items.indexOf(item)==-1){self.$items.push(item)}
return $N}
var cfunc=_.getattr(item,'__eq__')
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if(cfunc(self.$items[i]))return}
self.$items.push(item)
return $N}
$SetDict.clear=function(){var $=$B.args('clear',1,{self:null},['self'],arguments,{},null,null)
$.self.$items=[];
return $N}
$SetDict.copy=function(){var $=$B.args('copy',1,{self:null},['self'],arguments,{},null,null)
if(_b_.isinstance($.self,frozenset)){return $.self}
var res=set()
for(var i=0,_len_i=$.self.$items.length;i < _len_i;i++){res.$items[i]=$.self.$items[i]}
return res}
$SetDict.difference_update=function(self){var $=$B.args('difference_update',1,{self:null},['self'],arguments,{},'args',null)
for(var i=0;i<$.args.length;i++){var s=set($.args[i]),_next=_b_.getattr(_b_.iter(s),'__next__'),item
while(true){try{item=_next()
var _type=typeof item
if(_type=='string' ||_type=="number"){var _index=self.$items.indexOf(item)
if(_index > -1){self.$items.splice(_index,1)}}else{
for(var j=0;j < self.$items.length;j++){if(getattr(self.$items[j],'__eq__')(item)){self.$items.splice(j,1)}}}}catch(err){if(_b_.isinstance(err,_b_.StopIteration)){break}
throw err}}}
return $N}
$SetDict.discard=function(){var $=$B.args('discard',2,{self:null,item:null},['self','item'],arguments,{},null,null)
try{$SetDict.remove($.self,$.item)}
catch(err){if(!_b_.isinstance(err,[_b_.KeyError,_b_.LookupError])){throw err}}
return $N}
$SetDict.intersection_update=function(){
var $=$B.args('intersection_update',1,{self:null},['self'],arguments,{},'args',null),self=$.self
for(var i=0;i<$.args.length;i++){var remove=[],s=set($.args[i])
for(var j=0;j<self.$items.length;j++){var _item=self.$items[j],_type=typeof _item
if(_type=='string' ||_type=="number"){if(s.$items.indexOf(_item)==-1){remove.push(j)}}else{var found=false
for(var k=0;!found && k < s.$items.length;k++){if(_b_.getattr(s.$items[k],'__eq__')(_item)){found=true}}
if(!found){remove.push(j)}}}
remove.sort().reverse()
for(var j=0;j<remove.length;j++){self.$items.splice(remove[j],1)}}
return $N}
$SetDict.isdisjoint=function(){var $=$B.args('is_disjoint',2,{self:null,other:null},['self','other'],arguments,{},null,null)
for(var i=0,_len_i=$.self.$items.length;i < _len_i;i++){if(_.getattr($.other,'__contains__')($.self.$items[i]))return false}
return true}
$SetDict.pop=function(self){if(self.$items.length===0)throw _.KeyError('pop from an empty set')
return self.$items.pop()}
$SetDict.remove=function(self,item){
var $=$B.args('remove',2,{self:null,item:null},['self','item'],arguments,{},null,null),self=$.self,item=$.item
if(!_b_.isinstance(item,set)){_b_.hash(item)}
if(typeof item=='string' ||typeof item=='number'){var _i=self.$items.indexOf(item)
if(_i==-1)throw _.KeyError(item)
self.$items.splice(_i,1)
return $N}
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if(_.getattr(self.$items[i],'__eq__')(item)){self.$items.splice(i,1)
return $N}}
throw _.KeyError(item)}
$SetDict.symmetric_difference_update=function(self,s){
var $=$B.args('symmetric_difference_update',2,{self:null,s:null},['self','s'],arguments,{},null,null),self=$.self,s=$.s
var _next=_b_.getattr(_b_.iter(s),'__next__'),item,remove=[],add=[]
while(true){try{item=_next()
var _type=typeof item
if(_type=='string' ||_type=="number"){var _index=self.$items.indexOf(item)
if(_index > -1){remove.push(_index)}else{add.push(item)}}else{
var found=false
for(var j=0;!found && j < self.$items.length;j++){if(_b_.getattr(self.$items[j],'__eq__')(item)){remove.push(j)
found=true}}
if(!found){add.push(item)}}}catch(err){if(_b_.isinstance(err,_b_.StopIteration)){break}
throw err}}
remove.sort().reverse()
for(var i=0;i<remove.length;i++){if(remove[i]!=remove[i-1]){self.$items.splice(remove[i],1)}}
for(var i=0;i<add.length;i++){$SetDict.add(self,add[i])}
return $N}
$SetDict.update=function(self){
var $=$B.args('update',1,{self:null},['self'],arguments,{},'args',null)
for(var i=0;i<$.args.length;i++){var other=set($.args[i])
for(var j=0,_len=other.$items.length;j < _len;j++){$SetDict.add(self,other.$items[j])}}
return $N}
$SetDict.difference=function(){var $=$B.args('difference',1,{self:null},['self'],arguments,{},'args',null)
if($.args.length==0){return $SetDict.copy($.self)}
var res=clone($.self)
for(var i=0;i<$.args.length;i++){res=$SetDict.__sub__(res,set($.args[i]))}
return res}
var fc=$SetDict.difference+'' 
eval('$SetDict.intersection = '+
fc.replace(/difference/g,'intersection').replace('__sub__','__and__'))
eval('$SetDict.symmetric_difference = '+
fc.replace(/difference/g,'symmetric_difference').replace('__sub__','__xor__'))
eval('$SetDict.issubset = '+
fc.replace(/difference/g,'issubset').replace('__sub__','__le__'))
eval('$SetDict.issuperset = '+
fc.replace(/difference/g,'issuperset').replace('__sub__','__ge__'))
eval('$SetDict.union = '+
fc.replace(/difference/g,'union').replace('__sub__','__or__'))
function set(){
var res={__class__:$SetDict,$str:true,$num:true,$items:[]}
var args=[res].concat(Array.prototype.slice.call(arguments))
$SetDict.__init__.apply(null,args)
return res}
set.__class__=$B.$factory
set.$dict=$SetDict
$SetDict.$factory=set
$SetDict.__new__=$B.$__new__(set)
$B.set_func_names($SetDict)
var $FrozensetDict={__class__:$B.$type,__name__:'frozenset'}
$FrozensetDict.__mro__=[$FrozensetDict,_.object.$dict]
for(var attr in $SetDict){switch(attr){case 'add':
case 'clear':
case 'discard':
case 'pop':
case 'remove':
case 'update':
break
default:
if($FrozensetDict[attr]==undefined){if(typeof $SetDict[attr]=='function'){$FrozensetDict[attr]=(function(x){return function(){return $SetDict[x].apply(null,arguments)}})(attr)}else{$FrozensetDict[attr]=$SetDict[attr]}}}}
$FrozensetDict.__hash__=function(self){if(self===undefined){return $FrozensetDict.__hashvalue__ ||$B.$py_next_hash-- }
if(self.__hashvalue__ !==undefined)return self.__hashvalue__
var _hash=1927868237
_hash *=self.$items.length 
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){var _h=_.hash(self.$items[i])
_hash ^=((_h ^ 89869747)^(_h << 16))* 3644798167}
_hash=_hash * 69069 + 907133923
if(_hash==-1)_hash=590923713
return self.__hashvalue__=_hash}
$FrozensetDict.__init__=function(){
var $=$B.args('__init__',1,{self:null},['self'],arguments,{},'args','kw')
return $N}
var singleton_id=Math.floor(Math.random()*Math.pow(2,40))
function empty_frozenset(){return{__class__:$FrozensetDict,$items:[],$id:singleton_id}}
function frozenset(){var $=$B.args('frozenset',1,{iterable:null},['iterable'],arguments,{iterable:null},null,null)
if($.iterable===null){return empty_frozenset()}
else if($.iterable.__class__==$FrozensetDict){return $.iterable}
var res=set($.iterable)
if(res.$items.length==0){return empty_frozenset()}
res.__class__=$FrozensetDict
return res}
frozenset.__class__=$B.$factory
frozenset.$dict=$FrozensetDict
$FrozensetDict.__new__=$B.$__new__(frozenset)
$FrozensetDict.$factory=frozenset
$B.set_func_names($FrozensetDict)
_.set=set
_.frozenset=frozenset})(__BRYTHON__)
;(function($B){eval($B.InjectBuiltins())
var $ObjectDict=_b_.object.$dict
var JSObject=$B.JSObject
$B.events=_b_.dict()
function $getMouseOffset(target,ev){ev=ev ||window.event;
var docPos=$getPosition(target);
var mousePos=$mouseCoords(ev);
return{x:mousePos.x - docPos.x,y:mousePos.y - docPos.y};}
function $getPosition(e){var left=0;
var top=0;
var width=e.width ||e.offsetWidth;
var height=e.height ||e.offsetHeight;
while(e.offsetParent){left +=e.offsetLeft;
top +=e.offsetTop;
e=e.offsetParent;}
left +=e.offsetLeft;
top +=e.offsetTop;
return{left:left,top:top,width:width,height:height};}
function $mouseCoords(ev){var posx=0;
var posy=0;
if(!ev)var ev=window.event;
if(ev.pageX ||ev.pageY){posx=ev.pageX;
posy=ev.pageY;}else if(ev.clientX ||ev.clientY){posx=ev.clientX + document.body.scrollLeft
+ document.documentElement.scrollLeft;
posy=ev.clientY + document.body.scrollTop
+ document.documentElement.scrollTop;}
var res={}
res.x=_b_.int(posx)
res.y=_b_.int(posy)
res.__getattr__=function(attr){return this[attr]}
res.__class__="MouseCoords"
return res}
var $DOMNodeAttrs=['nodeName','nodeValue','nodeType','parentNode','childNodes','firstChild','lastChild','previousSibling','nextSibling','attributes','ownerDocument']
$B.$isNode=function(obj){if(obj===document){return true}
for(var i=0;i<$DOMNodeAttrs.length;i++){if(obj[$DOMNodeAttrs[i]]===undefined)return false}
return true}
$B.$isNodeList=function(nodes){
try{var result=Object.prototype.toString.call(nodes);
var re=new RegExp("^\\[object (HTMLCollection|NodeList)\\]$")
return(typeof nodes==='object'
&& re.exec(result)!==null
&& nodes.hasOwnProperty('length')
&&(nodes.length==0 ||(typeof nodes[0]==="object" && nodes[0].nodeType > 0))
)}catch(err){return false}}
var $DOMEventAttrs_W3C=['NONE','CAPTURING_PHASE','AT_TARGET','BUBBLING_PHASE','type','target','currentTarget','eventPhase','bubbles','cancelable','timeStamp','stopPropagation','preventDefault','initEvent']
var $DOMEventAttrs_IE=['altKey','altLeft','button','cancelBubble','clientX','clientY','contentOverflow','ctrlKey','ctrlLeft','data','dataFld','dataTransfer','fromElement','keyCode','nextPage','offsetX','offsetY','origin','propertyName','reason','recordset','repeat','screenX','screenY','shiftKey','shiftLeft','source','srcElement','srcFilter','srcUrn','toElement','type','url','wheelDelta','x','y']
$B.$isEvent=function(obj){var flag=true
for(var i=0;i<$DOMEventAttrs_W3C.length;i++){if(obj[$DOMEventAttrs_W3C[i]]===undefined){flag=false;break}}
if(flag)return true
for(var i=0;i<$DOMEventAttrs_IE.length;i++){if(obj[$DOMEventAttrs_IE[i]]===undefined)return false}
return true}
var $NodeTypes={1:"ELEMENT",2:"ATTRIBUTE",3:"TEXT",4:"CDATA_SECTION",5:"ENTITY_REFERENCE",6:"ENTITY",7:"PROCESSING_INSTRUCTION",8:"COMMENT",9:"DOCUMENT",10:"DOCUMENT_TYPE",11:"DOCUMENT_FRAGMENT",12:"NOTATION"}
var $DOMEventDict={__class__:$B.$type,__name__:'DOMEvent'}
$DOMEventDict.__mro__=[$DOMEventDict,$ObjectDict]
$DOMEventDict.__getattribute__=function(self,attr){switch(attr){case 'x':
return $mouseCoords(self).x
case 'y':
return $mouseCoords(self).y
case 'data':
if(self.dataTransfer!==undefined)return $Clipboard(self.dataTransfer)
return self['data']
case 'target':
if(self.target===undefined)return DOMNode(self.target)
return DOMNode(self.target)
case 'char':
return String.fromCharCode(self.which)}
var res=self[attr]
if(res!==undefined){if(typeof res=='function'){var func=function(){return res.apply(self,arguments)}
func.$infos={__name__:res.toString().substr(9,res.toString().search('{'))}
return func}
return $B.$JS2Py(res)}
throw _b_.AttributeError("object DOMEvent has no attribute '"+attr+"'")}
function $DOMEvent(ev){ev.__class__=$DOMEventDict
if(ev.preventDefault===undefined){ev.preventDefault=function(){ev.returnValue=false}}
if(ev.stopPropagation===undefined){ev.stopPropagation=function(){ev.cancelBubble=true}}
ev.__repr__=function(){return '<DOMEvent object>'}
ev.toString=ev.__str__=ev.__repr__
return ev}
$B.DOMEvent=function(evt_name){
return $DOMEvent(new Event(evt_name))}
$B.DOMEvent.__class__=$B.$factory
$B.DOMEvent.$dict=$DOMEventDict
$DOMEventDict.$factory=$B.DOMEvent
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
break}}
if(!found){throw KeyError("not found")}}}
function $OpenFile(file,mode,encoding){this.reader=new FileReader()
if(mode==='r'){this.reader.readAsText(file,encoding)}
else if(mode==='rb'){this.reader.readAsBinaryString(file)}
this.file=file
this.__class__=dom.FileReader
this.__getattr__=function(attr){if(this['get_'+attr]!==undefined)return this['get_'+attr]
return this.reader[attr]}
this.__setattr__=(function(obj){return function(attr,value){if(attr.substr(0,2)=='on'){
if(window.addEventListener){var callback=function(ev){return value($DOMEvent(ev))}
obj.addEventListener(attr.substr(2),callback)}else if(window.attachEvent){var callback=function(ev){return value($DOMEvent(window.event))}
obj.attachEvent(attr,callback)}}else if('set_'+attr in obj){return obj['set_'+attr](value)}
else if(attr in obj){obj[attr]=value}
else{setattr(obj,attr,value)}}})(this.reader)}
var dom={File : function(){},FileReader : function(){}}
dom.File.__class__=$B.$type
dom.File.__str__=function(){return "<class 'File'>"}
dom.FileReader.__class__=$B.$type
dom.FileReader.__str__=function(){return "<class 'FileReader'>"}
function $Options(parent){return{
__class__:$OptionsDict,parent:parent}}
var $OptionsDict={__class__:$B.$type,__name__:'Options'}
$OptionsDict.__delitem__=function(self,arg){self.parent.options.remove(arg.elt)}
$OptionsDict.__getitem__=function(self,key){return DOMNode(self.parent.options[key])}
$OptionsDict.__len__=function(self){return self.parent.options.length}
$OptionsDict.__mro__=[$OptionsDict,$ObjectDict]
$OptionsDict.__setattr__=function(self,attr,value){self.parent.options[attr]=value}
$OptionsDict.__setitem__=function(self,attr,value){self.parent.options[attr]=$B.$JS2Py(value)}
$OptionsDict.__str__=function(self){return "<object Options wraps "+self.parent.options+">"}
$OptionsDict.append=function(self,element){self.parent.options.add(element.elt)}
$OptionsDict.insert=function(self,index,element){if(index===undefined){self.parent.options.add(element.elt)}
else{self.parent.options.add(element.elt,index)}}
$OptionsDict.item=function(self,index){return self.parent.options.item(index)}
$OptionsDict.namedItem=function(self,name){return self.parent.options.namedItem(name)}
$OptionsDict.remove=function(self,arg){self.parent.options.remove(arg.elt)}
var $StyleDict={__class__:$B.$type,__name__:'CSSProperty'}
$StyleDict.__mro__=[$StyleDict,$ObjectDict]
$StyleDict.__getattr__=function(self,attr){return $ObjectDict.__getattribute__(self.js,attr)}
$StyleDict.__setattr__=function(self,attr,value){if(attr.toLowerCase()==='float'){self.js.cssFloat=value
self.js.styleFloat=value}else{switch(attr){case 'top':
case 'left':
case 'height':
case 'width':
case 'borderWidth':
if(isinstance(value,_b_.int))value=value+'px'}
self.js[attr]=value}}
function $Style(style){
return{__class__:$StyleDict,js:style}}
$Style.__class__=$B.$factory
$Style.$dict=$StyleDict
$StyleDict.$factory=$Style
var DOMNode=$B.DOMNode=function(elt){
var res={}
res.$dict={}
res.elt=elt 
if(elt['$brython_id']===undefined||elt.nodeType===9){
elt.$brython_id='DOM-'+$B.UUID()
res.__repr__=res.__str__=res.toString=function(){var res="<DOMNode object type '"
return res+$NodeTypes[elt.nodeType]+"' name '"+elt.nodeName+"'>"}}
res.__class__=DOMNodeDict
return res}
DOMNodeDict={__class__ : $B.$type,__name__ : 'DOMNode'}
DOMNode.__class__=$B.$factory
DOMNode.$dict=DOMNodeDict 
DOMNodeDict.$factory=DOMNode
DOMNodeDict.__mro__=[DOMNodeDict,_b_.object.$dict]
DOMNodeDict.__add__=function(self,other){
var res=$TagSum()
res.children=[self],pos=1
if(isinstance(other,$TagSum)){res.children=res.children.concat(other.children)}else if(isinstance(other,[_b_.str,_b_.int,_b_.float,_b_.list,_b_.dict,_b_.set,_b_.tuple])){res.children[pos++]=DOMNode(document.createTextNode(_b_.str(other)))}else if(isinstance(other,DOMNode)){res.children[pos++]=other}else{
try{res.children=res.children.concat(_b_.list(other))}
catch(err){throw _b_.TypeError("can't add '"+
$B.get_class(other).__name__+"' object to DOMNode instance")}}
return res}
DOMNodeDict.__bool__=function(self){return true}
DOMNodeDict.__class__=$B.$type
DOMNodeDict.__contains__=function(self,key){try{DOMNodeDict.__getitem__(self,key);return True}
catch(err){return False}}
DOMNodeDict.__del__=function(self){
if(!self.elt.parentNode){throw _b_.ValueError("can't delete "+str(elt))}
self.elt.parentNode.removeChild(self.elt)}
DOMNodeDict.__delitem__=function(self,key){if(self.elt.nodeType===9){
var res=self.elt.getElementById(key)
if(res){res.parentNode.removeChild(res)}
else{throw KeyError(key)}}else{
console.log('delitem')
self.elt.parentNode.removeChild(self.elt)}}
DOMNodeDict.__eq__=function(self,other){return self.elt==other.elt}
DOMNodeDict.__getattribute__=function(self,attr){switch(attr){case 'class_name':
case 'children':
case 'html':
case 'id':
case 'parent':
case 'query':
case 'text':
case 'value':
return DOMNodeDict[attr](self)
case 'height':
case 'left':
case 'top':
case 'width':
if(self.elt instanceof SVGElement){return self.elt.getAttributeNS(null,attr)}
return DOMNodeDict[attr].__get__(self)
break
case 'clear':
case 'remove':
return function(){DOMNodeDict[attr](self,arguments[0])}
case 'headers':
if(self.elt.nodeType==9){
var req=new XMLHttpRequest();
req.open('GET',document.location,false);
req.send(null);
var headers=req.getAllResponseHeaders();
headers=headers.split('\r\n')
var res=_b_.dict()
for(var i=0;i<headers.length;i++){var header=headers[i]
if(header.strip().length==0){continue}
var pos=header.search(':')
res.__setitem__(header.substr(0,pos),header.substr(pos+1).lstrip())}
return res;}
break
case '$$location':
attr='location'
break}
if(self.elt.getAttribute!==undefined){res=self.elt.getAttribute(attr)
if(res!==undefined&&res!==null&&self.elt[attr]===undefined){
return res}}
if(self.elt.getAttributeNS!==undefined){res=self.elt.getAttributeNS(null,attr)
if(res!==undefined && res!==null && res!="" &&
self.elt[attr]===undefined){
return res}}
if(self.elt[attr]!==undefined){res=self.elt[attr]
if(typeof res==="function"){var func=(function(f,elt){return function(){var args=[],pos=0
for(var i=0;i<arguments.length;i++){var arg=arguments[i]
if(isinstance(arg,JSObject)){args[pos++]=arg.js}else if(isinstance(arg,DOMNode)){args[pos++]=arg.elt}else if(arg===_b_.None){args[pos++]=null}else{args[pos++]=arg}}
var result=f.apply(elt,args)
return $B.$JS2Py(result)}})(res,self.elt)
func.__name__=attr
return func}
if(attr=='options')return $Options(self.elt)
if(attr=='style')return $Style(self.elt[attr])
return $B.JSObject(self.elt[attr])}
return $ObjectDict.__getattribute__(self,attr)}
DOMNodeDict.__getitem__=function(self,key){if(self.elt.nodeType===9){
if(typeof key==="string"){var res=self.elt.getElementById(key)
if(res)return DOMNode(res)
throw KeyError(key)}else{try{var elts=self.elt.getElementsByTagName(key.$dict.__name__),res=[],pos=0
for(var $i=0;$i<elts.length;$i++)res[pos++]=DOMNode(elts[$i])
return res}catch(err){throw KeyError(str(key))}}}else{throw _b_.TypeError('DOMNode object is not subscriptable')}}
DOMNodeDict.__iter__=function(self){
self.$counter=-1
return self}
DOMNodeDict.__le__=function(self,other){
var elt=self.elt
if(self.elt.nodeType===9){elt=self.elt.body}
if(isinstance(other,$TagSum)){var $i=0
for($i=0;$i<other.children.length;$i++){elt.appendChild(other.children[$i].elt)}}else if(typeof other==="string" ||typeof other==="number"){var $txt=document.createTextNode(other.toString())
elt.appendChild($txt)}else if(isinstance(other,DOMNode)){
elt.appendChild(other.elt)}else{try{
var items=_b_.list(other)
for(var i=0;i<items.length;i++){DOMNodeDict.__le__(self,items[i])}}catch(err){throw _b_.TypeError("can't add '"+
$B.get_class(other).__name__+
"' object to DOMNode instance")}}}
DOMNodeDict.__len__=function(self){return self.elt.childNodes.length}
DOMNodeDict.__mul__=function(self,other){if(isinstance(other,_b_.int)&& other.valueOf()>0){var res=$TagSum()
var pos=res.children.length
for(var i=0;i<other.valueOf();i++){res.children[pos++]=DOMNodeDict.clone(self)()}
return res}
throw _b_.ValueError("can't multiply "+self.__class__+"by "+other)}
DOMNodeDict.__ne__=function(self,other){return !DOMNodeDict.__eq__(self,other)}
DOMNodeDict.__next__=function(self){self.$counter++
if(self.$counter<self.elt.childNodes.length){return DOMNode(self.elt.childNodes[self.$counter])}
throw _b_.StopIteration('StopIteration')}
DOMNodeDict.__radd__=function(self,other){
var res=$TagSum()
var txt=DOMNode(document.createTextNode(other))
res.children=[txt,self]
return res}
DOMNodeDict.__str__=DOMNodeDict.__repr__=function(self){if(self===undefined)return "<class 'DOMNode'>"
var res="<DOMNode object type '"
return res+$NodeTypes[self.elt.nodeType]+"' name '"+self.elt.nodeName+"'>"}
DOMNodeDict.__setattr__=function(self,attr,value){if(attr.substr(0,2)=='on'){
if(!_b_.bool(value)){
DOMNodeDict.unbind(self,attr.substr(2))}else{
DOMNodeDict.bind(self,attr.substr(2),value)}}else{if(DOMNodeDict['set_'+attr]!==undefined){return DOMNodeDict['set_'+attr](self,value)}
var attr1=attr.replace('_','-').toLowerCase()
if(self.elt instanceof SVGElement && 
self.elt.getAttributeNS(null,attr1)!==null){self.elt.setAttributeNS(null,attr1,value)
return}
if(self.elt[attr1]!==undefined){self.elt[attr1]=value;return}
if(typeof self.elt.getAttribute=='function' && 
typeof self.elt.setAttribute=='function'){var res=self.elt.getAttribute(attr1)
if(res!==undefined&&res!==null){self.elt.setAttribute(attr1,value)
return}}
self.elt[attr]=value}}
DOMNodeDict.__setitem__=function(self,key,value){self.elt.childNodes[key]=value}
DOMNodeDict.abs_left={__get__: function(self){return $getPosition(self.elt).left},__set__: function(){throw _b_.AttributeError("'DOMNode' objectattribute 'abs_left' is read-only")}}
DOMNodeDict.abs_top={__get__: function(self){return $getPosition(self.elt).top},__set__: function(){throw _b_.AttributeError("'DOMNode' objectattribute 'abs_top' is read-only")}}
DOMNodeDict.bind=function(self,event){
var _id
if(self.elt.nodeType===9){_id=0}
else{_id=self.elt.$brython_id}
var _d=_b_.dict.$dict
if(!_d.__contains__($B.events,_id)){_d.__setitem__($B.events,_id,dict())}
var item=_d.__getitem__($B.events,_id)
if(!_d.__contains__(item,event)){_d.__setitem__(item,event,[])}
var evlist=_d.__getitem__(item,event)
var pos=evlist.length
for(var i=2;i<arguments.length;i++){var func=arguments[i]
var callback=(function(f){return function(ev){try{return f($DOMEvent(ev))}catch(err){if(err.__class__!==undefined){var msg=_b_.getattr(err,'info')+
'\n'+err.__class__.__name__
if(err.args){msg +=': '+err.args[0]}
try{getattr($B.stderr,"write")(msg)}
catch(err){console.log(msg)}}else{try{getattr($B.stderr,"write")(err)}
catch(err1){console.log(err)}}}}}
)(func)
if(window.addEventListener){self.elt.addEventListener(event,callback,false)}else if(window.attachEvent){self.elt.attachEvent("on"+event,callback)}
evlist[pos++]=[func,callback]}
return self}
DOMNodeDict.children=function(self){var res=[],pos=0
for(var i=0;i<self.elt.childNodes.length;i++){res[pos++]=DOMNode(self.elt.childNodes[i])}
return res}
DOMNodeDict.clear=function(self){
var elt=self.elt
if(elt.nodeType==9){elt=elt.body}
for(var i=elt.childNodes.length-1;i>=0;i--){elt.removeChild(elt.childNodes[i])}}
DOMNodeDict.Class=function(self){if(self.elt.className !==undefined)return self.elt.className
return None}
DOMNodeDict.class_name=function(self){return DOMNodeDict.Class(self)}
DOMNodeDict.clone=function(self){res=DOMNode(self.elt.cloneNode(true))
res.elt.$brython_id='DOM-' + $B.UUID()
var _d=_b_.dict.$dict
if(_d.__contains__($B.events,self.elt.$brython_id)){var events=_d.__getitem__($B.events,self.elt.$brython_id)
var items=_b_.list(_d.items(events))
for(var i=0;i<items.length;i++){var event=items[i][0]
for(var j=0;j<items[i][1].length;j++){DOMNodeDict.bind(res,event,items[i][1][j][0])}}}
return res}
DOMNodeDict.events=function(self,event){var _id
if(self.elt.nodeType===9){_id=0}
else{_id=self.elt.$brython_id}
var _d=_b_.dict.$dict
if(!_d.__contains__($B.events,_id)){return[]}
var item=_d.__getitem__($B.events,_id)
if(!_d.__contains__(item,event)){return[]}
var evt_list=_d.__getitem__(item,event),callbacks=[]
for(var i=0;i<evt_list.length;i++){callbacks.push(evt_list[i][1])}
return callbacks}
DOMNodeDict.focus=function(self){return(function(obj){return function(){
setTimeout(function(){obj.focus();},10)}})(self.elt)}
DOMNodeDict.get=function(self){
var obj=self.elt
var args=[],pos=0
for(var i=1;i<arguments.length;i++){args[pos++]=arguments[i]}
var $ns=$B.args('get',0,{},[],args,{},null,'kw')
var $dict={}
var items=_b_.list(_b_.dict.$dict.items($ns['kw']))
for(var i=0;i<items.length;i++){$dict[items[i][0]]=items[i][1]}
if($dict['name']!==undefined){if(obj.getElementsByName===undefined){throw _b_.TypeError("DOMNode object doesn't support selection by name")}
var res=[],pos=0
var node_list=document.getElementsByName($dict['name'])
if(node_list.length===0)return[]
for(var i=0;i<node_list.length;i++)res[pos++]=DOMNode(node_list[i])}
if($dict['tag']!==undefined){if(obj.getElementsByTagName===undefined){throw _b_.TypeError("DOMNode object doesn't support selection by tag name")}
var res=[],pos=0
var node_list=document.getElementsByTagName($dict['tag'])
if(node_list.length===0)return[]
for(var i=0;i<node_list.length;i++)res[pos++]=DOMNode(node_list[i])}
if($dict['classname']!==undefined){if(obj.getElementsByClassName===undefined){throw _b_.TypeError("DOMNode object doesn't support selection by class name")}
var res=[],pos=0
var node_list=document.getElementsByClassName($dict['classname'])
if(node_list.length===0)return[]
for(var i=0;i<node_list.length;i++)res[pos++]=DOMNode(node_list[i])}
if($dict['id']!==undefined){if(obj.getElementById===undefined){throw _b_.TypeError("DOMNode object doesn't support selection by id")}
var id_res=obj.getElementById($dict['id'])
if(!id_res)return[]
return[DOMNode(id_res)]}
if($dict['selector']!==undefined){if(obj.querySelectorAll===undefined){throw _b_.TypeError("DOMNode object doesn't support selection by selector")}
var node_list=obj.querySelectorAll($dict['selector'])
var sel_res=[],pos=0
if(node_list.length===0)return[]
for(var i=0;i<node_list.length;i++)sel_res[pos++]=DOMNode(node_list[i])
if(res===undefined)return sel_res
var to_delete=[],pos=0
for(var i=0;i<res.length;i++){var elt=res[i],
flag=false
for(var j=0;j<sel_res.length;j++){if(elt.__eq__(sel_res[j])){flag=true;break}}
if(!flag){to_delete[pos++]=i}}
for(var i=to_delete.length-1;i>=0;i--)res.splice(to_delete[i],1)}
return res}
DOMNodeDict.getContext=function(self){
if(!('getContext' in self.elt)){throw _b_.AttributeError("object has no attribute 'getContext'")}
var obj=self.elt
return function(ctx){return JSObject(obj.getContext(ctx))}}
DOMNodeDict.getSelectionRange=function(self){
if(self.elt['getSelectionRange']!==undefined){return self.elt.getSelectionRange.apply(null,arguments)}}
DOMNodeDict.height={'__get__': function(self){
if(self.elt.tagName=='CANVAS'){return self.elt.height}
var res=parseInt(self.elt.style.height)
if(isNaN(res)){return self.elt.offsetHeight}
return res},'__set__': function(obj,self,value){if(self.elt.tagName=='CANVAS'){self.elt.height=value}
self.elt.style.height=value+'px'}}
DOMNodeDict.html=function(self){return self.elt.innerHTML}
DOMNodeDict.id=function(self){if(self.elt.id !==undefined)return self.elt.id
return None}
DOMNodeDict.inside=function(self,other){
other=other.elt
var elt=self.elt
while(true){if(other===elt){return true}
elt=elt.parentElement
if(!elt){return false}}}
DOMNodeDict.options=function(self){
return new $OptionsClass(self.elt)}
DOMNodeDict.parent=function(self){if(self.elt.parentElement)return DOMNode(self.elt.parentElement)
return None}
DOMNodeDict.left={'__get__': function(self){var res=parseInt(self.elt.style.left)
if(isNaN(res)){throw _b_.AttributeError("node has no attribute 'left'")}
return res},'__set__': function(obj,self,value){self.elt.style.left=value+'px'}}
DOMNodeDict.remove=function(self,child){
var elt=self.elt,flag=false,ch_elt=child.elt
if(self.elt.nodeType==9){elt=self.elt.body}
while(ch_elt.parentElement){if(ch_elt.parentElement===elt){elt.removeChild(ch_elt)
flag=true
break}else{ch_elt=ch_elt.parentElement}}
if(!flag){throw _b_.ValueError('element '+child+' is not inside '+self)}}
DOMNodeDict.reset=function(self){
return function(){self.elt.reset()}}
DOMNodeDict.style=function(self){
self.elt.style.float=self.elt.style.cssFloat ||self.style.styleFloat
return $B.JSObject(self.elt.style)}
DOMNodeDict.top={'__get__': function(self){var res=parseInt(self.elt.style.top)
if(isNaN(res)){throw _b_.AttributeError("node has no attribute 'top'")}
return res},'__set__': function(obj,self,value){self.elt.style.top=value+'px'}}
DOMNodeDict.setSelectionRange=function(self){
if(this['setSelectionRange']!==undefined){return(function(obj){return function(){return obj.setSelectionRange.apply(obj,arguments)}})(this)}else if(this['createTextRange']!==undefined){return(function(obj){return function(start_pos,end_pos){if(end_pos==undefined){end_pos=start_pos}
var range=obj.createTextRange();
range.collapse(true);
range.moveEnd('character',start_pos);
range.moveStart('character',end_pos);
range.select();}})(this)}}
DOMNodeDict.set_class_name=function(self,arg){self.elt.setAttribute('class',arg)}
DOMNodeDict.set_html=function(self,value){self.elt.innerHTML=str(value)}
DOMNodeDict.set_style=function(self,style){
if(!_b_.isinstance(style,_b_.dict)){throw TypeError('style must be dict, not '+$B.get_class(style).__name__)}
var items=_b_.list(_b_.dict.$dict.items(style))
for(var i=0;i<items.length;i++){var key=items[i][0],value=items[i][1]
if(key.toLowerCase()==='float'){self.elt.style.cssFloat=value
self.elt.style.styleFloat=value}else{switch(key){case 'top':
case 'left':
case 'width':
case 'borderWidth':
if(isinstance(value,_b_.int)){value=value+'px'}}
self.elt.style[key]=value}}}
DOMNodeDict.set_text=function(self,value){self.elt.innerText=str(value)
self.elt.textContent=str(value)}
DOMNodeDict.set_value=function(self,value){self.elt.value=str(value)}
DOMNodeDict.submit=function(self){
return function(){self.elt.submit()}}
DOMNodeDict.text=function(self){return self.elt.innerText ||self.elt.textContent}
DOMNodeDict.toString=function(self){if(self===undefined)return 'DOMNode'
return self.elt.nodeName}
DOMNodeDict.trigger=function(self,etype){
if(self.elt.fireEvent){self.elt.fireEvent('on' + etype);}else{
var evObj=document.createEvent('Events');
evObj.initEvent(etype,true,false);
self.elt.dispatchEvent(evObj);}}
DOMNodeDict.unbind=function(self,event){
var _id
if(self.elt.nodeType==9){_id=0}else{_id=self.elt.$brython_id}
if(!_b_.dict.$dict.__contains__($B.events,_id))return
var item=_b_.dict.$dict.__getitem__($B.events,_id)
if(event===undefined){var events=_b_.list(_b_.dict.$dict.keys(item))
for(var i=0;i<events.length;i++){DOMNodeDict.unbind(self,events[i])}
return}
if(!_b_.dict.$dict.__contains__(item,event))return
var events=_b_.dict.$dict.__getitem__(item,event)
if(arguments.length===2){for(var i=0;i<events.length;i++){var callback=events[i][1]
if(window.removeEventListener){self.elt.removeEventListener(event,callback,false)}else if(window.detachEvent){self.elt.detachEvent(event,callback,false)}}
events=[]
return}
for(var i=2;i<arguments.length;i++){var func=arguments[i],flag=false
for(var j=0;j<events.length;j++){if(getattr(func,'__eq__')(events[j][0])){var callback=events[j][1]
if(window.removeEventListener){self.elt.removeEventListener(event,callback,false)}else if(window.detachEvent){self.elt.detachEvent(event,callback,false)}
events.splice(j,1)
flag=true
break}}
if(!flag){throw KeyError('missing callback for event '+event)}}}
DOMNodeDict.value=function(self){return self.elt.value}
DOMNodeDict.width={'__get__': function(self){
if(self.elt.tagName=='CANVAS'){return self.elt.width}
var res=parseInt(self.elt.style.width)
if(isNaN(res)){
return self.elt.offsetWidth}
return res},'__set__': function(obj,self,value){if(self.elt.tagName=='CANVAS'){
self.elt.width=value}
self.elt.style.width=value+'px'}}
var $QueryDict={__class__:$B.$type,__name__:'query'}
$QueryDict.__contains__=function(self,key){return self._keys.indexOf(key)>-1}
$QueryDict.__getitem__=function(self,key){
var result=self._values[key]
if(result===undefined)throw KeyError(key)
if(result.length==1)return result[0]
return result}
var $QueryDict_iterator=$B.$iterator_class('query string iterator')
$QueryDict.__iter__=function(self){return $B.$iterator(self._keys,$QueryDict_iterator)}
$QueryDict.__mro__=[$QueryDict,$ObjectDict]
$QueryDict.getfirst=function(self,key,_default){
var result=self._values[key]
if(result===undefined){if(_default===undefined)return None
return _default}
return result[0]}
$QueryDict.getlist=function(self,key){
var result=self._values[key]
if(result===undefined)return[]
return result}
$QueryDict.getvalue=function(self,key,_default){try{return $QueryDict.__getitem__(self,key)}
catch(err){if(_default===undefined)return None
return _default}}
$QueryDict.keys=function(self){return self._keys}
DOMNodeDict.query=function(self){var res={__class__:$QueryDict,_keys :[],_values :{}}
var qs=location.search.substr(1).split('&')
for(var i=0;i<qs.length;i++){var pos=qs[i].search('=')
var elts=[qs[i].substr(0,pos),qs[i].substr(pos+1)]
var key=decodeURIComponent(elts[0])
var value=decodeURIComponent(elts[1])
if(res._keys.indexOf(key)>-1){res._values[key].push(value)}
else{res._keys.push(key)
res._values[key]=[value]}}
return res}
var $TagSumDict={__class__ : $B.$type,__name__:'TagSum'}
$TagSumDict.appendChild=function(self,child){self.children.push(child)}
$TagSumDict.__add__=function(self,other){if($B.get_class(other)===$TagSumDict){self.children=self.children.concat(other.children)}else if(isinstance(other,[_b_.str,_b_.int,_b_.float,_b_.dict,_b_.set,_b_.list])){self.children=self.children.concat(DOMNode(document.createTextNode(other)))}else{self.children.push(other)}
return self}
$TagSumDict.__mro__=[$TagSumDict,$ObjectDict]
$TagSumDict.__radd__=function(self,other){var res=$TagSum()
res.children=self.children.concat(DOMNode(document.createTextNode(other)))
return res}
$TagSumDict.__repr__=function(self){var res='<object TagSum> '
for(var i=0;i<self.children.length;i++){res+=self.children[i]
if(self.children[i].toString()=='[object Text]'){res +=' ['+self.children[i].textContent+']\n'}}
return res}
$TagSumDict.__str__=$TagSumDict.toString=$TagSumDict.__repr__
$TagSumDict.clone=function(self){var res=$TagSum(),$i=0
for($i=0;$i<self.children.length;$i++){res.children.push(self.children[$i].cloneNode(true))}
return res}
function $TagSum(){return{__class__:$TagSumDict,children:[],toString:function(){return '(TagSum)'}}}
$TagSum.__class__=$B.$factory
$TagSum.$dict=$TagSumDict
$B.$TagSum=$TagSum 
var win=JSObject(window)
win.get_postMessage=function(msg,targetOrigin){if(isinstance(msg,dict)){var temp={__class__:'dict'}
var items=_b_.list(_b_.dict.$dict.items(msg))
for(var i=0;i<items.length;i++)temp[items[i][0]]=items[i][1]
msg=temp}
return window.postMessage(msg,targetOrigin)}
$B.DOMNodeDict=DOMNodeDict
$B.win=win})(__BRYTHON__)
;(function($B){
var _b_=$B.builtins
eval($B.InjectBuiltins())
$B.make_node=function(top_node,node){
var ctx_js=node.C.to_js()
var is_cond=false,is_except=false,is_else=false
if(node.locals_def){
var iter_name=top_node.iter_id
ctx_js='var $locals_'+iter_name+' = $B.vars["'+iter_name+'"] || {}'
ctx_js +=', $local_name = "'+iter_name
ctx_js +='", $locals = $locals_'+iter_name+';'
ctx_js +='$B.vars["'+iter_name+'"] = $locals;'}
if(node.is_catch){is_except=true;is_cond=true}
if(node.is_except){is_except=true}
if(node.C.type=='node'){var ctx=node.C.tree[0]
var ctype=ctx.type
switch(ctx.type){case 'except':
is_except=true
is_cond=true
break
case 'single_kw':
is_cond=true
if(ctx.token=='else')is_else=true
if(ctx.token=='finally')is_except=true
break
case 'condition':
if(ctx.token=='elif'){is_else=true;is_cond=true}
if(ctx.token=='if')is_cond=true}}
if(ctx_js){
var new_node=new $B.genNode(ctx_js)
if(ctype=='yield'){
var yield_node_id=top_node.yields.length
while(ctx_js.charAt(ctx_js.length-1)==';'){ctx_js=ctx_js.substr(0,ctx_js.length-1)}
var res='return ['+ctx_js+', '+yield_node_id+']'
new_node.data=res
top_node.yields.push(new_node)}else if(node.is_set_yield_value){
var js='$sent'+ctx_js+'=$B.modules["'
js +=top_node.iter_id+'"].sent_value || None;'
js +='if($sent'+ctx_js+'.__class__===$B.$GeneratorSendError)'
js +='{throw $sent'+ctx_js+'.err};'
js +='$yield_value'+ctx_js+'=$sent'+ctx_js+';'
js +='$B.modules["'+top_node.iter_id+'"].sent_value=None'
new_node.data=js}else if(ctype=='break'){
new_node.is_break=true
new_node.loop_num=node.C.tree[0].loop_ctx.loop_num}
new_node.is_yield=(ctype=='yield'||ctype=='return')
new_node.is_cond=is_cond
new_node.is_except=is_except
new_node.is_if=ctype=='condition' && ctx.token=="if"
new_node.is_try=node.is_try
new_node.is_else=is_else
new_node.loop_start=node.loop_start
new_node.is_set_yield_value=node.is_set_yield_value
for(var i=0,_len_i=node.children.length;i < _len_i;i++){new_node.addChild($B.make_node(top_node,node.children[i]))}}
return new_node}
$B.genNode=function(data,parent){_indent=4
this.data=data
this.parent=parent
this.children=[]
this.has_child=false
if(parent===undefined){this.nodes={}
this.num=0}
this.addChild=function(child){if(child===undefined){console.log('child of '+this+' undefined')}
this.children[this.children.length]=child
this.has_child=true
child.parent=this
child.rank=this.children.length-1}
this.clone=function(){var res=new $B.genNode(this.data)
res.has_child=this.has_child
res.is_cond=this.is_cond
res.is_except=this.is_except
res.is_if=this.is_if
res.is_try=this.is_try
res.is_else=this.is_else
res.loop_num=this.loop_num
res.loop_start=this.loop_start
res.is_yield=this.is_yield
return res}
this.clone_tree=function(exit_node,head){
var res=new $B.genNode(this.data)
if(this.replaced && !in_loop(this)){
res.data='void(0)'}
if(this===exit_node &&(this.parent.is_cond ||!in_loop(this))){
if(!exit_node.replaced){
res=new $B.genNode('void(0)')}else{res=new $B.genNode(exit_node.data)}
exit_node.replaced=true}
if(head && this.is_break){res.data='$locals["$no_break'+this.loop_num+'"]=false;'
res.data +='var err = new Error("break");'
res.data +='err.__class__=$B.GeneratorBreak;throw err;'
res.is_break=true}
res.has_child=this.has_child
res.is_cond=this.is_cond
res.is_except=this.is_except
res.is_try=this.is_try
res.is_else=this.is_else
res.loop_num=this.loop_num
res.loop_start=this.loop_start
res.no_break=true
res.is_yield=this.is_yield
for(var i=0,_len_i=this.children.length;i < _len_i;i++){res.addChild(this.children[i].clone_tree(exit_node,head))
if(this.children[i].is_break){res.no_break=false}}
return res}
this.has_break=function(){if(this.is_break){return true}
else{for(var i=0,_len_i=this.children.length;i < _len_i;i++){if(this.children[i].has_break()){return true}}}
return false}
this.indent_src=function(indent){return ' '.repeat(indent*indent)}
this.src=function(indent){
indent=indent ||0
var res=[this.indent_src(indent)+this.data],pos=1
if(this.has_child)res[pos++]='{'
res[pos++]='\n'
for(var i=0,_len_i=this.children.length;i < _len_i;i++){res[pos++]=this.children[i].src(indent+1)
if(this.children[i].is_yield){break}}
if(this.has_child)res[pos++]='\n'+this.indent_src(indent)+'}\n'
return res.join('')}
this.toString=function(){return '<Node '+this.data+'>'}}
$B.GeneratorBreak={}
$B.$GeneratorSendError={}
var $GeneratorReturn={}
$B.generator_return=function(){return{__class__:$GeneratorReturn}}
function in_loop(node){
while(node){if(node.loop_start!==undefined)return node
node=node.parent}
return false}
function in_try(node){
var tries=[],pnode=node.parent,pos=0
while(pnode){if(pnode.is_try){tries[pos++]=pnode}
pnode=pnode.parent}
return tries}
var $BRGeneratorDict={__class__:$B.$type,__name__:'generator'}
$BRGeneratorDict.__iter__=function(self){return self}
$BRGeneratorDict.__enter__=function(self){console.log("generator.__enter__ called")}
$BRGeneratorDict.__exit__=function(self){console.log("generator.__exit__ called")}
function clear_ns(iter_id){delete $B.vars[iter_id]
delete $B.modules[iter_id]
delete $B.bound[iter_id]
delete $B.generators[iter_id]
delete $B.$generators[iter_id]}
$BRGeneratorDict.__next__=function(self){
var scope_id=self.func_root.scope.id
if(self._next===undefined){
var src=self.func_root.src()+'\n)()'
try{eval(src)}
catch(err){console.log("cant eval\n"+src+'\n'+err)
clear_ns(self.iter_id)
throw err}
self._next=$B.$generators[self.iter_id]}
if(self.gi_running){throw _b_.ValueError("ValueError: generator already executing")}
self.gi_running=true
for(var i=0;i<self.env.length;i++){eval('var $locals_'+self.env[i][0]+'=self.env[i][1]')}
try{var res=self._next.apply(null,self.args)}catch(err){var last_frame=$B.last($B.frames_stack)
self._next=function(){var $locals=$B.vars[self.iter_id]
$B.enter_frame([self.iter_id,$locals,self.env[0],{}])
throw StopIteration('after exception')}
clear_ns(self.iter_id)
throw err}finally{self.gi_running=false
$B.leave_frame(self.iter_id)}
if(res===undefined){throw StopIteration("")}
if(res[0].__class__==$GeneratorReturn){
self._next=function(){throw StopIteration("after generator return")}
clear_ns(self.iter_id)
throw StopIteration('')}
var yielded_value=res[0],yield_node_id=res[1]
if(yield_node_id==self.yield_node_id){return yielded_value}
self.yield_node_id=yield_node_id
var exit_node=self.func_root.yields[yield_node_id]
exit_node.replaced=false
var root=new $B.genNode(self.def_ctx.to_js('__BRYTHON__.generators["'+self.iter_id+'"]'))
root.addChild(self.func_root.children[0].clone())
var fnode=self.func_root.children[1].clone()
root.addChild(fnode)
func_node=self.func_root.children[1]
var js='var $locals = $B.vars["'+self.iter_id+
'"], $local_name="'+self.iter_id+'";'
fnode.addChild(new $B.genNode(js))
var env=$B.last(self.env)
fnode.addChild(new $B.genNode('$B.enter_frame(["'+self.iter_id+
'",$locals,"'+env[0]+'",$locals_'+env[0]+']);'))
while(1){
var exit_parent=exit_node.parent
var rest=[],pos=0
var has_break=false
var start=exit_node.rank+1
if(exit_node.loop_start!==undefined){
start=exit_node.rank}else if(exit_node.is_cond){
while(start<exit_parent.children.length &&
(exit_parent.children[start].is_except ||
exit_parent.children[start].is_else)){start++}}else if(exit_node.is_try ||exit_node.is_except){
while(start<exit_parent.children.length &&
(exit_parent.children[start].is_except ||
exit_parent.children[start].is_else)){start++}}
for(var i=start,_len_i=exit_parent.children.length;i < _len_i;i++){var clone=exit_parent.children[i].clone_tree(null,true)
rest[pos++]=clone
if(clone.has_break()){has_break=true}}
if(has_break){
var rest_try=new $B.genNode('try')
for(var i=0,_len_i=rest.length;i < _len_i;i++){rest_try.addChild(rest[i])}
var catch_test='catch(err)'
catch_test +='{if(err.__class__!==$B.GeneratorBreak)'
catch_test +='{throw err}}'
catch_test=new $B.genNode(catch_test)
rest=[rest_try,catch_test]}
var tries=in_try(exit_node)
if(tries.length==0){
for(var i=0;i<rest.length;i++){fnode.addChild(rest[i])}}else{
var tree=[],pos=0
for(var i=0;i<tries.length;i++){var try_node=tries[i],try_clone=try_node.clone()
if(i==0){for(var j=0;j<rest.length;j++){try_clone.addChild(rest[j])}}
var children=[try_clone],cpos=1
for(var j=try_node.rank+1;j<try_node.parent.children.length;j++){if(try_node.parent.children[j].is_except){children[cpos++]=try_node.parent.children[j].clone_tree(null,true)}else{break}}
tree[pos++]=children}
var parent=fnode
while(tree.length){children=tree.pop()
for(var i=0;i<children.length;i++){parent.addChild(children[i])}
parent=children[0]}}
exit_node=exit_parent
if(exit_node===self.func_root){break}}
self.next_root=root
var next_src=root.src()+'\n)()'
try{eval(next_src)}
catch(err){console.log('error '+err+'\n'+next_src);throw err}
self._next=$B.generators[self.iter_id]
return yielded_value}
$BRGeneratorDict.__mro__=[$BRGeneratorDict,_b_.object.$dict]
$BRGeneratorDict.$factory={__class__:$B.$factory,$dict: $BRGeneratorDict}
$BRGeneratorDict.__repr__=$BRGeneratorDict.__str__=function(self){return '<generator '+self.func_name+' '+self.iter_id+'>'}
$BRGeneratorDict.close=function(self,value){self.sent_value=_b_.GeneratorExit()
try{var res=$BRGeneratorDict.__next__(self)
if(res!==_b_.None){throw _b_.RuntimeError("closed generator returned a value")}}catch(err){if($B.is_exc(err,[_b_.StopIteration,_b_.GeneratorExit])){return _b_.None}
throw err}}
$BRGeneratorDict.send=function(self,value){self.sent_value=value
return $BRGeneratorDict.__next__(self)}
$BRGeneratorDict.$$throw=function(self,value){if(_b_.isinstance(value,_b_.type))value=value()
self.sent_value={__class__:$B.$GeneratorSendError,err:value}
return $BRGeneratorDict.__next__(self)}
$B.$BRgenerator=function(env,func_name,def_id){
var def_node=$B.modules[def_id]
var def_ctx=def_node.C.tree[0]
var counter=0 
var func=env[0][1][func_name]
$B.generators=$B.generators ||{}
$B.$generators=$B.$generators ||{}
var module=def_node.module 
var res=function(){var args=[],pos=0
for(var i=0,_len_i=arguments.length;i<_len_i;i++){args[pos++]=arguments[i]}
var iter_id=def_id+'_'+counter++
$B.bound[iter_id]={}
for(var attr in $B.bound[def_id]){$B.bound[iter_id][attr]=true}
var func_root=new $B.genNode(def_ctx.to_js('$B.$generators["'+iter_id+'"]'))
func_root.scope=env[0][1]
func_root.module=module
func_root.yields=[]
func_root.loop_ends={}
func_root.def_id=def_id
func_root.iter_id=iter_id
for(var i=0,_len_i=def_node.children.length;i < _len_i;i++){func_root.addChild($B.make_node(func_root,def_node.children[i]))}
var func_node=func_root.children[1].children[0]
var obj={__class__ : $BRGeneratorDict,args:args,def_id:def_id,def_ctx:def_ctx,def_node:def_node,env:env,func:func,func_name:func_name,func_root:func_root,module:module,func_node:func_node,next_root:func_root,gi_running:false,iter_id:iter_id,id:iter_id,num:0}
$B.modules[iter_id]=obj
obj.parent_block=def_node.parent_block
return obj}
res.__call__=function(){console.log('call generator');return res.apply(null,arguments)}
res.__repr__=function(){return "<function "+func.__name__+">"}
return res}
$B.$BRgenerator.__repr__=function(){return "<class 'generator'>"}
$B.$BRgenerator.__str__=function(){return "<class 'generator'>"}
$B.$BRgenerator.__class__=$B.$type})(__BRYTHON__)
;(function($B){var modules={}
modules['browser']={$package: true,$is_package: true,__package__:'browser',__file__:$B.brython_path.replace(/\/*$/g,'')+
'/Lib/browser/__init__.py',alert:function(message){window.alert($B.builtins.str(message))},confirm: $B.JSObject(window.confirm),console:$B.JSObject(window.console),document:$B.DOMNode(document),doc: $B.DOMNode(document),
DOMEvent:$B.DOMEvent,DOMNode:$B.DOMNode,mouseCoords: function(ev){return $B.JSObject($mouseCoords(ev))},prompt: function(message,default_value){return $B.JSObject(window.prompt(message,default_value||''))},reload: function(){
var scripts=document.getElementsByTagName('script'),js_scripts=[]
for(var i=0;i<scripts.length;i++){if(scripts[i].type===undefined ||
scripts[i].type=='text/javascript'){js_scripts.push(scripts[i])
if(scripts[i].src){var new_script=document.createElement('SCRIPT')
console.log(scripts[i].src)}}}
console.log(js_scripts)
for(var i=0;i<$B.scripts.length;i++){var name=$B.scripts[i]
console.log('script:',name)}
for(var mod in $B.imported){if($B.imported[mod].$last_modified){console.log('check',mod,$B.imported[mod].__file__,$B.imported[mod].$last_modified)}else{console.log('no date for mod',mod)}}},win: $B.win,window: $B.win,URLParameter:function(name){name=name.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
var regex=new RegExp("[\\?&]" + name + "=([^&#]*)"),results=regex.exec(location.search);
results=results===null ? "" : decodeURIComponent(results[1].replace(/\+/g," "));
return $B.builtins.str(results);}}
modules['browser'].__path__=modules['browser'].__file__
modules['browser.html']=(function($B){var _b_=$B.builtins
var $TagSumDict=$B.$TagSum.$dict
function makeTagDict(tagName){
var dict={__class__:$B.$type,__name__:tagName}
dict.__init__=function(){var $ns=$B.args('pow',1,{self:null},['self'],arguments,{},'args','kw')
var self=$ns['self']
var args=$ns['args']
if(args.length==1){var first=args[0]
if(_b_.isinstance(first,[_b_.str,_b_.int,_b_.float])){
var span=document.createElement('SPAN')
span.innerHTML=_b_.str(first)
self.elt.appendChild(span)}else if(first.__class__===$TagSumDict){for(var i=0,_len_i=first.children.length;i < _len_i;i++){self.elt.appendChild(first.children[i].elt)}}else{
if(_b_.isinstance(first,$B.DOMNode)){self.elt.appendChild(first.elt)}else{try{
var items=_b_.list(first)
for(var i=0;i<items.length;i++){$B.DOMNode.$dict.__le__(self,items[i])}}catch(err){throw _b_.ValueError('wrong element '+first)}}}}
var items=_b_.list(_b_.dict.$dict.items($ns['kw']))
for(var i=0,_len_i=items.length;i < _len_i;i++){
var arg=items[i][0]
var value=items[i][1]
if(arg.toLowerCase().substr(0,2)==="on"){
var js='$B.DOMNodeDict.bind(self,"'
js +=arg.toLowerCase().substr(2)
eval(js+'",function(){'+value+'})')}else if(arg.toLowerCase()=="style"){$B.DOMNodeDict.set_style(self,value)}else{
if(value!==false){
try{arg=arg.toLowerCase().replace('_','-')
self.elt.setAttribute(arg,value)}catch(err){throw _b_.ValueError("can't set attribute "+arg)}}}}}
dict.__mro__=[dict,$B.DOMNodeDict,$B.builtins.object.$dict]
dict.__new__=function(cls){
var res=$B.DOMNode(document.createElement(tagName))
res.__class__=cls.$dict
return res}
return dict}
function makeFactory(tagName){var factory=function(){var res=$B.DOMNode(document.createElement(tagName))
res.__class__=dicts[tagName]
var args=[res].concat(Array.prototype.slice.call(arguments))
dicts[tagName].__init__.apply(null,args)
return res}
factory.__class__=$B.$factory
factory.$dict=dicts[tagName]
return factory}
var $tags=['A','ABBR','ACRONYM','ADDRESS','APPLET','AREA','B','BASE','BASEFONT','BDO','BIG','BLOCKQUOTE','BODY','BR','BUTTON','CAPTION','CENTER','CITE','CODE','COL','COLGROUP','DD','DEL','DFN','DIR','DIV','DL','DT','EM','FIELDSET','FONT','FORM','FRAME','FRAMESET','H1','H2','H3','H4','H5','H6','HEAD','HR','HTML','I','IFRAME','IMG','INPUT','INS','ISINDEX','KBD','LABEL','LEGEND','LI','LINK','MAP','MENU','META','NOFRAMES','NOSCRIPT','OBJECT','OL','OPTGROUP','OPTION','P','PARAM','PRE','Q','S','SAMP','SCRIPT','SELECT','SMALL','SPAN','STRIKE','STRONG','STYLE','SUB','SUP','TABLE','TBODY','TD','TEXTAREA','TFOOT','TH','THEAD','TITLE','TR','TT','U','UL','VAR',
'ARTICLE','ASIDE','AUDIO','BDI','CANVAS','COMMAND','DATA','DATALIST','EMBED','FIGCAPTION','FIGURE','FOOTER','HEADER','KEYGEN','MAIN','MARK','MATH','METER','NAV','OUTPUT','PROGRESS','RB','RP','RT','RTC','RUBY','SECTION','SOURCE','TEMPLATE','TIME','TRACK','VIDEO','WBR',
'DETAILS','DIALOG','MENUITEM','PICTURE','SUMMARY']
var obj=new Object()
var dicts={}
for(var i=0,_len_i=$tags.length;i < _len_i;i++){var tag=$tags[i]
dicts[tag]=makeTagDict(tag)
obj[tag]=makeFactory(tag)
dicts[tag].$factory=obj[tag]}
$B.tag_classes=dicts
return obj})(__BRYTHON__)
modules['javascript']={__file__:$B.brython_path+'/libs/javascript.js',JSObject: $B.JSObject,JSConstructor: $B.JSConstructor,console: $B.JSObject(window.console),load:function(script_url,names){
var file_obj=$B.builtins.open(script_url)
var content=$B.builtins.getattr(file_obj,'read')()
eval(content)
if(names!==undefined){if(!Array.isArray(names)){throw $B.builtins.TypeError("argument 'names' should be a list, not '"+$B.get_class(names).__name__)}else{for(var i=0;i<names.length;i++){try{window[names[i]]=eval(names[i])}
catch(err){throw $B.builtins.NameError("name '"+names[i]+"' not found in script "+script_url)}}}}},py2js: function(src,module_name){if(is_none(module_name)){module_name='__main__'+$B.UUID()}
return $B.py2js(src,module_name,module_name,'__builtins__').to_js()},pyobj2jsobj:function(obj){return $B.pyobj2jsobj(obj)},jsobj2pyobj:function(obj){return $B.jsobj2pyobj(obj)}}
var _b_=$B.builtins
modules['_sys']={__file__:$B.brython_path+'/libs/_sys.js',
Getframe : function(depth){return $B._frame($B.frames_stack,depth)},modules :
{'__get__':function(){return _b_.dict($B.JSObject($B.imported))},'__set__':function(self,obj,value){throw _b_.TypeError("Read only property 'sys.modules'")}},path: 
{'__get__':function(){return $B.path},'__set__':function(self,obj,value){$B.path=value }},meta_path: 
{'__get__':function(){return $B.meta_path},'__set__':function(self,obj,value){$B.meta_path=value }},path_hooks: 
{'__get__':function(){return $B.path_hooks},'__set__':function(self,obj,value){$B.path_hooks=value }},path_importer_cache: 
{'__get__':function(){return _b_.dict($B.JSObject($B.path_importer_cache))},'__set__':function(self,obj,value){throw _b_.TypeError("Read only property 'sys.path_importer_cache'")}},stderr :{
__get__:function(){return $B.stderr},__set__:function(self,obj,value){$B.stderr=value},write:function(data){_b_.getattr($B.stderr,"write")(data)}},stdout :{
__get__:function(){return $B.stdout},__set__:function(self,obj,value){$B.stdout=value},write:function(data){console.log('stdout write');_b_.getattr($B.stdout,"write")(data)}},stdin : $B.stdin}
function load(name,module_obj){
module_obj.__class__=$B.$ModuleDict
module_obj.__name__=name
module_obj.__repr__=module_obj.__str__=function(){return "<module '"+name+"' (built-in)>"}
$B.imported[name]=$B.modules[name]=module_obj}
for(var attr in modules){load(attr,modules[attr])}
modules['browser'].html=modules['browser.html']})(__BRYTHON__)
;(function($B){var _b_=$B.builtins,
$sys=$B.imported['_sys'];
function import_hooks(mod_name,_path,module,blocking){
var is_none=$B.is_none
if(is_none(module)){module=undefined;}
var _meta_path=_b_.getattr($sys,'meta_path');
var spec=undefined;
for(var i=0,_len_i=_meta_path.length;i < _len_i && is_none(spec);i++){var _finder=_meta_path[i],find_spec=_b_.getattr(_finder,'find_spec',null)
if(find_spec !==null){spec=_b_.getattr(find_spec,'__call__')(mod_name,_path,undefined);
spec.blocking=blocking}}
if(is_none(spec)){
throw _b_.ImportError('No module named '+mod_name);}
var _loader=_b_.getattr(spec,'loader',_b_.None),_sys_modules=$B.imported,_spec_name=_b_.getattr(spec,'name');
if(is_none(module)){
if(!is_none(_loader)){var create_module=_b_.getattr(_loader,'create_module',_b_.None);
if(!is_none(create_module)){module=_b_.getattr(create_module,'__call__')(spec);}}
if(module===undefined){throw _b_.ImportError(mod_name)}
if(is_none(module)){
module=$B.$ModuleDict.$factory(mod_name);
var mod_desc=_b_.getattr(spec,'origin');
if(_b_.getattr(spec,'has_location')){mod_desc="from '" + mod_desc + "'";}
else{
mod_desc='(' + mod_desc + ')';}
module.toString=module.__repr__=module.__str__=
function(){return "<module '" + mod_name + "' " + mod_desc + ">"}}}
module.__name__=_spec_name;
module.__loader__=_loader;
module.__package__=_b_.getattr(spec,'parent','');
module.__spec__=spec;
var locs=_b_.getattr(spec,'submodule_search_locations');
if(module.$is_package=!is_none(locs)){module.__path__=locs;}
if(_b_.getattr(spec,'has_location')){module.__file__=_b_.getattr(spec,'origin')
$B.$py_module_path[module.__name__]=module.__file__;}
var cached=_b_.getattr(spec,'cached');
if(!is_none(cached)){module.__cached__=cached;}
if(is_none(_loader)){if(!is_none(locs)){$B.modules[_spec_name]=_sys_modules[_spec_name]=module;}
else{
throw _b_.ImportError(mod_name);}}
else{
var exec_module=_b_.getattr(_loader,'exec_module',_b_.None);
if(is_none(exec_module)){
module=_b_.getattr(_b_.getattr(_loader,'load_module'),'__call__')(_spec_name);}
else{
$B.modules[_spec_name]=_sys_modules[_spec_name]=module;
try{_b_.getattr(exec_module,'__call__')(module,blocking)}
catch(e){delete $B.modules[_spec_name];
delete _sys_modules[_spec_name];
throw e;}}}
return _sys_modules[_spec_name];}
$B.import_hooks=import_hooks})(__BRYTHON__)
;(function($B){_b_=$B.builtins
$B.execution_object={}
$B.execution_object.queue=[]
$B.execution_object.start_flag=true
$B.execution_object.$execute_next_segment=function(){if($B.execution_object.queue.length==0){return}
$B.execution_object.start_flag=false
var element=$B.execution_object.queue.shift()
var code=element[0]
var delay=10
if(element.length==2)delay=element[1]
setTimeout(function(){
console.log(code)
try{eval(code)}catch(e){console.log(e)}
$B.execution_object.start_flag=$B.execution_object.queue.length==0;},delay);}
$B.execution_object.$append=function(code,delay){$B.execution_object.queue.push([code,delay]);
if($B.execution_object.start_flag)$B.execution_object.$execute_next_segment()}
$B.execution_object.source_conversion=function(js){js=js.replace("\n","",'g')
js=js.replace("'","\\'",'g')
js=js.replace('"','\\"','g')
js=js.replace("@@","\'",'g')
js+="';$B.execution_object.$append($jscode, 10); "
js+="$B.execution_object.$execute_next_segment(); "
return "var $jscode='" + js}
_b_['brython_block']=function(f,sec){if(sec===undefined ||sec==_b_.None)sec=1
return f}
$B.builtin_funcs['brython_block']=true
$B.bound['__builtins__']['brython_block']=true
_b_['brython_async']=function(f){return f}
$B.builtin_funcs['brython_async']=true
$B.bound['__builtins__']['brython_async']=true})(__BRYTHON__)
