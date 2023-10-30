// brython.js brython.info
// version [3, 12, 0, 'final', 0]
// implementation [3, 12, 0, 'dev', 0]
// version compiled from commented, indented source files at
// github.com/brython-dev/brython
var __BRYTHON__=__BRYTHON__ ||{}
try{
eval("async function* f(){}")}catch(err){console.warn("Your browser is not fully supported. If you are using "+
"Microsoft Edge, please upgrade to the latest version")}
;(function($B){
$B.isWebWorker=('undefined' !==typeof WorkerGlobalScope)&&
("function"===typeof importScripts)&&
(navigator instanceof WorkerNavigator)
$B.isNode=(typeof process !=='undefined')&&(process.release.name==='node')
&&(process.__nwjs!==1)
var _window
if($B.isNode){_window={location:{href:'',origin:'',pathname:''},navigator:{userLanguage:''}}}else{
_window=self}
var href=_window.location.href
$B.protocol=href.split(':')[0]
$B.BigInt=_window.BigInt
$B.indexedDB=_window.indexedDB
var $path
if($B.brython_path===undefined){
var this_url;
if($B.isWebWorker){this_url=_window.location.href;
if(this_url.startsWith("blob:")){this_url=this_url.substr(5)}}else{this_url=document.currentScript.src}
var elts=this_url.split('/')
elts.pop()
$path=$B.brython_path=elts.join('/')+'/'}else{if(! $B.brython_path.endsWith("/")){$B.brython_path+="/"}
$path=$B.brython_path}
var parts_re=new RegExp('(.*?)://(.*?)/(.*)'),mo=parts_re.exec($B.brython_path)
if(mo){$B.full_url={protocol:mo[1],host:mo[2],address:mo[3]}}
var path=_window.location.origin+_window.location.pathname,path_elts=path.split("/")
path_elts.pop()
var $script_dir=$B.script_dir=path_elts.join("/")
$B.__ARGV=[]
$B.webworkers={}
$B.file_cache={}
$B.url2name={}
$B.scripts={}
$B.import_info={}
$B.imported={}
$B.precompiled={}
$B.frame_obj=null
$B.builtins=Object.create(null)
$B.builtins_scope={id:'__builtins__',module:'__builtins__',binding:{}}
$B.builtin_funcs={}
$B.builtin_classes=[]
$B.__getattr__=function(attr){return this[attr]}
$B.__setattr__=function(attr,value){
if(['debug','stdout','stderr'].indexOf(attr)>-1){$B[attr]=value}else{throw $B.builtins.AttributeError.$factory(
'__BRYTHON__ object has no attribute '+attr)}}
$B.language=_window.navigator.userLanguage ||_window.navigator.language
$B.locale="C" 
var date=new Date()
var formatter=new Intl.DateTimeFormat($B.language,{timeZoneName:'short'}),short=formatter.format(date)
formatter=new Intl.DateTimeFormat($B.language,{timeZoneName:'long'})
var long=formatter.format(date)
var ix=0,minlen=Math.min(short.length,long.length)
while(ix < minlen && short[ix]==long[ix]){ix++}
$B.tz_name=long.substr(ix).trim()
$B.PyCF_ONLY_AST=1024 
if($B.isWebWorker){$B.charset="utf-8"}else{
$B.charset=document.characterSet ||document.inputEncoding ||"utf-8"}
$B.max_int=Math.pow(2,53)-1
$B.min_int=-$B.max_int
$B.max_float=new Number(Number.MAX_VALUE)
$B.min_float=new Number(Number.MIN_VALUE)
$B.int_max_str_digits=4300
$B.str_digits_check_threshold=640
$B.max_array_size=2**32-1
$B.recursion_limit=200
$B.pep657=true
$B.special_string_repr={8:"\\x08",9:"\\t",10:"\\n",11:"\\x0b",12:"\\x0c",13:"\\r",92:"\\\\",160:"\\xa0"}
$B.$py_next_hash=Math.pow(2,53)-1
$B.$py_UUID=0
$B.lambda_magic=Math.random().toString(36).substr(2,8)
$B.set_func_names=function(klass,module){for(var attr in klass){if(typeof klass[attr]=='function'){klass[attr].$infos={__doc__:klass[attr].__doc__ ||"",__module__:module,__qualname__ :klass.__qualname__+'.'+attr,__name__:attr}
if(klass[attr].$type=="classmethod"){klass[attr].__class__=$B.method}}}
klass.__module__=module}
var has_storage=typeof(Storage)!=="undefined"
if(has_storage){$B.has_local_storage=false
try{if(localStorage){$B.local_storage=localStorage
$B.has_local_storage=true}}catch(err){}
$B.has_session_storage=false
try{if(sessionStorage){$B.session_storage=sessionStorage
$B.has_session_storage=true}}catch(err){}}else{$B.has_local_storage=false
$B.has_session_storage=false}
$B.globals=function(){
return $B.frame_obj.frame[3]}
$B.scripts={}
$B.$options={}
$B.builtins_repr_check=function(builtin,args){
var $=$B.args('__repr__',1,{self:null},['self'],args,{},null,null),self=$.self
if(! $B.$isinstance(self,builtin)){throw _b_.TypeError.$factory("descriptor '__repr__' requires a "+
`'${builtin.__name__}' object but received a `+
`'${$B.class_name(self)}'`)}}
$B.update_VFS=function(scripts){$B.VFS=$B.VFS ||{}
var vfs_timestamp=scripts.$timestamp
if(vfs_timestamp !==undefined){delete scripts.$timestamp}
for(var script in scripts){if($B.VFS.hasOwnProperty(script)){console.warn("Virtual File System: duplicate entry "+script)}
$B.VFS[script]=scripts[script]
$B.VFS[script].timestamp=vfs_timestamp}
$B.stdlib_module_names=Object.keys($B.VFS)}
$B.add_files=function(files){
$B.files=$B.files ||{}
for(var file in files){$B.files[file]=files[file]}}
$B.has_file=function(file){
return($B.files && $B.files.hasOwnProperty(file))}
$B.show_tokens=function(src,mode){
for(var token of $B.tokenizer(src,'<string>',mode ||'file')){console.log(token.type,$B.builtins.repr(token.string),token.start,token.end,token.line)}}
var py2js_magic=Math.random().toString(36).substr(2,8)
function from_py(src,script_id){if(! $B.options_parsed){
$B.parse_options()}
script_id=script_id ||'python_script_'+$B.UUID()
var filename=$B.script_path+'#'+script_id
$B.url2name[filename]=script_id
$B.imported[script_id]={}
var root=__BRYTHON__.py2js({src,filename},script_id,script_id,__BRYTHON__.builtins_scope)
return root.to_js()}
$B.getPythonModule=function(name){return $B.imported[name]}
$B.python_to_js=function(src,script_id){
return "(function() {\n"+from_py(src,script_id)+"\nreturn locals}())"}
$B.pythonToJS=$B.python_to_js
$B.runPythonSource=function(src,script_id){var js=from_py(src,script_id)+'\nreturn locals'
var func=new Function('$B','_b_',js)
$B.imported[script_id]=func($B,$B.builtins)
return $B.imported[script_id]}})(__BRYTHON__)
;
__BRYTHON__.ast_classes={Add:'',And:'',AnnAssign:'target,annotation,value?,simple',Assert:'test,msg?',Assign:'targets*,value,type_comment?',AsyncFor:'target,iter,body*,orelse*,type_comment?',AsyncFunctionDef:'name,args,body*,decorator_list*,returns?,type_comment?,type_params*',AsyncWith:'items*,body*,type_comment?',Attribute:'value,attr,ctx',AugAssign:'target,op,value',Await:'value',BinOp:'left,op,right',BitAnd:'',BitOr:'',BitXor:'',BoolOp:'op,values*',Break:'',Call:'func,args*,keywords*',ClassDef:'name,bases*,keywords*,body*,decorator_list*,type_params*',Compare:'left,ops*,comparators*',Constant:'value,kind?',Continue:'',Del:'',Delete:'targets*',Dict:'keys*,values*',DictComp:'key,value,generators*',Div:'',Eq:'',ExceptHandler:'type?,name?,body*',Expr:'value',Expression:'body',FloorDiv:'',For:'target,iter,body*,orelse*,type_comment?',FormattedValue:'value,conversion,format_spec?',FunctionDef:'name,args,body*,decorator_list*,returns?,type_comment?,type_params*',FunctionType:'argtypes*,returns',GeneratorExp:'elt,generators*',Global:'names*',Gt:'',GtE:'',If:'test,body*,orelse*',IfExp:'test,body,orelse',Import:'names*',ImportFrom:'module?,names*,level?',In:'',Interactive:'body*',Invert:'',Is:'',IsNot:'',JoinedStr:'values*',LShift:'',Lambda:'args,body',List:'elts*,ctx',ListComp:'elt,generators*',Load:'',Lt:'',LtE:'',MatMult:'',Match:'subject,cases*',MatchAs:'pattern?,name?',MatchClass:'cls,patterns*,kwd_attrs*,kwd_patterns*',MatchMapping:'keys*,patterns*,rest?',MatchOr:'patterns*',MatchSequence:'patterns*',MatchSingleton:'value',MatchStar:'name?',MatchValue:'value',Mod:'',Module:'body*,type_ignores*',Mult:'',Name:'id,ctx',NamedExpr:'target,value',Nonlocal:'names*',Not:'',NotEq:'',NotIn:'',Or:'',ParamSpec:'name',Pass:'',Pow:'',RShift:'',Raise:'exc?,cause?',Return:'value?',Set:'elts*',SetComp:'elt,generators*',Slice:'lower?,upper?,step?',Starred:'value,ctx',Store:'',Sub:'',Subscript:'value,slice,ctx',Try:'body*,handlers*,orelse*,finalbody*',TryStar:'body*,handlers*,orelse*,finalbody*',Tuple:'elts*,ctx',TypeAlias:'name,type_params*,value',TypeIgnore:'lineno,tag',TypeVar:'name,bound?',TypeVarTuple:'name',UAdd:'',USub:'',UnaryOp:'op,operand',While:'test,body*,orelse*',With:'items*,body*,type_comment?',Yield:'value?',YieldFrom:'value',alias:'name,asname?',arg:'arg,annotation?,type_comment?',arguments:'posonlyargs*,args*,vararg?,kwonlyargs*,kw_defaults*,kwarg?,defaults*',boolop:['And','Or'],cmpop:['Eq','NotEq','Lt','LtE','Gt','GtE','Is','IsNot','In','NotIn'],comprehension:'target,iter,ifs*,is_async',excepthandler:['ExceptHandler'],expr:['BoolOp','NamedExpr','BinOp','UnaryOp','Lambda','IfExp','Dict','Set','ListComp','SetComp','DictComp','GeneratorExp','Await','Yield','YieldFrom','Compare','Call','FormattedValue','JoinedStr','Constant','Attribute','Subscript','Starred','Name','List','Tuple','Slice'],expr_context:['Load','Store','Del'],keyword:'arg?,value',match_case:'pattern,guard?,body*',mod:['Module','Interactive','Expression','FunctionType'],operator:['Add','Sub','Mult','MatMult','Div','Mod','Pow','LShift','RShift','BitOr','BitXor','BitAnd','FloorDiv'],pattern:['MatchValue','MatchSingleton','MatchSequence','MatchMapping','MatchClass','MatchStar','MatchAs','MatchOr'],stmt:['FunctionDef','AsyncFunctionDef','ClassDef','Return','Delete','Assign','TypeAlias','AugAssign','AnnAssign','For','AsyncFor','While','If','With','AsyncWith','Match','Raise','Try','TryStar','Assert','Import','ImportFrom','Global','Nonlocal','Expr','Pass','Break','Continue'],type_ignore:['TypeIgnore'],type_param:['TypeVar','ParamSpec','TypeVarTuple'],unaryop:['Invert','Not','UAdd','USub'],withitem:'context_expr,optional_vars?'}
;

var $B=__BRYTHON__
$B.unicode={"No_digits":[178,179,185,[4969,9],6618,8304,[8308,6],[8320,10],[9312,9],[9332,9],[9352,9],9450,[9461,9],9471,[10102,9],[10112,9],[10122,9],[68160,4],[69216,9],[69714,9],[127232,11]],"Lo_numeric":[13317,13443,14378,15181,19968,19971,19975,19977,20061,20108,20116,20118,20159,20160,20191,20200,20237,20336,20740,20806,[20841,3,2],21313,[21315,3],21324,[21441,4],22235,22769,22777,24186,24318,24319,[24332,3],24336,25342,25420,26578,28422,29590,30334,32902,33836,36014,36019,36144,38433,38470,38476,38520,38646,63851,63859,63864,63922,63953,63955,63997,131073,131172,131298,131361,133418,133507,133516,133532,133866,133885,133913,140176,141720,146203,156269,194704]}
$B.digits_starts=[48,1632,1776,1984,2406,2534,2662,2790,2918,3046,3174,3302,3430,3558,3664,3792,3872,4160,4240,6112,6160,6470,6608,6784,6800,6992,7088,7232,7248,42528,43216,43264,43472,43504,43600,44016,65296,66720,68912,69734,69872,69942,70096,70384,70736,70864,71248,71360,71472,71904,72016,72784,73040,73120,73552,92768,92864,93008,120782,120792,120802,120812,120822,123200,123632,124144,125264,130032]
$B.unicode_casefold={223:[115,115],304:[105,775],329:[700,110],496:[106,780],912:[953,776,769],944:[965,776,769],1415:[1381,1410],7830:[104,817],7831:[116,776],7832:[119,778],7833:[121,778],7834:[97,702],7838:[223],8016:[965,787],8018:[965,787,768],8020:[965,787,769],8022:[965,787,834],8064:[7936,953],8065:[7937,953],8066:[7938,953],8067:[7939,953],8068:[7940,953],8069:[7941,953],8070:[7942,953],8071:[7943,953],8072:[8064],8073:[8065],8074:[8066],8075:[8067],8076:[8068],8077:[8069],8078:[8070],8079:[8071],8080:[7968,953],8081:[7969,953],8082:[7970,953],8083:[7971,953],8084:[7972,953],8085:[7973,953],8086:[7974,953],8087:[7975,953],8088:[8080],8089:[8081],8090:[8082],8091:[8083],8092:[8084],8093:[8085],8094:[8086],8095:[8087],8096:[8032,953],8097:[8033,953],8098:[8034,953],8099:[8035,953],8100:[8036,953],8101:[8037,953],8102:[8038,953],8103:[8039,953],8104:[8096],8105:[8097],8106:[8098],8107:[8099],8108:[8100],8109:[8101],8110:[8102],8111:[8103],8114:[8048,953],8115:[945,953],8116:[940,953],8118:[945,834],8119:[945,834,953],8124:[8115],8130:[8052,953],8131:[951,953],8132:[942,953],8134:[951,834],8135:[951,834,953],8140:[8131],8146:[953,776,768],8147:[912],8150:[953,834],8151:[953,776,834],8162:[965,776,768],8163:[944],8164:[961,787],8166:[965,834],8167:[965,776,834],8178:[8060,953],8179:[969,953],8180:[974,953],8182:[969,834],8183:[969,834,953],8188:[8179],64256:[102,102],64257:[102,105],64258:[102,108],64259:[102,102,105],64260:[102,102,108],64261:[64262],64262:[115,116],64275:[1396,1398],64276:[1396,1381],64277:[1396,1387],64278:[1406,1398],64279:[1396,1389]}
$B.unicode_bidi_whitespace=[9,10,11,12,13,28,29,30,31,32,133,5760,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8232,8233,8287,12288]
;
;(function($B){$B.stdlib={}
var pylist=['VFS_import','__future__','_codecs','_codecs_jp','_collections','_collections_abc','_compat_pickle','_compression','_contextvars','_csv','_dummy_thread','_frozen_importlib','_functools','_imp','_io','_markupbase','_multibytecodec','_operator','_py_abc','_pydatetime','_pydecimal','_queue','_signal','_socket','_sre','_struct','_sysconfigdata','_sysconfigdata_0_brython_','_testcapi','_thread','_threading_local','_typing','_weakref','_weakrefset','abc','antigravity','argparse','ast','asyncio','atexit','base64','bdb','binascii','bisect','browser.aio','browser.ajax','browser.highlight','browser.idbcache','browser.indexed_db','browser.local_storage','browser.markdown','browser.object_storage','browser.session_storage','browser.svg','browser.template','browser.timer','browser.ui','browser.webcomponent','browser.websocket','browser.worker','calendar','cmath','cmd','code','codecs','codeop','colorsys','configparser','contextlib','contextvars','copy','copyreg','csv','dataclasses','datetime','decimal','difflib','doctest','enum','errno','external_import','faulthandler','fnmatch','formatter','fractions','functools','gc','genericpath','getopt','getpass','gettext','glob','gzip','heapq','hmac','imp','inspect','interpreter','io','ipaddress','itertools','keyword','linecache','locale','mimetypes','nntplib','ntpath','numbers','opcode','operator','optparse','os','pathlib','pdb','pickle','pkgutil','platform','posixpath','pprint','profile','pwd','py_compile','pydoc','queue','quopri','random','re','re1','reprlib','secrets','select','selectors','shlex','shutil','signal','site','site-packages.__future__','site-packages.docs','site-packages.header','site-packages.test_sp','socket','sre_compile','sre_constants','sre_parse','stat','statistics','string','stringprep','struct','subprocess','symtable','sys','sysconfig','tabnanny','tarfile','tb','tempfile','test.namespace_pkgs.module_and_namespace_package.a_test','textwrap','this','threading','time','timeit','token','tokenize','traceback','turtle','types','typing','uu','uuid','warnings','weakref','webbrowser','zipfile','zipimport','zlib']
for(var i=0;i < pylist.length;i++){$B.stdlib[pylist[i]]=['py']}
var js=['_aio','_ajax','_ast','_base64','_binascii','_io_classes','_json','_jsre','_locale','_multiprocessing','_posixsubprocess','_profile','_random','_sre','_sre_utils','_string','_strptime','_svg','_symtable','_tokenize','_webcomponent','_webworker','_zlib_utils','aes','array','builtins','dis','encoding_cp932','hashlib','hmac-md5','hmac-ripemd160','hmac-sha1','hmac-sha224','hmac-sha256','hmac-sha3','hmac-sha384','hmac-sha512','html_parser','marshal','math','md5','modulefinder','pbkdf2','posix','python_re','rabbit','rabbit-legacy','rc4','ripemd160','sha1','sha224','sha256','sha3','sha384','sha512','tripledes','unicodedata']
for(var i=0;i < js.length;i++){$B.stdlib[js[i]]=['js']}
var pkglist=['browser','browser.widgets','collections','concurrent','concurrent.futures','email','email.mime','encodings','html','http','importlib','importlib.metadata','importlib.resources','json','logging','multiprocessing','multiprocessing.dummy','pydoc_data','site-packages.foobar','site-packages.simpleaio','site-packages.ui','test','test.encoded_modules','test.leakers','test.namespace_pkgs.not_a_namespace_pkg.foo','test.support','test.test_email','test.test_importlib','test.test_importlib.builtin','test.test_importlib.extension','test.test_importlib.frozen','test.test_importlib.import_','test.test_importlib.source','test.test_json','test.tracedmodules','unittest','unittest.test','unittest.test.testmock','urllib']
for(var i=0;i < pkglist.length;i++){$B.stdlib[pkglist[i]]=['py',true]}
$B.stdlib_module_names=Object.keys($B.stdlib)})(__BRYTHON__)
;
__BRYTHON__.implementation=[3,12,0,'dev',0]
__BRYTHON__.version_info=[3,12,0,'final',0]
__BRYTHON__.compiled_date="2023-10-30 14:31:12.565194"
__BRYTHON__.timestamp=1698672672565
__BRYTHON__.builtin_module_names=["_aio","_ajax","_ast","_base64","_binascii","_io_classes","_json","_jsre","_locale","_multiprocessing","_posixsubprocess","_profile","_random","_sre","_sre_utils","_string","_strptime","_svg","_symtable","_tokenize","_webcomponent","_webworker","_zlib_utils","array","builtins","dis","encoding_cp932","hashlib","html_parser","marshal","math","modulefinder","posix","python_re","python_re_new","unicodedata"]
;
;(function($B){var _b_=$B.builtins
$B.is_identifier=function(category,cp){
var table=$B.unicode_identifiers[category],start=0,end=table.length-1,len=table.length,ix=Math.floor(len/2),nb=0
var first=table[start],item=typeof first=='number' ? first :first[0]
if(cp < item){return false}
var last=table[end]
if(typeof last=='number'){if(cp > last){return false}}else if(last[0]+last[1]< cp){return false}
while(true){nb++
if(nb > 100){console.log('infinite loop for',cp)
alert()}
var item=table[ix]
if(typeof item !='number'){item=item[0]}
if(item==cp){return true}else if(item > cp){end=ix}else{start=ix}
len=Math.floor((end-start)/2)
if(end-start==1){break}
ix=start+len}
return table[start][0]+table[start][1]> cp}
const XID_Start_re=/\p{XID_Start}/u
const Other_ID_Start=[0x1885,0x1886,0x2118,0x212E,0x309B,0x309C].map(
x=> String.fromCodePoint(x))
function is_ID_Start(char){return/\p{Letter}/u.test(char)||
/\p{Nl}/u.test(char)||
char=='_' ||
Other_ID_Start.indexOf(char)>-1}
const Other_ID_Continue=[0x00B7,0x0387,0x1369,0x1370,0x1371,0x19DA,0x200C,0x200D,0x30FB,0xFF65].
map(x=> String.fromCodePoint(x))
function is_ID_Continue(char){return is_ID_Start(char)||
/\p{Mn}|\p{Mc}|\p{Nd}|\p{Pc}/u.test(char)||
Other_ID_Continue.indexOf(char)>-1}
$B.is_XID_Start=function(cp){var char=String.fromCodePoint(cp)
if(! is_ID_Start(char)){return false}
var norm=char.normalize('NFKC')
if(! is_ID_Start(norm[0])){return false}
for(var char of norm.substr(1)){if(! is_ID_Continue(char)){return false}}
return true}
$B.is_XID_Continue=function(cp){var char=String.fromCodePoint(cp)
if(! is_ID_Continue(char)){return false}
var norm=char.normalize('NFKC')
for(var char of norm.substr(1)){if(! is_ID_Continue(char)){return false}}
return true}
$B.in_unicode_category=function(category,cp){if(isNaN(cp)){return false}
try{var re=new RegExp('\\p{'+category+'}','u')
return re.test(String.fromCodePoint(cp))}catch(err){
return in_unicode_category(category,cp)}}
function in_unicode_category(category,cp){
var table=$B.unicode[category],start=0,end=table.length-1,len=table.length,ix=Math.floor(len/2),nb=0
var first=table[start],item=typeof first=='number' ? first :first[0]
if(cp < item){return false}
var last=table[end]
if(typeof last=='number'){if(cp > last){return false}}else if(last[0]+last[1]< cp){return false}
while(true){nb++
if(nb > 100){console.log('infinite loop for',cp)
alert()}
var item=table[ix]
if(typeof item !='number'){item=item[0]}
if(item==cp){return true}else if(item > cp){end=ix}else{start=ix}
len=Math.floor((end-start)/2)
if(end-start==1){break}
ix=start+len}
var step=table[start][2]
if(step===undefined){return table[start][0]+table[start][1]> cp}
return(table[start][0]+step*table[start][1]> cp)&&
((cp-table[start][0])% step)==0}
const FSTRING_START='FSTRING_START',FSTRING_MIDDLE='FSTRING_MIDDLE',FSTRING_END='FSTRING_END'
function ord(char){if(char.length==1){return char.charCodeAt(0)}
var code=0x10000
code+=(char.charCodeAt(0)& 0x03FF)<< 10
code+=(char.charCodeAt(1)& 0x03FF)
return code}
function $last(array){return array[array.length-1]}
var ops='.,:;+-*/%~^|&=<>[](){}@',
op2=['**','//','>>','<<'],augm_op='+-*/%^|&=<>@',closing={'}':'{',']':'[',')':'('}
function Token(type,string,start,end,line){start=start.slice(0,2)
var res={type,string,start,end,line}
res[0]=type
res[1]=string
res[2]=start
res[3]=end
res[4]=line
return res}
var errors={}
function TokenError(message,position){if(errors.TokenError===undefined){var $error_2={$name:"TokenError",$qualname:"TokenError",$is_class:true,__module__:"tokenize"}
var error=errors.TokenError=$B.$class_constructor("TokenError",$error_2,_b_.tuple.$factory([_b_.Exception]),["_b_.Exception"],[])
error.__doc__=_b_.None
error.$factory=function(message,position){return{
__class__:error,msg:message,lineno:position[0],colno:position[1]}}
error.__str__=function(self){var s=self.msg
if(self.lineno > 1){s+=` (${self.lineno}, ${self.colno})`}
return s}
$B.set_func_names(error,"tokenize")}
var exc=errors.TokenError.$factory(message,position)
console.log('error',exc.__class__,exc.args)
return exc}
function _get_line_at(src,pos){
var end=src.substr(pos).search(/[\r\n]/),line=end==-1 ? src.substr(pos):src.substr(pos,end+1)
return line}
function get_comment(src,pos,line_num,line_start,token_name,line){var start=pos,ix
var t=[]
while(true){if(pos >=src.length ||(ix='\r\n'.indexOf(src[pos]))>-1){t.push(Token('COMMENT',src.substring(start-1,pos),[line_num,start-line_start],[line_num,pos-line_start+1],line))
if(ix !==undefined){var nb=1
if(src[pos]=='\r' && src[pos+1]=='\n'){nb++}else if(src[pos]===undefined){
nb=0}
t.push(Token(token_name,src.substr(pos,nb),[line_num,pos-line_start+1],[line_num,pos-line_start+nb+1],line))
if(src[pos]===undefined){t.push(Token('NEWLINE','\n',[line_num,pos-line_start+1],[line_num,pos-line_start+2],''))}
pos+=nb}
return{t,pos}}
pos++}}
function test_num(num_type,char){switch(num_type){case '':
return $B.in_unicode_category('Nd',ord(char))
case 'x':
return '0123456789abcdef'.indexOf(char.toLowerCase())>-1
case 'b':
return '01'.indexOf(char)>-1
case 'o':
return '01234567'.indexOf(char)>-1
default:
throw Error('unknown num type '+num_type)}}
$B.TokenReader=function(src,filename){this.tokens=[]
this.tokenizer=$B.tokenizer(src,filename)
this.position=0}
$B.TokenReader.prototype.read=function(){if(this.position < this.tokens.length){var res=this.tokens[this.position]}else{var res=this.tokenizer.next()
if(res.done){this.done=true
return}
res=res.value
this.tokens.push(res)}
this.position++
return res}
$B.TokenReader.prototype.seek=function(position){this.position=position}
function nesting_level(token_modes){var ix=token_modes.length-1
while(ix >=0){var mode=token_modes[ix]
if(mode.nesting !==undefined){return mode.nesting}
ix--}}
function update_braces(braces,char){if('[({'.indexOf(char)>-1){braces.push(char)}else if('])}'.indexOf(char)>-1){if(braces.length && $last(braces)==closing[char]){braces.pop()}else{braces.push(char)}}}
$B.tokenizer=function*(src,filename,mode){var whitespace=' \t\n',operators='*+-/%&^~=<>',allowed_after_identifier=',.()[]:;',string_prefix=/^(r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)$/,bytes_prefix=/^(b|B|br|Br|bR|BR|rb|rB|Rb|RB)$/
src=src.replace(/\r\n/g,'\n').
replace(/\r/g,'\n')
if(mode !='eval' && ! src.endsWith('\n')){src+='\n'}
var lines=src.split('\n'),linenum=0,line_at={}
for(var i=0,len=src.length;i < len;i++){line_at[i]=linenum
if(src[i]=='\n'){linenum++}}
function get_line_at(pos){return lines[line_at[pos]]+'\n'}
var state="line_start",char,cp,mo,pos=0,start,quote,triple_quote,escaped=false,string_start,string,prefix,name,operator,number,num_type,comment,indent,indents=[],braces=[],line_num=0,line_start=1,token_modes=['regular'],token_mode='regular',save_mode=token_mode,fstring_buffer,fstring_start,fstring_escape,format_specifier,nesting
yield Token('ENCODING','utf-8',[0,0],[0,0],'')
while(pos < src.length){char=src[pos]
cp=src.charCodeAt(pos)
if(cp >=0xD800 && cp <=0xDBFF){
cp=ord(src.substr(pos,2))
char=src.substr(pos,2)
pos++}
pos++
if(token_mode !=save_mode){if(token_mode=='fstring'){fstring_buffer=''
fstring_escape=false}else if(token_mode=='format_specifier'){format_specifier=''}}
save_mode=token_mode
if(token_mode=='fstring'){if(char==token_mode.quote){if(fstring_escape){fstring_buffer+='\\'+char
fstring_escape=false
continue}
if(token_mode.triple_quote){if(src.substr(pos,2)!=token_mode.quote.repeat(2)){fstring_buffer+=char
continue}
char=token_mode.quote.repeat(3)
pos+=2}
if(fstring_buffer.length > 0){
yield Token(FSTRING_MIDDLE,fstring_buffer,[line_num,fstring_start],[line_num,fstring_start+fstring_buffer.length],line)}
yield Token(FSTRING_END,char,[line_num,fstring_start+fstring_buffer.length],[line_num,fstring_start+fstring_buffer.length+token_mode.quote.length],line)
token_modes.pop()
token_mode=$B.last(token_modes)
state=null
continue}else if(char=='{'){if(src.charAt(pos)=='{'){
fstring_buffer+=char
pos++
continue}else{
yield Token(FSTRING_MIDDLE,fstring_buffer,[line_num,fstring_start],[line_num,fstring_start+fstring_buffer.length],line)
token_mode='regular_within_fstring'
state=null
token_modes.push(token_mode)}}else if(char=='}'){if(src.charAt(pos)=='}'){
fstring_buffer+=char
pos++
continue}else{
yield Token('OP',char,[line_num,pos-line_start],[line_num,pos-line_start+1],line)
console.log('emit closing bracket')
alert()
continue}}else if(char=='\\'){if(token_mode.raw){fstring_buffer+=char+char}else{if(fstring_escape){fstring_buffer+=char}
fstring_escape=! fstring_escape}
continue}else{if(fstring_escape){fstring_buffer+='\\'}
fstring_buffer+=char
fstring_escape=false
continue}}else if(token_mode=='format_specifier'){if(char==quote){if(format_specifier.length > 0){
yield Token(FSTRING_MIDDLE,format_specifier,[line_num,fstring_start],[line_num,fstring_start+format_specifier.length],line)
token_modes.pop()
token_mode=$B.last(token_modes)
continue}}else if(char=='{'){
yield Token(FSTRING_MIDDLE,format_specifier,[line_num,fstring_start],[line_num,fstring_start+format_specifier.length],line)
token_mode='regular_within_fstring'
state=null
token_modes.push(token_mode)}else if(char=='}'){
yield Token(FSTRING_MIDDLE,format_specifier,[line_num,fstring_start],[line_num,fstring_start+format_specifier.length],line)
yield Token('OP',char,[line_num,pos-line_start],[line_num,pos-line_start+1],line)
if(braces.length==0 ||$B.last(braces)!=='{'){throw Error('wrong braces')}
braces.pop()
token_modes.pop()
token_mode=$B.last(token_modes)
continue}else{format_specifier+=char
continue}}
switch(state){case "line_start":
line=get_line_at(pos-1)
line_start=pos
line_num++
if(mo=/^\f?(\r\n|\r|\n)/.exec(src.substr(pos-1))){
yield Token('NL',mo[0],[line_num,0],[line_num,mo[0].length],line)
pos+=mo[0].length-1
continue}else if(char=='#'){comment=get_comment(src,pos,line_num,line_start,'NL',line)
for(var item of comment.t){yield item}
pos=comment.pos
state='line_start'
continue}
indent=0
if(char==' '){indent=1}else if(char=='\t'){indent=8}
if(indent){while(pos < src.length){if(src[pos]==' '){indent++}else if(src[pos]=='\t'){indent+=8}else{break}
pos++}
if(pos==src.length){
line_num--
break}
if(src[pos]=='#'){
var comment=get_comment(src,pos+1,line_num,line_start,'NL',line)
for(var item of comment.t){yield item}
pos=comment.pos
continue}else if(mo=/^\f?(\r\n|\r|\n)/.exec(src.substr(pos))){
yield Token('NL','',[line_num,pos-line_start+1],[line_num,pos-line_start+1+mo[0].length],line)
pos+=mo[0].length
continue}
if(indents.length==0 ||indent > $last(indents)){indents.push(indent)
yield Token('INDENT','',[line_num,0],[line_num,indent],line)}else if(indent < $last(indents)){var ix=indents.indexOf(indent)
if(ix==-1){var error=Error('unindent does not match '+
'any outer indentation level')
error.type='IndentationError'
error.line_num=line_num
throw error }
for(var i=indents.length-1;i > ix;i--){indents.pop()
yield Token('DEDENT','',[line_num,indent],[line_num,indent],line)}}
state=null}else{
while(indents.length > 0){indents.pop()
yield Token('DEDENT','',[line_num,indent],[line_num,indent],line)}
state=null
pos--}
break
case null:
switch(char){case '"':
case "'":
quote=char
triple_quote=src[pos]==char && src[pos+1]==char
string_start=[line_num,pos-line_start,line_start]
if(triple_quote){pos+=2}
escaped=false
state='STRING'
string=""
prefix=""
break
case '#':
var token_name=braces.length > 0 ? 'NL' :'NEWLINE'
comment=get_comment(src,pos,line_num,line_start,token_name,line)
for(var item of comment.t){yield item}
pos=comment.pos
if(braces.length==0){state='line_start'}else{state=null
line_num++
line_start=pos+1
line=get_line_at(pos)}
break
case '0':
state='NUMBER'
number=char
num_type=''
if(src[pos]&&
'xbo'.indexOf(src[pos].toLowerCase())>-1){number+=src[pos]
num_type=src[pos].toLowerCase()
pos++}
break
case '.':
if(src[pos]&& $B.in_unicode_category('Nd',ord(src[pos]))){state='NUMBER'
num_type=''
number=char}else{var op=char
while(src[pos]==char){pos++
op+=char}
var dot_pos=pos-line_start-op.length+1
while(op.length >=3){
yield Token('OP','...',[line_num,dot_pos],[line_num,dot_pos+3],line)
op=op.substr(3)}
for(var i=0;i < op.length;i++){yield Token('OP','.',[line_num,dot_pos],[line_num,dot_pos+1],line)
dot_pos++}}
break
case '\\':
if(mo=/^\f?(\r\n|\r|\n)/.exec(src.substr(pos))){if(pos==src.length-1){yield Token('ERRORTOKEN',char,[line_num,pos-line_start],[line_num,pos-line_start+1],line)
var token_name=braces.length > 0 ? 'NL':'NEWLINE'
yield Token(token_name,mo[0],[line_num,pos-line_start],[line_num,pos-line_start+mo[0].length],line)}
line_num++
pos+=mo[0].length
line_start=pos+1
line=get_line_at(pos)}else{yield Token('ERRORTOKEN',char,[line_num,pos-line_start],[line_num,pos-line_start+1],line)}
break
case '\n':
case '\r':
var token_name=braces.length > 0 ? 'NL':'NEWLINE'
mo=/^\f?(\r\n|\r|\n)/.exec(src.substr(pos-1))
yield Token(token_name,mo[0],[line_num,pos-line_start],[line_num,pos-line_start+mo[0].length],line)
pos+=mo[0].length-1
if(token_name=='NEWLINE'){state='line_start'}else{line_num++
line_start=pos+1
line=get_line_at(pos)}
break
default:
if($B.is_XID_Start(ord(char))){
state='NAME'
name=char}else if($B.in_unicode_category('Nd',ord(char))){state='NUMBER'
num_type=''
number=char}else if(ops.indexOf(char)>-1){if(token_mode=='regular_within_fstring' &&
(char==':' ||char=='}')){if(char==':'){
if(nesting_level(token_modes)==braces.length-1){yield Token('OP',char,[line_num,pos-line_start-op.length+1],[line_num,pos-line_start+1],line)
token_modes.pop()
token_mode='format_specifier'
token_modes.push(token_mode)
continue}}else{yield Token('OP',char,[line_num,pos-line_start-op.length+1],[line_num,pos-line_start+1],line)
token_modes.pop()
token_mode=token_modes[token_modes.length-1]
if(braces.length==0 ||$B.last(braces)!=='{'){throw Error('wrong braces')}
braces.pop()
continue}}
var op=char
if(op2.indexOf(char+src[pos])>-1){op=char+src[pos]
pos++}
if(src[pos]=='=' &&(op.length==2 ||
augm_op.indexOf(op)>-1)){op+=src[pos]
pos++}else if((char=='-' && src[pos]=='>')||
(char==':' && src[pos]=='=')){op+=src[pos]
pos++}
if('[({'.indexOf(char)>-1){braces.push(char)}else if('])}'.indexOf(char)>-1){if(braces && $last(braces)==closing[char]){braces.pop()}else{braces.push(char)}}
yield Token('OP',op,[line_num,pos-line_start-op.length+1],[line_num,pos-line_start+1],line)}else if(char=='!'){if(src[pos]=='='){yield Token('OP','!=',[line_num,pos-line_start],[line_num,pos-line_start+2],line)
pos++}else{yield Token('OP',char,[line_num,pos-line_start],[line_num,pos-line_start+1],line)}}else if(char==' ' ||char=='\t'){}else{
yield Token('ERRORTOKEN',char,[line_num,pos-line_start],[line_num,pos-line_start+1],line)}}
break
case 'NAME':
if($B.is_XID_Continue(ord(char))){name+=char}else if(char=='"' ||char=="'"){if(string_prefix.exec(name)||bytes_prefix.exec(name)){
state='STRING'
quote=char
triple_quote=src[pos]==quote && src[pos+1]==quote
prefix=name
if(triple_quote){pos+=2}
if(prefix.toLowerCase().indexOf('f')>-1){fstring_start=pos-line_start-name.length
token_mode=new String('fstring')
token_mode.nesting=braces.length
token_mode.quote=quote
token_mode.triple_quote=triple_quote
token_mode.raw=prefix.toLowerCase().indexOf('r')>-1
token_modes.push(token_mode)
var s=triple_quote ? quote.repeat(3):quote
yield Token(FSTRING_START,prefix+s,[line_num,fstring_start],[line_num,pos-line_start],line)
continue}
escaped=false
string_start=[line_num,pos-line_start-name.length,line_start]
string=''}else{yield Token('NAME',name,[line_num,pos-line_start-name.length],[line_num,pos-line_start],line)
state=null
pos--}}else{yield Token('NAME',name,[line_num,pos-line_start-name.length],[line_num,pos-line_start],line)
state=null
pos--}
break
case 'STRING':
switch(char){case quote:
if(! escaped){
var string_line=line
if(line_num > string_start[0]){string_line=src.substring(
string_start[2]-1,pos+2)}
if(! triple_quote){var full_string=prefix+quote+string+
quote
yield Token('STRING',full_string,string_start,[line_num,pos-line_start+1],string_line)
state=null}else if(char+src.substr(pos,2)==
quote.repeat(3)){var full_string=prefix+quote.repeat(3)+
string+quote.repeat(3)
triple_quote_line=line
yield Token('STRING',full_string,string_start,[line_num,pos-line_start+3],string_line)
pos+=2
state=null}else{string+=char}}else{string+=char}
escaped=false
break
case '\r':
case '\n':
if(! escaped && ! triple_quote){
var quote_pos=string_start[1]+line_start-1,pos=quote_pos
while(src[pos-1]==' '){pos--}
while(pos < quote_pos){yield Token('ERRORTOKEN',' ',[line_num,pos-line_start+1],[line_num,pos-line_start+2],line)
pos++}
pos++
yield Token('ERRORTOKEN',quote,[line_num,pos-line_start],[line_num,pos-line_start+1],line)
state=null
pos++
break}
string+=char
line_num++
line_start=pos+1
if(char=='\r' && src[pos]=='\n'){string+=src[pos]
line_start++
pos++}
line=get_line_at(pos)
escaped=false
break
case '\\':
string+=char
escaped=! escaped
break
default:
escaped=false
string+=char
break}
break
case 'NUMBER':
if(test_num(num_type,char)){number+=char}else if(char=='_' && ! number.endsWith('.')){if(number.endsWith('_')){throw SyntaxError('consecutive _ in number')}else if(src[pos]===undefined ||
! test_num(num_type,src[pos])){
yield Token('NUMBER',number,[line_num,pos-line_start-number.length],[line_num,pos-line_start],line)
state=null
pos--}else{number+=char}}else if(char=='.' && number.indexOf(char)==-1){number+=char}else if(char.toLowerCase()=='e' &&
number.toLowerCase().indexOf('e')==-1){if('+-'.indexOf(src[pos])>-1 ||
$B.in_unicode_category('Nd',ord(src[pos]))){number+=char}else{yield Token('NUMBER',number,[line_num,pos-line_start-number.length],[line_num,pos-line_start],line)
state=null
pos--}}else if((char=='+' ||char=='-')&&
number.toLowerCase().endsWith('e')){number+=char}else if(char.toLowerCase()=='j'){
number+=char
yield Token('NUMBER',number,[line_num,pos-line_start-number.length+1],[line_num,pos-line_start+1],line)
state=null}else{yield Token('NUMBER',number,[line_num,pos-line_start-number.length],[line_num,pos-line_start],line)
state=null
pos--}
break}}
if(braces.length > 0){throw SyntaxError('EOF in multi-line statement')}
switch(state){case 'line_start':
line_num++
break
case 'NAME':
yield Token('NAME',name,[line_num,pos-line_start-name.length+1],[line_num,pos-line_start+1],line)
break
case 'NUMBER':
yield Token('NUMBER',number,[line_num,pos-line_start-number.length+1],[line_num,pos-line_start+1],line)
break
case 'STRING':
var msg=`unterminated ${triple_quote ? 'triple-quoted ' : ''}`+
`string literal (detected at line ${line_num})`
throw SyntaxError(msg)}
if(! src.endsWith('\n')&& state !=line_start){yield Token('NEWLINE','',[line_num,pos-line_start+1],[line_num,pos-line_start+1],line+'\n')
line_num++}
while(indents.length > 0){indents.pop()
yield Token('DEDENT','',[line_num,0],[line_num,0],'')}
yield Token('ENDMARKER','',[line_num,0],[line_num,0],'')}})(__BRYTHON__)
;

(function($B){
var binary_ops={'+':'Add','-':'Sub','*':'Mult','/':'Div','//':'FloorDiv','%':'Mod','**':'Pow','<<':'LShift','>>':'RShift','|':'BitOr','^':'BitXor','&':'BitAnd','@':'MatMult'}
var boolean_ops={'and':'And','or':'Or'}
var comparison_ops={'==':'Eq','!=':'NotEq','<':'Lt','<=':'LtE','>':'Gt','>=':'GtE','is':'Is','is_not':'IsNot','in':'In','not_in':'NotIn'}
var unary_ops={unary_inv:'Invert',unary_pos:'UAdd',unary_neg:'USub',unary_not:'Not'}
var op_types=$B.op_types=[binary_ops,boolean_ops,comparison_ops,unary_ops]
var _b_=$B.builtins
var ast=$B.ast={}
for(var kl in $B.ast_classes){var args=$B.ast_classes[kl],body=''
if(typeof args=="string"){if(args.length > 0){for(var arg of args.split(',')){if(arg.endsWith('*')){arg=arg.substr(0,arg.length-1)
body+=` this.${arg} = ${arg} === undefined ? [] : ${arg}\n`}else if(arg.endsWith('?')){arg=arg.substr(0,arg.length-1)
body+=` this.${arg} = ${arg}\n`}else{body+=` this.${arg} = ${arg}\n`}}}
var arg_list=args.replace(/[*?]/g,'').split(',')
ast[kl]=Function(...arg_list,body)
ast[kl]._fields=args.split(',')}else{ast[kl]=args.map(x=> ast[x])}
ast[kl].$name=kl}
$B.ast_js_to_py=function(obj){$B.create_python_ast_classes()
if(obj===undefined){return _b_.None}else if(Array.isArray(obj)){return obj.map($B.ast_js_to_py)}else{var class_name=obj.constructor.$name,py_class=$B.python_ast_classes[class_name],py_ast_obj={__class__:py_class}
if(py_class===undefined){return obj}
for(var field of py_class._fields){py_ast_obj[field]=$B.ast_js_to_py(obj[field])}
py_ast_obj._attributes=$B.fast_tuple([])
for(var loc of['lineno','col_offset','end_lineno','end_col_offset']){if(obj[loc]!==undefined){py_ast_obj[loc]=obj[loc]
py_ast_obj._attributes.push(loc)}}
return py_ast_obj}}
$B.ast_py_to_js=function(obj){if(obj===undefined ||obj===_b_.None){return undefined}else if(Array.isArray(obj)){return obj.map($B.ast_py_to_js)}else if(typeof obj=="string"){return obj}else{var class_name=$B.class_name(obj),js_class=$B.ast[class_name]
if(js_class===undefined){return obj}
var js_ast_obj=new js_class()
for(var field of js_class._fields){if(field.endsWith('?')||field.endsWith('*')){field=field.substr(0,field.length-1)}
js_ast_obj[field]=$B.ast_py_to_js(obj[field])}
for(var loc of['lineno','col_offset','end_lineno','end_col_offset']){if(obj[loc]!==undefined){js_ast_obj[loc]=obj[loc]}}
return js_ast_obj}}
$B.create_python_ast_classes=function(){if($B.python_ast_classes){return}
$B.python_ast_classes={}
for(var klass in $B.ast_classes){$B.python_ast_classes[klass]=(function(kl){var _fields,raw_fields
if(typeof $B.ast_classes[kl]=="string"){if($B.ast_classes[kl]==''){raw_fields=_fields=[]}else{raw_fields=$B.ast_classes[kl].split(',')
_fields=raw_fields.map(x=>
(x.endsWith('*')||x.endsWith('?'))?
x.substr(0,x.length-1):x)}}
var cls=$B.make_class(kl),$defaults={},slots={},nb_args=0
if(raw_fields){for(var i=0,len=_fields.length;i < len;i++){var f=_fields[i],rf=raw_fields[i]
nb_args++
slots[f]=null
if(rf.endsWith('*')){$defaults[f]=[]}else if(rf.endsWith('?')){$defaults[f]=_b_.None}}}
cls.$factory=function(){var $=$B.args(klass,nb_args,$B.clone(slots),Object.keys(slots),arguments,$B.clone($defaults),null,'kw')
var res={__class__:cls,_attributes:$B.fast_tuple([])}
for(var key in $){if(key=='kw'){for(var key in $.kw.$jsobj){res[key]=$.kw.$jsobj[key]}}else{res[key]=$[key]}}
if(klass=="Constant"){res.value=$B.AST.$convert($.value)}
return res}
if(_fields){cls._fields=_fields}
cls.__mro__=[$B.AST,_b_.object]
cls.__module__='ast'
cls.__dict__=$B.empty_dict()
if(raw_fields){for(var i=0,len=raw_fields.length;i < len;i++){var raw_field=raw_fields[i]
if(raw_field.endsWith('?')){_b_.dict.$setitem(cls.__dict__,_fields[i],_b_.None)}}}
return cls})(klass)}}
var op2ast_class=$B.op2ast_class={},ast_types=[ast.BinOp,ast.BoolOp,ast.Compare,ast.UnaryOp]
for(var i=0;i < 4;i++){for(var op in op_types[i]){op2ast_class[op]=[ast_types[i],ast[op_types[i][op]]]}}})(__BRYTHON__)
;

;(function($B){$B.produce_ast=false
Number.isInteger=Number.isInteger ||function(value){return typeof value==='number' &&
isFinite(value)&&
Math.floor(value)===value};
Number.isSafeInteger=Number.isSafeInteger ||function(value){return Number.isInteger(value)&& Math.abs(value)<=Number.MAX_SAFE_INTEGER;};
var js,res,$op
var _b_=$B.builtins
var _window
if($B.isNode){_window={location:{href:'',origin:'',pathname:''}}}else{
_window=self}
$B.parser={}
var clone=$B.clone=function(obj){var res={}
for(var attr in obj){res[attr]=obj[attr]}
return res}
$B.last=function(table){if(table===undefined){console.log($B.make_frames_stack())}
return table[table.length-1]}
$B.list2obj=function(list,value){var res={},i=list.length
if(value===undefined){value=true}
while(i--> 0){res[list[i]]=value}
return res}
$B.op2method={operations:{"**":"pow","//":"floordiv","<<":"lshift",">>":"rshift","+":"add","-":"sub","*":"mul","/":"truediv","%":"mod","@":"matmul" },augmented_assigns:{"//=":"ifloordiv",">>=":"irshift","<<=":"ilshift","**=":"ipow","+=":"iadd","-=":"isub","*=":"imul","/=":"itruediv","%=":"imod","&=":"iand","|=":"ior","^=":"ixor","@=":"imatmul"},binary:{"&":"and","|":"or","~":"invert","^":"xor"},comparisons:{"<":"lt",">":"gt","<=":"le",">=":"ge","==":"eq","!=":"ne"},boolean:{"or":"or","and":"and","in":"in","not":"not","is":"is"},subset:function(){var res={},keys=[]
if(arguments[0]=="all"){keys=Object.keys($B.op2method)
keys.splice(keys.indexOf("subset"),1)}else{for(var arg of arguments){keys.push(arg)}}
for(var key of keys){var ops=$B.op2method[key]
if(ops===undefined){throw Error(key)}
for(var attr in ops){res[attr]=ops[attr]}}
return res}}
var $operators=$B.op2method.subset("all")
$B.method_to_op={}
for(var category in $B.op2method){for(var op in $B.op2method[category]){var method=`__${$B.op2method[category][op]}__`
$B.method_to_op[method]=op}}
var $augmented_assigns=$B.augmented_assigns=$B.op2method.augmented_assigns
var noassign=$B.list2obj(['True','False','None','__debug__'])
var $op_order=[['or'],['and'],['not'],['in','not_in'],['<','<=','>','>=','!=','==','is','is_not'],['|'],['^'],['&'],['>>','<<'],['+','-'],['*','@','/','//','%'],['unary_neg','unary_inv','unary_pos'],['**']
]
var $op_weight={},$weight=1
for(var _tmp of $op_order){for(var item of _tmp){$op_weight[item]=$weight}
$weight++}
var ast=$B.ast,op2ast_class=$B.op2ast_class
function ast_body(block_ctx){
var body=[]
for(var child of block_ctx.node.children){var ctx=child.C.tree[0]
if(['single_kw','except','decorator'].indexOf(ctx.type)>-1 ||
(ctx.type=='condition' && ctx.token=='elif')){continue}
var child_ast=ctx.ast()
if(ast.expr.indexOf(child_ast.constructor)>-1){child_ast=new ast.Expr(child_ast)
copy_position(child_ast,child_ast.value)}
body.push(child_ast)}
return body}
var ast_dump=$B.ast_dump=function(tree,indent){indent=indent ||0
if(tree===_b_.None){
return 'None'}else if(typeof tree=='string'){return `'${tree}'`}else if(typeof tree=='number'){return tree+''}else if(tree.imaginary){return tree.value+'j'}else if(Array.isArray(tree)){if(tree.length==0){return '[]'}
res='[\n'
var items=[]
for(var x of tree){try{items.push(ast_dump(x,indent+1))}catch(err){console.log('error',tree)
console.log('for item',x)
throw err}}
res+=items.join(',\n')
return res+']'}else if(tree.$name){return tree.$name+'()'}else if(tree instanceof ast.MatchSingleton){return `MatchSingleton(value=${$B.AST.$convert(tree.value)})`}else if(tree instanceof ast.Constant){var value=tree.value
if(value.imaginary){return `Constant(value=${_b_.repr(value.value)}j)`}
return `Constant(value=${$B.AST.$convert(value)})`}
var proto=Object.getPrototypeOf(tree).constructor
var res='  ' .repeat(indent)+proto.$name+'('
if($B.ast_classes[proto.$name]===undefined){console.log('no ast class',proto)}
var attr_names=$B.ast_classes[proto.$name].split(','),attrs=[]
attr_names=attr_names.map(x=>(x.endsWith('*')||x.endsWith('?'))?
x.substr(0,x.length-1):x)
if([ast.Name].indexOf(proto)>-1){for(var attr of attr_names){if(tree[attr]!==undefined){attrs.push(`${attr}=${ast_dump(tree[attr])}`)}}
return res+attrs.join(', ')+')'}
for(var attr of attr_names){if(tree[attr]!==undefined){var value=tree[attr]
attrs.push(attr+'='+
ast_dump(tree[attr],indent+1).trimStart())}}
if(attrs.length > 0){res+='\n'
res+=attrs.map(x=> '  '.repeat(indent+1)+x).join(',\n')}
res+=')'
return res}
var CO_FUTURE_ANNOTATIONS=0x1000000
function get_line(filename,lineno){var src=$B.file_cache[filename],line=_b_.None
if(src !==undefined){var lines=src.split('\n')
line=lines[lineno-1]}
return line}
var VALID_FUTURES=["nested_scopes","generators","division","absolute_import","with_statement","print_function","unicode_literals","barry_as_FLUFL","generator_stop","annotations"]
$B.future_features=function(mod,filename){var features=0
var i=0;
if(mod.body[0]instanceof $B.ast.Expr){if(mod.body[0].value instanceof $B.ast.Constant &&
typeof mod.body[0].value.value=="string"){
i++}}
while(i < mod.body.length){var child=mod.body[i]
if(child instanceof $B.ast.ImportFrom && child.module=='__future__'){
for(var alias of child.names){var name=alias.name
if(name=="braces"){raise_error_known_location(_b_.SyntaxError,filename,alias.lineno,alias.col_offset,alias.end_lineno,alias.end_col_offset,get_line(filename,child.lineno),"not a chance")}else if(name=="annotations"){features |=CO_FUTURE_ANNOTATIONS}else if(VALID_FUTURES.indexOf(name)==-1){raise_error_known_location(_b_.SyntaxError,filename,alias.lineno,alias.col_offset,alias.end_lineno,alias.end_col_offset,get_line(filename,child.lineno),`future feature ${name} is not defined`)}}
i++}else{break}}
return{features}}
function set_position(ast_obj,position,end_position){ast_obj.lineno=position.start[0]
ast_obj.col_offset=position.start[1]
position=end_position ||position
ast_obj.end_lineno=position.end[0]
ast_obj.end_col_offset=position.end[1]}
function copy_position(target,origin){target.lineno=origin.lineno
target.col_offset=origin.col_offset
target.end_lineno=origin.end_lineno
target.end_col_offset=origin.end_col_offset}
function first_position(C){var ctx=C
while(ctx.tree && ctx.tree.length > 0){ctx=ctx.tree[0]}
return ctx.position}
function last_position(C){var ctx=C
while(ctx.tree && ctx.tree.length > 0){ctx=$B.last(ctx.tree)
if(ctx.end_position){return ctx.end_position}}
return ctx.end_position ||ctx.position}
function raise_error_known_location(type,filename,lineno,col_offset,end_lineno,end_col_offset,line,message){var exc=type.$factory(message)
exc.filename=filename
exc.lineno=lineno
exc.offset=col_offset+1
exc.end_lineno=end_lineno
exc.end_offset=end_col_offset+1
exc.text=line
exc.args[1]=$B.fast_tuple([filename,exc.lineno,exc.offset,exc.text,exc.end_lineno,exc.end_offset])
exc.$frame_obj=$B.frame_obj
throw exc}
$B.raise_error_known_location=raise_error_known_location
function raise_syntax_error_known_range(C,a,b,msg){
raise_error_known_location(_b_.SyntaxError,get_module(C).filename,a.start[0],a.start[1],b.end[0],b.end[1],a.line,msg)}
function raise_error(errtype,C,msg,token){var filename=get_module(C).filename
token=token ||$token.value
msg=msg ||'invalid syntax'
if(msg.startsWith('(')){msg='invalid syntax '+msg}
msg=msg.trim()
raise_error_known_location(errtype,filename,token.start[0],token.start[1],token.end[0],token.end[1]-1,token.line,msg)}
function raise_syntax_error(C,msg,token){raise_error(_b_.SyntaxError,C,msg,token)}
function raise_indentation_error(C,msg,indented_node){
if(indented_node){
var type=indented_node.C.tree[0].type,token=indented_node.C.tree[0].token,lineno=indented_node.line_num
switch(type){case 'class':
type='class definition'
break
case 'condition':
type=`'${token}' statement`
break
case 'def':
type='function definition'
break
case 'case':
case 'except':
case 'for':
case 'match':
case 'try':
case 'while':
case 'with':
type=`'${type}' statement`
break
case 'single_kw':
type=`'${token}' statement`
break}
msg+=` after ${type} on line ${lineno}`}
raise_error(_b_.IndentationError,C,msg)}
function check_assignment(C,kwargs){
function in_left_side(C,assign_type){var ctx=C
while(ctx){if(ctx.parent && ctx.parent.type==assign_type &&
ctx===ctx.parent.tree[0]){return true}
ctx=ctx.parent}}
var once,action='assign to',augmented=false
if(kwargs){once=kwargs.once
action=kwargs.action ||action
augmented=kwargs.augmented===undefined ? false :kwargs.augmented}
var ctx=C,forbidden=['assert','import','raise','return','decorator','comprehension','await']
if(action !='delete'){
forbidden.push('del')}
function report(wrong_type,a,b){a=a ||C.position
b=b ||$token.value
if(augmented){raise_syntax_error_known_range(
C,a,b,`'${wrong_type}' is an illegal expression `+
'for augmented assignment')}else{var msg=wrong_type
if(Array.isArray(msg)){
msg=msg[0]}else if($token.value.string=='=' && $token.value.type=='OP'){if(parent_match(C,{type:'augm_assign'})){
raise_syntax_error(C)}
if(parent_match(C,{type:'assign'})){raise_syntax_error_known_range(
C,a,b,`invalid syntax. Maybe you meant '==' or ':=' instead of '='?`)}
if(! parent_match(C,{type:'list_or_tuple'})){msg+=" here. Maybe you meant '==' instead of '='?"}}
raise_syntax_error_known_range(
C,a,b,`cannot ${action} ${msg}`)}}
if(C.type=='expr'){var upper_expr=C
var ctx=C
while(ctx.parent){if(ctx.parent.type=='expr'){upper_expr=ctx.parent}
ctx=ctx.parent}}
if(in_left_side(C,'augm_assign')){raise_syntax_error(C)}
if(C.type=='target_list'){for(var target of C.tree){check_assignment(target,{action:'assign to'})}
return}
ctx=C
while(ctx){if(forbidden.indexOf(ctx.type)>-1){raise_syntax_error(C,`(assign to ${ctx.type})`)}else if(ctx.type=="expr"){if(parent_match(ctx,{type:'annotation'})){return true}
if(ctx.parent.type=='yield'){raise_syntax_error_known_range(ctx,ctx.parent.position,last_position(ctx),"assignment to yield expression not possible")}
var assigned=ctx.tree[0]
if(assigned.type=="op"){if($B.op2method.comparisons[ctx.tree[0].op]!==undefined){if(parent_match(ctx,{type:'target_list'})){
raise_syntax_error(C)}
report('comparison',assigned.tree[0].position,last_position(assigned))}else{report('expression',assigned.tree[0].position,last_position(assigned))}}else if(assigned.type=='attribute' &&
parent_match(ctx,{type:'condition'})){report('attribute',ctx.position,last_position(C))}else if(assigned.type=='sub' &&
parent_match(ctx,{type:'condition'})){report('subscript',ctx.position,last_position(C))}else if(assigned.type=='unary'){report('expression',assigned.position,last_position(assigned))}else if(assigned.type=='call'){report('function call',assigned.position,assigned.end_position)}else if(assigned.type=='id'){var name=assigned.value
if(['None','True','False','__debug__'].indexOf(name)>-1){
if(name=='__debug__' && augmented){
$token.value=assigned.position
raise_syntax_error(assigned,'cannot assign to __debug__')}
report([name])}
if(noassign[name]===true){report(keyword)}}else if(['str','int','float','complex'].indexOf(assigned.type)>-1){if(ctx.parent.type !='op'){report('literal')}}else if(assigned.type=="ellipsis"){report('ellipsis')}else if(assigned.type=='genexpr'){report(['generator expression'])}else if(assigned.type=='starred'){if(action=='delete'){report('starred',assigned.position,last_position(assigned))}
check_assignment(assigned.tree[0],{action,once:true})}else if(assigned.type=='named_expr'){if(! assigned.parenthesized){report('named expression')}else if(ctx.parent.type=='node'){raise_syntax_error_known_range(
C,assigned.target.position,last_position(assigned),"cannot assign to named expression here. "+
"Maybe you meant '==' instead of '='?")}else if(action=='delete'){report('named expression',assigned.position,last_position(assigned))}}else if(assigned.type=='list_or_tuple'){for(var item of ctx.tree){check_assignment(item,{action,once:true})}}else if(assigned.type=='dict_or_set'){if(assigned.closed){report(assigned.real=='set' ? 'set display' :'dict literal',ctx.position,last_position(assigned))}}else if(assigned.type=='lambda'){report('lambda')}else if(assigned.type=='ternary'){report(['conditional expression'])}else if(assigned.type=='JoinedStr'){report('f-string expression',assigned.position,last_position(assigned))}}else if(ctx.type=='list_or_tuple'){for(var item of ctx.tree){check_assignment(item,{action,once:true})}}else if(ctx.type=='ternary'){report(['conditional expression'],ctx.position,last_position(C))}else if(ctx.type=='op'){var a=ctx.tree[0].position,last=$B.last(ctx.tree).tree[0],b=last.end_position ||last.position
if($B.op2method.comparisons[ctx.op]!==undefined){if(parent_match(C,{type:'target_list'})){
raise_syntax_error(C)}
report('comparison',a,b)}else{report('expression',a,b)}}else if(ctx.type=='yield'){report('yield expression')}else if(ctx.comprehension){break}
if(once){break}
ctx=ctx.parent}}
function remove_abstract_expr(tree){if(tree.length > 0 && $B.last(tree).type=='abstract_expr'){tree.pop()}}
$B.format_indent=function(js,indent){
var indentation='  ',lines=js.split('\n'),level=indent,res='',last_is_closing_brace=false,last_is_backslash=false,last_is_var_and_comma=false
for(var i=0,len=lines.length;i < len;i++){var line=lines[i],add_closing_brace=false,add_spaces=true
if(last_is_backslash){add_spaces=false}else if(last_is_var_and_comma){line='    '+line.trim()}else{line=line.trim()}
if(add_spaces && last_is_closing_brace &&
(line.startsWith('else')||
line.startsWith('catch')||
line.startsWith('finally'))){res=res.substr(0,res.length-1)
add_spaces=false}
last_is_closing_brace=line.endsWith('}')
if(line.startsWith('}')){level--}else if(line.endsWith('}')){line=line.substr(0,line.length-1)
add_closing_brace=true}
if(level < 0){if($B.get_option('debug')> 2){console.log('wrong js indent')
console.log(res)}
level=0}
try{res+=(add_spaces ? indentation.repeat(level):'')+line+'\n'}catch(err){console.log(res)
throw err}
if(line.endsWith('{')){level++}else if(add_closing_brace){level--
if(level < 0){level=0}
try{res+=indentation.repeat(level)+'}\n'}catch(err){console.log(res)
throw err}}
last_is_backslash=line.endsWith('\\')
last_is_var_and_comma=line.endsWith(',')&&
(line.startsWith('var ')||last_is_var_and_comma)}
return res}
function show_line(ctx){
var lnum=get_node(ctx).line_num,src=get_module(ctx).src
console.log('this',ctx,'\nline',lnum,src.split('\n')[lnum-1])}
var $Node=$B.parser.$Node=function(type){this.type=type
this.children=[]}
$Node.prototype.add=function(child){
this.children[this.children.length]=child
child.parent=this
child.module=this.module}
$Node.prototype.ast=function(){var root_ast=new ast.Module([],[])
root_ast.lineno=this.line_num
for(var node of this.children){var t=node.C.tree[0]
if(['single_kw','except','decorator'].indexOf(t.type)>-1 ||
(t.type=='condition' && t.token=='elif')){continue}
var node_ast=node.C.tree[0].ast()
if(ast.expr.indexOf(node_ast.constructor)>-1){node_ast=new ast.Expr(node_ast)
copy_position(node_ast,node_ast.value)}
root_ast.body.push(node_ast)}
if(this.mode=='eval'){if(root_ast.body.length > 1 ||
!(root_ast.body[0]instanceof $B.ast.Expr)){raise_syntax_error(this.children[0].C,'eval() argument must be an expression')}
root_ast=new $B.ast.Expression(root_ast.body[0].value)
copy_position(root_ast,root_ast.body)}
return root_ast}
$Node.prototype.insert=function(pos,child){
this.children.splice(pos,0,child)
child.parent=this
child.module=this.module}
$Node.prototype.show=function(indent){
var res=''
if(this.type==='module'){for(var child of this.children){res+=child.show(indent)}
return res}
indent=indent ||0
res+=' '.repeat(indent)
res+=this.C
if(this.children.length > 0){res+='{'}
res+='\n'
for(var child of this.children){res+=child.show(indent+4)}
if(this.children.length > 0){res+=' '.repeat(indent)
res+='}\n'}
return res}
var AbstractExprCtx=$B.parser.AbstractExprCtx=function(C,with_commas){this.type='abstract_expr'
this.with_commas=with_commas
this.parent=C
this.tree=[]
this.position=$token.value
C.tree.push(this)}
AbstractExprCtx.prototype.transition=function(token,value){var C=this
var packed=C.packed,is_await=C.is_await,position=C.position
switch(token){case 'await':
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
C.parent.tree.pop()
var commas=C.with_commas,star_position
if(C.packed){star_position=C.star_position}
C=C.parent
C.packed=packed
C.is_await=is_await
if(C.position===undefined){C.position=$token.value}
if(star_position){C.star_position=star_position}}
switch(token){case 'await':
return new AbstractExprCtx(new AwaitCtx(
new ExprCtx(C,'await',false)),false)
case 'id':
return new IdCtx(new ExprCtx(C,'id',commas),value)
case 'str':
return new StringCtx(new ExprCtx(C,'str',commas),value)
case 'JoinedStr':
return new FStringCtx(new ExprCtx(C,'str',commas),value)
case 'bytes':
return new StringCtx(new ExprCtx(C,'bytes',commas),value)
case 'int':
return new NumberCtx('int',new ExprCtx(C,'int',commas),value)
case 'float':
return new NumberCtx('float',new ExprCtx(C,'float',commas),value)
case 'imaginary':
return new NumberCtx('imaginary',new ExprCtx(C,'imaginary',commas),value)
case '(':
return new ListOrTupleCtx(
new ExprCtx(C,'tuple',commas),'tuple')
case '[':
return new ListOrTupleCtx(
new ExprCtx(C,'list',commas),'list')
case '{':
return new AbstractExprCtx(
new DictOrSetCtx(
new ExprCtx(C,'dict_or_set',commas)),false)
case 'ellipsis':
return new EllipsisCtx(
new ExprCtx(C,'ellipsis',commas))
case 'not':
if(C.type=='op' && C.op=='is'){
C.op='is_not'
return new AbstractExprCtx(C,false)}
return new AbstractExprCtx(
new NotCtx(new ExprCtx(C,'not',commas)),false)
case 'lambda':
return new LambdaCtx(new ExprCtx(C,'lambda',commas))
case 'op':
var tg=value
if(C.parent.type=='op' && '+-~'.indexOf(tg)==-1){raise_syntax_error(C)}
switch(tg){case '*':
C.parent.tree.pop()
var commas=C.with_commas
C=C.parent
C.position=$token.value
return new AbstractExprCtx(
new StarredCtx(
new ExprCtx(C,'expr',commas)),false)
case '**':
C.parent.tree.pop()
var commas=C.with_commas
C=C.parent
C.position=$token.value
return new AbstractExprCtx(
new KwdCtx(
new ExprCtx(C,'expr',commas)),false)
case '-':
case '~':
case '+':
C.parent.tree.pop()
return new AbstractExprCtx(
new UnaryCtx(
new ExprCtx(C.parent,'unary',false),tg),false
)
case 'not':
C.parent.tree.pop()
var commas=C.with_commas
C=C.parent
return new NotCtx(
new ExprCtx(C,'not',commas))
case '...':
return new EllipsisCtx(new ExprCtx(C,'ellipsis',commas))}
raise_syntax_error(C)
case 'in':
if(C.parent.type=='op' && C.parent.op=='not'){C.parent.op='not_in'
return C}
raise_syntax_error(C)
case '=':
if(C.parent.type=="yield"){raise_syntax_error(C,"assignment to yield expression not possible",C.parent.position,)}
raise_syntax_error(C)
case 'yield':
return new AbstractExprCtx(new YieldCtx(C),true)
case ':':
if(C.parent.type=="sub" ||
(C.parent.type=="list_or_tuple" &&
C.parent.parent.type=="sub")){return new AbstractExprCtx(new SliceCtx(C.parent),false)}
return transition(C.parent,token,value)
case ')':
case ',':
switch(C.parent.type){case 'list_or_tuple':
case 'slice':
case 'call_arg':
case 'op':
case 'yield':
break
case 'match':
if(token==','){
C.parent.tree.pop()
var tuple=new ListOrTupleCtx(C.parent,'tuple')
tuple.implicit=true
tuple.has_comma=true
tuple.tree=[C]
C.parent=tuple
return tuple}
break
default:
raise_syntax_error(C)}
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
raise_syntax_error(C)
break}
return transition(C.parent,token,value)}
var AliasCtx=$B.parser.AliasCtx=function(C){
this.type='ctx_manager_alias'
this.parent=C
this.tree=[]
C.tree[C.tree.length-1].alias=this}
AliasCtx.prototype.transition=function(token,value){var C=this
switch(token){case ',':
case ')':
case ':':
check_assignment(C.tree[0])
C.parent.set_alias(C.tree[0].tree[0])
return transition(C.parent,token,value)
case 'eol':
$token.value=last_position(C)
raise_syntax_error(C,"expected ':'")}
raise_syntax_error(C)}
var AnnotationCtx=$B.parser.AnnotationCtx=function(C){
this.type='annotation'
this.parent=C
this.tree=[]
C.annotation=this
var scope=get_scope(C)
if(scope.ntype=="def" && C.tree && C.tree.length > 0 &&
C.tree[0].type=="id"){var name=C.tree[0].value
scope.annotations=scope.annotations ||new Set()
scope.annotations.add(name)}}
AnnotationCtx.prototype.transition=function(token,value){var C=this
if(token=="eol" && C.tree.length==1 &&
C.tree[0].tree.length==0){raise_syntax_error(C)}else if(token==':' && C.parent.type !="def"){raise_syntax_error(C,"more than one annotation")}else if(token=="augm_assign"){raise_syntax_error(C,"augmented assign as annotation")}else if(token=="op"){raise_syntax_error(C,"operator as annotation")}
return transition(C.parent,token)}
var AssertCtx=$B.parser.AssertCtx=function(C){
this.type='assert'
this.parent=C
this.tree=[]
this.position=$token.value
C.tree[C.tree.length]=this}
AssertCtx.prototype.ast=function(){
var msg=this.tree[1],ast_obj=new ast.Assert(this.tree[0].ast(),msg===undefined ? msg :msg.ast())
set_position(ast_obj,this.position)
return ast_obj}
AssertCtx.prototype.transition=function(token,value){var C=this
if(token==","){if(this.tree.length > 1){raise_syntax_error(C,'(too many commas after assert)')}
return new AbstractExprCtx(this,false)}
if(token=='eol'){if(this.tree.length==1 &&
this.tree[0].type=='expr' &&
this.tree[0].tree[0].type=='list_or_tuple'){$B.warn(_b_.SyntaxWarning,"assertion is always true, perhaps remove parentheses?",get_module(C).filename,$token.value)}
return transition(C.parent,token)}
raise_syntax_error(C)}
var AssignCtx=$B.parser.AssignCtx=function(C,expression){
check_assignment(C)
this.type='assign'
this.position=$token.value
C.parent.tree.pop()
C.parent.tree.push(this)
this.parent=C.parent
this.tree=[C]
var scope=get_scope(this)
if(C.type=='assign'){check_assignment(C.tree[1])}else{var assigned=C.tree[0]
if(assigned.type=="ellipsis"){raise_syntax_error(C,'cannot assign to Ellipsis')}else if(assigned.type=='unary'){raise_syntax_error(C,'cannot assign to operator')}else if(assigned.type=='starred'){if(assigned.tree[0].name=='id'){var id=assigned.tree[0].tree[0].value
if(['None','True','False','__debug__'].indexOf(id)>-1){raise_syntax_error(C,'cannot assign to '+id)}}
if(assigned.parent.in_tuple===undefined){raise_syntax_error(C,"starred assignment target must be in a list or tuple")}}}}
function set_ctx_to_store(obj){if(Array.isArray(obj)){for(var item of obj){set_ctx_to_store(item)}}else if(obj instanceof ast.List ||
obj instanceof ast.Tuple){for(var item of obj.elts){set_ctx_to_store(item)}}else if(obj instanceof ast.Starred){obj.value.ctx=new ast.Store()}else if(obj===undefined){}else if(obj.ctx){obj.ctx=new ast.Store()}else{console.log('bizarre',obj,obj.constructor.$name)}}
AssignCtx.prototype.ast=function(){var value=this.tree[1].ast(),targets=[],target=this.tree[0]
if(target.type=='expr' && target.tree[0].type=='list_or_tuple'){target=target.tree[0]}
if(target.type=='list_or_tuple'){target=target.ast()
target.ctx=new ast.Store()
targets=[target]}else{while(target.type=='assign'){targets.splice(0,0,target.tree[1].ast())
target=target.tree[0]}
targets.splice(0,0,target.ast())}
value.ctx=new ast.Load()
var lineno=get_node(this).line_num
if(target.annotation){var ast_obj=new ast.AnnAssign(
target.tree[0].ast(),target.annotation.tree[0].ast(),value,target.$was_parenthesized ? 0 :1)
set_position(ast_obj.annotation,target.annotation.position,last_position(target.annotation))
ast_obj.target.ctx=new ast.Store()}else{var ast_obj=new ast.Assign(targets,value)}
set_position(ast_obj,this.position)
set_ctx_to_store(ast_obj.targets)
return ast_obj}
AssignCtx.prototype.transition=function(token,value){var C=this
if(token=='eol'){if(C.tree[1].type=='abstract_expr'){raise_syntax_error(C)}
return transition(C.parent,'eol')}
raise_syntax_error(C)}
var AsyncCtx=$B.parser.AsyncCtx=function(C){
this.type='async'
this.parent=C
C.async=true
this.position=C.position=$token.value}
AsyncCtx.prototype.transition=function(token,value){var C=this
if(token=="def"){return transition(C.parent,token,value)}else if(token=="with"){var ctx=transition(C.parent,token,value)
ctx.async=C 
return ctx}else if(token=="for"){var ctx=transition(C.parent,token,value)
ctx.parent.async=C 
return ctx}
raise_syntax_error(C)}
var AttrCtx=$B.parser.AttrCtx=function(C){
this.type='attribute'
this.value=C.tree[0]
this.parent=C
this.position=$token.value
C.tree.pop()
C.tree[C.tree.length]=this
this.tree=[]
this.func='getattr' }
AttrCtx.prototype.ast=function(){
var value=this.value.ast(),attr=this.unmangled_name,ctx=new ast.Load()
if(this.func=='setattr'){ctx=new ast.Store()}else if(this.func=='delattr'){ctx=new ast.Delete()}
var ast_obj=new ast.Attribute(value,attr,ctx)
set_position(ast_obj,this.position,this.end_position)
return ast_obj}
AttrCtx.prototype.transition=function(token,value){var C=this
if(token==='id'){var name=value
if(name=='__debug__'){raise_syntax_error(C,'cannot assign to __debug__')}else if(noassign[name]===true){raise_syntax_error(C)}
C.unmangled_name=name
C.position=$token.value
C.end_position=$token.value
name=mangle_name(name,C)
C.name=name
return C.parent}
raise_syntax_error(C)}
var AugmentedAssignCtx=$B.parser.AugmentedAssignCtx=function(C,op){
check_assignment(C,{augmented:true})
this.type='augm_assign'
this.C=C
this.parent=C.parent
this.position=$token.value
C.parent.tree.pop()
C.parent.tree[C.parent.tree.length]=this
this.op=op
this.tree=[C]
var scope=this.scope=get_scope(this)
this.module=scope.module}
AugmentedAssignCtx.prototype.ast=function(){
var target=this.tree[0].ast(),value=this.tree[1].ast()
target.ctx=new ast.Store()
value.ctx=new ast.Load()
var op=this.op.substr(0,this.op.length-1),ast_type_class=op2ast_class[op],ast_class=ast_type_class[1]
var ast_obj=new ast.AugAssign(target,new ast_class(),value)
set_position(ast_obj,this.position)
return ast_obj}
AugmentedAssignCtx.prototype.transition=function(token,value){var C=this
if(token=='eol'){if(C.tree[1].type=='abstract_expr'){raise_syntax_error(C)}
return transition(C.parent,'eol')}
raise_syntax_error(C)}
var AwaitCtx=$B.parser.AwaitCtx=function(C){
this.type='await'
this.parent=C
this.tree=[]
this.position=$token.value
C.tree.push(this)
var p=C
while(p){if(p.type=="list_or_tuple"){p.is_await=true}
p=p.parent}
var node=get_node(this)
node.awaits=node.awaits ||[]
node.awaits.push(this)}
AwaitCtx.prototype.ast=function(){
var ast_obj=new ast.Await(this.tree[0].ast())
set_position(ast_obj,this.position)
return ast_obj}
AwaitCtx.prototype.transition=function(token,value){var C=this
C.parent.is_await=true
return transition(C.parent,token,value)}
var BodyCtx=$B.parser.BodyCtx=function(C){
var ctx_node=C.parent
while(ctx_node.type !=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
var body_node=new $Node()
body_node.is_body_node=true
body_node.line_num=tree_node.line_num
tree_node.insert(0,body_node)
return new NodeCtx(body_node)}
var BreakCtx=$B.parser.BreakCtx=function(C){
this.type='break'
this.position=$token.value
this.parent=C
C.tree[C.tree.length]=this}
BreakCtx.prototype.ast=function(){var ast_obj=new ast.Break()
set_position(ast_obj,this.position)
return ast_obj}
BreakCtx.prototype.transition=function(token,value){var C=this
if(token=='eol'){return transition(C.parent,'eol')}
raise_syntax_error(C)}
var CallArgCtx=$B.parser.CallArgCtx=function(C){
this.type='call_arg'
this.parent=C
this.tree=[]
this.position=$token.value
C.tree.push(this)
this.expect='id'}
CallArgCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'await':
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
if(C.expect=='id'){this.position=$token.value
C.expect=','
var expr=new AbstractExprCtx(C,false)
return transition(expr,token,value)}
break
case '=':
if(C.expect==','){return new ExprCtx(new KwArgCtx(C),'kw_value',false)}
break
case 'for':
return new TargetListCtx(new ForExpr(new GeneratorExpCtx(C)))
case 'op':
if(C.expect=='id'){var op=value
C.expect=','
switch(op){case '+':
case '-':
case '~':
return transition(new AbstractExprCtx(C,false),token,op)
case '*':
C.parent.tree.pop()
return new StarArgCtx(C.parent)
case '**':
C.parent.tree.pop()
return new DoubleStarArgCtx(C.parent)}}
raise_syntax_error(C)
case ')':
return transition(C.parent,token)
case ':':
if(C.expect==',' &&
C.parent.parent.type=='lambda'){return transition(C.parent.parent,token)}
break
case ',':
if(C.expect==','){return transition(C.parent,token,value)}}
raise_syntax_error(C)}
var CallCtx=$B.parser.CallCtx=function(C){
this.position=$token.value
this.type='call'
this.func=C.tree[0]
if(this.func !==undefined){
this.func.parent=this
this.parenth_position=this.position
this.position=this.func.position}
this.parent=C
if(C.type !='class'){C.tree.pop()
C.tree[C.tree.length]=this}else{
C.args=this}
this.expect='id'
this.tree=[]}
CallCtx.prototype.ast=function(){var res=new ast.Call(this.func.ast(),[],[]),keywords=new Set()
for(var call_arg of this.tree){if(call_arg.type=='double_star_arg'){var value=call_arg.tree[0].tree[0].ast(),keyword=new ast.keyword(_b_.None,value)
delete keyword.arg
res.keywords.push(keyword)}else if(call_arg.type=='star_arg'){if(res.keywords.length > 0){if(! res.keywords[0].arg){raise_syntax_error(this,'iterable argument unpacking follows keyword argument unpacking')}}
var starred=new ast.Starred(call_arg.tree[0].ast())
set_position(starred,call_arg.position)
starred.ctx=new ast.Load()
res.args.push(starred)}else if(call_arg.type=='genexpr'){res.args.push(call_arg.ast())}else{var item=call_arg.tree[0]
if(item===undefined){
continue}
if(item.type=='kwarg'){var key=item.tree[0].value
if(key=='__debug__'){raise_syntax_error_known_range(this,this.position,this.end_position,"cannot assign to __debug__")}else if(['True','False','None'].indexOf(key)>-1){raise_syntax_error_known_range(this,item.position,item.equal_sign_position,'expression cannot contain assignment, perhaps you meant "=="?')}
if(keywords.has(key)){raise_syntax_error_known_range(item,item.position,last_position(item),`keyword argument repeated: ${key}`)}
keywords.add(key)
var keyword=new ast.keyword(item.tree[0].value,item.tree[1].ast())
set_position(keyword,item.position)
res.keywords.push(keyword)}else{if(res.keywords.length > 0){if(res.keywords[0].arg){raise_syntax_error_known_range(this,item.position,last_position(item),'positional argument follows keyword argument')}else{raise_syntax_error_known_range(this,item.position,last_position(item),'positional argument follows keyword argument unpacking')}}
res.args.push(item.ast())}}}
set_position(res,this.position,this.end_position)
return res}
CallCtx.prototype.transition=function(token,value){var C=this
switch(token){case ',':
if(C.expect=='id'){raise_syntax_error(C)}
C.expect='id'
return C
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
C.expect=','
return transition(new CallArgCtx(C),token,value)
case ')':
C.end_position=$token.value
return C.parent
case 'op':
C.expect=','
switch(value){case '-':
case '~':
case '+':
C.expect=','
return transition(new CallArgCtx(C),token,value)
case '*':
C.has_star=true
return new StarArgCtx(C)
case '**':
C.has_dstar=true
return new DoubleStarArgCtx(C)}
raise_syntax_error(C)
case 'yield':
raise_syntax_error(C)}
return transition(C.parent,token,value)}
var CaseCtx=$B.parser.CaseCtx=function(node_ctx){
this.type="case"
this.position=$token.value
node_ctx.tree=[this]
this.parent=node_ctx
this.tree=[]
this.expect='as'}
CaseCtx.prototype.ast=function(){
var ast_obj=new ast.match_case(this.tree[0].ast(),this.has_guard ? this.tree[1].tree[0].ast():undefined,ast_body(this.parent))
set_position(ast_obj,this.position)
return ast_obj}
CaseCtx.prototype.set_alias=function(name){this.alias=name}
CaseCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'as':
C.expect=':'
return new AbstractExprCtx(new AliasCtx(C))
case ':':
function is_irrefutable(pattern){var cause
if(pattern.type=="capture_pattern"){return pattern.tree[0]}else if(pattern.type=="or_pattern"){for(var subpattern of pattern.tree){if(cause=is_irrefutable(subpattern)){return cause}}}else if(pattern.type=="sequence_pattern" &&
pattern.token=='(' &&
pattern.tree.length==1 &&
(cause=is_irrefutable(pattern.tree[0]))){return cause}
return false}
var cause
if(cause=is_irrefutable(this.tree[0])){
get_node(C).parent.irrefutable=cause}
switch(C.expect){case 'id':
case 'as':
case ':':
var last=$B.last(C.tree)
if(last && last.type=='sequence_pattern'){remove_empty_pattern(last)}
return BodyCtx(C)}
break
case 'op':
if(value=='|'){return new PatternCtx(new PatternOrCtx(C))}
raise_syntax_error(C,'expected :')
case ',':
if(C.expect==':' ||C.expect=='as'){return new PatternCtx(new PatternSequenceCtx(C))}
case 'if':
C.has_guard=true
return new AbstractExprCtx(new ConditionCtx(C,token),false)
default:
raise_syntax_error(C,'expected :')}}
var ClassCtx=$B.parser.ClassCtx=function(C){
this.type='class'
this.parent=C
this.tree=[]
this.position=$token.value
C.tree[C.tree.length]=this
this.expect='id'
var scope=this.scope=get_scope(this)
this.parent.node.parent_block=scope
this.parent.node.bound={}}
ClassCtx.prototype.ast=function(){
var decorators=get_decorators(this.parent.node),bases=[],keywords=[],type_params=[]
if(this.args){for(var arg of this.args.tree){if(arg.tree[0].type=='kwarg'){keywords.push(new ast.keyword(arg.tree[0].tree[0].value,arg.tree[0].tree[1].ast()))}else{bases.push(arg.tree[0].ast())}}}
if(this.type_params){type_params=this.type_params.ast()}
var ast_obj=new ast.ClassDef(this.name,bases,keywords,ast_body(this.parent),decorators,type_params)
set_position(ast_obj,this.position)
return ast_obj}
ClassCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'id':
if(C.expect=='id'){C.set_name(value)
C.expect='(:'
return C}
break
case '(':
if(C.name===undefined){raise_syntax_error(C,'missing class name')}
C.parenthesis_position=$token.value
return new CallCtx(C)
case '[':
if(C.name===undefined){raise_syntax_error(C,'missing class name')}
return new TypeParamsCtx(C)
case ':':
if(this.args){for(var arg of this.args.tree){var param=arg.tree[0]
if(arg.type !='call_arg'){$token.value=C.parenthesis_position
raise_syntax_error(C,"expected ':'")}
if((param.type=='expr' && param.name=='id')||
param.type=="kwarg"){continue}
$token.value=arg.position
raise_syntax_error(arg,'invalid class parameter')}}
return BodyCtx(C)
case 'eol':
raise_syntax_error(C,"expected ':'")}
raise_syntax_error(C)}
ClassCtx.prototype.set_name=function(name){var C=this.parent
this.random=$B.UUID()
this.name=name
this.id=C.node.module+'_'+name+'_'+this.random
this.parent.node.id=this.id
var scope=this.scope,parent_block=scope
var block=scope,parent_classes=[]
while(block.ntype=="class"){parent_classes.splice(0,0,block.C.tree[0].name)
block=block.parent}
this.qualname=parent_classes.concat([name]).join(".")
while(parent_block.C &&
parent_block.C.tree[0].type=='class'){parent_block=parent_block.parent}
while(parent_block.C &&
'def' !=parent_block.C.tree[0].type &&
'generator' !=parent_block.C.tree[0].type){parent_block=parent_block.parent}
this.parent.node.parent_block=parent_block}
var Comprehension={generators:function(comps){
var comprehensions=[]
for(var item of comps){if(item.type=='for'){var target=item.tree[0].ast()
set_ctx_to_store(target)
comprehensions.push(
new ast.comprehension(
target,item.tree[1].ast(),[],item.is_async ? 1 :0
)
)}else{$B.last(comprehensions).ifs.push(item.tree[0].ast())}}
return comprehensions},make_comp:function(comp,C){if(C.tree[0].type=='yield'){var comp_type=comp.type=='listcomp' ? 'list comprehension' :
comp.type=='dictcomp' ? 'dict comprehension' :
comp.type=='setcomp' ? 'set comprehension' :
comp.type=='genexpr' ? 'generator expression' :''
var a=C.tree[0]}
comp.comprehension=true
comp.position=$token.value
comp.parent=C.parent
comp.id=comp.type+$B.UUID()
var scope=get_scope(C)
comp.parent_block=scope
while(scope){if(scope.C && scope.C.tree &&
scope.C.tree.length > 0 &&
scope.C.tree[0].async){comp.async=true
break}
scope=scope.parent_block}
comp.module=get_module(C).module
comp.module_ref=comp.module.replace(/\./g,'_')
C.parent.tree[C.parent.tree.length-1]=comp
Comprehension.set_parent_block(C.tree[0],comp)},set_parent_block:function(ctx,parent_block){if(ctx.tree){for(var item of ctx.tree){if(item.comprehension){item.parent_block=parent_block}
Comprehension.set_parent_block(item,parent_block)}}}}
var ConditionCtx=$B.parser.ConditionCtx=function(C,token){
this.type='condition'
this.token=token
this.parent=C
this.tree=[]
this.position=$token.value
this.node=get_node(this)
this.scope=get_scope(this)
if(token=='elif'){
var rank=this.node.parent.children.indexOf(this.node),previous=this.node.parent.children[rank-1]
previous.C.tree[0].orelse=this}
C.tree.push(this)}
ConditionCtx.prototype.ast=function(){
var types={'if':'If','while':'While','elif':'If'}
var res=new ast[types[this.token]](this.tree[0].ast())
if(this.orelse){if(this.orelse.token=='elif'){res.orelse=[this.orelse.ast()]}else{res.orelse=this.orelse.ast()}}else{res.orelse=[]}
res.body=ast_body(this)
set_position(res,this.position)
return res}
ConditionCtx.prototype.transition=function(token,value){var C=this
if(token==':'){if(C.tree[0].type=="abstract_expr" &&
C.tree[0].tree.length==0){
raise_syntax_error(C)}
return BodyCtx(C)}else if(C.in_comp && C.token=='if'){
if(token==']'){return transition(C.parent,token,value)}else if(token=='if'){var if_exp=new ConditionCtx(C.parent,'if')
if_exp.in_comp=C.in_comp
return new AbstractExprCtx(if_exp,false)}else if(')]}'.indexOf(token)>-1){return transition(this.parent,token,value)}else if(C.in_comp && token=='for'){return new TargetListCtx(new ForExpr(C.parent))}
if(token==',' && parent_match(C,{type:'call'})){raise_syntax_error_known_range(C,C.in_comp.position,last_position(C),'Generator expression must be parenthesized')}}
raise_syntax_error(C,"expected ':'")}
var ContinueCtx=$B.parser.ContinueCtx=function(C){
this.type='continue'
this.parent=C
this.position=$token.value
get_node(this).is_continue=true
C.tree[C.tree.length]=this}
ContinueCtx.prototype.ast=function(){var ast_obj=new ast.Continue()
set_position(ast_obj,this.position)
return ast_obj}
ContinueCtx.prototype.transition=function(token,value){var C=this
if(token=='eol'){return C.parent}
raise_syntax_error(C)}
var DecoratorCtx=$B.parser.DecoratorCtx=function(C){
this.type='decorator'
this.parent=C
C.tree[C.tree.length]=this
this.tree=[]
this.position=$token.value}
DecoratorCtx.prototype.transition=function(token,value){var C=this
if(token=='eol'){return transition(C.parent,token)}
raise_syntax_error(C)}
function get_decorators(node){var decorators=[]
var parent_node=node.parent
var rank=parent_node.children.indexOf(node)
while(true){rank--
if(rank < 0){break}else if(parent_node.children[rank].C.tree[0].type==
'decorator'){var deco=parent_node.children[rank].C.tree[0].tree[0]
decorators.splice(0,0,deco.ast())}else{break}}
return decorators}
var DefCtx=$B.parser.DefCtx=function(C){this.type='def'
this.name=null
this.parent=C
this.tree=[]
this.async=C.async
if(this.async){this.position=C.position}else{this.position=$token.value}
C.tree[C.tree.length]=this
this.enclosing=[]
var scope=this.scope=get_scope(this)
if(scope.C && scope.C.tree[0].type=="class"){this.class_name=scope.C.tree[0].name}
var parent_block=scope
while(parent_block.C &&
parent_block.C.tree[0].type=='class'){parent_block=parent_block.parent}
while(parent_block.C &&
'def' !=parent_block.C.tree[0].type){parent_block=parent_block.parent}
this.parent.node.parent_block=parent_block
var pb=parent_block
this.is_comp=pb.is_comp
while(pb && pb.C){if(pb.C.tree[0].type=='def'){this.inside_function=true
break}
pb=pb.parent_block}
this.module=scope.module
this.root=get_module(this)
this.positional_list=[]
this.default_list=[]
this.other_args=null
this.other_kw=null
this.after_star=[]}
DefCtx.prototype.ast=function(){var args={posonlyargs:[],args:[],kwonlyargs:[],kw_defaults:[],defaults:[],type_params:[]},decorators=get_decorators(this.parent.node),func_args=this.tree[1],state='arg',default_value,res
args=func_args.ast()
if(this.async){res=new ast.AsyncFunctionDef(this.name,args,[],decorators)}else{res=new ast.FunctionDef(this.name,args,[],decorators)}
if(this.annotation){res.returns=this.annotation.tree[0].ast()}
if(this.type_params){res.type_params=this.type_params.ast()}
res.body=ast_body(this.parent)
set_position(res,this.position)
return res}
DefCtx.prototype.set_name=function(name){if(["None","True","False"].indexOf(name)>-1){raise_syntax_error(this)}
var id_ctx=new IdCtx(this,name)
this.name=name
this.id=this.scope.id+'_'+name
this.id=this.id.replace(/\./g,'_')
this.id+='_'+$B.UUID()
this.parent.node.id=this.id
this.parent.node.module=this.module}
DefCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'id':
if(C.name){raise_syntax_error(C)}
C.set_name(value)
return C
case '(':
if(C.name==null){raise_syntax_error(C,"missing name in function definition")}
C.has_args=true;
return new FuncArgs(C)
case '[':
if(C.name===undefined){raise_syntax_error(C,'missing function name')}
return new TypeParamsCtx(C)
case ')':
return C
case 'annotation':
return new AbstractExprCtx(new AnnotationCtx(C),true)
case ':':
if(C.has_args){return BodyCtx(C)}else{raise_syntax_error(C,"missing function parameters")}
case 'eol':
if(C.has_args){raise_syntax_error(C,"expected ':'")}}
raise_syntax_error(C)}
var DelCtx=$B.parser.DelCtx=function(C){
this.type='del'
this.parent=C
C.tree.push(this)
this.tree=[]
this.position=$token.value}
DelCtx.prototype.ast=function(){var targets
if(this.tree[0].type=='list_or_tuple'){
targets=this.tree[0].tree.map(x=> x.ast())}else if(this.tree[0].type=='expr' &&
this.tree[0].tree[0].type=='list_or_tuple'){
targets=this.tree[0].tree[0].ast()
targets.ctx=new ast.Del()
for(var elt of targets.elts){elt.ctx=new ast.Del()}
var ast_obj=new ast.Delete([targets])
set_position(ast_obj,this.position)
return ast_obj}else{targets=[this.tree[0].tree[0].ast()]}
for(var target of targets){target.ctx=new ast.Del()}
var ast_obj=new ast.Delete(targets)
set_position(ast_obj,this.position)
return ast_obj}
DelCtx.prototype.transition=function(token,value){var C=this
if(token=='eol'){check_assignment(this.tree[0],{action:'delete'})
return transition(C.parent,token)}
raise_syntax_error(C)}
var DictCompCtx=function(C){
if(C.tree[0].type=='expr' &&
C.tree[0].tree[0].comprehension){
var comp=C.tree[0].tree[0]
comp.parent_block=this}
this.type='dictcomp'
this.position=$token.value
this.comprehension=true
this.parent=C.parent
this.key=C.tree[0]
this.value=C.tree[1]
this.key.parent=this
this.value.parent=this
this.tree=[]
this.id='dictcomp'+$B.UUID()
this.parent_block=get_scope(C)
this.module=get_module(C).module
C.parent.tree[C.parent.tree.length-1]=this
this.type='dictcomp'
Comprehension.make_comp(this,C)}
DictCompCtx.prototype.ast=function(){
if(this.value.ast===undefined){console.log('dict comp ast, no value.ast',this)}
var ast_obj=new ast.DictComp(
this.key.ast(),this.value.ast(),Comprehension.generators(this.tree)
)
set_position(ast_obj,this.position)
return ast_obj}
DictCompCtx.prototype.transition=function(token,value){var C=this
if(token=='}'){return this.parent}
raise_syntax_error(C)}
var DictOrSetCtx=$B.parser.DictOrSetCtx=function(C){
this.type='dict_or_set'
this.real='dict_or_set'
this.expect=','
this.closed=false
this.position=$token.value
this.nb_items=0
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this}
DictOrSetCtx.prototype.ast=function(){
var ast_obj
if(this.real=='dict'){var keys=[],values=[]
var t0=Date.now()
for(var i=0,len=this.items.length;i < len;i++){if(this.items[i].type=='expr' &&
this.items[i].tree[0].type=='kwd'){keys.push(_b_.None)
values.push(this.items[i].tree[0].tree[0].ast())}else{keys.push(this.items[i].ast())
values.push(this.items[i+1].ast())
i++}}
ast_obj=new ast.Dict(keys,values)}else if(this.real=='set'){var items=[]
for(var item of this.items){if(item.packed){var starred=new ast.Starred(item.ast(),new ast.Load())
set_position(starred,item.position)
items.push(starred)}else{items.push(item.ast())}}
ast_obj=new ast.Set(items)}
set_position(ast_obj,this.position)
return ast_obj}
DictOrSetCtx.prototype.transition=function(token,value){var C=this
if(C.closed){switch(token){case '[':
return new AbstractExprCtx(new SubscripCtx(C.parent),false)
case '(':
return new CallArgCtx(new CallCtx(C.parent))}
return transition(C.parent,token,value)}else{if(C.expect==','){function check_last(){var last=$B.last(C.tree),err_msg
if(last && last.wrong_assignment){
err_msg="invalid syntax. Maybe you meant '==' or ':=' instead of '='?"}else if(C.real=='dict' && last.type=='expr' &&
last.tree[0].type=='starred'){
err_msg='cannot use a starred expression in a dictionary value'}else if(C.real=='set' && last.tree[0].type=='kwd'){$token.value=last.position
raise_syntax_error(C)}
if(err_msg){raise_syntax_error_known_range(C,last.position,last_position(last),err_msg)}}
switch(token){case '}':
var last=$B.last(C.tree)
if(last.type=="expr" && last.tree[0].type=="kwd"){C.nb_items+=2}else if(last.type=="abstract_expr"){C.tree.pop()}else{C.nb_items++}
check_last()
C.end_position=$token.value
switch(C.real){case 'dict_or_set':
C.real=C.tree.length==0 ?
'dict' :'set'
case 'set':
C.items=C.tree
C.tree=[]
C.closed=true
return C
case 'dict':
if($B.last(C.tree).type=='abstract_expr'){raise_syntax_error(C,"expression expected after dictionary key and ':'")}else{if(C.nb_items % 2 !=0){raise_syntax_error(C,"':' expected after dictionary key")}}
C.items=C.tree
C.tree=[]
C.closed=true
return C}
raise_syntax_error(C)
case ',':
check_last()
var last=$B.last(C.tree)
if(last.type=="expr" && last.tree[0].type=="kwd"){C.nb_items+=2}else{C.nb_items++}
if(C.real=='dict_or_set'){var last=C.tree[0]
C.real=(last.type=='expr' &&
last.tree[0].type=='kwd')? 'dict' :'set'}
if(C.real=='dict' && C.nb_items % 2){raise_syntax_error(C,"':' expected after dictionary key")}
return new AbstractExprCtx(C,false)
case ':':
if(C.real=='dict_or_set'){C.real='dict'}
if(C.real=='dict'){C.expect='value'
this.nb_items++
C.value_pos=$token.value
return C}else{raise_syntax_error(C)}
case 'for':
if(C.real=="set" && C.tree.length > 1){$token.value=C.tree[0].position
raise_syntax_error(C,"did you forget "+
"parentheses around the comprehension target?")}
var expr=C.tree[0],err_msg
if(expr.type=='expr'){if(expr.tree[0].type=='kwd'){err_msg='dict unpacking cannot be used in dict comprehension'}else if(expr.tree[0].type=='starred'){err_msg='iterable unpacking cannot be used in comprehension'}
if(err_msg){raise_syntax_error_known_range(C,expr.position,last_position(expr),err_msg)}}
if(C.real=='dict_or_set'){return new TargetListCtx(new ForExpr(
new SetCompCtx(this)))}else{return new TargetListCtx(new ForExpr(
new DictCompCtx(this)))}}
raise_syntax_error(C)}else if(C.expect=='value'){if(python_keywords.indexOf(token)>-1){var ae=new AbstractExprCtx(C,false)
try{transition(ae,token,value)
C.tree.pop()}catch(err){raise_syntax_error(C)}}
try{C.expect=','
return transition(new AbstractExprCtx(C,false),token,value)}catch(err){$token.value=C.value_pos
raise_syntax_error(C,"expression expected after "+
"dictionary key and ':'")}}
return transition(C.parent,token,value)}}
var DoubleStarArgCtx=$B.parser.DoubleStarArgCtx=function(C){
this.type='double_star_arg'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this}
DoubleStarArgCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'id':
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
return transition(new AbstractExprCtx(C,false),token,value)
case ',':
case ')':
return transition(C.parent,token)
case ':':
if(C.parent.parent.type=='lambda'){return transition(C.parent.parent,token)}}
raise_syntax_error(C)}
var EllipsisCtx=$B.parser.EllipsisCtx=function(C){
this.type='ellipsis'
this.parent=C
this.position=$token.value
C.tree[C.tree.length]=this}
EllipsisCtx.prototype.ast=function(){var ast_obj=new ast.Constant(_b_.Ellipsis)
set_position(ast_obj,this.position)
return ast_obj}
EllipsisCtx.prototype.transition=function(token,value){var C=this
return transition(C.parent,token,value)}
var EndOfPositionalCtx=$B.parser.$EndOfConditionalCtx=function(C){
this.type="end_positional"
this.parent=C
C.has_end_positional=true
C.parent.pos_only=C.tree.length
C.tree.push(this)}
EndOfPositionalCtx.prototype.transition=function(token,value){var C=this
if(token=="," ||token==")"){return transition(C.parent,token,value)}
raise_syntax_error(C)}
var ExceptCtx=$B.parser.ExceptCtx=function(C){
this.type='except'
this.position=$token.value
this.parent=C
C.tree[C.tree.length]=this
this.tree=[]
this.scope=get_scope(this)
var node=C.node,rank=node.parent.children.indexOf(node),ix=rank-1
while(node.parent.children[ix].C.tree[0].type !='try'){ix--}
this.try_node=node.parent.children[ix]
this.is_first_child=rank==ix+1
if(this.try_node.C.is_trystar){this.expect='*'}else{this.expect='id'}}
ExceptCtx.prototype.ast=function(){
var ast_obj=new ast.ExceptHandler(
this.tree.length==1 ? this.tree[0].ast():undefined,this.has_alias ? this.tree[0].alias :undefined,ast_body(this.parent)
)
set_position(ast_obj,this.position)
return ast_obj}
ExceptCtx.prototype.transition=function(token,value){var C=this
if(token=='op' && value=='*'){
if(C.is_first_child){
C.try_node.C.is_trystar=true
C.expect='id'
return C}else if(! C.expect=='*'){
raise_syntax_error(C,"cannot have both 'except' and 'except*' "+
"on the same 'try'")}else{C.expect='id'
return C}}else if(C.expect=='*'){
raise_syntax_error(C,"cannot have both 'except' and 'except*' "+
"on the same 'try'")}
switch(token){case 'id':
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
if(C.expect=='id'){C.expect='as'
return transition(new AbstractExprCtx(C,false),token,value)}
case 'as':
if(C.expect=='as' &&
C.has_alias===undefined){C.expect='alias'
C.has_alias=true
return C}
case 'id':
if(C.expect=='alias'){C.expect=':'
C.set_alias(value)
return C}
break
case ':':
var _ce=C.expect
if(_ce=='id' ||_ce=='as' ||_ce==':'){return BodyCtx(C)}
break
case '(':
if(C.expect=='id' && C.tree.length==0){C.parenth=true
return C}
break
case ')':
if(C.expect==',' ||C.expect=='as'){C.expect='as'
return C}
case ',':
if(C.parenth !==undefined &&
C.has_alias===undefined &&
(C.expect=='as' ||C.expect==',')){C.expect='id'
return C}else if(C.parenth===undefined){raise_syntax_error(C,"multiple exception types must be parenthesized")}
case 'eol':
raise_syntax_error(C,"expected ':'")}
raise_syntax_error(C)}
ExceptCtx.prototype.set_alias=function(alias){this.tree[0].alias=mangle_name(alias,this)}
var ExprCtx=$B.parser.ExprCtx=function(C,name,with_commas){
this.type='expr'
this.name=name
this.position=$token.value 
this.with_commas=with_commas
this.expect=',' 
this.parent=C
if(C.packed){this.packed=C.packed}
this.tree=[]
C.tree[C.tree.length]=this}
ExprCtx.prototype.ast=function(){var res=this.tree[0].ast()
if(this.packed){}else if(this.annotation){res=new ast.AnnAssign(
res,this.annotation.tree[0].ast(),undefined,this.$was_parenthesized ? 0 :1)
set_position(res,this.position)}
return res}
ExprCtx.prototype.transition=function(token,value){var C=this
if(python_keywords.indexOf(token)>-1 &&
['as','else','if','for','from','in'].indexOf(token)==-1){raise_syntax_error(C)}
if(C.parent.expect=='star_target'){if(['pass','in','not','op','augm_assign','=',':=','if','eol'].
indexOf(token)>-1){return transition(C.parent,token,value)}}
switch(token){case 'bytes':
case 'float':
case 'id':
case 'imaginary':
case 'int':
case 'lambda':
case 'pass':
var msg='invalid syntax. Perhaps you forgot a comma?'
raise_syntax_error_known_range(C,this.position,$token.value,msg)
break
case '{':
if(C.tree[0].type !="id" ||
["print","exec"].indexOf(C.tree[0].value)==-1){raise_syntax_error(C)}
return new AbstractExprCtx(new DictOrSetCtx(C),false)
case '[':
case '(':
case '.':
case 'not':
if(C.expect=='expr'){C.expect=','
return transition(new AbstractExprCtx(C,false),token,value)}}
switch(token){case 'not':
if(C.expect==','){return new ExprNot(C)}
break
case 'in':
if(C.parent.type=='target_list'){
return transition(C.parent,token)}
if(C.expect==','){return transition(C,'op','in')}
case ',':
if(C.expect==','){if(C.name=='iterator' &&
C.parent.parent.type !='node'){
var for_expr=C.parent.parent
raise_syntax_error_known_range(C,first_position(for_expr),last_position(for_expr),'Generator expression must be parenthesized')}
if(C.with_commas ||
["assign","return"].indexOf(C.parent.type)>-1){if(parent_match(C,{type:"yield","from":true})){raise_syntax_error(C,"no implicit tuple for yield from")}
C.parent.tree.pop()
var tuple=new ListOrTupleCtx(C.parent,'tuple')
tuple.implicit=true
tuple.has_comma=true
tuple.tree=[C]
C.parent=tuple
return tuple}}
return transition(C.parent,token)
case '.':
return new AttrCtx(C)
case '[':
if(C.tree[0].type=='id'){
delete C.tree[0].bound}
return new AbstractExprCtx(new SubscripCtx(C),true)
case '(':
return new CallCtx(C)
case 'op':
if($op_weight[value]===undefined){
var frs=parent_match(C,{type:"fstring_replacement_field"})
if(frs){return transition(frs,token,value)}
raise_syntax_error(C)}
if(C.parent.type=='withitem' && C.parent.tree.length==2){raise_syntax_error(C,"expected ':'")}
if(value=='~'){raise_syntax_error(C)}
var op_parent=C.parent,op=value
if(op_parent.type=='ternary' && op_parent.in_else){var new_op=new OpCtx(C,op)
return new AbstractExprCtx(new_op,false)}
var op1=C.parent,repl=null
while(1){if(op1.type=='unary' && op !=='**'){repl=op1
op1=op1.parent}else if(op1.type=='expr'){op1=op1.parent}else if(op1.type=='op' &&
$op_weight[op1.op]>=$op_weight[op]&&
!(op1.op=='**' && op=='**')){
repl=op1
op1=op1.parent}else if(op1.type=="not" &&
$op_weight['not']> $op_weight[op]){repl=op1
op1=op1.parent}else{break}}
if(repl===null){if(op1.type=='op'){
var right=op1.tree.pop(),expr=new ExprCtx(op1,'operand',C.with_commas)
expr.tree.push(right)
right.parent=expr
var new_op=new OpCtx(expr,op)
return new AbstractExprCtx(new_op,false)}
var position=C.position
while(C.parent !==op1){C=C.parent
op_parent=C.parent}
C.parent.tree.pop()
var expr=new ExprCtx(op_parent,'operand',C.with_commas)
expr.position=position
expr.expect=','
C.parent=expr
var new_op=new OpCtx(C,op)
return new AbstractExprCtx(new_op,false)}else{
if(op==='and' ||op==='or'){while(repl.parent.type=='not' ||
(repl.parent.type=='expr' &&
repl.parent.parent.type=='not')){
repl=repl.parent
op_parent=repl.parent}}}
if(repl.type=='op'){var _flag=false
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
case 'in':
case 'not_in':
repl.ops=repl.ops ||[repl.op]
repl.ops.push(op)
return new AbstractExprCtx(repl,false)}}}
repl.parent.tree.pop()
var expr=new ExprCtx(repl.parent,'operand',false)
expr.tree=[op1]
expr.position=op1.position
repl.parent=expr
var new_op=new OpCtx(repl,op)
return new AbstractExprCtx(new_op,false)
case 'augm_assign':
check_assignment(C,{augmented:true})
var parent=C
while(parent){if(parent.type=="assign" ||parent.type=="augm_assign"){raise_syntax_error(C,"augmented assignment inside assignment")}else if(parent.type=="op"){raise_syntax_error(C,"cannot assign to operator")}else if(parent.type=="list_or_tuple"){raise_syntax_error(C,`'${parent.real}' is an illegal`+
" expression for augmented assignment")}else if(['list','tuple'].indexOf(parent.name)>-1){raise_syntax_error(C,`'${parent.name}' is an illegal`+
" expression for augmented assignment")}else if(['dict_or_set'].indexOf(parent.name)>-1){raise_syntax_error(C,`'${parent.tree[0].real } display'`+
" is an illegal expression for augmented assignment")}
parent=parent.parent}
if(C.expect==','){return new AbstractExprCtx(
new AugmentedAssignCtx(C,value),true)}
return transition(C.parent,token,value)
case ":":
if(C.parent.type=="sub" ||
(C.parent.type=="list_or_tuple" &&
C.parent.parent.type=="sub")){return new AbstractExprCtx(new SliceCtx(C.parent),false)}else if(C.parent.type=="slice"){return transition(C.parent,token,value)}else if(C.parent.type=="node"){
if(C.tree.length==1){var child=C.tree[0]
check_assignment(child)
if(["id","sub","attribute"].indexOf(child.type)>-1){return new AbstractExprCtx(new AnnotationCtx(C),false)}else if(child.real=="tuple" && child.expect=="," &&
child.tree.length==1){return new AbstractExprCtx(new AnnotationCtx(child.tree[0]),false)}}
var type=C.tree[0].real
raise_syntax_error_known_range(C,C.position,last_position(C),`only single target (not ${type}) can be annotated`)}
break
case '=':
var frs=parent_match(C,{type:'fstring_replacement_field'})
if(frs){return transition(frs,token,value)}
var call_arg=parent_match(C,{type:'call_arg'})
try{check_assignment(C)}catch(err){if(call_arg){var ctx=C
while(ctx.parent !==call_arg){ctx=ctx.parent}
raise_syntax_error_known_range(ctx,ctx.position,$token.value,'expression cannot contain assignment, perhaps you meant "=="?')}else{throw err}}
var annotation
if(C.expect==','){if(C.parent.type=="call_arg"){
if(C.tree[0].type !="id"){raise_syntax_error_known_range(C,C.position,$token.value,'expression cannot contain assignment, perhaps you meant "=="?')}
return new AbstractExprCtx(new KwArgCtx(C),true)}else if(annotation=parent_match(C,{type:"annotation"})){return transition(annotation,token,value)}else if(C.parent.type=="op"){
raise_syntax_error(C,"cannot assign to operator")}else if(C.parent.type=="not"){
raise_syntax_error(C,"cannot assign to operator")}else if(C.parent.type=="with"){raise_syntax_error(C,"expected :")}else if(C.parent.type=='dict_or_set'){if(C.parent.expect==','){
C.wrong_assignment=true
return transition(C,':=')}}else if(C.parent.type=="list_or_tuple"){
for(var i=0;i < C.parent.tree.length;i++){var item=C.parent.tree[i]
try{check_assignment(item,{once:true})}catch(err){console.log(C)
raise_syntax_error(C,"invalid syntax. "+
"Maybe you meant '==' or ':=' instead of '='?")}
if(item.type=="expr" && item.name=="operand"){raise_syntax_error(C,"cannot assign to operator")}}
if(C.parent.real=='list' ||
(C.parent.real=='tuple' &&
! C.parent.implicit)){raise_syntax_error(C,"invalid syntax. "+
"Maybe you meant '==' or ':=' instead of '='?")}}else if(C.parent.type=="expr" &&
C.parent.name=="iterator"){raise_syntax_error(C,'expected :')}else if(C.parent.type=="lambda"){if(C.parent.parent.parent.type !="node"){raise_syntax_error(C,'expression cannot contain'+
' assignment, perhaps you meant "=="?')}}else if(C.parent.type=='target_list'){raise_syntax_error(C,"(assign to target in iteration)")}
while(C.parent !==undefined){C=C.parent
if(C.type=="condition"){raise_syntax_error(C,"invalid syntax. Maybe you"+
" meant '==' or ':=' instead of '='?")}else if(C.type=="augm_assign"){raise_syntax_error(C,"(assignment inside augmented assignment)")}}
C=C.tree[0]
return new AbstractExprCtx(new AssignCtx(C),true)}
break
case ':=':
var ptype=C.parent.type
if(["node","assign","kwarg","annotation"].
indexOf(ptype)>-1){raise_syntax_error(C,'(:= invalid, parent '+ptype+')')}else if(ptype=="func_arg_id" &&
C.parent.tree.length > 0){
raise_syntax_error(C,'(:= invalid, parent '+ptype+')')}else if(ptype=="call_arg" &&
C.parent.parent.type=="call" &&
C.parent.parent.parent.type=="lambda"){
raise_syntax_error(C,'(:= invalid inside function arguments)' )}
if(C.tree.length==1 && C.tree[0].type=="id"){var scope=get_scope(C),name=C.tree[0].value
if(['None','True','False'].indexOf(name)>-1){raise_syntax_error(C,`cannot use assignment expressions with ${name}`)}else if(name=='__debug__'){raise_syntax_error(C,'cannot assign to __debug__')}
while(scope.comprehension){scope=scope.parent_block}
return new AbstractExprCtx(new NamedExprCtx(C),false)}
raise_syntax_error(C)
case 'if':
var in_comp=false,ctx=C.parent
while(ctx){if(ctx.comprehension){in_comp=true
break}else if(ctx.type=="list_or_tuple"){
break}else if(ctx.type=='comp_for'){break}else if(ctx.type=='comp_if'){
in_comp=true
break}else if(ctx.type=='call_arg' ||ctx.type=='sub'){
break}else if(ctx.type=='expr'){if(ctx.parent.type=='comp_iterable'){
in_comp=true
break}}
ctx=ctx.parent}
if(in_comp){break}
var ctx=C
while(ctx.parent &&
(ctx.parent.type=='op' ||
ctx.parent.type=='not' ||
ctx.parent.type=='unary' ||
(ctx.parent.type=="expr" && ctx.parent.name=="operand"))){ctx=ctx.parent}
return new AbstractExprCtx(new TernaryCtx(ctx),false)
case 'JoinedStr':
if(C.tree.length==1 && C.tree[0]instanceof FStringCtx){var fstring=C.tree[0]
return fstring}else{var msg='invalid syntax. Perhaps you forgot a comma?'
raise_syntax_error_known_range(C,this.position,$token.value,msg)}
break
case 'str':
if(C.tree.length==1 && C.tree[0]instanceof FStringCtx){var fstring=C.tree[0]
new StringCtx(fstring,value)
return C}else{var msg='invalid syntax. Perhaps you forgot a comma?'
raise_syntax_error_known_range(C,this.position,$token.value,msg)}
break
case 'eol':
if(C.tree.length==2 &&
C.tree[0].type=="id" &&
["print","exec"].indexOf(C.tree[0].value)>-1){var func=C.tree[0].value
raise_syntax_error_known_range(C,C.position,$token.value,"Missing parentheses in call "+
`to '${func}'. Did you mean ${func}(...)?`)}
if(["dict_or_set","list_or_tuple","str"].indexOf(C.parent.type)==-1){var t=C.tree[0]
if(t.type=="starred"){$token.value=t.position
if(parent_match(C,{type:'del'})){raise_syntax_error(C,'cannot delete starred')}
raise_syntax_error_known_range(C,t.position,last_position(t),"can't use starred expression here")}else if(t.type=="call" && t.func.type=="starred"){$token.value=t.func.position
raise_syntax_error(C,"can't use starred expression here")}}}
return transition(C.parent,token)}
var ExprNot=$B.parser.ExprNot=function(C){
this.type='expr_not'
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this}
ExprNot.prototype.transition=function(token,value){var C=this
if(token=='in'){
C.parent.tree.pop()
var op1=C.parent
while(op1.type !=='expr'){op1=op1.parent}
return op1.transition('op','not_in')}
raise_syntax_error(C)}
var ForExpr=$B.parser.ForExpr=function(C){
if(C.node && C.node.parent.is_comp){
C.node.parent.first_for=this}
this.type='for'
this.parent=C
this.tree=[]
this.position=$token.value
C.tree.push(this)
this.scope=get_scope(this)
this.module=this.scope.module}
ForExpr.prototype.ast=function(){
var target=this.tree[0].ast(),iter=this.tree[1].ast(),orelse=this.orelse ? this.orelse.ast():[],type_comment,body=ast_body(this.parent)
set_ctx_to_store(target)
var klass=this.async ? ast.AsyncFor :ast.For
var ast_obj=new klass(target,iter,body,orelse,type_comment)
set_position(ast_obj,this.async ? this.async.position :this.position,last_position(this))
return ast_obj}
ForExpr.prototype.transition=function(token,value){var C=this
switch(token){case 'in':
if(C.tree[0].tree.length==0){
raise_syntax_error(C,"(missing target between 'for' and 'in')")}
check_assignment(C.tree[0])
return new AbstractExprCtx(
new ExprCtx(C,'iterator',true),false)
case ':':
check_assignment(C.tree[0])
if(C.tree.length < 2 
||C.tree[1].tree[0].type=="abstract_expr"){raise_syntax_error(C)}
return BodyCtx(C)}
if(this.parent.comprehension){switch(token){case ']':
if(this.parent.type=='listcomp'){return transition(this.parent,token,value)}
break
case ')':
if(this.parent.type=='genexpr'){return transition(this.parent,token,value)}
break
case '}':
if(this.parent.type=='dictcomp' ||
this.parent.type=='setcomp'){return transition(this.parent,token,value)}
break
case 'for':
return new TargetListCtx(new ForExpr(this.parent))
case 'if':
var if_ctx=new ConditionCtx(this.parent,'if')
if_ctx.in_comp=this.parent
return new AbstractExprCtx(if_ctx,false)}}
if(token=='eol'){$token.value=last_position(C)
if(C.tree.length==2){raise_syntax_error(C,"expected ':'")}}
raise_syntax_error(C)}
var FromCtx=$B.parser.FromCtx=function(C){
this.type='from'
this.parent=C
this.module=''
this.names=[]
this.names_position=[]
this.position=$token.value
C.tree[C.tree.length]=this
this.expect='module'
this.scope=get_scope(this)}
FromCtx.prototype.ast=function(){
var module=this.module,level=0,alias
while(module.length > 0 && module.startsWith('.')){level++
module=module.substr(1)}
var res={module:module ||undefined,names:[],level}
for(var i=0,len=this.names.length;i < len;i++){var name=this.names[i],position=this.names_position[i]
if(Array.isArray(name)){alias=new ast.alias(name[0],name[1])}else{alias=new ast.alias(name)}
set_position(alias,position)
res.names.push(alias)}
var ast_obj=new ast.ImportFrom(res.module,res.names,res.level)
set_position(ast_obj,this.position)
return ast_obj}
FromCtx.prototype.add_name=function(name){this.names.push(name)
this.names_position.push($token.value)
if(name=='*'){this.scope.blurred=true}
this.end_position=$token.value}
FromCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'id':
if(C.expect=='module'){C.module+=value
return C}else if(C.expect=='id'){C.add_name(value)
C.expect=','
return C}else if(C.expect=='alias'){C.names[C.names.length-1]=
[$B.last(C.names),value]
C.expect=','
return C}
break
case '.':
if(C.expect=='module'){if(token=='id'){C.module+=value}
else{C.module+='.'}
return C}
break
case 'ellipsis':
if(C.expect=='module'){C.module+='...'
return C}
break
case 'import':
if(C.names.length > 0){
raise_syntax_error(C,"only one 'import' allowed after 'from'")}
if(C.expect=='module'){C.expect='id'
return C}
case 'op':
if(value=='*' && C.expect=='id'
&& C.names.length==0){if(get_scope(C).ntype !=='module'){raise_syntax_error(C,"import * only allowed at module level")}
C.add_name('*')
C.expect='eol'
return C}else{raise_syntax_error(C)}
case ',':
if(C.expect==','){C.expect='id'
return C}
case 'eol':
switch(C.expect){case ',':
case 'eol':
return transition(C.parent,token)
case 'id':
raise_syntax_error(C,'trailing comma not allowed without '+
'surrounding parentheses')
default:
raise_syntax_error(C)}
case 'as':
if(C.expect==',' ||C.expect=='eol'){C.expect='alias'
return C}
case '(':
if(C.expect=='id'){C.expect='id'
return C}
case ')':
if(C.expect==',' ||C.expect=='id'){C.expect='eol'
return C}}
raise_syntax_error(C)}
function escape_quotes(s,quotes){if(quotes.length==1){return quotes+s+quotes}else{var quote=quotes[0]
return quote+s.replace(new RegExp(quote,'g'),'\\'+quote)+quote}}
var FStringCtx=$B.parser.FStringCtx=function(C,start){
for(var i=0;i < start.length;i++){if(start[i]=='"' ||start[i]=="'"){this.prefix=start.substr(0,i)
this.quotes=start.substr(i)
break}}
this.type='fstring'
this.parent=C
this.tree=[]
this.position=$token.value
this.scope=get_scope(C)
C.tree.push(this)
this.raw=this.prefix.toLowerCase().indexOf('r')>-1}
FStringCtx.prototype.transition=function(token,value){var C=this
if(token=='middle'){new StringCtx(C,escape_quotes(value,this.quotes))
return C}else if(token=='{'){return new AbstractExprCtx(new FStringReplacementFieldCtx(C),false)}else if(token=='end'){return C.parent}
raise_syntax_error(C)}
FStringCtx.prototype.ast=function(){var res={type:'JoinedStr',values:[]}
var state
for(var item of this.tree){if(item instanceof StringCtx){if(state=='string'){
$B.last(res.values).value+=item.value}else{var item_ast=new ast.Constant(item.value)
set_position(item_ast,item.position)
res.values.push(item_ast)}
state='string'}else{var item_ast=item.ast()
set_position(item_ast,item.position)
res.values.push(item_ast)
state='formatted_value'}}
var ast_obj=new ast.JoinedStr(res.values)
set_position(ast_obj,this.position)
return ast_obj}
var FStringReplacementFieldCtx=
$B.parser.FStringReplacementFieldCtx=function(C){this.type='fstring_replacement_field'
this.tree=[]
this.parent=C
this.position=$token.value
C.tree.push(this)}
FStringReplacementFieldCtx.prototype.transition=function(token,value){var C=this
if(token=='='){if(C.equal_sign_pos){raise_syntax_error(C)}
var expr_text=C.position.line.substring(
C.position.start[1]+1,$token.value.start[1])
var quotes=C.parent.quotes
C.formula=new StringCtx(C.parent,escape_quotes(expr_text+'=',quotes))
var s=C.parent.tree.pop()
C.parent.tree.splice(C.parent.tree.length-1,0,s)
C.equal_sign_pos=$token.value.start
return C}else if(C.equal_sign_pos){
if(! C.insert_whitespace){var nb_ws=$token.value.start[1]-C.equal_sign_pos[1]
if(nb_ws > 1){C.formula.value+=' '.repeat(nb_ws-1)}
C.insert_whitespace=true}}
if(token=='op' && value=='!'){C.expect='id'
return C}else if(token==':'){return new FStringFormatSpecCtx(C)}else if(token=='}'){if(C.tree.length==1 &&
C.tree[0]instanceof AbstractExprCtx){raise_syntax_error(C,"f-string: valid expression required before '}'")}
return C.parent}else if(token=='id' && this.expect=='id'){if('sra'.indexOf(value)>-1){C.conversion=value
delete this.expect
return C}
raise_syntax_error(C,`unknown conversion type ${value}`)}
raise_syntax_error(C)}
FStringReplacementFieldCtx.prototype.ast=function(){var value=this.tree[0].ast(),format=this.tree[1]
var conv_num={a:97,r:114,s:115},conversion=conv_num[this.conversion]||-1
if(format !==undefined){format=format.ast()}
var res=new ast.FormattedValue(
value,conversion,format)
set_position(res,this.position)
return res}
var FStringFormatSpecCtx=
$B.parser.FStringFormatSpecCtx=function(C){this.type='fstring_format_spec'
this.tree=[]
this.parent=C
this.position=$token.value
C.tree.push(this)}
FStringFormatSpecCtx.prototype.transition=function(token,value){var C=this
if(token=='middle'){var quotes=this.parent.parent.quotes
new StringCtx(C,escape_quotes(value,quotes))
return C}else if(token=='{'){return new AbstractExprCtx(new FStringReplacementFieldCtx(C),false)}else if(token=='}'){return transition(C.parent,token,value)}
raise_syntax_error(C)}
FStringFormatSpecCtx.prototype.ast=function(){if(this.tree.length==1){return this.tree[0].ast()}else{return FStringCtx.prototype.ast.call(this)}}
var FuncArgs=$B.parser.FuncArgs=function(C){
this.type='func_args'
this.parent=C
this.tree=[]
this.names=[]
C.tree[C.tree.length]=this
this.expect='id'
this.has_default=false
this.has_star_arg=false
this.has_kw_arg=false}
FuncArgs.prototype.ast=function(){var args={posonlyargs:[],args:[],kwonlyargs:[],kw_defaults:[],defaults:[]},state='arg',default_value
for(var arg of this.tree){if(arg.type=='end_positional'){args.posonlyargs=args.args
args.args=[]}else if(arg.type=='func_star_arg'){state='kwonly'
if(arg.op=='*' && arg.name !='*'){args.vararg=new ast.arg(arg.name)
if(arg.annotation){args.vararg.annotation=arg.annotation.tree[0].ast()}
set_position(args.vararg,arg.position)}else if(arg.op=='**'){args.kwarg=new ast.arg(arg.name)
if(arg.annotation){args.kwarg.annotation=arg.annotation.tree[0].ast()}
set_position(args.kwarg,arg.position)}}else{default_value=false
if(arg.has_default){default_value=arg.tree[0].ast()}
var argument=new ast.arg(arg.name)
set_position(argument,arg.position,last_position(arg))
if(arg.annotation){argument.annotation=arg.annotation.tree[0].ast()}
if(state=='kwonly'){args.kwonlyargs.push(argument)
if(default_value){args.kw_defaults.push(default_value)}else{args.kw_defaults.push(_b_.None)}}else{args.args.push(argument)
if(default_value){args.defaults.push(default_value)}}}}
var res=new ast.arguments(args.posonlyargs,args.args,args.vararg,args.kwonlyargs,args.kw_defaults,args.kwarg,args.defaults)
return res}
FuncArgs.prototype.transition=function(token,value){var C=this
function check(){if(C.tree.length==0){return}
var last=$B.last(C.tree)
if(C.has_default && ! last.has_default){if(last.type=='func_star_arg' ||
last.type=='end_positional'){return}
if(C.has_star_arg){
return}
raise_syntax_error(C,'non-default argument follows default argument')}
if(last.has_default){C.has_default=true}}
function check_last(){var last=$B.last(C.tree)
if(last && last.type=="func_star_arg"){if(last.name=="*"){
raise_syntax_error(C,'named arguments must follow bare *')}}}
switch(token){case 'id':
if(C.has_kw_arg){raise_syntax_error(C,'duplicate keyword argument')}
if(C.expect=='id'){C.expect=','
if(C.names.indexOf(value)>-1){raise_syntax_error(C,'duplicate argument '+value+
' in function definition')}}
return new FuncArgIdCtx(C,value)
case ',':
if(C.expect==','){check()
C.expect='id'
return C}
raise_syntax_error(C)
case ')':
check()
check_last()
return transition(C.parent,token,value)
case 'op':
if(C.has_kw_arg){raise_syntax_error(C,"(unpacking after '**' argument)")}
var op=value
C.expect=','
if(op=='*'){if(C.has_star_arg){raise_syntax_error(C,"(only one '*' argument allowed)")}
return new FuncStarArgCtx(C,'*')}else if(op=='**'){return new FuncStarArgCtx(C,'**')}else if(op=='/'){
if(C.has_end_positional){raise_syntax_error(C,'/ may appear only once')}else if(C.has_star_arg){raise_syntax_error(C,'/ must be ahead of *')}
return new EndOfPositionalCtx(C)}
raise_syntax_error(C)
case ':':
if(C.parent.type=="lambda"){return transition(C.parent,token)}}
raise_syntax_error(C)}
var FuncArgIdCtx=$B.parser.FuncArgIdCtx=function(C,name){
this.type='func_arg_id'
if(["None","True","False"].indexOf(name)>-1){raise_syntax_error(C)}
if(name=='__debug__'){raise_syntax_error(C,'cannot assign to __debug__')}
this.name=name
this.parent=C
this.position=$token.value
if(C.has_star_arg){C.parent.after_star.push(name)}else{C.parent.positional_list.push(name)}
this.tree=[]
C.tree[C.tree.length]=this
this.expect='='}
FuncArgIdCtx.prototype.transition=function(token,value){var C=this
switch(token){case '=':
if(C.expect=='='){C.has_default=true
var def_ctx=C.parent.parent
if(C.parent.has_star_arg){def_ctx.default_list.push(def_ctx.after_star.pop())}else{def_ctx.default_list.push(def_ctx.positional_list.pop())}
return new AbstractExprCtx(C,false)}
break
case ',':
case ')':
if(C.parent.has_default && C.tree.length==0 &&
C.parent.has_star_arg===undefined){raise_syntax_error(C,'non-default argument follows default argument')}else{return transition(C.parent,token)}
case ':':
if(C.parent.parent.type=="lambda"){
return transition(C.parent.parent,":")}
if(C.has_default){
raise_syntax_error(C)}
return new AbstractExprCtx(new AnnotationCtx(C),false)}
raise_syntax_error(C)}
var FuncStarArgCtx=$B.parser.FuncStarArgCtx=function(C,op){
this.type='func_star_arg'
this.op=op
this.parent=C
this.node=get_node(this)
this.position=$token.value
C.has_star_arg=op=='*'
C.has_kw_arg=op=='**'
C.tree[C.tree.length]=this}
FuncStarArgCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'id':
if(C.name===undefined){if(C.parent.names.indexOf(value)>-1){raise_syntax_error(C,'duplicate argument '+value+
' in function definition')}}
if(["None","True","False"].indexOf(value)>-1){raise_syntax_error(C)}
C.set_name(value)
C.parent.names.push(value)
return C
case ',':
case ')':
if(C.name===undefined){
C.set_name('*')
C.parent.names.push('*')}
return transition(C.parent,token)
case ':':
if(C.parent.parent.type=="lambda"){
if(C.name===undefined){raise_syntax_error(C,'named arguments must follow bare *')}
return transition(C.parent.parent,":")}
if(C.name===undefined){raise_syntax_error(C,'(annotation on an unnamed parameter)')}
return new AbstractExprCtx(
new AnnotationCtx(C),false)}
raise_syntax_error(C)}
FuncStarArgCtx.prototype.set_name=function(name){if(name=='__debug__'){raise_syntax_error_known_range(this,this.position,$token.value,'cannot assign to __debug__')}
this.name=name
var ctx=this.parent
while(ctx.parent !==undefined){if(ctx.type=='def'){break}
ctx=ctx.parent}
if(this.op=='*'){ctx.other_args='"'+name+'"'}else{ctx.other_kw='"'+name+'"'}}
var GeneratorExpCtx=function(C){
this.type='genexpr'
this.tree=[C.tree[0]]
this.tree[0].parent=this
this.position=C.position
Comprehension.make_comp(this,C)}
GeneratorExpCtx.prototype.ast=function(){
var res=new ast.GeneratorExp(
this.tree[0].ast(),Comprehension.generators(this.tree.slice(1))
)
set_position(res,this.position)
return res}
GeneratorExpCtx.prototype.transition=function(token,value){var C=this
if(token==')'){if(this.parent.type=='call'){
if(C.parent.tree.length > 1){raise_syntax_error_known_range(C,first_position(C),last_position(C),'Generator expression must be parenthesized')}
return this.parent.parent}
return this.parent}
raise_syntax_error(C)}
var GlobalCtx=$B.parser.GlobalCtx=function(C){
this.type='global'
this.parent=C
this.tree=[]
this.position=$token.value
C.tree[C.tree.length]=this
this.expect='id'
this.scope=get_scope(this)
this.module=get_module(this)
if(this.module.module !=='<module>'){
while(this.module.module !=this.module.id){this.module=this.module.parent_block}}}
GlobalCtx.prototype.ast=function(){
var ast_obj=new ast.Global(this.tree.map(item=> item.value))
set_position(ast_obj,this.position)
return ast_obj}
GlobalCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'id':
if(C.expect=='id'){new IdCtx(C,value)
C.add(value)
C.expect=','
return C}
break
case ',':
if(C.expect==','){C.expect='id'
return C}
break
case 'eol':
if(C.expect==','){return transition(C.parent,token)}
break}
raise_syntax_error(C)}
GlobalCtx.prototype.add=function(name){if(this.scope.type=="module"){
return}
var mod=this.scope.parent_block
if(this.module.module.startsWith("$exec")){while(mod && mod.parent_block !==this.module){
mod._globals=mod._globals ||new Map()
mod._globals.set(name,this.module.id)
mod=mod.parent_block}}}
var IdCtx=$B.parser.IdCtx=function(C,value){
this.type='id'
this.value=value 
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
this.position=$token.value
var scope=this.scope=get_scope(this)
this.blurred_scope=this.scope.blurred
if(["def","generator"].indexOf(scope.ntype)>-1){if((!(C instanceof GlobalCtx))&&
!(C instanceof NonlocalCtx)){scope.referenced=scope.referenced ||{}
if(! $B.builtins[this.value]){scope.referenced[this.value]=true}}}
if(C.parent.type=='call_arg'){this.call_arg=true}}
IdCtx.prototype.ast=function(){var ast_obj
if(['True','False','None'].indexOf(this.value)>-1){ast_obj=new ast.Constant(_b_[this.value])}else{ast_obj=new ast.Name(this.value,this.bound ? new ast.Store():new ast.Load())}
set_position(ast_obj,this.position)
return ast_obj}
IdCtx.prototype.transition=function(token,value){var C=this,module=get_module(this)
if(C.value=='case' && C.parent.parent.type=="node"){
var save_position=module.token_reader.position,ends_with_comma=check_line(module.token_reader,module.filename)
module.token_reader.position=save_position
if(ends_with_comma){var node=get_node(C),parent=node.parent
if((! node.parent)||!(node.parent.is_match)){raise_syntax_error(C,"('case' not inside 'match')")}else{if(node.parent.irrefutable){
var name=node.parent.irrefutable,msg=name=='_' ? 'wildcard' :
`name capture '${name}'`
raise_syntax_error(C,`${msg} makes remaining patterns unreachable`)}}
return transition(new PatternCtx(
new CaseCtx(C.parent.parent)),token,value)}}else if(C.value=='match' && C.parent.parent.type=="node"){
var save_position=module.token_reader.position,ends_with_comma=check_line(module.token_reader,module.filename)
module.token_reader.position=save_position
if(ends_with_comma){return transition(new AbstractExprCtx(
new MatchCtx(C.parent.parent),true),token,value)}}else if(C.value=='type' && C.parent.parent.type=="node"){if(token=='id'){
return new TypeAliasCtx(C,value)}}
switch(token){case '=':
if(C.parent.type=='expr' &&
C.parent.parent !==undefined &&
C.parent.parent.type=='call_arg'){return new AbstractExprCtx(
new KwArgCtx(C.parent),false)}
return transition(C.parent,token,value)
case '.':
delete this.bound
return transition(C.parent,token,value)
case 'op':
return transition(C.parent,token,value)
case 'id':
case 'str':
case 'JoinedStr':
case 'int':
case 'float':
case 'imaginary':
if(["print","exec"].indexOf(C.value)>-1 ){var f=C.value,msg=`Missing parentheses in call to '${f}'.`+
` Did you mean ${f}(...)?`}else{var msg='invalid syntax. Perhaps you forgot a comma?'}
var call_arg=parent_match(C,{type:'call_arg'})
raise_syntax_error_known_range(C,this.position,$token.value,msg)}
if(this.parent.parent.type=="starred"){if(['.','[','('].indexOf(token)==-1){return this.parent.parent.transition(token,value)}}
return transition(C.parent,token,value)}
var ImportCtx=$B.parser.ImportCtx=function(C){
this.type='import'
this.parent=C
this.tree=[]
this.position=$token.value
C.tree[C.tree.length]=this
this.expect='id'}
ImportCtx.prototype.ast=function(){
var names=[]
for(var item of this.tree){
var alias=new ast.alias(item.name)
if(item.alias !=item.name){alias.asname=item.alias}
names.push(alias)}
var ast_obj=new ast.Import(names)
set_position(ast_obj,this.position)
return ast_obj}
ImportCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'id':
if(C.expect=='id'){if(C.order_error){raise_syntax_error(C,"Did you mean to use 'from ... import ...' instead?")}
new ImportedModuleCtx(C,value)
C.expect=','
return C}
if(C.expect=='qual'){C.expect=','
C.tree[C.tree.length-1].name+=
'.'+value
C.tree[C.tree.length-1].alias+=
'.'+value
return C}
if(C.expect=='alias'){C.expect=','
C.tree[C.tree.length-1].alias=
value
return C}
break
case '.':
if(C.expect==','){C.expect='qual'
return C}
break
case ',':
if(C.expect==','){C.expect='id'
return C}
break
case 'as':
if(C.expect==','){C.expect='alias'
return C}
break
case 'eol':
if(C.expect==','){return transition(C.parent,token)}
break
case 'from':
if(C.expect==','){C.expect='id'
C.order_error=true
return C}
break}
raise_syntax_error(C)}
var ImportedModuleCtx=$B.parser.ImportedModuleCtx=function(C,name){this.type='imported module'
this.parent=C
this.name=name
this.alias=name
C.tree[C.tree.length]=this}
ImportedModuleCtx.prototype.transition=function(token,value){var C=this}
var JoinedStrCtx=$B.parser.JoinedStrCtx=function(C,values){
this.type='JoinedStr'
this.parent=C
this.tree=[]
this.position=$token.value
this.scope=get_scope(C)
var line_num=get_node(C).line_num
for(var value of values){if(typeof value=="string"){new StringCtx(this,"'"+
value.replace(new RegExp("'","g"),"\\"+"'")+"'")}else{if(value.format !==undefined){value.format=new JoinedStrCtx(this,value.format)
this.tree.pop()}
var src=value.expression.trimStart(),
filename=get_module(this).filename,root=create_root_node(src,this.scope.module,this.scope.id,this.scope.parent_block,line_num)
try{dispatch_tokens(root)}catch(err){var fstring_lineno=this.position.start[0],fstring_offset=this.position.start[1]
err.filename=get_module(this).filename
err.lineno+=fstring_lineno-1
err.offset+=fstring_offset-1
err.end_lineno+=fstring_lineno-1
err.end_offset+=fstring_offset-1
err.text=this.position.string
err.args[1]=$B.fast_tuple([filename,err.lineno,err.offset,err.text,err.end_lineno,err.end_offset])
throw err}
var expr=root.children[0].C.tree[0]
this.tree.push(expr)
expr.parent=this
expr.elt=value}}
C.tree.push(this)
this.raw=false}
JoinedStrCtx.prototype.ast=function(){var res={type:'JoinedStr',values:[]}
var state
for(var item of this.tree){if(item instanceof StringCtx){if(state=='string'){
$B.last(res.values).value+=item.value}else{var item_ast=new ast.Constant(item.value)
set_position(item_ast,item.position)
res.values.push(item_ast)}
state='string'}else{var conv_num={a:97,r:114,s:115},format=item.elt.format
format=format===undefined ? format :format.ast()
var value=new ast.FormattedValue(
item.ast(),conv_num[item.elt.conversion]||-1,format)
set_position(value,this.position)
var format=item.format
if(format !==undefined){value.format=item.format.ast()}
res.values.push(value)
state='formatted_value'}}
var ast_obj=new ast.JoinedStr(res.values)
set_position(ast_obj,this.position)
return ast_obj}
JoinedStrCtx.prototype.transition=function(token,value){var C=this
switch(token){case '[':
return new AbstractExprCtx(new SubscripCtx(C.parent),false)
case '(':
C.parent.tree[0]=C
return new CallCtx(C.parent)
case 'str':
if(C.tree.length > 0 &&
$B.last(C.tree).type=="str"){C.tree[C.tree.length-1].add_value(value)}else{new StringCtx(this,value)}
return C
case 'JoinedStr':
var joined_expr=new JoinedStrCtx(C.parent,value)
C.parent.tree.pop()
if(C.tree.length > 0 &&
$B.last(C.tree)instanceof StringCtx &&
joined_expr.tree[0]instanceof StringCtx){
$B.last(C.tree).value+=joined_expr.tree[0].value
C.tree=C.tree.concat(joined_expr.tree.slice(1))}else{C.tree=C.tree.concat(joined_expr.tree)}
return C}
return transition(C.parent,token,value)}
var KwdCtx=$B.parser.KwdCtx=function(C){
this.type='kwd'
this.position=C.position
this.parent=C
this.tree=[]
C.tree.push(this)}
KwdCtx.prototype.ast=function(){var ast_obj=new $B.ast.keyword(this.tree[0].ast(),new ast.Load())
set_position(ast_obj,this.position)
return ast_obj}
KwdCtx.prototype.transition=function(token,value){var C=this
return transition(C.parent,token,value)}
var KwArgCtx=$B.parser.KwArgCtx=function(C){
this.type='kwarg'
this.parent=C.parent
this.position=first_position(C)
this.equal_sign_position=$token.value
this.tree=[C.tree[0]]
C.parent.tree.pop()
C.parent.tree.push(this)
C.parent.parent.has_kw=true}
KwArgCtx.prototype.transition=function(token,value){var C=this
if(token==','){return new CallArgCtx(C.parent.parent)}else if(token=='for'){
raise_syntax_error_known_range(C,C.position,C.equal_sign_position,"invalid syntax. "+
"Maybe you meant '==' or ':=' instead of '='?")}
return transition(C.parent,token)}
var LambdaCtx=$B.parser.LambdaCtx=function(C){
this.type='lambda'
this.parent=C
C.tree[C.tree.length]=this
this.tree=[]
this.position=$token.value
this.node=get_node(this)
this.positional_list=[]
this.default_list=[]
this.other_args=null
this.other_kw=null
this.after_star=[]}
LambdaCtx.prototype.ast=function(){
var args
if(this.args.length==0){args=new ast.arguments([],[],undefined,[],[],undefined,[])}else{args=this.args[0].ast()}
var ast_obj=new ast.Lambda(args,this.tree[0].ast())
set_position(ast_obj,this.position)
return ast_obj}
LambdaCtx.prototype.transition=function(token,value){var C=this
if(token==':' && C.args===undefined){C.args=C.tree
C.tree=[]
return new AbstractExprCtx(C,false)}
if(C.args !==undefined){
return transition(C.parent,token)}
if(C.args===undefined){if(token=='('){raise_syntax_error(C,'Lambda expression parameters cannot be parenthesized')}else if(C.tree.length > 0 &&
C.tree[0].type=='func_args'){
raise_syntax_error(C)}else{return transition(new FuncArgs(C),token,value)}}
raise_syntax_error(C)}
var ListCompCtx=function(C){
this.type='listcomp'
this.tree=[C.tree[0]]
this.tree[0].parent=this
this.position=$token.value
Comprehension.make_comp(this,C)}
ListCompCtx.prototype.ast=function(){
var res=new ast.ListComp(
this.tree[0].ast(),Comprehension.generators(this.tree.slice(1)))
set_position(res,this.position)
return res}
ListCompCtx.prototype.transition=function(token,value){var C=this
if(token==']'){return this.parent}
raise_syntax_error(C)}
var ListOrTupleCtx=$B.parser.ListOrTupleCtx=function(C,real){
this.type='list_or_tuple'
this.real=real
this.expect='id'
this.closed=false
this.parent=C
this.tree=[]
this.position=$token.value
C.tree[C.tree.length]=this}
ListOrTupleCtx.prototype.ast=function(){var elts=this.tree.map(x=> x.ast()),ast_obj
if(this.real=='list'){ast_obj=new ast.List(elts,new ast.Load())}else if(this.real=='tuple'){ast_obj=new ast.Tuple(elts,new ast.Load())}
set_position(ast_obj,this.position,this.end_position)
return ast_obj}
ListOrTupleCtx.prototype.transition=function(token,value){var C=this
if(C.closed){if(token=='['){return new AbstractExprCtx(
new SubscripCtx(C.parent),false)}
if(token=='('){return new CallCtx(C.parent)}
return transition(C.parent,token,value)}else{if(C.expect==','){switch(C.real){case 'tuple':
if(token==')'){if(C.implicit){return transition(C.parent,token,value)}
var close=true
C.end_position=$token.value
if(C.tree.length==1){if(parent_match(C,{type:'del'})&&
C.tree[0].type=='expr' &&
C.tree[0].tree[0].type=='starred'){raise_syntax_error_known_range(C,C.tree[0].tree[0].position,last_position(C.tree[0]),'cannot use starred expression here')}
var grandparent=C.parent.parent
grandparent.tree.pop()
grandparent.tree.push(C.tree[0])
C.tree[0].$was_parenthesized=true
C.tree[0].parent=grandparent
return C.tree[0]}
if(C.packed ||
(C.type=='list_or_tuple' &&
C.tree.length==1 &&
C.tree[0].type=='expr' &&
C.tree[0].tree[0].type=='starred')){
raise_syntax_error(C,"cannot use starred expression here")}
if(close){C.close()}
if(C.parent.type=="starred"){return C.parent.parent}
return C.parent}
break
case 'list':
if(token==']'){C.close()
if(C.parent.type=="starred"){if(C.parent.tree.length > 0){return C.parent.tree[0]}else{return C.parent.parent}}
return C.parent}
break}
switch(token){case ',':
if(C.real=='tuple'){C.has_comma=true}
C.expect='id'
return C
case 'for':
if(C.real=='list'){if(this.tree.length > 1){
raise_syntax_error(C,"did you forget "+
"parentheses around the comprehension target?")}
return new TargetListCtx(new ForExpr(
new ListCompCtx(C)))}
else{return new TargetListCtx(new ForExpr(
new GeneratorExpCtx(C)))}}
return transition(C.parent,token,value)}else if(C.expect=='id'){switch(C.real){case 'tuple':
if(token==')'){C.close()
return C.parent}
if(token=='eol' &&
C.implicit===true){C.close()
return transition(C.parent,token)}
break
case 'list':
if(token==']'){C.close()
return C}
break}
switch(token){case '=':
if(C.real=='tuple' &&
C.implicit===true){C.close()
C.parent.tree.pop()
var expr=new ExprCtx(C.parent,'tuple',false)
expr.tree=[C]
C.parent=expr
return transition(C.parent,token)}
raise_syntax_error(C,"(unexpected '=' inside list)")
break
case ')':
break
case ']':
if(C.real=='tuple' &&
C.implicit===true){
return transition(C.parent,token,value)}else{break}
raise_syntax_error(C,'(unexpected "if" inside list)')
case ',':
raise_syntax_error(C,'(unexpected comma inside list)')
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
C.expect=','
var expr=new AbstractExprCtx(C,false)
return transition(expr,token,value)
case 'op':
if('+-~*'.indexOf(value)>-1 ||value=='**'){C.expect=','
var expr=new AbstractExprCtx(C,false)
return transition(expr,token,value)}
raise_syntax_error(C,`(unexpected operator: ${value})`)
default:
raise_syntax_error(C)}}else{return transition(C.parent,token,value)}}}
ListOrTupleCtx.prototype.close=function(){this.closed=true
this.end_position=$token.value
this.src=get_module(this).src
for(var i=0,len=this.tree.length;i < len;i++){
var elt=this.tree[i]
if(elt.type=="expr" &&
elt.tree[0].type=="list_or_tuple" &&
elt.tree[0].real=="tuple" &&
elt.tree[0].tree.length==1 &&
elt.tree[0].expect==","){this.tree[i]=elt.tree[0].tree[0]
this.tree[i].parent=this}}}
var MatchCtx=$B.parser.MatchCtx=function(node_ctx){
this.type="match"
this.position=$token.value
node_ctx.tree=[this]
node_ctx.node.is_match=true
this.parent=node_ctx
this.tree=[]
this.expect='as'
this.token_position=get_module(this).token_reader.position}
MatchCtx.prototype.ast=function(){
var res=new ast.Match(this.tree[0].ast(),ast_body(this.parent))
set_position(res,this.position)
res.$line_num=get_node(this).line_num
return res}
MatchCtx.prototype.transition=function(token,value){var C=this
switch(token){case ':':
if(this.tree[0].type=='list_or_tuple'){remove_abstract_expr(this.tree[0].tree)}
switch(C.expect){case 'id':
case 'as':
case ':':
return BodyCtx(C)}
break
case 'eol':
raise_syntax_error(C,"expected ':'")}
raise_syntax_error(C)}
var NamedExprCtx=function(C){
this.type='named_expr'
this.position=C.position
this.target=C.tree[0]
C.tree.pop()
C.tree.push(this)
this.parent=C
this.target.parent=this
this.tree=[]
if(C.parent.type=='list_or_tuple' &&
C.parent.real=='tuple'){
this.parenthesized=true}}
NamedExprCtx.prototype.ast=function(){var res=new ast.NamedExpr(this.target.ast(),this.tree[0].ast())
res.target.ctx=new ast.Store()
set_position(res,this.position)
return res}
NamedExprCtx.prototype.transition=function(token,value){return transition(this.parent,token,value)}
var NodeCtx=$B.parser.NodeCtx=function(node){
this.node=node
node.C=this
this.tree=[]
this.type='node'
var scope=null
var tree_node=node
while(tree_node.parent && tree_node.parent.type !='module'){var ntype=tree_node.parent.C.tree[0].type,_break_flag=false
switch(ntype){case 'def':
case 'class':
case 'generator':
scope=tree_node.parent
_break_flag=true}
if(_break_flag){break}
tree_node=tree_node.parent}
if(scope===null){scope=tree_node.parent ||tree_node }
this.scope=scope}
NodeCtx.prototype.transition=function(token,value){var C=this
if(this.node.parent && this.node.parent.C){var pctx=this.node.parent.C
if(pctx.tree && pctx.tree.length==1 &&
pctx.tree[0].type=="match"){if(token !='eol' &&(token !=='id' ||value !=='case')){raise_syntax_error(C)}}}
if(this.tree.length==0 && this.node.parent){var rank=this.node.parent.children.indexOf(this.node)
if(rank > 0){var previous=this.node.parent.children[rank-1]
if(previous.C.tree[0].type=='try' &&
['except','finally'].indexOf(token)==-1){raise_syntax_error(C,"expected 'except' or 'finally' block")}}}
switch(token){case ',':
if(C.tree && C.tree.length==0){raise_syntax_error(C)}
var first=C.tree[0]
C.tree=[]
var implicit_tuple=new ListOrTupleCtx(C)
implicit_tuple.real="tuple"
implicit_tuple.implicit=0
implicit_tuple.tree.push(first)
first.parent=implicit_tuple
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
var expr=new AbstractExprCtx(C,true)
return transition(expr,token,value)
case 'assert':
return new AbstractExprCtx(
new AssertCtx(C),false,true)
case 'async':
return new AsyncCtx(C)
case 'await':
return new AbstractExprCtx(new AwaitCtx(C),false)
case 'break':
return new BreakCtx(C)
case 'class':
return new ClassCtx(C)
case 'continue':
return new ContinueCtx(C)
case 'def':
return new DefCtx(C)
case 'del':
return new AbstractExprCtx(new DelCtx(C),true)
case 'elif':
try{var previous=get_previous(C)}catch(err){raise_syntax_error(C,"('elif' does not follow 'if')")}
if(['condition'].indexOf(previous.type)==-1 ||
previous.token=='while'){raise_syntax_error(C,`(elif after ${previous.type})`)}
return new AbstractExprCtx(
new ConditionCtx(C,token),false)
case 'ellipsis':
var expr=new AbstractExprCtx(C,true)
return transition(expr,token,value)
case 'else':
var previous=get_previous(C)
if(['condition','except','for'].
indexOf(previous.type)==-1){raise_syntax_error(C,`(else after ${previous.type})`)}
return new SingleKwCtx(C,token)
case 'except':
var previous=get_previous(C)
if(['try','except'].indexOf(previous.type)==-1){raise_syntax_error(C,`(except after ${previous.type})`)}
return new ExceptCtx(C)
case 'finally':
var previous=get_previous(C)
if(['try','except'].indexOf(previous.type)==-1 &&
(previous.type !='single_kw' ||
previous.token !='else')){raise_syntax_error(C,`finally after ${previous.type})`)}
return new SingleKwCtx(C,token)
case 'for':
return new TargetListCtx(new ForExpr(C))
case 'from':
return new FromCtx(C)
case 'global':
return new GlobalCtx(C)
case 'if':
case 'while':
return new AbstractExprCtx(
new ConditionCtx(C,token),false)
case 'import':
return new ImportCtx(C)
case 'lambda':
return new LambdaCtx(C)
case 'nonlocal':
return new NonlocalCtx(C)
case 'op':
switch(value){case '*':
var expr=new AbstractExprCtx(C,true)
return transition(expr,token,value)
case '+':
case '-':
case '~':
C.position=$token.value
var expr=new ExprCtx(C,'unary',true)
return new AbstractExprCtx(
new UnaryCtx(expr,value),false)
case '@':
return new AbstractExprCtx(new DecoratorCtx(C),false)}
break
case 'pass':
return new PassCtx(C)
case 'raise':
return new AbstractExprCtx(new RaiseCtx(C),false)
case 'return':
return new AbstractExprCtx(new ReturnCtx(C),true)
case 'try':
return new TryCtx(C)
case 'with':
return new WithCtx(C)
case 'yield':
return new AbstractExprCtx(new YieldCtx(C),true)
case 'eol':
if(C.maybe_type){if(C.tree.length > 0 && C.tree[0].type=='assign'){alert('type soft keyword')}else{raise_syntax_error(C)}}
if(C.tree.length==0){
C.node.parent.children.pop()
return C.node.parent.C}
return C}
console.log('error, C',C,'token',token,value)
raise_syntax_error(C)}
var NonlocalCtx=$B.parser.NonlocalCtx=function(C){
this.type='nonlocal'
this.parent=C
this.tree=[]
this.position=$token.value
C.tree[C.tree.length]=this
this.expect='id'
this.scope=get_scope(this)
this.scope.nonlocals=this.scope.nonlocals ||new Set()}
NonlocalCtx.prototype.ast=function(){
var ast_obj=new ast.Nonlocal(this.tree.map(item=> item.value))
set_position(ast_obj,this.position)
return ast_obj}
NonlocalCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'id':
if(C.expect=='id'){new IdCtx(C,value)
C.expect=','
return C}
break
case ',':
if(C.expect==','){C.expect='id'
return C}
break
case 'eol':
if(C.expect==','){return transition(C.parent,token)}
break}
raise_syntax_error(C)}
var NotCtx=$B.parser.NotCtx=function(C){
this.type='not'
this.parent=C
this.tree=[]
this.position=$token.value
C.tree[C.tree.length]=this}
NotCtx.prototype.ast=function(){var ast_obj=new ast.UnaryOp(new ast.Not(),this.tree[0].ast())
set_position(ast_obj,this.position)
return ast_obj}
NotCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'in':
C.parent.parent.tree.pop()
return new ExprCtx(new OpCtx(C.parent,'not_in'),'op',false)
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
var expr=new AbstractExprCtx(C,false)
return transition(expr,token,value)
case 'op':
var a=value
if('+'==a ||'-'==a ||'~'==a){var expr=new AbstractExprCtx(C,false)
return transition(expr,token,value)}}
return transition(C.parent,token)}
var NumberCtx=$B.parser.NumberCtx=function(type,C,value){
this.type=type
this.value=value
this.parent=C
this.tree=[]
this.position=$token.value
C.tree[C.tree.length]=this}
NumberCtx.prototype.ast=function(){var value=$B.AST.$convert(this),
ast_obj=new $B.ast.Constant(value)
set_position(ast_obj,this.position)
return ast_obj}
NumberCtx.prototype.transition=function(token,value){var C=this
var num_type={2:'binary',8:'octal',10:'decimal',16:'hexadecimal'}[this.value[0]]
if(token=='id'){if(value=='_'){raise_syntax_error(C,'invalid decimal literal')}else if(["and","else","for","if","in","is","or"].indexOf(value)==-1){raise_syntax_error(C,`invalid ${num_type} literal`)}else if(num_type=='hexadecimal' && this.value[1].length % 2==1){$B.warn(_b_.SyntaxWarning,`invalid hexadecimal literal`,get_module(C).filename,$token.value)}}else if(token=='op'){if(["and","in","is","or"].indexOf(value)>-1 &&
num_type=='hexadecimal' &&
this.value[1].length % 2==1){$B.warn(_b_.SyntaxWarning,`invalid hexadecimal literal`,get_module(C).filename,$token.value)}}
return transition(C.parent,token,value)}
var OpCtx=$B.parser.OpCtx=function(C,op){
this.type='op'
this.op=op
this.parent=C.parent
this.position=$token.value
this.tree=[C]
this.scope=get_scope(this)
if(C.type=="expr"){if(['int','float','str'].indexOf(C.tree[0].type)>-1){this.left_type=C.tree[0].type}}
C.parent.tree.pop()
C.parent.tree.push(this)}
OpCtx.prototype.ast=function(){
var ast_type_class=op2ast_class[this.op],op_type=ast_type_class[0],ast_class=ast_type_class[1],ast_obj
if(op_type===ast.Compare){var left=this.tree[0].ast(),ops=[new ast_class()]
if(this.ops){for(var op of this.ops.slice(1)){ops.push(new op2ast_class[op][1]())}
ast_obj=new ast.Compare(left,ops,this.tree.slice(1).map(x=> x.ast()))}else{ast_obj=new ast.Compare(left,ops,[this.tree[1].ast()])}}else if(op_type===ast.UnaryOp){ast_obj=new op_type(new ast_class(),this.tree[1].ast())}else if(op_type===ast.BoolOp){
var values=[this.tree[1]],main_op=this.op,ctx=this
while(ctx.tree[0].type=='op' && ctx.tree[0].op==main_op){values.splice(0,0,ctx.tree[0].tree[1])
ctx=ctx.tree[0]}
values.splice(0,0,ctx.tree[0])
ast_obj=new op_type(new ast_class(),values.map(x=> x.ast()))}else{ast_obj=new op_type(
this.tree[0].ast(),new ast_class(),this.tree[1].ast())}
set_position(ast_obj,this.position)
return ast_obj}
function is_literal(expr){return expr.type=='expr' &&
['int','str','float','imaginary'].indexOf(expr.tree[0].type)>-1}
OpCtx.prototype.transition=function(token,value){var C=this
if(C.op===undefined){console.log('C has no op',C)
raise_syntax_error(C)}
if((C.op=='is' ||C.op=='is_not')
&& C.tree.length > 1){for(var operand of C.tree){if(is_literal(operand)){var head=C.op=='is' ? 'is' :'is not'
$B.warn(_b_.SyntaxWarning,`"${head}" with a literal. Did you mean "=="?"`,get_module(C).filename,$token.value)
break}}}
switch(token){case 'id':
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
return transition(new AbstractExprCtx(C,false),token,value)
case 'op':
switch(value){case '+':
case '-':
case '~':
return new UnaryCtx(C,value)}
default:
if(C.tree[C.tree.length-1].type==
'abstract_expr'){raise_syntax_error(C)}}
return transition(C.parent,token)}
var PassCtx=$B.parser.PassCtx=function(C){
this.type='pass'
this.parent=C
this.tree=[]
this.position=$token.value
C.tree[C.tree.length]=this}
PassCtx.prototype.ast=function(){var ast_obj=new ast.Pass()
set_position(ast_obj,this.position)
return ast_obj}
PassCtx.prototype.transition=function(token,value){var C=this
if(token=='eol'){return C.parent}
raise_syntax_error(C)}
var PatternCtx=$B.parser.PatternCtx=function(C){
this.type="pattern"
this.parent=C
this.tree=[]
C.tree.push(this)
this.expect='id'}
PatternCtx.prototype.transition=function(token,value){var C=this
switch(C.expect){case 'id':
switch(token){case 'str':
case 'int':
case 'float':
case 'imaginary':
C.expect=','
return new PatternLiteralCtx(C,token,value)
case 'op':
switch(value){case '-':
case '+':
C.expect=','
return new PatternLiteralCtx(C,{sign:value})
case '*':
C.expect='starred_id'
return C
default:
raise_syntax_error(C)}
case 'id':
C.expect=','
if(['None','True','False'].indexOf(value)>-1){return new PatternLiteralCtx(C,token,value)}else{return new PatternCaptureCtx(C,value)}
break
case '[':
return new PatternCtx(
new PatternSequenceCtx(C.parent,token))
case '(':
return new PatternCtx(
new PatternGroupCtx(C.parent,token))
case '{':
return new PatternMappingCtx(C.parent,token)
case 'JoinedStr':
raise_syntax_error(C,"patterns may only match "+
"literals and attribute lookups")}
break
case 'starred_id':
if(token=='id'){var capture=new PatternCaptureCtx(C,value)
capture.starred=true
return capture}
raise_syntax_error(C,"(expected id after '*')")
case 'number':
switch(token){case 'int':
case 'float':
case 'imaginary':
C.expect=','
return new PatternLiteralCtx(C,token,value,C.sign)
default:
raise_syntax_error(C)}
case ',':
switch(token){case ',':
if(C.parent instanceof PatternSequenceCtx){return new PatternCtx(C.parent)}
return new PatternCtx(
new PatternSequenceCtx(C.parent))
case ':':
return BodyCtx(C)}}
return C.parent.transition(token,value)}
function as_pattern(C,token,value){
if(C.expect=='as'){if(token=='as'){C.expect='alias'
return C}else{return transition(C.parent,token,value)}}else if(C.expect=='alias'){if(token=='id'){if(value=='_'){raise_syntax_error(C,"cannot use '_' as a target")}
if(C.bindings().indexOf(value)>-1){raise_syntax_error(C,`multiple assignments to name '${value}' in pattern`)}
C.alias=value
return C.parent}else{raise_syntax_error(C,'invalid pattern target')}}}
var PatternCaptureCtx=function(C,value){
this.type="capture_pattern"
this.parent=C.parent
C.parent.tree.pop()
C.parent.tree.push(this)
this.tree=[value]
this.position=$token.value
this.positions=[this.position]
this.expect='.'}
PatternCaptureCtx.prototype.ast=function(){var ast_obj
try{if(this.tree.length > 1){var pattern=new ast.Name(this.tree[0],new ast.Load())
set_position(pattern,this.position)
for(var i=1;i < this.tree.length;i++){pattern=new ast.Attribute(pattern,this.tree[i],new ast.Load())
copy_position(pattern,pattern.value)}
pattern=new ast.MatchValue(pattern)
copy_position(pattern,pattern.value)}else if(this.starred){var v=this.tree[0]
if(v=='_'){ast_obj=new ast.MatchStar()}else{ast_obj=new ast.MatchStar(v)}
set_position(ast_obj,this.position)}else{var pattern=this.tree[0]
if(typeof pattern=='string'){}else if(pattern.type=='group_pattern'){pattern=pattern.ast()}else{console.log('bizarre',pattern)
pattern=NumberCtx.prototype.ast.bind(this)()}
if(pattern=='_'){pattern=new ast.MatchAs()
set_position(pattern,this.position)}}
if(this.alias){if(typeof pattern=="string"){pattern=new ast.MatchAs(undefined,pattern)
set_position(pattern,this.position)}
ast_obj=new ast.MatchAs(pattern,this.alias)}else if(this.tree.length > 1 ||pattern instanceof ast.MatchAs){ast_obj=pattern}else if(typeof pattern=='string'){ast_obj=new ast.MatchAs(undefined,pattern)}else if(! this.starred){ast_obj=new ast.MatchAs(undefined,pattern)}
set_position(ast_obj,this.position)
return ast_obj}catch(err){console.log('error capture ast')
show_line(this)
throw err}}
PatternCaptureCtx.prototype.bindings=function(){var bindings=this.tree[0]=='_' ?[]:this.tree.slice()
if(this.alias){bindings.push(this.alias)}
return bindings}
PatternCaptureCtx.prototype.transition=function(token,value){var C=this
switch(C.expect){case '.':
if(token=='.'){C.type="value_pattern"
C.expect='id'
return C}else if(token=='('){
return new PatternCtx(new PatternClassCtx(C))}else if(C.parent instanceof PatternMappingCtx){return C.parent.transition(token,value)}else{C.expect='as'
return C.transition(token,value)}
case 'as':
case 'alias':
var res=as_pattern(C,token,value)
return res
case 'id':
if(token=='id'){C.tree.push(value)
C.positions.push($token.value)
C.expect='.'
return C}}
return transition(C.parent,token,value)}
PatternClassCtx=function(C){this.type="class_pattern"
this.tree=[]
this.parent=C.parent
this.position=$token.value
this.class_id=C.tree.slice()
this.positions=C.positions
C.tree.pop()
this.attrs=C.tree.slice(2)
C.parent.tree.pop()
C.parent.tree.push(this)
this.expect=','
this.keywords=[]
this.positionals=[]
this.bound_names=[]}
PatternClassCtx.prototype.ast=function(){
if(this.class_id.length==1){var cls=new ast.Name(this.class_id[0])}else{
var cls
for(var i=0,len=this.class_id.length;i < len-1;i++){var value=new ast.Name(this.class_id[i],new ast.Load())
set_position(value,this.positions[i])
if(i==0){cls=new ast.Attribute(value,this.class_id[i+1])}else{cls=new ast.Attribute(cls,this.class_id[i+1])}
set_position(cls,this.positions[i])}}
set_position(cls,this.position)
cls.ctx=new ast.Load()
var patterns=[],kwd_attrs=[],kwd_patterns=[]
for(var item of this.tree){if(item.is_keyword){kwd_attrs.push(item.tree[0])
kwd_patterns.push(item.tree[1].ast())}else{try{patterns.push(item.ast())}catch(err){console.log('error in class pattern item')
show_line(this)
throw err}}}
var ast_obj=new ast.MatchClass(cls,patterns,kwd_attrs,kwd_patterns)
set_position(ast_obj,this.position)
if(this.alias){ast_obj=new ast.MatchAs(ast_obj,this.alias)
set_position(ast_obj,this.position)}
return ast_obj}
PatternClassCtx.prototype.bindings=function(){var bindings=this.bound_names
if(this.alias){bindings.push(this.alias)}
return bindings}
PatternClassCtx.prototype.transition=function(token,value){var C=this
function check_last_arg(){var last=$B.last(C.tree),bound
if(last instanceof PatternCaptureCtx){if(! last.is_keyword &&
C.keywords.length > 0){$token.value=last.position
raise_syntax_error(C,'positional patterns follow keyword patterns')}
if(last.is_keyword){if(C.keywords.indexOf(last.tree[0])>-1){raise_syntax_error(C,`keyword argument repeated: ${last.tree[0]}`)}
C.keywords.push(last.tree[0])
bound=last.tree[1].bindings()}else{bound=last.bindings()}
for(var b of bound){if(C.bound_names.indexOf(b)>-1){raise_syntax_error(C,'multiple assignments '+
`to name '${b}' in pattern`)}}
C.bound_names=C.bound_names.concat(bound)}}
switch(this.expect){case ',':
switch(token){case '=':
var current=$B.last(this.tree)
if(current instanceof PatternCaptureCtx){
if(this.keywords.indexOf(current.tree[0])>-1){raise_syntax_error(C,'attribute name repeated in class pattern: '+
current.tree[0])}
current.is_keyword=true
return new PatternCtx(current)}
raise_syntax_error(this,"'=' after non-capture")
case ',':
check_last_arg()
return new PatternCtx(this)
case ')':
check_last_arg()
if($B.last(this.tree).tree.length==0){this.tree.pop()}
C.expect='as'
return C
default:
raise_syntax_error(C)}
case 'as':
case 'alias':
return as_pattern(C,token,value)}
return transition(C.parent,token,value)}
var PatternGroupCtx=function(C){
this.type="group_pattern"
this.parent=C
this.position=$token.value
this.tree=[]
var first_pattern=C.tree.pop()
this.expect=',|'
C.tree.push(this)}
function remove_empty_pattern(C){var last=$B.last(C.tree)
if(last && last instanceof PatternCtx &&
last.tree.length==0){C.tree.pop()}}
PatternGroupCtx.prototype.ast=function(){var ast_obj
if(this.tree.length==1 && ! this.has_comma){ast_obj=this.tree[0].ast()}else{ast_obj=PatternSequenceCtx.prototype.ast.bind(this)()}
if(this.alias){ast_obj=new ast.MatchAs(ast_obj,this.alias)}
set_position(ast_obj,this.position)
return ast_obj}
PatternGroupCtx.prototype.bindings=function(){var bindings=[]
for(var item of this.tree){bindings=bindings.concat(item.bindings())}
if(this.alias){bindings.push(this.alias)}
return bindings}
PatternGroupCtx.prototype.transition=function(token,value){var C=this
switch(C.expect){case ',|':
if(token==")"){
remove_empty_pattern(C)
C.expect='as'
return C}else if(token==','){C.expect='id'
C.has_comma=true
return C}else if(token=='op' && value=='|'){var opctx=new PatternOrCtx(C.parent)
opctx.parenthese=true
return new PatternCtx(opctx)}else if(this.token===undefined){return transition(C.parent,token,value)}
raise_syntax_error(C)
case 'as':
case 'alias':
return as_pattern(C,token,value)
case 'id':
if(token==')'){
remove_empty_pattern(C)
C.expect='as'
return C}
C.expect=',|'
return transition(new PatternCtx(C),token,value)}
raise_syntax_error(C)}
var PatternLiteralCtx=function(C,token,value,sign){
this.type="literal_pattern"
this.parent=C.parent
this.position=$token.value
C.parent.tree.pop()
C.parent.tree.push(this)
if(token.sign){this.tree=[{sign:token.sign}]
this.expect='number'}else{if(token=='str'){this.tree=[]
new StringCtx(this,value)}else if(token=='JoinedStr'){raise_syntax_error(this,"patterns cannot include f-strings")}else{this.tree=[{type:token,value,sign}]}
this.expect='op'}}
PatternLiteralCtx.prototype.ast=function(){var lineno=get_node(this).line_num
try{var first=this.tree[0],result
if(first.type=='str'){var v=StringCtx.prototype.ast.bind(first)()
result=new ast.MatchValue(v)}else if(first.type=='id'){result=new ast.MatchSingleton(_b_[first.value])}else{first.position=this.position
var num=NumberCtx.prototype.ast.bind(first)(),res=new ast.MatchValue(num)
if(first.sign && first.sign !='+'){var op={'+':ast.UAdd,'-':ast.USub,'~':ast.Invert}[first.sign]
var unary_op=new ast.UnaryOp(new op(),res.value)
set_position(unary_op,this.position)
res=new ast.MatchValue(unary_op)
set_position(res,this.position)}
if(this.tree.length==1){result=res}else{this.tree[2].position=this.position
var num2=NumberCtx.prototype.ast.bind(this.tree[2])(),binop=new ast.BinOp(res.value,this.tree[1]=='+' ? new ast.Add():new ast.Sub(),num2)
set_position(binop,this.position)
result=new ast.MatchValue(binop)}}
set_position(result,this.position)
if(this.tree.length==2){
result=new ast.MatchValue(new ast.BinOp(
this.tree[0].ast(),C.num_sign=='+' ? ast.Add :ast.Sub,this.tree[1].ast()))}
if(this.alias){result=new ast.MatchAs(result,this.alias)}
set_position(result,this.position)
return result}catch(err){show_line(this)
throw err}}
PatternLiteralCtx.prototype.bindings=function(){if(this.alias){return[this.alias]}
return[]}
PatternLiteralCtx.prototype.transition=function(token,value){var C=this
switch(C.expect){case 'op':
if(token=="op"){switch(value){case '+':
case '-':
if(['int','float'].indexOf(C.tree[0].type)>-1){C.expect='imaginary'
this.tree.push(value)
C.num_sign=value
return C}
raise_syntax_error(C,'patterns cannot include operators')
default:
return transition(C.parent,token,value)}}
break
case 'number':
switch(token){case 'int':
case 'float':
case 'imaginary':
var last=$B.last(C.tree)
if(this.tree.token===undefined){
last.type=token
last.value=value
C.expect='op'
return C}
default:
raise_syntax_error(C)}
case 'imaginary':
switch(token){case 'imaginary':
C.tree.push({type:token,value,sign:C.num_sign})
return C.parent
default:
raise_syntax_error(C,'(expected imaginary)')}
case 'as':
case 'alias':
return as_pattern(C,token,value)}
if(token=='as' && C.tree.length==1){C.expect='as'
return C.transition(token,value)}
return transition(C.parent,token,value)}
var PatternMappingCtx=function(C){
this.type="mapping_pattern"
this.parent=C
this.position=$token.value
C.tree.pop()
this.tree=[]
C.tree.push(this)
this.expect='key_value_pattern'
this.literal_keys=[]
this.bound_names=[]}
PatternMappingCtx.prototype.ast=function(){
var keys=[],patterns=[]
for(var item of this.tree){keys.push(item.tree[0].ast().value)
if(item.tree[0]instanceof PatternLiteralCtx){patterns.push(item.tree[1].ast())}else{patterns.push(item.tree[2].ast())}}
var res=new ast.MatchMapping(keys,patterns)
if(this.double_star){res.rest=this.double_star.tree[0]}
set_position(res,this.position)
return res}
PatternMappingCtx.prototype.bindings=function(){var bindings=[]
for(var item of this.tree){bindings=bindings.concat(item.bindings())}
if(this.rest){bindings=bindings.concat(this.rest.bindings())}
if(this.alias){bindings.push(this.alias)}
return bindings}
PatternMappingCtx.prototype.transition=function(token,value){var C=this
function check_duplicate_names(){var last=$B.last(C.tree),bindings
if(last instanceof PatternKeyValueCtx){if(C.double_star){
raise_syntax_error(C,"can't use starred name here (consider moving to end)")}
if(last.tree[0].type=='value_pattern'){bindings=last.tree[2].bindings()}else{bindings=last.tree[1].bindings()}
for(var binding of bindings){if(C.bound_names.indexOf(binding)>-1){raise_syntax_error(C,`multiple assignments to name '${binding}'`+
' in pattern')}}
C.bound_names=C.bound_names.concat(bindings)}}
switch(C.expect){case 'key_value_pattern':
if(token=='}' ||token==','){
check_duplicate_names()
if(C.double_star){var ix=C.tree.indexOf(C.double_star)
if(ix !=C.tree.length-1){raise_syntax_error(C,"can't use starred name here (consider moving to end)")}
C.rest=C.tree.pop()}
return token==',' ? C :C.parent}
if(token=='op' && value=='**'){C.expect='capture_pattern'
return C}
var p=new PatternCtx(C)
try{var lit_or_val=p.transition(token,value)}catch(err){raise_syntax_error(C,"mapping pattern keys may only "+
"match literals and attribute lookups")}
if(C.double_star){
raise_syntax_error(C)}
if(lit_or_val instanceof PatternLiteralCtx){C.tree.pop()
new PatternKeyValueCtx(C,lit_or_val)
return lit_or_val}else if(lit_or_val instanceof PatternCaptureCtx){C.has_value_pattern_keys=true
C.tree.pop()
new PatternKeyValueCtx(C,lit_or_val)
C.expect='.'
return this}else{raise_syntax_error(C,'(expected key or **)')}
case 'capture_pattern':
var p=new PatternCtx(C)
var capture=transition(p,token,value)
if(capture instanceof PatternCaptureCtx){if(C.double_star){raise_syntax_error(C,"only one double star pattern is accepted")}
if(value=='_'){raise_syntax_error(C)}
if(C.bound_names.indexOf(value)>-1){raise_syntax_error(C,'duplicate binding: '+value)}
C.bound_names.push(value)
capture.double_star=true
C.double_star=capture
C.expect=','
return C}else{raise_syntax_error(C,'(expected identifier)')}
case ',':
if(token==','){C.expect='key_value_pattern'
return C}else if(token=='}'){C.expect='key_value_pattern'
return C.transition(token,value)}
raise_syntax_error(C)
case '.':
if(C.tree.length > 0){var last=$B.last(C.tree)
if(last instanceof PatternKeyValueCtx){
new IdCtx(last,last.tree[0].tree[0])
C.expect='key_value_pattern'
return transition(last.tree[0],token,value)}}
raise_syntax_error(C)}
return transition(C.parent,token,value)}
var PatternKeyValueCtx=function(C,literal_or_value){this.type="pattern_key_value"
this.parent=C
this.tree=[literal_or_value]
literal_or_value.parent=this
this.expect=':'
C.tree.push(this)}
PatternKeyValueCtx.prototype.bindings=PatternMappingCtx.prototype.bindings
PatternKeyValueCtx.prototype.transition=function(token,value){var C=this
switch(C.expect){case ':':
switch(token){case ':':
var key_obj=this.tree[0]
if(key_obj instanceof PatternLiteralCtx){var key=$B.AST.$convert(key_obj.tree[0])
if(_b_.list.__contains__(this.parent.literal_keys,key)){raise_syntax_error(C,`mapping pattern checks `+
`duplicate key (${_b_.repr(key)})`)}
this.parent.literal_keys.push(key)}
this.expect=','
return new PatternCtx(this)
default:
raise_syntax_error(C,'(expected :)')}
case ',':
switch(token){case '}':
return transition(C.parent,token,value)
case ',':
C.parent.expect='key_value_pattern'
return transition(C.parent,token,value)
case 'op':
if(value=='|'){
return new PatternCtx(new PatternOrCtx(C))}}
raise_syntax_error(C,"(expected ',' or '}')")}
return transition(C.parent,token,value)}
var PatternOrCtx=function(C){
this.type="or_pattern"
this.parent=C
this.position=$token.value
var first_pattern=C.tree.pop()
if(first_pattern instanceof PatternGroupCtx &&
first_pattern.expect !='as'){
first_pattern=first_pattern.tree[0]}
this.tree=[first_pattern]
first_pattern.parent=this
this.expect='|'
C.tree.push(this)
this.check_reachable()}
PatternOrCtx.prototype.ast=function(){
var ast_obj=new ast.MatchOr(this.tree.map(x=> x.ast()))
set_position(ast_obj,this.position)
if(this.alias){ast_obj=new ast.MatchAs(ast_obj,this.alias)}
set_position(ast_obj,this.position)
return ast_obj}
PatternOrCtx.prototype.bindings=function(){var names
for(var subpattern of this.tree){if(subpattern.bindings===undefined){console.log('no binding',subpattern)}
var subbindings=subpattern.bindings()
if(names===undefined){names=subbindings}else{for(var item of names){if(subbindings.indexOf(item)==-1){raise_syntax_error(this,"alternative patterns bind different names")}}
for(var item of subbindings){if(names.indexOf(item)==-1){raise_syntax_error(this,"alternative patterns bind different names")}}}}
if(this.alias){return names.concat(this.alias)}
return names}
PatternOrCtx.prototype.check_reachable=function(){
var item=$B.last(this.tree)
var capture
if(item.type=='capture_pattern'){capture=item.tree[0]}else if(item.type=='group_pattern' && item.tree.length==1 &&
item.tree[0].type=='capture_pattern'){capture=item.tree[0].tree[0]}else if(item instanceof PatternOrCtx){item.check_reachable()}
if(capture){var msg=capture=='_' ? 'wildcard' :
`name capture '${capture}'`
raise_syntax_error(this,`${msg} makes remaining patterns unreachable`)}}
PatternOrCtx.prototype.transition=function(token,value){function set_alias(){
var last=$B.last(C.tree)
if(last.alias){C.alias=last.alias
delete last.alias}}
var C=this
if(['as','alias'].indexOf(C.expect)>-1){return as_pattern(C,token,value)}
if(token=='op' && value=="|"){
for(var item of C.tree){if(item.alias){raise_syntax_error(C,'(no as pattern inside or pattern)')}}
C.check_reachable()
return new PatternCtx(C)}else if(token==')' && C.parenthese){set_alias()
C.bindings()
delete C.parenthese
C.expect='as'
return C}
set_alias()
C.bindings()
return transition(C.parent,token,value)}
var PatternSequenceCtx=function(C,token){
this.type="sequence_pattern"
this.parent=C
this.position=$token.value
this.tree=[]
this.bound_names=[]
var first_pattern=C.tree.pop()
if(token===undefined){
this.bound_names=first_pattern.bindings()
this.tree=[first_pattern]
if(first_pattern.starred){this.has_star=true}
first_pattern.parent=this}else{
this.token=token}
this.expect=','
C.tree.push(this)}
PatternSequenceCtx.prototype.ast=function(){var ast_obj=new ast.MatchSequence(this.tree.map(x=> x.ast()))
set_position(ast_obj,this.position)
if(this.alias){ast_obj=new ast.MatchAs(ast_obj,this.alias)
set_position(ast_obj,this.position)}
return ast_obj}
PatternSequenceCtx.prototype.bindings=PatternMappingCtx.prototype.bindings
PatternSequenceCtx.prototype.transition=function(token,value){function check_duplicate_names(){var last=$B.last(C.tree)
if(!(last instanceof PatternCtx)){
var last_bindings=last.bindings()
for(var b of last_bindings){if(C.bound_names.indexOf(b)>-1){raise_syntax_error(C,"multiple assignments to"+
` name '${b}' in pattern`)}}
if(last.starred){if(C.has_star){raise_syntax_error(C,'multiple starred names in sequence pattern')}
C.has_star=true}
C.bound_names=C.bound_names.concat(last_bindings)}}
var C=this
if(C.expect==','){if((C.token=='[' && token==']')||
(C.token=='(' && token==")")){
var nb_starred=0
for(var item of C.tree){if(item instanceof PatternCaptureCtx && item.starred){nb_starred++
if(nb_starred > 1){raise_syntax_error(C,'multiple starred names in sequence pattern')}}}
C.expect='as'
check_duplicate_names()
remove_empty_pattern(C)
return C}else if(token==','){check_duplicate_names()
C.expect='id'
return C}else if(token=='op' && value=='|'){
remove_empty_pattern(C)
return new PatternCtx(new PatternOrCtx(C))}else if(this.token===undefined){
check_duplicate_names()
return transition(C.parent,token,value)}
raise_syntax_error(C)}else if(C.expect=='as'){if(token=='as'){this.expect='alias'
return C}
return transition(C.parent,token,value)}else if(C.expect=='alias'){if(token='id'){C.alias=value
return C.parent}
raise_syntax_error(C,'expected alias')}else if(C.expect=='id'){C.expect=','
return transition(new PatternCtx(C),token,value)}}
var RaiseCtx=$B.parser.RaiseCtx=function(C){
this.type='raise'
this.parent=C
this.tree=[]
this.position=$token.value
C.tree[C.tree.length]=this
this.scope_type=get_scope(this).ntype}
RaiseCtx.prototype.ast=function(){
var ast_obj=new ast.Raise(...this.tree.map(x=> x.ast()))
set_position(ast_obj,this.position)
return ast_obj}
RaiseCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'id':
if(C.tree.length==0){return new IdCtx(new ExprCtx(C,'exc',false),value)}
break
case 'from':
if(C.tree.length > 0){return new AbstractExprCtx(C,false)}
break
case 'eol':
remove_abstract_expr(this.tree)
return transition(C.parent,token)}
raise_syntax_error(C)}
var ReturnCtx=$B.parser.ReturnCtx=function(C){
this.type='return'
this.parent=C
this.tree=[]
this.position=$token.value
C.tree[C.tree.length]=this
this.scope=get_scope(this)
if(["def","generator"].indexOf(this.scope.ntype)==-1){raise_syntax_error(C,"'return' outside function")}
var node=this.node=get_node(this)
while(node.parent){if(node.parent.C){var elt=node.parent.C.tree[0]
if(elt.type=='for'){elt.has_return=true
break}else if(elt.type=='try'){elt.has_return=true}else if(elt.type=='single_kw' && elt.token=='finally'){elt.has_return=true}}
node=node.parent}}
ReturnCtx.prototype.ast=function(){var res=new ast.Return()
if(this.tree.length > 0){res.value=this.tree[0].ast()}
set_position(res,this.position)
return res}
ReturnCtx.prototype.transition=function(token,value){var C=this
if(token=='eol' && this.tree.length==1 &&
this.tree[0].type=='abstract_expr'){
this.tree.pop()}
return transition(new AbstractExprCtx(C.parent,false),token,value)}
var SetCompCtx=function(C){
this.type='setcomp'
this.tree=[C.tree[0]]
this.tree[0].parent=this
Comprehension.make_comp(this,C)}
SetCompCtx.prototype.ast=function(){
var ast_obj=new ast.SetComp(
this.tree[0].ast(),Comprehension.generators(this.tree.slice(1))
)
set_position(ast_obj,this.position)
return ast_obj}
SetCompCtx.prototype.transition=function(token,value){var C=this
if(token=='}'){return this.parent}
raise_syntax_error(C)}
var SingleKwCtx=$B.parser.SingleKwCtx=function(C,token){
this.type='single_kw'
this.token=token
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this
if(token=="else"){var node=C.node,rank=node.parent.children.indexOf(node),pctx=node.parent.children[rank-1].C
pctx.tree[0].orelse=this
if(pctx.tree.length > 0){var elt=pctx.tree[0]
if(elt.type=='for' ||
elt.type=='asyncfor' ||
(elt.type=='condition' && elt.token=='while')){elt.has_break=true
elt.else_node=get_node(this)}}}}
SingleKwCtx.prototype.ast=function(){return ast_body(this.parent)}
SingleKwCtx.prototype.transition=function(token,value){var C=this
if(token==':'){return BodyCtx(C)}else if(token=='eol'){raise_syntax_error(C,"expected ':'")}
raise_syntax_error(C)}
var SliceCtx=$B.parser.SliceCtx=function(C){
this.type='slice'
this.parent=C
this.position=$token.value
this.tree=C.tree.length > 0 ?[C.tree.pop()]:[]
C.tree.push(this)}
SliceCtx.prototype.ast=function(){var slice=new ast.Slice()
var attrs=['lower','upper','step']
for(var i=0;i < this.tree.length;i++){var item=this.tree[i]
if(item.type !=='abstract_expr'){slice[attrs[i]]=item.ast()}}
set_position(slice,this.position)
return slice}
SliceCtx.prototype.transition=function(token,value){var C=this
if(token==":"){return new AbstractExprCtx(C,false)}
return transition(C.parent,token,value)}
var StarArgCtx=$B.parser.StarArgCtx=function(C){
this.type='star_arg'
this.parent=C
this.tree=[]
this.position=$token.value
C.tree[C.tree.length]=this}
StarArgCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'id':
if(C.parent.type=="target_list"){C.tree.push(value)
C.parent.expect=','
return C.parent}
return transition(new AbstractExprCtx(C,false),token,value)
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
return transition(new AbstractExprCtx(C,false),token,value)
case ',':
case ')':
if(C.tree.length==0){raise_syntax_error(C,"(unnamed star argument)")}
return transition(C.parent,token)
case ':':
if(C.parent.parent.type=='lambda'){return transition(C.parent.parent,token)}}
raise_syntax_error(C)}
var StarredCtx=$B.parser.StarredCtx=function(C){
this.type='starred'
this.position=C.position
if(C.parent.type=='list_or_tuple' &&
C.parent.parent.type=="node"){
for(var i=0;i < C.parent.tree.length;i++){var child=C.parent.tree[i]
if(child.type=='expr' && child.tree.length > 0
&& child.tree[0].type=='starred'){raise_syntax_error(C,"two starred expressions in assignment")}}}
this.parent=C
this.tree=[]
C.tree[C.tree.length]=this}
StarredCtx.prototype.ast=function(){var ast_obj=new ast.Starred(this.tree[0].ast(),new ast.Load())
set_position(ast_obj,this.position)
return ast_obj}
StarredCtx.prototype.transition=function(token,value){var C=this
return transition(C.parent,token,value)}
var StringCtx=$B.parser.StringCtx=function(C,value){
this.type='str'
this.parent=C
this.position=this.end_position=$token.value
C.tree.push(this)
this.is_bytes=value.startsWith('b')
this.value=this.is_bytes ?[]:''
this.add_value(value)
this.raw=false}
$B.string_from_ast_value=function(value){
return value.replace(new RegExp("\\\\'",'g'),"'")}
var make_string_for_ast_value=$B.make_string_for_ast_value=function(value){value=value.replace(/\n/g,'\\n\\\n')
value=value.replace(/\r/g,'\\r\\\r')
if(value[0]=="'"){var unquoted=value.substr(1,value.length-2)
return unquoted}
var quote="'"
if(value.indexOf("'")>-1){var s='',escaped=false
for(var char of value){if(char=='\\'){if(escaped){s+='\\\\'}
escaped=!escaped}else{if(char=="'" && ! escaped){
s+='\\'}else if(escaped){s+='\\'}
s+=char
escaped=false}}
value=s}
return value.substr(1,value.length-2)}
StringCtx.prototype.add_value=function(value){this.is_bytes=value.charAt(0)=='b'
if(! this.is_bytes){this.value+=make_string_for_ast_value(value)}else{value=value.substr(2,value.length-3)
try{var b=encode_bytestring(value)}catch(err){raise_syntax_error(C,'bytes can only contain ASCII literal characters')}
this.value=this.value.concat(b)}}
function encode_bytestring(s){s=s.replace(/\\t/g,'\t')
.replace(/\\n/g,'\n')
.replace(/\\r/g,'\r')
.replace(/\\f/g,'\f')
.replace(/\\v/g,'\v')
.replace(/\\\\/g,'\\')
var t=[]
for(var i=0,len=s.length;i < len;i++){var cp=s.codePointAt(i)
if(cp > 255){throw Error()}
t.push(cp)}
return t}
StringCtx.prototype.ast=function(){var value=this.value
if(this.is_bytes){value=_b_.bytes.$factory(this.value)}
var ast_obj=new ast.Constant(value)
set_position(ast_obj,this.position)
return ast_obj}
StringCtx.prototype.transition=function(token,value){var C=this
switch(token){case '[':
return new AbstractExprCtx(new SubscripCtx(C.parent),false)
case '(':
C.parent.tree[0]=C
return new CallCtx(C.parent)
case 'str':
if((this.is_bytes && ! value.startsWith('b'))||
(! this.is_bytes && value.startsWith('b'))){raise_syntax_error(C,"cannot mix bytes and nonbytes literals")}
C.add_value(value)
return C
case 'JoinedStr':
C.parent.tree.pop()
var fstring=new FStringCtx(C.parent,value)
new StringCtx(fstring,fstring.quotes+this.value+fstring.quotes)
return fstring}
return transition(C.parent,token,value)}
var SubscripCtx=$B.parser.SubscripCtx=function(C){
this.type='sub'
this.func='getitem' 
this.value=C.tree[0]
this.position=$token.value 
C.tree.pop()
C.tree[C.tree.length]=this
this.parent=C
this.tree=[]}
SubscripCtx.prototype.ast=function(){var slice
if(this.tree.length > 1){var slice_items=this.tree.map(x=> x.ast())
slice=new ast.Tuple(slice_items)
set_position(slice,this.position,this.end_position)}else{slice=this.tree[0].ast()}
slice.ctx=new ast.Load()
var value=this.value.ast()
if(value.ctx){value.ctx=new ast.Load()}
var ast_obj=new ast.Subscript(value,slice,new ast.Load())
ast_obj.lineno=value.lineno
ast_obj.col_offset=value.col_offset
ast_obj.end_lineno=slice.end_lineno
ast_obj.end_col_offset=slice.end_col_offset
return ast_obj}
SubscripCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'id':
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
var expr=new AbstractExprCtx(C,false)
return transition(expr,token,value)
case ']':
C.end_position=$token.value
if(C.parent.packed){return C.parent}
if(C.tree[0].tree.length > 0){return C.parent}
break
case ':':
return new AbstractExprCtx(new SliceCtx(C),false)
case ',':
return new AbstractExprCtx(C,false)}
raise_syntax_error(C)}
var TargetListCtx=$B.parser.TargetListCtx=function(C){
this.type='target_list'
this.parent=C
this.tree=[]
this.position=$token.value
this.expect='id'
this.nb_packed=0
C.tree[C.tree.length]=this}
TargetListCtx.prototype.ast=function(){if(this.tree.length==1 && ! this.implicit_tuple){var item=this.tree[0].ast()
item.ctx=new ast.Store()
if(item instanceof ast.Tuple){for(var target of item.elts){target.ctx=new ast.Store()}}
return item}else{var items=[]
for(var item of this.tree){item=item.ast()
if(item.hasOwnProperty('ctx')){item.ctx=new ast.Store()}
items.push(item)}
var ast_obj=new ast.Tuple(items,new ast.Store())
set_position(ast_obj,this.position)
return ast_obj}}
TargetListCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'id':
if(C.expect=='id'){C.expect=','
return new IdCtx(
new ExprCtx(C,'target',false),value)}
case 'op':
if(C.expect=='id' && value=='*'){
this.nb_packed++
C.expect=','
return new AbstractExprCtx(
new StarredCtx(C),false)}
case '(':
case '[':
if(C.expect=='id'){C.expect=','
return new ListOrTupleCtx(C,token=='(' ? 'tuple' :'list')}
case ')':
case ']':
if(C.expect==','){return C.parent}
case ',':
if(C.expect==','){C.expect='id'
C.implicit_tuple=true
return C}}
if(C.expect==','){return transition(C.parent,token,value)}else if(token=='in'){
return transition(C.parent,token,value)}
console.log('unexpected token for target list',token,value)
console.log(C)
raise_syntax_error(C)}
var TernaryCtx=$B.parser.TernaryCtx=function(C){
this.type='ternary'
this.position=C.position
C.parent.tree.pop()
var expr=new ExprCtx(C.parent,'ternary',false)
expr.tree.push(this)
this.parent=expr
this.tree=[C]
C.parent=this}
TernaryCtx.prototype.ast=function(){
var ast_obj=new ast.IfExp(this.tree[1].ast(),this.tree[0].ast(),this.tree[2].ast())
set_position(ast_obj,this.position)
return ast_obj}
TernaryCtx.prototype.transition=function(token,value){var C=this
if(token=='else'){C.in_else=true
return new AbstractExprCtx(C,false)}else if(! C.in_else){if(token==':'){raise_syntax_error(C)}
raise_syntax_error_known_range(C,C.position,last_position(C),"expected 'else' after 'if' expression")}else if(token==","){
if(["assign","augm_assign","node","return"].
indexOf(C.parent.type)>-1){C.parent.tree.pop()
var t=new ListOrTupleCtx(C.parent,'tuple')
t.implicit=true
t.tree[0]=C
C.parent=t
t.expect="id"
return t}}
return transition(C.parent,token,value)}
var TryCtx=$B.parser.TryCtx=function(C){
this.type='try'
this.parent=C
this.position=$token.value
C.tree[C.tree.length]=this}
TryCtx.prototype.ast=function(){
var node=this.parent.node,res={body:ast_body(this.parent),handlers:[],orelse:[],finalbody:[]}
var rank=node.parent.children.indexOf(node)
for(var child of node.parent.children.slice(rank+1)){var t=child.C.tree[0],type=t.type
if(type=='single_kw'){type=t.token}
if(type=='except'){res.handlers.push(t.ast())}else if(type=='else'){res.orelse=ast_body(child.C)}else if(type=='finally'){res.finalbody=ast_body(child.C)}else{break}}
if(res.handlers.length==0 &&
res.finalbody.length==0){raise_syntax_error(this,"expected 'except' or 'finally' block")}
var klass=this.parent.is_trystar ? ast.TryStar :ast.Try
var res=new klass(res.body,res.handlers,res.orelse,res.finalbody)
set_position(res,this.position)
return res}
TryCtx.prototype.transition=function(token,value){var C=this
if(token==':'){return BodyCtx(C)}
raise_syntax_error(C,"expected ':'")}
var TypeAliasCtx=$B.parser.TypeAlias=function(C,value){
C.parent.parent.tree=[this]
this.parent=C.parent.parent
this.name=value
this.expect='='
this.tree=[]
this.position=$token.value}
TypeAliasCtx.prototype.transition=function(token,value){var C=this
if(C.expect=='='){if(token=='['){if(this.tree.length > 0){raise_syntax_error(C)}
return new TypeParamsCtx(C)}else if(token=='='){C.has_value=true
return new AbstractExprCtx(C,false)}else if(token=='eol'){if(! C.has_value ||
this.tree.length !==1 ||
this.tree[0]instanceof AbstractExprCtx){raise_syntax_error(C)}
return transition(C.parent,token,value)}}
raise_syntax_error(C)}
TypeAliasCtx.prototype.ast=function(){var name=new ast.Name(this.name),params,value=this.tree[0].ast()
if(this.type_params){params=this.type_params.ast()}
var ast_obj=new ast.TypeAlias(name,params,value)
set_position(ast_obj,this.position)
return ast_obj}
var TypeParamsCtx=$B.parser.TypeParamsCtx=function(C){this.type='type_params'
this.parent=C
C.type_params=this
this.tree=[]
this.expect='param'}
TypeParamsCtx.prototype.check_duplicate=function(name){
for(var item of this.tree){if(item.name==name){raise_syntax_error(this,`duplicate type parameter '${name}'`)}}}
TypeParamsCtx.prototype.transition=function(token,value){var C=this
if(C.expect=='param'){if(token=='id'){C.check_duplicate(value)
C.expect=','
return new TypeVarCtx(C,value)}else if(token=='op'){if(value=='*'){C.expect=','
return new TypeVarTupleCtx(C)}else if(value=='**'){C.expect=','
return new TypeParamSpecCtx(C)}}else if(token==']'){return C.parent}
raise_syntax_error(C)}else if(C.expect==','){if(token==','){C.expect='param'
return C}else if(token==']'){return C.parent}
raise_syntax_error(C)}
raise_syntax_error(C)}
TypeParamsCtx.prototype.ast=function(){return this.tree.map(x=> x.ast())}
var TypeVarCtx=$B.parser.TypeVarCtx=function(C,name){this.name=name
this.parent=C
C.tree.push(this)
this.tree=[]
this.position=$token.value}
TypeVarCtx.prototype.transition=function(token,value){var C=this
if(token==':'){return new AbstractExprCtx(C,false)}
return transition(this.parent,token,value)}
TypeVarCtx.prototype.ast=function(){var name=this.name,bound
if(this.tree.length > 0){bound=this.tree[0].ast()}
var ast_obj=new ast.TypeVar(name,bound)
set_position(ast_obj,this.position)
return ast_obj}
var TypeParamSpecCtx=$B.parser.TypeParamSpecCtx=function(C){this.parent=C
C.tree.push(this)
this.tree=[]
this.position=$token.value}
TypeParamSpecCtx.prototype.transition=function(token,value){var C=this
if(token=='id'){if(C.name){raise_syntax_error(C)}
C.parent.check_duplicate(value)
C.name=value
return C}else if(token==':'){if(! C.name){raise_syntax_error(C)}
this.has_colon=true
return new AbstractExprCtx(C,false)}else if(this.has_colon){var msg
if(this.tree[0].name=='tuple'){msg='cannot use constraints with ParamSpec'}else{msg='cannot use bound with ParamSpec'}
raise_syntax_error_known_range(C,this.position,$token.value,msg)}
return transition(this.parent,token,value)}
TypeParamSpecCtx.prototype.ast=function(){var name=new ast.Name(this.name)
var ast_obj=new ast.ParamSpec(name)
set_position(ast_obj,this.position)
return ast_obj}
var TypeVarTupleCtx=$B.parser.TypeVarTupleCtx=function(C){this.parent=C
C.tree.push(this)
this.tree=[]
this.position=$token.value}
TypeVarTupleCtx.prototype.transition=function(token,value){var C=this
if(token=='id'){if(C.name){raise_syntax_error(C)}
C.parent.check_duplicate(value)
C.name=value
return C}else if(token==':'){if(! C.name){raise_syntax_error(C)}
this.has_colon=true
return new AbstractExprCtx(C,false)}else if(this.has_colon){var msg
if(this.tree[0].name=='tuple'){msg='cannot use constraints with TypeVarTuple'}else{msg='cannot use bound with TypeVarTuple'}
raise_syntax_error_known_range(C,this.position,$token.value,msg)}
return transition(this.parent,token,value)}
TypeVarTupleCtx.prototype.ast=function(){var name=new ast.Name(this.name)
var ast_obj=new ast.TypeVarTuple(name)
set_position(ast_obj,this.position)
return ast_obj}
var UnaryCtx=$B.parser.UnaryCtx=function(C,op){
this.type='unary'
this.op=op
this.parent=C
this.tree=[]
this.position=$token.value
C.tree.push(this)}
UnaryCtx.prototype.ast=function(){var op={'+':ast.UAdd,'-':ast.USub,'~':ast.Invert}[this.op],ast_obj=new ast.UnaryOp(new op(),this.tree[0].ast())
set_position(ast_obj,this.position)
return ast_obj}
UnaryCtx.prototype.transition=function(token,value){var C=this
switch(token){case 'op':
if('+'==value ||'-'==value){if(C.op===value){C.op='+'}else{C.op='-'}
return C}
case 'int':
case 'float':
case 'imaginary':
if(C.parent.type=="starred"){raise_syntax_error(C,"can't use starred expression here")}
var res=new NumberCtx(token,C,value)
return res
case 'id':
return transition(new AbstractExprCtx(C,false),token,value)}
if(this.tree.length==0 ||this.tree[0].type=='abstract_expr'){raise_syntax_error(C)}
return transition(C.parent,token,value)}
var WithCtx=$B.parser.WithCtx=function(C){
this.type='with'
this.parent=C
this.position=$token.value
C.tree[C.tree.length]=this
this.tree=[]
this.expect='expr'
this.scope=get_scope(this)}
WithCtx.prototype.ast=function(){
var withitems=[],withitem
for(var withitem of this.tree){withitems.push(withitem.ast())}
var klass=this.async ? ast.AsyncWith :ast.With
var ast_obj=new klass(withitems,ast_body(this.parent))
set_position(ast_obj,this.async ? this.async.position :this.position,last_position(this))
return ast_obj}
WithCtx.prototype.transition=function(token,value){var C=this
function check_last(){var last=$B.last(C.tree)
if(last.tree.length > 1){var alias=last.tree[1]
if(alias.tree.length==0){raise_syntax_error(C,"expected ':'")}
check_assignment(alias)}}
switch(token){case '(':
case '[':
if(this.expect=='expr' && this.tree.length==0){
C.parenth=token
return C}else{raise_syntax_error(C)}
break
case 'id':
if(C.expect=='expr'){
C.expect=','
return transition(
new AbstractExprCtx(new withitem(C),false),token,value)}
raise_syntax_error(C)
case ':':
if((! C.parenth)||C.parenth=='implicit'){check_last()}
return BodyCtx(C)
case ')':
case ']':
if(C.parenth==opening[token]){if(C.expect==',' ||C.expect=='expr'){check_last()
C.expect=':'
return C}}
break
case ',':
if(C.expect==','){if(! C.parenth){C.parenth='implicit'}
check_last()
C.expect='expr'
return C}
break
case 'eol':
raise_syntax_error(C,"expected ':'")}
raise_syntax_error(C)}
WithCtx.prototype.set_alias=function(ctx){var ids=[]
if(ctx.type=="id"){ids=[ctx]}else if(ctx.type=="list_or_tuple"){
for(var expr of ctx.tree){if(expr.type=="expr" && expr.tree[0].type=="id"){ids.push(expr.tree[0])}}}}
var withitem=function(C){this.type='withitem'
this.parent=C
C.tree.push(this)
this.tree=[]
this.expect='as'
this.position=$token.value}
withitem.prototype.ast=function(){var ast_obj=new ast.withitem(this.tree[0].ast())
if(this.tree[1]){ast_obj.optional_vars=this.tree[1].tree[0].ast()
if(ast_obj.optional_vars.elts){for(var elt of ast_obj.optional_vars.elts){elt.ctx=new ast.Store()}}else{ast_obj.optional_vars.ctx=new ast.Store()}}
set_position(ast_obj,this.position)
return ast_obj}
withitem.prototype.transition=function(token,value){var C=this
if(token=='as' && C.expect=='as'){C.expect='star_target'
return new AbstractExprCtx(C,false)}else{return transition(C.parent,token,value)}
raise_syntax_error(C,"expected ':'")}
var YieldCtx=$B.parser.YieldCtx=function(C,is_await){
this.type='yield'
this.parent=C
this.tree=[]
this.is_await=is_await
this.position=$token.value
C.tree[C.tree.length]=this
if(C.type=="list_or_tuple" && C.tree.length > 1){raise_syntax_error(C,"(non-parenthesized yield)")}
if(parent_match(C,{type:"annotation"})){raise_syntax_error(C,"'yield' outside function")}
var parent=this
while(true){var list_or_tuple=parent_match(parent,{type:"list_or_tuple"})
if(list_or_tuple){parent=list_or_tuple}else{break}}
var parent=this
while(true){var set_or_dict=parent_match(parent,{type:"dict_or_set"})
if(set_or_dict){parent=set_or_dict}else{break}}
var root=get_module(this)
root.yields_func_check=root.yields_func_check ||[]
root.yields_func_check.push(this)
var scope=this.scope=get_scope(this,true),node=get_node(this)
node.has_yield=this
var in_comp=parent_match(this,{type:"comprehension"})
if(get_scope(this).id.startsWith("lc"+$B.lambda_magic)){delete node.has_yield}
if(in_comp){var outermost_expr=in_comp.tree[0].tree[1]
var parent=C
while(parent){if(parent===outermost_expr){break}
parent=parent.parent}
if(! parent){raise_syntax_error(C,"'yield' inside list comprehension")}}
var in_lambda=false,parent=C
while(parent){if(parent.type=="lambda"){in_lambda=true
this.in_lambda=true
break}
parent=parent.parent}
var parent=node.parent
while(parent){if(parent.C && parent.C.tree.length > 0 &&
parent.C.tree[0].type=="with"){scope.C.tree[0].$has_yield_in_cm=true
break}
parent=parent.parent}
if(! in_lambda){switch(C.type){case 'node':
case 'assign':
case 'list_or_tuple':
break
default:
raise_syntax_error(C,'(non-parenthesized yield)')}}}
YieldCtx.prototype.ast=function(){
var ast_obj
if(this.from){ast_obj=new ast.YieldFrom(this.tree[0].ast())}else if(this.tree.length==1){ast_obj=new ast.Yield(this.tree[0].ast())}else{ast_obj=new ast.Yield()}
set_position(ast_obj,this.position)
return ast_obj}
YieldCtx.prototype.transition=function(token,value){var C=this
if(token=='from'){
if(C.tree[0].type !='abstract_expr'){
raise_syntax_error(C,"('from' must follow 'yield')")}
C.from=true
C.from_num=$B.UUID()
return C.tree[0]}else{remove_abstract_expr(C.tree)
if(C.from && C.tree.length==0){raise_syntax_error(C)}}
return transition(C.parent,token)}
YieldCtx.prototype.check_in_function=function(){if(this.in_lambda){return}
var scope=get_scope(this),in_func=scope.is_function,func_scope=scope
if(! in_func && scope.comprehension){var parent=scope.parent_block
while(parent.comprehension){parent=parent_block}
in_func=parent.is_function
func_scope=parent}
if(in_func){var def=func_scope.C.tree[0]
if(! this.is_await){def.type='generator'}}}
function parent_match(ctx,obj){
var flag
while(ctx.parent){flag=true
for(var attr in obj){if(ctx.parent[attr]!=obj[attr]){flag=false
break}}
if(flag){return ctx.parent}
ctx=ctx.parent}
return false}
var get_previous=$B.parser.get_previous=function(C){var previous=C.node.parent.children[C.node.parent.children.length-2]
if(!previous ||!previous.C){raise_syntax_error(C,'(keyword not following correct keyword)')}
return previous.C.tree[0]}
var get_docstring=$B.parser.get_docstring=function(node){var doc_string=_b_.None
if(node.body.length > 0){var firstchild=node.body[0]
if(firstchild instanceof $B.ast.Constant &&
typeof firstchild.value=='string'){doc_string=firstchild.value}}
return doc_string}
var get_scope=$B.parser.get_scope=function(C,flag){
var ctx_node=C.parent
while(true){if(ctx_node.type==='node'){break}else if(ctx_node.comprehension){return ctx_node}
ctx_node=ctx_node.parent}
var tree_node=ctx_node.node,scope=null
while(tree_node.parent && tree_node.parent.type !=='module'){var ntype=tree_node.parent.C.tree[0].type
switch(ntype){case 'def':
case 'class':
case 'generator':
var scope=tree_node.parent
scope.ntype=ntype
scope.is_function=ntype !='class'
return scope}
tree_node=tree_node.parent}
var scope=tree_node.parent ||tree_node 
scope.ntype="module"
return scope}
var get_module=$B.parser.get_module=function(C){
var ctx_node=C instanceof NodeCtx ? C :C.parent
while(ctx_node.type !=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
if(tree_node.ntype=="module"){return tree_node}
var scope=null
while(tree_node.parent.type !='module'){tree_node=tree_node.parent}
scope=tree_node.parent 
scope.ntype="module"
return scope}
var get_node=$B.parser.get_node=function(C){var ctx=C
while(ctx.parent){ctx=ctx.parent}
return ctx.node}
var mangle_name=$B.parser.mangle_name=function(name,C){
if(name.substr(0,2)=="__" && name.substr(name.length-2)!=="__"){var klass=null,scope=get_scope(C)
while(true){if(scope.ntype=="module"){return name}else if(scope.ntype=="class"){var class_name=scope.C.tree[0].name
while(class_name.charAt(0)=='_'){class_name=class_name.substr(1)}
return '_'+class_name+name}else{if(scope.parent && scope.parent.C){scope=get_scope(scope.C.tree[0])}else{return name}}}}else{return name}}
$B.nb_debug_lines=0
var transition=$B.parser.transition=function(C,token,value){if($B.nb_debug_lines > 100){alert('too many debug lines')
$B.nb_debug_lines=0}
if($B.track_transitions){console.log("C",C,"token",token,value)
$B.nb_debug_lines++}
return C.transition(token,value)}
var s_escaped='abfnrtvxuU"0123456789'+"'"+'\\',is_escaped={}
for(var i=0;i < s_escaped.length;i++){is_escaped[s_escaped.charAt(i)]=true}
function SurrogatePair(value){
value=value-0x10000
return String.fromCharCode(0xD800 |(value >> 10))+
String.fromCharCode(0xDC00 |(value & 0x3FF))}
function test_num(num_lit){var len=num_lit.length,pos=0,char,elt=null,subtypes={b:'binary',o:'octal',x:'hexadecimal'},digits_re=/[_\d]/
function error(message){throw SyntaxError(message)}
function check(elt){if(elt.value.length==0){var t=subtypes[elt.subtype]||'decimal'
error("invalid "+t+" literal")}else if(elt.value[elt.value.length-1].match(/[\-+_]/)){var t=subtypes[elt.subtype]||'decimal'
error("invalid "+t+" literal")}else{
elt.value=elt.value.replace(/_/g,"")
elt.length=pos
return elt}}
while(pos < len){var char=num_lit[pos]
if(char.match(digits_re)){if(elt===null){elt={value:char}}else{if(char=='_' && elt.value.match(/[._+\-]$/)){
error('consecutive _ at '+pos)}else if(char=='_' && elt.subtype=='float' &&
elt.value.match(/e$/i)){
error('syntax error')}else if(elt.subtype=='b' && !(char.match(/[01_]/))){error(`invalid digit '${char}' in binary literal`)}else if(elt.subtype=='o' && !(char.match(/[0-7_]/))){error(`invalid digit '${char}' in octal literal`)}else if(elt.subtype===undefined && elt.value.startsWith("0")&&
!char.match(/[0_]/)){error("leading zeros in decimal integer literals are not"+
" permitted; use an 0o prefix for octal integers")}
elt.value+=char}
pos++}else if(char.match(/[oxb]/i)){if(elt.value=="0"){elt.subtype=char.toLowerCase()
if(elt.subtype=="x"){digits_re=/[_\da-fA-F]/}
elt.value=''
pos++}else{error("invalid char "+char)}}else if(char=='.'){if(elt===null){error("invalid char in "+num_lit+" pos "+pos+": "+char)}else if(elt.subtype===undefined){elt.subtype="float"
if(elt.value.endsWith('_')){error("invalid decimal literal")}
elt.value=elt.value.replace(/_/g,"")+char
pos++}else{return check(elt)}}else if(char.match(/e/i)){if(num_lit[pos+1]===undefined){error("nothing after e")}else if(elt && subtypes[elt.subtype]!==undefined){
error("syntax error")}else if(elt && elt.value.endsWith('_')){
error("syntax error")}else if(num_lit[pos+1].match(/[+\-0-9_]/)){if(elt && elt.value){if(elt.exp){elt.length=pos
return elt}
elt.subtype='float'
elt.value+=char
elt.exp=true
pos++}else{error("unexpected e")}}else{return check(elt)}}else if(char.match(/[\+\-]/i)){if(elt===null){elt={value:char}
pos++}else if(elt.value.search(/e$/i)>-1){elt.value+=char
pos++}else{return check(elt)}}else if(char.match(/j/i)){if(elt &&(! elt.subtype ||elt.subtype=="float")){elt.imaginary=true
check(elt)
elt.length++
return elt}else{error("invalid syntax")}}else{break}}
return check(elt)}
var opening={')':'(','}':'{',']':'['}
function check_line(token_reader,filename){var braces=[]
token_reader.position--
while(true){var token=token_reader.read()
if(! token){return false}
if(token.type=='OP' && token.string==':' && braces.length==0){return true}else if(token.type=='OP'){if('([{'.indexOf(token.string)>-1){braces.push(token)}else if(')]}'.indexOf(token.string)>-1){if(braces.length==0){var err=SyntaxError(
`unmatched '${token.string}'`)
err.offset=token.start[1]
throw err}else if($B.last(braces).string !=opening[token.string]){var err=SyntaxError("closing parenthesis "+
`'${token.string}' does not match opening `+
`parenthesis '${$B.last(braces).string}'`)
err.offset=token.start[1]
throw err}else{braces.pop()}}}else if(token.type=='NEWLINE'){return false}}
return false}
function get_first_line(src,filename){
var braces=[],token_reader=new $B.TokenReader(src,filename)
while(true){var token=token_reader.read()
if(! token){return{line:src}}
if(token.type=='OP' && token.string==':' && braces.length==0){return true}else if(token.type=='OP'){if('([{'.indexOf(token.string)>-1){braces.push(token)}else if(')]}'.indexOf(token.string)>-1){if(braces.length==0){var err=SyntaxError(
`unmatched '${token.string}'`)
err.offset=token.start[1]
throw err}else if($B.last(braces).string !=opening[token.string]){var err=SyntaxError("closing parenthesis "+
`'${token.string}' does not match opening `+
`parenthesis '${$B.last(braces).string}'`)
err.offset=token.start[1]
throw err}else{braces.pop()}}}else if(token.type=='NEWLINE'){var end=token.end,lines=src.split('\n'),match_lines=lines.slice(0,end[0]-1)
match_lines.push(lines[end[0]-1].substr(0,end[1]))
return{text:match_lines.join('\n'),newline_token:token}}}
return false}
function prepare_number(n){
if(n.startsWith('.')){if(n.endsWith("j")){return{type:'imaginary',value:prepare_number(n.substr(0,n.length-1))}}else{return{type:'float',value:n.replace(/_/g,'')}}
pos=j}else if(n.startsWith('0')&& n !='0'){
var num=test_num(n),base
if(num.imaginary){return{type:'imaginary',value:prepare_number(num.value)}}
if(num.subtype=='float'){return{type:num.subtype,value:num.value}}
if(num.subtype===undefined){base=10}else{base={'b':2,'o':8,'x':16}[num.subtype]}
if(base !==undefined){return{type:'int',value:[base,num.value]}}}else{var num=test_num(n)
if(num.subtype=="float"){if(num.imaginary){return{
type:'imaginary',value:prepare_number(num.value)}}else{return{
type:'float',value:num.value}}}else{if(num.imaginary){return{
type:'imaginary',value:prepare_number(num.value)}}else{return{
type:'int',value:[10,num.value]}}}}}
function test_escape(text,antislash_pos){
var seq_end,mo
mo=/^[0-7]{1,3}/.exec(text.substr(antislash_pos+1))
if(mo){return[String.fromCharCode(parseInt(mo[0],8)),1+mo[0].length]}
switch(text[antislash_pos+1]){case "x":
var mo=/^[0-9A-F]{0,2}/i.exec(text.substr(antislash_pos+2))
if(mo[0].length !=2){seq_end=antislash_pos+mo[0].length+1
$token.value.start[1]=seq_end
throw Error(
"(unicode error) 'unicodeescape' codec can't decode "+
`bytes in position ${antislash_pos}-${seq_end}: truncated `+
"\\xXX escape")}else{return[String.fromCharCode(parseInt(mo[0],16)),2+mo[0].length]}
case "u":
var mo=/^[0-9A-F]{0,4}/i.exec(text.substr(antislash_pos+2))
if(mo[0].length !=4){seq_end=antislash_pos+mo[0].length+1
$token.value.start[1]=seq_end
throw Error(
"(unicode error) 'unicodeescape' codec can't decode "+
`bytes in position ${antislash_pos}-${seq_end}: truncated `+
"\\uXXXX escape")}else{return[String.fromCharCode(parseInt(mo[0],16)),2+mo[0].length]}
case "U":
var mo=/^[0-9A-F]{0,8}/i.exec(text.substr(antislash_pos+2))
if(mo[0].length !=8){seq_end=antislash_pos+mo[0].length+1
$token.value.start[1]=seq_end
throw Error(
"(unicode error) 'unicodeescape' codec can't decode "+
`bytes in position ${antislash_pos}-${seq_end}: truncated `+
"\\uXXXX escape")}else{var value=parseInt(mo[0],16)
if(value > 0x10FFFF){throw Error('invalid unicode escape '+mo[0])}else if(value >=0x10000){return[SurrogatePair(value),2+mo[0].length]}else{return[String.fromCharCode(value),2+mo[0].length]}}}}
$B.test_escape=test_escape
function prepare_string(C,s,position){var len=s.length,pos=0,string_modifier,_type="string"
while(pos < len){if(s[pos]=='"' ||s[pos]=="'"){quote=s[pos]
string_modifier=s.substr(0,pos)
if(s.substr(pos,3)==quote.repeat(3)){_type="triple_string"
inner=s.substring(pos+3,s.length-3)}else{inner=s.substring(pos+quote.length,len-quote.length)}
break}
pos++}
var result={quote}
var mods={r:'raw',f:'fstring',b:'bytes'}
for(var mod of string_modifier){result[mods[mod]]=true}
var raw=C.type=='str' && C.raw,bytes=false,fstring=false,sm_length,
end=null;
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
bytes=true
raw=true
break
case 'f':
fstring=true
sm_length=1
break
case 'fr':
case 'rf':
fstring=true
sm_length=2
raw=true
break}
string_modifier=false}
var escaped=false,zone='',end=0,src=inner
while(end < src.length){if(escaped){if(src.charAt(end)=="a" && ! raw){zone=zone.substr(0,zone.length-1)+"\u0007"}else{zone+=src.charAt(end)
if(raw && src.charAt(end)=='\\'){zone+='\\'}}
escaped=false
end++}else if(src.charAt(end)=="\\"){if(raw){if(end < src.length-1 &&
src.charAt(end+1)==quote){zone+='\\\\'+quote
end+=2}else{zone+='\\\\'
end++}
escaped=true}else{if(src.charAt(end+1)=='\n'){
end+=2}else if(src.substr(end+1,2)=='N{'){
var end_lit=end+3,re=new RegExp("[-a-zA-Z0-9 ]+"),search=re.exec(src.substr(end_lit))
if(search===null){raise_syntax_error(C," (unicode error) "+
"malformed \\N character escape",pos)}
var end_lit=end_lit+search[0].length
if(src.charAt(end_lit)!="}"){raise_syntax_error(C," (unicode error) "+
"malformed \\N character escape")}
var description=search[0].toUpperCase()
if($B.unicodedb===undefined){var xhr=new XMLHttpRequest
xhr.open("GET",$B.brython_path+"unicode.txt",false)
xhr.onreadystatechange=function(){if(this.readyState==4){if(this.status==200){$B.unicodedb=this.responseText}else{console.log("Warning - could not "+
"load unicode.txt")}}}
xhr.send()}
if($B.unicodedb !==undefined){var re=new RegExp("^([0-9A-F]+);"+
description+";.*$","m")
search=re.exec($B.unicodedb)
if(search===null){raise_syntax_error(C," (unicode error) "+
"unknown Unicode character name")}
var cp=parseInt(search[1],16)
zone+=String.fromCodePoint(cp)
end=end_lit+1}else{end++}}else{try{var esc=test_escape(src,end)}catch(err){raise_syntax_error(C,err.message)}
if(esc){if(esc[0]=='\\'){zone+='\\\\'}else{zone+=esc[0]}
end+=esc[1]}else{if(end < src.length-1 &&
is_escaped[src.charAt(end+1)]===undefined){zone+='\\'}
zone+='\\'
escaped=true
end++}}}}else if(src.charAt(end)=='\n' && _type !='triple_string'){
raise_syntax_error(C,"EOL while scanning string literal")}else{zone+=src.charAt(end)
end++}}
var $string=zone,string=''
for(var i=0;i < $string.length;i++){var $car=$string.charAt(i)
if($car==quote){if(raw ||(i==0 ||
$string.charAt(i-1)!='\\')){string+='\\'}else if(_type=="triple_string"){
var j=i-1
while($string.charAt(j)=='\\'){j--}
if((i-j-1)% 2==0){string+='\\'}}}
string+=$car}
if(fstring){try{var re=new RegExp("\\\\"+quote,"g"),string_no_bs=string.replace(re,quote)
var elts=$B.parse_fstring(string_no_bs)}catch(err){raise_syntax_error(C,err.message)}}
if(bytes){result.value='b'+quote+string+quote}else if(fstring){result.value=elts}else{result.value=quote+string+quote}
C.raw=raw;
return result}
function unindent(src){
var lines=src.split('\n'),line,global_indent,indent,unindented_lines=[]
for(var line_num=0,len=lines.length;line_num < len;line_num++){line=lines[line_num]
indent=line.match(/^\s*/)[0]
if(indent !=line){
if(global_indent===undefined){
if(indent.length==0){
return src}
global_indent=indent
var start=global_indent.length
unindented_lines.push(line.substr(start))}else if(line.startsWith(global_indent)){unindented_lines.push(line.substr(start))}else{throw SyntaxError("first line starts at "+
`column ${start}, line ${line_num} at column `+
line.match(/\s*/).length+'\n    '+line)}}else{unindented_lines.push('')}}
return unindented_lines.join('\n')}
function handle_errortoken(C,token,token_reader){if(token.string=="'" ||token.string=='"'){raise_syntax_error(C,'unterminated string literal '+
`(detected at line ${token.start[0]})`)}else if(token.string=='\\'){var nxt=token_reader.read()
if((! nxt)||nxt.type=='NEWLINE'){raise_syntax_error(C,'unexpected EOF while parsing')}else{raise_syntax_error_known_range(C,nxt,nxt,'unexpected character after line continuation character')}}else if(' `$'.indexOf(token.string)==-1){var u=_b_.ord(token.string).toString(16).toUpperCase()
u='U+'+'0'.repeat(Math.max(0,4-u.length))+u
raise_syntax_error(C,`invalid character '${token.string}' (${u})`)}
raise_syntax_error(C)}
const braces_opener={")":"(","]":"[","}":"{"},braces_open="([{",braces_closer={'(':')','{':'}','[':']'}
function check_brace_is_closed(brace,reader){
var save_reader_pos=reader.position,closer=braces_closer[brace],nb_braces=1
while(true){var tk=reader.read()
if(tk.type=='OP' && tk.string==brace){nb_braces+=1}else if(tk.type=='OP' && tk.string==closer){nb_braces-=1
if(nb_braces==0){
reader.seek(save_reader_pos)
break}}}}
var python_keywords=["class","return","break","for","lambda","try","finally","raise","def","from","nonlocal","while","del","global","with","as","elif","else","if","yield","assert","import","except","raise","in","pass","with","continue","async","await"
]
var $token={}
var dispatch_tokens=$B.parser.dispatch_tokens=function(root){var src=root.src
root.token_reader=new $B.TokenReader(src,root.filename)
var braces_stack=[]
var unsupported=[]
var $indented=["class","def","for","condition","single_kw","try","except","with","match","case" 
]
var module=root.module
var lnum=root.line_num===undefined ? 1 :root.line_num
var node=new $Node()
node.line_num=lnum
root.add(node)
var C=null,expect_indent=false,indent=0
var line2pos={0:0,1:0},line_num=1
for(var pos=0,len=src.length;pos < len;pos++){if(src[pos]=='\n'){line_num++
line2pos[line_num]=pos+1}}
while(true){try{var token=root.token_reader.read()}catch(err){C=C ||new NodeCtx(node)
if(err.type=='IndentationError'){raise_indentation_error(C,err.message)}else if(err instanceof SyntaxError){if(braces_stack.length > 0){var last_brace=$B.last(braces_stack),start=last_brace.start
$token.value=last_brace
raise_syntax_error(C,`'${last_brace.string}'`+
' was never closed')}
var err_msg=err.message
if(err_msg=='EOF in multi-line statement'){err_msg='unexpected EOF while parsing'}
if(err.lineno){raise_error_known_location(_b_.SyntaxError,root.filename,err.lineno,err.col_offset,err.end_lineno,err.end_col_offset,err.line,err.message)}else{raise_syntax_error(C,err_msg)}}
throw err}
if(! token){throw Error('token done without ENDMARKER.')}
$token.value=token
if(token[2]===undefined){console.log('token incomplet',token,'module',module,root)
console.log('src',src)}
if(token.start===undefined){console.log('no start',token)}
lnum=token.start[0]
if(expect_indent &&
['INDENT','COMMENT','NL'].indexOf(token.type)==-1){C=C ||new NodeCtx(node)
raise_indentation_error(C,"expected an indented block",expect_indent)}
switch(token.type){case 'ENDMARKER':
if(root.yields_func_check){for(const _yield of root.yields_func_check){$token.value=_yield.position
_yield.check_in_function()}}
if(indent !=0){raise_indentation_error(node.C,'expected an indented block')}
if(node.C===undefined ||node.C.tree.length==0){node.parent.children.pop()}
return
case 'ENCODING':
case 'TYPE_COMMENT':
continue
case 'NL':
if((! node.C)||node.C.tree.length==0){node.line_num++}
continue
case 'COMMENT':
var end=line2pos[token.end[0]]+token.end[1]
continue
case 'ERRORTOKEN':
C=C ||new NodeCtx(node)
if(token.string !=' '){handle_errortoken(C,token,root.token_reader)}
continue}
switch(token[0]){case 'NAME':
case 'NUMBER':
case 'OP':
case 'STRING':
case 'FSTRING_START':
C=C ||new NodeCtx(node)}
switch(token[0]){case 'NAME':
var name=token[1]
if(python_keywords.indexOf(name)>-1){if(unsupported.indexOf(name)>-1){raise_syntax_error(C,"(Unsupported Python keyword '"+name+"')")}
C=transition(C,name)}else if(name=='not'){C=transition(C,'not')}else if(typeof $operators[name]=='string'){
C=transition(C,'op',name)}else{C=transition(C,'id',name)}
continue
case 'OP':
var op=token[1]
if((op.length==1 && '()[]{}.,='.indexOf(op)>-1)||
[':='].indexOf(op)>-1){if(braces_open.indexOf(op)>-1){braces_stack.push(token)
try{check_brace_is_closed(op,root.token_reader)}catch(err){if(err.message=='EOF in multi-line statement'){raise_syntax_error(C,`'${op}' was never closed`)}else{throw err}}}else if(braces_opener[op]){if(braces_stack.length==0){raise_syntax_error(C,"(unmatched '"+op+"')")}else{var last_brace=$B.last(braces_stack)
if(last_brace.string==braces_opener[op]){braces_stack.pop()}else{raise_syntax_error(C,`closing parenthesis '${op}' does not `+
`match opening parenthesis '`+
`${last_brace.string}'`)}}}
C=transition(C,token[1])}else if(op==':'){C=transition(C,':')
if(C.node && C.node.is_body_node){node=C.node}}else if(op=='...'){C=transition(C,'ellipsis')}else if(op=='->'){C=transition(C,'annotation')}else if(op==';'){if(C.type=='node' && C.tree.length==0){raise_syntax_error(C,'(statement cannot start with ;)')}
transition(C,'eol')
var new_node=new $Node()
new_node.line_num=token[2][0]+1
C=new NodeCtx(new_node)
node.parent.add(new_node)
node=new_node}else if($augmented_assigns[op]){C=transition(C,'augm_assign',op)}else{C=transition(C,'op',op)}
continue
case 'STRING':
var prepared=prepare_string(C,token[1],token[2])
if(prepared.value instanceof Array){C=transition(C,'JoinedStr',prepared.value)}else{C=transition(C,'str',prepared.value)}
continue
case 'FSTRING_START':
C=transition(C,'JoinedStr',token[1])
break
case 'FSTRING_MIDDLE':
C=transition(C,'middle',token[1])
break
case 'FSTRING_END':
C=transition(C,'end',token[1])
break
case 'NUMBER':
try{var prepared=prepare_number(token[1])}catch(err){raise_syntax_error(C,err.message)}
C=transition(C,prepared.type,prepared.value)
continue
case 'NEWLINE':
if(C && C.node && C.node.is_body_node){expect_indent=C.node.parent}
C=C ||new NodeCtx(node)
transition(C,'eol')
var new_node=new $Node()
new_node.line_num=token[2][0]+1
if(node.parent.children.length > 0 &&
node.parent.children[0].is_body_node){node.parent.parent.add(new_node)}else{node.parent.add(new_node)}
C=new NodeCtx(new_node)
node=new_node
continue
case 'DEDENT':
indent--
if(! indent_continuation){node.parent.children.pop()
node.parent.parent.add(node)
C=new NodeCtx(node)}
continue
case 'INDENT':
indent++
var indent_continuation=false
if(! expect_indent){if(token.line.trim()=='\\'){
indent_continuation=true}else{C=C ||new NodeCtx(node)
raise_indentation_error(C,'unexpected indent')}}
expect_indent=false
continue}}}
var create_root_node=$B.parser.create_root_node=function(src,module,locals_id,parent_block,line_num){var root=new $Node('module')
root.module=module
root.id=locals_id
root.parent_block=parent_block
root.line_num=line_num
root.indent=-1
root.imports={}
if(typeof src=="object"){root.is_comp=src.is_comp
root.filename=src.filename
src=src.src}
src=src.replace(/\r\n/gm,"\n")
root.src=src
return root}
$B.py2js=function(src,module,locals_id,parent_scope){
if(typeof module=="object"){var __package__=module.__package__
module=module.__name__}else{var __package__=""}
parent_scope=parent_scope ||$B.builtins_scope
var t0=Date.now(),ix,
filename,imported
if(typeof src=='object'){var ix=src.ix,filename=src.filename,imported=src.imported
src=src.src}
var locals_is_module=Array.isArray(locals_id)
if(locals_is_module){locals_id=locals_id[0]}
if($B.parser_to_ast){console.log('use parser to ast')
var _ast=new $B.Parser(src,filename,'file').parse()}else{var root=create_root_node({src,filename},module,locals_id,parent_scope)
dispatch_tokens(root)
var _ast=root.ast()}
var future=$B.future_features(_ast,filename)
var symtable=$B._PySymtable_Build(_ast,filename,future)
var js_obj=$B.js_from_root({ast:_ast,symtable,filename,imported})
var js_from_ast=js_obj.js
return{
_ast,imports:js_obj.imports,to_js:function(){return js_from_ast}}}
$B.parse_options=function(options){
if(options===undefined){options={}}else if(typeof options=='number'){
options={debug:options}}else if(typeof options !=='object'){console.warn('ignoring invalid argument passed to brython():',options)
options={}}
$B.debug=options.debug===undefined ? 1 :options.debug
_b_.__debug__=$B.debug > 0
options.python_extension=options.python_extension ||'.py'
if($B.$options.args){$B.__ARGV=$B.$options.args}else{$B.__ARGV=_b_.list.$factory([])}
$B.options_parsed=true
return options}
if(!($B.isWebWorker ||$B.isNode)){var startup_observer=new MutationObserver(function(mutations){for(var mutation of mutations){for(var addedNode of mutation.addedNodes){addPythonScript(addedNode);}}});
startup_observer.observe(document.documentElement,{childList:true,subtree:true});}
var brython_options={}
var python_scripts=[]
if(typeof document !=='undefined'){
python_scripts=python_scripts.concat(Array.from(
document.querySelectorAll('script[type="text/python"]'))).concat(
Array.from(
document.querySelectorAll('script[type="text/python3"]')))
var onload
addEventListener('DOMContentLoaded',function(ev){if(ev.target.body){onload=ev.target.body.onload}
if(! onload){
ev.target.body.onload=function(ev){return brython()}}else{
ev.target.body.onload=function(ev){onload()
if(! status.brython_called){brython()}}}}
)
class BrythonOptions extends HTMLElement{
constructor(){super()}
connectedCallback(){for(var attr of this.getAttributeNames()){brython_options[attr]=convert_option(attr,this.getAttribute(attr))}}}
customElements.define('brython-options',BrythonOptions)}
var inject={},defined_ids={},script_to_id=new Map(),id_to_script={}
function addPythonScript(addedNode){
if(addedNode.tagName=='SCRIPT' &&
(addedNode.type=="text/python" ||
addedNode.type=="text/python3")){python_scripts.push(addedNode)}}
function Injected(id){this.id=id}
var status={brython_called:false,first_unnamed_script:true}
$B.dispatch_load_event=function(script){
script.dispatchEvent(new Event('load'))}
function injectPythonScript(addedNode){
if(addedNode.tagName=='SCRIPT' && addedNode.type=="text/python"){set_script_id(addedNode)
run_scripts([addedNode])}}
function set_script_id(script){if(script_to_id.has(script)){}else if(script.id){if(defined_ids[script.id]){throw Error("Brython error : Found 2 scripts with the "+
"same id '"+script.id+"'")}else{defined_ids[script.id]=true}
script_to_id.set(script,script.id)}else{if(script.className==='webworker'){throw _b_.AttributeError.$factory(
"webworker script has no attribute 'id'")}
if(status.first_unnamed_script){script_to_id.set(script,'__main__')
status.first_unnamed_script=false}else{script_to_id.set(script,'__main__'+$B.UUID())}}
var id=script_to_id.get(script)
id_to_script[id]=script
return id}
var brython=$B.parser.brython=function(options){$B.$options=$B.parse_options(options)
if(!($B.isWebWorker ||$B.isNode)){if(! status.brython_called){
status.brython_called=true
startup_observer.disconnect()
var inject_observer=new MutationObserver(function(mutations){for(var mutation of mutations){for(var addedNode of mutation.addedNodes){injectPythonScript(addedNode);}}})
inject_observer.observe(document.documentElement,{childList:true,subtree:true})}}else if($B.isNode){return}
for(var python_script of python_scripts){set_script_id(python_script)}
var scripts=[],webworkers=[]
var $href=$B.script_path=_window.location.href.split('#')[0],$href_elts=$href.split('/')
$href_elts.pop()
if($B.isWebWorker ||$B.isNode){$href_elts.pop()}
$B.curdir=$href_elts.join('/')
var kk=Object.keys(_window)
var ids=$B.get_page_option('ids')||$B.get_page_option('ipy_id')
if(ids !==undefined){if(! Array.isArray(ids)){throw _b_.ValueError.$factory("ids is not a list")}
if(ids.length==0){}
for(var id of ids){var script=document.querySelector(`script[id="${id}"]`)
if(script){set_script_id(script)
scripts.push(script)}else{console.log(`no script with id '${id}'`)
throw _b_.KeyError.$factory(`no script with id '${id}'`)}}}else if($B.isWebWorker){}else{var scripts=python_scripts.slice()}
var module_name
if($B.get_page_option('ipy_id')!==undefined){run_brython_magic(scripts)}else{run_scripts(scripts)}}
function convert_option(option,value){
if(option=='debug'){if(typeof value=='string' && value.match(/^\d+$/)){return parseInt(value)}else{if(value !==null && value !==undefined){console.debug(`Invalid value for debug: ${value}`)}}}else if(option=='cache' ||
option=='indexeddb' ||
option=='static_stdlib_import'){if(value=='1' ||value.toLowerCase()=='true'){return true}else if(value=='0' ||value.toLowerCase()=='false'){return false}else{console.debug(`Invalid value for ${option}: ${value}`)}}else if(option=='ids' ||option=='pythonpath' ||option=='args'){
if(typeof value=='string'){if(value.trim().length==0){return[]}
return value.trim().split(/\s+/)}}
return default_value[option]}
const default_option={args:[],cache:false,debug:1,indexeddb:true,python_extension:'.py',static_stdlib_import:true}
$B.get_filename=function(){if($B.count_frames()> 0){return $B.get_frame_at(0).__file__}}
$B.get_filename_for_import=function(){var filename=$B.get_filename()
if($B.import_info[filename]===undefined){$B.make_import_paths(filename)}
return filename}
$B.get_page_option=function(option){
if($B.$options.hasOwnProperty(option)){
return $B.$options[option]}else if(brython_options.hasOwnProperty(option.toLowerCase())){
return brython_options[option.toLowerCase()]}else{return default_option[option]}}
$B.get_option=function(option,err){var filename=$B.script_filename
if(err && err.$frame_obj !==null){filename=$B.get_frame_at(0,err.$frame_obj).__file__}else{filename=$B.get_filename()}
return $B.get_option_from_filename(option,filename)}
$B.get_option_from_filename=function(option,filename){if((! filename)||! $B.scripts[filename]){return $B.get_page_option(option)}
var value=$B.scripts[filename].getAttribute(option)
if(value !==null){return convert_option(option,value)}else{return $B.get_page_option(option)}}
function run_scripts(scripts){
var webworkers=scripts.filter(script=> script.className==='webworker'),scripts=scripts.filter(script=> script.className !=='webworker')
var module_name
if(scripts.length > 0 ||$B.isWebWorker){if($B.get_page_option('indexedDB')&& $B.has_indexedDB &&
$B.hasOwnProperty("VFS")){$B.tasks.push([$B.idb_open])}}
var src
for(var worker of webworkers){if(worker.src){
$B.tasks.push([$B.ajax_load_script,{script:worker,name:worker.id,url:worker.src,is_ww:true}])}else{
var source=(worker.innerText ||worker.textContent)
source=unindent(source)
source=source.replace(/^\n/,'')
$B.webworkers[worker.id]=worker
var filename=$B.script_filename=$B.script_path+"#"+worker.id
$B.url2name[filename]=worker.id
$B.file_cache[filename]=source
$B.scripts[filename]=worker
$B.dispatch_load_event(worker)}}
for(var script of scripts){module_name=script_to_id.get(script)
if(script.src){
$B.tasks.push([$B.ajax_load_script,{script,name:module_name,url:script.src,id:script.id}])}else{
src=(script.innerHTML ||script.textContent)
src=unindent(src)
src=src.replace(/^\n/,'')
if(src.endsWith('\n')){src=src.substr(0,src.length-1)}
var filename=$B.script_filename=$B.script_path+"#"+module_name
$B.file_cache[filename]=src
$B.url2name[filename]=module_name
$B.scripts[filename]=script
$B.tasks.push([$B.run_script,script,src,module_name,filename,true])}}
$B.loop()}
function run_brython_magic(scripts){
module_name='__main__'
var src="",js,root
for(var script of scripts){src+=(script.innerHTML ||script.textContent)}
try{
root=$B.py2js(src,module_name,module_name)
js=root.to_js()
if($B.debug > 1){$log(js)}
eval(js)
root=null
js=null}catch($err){root=null
js=null
console.log($err)
if($B.debug > 1){console.log($err)
for(var attr in $err){console.log(attr+' : ',$err[attr])}}
if($err.$py_error===undefined){console.log('Javascript error',$err)
$err=_b_.RuntimeError.$factory($err+'')}
var $trace=$B.$getattr($err,'info')+'\n'+$err.__name__+
': '+$err.args
try{$B.$getattr($B.get_stderr(),'write')($trace)}catch(print_exc_err){console.log($trace)}
throw $err}}
$B.run_script=function(script,src,name,url,run_loop){
var script_elts=url.split('/')
script_elts.pop()
$B.script_dir=script_elts.join('/')
$B.file_cache[url]=src
$B.url2name[url]=name
$B.scripts[url]=script
$B.make_import_paths(url)
_b_.__debug__=$B.get_option('debug')> 0
try{var root=$B.py2js({src:src,filename:url},name,name),js=root.to_js(),script={__doc__:get_docstring(root._ast),js:js,__name__:name,__file__:url}
if($B.get_option_from_filename('debug',url)> 1){console.log($B.format_indent(js,0))}}catch(err){return $B.handle_error(err)}
if($B.hasOwnProperty("VFS")&& $B.has_indexedDB){
var imports1=Object.keys(root.imports).slice(),imports=imports1.filter(function(item){return $B.VFS.hasOwnProperty(item)})
for(var name of Object.keys(imports)){if($B.VFS.hasOwnProperty(name)){var submodule=$B.VFS[name],type=submodule[0]
if(type==".py"){var src=submodule[1],subimports=submodule[2],is_package=submodule.length==4
if(type==".py"){
required_stdlib_imports(subimports)}
for(var mod of subimports){if(imports.indexOf(mod)==-1){imports.push(mod)}}}}}
for(var j=0;j < imports.length;j++){$B.tasks.push([$B.inImported,imports[j]])}
root=null}
$B.tasks.push(["execute",script])
if(run_loop){$B.loop()}}
var $log=$B.$log=function(js){js.split("\n").forEach(function(line,i){console.log(i+1,":",line)})}
$B.$operators=$operators
$B.$Node=$Node
$B.brython=brython})(__BRYTHON__)
var brython=__BRYTHON__.brython
if(__BRYTHON__.isNode){global.__BRYTHON__=__BRYTHON__
module.exports={__BRYTHON__ }}
;

(function($B){var _b_=$B.builtins
if($B.VFS_timestamp && $B.VFS_timestamp > $B.timestamp){
$B.timestamp=$B.VFS_timestamp}
function idb_load(evt,module){
var res=evt.target.result
var timestamp=$B.timestamp,debug=$B.get_page_option('debug')
if(res===undefined ||res.timestamp !=$B.timestamp ||
($B.VFS[module]&& res.source_ts !==$B.VFS[module].timestamp)){
if($B.VFS[module]!==undefined){var elts=$B.VFS[module],ext=elts[0],source=elts[1]
if(ext==".py"){var imports=elts[2],is_package=elts.length==4,source_ts=elts.timestamp,__package__
if(is_package){__package__=module}
else{var parts=module.split(".")
parts.pop()
__package__=parts.join(".")}
$B.imported[module]=$B.module.$factory(module,"",__package__)
$B.url2name[module]=module
try{var root=$B.py2js(
{src:source,filename:module},module,module),js=root.to_js()}catch(err){$B.handle_error(err)}
delete $B.imported[module]
if(debug > 1){console.log("precompile",module)}}else{console.log('bizarre',module,ext)}}else{}}else{
if(res.is_package){$B.precompiled[module]=[res.content]}else{$B.precompiled[module]=res.content}
if(res.imports.length > 0){
if(debug > 1){console.log(module,"imports",res.imports)}
var subimports=res.imports.split(",")
for(var i=0;i < subimports.length;i++){var subimport=subimports[i]
if(subimport.startsWith(".")){
var url_elts=module.split("."),nb_dots=0
while(subimport.startsWith(".")){nb_dots++
subimport=subimport.substr(1)}
var elts=url_elts.slice(0,nb_dots)
if(subimport){elts=elts.concat([subimport])}
subimport=elts.join(".")}
if(!$B.imported.hasOwnProperty(subimport)&&
!$B.precompiled.hasOwnProperty(subimport)){
if($B.VFS.hasOwnProperty(subimport)){var submodule=$B.VFS[subimport],ext=submodule[0],source=submodule[1]
if(submodule[0]==".py"){$B.tasks.splice(0,0,[idb_get,subimport])}else{add_jsmodule(subimport,source)}}}}}}
loop()}
function store_precompiled(module,js,source_ts,imports,is_package){
var db=$B.idb_cx.result,tx=db.transaction("modules","readwrite"),store=tx.objectStore("modules"),cursor=store.openCursor(),data={"name":module,"content":js,"imports":imports,"origin":origin,"timestamp":__BRYTHON__.timestamp,"source_ts":source_ts,"is_package":is_package},request=store.put(data)
if($B.get_page_option('debug')> 1){console.log("store precompiled",module,"package",is_package)}
document.dispatchEvent(new CustomEvent('precompile',{detail:'cache module '+module}))
var ix=$B.outdated.indexOf(module)
if(ix >-1){$B.outdated.splice(ix,1)}
request.onsuccess=function(evt){
$B.tasks.splice(0,0,[idb_get,module])
loop()}}
function idb_get(module){
var db=$B.idb_cx.result,tx=db.transaction("modules","readonly")
try{var store=tx.objectStore("modules")
req=store.get(module)
req.onsuccess=function(evt){idb_load(evt,module)}}catch(err){console.info('error',err)}}
$B.idb_open_promise=function(){return new Promise(function(resolve,reject){$B.idb_name="brython-cache"
var idb_cx=$B.idb_cx=indexedDB.open($B.idb_name)
idb_cx.onsuccess=function(){var db=idb_cx.result
if(!db.objectStoreNames.contains("modules")){var version=db.version
db.close()
idb_cx=indexedDB.open($B.idb_name,version+1)
idb_cx.onupgradeneeded=function(){var db=$B.idb_cx.result,store=db.createObjectStore("modules",{"keyPath":"name"})
store.onsuccess=resolve}
idb_cx.onsuccess=function(){var db=idb_cx.result,store=db.createObjectStore("modules",{"keyPath":"name"})
store.onsuccess=resolve}}else{
var tx=db.transaction("modules","readwrite"),store=tx.objectStore("modules"),record,outdated=[]
var openCursor=store.openCursor()
openCursor.onerror=function(evt){reject("open cursor error")}
openCursor.onsuccess=function(evt){cursor=evt.target.result
if(cursor){record=cursor.value
if(record.timestamp==$B.timestamp){if(!$B.VFS ||!$B.VFS[record.name]||
$B.VFS[record.name].timestamp==record.source_ts){
if(record.is_package){$B.precompiled[record.name]=[record.content]}else{$B.precompiled[record.name]=record.content}}else{
outdated.push(record.name)}}else{outdated.push(record.name)}
cursor.continue()}else{$B.outdated=outdated
resolve()}}}}
idb_cx.onupgradeneeded=function(){var db=idb_cx.result,store=db.createObjectStore("modules",{"keyPath":"name"})
store.onsuccess=resolve}
idb_cx.onerror=function(){
$B.idb_cx=null
$B.idb_name=null
$B.$options.indexedDB=false
reject('could not open indexedDB database')}})}
$B.idb_open=function(obj){$B.idb_name="brython-cache"
var idb_cx=$B.idb_cx=indexedDB.open($B.idb_name)
idb_cx.onsuccess=function(){var db=idb_cx.result
if(! db.objectStoreNames.contains("modules")){var version=db.version
db.close()
console.info('create object store',version)
idb_cx=indexedDB.open($B.idb_name,version+1)
idb_cx.onupgradeneeded=function(){console.info("upgrade needed")
var db=$B.idb_cx.result,store=db.createObjectStore("modules",{"keyPath":"name"})
store.onsuccess=loop}
idb_cx.onversionchanged=function(){console.log("version changed")}
idb_cx.onsuccess=function(){console.info("db opened",idb_cx)
var db=idb_cx.result,store=db.createObjectStore("modules",{"keyPath":"name"})
store.onsuccess=loop}}else{if($B.get_page_option('debug')> 1){console.info("using indexedDB for stdlib modules cache")}
var tx=db.transaction("modules","readwrite"),store=tx.objectStore("modules"),record,outdated=[]
var openCursor=store.openCursor()
openCursor.onerror=function(evt){console.log("open cursor error",evt)}
openCursor.onsuccess=function(evt){cursor=evt.target.result
if(cursor){record=cursor.value
if(record.timestamp==$B.timestamp){if(!$B.VFS ||!$B.VFS[record.name]||
$B.VFS[record.name].timestamp==record.source_ts){
if(record.is_package){$B.precompiled[record.name]=[record.content]}else{$B.precompiled[record.name]=record.content}
if($B.get_page_option('debug')> 1){console.info("load from cache",record.name)}}else{
outdated.push(record.name)}}else{outdated.push(record.name)}
cursor.continue()}else{if($B.get_page_option('debug')> 1){console.log("done")}
$B.outdated=outdated
loop()}}}}
idb_cx.onupgradeneeded=function(){console.info("upgrade needed")
var db=idb_cx.result,store=db.createObjectStore("modules",{"keyPath":"name"})
store.onsuccess=loop}
idb_cx.onerror=function(){console.info('could not open indexedDB database')
$B.idb_cx=null
$B.idb_name=null
$B.$options.indexedDB=false
loop()}}
$B.ajax_load_script=function(s){var script=s.script,url=s.url,name=s.name,rel_path=url.substr($B.script_dir.length+1)
if($B.files && $B.files.hasOwnProperty(rel_path)){
var src=atob($B.files[rel_path].content)
$B.tasks.splice(0,0,[$B.run_script,script,src,name,url,true])
loop()}else if($B.protocol !="file"){$B.script_filename=url
$B.scripts[url]=script
var req=new XMLHttpRequest(),cache=$B.get_option('cache'),qs=cache ? '' :
(url.search(/\?/)>-1 ? '&' :'?')+Date.now()
req.open("GET",url+qs,true)
req.onreadystatechange=function(){if(this.readyState==4){if(this.status==200){var src=this.responseText
if(s.is_ww){$B.webworkers[name]=script
$B.file_cache[url]=src
$B.dispatch_load_event(script)}else{$B.tasks.splice(0,0,[$B.run_script,script,src,name,url,true])}
loop()}else if(this.status==404){throw Error(url+" not found")}}}
req.send()}else{throw _b_.IOError.$factory("can't load external script at "+
script.url+" (Ajax calls not supported with protocol file:///)")}}
function add_jsmodule(module,source){
source+="\nvar $locals_"+
module.replace(/\./g,"_")+" = $module"
$B.precompiled[module]=source}
var inImported=$B.inImported=function(module){if($B.imported.hasOwnProperty(module)){}else if(__BRYTHON__.VFS && __BRYTHON__.VFS.hasOwnProperty(module)){var elts=__BRYTHON__.VFS[module]
if(elts===undefined){console.log('bizarre',module)}
var ext=elts[0],source=elts[1],is_package=elts.length==4
if(ext==".py"){if($B.idb_cx && !$B.idb_cx.$closed){$B.tasks.splice(0,0,[idb_get,module])}}else{add_jsmodule(module,source)}}else{console.log("bizarre",module)}
loop()}
function report_precompile(mod){if(typeof document !=='undefined'){document.dispatchEvent(new CustomEvent('precompile',{detail:'remove outdated '+mod+
' from cache'}))}}
function report_close(){if(typeof document !=='undefined'){document.dispatchEvent(new CustomEvent('precompile',{detail:"close"}))}}
function report_done(mod){if(typeof document !=='undefined'){document.dispatchEvent(new CustomEvent("brython_done",{detail:$B.obj_dict($B.$options)}))}}
var loop=$B.loop=function(){if($B.tasks.length==0){
if($B.idb_cx && ! $B.idb_cx.$closed){var db=$B.idb_cx.result,tx=db.transaction("modules","readwrite"),store=tx.objectStore("modules")
while($B.outdated.length > 0){var module=$B.outdated.pop(),req=store.delete(module)
req.onsuccess=(function(mod){return function(event){if($B.get_page_option('debug')> 1){console.info("delete outdated",mod)}
report_precompile(mod)}})(module)}
report_close()
$B.idb_cx.result.close()
$B.idb_cx.$closed=true}
report_done()
return}
var task=$B.tasks.shift(),func=task[0],args=task.slice(1)
if(func=="execute"){try{var script=task[1],script_id=script.__name__.replace(/\./g,"_"),module=$B.module.$factory(script.__name__)
module.__file__=script.__file__
module.__doc__=script.__doc__
$B.imported[script_id]=module
var module=new Function(script.js+`\nreturn locals`)()
for(var key in module){if(! key.startsWith('$')){$B.imported[script_id][key]=module[key]}}}catch(err){
if(err.__class__===undefined){if(err.$py_exc){err=err.$py_exc}else{$B.freeze(err)
var stack=err.$stack,frame_obj=err.$frame_obj,linenums=err.$linenums
var lineNumber=err.lineNumber
if(lineNumber !==undefined){console.log('around line',lineNumber)
console.log(script.js.split('\n').
slice(lineNumber-4,lineNumber).join('\n'))}
$B.print_stack()
err=_b_.RuntimeError.$factory(err+'')
err.$stack=stack
err.$frame_obj=frame_obj
err.$linenums=linenums}}
$B.handle_error(err)}
loop()}else{
try{func.apply(null,args)}catch(err){$B.handle_error(err)}}}
$B.tasks=[]
$B.has_indexedDB=self.indexedDB !==undefined
function required_stdlib_imports(imports,start){
var nb_added=0
start=start ||0
for(var i=start;i < imports.length;i++){var module=imports[i]
if($B.imported.hasOwnProperty(module)){continue}
var mod_obj=$B.VFS[module]
if(mod_obj===undefined){console.log("undef",module)}
if(mod_obj[0]==".py"){var subimports=mod_obj[2]
subimports.forEach(function(subimport){if(!$B.imported.hasOwnProperty(subimport)&&
imports.indexOf(subimport)==-1){if($B.VFS.hasOwnProperty(subimport)){imports.push(subimport)
nb_added++}}})}}
if(nb_added){required_stdlib_imports(imports,imports.length-nb_added)}
return imports}})(__BRYTHON__)
;
;(function($B){var _b_=$B.builtins,_window=self,isWebWorker=('undefined' !==typeof WorkerGlobalScope)&&
("function"===typeof importScripts)&&
(navigator instanceof WorkerNavigator)
function missing_required_kwonly(fname,args){var plural=args.length==1 ? '' :'s',arg_list
args=args.map(x=> `'${x}'`)
if(args.length==1){arg_list=args[0]}else if(args.length==2){arg_list=args[0]+' and '+args[1]}else{arg_list=args.slice(0,args.length-1).join(', ')+', and '+
args[args.length-1]}
throw _b_.TypeError.$factory(fname+'() '+
`missing ${args.length} required keyword-only argument${plural}: `+
arg_list)}
function missing_required_pos(fname,args){var plural=args.length==1 ? '' :'s',arg_list
args=args.map(x=> `'${x}'`)
if(args.length==1){arg_list=args[0]}else if(args.length==2){arg_list=args[0]+' and '+args[1]}else{arg_list=args.slice(0,args.length-1).join(', ')+', and '+
args[args.length-1]}
throw _b_.TypeError.$factory(fname+'() '+
`missing ${args.length} required positional argument${plural}: `+
arg_list)}
function multiple_values(fname,arg){throw _b_.TypeError.$factory(fname+'() '+
`got multiple values for argument '${arg}'`)}
function pos_only_passed_as_keyword(fname,arg){return _b_.TypeError.$factory(fname+
`() got some positional-only arguments passed as keyword arguments:`+
` '${arg}'`)}
function too_many_pos_args(fname,kwarg,arg_names,nb_kwonly,defaults,args,slots){var nb_pos=args.length,last=$B.last(args)
if(last.$kw){
if(! kwarg){var kw=$B.parse_kwargs(last.$kw,fname)
for(var k in kw){if(! slots.hasOwnProperty(k)){throw unexpected_keyword(fname,k)}}}
nb_pos--}
var nb_def=defaults.length
var expected=arg_names.length-nb_kwonly,plural=expected==1 ? '' :'s'
if(nb_def){expected=`from ${expected - nb_def} to ${expected}`
plural='s'}
var verb=nb_pos==1 ? 'was' :'were'
return _b_.TypeError.$factory(fname+'() takes '+
`${expected} positional argument${plural} but ${nb_pos} ${verb} given`)}
function unexpected_keyword(fname,k){return _b_.TypeError.$factory(fname+
`() got an unexpected keyword argument '${k}'`)}
var empty={}
function args0(f,args){
var arg_names=f.$infos.arg_names,code=f.$infos.__code__,slots={}
for(var arg_name of arg_names){slots[arg_name]=empty}
return $B.parse_args(
args,f.$infos.__name__,code.co_argcount,slots,arg_names,f.$infos.__defaults__,f.$infos.__kwdefaults__,f.$infos.vararg,f.$infos.kwarg,code.co_posonlyargcount,code.co_kwonlyargcount)}
function args0_NEW(fct,args){
const HAS_KW=args[args.length-1]?.$kw !==undefined
let ARGS_POS_COUNT=args.length,ARGS_NAMED=null;
if(HAS_KW){--ARGS_POS_COUNT
ARGS_NAMED=args[ARGS_POS_COUNT].$kw}
const result={}
const $INFOS=fct.$infos,$CODE=$INFOS.__code__,PARAMS_NAMES=$INFOS.arg_names,PARAMS_POS_COUNT=$CODE.co_argcount,PARAMS_NAMED_COUNT=$CODE.co_kwonlyargcount,PARAMS_VARARGS_NAME=$INFOS.vararg,PARAMS_KWARGS_NAME=$INFOS.kwarg,PARAMS_POS_DEFAULTS=$INFOS.__defaults__,PARAMS_POS_DEFAULTS_COUNT=PARAMS_POS_DEFAULTS.length,PARAMS_POS_DEFAULTS_OFFSET=PARAMS_POS_COUNT-PARAMS_POS_DEFAULTS_COUNT
const min=Math.min(ARGS_POS_COUNT,PARAMS_POS_COUNT)
let offset=0
for(;offset < min;++offset){result[PARAMS_NAMES[offset]]=args[offset]}
if(PARAMS_VARARGS_NAME !==null ){
result[PARAMS_VARARGS_NAME]=$B.fast_tuple(
Array.prototype.slice.call(args,PARAMS_POS_COUNT,ARGS_POS_COUNT ));}else if(ARGS_POS_COUNT > PARAMS_POS_COUNT){args0(fct,args)
throw new Error('Too much positional arguments given (args0 should have raised an error) !')}
if(ARGS_NAMED===null){
if(offset < PARAMS_POS_DEFAULTS_OFFSET){args0(fct,args)
throw new Error('Not enough positional arguments given (args0 should have raised an error) !')}
for(let i=offset-PARAMS_POS_DEFAULTS_OFFSET;
i < PARAMS_POS_DEFAULTS_COUNT;
++i){result[PARAMS_NAMES[offset++]]=PARAMS_POS_DEFAULTS[i]}
if(PARAMS_KWARGS_NAME !==null){result[PARAMS_KWARGS_NAME]=$B.obj_dict({})}
if(PARAMS_NAMED_COUNT===0 ){return result}
let kwargs_defaults=$INFOS.__kwdefaults__.$jsobj
if(kwargs_defaults===undefined ||kwargs_defaults===null){kwargs_defaults=$INFOS.__kwdefaults__.$strings
if(kwargs_defaults===undefined ||kwargs_defaults===null){args0(fct,args)
throw new Error('Named argument expected (args0 should have raised an error) !')}}
const named_default_values=Object.values(kwargs_defaults),
nb_named_defaults=named_default_values.length
if(nb_named_defaults < PARAMS_NAMED_COUNT){args0(fct,args)
throw new Error('Named argument expected (args0 should have raised an error) !')}
for(let i=0;i < nb_named_defaults;++i){result[PARAMS_NAMES[offset++]]=named_default_values[i]}
return result}
let kwargs_defaults=$INFOS.__kwdefaults__.$jsobj;
if(kwargs_defaults===undefined ||kwargs_defaults==null){kwargs_defaults=$INFOS.__kwdefaults__.$strings
if(kwargs_defaults===undefined ||kwargs_defaults==null ){kwargs_defaults={}}}
const PARAMS_POSONLY_COUNT=$CODE.co_posonlyargcount,PARAMS_POS_DEFAULTS_MAXID=PARAMS_POS_DEFAULTS_COUNT+
PARAMS_POS_DEFAULTS_OFFSET
if(offset < PARAMS_POSONLY_COUNT){if(offset < PARAMS_POS_DEFAULTS_OFFSET){args0(fct,args)
throw new Error('Not enough positional parameters given (args0 should have raised an error) !')}
const max=PARAMS_POS_DEFAULTS_COUNT-
(PARAMS_POS_COUNT-PARAMS_POSONLY_COUNT)
for(let i=offset-PARAMS_POS_DEFAULTS_OFFSET;
i < max;
++i){result[PARAMS_NAMES[offset++]]=PARAMS_POS_DEFAULTS[i]}}
if(PARAMS_KWARGS_NAME===null){let nb_named_args=0
for(let id=0,len=ARGS_NAMED.length;id < len;++id){const _kargs=ARGS_NAMED[id]
let kargs=_kargs.$jsobj
if(kargs===undefined ||kargs===null){kargs=_kargs.$strings
if(kargs===undefined ||kargs===null){kargs=_kargs}}
for(let argname in kargs){result[argname ]=kargs[argname]
++nb_named_args}}
let found=0
let ioffset=offset
for(;ioffset < PARAMS_POS_DEFAULTS_OFFSET;++ioffset){const key=PARAMS_NAMES[ioffset]
if(key in result ){
continue}
args0(fct,args)
throw new Error('Missing a named arguments (args0 should have raised an error) !')}
for(;ioffset < PARAMS_POS_DEFAULTS_MAXID;++ioffset){const key=PARAMS_NAMES[ioffset]
if(key in result){continue}
result[key]=PARAMS_POS_DEFAULTS[ioffset-PARAMS_POS_DEFAULTS_OFFSET]
++found}
for(;ioffset < PARAMS_NAMES.length;++ioffset){const key=PARAMS_NAMES[ioffset]
if(key in result ){continue}
if(!(key in kwargs_defaults)){args0(fct,args)
throw new Error('Missing a named arguments (args0 should have raised an error) !');}
result[key]=kwargs_defaults[key]
++found}
if(found+nb_named_args !==PARAMS_NAMES.length-offset){args0(fct,args)
throw new Error('Inexistant or duplicate named arguments (args0 should have raised an error) !')}
return result}
const extra={}
let nb_named_args=0
let nb_extra_args=0
for(let id=0;id < ARGS_NAMED.length;++id){const _kargs=ARGS_NAMED[id]
let kargs=_kargs.$jsobj
if(kargs===undefined ||kargs===null){kargs=_kargs.$strings
if(kargs===undefined ||kargs===null){kargs=_kargs}}
for(let argname in kargs){if(PARAMS_NAMES.indexOf(argname,PARAMS_POSONLY_COUNT)!==-1){result[argname ]=kargs[argname]
++nb_named_args}else{extra[argname ]=kargs[argname]
++nb_extra_args}}}
let found=0
let ioffset=offset
for(;ioffset < PARAMS_POS_DEFAULTS_OFFSET;++ioffset){const key=PARAMS_NAMES[ioffset]
if(key in result){
continue}
args0(fct,args)
throw new Error('Missing a named arguments (args0 should have raised an error) !')}
for(;ioffset < PARAMS_POS_DEFAULTS_MAXID;++ioffset){const key=PARAMS_NAMES[ioffset]
if(key in result){continue}
result[key]=PARAMS_POS_DEFAULTS[ioffset-PARAMS_POS_DEFAULTS_OFFSET]
++found}
for(;ioffset < PARAMS_NAMES.length;++ioffset){const key=PARAMS_NAMES[ioffset]
if(key in result ){continue}
if(!(key in kwargs_defaults)){args0(fct,args)
throw new Error('Missing a named arguments (args0 should have raised an error) !')}
result[key]=kwargs_defaults[key]
++found}
if(found+nb_named_args !==PARAMS_NAMES.length-offset){args0(fct,args)
throw new Error('Inexistant or duplicate named arguments (args0 should have raised an error) !')}
if(Object.keys(extra).length !==nb_extra_args){args0(fct,args)
throw new Error('Duplicate name given to **kargs parameter (args0 should have raised an error) !')}
result[PARAMS_KWARGS_NAME]=__BRYTHON__.obj_dict(extra)
return result}
$B.args0=args0_NEW;
$B.args=function(fname,argcount,slots,var_names,args,$dobj,vararg,kwarg,nb_posonly){
var nb_posonly=nb_posonly ||0,nb_kwonly=var_names.length-argcount,defaults=[],kwdefaults={$jsobj:{}}
for(var i=0,len=var_names.length;i < len;i++){var var_name=var_names[i]
if($dobj.hasOwnProperty(var_name)){if(i < argcount){defaults.push($dobj[var_name])}else{kwdefaults.$jsobj[var_name]=$dobj[var_name]}}}
for(var k in slots){slots[k]=empty}
return $B.parse_args(args,fname,argcount,slots,var_names,defaults,kwdefaults,vararg,kwarg,nb_posonly,nb_kwonly)}
$B.single_arg=function(fname,arg,args){var slots={}
slots[arg]=null
var $=$B.args(fname,1,slots,[arg],args,{},null,null)
return $[arg]}
$B.parse_args=function(args,fname,argcount,slots,arg_names,defaults,kwdefaults,vararg,kwarg,nb_posonly,nb_kwonly){
var nb_passed=args.length,nb_passed_pos=nb_passed,
nb_expected=arg_names.length,nb_pos_or_kw=nb_expected-nb_kwonly,posonly_set={},nb_def=defaults.length,varargs=[],extra_kw={},kw
for(var i=0;i < nb_passed;i++){var arg=args[i]
if(arg && arg.__class__===$B.generator){slots.$has_generators=true}
if(arg && arg.$kw){
nb_passed_pos--
kw=$B.parse_kwargs(arg.$kw,fname)}else{var arg_name=arg_names[i]
if(arg_name !==undefined){if(i >=nb_pos_or_kw){if(vararg){varargs.push(arg)}else{throw too_many_pos_args(
fname,kwarg,arg_names,nb_kwonly,defaults,args,slots)}}else{if(i < nb_posonly){posonly_set[arg_name]=true}
slots[arg_name]=arg}}else if(vararg){varargs.push(arg)}else{throw too_many_pos_args(
fname,kwarg,arg_names,nb_kwonly,defaults,args,slots)}}}
for(var j=nb_passed_pos;j < nb_pos_or_kw;j++){var arg_name=arg_names[j]
if(kw && kw.hasOwnProperty(arg_name)){
if(j < nb_posonly){
if(! kwarg){throw pos_only_passed_as_keyword(fname,arg_name)}}else{slots[arg_name]=kw[arg_name]
kw[arg_name]=empty}}
if(slots[arg_name]===empty){
def_value=defaults[j-(nb_pos_or_kw-nb_def)]
if(def_value !==undefined){slots[arg_name]=def_value
if(j < nb_posonly){
if(kw && kw.hasOwnProperty(arg_name)&& kwarg){extra_kw[arg_name]=kw[arg_name]
kw[arg_name]=empty}}}else{var missing_pos=arg_names.slice(j,nb_pos_or_kw-nb_def)
throw missing_required_pos(fname,missing_pos)}}}
var missing_kwonly=[]
for(var i=nb_pos_or_kw;i < nb_expected;i++){var arg_name=arg_names[i]
if(kw && kw.hasOwnProperty(arg_name)){slots[arg_name]=kw[arg_name]
kw[arg_name]=empty}else{var kw_def=_b_.dict.$get_string(kwdefaults,arg_name)
if(kw_def !==_b_.dict.$missing){slots[arg_name]=kw_def}else{missing_kwonly.push(arg_name)}}}
if(missing_kwonly.length > 0){throw missing_required_kwonly(fname,missing_kwonly)}
if(! kwarg){for(var k in kw){if(! slots.hasOwnProperty(k)){throw unexpected_keyword(fname,k)}}}
for(var k in kw){if(kw[k]===empty){continue}
if(! slots.hasOwnProperty(k)){if(kwarg){extra_kw[k]=kw[k]}}else if(slots[k]!==empty){if(posonly_set[k]&& kwarg){
extra_kw[k]=kw[k]}else{throw multiple_values(fname,k)}}else{slots[k]=kw[k]}}
if(kwarg){slots[kwarg]=$B.obj_dict(extra_kw)}
if(vararg){slots[vararg]=$B.fast_tuple(varargs)}
return slots}
$B.parse_kwargs=function(kw_args,fname){var kwa=kw_args[0]
for(var i=1,len=kw_args.length;i < len;i++){var kw_arg=kw_args[i],key,value
if(kw_arg.__class__===_b_.dict){for(var entry of _b_.dict.$iter_items_with_hash(kw_arg)){key=entry.key
if(typeof key !=='string'){throw _b_.TypeError.$factory(fname+
"() keywords must be strings")}else if(kwa[key]!==undefined){throw _b_.TypeError.$factory(fname+
"() got multiple values for argument '"+
key+"'")}else{kwa[key]=entry.value}}}else{
var cls=$B.get_class(kw_arg)
try{var keys_method=$B.$call1($B.$getattr(cls,'keys'))}catch(err){throw _b_.TypeError.$factory(`${fname} argument `+
`after ** must be a mapping, not ${$B.class_name(kw_arg)}`)}
var keys_iter=$B.make_js_iterator(keys_method(kw_arg)),getitem
for(var k of keys_iter){if(typeof k !=="string"){throw _b_.TypeError.$factory(fname+
"() keywords must be strings")}
if(kwa[k]!==undefined){throw _b_.TypeError.$factory(fname+
"() got multiple values for argument '"+
k+"'")}
if(! getitem){try{getitem=$B.$getattr(cls,'__getitem__')}catch(err){throw _b_.TypeError.$factory(
`'${$B.class_name(kw_arg)}' object is not subscriptable`)}}
kwa[k]=getitem(kw_arg,k)}}}
return kwa}
$B.check_nb_args=function(name,expected,args){
var len=args.length,last=args[len-1]
if(last && last.$kw){var kw=last.$kw
if(kw[1]){if(_b_.len(kw[1])==0){len--}}}
if(len !=expected){if(expected==0){throw _b_.TypeError.$factory(name+"() takes no argument"+
" ("+len+" given)")}else{throw _b_.TypeError.$factory(name+"() takes exactly "+
expected+" argument"+(expected < 2 ? '' :'s')+
" ("+len+" given)")}}}
$B.check_no_kw=function(name,x,y){
if(x===undefined){console.log("x undef",name,x,y)}
if((x.$kw && x.$kw[0]&& x.$kw[0].length > 0)||
(y !==undefined && y.$kw)){throw _b_.TypeError.$factory(name+"() takes no keyword arguments")}}
$B.check_nb_args_no_kw=function(name,expected,args){
var len=args.length,last=args[len-1]
if(last && last.$kw){if(last.$kw.length==2 && Object.keys(last.$kw[0]).length==0){len--}else{throw _b_.TypeError.$factory(name+"() takes no keyword arguments")}}
if(len !=expected){if(expected==0){throw _b_.TypeError.$factory(name+"() takes no argument"+
" ("+len+" given)")}else{throw _b_.TypeError.$factory(name+"() takes exactly "+
expected+" argument"+(expected < 2 ? '' :'s')+
" ("+len+" given)")}}}
$B.get_class=function(obj){
if(obj===null){return $B.imported.javascript.NullType }
if(obj===undefined){return $B.imported.javascript.UndefinedType }
var klass=obj.__class__ ||obj.$tp_class
if(klass===undefined){switch(typeof obj){case "number":
if(Number.isInteger(obj)){return _b_.int}
break
case "string":
return _b_.str
case "boolean":
return _b_.bool
case "function":
if(obj.$is_js_func){
return $B.JSObj}
return $B.function
case "object":
if(Array.isArray(obj)){if(obj.$is_js_array){return $B.js_array}else if(Object.getPrototypeOf(obj)===Array.prototype){obj.__class__=_b_.list
return _b_.list}}else if(obj instanceof $B.str_dict){return _b_.dict}else if(typeof Node !=="undefined" 
&& obj instanceof Node){if(obj.tagName){return $B.imported['browser.html'][obj.tagName]||
$B.DOMNode}
return $B.DOMNode}
break}}
if(klass===undefined){return $B.get_jsobj_class(obj)}
return klass}
$B.class_name=function(obj){var klass=$B.get_class(obj)
if(klass===$B.JSObj){return 'Javascript '+obj.constructor.name}else{return klass.__name__}}
$B.make_js_iterator=function(iterator,frame,lineno){
var set_lineno=$B.set_lineno
if(frame===undefined){if($B.frame_obj===null){function set_lineno(){}}else{frame=$B.frame_obj.frame
lineno=frame.$lineno}}
if(iterator.__class__===_b_.range){var obj={ix:iterator.start}
if(iterator.step > 0){return{
[Symbol.iterator](){return this},next(){set_lineno(frame,lineno)
if(obj.ix >=iterator.stop){return{done:true,value:null}}
var value=obj.ix
obj.ix+=iterator.step
return{done:false,value}}}}else{return{
[Symbol.iterator](){return this},next(){set_lineno(frame,lineno)
if(obj.ix <=iterator.stop){return{done:true,value:null}}
var value=obj.ix
obj.ix+=iterator.step
return{done:false,value}}}}}
if(iterator[Symbol.iterator]&& ! iterator.$is_js_array){var it=iterator[Symbol.iterator]()
return{
[Symbol.iterator](){return this},next(){set_lineno(frame,lineno)
return it.next()}}}
var next_func=$B.$call($B.$getattr(_b_.iter(iterator),'__next__'))
return{
[Symbol.iterator](){return this},next(){set_lineno(frame,lineno)
try{var value=next_func()
return{done:false,value}}catch(err){if($B.is_exc(err,[_b_.StopIteration])){return{done:true,value:null}}
throw err}}}}
$B.unpacker=function(obj,nb_targets,has_starred){
var position,position_rank=3
if(has_starred){var nb_after_starred=arguments[3]
position_rank++}
if($B.pep657){position=$B.decode_position(arguments[position_rank])}
var t=_b_.list.$factory(obj),right_length=t.length,left_length=nb_targets+(has_starred ? nb_after_starred-1 :0)
if(right_length < left_length){var exc=_b_.ValueError.$factory(`not enough values to unpack `+
`(expected ${left_length}, got ${right_length})`)
if(position){$B.set_exception_offsets(exc,position)}
throw exc}
if((! has_starred)&& right_length > left_length){var exc=_b_.ValueError.$factory("too many values to unpack "+
`(expected ${left_length})`)
if(position){$B.set_exception_offsets(exc,position)}
throw exc}
t.index=-1
t.read_one=function(){t.index++
return t[t.index]}
t.read_rest=function(){
t.index++
var res=t.slice(t.index,t.length-nb_after_starred)
t.index=t.length-nb_after_starred-1
return res}
return t}
$B.set_lineno=function(frame,lineno){frame.$lineno=lineno
if(frame.$f_trace !==_b_.None){$B.trace_line()}
return true}
$B.get_method_class=function(method,ns,qualname,refs){
var klass=ns
if(method.$infos && method.$infos.$class){return method.$infos.$class}
for(var ref of refs){if(klass[ref]===undefined){var fake_class=$B.make_class(qualname)
return fake_class}
klass=klass[ref]}
return klass}
$B.$JS2Py=function(src){if(typeof src==="number"){if(src % 1===0){return src}
return _b_.float.$factory(src)}
if(src===null ||src===undefined){return _b_.None}
if(Array.isArray(src)&&
Object.getPrototypeOf(src)===Array.prototype){src.$brython_class="js" }
return src}
$B.warn=function(klass,message,filename,token){var warning=klass.$factory(message)
warning.filename=filename
if(klass===_b_.SyntaxWarning){warning.lineno=token.start[0]
warning.offset=token.start[1]
warning.end_lineno=token.end[0]
warning.end_offset=token.end[1]
warning.text=token.line
warning.args[1]=$B.fast_tuple([filename,warning.lineno,warning.offset,warning.text,warning.end_lineno,warning.end_offset])}
$B.imported._warnings.warn(warning)}
function index_error(obj){var type=typeof obj=="string" ? "string" :"list"
throw _b_.IndexError.$factory(type+" index out of range")}
$B.$getitem=function(obj,item,position){var is_list=Array.isArray(obj)&& obj.__class__===_b_.list,is_dict=obj.__class__===_b_.dict && ! obj.$jsobj
if(typeof item=="number"){if(is_list ||typeof obj=="string"){item=item >=0 ? item :obj.length+item
if(obj[item]!==undefined){return obj[item]}else{index_error(obj)}}}else if(item.valueOf && typeof item.valueOf()=="string" && is_dict){return _b_.dict.$getitem(obj,item)}
if(obj.$is_class){var class_gi=$B.$getattr(obj,"__class_getitem__",_b_.None)
if(class_gi !==_b_.None){return $B.$call(class_gi)(item)}else if(obj.__class__){class_gi=$B.$getattr(obj.__class__,"__getitem__",_b_.None)
if(class_gi !==_b_.None){return class_gi(obj,item)}else{throw _b_.TypeError.$factory("'"+
$B.class_name(obj.__class__)+
"' object is not subscriptable")}}}
if(is_list){return _b_.list.$getitem(obj,item)}
if(is_dict){return _b_.dict.$getitem(obj,item)}
var gi=$B.$getattr(obj.__class__ ||$B.get_class(obj),"__getitem__",_b_.None)
if(gi !==_b_.None){return gi(obj,item)}
var exc=_b_.TypeError.$factory("'"+$B.class_name(obj)+
"' object is not subscriptable")
if(position){$B.set_exception_offsets(exc,$B.decode_position(position))}
throw exc}
$B.getitem_slice=function(obj,slice){var res
if(Array.isArray(obj)&& obj.__class__===_b_.list){if(slice.start===_b_.None && slice.stop===_b_.None){if(slice.step===_b_.None ||slice.step==1){res=obj.slice()}else if(slice.step==-1){res=obj.slice().reverse()}}else if(slice.step===_b_.None){if(slice.start===_b_.None){slice.start=0}
if(slice.stop===_b_.None){slice.stop=obj.length}
if(typeof slice.start=="number" &&
typeof slice.stop=="number"){if(slice.start < 0){slice.start+=obj.length}
if(slice.stop < 0){slice.stop+=obj.length}
res=obj.slice(slice.start,slice.stop)}}
if(res){res.__class__=obj.__class__ 
res.__brython__=true
return res}else{return _b_.list.$getitem(obj,slice)}}else if(typeof obj=="string"){return _b_.str.__getitem__(obj,slice)}
return $B.$getattr($B.get_class(obj),"__getitem__")(obj,slice)}
$B.$getattr_pep657=function(obj,attr,position){try{return $B.$getattr(obj,attr)}catch(err){$B.set_exception_offsets(err,$B.decode_position(position))
throw err}}
$B.set_list_slice=function(obj,start,stop,value){if(start===null){start=0}else{start=$B.$GetInt(start)
if(start < 0){start=Math.max(0,start+obj.length)}}
if(stop===null){stop=obj.length}
stop=$B.$GetInt(stop)
if(stop < 0){stop=Math.max(0,stop+obj.length)}
var res=_b_.list.$factory(value)
obj.splice.apply(obj,[start,stop-start].concat(res))}
$B.set_list_slice_step=function(obj,start,stop,step,value){if(step===null ||step==1){return $B.set_list_slice(obj,start,stop,value)}
if(step==0){throw _b_.ValueError.$factory("slice step cannot be zero")}
step=$B.$GetInt(step)
if(start===null){start=step > 0 ? 0 :obj.length-1}else{start=$B.$GetInt(start)}
if(stop===null){stop=step > 0 ? obj.length :-1}else{stop=$B.$GetInt(stop)}
var repl=_b_.list.$factory(value),j=0,test,nb=0
if(step > 0){test=function(i){return i < stop}}
else{test=function(i){return i > stop}}
for(var i=start;test(i);i+=step){nb++}
if(nb !=repl.length){throw _b_.ValueError.$factory(
"attempt to assign sequence of size "+repl.length+
" to extended slice of size "+nb)}
for(var i=start;test(i);i+=step){obj[i]=repl[j]
j++}}
$B.$setitem=function(obj,item,value){if(Array.isArray(obj)&& obj.__class__===undefined &&
! obj.$is_js_array &&
typeof item=="number" &&
! $B.$isinstance(obj,_b_.tuple)){if(item < 0){item+=obj.length}
if(obj[item]===undefined){throw _b_.IndexError.$factory("list assignment index out of range")}
obj[item]=value
return}else if(obj.__class__===_b_.dict){_b_.dict.$setitem(obj,item,value)
return}else if(obj.__class__===_b_.list){return _b_.list.$setitem(obj,item,value)}
var si=$B.$getattr(obj.__class__ ||$B.get_class(obj),"__setitem__",null)
if(si===null ||typeof si !='function'){throw _b_.TypeError.$factory("'"+$B.class_name(obj)+
"' object does not support item assignment")}
return si(obj,item,value)}
$B.$delitem=function(obj,item){if(Array.isArray(obj)&& obj.__class__===_b_.list &&
typeof item=="number" &&
!$B.$isinstance(obj,_b_.tuple)){if(item < 0){item+=obj.length}
if(obj[item]===undefined){throw _b_.IndexError.$factory("list deletion index out of range")}
obj.splice(item,1)
return}else if(obj.__class__===_b_.dict){_b_.dict.__delitem__(obj,item)
return}else if(obj.__class__===_b_.list){return _b_.list.__delitem__(obj,item)}
var di=$B.$getattr(obj.__class__ ||$B.get_class(obj),"__delitem__",null)
if(di===null){throw _b_.TypeError.$factory("'"+$B.class_name(obj)+
"' object doesn't support item deletion")}
return di(obj,item)}
function num_result_type(x,y){var is_int,is_float,x_num,y_num
if(typeof x=="number"){x_num=x
if(typeof y=="number"){is_int=true
y_num=y}else if(y.__class__===_b_.float){is_float=true
y_num=y.value}}else if(x.__class__===_b_.float){x_num=x.value
if(typeof y=="number"){y_num=y
is_float=true}else if(y.__class__===_b_.float){is_float=true
y_num=y.value}}
return{is_int,is_float,x:x_num,y:y_num}}
$B.augm_assign=function(left,op,right){var res_type=num_result_type(left,right)
if(res_type.is_int ||res_type.is_float){var z
switch(op){case '+=':
z=res_type.x+res_type.y
break
case '-=':
z=res_type.x-res_type.y
break
case '*=':
z=res_type.x*res_type.y
break
case '/=':
z=res_type.x/res_type.y
break}
if(z){if(res_type.is_int && Number.isSafeInteger(z)){return z}else if(res_type.res_is_float){return $B.fast_float(z)}}}else if(op=='*='){if(typeof left=="number" && typeof right=="string"){return left <=0 ? '' :right.repeat(left)}else if(typeof left=="string" && typeof right=="number"){return right <=0 ? '' :left.repeat(right)}}else if(op=='+='){if(typeof left=="string" && typeof right=="string"){return left+right}}
var op1=op.substr(0,op.length-1),method=$B.op2method.augmented_assigns[op],augm_func=$B.$getattr(left,'__'+method+'__',null)
if(augm_func !==null){var res=$B.$call(augm_func)(right)
if(res===_b_.NotImplemented){throw _b_.TypeError.$factory(`unsupported operand type(s)`+
` for ${op}: '${$B.class_name(left)}' `+
`and '${$B.class_name(right)}'`)}
return res}else{var method1=$B.op2method.operations[op1]
if(method1===undefined){method1=$B.op2method.binary[op1]}
return $B.rich_op(`__${method1}__`,left,right)}}
$B.$is=function(a,b){
if((a===undefined ||a===$B.Undefined)&&
(b===undefined ||b===$B.Undefined)){return true}
if(a===null){return b===null}
if(b===null){return a===null}
if(a.__class__===_b_.float && b.__class__===_b_.float){if(isNaN(a.value)&& isNaN(b.value)){return true}
return a.value==b.value}
if((a===_b_.int && b==$B.long_int)||
(a===$B.long_int && b===_b_.int)){return true}
return a===b}
$B.is_or_equals=function(x,y){
return $B.$is(x,y)||$B.rich_comp('__eq__',x,y)}
$B.member_func=function(obj){var klass=$B.get_class(obj),contains=$B.$getattr(klass,"__contains__",null)
if(contains !==null){contains=$B.$call(contains)
return contains.bind(null,obj)}
try{
var iterator=$B.make_js_iterator(obj)
return function(key){try{for(var item of iterator){if($B.is_or_equals(key,item)){return true}}
return false}catch(err){return false}}}catch(err){
var getitem=$B.$getattr(klass,'__getitem__',null)
if(getitem !==null){return function(key){var i=-1
while(true){i++
try{var item=getitem(obj,i)
if($B.is_or_equals(key,item)){return true}}catch(err){if($B.$is_exc(err,[_b_.StopIteration])){return false}
throw err}}}}else{throw _b_.TypeError.$factory('argument of type '+
`'${$B.class_name(obj)}' is not iterable`)}}}
$B.$is_member=function(item,_set){return $B.member_func(_set)(item)}
$B.$call=function(callable,position){callable=$B.$call1(callable)
if(position){return function(){try{return callable.apply(null,arguments)}catch(exc){position=$B.decode_position(position)
$B.set_exception_offsets(exc,position)
throw exc}}}
return callable}
$B.$call1=function(callable){if(callable.__class__===$B.method){return callable}else if(callable.$factory){return callable.$factory}else if(callable.$is_class){
return callable.$factory=$B.$instance_creator(callable)}else if(callable.$is_js_class){
return callable.$factory=function(){return new callable(...arguments)}}else if(callable.$in_js_module){
return function(){var res=callable(...arguments)
return res===undefined ? _b_.None :res}}else if(callable.$is_func ||typeof callable=="function"){if(callable.$infos && callable.$infos.__code__ &&
(callable.$infos.__code__.co_flags & 32)){$B.frame_obj.frame.$has_generators=true}
return callable}
try{return $B.$getattr(callable,"__call__")}catch(err){throw _b_.TypeError.$factory("'"+$B.class_name(callable)+
"' object is not callable")}}
var r_opnames=["add","sub","mul","truediv","floordiv","mod","pow","lshift","rshift","and","xor","or"]
var ropsigns=["+","-","*","/","//","%","**","<<",">>","&","^","|"]
$B.make_rmethods=function(klass){for(var r_opname of r_opnames){if(klass["__r"+r_opname+"__"]===undefined &&
klass['__'+r_opname+'__']){klass["__r"+r_opname+"__"]=(function(name){return function(self,other){return klass["__"+name+"__"](other,self)}})(r_opname)}}}
$B.UUID=function(){return $B.$py_UUID++}
$B.$GetInt=function(value){
if(typeof value=="number" ||value.constructor===Number){return value}
else if(typeof value==="boolean"){return value ? 1 :0}
else if($B.$isinstance(value,_b_.int)){return value}
else if($B.$isinstance(value,_b_.float)){return value.valueOf()}
if(! value.$is_class){try{var v=$B.$getattr(value,"__int__")();return v}catch(e){}
try{var v=$B.$getattr(value,"__index__")();return v}catch(e){}}
throw _b_.TypeError.$factory("'"+$B.class_name(value)+
"' object cannot be interpreted as an integer")}
$B.to_num=function(obj,methods){
var expected_class={"__complex__":_b_.complex,"__float__":_b_.float,"__index__":_b_.int,"__int__":_b_.int}
var klass=obj.__class__ ||$B.get_class(obj)
for(var i=0;i < methods.length;i++){var missing={},method=$B.$getattr(klass,methods[i],missing)
if(method !==missing){var res=method(obj)
if(!$B.$isinstance(res,expected_class[methods[i]])){throw _b_.TypeError.$factory(methods[i]+"returned non-"+
expected_class[methods[i]].__name__+
"(type "+$B.get_class(res)+")")}
return{result:res,method:methods[i]}}}
return null}
$B.PyNumber_Index=function(item){switch(typeof item){case "boolean":
return item ? 1 :0
case "number":
return item
case "object":
if(item.__class__===$B.long_int){return item}
if($B.$isinstance(item,_b_.int)){
return item.$brython_value}
var method=$B.$getattr(item,"__index__",_b_.None)
if(method !==_b_.None){method=typeof method=="function" ?
method :$B.$getattr(method,"__call__")
return $B.int_or_bool(method())}else{throw _b_.TypeError.$factory("'"+$B.class_name(item)+
"' object cannot be interpreted as an integer")}
default:
throw _b_.TypeError.$factory("'"+$B.class_name(item)+
"' object cannot be interpreted as an integer")}}
$B.int_or_bool=function(v){switch(typeof v){case "boolean":
return v ? 1 :0
case "number":
return v
case "object":
if(v.__class__===$B.long_int){return v}
else{throw _b_.TypeError.$factory("'"+$B.class_name(v)+
"' object cannot be interpreted as an integer")}
default:
throw _b_.TypeError.$factory("'"+$B.class_name(v)+
"' object cannot be interpreted as an integer")}}
$B.enter_frame=function(frame){
if($B.frame_obj !==null && $B.frame_obj.count > 1000){var exc=_b_.RecursionError.$factory("maximum recursion depth exceeded")
$B.set_exc(exc,frame)
throw exc}
frame.__class__=$B.frame
$B.frame_obj=$B.push_frame(frame)
if($B.tracefunc && $B.tracefunc !==_b_.None){if(frame[4]===$B.tracefunc ||
($B.tracefunc.$infos && frame[4]&&
frame[4]===$B.tracefunc.$infos.__func__)){
$B.tracefunc.$frame_id=frame[0]
return _b_.None}else{
var frame_obj=$B.frame_obj
while(frame_obj !==null){if(frame_obj.frame[0]==$B.tracefunc.$frame_id){return _b_.None}
frame_obj=frame_obj.prev}
try{var res=$B.tracefunc(frame,'call',_b_.None)
var frame_obj=$B.frame_obj
while(frame_obj !==null){if(frame_obj.frame[4]==res){return _b_.None}
frame_obj=frame_obj.prev}
return res}catch(err){$B.set_exc(err,frame)
$B.frame_obj=$B.frame_obj.prev
err.$in_trace_func=true
throw err}}}else{$B.tracefunc=_b_.None}
return _b_.None}
$B.trace_exception=function(){var frame=$B.frame_obj.frame
if(frame[0]==$B.tracefunc.$current_frame_id){return _b_.None}
var trace_func=frame.$f_trace,exc=frame[1].$current_exception
return trace_func(frame,'exception',$B.fast_tuple([exc.__class__,exc,$B.traceback.$factory(exc)]))}
$B.trace_line=function(){var frame=$B.frame_obj.frame
if(frame[0]==$B.tracefunc.$current_frame_id){return _b_.None}
var trace_func=frame.$f_trace
if(trace_func===undefined){console.log('trace line, frame',frame)}
return trace_func(frame,'line',_b_.None)}
$B.trace_return=function(value){var frame=$B.frame_obj.frame,trace_func=frame.$f_trace
if(frame[0]==$B.tracefunc.$current_frame_id){
return _b_.None}
trace_func(frame,'return',value)}
$B.leave_frame=function(arg){
if($B.frame_obj===null){return}
if(arg && arg.value !==undefined && $B.tracefunc){if($B.frame_obj.frame.$f_trace===undefined){$B.frame_obj.frame.$f_trace=$B.tracefunc}
if($B.frame_obj.frame.$f_trace !==_b_.None){$B.trace_return(arg.value)}}
var frame=$B.frame_obj.frame
$B.frame_obj=$B.frame_obj.prev
if(frame.$has_generators){for(var key in frame[1]){if(frame[1][key]&& frame[1][key].__class__===$B.generator){var gen=frame[1][key]
if(gen.$frame===undefined){continue}
var ctx_managers=gen.$frame[1].$context_managers
if(ctx_managers){for(var cm of ctx_managers){$B.$call($B.$getattr(cm,'__exit__'))(
_b_.None,_b_.None,_b_.None)}}}}}
delete frame[1].$current_exception
return _b_.None}
$B.push_frame=function(frame){var count=$B.frame_obj===null ? 0 :$B.frame_obj.count
return{
prev:$B.frame_obj,frame,count:count+1}}
$B.count_frames=function(frame_obj){frame_obj=frame_obj ||$B.frame_obj
return frame_obj==null ? 0 :frame_obj.count}
$B.get_frame_at=function(pos,frame_obj){frame_obj=frame_obj ||$B.frame_obj
var nb=$B.count_frames()-pos-1
for(var i=0;i < nb;i++){frame_obj=frame_obj.prev}
return frame_obj.frame}
$B.floordiv=function(x,y){var z=x/y
if(Number.isSafeInteger(x)&&
Number.isSafeInteger(y)&&
Number.isSafeInteger(z)){return Math.floor(z)}else{return $B.long_int.__floordiv__($B.long_int.$factory(x),$B.long_int.$factory(y))}}
var reversed_op={"__lt__":"__gt__","__le__":"__ge__","__gt__":"__lt__","__ge__":"__le__"}
var method2comp={"__lt__":"<","__le__":"<=","__gt__":">","__ge__":">="}
$B.rich_comp=function(op,x,y){if(x===undefined){throw _b_.RuntimeError.$factory('error in rich comp')}
var x1=x !==null && x.valueOf ? x.valueOf():x,y1=y !==null && y.valueOf ? y.valueOf():y
if(typeof x1=="number" && typeof y1=="number" &&
x.__class__===undefined && y.__class__===undefined){switch(op){case "__eq__":
return x1==y1
case "__ne__":
return x1 !=y1
case "__le__":
return x1 <=y1
case "__lt__":
return x1 < y1
case "__ge__":
return x1 >=y1
case "__gt__":
return x1 > y1}}
var res
if(x !==null &&(x.$is_class ||x.$factory)){if(op=="__eq__"){return(x===y)}else if(op=="__ne__"){return !(x===y)}else{throw _b_.TypeError.$factory("'"+method2comp[op]+
"' not supported between instances of '"+$B.class_name(x)+
"' and '"+$B.class_name(y)+"'")}}
var x_class_op=$B.$call($B.$getattr($B.get_class(x),op)),rev_op=reversed_op[op]||op,y_rev_func
if(x !==null && x.__class__ && y !==null && y.__class__){
if(y.__class__.__mro__.indexOf(x.__class__)>-1){y_rev_func=$B.$getattr(y,rev_op)
res=$B.$call(y_rev_func)(x)
if(res !==_b_.NotImplemented){return res}}}
res=x_class_op(x,y)
if(res !==_b_.NotImplemented){return res}
if(y_rev_func===undefined){
y_rev_func=$B.$call($B.$getattr($B.get_class(y),rev_op))
res=y_rev_func(y,x)
if(res !==_b_.NotImplemented ){return res}}
if(op=="__eq__"){return _b_.False}else if(op=="__ne__"){return _b_.True}
throw _b_.TypeError.$factory("'"+method2comp[op]+
"' not supported between instances of '"+$B.class_name(x)+
"' and '"+$B.class_name(y)+"'")}
var opname2opsign={__sub__:"-",__xor__:"^",__mul__:"*"}
$B.rich_op=function(op,x,y,position){try{return $B.rich_op1(op,x,y)}catch(exc){if(position){$B.set_exception_offsets(exc,$B.decode_position(position))}
throw exc}}
$B.rich_op1=function(op,x,y){
var res_is_int,res_is_float,x_num,y_num
if(typeof x=="number"){x_num=x
if(typeof y=="number"){res_is_int=true
y_num=y}else if(y.__class__===_b_.float){res_is_float=true
y_num=y.value}}else if(x.__class__===_b_.float){x_num=x.value
if(typeof y=="number"){y_num=y
res_is_float=true}else if(y.__class__===_b_.float){res_is_float=true
y_num=y.value}}
if(res_is_int ||res_is_float){var z
switch(op){case "__add__":
z=x_num+y_num
break
case "__sub__":
z=x_num-y_num
break
case "__mul__":
z=x_num*y_num
break
case '__pow__':
if(res_is_int && y_num >=0){return _b_.int.$int_or_long(BigInt(x_num)**BigInt(y_num))}
break
case "__truediv__":
if(y_num==0){throw _b_.ZeroDivisionError.$factory("division by zero")}
z=x_num/y_num
return{__class__:_b_.float,value:z}}
if(z){if(res_is_int && Number.isSafeInteger(z)){return z}else if(res_is_float){return{__class__:_b_.float,value:z}}}}else if(typeof x=="string" && typeof y=="string" && op=="__add__"){return x+y}
var x_class=x.__class__ ||$B.get_class(x),y_class=y.__class__ ||$B.get_class(y),rop='__r'+op.substr(2),method
if(x_class===y_class){
if(x_class===_b_.int){return _b_.int[op](x,y)}else if(x_class===_b_.bool){return(_b_.bool[op]||_b_.int[op])
(x,y)}
try{method=$B.$call($B.$getattr(x_class,op))}catch(err){if(err.__class__===_b_.AttributeError){var kl_name=$B.class_name(x)
throw _b_.TypeError.$factory("unsupported operand type(s) "+
"for "+opname2opsign[op]+": '"+kl_name+"' and '"+
kl_name+"'")}
throw err}
return method(x,y)}
if(_b_.issubclass(y_class,x_class)){
var reflected_left=$B.$getattr(x_class,rop,false),reflected_right=$B.$getattr(y_class,rop,false)
if(reflected_right && reflected_left &&
reflected_right !==reflected_left){return reflected_right(y,x)}}
var res
try{
var attr=$B.$getattr(x,op)
method=$B.$getattr(x_class,op)}catch(err){if(err.__class__ !==_b_.AttributeError){throw err}
res=$B.$call($B.$getattr(y,rop))(x)
if(res !==_b_.NotImplemented){return res}
throw _b_.TypeError.$factory(
`unsupported operand type(s) for ${$B.method_to_op[op]}:`+
` '${$B.class_name(x)}' and '${$B.class_name(y)}'`)}
if((op=='__add__' ||op=='__mul__')&&
(Array.isArray(x)||typeof x=='string' ||
$B.$isinstance(x,[_b_.str,_b_.bytes,_b_.bytearray,_b_.memoryview]))){
try{res=method(x,y)}catch(err){res=_b_.NotImplemented}}else{res=method(x,y)}
if(res===_b_.NotImplemented){try{var reflected=$B.$getattr(y,rop),method=$B.$getattr(y_class,rop)}catch(err){if(err.__class__ !==_b_.AttributeError){throw err}
throw _b_.TypeError.$factory(
`unsupported operand type(s) for ${$B.method_to_op[op]}:`+
` '${$B.class_name(x)}' and '${$B.class_name(y)}'`)}
res=method(y,x)
if(res===_b_.NotImplemented){throw _b_.TypeError.$factory(
`unsupported operand type(s) for ${$B.method_to_op[op]}:`+
` '${$B.class_name(x)}' and '${$B.class_name(y)}'`)}
return res}else{return res}}
$B.is_none=function(o){return o===undefined ||o===null ||o==_b_.None}
var repr_stack=new Set()
$B.repr={enter:function(obj){var obj_id=_b_.id(obj)
if(repr_stack.has(obj_id)){return true}else{repr_stack.add(obj_id)
if(repr_stack.size > $B.recursion_limit){repr_stack.clear()
throw _b_.RecursionError.$factory("maximum recursion depth "+
"exceeded while getting the repr of an object")}}},leave:function(obj){repr_stack.delete(_b_.id(obj))}}})(__BRYTHON__)
;
__BRYTHON__.builtins.object=(function($B){var _b_=$B.builtins
var object={
__name__:'object',__qualname__:'object',$is_class:true,$native:true}
var opnames=["add","sub","mul","truediv","floordiv","mod","pow","lshift","rshift","and","xor","or"]
var opsigns=["+","-","*","/","//","%","**","<<",">>","&","^","|"]
object.__delattr__=function(self,attr){if(self.__dict__ && $B.$isinstance(self.__dict__,_b_.dict)&&
_b_.dict.$contains_string(self.__dict__,attr)){_b_.dict.$delete_string(self.__dict__,attr)
return _b_.None}else if(self.__dict__===undefined && self[attr]!==undefined){delete self[attr]
return _b_.None}else{
var klass=self.__class__
if(klass){var prop=$B.$getattr(klass,attr)
if(prop.__class__===_b_.property){if(prop.__delete__ !==undefined){prop.__delete__(self)
return _b_.None}}}}
throw $B.attr_error(attr,self)}
object.__dir__=function(self){var objects
if(self.$is_class){objects=[self].concat(self.__mro__)}else{var klass=self.__class__ ||$B.get_class(self)
objects=[self,klass].concat(klass.__mro__)}
var res=[]
for(var i=0,len=objects.length;i < len;i++){for(var attr in objects[i]){if(attr.charAt(0)=="$"){if(attr.charAt(1)=="$"){
res.push(attr.substr(2))}
continue}
if(! isNaN(parseInt(attr.charAt(0)))){
continue}
if(attr=="__mro__"){continue}
res.push(attr)}}
if(self.__dict__){for(var attr of $B.make_js_iterator(self.__dict__)){if(attr.charAt(0)!="$"){res.push(attr)}}}
res=_b_.list.$factory(_b_.set.$factory(res))
_b_.list.sort(res)
return res}
object.__eq__=function(self,other){
if(self===other){return true}
return _b_.NotImplemented}
object.__format__=function(){var $=$B.args("__format__",2,{self:null,spec:null},["self","spec"],arguments,{},null,null)
if($.spec !==""){throw _b_.TypeError.$factory(
"non-empty format string passed to object.__format__")}
return _b_.getattr($.self,"__str__")()}
object.__ge__=function(){return _b_.NotImplemented}
$B.nb_from_dict=0
object.__getattribute__=function(obj,attr){var klass=obj.__class__ ||$B.get_class(obj),is_own_class_instance_method=false
var $test=false 
if($test){console.log("object.__getattribute__, attr",attr,"de",obj,"klass",klass)}
if(attr==="__class__"){return klass}
if(obj.$is_class && attr=='__bases__'){throw $B.attr_error(attr,obj)}
var res=obj[attr]
if($test){console.log('obj[attr]',obj[attr])}
if(Array.isArray(obj)&& Array.prototype[attr]!==undefined){
res=undefined}
if(res===undefined && obj.__dict__){var dict=obj.__dict__
if(dict.__class__===$B.getset_descriptor){return dict.cls[attr]}
var in_dict=_b_.dict.$get_string(dict,attr)
if(in_dict !==_b_.dict.$missing){return in_dict}}
if(res===undefined){
function check(obj,kl,attr){var v=kl[attr]
if(v !==undefined){return v}}
res=check(obj,klass,attr)
if(res===undefined){var mro=klass.__mro__
for(var i=0,len=mro.length;i < len;i++){res=check(obj,mro[i],attr)
if($test){console.log('in class',mro[i],'res',res)}
if(res !==undefined){if($test){console.log("found in",mro[i])}
break}}}else{if($test){console.log(attr,'found in own class')}
if(res.__class__ !==$B.method && res.__get__===undefined){is_own_class_instance_method=true}}}else{if(res.__set__===undefined){
return res}}
if($test){console.log('after search classes',res)}
if(res !==undefined){if($test){console.log(res)}
if(res.__class__ && _b_.issubclass(res.__class__,_b_.property)){return $B.$getattr(res,'__get__')(obj,klass)}else if(res.__class__===_b_.classmethod){return _b_.classmethod.__get__(res,obj,klass)}
if(res.__class__===$B.method){if(res.$infos.__self__){
return res}
return res.__get__(obj,klass)}
var get=res.__get__
if(get===undefined && res.__class__){var get=res.__class__.__get__
for(var i=0;i < res.__class__.__mro__.length &&
get===undefined;i++){get=res.__class__.__mro__[i].__get__}}
if($test){console.log("get",get)}
var __get__=get===undefined ? null :
$B.$getattr(res,"__get__",null)
if($test){console.log("__get__",__get__)}
if(__get__ !==null){if($test){console.log('apply __get__',[obj,klass])}
try{return __get__.apply(null,[obj,klass])}catch(err){if($B.get_option('debug')> 2){console.log('error in get.apply',err)
console.log("get attr",attr,"of",obj)
console.log('res',res)
console.log('__get__',__get__)
console.log(__get__+'')}
throw err}}
if(typeof res=="object"){if(__get__ &&(typeof __get__=="function")){get_func=function(x,y){return __get__.apply(x,[y,klass.$factory])}}}
if(__get__===null &&(typeof res=="function")){__get__=function(x){return x}}
if(__get__ !==null){
res.__name__=attr
if(attr=="__new__" ||
res.__class__===$B.builtin_function_or_method){res.$type="staticmethod"}
var res1=__get__.apply(null,[res,obj,klass])
if($test){console.log("res",res,"res1",res1)}
if(typeof res1=="function"){
if(res1.__class__===$B.method){return res}
if(res.$type=="staticmethod"){return res}else{var self=res.__class__===$B.method ? klass :obj,method=function(){var args=[self]
for(var i=0,len=arguments.length;i < len;i++){args.push(arguments[i])}
return res.apply(this,args)}
method.__class__=$B.method
method.__get__=function(obj,cls){var clmethod=res.bind(null,cls)
clmethod.__class__=$B.method
clmethod.$infos={__self__:cls,__func__:res,__name__:res.$infos.__name__,__qualname__:cls.__name__+"."+
res.$infos.__name__}
return clmethod}
method.__get__.__class__=$B.method_wrapper
method.__get__.$infos=res.$infos
method.$infos={__self__:self,__func__:res,__name__:attr,__qualname__:klass.__qualname__+"."+attr}
if($test){console.log("return method",method)}
if(is_own_class_instance_method){obj.$method_cache=obj.$method_cache ||{}
obj.$method_cache[attr]=[method,res]}
return method}}else{
return res1}}
return res}else{throw $B.attr_error(attr,obj)}}
object.__gt__=function(){return _b_.NotImplemented}
object.__hash__=function(self){var hash=self.__hashvalue__
if(hash !==undefined){return hash}
return self.__hashvalue__=$B.$py_next_hash--}
object.__init__=function(){if(arguments.length==0){throw _b_.TypeError.$factory("descriptor '__init__' of 'object' "+
"object needs an argument")}
return _b_.None}
object.__le__=function(){return _b_.NotImplemented}
object.__lt__=function(){return _b_.NotImplemented}
object.__mro__=[]
object.$new=function(cls){return function(){if(arguments.length > 0){throw _b_.TypeError.$factory("object() takes no parameters")}
var res=Object.create(null)
res.__class__=cls
res.__dict__=$B.obj_dict({})
return res}}
object.__new__=function(cls,...args){if(cls===undefined){throw _b_.TypeError.$factory("object.__new__(): not enough arguments")}
var init_func=$B.$getattr(cls,"__init__")
if(init_func===object.__init__){if(args.length > 0){throw _b_.TypeError.$factory("object() takes no parameters")}}
var res=Object.create(null)
$B.update_obj(res,{__class__ :cls,__dict__:$B.obj_dict({})})
return res}
object.__ne__=function(self,other){
if(self===other){return false}
var eq=$B.$getattr(self.__class__ ||$B.get_class(self),"__eq__",null)
if(eq !==null){var res=$B.$call(eq)(self,other)
if(res===_b_.NotImplemented){return res}
return ! $B.$bool(res)}
return _b_.NotImplemented}
object.__reduce__=function(self){if(! self.__dict__){throw _b_.TypeError.$factory(`cannot pickle '${$B.class_name(self)}' object`)}
if($B.imported.copyreg===undefined){$B.$import('copyreg')}
var res=[$B.imported.copyreg._reconstructor]
var D=$B.get_class(self),B=object
for(var klass of D.__mro__){if(klass.__module__=='builtins'){B=klass
break}}
var args=[D,B]
if(B===object){args.push(_b_.None)}else{args.push($B.$call(B)(self))}
res.push($B.fast_tuple(args))
var d=$B.empty_dict()
for(var attr of _b_.dict.$keys_string(self.__dict__)){_b_.dict.$setitem(d,attr,_b_.dict.$getitem_string(self.__dict__,attr))}
res.push(d)
return _b_.tuple.$factory(res)}
function getNewArguments(self,klass){var newargs_ex=$B.$getattr(self,'__getnewargs_ex__',null)
if(newargs_ex !==null){var newargs=newargs_ex()
if((! newargs)||newargs.__class__ !==_b_.tuple){throw _b_.TypeError.$factory("__getnewargs_ex__ should "+
`return a tuple, not '${$B.class_name(newargs)}'`)}
if(newargs.length !=2){throw _b_.ValueError.$factory("__getnewargs_ex__ should "+
`return a tuple of length 2, not ${newargs.length}`)}
var args=newargs[0],kwargs=newargs[1]
if((! args)||args.__class__ !==_b_.tuple){throw _b_.TypeError.$factory("first item of the tuple returned "+
`by __getnewargs_ex__ must be a tuple, not '${$B.class_name(args)}'`)}
if((! kwargs)||kwargs.__class__ !==_b_.dict){throw _b_.TypeError.$factory("second item of the tuple returned "+
`by __getnewargs_ex__ must be a dict, not '${$B.class_name(kwargs)}'`)}
return{args,kwargs}}
var newargs=klass.$getnewargs,args
if(! newargs){newargs=$B.$getattr(klass,'__getnewargs__',null)}
if(newargs){args=newargs(self)
if((! args)||args.__class__ !==_b_.tuple){throw _b_.TypeError.$factory("__getnewargs__ should "+
`return a tuple, not '${$B.class_name(args)}'`)}
return{args}}}
object.__reduce_ex__=function(self,protocol){var klass=$B.get_class(self)
if($B.imported.copyreg===undefined){$B.$import('copyreg')}
if(protocol < 2){return $B.$call($B.imported.copyreg._reduce_ex)(self,protocol)}
var reduce=$B.$getattr(klass,'__reduce__')
if(reduce !==object.__reduce__){return $B.$call(reduce)(self)}
var res=[$B.imported.copyreg.__newobj__]
var arg2=[klass]
var newargs=getNewArguments(self,klass)
if(newargs){arg2=arg2.concat(newargs.args)}
res.push($B.fast_tuple(arg2))
var d=$B.empty_dict(),nb=0
if(self.__dict__){for(var item of _b_.dict.$iter_items_with_hash(self.__dict__)){if(item.key=="__class__" ||item.key.startsWith("$")){continue}
_b_.dict.$setitem(d,item.key,item.value)
nb++}}
if(nb==0){d=_b_.None}
res.push(d)
res.push(_b_.None)
res.push(_b_.None)
return _b_.tuple.$factory(res)}
object.__repr__=function(self){if(self===object){return "<class 'object'>"}
if(self.__class__===_b_.type){return "<class '"+self.__name__+"'>"}
var module=self.__class__.__module__
if(module !==undefined && !module.startsWith("$")&&
module !=="builtins"){return "<"+self.__class__.__module__+"."+
$B.class_name(self)+" object>"}else{return "<"+$B.class_name(self)+" object>"}}
object.__setattr__=function(self,attr,val){if(val===undefined){
throw _b_.TypeError.$factory(
"can't set attributes of built-in/extension type 'object'")}else if(self.__class__===object){
if(object[attr]===undefined){throw $B.attr_error(attr,self)}else{throw _b_.AttributeError.$factory(
"'object' object attribute '"+attr+"' is read-only")}}
if(self.__dict__){_b_.dict.$setitem(self.__dict__,attr,val)}else{
self[attr]=val}
return _b_.None}
object.__setattr__.__get__=function(obj){return function(attr,val){object.__setattr__(obj,attr,val)}}
object.__setattr__.__str__=function(){return "method object.setattr"}
object.__str__=function(self){if(self===undefined ||self.$kw){throw _b_.TypeError.$factory("descriptor '__str__' of 'object' "+
"object needs an argument")}
var klass=self.__class__ ||$B.get_class(self)
var repr_func=$B.$getattr(klass,"__repr__")
return $B.$call(repr_func).apply(null,arguments)}
object.__subclasshook__=function(){return _b_.NotImplemented}
object.$factory=function(){if(arguments.length > 0 ||
(arguments.length==1 && arguments[0].$kw &&
Object.keys(arguments[0].$kw).length > 0)
){throw _b_.TypeError.$factory('object() takes no arguments')}
var res={__class__:object},args=[res]
object.__init__.apply(null,args)
return res}
$B.set_func_names(object,"builtins")
return object})(__BRYTHON__)
;
;(function($B){var _b_=$B.builtins
var TPFLAGS={STATIC_BUILTIN:1 << 1,MANAGED_WEAKREF:1 << 3,MANAGED_DICT:1 << 4,SEQUENCE:1 << 5,MAPPING:1 << 6,DISALLOW_INSTANTIATION:1 << 7,IMMUTABLETYPE:1 << 8,HEAPTYPE:1 << 9,BASETYPE:1 << 10,HAVE_VECTORCALL:1 << 11,READY:1 << 12,READYING:1 << 13,HAVE_GC:1 << 14,METHOD_DESCRIPTOR:1 << 17,VALID_VERSION_TAG:1 << 19,IS_ABSTRACT:1 << 20,MATCH_SELF:1 << 22,LONG_SUBCLASS:1 << 24,LIST_SUBCLASS:1 << 25,TUPLE_SUBCLASS:1 << 26,BYTES_SUBCLASS:1 << 27,UNICODE_SUBCLASS:1 << 28,DICT_SUBCLASS:1 << 29,BASE_EXC_SUBCLASS:1 << 30,TYPE_SUBCLASS:1 << 31,HAVE_FINALIZE:1 << 0,HAVE_VERSION_TAG:1 << 18}
$B.$class_constructor=function(class_name,class_obj_proxy,metaclass,resolved_bases,bases,kwargs){var dict
if(class_obj_proxy instanceof $B.str_dict){dict=$B.empty_dict()
dict.$strings=class_obj_proxy}else{dict=class_obj_proxy.$target}
var module=class_obj_proxy.__module__
for(var base of bases){if(base.__flags__ !==undefined &&
!(base.__flags__ & TPFLAGS.BASETYPE)){throw _b_.TypeError.$factory(
"type 'bool' is not an acceptable base type")}}
var extra_kwargs={}
if(kwargs){for(var i=0;i < kwargs.length;i++){var key=kwargs[i][0],val=kwargs[i][1]
if(key !="metaclass"){
extra_kwargs[key]=val}}}
if(class_obj_proxy.__eq__ !==undefined &&
class_obj_proxy.__hash__===undefined){$B.$setitem(dict,'__hash__',_b_.None)}
var slots=class_obj_proxy.__slots__
if(slots !==undefined){if(typeof slots=="string"){slots=[slots]}else{for(var item of $B.make_js_iterator(slots)){if(typeof item !='string'){throw _b_.TypeError.$factory('__slots__ items must be '+
`strings, not '${$B.class_name(item)}'`)}}}
$B.$setitem(dict,'__slots__',slots)}
var meta_new=_b_.type.__getattribute__(metaclass,"__new__")
var kls=meta_new(metaclass,class_name,resolved_bases,dict,{$kw:[extra_kwargs]})
kls.__module__=module
kls.$subclasses=[]
kls.$is_class=true
if(kls.__class__===metaclass){
var meta_init=_b_.type.__getattribute__(metaclass,"__init__")
meta_init(kls,class_name,resolved_bases,dict,{$kw:[extra_kwargs]})}
for(var i=0;i < bases.length;i++){bases[i].$subclasses=bases[i].$subclasses ||[]
bases[i].$subclasses.push(kls)}
return kls}
$B.get_metaclass=function(class_name,module,bases,kw_meta){
var metaclass
if(kw_meta===undefined && bases.length==0){return _b_.type}else if(kw_meta){if(! $B.$isinstance(kw_meta,_b_.type)){return kw_meta}
metaclass=kw_meta}
if(bases && bases.length > 0){if(bases[0].__class__===undefined){
if(typeof bases[0]=="function"){if(bases.length !=1){throw _b_.TypeError.$factory("A Brython class "+
"can inherit at most 1 Javascript constructor")}
metaclass=bases[0].__class__=$B.JSMeta
$B.set_func_names(bases[0],module)}else{throw _b_.TypeError.$factory("Argument of "+class_name+
" is not a class (type '"+$B.class_name(bases[0])+
"')")}}
for(var base of bases){var mc=base.__class__
if(metaclass===undefined){metaclass=mc}else if(mc===metaclass ||_b_.issubclass(metaclass,mc)){}else if(_b_.issubclass(mc,metaclass)){metaclass=mc}else if(metaclass.__bases__ &&
metaclass.__bases__.indexOf(mc)==-1){throw _b_.TypeError.$factory("metaclass conflict: the "+
"metaclass of a derived class must be a (non-"+
"strict) subclass of the metaclasses of all its bases")}}}else{metaclass=metaclass ||_b_.type}
return metaclass}
function set_attr_if_absent(dict,attr,value){try{$B.$getitem(dict,attr)}catch(err){$B.$setitem(dict,attr,value)}}
$B.make_class_namespace=function(metaclass,class_name,module,qualname,bases){
var class_dict=_b_.dict.$literal([['__module__',module],['__qualname__',qualname]
])
if(metaclass !==_b_.type){var prepare=$B.$getattr(metaclass,"__prepare__",_b_.None)
if(prepare !==_b_.None){class_dict=$B.$call(prepare)(class_name,bases)
set_attr_if_absent(class_dict,'__module__',module)
set_attr_if_absent(class_dict,'__qualname__',qualname)}}
if(class_dict.__class__===_b_.dict){if(class_dict.$all_str){return class_dict.$strings}
return new Proxy(class_dict,{get:function(target,prop){if(prop=='__class__'){return _b_.dict}else if(prop=='$target'){return target}
if(_b_.dict.$contains_string(target,prop)){return _b_.dict.$getitem_string(target,prop)}
return undefined},set:function(target,prop,value){_b_.dict.$setitem(target,prop,value)}})}else{var setitem=$B.$getattr(class_dict,"__setitem__"),getitem=$B.$getattr(class_dict,"__getitem__")
return new Proxy(class_dict,{get:function(target,prop){if(prop=='__class__'){return $B.get_class(target)}else if(prop=='$target'){return target}
try{return getitem(prop)}catch(err){return undefined}},set:function(target,prop,value){setitem(prop,value)
return _b_.None}})}}
$B.resolve_mro_entries=function(bases){
var new_bases=[],has_mro_entries=false
for(var base of bases){if(! $B.$isinstance(base,_b_.type)){var mro_entries=$B.$getattr(base,"__mro_entries__",_b_.None)
if(mro_entries !==_b_.None){has_mro_entries=true
var entries=_b_.list.$factory(mro_entries(bases))
new_bases=new_bases.concat(entries)}else{new_bases.push(base)}}else{new_bases.push(base)}}
return has_mro_entries ? new_bases :bases}
var type_getsets={__name__:"getset",__qualname__:"getset",__bases__:"getset",__module__:"getset",__abstractmethods__:"getset",__dict__:"get",__doc__:"getset",__text_signature__:"get",__annotations__:"getset"}
$B.make_class=function(qualname,factory){
var A={__class__:type,__bases__:[_b_.object],__mro__:[_b_.object],__name__:qualname,__qualname__:qualname,$is_class:true}
A.$factory=factory
return A}
$B.make_type_alias=function(name,type_params,value){$B.$import('typing')
var t=$B.$call($B.$getattr($B.imported.typing,'TypeAliasType'))(name,value)
t.__type_params__=type_params
return t}
var type=$B.make_class("type",function(kls,bases,cl_dict){var missing={},$=$B.args('type',3,{kls:null,bases:null,cl_dict:null},['kls','bases','cl_dict'],arguments,{bases:missing,cl_dict:missing},null,'kw'),kls=$.kls,bases=$.bases,cl_dict=$.cl_dict,kw=$.kw
var kwarg={}
for(var key in kw.$jsobj){kwarg[key]=kw.$jsobj[key]}
var kwargs={$kw:[kwarg]}
if(cl_dict===missing){if(bases !==missing){throw _b_.TypeError.$factory('type() takes 1 or 3 arguments')}
return $B.get_class(kls)}else{var module=$B.frame_obj.frame[2],resolved_bases=$B.resolve_mro_entries(bases),metaclass=$B.get_metaclass(kls,module,resolved_bases)
return type.__call__(metaclass,kls,resolved_bases,cl_dict,kwargs)}}
)
type.__class__=type
var classmethod=_b_.classmethod=$B.make_class("classmethod",function(func){$B.check_nb_args_no_kw('classmethod',1,arguments)
return{
__class__:classmethod,__func__:func}}
)
classmethod.__get__=function(){
var $=$B.args('classmethod',3,{self:null,obj:null,cls:null},['self','obj','cls'],arguments,{cls:_b_.None},null,null),self=$.self,obj=$.obj,cls=$.cls
if(cls===_b_.None ||cls===undefined){cls=$B.get_class(obj)}
var func_class=$B.get_class(self.__func__),candidates=[func_class].concat(func_class.__mro__)
for(var candidate of candidates){if(candidate===$B.function){break}
if(candidate.__get__){return candidate.__get__(self.__func__,cls,cls)}}
return $B.method.$factory(self.__func__,cls)}
$B.set_func_names(classmethod,"builtins")
var staticmethod=_b_.staticmethod=$B.make_class("staticmethod",function(func){return{
__class__:staticmethod,__func__:func}}
)
staticmethod.__call__=function(self){return $B.$call(self.__func__)}
staticmethod.__get__=function(self){return self.__func__}
$B.set_func_names(staticmethod,"builtins")
$B.getset_descriptor=$B.make_class("getset_descriptor",function(klass,attr,getter,setter){var res={__class__:$B.getset_descriptor,__doc__:_b_.None,cls:klass,attr,getter,setter}
return res}
)
$B.getset_descriptor.__get__=function(self,obj,klass){console.log('__get__',self,obj,klass)
if(obj===_b_.None){return self}
return self.getter(self,obj,klass)}
$B.getset_descriptor.__set__=function(self,klass,value){return self.setter(self,klass,value)}
$B.getset_descriptor.__repr__=function(self){return `<attribute '${self.attr}' of '${self.cls.__name__}' objects>`}
$B.set_func_names($B.getset_descriptor,"builtins")
var data_descriptors=['__abstractmethods__','__annotations__','__base__','__bases__','__basicsize__',
'__dictoffset__','__doc__','__flags__','__itemsize__','__module__','__mro__','__name__','__qualname__','__text_signature__','__weakrefoffset__'
]
type.$call=function(klass,new_func,init_func){
return function(){
var instance=new_func.bind(null,klass).apply(null,arguments)
if($B.$isinstance(instance,klass)){
init_func.bind(null,instance).apply(null,arguments)}
return instance}}
type.$call_no_init=function(klass,new_func){
return new_func.bind(null,klass)}
type.__call__=function(){var extra_args=[],klass=arguments[0]
for(var i=1,len=arguments.length;i < len;i++){extra_args.push(arguments[i])}
var new_func=_b_.type.__getattribute__(klass,"__new__")
var instance=new_func.apply(null,arguments),instance_class=instance.__class__ ||$B.get_class(instance)
if(instance_class===klass){
var init_func=_b_.type.__getattribute__(klass,"__init__")
if(init_func !==_b_.object.__init__){
var args=[instance].concat(extra_args)
init_func.apply(null,args)}}
return instance}
type.__class_getitem__=function(kls,origin,args){
if(kls !==type){throw _b_.TypeError.$factory(`type '${kls.__qualname__}' `+
"is not subscriptable")}
return $B.GenericAlias.$factory(kls,origin,args)}
function merge_class_dict(dict,klass){var classdict,bases
classdict=$B.$getattr(klass,'__dict__',null)
if(classdict !==null){_b_.dict.update(dict,classdict)}else{return}
bases=klass.__bases__
if(bases===undefined){return}
for(var base of bases){merge_class_dict(dict,base)}}
type.__dir__=function(klass){var dict=$B.empty_dict()
merge_class_dict(dict,klass)
return _b_.sorted(dict)}
type.__format__=function(klass,fmt_spec){
return _b_.str.$factory(klass)}
type.__getattribute__=function(klass,attr){switch(attr){case "__annotations__":
var ann=klass.__annotations__
return ann===undefined ? $B.empty_dict():ann
case "__bases__":
if(klass.__bases__ !==undefined){return $B.fast_tuple($B.resolve_mro_entries(klass.__bases__))}
throw $B.attr_error(attr,klass)
case "__class__":
return klass.__class__
case "__doc__":
return klass.__doc__ ||_b_.None
case '__name__':
return klass.__name__ ||klass.__qualname__
case "__setattr__":
if(klass["__setattr__"]!==undefined){var func=klass["__setattr__"]}else{var func=function(kls,key,value){kls[key]=value}}
return method_wrapper.$factory(attr,klass,func)
case "__delattr__":
if(klass["__delattr__"]!==undefined){return klass["__delattr__"]}
return method_wrapper.$factory(attr,klass,function(key){delete klass[key]})}
var res=klass.hasOwnProperty(attr)? klass[attr]:undefined
var $test=attr=="toString" 
if($test){console.log("attr",attr,"of",klass,'\n  ',res,res+"")}
if(klass.__class__ &&
klass.__class__[attr]&&
klass.__class__[attr].__get__ &&
klass.__class__[attr].__set__){
if($test){console.log("data descriptor")}
return klass.__class__[attr].__get__(klass)}
if(res===undefined){
var v=klass.hasOwnProperty(attr)? klass[attr]:undefined
if(v===undefined){if($test){console.log(attr,'not in klass[attr], search in __dict__',klass.__dict__)}
if(klass.__dict__ && klass.__dict__.__class__===_b_.dict &&
_b_.dict.$contains_string(klass.__dict__,attr)){res=klass[attr]=_b_.dict.$getitem_string(klass.__dict__,attr)
if($test){console.log('found in __dict__',v)}}else{var mro=klass.__mro__
if(mro===undefined){console.log("no mro for",klass)}
for(var i=0;i < mro.length;i++){if(mro[i].hasOwnProperty(attr)){res=mro[i][attr]
break}}}}else{res=v}
if($test){console.log('search in class mro',res)
if(res !==undefined){if(klass.hasOwnProperty(attr)){console.log('found in klass',klass)}else{console.log('found in',mro[i])}}}}
if(res===undefined){
if(res===undefined){var meta=klass.__class__ ||$B.get_class(klass),res=meta.hasOwnProperty(attr)? meta[attr]:undefined
if($test){console.log("search in meta",meta,res)}
if(res===undefined){var meta_mro=meta.__mro__
for(var i=0;i < meta_mro.length;i++){if(meta_mro[i].hasOwnProperty(attr)){res=meta_mro[i][attr]
break}}}
if(res !==undefined){if($test){console.log("found in meta",res,typeof res)}
if(res.__class__===_b_.property){return res.fget(klass)}
if(typeof res=="function"){
if(attr=='__new__'){
return res}
var meta_method=res.bind(null,klass)
meta_method.__class__=$B.method
meta_method.$infos={__self__:klass,__func__:res,__name__:attr,__qualname__:meta.__name__+"."+attr,__module__:res.$infos ? res.$infos.__module__ :""}
if($test){console.log('return method from meta',meta_method,meta_method+'')}
return meta_method}}}
if(res===undefined){
var getattr=meta.__getattr__
if(getattr===undefined){for(var i=0;i < meta_mro.length;i++){if(meta_mro[i].__getattr__ !==undefined){getattr=meta_mro[i].__getattr__
break}}}
if(getattr !==undefined){return getattr(klass,attr)}}}
if(res !==undefined){if($test){console.log("res",res)}
if(res.__class__===_b_.property){return res}else if(res.__class__===_b_.classmethod){return _b_.classmethod.__get__(res,_b_.None,klass)}
if(res.__get__){if(res.__class__===method){if($test){console.log('__get__ of method',res.$infos.__self__,klass)}
if(res.$infos.__self__){
return res}
var result=res.__get__(res.__func__,klass)
result.$infos={__func__:res,__name__:res.$infos.__name__,__qualname__:klass.__name__+"."+res.$infos.__name__,__self__:klass}}else{result=res.__get__(klass)}
return result}else if(res.__class__ && res.__class__.__get__){
if(!(attr.startsWith("__")&& attr.endsWith("__"))){return res.__class__.__get__(res,_b_.None,klass)}}
if(typeof res=="function"){
if(res.$infos===undefined && $B.get_option('debug')> 1){console.log("warning: no attribute $infos for",res,"klass",klass,"attr",attr)}
if($test){console.log("res is function",res)}
if(attr=="__new__" ||
res.__class__===$B.builtin_function_or_method){res.$type="staticmethod"}
if((attr=="__class_getitem__" ||attr=="__init_subclass__")
&& res.__class__ !==_b_.classmethod){res=_b_.classmethod.$factory(res)
return _b_.classmethod.__get__(res,_b_.None,klass)}
if(res.__class__===$B.method){return res.__get__(null,klass)}else{if($test){console.log("return res",res)}
return res}}else{return res}}}
type.__hash__=function(cls){return _b_.hash(cls)}
type.__init__=function(){if(arguments.length==0){throw _b_.TypeError.$factory("descriptor '__init__' of 'type' "+
"object needs an argument")}}
type.__init_subclass__=function(){
var $=$B.args("__init_subclass__",1,{cls:null},['cls'],arguments,{},"args","kwargs")
if($.args.length > 0){throw _b_.TypeError.$factory(
`${$.cls.__qualname__}.__init_subclass__ takes no arguments `+
`(${$.args.length} given)`)}
for(var key in $.kwargs.$jsobj){throw _b_.TypeError.$factory(
`${$.cls.__qualname__}.__init_subclass__() `+
`takes no keyword arguments`)}
return _b_.None}
_b_.object.__init_subclass__=type.__init_subclass__
type.__instancecheck__=function(cls,instance){var kl=instance.__class__ ||$B.get_class(instance)
if(kl===cls){return true}else{for(var i=0;i < kl.__mro__.length;i++){if(kl.__mro__[i]===cls){return true}}}
return false}
type.__instancecheck__.$type="staticmethod"
type.__name__='type'
type.__new__=function(meta,name,bases,cl_dict,extra_kwargs){
var test=false 
extra_kwargs=extra_kwargs===undefined ?{$kw:[{}]}:
extra_kwargs
if(! $B.$isinstance(cl_dict,_b_.dict)){console.log('bizarre',meta,name,bases,cl_dict)
alert()}
var module=_b_.dict.$get_string(cl_dict,'__module__')
if(module===_b_.dict.$missing){module=$B.frame_obj.frame[2]}
var qualname=_b_.dict.$get_string(cl_dict,'__qualname__')
if(qualname===_b_.dict.$missing){qualname=name}
var class_dict={__class__ :meta,__bases__ :bases.length==0 ?[_b_.object]:bases,__dict__ :cl_dict,__qualname__:qualname,__module__:module,__name__:name,$is_class:true}
try{var slots=_b_.dict.$get_string(cl_dict,'__slots__')
if(slots !==_b_.dict.$missing){for(var name of $B.make_js_iterator(slots)){class_dict[name]=member_descriptor.$factory(name,class_dict)}}}catch(err){}
class_dict.__mro__=type.mro(class_dict).slice(1)
for(var entry of _b_.dict.$iter_items_with_hash(cl_dict)){var key=entry.key,v=entry.value
if(['__module__','__class__','__name__','__qualname__'].
indexOf(key)>-1){continue}
if(key.startsWith('$')){continue}
if(v===undefined){continue}
class_dict[key]=v
if(v.__class__){
var set_name=$B.$getattr(v.__class__,"__set_name__",_b_.None)
if(set_name !==_b_.None){set_name(v,class_dict,key)}}
if(typeof v=="function"){if(v.$infos===undefined){
console.log($B.make_frames_stack())}else{v.$infos.$class=class_dict
v.$infos.__qualname__=name+'.'+v.$infos.__name__
if(v.$infos.$defaults){
var $defaults=v.$infos.$defaults
$B.function.__setattr__(v,"__defaults__",$defaults)}}}}
var sup=_b_.super.$factory(class_dict,class_dict)
var init_subclass=_b_.super.__getattribute__(sup,"__init_subclass__")
init_subclass(extra_kwargs)
return class_dict}
type.__or__=function(){var $=$B.args('__or__',2,{cls:null,other:null},['cls','other'],arguments,{},null,null),cls=$.cls,other=$.other
if(other !==_b_.None && ! $B.$isinstance(other,[type,$B.GenericAlias])){return _b_.NotImplemented}
return $B.UnionType.$factory([cls,other])}
type.__prepare__=function(){return $B.empty_dict()}
type.__qualname__='type'
type.__repr__=function(kls){$B.builtins_repr_check(type,arguments)
var qualname=kls.__qualname__
if(kls.__module__ &&
kls.__module__ !="builtins" &&
!kls.__module__.startsWith("$")){qualname=kls.__module__+"."+qualname}
return "<class '"+qualname+"'>"}
type.__ror__=function(){var len=arguments.length
if(len !=1){throw _b_.TypeError.$factory(`expected 1 argument, got ${len}`)}
return _b_.NotImplemented}
type.__setattr__=function(kls,attr,value){var $test=false
if($test){console.log("kls is class",type,types[attr])}
if(type[attr]&& type[attr].__get__ &&
type[attr].__set__){type[attr].__set__(kls,value)
return _b_.None}
if(kls.__module__=="builtins"){throw _b_.TypeError.$factory(
`cannot set '${attr}' attribute of immutable type '`+
kls.__qualname__+"'")}
kls[attr]=value
var mp=kls.__dict__ ||$B.$getattr(kls,'__dict__')
_b_.dict.$setitem(mp,attr,value)
if(attr=="__init__" ||attr=="__new__"){
kls.$factory=$B.$instance_creator(kls)}else if(attr=="__bases__"){
kls.__mro__=_b_.type.mro(kls)}
if($test){console.log("after setattr",kls)}
return _b_.None}
type.mro=function(cls){
if(cls===undefined){throw _b_.TypeError.$factory(
'unbound method type.mro() needs an argument')}
var bases=cls.__bases__,seqs=[],pos1=0
for(var base of bases){
var bmro=[],pos=0
if(base===undefined ||
base.__mro__===undefined){if(base.__class__===undefined){
return[_b_.object]}else{console.log('error for base',base)
console.log('cls',cls)}}
bmro[pos++]=base
var _tmp=base.__mro__
if(_tmp){if(_tmp[0]===base){_tmp.splice(0,1)}
for(var k=0;k < _tmp.length;k++){bmro[pos++]=_tmp[k]}}
seqs[pos1++]=bmro}
seqs[pos1++]=bases.slice()
var mro=[cls],mpos=1
while(1){var non_empty=[],pos=0
for(var i=0;i < seqs.length;i++){if(seqs[i].length > 0){non_empty[pos++]=seqs[i]}}
if(non_empty.length==0){break}
for(var i=0;i < non_empty.length;i++){var seq=non_empty[i],candidate=seq[0],not_head=[],pos=0
for(var j=0;j < non_empty.length;j++){var s=non_empty[j]
if(s.slice(1).indexOf(candidate)>-1){not_head[pos++]=s}}
if(not_head.length > 0){candidate=null}
else{break}}
if(candidate===null){throw _b_.TypeError.$factory(
"inconsistent hierarchy, no C3 MRO is possible")}
mro[mpos++]=candidate
for(var i=0;i < seqs.length;i++){var seq=seqs[i]
if(seq[0]===candidate){
seqs[i].shift()}}}
if(mro[mro.length-1]!==_b_.object){mro[mpos++]=_b_.object}
return mro}
type.__subclasscheck__=function(self,subclass){
var klass=self
if(subclass.__bases__===undefined){return self===_b_.object}
return subclass.__bases__.indexOf(klass)>-1}
$B.set_func_names(type,"builtins")
type.__init_subclass__=_b_.classmethod.$factory(type.__init_subclass__)
_b_.type=type
var property=_b_.property=$B.make_class("property",function(fget,fset,fdel,doc){var res={__class__:property}
property.__init__(res,fget,fset,fdel,doc)
return res}
)
property.__init__=function(self,fget,fset,fdel,doc){var $=$B.args('__init__',5,{self:null,fget:null,fset:null,fdel:null,doc:null},['self','fget','fset','fdel','doc'],arguments,{fget:_b_.None,fset:_b_.None,fdel:_b_.None,doc:_b_.None},null,null),self=$.self,fget=$.fget,fset=$.fset,fdel=$.fdel,doc=$.doc
self.__doc__=doc ||""
self.$type=fget.$type
self.fget=fget
self.fset=fset
self.fdel=fdel
self.$is_property=true
if(fget && fget.$attrs){for(var key in fget.$attrs){self[key]=fget.$attrs[key]}}
self.__delete__=fdel;
self.getter=function(fget){return property.$factory(fget,self.fset,self.fdel,self.__doc__)}
self.setter=function(fset){return property.$factory(self.fget,fset,self.fdel,self.__doc__)}
self.deleter=function(fdel){return property.$factory(self.fget,self.fset,fdel,self.__doc__)}}
property.__get__=function(self,kls){if(self.fget===undefined){throw _b_.AttributeError.$factory("unreadable attribute")}
return $B.$call(self.fget)(kls)}
property.__new__=function(cls){return{
__class__:cls}}
property.__set__=function(self,obj,value){if(self.fset===undefined){var name=self.fget.$infos.__name__
var msg=`property '${name}' of '${$B.class_name(obj)}' object `+
'has no setter'
throw _b_.AttributeError.$factory(msg)}
$B.$getattr(self.fset,'__call__')(obj,value)}
$B.set_func_names(property,"builtins")
var wrapper_descriptor=$B.wrapper_descriptor=
$B.make_class("wrapper_descriptor")
$B.set_func_names(wrapper_descriptor,"builtins")
type.__call__.__class__=wrapper_descriptor
var $instance_creator=$B.$instance_creator=function(klass){var test=false 
if(test){console.log('instance creator of',klass)}
if(klass.prototype && klass.prototype.constructor==klass){
return function(){return new klass(...arguments)}}
if(klass.__abstractmethods__ && $B.$bool(klass.__abstractmethods__)){return function(){var ams=Array.from($B.make_js_iterator(klass.__abstractmethods__))
ams.sort()
var msg=(ams.length > 1 ? 's ' :' ')+ams.join(', ')
throw _b_.TypeError.$factory(
"Can't instantiate abstract class interface "+
"with abstract method"+msg)}}
var metaclass=klass.__class__ ||$B.get_class(klass),call_func,factory
if(metaclass===_b_.type){var new_func=type.__getattribute__(klass,'__new__'),init_func=type.__getattribute__(klass,'__init__')
if(init_func===_b_.object.__init__){if(new_func===_b_.object.__new__){factory=_b_.object.$new(klass)}else{factory=new_func.bind(null,klass)}}else{factory=type.$call(klass,new_func,init_func)}}else{call_func=_b_.type.__getattribute__(metaclass,"__call__")
if(call_func.$is_class){factory=$B.$call(call_func)}else{factory=call_func.bind(null,klass)}}
factory.__class__=$B.function
factory.$infos={__name__:klass.__name__,__module__:klass.__module__}
return factory}
var method_wrapper=$B.method_wrapper=$B.make_class("method_wrapper",function(attr,klass,method){var f=function(){return method.apply(null,arguments)}
f.$infos={__name__:attr,__module__:klass.__module__}
return f}
)
method_wrapper.__str__=method_wrapper.__repr__=function(self){return "<method '"+self.$infos.__name__+"' of function object>"}
var member_descriptor=$B.member_descriptor=$B.make_class("member_descriptor",function(attr,cls){return{__class__:member_descriptor,cls:cls,attr:attr}}
)
member_descriptor.__delete__=function(self,kls){if(kls.$slot_values===undefined ||
! kls.$slot_values.hasOwnProperty(self.attr)){throw _b_.AttributeError.$factory(self.attr)}
kls.$slot_values.delete(self.attr)}
member_descriptor.__get__=function(self,kls,obj_type){if(kls===_b_.None){return self}
if(kls.$slot_values===undefined ||
! kls.$slot_values.has(self.attr)){throw $B.attr_error(self.attr,kls)}
return kls.$slot_values.get(self.attr)}
member_descriptor.__set__=function(self,kls,value){if(kls.$slot_values===undefined){kls.$slot_values=new Map()}
kls.$slot_values.set(self.attr,value)}
member_descriptor.__str__=member_descriptor.__repr__=function(self){return "<member '"+self.attr+"' of '"+self.cls.__name__+
"' objects>"}
$B.set_func_names(member_descriptor,"builtins")
var method=$B.method=$B.make_class("method",function(func,cls){var f=function(){return $B.$call(func).bind(null,cls).apply(null,arguments)}
f.__class__=method
if(typeof func !=='function'){console.log('method from func w-o $infos',func,'all',$B.$call(func))}
f.$infos=func.$infos ||{}
f.$infos.__func__=func
f.$infos.__self__=cls
f.$infos.__dict__=$B.empty_dict()
return f}
)
method.__eq__=function(self,other){return self.$infos !==undefined &&
other.$infos !==undefined &&
self.$infos.__func__===other.$infos.__func__ &&
self.$infos.__self__===other.$infos.__self__}
method.__ne__=function(self,other){return ! $B.method.__eq__(self,other)}
method.__get__=function(self){var f=function(){return self(arguments)}
f.__class__=$B.method_wrapper
f.$infos=method.$infos
return f}
method.__getattribute__=function(self,attr){
var infos=self.$infos
if(infos && infos[attr]){if(attr=="__code__"){var res={__class__:$B.Code}
for(var attr in infos.__code__){res[attr]=infos.__code__[attr]}
return res}else{return infos[attr]}}else if(method.hasOwnProperty(attr)){return _b_.object.__getattribute__(self,attr)}else{
return $B.function.__getattribute__(self.$infos.__func__,attr)}}
method.__repr__=method.__str__=function(self){return "<bound method "+self.$infos.__qualname__+
" of "+_b_.str.$factory(self.$infos.__self__)+">"}
method.__setattr__=function(self,key,value){
if(key=="__class__"){throw _b_.TypeError.$factory("__class__ assignment only supported "+
"for heap types or ModuleType subclasses")}
throw $B.attr_error(attr,self)}
$B.set_func_names(method,"builtins")
$B.method_descriptor=$B.make_class("method_descriptor")
$B.classmethod_descriptor=$B.make_class("classmethod_descriptor")
_b_.object.__class__=type
$B.make_iterator_class=function(name){
var klass={__class__:_b_.type,__mro__:[_b_.object],__name__:name,__qualname__:name,$factory:function(items){return{
__class__:klass,__dict__:$B.empty_dict(),counter:-1,items:items,len:items.length,$builtin_iterator:true}},$is_class:true,$iterator_class:true,__iter__:function(self){self.counter=self.counter===undefined ?-1 :self.counter
self.len=self.items.length
return self},__len__:function(self){return self.items.length},__next__:function(self){if(typeof self.test_change=="function"){var message=self.test_change()
if(message){throw _b_.RuntimeError.$factory(message)}}
self.counter++
if(self.counter < self.items.length){var item=self.items[self.counter]
if(self.items.$brython_class=="js"){
item=$B.$JS2Py(item)}
return item}
throw _b_.StopIteration.$factory("StopIteration")},__reduce_ex__:function(self,protocol){return $B.fast_tuple([_b_.iter,_b_.tuple.$factory([self.items])])}}
$B.set_func_names(klass,"builtins")
return klass}
$B.GenericAlias=$B.make_class("GenericAlias",function(origin_class,items){var res={__class__:$B.GenericAlias,__mro__:[origin_class],origin_class,items}
return res}
)
$B.GenericAlias.__args__=_b_.property.$factory(
self=> $B.fast_tuple(self.items)
)
$B.GenericAlias.__call__=function(self,...args){return self.origin_class.$factory.apply(null,args)}
$B.GenericAlias.__eq__=function(self,other){if(! $B.$isinstance(other,$B.GenericAlias)){return false}
return $B.rich_comp("__eq__",self.origin_class,other.origin_class)&&
$B.rich_comp("__eq__",self.items,other.items)}
$B.GenericAlias.__getitem__=function(self,item){throw _b_.TypeError.$factory("descriptor '__getitem__' for '"+
self.origin_class.__name__+"' objects doesn't apply to a '"+
$B.class_name(item)+"' object")}
$B.GenericAlias.__mro_entries__=function(self,bases){return $B.fast_tuple([self.origin_class])}
$B.GenericAlias.__new__=function(origin_class,items,kwds){var res={__class__:$B.GenericAlias,__mro__:[origin_class],origin_class,items,$is_class:true}
return res}
$B.GenericAlias.__or__=function(self,other){var $=$B.args('__or__',2,{self:null,other:null},['self','other'],arguments,{},null,null)
return $B.UnionType.$factory([self,other])}
$B.GenericAlias.__origin__=_b_.property.$factory(
self=> self.origin_class
)
$B.GenericAlias.__parameters__=_b_.property.$factory(
self=> $B.fast_tuple([])
)
$B.GenericAlias.__repr__=function(self){var items=Array.isArray(self.items)? self.items :[self.items]
var reprs=[]
for(var item of items){if(item===_b_.Ellipsis){reprs.push('...')}else{if(item.$is_class){reprs.push(item.__name__)}else{reprs.push(_b_.repr(item))}}}
return self.origin_class.__qualname__+'['+
reprs.join(", ")+']'}
$B.set_func_names($B.GenericAlias,"types")
$B.UnionType=$B.make_class("UnionType",function(items){return{
__class__:$B.UnionType,items}}
)
$B.UnionType.__args__=_b_.property.$factory(
self=> $B.fast_tuple(self.items)
)
$B.UnionType.__eq__=function(self,other){if(! $B.$isinstance(other,$B.UnionType)){return _b_.NotImplemented}
return _b_.list.__eq__(self.items,other.items)}
$B.UnionType.__parameters__=_b_.property.$factory(
()=> $B.fast_tuple([])
)
$B.UnionType.__repr__=function(self){var t=[]
for(var item of self.items){if(item.$is_class){var s=item.__name__
if(item.__module__ !=="builtins"){s=item.__module__+'.'+s}
t.push(s)}else{t.push(_b_.repr(item))}}
return t.join(' | ')}
$B.set_func_names($B.UnionType,"types")})(__BRYTHON__)
;

;(function($B){var _b_=$B.builtins
_b_.__debug__=false
$B.$comps={'>':'gt','>=':'ge','<':'lt','<=':'le'}
$B.$inv_comps={'>':'lt','>=':'le','<':'gt','<=':'ge'}
var check_nb_args=$B.check_nb_args,check_no_kw=$B.check_no_kw,check_nb_args_no_kw=$B.check_nb_args_no_kw
var NoneType=$B.NoneType={$factory:function(){return None},__bool__:function(self){return False},__class__:_b_.type,__hash__:function(self){return 0},__module__:'builtins',__mro__:[_b_.object],__name__:'NoneType',__qualname__:'NoneType',__repr__:function(self){return 'None'},__str__:function(self){return 'None'},$is_class:true}
NoneType.__setattr__=function(self,attr){return no_set_attr(NoneType,attr)}
var None=_b_.None={__class__:NoneType}
None.__doc__=None
NoneType.__doc__=None
for(var $op in $B.$comps){
var key=$B.$comps[$op]
switch(key){case 'ge':
case 'gt':
case 'le':
case 'lt':
NoneType['__'+key+'__']=(function(op){return function(other){return _b_.NotImplemented}})($op)}}
for(var $func in None){if(typeof None[$func]=='function'){None[$func].__str__=(function(f){return function(){return "<method-wrapper "+f+
" of NoneType object>"}})($func)}}
$B.set_func_names(NoneType,"builtins")
_b_.__build_class__=function(){throw _b_.NotImplementedError.$factory('__build_class__')}
var abs=_b_.abs=function(obj){check_nb_args_no_kw('abs',1,arguments)
var klass=obj.__class__ ||$B.get_class(obj)
try{var method=$B.$getattr(klass,"__abs__")}catch(err){if(err.__class__===_b_.AttributeError){throw _b_.TypeError.$factory("Bad operand type for abs(): '"+
$B.class_name(obj)+"'")}
throw err}
return $B.$call(method)(obj)}
var aiter=_b_.aiter=function(async_iterable){return $B.$call($B.$getattr(async_iterable,'__aiter__'))()}
var all=_b_.all=function(obj){check_nb_args_no_kw('all',1,arguments)
var iterable=iter(obj)
while(1){try{var elt=next(iterable)
if(!$B.$bool(elt)){return false}}catch(err){return true}}}
var anext=_b_.anext=function(async_iterator,_default){var missing={},$=$B.args('anext',2,{async_iterator:null,_default:null},['async_iterator','_default'],arguments,{_default:missing},null,null)
var awaitable=$B.$call($B.$getattr(async_iterator,'__anext__'))()
return awaitable}
var any=_b_.any=function(obj){check_nb_args_no_kw('any',1,arguments)
for(var elt of $B.make_js_iterator(obj)){if($B.$bool(elt)){return true}}
return false}
var ascii=_b_.ascii=function(obj){check_nb_args_no_kw('ascii',1,arguments)
var res=repr(obj),res1='',cp
for(var i=0;i < res.length;i++){cp=res.charCodeAt(i)
if(cp < 128){res1+=res.charAt(i)}
else if(cp < 256){res1+='\\x'+cp.toString(16)}
else{var s=cp.toString(16)
if(s.length % 2==1){s="0"+s}
res1+='\\u'+s}}
return res1}
function $builtin_base_convert_helper(obj,base){var prefix="";
switch(base){case 2:
prefix='0b';break
case 8:
prefix='0o';break
case 16:
prefix='0x';break
default:
console.log('invalid base:'+base)}
if(obj.__class__===$B.long_int){var res=prefix+obj.value.toString(base)
return res}
var value=$B.$GetInt(obj)
if(value===undefined){
throw _b_.TypeError.$factory('Error, argument must be an integer or'+
' contains an __index__ function')}
if(value >=0){return prefix+value.toString(base)}
return '-'+prefix+(-value).toString(base)}
function bin_hex_oct(base,obj){
if($B.$isinstance(obj,_b_.int)){return $builtin_base_convert_helper(obj,base)}else{try{var klass=obj.__class__ ||$B.get_class(obj),method=$B.$getattr(klass,'__index__')}catch(err){if(err.__class__===_b_.AttributeError){throw _b_.TypeError.$factory("'"+$B.class_name(obj)+
"' object cannot be interpreted as an integer")}
throw err}
var res=$B.$call(method)(obj)
return $builtin_base_convert_helper(res,base)}}
var bin=_b_.bin=function(obj){check_nb_args_no_kw('bin',1,arguments)
return bin_hex_oct(2,obj)}
var breakpoint=_b_.breakpoint=function(){
$B.$import('sys',[])
var missing={},hook=$B.$getattr($B.imported.sys,'breakpointhook',missing)
if(hook===missing){throw _b_.RuntimeError.$factory('lost sys.breakpointhook')}
return $B.$call(hook).apply(null,arguments)}
var callable=_b_.callable=function(obj){check_nb_args_no_kw('callable',1,arguments)
return hasattr(obj,'__call__')}
var chr=_b_.chr=function(i){check_nb_args_no_kw('chr',1,arguments)
i=$B.PyNumber_Index(i)
if(i < 0 ||i > 1114111){throw _b_.ValueError.$factory('Outside valid range')}else if(i >=0x10000 && i <=0x10FFFF){var code=(i-0x10000),s=String.fromCodePoint(0xD800 |(code >> 10))+
String.fromCodePoint(0xDC00 |(code & 0x3FF))
return $B.make_String(s,[0])}else{return String.fromCodePoint(i)}}
var code=_b_.code=$B.make_class("code")
code.__repr__=code.__str__=function(_self){return `<code object ${_self.co_name}, file '${_self.co_filename}', `+
`line ${_self.co_firstlineno || 1}>`}
code.__getattribute__=function(self,attr){return self[attr]}
$B.set_func_names(code,"builtins")
var compile=_b_.compile=function(){var $=$B.args('compile',7,{source:null,filename:null,mode:null,flags:null,dont_inherit:null,optimize:null,_feature_version:null},['source','filename','mode','flags','dont_inherit','optimize','_feature_version'],arguments,{flags:0,dont_inherit:false,optimize:-1,_feature_version:0},null,null)
var module_name='$exec_'+$B.UUID()
$.__class__=code
$.co_flags=$.flags
$.co_name="<module>"
var filename=$.co_filename=$.filename
var interactive=$.mode=="single" &&($.flags & 0x200)
$B.file_cache[filename]=$.source
$B.url2name[filename]=module_name
if($B.$isinstance($.source,_b_.bytes)){var encoding='utf-8',lfpos=$.source.source.indexOf(10),first_line,second_line
if(lfpos==-1){first_line=$.source}else{first_line=_b_.bytes.$factory($.source.source.slice(0,lfpos))}
first_line=_b_.bytes.decode(first_line,'latin-1')
var encoding_re=/^[\t\f]*#.*?coding[:=][\t]*([-_.a-zA-Z0-9]+)/
var mo=first_line.match(encoding_re)
if(mo){encoding=mo[1]}else if(lfpos >-1){
var rest=$.source.source.slice(lfpos+1)
lfpos=rest.indexOf(10)
if(lfpos >-1){second_line=_b_.bytes.$factory(rest.slice(0,lfpos))}else{second_line=_b_.bytes.$factory(rest)}
second_line=_b_.bytes.decode(second_line,'latin-1')
var mo=second_line.match(encoding_re)
if(mo){encoding=mo[1]}}
$.source=_b_.bytes.decode($.source,encoding)}
if(! $B.$isinstance(filename,[_b_.bytes,_b_.str])){
$B.warn(_b_.DeprecationWarning,`path should be string, bytes, or os.PathLike, `+
`not ${$B.class_name(filename)}`)}
if(interactive && ! $.source.endsWith("\n")){
var lines=$.source.split("\n")
if($B.last(lines).startsWith(" ")){throw _b_.SyntaxError.$factory("unexpected EOF while parsing")}}
if($.source.__class__ && $.source.__class__.__module__=='ast'){
$B.imported._ast._validate($.source)
$._ast=$.source
delete $.source
return $}
if($B.parser_to_ast){try{var parser_mode=$.mode=='eval' ? 'eval' :'file'
var parser=new $B.Parser($.source,filename,parser_mode),_ast=parser.parse()}catch(err){if($.mode=='single'){try{parser.tokens.next }catch(err2){
var tokens=parser.tokens,tester=tokens[tokens.length-2]
if((tester.type=="NEWLINE" &&($.flags & 0x4000))||
tester.type=="DEDENT" &&($.flags & 0x200)){err.__class__=_b_.SyntaxError
err.args[0]='incomplete input'}}}
throw err}
if($.mode=='single' && _ast.body.length==1 &&
_ast.body[0]instanceof $B.ast.Expr){
var parser=new $B.Parser($.source,filename,'eval'),_ast=parser.parse()
$.single_expression=true}
var future=$B.future_features(_ast,filename),symtable=$B._PySymtable_Build(_ast,filename),js_obj=$B.js_from_root({ast:_ast,symtable,filename:$.filename})
if($.flags==$B.PyCF_ONLY_AST){delete $B.url2name[filename]
var res=$B.ast_js_to_py(_ast)
res.$js_ast=_ast
return res}}else{var root=$B.parser.create_root_node(
{src:$.source,filename},module_name,module_name)
root.mode=$.mode
root.parent_block=$B.builtins_scope
try{$B.parser.dispatch_tokens(root,$.source)
var _ast=root.ast()}catch(err){if($.mode=='single' && root.token_reader.read()===undefined){
var tokens=root.token_reader.tokens,tester=tokens[tokens.length-2]
if((tester.type=="NEWLINE" &&($.flags & 0x4000))||
tester.type=="DEDENT" &&($.flags & 0x200)){err.__class__=_b_.SyntaxError
err.args[0]='incomplete input'}}
throw err}
if($.mode=='single' && _ast.body.length==1 &&
_ast.body[0]instanceof $B.ast.Expr){
root=$B.parser.create_root_node(
{src:$.source,filename},module_name,module_name)
root.mode='eval'
$.single_expression=true
root.parent_block=$B.builtins_scope
$B.parser.dispatch_tokens(root,$.source)
_ast=root.ast()}
var future=$B.future_features(_ast,filename),symtable=$B._PySymtable_Build(_ast,filename,future)
delete $B.url2name[filename]
var js_obj=$B.js_from_root({ast:_ast,symtable,filename})
if($.flags==$B.PyCF_ONLY_AST){$B.create_python_ast_classes()
var klass=_ast.constructor.$name
var res=$B.ast_js_to_py(_ast)
res.$js_ast=_ast
return res}}
delete $B.url2name[filename]
$._ast=$B.ast_js_to_py(_ast)
$._ast.$js_ast=_ast
return $}
var __debug__=_b_.debug=$B.debug > 0
var delattr=_b_.delattr=function(obj,attr){
check_nb_args_no_kw('delattr',2,arguments)
if(typeof attr !='string'){throw _b_.TypeError.$factory("attribute name must be string, not '"+
$B.class_name(attr)+"'")}
return $B.$getattr(obj,'__delattr__')(attr)}
$B.$delete=function(name,is_global){
function del(obj){if(obj.__class__===$B.generator){
obj.js_gen.return()}}
var found=false,frame=$B.frame_obj.frame
if(! is_global){if(frame[1][name]!==undefined){found=true
del(frame[1][name])
delete frame[1][name]}}else{if(frame[2]!=frame[0]&& frame[3][name]!==undefined){found=true
del(frame[3][name])
delete frame[3][name]}}
if(!found){throw $B.name_error(name)}}
var dir=_b_.dir=function(obj){if(obj===undefined){
var locals=_b_.locals()
return _b_.sorted(locals)}
check_nb_args_no_kw('dir',1,arguments)
var klass=obj.__class__ ||$B.get_class(obj)
if(obj.$is_class){
var dir_func=$B.$getattr(obj.__class__,"__dir__")
return $B.$call(dir_func)(obj)}
try{var res=$B.$call($B.$getattr(klass,'__dir__'))(obj)
res=_b_.list.$factory(res)
return res}catch(err){
console.log('error in dir',obj,$B.$getattr(obj,'__dir__'),err.message)
throw err}
var res=[],pos=0
for(var attr in obj){if(attr.charAt(0)!=='$' && attr !=='__class__' &&
obj[attr]!==undefined){res[pos++]=attr}}
res.sort()
return res}
var divmod=_b_.divmod=function(x,y){check_nb_args_no_kw('divmod',2,arguments)
try{return $B.rich_op('__divmod__',x,y)}catch(err){if($B.is_exc(err,[_b_.TypeError])){return _b_.tuple.$factory([$B.rich_op('__floordiv__',x,y),$B.rich_op('__mod__',x,y)])}
throw err}}
var enumerate=_b_.enumerate=$B.make_class("enumerate",function(){var $ns=$B.args("enumerate",2,{iterable:null,start:null},['iterable','start'],arguments,{start:0},null,null),_iter=iter($ns["iterable"]),start=$ns["start"]
return{
__class__:enumerate,__name__:'enumerate iterator',counter:start-1,iter:_iter,start:start}}
)
enumerate.__iter__=function(self){self.counter=self.start-1
return self}
enumerate.__next__=function(self){self.counter++
return $B.fast_tuple([self.counter,next(self.iter)])}
$B.set_func_names(enumerate,"builtins")
var $$eval=_b_.eval=function(src,_globals,_locals){var $=$B.args("eval",4,{src:null,globals:null,locals:null,mode:null},['src','globals','locals','mode'],arguments,{globals:_b_.None,locals:_b_.None,mode:'eval'},null,null,4),src=$.src,_globals=$.globals,_locals=$.locals,mode=$.mode
if($.src.mode && $.src.mode=="single" &&
["<console>","<stdin>"].indexOf($.src.filename)>-1){
_b_.print(">",$.src.source.trim())}
var filename='<string>'
if(src.__class__===code){filename=src.filename}else if((! src.valueOf)||typeof src.valueOf()!=='string'){throw _b_.TypeError.$factory(`${mode}() arg 1 must be a string,`+
" bytes or code object")}else{
src=src.valueOf()}
var __name__='exec'
if(_globals !==_b_.None && _globals.__class__==_b_.dict &&
_b_.dict.$contains_string(_globals,'__name__')){__name__=_b_.dict.$getitem_string(_globals,'__name__')}
$B.url2name[filename]=__name__
var frame=$B.frame_obj.frame
var lineno=frame.$lineno
$B.exec_scope=$B.exec_scope ||{}
if(typeof src=='string' && src.endsWith('\\\n')){var exc=_b_.SyntaxError.$factory('unexpected EOF while parsing')
var lines=src.split('\n'),line=lines[lines.length-2]
exc.args=['unexpected EOF while parsing',[filename,lines.length-1,1,line]]
exc.filename=filename
exc.text=line
throw exc}
var local_name='locals_'+__name__,global_name='globals_'+__name__,exec_locals={},exec_globals={}
if(_globals===_b_.None){
if(frame[1]===frame[3]){
global_name+='_globals'
exec_locals=exec_globals=frame[3]}else{if(mode=="exec"){
exec_locals=$B.clone(frame[1])
for(var attr in frame[3]){exec_locals[attr]=frame[3][attr]}
exec_globals=exec_locals}else{
exec_locals=frame[1]
exec_globals=frame[3]}}}else{if(_globals.__class__ !==_b_.dict){throw _b_.TypeError.$factory(`${mode}() globals must be `+
"a dict, not "+$B.class_name(_globals))}
exec_globals={}
if(_globals.$jsobj){
exec_globals=_globals.$jsobj}else{
exec_globals=_globals.$jsobj={}
for(var key of _b_.dict.$keys_string(_globals)){_globals.$jsobj[key]=_b_.dict.$getitem_string(_globals,key)
if(key=='__name__'){__name__=_globals.$jsobj[key]}}
_globals.$all_str=false}
if(exec_globals.__builtins__===undefined){exec_globals.__builtins__=_b_.__builtins__}
if(_locals===_b_.None){exec_locals=exec_globals}else{if(_locals===_globals){
global_name+='_globals'
exec_locals=exec_globals}else if(_locals.$jsobj){for(var key in _locals.$jsobj){exec_globals[key]=_locals.$jsobj[key]}}else{if(_locals.$jsobj){exec_locals=_locals.$jsobj}else{var klass=$B.get_class(_locals),getitem=$B.$call($B.$getattr(klass,'__getitem__')),setitem=$B.$call($B.$getattr(klass,'__setitem__'))
exec_locals=new Proxy(_locals,{get(target,prop){if(prop=='$target'){return target}
try{return getitem(target,prop)}catch(err){return undefined}},set(target,prop,value){return setitem(target,prop,value)}})}}}}
var save_frame_obj=$B.frame_obj
var _ast
var frame=[__name__,exec_locals,__name__,exec_globals]
frame.is_exec_top=true
frame.__file__=filename
frame.$f_trace=$B.enter_frame(frame)
var _frame_obj=$B.frame_obj
frame.$lineno=1
if(src.__class__===code){_ast=src._ast
if(_ast.$js_ast){_ast=_ast.$js_ast}else{_ast=$B.ast_py_to_js(_ast)}}
try{if($B.parser_to_ast){if(! _ast){var _mode=mode=='eval' ? 'eval' :'file'
_ast=new $B.Parser(src,filename,_mode).parse()}}else{if(! _ast){var root=$B.parser.create_root_node(src,'<module>',frame[0],frame[2],1)
root.mode=mode
root.filename=filename
$B.parser.dispatch_tokens(root)
_ast=root.ast()}}
var future=$B.future_features(_ast,filename),symtable=$B._PySymtable_Build(_ast,filename,future),js_obj=$B.js_from_root({ast:_ast,symtable,filename,namespaces:{local_name,exec_locals,global_name,exec_globals}}),js=js_obj.js}catch(err){if(err.args){if(err.args[1]){var lineno=err.args[1][1]
exec_locals.$lineno=lineno}}else{console.log('JS Error',err.message)}
$B.frame_obj=save_frame_obj
throw err}
if(mode=='eval'){
js=`var locals = ${local_name}\nreturn ${js}`}else if(src.single_expression){js=`var result = ${js}\n`+
`if(result !== _b_.None){\n`+
`_b_.print(result)\n`+
`}`}
try{var exec_func=new Function('$B','_b_',local_name,global_name,'frame','_frame_obj',js)}catch(err){if(true){
console.log('eval() error\n',$B.format_indent(js,0))
console.log('-- python source\n',src)}
throw err}
try{var res=exec_func($B,_b_,exec_locals,exec_globals,frame,_frame_obj)}catch(err){if($B.get_option('debug')> 2){console.log(
'Python code\n',src,'\nexec func',$B.format_indent(exec_func+'',0),'\n    filename',filename,'\n    name from filename',$B.url2name[filename],'\n    local_name',local_name,'\n    exec_locals',exec_locals,'\n    global_name',global_name,'\n    exec_globals',exec_globals,'\n    frame',frame,'\n    _ast',_ast,'\n    js',js)}
$B.frame_obj=save_frame_obj
throw err}
if(_globals !==_b_.None && ! _globals.$jsobj){for(var key in exec_globals){if(! key.startsWith('$')){_b_.dict.$setitem(_globals,key,exec_globals[key])}}}
$B.frame_obj=save_frame_obj
return res}
$$eval.$is_func=true
var exec=_b_.exec=function(src,globals,locals){var missing={}
var $=$B.args("exec",3,{src:null,globals:null,locals:null},["src","globals","locals"],arguments,{globals:_b_.None,locals:_b_.None},null,null,3),src=$.src,globals=$.globals,locals=$.locals
$$eval(src,globals,locals,"exec")
return _b_.None}
exec.$is_func=true
var exit=_b_.exit=function(){throw _b_.SystemExit}
exit.__repr__=exit.__str__=function(){return "Use exit() or Ctrl-Z plus Return to exit"}
var filter=_b_.filter=$B.make_class("filter",function(func,iterable){check_nb_args_no_kw('filter',2,arguments)
iterable=iter(iterable)
if(func===_b_.None){func=$B.$bool}
return{
__class__:filter,func:func,iterable:iterable}}
)
filter.__iter__=function(self){return self}
filter.__next__=function(self){while(true){var _item=next(self.iterable)
if(self.func(_item)){return _item}}}
$B.set_func_names(filter,"builtins")
var format=_b_.format=function(value,format_spec){var $=$B.args("format",2,{value:null,format_spec:null},["value","format_spec"],arguments,{format_spec:''},null,null)
var klass=value.__class__ ||$B.get_class(value)
try{var method=$B.$getattr(klass,'__format__')}catch(err){if(err.__class__===_b_.AttributeError){throw _b_.NotImplementedError("__format__ is not implemented "+
"for object '"+_b_.str.$factory(value)+"'")}
throw err}
return $B.$call(method)(value,$.format_spec)}
function attr_error(attr,obj){var cname=$B.get_class(obj)
var msg="bad operand type for unary #: '"+cname+"'"
switch(attr){case '__neg__':
throw _b_.TypeError.$factory(msg.replace('#','-'))
case '__pos__':
throw _b_.TypeError.$factory(msg.replace('#','+'))
case '__invert__':
throw _b_.TypeError.$factory(msg.replace('#','~'))
case '__call__':
throw _b_.TypeError.$factory("'"+cname+"'"+
' object is not callable')
default:
throw $B.attr_error(attr,obj)}}
var getattr=_b_.getattr=function(){var missing={}
var $=$B.args("getattr",3,{obj:null,attr:null,_default:null},["obj","attr","_default"],arguments,{_default:missing},null,null)
if(! $B.$isinstance($.attr,_b_.str)){throw _b_.TypeError.$factory("attribute name must be string, "+
`not '${$B.class_name($.attr)}'`)}
return $B.$getattr($.obj,_b_.str.$to_string($.attr),$._default===missing ? undefined :$._default)}
function in_mro(klass,attr){if(klass===undefined){return false}
if(klass.hasOwnProperty(attr)){return klass[attr]}
var mro=klass.__mro__
for(var i=0,len=mro.length;i < len;i++){if(mro[i].hasOwnProperty(attr)){return mro[i][attr]}}
return false}
function find_name_in_mro(cls,name,_default){
for(var base of[cls].concat(cls.__mro__)){if(base.__dict__===undefined){console.log('base',base,'has not dict')}
var res=base.__dict__[name]
if(res !==undefined){return res}}
return _default}
$B.$getattr1=function(obj,name,_default){
var objtype=$B.get_class(obj),cls_var=find_name_in_mro(objtype,name,null),cls_var_type=$B.get_class(cls_var),descr_get=_b_.type.__getattribute__(cls_var_type,'__get__')
if(descr_get !==undefined){if(_b_.type.__getattribute__(cls_var_type,'__set__')
||_b_.type.__getattribute__(cls_var_type,'__delete__')){return $B.$call(descr_get)(cls_var,obj,objtype)}}
if(obj.__dict__ !==undefined && obj.__dict__[name]!==undefined){return obj.__dict__[name]}
if(descr_get !==undefined){return $B.$call(descr_get)(cls_var,obj,objtype)}
if(cls_var !==null){return cls_var }
throw $B.attr_error(name,obj)}
$B.$getattr=function(obj,attr,_default){
var res
if(obj===undefined){console.log('attr',attr,'of obj undef')}
if(obj.$method_cache &&
obj.$method_cache[attr]&&
obj.__class__ &&
obj.__class__[attr]==obj.$method_cache[attr][1]){
return obj.$method_cache[attr][0]}
var rawname=attr
if(obj===undefined){console.log("get attr",attr,"of undefined")}
var is_class=obj.$is_class ||obj.$factory
var klass=obj.__class__
var $test=false 
if($test){console.log("attr",attr,"of",obj,"class",klass,"isclass",is_class)}
if(klass===undefined){klass=$B.get_class(obj)
if(klass===undefined){
if($test){console.log("no class",attr,obj.hasOwnProperty(attr),obj[attr])}
res=obj[attr]
if(res !==undefined){if(typeof res=="function"){var f=function(){
return res.apply(obj,arguments)}
f.$infos={__name__:attr,__qualname__:attr}
return f}else{return $B.$JS2Py(res)}}
if(_default !==undefined){return _default}
throw $B.attr_error(rawname,obj)}}
switch(attr){case '__call__':
if(typeof obj=='function'){res=function(){return obj.apply(null,arguments)}
res.__class__=method_wrapper
res.$infos={__name__:"__call__"}
return res}
break
case '__class__':
if(klass.__dict__){var klass_from_dict=_b_.None
if($B.$isinstance(klass.__dict__,_b_.dict)){klass_from_dict=$B.$call($B.$getattr(klass.__dict__,'get'))('__class__')}
if(klass_from_dict !==_b_.None){if(klass_from_dict.$is_property){return klass_from_dict.fget(obj)}
return klass_from_dict}}
return klass
case '__dict__':
if(is_class){var dict={}
if(obj.__dict__){for(var key of _b_.dict.$keys_string(obj.__dict__)){dict[key]=_b_.dict.$getitem_string(obj.__dict__,key)}}else{for(var key in obj){if(! key.startsWith("$")){dict[key]=obj[key]}}}
dict.__dict__=$B.getset_descriptor.$factory(obj,'__dict__')
return{
__class__:$B.mappingproxy,
$jsobj:dict,$version:0}}else if(! klass.$native){if(obj[attr]!==undefined){return obj[attr]}else if(obj.$infos){if(obj.$infos.hasOwnProperty("__dict__")){return obj.$infos.__dict__}else if(obj.$infos.hasOwnProperty("__func__")){return obj.$infos.__func__.$infos.__dict__}}
return $B.obj_dict(obj,function(attr){return['__class__'].indexOf(attr)>-1}
)}
case '__mro__':
if(obj.__mro__){return _b_.tuple.$factory([obj].concat(obj.__mro__))}else if(obj.__dict__ &&
_b_.dict.$contains_string(obj.__dict__,'__mro__')){return _b_.dict.$getitem_string(obj.__dict__,'__mro__')}
throw $B.attr_error(attr,obj)
case '__subclasses__':
if(klass.$factory ||klass.$is_class){var subclasses=obj.$subclasses ||[]
return function(){return subclasses}}
break}
if(typeof obj=='function'){var value=obj[attr]
if(value !==undefined){if(attr=='__module__'){return value}}}
if((! is_class)&& klass.$native){if(obj.$method_cache && obj.$method_cache[attr]){return obj.$method_cache[attr]}
if($test){console.log("native class",klass,klass[attr])}
if(attr=="__doc__" && klass[attr]===undefined){_get_builtins_doc()
klass[attr]=$B.builtins_doc[klass.__name__]}
if(klass[attr]===undefined){var object_attr=_b_.object[attr]
if($test){console.log("object attr",object_attr)}
if(object_attr !==undefined){klass[attr]=object_attr}else{if($test){console.log("obj[attr]",obj[attr])}
var attrs=obj.__dict__
if(attrs && _b_.dict.$contains_string(attrs,attr)){return _b_.dict.$getitem_string(attrs,attr)}
if(_default===undefined){throw $B.attr_error(attr,obj)}
return _default}}
if(klass.$descriptors && klass.$descriptors[attr]!==undefined){return klass[attr](obj)}
if(typeof klass[attr]=='function'){var func=klass[attr]
if(attr=='__new__'){func.$type="staticmethod"}
if(func.$type=="staticmethod"){return func}
var self=klass[attr].__class__==$B.method ? klass :obj,method=klass[attr].bind(null,self)
method.__class__=$B.method
method.$infos={__func__:func,__name__:attr,__self__:self,__qualname__:klass.__qualname__+"."+attr}
if(typeof obj=="object"){
obj.__class__=klass
obj.$method_cache=obj.$method_cache ||{}
if(obj.$method_cache){
obj.$method_cache[attr]=method}}
return method}else if(klass[attr].__class__===_b_.classmethod){return _b_.classmethod.__get__(klass[attr],obj,klass)}else if(klass[attr]!==undefined){return klass[attr]}
attr_error(rawname,klass)}
var mro,attr_func
if(is_class){if($test){console.log('obj is class',obj)
console.log('is a type ?',_b_.isinstance(klass,_b_.type))
console.log('is type',klass===_b_.type)}
if(klass===_b_.type){attr_func=_b_.type.__getattribute__}else{attr_func=$B.$call($B.$getattr(klass,'__getattribute__'))}
if($test){console.log('attr func',attr_func)}}else{attr_func=klass.__getattribute__
if(attr_func===undefined){var mro=klass.__mro__
if(mro===undefined){console.log(obj,attr,"no mro, klass",klass)}
for(var i=0,len=mro.length;i < len;i++){attr_func=mro[i]['__getattribute__']
if(attr_func !==undefined){break}}}}
if(typeof attr_func !=='function'){console.log(attr+' is not a function '+attr_func,klass)}
var odga=_b_.object.__getattribute__
if($test){console.log("attr_func is odga ?",attr_func,attr_func===odga,'\n','\nobj[attr]',obj[attr])}
if(attr_func===odga){res=obj[attr]
if(Array.isArray(obj)&& Array.prototype[attr]!==undefined){
res=undefined}else if(res===null){return null}else if(res !==undefined){if($test){console.log(obj,attr,obj[attr],res.__set__ ||res.$is_class)}
if(res.$is_property){return _b_.property.__get__(res)}
if(res.__set__===undefined ||res.$is_class){if($test){console.log("return",res,res+'',res.__set__,res.$is_class)}
return res}}}
try{res=attr_func(obj,attr)
if($test){console.log("result of attr_func",res)}}catch(err){if($test){console.log('attr_func raised error',err.args,err.name)}
var getattr
if(klass===$B.module){
getattr=obj.__getattr__
if($test){console.log('use module getattr',getattr)
console.log(getattr+'')}
if(getattr){try{return getattr(attr)}catch(err){if($test){console.log('encore erreur',err)}
if(_default !==undefined){return _default}
throw err}}}
var getattr=in_mro(klass,'__getattr__')
if($test){console.log('try getattr',getattr)}
if(getattr){if($test){console.log('try with getattr',getattr)}
try{return getattr(obj,attr)}catch(err){if(_default !==undefined){return _default}
throw err}}
if(_default !==undefined){return _default}
throw err}
if(res !==undefined){return res}
if(_default !==undefined){return _default}
var cname=klass.__name__
if(is_class){cname=obj.__name__}
attr_error(rawname,is_class ? obj :klass)}
var globals=_b_.globals=function(){
check_nb_args_no_kw('globals',0,arguments)
var res=$B.obj_dict($B.frame_obj.frame[3])
res.$jsobj.__BRYTHON__=$B.JSObj.$factory($B)
res.$is_namespace=true
return res}
var hasattr=_b_.hasattr=function(obj,attr){check_nb_args_no_kw('hasattr',2,arguments)
try{$B.$getattr(obj,attr)
return true}catch(err){return false}}
var hash=_b_.hash=function(obj){check_nb_args_no_kw('hash',1,arguments)
return $B.$hash(obj)}
$B.$hash=function(obj){if(obj.__hashvalue__ !==undefined){return obj.__hashvalue__}
if(typeof obj==="boolean"){return obj ? 1 :0}
if(obj.$is_class ||
obj.__class__===_b_.type ||
obj.__class__===$B.function){return obj.__hashvalue__=$B.$py_next_hash--}
if(typeof obj=="string"){return _b_.str.__hash__(obj)}else if(typeof obj=="number"){return obj}else if(typeof obj=="boolean"){return obj ? 1 :0}else if(obj.__class__===_b_.float){return _b_.float.$hash_func(obj)}
var klass=obj.__class__ ||$B.get_class(obj)
if(klass===undefined){throw _b_.TypeError.$factory("unhashable type: '"+
_b_.str.$factory($B.JSObj.$factory(obj))+"'")}
var hash_method=_b_.type.__getattribute__(klass,'__hash__',_b_.None)
if(hash_method===_b_.None){throw _b_.TypeError.$factory("unhashable type: '"+
$B.class_name(obj)+"'")}
if(hash_method.$infos.__func__===_b_.object.__hash__){if(_b_.type.__getattribute__(klass,'__eq__')!==_b_.object.__eq__){throw _b_.TypeError.$factory("unhashable type: '"+
$B.class_name(obj)+"'",'hash')}else{return obj.__hashvalue__=_b_.object.__hash__(obj)}}else{return $B.$call(hash_method)(obj)}}
function _get_builtins_doc(){if($B.builtins_doc===undefined){
var url=$B.brython_path
if(url.charAt(url.length-1)=='/'){url=url.substr(0,url.length-1)}
url+='/builtins_docstrings.js'
var f=_b_.open(url)
eval(f.$content)
for(var key in docs){if(_b_[key]){_b_[key].__doc__=docs[key]}}
$B.builtins_doc=docs}}
var help=_b_.help=function(obj){if(obj===undefined){obj='help'}
if(typeof obj=='string'){var lib_url='https://docs.python.org/3/library',ref_url='https://docs.python.org/3/reference'
var parts=obj.split('.'),head=[],url
while(parts.length > 0){head.push(parts.shift())
if($B.stdlib[head.join('.')]){url=head.join('.')}else{break}}
if(url){var doc_url
if(['browser','javascript','interpreter'].
indexOf(obj.split('.')[0])>-1){doc_url='/static_doc/'+($B.language=='fr' ? 'fr' :'en')}else{doc_url=lib_url}
window.open(`${doc_url}/${url}.html#`+obj)
return}
if(_b_[obj]){if(obj==obj.toLowerCase()){url=lib_url+`/functions.html#${obj}`}else if(['False','True','None','NotImplemented','Ellipsis','__debug__'].
indexOf(obj)>-1){url=lib_url+`/constants.html#${obj}`}else if(_b_[obj].$is_class &&
_b_[obj].__bases__.indexOf(_b_.Exception)>-1){url=lib_url+`/exceptions.html#${obj}`}
if(url){window.open(url)
return}}
$B.$import('pydoc')
return $B.$call($B.$getattr($B.imported.pydoc,'help'))(obj)}
if(obj.__class__===$B.module){return help(obj.__name__)}
try{_b_.print($B.$getattr(obj,'__doc__'))}catch(err){return ''}}
help.__repr__=help.__str__=function(){return "Type help() for interactive help, or help(object) "+
"for help about object."}
var hex=_b_.hex=function(obj){check_nb_args_no_kw('hex',1,arguments)
return bin_hex_oct(16,obj)}
var id=_b_.id=function(obj){check_nb_args_no_kw('id',1,arguments)
if(obj.$id !==undefined){return obj.$id}else if($B.$isinstance(obj,[_b_.str,_b_.int,_b_.float])&&
! $B.$isinstance(obj,$B.long_int)){return $B.$getattr(_b_.str.$factory(obj),'__hash__')()}else{return obj.$id=$B.UUID()}}
var __import__=_b_.__import__=function(mod_name,globals,locals,fromlist,level){
var $=$B.args('__import__',5,{name:null,globals:null,locals:null,fromlist:null,level:null},['name','globals','locals','fromlist','level'],arguments,{globals:None,locals:None,fromlist:_b_.tuple.$factory(),level:0},null,null)
return $B.$__import__($.name,$.globals,$.locals,$.fromlist)}
var input=_b_.input=function(msg){var res=prompt(msg ||'')||''
if($B.imported["sys"]&& $B.imported["sys"].ps1){
var ps1=$B.imported["sys"].ps1,ps2=$B.imported["sys"].ps2
if(msg==ps1 ||msg==ps2){console.log(msg,res)}}
return res}
var isinstance=_b_.isinstance=function(obj,cls){check_nb_args_no_kw('isinstance',2,arguments)
return $B.$isinstance(obj,cls)}
$B.$isinstance=function(obj,cls){if(obj===null){return cls===$B.imported.javascript.NullType}
if(obj===undefined){return false}
if(Array.isArray(cls)){for(var kls of cls){if($B.$isinstance(obj,kls)){return true}}
return false}
if(cls.__class__===$B.UnionType){for(var kls of cls.items){if($B.$isinstance(obj,kls)){return true}}
return false}
if(cls.__class__===$B.GenericAlias){
throw _b_.TypeError.$factory(
'isinstance() arg 2 cannot be a parameterized generic')}
if((!cls.__class__)&&(! cls.$is_class)){if(! $B.$getattr(cls,'__instancecheck__',false)){throw _b_.TypeError.$factory("isinstance() arg 2 must be a type "+
"or tuple of types")}}
if(cls===_b_.int &&(obj===True ||obj===False)){return True}
if(cls===_b_.bool){switch(typeof obj){case "string":
return false
case "number":
return false
case "boolean":
return true}}
var klass=obj.__class__
if(klass==undefined){if(typeof obj=='string'){if(cls==_b_.str){return true}
else if($B.builtin_classes.indexOf(cls)>-1){return false}}else if(typeof obj=='number' && Number.isFinite(obj)){if(Number.isFinite(obj)&& cls==_b_.int){return true}}
klass=$B.get_class(obj)}
if(klass===undefined){return false}
if(klass===cls){return true}
var mro=klass.__mro__
for(var i=0;i < mro.length;i++){if(mro[i]===cls){return true}}
var instancecheck=$B.$getattr(cls.__class__ ||$B.get_class(cls),'__instancecheck__',_b_.None)
if(instancecheck !==_b_.None){return instancecheck(cls,obj)}
return false}
var issubclass=_b_.issubclass=function(klass,classinfo){check_nb_args_no_kw('issubclass',2,arguments)
var mro
if(!klass.__class__ ||
!(klass.$factory !==undefined ||klass.$is_class !==undefined)){var meta=$B.$getattr(klass,'__class__',null)
if(meta===null){console.log('no class for',klass)
throw _b_.TypeError.$factory("issubclass() arg 1 must be a class")}else{mro=[_b_.object]}}else{mro=klass.__mro__}
if($B.$isinstance(classinfo,_b_.tuple)){for(var i=0;i < classinfo.length;i++){if(issubclass(klass,classinfo[i])){return true}}
return false}
if(classinfo.__class__===$B.GenericAlias){throw _b_.TypeError.$factory(
'issubclass() arg 2 cannot be a parameterized generic')}
if(klass===classinfo ||mro.indexOf(classinfo)>-1){return true}
var sch=$B.$getattr(classinfo.__class__ ||$B.get_class(classinfo),'__subclasscheck__',_b_.None)
if(sch==_b_.None){return false}
return sch(classinfo,klass)}
var iterator_class=$B.make_class("iterator",function(getitem,len){return{
__class__:iterator_class,getitem:getitem,len:len,counter:-1}}
)
iterator_class.__next__=function(self){self.counter++
if(self.len !==null && self.counter==self.len){throw _b_.StopIteration.$factory('')}
try{return self.getitem(self.counter)}catch(err){throw _b_.StopIteration.$factory('')}}
$B.set_func_names(iterator_class,"builtins")
callable_iterator=$B.make_class("callable_iterator",function(func,sentinel){return{
__class__:callable_iterator,func:func,sentinel:sentinel}}
)
callable_iterator.__iter__=function(self){return self}
callable_iterator.__next__=function(self){var res=self.func()
if($B.rich_comp("__eq__",res,self.sentinel)){throw _b_.StopIteration.$factory()}
return res}
$B.set_func_names(callable_iterator,"builtins")
$B.$iter=function(obj,sentinel){
if(sentinel===undefined){var klass=obj.__class__ ||$B.get_class(obj)
try{var _iter=$B.$call($B.$getattr(klass,'__iter__'))}catch(err){if(err.__class__===_b_.AttributeError){try{var gi_method=$B.$call($B.$getattr(klass,'__getitem__')),gi=function(i){return gi_method(obj,i)},len
try{len=len(obj)}catch(err){throw _b_.TypeError.$factory("'"+$B.class_name(obj)+
"' object is not iterable")}
return iterator_class.$factory(gi,len)}catch(err){throw _b_.TypeError.$factory("'"+$B.class_name(obj)+
"' object is not iterable")}}
throw err}
var res=$B.$call(_iter)(obj)
try{$B.$getattr(res,'__next__')}catch(err){if($B.$isinstance(err,_b_.AttributeError)){throw _b_.TypeError.$factory(
"iter() returned non-iterator of type '"+
$B.class_name(res)+"'")}}
return res}else{return callable_iterator.$factory(obj,sentinel)}}
var iter=_b_.iter=function(){
var $=$B.args('iter',1,{obj:null},['obj'],arguments,{},'args','kw'),sentinel
if($.args.length > 0){var sentinel=$.args[0]}
return $B.$iter($.obj,sentinel)}
var len=_b_.len=function(obj){check_nb_args_no_kw('len',1,arguments)
var klass=obj.__class__ ||$B.get_class(obj)
try{var method=$B.$getattr(klass,'__len__')}catch(err){throw _b_.TypeError.$factory("object of type '"+
$B.class_name(obj)+"' has no len()")}
return $B.$call(method)(obj)}
var locals=_b_.locals=function(){
check_nb_args('locals',0,arguments)
var locals_obj=$B.frame_obj.frame[1]
var class_locals=locals_obj.$target
if(class_locals){return class_locals}
var res=$B.obj_dict($B.clone(locals_obj),function(key){return key.startsWith('$')}
)
res.$is_namespace=true
return res}
var map=_b_.map=$B.make_class("map",function(){var $=$B.args('map',2,{func:null,it1:null},['func','it1'],arguments,{},'args',null),func=$B.$call($.func)
var iter_args=[$B.make_js_iterator($.it1)]
for(var arg of $.args){iter_args.push($B.make_js_iterator(arg))}
var obj={__class__:map,args:iter_args,func:func}
obj[Symbol.iterator]=function(){this.iters=[]
for(var arg of this.args){this.iters.push(arg[Symbol.iterator]())}
return this}
obj.next=function(){var args=[]
for(var iter of this.iters){var arg=iter.next()
if(arg.done){return{done:true,value:null}}
args.push(arg.value)}
return{done:false,value:this.func.apply(null,args)}}
return obj}
)
map.__iter__=function(self){self[Symbol.iterator]()
return self}
map.__next__=function(self){var args=[]
for(var iter of self.iters){var arg=iter.next()
if(arg.done){throw _b_.StopIteration.$factory('')}
args.push(arg.value)}
return self.func.apply(null,args)}
$B.set_func_names(map,"builtins")
function $extreme(args,op){
var $op_name='min'
if(op==='__gt__'){$op_name="max"}
var $=$B.args($op_name,0,{},[],args,{},'args','kw')
var has_default=false,func=false
for(var attr in $.kw.$jsobj){switch(attr){case 'key':
func=$.kw.$jsobj[attr]
func=func===_b_.None ? func :$B.$call(func)
break
case 'default':
var default_value=$.kw.$jsobj[attr]
has_default=true
break
default:
throw _b_.TypeError.$factory("'"+attr+
"' is an invalid keyword argument for this function")}}
if((! func)||func===_b_.None){func=x=> x}
if($.args.length==0){throw _b_.TypeError.$factory($op_name+
" expected 1 arguments, got 0")}else if($.args.length==1){
var $iter=$B.make_js_iterator($.args[0]),res=null,x_value,extr_value
for(var x of $iter){if(res===null){extr_value=func(x)
res=x}else{x_value=func(x)
if($B.rich_comp(op,x_value,extr_value)){res=x
extr_value=x_value}}}
if(res===null){if(has_default){return default_value}else{throw _b_.ValueError.$factory($op_name+
"() arg is an empty sequence")}}else{return res}}else{if(has_default){throw _b_.TypeError.$factory("Cannot specify a default for "+
$op_name+"() with multiple positional arguments")}
if($B.last(args).$kw){var _args=[$.args].concat($B.last(args))}else{var _args=[$.args]}
return $extreme.call(null,_args,op)}}
var max=_b_.max=function(){return $extreme(arguments,'__gt__')}
var memoryview=_b_.memoryview=$B.make_class('memoryview',function(obj){check_nb_args_no_kw('memoryview',1,arguments)
if(obj.__class__===memoryview){return obj}
if($B.get_class(obj).$buffer_protocol){return{
__class__:memoryview,obj:obj,
format:'B',itemsize:1,ndim:1,shape:_b_.tuple.$factory([_b_.len(obj)]),strides:_b_.tuple.$factory([1]),suboffsets:_b_.tuple.$factory([]),c_contiguous:true,f_contiguous:true,contiguous:true}}else{throw _b_.TypeError.$factory("memoryview: a bytes-like object "+
"is required, not '"+$B.class_name(obj)+"'")}}
)
memoryview.$match_sequence_pattern=true,
memoryview.$buffer_protocol=true
memoryview.$not_basetype=true 
memoryview.__eq__=function(self,other){if(other.__class__ !==memoryview){return false}
return $B.$getattr(self.obj,'__eq__')(other.obj)}
memoryview.__getitem__=function(self,key){if($B.$isinstance(key,_b_.int)){var start=key*self.itemsize
if(self.format=="I"){var res=self.obj.source[start],coef=256
for(var i=1;i < 4;i++){res+=self.obj.source[start+i]*coef
coef*=256}
return res}else if("B".indexOf(self.format)>-1){if(key > self.obj.source.length-1){throw _b_.KeyError.$factory(key)}
return self.obj.source[key]}else{
return self.obj.source[key]}}
var res=self.obj.__class__.__getitem__(self.obj,key)
if(key.__class__===_b_.slice){return memoryview.$factory(res)}}
memoryview.__len__=function(self){return len(self.obj)/self.itemsize}
memoryview.__setitem__=function(self,key,value){try{$B.$setitem(self.obj,key,value)}catch(err){throw _b_.TypeError.$factory("cannot modify read-only memory")}}
memoryview.cast=function(self,format){switch(format){case "B":
return memoryview.$factory(self.obj)
case "I":
var res=memoryview.$factory(self.obj),objlen=len(self.obj)
res.itemsize=4
res.format="I"
if(objlen % 4 !=0){throw _b_.TypeError.$factory("memoryview: length is not "+
"a multiple of itemsize")}
return res}}
memoryview.hex=function(self){var res='',bytes=_b_.bytes.$factory(self)
bytes.source.forEach(function(item){res+=item.toString(16)})
return res}
memoryview.tobytes=function(self){return{
__class__:_b_.bytes,source:self.obj.source}}
memoryview.tolist=function(self){if(self.itemsize==1){return _b_.list.$factory(_b_.bytes.$factory(self.obj))}else if(self.itemsize==4){if(self.format=="I"){var res=[]
for(var i=0;i < self.obj.source.length;i+=4){var item=self.obj.source[i],coef=256
for(var j=1;j < 4;j++){item+=coef*self.obj.source[i+j]
coef*=256}
res.push(item)}
return res}}}
$B.set_func_names(memoryview,"builtins")
var min=_b_.min=function(){return $extreme(arguments,'__lt__')}
var next=_b_.next=function(obj){check_no_kw('next',obj)
var missing={},$=$B.args("next",2,{obj:null,def:null},['obj','def'],arguments,{def:missing},null,null)
var klass=obj.__class__ ||$B.get_class(obj),ga=$B.$call($B.$getattr(klass,"__next__"))
if(ga !==undefined){try{return $B.$call(ga)(obj)}catch(err){if(err.__class__===_b_.StopIteration &&
$.def !==missing){return $.def}
throw err}}
throw _b_.TypeError.$factory("'"+$B.class_name(obj)+
"' object is not an iterator")}
var NotImplementedType=$B.NotImplementedType=
$B.make_class("NotImplementedType",function(){return NotImplemented}
)
NotImplementedType.__repr__=NotImplementedType.__str__=function(self){return "NotImplemented"}
$B.set_func_names(NotImplementedType,"builtins")
var NotImplemented=_b_.NotImplemented={__class__:NotImplementedType}
var oct=_b_.oct=function(obj){check_nb_args_no_kw('oct',1,arguments)
return bin_hex_oct(8,obj)}
var ord=_b_.ord=function(c){check_nb_args_no_kw('ord',1,arguments)
if(typeof c.valueOf()=='string'){if(c.length==1){return c.charCodeAt(0)}else if(c.length==2){var code=c.codePointAt(0)
if((code >=0x10000 && code <=0x1FFFF)||
(code >=0x20000 && code <=0x2FFFF)||
(code >=0x30000 && code <=0x3FFFF)||
(code >=0xD0000 && code <=0xDFFFF)||
(code >=0xE0000 && code <=0xFFFFF)){return code}}
throw _b_.TypeError.$factory('ord() expected a character, but '+
'string of length '+c.length+' found')}
switch($B.get_class(c)){case _b_.str:
if(c.length==1){return c.charCodeAt(0)}
throw _b_.TypeError.$factory('ord() expected a character, but '+
'string of length '+c.length+' found')
case _b_.bytes:
case _b_.bytearray:
if(c.source.length==1){return c.source[0]}
throw _b_.TypeError.$factory('ord() expected a character, but '+
'string of length '+c.source.length+' found')
default:
throw _b_.TypeError.$factory('ord() expected a character, but '+
$B.class_name(c)+' was found')}}
var complex_modulo=()=> _b_.ValueError.$factory('complex modulo')
var all_ints=()=> _b_.TypeError.$factory('pow() 3rd argument not '+
'allowed unless all arguments are integers')
var pow=_b_.pow=function(){var $=$B.args('pow',3,{x:null,y:null,mod:null},['x','y','mod'],arguments,{mod:None},null,null),x=$.x,y=$.y,z=$.mod
var klass=x.__class__ ||$B.get_class(x)
if(z===_b_.None){return $B.rich_op('__pow__',x,y)}else{if($B.$isinstance(x,_b_.int)){if($B.$isinstance(y,_b_.float)){throw all_ints()}else if($B.$isinstance(y,_b_.complex)){throw complex_modulo()}else if($B.$isinstance(y,_b_.int)){if($B.$isinstance(z,_b_.complex)){throw complex_modulo()}else if(! $B.$isinstance(z,_b_.int)){throw all_ints()}}
return _b_.int.__pow__(x,y,z)}else if($B.$isinstance(x,_b_.float)){throw all_ints()}else if($B.$isinstance(x,_b_.complex)){throw complex_modulo()}}}
var $print=_b_.print=function(){var $ns=$B.args('print',0,{},[],arguments,{},'args','kw')
var kw=$ns['kw'],end=$B.is_none(kw.$jsobj.end)? '\n' :kw.$jsobj.end,sep=$B.is_none(kw.$jsobj.sep)? ' ' :kw.$jsobj.sep,file=$B.is_none(kw.$jsobj.file)? $B.get_stdout():kw.$jsobj.file
var args=$ns['args'],writer=$B.$getattr(file,'write')
var items=[]
for(var i=0,len=args.length;i < len;i++){var arg=_b_.str.$factory(args[i])
writer(arg)
if(i < len-1){writer(sep)}}
writer(end)
var flush=$B.$getattr(file,'flush',None)
if(flush !==None){$B.$call(flush)()}
return None}
$print.__name__='print'
$print.is_func=true
var quit=_b_.quit=function(){throw _b_.SystemExit}
quit.__repr__=quit.__str__=function(){return "Use quit() or Ctrl-Z plus Return to exit"}
var repr=_b_.repr=function(obj){check_nb_args_no_kw('repr',1,arguments)
var klass=obj.__class__ ||$B.get_class(obj)
return $B.$call($B.$getattr(klass,"__repr__"))(obj)}
var reversed=_b_.reversed=$B.make_class("reversed",function(seq){
check_nb_args_no_kw('reversed',1,arguments)
var klass=seq.__class__ ||$B.get_class(seq),rev_method=$B.$getattr(klass,'__reversed__',null)
if(rev_method !==null){return $B.$call(rev_method)(seq)}
try{var method=$B.$getattr(klass,'__getitem__')}catch(err){throw _b_.TypeError.$factory("argument to reversed() must be a sequence")}
var res={__class__:reversed,$counter :_b_.len(seq),getter:function(i){return $B.$call(method)(seq,i)}}
return res}
)
reversed.__iter__=function(self){return self}
reversed.__next__=function(self){self.$counter--
if(self.$counter < 0){throw _b_.StopIteration.$factory('')}
return self.getter(self.$counter)}
$B.set_func_names(reversed,"builtins")
var round=_b_.round=function(){var $=$B.args('round',2,{number:null,ndigits:null},['number','ndigits'],arguments,{ndigits:None},null,null),arg=$.number,n=$.ndigits===None ? 0 :$.ndigits
if(! $B.$isinstance(arg,[_b_.int,_b_.float])){var klass=arg.__class__ ||$B.get_class(arg)
try{return $B.$call($B.$getattr(klass,"__round__")).apply(null,arguments)}catch(err){if(err.__class__===_b_.AttributeError){throw _b_.TypeError.$factory("type "+$B.class_name(arg)+
" doesn't define __round__ method")}else{throw err}}}
if(! $B.$isinstance(n,_b_.int)){throw _b_.TypeError.$factory("'"+$B.class_name(n)+
"' object cannot be interpreted as an integer")}
var klass=$B.get_class(arg)
if($B.$isinstance(arg,_b_.float)){return _b_.float.__round__(arg,$.ndigits)}
var mult=Math.pow(10,n),x=arg*mult,floor=Math.floor(x),diff=Math.abs(x-floor),res
if(diff==0.5){if(floor % 2){floor+=1}
res=_b_.int.__truediv__(floor,mult)}else{res=_b_.int.__truediv__(Math.round(x),mult)}
if(res.value===Infinity ||res.value===-Infinity){throw _b_.OverflowError.$factory(
"rounded value too large to represent")}
if($.ndigits===None){
return Math.floor(res.value)}else{
return $B.$call(klass)(res)}}
var setattr=_b_.setattr=function(){var $=$B.args('setattr',3,{obj:null,attr:null,value:null},['obj','attr','value'],arguments,{},null,null),obj=$.obj,attr=$.attr,value=$.value
if(!(typeof attr=='string')){throw _b_.TypeError.$factory("setattr(): attribute name must be string")}
return $B.$setattr(obj,attr,value)}
$B.$setattr=function(obj,attr,value){if(obj===undefined){console.log('obj undef',attr,value)}
var $test=false 
if(attr=='__dict__'){
if(! $B.$isinstance(value,_b_.dict)){throw _b_.TypeError.$factory("__dict__ must be set to a dictionary, "+
"not a '"+$B.class_name(value)+"'")}
if(obj.$infos){obj.$infos.__dict__=value
return None}
obj.__dict__=value
return None}else if(attr=="__class__"){
function error(msg){throw _b_.TypeError.$factory(msg)}
if(value.__class__){if(value.__module__=="builtins"){error("__class__ assignement only "+
"supported for heap types or ModuleType subclasses")}else if(Array.isArray(value.__bases__)){for(var i=0;i < value.__bases__.length;i++){if(value.__bases__[i]!==_b_.object &&
value.__bases__[i].__module__=="builtins"){error("__class__ assignment: '"+$B.class_name(obj)+
"' object layout differs from '"+
$B.class_name(value)+"'")}}}}
obj.__class__=value
return None}else if(attr=="__doc__" && obj.__class__===_b_.property){obj[attr]=value}
if($test){console.log("set attr",attr,"to",obj)}
if(obj.$factory ||obj.$is_class){var metaclass=obj.__class__
if(metaclass===_b_.type){return _b_.type.__setattr__(obj,attr,value)}
return $B.$call($B.$getattr(metaclass,'__setattr__'))(obj,attr,value)}
var res=obj[attr],klass=obj.__class__ ||$B.get_class(obj)
if($test){console.log('set attr',attr,'of obj',obj,'class',klass,"obj[attr]",obj[attr])}
if(res===undefined && klass){res=klass[attr]
if(res===undefined){var mro=klass.__mro__,_len=mro.length
for(var i=0;i < _len;i++){res=mro[i][attr]
if(res !==undefined){break}}}}
if($test){console.log('set attr',attr,'klass',klass,'found in class',res)}
if(res !==undefined && res !==null){
if(res.__set__ !==undefined){res.__set__(res,obj,value);return None}
var rcls=res.__class__,__set1__
if(rcls !==undefined){var __set1__=rcls.__set__
if(__set1__===undefined){var mro=rcls.__mro__
for(var i=0,_len=mro.length;i < _len;i++){__set1__=mro[i].__set__
if(__set1__){break}}}}
if(__set1__ !==undefined){var __set__=$B.$getattr(res,'__set__',null)
if(__set__ &&(typeof __set__=='function')){__set__.apply(res,[obj,value])
return None}}else if(klass && klass.$descriptors !==undefined &&
klass[attr]!==undefined){var setter=klass[attr].setter
if(typeof setter=='function'){setter(obj,value)
return None}else{throw _b_.AttributeError.$factory('readonly attribute')}}}
var _setattr=false
if(klass !==undefined){_setattr=klass.__setattr__
if(_setattr===undefined){var mro=klass.__mro__
for(var i=0,_len=mro.length-1;i < _len;i++){_setattr=mro[i].__setattr__
if(_setattr){break}}}}
var special_attrs=["__module__"]
if(klass && klass.__slots__ && special_attrs.indexOf(attr)==-1 &&
! _setattr){var _slots=true
for(var kl of klass.__mro__){if(kl===_b_.object ||kl===_b_.type){break}
if(! kl.__slots__){
_slots=false
break}}
if(_slots){function mangled_slots(klass){if(klass.__slots__){if(Array.isArray(klass.__slots__)){return klass.__slots__.map(function(item){if(item.startsWith("__")&& ! item.endsWith("_")){return "_"+klass.__name__+item}else{return item}})}else{return klass.__slots__}}
return[]}
var has_slot=false
if($B.$is_member(attr,mangled_slots(klass))){has_slot=true}else{for(var i=0;i < klass.__mro__.length;i++){var kl=klass.__mro__[i]
if(mangled_slots(kl).indexOf(attr)>-1){has_slot=true
break}}}
if(! has_slot){throw $B.attr_error(attr,klass)}}}
if($test){console.log("attr",attr,"use _setattr",_setattr)}
if(!_setattr){if(obj.__dict__===undefined){obj[attr]=value}else{_b_.dict.$setitem(obj.__dict__,attr,value)}
if($test){console.log("no setattr, obj",obj)}}else{if($test){console.log('apply _setattr',obj,attr)}
_setattr(obj,attr,value)}
return None}
var sorted=_b_.sorted=function(){var $=$B.args('sorted',1,{iterable:null},['iterable'],arguments,{},null,'kw')
var _list=_b_.list.$factory($.iterable),args=[_list].concat(Array.from(arguments).slice(1))
_b_.list.sort.apply(null,args)
return _list}
var sum=_b_.sum=function(iterable,start){var $=$B.args('sum',2,{iterable:null,start:null},['iterable','start'],arguments,{start:0},null,null),iterable=$.iterable,start=$.start
if($B.$isinstance(start,[_b_.str,_b_.bytes])){throw _b_.TypeError.$factory("sum() can't sum bytes"+
" [use b''.join(seq) instead]")}
var res=start,iterable=iter(iterable)
while(1){try{var _item=next(iterable)
res=$B.rich_op('__add__',res,_item)}catch(err){if(err.__class__===_b_.StopIteration){break}else{throw err}}}
return res}
$B.missing_super2=function(obj){obj.$missing=true
return obj}
var $$super=_b_.super=$B.make_class("super",function(_type,object_or_type){var no_object_or_type=object_or_type===undefined
if(_type===undefined && object_or_type===undefined){var frame=$B.frame_obj.frame,pyframe=$B.imported["_sys"]._getframe(),code=$B.frame.f_code.__get__(pyframe),co_varnames=code.co_varnames
if(co_varnames.length > 0){_type=frame[1].__class__
if(_type===undefined){throw _b_.RuntimeError.$factory("super(): no arguments")}
object_or_type=frame[1][code.co_varnames[0]]}else{throw _b_.RuntimeError.$factory("super(): no arguments")}}
if((! no_object_or_type)&& Array.isArray(object_or_type)){object_or_type=object_or_type[0]}
var $arg2
if(object_or_type !==undefined){if(object_or_type===_type ||
(object_or_type.$is_class &&
_b_.issubclass(object_or_type,_type))){$arg2='type'}else if($B.$isinstance(object_or_type,_type)){$arg2='object'}else{throw _b_.TypeError.$factory(
'super(type, obj): obj must be an instance '+
'or subtype of type')}}
return{
__class__:$$super,__thisclass__:_type,__self_class__:object_or_type,$arg2}}
)
$$super.__get__=function(self,instance,klass){
return $$super.$factory(self.__thisclass__,instance)}
$$super.__getattribute__=function(self,attr){if(self.__thisclass__.$is_js_class){if(attr=="__init__"){
return function(){mro[0].$js_func.call(self.__self_class__,...arguments)}}}
var object_or_type=self.__self_class__,mro=self.$arg2=='type' ? object_or_type.__mro__ :
$B.get_class(object_or_type).__mro__
var search_start=mro.indexOf(self.__thisclass__)+1,search_classes=mro.slice(search_start)
var $test=attr=="new" 
if($test){console.log('super.__ga__, self',self,'search classes',search_classes)}
var f
for(var klass of search_classes){if(klass===undefined){console.log('klass undef in super',self)
console.log('mro',mro)}
if(klass[attr]!==undefined){f=klass[attr]
break}}
if(f===undefined){if($$super[attr]!==undefined){return(function(x){return function(){var args=[x]
for(var i=0,len=arguments.length;i < len;i++){args.push(arguments[i])}
return $$super[attr].apply(null,args)}})(self)}
if($test){console.log("no attr",attr,self,"mro",mro)}
throw $B.attr_error(attr,self)}
if($test){console.log("super",attr,self,"mro",mro,"found in mro[0]",mro[0],f,f+'')}
if(f.$type=="staticmethod" ||attr=="__new__"){return f}else if(f.__class__===_b_.classmethod){return f.__func__.bind(null,object_or_type)}else if(f.$is_property){return f.fget(object_or_type)}else if(typeof f !="function"){return f}else{if(f.__class__===$B.method){
f=f.$infos.__func__}
var callable=$B.$call(f)
var method=function(){var res=callable(self.__self_class__,...arguments)
if($test){console.log("calling super",self.__self_class__,attr,f,"res",res)}
return res}
method.__class__=$B.method
var module,qualname
if(f.$infos !==undefined){module=f.$infos.__module__}else if(f.__class__===_b_.property){module=f.fget.$infos.__module}else if(f.$is_class){module=f.__module__}
method.$infos={__self__:self.__self_class__,__func__:f,__name__:attr,__module__:module,__qualname__:klass.__name__+"."+attr}
return method}
throw $B.attr_error(attr,self)}
$$super.__init__=function(cls){if(cls===undefined){throw _b_.TypeError.$factory("descriptor '__init__' of 'super' "+
"object needs an argument")}
if(cls.__class__ !==$$super){throw _b_.TypeError.$factory("descriptor '__init__' requires a"+
" 'super' object but received a '"+$B.class_name(cls)+"'")}}
$$super.__repr__=function(self){$B.builtins_repr_check($$super,arguments)
var res="<super: <class '"+self.__thisclass__.__name__+"'>"
if(self.__self_class__ !==undefined){res+=', <'+self.__self_class__.__class__.__name__+' object>'}else{res+=', NULL'}
return res+'>'}
$B.set_func_names($$super,"builtins")
var vars=_b_.vars=function(){var def={},$=$B.args('vars',1,{obj:null},['obj'],arguments,{obj:def},null,null)
if($.obj===def){return _b_.locals()}else{try{return $B.$getattr($.obj,'__dict__')}catch(err){if(err.__class__===_b_.AttributeError){throw _b_.TypeError.$factory("vars() argument must have __dict__ attribute")}
throw err}}}
var $Reader=$B.make_class("Reader")
$Reader.__bool__=function(){return true}
$Reader.__enter__=function(self){return self}
$Reader.__exit__=function(self){return false}
$Reader.__init__=function(_self,initial_value='',newline='\n'){_self.$content=initial_value
_self.$counter=0}
$Reader.__iter__=function(self){
return iter($Reader.readlines(self))}
$Reader.__len__=function(self){return self.lines.length}
$Reader.__new__=function(cls){return{
__class__:cls}}
$Reader.close=function(self){self.closed=true}
$Reader.flush=function(self){return None}
$Reader.read=function(){var $=$B.args("read",2,{self:null,size:null},["self","size"],arguments,{size:-1},null,null),self=$.self,size=$B.$GetInt($.size)
if(self.closed===true){throw _b_.ValueError.$factory('I/O operation on closed file')}
if(size < 0){size=self.$length-self.$counter}
var content=self.$content
if(self.$binary){res=_b_.bytes.$factory(self.$content.source.slice(self.$counter,self.$counter+size))}else{res=self.$content.substr(self.$counter,size)}
self.$counter+=size
return res}
$Reader.readable=function(self){return true}
function make_lines(self){
if(self.$lines===undefined){if(! self.$binary){self.$lines=self.$content.split("\n")
if($B.last(self.$lines)==''){self.$lines.pop()}
self.$lines=self.$lines.map(x=> x+'\n')}else{var lines=[],pos=0,source=self.$content.source
while(pos < self.$length){var ix=source.indexOf(10,pos)
if(ix==-1){lines.push({__class__:_b_.bytes,source:source.slice(pos)})
break}else{lines.push({__class__:_b_.bytes,source:source.slice(pos,ix+1)})
pos=ix+1}}
self.$lines=lines}}}
$Reader.readline=function(self,size){var $=$B.args("readline",2,{self:null,size:null},["self","size"],arguments,{size:-1},null,null),self=$.self,size=$B.$GetInt($.size)
self.$lc=self.$lc===undefined ?-1 :self.$lc
if(self.closed===true){throw _b_.ValueError.$factory('I/O operation on closed file')}
if(self.$binary){var ix=self.$content.source.indexOf(10,self.$counter)
if(ix==-1){var rest=self.$content.source.slice(self.$counter)
self.$counter=self.$content.source.length
return _b_.bytes.$factory(rest)}else{var res={__class__:_b_.bytes,source :self.$content.source.slice(self.$counter,ix+1)}
self.$counter=ix+1
return res}}else{if(self.$counter==self.$content.length){return ''}
var ix=self.$content.indexOf("\n",self.$counter)
if(ix==-1){var rest=self.$content.substr(self.$counter)
self.$counter=self.$content.length
return rest}else{var res=self.$content.substring(self.$counter,ix+1)
self.$counter=ix+1
self.$lc+=1
return res}}}
$Reader.readlines=function(){var $=$B.args("readlines",2,{self:null,hint:null},["self","hint"],arguments,{hint:-1},null,null),self=$.self,hint=$B.$GetInt($.hint)
var nb_read=0
if(self.closed===true){throw _b_.ValueError.$factory('I/O operation on closed file')}
self.$lc=self.$lc===undefined ?-1 :self.$lc
make_lines(self)
if(hint < 0){var lines=self.$lines.slice(self.$lc+1)}else{var lines=[]
while(self.$lc < self.$lines.length &&
nb_read < hint){self.$lc++
lines.push(self.$lines[self.$lc])}}
return lines}
$Reader.seek=function(self,offset,whence){if(self.closed===True){throw _b_.ValueError.$factory('I/O operation on closed file')}
if(whence===undefined){whence=0}
if(whence===0){self.$counter=offset}else if(whence===1){self.$counter+=offset}else if(whence===2){self.$counter=self.$length+offset}
return None}
$Reader.seekable=function(self){return true}
$Reader.tell=function(self){return self.$counter}
$Reader.write=function(_self,data){if(_self.mode.indexOf('w')==-1){if($B.$io.UnsupportedOperation===undefined){$B.$io.UnsupportedOperation=$B.$class_constructor(
"UnsupportedOperation",{},[_b_.Exception],["Exception"])}
throw $B.$call($B.$io.UnsupportedOperation)('not writable')}
if(_self.mode.indexOf('b')==-1){
if(typeof data !="string"){throw _b_.TypeError.$factory('write() argument must be str,'+
` not ${class_name(data)}`)}
_self.$content+=data}else{if(! $B.$isinstance(data,[_b_.bytes,_b_.bytearray])){throw _b_.TypeError.$factory('write() argument must be bytes,'+
` not ${class_name(data)}`)}
_self.$content.source=_self.$content.source.concat(data.source)}
$B.file_cache[_self.name]=_self.$content}
$Reader.writable=function(self){return false}
$B.set_func_names($Reader,"builtins")
var $BufferedReader=$B.make_class('_io.BufferedReader',function(content){return{
__class__:$BufferedReader,$binary:true,$content:content,$read_func:$B.$getattr(content,'read')}}
)
$BufferedReader.__mro__=[$Reader,_b_.object]
$BufferedReader.read=function(self,size){if(self.$read_func===undefined){return $Reader.read(self,size===undefined ?-1 :size)}
return self.$read_func(size ||-1)}
var $TextIOWrapper=$B.make_class('_io.TextIOWrapper',function(){var $=$B.args("TextIOWrapper",6,{buffer:null,encoding:null,errors:null,newline:null,line_buffering:null,write_through:null},["buffer","encoding","errors","newline","line_buffering","write_through"],arguments,{encoding:"utf-8",errors:_b_.None,newline:_b_.None,line_buffering:_b_.False,write_through:_b_.False},null,null)
return{
__class__:$TextIOWrapper,$content:_b_.bytes.decode($.buffer.$content,$.encoding),encoding:$.encoding,errors:$.errors,newline:$.newline}}
)
$TextIOWrapper.__mro__=[$Reader,_b_.object]
$B.set_func_names($TextIOWrapper,"builtins")
$B.Reader=$Reader
$B.TextIOWrapper=$TextIOWrapper
$B.BufferedReader=$BufferedReader
var $url_open=_b_.open=function(){
var $=$B.args('open',3,{file:null,mode:null,encoding:null},['file','mode','encoding'],arguments,{mode:'r',encoding:'utf-8'},'args','kw'),file=$.file,mode=$.mode,encoding=$.encoding,result={}
if(encoding=='locale'){
encoding='utf-8'}
var is_binary=mode.search('b')>-1
if(mode.search('w')>-1){
var res={$binary:is_binary,$content:is_binary ? _b_.bytes.$factory():'',$encoding:encoding,closed:False,mode,name:file}
res.__class__=is_binary ? $BufferedReader :$TextIOWrapper
$B.file_cache[file]=res.$content
return res}else if(['r','rb'].indexOf(mode)==-1){throw _b_.ValueError.$factory("Invalid mode '"+mode+"'")}
if($B.$isinstance(file,_b_.str)){
if($B.file_cache.hasOwnProperty($.file)){var f=$B.file_cache[$.file]
result.content=f
if(is_binary && typeof f=='string'){result.content=_b_.str.encode(f,'utf-8')}else if(f.__class__===_b_.bytes && ! is_binary){result.content=_b_.bytes.decode(f,encoding)}}else if($B.files && $B.files.hasOwnProperty($.file)){
var $res=atob($B.files[$.file].content)
var source=[]
for(const char of $res){source.push(char.charCodeAt(0))}
result.content=_b_.bytes.$factory(source)
if(!is_binary){
try{result.content=_b_.bytes.decode(result.content,encoding)}catch(error){result.error=error}}}else if($B.protocol !="file"){
var req=new XMLHttpRequest()
req.overrideMimeType('text/plain;charset=x-user-defined')
req.onreadystatechange=function(){if(this.readyState !=4){return}
var status=this.status
if(status==404){result.error=_b_.FileNotFoundError.$factory(file)}else if(status !=200){result.error=_b_.IOError.$factory('Could not open file '+
file+' : status '+status)}else{var bytes=[]
for(var i=0,len=this.response.length;i < len;i++){var cp=this.response.codePointAt(i)
if(cp > 0xf700){cp-=0xf700}
bytes.push(cp)}
result.content=_b_.bytes.$factory(bytes)
if(! is_binary){
try{result.content=_b_.bytes.decode(result.content,encoding)}catch(error){result.error=error}}}}
var cache=$B.get_option('cache'),fake_qs=cache ? '' :'?foo='+(new Date().getTime())
req.open('GET',encodeURI(file+fake_qs),false)
req.send()}else{throw _b_.FileNotFoundError.$factory(
"cannot use 'open()' with protocol 'file'")}
if(result.error !==undefined){throw result.error}
var res={$binary:is_binary,$content:result.content,$counter:0,$encoding:encoding,$length:is_binary ? result.content.source.length :
result.content.length,closed:False,mode,name:file}
res.__class__=is_binary ? $BufferedReader :$TextIOWrapper
return res}else{throw _b_.TypeError.$factory("invalid argument for open(): "+
_b_.str.$factory(file))}}
function*zip_iter(args){var t=[]
for(var arg in args){t.push($B.make_js_iterator(arg))}
return t}
var zip=_b_.zip=$B.make_class("zip",function(){var res={__class__:zip,items:[]}
if(arguments.length==0){return res}
var $ns=$B.args('zip',0,{},[],arguments,{},'args','kw')
var _args=$ns['args'],strict=$B.$bool($ns.kw.$jsobj.strict ||false)
var nexts=[],only_lists=true,min_len
var iters=[]
for(var arg of _args){iters.push($B.make_js_iterator(arg))}
return{
__class__:zip,iters,strict}}
)
var zip_iterator=$B.make_iterator_class('zip')
zip.__iter__=function(self){return self}
zip.__next__=function(self){var res=[],len=self.iters.length
for(var i=0;i < len;i++){var v=self.iters[i].next()
if(v.done){if(self.strict){if(i > 0){throw _b_.ValueError.$factory(
`zip() argument ${i + 1} is longer than argument ${i}`)}else{for(var j=1;j < len;j++){var v=self.iters[j].next()
if(! v.done){throw _b_.ValueError.$factory(
`zip() argument ${j + 1} is longer than argument ${i + 1}`)}}}}
throw _b_.StopIteration.$factory('')}
res.push(v.value)}
return $B.fast_tuple(res)}
$B.set_func_names(zip,"builtins")
function no_set_attr(klass,attr){if(klass[attr]!==undefined){throw _b_.AttributeError.$factory("'"+klass.__name__+
"' object attribute '"+attr+"' is read-only")}else{throw $B.attr_error(attr,klass)}}
var True=_b_.True=true
var False=_b_.False=false
var ellipsis=$B.ellipsis=$B.make_class("ellipsis",function(){return Ellipsis}
)
ellipsis.__repr__=function(self){return 'Ellipsis'}
var Ellipsis=_b_.Ellipsis={__class__:ellipsis}
for(var $key in $B.$comps){
switch($B.$comps[$key]){case 'ge':
case 'gt':
case 'le':
case 'lt':
ellipsis['__'+$B.$comps[$key]+'__']=(function(k){return function(other){throw _b_.TypeError.$factory("unorderable types: ellipsis() "+
k+" "+$B.class_name(other))}})($key)}}
for(var $func in Ellipsis){if(typeof Ellipsis[$func]=='function'){Ellipsis[$func].__str__=(function(f){return function(){return "<method-wrapper "+f+
" of Ellipsis object>"}})($func)}}
$B.set_func_names(ellipsis)
var FunctionCode=$B.make_class("function code")
var FunctionGlobals=$B.make_class("function globals")
$B.function={__class__:_b_.type,__code__:{__class__:FunctionCode,__name__:'function code'},__globals__:{__class__:FunctionGlobals,__name__:'function globals'},__mro__:[_b_.object],__name__:'function',__qualname__:'function',$is_class:true}
$B.function.__delattr__=function(self,attr){if(attr=="__dict__"){throw _b_.TypeError.$factory("can't deleted function __dict__")}}
$B.function.__dir__=function(self){var infos=self.$infos ||{},attrs=self.$attrs ||{}
return Object.keys(infos).
concat(Object.keys(attrs)).
filter(x=> !x.startsWith('$'))}
$B.function.__get__=function(self,obj){
if(obj===_b_.None){return self}
return $B.method.$factory(self,obj)}
$B.function.__getattribute__=function(self,attr){
if(self.$infos && self.$infos[attr]!==undefined){if(attr=='__code__'){var res={__class__:code}
for(var attr in self.$infos.__code__){res[attr]=self.$infos.__code__[attr]}
res.name=self.$infos.__name__
res.filename=self.$infos.__code__.co_filename
res.co_code=self+"" 
return res}else if(attr=='__annotations__'){
return $B.obj_dict(self.$infos[attr])}else if(self.$infos.hasOwnProperty(attr)){return self.$infos[attr]}}else if(self.$infos && self.$infos.__dict__ &&
_b_.dict.$contains_string(self.$infos.__dict__,attr)){return _b_.dict.$getitem_string(self.$infos.__dict__,attr)}else if(attr=="__closure__"){var free_vars=self.$infos.__code__.co_freevars
if(free_vars.length==0){return None}
var cells=[]
for(var i=0;i < free_vars.length;i++){try{cells.push($B.cell.$factory($B.$check_def_free(free_vars[i])))}catch(err){
cells.push($B.cell.$factory(None))}}
return _b_.tuple.$factory(cells)}else if(attr=='__builtins__'){if(self.$infos && self.$infos.__globals__){return _b_.dict.$getitem(self.$infos.__globals__,'__builtins__')}
return $B.obj_dict(_b_)}else if(attr=="__globals__"){return $B.obj_dict($B.imported[self.$infos.__module__])}else if(self.$attrs && self.$attrs[attr]!==undefined){return self.$attrs[attr]}else{return _b_.object.__getattribute__(self,attr)}}
$B.function.__repr__=function(self){if(self.$infos===undefined){return '<function '+self.name+'>'}else{return '<function '+self.$infos.__qualname__+'>'}}
$B.function.__mro__=[_b_.object]
$B.make_function_defaults=function(f){if(f.$infos && f.$infos.__code__){
var argcount=f.$infos.__code__.co_argcount,varnames=f.$infos.__code__.co_varnames,params=varnames.slice(0,argcount),value=f.$infos.__defaults__,$defaults={}
for(var i=value.length-1;i >=0;i--){var pos=params.length-value.length+i
if(pos < 0){break}
$defaults[params[pos]]=value[i]}
if(f.$infos.__kwdefaults__ !==_b_.None){var kwdef=f.$infos.__kwdefaults__
for(var kw of $B.make_js_iterator(kwdef)){$defaults[kw]=$B.$getitem(kwdef,kw)}}
f.$defaults=$defaults
return _b_.None}else{throw _b_.AttributeError.$factory("cannot set attribute "+attr+
" of "+_b_.str.$factory(self))}}
$B.function.__setattr__=function(self,attr,value){if(attr=="__closure__"){throw _b_.AttributeError.$factory("readonly attribute")}else if(attr=="__defaults__"){
if(value===_b_.None){value=[]}else if(! $B.$isinstance(value,_b_.tuple)){throw _b_.TypeError.$factory(
"__defaults__ must be set to a tuple object")}
if(self.$infos){self.$infos.__defaults__=value
$B.make_function_defaults(self)}else{throw _b_.AttributeError.$factory("cannot set attribute "+attr+
" of "+_b_.str.$factory(self))}}else if(attr=="__kwdefaults__"){if(value===_b_.None){value=$B.empty_dict}else if(! $B.$isinstance(value,_b_.dict)){throw _b_.TypeError.$factory(
"__kwdefaults__ must be set to a dict object")}
if(self.$infos){self.$infos.__kwdefaults__=value
$B.make_function_defaults(self)}else{throw _b_.AttributeError.$factory("cannot set attribute "+attr+
" of "+_b_.str.$factory(self))}}
if(self.$infos[attr]!==undefined){self.$infos[attr]=value}else{self.$attrs=self.$attrs ||{}
self.$attrs[attr]=value}}
$B.function.$factory=function(){}
$B.set_func_names($B.function,"builtins")
_b_.__BRYTHON__=__BRYTHON__
$B.builtin_funcs=["__build_class__","abs","aiter","all","anext","any","ascii","bin","breakpoint","callable","chr","compile","delattr","dir","divmod","eval","exec","exit","format","getattr","globals","hasattr","hash","help","hex","id","input","isinstance","issubclass","iter","len","locals","max","min","next","oct","open","ord","pow","print","quit","repr","round","setattr","sorted","sum","vars"
]
var builtin_function=$B.builtin_function_or_method=$B.make_class(
"builtin_function_or_method",function(f){f.__class__=builtin_function
return f})
builtin_function.__getattribute__=$B.function.__getattribute__
builtin_function.__reduce_ex__=builtin_function.__reduce__=function(self){return self.$infos.__name__}
builtin_function.__repr__=builtin_function.__str__=function(self){return '<built-in function '+self.$infos.__name__+'>'}
$B.set_func_names(builtin_function,"builtins")
var method_wrapper=$B.make_class("method_wrapper")
method_wrapper.__repr__=method_wrapper.__str__=function(self){return "<method wrapper '"+self.$infos.__name__+"' of function object>"}
$B.set_func_names(method_wrapper,"builtins")
$B.builtin_classes=["bool","bytearray","bytes","classmethod","complex","dict","enumerate","filter","float","frozenset","int","list","map","memoryview","object","property","range","reversed","set","slice","staticmethod","str","super","tuple","type","zip"
]
var other_builtins=['Ellipsis','False','None','True','__debug__','__import__','copyright','credits','license','NotImplemented'
]
var builtin_names=$B.builtin_funcs.
concat($B.builtin_classes).
concat(other_builtins)
for(var name of builtin_names){try{if($B.builtin_funcs.indexOf(name)>-1){_b_[name].__class__=builtin_function
_b_[name].$infos={__module__:'builtins',__name__:orig_name,__qualname__:orig_name}}}catch(err){}}
_b_.object.__init__.__class__=$B.wrapper_descriptor 
_b_.object.__new__.__class__=builtin_function})(__BRYTHON__)
;
;(function($B){
var DEFAULT_MIN_MERGE=32
var DEFAULT_MIN_GALLOPING=7
var DEFAULT_TMP_STORAGE_LENGTH=256
var POWERS_OF_TEN=[1e0,1e1,1e2,1e3,1e4,1e5,1e6,1e7,1e8,1e9]
function log10(x){if(x < 1e5){if(x < 1e2){return x < 1e1 ? 0 :1}
if(x < 1e4){return x < 1e3 ? 2 :3}
return 4}
if(x < 1e7){return x < 1e6 ? 5 :6}
if(x < 1e9){return x < 1e8 ? 7 :8}
return 9}
function alphabeticalCompare(a,b){if(a===b){return 0}
if(~~a===a && ~~b===b){if(a===0 ||b===0){return a < b ?-1 :1}
if(a < 0 ||b < 0){if(b >=0){return-1}
if(a >=0){return 1}
a=-a
b=-b}
al=log10(a)
bl=log10(b)
var t=0
if(al < bl){a*=POWERS_OF_TEN[bl-al-1]
b/=10
t=-1}else if(al > bl){b*=POWERS_OF_TEN[al-bl-1]
a/=10;
t=1;}
if(a===b){return t}
return a < b ?-1 :1}
var aStr=String(a)
var bStr=String(b)
if(aStr===bStr){return 0}
return aStr < bStr ?-1 :1}
function minRunLength(n){var r=0
while(n >=DEFAULT_MIN_MERGE){r |=(n & 1)
n >>=1}
return n+r}
function makeAscendingRun(array,lo,hi,compare){var runHi=lo+1
if(runHi===hi){return 1;}
if(compare(array[runHi++],array[lo])< 0){while(runHi < hi && compare(array[runHi],array[runHi-1])< 0){runHi++}
reverseRun(array,lo,runHi)}else{while(runHi < hi && compare(array[runHi],array[runHi-1])>=0){runHi++}}
return runHi-lo}
function reverseRun(array,lo,hi){hi--
while(lo < hi){var t=array[lo]
array[lo++]=array[hi]
array[hi--]=t}}
function binaryInsertionSort(array,lo,hi,start,compare){if(start===lo){start++}
for(;start < hi;start++){var pivot=array[start]
var left=lo
var right=start
while(left < right){var mid=(left+right)>>> 1
if(compare(pivot,array[mid])< 0){right=mid}else{left=mid+1}}
var n=start-left
switch(n){case 3:
array[left+3]=array[left+2]
case 2:
array[left+2]=array[left+1]
case 1:
array[left+1]=array[left]
break;
default:
while(n > 0){array[left+n]=array[left+n-1]
n--;}}
array[left]=pivot}}
function gallopLeft(value,array,start,length,hint,compare){var lastOffset=0,maxOffset=0,offset=1
if(compare(value,array[start+hint])> 0){maxOffset=length-hint
while(offset < maxOffset && compare(value,array[start+hint+offset])> 0){lastOffset=offset
offset=(offset << 1)+1
if(offset <=0){offset=maxOffset}}
if(offset > maxOffset){offset=maxOffset}
lastOffset+=hint
offset+=hint}else{maxOffset=hint+1
while(offset < maxOffset && compare(value,array[start+hint-offset])<=0){lastOffset=offset
offset=(offset << 1)+1
if(offset <=0){offset=maxOffset}}
if(offset > maxOffset){offset=maxOffset}
var tmp=lastOffset
lastOffset=hint-offset
offset=hint-tmp}
lastOffset++
while(lastOffset < offset){var m=lastOffset+((offset-lastOffset)>>> 1)
if(compare(value,array[start+m])> 0){lastOffset=m+1}else{offset=m}}
return offset}
function gallopRight(value,array,start,length,hint,compare){var lastOffset=0,maxOffset=0,offset=1
if(compare(value,array[start+hint])< 0){maxOffset=hint+1
while(offset < maxOffset && compare(value,array[start+hint-offset])< 0){lastOffset=offset
offset=(offset << 1)+1
if(offset <=0){offset=maxOffset}}
if(offset > maxOffset){offset=maxOffset}
var tmp=lastOffset
lastOffset=hint-offset
offset=hint-tmp}else{maxOffset=length-hint
while(offset < maxOffset && compare(value,array[start+hint+offset])>=0){lastOffset=offset
offset=(offset << 1)+1
if(offset <=0){offset=maxOffset}}
if(offset > maxOffset){offset=maxOffset}
lastOffset+=hint
offset+=hint}
lastOffset++
while(lastOffset < offset){var m=lastOffset+((offset-lastOffset)>>> 1)
if(compare(value,array[start+m])< 0){offset=m}else{lastOffset=m+1}}
return offset}
var TIM_SORT_ASSERTION="TimSortAssertion"
var TimSortAssertion=function(message){this.name=TIM_SORT_ASSERTION
this.message=message}
var TimSort=function(array,compare){var self={array:array,compare:compare,minGallop:DEFAULT_MIN_GALLOPING,length :array.length,tmpStorageLength:DEFAULT_TMP_STORAGE_LENGTH,stackLength:0,runStart:null,runLength:null,stackSize:0,
pushRun:function(runStart,runLength){this.runStart[this.stackSize]=runStart
this.runLength[this.stackSize]=runLength
this.stackSize+=1},
mergeRuns:function(){while(this.stackSize > 1){var n=this.stackSize-2
if((n >=1 && this.runLength[n-1]<=
this.runLength[n]+this.runLength[n+1])||
(n >=2 && this.runLength[n-2]<=
this.runLength[n]+this.runLength[n-1])){if(this.runLength[n-1]< this.runLength[n+1]){n--}}else if(this.runLength[n]> this.runLength[n+1]){break}
this.mergeAt(n)}},
forceMergeRuns:function(){while(this.stackSize > 1){var n=this.stackSize-2
if(n > 0 && this.runLength[n-1]< this.runLength[n+1]){n--}
this.mergeAt(n)}},
mergeAt:function(i){var compare=this.compare,array=this.array,start1=this.runStart[i],length1=this.runLength[i],start2=this.runStart[i+1],length2=this.runLength[i+1]
this.runLength[i]=length1+length2
if(i===this.stackSize-3){this.runStart[i+1]=this.runStart[i+2]
this.runLength[i+1]=this.runLength[i+2]}
this.stackSize--;
var k=gallopRight(array[start2],array,start1,length1,0,compare)
start1+=k
length1-=k
if(length1===0){return}
length2=gallopLeft(array[start1+length1-1],array,start2,length2,length2-1,compare)
if(length2===0){return}
if(length1 <=length2){this.mergeLow(start1,length1,start2,length2)}else{this.mergeHigh(start1,length1,start2,length2)}},
mergeLow:function(start1,length1,start2,length2){var compare=this.compare,array=this.array,tmp=this.tmp,i=0
for(var i=0;i < length1;i++){tmp[i]=array[start1+i]}
var cursor1=0,cursor2=start2,dest=start1
array[dest++]=array[cursor2++]
if(--length2===0){for(var i=0;i < length1;i++){array[dest+i]=tmp[cursor1+i]}
return}
if(length1===1){for(var i=0;i < length2;i++){array[dest+i]=array[cursor2+i]}
array[dest+length2]=tmp[cursor1]
return}
var minGallop=this.minGallop
while(true){var count1=0,count2=0,exit=false
do{if(compare(array[cursor2],tmp[cursor1])< 0){array[dest++]=array[cursor2++]
count2++
count1=0
if(--length2===0){exit=true
break}}else{array[dest++]=tmp[cursor1++]
count1++
count2=0
if(--length1===1){exit=true
break}}}while((count1 |count2)< minGallop)
if(exit){break}
do{
count1=gallopRight(array[cursor2],tmp,cursor1,length1,0,compare)
if(count1 !==0){for(var i=0;i < count1;i++){array[dest+i]=tmp[cursor1+i]}
dest+=count1
cursor1+=count1
length1-=count1
if(length1 <=1){exit=true
break}}
array[dest++]=array[cursor2++]
if(--length2===0){exit=true
break}
count2=gallopLeft(tmp[cursor1],array,cursor2,length2,0,compare)
if(count2 !==0){for(var i=0;i < count2;i++){array[dest+i]=array[cursor2+i]}
dest+=count2
cursor2+=count2
length2-=count2
if(length2===0){exit=true
break}}
array[dest++]=tmp[cursor1++]
if(--length1===1){exit=true
break}
minGallop--;}while(count1 >=DEFAULT_MIN_GALLOPING ||
count2 >=DEFAULT_MIN_GALLOPING);
if(exit){break}
if(minGallop < 0){minGallop=0}
minGallop+=2}
this.minGallop=minGallop
if(minGallop < 1){this.minGallop=1}
if(length1===1){for(var i=0;i < length2;i++){array[dest+i]=array[cursor2+i]}
array[dest+length2]=tmp[cursor1]}else if(length1===0){throw new TimSortAssertion('mergeLow preconditions were not respected')}else{for(var i=0;i < length1;i++){array[dest+i]=tmp[cursor1+i]}}},
mergeHigh:function(start1,length1,start2,length2){var compare=this.compare,array=this.array,tmp=this.tmp,i=0
for(var i=0;i < length2;i++){tmp[i]=array[start2+i]}
var cursor1=start1+length1-1,cursor2=length2-1,dest=start2+length2-1,customCursor=0,customDest=0
array[dest--]=array[cursor1--]
if(--length1===0){customCursor=dest-(length2-1)
for(var i=0;i < length2;i++){array[customCursor+i]=tmp[i]}
return}
if(length2===1){dest-=length1
cursor1-=length1
customDest=dest+1
customCursor=cursor1+1
for(var i=length1-1;i >=0;i--){array[customDest+i]=array[customCursor+i]}
array[dest]=tmp[cursor2]
return}
var minGallop=this.minGallop
while(true){var count1=0,count2=0,exit=false
do{if(compare(tmp[cursor2],array[cursor1])< 0){array[dest--]=array[cursor1--]
count1++
count2=0
if(--length1===0){exit=true
break}}else{array[dest--]=tmp[cursor2--]
count2++
count1=0
if(--length2===1){exit=true
break}}}while((count1 |count2)< minGallop)
if(exit){break}
do{count1=length1-gallopRight(tmp[cursor2],array,start1,length1,length1-1,compare)
if(count1 !==0){dest-=count1
cursor1-=count1
length1-=count1
customDest=dest+1
customCursor=cursor1+1
for(var i=count1-1;i >=0;i--){array[customDest+i]=array[customCursor+i]}
if(length1===0){exit=true
break}}
array[dest--]=tmp[cursor2--]
if(--length2===1){exit=true
break}
count2=length2-gallopLeft(array[cursor1],tmp,0,length2,length2-1,compare)
if(count2 !==0){dest-=count2
cursor2-=count2
length2-=count2
customDest=dest+1
customCursor=cursor2+1
for(var i=0;i < count2;i++){array[customDest+i]=tmp[customCursor+i]}
if(length2 <=1){exit=true
break}}
array[dest--]=array[cursor1--]
if(--length1===0){exit=true
break}
minGallop--}while(count1 >=DEFAULT_MIN_GALLOPING ||
count2 >=DEFAULT_MIN_GALLOPING)
if(exit){break}
if(minGallop < 0){minGallop=0}
minGallop+=2}
this.minGallop=minGallop
if(minGallop < 1){this.minGallop=1}
if(length2===1){dest-=length1
cursor1-=length1
customDest=dest+1
customCursor=cursor1+1
for(var i=length1-1;i >=0;i--){array[customDest+i]=array[customCursor+i]}
array[dest]=tmp[cursor2]}else if(length2==0){throw new TimSortAssertion("mergeHigh preconditions were not respected")}else{customCursor=dest-(length2-1)
for(var i=0;i < length2;i++){array[customCursor+i]=tmp[i]}}}}
if(self.length < 2*DEFAULT_TMP_STORAGE_LENGTH){self.tmpStorageLength=self.length >>> 1}
self.tmp=new Array(self.tmpStorageLength)
self.stackLength=
(self.length < 120 ? 5 :
self.length < 1542 ? 10 :
self.length < 119151 ? 19 :40)
self.runStart=new Array(self.stackLength)
self.runLength=new Array(self.stackLength)
return self}
function tim_sort(array,compare,lo,hi){if(!Array.isArray(array)){throw _b_.TypeError.$factory("Can only sort arrays")}
if(!compare){compare=alphabeticalCompare}else if(typeof compare !=="function"){hi=lo
lo=compare
compare=alphabeticalCompare}
if(!lo){lo=0}
if(!hi){hi=array.length}
var remaining=hi-lo
if(remaining < 2){return}
var runLength=0
if(remaining < DEFAULT_MIN_MERGE){runLength=makeAscendingRun(array,lo,hi,compare)
binaryInsertionSort(array,lo,hi,lo+runLength,compare)
return}
var ts=new TimSort(array,compare)
var minRun=minRunLength(remaining)
do{runLength=makeAscendingRun(array,lo,hi,compare)
if(runLength < minRun){var force=remaining
if(force > minRun){force=minRun}
binaryInsertionSort(array,lo,lo+force,lo+runLength,compare)
runLength=force}
ts.pushRun(lo,runLength)
ts.mergeRuns()
remaining-=runLength
lo+=runLength}while(remaining !==0)
ts.forceMergeRuns()}
function tim_sort_safe(array,compare){
try{
tim_sort(array,compare,0,array.length)}catch(e){if(e.name==TIM_SORT_ASSERTION){array.sort(compare);}else{
throw e;}}}
$B.$TimSort=tim_sort_safe
$B.$AlphabeticalCompare=alphabeticalCompare})(__BRYTHON__)
;
;(function($B){var _b_=$B.builtins
$B.del_exc=function(frame){delete frame[1].$current_exception}
$B.set_exc=function(exc,frame){if(frame===undefined){var msg='Internal error: no frame for exception '+_b_.repr(exc)
console.error(['Traceback (most recent call last):',$B.print_stack(exc.$frame_obj),msg].join('\n'))
if($B.get_option('debug',exc)> 1){console.log(exc.args)
console.log(exc.stack)}
throw Error(msg)}else{frame[1].$current_exception=$B.exception(exc)}}
$B.get_exc=function(){var frame=$B.frame_obj.frame
return frame[1].$current_exception}
$B.set_exception_offsets=function(exc,position){
exc.$positions=exc.$positions ||{}
exc.$positions[$B.frame_obj.count-1]=position
return exc}
$B.$raise=function(arg,cause){
var active_exc=$B.get_exc()
if(arg===undefined){if(active_exc !==undefined){throw active_exc}
throw _b_.RuntimeError.$factory("No active exception to reraise")}else{if($B.$isinstance(arg,BaseException)){if(arg.__class__===_b_.StopIteration &&
$B.frame_obj.frame.$is_generator){
arg=_b_.RuntimeError.$factory("generator raised StopIteration")}
arg.__context__=active_exc===undefined ? _b_.None :active_exc
arg.__cause__=cause ||_b_.None
arg.__suppress_context__=cause !==undefined
throw arg}else if(arg.$is_class && _b_.issubclass(arg,BaseException)){if(arg===_b_.StopIteration){if($B.frame_obj.frame[1].$is_generator){
throw _b_.RuntimeError.$factory("generator raised StopIteration")}}
var exc=$B.$call(arg)()
exc.__context__=active_exc===undefined ? _b_.None :active_exc
exc.__cause__=cause ||_b_.None
exc.__suppress_context__=cause !==undefined
throw exc}else{throw _b_.TypeError.$factory("exceptions must derive from BaseException")}}}
$B.print_stack=function(frame_obj){
var stack=make_frames_stack(frame_obj ||$B.frame_obj)
var trace=[]
for(var frame of stack){var lineno=frame.$lineno,filename=frame.__file__
if(lineno !==undefined){var local=frame[0]==frame[2]? "<module>" :frame[0]
trace.push(`  File "${filename}" line ${lineno}, in ${local}`)
var src=$B.file_cache[filename]
if(src){var lines=src.split("\n"),line=lines[lineno-1]
trace.push("    "+line.trim())}}}
return trace.join("\n")}
$B.last_frame=function(){var frame=$B.frame_obj.frame
return `file ${frame.__file__} line ${frame.$lineno}`}
var traceback=$B.traceback=$B.make_class("traceback",function(exc){var frame_obj=exc.$frame_obj
if($B.$isinstance(exc,_b_.SyntaxError)){frame_obj=frame_obj.prev}
if(frame_obj===null){return _b_.None}
var $linenums=$B.make_linenums(frame_obj)
return{
__class__ :traceback,$stack:make_frames_stack(frame_obj),
$linenums,pos:0}}
)
traceback.__getattribute__=function(_self,attr){switch(attr){case "tb_frame":
return _self.$stack[_self.pos]
case "tb_lineno":
return _self.$linenums[_self.pos]
case "tb_lasti":
return-1 
case "tb_next":
if(_self.pos < _self.$stack.length-1){_self.pos++
return _self}else{return _b_.None}
case "stack":
return _self.$stack
default:
return _b_.object.__getattribute__(_self,attr)}}
$B.set_func_names(traceback,"builtins")
var frame=$B.frame=$B.make_class("frame",function(frame_list){frame_list.__class__=frame
return frame_list}
)
frame.__delattr__=function(_self,attr){if(attr=="f_trace"){_self.$f_trace=_b_.None}}
frame.__dir__=function(_self){return _b_.object.__dir__(frame).concat(['clear','f_back','f_builtins','f_code','f_globals','f_lasti','f_lineno','f_locals','f_trace','f_trace_lines','f_trace_opcodes'])}
frame.__getattr__=function(_self,attr){
if(attr=="f_back"){
var frame_obj=$B.frame_obj
while(frame_obj !==null){if(frame_obj.frame===_self){break}
frame_obj=frame_obj.prev}
if(frame_obj.prev !==null){return frame.$factory(frame_obj.prev)}
return _b_.None}else if(attr=="clear"){return function(){}}else if(attr=="f_trace"){var locals=_self[1]
if(_self.$f_trace===undefined){return _b_.None}
return _self.$f_trace}
throw $B.attr_error(attr,_self)}
frame.__setattr__=function(_self,attr,value){if(attr=="f_trace"){
_self.$f_trace=value}}
frame.__str__=frame.__repr__=function(_self){return '<frame object, file '+_self.__file__+
', line '+_self.$lineno+', code '+
frame.f_code.__get__(_self).co_name+'>'}
frame.f_builtins={__get__:function(_self){return $B.$getattr(_self[3].__builtins__,'__dict__')}}
frame.f_code={__get__:function(_self){var res
if(_self[4]){res=_self[4].$infos.__code__}else if(_self.f_code){
res=_self.f_code}else{res={co_name:(_self[0]==_self[2]? '<module>' :_self[0]),co_filename:_self.__file__,co_varnames:$B.fast_tuple([])}
res.co_qualname=res.co_name }
res.__class__=_b_.code
return res}}
frame.f_globals={__get__:function(_self){if(_self.f_globals){return _self.f_globals}else if(_self.f_locals && _self[1]==_self[3]){return _self.f_globals=_self.f_locals}else{return _self.f_globals=$B.obj_dict(_self[3])}}}
frame.f_lineno={__get__:function(_self){return _self.$lineno}}
frame.f_locals={__get__:function(_self){
if(_self.f_locals){return _self.f_locals}else if(_self.f_globals && _self[1]==_self[3]){return _self.f_locals=_self.f_globals}else{return _self.f_locals=$B.obj_dict(_self[1])}}}
frame.f_trace={__get__:function(_self){return _self.$f_trace}}
$B.set_func_names(frame,"builtins")
$B._frame=frame 
var BaseException=_b_.BaseException=$B.make_class('BaseException')
BaseException.__init__=function(self){var args=arguments[1]===undefined ?[]:[arguments[1]]
self.args=_b_.tuple.$factory(args)}
BaseException.__repr__=function(self){var res=self.__class__.__name__+'('
if(self.args[0]!==undefined){res+=_b_.repr(self.args[0])}
if(self.args.length > 1){res+=', '+_b_.repr($B.fast_tuple(self.args.slice(1)))}
return res+')'}
BaseException.__str__=function(self){if(self.args.length > 0 && self.args[0]!==_b_.None){return _b_.str.$factory(self.args[0])}
return ''}
BaseException.__new__=function(cls){var err=_b_.BaseException.$factory()
err.__class__=cls
err.__dict__=$B.empty_dict()
return err}
BaseException.__getattr__=function(self,attr){if(attr=='__context__'){var frame=$B.frame_obj.frame,ctx=frame[1].$current_exception
return ctx ||_b_.None}else{throw $B.attr_error(attr,self)}}
BaseException.add_note=function(self,note){
if(! $B.$isinstance(note,_b_.str)){throw _b_.TypeError.$factory('note must be a str, not '+
`'${$B.class_name(note)}'`)}
if(self.__notes__ !==undefined){self.__notes__.push(note)}else{self.__notes__=[note]}}
BaseException.with_traceback=function(_self,tb){_self.__traceback__=tb
return _self}
$B.deep_copy=function(stack){var res=[]
for(const s of stack){var item=[s[0],{},s[2],{}]
if(s[4]!==undefined){item.push(s[4])}
for(const i of[1,3]){for(var key in s[i]){item[i][key]=s[i][key]}}
res.push(item)}
return res}
$B.restore_frame_obj=function(frame_obj,locals){$B.frame_obj=frame_obj
$B.frame_obj.frame[1]=locals}
$B.make_linenums=function(frame_obj){var res=[],frame_obj=frame_obj ||$B.frame_obj
while(frame_obj !==null){res.push(frame_obj.frame.$lineno)
frame_obj=frame_obj.prev}
return res.reverse()}
var make_frames_stack=$B.make_frames_stack=function(frame_obj){var stack=[]
while(frame_obj !==null){stack[stack.length]=frame_obj.frame
frame_obj=frame_obj.prev}
stack.reverse()
return stack}
$B.freeze=function(err){if(err.$frame_obj===undefined){err.$frame_obj=$B.frame_obj
err.$linenums=$B.make_linenums()}
err.__traceback__=traceback.$factory(err)}
var be_factory=`
    var _b_ = __BRYTHON__.builtins
    var err = Error()
    err.args = $B.fast_tuple(Array.from(arguments))
    err.__class__ = _b_.BaseException
    err.__traceback__ = _b_.None
    err.$py_error = true
    err.$frame_obj = $B.frame_obj
    err.$linenums = $B.make_linenums()
    // placeholder
    err.__cause__ = _b_.None // XXX fix me
    err.__context__ = _b_.None // XXX fix me
    err.__suppress_context__ = false // XXX fix me
    return err
`
BaseException.$factory=Function(be_factory)
BaseException.$factory.$infos={__name__:"BaseException",__qualname__:"BaseException"}
$B.set_func_names(BaseException)
_b_.BaseException=BaseException
$B.exception=function(js_exc,in_ctx_manager){
if(! js_exc.__class__){if(js_exc.$py_exc){
return js_exc.$py_exc}
console.log('exception',js_exc)
var exc=_b_.JavascriptError.$factory((js_exc.__name__ ||js_exc.name))
exc.$js_exc=js_exc
if($B.is_recursion_error(js_exc)){return _b_.RecursionError.$factory("too much recursion")}
exc.__cause__=_b_.None
exc.__context__=_b_.None
exc.__suppress_context__=false
var $message=(js_exc.message ||"<"+js_exc+">")
exc.args=_b_.tuple.$factory([$message])
exc.$py_error=true
js_exc.$py_exc=exc
$B.freeze(exc)}else{var exc=js_exc
$B.freeze(exc)}
return exc}
$B.is_exc=function(exc,exc_list){
if(exc.__class__===undefined){exc=$B.exception(exc)}
var this_exc_class=exc.$is_class ? exc :exc.__class__
for(var i=0;i < exc_list.length;i++){var exc_class=exc_list[i]
if(this_exc_class===undefined){console.log("exc class undefined",exc)}
if(_b_.issubclass(this_exc_class,exc_class)){return true}}
return false}
$B.is_recursion_error=function(js_exc){
var msg=js_exc+"",parts=msg.split(":"),err_type=parts[0].trim(),err_msg=parts[1].trim()
return(err_type=='InternalError' && err_msg=='too much recursion')||
(err_type=='Error' && err_msg=='Out of stack space')||
(err_type=='RangeError' && err_msg=='Maximum call stack size exceeded')}
var $make_exc=$B.$make_exc=function(names,parent){
var _str=[],pos=0
for(var name of names){var code=""
if(Array.isArray(name)){
var code=name[1],name=name[0]}
$B.builtins_scope[name]=true
var $exc=be_factory.replace(/BaseException/g,name)
$exc=$exc.replace("// placeholder",code)
_b_[name]={__class__:_b_.type,__bases__:[_b_[parent.__name__]],__name__:name,__qualname__:name,__mro__:[_b_[parent.__name__]].concat(parent.__mro__),$is_class:true}
_b_[name].$factory=Function($exc)
_b_[name].$factory.$infos={__name__:name,__qualname__:name}
$B.set_func_names(_b_[name],'builtins')}}
$make_exc(["SystemExit","KeyboardInterrupt","GeneratorExit","Exception"],BaseException)
$make_exc(["JavascriptError"],_b_.Exception)
var js_errors={'Error':_b_.JavascriptError}
$make_exc([["StopIteration","err.value = arguments[0] || _b_.None"],["StopAsyncIteration","err.value = arguments[0]"],"ArithmeticError","AssertionError","BufferError","EOFError",["ImportError","err.name = arguments[0]"],"LookupError","MemoryError","OSError","ReferenceError","RuntimeError",["SyntaxError","err.msg = arguments[0]"],"SystemError","TypeError","ValueError","Warning"],_b_.Exception)
$make_exc(["FloatingPointError","OverflowError","ZeroDivisionError"],_b_.ArithmeticError)
$make_exc([["ModuleNotFoundError","err.name = arguments[0]"]],_b_.ImportError)
$make_exc(["IndexError","KeyError"],_b_.LookupError)
$make_exc(["BlockingIOError","ChildProcessError","ConnectionError","FileExistsError","FileNotFoundError","InterruptedError","IsADirectoryError","NotADirectoryError","PermissionError","ProcessLookupError","TimeoutError"],_b_.OSError)
$make_exc(["BrokenPipeError","ConnectionAbortedError","ConnectionRefusedError","ConnectionResetError"],_b_.ConnectionError)
$make_exc(["NotImplementedError","RecursionError"],_b_.RuntimeError)
$make_exc([["IndentationError","err.msg = arguments[0]"]],_b_.SyntaxError)
$make_exc(["TabError"],_b_.IndentationError)
$make_exc(["UnicodeError"],_b_.ValueError)
$make_exc(["UnicodeDecodeError","UnicodeEncodeError","UnicodeTranslateError"],_b_.UnicodeError)
$make_exc(["DeprecationWarning","PendingDeprecationWarning","RuntimeWarning","SyntaxWarning","UserWarning","FutureWarning","ImportWarning","UnicodeWarning","BytesWarning","ResourceWarning","EncodingWarning"],_b_.Warning)
$make_exc(["EnvironmentError","IOError","VMSError","WindowsError"],_b_.OSError)
var js='\nvar $ = $B.args("AttributeError", 3, {"msg": null, "name":null, "obj":null}, '+
'["msg", "name", "obj"], arguments, '+
'{msg: _b_.None, name: _b_.None, obj: _b_.None}, "*", null);\n'+
'err.args = $B.fast_tuple($.msg === _b_.None ? [] : [$.msg])\n;'+
'err.name = $.name\nerr.obj = $.obj\n'
$make_exc([["AttributeError",js]],_b_.Exception)
_b_.AttributeError.__str__=function(self){return self.args[0]}
$B.set_func_names(_b_.AttributeError,'builtins')
$B.attr_error=function(name,obj){if(obj.$is_class){var msg=`type object '${obj.__name__}'`}else{var msg=`'${$B.class_name(obj)}' object`}
msg+=` has no attribute '${name}'`
return _b_.AttributeError.$factory({$kw:[{name,obj,msg}]})}
var js='\nvar $ = $B.args("NameError", 2, {"message":null, "name": null}, '+
'["message", "name"], arguments, '+
'{message: _b_.None, name: _b_.None}, "*", null, 1);\n'+
'err.args = $B.fast_tuple($.message === _b_.None ? [] : [$.message])\n'+
'err.name = $.name;\n'
$make_exc([["NameError",js]],_b_.Exception)
_b_.NameError.__str__=function(self){return self.args[0]}
$B.set_func_names(_b_.NameError,'builtins')
$make_exc(["UnboundLocalError"],_b_.NameError)
_b_.UnboundLocalError.__str__=function(self){return self.args[0]}
$B.set_func_names(_b_.UnboundLocalError,'builtins')
$B.name_error=function(name){var exc=_b_.NameError.$factory(`name '${name}' is not defined`)
exc.name=name
exc.$frame_obj=$B.frame_obj
return exc}
$B.recursion_error=function(frame){var exc=_b_.RecursionError.$factory("maximum recursion depth exceeded")
$B.set_exc(exc,frame)
return exc}
var MAX_CANDIDATE_ITEMS=750,MAX_STRING_SIZE=40,MOVE_COST=2,CASE_COST=1,SIZE_MAX=65535
function LEAST_FIVE_BITS(n){return((n)& 31)}
function levenshtein_distance(a,b,max_cost){
if(a==b){return 0}
if(a.length < b.length){[a,b]=[b,a]}
while(a.length && a[0]==b[0]){a=a.substr(1)
b=b.substr(1)}
while(a.length && a[a.length-1]==b[b.length-1]){a=a.substr(0,a.length-1)
b=b.substr(0,b.length-1)}
if(b.length==0){return a.length*MOVE_COST}
if((b.length-a.length)*MOVE_COST > max_cost){return max_cost+1}
var buffer=[]
for(var i=0;i < a.length;i++){
buffer[i]=(i+1)*MOVE_COST}
var result=0
for(var b_index=0;b_index < b.length;b_index++){var code=b[b_index]
var distance=result=b_index*MOVE_COST;
var minimum=SIZE_MAX;
for(var index=0;index < a.length;index++){
var substitute=distance+substitution_cost(code,a[index])
distance=buffer[index]
var insert_delete=Math.min(result,distance)+MOVE_COST
result=Math.min(insert_delete,substitute)
buffer[index]=result
if(result < minimum){minimum=result}}
if(minimum > max_cost){
return max_cost+1}}
return result}
function substitution_cost(a,b){if(LEAST_FIVE_BITS(a)!=LEAST_FIVE_BITS(b)){
return MOVE_COST}
if(a==b){return 0}
if(a.toLowerCase()==b.toLowerCase()){return CASE_COST}
return MOVE_COST}
function calculate_suggestions(dir,name){if(dir.length >=MAX_CANDIDATE_ITEMS){return null}
var suggestion_distance=2**52,suggestion=null
for(var item of dir){
var max_distance=(name.length+item.length+3)*MOVE_COST/6
max_distance=Math.min(max_distance,suggestion_distance-1)
var current_distance=
levenshtein_distance(name,item,max_distance)
if(current_distance > max_distance){continue}
if(!suggestion ||current_distance < suggestion_distance){suggestion=item
suggestion_distance=current_distance}}
return suggestion}
$B.offer_suggestions_for_attribute_error=function(exc){var name=exc.name,obj=exc.obj
if(name===_b_.None){return _b_.None}
var dir=_b_.dir(obj),suggestions=calculate_suggestions(dir,name)
return suggestions ||_b_.None}
$B.offer_suggestions_for_name_error=function(exc,frame){var name=exc.name,frame=frame ||exc.$frame_obj.frame
if(typeof name !='string'){return _b_.None}
var locals=Object.keys(frame[1]).filter(x=> !(x.startsWith('$')))
var suggestion=calculate_suggestions(locals,name)
if(suggestion){return suggestion}
if(frame[2]!=frame[0]){var globals=Object.keys(frame[3]).filter(x=> !(x.startsWith('$')))
var suggestion=calculate_suggestions(globals,name)
if(suggestion){return suggestion}}
if(frame[4]&& frame[4].$is_method){
var instance_name=frame[4].$infos.__code__.co_varnames[0],instance=frame[1][instance_name]
if(_b_.hasattr(instance,name)){return `self.${name}`}}
return _b_.None}
var exc_group_code=
'\nvar missing = {},\n'+
'    $ = $B.args("[[name]]", 2, {message: null, exceptions: null}, '+
"['message', 'exceptions'], arguments, {exceptions: missing}, "+
'null, null)\n'+
'err.message = $.message\n'+
'err.exceptions = $.exceptions === missing ? [] : $.exceptions\n'
var js=exc_group_code.replace('[[name]]','BaseExceptionGroup')
js+=`if(err.exceptions !== _b_.None){
    var exc_list = _b_.list.$factory(err.exceptions)
    var all_exceptions = true
    for(var exc of exc_list){
        if(! $B.$isinstance(exc, _b_.Exception)){
            all_exceptions = false
            break
        }
    }
    if(all_exceptions){
        err.__class__ = _b_.ExceptionGroup
    }}
`
$make_exc([['BaseExceptionGroup',js]],_b_.BaseException)
_b_.BaseExceptionGroup.__str__=function(self){return `${self.message} (${self.exceptions.length} sub-exception`+
`${self.exceptions.length > 1 ? 's' : ''})`}
_b_.BaseExceptionGroup.split=function(self,condition){
var matching_excs=[],non_matching_excs=[]
for(var exc of self.exceptions){if($B.$isinstance(exc,_b_.BaseExceptionGroup)){var subsplit=_b_.BaseExceptionGroup.split(exc,condition),matching=subsplit[0],non_matching=subsplit[1]
if(matching===_b_.None){non_matching_excs.push(exc)}else if(matching.exceptions.length==exc.exceptions.length){matching_excs.push(exc)}else{if(matching.exceptions.length > 0){matching_excs=matching_excs.concat(matching)}
if(non_matching.exceptions.length > 0){non_matching_excs=non_matching_excs.concat(non_matching)}}}else if(condition(exc)){matching_excs.push(exc)}else{non_matching_excs.push(exc)}}
if(matching_excs.length==0){matching_excs=_b_.None}
if(non_matching_excs.length==0){non_matching_excs=_b_.None}
var res=[]
for(var item of[matching_excs,non_matching_excs]){var eg=_b_.BaseExceptionGroup.$factory(self.message,item)
eg.__cause__=self.__cause__
eg.__context__=self.__context__
eg.__traceback__=self.__traceback__
res.push(eg)}
return $B.fast_tuple(res)}
_b_.BaseExceptionGroup.subgroup=function(self,condition){return _b_.BaseExceptionGroup.split(self,condition)[0]}
$B.set_func_names(_b_.BaseExceptionGroup,"builtins")
var js=exc_group_code.replace('[[name]]','ExceptionGroup')
js+=`if(err.exceptions !== _b_.None){
    var exc_list = _b_.list.$factory(err.exceptions)
    for(var exc of exc_list){
        if(! $B.$isinstance(exc, _b_.Exception)){
            throw _b_.TypeError.$factory(
                'Cannot nest BaseExceptions in an ExceptionGroup')
        }
    }}
`
$make_exc([['ExceptionGroup',js]],_b_.Exception)
_b_.ExceptionGroup.__bases__.splice(0,0,_b_.BaseExceptionGroup)
_b_.ExceptionGroup.__mro__.splice(0,0,_b_.BaseExceptionGroup)
$B.set_func_names(_b_.ExceptionGroup,"builtins")
function trace_from_stack(err){function handle_repeats(src,count_repeats){if(count_repeats > 0){var len=trace.length
for(var i=0;i < 2;i++){if(src){trace.push(trace[len-2])
trace.push(trace[len-1])}else{trace.push(trace[len-1])}
count_repeats--
if(count_repeats==0){break}}
if(count_repeats > 0){trace.push(`[Previous line repeated ${count_repeats} more`+
` time${count_repeats > 1 ? 's' : ''}]`)}}}
var trace=[],save_filename,save_lineno,save_scope,count_repeats=0,stack=err.$frame_obj===undefined ?[]:make_frames_stack(err.$frame_obj),linenos=err.$linenums
for(var frame_num=0,len=stack.length;frame_num < len;frame_num++){var frame=stack[frame_num],lineno=linenos[frame_num],filename=frame.__file__,scope=frame[0]==frame[2]? '<module>' :frame[0]
if(filename==save_filename && scope==save_scope && lineno==save_lineno){count_repeats++
continue}
handle_repeats(src,count_repeats)
save_filename=filename
save_lineno=lineno
save_scope=scope
count_repeats=0
var src=$B.file_cache[filename]
trace.push(`  File "${filename}", line ${lineno}, in `+
(frame[0]==frame[2]? '<module>' :frame[0]))
if(src){var lines=src.split('\n'),line=lines[lineno-1]
if(line){trace.push('    '+line.trim())}else{console.log('no line',line)}
if(err.$positions !==undefined){var position=err.$positions[frame_num],trace_line=''
if(position &&(
(position[1]!=position[0]||
(position[2]-position[1])!=line.trim().length ||
position[3]))){var indent=line.length-line.trimLeft().length
var paddings=[position[0]-indent,position[1]-position[0],position[2]-position[1]]
for(var padding in paddings){if(padding < 0){console.log('wrong values, position',position,'indent',indent)
paddings[paddings.indexOf(padding)]=0}}
trace_line+='    '+' '.repeat(paddings[0])+
'~'.repeat(paddings[1])+
'^'.repeat(paddings[2])
if(position[3]!==undefined){trace_line+='~'.repeat(position[3]-position[2])}
trace.push(trace_line)}}}else{console.log('no src for filename',filename)
console.log('in file_cache',Object.keys($B.file_cache).join('\n'))}}
if(count_repeats > 0){var len=trace.length
for(var i=0;i < 2;i++){if(src){trace.push(trace[len-2])
trace.push(trace[len-1])}else{trace.push(trace[len-1])}}
trace.push(`[Previous line repeated ${count_repeats - 2} more times]`)}
return trace.join('\n')+'\n'}
$B.error_trace=function(err){var trace='',stack=err.$frame_obj===undefined ?[]:make_frames_stack(err.$frame_obj)
if($B.get_option('debug',err)> 1){console.log("handle error",err.__class__,err.args)
console.log('stack',stack)
console.log(err.stack)}
if(stack.length > 0){trace='Traceback (most recent call last):\n'}
if(err.__class__===_b_.SyntaxError ||
err.__class__===_b_.IndentationError){err.$frame_obj=err.$frame_obj===null ? null :err.$frame_obj.prev
trace+=trace_from_stack(err)
var filename=err.filename,line=err.text,indent=line.length-line.trimLeft().length
trace+=`  File "${filename}", line ${err.args[1][1]}\n`+
`    ${line.trim()}\n`
if(err.__class__ !==_b_.IndentationError &&
err.text){
if($B.get_option('debug',err)> 1){console.log('error args',err.args[1])
console.log('err line',line)
console.log('indent',indent)}
var start=err.offset-indent,end_offset=err.end_offset+
(err.end_offset==err.offset ? 1 :0)
marks='    '+' '.repeat(start),nb_marks=1
if(err.end_lineno){if(err.end_lineno > err.lineno){nb_marks=line.length-start-indent}else{nb_marks=end_offset-start-indent}
if(nb_marks==0 &&
err.end_offset==line.substr(indent).length){nb_marks=1}}
marks+='^'.repeat(nb_marks)+'\n'
trace+=marks}
trace+=`${err.__class__.__name__}: ${err.args[0]}`}else if(err.__class__ !==undefined){var name=$B.class_name(err)
trace+=trace_from_stack(err)
var args_str=_b_.str.$factory(err)
trace+=name+(args_str ? ': '+args_str :'')
if(err.__class__===_b_.NameError){var suggestion=$B.offer_suggestions_for_name_error(err)
if(suggestion !==_b_.None){trace+=`. Did you mean '${suggestion}'?`}
if($B.stdlib_module_names.indexOf(err.name)>-1){
trace+=`. Did you forget to import '${err.name}'?`}}else if(err.__class__===_b_.AttributeError){var suggestion=$B.offer_suggestions_for_attribute_error(err)
if(suggestion !==_b_.None){trace+=`. Did you mean: '${suggestion}'?`}}else if(err.__class__===_b_.ImportError){if(err.$suggestion !==_b_.None){trace+=`. Did you mean: '${err.$suggestion}'?`}}}else{trace=err+""}
if(err.$js_exc){trace+='\n\nJavascript error\n'+err.$js_exc+
'\n'+err.$js_exc.stack}
return trace}
$B.get_stderr=function(){if($B.imported.sys){return $B.imported.sys.stderr}
return $B.imported._sys.stderr}
$B.get_stdout=function(){if($B.imported.sys){return $B.imported.sys.stdout}
return $B.imported._sys.stdout}
$B.show_error=function(err){var trace=$B.error_trace(err)
try{var stderr=$B.get_stderr()
$B.$getattr(stderr,'write')(trace)
var flush=$B.$getattr(stderr,'flush',_b_.None)
if(flush !==_b_.None){flush()}}catch(print_exc_err){console.debug(trace)}}
$B.handle_error=function(err){
if(err.$handled){return}
err.$handled=true
$B.show_error(err)
throw err}})(__BRYTHON__)
;

;(function($B){var _b_=$B.builtins,None=_b_.None,range={__class__:_b_.type,__mro__:[_b_.object],__qualname__:'range',$is_class:true,$native:true,$match_sequence_pattern:true,
$not_basetype:true,
$descriptors:{start:true,step:true,stop:true}}
range.__contains__=function(self,other){if(range.__len__(self)==0){return false}
try{other=$B.int_or_bool(other)}catch(err){
try{range.index(self,other)
return true}catch(err){return false}}
var start=_b_.int.$to_bigint(self.start),stop=_b_.int.$to_bigint(self.stop),step=_b_.int.$to_bigint(self.step),other=_b_.int.$to_bigint(other)
var sub=other-start,fl=sub/step,res=step*fl
if(res==sub){if(stop > start){return other >=start && stop > other}else{return start >=other && other > stop}}else{return false}}
range.__delattr__=function(self,attr,value){throw _b_.AttributeError.$factory("readonly attribute")}
range.__eq__=function(self,other){if($B.$isinstance(other,range)){var len=range.__len__(self)
if(! $B.rich_comp('__eq__',len,range.__len__(other))){return false}
if(len==0){return true}
if(! $B.rich_comp('__eq__',self.start,other.start)){return false}
if(len==1){return true}
return $B.rich_comp('__eq__',self.step,other.step)}
return false}
function compute_item(r,i){var len=range.__len__(r)
if(len==0){return r.start}else if(i > len){return r.stop}
return $B.rich_op('__add__',r.start,$B.rich_op('__mul__',r.step,i))}
range.__getitem__=function(self,rank){if($B.$isinstance(rank,_b_.slice)){var norm=_b_.slice.$conv_for_seq(rank,range.__len__(self)),substep=$B.rich_op('__mul__',self.step,norm.step),substart=compute_item(self,norm.start),substop=compute_item(self,norm.stop)
return range.$factory(substart,substop,substep)}
if(typeof rank !="number"){rank=$B.$GetInt(rank)}
if($B.rich_comp('__gt__',0,rank)){rank=$B.rich_op('__add__',rank,range.__len__(self))}
var res=$B.rich_op('__add__',self.start,$B.rich_op('__mul__',rank,self.step))
if(($B.rich_comp('__gt__',self.step,0)&&
($B.rich_comp('__ge__',res,self.stop)||
$B.rich_comp('__gt__',self.start,res)))||
($B.rich_comp('__gt__',0,self.step)&&
($B.rich_comp('__ge__',self.stop,res)||
$B.rich_comp('__gt__',res,self.start)))){throw _b_.IndexError.$factory("range object index out of range")}
return res}
range.__hash__=function(self){var len=range.__len__(self)
if(len==0){return _b_.hash(_b_.tuple.$factory([0,None,None]))}
if(len==1){return _b_.hash(_b_.tuple.$factory([1,self.start,None]))}
return _b_.hash(_b_.tuple.$factory([len,self.start,self.step]))}
var RangeIterator=$B.make_class("range_iterator",function(obj){return{__class__:RangeIterator,obj:obj}}
)
RangeIterator.__iter__=function(self){return self}
RangeIterator.__next__=function(self){return _b_.next(self.obj)}
$B.set_func_names(RangeIterator,"builtins")
range.__iter__=function(self){var res={__class__ :range,start:self.start,stop:self.stop,step:self.step}
if(self.$safe){res.$counter=self.start-self.step}else{res.$counter=$B.rich_op('__sub__',self.start,self.step)}
return RangeIterator.$factory(res)}
range.__len__=function(self){var len,start=_b_.int.$to_bigint(self.start),stop=_b_.int.$to_bigint(self.stop),step=_b_.int.$to_bigint(self.step)
if(self.step > 0){if(self.start >=self.stop){return 0}
len=1n+(stop-start-1n)/step}else{if(self.stop >=self.start){return 0}
len=1n+(start-stop-1n)/-step}
return _b_.int.$int_or_long(len)}
range.__next__=function(self){if(self.$safe){self.$counter+=self.step
if((self.step > 0 && self.$counter >=self.stop)
||(self.step < 0 && self.$counter <=self.stop)){throw _b_.StopIteration.$factory("")}}else{self.$counter=$B.rich_op('__add__',self.$counter,self.step)
if(($B.rich_comp('__gt__',self.step,0)&& $B.rich_comp('__ge__',self.$counter,self.stop))
||($B.rich_comp('__gt__',0,self.step)&& $B.rich_comp('__ge__',self.stop,self.$counter))){throw _b_.StopIteration.$factory("")}}
return self.$counter}
range.__reversed__=function(self){var n=$B.rich_op('__sub__',range.__len__(self),1)
return range.$factory($B.rich_op('__add__',self.start,$B.rich_op('__mul__',n,self.step)),$B.rich_op('__sub__',self.start,self.step),$B.rich_op('__mul__',-1,self.step))}
range.__repr__=function(self){$B.builtins_repr_check(range,arguments)
var res="range("+_b_.str.$factory(self.start)+", "+
_b_.str.$factory(self.stop)
if(self.step !=1){res+=", "+_b_.str.$factory(self.step)}
return res+")"}
range.__setattr__=function(self,attr,value){throw _b_.AttributeError.$factory("readonly attribute")}
range.start=function(self){return self.start}
range.step=function(self){return self.step},range.stop=function(self){return self.stop}
range.count=function(self,ob){if($B.$isinstance(ob,[_b_.int,_b_.float,_b_.bool])){return _b_.int.$factory(range.__contains__(self,ob))}else{var comp=function(other){return $B.rich_comp("__eq__",ob,other)},it=range.__iter__(self),_next=RangeIterator.__next__,nb=0
while(true){try{if(comp(_next(it))){nb++}}catch(err){if($B.$isinstance(err,_b_.StopIteration)){return nb}
throw err}}}}
range.index=function(self,other){var $=$B.args("index",2,{self:null,other:null},["self","other"],arguments,{},null,null),self=$.self,other=$.other
try{other=$B.int_or_bool(other)}catch(err){var comp=function(x){return $B.rich_comp("__eq__",other,x)},it=range.__iter__(self),_next=RangeIterator.__next__,nb=0
while(true){try{if(comp(_next(it))){return nb}
nb++}catch(err){if($B.$isinstance(err,_b_.StopIteration)){throw _b_.ValueError.$factory(_b_.str.$factory(other)+
" not in range")}
throw err}}}
var sub=$B.rich_op('__sub__',other,self.start),fl=$B.rich_op('__floordiv__',sub,self.step),res=$B.rich_op('__mul__',self.step,fl)
if($B.rich_comp('__eq__',res,sub)){if(($B.rich_comp('__gt__',self.stop,self.start)&&
$B.rich_comp('__ge__',other,self.start)&&
$B.rich_comp('__gt__',self.stop,other))||
($B.rich_comp('__ge__',self.start,self.stop)&&
$B.rich_comp('__ge__',self.start,other)
&& $B.rich_comp('__gt__',other,self.stop))){return fl}else{throw _b_.ValueError.$factory(_b_.str.$factory(other)+
' not in range')}}else{throw _b_.ValueError.$factory(_b_.str.$factory(other)+
" not in range")}}
range.$factory=function(){var $=$B.args("range",3,{start:null,stop:null,step:null},["start","stop","step"],arguments,{start:null,stop:null,step:null},null,null),start=$.start,stop=$.stop,step=$.step,safe
if(stop===null && step===null){if(start==null){throw _b_.TypeError.$factory("range expected 1 arguments, got 0")}
stop=$B.PyNumber_Index(start)
safe=typeof stop==="number"
return{__class__:range,start:0,stop:stop,step:1,$is_range:true,$safe:safe}}
if(step===null){step=1}
start=$B.PyNumber_Index(start)
stop=$B.PyNumber_Index(stop)
step=$B.PyNumber_Index(step)
if(step==0){throw _b_.ValueError.$factory("range arg 3 must not be zero")}
safe=(typeof start=="number" && typeof stop=="number" &&
typeof step=="number")
return{__class__:range,start:start,stop:stop,step:step,$is_range:true,$safe:safe}}
$B.set_func_names(range,"builtins")
var slice={__class__:_b_.type,__mro__:[_b_.object],__qualname__:'slice',$is_class:true,$native:true,$not_basetype:true,
$descriptors:{start:true,step:true,stop:true}}
slice.__eq__=function(self,other){var conv1=conv_slice(self),conv2=conv_slice(other)
return conv1[0]==conv2[0]&&
conv1[1]==conv2[1]&&
conv1[2]==conv2[2]}
slice.__repr__=function(self){$B.builtins_repr_check(slice,arguments)
return "slice("+_b_.str.$factory(self.start)+", "+
_b_.str.$factory(self.stop)+", "+_b_.str.$factory(self.step)+")"}
slice.__setattr__=function(self,attr,value){throw _b_.AttributeError.$factory("readonly attribute")}
function conv_slice(self){var attrs=["start","stop","step"],res=[]
for(var i=0;i < attrs.length;i++){var val=self[attrs[i]]
if(val===_b_.None){res.push(val)}else{try{res.push($B.PyNumber_Index(val))}catch(err){throw _b_.TypeError.$factory("slice indices must be "+
"integers or None or have an __index__ method")}}}
return res}
slice.$conv_for_seq=function(self,len){
var step=self.step===None ? 1 :$B.PyNumber_Index(self.step),step_is_neg=$B.rich_comp('__gt__',0,step),len_1=$B.rich_op('__sub__',len,1)
if(step==0){throw _b_.ValueError.$factory('slice step cannot be zero')}
var start
if(self.start===None){start=step_is_neg ? len_1 :0}else{start=$B.PyNumber_Index(self.start)
if($B.rich_comp('__gt__',0,start)){start=$B.rich_op('__add__',start,len)
if($B.rich_comp('__gt__',0,start)){start=0}}
if($B.rich_comp('__ge__',start,len)){start=step < 0 ? len_1 :len}}
if(self.stop===None){stop=step_is_neg ?-1 :len}else{stop=$B.PyNumber_Index(self.stop)
if($B.rich_comp('__gt__',0,stop)){stop=$B.rich_op('__add__',stop,len)}
if($B.rich_comp('__ge__',stop,len)){stop=step_is_neg ? len_1 :len}}
return{start:start,stop:stop,step:step}}
slice.start=function(self){return self.start}
slice.step=function(self){return self.step}
slice.stop=function(self){return self.stop}
slice.indices=function(self,length){
var $=$B.args("indices",2,{self:null,length:null},["self","length"],arguments,{},null,null)
var len=$B.$GetInt($.length)
if(len < 0){_b_.ValueError.$factory("length should not be negative")}
var _step=(self.step==_b_.None)? 1 :self.step
if(_step < 0){var _start=self.start,_stop=self.stop
_start=(_start==_b_.None)? len-1 :
(_start < 0)? _b_.max(-1,_start+len):_b_.min(len-1,self.start)
_stop=(self.stop==_b_.None)?-1 :
(_stop < 0)? _b_.max(-1,_stop+len):_b_.min(len-1,self.stop)}else{var _start=(self.start==_b_.None)? 0 :_b_.min(len,self.start)
var _stop=(self.stop==_b_.None)? len :_b_.min(len,self.stop)
if(_start < 0){_start=_b_.max(0,_start+len)}
if(_stop < 0){_stop=_b_.max(0,_stop+len)}}
return _b_.tuple.$factory([_start,_stop,_step])}
slice.$fast_slice=function(start,stop,step){return{__class__:_b_.slice,start,stop,step}}
slice.$factory=function(){var $=$B.args("slice",3,{start:null,stop:null,step:null},["start","stop","step"],arguments,{stop:null,step:null},null,null)
return slice.$fast_slice($.start,$.stop,$.step)}
slice.$fast_slice=function(start,stop,step){if(stop===null && step===null){stop=start
start=_b_.None
step=_b_.None}else{step=step===null ? _b_.None :step}
var res={__class__ :slice,start:start,stop:stop,step:step}
conv_slice(res)
return res}
$B.set_func_names(slice,"builtins")
_b_.range=range
_b_.slice=slice})(__BRYTHON__)
;
;(function($B){var _b_=$B.builtins
var from_unicode={},to_unicode={}
function bytes_value(obj){return obj.__class__===bytes ? obj :fast_bytes(obj.source)}
$B.to_bytes=function(obj){var res
if($B.$isinstance(obj,[bytes,bytearray])){res=obj.source}else{var ga=$B.$getattr(obj,"tobytes",null)
if(ga !==null){res=$B.$call(ga)().source}else{throw _b_.TypeError.$factory("object doesn't support the buffer protocol")}}
return res}
function _strip(self,cars,lr){if(cars===undefined){cars=[]
var ws='\r\n \t'
for(var i=0,len=ws.length;i < len;i++){cars.push(ws.charCodeAt(i))}}else if($B.$isinstance(cars,bytes)){cars=cars.source}else{throw _b_.TypeError.$factory("Type str doesn't support the buffer API")}
if(lr=='l'){for(var i=0,len=self.source.length;i < len;i++){if(cars.indexOf(self.source[i])==-1){break}}
return bytes.$factory(self.source.slice(i))}
for(var i=self.source.length-1;i >=0;i--){if(cars.indexOf(self.source[i])==-1){break}}
return bytes.$factory(self.source.slice(0,i+1))}
function invalid(other){return ! $B.$isinstance(other,[bytes,bytearray])}
var bytearray={__class__:_b_.type,__mro__:[_b_.object],__qualname__:'bytearray',$buffer_protocol:true,$is_class:true}
var mutable_methods=["__delitem__","clear","copy","count","index","pop","remove","reverse"]
mutable_methods.forEach(function(method){bytearray[method]=(function(m){return function(self){var args=[self.source],pos=1
for(var i=1,len=arguments.length;i < len;i++){args[pos++]=arguments[i]}
return _b_.list[m].apply(null,args)}})(method)})
bytearray.__hash__=_b_.None
var bytearray_iterator=$B.make_iterator_class('bytearray_iterator')
bytearray.__iter__=function(self){return bytearray_iterator.$factory(self.source)}
bytearray.__mro__=[_b_.object]
bytearray.__repr__=bytearray.__str__=function(self){return 'bytearray('+bytes.__repr__(self)+")"}
bytearray.__setitem__=function(self,arg,value){if($B.$isinstance(arg,_b_.int)){if(! $B.$isinstance(value,_b_.int)){throw _b_.TypeError.$factory('an integer is required')}else if(value > 255){throw _b_.ValueError.$factory("byte must be in range(0, 256)")}
var pos=arg
if(arg < 0){pos=self.source.length+pos}
if(pos >=0 && pos < self.source.length){self.source[pos]=value}
else{throw _b_.IndexError.$factory('list index out of range')}}else if($B.$isinstance(arg,_b_.slice)){var start=arg.start===_b_.None ? 0 :arg.start
var stop=arg.stop===_b_.None ? self.source.length :arg.stop
if(start < 0){start=self.source.length+start}
if(stop < 0){stop=self.source.length+stop}
self.source.splice(start,stop-start)
try{var $temp=_b_.list.$factory(value)
for(var i=$temp.length-1;i >=0;i--){if(! $B.$isinstance($temp[i],_b_.int)){throw _b_.TypeError.$factory('an integer is required')}else if($temp[i]> 255){throw _b_.ValueError.$factory("byte must be in range(0, 256)")}
self.source.splice(start,0,$temp[i])}}catch(err){throw _b_.TypeError.$factory("can only assign an iterable")}}else{throw _b_.TypeError.$factory('list indices must be integer, not '+
$B.class_name(arg))}}
bytearray.append=function(self,b){if(arguments.length !=2){throw _b_.TypeError.$factory(
"append takes exactly one argument ("+(arguments.length-1)+
" given)")}
if(! $B.$isinstance(b,_b_.int)){throw _b_.TypeError.$factory("an integer is required")}
if(b > 255){throw _b_.ValueError.$factory("byte must be in range(0, 256)")}
self.source[self.source.length]=b}
bytearray.extend=function(self,b){if(self.in_iteration){
throw _b_.BufferError.$factory("Existing exports of data: object "+
"cannot be re-sized")}
if(b.__class__===bytearray ||b.__class__===bytes){b.source.forEach(function(item){self.source.push(item)})
return _b_.None}
var it=_b_.iter(b)
while(true){try{bytearray.__add__(self,_b_.next(it))}catch(err){if(err===_b_.StopIteration){break}
throw err}}
return _b_.None}
bytearray.insert=function(self,pos,b){if(arguments.length !=3){throw _b_.TypeError.$factory(
"insert takes exactly 2 arguments ("+(arguments.length-1)+
" given)")}
if(! $B.$isinstance(b,_b_.int)){throw _b_.TypeError.$factory("an integer is required")}
if(b > 255){throw _b_.ValueError.$factory("byte must be in range(0, 256)")}
_b_.list.insert(self.source,pos,b)}
bytearray.$factory=function(){var args=[bytearray]
for(var i=0,len=arguments.length;i < len;i++){args.push(arguments[i])}
return bytearray.__new__.apply(null,args)}
var bytes={__class__ :_b_.type,__mro__:[_b_.object],__qualname__:'bytes',$buffer_protocol:true,$is_class:true}
bytes.__add__=function(self,other){var other_bytes
if($B.$isinstance(other,[bytes,bytearray])){other_bytes=other.source}else if($B.$isinstance(other,_b_.memoryview)){other_bytes=_b_.memoryview.tobytes(other).source}
if(other_bytes !==undefined){return{
__class__:self.__class__,source:self.source.concat(other_bytes)}}
throw _b_.TypeError.$factory("can't concat bytes to "+
_b_.str.$factory(other))}
bytes.__bytes__=function(self){return self}
bytes.__contains__=function(self,other){if(typeof other=="number"){return self.source.indexOf(other)>-1}
if(self.source.length < other.source.length){return false}
var len=other.source.length
for(var i=0;i < self.source.length-other.source.length+1;i++){var flag=true
for(var j=0;j < len;j++){if(other.source[i+j]!=self.source[j]){flag=false
break}}
if(flag){return true}}
return false}
var bytes_iterator=$B.make_iterator_class("bytes_iterator")
bytes.__iter__=function(self){return bytes_iterator.$factory(self.source)}
bytes.__eq__=function(self,other){if(invalid(other)){return false}
return $B.$getattr(self.source,'__eq__')(other.source)}
bytes.__ge__=function(self,other){if(invalid(other)){return _b_.NotImplemented}
return _b_.list.__ge__(self.source,other.source)}
bytes.__getitem__=function(self,arg){var i
if($B.$isinstance(arg,_b_.int)){var pos=arg
if(arg < 0){pos=self.source.length+pos}
if(pos >=0 && pos < self.source.length){return self.source[pos]}
throw _b_.IndexError.$factory("index out of range")}else if($B.$isinstance(arg,_b_.slice)){var s=_b_.slice.$conv_for_seq(arg,self.source.length),start=s.start,stop=s.stop,step=s.step
var res=[],i=null,pos=0
if(step > 0){stop=Math.min(stop,self.source.length)
if(stop <=start){return bytes.$factory([])}
for(var i=start;i < stop;i+=step){res[pos++]=self.source[i]}}else{if(stop >=start){return bytes.$factory([])}
stop=Math.max(0,stop)
for(var i=start;i >=stop;i+=step){res[pos++]=self.source[i]}}
return bytes.$factory(res)}else if($B.$isinstance(arg,_b_.bool)){return self.source.__getitem__(_b_.int.$factory(arg))}}
bytes.$getnewargs=function(self){return $B.fast_tuple([bytes_value(self)])}
bytes.__getnewargs__=function(){return bytes.$getnewargs($B.single_arg('__getnewargs__','self',arguments))}
bytes.__gt__=function(self,other){if(invalid(other)){return _b_.NotImplemented}
return _b_.list.__gt__(self.source,other.source)}
bytes.__hash__=function(self){if(self===undefined){return bytes.__hashvalue__ ||$B.$py_next_hash--}
var hash=1
for(var i=0,len=self.source.length;i < len;i++){hash=(101*hash+self.source[i])& 0xFFFFFFFF}
return hash}
bytes.__init__=function(){return _b_.None}
bytes.__le__=function(self,other){if(invalid(other)){return _b_.NotImplemented}
return _b_.list.__le__(self.source,other.source)}
bytes.__len__=function(self){return self.source.length}
bytes.__lt__=function(self,other){if(invalid(other)){return _b_.NotImplemented}
return _b_.list.__lt__(self.source,other.source)}
bytes.__mod__=function(self,args){
var s=decode(self,"latin-1","strict"),res=$B.printf_format(s,'bytes',args)
return _b_.str.encode(res,"ascii")}
bytes.__mul__=function(){var $=$B.args('__mul__',2,{self:null,other:null},['self','other'],arguments,{},null,null),other=$B.PyNumber_Index($.other)
var t=[],source=$.self.source,slen=source.length
for(var i=0;i < other;i++){for(var j=0;j < slen;j++){t.push(source[j])}}
var res=bytes.$factory()
res.source=t
return res}
bytes.__ne__=function(self,other){return ! bytes.__eq__(self,other)}
bytes.__new__=function(cls,source,encoding,errors){var missing={},$=$B.args("__new__",4,{cls:null,source:null,encoding:null,errors:null},["cls","source","encoding","errors"],arguments,{source:missing,encoding:missing,errors:missing},null,null)
var source
if($.source===missing){return{
__class__:$.cls,source:[]}}else if(typeof $.source=="string" ||$B.$isinstance($.source,_b_.str)){if($.encoding===missing){throw _b_.TypeError.$factory('string argument without an encoding')}
$.errors=$.errors===missing ? 'strict' :$.errors
var res=encode($.source,$.encoding,$.errors)
if(! $B.$isinstance(res,bytes)){throw _b_.TypeError.$factory(`'${$.encoding}' codec returns `+
`${$B.class_name(res)}, not bytes`)}
res.__class__=$.cls
return res}
if($.encoding !==missing){throw _b_.TypeError.$factory("encoding without a string argument")}
if(typeof $.source=="number" ||$B.$isinstance($.source,_b_.int)){var size=$B.PyNumber_Index($.source)
source=[]
for(var i=0;i < size;i++){source[i]=0}}else if($B.$isinstance($.source,[_b_.bytes,_b_.bytearray])){source=$.source.source}else if($B.$isinstance($.source,_b_.memoryview)){source=$.source.obj.source}else{if(Array.isArray($.source)){var int_list=$.source}else{try{var int_list=_b_.list.$factory($.source)}catch(err){var bytes_method=$B.$getattr(source,'__bytes__',_b_.None)
if(bytes_method===_b_.None){throw _b_.TypeError.$factory("cannot convert "+
`'${$B.class_name(source)}' object to bytes`)}
var res=$B.$call(bytes_method)()
if(! $B.$isinstance(res,_b_.bytes)){throw _b_.TypeError.$factory(`__bytes__ returned `+
`non-bytes (type ${$B.class_name(res)})`)}
return res}}
source=[]
for(var item of int_list){item=$B.PyNumber_Index(item)
if(item >=0 && item < 256){source.push(item)}else{throw _b_.ValueError.$factory(
"bytes must be in range (0, 256)")}}}
return{
__class__:$.cls,source}}
bytes.$new=function(cls,source,encoding,errors){
var self={__class__:cls},int_list=[],pos=0
if(source===undefined){}else if(typeof source=="number" ||$B.$isinstance(source,_b_.int)){var i=source
while(i--){int_list[pos++]=0}}else{if(typeof source=="string" ||$B.$isinstance(source,_b_.str)){if(encoding===undefined){throw _b_.TypeError.$factory("string argument without an encoding")}
int_list=encode(source,encoding ||"utf-8",errors ||"strict")}else{if(encoding !==undefined){console.log('encoding',encoding)
throw _b_.TypeError.$factory("encoding without a string argument")}
if(Array.isArray(source)){int_list=source}else{try{int_list=_b_.list.$factory(source)}catch(err){var bytes_method=$B.$getattr(source,'__bytes__',_b_.None)
if(bytes_method===_b_.None){throw _b_.TypeError.$factory("cannot convert "+
`'${$B.class_name(source)}' object to bytes`)}
var res=$B.$call(bytes_method)()
if(! $B.$isinstance(res,_b_.bytes)){throw _b_.TypeError.$factory(`__bytes__ returned `+
`non-bytes (type ${$B.class_name(res)})`)}
return res}
for(var i=0;i < int_list.length;i++){try{var item=_b_.int.$factory(int_list[i])}catch(err){throw _b_.TypeError.$factory("'"+
$B.class_name(int_list[i])+"' object "+
"cannot be interpreted as an integer")}
if(item < 0 ||item > 255){throw _b_.ValueError.$factory("bytes must be in range"+
"(0, 256)")}}}}}
self.source=int_list
self.encoding=encoding
self.errors=errors
return self}
bytes.__repr__=bytes.__str__=function(self){var t=$B.special_string_repr,
res=""
for(var i=0,len=self.source.length;i < len;i++){var s=self.source[i]
if(t[s]!==undefined){res+=t[s]}else if(s < 32 ||s >=128){var hx=s.toString(16)
hx=(hx.length==1 ? '0' :'')+hx
res+='\\x'+hx}else if(s=="\\".charCodeAt(0)){res+="\\\\"}else{res+=String.fromCharCode(s)}}
if(res.indexOf("'")>-1 && res.indexOf('"')==-1){return 'b"'+res+'"'}else{return "b'"+res.replace(new RegExp("'","g"),"\\'")+"'"}}
bytes.capitalize=function(self){var src=self.source,len=src.length,buffer=src.slice()
if(buffer[0]> 96 && buffer[0]< 123){buffer[0]-=32}
for(var i=1;i < len;++i){if(buffer[i]> 64 && buffer[i]< 91){buffer[i]+=32}}
return bytes.$factory(buffer)}
bytes.center=function(){var $=$B.args('center',3,{self:null,width:null,fillbyte:null},['self','width','fillbyte'],arguments,{fillbyte:bytes.$factory([32])},null,null)
var diff=$.width-$.self.source.length
if(diff <=0){return bytes.$factory($.self.source)}
var ljust=bytes.ljust($.self,$.self.source.length+Math.floor(diff/2),$.fillbyte)
return bytes.rjust(ljust,$.width,$.fillbyte)}
bytes.count=function(){var $=$B.args('count',4,{self:null,sub:null,start:null,end:null},['self','sub','start','end'],arguments,{start:0,end:-1},null,null)
var n=0,index=-1,len=0
if(typeof $.sub=="number"){if($.sub < 0 ||$.sub > 255)
throw _b_.ValueError.$factory("byte must be in range(0, 256)")
len=1}else if(!$.sub.__class__){throw _b_.TypeError.$factory("first argument must be a bytes-like "+
"object, not '"+$B.class_name($.sub)+"'")}else if(!$.sub.__class__.$buffer_protocol){throw _b_.TypeError.$factory("first argument must be a bytes-like "+
"object, not '"+$B.class_name($.sub)+"'")}else{len=$.sub.source.length}
do{index=bytes.find($.self,$.sub,Math.max(index+len,$.start),$.end)
if(index !=-1){n++}}while(index !=-1)
return n}
bytes.decode=function(self,encoding,errors){var $=$B.args("decode",3,{self:null,encoding:null,errors:null},["self","encoding","errors"],arguments,{encoding:"utf-8",errors:"strict"},null,null)
switch($.errors){case 'strict':
case 'ignore':
case 'replace':
case 'surrogateescape':
case 'surrogatepass':
case 'xmlcharrefreplace':
case 'backslashreplace':
return decode($.self,$.encoding,$.errors)
default:}}
bytes.endswith=function(){var $=$B.args('endswith',4,{self:null,suffix:null,start:null,end:null},['self','suffix','start','end'],arguments,{start:-1,end:-1},null,null)
if($B.$isinstance($.suffix,bytes)){var start=$.start==-1 ?
$.self.source.length-$.suffix.source.length :
Math.min($.self.source.length-$.suffix.source.length,$.start)
var end=$.end==-1 ? $.self.source.length :$.end
var res=true
for(var i=$.suffix.source.length-1,len=$.suffix.source.length;
i >=0 && res;--i){res=$.self.source[end-len+i]==$.suffix.source[i]}
return res}else if($B.$isinstance($.suffix,_b_.tuple)){for(var i=0;i < $.suffix.length;++i){if($B.$isinstance($.suffix[i],bytes)){if(bytes.endswith($.self,$.suffix[i],$.start,$.end)){return true}}else{throw _b_.TypeError.$factory("endswith first arg must be "+
"bytes or a tuple of bytes, not "+
$B.class_name($.suffix))}}
return false}else{throw _b_.TypeError.$factory("endswith first arg must be bytes "+
"or a tuple of bytes, not "+$B.class_name($.suffix))}}
bytes.expandtabs=function(){var $=$B.args('expandtabs',2,{self:null,tabsize:null},['self','tabsize'],arguments,{tabsize:8},null,null)
var tab_spaces=[]
for(let i=0;i < $.tabsize;++i){tab_spaces.push(32)}
var buffer=$.self.source.slice()
for(let i=0;i < buffer.length;++i){if(buffer[i]===9){var nb_spaces=$.tabsize-i % $.tabsize
var tabs=new Array(nb_spaces)
tabs.fill(32)
buffer.splice.apply(buffer,[i,1].concat(tabs))}}
return _b_.bytes.$factory(buffer)}
bytes.find=function(self,sub){if(arguments.length !=2){var $=$B.args('find',4,{self:null,sub:null,start:null,end:null},['self','sub','start','end'],arguments,{start:0,end:-1},null,null),sub=$.sub,start=$.start,end=$.end}else{var start=0,end=-1}
if(typeof sub=="number"){if(sub < 0 ||sub > 255){throw _b_.ValueError.$factory("byte must be in range(0, 256)")}
return self.source.slice(0,end==-1 ? undefined :end).indexOf(sub,start)}else if(! sub.__class__){throw _b_.TypeError.$factory("first argument must be a bytes-like "+
"object, not '"+$B.class_name(sub)+"'")}else if(! sub.__class__.$buffer_protocol){throw _b_.TypeError.$factory("first argument must be a bytes-like "+
"object, not '"+$B.class_name(sub)+"'")}
end=end==-1 ? self.source.length :Math.min(self.source.length,end)
var len=sub.source.length
for(var i=start;i <=end-len;i++){var chunk=self.source.slice(i,i+len),found=true
for(var j=0;j < len;j++){if(chunk[j]!=sub.source[j]){found=false
break}}
if(found){return i}}
return-1}
bytes.fromhex=function(){var $=$B.args('fromhex',2,{cls:null,string:null},['cls','string'],arguments,{},null,null),string=$.string.replace(/\s/g,''),source=[]
for(var i=0;i < string.length;i+=2){if(i+2 > string.length){throw _b_.ValueError.$factory("non-hexadecimal number found "+
"in fromhex() arg")}
source.push(_b_.int.$factory(string.substr(i,2),16))}
return $.cls.$factory(source)}
bytes.hex=function(){
var $=$B.args('hex',3,{self:null,sep:null,bytes_per_sep:null},['self','sep','bytes_per_sep'],arguments,{sep:"",bytes_per_sep:1},null,null),self=$.self,sep=$.sep,bytes_per_sep=$.bytes_per_sep,res="",digits="0123456789abcdef",bps=bytes_per_sep,jstart=bps,len=self.source.length;
if(bytes_per_sep < 0){bps=-bytes_per_sep;
jstart=bps}else if(bytes_per_sep==0){sep=''}else{jstart=len % bps
if(jstart==0){jstart=bps}}
for(var i=0,j=jstart;i < len;i++){var c=self.source[i]
if(j==0){res+=sep
j=bps}
j--
res+=digits[c >> 4]
res+=digits[c & 0x0f]}
return res}
bytes.index=function(){var $=$B.args('index',4,{self:null,sub:null,start:null,end:null},['self','sub','start','end'],arguments,{start:0,end:-1},null,null)
var index=bytes.find($.self,$.sub,$.start,$.end)
console.log('index',index)
if(index==-1){throw _b_.ValueError.$factory("subsection not found")}
return index}
bytes.isalnum=function(){var $=$B.args('isalnum',1,{self:null},['self'],arguments,{},null,null),self=$.self
var src=self.source,len=src.length,res=len > 0
for(var i=0;i < len && res;++i){res=(src[i]> 96 && src[i]< 123)||
(src[i]> 64 && src[i]< 91)||
(src[i]> 47 && src[i]< 58)}
return res}
bytes.isalpha=function(){var $=$B.args('isalpha',1,{self:null},['self'],arguments,{},null,null),self=$.self
var src=self.source,len=src.length,res=len > 0
for(var i=0;i < len && res;++i){res=(src[i]> 96 && src[i]< 123)||(src[i]> 64 && src[i]< 91)}
return res}
bytes.isdigit=function(){var $=$B.args('isdigit',1,{self:null},['self'],arguments,{},null,null),self=$.self
var src=self.source,len=src.length,res=len > 0
for(let i=0;i < len && res;++i){res=src[i]> 47 && src[i]< 58}
return res}
bytes.islower=function(){var $=$B.args('islower',1,{self:null},['self'],arguments,{},null,null),self=$.self
var src=self.source,len=src.length,res=false
for(let i=0;i < len;++i){
res=res ||(src[i]> 96 && src[i]< 123)
if(src[i]> 64 && src[i]< 91){return false}}
return res}
bytes.isspace=function(){var $=$B.args('isspace',1,{self:null},['self'],arguments,{},null,null),self=$.self
var src=self.source,len=src.length
for(let i=0;i < len;++i){switch(src[i]){case 9:
case 10:
case 11:
case 12:
case 13:
case 32:
break
default:
return false}}
return true}
bytes.isupper=function(){var $=$B.args('isupper',1,{self:null},['self'],arguments,{},null,null),self=$.self
var src=self.source,len=src.length,res=false
for(let i=0;i < len;++i){
res=res ||(src[i]> 64 && src[i]< 91)
if(src[i]> 96 && src[i]< 123){return false}}
return res}
bytes.istitle=function(){var $=$B.args('istitle',1,{self:null},['self'],arguments,{},null,null),self=$.self
var src=self.source,len=src.length,current_char_is_letter=false,prev_char_was_letter=false,is_uppercase=false,is_lowercase=false
for(var i=0;i < len;++i){is_lowercase=src[i]> 96 && src[i]< 123
is_uppercase=src[i]> 64 && src[i]< 91
current_char_is_letter=is_lowercase ||is_uppercase
if(current_char_is_letter &&
(prev_char_was_letter && is_uppercase)||
(! prev_char_was_letter && is_lowercase)){return false}
prev_char_was_letter=current_char_is_letter}
return true}
bytes.join=function(){var $ns=$B.args('join',2,{self:null,iterable:null},['self','iterable'],arguments,{}),self=$ns['self'],iterable=$ns['iterable']
var next_func=$B.$getattr(_b_.iter(iterable),'__next__'),res=self.__class__.$factory(),empty=true
while(true){try{var item=next_func()
if(empty){empty=false}else{res=bytes.__add__(res,self)}
res=bytes.__add__(res,item)}catch(err){if($B.$isinstance(err,_b_.StopIteration)){break}
throw err}}
return res}
var _lower=function(char_code){if(char_code >=65 && char_code <=90){return char_code+32}else{return char_code}}
bytes.lower=function(self){var _res=[],pos=0
for(var i=0,len=self.source.length;i < len;i++){if(self.source[i]){_res[pos++]=_lower(self.source[i])}}
return bytes.$factory(_res)}
bytes.ljust=function(){var $=$B.args('ljust',3,{self:null,width:null,fillbyte:null},['self','width','fillbyte'],arguments,{fillbyte:bytes.$factory([32])},null,null)
if(!$.fillbyte.__class__){throw _b_.TypeError.$factory("argument 2 must be a byte string of length 1, "+
"not '"+$B.class_name($.fillbyte)+"'")}else if(!$.fillbyte.__class__.$buffer_protocol){throw _b_.TypeError.$factory("argument 2 must be a byte string of length 1, "+
"not '"+$B.class_name($.fillbyte)+"'")}
var padding=[],count=$.width-$.self.source.length
for(var i=0;i < count;++i){padding.push($.fillbyte.source[0])}
return bytes.$factory($.self.source.concat(padding))}
bytes.lstrip=function(self,cars){return _strip(self,cars,'l')}
bytes.maketrans=function(from,to){var _t=[],to=$B.to_bytes(to)
for(var i=0;i < 256;i++){_t[i]=i}
for(var i=0,len=from.source.length;i < len;i++){var _ndx=from.source[i]
_t[_ndx]=to[i]}
return bytes.$factory(_t)}
bytes.partition=function(){var $=$B.args('partition',2,{self:null,sep:null},['self','sep'],arguments,{},null,null)
if(! $.sep.__class__){throw _b_.TypeError.$factory("a bytes-like object is required, "+
"not '"+$B.class_name($.sep)+"'")}else if(! $.sep.__class__.$buffer_protocol){throw _b_.TypeError.$factory("a bytes-like object is required, "+
"not '"+$B.class_name($.sep)+"'")}
var len=$.sep.source.length,src=$.self.source,i=bytes.find($.self,$.sep)
return _b_.tuple.$factory([bytes.$factory(src.slice(0,i)),bytes.$factory(src.slice(i,i+len)),bytes.$factory(src.slice(i+len))
])}
bytes.removeprefix=function(){var $=$B.args("removeprefix",2,{self:null,prefix:null},["self","prefix"],arguments,{},null,null)
if(!$B.$isinstance($.prefix,[bytes,bytearray])){throw _b_.ValueError.$factory("prefix should be bytes, not "+
`'${$B.class_name($.prefix)}'`)}
if(bytes.startswith($.self,$.prefix)){return bytes.__getitem__($.self,_b_.slice.$factory($.prefix.source.length,_b_.None))}
return bytes.__getitem__($.self,_b_.slice.$factory(0,_b_.None))}
bytes.removesuffix=function(){var $=$B.args("removesuffix",2,{self:null,suffix:null},["self","suffix"],arguments,{},null,null)
if(!$B.$isinstance($.suffix,[bytes,bytearray])){throw _b_.ValueError.$factory("suffix should be bytes, not "+
`'${$B.class_name($.suffix)}'`)}
if(bytes.endswith($.self,$.suffix)){return bytes.__getitem__($.self,_b_.slice.$factory(0,$.suffix.source.length+1))}
return bytes.__getitem__($.self,_b_.slice.$factory(0,_b_.None))}
bytes.replace=function(){var $=$B.args('replace',4,{self:null,old:null,new:null,count:null},['self','old','new','count'],arguments,{count:-1},null,null),res=[]
var self=$.self,src=self.source,len=src.length,old=$.old,$new=$.new
var count=$.count >=0 ? $.count :src.length
if(! $.old.__class__){throw _b_.TypeError.$factory("first argument must be a bytes-like "+
"object, not '"+$B.class_name($.old)+"'")}else if(! $.old.__class__.$buffer_protocol){throw _b_.TypeError.$factory("first argument must be a bytes-like "+
"object, not '"+$B.class_name($.sep)+"'")}
if(! $.new.__class__){throw _b_.TypeError.$factory("second argument must be a bytes-like "+
"object, not '"+$B.class_name($.old)+"'")}else if(! $.new.__class__.$buffer_protocol){throw _b_.TypeError.$factory("second argument must be a bytes-like "+
"object, not '"+$B.class_name($.sep)+"'")}
for(var i=0;i < len;i++){if(bytes.startswith(self,old,i)&& count){for(var j=0;j < $new.source.length;j++){res.push($new.source[j])}
i+=(old.source.length-1)
count--}else{res.push(src[i])}}
return bytes.$factory(res)}
bytes.rfind=function(self,subbytes){if(arguments.length==2 && subbytes.__class__===bytes){var sub=subbytes,start=0,end=-1}else{var $=$B.args('rfind',4,{self:null,sub:null,start:null,end:null},['self','sub','start','end'],arguments,{start:0,end:-1},null,null),self=$.self,sub=$.sub,start=$.start,end=$.end}
if(typeof sub=="number"){if(sub < 0 ||sub > 255){throw _b_.ValueError.$factory("byte must be in range(0, 256)")}
return $.self.source.slice(start,$.end==-1 ? undefined :$.end).
lastIndexOf(sub)+start}else if(! sub.__class__){throw _b_.TypeError.$factory("first argument must be a bytes-like "+
"object, not '"+$B.class_name($.sub)+"'")}else if(! sub.__class__.$buffer_protocol){throw _b_.TypeError.$factory("first argument must be a bytes-like "+
"object, not '"+$B.class_name(sub)+"'")}
end=end==-1 ? self.source.length :Math.min(self.source.length,end)
var len=sub.source.length
for(var i=end-len;i >=start;--i){var chunk=self.source.slice(i,i+len),found=true
for(var j=0;j < len;j++){if(chunk[j]!=sub.source[j]){found=false
break}}
if(found){return i}}
return-1}
bytes.rindex=function(){var $=$B.args('rfind',4,{self:null,sub:null,start:null,end:null},['self','sub','start','end'],arguments,{start:0,end:-1},null,null)
var index=bytes.rfind($.self,$.sub,$.start,$.end)
if(index==-1){throw _b_.ValueError.$factory("subsection not found")}
return index}
bytes.rjust=function(){var $=$B.args('rjust',3,{self:null,width:null,fillbyte:null},['self','width','fillbyte'],arguments,{fillbyte:bytes.$factory([32])},null,null)
if(!$.fillbyte.__class__){throw _b_.TypeError.$factory("argument 2 must be a byte string of length 1, "+
"not '"+$B.class_name($.fillbyte)+"'")}else if(!$.fillbyte.__class__.$buffer_protocol){throw _b_.TypeError.$factory("argument 2 must be a byte string of length 1, "+
"not '"+$B.class_name($.fillbyte)+"'")}
var padding=[],count=$.width-$.self.source.length
for(var i=0;i < count;++i){padding.push($.fillbyte.source[0])}
return bytes.$factory(padding.concat($.self.source))}
bytes.rpartition=function(){var $=$B.args('rpartition',2,{self:null,sep:null},['self','sep'],arguments,{},null,null)
if(!$.sep.__class__){throw _b_.TypeError.$factory("a bytes-like object is required, "+
"not '"+$B.class_name($.sep)+"'")}else if(!$.sep.__class__.$buffer_protocol){throw _b_.TypeError.$factory("a bytes-like object is required, "+
"not '"+$B.class_name($.sep)+"'")}
var len=$.sep.source.length,src=$.self.source,i=bytes.rfind($.self,$.sep)
return _b_.tuple.$factory([bytes.$factory(src.slice(0,i)),bytes.$factory(src.slice(i,i+len)),bytes.$factory(src.slice(i+len))
])}
bytes.rstrip=function(self,cars){return _strip(self,cars,'r')}
bytes.split=function(){var $=$B.args('split',2,{self:null,sep:null},['self','sep'],arguments,{sep:bytes.$factory([32])},null,null),res=[],start=0,stop=0
if(! $.sep.__class__ ){throw _b_.TypeError.$factory("a bytes-like object is required, "+
"not '"+$B.class_name($.sep)+"'")}else if(! $.sep.__class__.$buffer_protocol){throw _b_.TypeError.$factory("a bytes-like object is required, "+
"not '"+$B.class_name($.sep)+"'")}
var seps=$.sep.source,len=seps.length,src=$.self.source,blen=src.length
while(stop < blen){var match=true
for(var i=0;i < len && match;i++){if(src[stop+i]!=seps[i]){match=false}}
if(match){res.push(bytes.$factory(src.slice(start,stop)))
start=stop+len
stop=start}else{stop++}}
if(match ||(stop > start)){res.push(bytes.$factory(src.slice(start,stop)))}
return res}
bytes.splitlines=function(self){var $=$B.args('splitlines',2,{self:null,keepends:null},['self','keepends'],arguments,{keepends:false},null,null)
if(!$B.$isinstance($.keepends,[_b_.bool,_b_.int])){throw _b_.TypeError('integer argument expected, got '+
$B.get_class($.keepends).__name)}
var keepends=_b_.int.$factory($.keepends),res=[],source=$.self.source,start=0,pos=0
if(! source.length){return res}
while(pos < source.length){if(pos < source.length-1 && source[pos]==0x0d &&
source[pos+1]==0x0a){res.push(bytes.$factory(source.slice(start,keepends ? pos+2 :pos)))
start=pos=pos+2}else if(source[pos]==0x0d ||source[pos]==0x0a){res.push(bytes.$factory(source.slice(start,keepends ? pos+1 :pos)))
start=pos=pos+1}else{pos++}}
if(start < source.length){res.push(bytes.$factory(source.slice(start)))}
return res}
bytes.startswith=function(){var $=$B.args('startswith',3,{self:null,prefix:null,start:null},['self','prefix','start'],arguments,{start:0},null,null),start=$.start
if($B.$isinstance($.prefix,bytes)){var res=true
for(var i=0;i < $.prefix.source.length && res;i++){res=$.self.source[start+i]==$.prefix.source[i]}
return res}else if($B.$isinstance($.prefix,_b_.tuple)){var items=[]
for(var i=0;i < $.prefix.length;i++){if($B.$isinstance($.prefix[i],bytes)){items=items.concat($.prefix[i].source)}else{throw _b_.TypeError.$factory("startswith first arg must be "+
"bytes or a tuple of bytes, not "+
$B.class_name($.prefix))}}
var prefix=bytes.$factory(items)
return bytes.startswith($.self,prefix,start)}else{throw _b_.TypeError.$factory("startswith first arg must be bytes "+
"or a tuple of bytes, not "+$B.class_name($.prefix))}}
bytes.strip=function(self,cars){var res=bytes.lstrip(self,cars)
return bytes.rstrip(res,cars)}
bytes.swapcase=function(self){var src=self.source,len=src.length,buffer=src.slice()
for(var i=0;i < len;++i){if(buffer[i]> 96 && buffer[i]< 123){buffer[i]-=32}else if(buffer[i]> 64 && buffer[i]< 91){buffer[i]+=32}}
return bytes.$factory(buffer)}
bytes.title=function(self){var src=self.source,len=src.length
buffer=src.slice(),current_char_is_letter=false,prev_char_was_letter=false,is_uppercase=false,is_lowercase=false
for(var i=0;i < len;++i){is_lowercase=buffer[i]> 96 && buffer[i]< 123
is_uppercase=buffer[i]> 64 && buffer[i]< 91
current_char_is_letter=is_lowercase ||is_uppercase
if(current_char_is_letter){if(prev_char_was_letter && is_uppercase){buffer[i]+=32}else if(! prev_char_was_letter && is_lowercase){buffer[i]-=32}}
prev_char_was_letter=current_char_is_letter}
return bytes.$factory(buffer)}
bytes.translate=function(self,table,_delete){if(_delete===undefined){_delete=[]}else if($B.$isinstance(_delete,bytes)){_delete=_delete.source}else{throw _b_.TypeError.$factory("Type "+
$B.get_class(_delete).__name+" doesn't support the buffer API")}
var res=[],pos=0
if($B.$isinstance(table,bytes)&& table.source.length==256){for(var i=0,len=self.source.length;i < len;i++){if(_delete.indexOf(self.source[i])>-1){continue}
res[pos++]=table.source[self.source[i]]}}
return bytes.$factory(res)}
var _upper=function(char_code){if(char_code >=97 && char_code <=122){return char_code-32}else{return char_code}}
bytes.upper=function(self){var _res=[],pos=0
for(var i=0,len=self.source.length;i < len;i++){if(self.source[i]){_res[pos++]=_upper(self.source[i])}}
return bytes.$factory(_res)}
bytes.zfill=function(self,width){var buffer=self.source.slice(),prefix_offset=(buffer[0]==43 ||buffer[0]==45)? 1 :0
var count=width-self.source.length
var padding=[]
for(var i=0;i < count;++i){padding.push(48)}
buffer.splice.apply(buffer,[prefix_offset,0].concat(padding))
return bytes.$factory(buffer)}
function $UnicodeEncodeError(encoding,code_point,position){throw _b_.UnicodeEncodeError.$factory("'"+encoding+
"' codec can't encode character "+_b_.hex(code_point)+
" in position "+position)}
function $UnicodeDecodeError(encoding,position){throw _b_.UnicodeDecodeError.$factory("'"+encoding+
"' codec can't decode bytes in position "+position)}
function _hex(_int){var h=_int.toString(16)
return '0x'+'0'.repeat(2-h.length)+h}
function _int(hex){return parseInt(hex,16)}
var aliases={ascii:['646','us-ascii'],big5:['big5-tw','csbig5'],big5hkscs:['big5-hkscs','hkscs'],cp037:['IBM037','IBM039'],cp273:['273','IBM273','csIBM273'],cp424:['EBCDIC-CP-HE','IBM424'],cp437:['437','IBM437'],cp500:['EBCDIC-CP-BE','EBCDIC-CP-CH','IBM500'],cp775:['IBM775'],cp850:['850','IBM850'],cp852:['852','IBM852'],cp855:['855','IBM855'],cp857:['857','IBM857'],cp858:['858','IBM858'],cp860:['860','IBM860'],cp861:['861','CP-IS','IBM861'],cp862:['862','IBM862'],cp863:['863','IBM863'],cp864:['IBM864'],cp865:['865','IBM865'],cp866:['866','IBM866'],cp869:['869','CP-GR','IBM869'],cp932:['932','ms932','mskanji','ms-kanji'],cp949:['949','ms949','uhc'],cp950:['950','ms950'],cp1026:['ibm1026'],cp1125:['1125','ibm1125','cp866u','ruscii'],cp1140:['ibm1140'],cp1250:['windows-1250'],cp1251:['windows-1251'],cp1252:['windows-1252'],cp1253:['windows-1253'],cp1254:['windows-1254'],cp1255:['windows-1255'],cp1256:['windows-1256'],cp1257:['windows-1257'],cp1258:['windows-1258'],euc_jp:['eucjp','ujis','u-jis'],euc_jis_2004:['jisx0213','eucjis2004'],euc_jisx0213:['eucjisx0213'],euc_kr:['euckr','korean','ksc5601','ks_c-5601','ks_c-5601-1987','ksx1001','ks_x-1001'],gb2312:['chinese','csiso58gb231280','euc-cn','euccn','eucgb2312-cn','gb2312-1980','gb2312-80','iso-ir-58'],gbk:['936','cp936','ms936'],gb18030:['gb18030-2000'],hz:['hzgb','hz-gb','hz-gb-2312'],iso2022_jp:['csiso2022jp','iso2022jp','iso-2022-jp'],iso2022_jp_1:['iso2022jp-1','iso-2022-jp-1'],iso2022_jp_2:['iso2022jp-2','iso-2022-jp-2'],iso2022_jp_2004:['iso2022jp-2004','iso-2022-jp-2004'],iso2022_jp_3:['iso2022jp-3','iso-2022-jp-3'],iso2022_jp_ext:['iso2022jp-ext','iso-2022-jp-ext'],iso2022_kr:['csiso2022kr','iso2022kr','iso-2022-kr'],latin_1:['iso-8859-1','iso8859-1','8859','cp819','latin','latin1','L1'],iso8859_2:['iso-8859-2','latin2','L2'],iso8859_3:['iso-8859-3','latin3','L3'],iso8859_4:['iso-8859-4','latin4','L4'],iso8859_5:['iso-8859-5','cyrillic'],iso8859_6:['iso-8859-6','arabic'],iso8859_7:['iso-8859-7','greek','greek8'],iso8859_8:['iso-8859-8','hebrew'],iso8859_9:['iso-8859-9','latin5','L5'],iso8859_10:['iso-8859-10','latin6','L6'],iso8859_11:['iso-8859-11','thai'],iso8859_13:['iso-8859-13','latin7','L7'],iso8859_14:['iso-8859-14','latin8','L8'],iso8859_15:['iso-8859-15','latin9','L9'],iso8859_16:['iso-8859-16','latin10','L10'],johab:['cp1361','ms1361'],kz1048:['kz_1048','strk1048_2002','rk1048'],mac_cyrillic:['maccyrillic'],mac_greek:['macgreek'],mac_iceland:['maciceland'],mac_latin2:['maclatin2','maccentraleurope','mac_centeuro'],mac_roman:['macroman','macintosh'],mac_turkish:['macturkish'],ptcp154:['csptcp154','pt154','cp154','cyrillic-asian'],shift_jis:['csshiftjis','shiftjis','sjis','s_jis'],shift_jis_2004:['shiftjis2004','sjis_2004','sjis2004'],shift_jisx0213:['shiftjisx0213','sjisx0213','s_jisx0213'],utf_32:['U32','utf32'],utf_32_be:['UTF-32BE'],utf_32_le:['UTF-32LE'],utf_16:['U16','utf16'],utf_16_be:['UTF-16BE'],utf_16_le:['UTF-16LE'],utf_7:['U7','unicode-1-1-utf-7'],utf_8:['U8','UTF','utf8','cp65001'],mbcs:['ansi','dbcs'],bz2_codec:['bz2'],hex_codec:['hex'],quopri_codec:['quopri','quotedprintable','quoted_printable'],uu_codec:['uu'],zlib_codec:['zip','zlib'],rot_13:['rot13']}
var codecs_aliases={}
for(var name in aliases){for(var alias of aliases[name]){codecs_aliases[alias.toLowerCase().replace(/-/g,'_')]=name}}
function normalise(encoding){
var enc=encoding.toLowerCase()
.replace(/ /g,'_')
.replace(/-/g,'_')
if(codecs_aliases[enc]!==undefined){enc=codecs_aliases[enc]}
return enc}
function load_decoder(enc){
if(to_unicode[enc]===undefined){var mod=_b_.__import__("encodings."+enc)
if(mod[enc].getregentry){to_unicode[enc]=$B.$getattr(mod[enc].getregentry(),"decode")}}}
function load_encoder(enc){
if(from_unicode[enc]===undefined){var mod=_b_.__import__("encodings."+enc)
if(mod[enc].getregentry){from_unicode[enc]=$B.$getattr(mod[enc].getregentry(),"encode")}}}
var decode=$B.decode=function(obj,encoding,errors){var s="",b=obj.source,enc=normalise(encoding)
switch(enc){case "utf_8":
case "utf-8":
case "utf8":
case "U8":
case "UTF":
var pos=0,s="",err_info
while(pos < b.length){var byte=b[pos]
err_info=null
if(!(byte & 0x80)){
s+=String.fromCodePoint(byte)
pos++}else if((byte >> 5)==6){
if(b[pos+1]===undefined){err_info=[byte,pos,"end"]}else if((b[pos+1]& 0xc0)!=0x80){err_info=[byte,pos,"continuation"]}
if(err_info !==null){if(errors=="ignore"){pos++}else{throw _b_.UnicodeDecodeError.$factory(
"'utf-8' codec can't decode byte 0x"+
err_info[0].toString(16)+"  in position "+
err_info[1]+
(err_info[2]=="end" ? ": unexpected end of data" :
": invalid continuation byte"))}}else{var cp=byte & 0x1f
cp <<=6
cp+=b[pos+1]& 0x3f
s+=String.fromCodePoint(cp)
pos+=2}}else if((byte >> 4)==14){
if(b[pos+1]===undefined){err_info=[byte,pos,"end",pos+1]}else if((b[pos+1]& 0xc0)!=0x80){err_info=[byte,pos,"continuation",pos+2]}else if(b[pos+2]===undefined){err_info=[byte,pos+'-'+(pos+1),"end",pos+2]}else if((b[pos+2]& 0xc0)!=0x80){err_info=[byte,pos,"continuation",pos+3]}
if(err_info !==null){if(errors=="ignore"){pos=err_info[3]}else if(errors=="surrogateescape"){for(var i=pos;i < err_info[3];i++){s+=String.fromCodePoint(0xdc80+b[i]-0x80)}
pos=err_info[3]}else{throw _b_.UnicodeDecodeError.$factory(
"'utf-8' codec can't decode byte 0x"+
err_info[0].toString(16)+"  in position "+
err_info[1]+
(err_info[2]=="end" ? ": unexpected end of data" :
": invalid continuation byte"))}}else{var cp=byte & 0xf
cp=cp << 12
cp+=(b[pos+1]& 0x3f)<< 6
cp+=b[pos+2]& 0x3f
s+=String.fromCodePoint(cp)
pos+=3}}else if((byte >> 3)==30){
if(b[pos+1]===undefined){err_info=[byte,pos,"end",pos+1]}else if((b[pos+1]& 0xc0)!=0x80){err_info=[byte,pos,"continuation",pos+2]}else if(b[pos+2]===undefined){err_info=[byte,pos+'-'+(pos+1),"end",pos+2]}else if((b[pos+2]& 0xc0)!=0x80){err_info=[byte,pos,"continuation",pos+3]}else if(b[pos+3]===undefined){err_info=[byte,pos+'-'+(pos+1)+'-'+(pos+2),"end",pos+3]}else if((b[pos+2]& 0xc0)!=0x80){err_info=[byte,pos,"continuation",pos+3]}
if(err_info !==null){if(errors=="ignore"){pos=err_info[3]}else if(errors=="surrogateescape"){for(var i=pos;i < err_info[3];i++){s+=String.fromCodePoint(0xdc80+b[i]-0x80)}
pos=err_info[3]}else{throw _b_.UnicodeDecodeError.$factory(
"'utf-8' codec can't decode byte 0x"+
err_info[0].toString(16)+"  in position "+
err_info[1]+
(err_info[2]=="end" ? ": unexpected end of data" :
": invalid continuation byte"))}}else{var cp=byte & 0xf
cp=cp << 18
cp+=(b[pos+1]& 0x3f)<< 12
cp+=(b[pos+2]& 0x3f)<< 6
cp+=(b[pos+3]& 0x3f)
s+=String.fromCodePoint(cp)
pos+=4}}else{if(errors=="ignore"){pos++}else if(errors=="surrogateescape"){s+=String.fromCodePoint(0xdc80+b[pos]-0x80)
pos++}else{throw _b_.UnicodeDecodeError.$factory(
"'utf-8' codec can't decode byte 0x"+
byte.toString(16)+" in position "+pos+
": invalid start byte")}}}
return s
case "latin_1":
case "windows1252":
case "iso-8859-1":
case "iso8859-1":
case "8859":
case "cp819":
case "latin":
case "latin1":
case "L1":
b.forEach(function(item){s+=String.fromCharCode(item)})
break
case "unicode_escape":
if(obj.__class__===bytes ||obj.__class__===bytearray){obj=decode(obj,"latin-1","strict")}
return obj.replace(/\\n/g,"\n").
replace(/\\a/g,"\u0007").
replace(/\\b/g,"\b").
replace(/\\f/g,"\f").
replace(/\\t/g,"\t").
replace(/\\'/g,"'").
replace(/\\"/g,'"')
case "raw_unicode_escape":
if(obj.__class__===bytes ||obj.__class__===bytearray){obj=decode(obj,"latin-1","strict")}
return obj.replace(/\\u([a-fA-F0-9]{4})/g,function(mo){var cp=parseInt(mo.substr(2),16)
return String.fromCharCode(cp)})
case "ascii":
for(var i=0,len=b.length;i < len;i++){var cp=b[i]
if(cp <=127){s+=String.fromCharCode(cp)}else{if(errors=="ignore"){}else if(errors=="backslashreplace"){s+='\\x'+cp.toString(16)}else{var msg="'ascii' codec can't decode byte 0x"+
cp.toString(16)+" in position "+i+
": ordinal not in range(128)"
throw _b_.UnicodeDecodeError.$factory(msg)}}}
break
default:
try{load_decoder(enc)}catch(err){throw _b_.LookupError.$factory("unknown encoding: "+enc)}
var decoded=to_unicode[enc](obj)[0]
for(var i=0,len=decoded.length;i < len;i++){if(decoded.codePointAt(i)==0xfffe){throw _b_.UnicodeDecodeError.$factory("'charmap' codec "+
`can't decode byte ${_hex(b[i])} in position ${i}: `+
"character maps to <undefined>")}}
return decoded}
return s}
var encode=$B.encode=function(){var $=$B.args("encode",3,{s:null,encoding:null,errors:null},["s","encoding","errors"],arguments,{encoding:"utf-8",errors:"strict"},null,null),s=$.s,encoding=$.encoding,errors=$.errors
var t=[],pos=0,enc=normalise(encoding)
switch(enc){case "utf-8":
case "utf_8":
case "utf8":
for(var i=0,len=s.length;i < len;i++){var cp=s.charCodeAt(i)
if(cp <=0x7f){t.push(cp)}else if(cp <=0x7ff){t.push(0xc0+(cp >> 6),0x80+(cp & 0x3f))}else if(cp <=0xffff){t.push(0xe0+(cp >> 12),0x80+((cp & 0xfff)>> 6),0x80+(cp & 0x3f))}else{console.log("4 bytes")}}
break
case "latin":
case "latin1":
case "latin-1":
case "latin_1":
case "L1":
case "iso8859_1":
case "iso_8859_1":
case "8859":
case "cp819":
case "windows1252":
for(var i=0,len=s.length;i < len;i++){var cp=s.charCodeAt(i)
if(cp <=255){t[pos++]=cp}else if(errors !="ignore"){$UnicodeEncodeError(encoding,i)}}
break
case "ascii":
for(var i=0,len=_b_.str.__len__(s);i < len;i++){var cp=s.charCodeAt(i),
char=_b_.str.__getitem__(s,i)
if(cp <=127){t[pos++]=cp}else if(errors=="backslashreplace"){var hex=_b_.hex(_b_.ord(char))
if(hex.length < 5){hex='\\x'+'0'.repeat(4-hex.length)+hex.substr(2)}else if(hex.length < 7){hex='\\u'+'0'.repeat(6-hex.length)+hex.substr(2)}else{hex='\\U'+'0'.repeat(10-hex.length)+hex.substr(2)}
for(var char of hex){t[pos++]=char.charCodeAt(0)}}else if(errors !=='ignore'){$UnicodeEncodeError(encoding,i)}}
break
case "raw_unicode_escape":
for(var i=0,len=s.length;i < len;i++){var cp=s.charCodeAt(i)
if(cp < 256){t[pos++]=cp}else{var us=cp.toString(16)
if(us.length % 2){us="0"+us}
us="\\u"+us
for(var j=0;j < us.length;j++){t[pos++]=us.charCodeAt(j)}}}
break
default:
try{load_encoder(enc)}catch(err){throw _b_.LookupError.$factory("unknown encoding: "+encoding)}
return from_unicode[enc](s)[0]}
return fast_bytes(t)}
function fast_bytes(t){return{
__class__:_b_.bytes,source:t}}
bytes.$factory=function(source,encoding,errors){return bytes.__new__.bind(null,bytes).apply(null,arguments)}
bytes.__class__=_b_.type
bytes.$is_class=true
$B.set_func_names(bytes,"builtins")
bytes.fromhex=_b_.classmethod.$factory(bytes.fromhex)
for(var attr in bytes){if(bytearray[attr]===undefined && typeof bytes[attr]=="function"){bytearray[attr]=(function(_attr){return function(){return bytes[_attr].apply(null,arguments)}})(attr)}}
$B.set_func_names(bytearray,"builtins")
bytearray.fromhex=bytes.fromhex
_b_.bytes=bytes
_b_.bytearray=bytearray})(__BRYTHON__)
;
;(function($B){var _b_=$B.builtins,object=_b_.object,$N=_b_.None
function create_type(obj){return $B.get_class(obj).$factory()}
function make_new_set(type){var res={__class__:type,$store:Object.create(null),$version:0,$used:0}
res[Symbol.iterator]=function*(){var version=res.$version
for(var item of set_iter(res)){yield item
if(res.$version !=version){throw _b_.RuntimeError.$factory(
'Set changed size during iteration')}}}
return res}
function make_new_set_base_type(so){return $B.$isinstance(so,set)?
set.$factory():
frozenset.$factory()}
function set_hash(item){return $B.$hash(item)}
function set_add(so,item,hash){hash=hash===undefined ? $B.$hash(item):hash
if(set_contains(so,item,hash)){return}else{so.$store[hash]=so.$store[hash]||[]
so.$store[hash].push(item)
so.$used++
so.$version++}}
function set_contains(so,key,hash){return !! set_lookkey(so,key,hash)}
function set_copy(obj){var res=make_new_set_base_type(obj)
for(var hash in obj.$store){res.$store[hash]=obj.$store[hash].slice()}
res.$used=obj.$used
return res}
var set=$B.make_class('set')
set.$native=true
function set_copy_and_difference(so,other){var result=set_copy(so)
set_difference_update(result,other)
return result}
function set_difference(so,other){var other_size,rv,other_is_dict
if($B.$isinstance(other,[set,frozenset])){other_size=set.__len__(other)}else if($B.$isinstance(other,_b_.dict)){other_size=_b_.dict.__len__(other)
other_is_dict=true}else{return set_copy_and_difference(so,other)}
if(set.__len__(so)>> 2 > other_size){return set_copy_and_difference(so,other);}
var result=make_new_set()
if(other_is_dict){for(var entry of set_iter_with_hash(so)){if(! _b_.dict.$lookup_by_key(other,entry.item,entry.hash).found){set_add(result,entry.item,entry.hash)}}
return result}
for(var entry of set_iter_with_hash(so)){if(! set_contains(other,entry.item,entry.hash)){set_add(result,entry.item,entry.hash)}}
result.__class__=so.__class__
return result}
function set_difference_update(so,other){if(so===other){return set.clear(so);}
if($B.$isinstance(other,[set,frozenset])){for(var entry of set_iter_with_hash(other)){set_discard_entry(so,entry.item,entry.hash)}}else if($B.$isinstance(other,_b_.dict)){for(var entry of _b_.dict.$iter_items_with_hash(other)){set_discard_entry(so,entry.key,entry.hash)}}else{var iterator=$B.make_js_iterator(other)
for(var key of iterator){set_discard_key(so,key)}}}
const DISCARD_NOTFOUND=0,DISCARD_FOUND=1
function set_discard_entry(so,key,hash){var entry=set_lookkey(so,key,hash)
if(! entry){return DISCARD_NOTFOUND}
if(so.$store[entry.hash]!==undefined){
set_remove(so,entry.hash,entry.index)}}
function set_discard_key(so,key){return set_discard_entry(so,key);}
function*set_iter(so){var ordered_keys=Object.keys(so.$store).sort()
for(var hash of ordered_keys){if(so.$store[hash]!==undefined){for(var item of so.$store[hash]){yield item}}}}
function*set_iter_with_hash(so){for(var hash in so.$store){if(so.$store[hash]!==undefined){for(var item of so.$store[hash]){yield{item,hash}}}}}
function set_remove(so,hash,index){so.$store[hash].splice(index,1)
if(so.$store[hash].length==0){delete so.$store[hash]}
so.$used--}
function set_intersection(so,other){
if(so===other){return set_copy(so)}
var result=make_new_set_base_type(so),iterator
if($B.$isinstance(other,[set,frozenset])){if(other.$used > so.$used){var tmp=so
so=other
other=tmp}
for(var entry of set_iter_with_hash(other)){if(set_contains(so,entry.item,entry.hash)){set_add(result,entry.item,entry.hash)}}}else if($B.$isinstance(other,_b_.dict)){for(var entry of _b_.dict.$iter_items_with_hash(other)){if(set_contains(so,entry.key,entry.hash)){set_add(result,entry.key,entry.hash)}}}else{var iterator=$B.make_js_iterator(other)
for(var other_item of iterator){var test=set_contains(so,other_item)
if(test){set_add(result,other_item)}}}
return result}
function set_intersection_multi(so,args){var result=set_copy(so)
if(args.length==0){return result}
for(var other of args){result=set_intersection(result,other)}
return result;}
function set_lookkey(so,key,hash){
if(hash===undefined){try{hash=$B.$hash(key)}catch(err){if($B.$isinstance(key,set)){hash=$B.$hash(frozenset.$factory(key))}else{throw err}}}
var items=so.$store[hash]
if(items===undefined){return false}
for(var index=0,len=so.$store[hash].length;index < len;index++){if($B.is_or_equals(key,items[index])){return{hash,index}}}
return false}
function set_swap_bodies(a,b){var temp=set_copy(a)
set.clear(a)
a.$used=b.$used
a.$store=b.$store
b.$used=temp.$used
b.$store=temp.$store}
function set_symmetric_difference_update(so,other){var otherset,key,pos=0,hash,entry,rv
if(so==other){return set.clear(so)}
if($B.$isinstance(other,_b_.dict)){for(var entry of _b_.dict.$iter_items_with_hash(other)){rv=set_discard_entry(so,entry.key,entry.hash)
if(rv==DISCARD_NOTFOUND){set_add(so,entry.key,entry.hash)}}}else if($B.$isinstance(other,[set,frozenset])){for(var entry of set_iter_with_hash(other)){rv=set_discard_entry(so,entry.item,entry.hash)
if(rv==DISCARD_NOTFOUND){set_add(so,entry.item,entry.hash)}}}else{return set_symmetric_difference_update(so,set.$factory(other))}
return _b_.None}
set.__and__=function(self,other){if(! $B.$isinstance(other,[set,frozenset])){return _b_.NotImplemented}
return set_intersection(self,other)}
set.__class_getitem__=function(cls,item){
if(! Array.isArray(item)){item=[item]}
return $B.GenericAlias.$factory(cls,item)}
set.__contains__=function(self,item){return set_contains(self,item)}
set.__eq__=function(self,other){if($B.$isinstance(other,[_b_.set,_b_.frozenset])){if(self.$used !=other.$used){return false}
for(var hash in self.$store){if(other.$store[hash]===undefined){return false}
var in_self=self.$store[hash],in_other=other.$store[hash]
if(in_self===undefined ||in_other===undefined){
return false}
if(in_self.length !=in_other.length){return false}
if(in_self.length==1){if(! $B.is_or_equals(in_self[0],in_other[0])){return false}}else{in_self=in_self.slice()
in_other=in_other.slice()
for(var self_item of in_self){var found=false
for(var i=0,len=in_other.length;i < len;i++){if($B.is_or_equals(self_item,in_other[i])){in_other.splice(i,1)
found=true
break}}
if(! found){return false}}}}
return true}
return _b_.NotImplemented}
set.__format__=function(self,format_string){return set.__repr__(self)}
set.__ge__=function(self,other){if($B.$isinstance(other,[set,frozenset])){return set.__le__(other,self)}
return _b_.NotImplemented}
set.__gt__=function(self,other){if($B.$isinstance(other,[set,frozenset])){return set.__lt__(other,self)}
return _b_.NotImplemented}
set.__hash__=_b_.None
set.__init__=function(self,iterable){if(iterable===undefined){return _b_.None}
$B.check_nb_args_no_kw('set',2,arguments)
if(Object.keys(self.$store).length > 0){set.clear(self)}
set.update(self,iterable)
return _b_.None}
var set_iterator=$B.make_class('set_iterator',function(so){return{
__class__:set_iterator,so,it:set_iter(so),version:so.$version}}
)
set_iterator.__iter__=function(self){return self}
set_iterator.__length_hint__=function(self){return self.so.$used}
set_iterator.__next__=function(self){var res=self.it.next()
if(res.done){throw _b_.StopIteration.$factory()}
if(self.so.$version !=self.version){throw _b_.RuntimeError.$factory("Set changed size during iteration")}
return res.value}
set_iterator.__reduce_ex__=function(self,protocol){return $B.fast_tuple([_b_.iter,$B.fast_tuple([set_make_items(self.so)])])}
$B.set_func_names(set_iterator,'builtins')
set.__iter__=function(self){return set_iterator.$factory(self)}
function check_version(s,version){if(s.$version !=version){throw _b_.RuntimeError.$factory(
'Set changed size during iteration')}}
function set_make_items(so){
var items=[]
for(var hash in so.$store){items=items.concat(so.$store[hash])}
return items}
function make_hash_iter(obj,hash){let version=obj.$version,hashes=obj.$hashes[hash],len=hashes.length,i=0
const iterator={*[Symbol.iterator](){while(i < len){var result=hashes[i]
i++
yield result
check_version(obj,version)}}}
return iterator}
set.__le__=function(self,other){
if($B.$isinstance(other,[set,frozenset])){return set.issubset(self,other)}
return _b_.NotImplemented}
set.__len__=function(self){return self.$used}
set.__lt__=function(self,other){if($B.$isinstance(other,[set,frozenset])){return set.__le__(self,other)&&
set.__len__(self)< set.__len__(other)}else{return _b_.NotImplemented}}
set.__mro__=[_b_.object]
set.__new__=function(cls,iterable){if(cls===undefined){throw _b_.TypeError.$factory("set.__new__(): not enough arguments")}
var self=make_new_set(cls)
if(iterable===undefined){return self}
if(cls===set){$B.check_nb_args_no_kw('__new__',2,arguments)}
return self}
set.__or__=function(self,other){if($B.$isinstance(other,[set,frozenset])){return set.union(self,other)}
return _b_.NotImplemented}
set.__rand__=function(self,other){
return set.__and__(self,other)}
set.__reduce__=function(self){return $B.fast_tuple([self.__class__,$B.fast_tuple([set_make_items(self)]),_b_.None])}
set.__reduce_ex__=function(self,protocol){return set.__reduce__(self)}
set.__repr__=function(self){$B.builtins_repr_check(set,arguments)
return set_repr(self)}
function set_repr(self){
klass_name=$B.class_name(self)
if(self.$used===0){return klass_name+"()"}
var head=klass_name+"({",tail="})"
if(head=="set({"){head="{";tail="}"}
var res=[]
if($B.repr.enter(self)){return klass_name+"(...)"}
for(var item of set_iter(self)){var r=_b_.repr(item)
if(r===self ||r===item){res.push("{...}")}
else{res.push(r)}}
res=res.join(", ")
$B.repr.leave(self)
return head+res+tail}
set.__ror__=function(self,other){
return set.__or__(self,other)}
set.__rsub__=function(self,other){
return set.__sub__(self,other)}
set.__rxor__=function(self,other){
return set.__xor__(self,other)}
set.__sub__=function(self,other,accept_iter){
if(! $B.$isinstance(other,[set,frozenset])){return _b_.NotImplemented}
return set_difference(self,other)}
set.__xor__=function(self,other,accept_iter){
if(! $B.$isinstance(other,[set,frozenset])){return _b_.NotImplemented}
var res=make_new_set()
for(var entry of set_iter_with_hash(self)){if(! set_contains(other,entry.item,entry.hash)){set_add(res,entry.item,entry.hash)}}
for(var entry of set_iter_with_hash(other)){if(! set_contains(self,entry.item,entry.hash)){set_add(res,entry.item,entry.hash)}}
res.__class__=self.__class__
return res}
$B.make_rmethods(set)
set.add=function(){var $=$B.args("add",2,{self:null,item:null},["self","item"],arguments,{},null,null),self=$.self,item=$.item
set_add(self,item)
return _b_.None}
set.clear=function(){var $=$B.args("clear",1,{self:null},["self"],arguments,{},null,null)
$.self.$used=0
$.self.$store=Object.create(null)
$.self.$version++
return $N}
set.copy=function(self){$B.check_nb_args_no_kw('copy',1,arguments)
return set_copy(self)}
set.difference_update=function(self){var $=$B.args("difference_update",1,{self:null},["self"],arguments,{},"args",null)
for(var arg of $.args){set_difference_update(self,arg)}
self.$version++
return _b_.None}
set.discard=function(){var $=$B.args("discard",2,{self:null,item:null},["self","item"],arguments,{},null,null)
var result=set_discard_entry($.self,$.item)
if(result !=DISCARD_NOTFOUND){self.$version++}
return _b_.None}
set.intersection_update=function(){
var $=$B.args("intersection_update",1,{self:null},["self"],arguments,{},"args",null),self=$.self,args=$.args
var temp=set_intersection_multi(self,args)
set_swap_bodies(self,temp)
self.$version++
return _b_.None}
set.isdisjoint=function(){
var $=$B.args("isdisjoint",2,{self:null,other:null},["self","other"],arguments,{},null,null),self=$.self,other=$.other
var intersection=set_intersection(self,other)
return intersection.$used==0}
set.pop=function(self){for(var hash in self.$store){}
if(hash===undefined){throw _b_.KeyError.$factory('pop from an empty set')}
var item
item=self.$store[hash].pop()
if(self.$store[hash].length==0){delete self.$store[hash]}
self.$used--
self.$version++
return item}
set.remove=function(self,item){
var $=$B.args("remove",2,{self:null,item:null},["self","item"],arguments,{},null,null),self=$.self,item=$.item
var result=set_discard_entry(self,item)
if(result==DISCARD_NOTFOUND){throw _b_.KeyError.$factory(item)}
self.$version++
return _b_.None}
set.symmetric_difference_update=function(self,s){
var $=$B.args("symmetric_difference_update",2,{self:null,s:null},["self","s"],arguments,{},null,null),self=$.self,s=$.s
return set_symmetric_difference_update(self,s)}
set.update=function(self){
var $=$B.args("update",1,{self:null},["self"],arguments,{},"args",null)
for(var iterable of $.args){if(Array.isArray(iterable)){for(var i=0;i < iterable.length;i++){set_add(self,iterable[i])}}else if($B.$isinstance(iterable,[set,frozenset])){for(var entry of set_iter_with_hash(iterable)){set_add(self,entry.item,entry.hash)}}else if($B.$isinstance(iterable,_b_.dict)){for(var entry of _b_.dict.$iter_items_with_hash(iterable)){set_add(self,entry.key,entry.hash)}}else{var iterator=$B.make_js_iterator(iterable)
for(var item of iterator){set_add(self,item)}}}
self.$version++
return _b_.None}
set.difference=function(){var $=$B.args("difference",1,{self:null},["self"],arguments,{},"args",null)
if($.args.length==0){return set.copy($.self)}
var res=set_copy($.self)
for(var arg of $.args){if($B.$isinstance(arg,[set,frozenset])){for(var entry of set_iter_with_hash(arg)){set_discard_entry(res,entry.item,entry.hash)}}else{var other=set.$factory(arg)
res=set.difference(res,other)}}
return res}
set.intersection=function(){var $=$B.args("difference",1,{self:null},["self"],arguments,{},"args",null)
if($.args.length==0){return set.copy($.self)}
return set_intersection_multi($.self,$.args)}
set.symmetric_difference=function(self,other){
var $=$B.args("symmetric_difference",2,{self:null,other:null},["self","other"],arguments,{},null,null)
var res=set_copy(self)
set_symmetric_difference_update(res,other)
return res}
set.union=function(self){var $=$B.args("union",1,{self:null},["self"],arguments,{},"args",null)
var res=set_copy($.self)
if($.args.length==0){return res}
for(var arg of $.args){if($B.$isinstance(arg,[set,frozenset])){for(var entry of set_iter_with_hash(arg)){set_add(res,entry.item,entry.hash)}}else if(arg.__class__===_b_.dict){
for(var entry of _b_.dict.$iter_items_with_hash(arg)){set_add(res,entry.key,entry.hash)}}else{var other=set.$factory(arg)
res=set.union(res,other)}}
return res}
set.issubset=function(){
var $=$B.args("issubset",2,{self:null,other:null},["self","other"],arguments,{},"args",null),self=$.self,other=$.other
if($B.$isinstance(other,[set,frozenset])){if(set.__len__(self)> set.__len__(other)){return false}
for(var entry of set_iter_with_hash(self)){if(! set_lookkey(other,entry.item,entry.hash)){return false}}
return true}else if($B.$isinstance(other,_b_.dict)){for(var entry of _b_.dict.$iter_items_with_hash(self)){if(! set_lookkey(other,entry.key,entry.hash)){return false}}
return true}else{var member_func=$B.member_func(other)
for(var entry of set_iter_with_hash(self)){if(! member_func(entry.item)){return false}}
return true}}
set.issuperset=function(){
var $=$B.args("issuperset",2,{self:null,other:null},["self","other"],arguments,{},"args",null),self=$.self,other=$.other
if($B.$isinstance(other,[set,frozenset])){return set.issubset(other,self)}else{return set.issubset(set.$factory(other),self)}}
set.__iand__=function(self,other){if(! $B.$isinstance(other,[set,frozenset])){return _b_.NotImplemented}
set.intersection_update(self,other)
return self}
set.__isub__=function(self,other){if(! $B.$isinstance(other,[set,frozenset])){return _b_.NotImplemented}
set_difference_update(self,other)
return self}
set.__ixor__=function(self,other){if(! $B.$isinstance(other,[set,frozenset])){return _b_.NotImplemented}
set.symmetric_difference_update(self,other)
return self}
set.__ior__=function(self,other){if(! $B.$isinstance(other,[set,frozenset])){return _b_.NotImplemented}
set.update(self,other)
return self}
set.$literal=function(items){var res=make_new_set(set)
for(var item of items){if(item.constant){set_add(res,item.constant[0],item.constant[1])}else if(item.starred){for(var item of $B.make_js_iterator(item.starred)){set_add(res,item)}}else{set_add(res,item.item)}}
return res}
set.$factory=function(){var args=[set].concat(Array.from(arguments)),self=set.__new__.apply(null,args)
set.__init__(self,...arguments)
return self}
$B.set_func_names(set,"builtins")
set.__class_getitem__=_b_.classmethod.$factory(set.__class_getitem__)
var frozenset=$B.make_class('frozenset')
frozenset.$native=true
for(var attr in set){switch(attr){case "add":
case "clear":
case "discard":
case "pop":
case "remove":
case "update":
break
default:
if(frozenset[attr]==undefined){if(typeof set[attr]=="function"){frozenset[attr]=(function(x){return function(){return set[x].apply(null,arguments)}})(attr)}else{frozenset[attr]=set[attr]}}}}
frozenset.__hash__=function(self){if(self===undefined){return frozenset.__hashvalue__ ||$B.$py_next_hash--}
if(self.__hashvalue__ !==undefined){return self.__hashvalue__}
var _hash=1927868237
_hash*=self.$used
for(var entry of set_iter_with_hash(self)){var _h=entry.hash
_hash ^=((_h ^ 89869747)^(_h << 16))*3644798167}
_hash=_hash*69069+907133923
if(_hash==-1){_hash=590923713}
return self.__hashvalue__=_hash}
frozenset.__init__=function(){
return _b_.None}
frozenset.__new__=function(cls,iterable){if(cls===undefined){throw _b_.TypeError.$factory("frozenset.__new__(): not enough arguments")}
var self=make_new_set(cls)
if(iterable===undefined){return self}
$B.check_nb_args_no_kw('__new__',2,arguments)
if(cls===frozenset && iterable.__class__===frozenset){return iterable}
set.update(self,iterable)
return self}
frozenset.__repr__=function(self){$B.builtins_repr_check(frozenset,arguments)
return set_repr(self)}
frozenset.copy=function(self){if(self.__class__===frozenset){return self}
return set_copy(self)}
var singleton_id=Math.floor(Math.random()*Math.pow(2,40))
function empty_frozenset(){var res=frozenset.__new__(frozenset)
res.$id=singleton_id
return res}
frozenset.$factory=function(){var args=[frozenset].concat(Array.from(arguments)),self=frozenset.__new__.apply(null,args)
frozenset.__init__(self,...arguments)
return self}
$B.set_func_names(frozenset,"builtins")
_b_.set=set
_b_.frozenset=frozenset})(__BRYTHON__)
;

;(function($B){var _b_=$B.builtins,_window=self
var Module=$B.module=$B.make_class("module",function(name,doc,$package){return{
$tp_class:Module,__builtins__:_b_.__builtins__,__name__:name,__doc__:doc ||_b_.None,__package__:$package ||_b_.None}}
)
Module.__dir__=function(self){if(self.__dir__){return $B.$call(self.__dir__)()}
var res=[]
for(var key in self){if(key.startsWith('$')||key=='__class__'){continue}
res[res.length]=key}
return res.sort()}
Module.__new__=function(cls,name,doc,$package){return{
__class__:cls,__builtins__:_b_.__builtins__,__name__:name,__doc__:doc ||_b_.None,__package__:$package ||_b_.None}}
Module.__repr__=Module.__str__=function(self){var res="<module "+self.__name__
res+=self.__file__===undefined ? " (built-in)" :
' at '+self.__file__
return res+">"}
Module.__setattr__=function(self,attr,value){if(self.__name__=="__builtins__"){
$B.builtins[attr]=value}else{self[attr]=value}}
$B.set_func_names(Module,"builtins")
$B.make_import_paths=function(filename){
var elts=filename.split('/')
elts.pop()
var script_dir=elts.join('/'),path=[$B.brython_path+'Lib',$B.brython_path+'libs',script_dir,$B.brython_path+'Lib/site-packages']
var meta_path=[],path_hooks=[]
if($B.use_VFS){meta_path.push($B.finders.VFS)}
var static_stdlib_import=$B.get_option_from_filename('static_stdlib_import',filename)
if(static_stdlib_import !==false && $B.protocol !="file"){
meta_path.push($B.finders.stdlib_static)
if(path.length > 3){path.shift()
path.shift()}}
var pythonpath=$B.get_option_from_filename('pythonpath',filename)
if(pythonpath){
var ix=path.indexOf($B.script_dir)
if(ix===-1){console.log('bizarre',path,$B.script_dir)}else{path.splice(ix,1,...pythonpath)}}
if($B.protocol !=="file"){meta_path.push($B.finders.path)
path_hooks.push($B.url_hook)}
$B.import_info[filename]={meta_path,path_hooks,path}}
function $download_module(mod,url,$package){var xhr=new XMLHttpRequest(),fake_qs="?v="+(new Date().getTime()),res=null,mod_name=mod.__name__
var timer=_window.setTimeout(function(){xhr.abort()},5000)
if($B.get_option('cache')){xhr.open("GET",url,false)}else{xhr.open("GET",url+fake_qs,false)}
xhr.send()
if($B.$CORS){if(xhr.status==200 ||xhr.status==0){res=xhr.responseText}else{res=_b_.ModuleNotFoundError.$factory("No module named '"+
mod_name+"'")}}else{if(xhr.readyState==4){if(xhr.status==200){res=xhr.responseText
mod.$last_modified=
xhr.getResponseHeader("Last-Modified")}else{
console.info("Error "+xhr.status+
" means that Python module "+mod_name+
" was not found at url "+url)
res=_b_.ModuleNotFoundError.$factory("No module named '"+
mod_name+"'")}}}
_window.clearTimeout(timer)
if(res==null){throw _b_.ModuleNotFoundError.$factory("No module named '"+
mod_name+"' (res is null)")}
if(res.constructor===Error){throw res}
return res}
$B.$download_module=$download_module
function import_js(mod,path){try{var module_contents=$download_module(mod,path,undefined)}catch(err){return null}
run_js(module_contents,path,mod)
return true}
function run_js(module_contents,path,_module){
var module_id="$locals_"+_module.__name__.replace(/\./g,'_')
try{var $module=new Function(module_id,module_contents+
";\nreturn $module")(_module)}catch(err){console.log(err)
console.log(path,_module)
throw err}
try{$module}catch(err){console.log("no $module")
throw _b_.ImportError.$factory("name '$module' not defined in module")}
$module.__name__=_module.__name__
for(var attr in $module){if(typeof $module[attr]=="function"){$module[attr].$infos={__module__:_module.__name__,__name__:attr,__qualname__:attr}
$module[attr].$in_js_module=true}else if($B.$isinstance($module[attr],_b_.type)&&
! $module[attr].hasOwnProperty('__module__')){$module[attr].__module__=_module.__name__}}
if(_module !==undefined){
for(var attr in $module){_module[attr]=$module[attr]}
$module=_module
$module.__class__=Module }else{
$module.__class__=Module
$module.__name__=_module.__name__
$module.__repr__=$module.__str__=function(){if($B.builtin_module_names.indexOf(_module.name)>-1){return "<module '"+_module.__name__+"' (built-in)>"}
return "<module '"+_module.__name__+"' from "+path+" >"}
if(_module.name !="builtins"){
$module.__file__=path}}
$B.imported[_module.__name__]=$module
return true}
function show_ns(){var kk=Object.keys(_window)
for(var i=0,len=kk.length;i < len;i++){console.log(kk[i])
if(kk[i].charAt(0)=="$"){console.log(eval(kk[i]))}}
console.log("---")}
function run_py(module_contents,path,module,compiled){
$B.file_cache[path]=module_contents
$B.url2name[path]=module.__name__
var root,js,mod_name=module.__name__ 
if(! compiled){var $Node=$B.$Node,$NodeJSCtx=$B.$NodeJSCtx
var src={src:module_contents,filename:path,imported:true}
try{root=$B.py2js(src,module,module.__name__,$B.builtins_scope)}catch(err){err.$frame_obj=$B.frame_obj
if($B.get_option('debug',err)> 1){console.log('error in imported module',module)
console.log('stack',$B.make_frames_stack(err.$frame_obj))}
throw err}}
try{js=compiled ? module_contents :root.to_js()
if($B.get_option('debug')==10){console.log("code for module "+module.__name__)
console.log($B.format_indent(js,0))}
var src=js
js="var $module = (function(){\n"+js
var prefix='locals_'
js+='return '+prefix
js+=module.__name__.replace(/\./g,"_")+"})(__BRYTHON__)\n"+
"return $module"
var module_id=prefix+module.__name__.replace(/\./g,'_')
var mod=(new Function(module_id,js))(module)}catch(err){err.$frame_obj=err.$frame_obj ||$B.frame_obj
if($B.get_option('debug',err)> 2){console.log(err+" for module "+module.__name__)
console.log("module",module)
console.log(root)
if($B.get_option('debug',err)> 1){console.log($B.format_indent(js,0))}
for(var attr in err){console.log(attr,err[attr])}
console.log("message: "+err.$message)
console.log("filename: "+err.fileName)
console.log("linenum: "+err.lineNumber)
console.log(js.split('\n').slice(err.lineNumber-3,err.lineNumber+3).join('\n'))
console.log(err.stack)}
throw err}
try{
for(var attr in mod){module[attr]=mod[attr]}
module.__initializing__=false
$B.imported[module.__name__]=module
return{
content:src,name:mod_name,imports:Object.keys(root.imports).join(",")}}catch(err){console.log(""+err+" "+" for module "+module.__name__)
for(var attr in err){console.log(attr+" "+err[attr])}
if($B.get_option('debug')> 0){console.log("line info "+__BRYTHON__.line_info)}
throw err}}
$B.run_py=run_py 
$B.run_js=run_js
var ModuleSpec=$B.make_class("ModuleSpec",function(fields){fields.__class__=ModuleSpec
return fields}
)
ModuleSpec.__str__=ModuleSpec.__repr__=function(self){var res=`ModuleSpec(name='${self.name}', `+
`loader=${_b_.str.$factory(self.loader)}, `+
`origin='${self.origin}'`
if(self.submodule_search_locations !==_b_.None){res+=`, submodule_search_locations=`+
`${_b_.str.$factory(self.submodule_search_locations)}`}
return res+')'}
$B.set_func_names(ModuleSpec,"builtins")
function parent_package(mod_name){
var parts=mod_name.split(".")
parts.pop()
return parts.join(".")}
var VFSFinder=$B.make_class("VFSFinder",function(){return{
__class__:VFSFinder}}
)
VFSFinder.find_spec=function(cls,fullname,path){var stored,is_package,timestamp
if(!$B.use_VFS){return _b_.None}
stored=$B.VFS[fullname]
if(stored===undefined){return _b_.None}
is_package=stored[3]||false
timestamp=stored.timestamp
if(stored){var is_builtin=$B.builtin_module_names.indexOf(fullname)>-1
return ModuleSpec.$factory({name :fullname,loader:VFSLoader.$factory(),
origin :is_builtin? "built-in" :"brython_stdlib",
submodule_search_locations:is_package?[]:_b_.None,loader_state:{stored:stored,timestamp:timestamp},
cached:_b_.None,parent:is_package? fullname :parent_package(fullname),has_location:_b_.False})}}
$B.set_func_names(VFSFinder,"<import>")
for(var method in VFSFinder){if(typeof VFSFinder[method]=="function"){VFSFinder[method]=_b_.classmethod.$factory(
VFSFinder[method])}}
VFSLoader=$B.make_class("VFSLoader",function(){return{
__class__:VFSLoader}}
)
VFSLoader.create_module=function(self,spec){
return _b_.None}
VFSLoader.exec_module=function(self,modobj){
var stored=modobj.__spec__.loader_state.stored,timestamp=modobj.__spec__.loader_state.timestamp
var ext=stored[0],module_contents=stored[1],imports=stored[2]
modobj.$is_package=stored[3]||false
var path="VFS."+modobj.__name__
path+=modobj.$is_package ? "/__init__.py" :ext
modobj.__file__=path
$B.file_cache[modobj.__file__]=$B.VFS[modobj.__name__][1]
$B.url2name[modobj.__file__]=modobj.__name__
if(ext=='.js'){run_js(module_contents,modobj.__path__,modobj)}else if($B.precompiled.hasOwnProperty(modobj.__name__)){if($B.get_option('debug')> 1){console.info("load",modobj.__name__,"from precompiled")}
var parts=modobj.__name__.split(".")
for(var i=0;i < parts.length;i++){var parent=parts.slice(0,i+1).join(".")
if($B.imported.hasOwnProperty(parent)&&
$B.imported[parent].__initialized__){continue}
var mod_js=$B.precompiled[parent],is_package=modobj.$is_package
if(mod_js===undefined){
continue}
if(Array.isArray(mod_js)){mod_js=mod_js[0]}
var mod=$B.imported[parent]=Module.$factory(parent,undefined,is_package)
mod.__initialized__=true
mod.__spec__=modobj.__spec__
if(is_package){mod.__path__="<stdlib>"
mod.__package__=parent
mod.$is_package=true}else{var elts=parent.split(".")
elts.pop()
mod.__package__=elts.join(".")}
mod.__file__=path
try{var parent_id=parent.replace(/\./g,"_"),prefix='locals_'
mod_js+="return "+prefix+parent_id
var $module=new Function(prefix+parent_id,mod_js)(
mod)}catch(err){if($B.get_option('debug')> 1){console.log('error in module',mod)
console.log(err)
for(var k in err){console.log(k,err[k])}
console.log(Object.keys($B.imported))
console.log(modobj,"mod_js",mod_js)}
throw err}
for(var attr in $module){mod[attr]=$module[attr]}
$module.__file__=path
if(i > 0){
$B.builtins.setattr(
$B.imported[parts.slice(0,i).join(".")],parts[i],$module)}}
return $module}else{var mod_name=modobj.__name__
if($B.get_option('debug')> 1){console.log("run Python code from VFS",mod_name)}
var record=run_py(module_contents,modobj.__file__,modobj)
record.imports=imports.join(',')
record.is_package=modobj.$is_package
record.timestamp=$B.timestamp
record.source_ts=timestamp
$B.precompiled[mod_name]=record.is_package ?[record.content]:
record.content
var elts=mod_name.split(".")
if(elts.length > 1){elts.pop()}
if($B.$options.indexedDB && $B.indexedDB &&
$B.idb_name){
var idb_cx=indexedDB.open($B.idb_name)
idb_cx.onsuccess=function(evt){var db=evt.target.result,tx=db.transaction("modules","readwrite"),store=tx.objectStore("modules"),cursor=store.openCursor(),request=store.put(record)
request.onsuccess=function(){if($B.get_option('debug')> 1){console.info(modobj.__name__,"stored in db")}}
request.onerror=function(){console.info("could not store "+modobj.__name__)}}}}}
$B.set_func_names(VFSLoader,"builtins")
var finder_cpython={__class__:_b_.type,__mro__:[_b_.object],__qualname__:'CPythonFinder',$infos:{__module__:"builtins",__name__:"CPythonFinder"},create_module :function(cls,spec){
return _b_.None},exec_module :function(cls,modobj){console.log("exec PYthon module",modobj)
var loader_state=modobj.__spec__.loader_state
var content=loader_state.content
delete modobj.__spec__["loader_state"]
modobj.$is_package=loader_state.is_package
modobj.__file__=loader_state.__file__
$B.file_cache[modobj.__file__]=content
$B.url2file[modobj.__file__]=modobj.__name__
var mod_name=modobj.__name__
if($B.get_option('debug')> 1){console.log("run Python code from CPython",mod_name)}
run_py(content,modobj.__path__,modobj)},find_module:function(cls,name,path){return{
__class__:Loader,load_module:function(name,path){var spec=cls.find_spec(cls,name,path)
var mod=Module.$factory(name)
$B.imported[name]=mod
mod.__spec__=spec
cls.exec_module(cls,mod)}}},find_spec :function(cls,fullname,path){console.log("finder cpython",fullname)
var xhr=new XMLHttpRequest(),url="/cpython_import?module="+fullname,result
xhr.open("GET",url,false)
xhr.onreadystatechange=function(){if(this.readyState==4 && this.status==200){var data=JSON.parse(this.responseText)
result=ModuleSpec.$factory({name :fullname,loader:cls,
origin :"CPython",
submodule_search_locations:data.is_package?[]:_b_.None,loader_state:{content:data.content},
cached:_b_.None,parent:data.is_package? fullname :parent_package(fullname),has_location:_b_.False})}}
xhr.send()
return result}}
$B.set_func_names(finder_cpython,"<import>")
for(var method in finder_cpython){if(typeof finder_cpython[method]=="function"){finder_cpython[method]=_b_.classmethod.$factory(
finder_cpython[method])}}
finder_cpython.$factory=function(){return{__class__:finder_cpython}}
var StdlibStaticFinder=$B.make_class("StdlibStaticFinder",function(){return{
__class__:StdlibStaticFinder}}
)
StdlibStaticFinder.find_spec=function(self,fullname,path){
if($B.stdlib && $B.get_option('static_stdlib_import')){var address=$B.stdlib[fullname]
if(address===undefined){var elts=fullname.split(".")
if(elts.length > 1){elts.pop()
var $package=$B.stdlib[elts.join(".")]
if($package && $package[1]){address=["py"]}}}
if(address !==undefined){var ext=address[0],is_pkg=address[1]!==undefined,path=$B.brython_path+
((ext=="py")? "Lib/" :"libs/")+
fullname.replace(/\./g,"/"),metadata={ext:ext,is_package:is_pkg,path:path+(is_pkg? "/__init__.py" :
((ext=="py")? ".py" :".js")),address:address},_module=Module.$factory(fullname)
metadata.code=$download_module(_module,metadata.path)
var res=ModuleSpec.$factory({name :fullname,loader:PathLoader.$factory(),
origin :metadata.path,submodule_search_locations:is_pkg?[path]:_b_.None,loader_state:metadata,
cached:_b_.None,parent:is_pkg ? fullname :parent_package(fullname),has_location:_b_.True})
return res}}
return _b_.None}
$B.set_func_names(StdlibStaticFinder,"<import>")
for(var method in StdlibStaticFinder){if(typeof StdlibStaticFinder[method]=="function"){StdlibStaticFinder[method]=_b_.classmethod.$factory(
StdlibStaticFinder[method])}}
StdlibStaticFinder.$factory=function(){return{__class__:StdlibStaticFinder}}
var PathFinder=$B.make_class("PathFinder",function(){return{
__class__:PathFinder}}
)
PathFinder.find_spec=function(cls,fullname,path){if($B.VFS && $B.VFS[fullname]){
return _b_.None}
if($B.is_none(path)){
path=get_info('path')}
for(var i=0,li=path.length;i < li;++i){var path_entry=path[i]
if(path_entry[path_entry.length-1]!="/"){path_entry+="/"}
var finder=$B.path_importer_cache[path_entry]
if(finder===undefined){
var path_hooks=get_info('path_hooks')
for(var j=0,lj=path_hooks.length;j < lj;++j){var hook=path_hooks[j]
try{finder=$B.$call(hook)(path_entry)
$B.path_importer_cache[path_entry]=finder
break}catch(e){if(e.__class__ !==_b_.ImportError){throw e}}}}
if($B.is_none(finder)){continue}
var find_spec=$B.$getattr(finder,"find_spec"),spec=$B.$call(find_spec)(fullname)
if(!$B.is_none(spec)){return spec}}
return _b_.None}
$B.set_func_names(PathFinder,"<import>")
for(var method in PathFinder){if(typeof PathFinder[method]=="function"){PathFinder[method]=_b_.classmethod.$factory(
PathFinder[method])}}
var PathEntryFinder=$B.make_class("PathEntryFinder",function(path_entry,hint){return{
__class__:PathEntryFinder,path_entry:path_entry,hint:hint}}
)
PathEntryFinder.find_spec=function(self,fullname){
var loader_data={},notfound=true,hint=self.hint,base_path=self.path_entry+fullname.match(/[^.]+$/g)[0],modpaths=[],py_ext=$B.get_option('python_extension')
var tryall=hint===undefined
if(tryall ||hint=='py'){
modpaths=modpaths.concat([[base_path+py_ext,"py",false],[base_path+"/__init__"+py_ext,"py",true]])}
for(var j=0;notfound && j < modpaths.length;++j){try{var file_info=modpaths[j],module={__name__:fullname,$is_package:false}
loader_data.code=$download_module(module,file_info[0],undefined)
notfound=false
loader_data.ext=file_info[1]
loader_data.is_package=file_info[2]
if(hint===undefined){self.hint=file_info[1]
$B.path_importer_cache[self.path_entry]=self}
if(loader_data.is_package){
$B.path_importer_cache[base_path+'/']=
$B.$call(url_hook)(base_path+'/',self.hint)}
loader_data.path=file_info[0]}catch(err){if(err.__class__ !==_b_.ModuleNotFoundError){throw err}}}
if(!notfound){return ModuleSpec.$factory({name :fullname,loader:PathLoader.$factory(),origin :loader_data.path,
submodule_search_locations:loader_data.is_package?
[base_path]:_b_.None,loader_state:loader_data,
cached:_b_.None,parent:loader_data.is_package? fullname :
parent_package(fullname),has_location:_b_.True})}
return _b_.None}
$B.set_func_names(PathEntryFinder,"builtins")
var PathLoader=$B.make_class("PathLoader",function(){return{
__class__:PathLoader}}
)
PathLoader.create_module=function(self,spec){
return _b_.None}
PathLoader.exec_module=function(self,module){
var metadata=module.__spec__.loader_state
module.$is_package=metadata.is_package
if(metadata.ext=="py"){run_py(metadata.code,metadata.path,module)}else{run_js(metadata.code,metadata.path,module)}}
var url_hook=$B.url_hook=function(path_entry){
path_entry=path_entry.endsWith("/")? path_entry :path_entry+"/"
return PathEntryFinder.$factory(path_entry)}
function get_info(info){var filename=$B.get_filename(),import_info=$B.import_info[filename]
if(import_info===undefined && info=='meta_path'){$B.make_import_paths(filename)}
return $B.import_info[filename][info]}
function import_engine(mod_name,_path,from_stdlib){
var meta_path=get_info('meta_path').slice(),_sys_modules=$B.imported,_loader,spec
if(from_stdlib){
var path_ix=meta_path.indexOf($B.finders["path"])
if(path_ix >-1){meta_path.splice(path_ix,1)}}
for(var i=0,len=meta_path.length;i < len;i++){var _finder=meta_path[i],find_spec=$B.$getattr(_finder,"find_spec",_b_.None)
if(find_spec==_b_.None){
var find_module=$B.$getattr(_finder,"find_module",_b_.None)
if(find_module !==_b_.None){_loader=find_module(mod_name,_path)
if(_loader !==_b_.None){
var load_module=$B.$getattr(_loader,"load_module"),module=$B.$call(load_module)(mod_name)
_sys_modules[mod_name]=module
return module}}}else{spec=find_spec(mod_name,_path)
if(!$B.is_none(spec)){module=$B.imported[spec.name]
if(module !==undefined){
return _sys_modules[spec.name]=module}
_loader=$B.$getattr(spec,"loader",_b_.None)
break}}}
if(_loader===undefined){
message=mod_name
if($B.protocol=="file"){message+=" (warning: cannot import local files with protocol 'file')"}
var exc=_b_.ModuleNotFoundError.$factory(message)
exc.name=mod_name
throw exc}
if($B.is_none(module)){if(spec===_b_.None){throw _b_.ModuleNotFoundError.$factory(mod_name)}
var _spec_name=$B.$getattr(spec,"name")
if(!$B.is_none(_loader)){var create_module=$B.$getattr(_loader,"create_module",_b_.None)
if(!$B.is_none(create_module)){module=$B.$call(create_module)(spec)}}
if(module===undefined){throw _b_.ImportError.$factory(mod_name)}
if($B.is_none(module)){
module=$B.module.$factory(mod_name)
var mod_desc=$B.$getattr(spec,"origin")
if($B.$getattr(spec,"has_location")){mod_desc="from '"+mod_desc+"'"}else{mod_desc="("+mod_desc+")"}}}
module.__name__=_spec_name
module.__loader__=_loader
module.__package__=$B.$getattr(spec,"parent","")
module.__spec__=spec
var locs=$B.$getattr(spec,"submodule_search_locations")
if(module.$is_package=!$B.is_none(locs)){module.__path__=locs}
if($B.$getattr(spec,"has_location")){module.__file__=$B.$getattr(spec,"origin")}
var cached=$B.$getattr(spec,"cached")
if(! $B.is_none(cached)){module.__cached__=cached}
if($B.is_none(_loader)){if(!$B.is_none(locs)){_sys_modules[_spec_name]=module}else{throw _b_.ImportError.$factory(mod_name)}}else{var exec_module=$B.$getattr(_loader,"exec_module",_b_.None)
if($B.is_none(exec_module)){
module=$B.$getattr(_loader,"load_module")(_spec_name)}else{_sys_modules[_spec_name]=module
try{exec_module(module)}catch(e){delete _sys_modules[_spec_name]
throw e}}}
return _sys_modules[_spec_name]}
$B.path_importer_cache={}
function import_error(mod_name){var exc=_b_.ImportError.$factory(mod_name)
exc.name=mod_name
throw exc}
$B.$__import__=function(mod_name,globals,locals,fromlist,level){var $test=false 
if($test){console.log("__import__",mod_name,'fromlist',fromlist);alert()}
var from_stdlib=false
if(globals.$jsobj && globals.$jsobj.__file__){var file=globals.$jsobj.__file__
if((file.startsWith($B.brython_path+"Lib/")&&
! file.startsWith($B.brython_path+"Lib/site-packages/"))||
file.startsWith($B.brython_path+"libs/")||
file.startsWith("VFS.")){from_stdlib=true}}
var modobj=$B.imported[mod_name],parsed_name=mod_name.split('.'),has_from=fromlist.length > 0
if(modobj==_b_.None){
import_error(mod_name)}
if(modobj===undefined){
if($B.is_none(fromlist)){fromlist=[]}
for(var i=0,modsep="",_mod_name="",len=parsed_name.length-1,__path__=_b_.None;i <=len;++i){var _parent_name=_mod_name;
_mod_name+=modsep+parsed_name[i]
modsep="."
var modobj=$B.imported[_mod_name]
if($test){console.log("iter",i,_mod_name,"\nmodobj",modobj,"\n__path__",__path__,Array.isArray(__path__))
alert()}
if(modobj==_b_.None){
import_error(_mod_name)}else if(modobj===undefined){try{import_engine(_mod_name,__path__,from_stdlib)}catch(err){delete $B.imported[_mod_name]
throw err}
if($B.is_none($B.imported[_mod_name])){import_error(_mod_name)}else{
if(_parent_name){_b_.setattr($B.imported[_parent_name],parsed_name[i],$B.imported[_mod_name])}}}else if($B.imported[_parent_name]&&
$B.imported[_parent_name][parsed_name[i]]===undefined){
_b_.setattr($B.imported[_parent_name],parsed_name[i],$B.imported[_mod_name])}
if(i < len){try{__path__=$B.$getattr($B.imported[_mod_name],"__path__")}catch(e){
if(i==len-1 &&
$B.imported[_mod_name][parsed_name[len]]&&
$B.imported[_mod_name][parsed_name[len]].__class__===
$B.module){return $B.imported[_mod_name][parsed_name[len]]}
if(has_from){
import_error(mod_name)}else{
var exc=_b_.ModuleNotFoundError.$factory()
exc.msg="No module named '"+mod_name+"'; '"+
_mod_name+"' is not a package"
exc.args=$B.fast_tuple([exc.msg])
exc.name=mod_name
exc.path=_b_.None
throw exc}}}}}else{if($B.imported[parsed_name[0]]&&
parsed_name.length==2){try{if($B.imported[parsed_name[0]][parsed_name[1]]===undefined){$B.$setattr($B.imported[parsed_name[0]],parsed_name[1],modobj)}}catch(err){console.log("error",parsed_name,modobj)
throw err}}}
if(fromlist.length > 0){
return $B.imported[mod_name]}else{
var package=mod_name
while(parsed_name.length > 1){var module=parsed_name.pop(),package=parsed_name.join('.')
if($B.imported[package]===undefined){
$B.$import(package,globals,locals,[])
$B.imported[package][module]=$B.imported[mod_name]
mod_name=module}}
return $B.imported[package]}}
$B.$import=function(mod_name,fromlist,aliases,locals){
var test=false 
if(test){console.log('mod name',mod_name,'fromlist',fromlist)
alert()}
if(mod_name=='_frozen_importlib_external'){
var alias=aliases[mod_name]||mod_name
var imp=$B.$import_from("importlib",["_bootstrap_external"],{_bootstrap_external:alias},0,locals);
var _bootstrap=$B.imported.importlib._bootstrap,_bootstrap_external=$B.imported.importlib['_bootstrap_external']
_bootstrap_external._set_bootstrap_module(_bootstrap)
_bootstrap._bootstap_external=_bootstrap_external
var _frozen_importlib=$B.imported._frozen_importlib
if(_frozen_importlib){_frozen_importlib._bootstrap_external=_bootstrap_external}
return}
var level=0,frame=$B.frame_obj.frame,current_module=frame[2],parts=current_module.split('.')
while(mod_name.length > 0 && mod_name.startsWith('.')){level++
mod_name=mod_name.substr(1)
if(parts.length==0){throw _b_.ImportError.$factory("Parent module '' not loaded, "+
"cannot perform relative import")}
current_module=parts.join('.')
parts.pop()}
if(level > 0){mod_name=current_module+
(mod_name.length > 0 ? '.'+mod_name :'')}
var parts=mod_name.split(".")
if(mod_name[mod_name.length-1]=="."){parts.pop()}
var norm_parts=[],prefix=true
for(var i=0,len=parts.length;i < len;i++){var p=parts[i]
if(prefix && p==""){
elt=norm_parts.pop()
if(elt===undefined){throw _b_.ImportError.$factory("Parent module '' not loaded, "+
"cannot perform relative import")}}else{prefix=false;
norm_parts.push(p)}}
var mod_name=norm_parts.join(".")
fromlist=fromlist===undefined ?[]:fromlist
aliases=aliases===undefined ?{}:aliases
locals=locals===undefined ?{}:locals
if(test){console.log('step 2, mod_name',mod_name,'fromlist',fromlist)
alert()}
if($B.get_option('debug')==10){console.log("$import "+mod_name)
console.log("use VFS ? "+$B.use_VFS)
console.log("use static stdlib paths ? "+
$B.get_option('static_stdlib_import'))}
var current_frame=$B.frame_obj.frame,_globals=current_frame[3],__import__=_globals["__import__"],globals=$B.obj_dict(_globals)
if(__import__===undefined){
__import__=$B.$__import__}
var importer=typeof __import__=="function" ?
__import__ :
$B.$getattr(__import__,"__call__")
if(test){console.log('use importer',importer,'mod_name',mod_name,'fromlist',fromlist)
alert()}
var modobj=importer(mod_name,globals,undefined,fromlist,0)
if(test){console.log('step 3, mod_name',mod_name,'fromlist',fromlist)
console.log('modobj',modobj)
alert()}
if(! fromlist ||fromlist.length==0){
var alias=aliases[mod_name]
if(alias){locals[alias]=$B.imported[mod_name]}else{locals[norm_parts[0]]=modobj}}else{var __all__=fromlist,thunk={}
if(fromlist && fromlist[0]=="*"){if(test){console.log('import *',modobj)
alert()}
__all__=$B.$getattr(modobj,"__all__",thunk);
if(__all__ !==thunk){
aliases={}}}
if(__all__===thunk){
for(var attr in modobj){if(attr[0]!=="_"){locals[attr]=modobj[attr]}}}else{
for(var i=0,l=__all__.length;i < l;++i){var name=__all__[i]
var alias=aliases[name]||name
try{
locals[alias]=$B.$getattr(modobj,name)}catch($err1){if(! $B.is_exc($err1,[_b_.AttributeError])){throw $err1}
try{$B.$getattr(__import__,'__call__')(mod_name+'.'+name,globals,undefined,[],0)
locals[alias]=$B.$getattr(modobj,name)}catch($err3){
if(mod_name==="__future__"){
var exc=_b_.SyntaxError.$factory(
"future feature "+name+" is not defined")
throw exc}
var $frame=[mod_name,modobj,mod_name,modobj],suggestion=$B.offer_suggestions_for_name_error({name},$frame)
if($err3.$py_error){$err3.__class__=_b_.ImportError
$err3.args[0]=`cannot import name '${name}' `+
`from '${mod_name}' (${modobj.__file__})`
$err3.$suggestion=suggestion
throw $err3}
if($B.get_option('debug')> 1){console.log($err3)
console.log($B.frame_obj.frame)}
throw _b_.ImportError.$factory(
"cannot import name '"+name+"'")}}}}
return locals}}
$B.$import_from=function(module,names,aliases,level,locals){
var current_module_name=$B.frame_obj.frame[2],parts=current_module_name.split('.'),relative=level > 0
if(relative){
var current_module=$B.imported[parts.join('.')]
if(current_module===undefined){throw _b_.ImportError.$factory(
'attempted relative import with no known parent package')}
if(! current_module.$is_package){if(parts.length==1){throw _b_.ImportError.$factory(
'attempted relative import with no known parent package')}else{parts.pop()
current_module=$B.imported[parts.join('.')]}}
while(level > 0){var current_module=$B.imported[parts.join('.')]
if(! current_module.$is_package){throw _b_.ImportError.$factory(
'attempted relative import with no known parent package')}
level--
parts.pop()}
if(module){
var submodule=current_module.__name__+'.'+module
$B.$import(submodule,[],{},{})
current_module=$B.imported[submodule]}
if(names.length > 0 && names[0]=='*'){
for(var key in current_module){if(key.startsWith('$')||key.startsWith('_')){continue}
locals[key]=current_module[key]}}else{for(var name of names){var alias=aliases[name]||name
if(current_module[name]!==undefined){
locals[alias]=current_module[name]}else{
var sub_module=current_module.__name__+'.'+name
$B.$import(sub_module,[],{},{})
locals[alias]=$B.imported[sub_module]}}}}else{
$B.$import(module,names,aliases,locals)}}
$B.import_all=function(locals,module){
for(var attr in module){if('_$'.indexOf(attr.charAt(0))==-1){locals[attr]=module[attr]}}}
$B.$meta_path=[VFSFinder,StdlibStaticFinder,PathFinder]
$B.finders={VFS:VFSFinder,stdlib_static:StdlibStaticFinder,path:PathFinder,CPython:finder_cpython}
function optimize_import_for_path(path,filetype){if(path.slice(-1)!="/"){path=path+"/" }
var value=(filetype=='none')? _b_.None :
url_hook(path,filetype)
$B.path_importer_cache[path]=value}
var Loader={__class__:$B.$type,__mro__:[_b_.object],__name__ :"Loader"}
var _importlib_module={__class__ :Module,__name__ :"_importlib",Loader:Loader,VFSFinder:VFSFinder,StdlibStatic:StdlibStaticFinder,ImporterPath:PathFinder,UrlPathFinder:url_hook,optimize_import_for_path :optimize_import_for_path}
_importlib_module.__repr__=_importlib_module.__str__=function(){return "<module '_importlib' (built-in)>"}
$B.imported["_importlib"]=_importlib_module})(__BRYTHON__)
;
;(function($B){var _b_=$B.builtins
var unicode_tables=$B.unicode_tables
$B.has_surrogate=function(s){
for(var i=0;i < s.length;i++){code=s.charCodeAt(i)
if(code >=0xD800 && code <=0xDBFF){return true}}
return false}
var escape2cp={b:'\b',f:'\f',n:'\n',r:'\r',t:'\t',v:'\v'}
$B.surrogates=function(s){var s1='',escaped=false
for(var char of s){if(escaped){var echar=escape2cp[char]
if(echar !==undefined){s1+=echar}else{s1+='\\'+char}
escaped=false}else if(char=='\\'){escaped=true}else{s1+=char}}
var codepoints=[],surrogates=[],j=0
for(var i=0,len=s1.length;i < len;i++){var cp=s1.codePointAt(i)
if(cp >=0x10000){surrogates.push(j)
i++}
j++}
return surrogates}
$B.String=function(s){var srg=$B.surrogates(s)
return srg.length==0 ? s :$B.make_String(s,srg)}
$B.make_String=function(s,surrogates){if(! Array.isArray(surrogates)){throw Error('not list')}
var res=new String(s)
res.__class__=str
res.surrogates=surrogates
return res}
function pypos2jspos(s,pypos){
if(s.surrogates===undefined){return pypos}
var nb=0
while(s.surrogates[nb]< pypos){nb++}
return pypos+nb}
function jspos2pypos(s,jspos){
if(s.surrogates===undefined){return jspos}
var nb=0
while(s.surrogates[nb]+nb < jspos){nb++}
return jspos-nb}
function to_string(args){if(typeof args=='string'){return args}
if(Array.isArray(args)){for(var i=0,len=args.length;i < len;i++){args[i]=to_string(args[i])}
return args}else{if(args.__class__ && !(args instanceof String)){return args.$brython_value}else{return args}}}
var str={__class__:_b_.type,__dir__:_b_.object.__dir__,__qualname__:'str',$is_class:true,$native:true}
str.$to_string=to_string
function normalize_start_end($){var len
if(typeof $.self=="string"){len=$.self.length}else{len=str.__len__($.self)}
if($.start===null ||$.start===_b_.None){$.start=0}else if($.start < 0){$.start+=len
$.start=Math.max(0,$.start)}
if($.end===null ||$.end===_b_.None){$.end=len}else if($.end < 0){$.end+=len
$.end=Math.max(0,$.end)}
if(! $B.$isinstance($.start,_b_.int)||! $B.$isinstance($.end,_b_.int)){throw _b_.TypeError.$factory("slice indices must be integers "+
"or None or have an __index__ method")}
if($.self.surrogates){$.js_start=pypos2jspos($.self,$.start)
$.js_end=pypos2jspos($.self,$.end)}}
function reverse(s){
return s.split("").reverse().join("")}
function check_str(obj,prefix){if(obj instanceof String ||typeof obj=="string"){return}
if(! $B.$isinstance(obj,str)){throw _b_.TypeError.$factory((prefix ||'')+
"must be str, not "+$B.class_name(obj))}}
function to_chars(s){
s=to_string(s)
return Array.from(s)}
function to_codepoints(s){
if(s.codepoints){return s.codepoints}
var cps=[]
for(var i=0,len=s.length;i < len;i++){var code=s.charCodeAt(i)
if(code >=0xD800 && code <=0xDBFF){var v=0x10000
v+=(code & 0x03FF)<< 10
v+=(s.charCodeAt(i+1)& 0x03FF)
cps.push(v)
i++}else{cps.push(code)}}
return s.codepoints=cps}
str.__add__=function(_self,other){if(! $B.$isinstance(other,str)){try{return $B.$getattr(other,"__radd__")(_self)}catch(err){throw _b_.TypeError.$factory("Can't convert "+
$B.class_name(other)+" to str implicitly")}}
[_self,other]=to_string([_self,other])
var res=$B.String(_self+other)
return res}
str.__contains__=function(_self,item){if(! $B.$isinstance(item,str)){throw _b_.TypeError.$factory("'in <string>' requires "+
"string as left operand, not "+$B.class_name(item))}
[_self,item]=to_string([_self,item])
if(item.__class__===str ||$B.$isinstance(item,str)){var nbcar=item.length}else{var nbcar=_b_.len(item)}
if(nbcar==0){
return true}
var len=_self.length
if(len==0){return nbcar==0}
for(var i=0,len=_self.length;i < len;i++){if(_self.substr(i,nbcar)==item){return true}}
return false}
str.__delitem__=function(){throw _b_.TypeError.$factory("'str' object doesn't support item deletion")}
str.__dir__=_b_.object.__dir__
str.__eq__=function(_self,other){if($B.$isinstance(other,str)){[_self,other]=to_string([_self,other])
if(typeof _self=='string' && typeof other=='string'){return _self==other}
if(_self.length !=other.length){return false}
for(var i=0,len=_self.length;i < len;i++){if(_self[i]!=other[i]){return false}}
return true}
return _b_.NotImplemented}
function preformat(_self,fmt){if(fmt.empty){return _b_.str.$factory(_self)}
if(fmt.type && fmt.type !="s"){throw _b_.ValueError.$factory("Unknown format code '"+fmt.type+
"' for object of type 'str'")}
return _self}
str.__format__=function(_self,format_spec){[_self,format_spec]=to_string([_self,format_spec])
var fmt=new $B.parse_format_spec(format_spec,_self)
if(fmt.sign !==undefined){throw _b_.ValueError.$factory(
"Sign not allowed in string format specifier")}
if(fmt.precision){_self=_self.substr(0,fmt.precision)}
fmt.align=fmt.align ||"<"
return $B.format_width(preformat(_self,fmt),fmt)}
str.__getitem__=function(_self,arg){_self=to_string(_self)
if($B.$isinstance(arg,_b_.int)){var len=str.__len__(_self)
var pos=arg
if(arg < 0){pos+=len}
if(pos >=0 && pos < len){var jspos=pypos2jspos(_self,pos)
if(_self.codePointAt(jspos)>=0x10000){return $B.String(_self.substr(jspos,2))}else{return _self[jspos]}}
throw _b_.IndexError.$factory("string index out of range")}
if($B.$isinstance(arg,_b_.slice)){return _b_.str.$getitem_slice(_self,arg)}
if($B.$isinstance(arg,_b_.bool)){return _self.__getitem__(_b_.int.$factory(arg))}
throw _b_.TypeError.$factory("string indices must be integers")}
str.$getitem_slice=function(_self,slice){var len=str.__len__(_self),s=_b_.slice.$conv_for_seq(slice,len),start=pypos2jspos(_self,s.start),stop=pypos2jspos(_self,s.stop),step=s.step
var res="",i=null
if(step > 0){if(stop <=start){return ""}
for(var i=start;i < stop;i+=step){res+=_self[i]}}else{if(stop >=start){return ''}
for(var i=start;i > stop;i+=step){res+=_self[i]}}
return $B.String(res)}
var prefix=2,suffix=3,mask=(2**32-1)
str.$nb_str_hash_cache=0
function fnv(p){if(p.length==0){return 0}
var x=prefix
x=(x ^(p[0]<< 7))& mask
for(var i=0,len=p.length;i < len;i++){x=((1000003*x)^ p[i])& mask}
x=(x ^ p.length)& mask
x=(x ^ suffix)& mask
if(x==-1){x=-2}
return x}
str.$getnewargs=function(self){return $B.fast_tuple([to_string(self)])}
str.__getnewargs__=function(){return str.$getnewargs($B.single_arg('__getnewargs__','self',arguments))}
str.__hash__=function(_self){
var s=to_string(_self)
return s.split("").reduce(function(a,b){a=((a << 5)-a)+b.charCodeAt(0);
return a & a;},0)}
str.__init__=function(self,arg){
return _b_.None}
var str_iterator=$B.make_class("str_iterator",function(s){return{
__class__:str_iterator,it:s[Symbol.iterator]()}}
)
str_iterator.__iter__=function(_self){return _self}
str_iterator.__next__=function(_self){var res=_self.it.next()
if(res.done){throw _b_.StopIteration.$factory('')}
return res.value}
$B.set_func_names(str_iterator,'builtins')
str.__iter__=function(_self){return str_iterator.$factory(_self)}
str.__len__=function(_self){_self=to_string(_self)
if(_self.surrogates===undefined){return _self.length}
if(_self.len !==undefined){return _self.len}
var len=_self.len=_self.length-_self.surrogates.length
return len}
var kwarg_key=new RegExp("([^\\)]*)\\)")
var NotANumber=function(){this.name="NotANumber"}
var number_check=function(s,flags){if(! $B.$isinstance(s,[_b_.int,_b_.float])){var type=flags.conversion_type
throw _b_.TypeError.$factory(`%${type} format: a real number `+
`is required, not ${$B.class_name(s)}`)}}
var get_char_array=function(size,char){if(size <=0){return ""}
return new Array(size+1).join(char)}
var format_padding=function(s,flags,minus_one){var padding=flags.padding
if(! padding){
return s}
s=s.toString()
padding=parseInt(padding,10)
if(minus_one){
padding-=1}
if(! flags.left){return get_char_array(padding-s.length,flags.pad_char)+s}else{
return s+get_char_array(padding-s.length,flags.pad_char)}}
const max_precision=2**31-4,max_repeat=2**30-1
var format_int_precision=function(val,flags){var precision=flags.precision
if(! precision){return _b_.str.$factory(val)}
precision=parseInt(precision,10)
if(precision > max_precision){throw _b_.OverflowError.$factory('precision too large')}
var s
if(val.__class__===$B.long_int){s=$B.long_int.to_base(val,10)}else{s=val.toString()}
if(precision-s.length > max_repeat){throw _b_.OverflowError.$factory('precision too large')}
if(s[0]==="-"){return "-"+"0".repeat(Math.max(0,precision-s.length+1))+
s.slice(1)}
return "0".repeat(Math.max(0,precision-s.length))+s}
var format_float_precision=function(val,upper,flags,modifier){var precision=flags.precision
if(isFinite(val)){return modifier(val,precision,flags,upper)}
if(val===Infinity){val="inf"}else if(val===-Infinity){val="-inf"}else{val="nan"}
if(upper){return val.toUpperCase()}
return val}
var format_sign=function(val,flags){if(flags.sign){if(val >=0 ||isNaN(val)||val===Number.POSITIVE_INFINITY){return "+"}}else if(flags.space){if(val >=0 ||isNaN(val)){return " "}}
return ''}
var str_format=function(val,flags){
flags.pad_char=" " 
return format_padding(str.$factory(val),flags)}
var num_format=function(val,flags){number_check(val,flags)
if($B.$isinstance(val,_b_.float)){val=parseInt(val.value)}else if(! $B.$isinstance(val,_b_.int)){val=parseInt(val)}
var s=format_int_precision(val,flags)
if(flags.pad_char==="0"){if(val < 0){s=s.substring(1)
return "-"+format_padding(s,flags,true)}
var sign=format_sign(val,flags)
if(sign !==""){return sign+format_padding(s,flags,true)}}
return format_padding(format_sign(val,flags)+s,flags)}
var repr_format=function(val,flags){flags.pad_char=" " 
return format_padding(_b_.repr(val),flags)}
var ascii_format=function(val,flags,type){flags.pad_char=" " 
var ascii
if(type=='bytes'){var repr=_b_.repr(val)
ascii=_b_.str.encode(repr,'ascii','backslashreplace')
ascii=_b_.bytes.decode(ascii,'ascii')}else{ascii=_b_.ascii(val)}
return format_padding(ascii,flags)}
var _float_helper=function(val,flags){number_check(val,flags)
if(flags.precision===undefined){if(! flags.decimal_point){flags.precision=6}else{flags.precision=0}}else{flags.precision=parseInt(flags.precision,10)
validate_precision(flags.precision)}
return $B.$isinstance(val,_b_.int)? val :val.value}
var trailing_zeros=/(.*?)(0+)([eE].*)/,leading_zeros=/\.(0*)/,trailing_dot=/\.$/
var validate_precision=function(precision){
if(precision > 20){precision=20}}
function handle_special_values(value,upper){var special
if(isNaN(value)){special=upper ? "NAN" :"nan"}else if(value==Number.POSITIVE_INFINITY){special=upper ? "INF" :"inf"}else if(value==Number.NEGATIVE_INFINITY){special=upper ? "-INF" :"-inf"}
return special}
var floating_point_format=function(val,upper,flags){val=_float_helper(val,flags)
var special=handle_special_values(val,upper)
if(special){return format_padding(format_sign(val,flags)+special,flags)}
var p=flags.precision
if(p==0){p=1}
var exp_format=val.toExponential(p-1),e_index=exp_format.indexOf('e'),exp=parseInt(exp_format.substr(e_index+1)),res
function remove_zeros(v){if(flags.alternate){return v}
if(v.indexOf('.')>-1){while(v.endsWith('0')){v=v.substr(0,v.length-1)}
if(v.endsWith('.')){v=v.substr(0,v.length-1)}}
return v}
if(-4 <=exp && exp < p){
flags.precision=Math.max(0,p-1-exp)
res=floating_point_decimal_format(val,upper,flags)
res=remove_zeros(res)}else{
flags.precision=Math.max(0,p-1)
var delim=upper ? 'E' :'e',exp_fmt=floating_point_exponential_format(val,upper,flags),parts=exp_fmt.split(delim)
parts[0]=remove_zeros(parts[0])
res=parts.join(delim)}
return format_padding(format_sign(val,flags)+res,flags)}
var roundDownToFixed=$B.roundDownToFixed=function(v,d){if(d==0 && v.toString().indexOf('e')>-1){
return BigInt(v).toString()}
const mul=Math.pow(10,d);
var is_neg=v < 0
if(is_neg){v=-v}
var res_floor=(Math.floor(v*mul)/mul).toFixed(d),res_ceil=(Math.ceil(v*mul)/mul).toFixed(d),res
if(v-res_floor==res_ceil-v){
var last=res_floor[res_floor.length-1]
res=last.match(/[02468]/)? res_floor :res_ceil}else{res=v-res_floor < res_ceil-v ? res_floor :res_ceil}
return is_neg ? '-'+res :res}
var floating_point_decimal_format=function(val,upper,flags){val=_float_helper(val,flags)
var unpadded=format_float_precision(val,upper,flags,function(val,precision,flags){
var res=roundDownToFixed(val,precision)
if(precision===0 && flags.alternate){res+='.'}
if(Object.is(val,-0)){res='-'+res}
return res})
return format_padding(format_sign(val,flags)+unpadded,flags)}
var _floating_exp_helper=function(val,precision,flags,upper){var is_neg=false,val_pos=val.toString()
if(val < 0){is_neg=true
val_pos=val_pos.substr(1)}else if(Object.is(val,-0)){is_neg=true}
var parts=val_pos.split('.'),exp=0,exp_sign='+',mant
if(parts[0]=='0'){if(parts[1]){exp_sign='-'
exp++
var i=0
while(parts[1][i]=='0'){i++}
exp+=i
mant=parts[1][i]
if(parts[1][i+1]){mant+='.'+parts[1].substr(i+1)}}else{mant='0'}}else{exp=parts[0].length-1
mant=parts[0][0]
if(parts[0].length > 1){mant+='.'+parts[0].substr(1)+(parts[1]||'')}else if(parts[1]){mant+='.'+parts[1]}}
mant=parseFloat(mant)
mant=roundDownToFixed(parseFloat(mant),precision)
if(parseFloat(mant)==10){
parts=mant.split('.')
parts[0]='1'
mant=parts.join('.')
exp=parseInt(exp)+1}
if(flags.alternate && mant.indexOf('.')==-1){mant+='.'}
if(exp.toString().length==1){
exp='0'+exp}
return `${is_neg ? '-' : ''}${mant}${upper ? 'E' : 'e'}${exp_sign}${exp}`}
var floating_point_exponential_format=function(val,upper,flags){val=_float_helper(val,flags)
return format_padding(format_sign(val,flags)+
format_float_precision(val,upper,flags,_floating_exp_helper),flags)}
$B.formatters={floating_point_format,floating_point_decimal_format,floating_point_exponential_format}
var signed_hex_format=function(val,upper,flags){var ret
if(! $B.$isinstance(val,_b_.int)){throw _b_.TypeError.$factory(
`%X format: an integer is required, not ${$B.class_name(val)}`)}
if(val.__class__===$B.long_int){ret=val.value.toString(16)}else{ret=parseInt(val)
ret=ret.toString(16)}
ret=format_int_precision(ret,flags)
if(upper){ret=ret.toUpperCase()}
if(flags.pad_char==="0"){if(val < 0){ret=ret.substring(1)
ret="-"+format_padding(ret,flags,true)}
var sign=format_sign(val,flags)
if(sign !==""){ret=sign+format_padding(ret,flags,true)}}
if(flags.alternate){if(ret.charAt(0)==="-"){if(upper){ret="-0X"+ret.slice(1)}
else{ret="-0x"+ret.slice(1)}}else{if(upper){ret="0X"+ret}
else{ret="0x"+ret}}}
return format_padding(format_sign(val,flags)+ret,flags)}
var octal_format=function(val,flags){number_check(val,flags)
var ret
if(val.__class__===$B.long_int){ret=$B.long_int.to_base(8)}else{ret=parseInt(val)
ret=ret.toString(8)}
ret=format_int_precision(ret,flags)
if(flags.pad_char==="0"){if(val < 0){ret=ret.substring(1)
ret="-"+format_padding(ret,flags,true)}
var sign=format_sign(val,flags)
if(sign !==""){ret=sign+format_padding(ret,flags,true)}}
if(flags.alternate){if(ret.charAt(0)==="-"){ret="-0o"+ret.slice(1)}
else{ret="0o"+ret}}
return format_padding(ret,flags)}
function series_of_bytes(val,flags){if(val.__class__ && val.__class__.$buffer_protocol){var it=_b_.iter(val),ints=[]
while(true){try{ints.push(_b_.next(it))}catch(err){if(err.__class__===_b_.StopIteration){var b=_b_.bytes.$factory(ints)
return format_padding(_b_.bytes.decode(b,"ascii"),flags)}
throw err}}}else{try{bytes_obj=$B.$getattr(val,"__bytes__")()
return format_padding(_b_.bytes.decode(bytes_obj),flags)}catch(err){if(err.__class__===_b_.AttributeError){throw _b_.TypeError.$factory("%b does not accept '"+
$B.class_name(val)+"'")}
throw err}}}
var single_char_format=function(val,flags,type){if(type=='bytes'){if($B.$isinstance(val,_b_.int)){if(val.__class__===$B.long_int ||val < 0 ||val > 255){throw _b_.OverflowError.$factory("%c arg not in range(256)")}}else if($B.$isinstance(val,[_b_.bytes,_b_.bytearray])){if(val.source.length > 1){throw _b_.TypeError.$factory(
"%c requires an integer in range(256) or a single byte")}
val=val.source[0]}}else{if($B.$isinstance(val,_b_.str)){if(_b_.str.__len__(val)==1){return val}
throw _b_.TypeError.$factory("%c requires int or char")}else if(! $B.$isinstance(val,_b_.int)){throw _b_.TypeError.$factory("%c requires int or char")}
if((val.__class__===$B.long_int &&
(val.value < 0 ||val.value >=0x110000))||
(val < 0 ||val >=0x110000)){throw _b_.OverflowError.$factory('%c arg not in range(0x110000)')}}
return format_padding(_b_.chr(val),flags)}
var num_flag=function(c,flags){if(c==="0" && ! flags.padding && ! flags.decimal_point && ! flags.left){flags.pad_char="0"
return}
if(!flags.decimal_point){flags.padding=(flags.padding ||"")+c}else{flags.precision=(flags.precision ||"")+c}}
var decimal_point_flag=function(val,flags){if(flags.decimal_point){
throw new UnsupportedChar()}
flags.decimal_point=true}
var neg_flag=function(val,flags){flags.pad_char=" " 
flags.left=true}
var space_flag=function(val,flags){flags.space=true}
var sign_flag=function(val,flags){flags.sign=true}
var alternate_flag=function(val,flags){flags.alternate=true}
var char_mapping={"b":series_of_bytes,"s":str_format,"d":num_format,"i":num_format,"u":num_format,"o":octal_format,"r":repr_format,"a":ascii_format,"g":function(val,flags){return floating_point_format(val,false,flags)},"G":function(val,flags){return floating_point_format(val,true,flags)},"f":function(val,flags){return floating_point_decimal_format(val,false,flags)},"F":function(val,flags){return floating_point_decimal_format(val,true,flags)},"e":function(val,flags){return floating_point_exponential_format(val,false,flags)},"E":function(val,flags){return floating_point_exponential_format(val,true,flags)},"x":function(val,flags){return signed_hex_format(val,false,flags)},"X":function(val,flags){return signed_hex_format(val,true,flags)},"c":single_char_format,"0":function(val,flags){return num_flag("0",flags)},"1":function(val,flags){return num_flag("1",flags)},"2":function(val,flags){return num_flag("2",flags)},"3":function(val,flags){return num_flag("3",flags)},"4":function(val,flags){return num_flag("4",flags)},"5":function(val,flags){return num_flag("5",flags)},"6":function(val,flags){return num_flag("6",flags)},"7":function(val,flags){return num_flag("7",flags)},"8":function(val,flags){return num_flag("8",flags)},"9":function(val,flags){return num_flag("9",flags)},"-":neg_flag," ":space_flag,"+":sign_flag,".":decimal_point_flag,"#":alternate_flag}
var UnsupportedChar=function(){this.name="UnsupportedChar"}
const conversion_flags='#0- +',length_modifiers='hlL',conversion_types='diouxXeEfFgGcrsa'
function parse_mod_format(s,type,pos){var flags={pad_char:' '},len=s.length,start_pos=pos,mo
pos++
while(pos < len){var char=s[pos]
if(char=='('){var end=s.substr(pos).indexOf(')')
if(end==-1){throw _b_.ValueError.$factory('incomplete format key')}else{flags.mapping_key=s.substr(pos+1,end-1)
pos+=end+1}}else if(conversion_flags.indexOf(char)>-1){flags.conversion_flag=char
if(char=='#'){flags.alternate=true}else if(char=='-'){flags.left=true}else if(char=='+'){flags.sign='+'}else if(char=='0'){flags.pad_char='0'}else if(char==' '){flags.space=true}
pos++}else if(char=='*'){flags.padding='*'
pos++}else if(mo=/^\d+/.exec(s.substr(pos))){flags.padding=mo[0]
pos+=mo[0].length}else if(char=='.'){pos++
if(s[pos]=='*'){flags.precision='*'
pos++}else if(mo=/^\d+/.exec(s.substr(pos))){flags.precision=mo[0]
pos+=mo[0].length}else{flags.precision="0"}}else if(length_modifiers.indexOf(char)>-1){flags.length_modifier=char
pos++}else if((conversion_types.indexOf(char)>-1)||
(char=='b' && type=='bytes')){if(type=='bytes'){if(char=='s'){
char='b'}else if(char=='r'){char='a'}}
flags.conversion_type=char
flags.end=pos
flags.string=s.substring(start_pos,pos+1)
if(flags.left && flags.pad_char=='0'){
flags.pad_char=' '}
return flags}else{throw _b_.ValueError.$factory(`invalid character in format: ${char}`)}}
throw _b_.ValueError.$factory('invalid format')}
function is_mapping(obj){return _b_.hasattr(obj,'keys')&& _b_.hasattr(obj,'__getitem__')}
$B.printf_format=function(s,type,args){
var length=s.length,pos=0,argpos=null,getitem
if($B.$isinstance(args,_b_.tuple)){argpos=0}else{getitem=$B.$getattr(args,"__getitem__",_b_.None)}
var ret='',
nbph=0,
pos=0,
len=s.length
while(pos < len){var fmtpos=s.indexOf("%",pos)
if(fmtpos < 0){ret+=s.substring(pos)
break}
ret+=s.substring(pos,fmtpos)
pos=fmtpos
if(s[pos+1]=='%'){ret+='%'
pos+=2}else{nbph++
if(nbph > 1){
if((! $B.$isinstance(args,_b_.tuple))&&
! is_mapping(args)){throw _b_.TypeError.$factory(
"not enough arguments for format string")}}
var fmt=parse_mod_format(s,type,pos)
pos=fmt.end+1
if(fmt.padding=='*'){
if(args[argpos]===undefined){throw _b_.ValueError.$factory('no value for field width *')}
fmt.padding=args[argpos]
argpos++}
if(fmt.precision=='*'){
if(args[argpos]===undefined){throw _b_.ValueError.$factory('no value for precision *')}
fmt.precision=args[argpos]
argpos++}
var func=char_mapping[fmt.conversion_type],value
if(fmt.mapping_key !==undefined){value=getitem(fmt.mapping_key)}else{if(argpos===null){value=args}else{value=args[argpos]
if(value===undefined){throw _b_.TypeError.$factory(
"not enough arguments for format string")}
argpos++}}
ret+=func(value,fmt,type)}}
if(argpos !==null){if(args.length > argpos){throw _b_.TypeError.$factory(
"not enough arguments for format string")}else if(args.length < argpos){throw _b_.TypeError.$factory(
"not all arguments converted during string formatting")}}else if(nbph==0){throw _b_.TypeError.$factory(
"not all arguments converted during string formatting")}
return ret}
str.__mod__=function(_self,args){_self=to_string(_self)
var res=$B.printf_format(_self,'str',args)
return $B.String(res)}
str.__mro__=[_b_.object]
str.__mul__=function(){var $=$B.args("__mul__",2,{self:null,other:null},["self","other"],arguments,{},null,null),_self=to_string($.self)
if(! $B.$isinstance($.other,_b_.int)){throw _b_.TypeError.$factory(
"Can't multiply sequence by non-int of type '"+
$B.class_name($.other)+"'")}
return _self.repeat($.other < 0 ? 0 :$.other)}
str.__ne__=function(_self,other){var eq=str.__eq__(_self,other)
return eq===_b_.NotImplemented ? eq :! eq}
str.__new__=function(cls,value){if(cls===undefined){throw _b_.TypeError.$factory("str.__new__(): not enough arguments")}else if(cls===_b_.str){return value}else{return{
__class__:cls,$brython_value:str.$factory(value),__dict__:$B.empty_dict()}}}
str.__repr__=function(_self){
_self=to_string(_self)
var t=$B.special_string_repr,
repl='',chars=to_chars(_self)
for(var i=0;i < chars.length;i++){var cp=_b_.ord(chars[i])
if(t[cp]!==undefined){repl+=t[cp]}else if(/\p{Cn}/u.test(chars[i])){var s=cp.toString(16)
while(s.length < 4){s='0'+s}
repl+='\\u'+s}else if(cp < 0x20 ||(cp >=0x7f && cp < 0xa0)){cp=cp.toString(16)
if(cp.length < 2){cp='0'+cp}
repl+='\\x'+cp}else if(cp >=0x300 && cp <=0x36F){repl+="\u200B"+chars[i]+' '}else if(cp.toString(16)=='feff'){repl+='\\ufeff'}else{repl+=chars[i]}}
var res=repl
if(res.search('"')==-1 && res.search("'")==-1){return "'"+res+"'"}else if(_self.search('"')==-1){return '"'+res+'"'}
var qesc=new RegExp("'","g")
res="'"+res.replace(qesc,"\\'")+"'"
return res}
str.__rmod__=function(){var $=$B.args('__rmod__',2,{self:null,other:null},['self','other'],arguments,{},null,null)
if(! $B.$isinstance($.other,str)){return _b_.NotImplemented}
return str.__mod__($.other,$.self)}
str.__rmul__=function(_self,other){_self=to_string(_self)
if($B.$isinstance(other,_b_.int)){other=_b_.int.numerator(other)
var res=''
while(other > 0){res+=_self
other--}
return res}
return _b_.NotImplemented}
str.__setattr__=function(_self,attr,value){if(typeof _self==="string"){if(str.hasOwnProperty(attr)){throw _b_.AttributeError.$factory("'str' object attribute '"+
attr+"' is read-only")}else{throw _b_.AttributeError.$factory(
"'str' object has no attribute '"+attr+"'")}}
_b_.dict.$setitem(_self.__dict__,attr,value)
return _b_.None}
str.__setitem__=function(self,attr,value){throw _b_.TypeError.$factory(
"'str' object does not support item assignment")}
var combining=[]
for(var cp=0x300;cp <=0x36F;cp++){combining.push(String.fromCharCode(cp))}
var combining_re=new RegExp("("+combining.join("|")+")","g")
str.__str__=function(_self){_self=to_string(_self)
var repl='',chars=to_chars(_self)
if(chars.length==_self.length){return _self.replace(combining_re,"\u200B$1")}
for(var i=0;i < chars.length;i++){var cp=_b_.ord(chars[i])
if(cp >=0x300 && cp <=0x36F){repl+="\u200B"+chars[i]}else{repl+=chars[i]}}
return repl}
var body=`var _b_ = __BRYTHON__.builtins
if(typeof other !== typeof _self){
    return _b_.NotImplemented}else if(typeof _self == "string"){
    return _self > other}else{
    return _self.$brython_value > other.$brython_value}`
var comps={">":"gt",">=":"ge","<":"lt","<=":"le"}
for(var op in comps){str[`__${comps[op]}__`]=Function('_self','other',body.replace(/>/gm,op))}
str.capitalize=function(){var $=$B.args("capitalize",1,{self},["self"],arguments,{},null,null),_self=to_string($.self)
if(_self.length==0){return ""}
return _self.charAt(0).toUpperCase()+_self.substr(1).toLowerCase()}
str.casefold=function(){var $=$B.args("casefold",1,{self},["self"],arguments,{},null,null),res="",char,cf,_self=to_string($.self),chars=to_chars(_self)
for(var i=0,len=chars.length;i < len;i++){char=chars[i]
cf=$B.unicode_casefold[char]
if(cf){cf.forEach(function(cp){res+=String.fromCharCode(cp)})}else{res+=char.toLowerCase()}}
return res}
str.center=function(){var $=$B.args("center",3,{self:null,width:null,fillchar:null},["self","width","fillchar"],arguments,{fillchar:" "},null,null),_self=to_string($.self)
if($.width <=_self.length){return _self}
var pad=parseInt(($.width-_self.length)/2),res=$.fillchar.repeat(pad)
res+=_self+res
if(res.length < $.width){res+=$.fillchar}
return res}
str.count=function(){var $=$B.args("count",4,{self:null,sub:null,start:null,stop:null},["self","sub","start","stop"],arguments,{start:null,stop:null},null,null),_self,sub
if(! $B.$isinstance($.sub,str)){throw _b_.TypeError.$factory("Can't convert '"+$B.class_name($.sub)+
"' object to str implicitly")}
[_self,sub]=to_string([$.self,$.sub])
var substr=_self
if($.start !==null){var _slice
if($.stop !==null){_slice=_b_.slice.$factory($.start,$.stop)}else{_slice=_b_.slice.$factory($.start,_self.length)}
substr=str.__getitem__.apply(null,[_self].concat(_slice))}else{if(_self.length+sub.length==0){return 1}}
if(sub.length==0){if($.start==_self.length){return 1}else if(substr.length==0){return 0}
return substr.length+1}
var n=0,pos=0
while(pos < substr.length){pos=substr.indexOf(sub,pos)
if(pos >=0){n++
pos+=sub.length}else{break}}
return n}
str.encode=function(){var $=$B.args("encode",3,{self:null,encoding:null,errors:null},["self","encoding","errors"],arguments,{encoding:"utf-8",errors:"strict"},null,null),_self=to_string($.self)
if($.encoding=="rot13" ||$.encoding=="rot_13"){
var res=""
for(var i=0,len=_self.length;i < len ;i++){var char=_self.charAt(i)
console.log('char',char)
if(("a" <=char && char <="m")||("A" <=char && char <="M")){res+=String.fromCharCode(char.charCodeAt(0)+13)}else if(("m" < char && char <="z")||
("M" < char && char <="Z")){res+=String.fromCharCode(char.charCodeAt(0)-13)}else{res+=char}}
return res}
return _b_.bytes.__new__(_b_.bytes,$.self,$.encoding,$.errors)}
str.endswith=function(){
var $=$B.args("endswith",4,{self:null,suffix:null,start:null,end:null},["self","suffix","start","end"],arguments,{start:0,end:null},null,null),_self
normalize_start_end($);
_self=to_string($.self)
var suffixes=$.suffix
if(! $B.$isinstance(suffixes,_b_.tuple)){suffixes=[suffixes]}
var chars=to_chars(_self),s=chars.slice($.start,$.end)
for(var i=0,len=suffixes.length;i < len;i++){var suffix=suffixes[i]
if(! $B.$isinstance(suffix,str)){throw _b_.TypeError.$factory(
"endswith first arg must be str or a tuple of str, not int")}
suffix=suffix.__class__ ? suffix.$brython_value :suffix
if(suffix.length <=s.length &&
s.slice(s.length-suffix.length).join('')==suffix){return true}}
return false}
str.expandtabs=function(){var $=$B.args("expandtabs",2,{self:null,tabsize:null},["self","tabsize"],arguments,{tabsize:8},null,null),_self=to_string($.self)
var s=$B.$GetInt($.tabsize),col=0,pos=0,res="",chars=to_chars(_self)
if(s==1){return _self.replace(/\t/g," ")}
while(pos < chars.length){var car=chars[pos]
switch(car){case "\t":
while(col % s > 0){res+=" ";
col++}
break
case "\r":
case "\n":
res+=car
col=0
break
default:
res+=car
col++
break}
pos++}
return res}
str.find=function(){
var $=$B.args("str.find",4,{self:null,sub:null,start:null,end:null},["self","sub","start","end"],arguments,{start:0,end:null},null,null),_self,sub
check_str($.sub)
normalize_start_end($);
[_self,sub]=to_string([$.self,$.sub]);
var len=str.__len__(_self),sub_len=str.__len__(sub)
if(sub_len==0 && $.start==len){return len}
if(len+sub_len==0){return-1}
var js_start=pypos2jspos(_self,$.start),js_end=pypos2jspos(_self,$.end),ix=_self.slice(js_start,js_end).indexOf(sub)
if(ix==-1){return-1}
return jspos2pypos(_self,js_start+ix)}
$B.parse_format=function(fmt_string){
var elts=fmt_string.split(":"),name,conv,spec,name_ext=[]
if(elts.length==1){
name=fmt_string}else{
name=elts[0]
spec=elts.splice(1).join(":")}
var elts=name.split("!")
if(elts.length > 1){name=elts[0]
conv=elts[1]}
if(name !==undefined){
function name_repl(match){name_ext.push(match)
return ""}
var name_ext_re=/\.[_a-zA-Z][_a-zA-Z0-9]*|\[[_a-zA-Z][_a-zA-Z0-9]*\]|\[[0-9]+\]/g
name=name.replace(name_ext_re,name_repl)}
return{name:name,name_ext:name_ext,conv:conv,spec:spec ||"",string:fmt_string}}
$B.split_format=function(s){
var pos=0,_len=s.length,car,text="",parts=[],rank=0
while(pos < _len){car=s.charAt(pos)
if(car=="{" && s.charAt(pos+1)=="{"){
text+="{"
pos+=2}else if(car=="}" && s.charAt(pos+1)=="}"){
text+="}"
pos+=2}else if(car=="{"){
parts.push(text)
var end=pos+1,nb=1
while(end < _len){if(s.charAt(end)=="{"){nb++;end++}
else if(s.charAt(end)=="}"){nb--;end++
if(nb==0){
var fmt_string=s.substring(pos+1,end-1)
var fmt_obj=$B.parse_format(fmt_string)
fmt_obj.raw_name=fmt_obj.name
fmt_obj.raw_spec=fmt_obj.spec
if(!fmt_obj.name){fmt_obj.name=rank+""
rank++}
if(fmt_obj.spec !==undefined){
function replace_nested(name,key){if(key==""){
return "{"+rank+++"}"}
return "{"+key+"}"}
fmt_obj.spec=fmt_obj.spec.replace(/\{(.*?)\}/g,replace_nested)}
parts.push(fmt_obj)
text=""
break}}else{end++}}
if(nb > 0){throw _b_.ValueError.$factory("wrong format "+s)}
pos=end}else{text+=car
pos++}}
if(text){parts.push(text)}
return parts}
str.format=function(_self){
var last_arg=$B.last(arguments)
if(last_arg.$nat=="mapping"){var mapping=last_arg.mapping,getitem=$B.$getattr(mapping,"__getitem__")
var args=[]
for(var i=0,len=arguments.length-1;i < len;i++){args.push(arguments[i])}
var $=$B.args("format",1,{self:null},["self"],args,{},"$args",null)}else{var $=$B.args("format",1,{self:null},["self"],arguments,{},"$args","$kw"),mapping=$.$kw,
getitem=function(key){return _b_.dict.$getitem(mapping,key)}}
var _self=to_string($.self),parts=$B.split_format(_self)
var res="",fmt
for(var i=0;i < parts.length;i++){
if(typeof parts[i]=="string"){res+=parts[i];
continue}
fmt=parts[i]
if(fmt.spec !==undefined){
function replace_nested(name,key){if(/\d+/.exec(key)){
return _b_.tuple.__getitem__($.$args,parseInt(key))}else{
return _b_.dict.__getitem__($.$kw,key)}}
fmt.spec=fmt.spec.replace(/\{(.*?)\}/g,replace_nested)}
if(fmt.name.charAt(0).search(/\d/)>-1){
var pos=parseInt(fmt.name),value=_b_.tuple.__getitem__($.$args,pos)}else{
var value=getitem(fmt.name)}
for(var j=0;j < fmt.name_ext.length;j++){var ext=fmt.name_ext[j]
if(ext.charAt(0)=="."){
value=$B.$getattr(value,ext.substr(1))}else{
var key=ext.substr(1,ext.length-2)
if(key.charAt(0).search(/\d/)>-1){key=parseInt(key)}
value=$B.$getattr(value,"__getitem__")(key)}}
if(fmt.conv=="a"){value=_b_.ascii(value)}
else if(fmt.conv=="r"){value=_b_.repr(value)}
else if(fmt.conv=="s"){value=_b_.str.$factory(value)}
if(value.$is_class ||value.$factory){
res+=value.__class__.__format__(value,fmt.spec)}else{res+=$B.$getattr(value,"__format__")(fmt.spec)}}
return res}
str.format_map=function(){var $=$B.args("format_map",2,{self:null,mapping:null},['self','mapping'],arguments,{},null,null),_self=to_string($.self)
return str.format(_self,{$nat:'mapping',mapping:$.mapping})}
str.index=function(self){
var res=str.find.apply(null,arguments)
if(res===-1){throw _b_.ValueError.$factory("substring not found")}
return res}
str.isascii=function(){
var $=$B.args("isascii",1,{self:null},["self"],arguments,{},null,null),_self=to_string($.self)
for(var i=0,len=_self.length;i < len;i++){if(_self.charCodeAt(i)> 127){return false}}
return true}
str.isalnum=function(){
var $=$B.args("isalnum",1,{self:null},["self"],arguments,{},null,null),cp,_self=to_string($.self)
for(var char of _self){cp=_b_.ord(char)
for(var cat of['Ll','Lu','Lm','Lt','Lo','Nd','digits','numeric']){if(! $B.in_unicode_category(cat,cp)){return false}}}
return true}
str.isalpha=function(){
var $=$B.args("isalpha",1,{self:null},["self"],arguments,{},null,null),cp,_self=to_string($.self)
for(var char of _self){cp=_b_.ord(char)
for(var cat of['Ll','Lu','Lm','Lt','Lo']){if(! $B.in_unicode_category(cat,cp)){return false}}}
return true}
str.isdecimal=function(){
var $=$B.args("isdecimal",1,{self:null},["self"],arguments,{},null,null),cp,_self=to_string($.self)
for(var char of _self){cp=_b_.ord(char)
if(! $B.in_unicode_category('Nd',cp)){return false}}
return _self.length > 0}
str.isdigit=function(){
var $=$B.args("isdigit",1,{self:null},["self"],arguments,{},null,null),cp,_self=to_string($.self)
for(var char of _self){if(/\p{Nd}/u.test(char)){continue}
cp=_b_.ord(char)
if(! $B.in_unicode_category('No_digits',cp)){return false}}
return _self.length > 0}
str.isidentifier=function(){
var $=$B.args("isidentifier",1,{self:null},["self"],arguments,{},null,null),_self=to_string($.self)
if(_self.length==0){return false}
var chars=to_chars(_self)
if(! $B.is_XID_Start(_b_.ord(chars[0]))){return false}else{for(var char of chars){var cp=_b_.ord(char)
if(! $B.is_XID_Continue(cp)){return false}}}
return true}
str.islower=function(){
var $=$B.args("islower",1,{self:null},["self"],arguments,{},null,null),has_cased=false,cp,_self=to_string($.self)
for(var char of _self){cp=_b_.ord(char)
if($B.in_unicode_category('Ll',cp)){has_cased=true
continue}else if($B.in_unicode_category('Lu',cp)||
$B.in_unicode_category('Lt',cp)){return false}}
return has_cased}
const numeric_re=/\p{Nd}|\p{Nl}|\p{No}/u
str.isnumeric=function(){
var $=$B.args("isnumeric",1,{self:null},["self"],arguments,{},null,null),_self=to_string($.self)
for(var char of _self){if((! numeric_re.test(char))&&
! $B.in_unicode_category('Lo_numeric',_b_.ord(char))){return false}}
return _self.length > 0}
var unprintable_re=/\p{Cc}|\p{Cf}|\p{Co}|\p{Cs}|\p{Zl}|\p{Zp}|\p{Zs}/u
str.isprintable=function(){
var $=$B.args("isprintable",1,{self:null},["self"],arguments,{},null,null),_self=to_string($.self)
for(var char of _self){if(char==' '){continue}
if(unprintable_re.test(char)){return false}}
return true}
str.isspace=function(self){
var $=$B.args("isspace",1,{self:null},["self"],arguments,{},null,null),cp,_self=to_string($.self)
for(var char of _self){cp=_b_.ord(char)
if(! $B.in_unicode_category('Zs',cp)&&
$B.unicode_bidi_whitespace.indexOf(cp)==-1){return false}}
return _self.length > 0}
str.istitle=function(self){
var $=$B.args("istitle",1,{self:null},["self"],arguments,{},null,null),_self=to_string($.self)
return _self.length > 0 && str.title(_self)==_self}
str.isupper=function(self){
var $=$B.args("islower",1,{self:null},["self"],arguments,{},null,null),is_upper=false,cp,_self=to_string(self)
for(var char of _self){cp=_b_.ord(char)
if($B.in_unicode_category('Lu',cp)){is_upper=true
continue}else if($B.in_unicode_category('Ll',cp)||
$B.in_unicode_category('Lt',cp)){return false}}
return is_upper}
str.join=function(){var $=$B.args("join",2,{self:null,iterable:null},["self","iterable"],arguments,{},null,null),_self=to_string($.self)
var iterable=_b_.iter($.iterable),res=[],count=0
while(1){try{var obj2=_b_.next(iterable)
if(! $B.$isinstance(obj2,str)){throw _b_.TypeError.$factory("sequence item "+count+
": expected str instance, "+$B.class_name(obj2)+
" found")}
res.push(obj2)}catch(err){if($B.$isinstance(err,_b_.StopIteration)){break}
else{throw err}}}
return res.join(_self)}
str.ljust=function(self){var $=$B.args("ljust",3,{self:null,width:null,fillchar:null},["self","width","fillchar"],arguments,{fillchar:" "},null,null),_self=to_string($.self),len=str.__len__(_self);
if($.width <=len){return _self}
return _self+$.fillchar.repeat($.width-len)}
str.lower=function(self){var $=$B.args("lower",1,{self:null},["self"],arguments,{},null,null),_self=to_string($.self)
return _self.toLowerCase()}
str.lstrip=function(self,x){var $=$B.args("lstrip",2,{self:null,chars:null},["self","chars"],arguments,{chars:_b_.None},null,null),_self=$.self,chars=$.chars
if(chars===_b_.None){return self.trimStart()}
[_self,chars]=to_string([_self,chars])
while(_self.length > 0){var flag=false
for(var char of chars){if(_self.startsWith(char)){_self=_self.substr(char.length)
flag=true
break}}
if(! flag){return $.self.surrogates ? $B.String(_self):_self}}
return ''}
str.maketrans=function(){var $=$B.args("maketrans",3,{x:null,y:null,z:null},["x","y","z"],arguments,{y:null,z:null},null,null)
var _t=$B.empty_dict()
if($.y===null && $.z===null){
if(! $B.$isinstance($.x,_b_.dict)){throw _b_.TypeError.$factory(
"maketrans only argument must be a dict")}
var items=_b_.list.$factory(_b_.dict.items($.x))
for(var i=0,len=items.length;i < len;i++){var k=items[i][0],v=items[i][1]
if(! $B.$isinstance(k,_b_.int)){if($B.$isinstance(k,_b_.str)&& k.length==1){k=_b_.ord(k)}else{throw _b_.TypeError.$factory("dictionary key "+k+
" is not int or 1-char string")}}
if(v !==_b_.None && ! $B.$isinstance(v,[_b_.int,_b_.str])){throw _b_.TypeError.$factory("dictionary value "+v+
" is not None, integer or string")}
_b_.dict.$setitem(_t,k,v)}
return _t}else{
if(!($B.$isinstance($.x,_b_.str)&& $B.$isinstance($.y,_b_.str))){throw _b_.TypeError.$factory("maketrans arguments must be strings")}else if($.x.length !==$.y.length){throw _b_.TypeError.$factory(
"maketrans arguments must be strings or same length")}else{var toNone={}
if($.z !==null){
if(! $B.$isinstance($.z,_b_.str)){throw _b_.TypeError.$factory(
"maketrans third argument must be a string")}
for(var i=0,len=$.z.length;i < len;i++){toNone[_b_.ord($.z.charAt(i))]=true}}
for(var i=0,len=$.x.length;i < len;i++){var key=_b_.ord($.x.charAt(i)),value=$.y.charCodeAt(i)
_b_.dict.$setitem(_t,key,value)}
for(var k in toNone){_b_.dict.$setitem(_t,parseInt(k),_b_.None)}
return _t}}}
str.maketrans.$type="staticmethod"
str.partition=function(){var $=$B.args("partition",2,{self:null,sep:null},["self","sep"],arguments,{},null,null),_self
if($.sep==""){throw _b_.ValueError.$factory("empty separator")}
check_str($.sep);
[_self,sep]=to_string([$.self,$.sep])
var chars=to_chars(_self),i=_self.indexOf(sep)
if(i==-1){return _b_.tuple.$factory([_self,"",""])}
return _b_.tuple.$factory([chars.slice(0,i).join(''),sep,chars.slice(i+sep.length).join('')])}
str.removeprefix=function(){var $=$B.args("removeprefix",2,{self:null,prefix:null},["self","prefix"],arguments,{},null,null),_self
if(!$B.$isinstance($.prefix,str)){throw _b_.ValueError.$factory("prefix should be str, not "+
`'${$B.class_name($.prefix)}'`)}
[_self,prefix]=to_string([$.self,$.prefix])
if(str.startswith(_self,prefix)){return _self.substr(prefix.length)}
return _self.substr(0)}
str.removesuffix=function(){var $=$B.args("removesuffix",2,{self:null,suffix:null},["self","suffix"],arguments,{},null,null),_self
if(!$B.$isinstance($.suffix,str)){throw _b_.ValueError.$factory("suffix should be str, not "+
`'${$B.class_name($.prefix)}'`)}
[_self,suffix]=to_string([$.self,$.suffix])
if(suffix.length > 0 && str.endswith(_self,suffix)){return _self.substr(0,_self.length-suffix.length)}
return _self.substr(0)}
function $re_escape(str){var specials="[.*+?|()$^"
for(var i=0,len=specials.length;i < len;i++){var re=new RegExp("\\"+specials.charAt(i),"g")
str=str.replace(re,"\\"+specials.charAt(i))}
return str}
str.replace=function(self,old,_new,count){
var $=$B.args("replace",4,{self:null,old:null,new:null,count:null},["self","old","new","count"],arguments,{count:-1},null,null),count=$.count,_self=$.self,old=$.old,_new=$.new
check_str(old,"replace() argument 1 ")
check_str(_new,"replace() argument 2 ")
if(! $B.$isinstance(count,[_b_.int,_b_.float])){throw _b_.TypeError.$factory("'"+$B.class_name(count)+
"' object cannot be interpreted as an integer")}else if($B.$isinstance(count,_b_.float)){throw _b_.TypeError.$factory("integer argument expected, got float")}
if(count==0){return self}
if(count.__class__==$B.long_int){count=parseInt(count.value)}
[old,_new]=to_string([old,_new])
if(old==""){if(_new==""){return _self}
if(_self==""){return _new}
var elts=_self.split("")
if(count >-1 && elts.length >=count){var rest=elts.slice(count).join("")
return _new+elts.slice(0,count).join(_new)+rest}else{return _new+elts.join(_new)+_new}}else{var elts=str.split(_self,old,count)}
var res=_self,pos=-1
if(old.length==0){var res=_new
for(var i=0;i < elts.length;i++){res+=elts[i]+_new}
return res+rest}
if(count < 0){count=res.length}
while(count > 0){pos=res.indexOf(old,pos)
if(pos < 0){break}
res=res.substr(0,pos)+_new+res.substr(pos+old.length)
pos=pos+_new.length
count--}
return res}
str.rfind=function(self,substr){
var $=$B.args("rfind",4,{self:null,sub:null,start:null,end:null},["self","sub","start","end"],arguments,{start:0,end:null},null,null),_self
normalize_start_end($)
check_str($.sub);
[_self,sub]=to_string([$.self,$.sub])
var len=str.__len__(_self),sub_len=str.__len__(sub)
if(sub_len==0){if($.js_start > len){return-1}else{return str.__len__(_self)}}
var js_start=pypos2jspos(_self,$.start),js_end=pypos2jspos(_self,$.end),ix=_self.substring(js_start,js_end).lastIndexOf(sub)
if(ix==-1){return-1}
return jspos2pypos(_self,js_start+ix)-$.start}
str.rindex=function(){
var res=str.rfind.apply(null,arguments)
if(res==-1){throw _b_.ValueError.$factory("substring not found")}
return res}
str.rjust=function(self){var $=$B.args("rjust",3,{self:null,width:null,fillchar:null},["self","width","fillchar"],arguments,{fillchar:" "},null,null),_self=to_string($.self)
var len=str.__len__(_self)
if($.width <=len){return _self}
return $B.String($.fillchar.repeat($.width-len)+_self)}
str.rpartition=function(self,sep){var $=$B.args("rpartition",2,{self:null,sep:null},["self","sep"],arguments,{},null,null),_self
check_str($.sep);
[_self,sep]=[$.self,$.sep]
_self=reverse(_self),sep=reverse(sep)
var items=str.partition(_self,sep).reverse()
for(var i=0;i < items.length;i++){items[i]=items[i].split("").reverse().join("")}
return items}
str.rsplit=function(self){var $=$B.args("rsplit",3,{self:null,sep:null,maxsplit:null},["self","sep","maxsplit"],arguments,{sep:_b_.None,maxsplit:-1},null,null),sep=$.sep,_self;
[_self,sep]=to_string([$.self,$.sep])
var rev_str=reverse(_self),rev_sep=sep===_b_.None ? sep :reverse(sep),rev_res=str.split(rev_str,rev_sep,$.maxsplit)
rev_res.reverse()
for(var i=0;i < rev_res.length;i++){rev_res[i]=reverse(rev_res[i])}
return rev_res}
str.rstrip=function(){var $=$B.args("rstrip",2,{self:null,chars:null},["self","chars"],arguments,{chars:_b_.None},null,null),chars=$.chars,_self=to_string($.self)
if(chars===_b_.None){return _self.trimEnd()}
chars=to_string(chars)
while(_self.length > 0){var flag=false
for(var char of chars){if(_self.endsWith(char)){_self=_self.substr(0,_self.length-char.length)
flag=true
break}}
if(! flag){return _self.surrogates ? $B.String(_self):_self}}
return ''}
str.split=function(){var $=$B.args("split",3,{self:null,sep:null,maxsplit:null},["self","sep","maxsplit"],arguments,{sep:_b_.None,maxsplit:-1},null,null),maxsplit=$.maxsplit,sep=$.sep,pos=0,_self=to_string($.self)
if(maxsplit.__class__===$B.long_int){maxsplit=parseInt(maxsplit.value)}
if(sep==""){throw _b_.ValueError.$factory("empty separator")}
if(sep===_b_.None){var res=[]
while(pos < _self.length && _self.charAt(pos).search(/\s/)>-1){pos++}
if(pos===_self.length-1){return[_self]}
var name=""
while(1){if(_self.charAt(pos).search(/\s/)==-1){if(name==""){name=_self.charAt(pos)}else{name+=_self.charAt(pos)}}else{if(name !==""){res.push(name)
if(maxsplit !==-1 && res.length==maxsplit+1){res.pop()
res.push(name+_self.substr(pos))
return res}
name=""}}
pos++
if(pos > _self.length-1){if(name){res.push(name)}
break}}
return res.map($B.String)}else{sep=to_string(sep)
var res=[],s="",seplen=sep.length
if(maxsplit==0){return[$.self]}
while(pos < _self.length){if(_self.substr(pos,seplen)==sep){res.push(s)
pos+=seplen
if(maxsplit >-1 && res.length >=maxsplit){res.push(_self.substr(pos))
return res.map($B.String)}
s=""}else{s+=_self.charAt(pos)
pos++}}
res.push(s)
return res.map($B.String)}}
str.splitlines=function(self){var $=$B.args('splitlines',2,{self:null,keepends:null},['self','keepends'],arguments,{keepends:false},null,null)
if(!$B.$isinstance($.keepends,[_b_.bool,_b_.int])){throw _b_.TypeError('integer argument expected, got '+
$B.get_class($.keepends).__name)}
var keepends=_b_.int.$factory($.keepends),res=[],start=0,pos=0,_self=to_string($.self)
if(! _self.length){return res}
while(pos < _self.length){if(_self.substr(pos,2)=='\r\n'){res.push(_self.slice(start,keepends ? pos+2 :pos))
start=pos=pos+2}else if(_self[pos]=='\r' ||_self[pos]=='\n'){res.push(_self.slice(start,keepends ? pos+1 :pos))
start=pos=pos+1}else{pos++}}
if(start < _self.length){res.push(_self.slice(start))}
return res.map($B.String)}
str.startswith=function(){
var $=$B.args("startswith",4,{self:null,prefix:null,start:null,end:null},["self","prefix","start","end"],arguments,{start:0,end:null},null,null),_self
normalize_start_end($)
var prefixes=$.prefix
if(! $B.$isinstance(prefixes,_b_.tuple)){prefixes=[prefixes]}
_self=to_string($.self)
prefixes=to_string(prefixes)
var s=_self.substring($.start,$.end)
for(var prefix of prefixes){if(! $B.$isinstance(prefix,str)){throw _b_.TypeError.$factory("endswith first arg must be str "+
"or a tuple of str, not int")}
if(s.substr(0,prefix.length)==prefix){return true}}
return false}
str.strip=function(){var $=$B.args("strip",2,{self:null,chars:null},["self","chars"],arguments,{chars:_b_.None},null,null)
if($.chars===_b_.None){return $.self.trim()}
return str.rstrip(str.lstrip($.self,$.chars),$.chars)}
str.swapcase=function(self){var $=$B.args("swapcase",1,{self},["self"],arguments,{},null,null),res="",cp,_self=to_string($.self)
for(var char of _self){cp=_b_.ord(char)
if($B.in_unicode_category('Ll',cp)){res+=char.toUpperCase()}else if($B.in_unicode_category('Lu',cp)){res+=char.toLowerCase()}else{res+=char}}
return res}
str.title=function(self){var $=$B.args("title",1,{self},["self"],arguments,{},null,null),state,cp,res="",_self=to_string($.self)
for(var char of _self){cp=_b_.ord(char)
if($B.in_unicode_category('Ll',cp)){if(! state){res+=char.toUpperCase()
state="word"}else{res+=char}}else if($B.in_unicode_category('Lu',cp)||
$B.in_unicode_category('Lt',cp)){res+=state ? char.toLowerCase():char
state="word"}else{state=null
res+=char}}
return res}
str.translate=function(){var $=$B.args('translate',2,{self:null,table:null},['self','table'],arguments,{},null,null),table=$.table,res=[],getitem=$B.$getattr(table,"__getitem__"),cp,_self=to_string($.self)
for(var char of _self){cp=_b_.ord(char)
try{var repl=getitem(cp)
if(repl !==_b_.None){if(typeof repl=="string"){res.push(repl)}else if(typeof repl=="number"){res.push(String.fromCharCode(repl))}}}catch(err){res.push(char)}}
return res.join("")}
str.upper=function(self){var $=$B.args("upper",1,{self:null},["self"],arguments,{},null,null),_self=to_string($.self)
return _self.toUpperCase()}
str.zfill=function(self,width){var $=$B.args("zfill",2,{self:null,width:null},["self","width"],arguments,{},null,null),_self=to_string($.self)
var len=str.__len__(_self)
if($.width <=len){return _self}
switch(_self.charAt(0)){case "+":
case "-":
return _self.charAt(0)+
"0".repeat($.width-len)+_self.substr(1)
default:
return "0".repeat($.width-len)+_self}}
str.$factory=function(arg,encoding,errors){if(arguments.length==0){return ""}
if(arg===undefined){return $B.UndefinedType.__str__()}else if(arg===null){return '<Javascript null>'}
if(encoding !==undefined){
var $=$B.args("str",3,{arg:null,encoding:null,errors:null},["arg","encoding","errors"],arguments,{encoding:"utf-8",errors:"strict"},null,null),encoding=$.encoding,errors=$.errors}
if(typeof arg=="string" ||arg instanceof String){return arg.toString()}else if(typeof arg=="number" && Number.isInteger(arg)){return arg.toString()}
try{if(arg.__class__ && arg.__class__===_b_.bytes &&
encoding !==undefined){
return _b_.bytes.decode(arg,$.encoding,$.errors)}
var klass=arg.__class__ ||$B.get_class(arg)
if(klass===undefined){return $B.JSObj.__str__($B.JSObj.$factory(arg))}
var method=$B.$getattr(klass,"__str__",null)
if(method===null){method=$B.$getattr(klass,'__repr__')}}catch(err){console.log("no __str__ for",arg)
console.log("err ",err)
if($B.get_option('debug')> 1){console.log(err)}
console.log("Warning - no method __str__ or __repr__, "+
"default to toString",arg)
throw err}
var res=$B.$call(method)(arg)
if(typeof res=="string" ||$B.$isinstance(res,str)){return res}
throw _b_.TypeError.$factory("__str__ returned non-string "+
`(type ${$B.class_name(res)})`)}
$B.set_func_names(str,"builtins")
_b_.str=str
$B.parse_format_spec=function(spec,obj){if(spec==""){this.empty=true}else{var pos=0,aligns="<>=^",digits="0123456789",types="bcdeEfFgGnosxX%",align_pos=aligns.indexOf(spec.charAt(0))
if(align_pos !=-1){if(spec.charAt(1)&& aligns.indexOf(spec.charAt(1))!=-1){
this.fill=spec.charAt(0)
this.align=spec.charAt(1)
pos=2}else{
this.align=aligns[align_pos]
this.fill=" "
pos++}}else{align_pos=aligns.indexOf(spec.charAt(1))
if(spec.charAt(1)&& align_pos !=-1){
this.align=aligns[align_pos]
this.fill=spec.charAt(0)
pos=2}}
var car=spec.charAt(pos)
if(car=="+" ||car=="-" ||car==" "){this.sign=car
pos++
car=spec.charAt(pos)}
if(car=="z"){this.z=true
pos++
car=spec.charAt(pos)}
if(car=="#"){this.alternate=true;
pos++;
car=spec.charAt(pos)}
if(car=="0"){
this.fill="0"
if(align_pos==-1){this.align="="}
pos++
car=spec.charAt(pos)}
while(car && digits.indexOf(car)>-1){if(this.width===undefined){this.width=car}else{this.width+=car}
pos++
car=spec.charAt(pos)}
if(this.width !==undefined){this.width=parseInt(this.width)}
if(this.width===undefined && car=="{"){
var end_param_pos=spec.substr(pos).search("}")
this.width=spec.substring(pos,end_param_pos)
pos+=end_param_pos+1}
if(car=="," ||car=="_"){this.comma=true
this.grouping_option=car
pos++
car=spec.charAt(pos)
if(car=="," ||car=="_"){if(car==this.grouping_option){throw _b_.ValueError.$factory(
`Cannot specify '${car}' with '${car}'.`)}else{throw _b_.ValueError.$factory(
"Cannot specify both ',' and '_'.")}}}
if(car=="."){if(digits.indexOf(spec.charAt(pos+1))==-1){throw _b_.ValueError.$factory(
"Missing precision in format spec")}
this.precision=spec.charAt(pos+1)
pos+=2
car=spec.charAt(pos)
while(car && digits.indexOf(car)>-1){this.precision+=car
pos++
car=spec.charAt(pos)}
this.precision=parseInt(this.precision)}
if(car && types.indexOf(car)>-1){this.type=car
pos++
car=spec.charAt(pos)}
if(pos !==spec.length){var err_msg=`Invalid format specifier '${spec}'`
if(obj){err_msg+=` for object of type '${$B.class_name(obj)}'`}
throw _b_.ValueError.$factory(err_msg)}}
this.toString=function(){return(this.fill===undefined ? "" :_b_.str.$factory(this.fill))+
(this.align ||"")+
(this.sign ||"")+
(this.alternate ? "#" :"")+
(this.sign_aware ? "0" :"")+
(this.width ||"")+
(this.comma ? "," :"")+
(this.precision ? "."+this.precision :"")+
(this.type ||"")}}
$B.format_width=function(s,fmt){if(fmt.width && s.length < fmt.width){var fill=fmt.fill ||" ",align=fmt.align ||"<",missing=fmt.width-s.length
switch(align){case "<":
return s+fill.repeat(missing)
case ">":
return fill.repeat(missing)+s
case "=":
if("+-".indexOf(s.charAt(0))>-1){return s.charAt(0)+fill.repeat(missing)+s.substr(1)}else{return fill.repeat(missing)+s}
case "^":
var left=parseInt(missing/2)
return fill.repeat(left)+s+fill.repeat(missing-left)}}
return s}
function fstring_expression(start){this.type="expression"
this.start=start
this.expression=""
this.conversion=null
this.fmt=null}
function fstring_error(msg,pos){error=Error(msg)
error.position=pos
throw error}
$B.parse_fstring=function(string){
var elts=[],pos=0,current="",ctype=null,nb_braces=0,expr_start,car
while(pos < string.length){if(ctype===null){car=string.charAt(pos)
if(car=="{"){if(string.charAt(pos+1)=="{"){ctype="string"
current="{"
pos+=2}else{ctype="expression"
expr_start=pos+1
nb_braces=1
pos++}}else if(car=="}"){if(string.charAt(pos+1)==car){ctype="string"
current="}"
pos+=2}else{fstring_error(" f-string: single '}' is not allowed",pos)}}else{ctype="string"
current=car
pos++}}else if(ctype=="string"){
var i=pos
while(i < string.length){car=string.charAt(i)
if(car=="{"){if(string.charAt(i+1)=="{"){current+="{"
i+=2}else{elts.push(current)
ctype="expression"
expr_start=i+1
pos=i+1
break}}else if(car=="}"){if(string.charAt(i+1)==car){current+=car
i+=2}else{fstring_error(" f-string: single '}' is not allowed",pos)}}else{current+=car
i++}}
pos=i+1}else if(ctype=="debug"){
while(string.charAt(i)==" "){i++}
if(string.charAt(i)=="}"){
elts.push(current)
ctype=null
current=""
pos=i+1}}else{
var i=pos,nb_braces=1,nb_paren=0,current=new fstring_expression(expr_start)
while(i < string.length){car=string.charAt(i)
if(car=="{" && nb_paren==0){nb_braces++
current.expression+=car
i++}else if(car=="}" && nb_paren==0){nb_braces-=1
if(nb_braces==0){
if(current.expression==""){fstring_error("f-string: empty expression not allowed",pos)}
elts.push(current)
ctype=null
current=""
pos=i+1
break}
current.expression+=car
i++}else if(car=="\\"){
throw Error("f-string expression part cannot include a"+
" backslash")}else if(nb_paren==0 && car=="!" && current.fmt===null &&
":}".indexOf(string.charAt(i+2))>-1){if(current.expression.length==0){throw Error("f-string: empty expression not allowed")}
if("ars".indexOf(string.charAt(i+1))==-1){throw Error("f-string: invalid conversion character:"+
" expected 's', 'r', or 'a'")}else{current.conversion=string.charAt(i+1)
i+=2}}else if(car=="(" ||car=='['){nb_paren++
current.expression+=car
i++}else if(car==")" ||car==']'){nb_paren--
current.expression+=car
i++}else if(car=='"'){
if(string.substr(i,3)=='"""'){var end=string.indexOf('"""',i+3)
if(end==-1){fstring_error("f-string: unterminated string",pos)}else{var trs=string.substring(i,end+3)
trs=trs.replace("\n","\\n\\")
current.expression+=trs
i=end+3}}else{var end=string.indexOf('"',i+1)
if(end==-1){fstring_error("f-string: unterminated string",pos)}else{current.expression+=string.substring(i,end+1)
i=end+1}}}else if(nb_paren==0 && car==":"){
current.fmt=true
var cb=0,fmt_complete=false
for(var j=i+1;j < string.length;j++){if(string[j]=='{'){if(string[j+1]=='{'){j+=2}else{cb++}}else if(string[j]=='}'){if(string[j+1]=='}'){j+=2}else if(cb==0){fmt_complete=true
var fmt=string.substring(i+1,j)
current.format=$B.parse_fstring(fmt)
i=j
break}else{cb--}}}
if(! fmt_complete){fstring_error('invalid format',pos)}}else if(car=="="){
var ce=current.expression,last_char=ce.charAt(ce.length-1),last_char_re=('()'.indexOf(last_char)>-1 ? "\\" :"")+last_char
if(ce.length==0 ||
nb_paren > 0 ||
string.charAt(i+1)=="=" ||
"=!<>:".search(last_char_re)>-1){
current.expression+=car
i+=1}else{
tail=car
while(string.charAt(i+1).match(/\s/)){tail+=string.charAt(i+1)
i++}
elts.push(current.expression+tail)
while(ce.match(/\s$/)){ce=ce.substr(0,ce.length-1)}
current.expression=ce
ctype="debug"
i++}}else{current.expression+=car
i++}}
if(nb_braces > 0){fstring_error("f-string: expected '}'",pos)}}}
if(current.length > 0){elts.push(current)}
for(var elt of elts){if(typeof elt=="object"){if(elt.fmt_pos !==undefined &&
elt.expression.charAt(elt.fmt_pos)!=':'){throw Error()}}}
return elts}
var _chr=$B.codepoint2jsstring=function(i){if(i >=0x10000 && i <=0x10FFFF){var code=(i-0x10000)
return String.fromCodePoint(0xD800 |(code >> 10))+
String.fromCodePoint(0xDC00 |(code & 0x3FF))}else{return String.fromCodePoint(i)}}
var _ord=$B.jsstring2codepoint=function(c){if(c.length==1){return c.charCodeAt(0)}
var code=0x10000
code+=(c.charCodeAt(0)& 0x03FF)<< 10
code+=(c.charCodeAt(1)& 0x03FF)
return code}})(__BRYTHON__)
;
;(function($B){var _b_=$B.builtins
function $err(op,other){var msg="unsupported operand type(s) for "+op+
" : 'int' and '"+$B.class_name(other)+"'"
throw _b_.TypeError.$factory(msg)}
function int_value(obj){
if(typeof obj=="boolean"){return obj ? 1 :0}
return obj.$brython_value !==undefined ? obj.$brython_value :obj}
function bigint_value(obj){
if(typeof obj=="boolean"){return obj ? 1n :0n}else if(typeof obj=="number"){return BigInt(obj)}else if(obj.__class__===$B.long_int){return obj.value}else if($B.$isinstance(obj,_b_.int)){return bigint_value(obj.$brython_value)}}
var int={__class__:_b_.type,__dir__:_b_.object.__dir__,__mro__:[_b_.object],__qualname__:'int',$is_class:true,$native:true,$descriptors:{"numerator":true,"denominator":true,"imag":true,"real":true},$is_int_subclass:true}
var int_or_long=int.$int_or_long=function(bigint){var res=Number(bigint)
return Number.isSafeInteger(res)? res :$B.fast_long_int(bigint)}
int.$to_js_number=function(obj){
if(typeof obj=="number"){return obj}else if(obj.__class__===$B.long_int){return Number(obj.value)}else if($B.$isinstance(obj,_b_.int)){return int.$to_js_value(obj.$brython_value)}
return null}
int.$to_bigint=bigint_value
int.$int_value=int_value
int.as_integer_ratio=function(){var $=$B.args("as_integer_ratio",1,{self:null},["self"],arguments,{},null,null)
return $B.fast_tuple([$.self,1])}
int.from_bytes=function(){var $=$B.args("from_bytes",3,{bytes:null,byteorder:null,signed:null},["bytes","byteorder","signed"],arguments,{byteorder:'big',signed:false},null,null)
var x=$.bytes,byteorder=$.byteorder,signed=$.signed,_bytes,_len
if($B.$isinstance(x,[_b_.bytes,_b_.bytearray])){_bytes=x.source
_len=x.source.length}else{_bytes=_b_.list.$factory(x)
_len=_bytes.length
for(var i=0;i < _len;i++){_b_.bytes.$factory([_bytes[i]])}}
if(byteorder=="big"){_bytes.reverse()}else if(byteorder !="little"){throw _b_.ValueError.$factory(
"byteorder must be either 'little' or 'big'")}
var num=_bytes[0]
if(signed && num >=128){num=num-256}
num=BigInt(num)
var _mult=256n
for(var i=1;i < _len;i++){num+=_mult*BigInt(_bytes[i])
_mult*=256n}
if(! signed){return int_or_long(num)}
if(_bytes[_len-1]< 128){return int_or_long(num)}
return int_or_long(num-_mult)}
int.to_bytes=function(){var $=$B.args("to_bytes",3,{self:null,len:null,byteorder:null,signed:null},["self","len","byteorder","signed"],arguments,{len:1,byteorder:'big',signed:false},null,null),self=$.self,len=$.len,byteorder=$.byteorder,signed=$.signed
if(! $B.$isinstance(len,_b_.int)){throw _b_.TypeError.$factory("integer argument expected, got "+
$B.class_name(len))}
if(["little","big"].indexOf(byteorder)==-1){throw _b_.ValueError.$factory(
"byteorder must be either 'little' or 'big'")}
if($B.$isinstance(self,$B.long_int)){return $B.long_int.to_bytes(self,len,byteorder,signed)}
if(self < 0){if(! signed){throw _b_.OverflowError.$factory(
"can't convert negative int to unsigned")}
self=Math.pow(256,len)+self}
var res=[],value=self
while(value > 0){var quotient=Math.floor(value/256),rest=value-256*quotient
res.push(rest)
if(res.length > len){throw _b_.OverflowError.$factory("int too big to convert")}
value=quotient}
while(res.length < len){res.push(0)}
if(byteorder=="big"){res.reverse()}
return{
__class__:_b_.bytes,source:res}}
int.__abs__=function(self){return Math.abs(int_value(self))}
var op_model=
`var _b_ = __BRYTHON__.builtins
if(typeof other == "number"){
    return _b_.int.$int_or_long(BigInt(self) + BigInt(other))}else if(other.__class__ === $B.long_int){
    return _b_.int.$int_or_long(BigInt(self) + other.value)}else if(typeof other == "boolean"){
    return _b_.int.$int_or_long(BigInt(self) + (other ? 1n : 0n))}else if($B.$isinstance(other, _b_.int)){
    return _b_.int.__add__(self, other.$brython_value)}
return _b_.NotImplemented
`
int.__add__=Function('self','other',op_model)
int.__bool__=function(self){return int_value(self).valueOf()==0 ? false :true}
int.__ceil__=function(self){return Math.ceil(int_value(self))}
int.__divmod__=function(self,other){if(! $B.$isinstance(other,int)){return _b_.NotImplemented}
return $B.fast_tuple([int.__floordiv__(self,other),int.__mod__(self,other)])}
int.__eq__=function(self,other){var self_as_int=int_value(self)
if(self_as_int.__class__===$B.long_int){return $B.long_int.__eq__(self_as_int,other)}
if($B.$isinstance(other,int)){return int_value(self)==int_value(other)}
return _b_.NotImplemented}
int.__float__=function(self){return $B.fast_float(int_value(self))}
function preformat(self,fmt){if(fmt.empty){return _b_.str.$factory(self)}
if(fmt.type && 'bcdoxXn'.indexOf(fmt.type)==-1){throw _b_.ValueError.$factory("Unknown format code '"+fmt.type+
"' for object of type 'int'")}
var res
switch(fmt.type){case undefined:
case "d":
res=self.toString()
break
case "b":
res=(fmt.alternate ? "0b" :"")+self.toString(2)
break
case "c":
res=_b_.chr(self)
break
case "o":
res=(fmt.alternate ? "0o" :"")+self.toString(8)
break
case "x":
res=(fmt.alternate ? "0x" :"")+self.toString(16)
break
case "X":
res=(fmt.alternate ? "0X" :"")+self.toString(16).toUpperCase()
break
case "n":
return self }
if(fmt.sign !==undefined){if((fmt.sign==" " ||fmt.sign=="+" )&& self >=0){res=fmt.sign+res}}
return res}
int.__format__=function(self,format_spec){var fmt=new $B.parse_format_spec(format_spec,self)
if(fmt.type && 'eEfFgG%'.indexOf(fmt.type)!=-1){
return _b_.float.__format__($B.fast_float(self),format_spec)}
fmt.align=fmt.align ||">"
var res=preformat(self,fmt)
if(fmt.comma){var sign=res[0]=="-" ? "-" :"",rest=res.substr(sign.length),len=rest.length,nb=Math.ceil(rest.length/3),chunks=[]
for(var i=0;i < nb;i++){chunks.push(rest.substring(len-3*i-3,len-3*i))}
chunks.reverse()
res=sign+chunks.join(",")}
return $B.format_width(res,fmt)}
int.__floordiv__=function(self,other){if(typeof other=="number"){if(other==0){throw _b_.ZeroDivisionError.$factory("division by zero")}
return Math.floor(self/other)}else if(typeof other=="boolean"){if(other===false){throw _b_.ZeroDivisionError.$factory("division by zero")}
return self}else if(other !==null && other.__class__===$B.long_int){return Math.floor(self/Number(other.value))}else if($B.$isinstance(other,_b_.int)){return int.__floordiv__(self,other.$brython_value)}
return _b_.NotImplemented}
int.$getnewargs=function(self){return $B.fast_tuple([int_value(self)])}
int.__getnewargs__=function(){return int.$getnewargs($B.single_arg('__getnewargs__','self',arguments))}
int.__hash__=function(self){if(self.$brython_value !==undefined){
if(self.__hashvalue__ !==undefined){return self.__hashvalue__}
if(typeof self.$brython_value=="number"){return self.__hashvalue__=self.$brython_value}else{
return self.__hashvalue__=$B.long_int.__hash__(self.$brython_value)}}
return self.valueOf()}
int.__index__=function(self){return int_value(self)}
int.__init__=function(self){return _b_.None}
int.__int__=function(self){return self}
int.__invert__=function(self){return ~self}
int.__mod__=function(self,other){
if($B.$isinstance(other,_b_.tuple)&& other.length==1){other=other[0]}
if(other.__class__===$B.long_int){self=BigInt(self)
other=other.value
if(other==0){throw _b_.ZeroDivisionError.$factory(
"integer division or modulo by zero")}
return int_or_long((self % other+other)% other)}
if($B.$isinstance(other,int)){other=int_value(other)
if(other===false){other=0}
else if(other===true){other=1}
if(other==0){throw _b_.ZeroDivisionError.$factory(
"integer division or modulo by zero")}
return(self % other+other)% other}
return _b_.NotImplemented}
int.__mul__=Function('self','other',op_model.replace(/\+/g,'*').replace(/add/g,"mul"))
int.__ne__=function(self,other){var res=int.__eq__(self,other)
return(res===_b_.NotImplemented)? res :!res}
int.__neg__=function(self){var self_as_int=int_value(self)
if(self_as_int.__class__===$B.long_int){return $B.long_int.__neg__(self_as_int)}
return-self}
int.__new__=function(cls,value,base){if(cls===undefined){throw _b_.TypeError.$factory("int.__new__(): not enough arguments")}else if(! $B.$isinstance(cls,_b_.type)){throw _b_.TypeError.$factory("int.__new__(X): X is not a type object")}
if(cls===int){return int.$factory(value,base)}
return{
__class__:cls,__dict__:$B.empty_dict(),$brython_value:int.$factory(value,base),toString:function(){return value}}}
int.__pos__=function(self){return self}
function extended_euclidean(a,b){
var d,u,v
if(b==0){return[a,1n,0n]}else{[d,u,v]=extended_euclidean(b,a % b)
return[d,v,u-(a/b)*v]}}
int.__pow__=function(self,other,z){if(! $B.$isinstance(other,int)){return _b_.NotImplemented}
if(typeof other=="boolean"){other=other ? 1 :0}
if(typeof other=="number" ||$B.$isinstance(other,int)){if(z !==undefined && z !==_b_.None){
self=bigint_value(self)
other=bigint_value(other)
z=bigint_value(z)
if(z==1){return 0}
var result=1n,base=self % z,exponent=other
if(exponent < 0){var gcd,inv,_
[gcd,inv,_]=extended_euclidean(self,z)
if(gcd !=1){throw _b_.ValueError.$factory("not relative primes: "+
self+' and '+z)}
return int.__pow__(int_or_long(inv),int_or_long(-exponent),int_or_long(z))}
while(exponent > 0){if(exponent % 2n==1n){result=(result*base)% z}
exponent=exponent >> 1n
base=(base*base)% z}
return int_or_long(result)}else{if(typeof other=="number"){if(other >=0){return int_or_long(BigInt(self)**BigInt(other))}else{return $B.fast_float(Math.pow(self,other))}}else if(other.__class__===$B.long_int){if(other.value >=0){return int_or_long(BigInt(self)**other.value)}else{return $B.fast_float(Math.pow(self,other))}}else if($B.$isinstance(other,_b_.int)){return int_or_long(int.__pow__(self,other.$brython_value))}
return _b_.NotImplemented}}
if($B.$isinstance(other,_b_.float)){other=_b_.float.numerator(other)
if(self >=0){return $B.fast_float(Math.pow(self,other))}else{
return _b_.complex.__pow__($B.make_complex(self,0),other)}}else if($B.$isinstance(other,_b_.complex)){var preal=Math.pow(self,other.$real),ln=Math.log(self)
return $B.make_complex(preal*Math.cos(ln),preal*Math.sin(ln))}
var rpow=$B.$getattr(other,"__rpow__",_b_.None)
if(rpow !==_b_.None){return rpow(self)}
$err("**",other)}
function __newobj__(){
var $=$B.args('__newobj__',0,{},[],arguments,{},'args',null),args=$.args
var res=args.slice(1)
res.__class__=args[0]
return res}
int.__repr__=function(self){$B.builtins_repr_check(int,arguments)
var value=int_value(self),x=value.__class__===$B.long_int ? value.value :value
if($B.int_max_str_digits !=0 &&
x >=10n**BigInt($B.int_max_str_digits)){throw _b_.ValueError.$factory(`Exceeds the limit `+
`(${$B.int_max_str_digits}) for integer string conversion`)}
return x.toString()}
int.__setattr__=function(self,attr,value){if(typeof self=="number" ||typeof self=="boolean"){var cl_name=$B.class_name(self)
if(_b_.dir(self).indexOf(attr)>-1){throw _b_.AttributeError.$factory("attribute '"+attr+
`' of '${cl_name}' objects is not writable`)}else{throw _b_.AttributeError.$factory(`'${cl_name}' object`+
` has no attribute '${attr}'`)}
throw _b_.AttributeError.$factory(msg)}
_b_.dict.$setitem(self.__dict__,attr,value)
return _b_.None}
int.__sub__=Function('self','other',op_model.replace(/\+/g,'-').replace(/__add__/g,'__sub__'))
int.__truediv__=function(self,other){if($B.$isinstance(other,int)){other=int_value(other)
if(other==0){throw _b_.ZeroDivisionError.$factory("division by zero")}
if(other.__class__===$B.long_int){return $B.fast_float(self/parseInt(other.value))}
return $B.fast_float(self/other)}
return _b_.NotImplemented}
int.bit_count=function(self){var s=_b_.bin(_b_.abs(self)),nb=0
for(var x of s){if(x=='1'){nb++}}
return nb}
int.bit_length=function(self){var s=_b_.bin(self)
s=$B.$getattr(s,"lstrip")("-0b")
return s.length }
int.numerator=function(self){return int_value(self)}
int.denominator=function(self){return int.$factory(1)}
int.imag=function(self){return int.$factory(0)}
int.real=function(self){return self}
for(var attr of['numerator','denominator','imag','real']){int[attr].setter=(function(x){return function(self,value){throw _b_.AttributeError.$factory(`attribute '${x}' of `+
`'${$B.class_name(self)}' objects is not writable`)}})(attr)}
var model=
`var _b_ = __BRYTHON__.builtins
if(typeof other == "number"){
    // transform into BigInt: JS converts numbers to 32 bits
    return _b_.int.$int_or_long(BigInt(self) & BigInt(other))}else if(typeof other == "boolean"){
    return self & (other ? 1 : 0)}else if(other.__class__ === $B.long_int){
    return _b_.int.$int_or_long(BigInt(self) & other.value)}else if($B.$isinstance(other, _b_.int)){
    // int subclass
    return _b_.int.__and__(self, other.$brython_value)}
return _b_.NotImplemented`
int.__and__=Function('self','other',model)
int.__lshift__=Function('self','other',model.replace(/&/g,'<<').replace(/__and__/g,'__lshift__'))
int.__rshift__=Function('self','other',model.replace(/&/g,'>>').replace(/__and__/g,'__rshift__'))
int.__or__=Function('self','other',model.replace(/&/g,'|').replace(/__and__/g,'__or__'))
int.__xor__=Function('self','other',model.replace(/&/g,'^').replace(/__and__/g,'__xor__'))
int.__ge__=function(self,other){self=int_value(self)
if(typeof other=="number"){return self >=other}else if(other !==null && other.__class__===$B.long_int){return self >=other.value}else if(typeof other=="boolean"){return self >=other ? 1 :0}else if($B.$isinstance(other,_b_.int)){return self >=other.$brython_value}
return _b_.NotImplemented}
int.__gt__=function(self,other){var res=int.__le__(self,other)
return res===_b_.NotImplemented ? res :! res}
int.__le__=function(self,other){self=int_value(self)
if(typeof other=="number"){return self <=other}else if(other !==null && other.__class__===$B.long_int){return self <=other.value}else if(typeof other=="boolean"){return self <=other ? 1 :0}else if($B.$isinstance(other,_b_.int)){return self <=other.$brython_value}
return _b_.NotImplemented}
int.__lt__=function(self,other){var res=int.__ge__(self,other)
return res===_b_.NotImplemented ? res :! res}
var r_opnames=["add","sub","mul","truediv","floordiv","mod","pow","lshift","rshift","and","xor","or","divmod"]
for(var r_opname of r_opnames){if(int["__r"+r_opname+"__"]===undefined &&
int['__'+r_opname+'__']){int["__r"+r_opname+"__"]=(function(name){return function(self,other){if($B.$isinstance(other,int)){other=int_value(other)
return int["__"+name+"__"](other,self)}
return _b_.NotImplemented}})(r_opname)}}
var $valid_digits=function(base){var digits=""
if(base===0){return "0"}
if(base < 10){for(var i=0;i < base;i++){digits+=String.fromCharCode(i+48)}
return digits}
var digits="0123456789"
for(var i=10;i < base;i++){digits+=String.fromCharCode(i+55)}
return digits}
int.$factory=function(value,base){var missing={},$=$B.args("int",2,{x:null,base:null},["x","base"],arguments,{x:missing,base:missing},null,null,1),value=$.x,base=$.base===undefined ? missing :$.base,initial_value=value,explicit_base=base !==missing
if(value===missing ||value===undefined){if(base !==missing){throw _b_.TypeError.$factory("int() missing string argument")}
return 0}
if($B.$isinstance(value,[_b_.bytes,_b_.bytearray])){
value=$B.$getattr(value,'decode')('latin-1')}else if(explicit_base && ! $B.$isinstance(value,_b_.str)){throw _b_.TypeError.$factory(
"int() can't convert non-string with explicit base")}else if($B.$isinstance(value,_b_.memoryview)){value=$B.$getattr(_b_.memoryview.tobytes(value),'decode')('latin-1')}
if(! $B.$isinstance(value,_b_.str)){if(base !==missing){throw _b_.TypeError.$factory(
"int() can't convert non-string with explicit base")}else{
for(var special_method of['__int__','__index__','__trunc__']){var num_value=$B.$getattr($B.get_class(value),special_method,_b_.None)
if(num_value !==_b_.None){var res=$B.$call(num_value)(value)
if(special_method=='__trunc__'){$B.warn(_b_.DeprecationWarning,'The delegation of int() to __trunc__ is deprecated.')
var index_method=$B.$getattr(res,'__index__',null)
if(index_method===null){throw _b_.TypeError.$factory('__trunc__ returned'+
` non-Integral (type ${$B.class_name(res)})`)}
res=$B.$call(index_method)()}
if($B.$isinstance(res,_b_.int)){if(typeof res !=="number" &&
res.__class__ !==$B.long_int){$B.warn(_b_.DeprecationWarning,special_method+
' returned non-int (type '+$B.class_name(res)+
').  The ability to return an instance of a '+
'strict subclass of int is deprecated, and may '+
'be removed in a future version of Python.')}
return int_value(res)}else{var klass=$B.get_class(res),index_method=$B.$getattr(klass,'__index__',null)
if(index_method===null){throw _b_.TypeError.$factory(special_method+
`returned non-int (type ${$B.class_name(res)})`)}
return int_value(res)}}}
throw _b_.TypeError.$factory(
"int() argument must be a string, a bytes-like object "+
`or a real number, not '${$B.class_name(value)}'`)}}
base=base===missing ? 10:$B.PyNumber_Index(base)
if(!(base >=2 && base <=36)){
if(base !=0){throw _b_.ValueError.$factory("invalid base")}}
function invalid(base){throw _b_.ValueError.$factory("invalid literal for int() with base "+
base+": "+_b_.repr(initial_value))}
if(typeof value !="string"){
value=_b_.str.$to_string(value)}
var _value=value.trim(),
sign=''
if(_value.startsWith('+')||_value.startsWith('-')){var sign=_value[0]
_value=_value.substr(1)}
if(_value.length==2 && base==0 &&
(_value=="0b" ||_value=="0o" ||_value=="0x")){throw _b_.ValueError.$factory("invalid value")}
if(_value.endsWith('_')){invalid(base)}
if(value.indexOf('__')>-1){
invalid(base)}
if(_value.length > 2){var _pre=_value.substr(0,2).toUpperCase()
if(base==0){if(_pre=="0B"){base=2}else if(_pre=="0O"){base=8}else if(_pre=="0X"){base=16}else if(_value.startsWith('0')){_value=_value.replace(/_/g,'')
if(_value.match(/^0+$/)){return 0}
invalid(base)}}else if(_pre=="0X" && base !=16){invalid(base)}else if(_pre=="0O" && base !=8){invalid(base)}
if((_pre=="0B" && base==2)||_pre=="0O" ||_pre=="0X"){_value=_value.substr(2)
if(_value.startsWith('_')){
_value=_value.substr(1)}}}
if(base==0){
base=10}
var _digits=$valid_digits(base),_re=new RegExp("^[+-]?["+_digits+"]"+
"["+_digits+"_]*$","i"),match=_re.exec(_value)
if(match===null){
res=0
var coef=1
for(var char of _value){if(/\p{Nd}/u.test(char)){
var cp=char.codePointAt(0)
for(var start of $B.digits_starts){if(cp-start < 10){digit=cp-start
break}}}else{if(base > 10 && _digits.indexOf(char.toUpperCase())>-1){digit=char.toUpperCase().charCodeAt(0)-55}else{invalid(base)}}
if(digit < base){res=$B.rich_op('__mul__',res,base)
res=$B.rich_op('__add__',res,digit)}else{invalid(base)}}
return res}else{_value=_value.replace(/_/g,"")}
if(base==2){res=BigInt('0b'+_value)}else if(base==8){res=BigInt('0o'+_value)}else if(base==16){res=BigInt('0x'+_value)}else{if($B.int_max_str_digits !=0 &&
_value.length > $B.int_max_str_digits){throw _b_.ValueError.$factory("Exceeds the limit "+
`(${$B.int_max_str_digits}) for integer string conversion: `+
`value has ${value.length} digits; use `+
"sys.set_int_max_str_digits() to increase the limit.")}
if(base==10){res=BigInt(_value)}else{
base=BigInt(base)
var res=0n,coef=1n,char
for(var i=_value.length-1;i >=0;i--){char=_value[i].toUpperCase()
res+=coef*BigInt(_digits.indexOf(char))
coef*=base}}}
if(sign=='-'){res=-res}
return int_or_long(res)}
$B.set_func_names(int,"builtins")
_b_.int=int
$B.$bool=function(obj,bool_class){
if(obj===null ||obj===undefined ){return false}
switch(typeof obj){case "boolean":
return obj
case "number":
case "string":
if(obj){return true}
return false
default:
if(obj.$is_class){return true}
var klass=$B.get_class(obj),missing={},bool_method=bool_class ?
$B.$getattr(klass,"__bool__",missing):
$B.$getattr(obj,"__bool__",missing)
var test=false 
if(test){console.log('bool(obj)',obj,'bool_class',bool_class,'klass',klass,'apply bool method',bool_method)
console.log('$B.$call(bool_method)',bool_method+'')}
if(bool_method===missing){var len_method=$B.$getattr(klass,'__len__',missing)
if(len_method===missing){return true}
return len_method(obj)> 0}else{try{var res=bool_class ?
$B.$call(bool_method)(obj):
$B.$call(bool_method)()}catch(err){throw err}
if(res !==true && res !==false){throw _b_.TypeError.$factory("__bool__ should return "+
"bool, returned "+$B.class_name(res))}
if(test){console.log('bool method returns',res)}
return res}}}
var bool={__bases__:[int],__class__:_b_.type,__mro__:[int,_b_.object],__qualname__:'bool',$is_class:true,$not_basetype:true,
$native:true,$descriptors:{"numerator":true,"denominator":true,"imag":true,"real":true}}
bool.__and__=function(self,other){if($B.$isinstance(other,bool)){return self && other}else if($B.$isinstance(other,int)){return int.__and__(bool.__index__(self),int.__index__(other))}
return _b_.NotImplemented}
bool.__float__=function(self){return self ? $B.fast_float(1):$B.fast_float(0)}
bool.__hash__=bool.__index__=bool.__int__=function(self){if(self.valueOf())return 1
return 0}
bool.__neg__=function(self){return-$B.int_or_bool(self)}
bool.__or__=function(self,other){if($B.$isinstance(other,bool)){return self ||other}else if($B.$isinstance(other,int)){return int.__or__(bool.__index__(self),int.__index__(other))}
return _b_.NotImplemented}
bool.__pos__=$B.int_or_bool
bool.__repr__=function(self){$B.builtins_repr_check(bool,arguments)
return self ? "True" :"False"}
bool.__xor__=function(self,other){if($B.$isinstance(other,bool)){return self ^ other ? true :false}else if($B.$isinstance(other,int)){return int.__xor__(bool.__index__(self),int.__index__(other))}
return _b_.NotImplemented}
bool.$factory=function(){
var $=$B.args("bool",1,{x:null},["x"],arguments,{x:false},null,null)
return $B.$bool($.x,true)}
bool.numerator=int.numerator
bool.denominator=int.denominator
bool.real=int.real
bool.imag=int.imag
_b_.bool=bool
$B.set_func_names(bool,"builtins")})(__BRYTHON__)
;
;(function($B){
var _b_=$B.builtins
if($B.isWebWorker){window=self}
var long_int={__class__:_b_.type,__mro__:[_b_.int,_b_.object],__qualname__:'int',$infos:{__module__:"builtins",__name__:"int"},$is_class:true,$native:true,$descriptors:{"numerator":true,"denominator":true,"imag":true,"real":true}}
var max_safe_divider=$B.max_int/9
var int_or_long=_b_.int.$int_or_long
var len=((Math.pow(2,53)-1)+'').length-1
function preformat(self,fmt){if(fmt.empty){return _b_.str.$factory(self)}
if(fmt.type && 'bcdoxXn'.indexOf(fmt.type)==-1){throw _b_.ValueError.$factory("Unknown format code '"+fmt.type+
"' for object of type 'int'")}
var res
switch(fmt.type){case undefined:
case "d":
res=self.toString()
break
case "b":
res=(fmt.alternate ? "0b" :"")+BigInt(self.value).toString(2)
break
case "c":
res=_b_.chr(self)
break
case "o":
res=(fmt.alternate ? "0o" :"")+BigInt(self.value).toString(8)
break
case "x":
res=(fmt.alternate ? "0x" :"")+BigInt(self.value).toString(16)
break
case "X":
res=(fmt.alternate ? "0X" :"")+BigInt(self.value).toString(16).toUpperCase()
break
case "n":
return self }
if(fmt.sign !==undefined){if((fmt.sign==" " ||fmt.sign=="+" )&& self >=0){res=fmt.sign+res}}
return res}
long_int.$to_js_number=function(self){return Number(self.value)}
long_int.__format__=function(self,format_spec){var fmt=new $B.parse_format_spec(format_spec,self)
if(fmt.type && 'eEfFgG%'.indexOf(fmt.type)!=-1){
return _b_.float.__format__(self,format_spec)}
fmt.align=fmt.align ||">"
var res=preformat(self,fmt)
if(fmt.comma){var sign=res[0]=="-" ? "-" :"",rest=res.substr(sign.length),len=rest.length,nb=Math.ceil(rest.length/3),chunks=[]
for(var i=0;i < nb;i++){chunks.push(rest.substring(len-3*i-3,len-3*i))}
chunks.reverse()
res=sign+chunks.join(",")}
return $B.format_width(res,fmt)}
long_int.__abs__=function(self){return $B.fast_long_int(self.value > 0 ? self.value :-self.value)}
long_int.__add__=function(self,other){if(typeof other=="number"){return int_or_long(self.value+BigInt(other))}else if(other.__class__===$B.long_int){return int_or_long(self.value+other.value)}else if(typeof other=="boolean"){return int_or_long(self.value+(other ? 1n :0n))}else if($B.$isinstance(other,_b_.int)){return long_int.__add__(self,other.$brython_value)}
return _b_.NotImplemented}
long_int.__divmod__=function(self,other){var a=self.value,b=_b_.int.$to_bigint(other),quotient
if((a >=0 && b > 0)||(a <=0 && b < 0)){quotient=a/b}else{quotient=a/b-1n}
var rest=a-quotient*b
return $B.fast_tuple([int_or_long(quotient),int_or_long(rest)])}
long_int.__eq__=function(self,other){if(other.__class__===$B.long_int){return self.value==other.value}else if(typeof other=="number" ||typeof other=="boolean"){return false}else if($B.$isinstance(other,_b_.int)){return long_int.__eq__(self,other.$brython_value)}
return _b_.NotImplemented}
long_int.__float__=function(self){if(! isFinite(Number(self.value))){throw _b_.OverflowError.$factory("int too large to convert to float")}
return $B.fast_float(Number(self.value))}
long_int.__floordiv__=function(self,other){if(typeof other=="number"){return int_or_long(self.value/BigInt(other))}else if(other.__class__===$B.long_int){return int_or_long(self.value/other.value)}else if(typeof other=="boolean"){return int_or_long(self.value/(other ? 1n :0n))}else if($B.$isinstance(other,_b_.int)){return int_or_long(self.value/other.$brython_value)}
return _b_.NotImplemented}
long_int.__ge__=function(self,other){if(typeof other=="number"){return self.value >=other}else if(other.__class__===$B.long_int){return self.value >=other.value}else if(typeof other=="boolean"){return self.value >=(other ? 1 :0)}else if($B.$isinstance(other,_b_.int)){return self.value >=other.$brython_value}
return _b_.NotImplemented}
long_int.__gt__=function(self,other){var res=long_int.__le__(self,other)
return res===_b_.NotImplemented ? res :! res}
long_int.__hash__=function(self){var modulus=2305843009213693951n,sign=self.value >=0 ? 1n :-1n
self_pos=self.value*sign
var _hash=sign*(self_pos % modulus)
return self.__hashvalue__=int_or_long(_hash)}
long_int.__index__=function(self){return self}
long_int.__invert__=function(self){return int_or_long(-1n-self.value)}
long_int.__le__=function(self,other){if(typeof other=="number"){return self.value <=other}else if(other.__class__===$B.long_int){return self.value <=other.value}else if(typeof other=="boolean"){return self.value <=(other ? 1 :0)}else if($B.$isinstance(other,_b_.int)){return self.value <=other.$brython_value}
return _b_.NotImplemented}
long_int.__lt__=function(self,other){var res=long_int.__ge__(self,other)
return res===_b_.NotImplemented ? res :! res}
long_int.__lshift__=function(self,other){if(typeof other=="number"){return int_or_long(self.value << BigInt(other))}else if(other.__class__===$B.long_int){return int_or_long(self.value << other.value)}else if(typeof other=="boolean"){return int_or_long(self.value <<(other ? 1n :0n))}else if($B.$isinstance(other,_b_.int)){return long_int.__lshift__(self,other.$brython_value)}
return _b_.NotImplemented}
long_int.__mod__=function(self,other){if(typeof other=="number"){return int_or_long(self.value % BigInt(other))}else if(other.__class__===$B.long_int){var n=self.value,m=other.value
return int_or_long(((n % m)+m)% m)}else if(typeof other=="boolean"){return int_or_long(self.value %(other ? 1n :0n))}else if($B.$isinstance(other,_b_.int)){return long_int.__mod__(self,other.$brython_value)}
return _b_.NotImplemented}
long_int.__mro__=[_b_.int,_b_.object]
long_int.__mul__=function(self,other){if(typeof other=="number"){return int_or_long(self.value*BigInt(other))}else if(typeof other=="boolean"){return int_or_long(self.value*(other ? 1n :0n))}else if(other.__class__===$B.long_int){return int_or_long(self.value*other.value)}else if($B.$isinstance(other,_b_.int)){
return long_int.__mul__(self,other.$brython_value)}
return _b_.NotImplemented}
long_int.__ne__=function(self,other){var res=long_int.__eq__(self,other)
return res===_b_.NotImplemented ? res :!res}
long_int.__neg__=function(self){return $B.fast_long_int(-self.value)}
long_int.__pos__=function(self){return self}
long_int.__pow__=function(self,power,z){if(z !==undefined){return _b_.int.__pow__(self,power,z)}
if(typeof power=="number"){return int_or_long(self.value**BigInt(power))}else if(typeof power=="boolean"){return int_or_long(self.value**power ? 1n :0n)}else if(power.__class__===$B.long_int){return int_or_long(self.value**power.value)}else if($B.$isinstance(power,_b_.int)){
return long_int.__pow__(self,power.$brython_value)}
return _b_.NotImplemented}
long_int.__rshift__=function(self,other){if(typeof other=="number"){return int_or_long(self.value >> BigInt(other))}else if(other.__class__===$B.long_int){return int_or_long(self.value >> other.value)}else if(typeof other=="boolean"){return int_or_long(self.value >>(other ? 1n :0n))}else if($B.$isinstance(other,_b_.int)){return long_int.__rshift__(self,other.$brython_value)}
return _b_.NotImplemented}
long_int.__repr__=function(self){$B.builtins_repr_check($B.long_int,arguments)
if($B.int_max_str_digits !=0 &&
self.value >=10n**BigInt($B.int_max_str_digits)){throw _b_.ValueError.$factory(`Exceeds the limit `+
`(${$B.int_max_str_digits}) for integer string conversion`)}
return self.value.toString()}
long_int.__sub__=function(self,other){if(typeof other=="number"){return int_or_long(self.value-BigInt(other))}else if(typeof other=="boolean"){return int_or_long(self.value-(other ? 1n :0n))}else if(other.__class__===$B.long_int){return int_or_long(self.value-other.value)}else if($B.$isinstance(other,_b_.int)){
return long_int.__sub__(self,other.$brython_value)}
return _b_.NotImplemented}
long_int.__truediv__=function(self,other){if(typeof other=="number"){return $B.fast_float(Number(self.value)/other)}else if(typeof other=="boolean"){return $B.fast_float(Number(self.value)*(other ? 1 :0))}else if(other.__class__===$B.long_int){return $B.fast_float(Number(self.value)/Number(other.value))}else if($B.$isinstance(other,_b_.int)){
return long_int.__truediv__(self,other.$brython_value)}
return _b_.NotImplemented}
long_int.bit_count=function(self){var s=self.value.toString(2),nb=0
for(var x of s){if(x=='1'){nb++}}
return nb}
long_int.bit_length=function(self){return self.value.toString(2).length}
function _infos(self){
var nbits=$B.long_int.bit_length(self),pow2=2n**BigInt(nbits-1),rest=BigInt(self.value)-pow2,relative_rest=new Number(rest/pow2)
return{nbits,pow2,rest,relative_rest}}
long_int.$log2=function(x){if(x.value < 0){throw _b_.ValueError.$factory('math domain error')}
var infos=_infos(x)
return _b_.float.$factory(infos.nbits-1+
Math.log(1+infos.relative_rest/Math.LN2))}
long_int.$log10=function(x){if(x.value < 0){throw _b_.ValueError.$factory('math domain error')}
var x_string=x.value.toString(),exp=x_string.length-1,mant=parseFloat(x_string[0]+'.'+x_string.substr(1))
return _b_.float.$factory(exp+Math.log10(mant))}
long_int.numerator=function(self){return self}
long_int.denominator=function(self){return _b_.int.$factory(1)}
long_int.imag=function(self){return _b_.int.$factory(0)}
long_int.real=function(self){return self}
var body=
`var $B = __BRYTHON__,
    _b_ = $B.builtins
if(typeof other == "number"){
    return _b_.int.$int_or_long(self.value & BigInt(other))}else if(typeof other == "boolean"){
    return _b_.int.$int_or_long(self.value & (other ? 1n : 0n))}else if(other.__class__ === $B.long_int){
    return _b_.int.$int_or_long(self.value & other.value)}else if($B.$isinstance(other, _b_.int)){
    // int subclass
    return $B.long_int.__and__(self, other.$brython_value)}
return _b_.NotImplemented`
long_int.__and__=Function('self','other',body)
long_int.__or__=Function('self','other',body.replace(/&/g,'|').replace(/__and__/g,'__or__'))
long_int.__xor__=Function('self','other',body.replace(/&/g,'^').replace(/__and__/g,'__xor__'))
long_int.to_bytes=function(self,len,byteorder,signed){
var res=[],v=self.value
if(! $B.$bool(signed)&& v < 0){throw _b_.OverflowError.$factory("can't convert negative int to unsigned")}
while(v > 0){var quot=v/256n,rest=v-quot*256n
v=quot
res.push(Number(rest))
if(res.length > len){throw _b_.OverflowError.$factory("int too big to convert")}}
while(res.length < len){res.push(0)}
if(byteorder=='big'){res.reverse()}
return _b_.bytes.$factory(res)}
function digits(base){
var is_digits={}
for(var i=0;i < base;i++){if(i==10){break}
is_digits[i]=i}
if(base > 10){
for(var i=0;i < base-10;i++){is_digits[String.fromCharCode(65+i)]=10+i
is_digits[String.fromCharCode(97+i)]=10+i}}
return is_digits}
var MAX_SAFE_INTEGER=Math.pow(2,53)-1
var MIN_SAFE_INTEGER=-MAX_SAFE_INTEGER
function isSafeInteger(n){return(typeof n==="number" &&
Math.round(n)===n &&
MIN_SAFE_INTEGER <=n &&
n <=MAX_SAFE_INTEGER)}
function intOrLong(long){
var v=parseInt(long.value)*(long.pos ? 1 :-1)
if(v > MIN_SAFE_INTEGER && v < MAX_SAFE_INTEGER){return v}
return long}
long_int.$from_int=function(value){return{__class__:long_int,value:value.toString(),pos:value > 0}}
long_int.$factory=function(value,base){
var is_digits=digits(base)
for(var i=0;i < value.length;i++){if(is_digits[value.charAt(i)]===undefined){throw _b_.ValueError.$factory(
'int argument is not a valid number: "'+value+'"')}}
var res
if(base==10){res=BigInt(value)}else if(base==16){res=BigInt('0x'+value)}else if(base==8){res=BigInt('0o'+value)}else{base=BigInt(base)
var res=0n,coef=1n,char
for(var i=value.length-1;i >=0;i--){char=value[i].toUpperCase()
res+=coef*BigInt(is_digits[char])
coef*=base}}
return{__class__:$B.long_int,value:res}}
function extended_euclidean_algorithm(a,b){
var s=0,old_s=1,t=1,old_t=0,r=b,old_r=a,quotient,tmp
while($B.rich_comp('__ne__',r,0)){quotient=$B.rich_op('__floordiv__',old_r,r)
tmp=$B.rich_op('__sub__',old_r,$B.rich_op('__mul__',quotient,r))
old_r=r
r=tmp
tmp=$B.rich_op('__sub__',old_s,$B.rich_op('__mul__',quotient,s))
old_s=s
s=tmp
tmp=$B.rich_op('__sub__',old_t,$B.rich_op('__mul__',quotient,t))
old_t=t
t=tmp}
return[old_r,old_s,old_t]}
function inverse_of(n,p){
var gcd,x,y
[gcd,x,y]=extended_euclidean_algorithm(n,p)
if($B.rich_comp('__ne__',gcd,1)){
throw Error(
`${n} has no multiplicative inverse '
            'modulo ${p}`)}else{return $B.rich_op('__mod__',x,p)}}
$B.inverse_of=inverse_of
$B.set_func_names(long_int,"builtins")
$B.long_int=long_int
$B.fast_long_int=function(value){if(typeof value !=='bigint'){console.log('expected bigint, got',value)
throw Error('not a big int')}
return{
__class__:$B.long_int,value:value}}})(__BRYTHON__)
;
;(function($B){var _b_=$B.builtins
var object=_b_.object
function $err(op,other){var msg="unsupported operand type(s) for "+op+
": 'float' and '"+$B.class_name(other)+"'"
throw _b_.TypeError.$factory(msg)}
function float_value(obj){return obj.__class__===float ? obj :fast_float(obj.value)}
var float={__class__:_b_.type,__dir__:object.__dir__,__qualname__:'float',$is_class:true,$native:true,$descriptors:{"numerator":true,"denominator":true,"imag":true,"real":true}}
float.$float_value=float_value
float.$to_js_number=function(self){if(self.__class__===float){return self.value}else{return float.$to_js_number(self.value)}}
float.numerator=function(self){return self}
float.denominator=function(self){return 1}
float.imag=function(self){return 0}
float.real=function(self){return self}
float.__float__=function(self){return self}
$B.shift1_cache={}
float.as_integer_ratio=function(self){if(isinf(self)){throw _b_.OverflowError.$factory("Cannot pass infinity to "+
"float.as_integer_ratio.")}
if(isnan(self)){throw _b_.ValueError.$factory("Cannot pass NaN to "+
"float.as_integer_ratio.")}
var tmp=frexp(self),fp=tmp[0],exponent=tmp[1]
for(var i=0;i < 300;i++){if(fp==Math.floor(fp)){break}else{fp*=2
exponent--}}
numerator=_b_.int.$factory(fp)
py_exponent=_b_.abs(exponent)
denominator=1
var x
if($B.shift1_cache[py_exponent]!==undefined){x=$B.shift1_cache[py_exponent]}else{x=$B.$getattr(1,"__lshift__")(py_exponent)
$B.shift1_cache[py_exponent]=x}
py_exponent=x
if(exponent > 0){numerator=$B.rich_op("__mul__",numerator,py_exponent)}else{denominator=py_exponent}
return $B.fast_tuple([_b_.int.$factory(numerator),_b_.int.$factory(denominator)])}
function check_self_is_float(x,method){if(x.__class__===_b_.float ||$B.$isinstance(x,_b_.float)){return true}
throw _b_.TypeError.$factory(`descriptor '${method}' requires a `+
`'float' object but received a '${$B.class_name(x)}'`)}
float.__abs__=function(self){check_self_is_float(self,'__abs__')
return fast_float(Math.abs(self.value))}
float.__bool__=function(self){check_self_is_float(self,'__bool__')
return _b_.bool.$factory(self.value)}
float.__ceil__=function(self){check_self_is_float(self,'__ceil__')
if(isnan(self)){throw _b_.ValueError.$factory('cannot convert float NaN to integer')}else if(isinf(self)){throw _b_.OverflowError.$factory('cannot convert float infinity to integer')}
return Math.ceil(self.value)}
float.__divmod__=function(self,other){check_self_is_float(self,'__divmod__')
if(! $B.$isinstance(other,[_b_.int,float])){return _b_.NotImplemented}
return $B.fast_tuple([float.__floordiv__(self,other),float.__mod__(self,other)])}
float.__eq__=function(self,other){check_self_is_float(self,'__eq__')
if(isNaN(self.value)&&
($B.$isinstance(other,float)&& isNaN(other.value))){return false}
if($B.$isinstance(other,_b_.int)){return self.value==other}
if($B.$isinstance(other,float)){return self.value==other.value}
if($B.$isinstance(other,_b_.complex)){if(! $B.rich_comp('__eq__',0,other.$imag)){return false}
return float.__eq__(self,other.$real)}
return _b_.NotImplemented}
float.__floor__=function(self){check_self_is_float(self,'__floor__')
if(isnan(self)){throw _b_.ValueError.$factory('cannot convert float NaN to integer')}else if(isinf(self)){throw _b_.OverflowError.$factory('cannot convert float infinity to integer')}
return Math.floor(self.value)}
float.__floordiv__=function(self,other){check_self_is_float(self,'__floordiv__')
if($B.$isinstance(other,float)){if(other.value==0){throw _b_.ZeroDivisionError.$factory('division by zero')}
return fast_float(Math.floor(self.value/other.value))}
if($B.$isinstance(other,_b_.int)){if(other.valueOf()==0){throw _b_.ZeroDivisionError.$factory('division by zero')}
return fast_float(Math.floor(self.value/other))}
return _b_.NotImplemented}
const DBL_MANT_DIG=53,LONG_MAX=__BRYTHON__.MAX_VALUE,DBL_MAX_EXP=2**10,LONG_MIN=__BRYTHON__.MIN_VALUE,DBL_MIN_EXP=-1021
float.fromhex=function(klass,s){function hex_from_char(char){return parseInt(char,16)}
function finished(){
while(s[pos]&& s[pos].match(/\s/)){pos++;}
if(pos !=s.length){throw parse_error()}
if(negate){x=float.__neg__(x)}
return klass===_b_.float ? x :$B.$call(klass)(x)}
function overflow_error(){throw _b_.OverflowError.$factory(
"hexadecimal value too large to represent as a float");}
function parse_error(){throw _b_.ValueError.$factory(
"invalid hexadecimal floating-point string");}
function insane_length_error(){throw _b_.ValueError.$factory(
"hexadecimal string too long to convert");}
s=s.trim()
var re_parts=[/^(?<sign>[+-])?(0x)?/,/(?<integer>[0-9a-fA-F]+)?/,/(?<fraction>\.(?<fvalue>[0-9a-fA-F]+))?/,/(?<exponent>p(?<esign>[+-])?(?<evalue>\d+))?$/]
var re=new RegExp(re_parts.map(r=> r.source).join(''))
var mo=re.exec(s)
if(s.match(/^\+?inf(inity)?$/i)){return INF}else if(s.match(/^-inf(inity)?$/i)){return NINF}else if(s.match(/^[+-]?nan$/i)){return NAN}
var pos=0,negate,ldexp=_b_.float.$funcs.ldexp
if(s[pos]=='-'){pos++;
negate=1;}else if(s[pos]=='+'){pos++}
if(s.substr(pos,2).toLowerCase()=='0x'){pos+=2}
var coeff_start=pos,coeff_end
while(hex_from_char(s[pos])>=0){pos++;}
save_pos=pos;
if(s[pos]=='.'){pos++;
while(hex_from_char(s[pos])>=0){pos++;}
coeff_end=pos-1;}else{coeff_end=pos;}
ndigits=coeff_end-coeff_start;
fdigits=coeff_end-save_pos;
if(ndigits==0){throw parse_error()}
if(ndigits > Math.min(DBL_MIN_EXP-DBL_MANT_DIG-LONG_MIN/2,LONG_MAX/2+1-DBL_MAX_EXP)/4){throw insane_length_error()}
var exp
if(s[pos]=='p' ||s[pos]=='P'){pos++;
var exp_start=pos;
if(s[pos]=='-' ||s[pos ]=='+'){pos++;}
if(!('0' <=s[pos]&& s[pos]<='9')){throw parse_error()}
pos++;
while('0' <=s[pos]&& s[pos]<='9'){pos++;}
exp=parseInt(s.substr(exp_start));}else{exp=0;}
function HEX_DIGIT(j){if(! Number.isInteger(j)){throw Error('j pas entier')}
var pos=j < fdigits ? coeff_end-j :coeff_end-1-j
return hex_from_char(s[j < fdigits ?
coeff_end-j :
coeff_end-1-j])}
while(ndigits > 0 && HEX_DIGIT(ndigits-1)==0){ndigits--;}
if(ndigits==0 ||exp < LONG_MIN/2){x=ZERO;
return finished()}
if(exp > LONG_MAX/2){console.log('overflow, exp',exp)
throw overflow_error();}
exp=exp-4*fdigits;
var top_exp=exp+4*(ndigits-1);
for(var digit=BigInt(HEX_DIGIT(ndigits-1));digit !=0;digit/=2n){top_exp++;}
if(top_exp < DBL_MIN_EXP-DBL_MANT_DIG){x=ZERO;
return finished()}
if(top_exp > DBL_MAX_EXP){throw overflow_error()}
var lsb=Math.max(top_exp,DBL_MIN_EXP)-DBL_MANT_DIG;
var x=0.0;
if(exp >=lsb){
for(var i=ndigits-1;i >=0;i--){x=16.0*x+HEX_DIGIT(i);}
x=ldexp($B.fast_float(x),exp);
return finished()}
var half_eps=1 <<((lsb-exp-1)% 4),key_digit=parseInt((lsb-exp-1)/4);
for(var i=ndigits-1;i > key_digit;i--){x=16.0*x+HEX_DIGIT(i);}
var digit=HEX_DIGIT(key_digit);
x=16.0*x+(digit &(16-2*half_eps));
if((digit & half_eps)!=0){var round_up=0;
if((digit &(3*half_eps-1))!=0 ||(half_eps==8 &&
key_digit+1 < ndigits &&(HEX_DIGIT(key_digit+1)& 1)!=0)){round_up=1;}else{for(var i=key_digit-1;i >=0;i--){if(HEX_DIGIT(i)!=0){round_up=1;
break;}}}
if(round_up){x+=2*half_eps;
if(top_exp==DBL_MAX_EXP &&
x==ldexp(2*half_eps,DBL_MANT_DIG).value){
throw overflow_error()}}}
x=ldexp(x,(exp+4*key_digit));
return finished()}
float.__getformat__=function(arg){if(arg=="double" ||arg=="float"){return "IEEE, little-endian"}
if(typeof arg !=='string'){throw _b_.TypeError.$factory(
" __getformat__() argument must be str, not "+
$B.class_name(arg))}
throw _b_.ValueError.$factory("__getformat__() argument 1 must be "+
"'double' or 'float'")}
var format_sign=function(val,flags){switch(flags.sign){case '+':
return(val >=0 ||isNaN(val))? '+' :''
case '-':
return ''
case ' ':
return(val >=0 ||isNaN(val))? ' ' :''}
if(flags.space){if(val >=0){return " "}}
return ''}
function preformat(self,fmt){var value=self.value
if(fmt.empty){return _b_.str.$factory(self)}
if(fmt.type && 'eEfFgGn%'.indexOf(fmt.type)==-1){throw _b_.ValueError.$factory("Unknown format code '"+fmt.type+
"' for object of type 'float'")}
var special
if(isNaN(value)){special="efg".indexOf(fmt.type)>-1 ? "nan" :"NAN"}else if(value==Number.POSITIVE_INFINITY){special="efg".indexOf(fmt.type)>-1 ? "inf" :"INF"}else if(value==Number.NEGATIVE_INFINITY){special="efg".indexOf(fmt.type)>-1 ? "-inf" :"-INF"}
if(special){return format_sign(value,fmt)+special}
if(fmt.precision===undefined && fmt.type !==undefined){fmt.precision=6}
if(fmt.type=="%"){value*=100}
if(fmt.type=="e"){var res=value.toExponential(fmt.precision),exp=parseInt(res.substr(res.search("e")+1))
if(Math.abs(exp)< 10){res=res.substr(0,res.length-1)+"0"+
res.charAt(res.length-1)}
return res}
if(fmt.precision !==undefined){
var prec=fmt.precision
if(prec==0){return Math.round(value)+""}
var res=$B.roundDownToFixed(value,prec),
pt_pos=res.indexOf(".")
if(fmt.type !==undefined &&
(fmt.type=="%" ||fmt.type.toLowerCase()=="f")){if(pt_pos==-1){res+="."+"0".repeat(fmt.precision)}else{var missing=fmt.precision-res.length+pt_pos+1
if(missing > 0){res+="0".repeat(missing)}}}else if(fmt.type && fmt.type.toLowerCase()=="g"){var exp_fmt=preformat(self,{type:"e"}).split("e"),exp=parseInt(exp_fmt[1])
if(-4 <=exp && exp < fmt.precision){res=preformat(self,{type:"f",precision:fmt.precision-1-exp})}else{res=preformat(self,{type:"e",precision:fmt.precision-1})}
var parts=res.split("e")
if(fmt.alternate){if(parts[0].search(/\./)==-1){parts[0]+='.'}}else{var signif=parts[0]
if(signif.indexOf('.')> 0){while(signif.endsWith("0")){signif=signif.substr(0,signif.length-1)}}
if(signif.endsWith(".")){signif=signif.substr(0,signif.length-1)}
parts[0]=signif}
res=parts.join("e")
if(fmt.type=="G"){res=res.toUpperCase()}
return res}else if(fmt.type===undefined){
fmt.type="g"
res=preformat(self,fmt)
if(res.indexOf('.')==-1){var exp=res.length-1,exp=exp < 10 ? '0'+exp :exp,is_neg=res.startsWith('-'),point_pos=is_neg ? 2 :1,mant=res.substr(0,point_pos)+'.'+
res.substr(point_pos)
return `${mant}e+${exp}`}
fmt.type=undefined}else{var res1=value.toExponential(fmt.precision-1),exp=parseInt(res1.substr(res1.search("e")+1))
if(exp <-4 ||exp >=fmt.precision-1){var elts=res1.split("e")
while(elts[0].endsWith("0")){elts[0]=elts[0].substr(0,elts[0].length-1)}
res=elts.join("e")}}}else{var res=_b_.str.$factory(self)}
if(fmt.type===undefined ||"gGn".indexOf(fmt.type)!=-1){
if(res.search("e")==-1){while(res.charAt(res.length-1)=="0"){res=res.substr(0,res.length-1)}}
if(res.charAt(res.length-1)=="."){if(fmt.type===undefined){res+="0"}else{res=res.substr(0,res.length-1)}}}
if(fmt.sign !==undefined){if((fmt.sign==" " ||fmt.sign=="+" )&& value > 0){res=fmt.sign+res}}
if(fmt.type=="%"){res+="%"}
return res}
float.__format__=function(self,format_spec){check_self_is_float(self,'__format__')
var fmt=new $B.parse_format_spec(format_spec,self)
return float.$format(self,fmt)}
float.$format=function(self,fmt){
fmt.align=fmt.align ||">"
var pf=preformat(self,fmt)
if(fmt.z && Object.is(parseFloat(pf),-0)){
pf=pf.substr(1)}
var raw=pf.split('.'),_int=raw[0]
if(fmt.comma){var len=_int.length,nb=Math.ceil(_int.length/3),chunks=[]
for(var i=0;i < nb;i++){chunks.push(_int.substring(len-3*i-3,len-3*i))}
chunks.reverse()
raw[0]=chunks.join(",")}
return $B.format_width(raw.join("."),fmt)}
float.$getnewargs=function(self){return $B.fast_tuple([float_value(self)])}
float.__getnewargs__=function(){return float.$getnewargs($B.single_arg('__getnewargs__','self',arguments))}
var nan_hash=$B.$py_next_hash--
var mp2_31=Math.pow(2,31)
$B.float_hash_cache=new Map()
float.__hash__=function(self){check_self_is_float(self,'__hash__')
return float.$hash_func(self)}
float.$hash_func=function(self){if(self.__hashvalue__ !==undefined){return self.__hashvalue__}
var _v=self.value
var in_cache=$B.float_hash_cache.get(_v)
if(in_cache !==undefined){return in_cache}
if(_v===Infinity){return 314159}else if(_v===-Infinity){return-314159}else if(isNaN(_v)){return self.__hashvalue__=nan_hash}else if(_v===Number.MAX_VALUE){return self.__hashvalue__=$B.fast_long_int(2234066890152476671n)}
if(Number.isInteger(_v)){return _b_.int.__hash__(_v)}
var r=frexp(self)
r[0]*=mp2_31
var hipart=parseInt(r[0])
r[0]=(r[0]-hipart)*mp2_31
var x=hipart+parseInt(r[0])+(r[1]<< 15)
x &=0xFFFFFFFF
$B.float_hash_cache.set(_v,x)
return self.__hashvalue__=x}
function isninf(x){var x1=float_value(x).value
return x1==-Infinity ||x1==Number.NEGATIVE_INFINITY}
function isinf(x){var x1=float_value(x).value
return x1==Infinity ||x1==-Infinity ||
x1==Number.POSITIVE_INFINITY ||x1==Number.NEGATIVE_INFINITY}
function isnan(x){var x1=float_value(x).value
return isNaN(x1)}
function fabs(x){if(x==0){return fast_float(0)}
return x > 0 ? float.$factory(x):float.$factory(-x)}
function frexp(x){
var x1=x
if($B.$isinstance(x,float)){
if(isnan(x)||isinf(x)){return[x,0]}
x1=float_value(x).value}else if($B.$isinstance(x,$B.long_int)){var exp=x.value.toString(2).length,power=2n**BigInt(exp)
return[$B.fast_float(Number(x.value)/Number(power)),exp]}
if(x1==0){return[0,0]}
var sign=1,ex=0,man=x1
if(man < 0.){sign=-sign
man=-man}
while(man < 0.5){man*=2.0
ex--}
while(man >=1.0){man*=0.5
ex++}
man*=sign
return[man,ex]}
function ldexp(mantissa,exponent){if(isninf(mantissa)){return NINF}else if(isinf(mantissa)){return INF}
if($B.$isinstance(mantissa,_b_.float)){mantissa=mantissa.value}
if(mantissa==0){return ZERO}else if(isNaN(mantissa)){return NAN}
if($B.$isinstance(exponent,$B.long_int)){if(exponent.value < 0){return ZERO}else{throw _b_.OverflowError.$factory('overflow')}}else if(! isFinite(mantissa*Math.pow(2,exponent))){throw _b_.OverflowError.$factory('overflow')}
var steps=Math.min(3,Math.ceil(Math.abs(exponent)/1023));
var result=mantissa;
for(var i=0;i < steps;i++){result*=Math.pow(2,Math.floor((exponent+i)/steps));}
return fast_float(result);}
float.$funcs={isinf,isninf,isnan,fabs,frexp,ldexp}
float.hex=function(self){
self=float_value(self)
var TOHEX_NBITS=DBL_MANT_DIG+3-(DBL_MANT_DIG+2)% 4
if(isNaN(self.value)||! isFinite(self.value)){return _b_.repr(self)}
if(self.value==0){return Object.is(self.value,0)? "0x0.0p0" :"-0x0.0p0"}
var _a=frexp(fabs(self.value)),_m=_a[0],_e=_a[1],_shift=1-Math.max(-1021-_e,0)
_m=ldexp(fast_float(_m),_shift).value
_e-=_shift
var _int2hex="0123456789ABCDEF".split(""),_s=_int2hex[Math.floor(_m)]
_s+='.'
_m-=Math.floor(_m)
for(var i=0;i <(TOHEX_NBITS-1)/4;i++){_m*=16.0
_s+=_int2hex[Math.floor(_m)]
_m-=Math.floor(_m)}
var _esign="+"
if(_e < 0){_esign="-"
_e=-_e}
if(self.value < 0){return "-0x"+_s+"p"+_esign+_e}
return "0x"+_s+"p"+_esign+_e}
float.__init__=function(self,value){return _b_.None}
float.__int__=function(self){check_self_is_float(self,'__int__')
if(Number.isInteger(self.value)){var res=BigInt(self.value),res_num=Number(res)
return Number.isSafeInteger(res_num)?
res_num :
$B.fast_long_int(res)}
return Math.trunc(self.value)}
float.is_integer=function(self){return Number.isInteger(self.value)}
float.__mod__=function(self,other){
check_self_is_float(self,'__mod__')
if(other==0){throw _b_.ZeroDivisionError.$factory("float modulo")}
if($B.$isinstance(other,_b_.int)){other=_b_.int.numerator(other)
return fast_float((self.value % other+other)% other)}
if($B.$isinstance(other,float)){
var q=Math.floor(self.value/other.value),r=self.value-other.value*q
if(r==0 && other.value < 0){return fast_float(-0)}
return fast_float(r)}
return _b_.NotImplemented}
float.__mro__=[object]
float.__mul__=function(self,other){if($B.$isinstance(other,_b_.int)){if(other.__class__==$B.long_int){return fast_float(self.value*parseFloat(other.value))}
other=_b_.int.numerator(other)
return fast_float(self.value*other)}
if($B.$isinstance(other,float)){return fast_float(self.value*other.value)}
return _b_.NotImplemented}
float.__ne__=function(self,other){var res=float.__eq__(self,other)
return res===_b_.NotImplemented ? res :! res}
float.__neg__=function(self){return fast_float(-self.value)}
float.__new__=function(cls,value){if(cls===undefined){throw _b_.TypeError.$factory("float.__new__(): not enough arguments")}else if(! $B.$isinstance(cls,_b_.type)){throw _b_.TypeError.$factory("float.__new__(X): X is not a type object")}
return{
__class__:cls,value:float.$factory(value).value}}
float.__pos__=function(self){return fast_float(+self.value)}
float.__pow__=function(self,other){var other_int=$B.$isinstance(other,_b_.int)
if(other_int ||$B.$isinstance(other,float)){if(! other_int){other=other.value}
if(self.value==1){return fast_float(1)}else if(other==0){return fast_float(1)}
if(isNaN(other)){return fast_float(Number.NaN)}
if(isNaN(self.value)){return fast_float(Number.NaN)}
if(self.value==-1 && ! isFinite(other)){
return fast_float(1)}else if(self.value==0 && isFinite(other)&& other < 0){throw _b_.ZeroDivisionError.$factory("0.0 cannot be raised "+
"to a negative power")}else if(self.value==0 && isFinite(other)&& other >=0){
if(Number.isInteger(other)&& other % 2==1){return self}
return fast_float(0)}else if(self.value==Number.NEGATIVE_INFINITY && ! isNaN(other)){
if(other % 2==-1){return fast_float(-0.0)}else if(other < 0){return fast_float(0)}else if(other % 2==1){return fast_float(Number.NEGATIVE_INFINITY)}else{return fast_float(Number.POSITIVE_INFINITY)}}else if(self.value==Number.POSITIVE_INFINITY && ! isNaN(other)){return other > 0 ? self :fast_float(0)}
if(other==Number.NEGATIVE_INFINITY && ! isNaN(self.value)){
return Math.abs(self.value)< 1 ?
fast_float(Number.POSITIVE_INFINITY):
fast_float(0)}else if(other==Number.POSITIVE_INFINITY && ! isNaN(self.value)){
return Math.abs(self.value)< 1 ?
fast_float(0):
fast_float(Number.POSITIVE_INFINITY)}
if(self.value < 0 && ! Number.isInteger(other)){return _b_.complex.__pow__($B.make_complex(self.value,0),fast_float(other))}
return fast_float(Math.pow(self.value,other))}
return _b_.NotImplemented}
float.__repr__=function(self){$B.builtins_repr_check(float,arguments)
self=self.value
if(self==Infinity){return 'inf'}else if(self==-Infinity){return '-inf'}else if(isNaN(self)){return 'nan'}else if(self===0){if(1/self===-Infinity){return '-0.0'}
return '0.0'}
var res=self+"" 
if(res.search(/[.eE]/)==-1){res+=".0"}
var split_e=res.split(/e/i)
if(split_e.length==2){var mant=split_e[0],exp=split_e[1]
if(exp.startsWith('-')){exp_str=parseInt(exp.substr(1))+''
if(exp_str.length < 2){exp_str='0'+exp_str}
return mant+'e-'+exp_str}}
var x,y
[x,y]=res.split('.')
var sign=''
if(x[0]=='-'){x=x.substr(1)
sign='-'}
if(x.length > 16){var exp=x.length-1,int_part=x[0],dec_part=x.substr(1)+y
while(dec_part.endsWith("0")){dec_part=dec_part.substr(0,dec_part.length-1)}
var mant=int_part
if(dec_part.length > 0){mant+='.'+dec_part}
return sign+mant+'e+'+exp}else if(x=="0"){var exp=0
while(exp < y.length && y.charAt(exp)=="0"){exp++}
if(exp > 3){
var rest=y.substr(exp),exp=(exp+1).toString()
while(rest.endsWith("0")){rest=rest.substr(0,res.length-1)}
var mant=rest[0]
if(rest.length > 1){mant+='.'+rest.substr(1)}
if(exp.length==1){exp='0'+exp}
return sign+mant+'e-'+exp}}
return _b_.str.$factory(res)}
float.__round__=function(){var $=$B.args('__round__',2,{self:null,ndigits:null},['self','ndigits'],arguments,{ndigits:_b_.None},null,null)
return float.$round($.self,$.ndigits)}
float.$round=function(x,ndigits){function overflow(){throw _b_.OverflowError.$factory(
"cannot convert float infinity to integer")}
var no_digits=ndigits===_b_.None
if(isnan(x)){if(ndigits===_b_.None){throw _b_.ValueError.$factory(
"cannot convert float NaN to integer")}
return NAN}else if(isninf(x)){return ndigits===_b_.None ? overflow():NINF}else if(isinf(x)){return ndigits===_b_.None ? overflow():INF}
x=float_value(x)
ndigits=ndigits===_b_.None ? 0 :ndigits
if(ndigits==0){var res=Math.round(x.value)
if(Math.abs(x.value-res)==0.5){
if(res % 2){return res-1}}
if(no_digits){
return res}
return $B.fast_float(res)}
if(ndigits.__class__===$B.long_int){ndigits=Number(ndigits.value)}
var pow1,pow2,y,z;
if(ndigits >=0){if(ndigits > 22){
pow1=10**(ndigits-22)
pow2=1e22;}else{pow1=10**ndigits
pow2=1.0;}
y=(x.value*pow1)*pow2;
if(!isFinite(y)){return x}}else{pow1=10**-ndigits;
pow2=1.0;
if(isFinite(pow1)){y=x.value/pow1}else{return ZERO}}
z=Math.round(y);
if(fabs(y-z).value==0.5){
z=2.0*Math.round(y/2);}
if(ndigits >=0){z=(z/pow2)/pow1;}else{z*=pow1;}
if(! isFinite(z)){throw _b_.OverflowError.$factory(
"overflow occurred during round");}
return fast_float(z);}
float.__setattr__=function(self,attr,value){if(self.__class__===float){if(float[attr]===undefined){throw _b_.AttributeError.$factory("'float' object has no attribute '"+
attr+"'")}else{throw _b_.AttributeError.$factory("'float' object attribute '"+
attr+"' is read-only")}}
self[attr]=value
return _b_.None}
float.__truediv__=function(self,other){if($B.$isinstance(other,_b_.int)){if(other.valueOf()==0){throw _b_.ZeroDivisionError.$factory("division by zero")}else if($B.$isinstance(other,$B.long_int)){return float.$factory(self.value/Number(other.value))}
return float.$factory(self.value/other)}else if($B.$isinstance(other,float)){if(other.value==0){throw _b_.ZeroDivisionError.$factory("division by zero")}
return float.$factory(self.value/other.value)}
return _b_.NotImplemented}
var op_func_body=
`var $B = __BRYTHON__,
        _b_ = __BRYTHON__.builtins
    if($B.$isinstance(other, _b_.int)){
        if(typeof other == "boolean"){
            return other ? $B.fast_float(self.value - 1) : self
        }else if(other.__class__ === $B.long_int){
            return _b_.float.$factory(self.value - parseInt(other.value))
        }else{
            return $B.fast_float(self.value - other)
        }
    }
    if($B.$isinstance(other, _b_.float)){
        return $B.fast_float(self.value - other.value)
    }
    return _b_.NotImplemented`
var ops={"+":"add","-":"sub"}
for(var op in ops){var body=op_func_body.replace(/-/gm,op)
float[`__${ops[op]}__`]=Function('self','other',body)}
var comp_func_body=`
var $B = __BRYTHON__,
    _b_ = $B.builtins
if($B.$isinstance(other, _b_.int)){
    if(other.__class__ === $B.long_int){
        return self.value > parseInt(other.value)
    }
    return self.value > other.valueOf()}
if($B.$isinstance(other, _b_.float)){
    return self.value > other.value}
if($B.$isinstance(other, _b_.bool)) {
    return self.value > _b_.bool.__hash__(other)}
if(_b_.hasattr(other, "__int__") || _b_.hasattr(other, "__index__")) {
   return _b_.int.__gt__(self.value, $B.$GetInt(other))}
// See if other has the opposite operator, eg <= for >
var inv_op = $B.$getattr(other, "__le__", _b_.None)
if(inv_op !== _b_.None){
    return inv_op(self)}
throw _b_.TypeError.$factory(
    "unorderable types: float() > " + $B.class_name(other) + "()")
`
for(var op in $B.$comps){var body=comp_func_body.replace(/>/gm,op).
replace(/__gt__/gm,`__${$B.$comps[op]}__`).
replace(/__le__/,`__${$B.$inv_comps[op]}__`)
float[`__${$B.$comps[op]}__`]=Function('self','other',body)}
var r_opnames=["add","sub","mul","truediv","floordiv","mod","pow","lshift","rshift","and","xor","or","divmod"]
for(var r_opname of r_opnames){if(float["__r"+r_opname+"__"]===undefined &&
float['__'+r_opname+'__']){float["__r"+r_opname+"__"]=(function(name){return function(self,other){var other_as_num=_b_.int.$to_js_number(other)
if(other_as_num !==null){var other_as_float=$B.fast_float(other_as_num)
return float["__"+name+"__"](other_as_float,self)}
return _b_.NotImplemented}})(r_opname)}}
function $FloatClass(value){return new Number(value)}
function to_digits(s){
var arabic_digits="\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669",res=""
for(var i=0;i < s.length;i++){var x=arabic_digits.indexOf(s[i])
if(x >-1){res+=x}
else{res+=s[i]}}
return res}
$B.fast_float=fast_float=function(value){return{__class__:_b_.float,value}}
var fast_float_with_hash=function(value,hash_value){return{
__class__:_b_.float,__hashvalue__:hash_value,value}}
float.$factory=function(value){if(value===undefined){return fast_float(0)}
$B.check_nb_args_no_kw('float',1,arguments)
switch(value){case true:
return fast_float(1)
case false:
return fast_float(0)}
var original_value=value
if(typeof value=="number"){return fast_float(value)}
if(value.__class__===float){return value}
if($B.$isinstance(value,_b_.memoryview)){value=_b_.memoryview.tobytes(value)}
if($B.$isinstance(value,_b_.bytes)){try{value=$B.$getattr(value,"decode")("utf-8")}catch(err){throw _b_.ValueError.$factory(
"could not convert string to float: "+
_b_.repr(original_value))}}
if(typeof value=="string"){if(value.trim().length==0){throw _b_.ValueError.$factory(
`could not convert string to float: ${_b_.repr(value)}`)}
value=value.trim()
switch(value.toLowerCase()){case "+inf":
case "inf":
case "+infinity":
case "infinity":
return fast_float(Number.POSITIVE_INFINITY)
case "-inf":
case "-infinity":
return fast_float(Number.NEGATIVE_INFINITY)
case "+nan":
case "nan":
return fast_float(Number.NaN)
case "-nan":
return fast_float(-Number.NaN)
default:
var parts=value.split('e')
if(parts[1]){if(parts[1].startsWith('+')||parts[1].startsWith('-')){parts[1]=parts[1].substr(1)}}
parts=parts[0].split('.').concat(parts.splice(1))
for(var part of parts){if(part.startsWith('_')||part.endsWith('_')){throw _b_.ValueError.$factory('invalid float literal '+
value)}}
if(value.indexOf('__')>-1){throw _b_.ValueError.$factory('invalid float literal '+
value)}
value=value.charAt(0)+value.substr(1).replace(/_/g,"")
value=to_digits(value)
if(isFinite(value)){return fast_float(parseFloat(value))}else{throw _b_.TypeError.$factory(
"could not convert string to float: "+
_b_.repr(original_value))}}}
var klass=value.__class__,float_method=$B.$getattr(klass,'__float__',null)
if(float_method===null){var index_method=$B.$getattr(klass,'__index__',null)
if(index_method===null){throw _b_.TypeError.$factory("float() argument must be a string or a "+
"number, not '"+$B.class_name(value)+"'")}
var res=$B.$call(index_method)(value),klass=$B.get_class(res)
if(klass===_b_.int){return fast_float(res)}else if(klass===$B.long_int){return $B.long_int.__float__(res)}else if(klass.__mro__.indexOf(_b_.int)>-1){var msg=`${$B.class_name(value)}.__index__ returned `+
`non-int (type ${$B.class_name(res)}).  The `+
'ability to return an instance of a strict subclass'+
' of int is deprecated, and may be removed in a '+
'future version of Python.'
$B.warn(_b_.DeprecationWarning,msg)
return fast_float(res)}
throw _b_.TypeError.$factory('__index__ returned non-int'+
` (type ${$B.class_name(res)})`)}
var res=$B.$call(float_method)(value),klass=$B.get_class(res)
if(klass !==_b_.float){if(klass.__mro__.indexOf(_b_.float)>-1){var msg=`${$B.class_name(value)}.__float__ returned `+
`non-float (type ${$B.class_name(res)}).  The `+
'ability to return an instance of a strict subclass'+
' of float is deprecated, and may be removed in a '+
'future version of Python.'
$B.warn(_b_.DeprecationWarning,msg)
return float.$factory(res.value)}
throw _b_.TypeError.$factory('__float__ returned non-float'+
` (type ${$B.class_name(res)})`)}
return res}
$B.$FloatClass=$FloatClass
$B.set_func_names(float,"builtins")
float.fromhex=_b_.classmethod.$factory(float.fromhex)
_b_.float=float
$B.MAX_VALUE=fast_float(Number.MAX_VALUE)
$B.MIN_VALUE=fast_float(2.2250738585072014e-308)
const NINF=fast_float(Number.NEGATIVE_INFINITY),INF=fast_float(Number.POSITIVE_INFINITY),NAN=fast_float(Number.NaN),ZERO=fast_float(0),NZERO=fast_float(-0)})(__BRYTHON__)
;
;(function($B){var _b_=$B.builtins
function $UnsupportedOpType(op,class1,class2){throw _b_.TypeError.$factory("unsupported operand type(s) for "+
op+": '"+class1+"' and '"+class2+"'")}
var complex={__class__:_b_.type,__dir__:_b_.object.__dir__,__qualname__:'complex',$is_class:true,$native:true,$descriptors:{real:true,imag:true}}
complex.__abs__=function(self){var _rf=isFinite(self.$real.value),_if=isFinite(self.$imag.value)
if((_rf && isNaN(self.$imag.value))||(_if && isNaN(self.$real.value))||
(isNaN(self.$imag.value)&& isNaN(self.$real.value))){return $B.fast_float(NaN)}
if(! _rf ||! _if){return $B.fast_float(Infinity)}
var mag=Math.sqrt(Math.pow(self.$real.value,2)+
Math.pow(self.$imag.value,2))
if(!isFinite(mag)&& _rf && _if){
throw _b_.OverflowError.$factory("absolute value too large")}
return $B.fast_float(mag)}
complex.__add__=function(self,other){if($B.$isinstance(other,complex)){return make_complex(self.$real.value+other.$real.value,self.$imag.value+other.$imag.value)}
if($B.$isinstance(other,_b_.int)){other=_b_.int.numerator(other)
return make_complex(
$B.rich_op('__add__',self.$real.value,other.valueOf()),self.$imag.value)}
if($B.$isinstance(other,_b_.float)){return make_complex(self.$real.value+other.value,self.$imag.value)}
return _b_.NotImplemented}
complex.__bool__=function(self){return(! $B.rich_comp('__eq__',self.$real,0))||
! $B.rich_comp('__eq__',self.$imag,0)}
complex.__complex__=function(self){
if(self.__class__===complex){return self}
return $B.make_complex(self.$real,self.$imag)}
complex.__eq__=function(self,other){if($B.$isinstance(other,complex)){return self.$real.value==other.$real.value &&
self.$imag.value==other.$imag.value}
if($B.$isinstance(other,_b_.int)){if(self.$imag.value !=0){return false}
return self.$real.value==other.valueOf()}
if($B.$isinstance(other,_b_.float)){if(! $B.rich_comp('__eq__',0,self.$imag)){return false}
return self.$real.value==other.value}
return _b_.NotImplemented}
const max_precision=2**31-4,max_repeat=2**30-1
complex.__format__=function(self,format_spec){if(format_spec.length==0){return _b_.str.$factory(self)}
var fmt=new $B.parse_format_spec(format_spec,self),type=fmt.conversion_type
var default_precision=6,skip_re,add_parens
if(type===undefined ||'eEfFgGn'.indexOf(type)>-1){if(fmt.precision > max_precision){throw _b_.ValueError.$factory('precision too big')}
if(fmt.fill_char=='0'){throw _b_.ValueError.$factory(
"Zero padding is not allowed in complex format specifier")}
if(fmt.align=='='){throw _b_.ValueError.$factory(
"'=' alignment flag is not allowed in complex format "+
"specifier")}
var re=self.$real.value,im=self.$imag.value,precision=parseInt(fmt.precision,10)
if(type===undefined){type='r'
default_precision=0
if(re==0 && Object.is(re,0)){skip_re=1}else{add_parens=1}}else if(type=='n'){type='g'}
if(precision < 0){precision=6}else if(type=='r'){type='g'}
var format=$B.clone(fmt)
format.conversion_type=type
format.precision=precision
var res=''
if(! skip_re){res+=_b_.float.$format(self.$real,format)
if(self.$imag.value >=0){res+='+'}}
var formatted_im=_b_.float.$format(self.$imag,format)
var pos=-1,last_num
for(var char of formatted_im){pos++
if(char.match(/\d/)){last_num=pos}}
formatted_im=formatted_im.substr(0,last_num+1)+'j'+
formatted_im.substr(last_num+1)
res+=formatted_im
if(add_parens){res='('+res+')'}
return res}
throw _b_.ValueError.$factory(`invalid type for complex: ${type}`)}
complex.$getnewargs=function(self){return $B.fast_tuple([self.$real,self.$imag])}
complex.__getnewargs__=function(){return complex.$getnewargs($B.single_arg('__getnewargs__','self',arguments))}
complex.__hash__=function(self){
return $B.$hash(self.$real)+$B.$hash(self.$imag)*1000003}
complex.__init__=function(){return _b_.None}
complex.__invert__=function(self){return ~self}
complex.__mro__=[_b_.object]
complex.__mul__=function(self,other){if($B.$isinstance(other,complex)){return make_complex(self.$real.value*other.$real.value-
self.$imag.value*other.$imag.value,self.$imag.value*other.$real.value+
self.$real.value*other.$imag.value)}else if($B.$isinstance(other,_b_.int)){return make_complex(self.$real.value*other.valueOf(),self.$imag.value*other.valueOf())}else if($B.$isinstance(other,_b_.float)){return make_complex(self.$real.value*other.value,self.$imag.value*other.value)}else if($B.$isinstance(other,_b_.bool)){if(other.valueOf()){return self}
return make_complex(0,0)}
$UnsupportedOpType("*",complex,other)}
complex.__ne__=function(self,other){var res=complex.__eq__(self,other)
return res===_b_.NotImplemented ? res :! res}
complex.__neg__=function(self){return make_complex(-self.$real.value,-self.$imag.value)}
complex.__new__=function(cls){if(cls===undefined){throw _b_.TypeError.$factory('complex.__new__(): not enough arguments')}
var res,missing={},$=$B.args("complex",3,{cls:null,real:null,imag:null},["cls","real","imag"],arguments,{real:0,imag:missing},null,null),cls=$.cls,first=$.real,second=$.imag
if(typeof first=="string"){if(second !==missing){throw _b_.TypeError.$factory("complex() can't take second arg "+
"if first is a string")}else{var arg=first
first=first.trim()
if(first.startsWith("(")&& first.endsWith(")")){first=first.substr(1)
first=first.substr(0,first.length-1)}
var complex_re=/^\s*([\+\-]*[0-9_]*\.?[0-9_]*(e[\+\-]*[0-9_]*)?)([\+\-]?)([0-9_]*\.?[0-9_]*(e[\+\-]*[0-9_]*)?)(j?)\s*$/i
var parts=complex_re.exec(first)
function to_num(s){var res=parseFloat(s.charAt(0)+s.substr(1).replace(/_/g,""))
if(isNaN(res)){throw _b_.ValueError.$factory("could not convert string "+
"to complex: '"+arg+"'")}
return res}
if(parts===null){throw _b_.ValueError.$factory("complex() arg is a malformed string")}
if(parts[_real]&& parts[_imag].startsWith('.')&&
parts[_sign]==''){throw _b_.ValueError.$factory('complex() arg is a malformed string')}else if(parts[_real]=="." ||parts[_imag]=="." ||
parts[_real]==".e" ||parts[_imag]==".e" ||
parts[_real]=="e" ||parts[_imag]=="e"){throw _b_.ValueError.$factory("complex() arg is a malformed string")}else if(parts[_j]!=""){if(parts[_sign]==""){first=0
if(parts[_real]=="+" ||parts[_real]==""){second=1}else if(parts[_real]=='-'){second=-1}else{second=to_num(parts[_real])}}else{first=to_num(parts[_real])
second=parts[_imag]=="" ? 1 :to_num(parts[_imag])
second=parts[_sign]=="-" ?-second :second}}else{if(parts[_sign]&& parts[_imag]==''){throw _b_.ValueError.$factory('complex() arg is a malformed string')}
first=to_num(parts[_real])
second=0}
res=make_complex(first,second)
res.__class__=cls
res.__dict__=$B.empty_dict()
return res}}
if(first.__class__===complex && cls===complex && second===missing){return first}
var arg1=_convert(first),r,i
if(arg1===null){throw _b_.TypeError.$factory("complex() first argument must be a "+
`string or a number, not '${$B.class_name(first)}'`)}
if(typeof second=="string"){throw _b_.TypeError.$factory("complex() second arg can't be a string")}
var arg2=_convert(second===missing ? 0 :second)
if(arg2===null){throw _b_.TypeError.$factory("complex() second argument must be a "+
`number, not '${$B.class_name(second)}'`)}
if(arg1.method=='__complex__'){if(arg2.method=='__complex__'){r=$B.rich_op('__sub__',arg1.result.$real,arg2.result.$imag)
i=$B.rich_op('__add__',arg1.result.$imag,arg2.result.$real)}else{r=arg1.result.$real
i=$B.rich_op('__add__',arg1.result.$imag,arg2.result)}}else{if(arg2.method=='__complex__'){r=$B.rich_op('__sub__',arg1.result,arg2.result.$imag)
i=arg2.result.$real}else{r=arg1.result
i=arg2.result}}
var res=make_complex(r,i)
res.__class__=cls
res.__dict__=$B.empty_dict()
return res}
complex.__pos__=function(self){return self}
function complex2expo(cx){var norm=Math.sqrt((cx.$real.value*cx.$real.value)+
(cx.$imag.value*cx.$imag.value)),sin=cx.$imag.value/norm,cos=cx.$real.value/norm,angle
if(cos==0){angle=sin==1 ? Math.PI/2 :3*Math.PI/2}else if(sin==0){angle=cos==1 ? 0 :Math.PI}else{angle=Math.atan(sin/cos)}
return{norm:norm,angle:angle}}
function hypot(){var $=$B.args("hypot",0,{},[],arguments,{},"args",null)
return _b_.float.$factory(Math.hypot(...$.args))}
function c_powi(x,n){if(n > 0){return c_powu(x,n)}else{return c_quot(c_1,c_powu(x,-n))}}
function c_powu(x,n){var r,p,mask=1,r=c_1,p=x
while(mask > 0 && n >=mask){if(n & mask){r=c_prod(r,p);}
mask <<=1;
p=c_prod(p,p)}
return r;}
function c_prod(a,b){return make_complex(
a.$real.value*b.$real.value-a.$imag.value*b.$imag.value,a.$real.value*b.$imag.value+a.$imag.value*b.$real.value)}
function c_quot(a,b){var r,
abs_breal=Math.abs(b.$real.value),abs_bimag=Math.abs(b.$imag.value)
if($B.rich_comp('__ge__',abs_breal,abs_bimag)){
if(abs_breal==0.0){throw _b_.ZeroDivisionError.$factory()}else{var ratio=b.$imag.value/b.$real.value,denom=b.$real.value+b.$imag.value*ratio
return make_complex((a.$real.value+a.$imag.value*ratio)/denom,(a.$imag.value-a.$real.value*ratio)/denom)}}else if(abs_bimag >=abs_breal){
var ratio=b.$real.value/b.$imag.value,denom=b.$real.value*ratio+b.$imag.value;
if(b.$imag.value==0.0){throw _b_.ZeroDivisionError.$factory()}
return make_complex(
(a.$real.value*ratio+a.$imag.value)/denom,(a.$imag.value*ratio-a.$real.value)/denom)}else{
return $B.make_complex('nan','nan')}}
complex.__pow__=function(self,other,mod){
if(mod !==undefined && mod !==_b_.None){throw _b_.ValueError.$factory('complex modulo')}
if($B.rich_comp('__eq__',other,1)){var funcs=_b_.float.$funcs
if(funcs.isinf(self.$real)||funcs.isninf(self.$real)||
funcs.isinf(self.$imag)||funcs.isninf(self.$imag)){throw _b_.OverflowError.$factory('complex exponentiation')}
return self}
var small_int=null
if($B.$isinstance(other,_b_.int)&& _b_.abs(other)< 100){small_int=other}else if($B.$isinstance(other,_b_.float)&&
Number.isInteger(other.value)&& Math.abs(other.value < 100)){small_int=other.value}else if($B.$isinstance(other,complex)&& other.$imag.value==0 &&
Number.isInteger(other.$real.value)&&
Math.abs(other.$real.value)< 100){small_int=other.$real.value}
if(small_int !==null){return c_powi(self,small_int)}
if($B.$isinstance(other,_b_.float)){other=_b_.float.$to_js_number(other)}
if(self.$real.value==0 && self.$imag.value==0){if($B.$isinstance(other,complex)&&
(other.$imag.value !=0 ||other.$real.value < 0)){throw _b_.ZeroDivisionError.$factory(
'0.0 to a negative or complex power')}
return $B.make_complex(0,0)}
var exp=complex2expo(self),angle=exp.angle,res=Math.pow(exp.norm,other)
if($B.$isinstance(other,_b_.int)){return make_complex(res*Math.cos(angle*other),res*Math.sin(angle*other))}else if($B.$isinstance(other,_b_.float)){return make_complex(res*Math.cos(angle*other.value),res*Math.sin(angle*other.value))}else if($B.$isinstance(other,complex)){
var x=other.$real.value,y=other.$imag.value
var pw=Math.pow(exp.norm,x)*Math.pow(Math.E,-y*angle),theta=y*Math.log(exp.norm)-x*angle
if(pw==Number.POSITIVE_INFINITY ||pw===Number.NEGATIVE_INFINITY){throw _b_.OverflowError.$factory('complex exponentiation')}
return make_complex(pw*Math.cos(theta),pw*Math.sin(theta))}else{throw _b_.TypeError.$factory("unsupported operand type(s) "+
"for ** or pow(): 'complex' and '"+
$B.class_name(other)+"'")}}
complex.__radd__=function(self,other){if($B.$isinstance(other,_b_.bool)){other=other ? 1 :0}
if($B.$isinstance(other,_b_.int)){return make_complex(other+self.$real.value,self.$imag.value)}else if($B.$isinstance(other,_b_.float)){return make_complex(other.value+self.$real.value,self.$imag.value)}
return _b_.NotImplemented}
complex.__repr__=function(self){$B.builtins_repr_check(complex,arguments)
var real=Number.isInteger(self.$real.value)?
self.$real.value+'' :
_b_.str.$factory(self.$real),imag=Number.isInteger(self.$imag.value)?
self.$imag.value+'' :
_b_.str.$factory(self.$imag)
if(imag.endsWith('.0')){imag=imag.substr(0,imag.length-2)}
if(Object.is(self.$imag.value,-0)){imag="-0"}
var sign=imag.startsWith('-')? '' :'+'
if(self.$real.value==0){if(Object.is(self.$real.value,-0)){return "(-0"+sign+imag+"j)"}else{return imag+"j"}}
if(self.$imag.value > 0 ||isNaN(self.$imag.value)){return "("+real+"+"+imag+"j)"}
if(self.$imag.value==0){if(1/self.$imag.value < 0){return "("+real+"-0j)"}
return "("+real+"+0j)"}
return "("+real+sign+imag+"j)"}
complex.__rmul__=function(self,other){if($B.$isinstance(other,_b_.bool)){other=other ? 1 :0}
if($B.$isinstance(other,_b_.int)){return make_complex(other*self.$real.value,other*self.$imag.value)}else if($B.$isinstance(other,_b_.float)){return make_complex(other.value*self.$real.value,other.value*self.$imag.value)}
return _b_.NotImplemented}
complex.__sqrt__=function(self){if(self.$imag==0){return complex(Math.sqrt(self.$real.value))}
var r=self.$real.value,i=self.$imag.value,_a=Math.sqrt((r+sqrt)/2),_b=Number.sign(i)*Math.sqrt((-r+sqrt)/2)
return make_complex(_a,_b)}
complex.__sub__=function(self,other){if($B.$isinstance(other,complex)){return make_complex(self.$real.value-other.$real.value,self.$imag.value-other.$imag.value)}
if($B.$isinstance(other,_b_.int)){other=_b_.int.numerator(other)
return make_complex(self.$real.value-other.valueOf(),self.$imag.value)}
if($B.$isinstance(other,_b_.float)){return make_complex(self.$real.value-other.value,self.$imag.value)}
return _b_.NotImplemented}
complex.__truediv__=function(self,other){if($B.$isinstance(other,complex)){if(other.$real.value==0 && other.$imag.value==0){throw _b_.ZeroDivisionError.$factory("division by zero")}
var _num=self.$real.value*other.$real.value+
self.$imag.value*other.$imag.value,_div=other.$real.value*other.$real.value+
other.$imag.value*other.$imag.value
var _num2=self.$imag.value*other.$real.value-
self.$real.value*other.$imag.value
return make_complex(_num/_div,_num2/_div)}
if($B.$isinstance(other,_b_.int)){if(! other.valueOf()){throw _b_.ZeroDivisionError.$factory('division by zero')}
return complex.__truediv__(self,complex.$factory(other.valueOf()))}
if($B.$isinstance(other,_b_.float)){if(! other.value){throw _b_.ZeroDivisionError.$factory("division by zero")}
return complex.__truediv__(self,complex.$factory(other.value))}
$UnsupportedOpType("//","complex",other.__class__)}
complex.conjugate=function(self){return make_complex(self.$real.value,-self.$imag.value)}
complex.__ior__=complex.__or__
var r_opnames=["add","sub","mul","truediv","floordiv","mod","pow","lshift","rshift","and","xor","or"]
for(var r_opname of r_opnames){if(complex["__r"+r_opname+"__"]===undefined &&
complex['__'+r_opname+'__']){complex["__r"+r_opname+"__"]=(function(name){return function(self,other){if($B.$isinstance(other,_b_.int)){other=make_complex(other,0)
return complex["__"+name+"__"](other,self)}else if($B.$isinstance(other,_b_.float)){other=make_complex(other.value,0)
return complex["__"+name+"__"](other,self)}else if($B.$isinstance(other,complex)){return complex["__"+name+"__"](other,self)}
return _b_.NotImplemented}})(r_opname)}}
var comp_func_body=`
    var _b_ = __BRYTHON__.builtins
    if(other === undefined || other == _b_.None){
        return _b_.NotImplemented
    }
    throw _b_.TypeError.$factory("no ordering relation " +
        "is defined for complex numbers")`
for(var $op in $B.$comps){complex['__'+$B.$comps[$op]+'__']=Function('self','other',comp_func_body.replace(/>/gm,$op))}
complex.real=function(self){return self.$real}
complex.real.setter=function(){throw _b_.AttributeError.$factory("readonly attribute")}
complex.imag=function(self){return self.$imag}
complex.imag.setter=function(){throw _b_.AttributeError.$factory("readonly attribute")}
var _real=1,_real_mantissa=2,_sign=3,_imag=4,_imag_mantissa=5,_j=6
var expected_class={"__complex__":complex,"__float__":_b_.float,"__index__":_b_.int}
function _convert(obj){
var klass=obj.__class__ ||$B.get_class(obj)
for(var method_name in expected_class){var missing={},method=$B.$getattr(klass,method_name,missing)
if(method !==missing){var res=method(obj)
if(!$B.$isinstance(res,expected_class[method_name])){throw _b_.TypeError.$factory(method_name+"returned non-"+
expected_class[method_name].__name__+
"(type "+$B.get_class(res)+")")}
if(method_name=='__index__' &&
$B.rich_comp('__gt__',res,__BRYTHON__.MAX_VALUE)){throw _b_.OverflowError.$factory('int too large to convert to float')}
if(method_name=='__complex__' && res.__class__ !==complex){$B.warn(_b_.DeprecationWarning,"__complex__ returned "+
`non-complex (type ${$B.class_name(res)}). `+
"The ability to return an instance of a strict subclass "+
"of complex is deprecated, and may be removed in a future "+
"version of Python.")}
return{result:res,method:method_name}}}
return null}
var make_complex=$B.make_complex=function(real,imag){return{
__class__:complex,$real:_b_.float.$factory(real),$imag:_b_.float.$factory(imag)}}
var c_1=make_complex(1,0)
complex.$factory=function(){return complex.__new__(complex,...arguments)}
$B.set_func_names(complex,"builtins")
_b_.complex=complex})(__BRYTHON__)
;
;(function($B){
var _b_=$B.builtins
var str_hash=_b_.str.__hash__,$N=_b_.None
var set_ops=["eq","le","lt","ge","gt","sub","rsub","and","rand","or","ror","xor","rxor"]
function is_sublist(t1,t2){
for(var i=0,ilen=t1.length;i < ilen;i++){var x=t1[i],flag=false
for(var j=0,jlen=t2.length;j < jlen;j++){if($B.rich_comp("__eq__",x,t2[j])){t2.splice(j,1)
flag=true
break}}
if(! flag){return false}}
return true}
dict_view_op={__eq__:function(t1,t2){return t1.length==t2.length && is_sublist(t1,t2)},__ne__:function(t1,t2){return ! dict_view_op.__eq__(t1,t2)},__lt__:function(t1,t2){return t1.length < t2.length && is_sublist(t1,t2)},__gt__:function(t1,t2){return dict_view_op.__lt__(t2,t1)},__le__:function(t1,t2){return t1.length <=t2.length && is_sublist(t1,t2)},__ge__:function(t1,t2){return dict_view_op.__le__(t2,t1)},__and__:function(t1,t2){var items=[]
for(var i=0,ilen=t1.length;i < ilen;i++){var x=t1[i]
flag=false
for(var j=0,jlen=t2.length;j < jlen;j++){if($B.rich_comp("__eq__",x,t2[j])){t2.splice(j,1)
items.push(x)
break}}}
return items},__or__:function(t1,t2){var items=t1
for(var j=0,jlen=t2.length;j < jlen;j++){var y=t2[j],flag=false
for(var i=0,ilen=t1.length;i < ilen;i++){if($B.rich_comp("__eq__",y,t1[i])){t2.splice(j,1)
flag=true
break}}
if(! flag){items.push(y)}}
return items}}
function make_view_comparison_methods(klass){for(var i=0,len=set_ops.length;i < len;i++){var op="__"+set_ops[i]+"__"
klass[op]=(function(op){return function(self,other){
if(self.__class__.__name__=='dict_keys' ||
(self.__class__.__name__=='dict_items'
&& dict.$set_like(self.dict))){return _b_.set[op](_b_.set.$factory(self),_b_.set.$factory(other))}else{
if(other.__class__ !==klass){return false}
var other_items=_b_.list.$factory(other)
return dict_view_op[op](self.items,other_items)}}})(op)}}
$B.str_dict=function(){}
var mappingproxy=$B.make_class("mappingproxy")
var mappingproxy_handler={get(target,prop){if(prop=='__class__'){return mappingproxy}
return target[prop]}}
var dict={__class__:_b_.type,__mro__:[_b_.object],__qualname__:'dict',$is_class:true,$native:true,$match_mapping_pattern:true }
dict.$to_obj=function(d){
var res={}
for(var entry of dict.$iter_items_with_hash(d)){res[entry.key]=entry.value}
return res}
dict.$iter_keys_check=function*(d){for(var entry of dict.$iter_items_with_hash(d)){yield entry.key}}
dict.$iter_values_check=function*(d){for(var entry of dict.$iter_items_with_hash(d)){yield entry.value}}
dict.$set_like=function(self){
for(var v of self._values){if(v===undefined){continue}else if(typeof v=='string' ||
typeof v=='number' ||
typeof v=='boolean'){continue}else if([_b_.tuple,_b_.float,_b_.complex].indexOf(v.__class__)>-1){continue}else if(! _b_.hasattr(v.__class__,'__hash__')){return false}}
return true}
dict.$iter_items_with_hash=function*(d){if(d.$all_str){for(var key in d.$strings){if(key !='$dict_strings'){yield{key,value:d.$strings[key]}}}}
if(d.$jsobj){for(var key in d.$jsobj){if(!d.$exclude ||! d.$exclude(key)){yield{key,value:d.$jsobj[key]}}}}else if(d.__class__===$B.jsobj_as_pydict){for(var key in d.obj){yield{key,value:d.obj[key]}}}else{var version=d.$version
for(var i=0,len=d._keys.length;i < len;i++){if(d._keys[i]!==undefined){yield{key:d._keys[i],value:d._values[i],hash:d._hashes[i]}
if(d.$version !==version){throw _b_.RuntimeError.$factory('changed in iteration')}}}
if(d.$version !==version){throw _b_.RuntimeError.$factory('changed in iteration')}}}
dict.$iter_items_check=function*(d){if(d.$jsobj){for(var key in d.$jsobj){yield[key,d.$jsobj[key]]}}else{var version=d.$version
for(var i=0,len=d._keys.length;i < len;i++){if(d._keys[i]!==undefined){yield[d._keys[i],d._values[i]]
if(d.$version !==version){throw _b_.RuntimeError.$factory('changed in iteration')}}}
if(d.$version !==version){throw _b_.RuntimeError.$factory('changed in iteration')}}}
var $copy_dict=function(left,right){
right.$version=right.$version ||0
var right_version=right.$version
if(right.$all_str){if(left.$all_str){for(var key in right.$strings){left.$strings[key]=right.$strings[key]}}else{for(var key in right.$strings){dict.$setitem(left,key,right.$strings[key])}}}else{for(var entry of dict.$iter_items_with_hash(right)){dict.$setitem(left,entry.key,entry.value,entry.hash)
if(right.$version !=right_version){throw _b_.RuntimeError.$factory("dict mutated during update")}}}}
dict.__bool__=function(){var $=$B.args("__bool__",1,{self:null},["self"],arguments,{},null,null)
return dict.__len__($.self)> 0}
dict.__class_getitem__=function(cls,item){
if(! Array.isArray(item)){item=[item]}
return $B.GenericAlias.$factory(cls,item)}
dict.$lookup_by_key=function(d,key,hash){hash=hash===undefined ? _b_.hash(key):hash
var indices=d.table[hash],index
if(indices !==undefined){for(var i=0,len=indices.length;i < len;i++){index=indices[i]
if(d._keys[index]===undefined){d.table[hash].splice(i,1)
if(d.table[hash].length==0){delete d.table[hash]
return{found:false,hash}}
continue}
if($B.is_or_equals(d._keys[index],key)){return{found:true,key:d._keys[index],value:d._values[index],hash,rank:i,index}}}}
return{found:false,hash}}
dict.__contains__=function(){var $=$B.args("__contains__",2,{self:null,key:null},["self","key"],arguments,{},null,null),self=$.self,key=$.key
if(self.$all_str){if(typeof key=='string'){return self.$strings.hasOwnProperty(key)}
var hash=$B.$getattr($B.get_class(key),'__hash__')
if(hash===_b_.object.__hash__){return false}
convert_all_str(self)}
if(self.$jsobj){return self.$jsobj[key]!==undefined}
return dict.$lookup_by_key(self,key).found}
dict.__delitem__=function(){var $=$B.args("__eq__",2,{self:null,key:null},["self","key"],arguments,{},null,null),self=$.self,key=$.key
if(self.$all_str){if(typeof key=='string'){if(self.$strings.hasOwnProperty(key)){dict.$delete_string(self,key)
return _b_.None}else{throw _b_.KeyError.$factory(key)}}
if(! dict.__contains__(self,key)){throw _b_.KeyError.$factory(_b_.str.$factory(key))}}
if(self.$jsobj){if(self.$jsobj[key]===undefined){throw _b_.KeyError.$factory(key)}
delete self.$jsobj[key]
return $N}
var lookup=dict.$lookup_by_key(self,key)
if(lookup.found){self.table[lookup.hash].splice(lookup.rank,1)
if(self.table[lookup.hash].length==0){delete self.table[lookup.hash]}
delete self._values[lookup.index]
delete self._keys[lookup.index]
delete self._hashes[lookup.index]
self.$version++
return _b_.None}
throw _b_.KeyError.$factory(_b_.str.$factory(key))}
dict.__eq__=function(){var $=$B.args("__eq__",2,{self:null,other:null},["self","other"],arguments,{},null,null),self=$.self,other=$.other
return dict.$eq(self,other)}
dict.$eq=function(self,other){if(! $B.$isinstance(other,dict)){return _b_.NotImplemented}
if(self.$all_str && other.$all_str){if(dict.__len__(self)!==dict.__len__(other)){return false}
for(var k in self.$strings){if(! other.$strings.hasOwnProperty(k)){return false}
if(! $B.is_or_equals(self.$strings[k],other.$strings[k])){return false}}
return true}
if(self.$jsobj && other.$jsobj){if(dict.__len__(self)!==dict.__len__(other)){return false}
for(var k in self.$jsobj){if(! other.$jsobj.hasOwnProperty(k)){return false}
if(! $B.is_or_equals(self.$jsobj[k],other.$jsobj[k])){return false}}
return true}
if(self.$all_str){var d=dict.copy(self)
convert_all_str(d)
return dict.$eq(d,other)}
if(other.$all_str){var d=dict.copy(other)
convert_all_str(d)
return dict.$eq(self,d)}
if(self.$jsobj){return dict.$eq(jsobj2dict(self.$jsobj),other)}
if(other.$jsobj){return dict.$eq(self,jsobj2dict(other.$jsobj))}
if(dict.__len__(self)!=dict.__len__(other)){return false}
for(var hash in self.table){var self_pairs=[]
for(var index of self.table[hash]){self_pairs.push([self._keys[index],self._values[index]])}
var other_pairs=[]
if(other.table[hash]!==undefined){for(var index of other.table[hash]){other_pairs.push([other._keys[index],other._values[index]])}}
for(var self_pair of self_pairs){var flag=false
var key=self_pair[0],value=self_pair[1]
for(var other_pair of other_pairs){if($B.is_or_equals(key,other_pair[0])&&
$B.is_or_equals(value,other_pair[1])){flag=true
break}}
if(! flag){return false}}}
return true}
dict.__getitem__=function(){var $=$B.args("__getitem__",2,{self:null,arg:null},["self","arg"],arguments,{},null,null),self=$.self,arg=$.arg
return dict.$getitem(self,arg)}
dict.$contains_string=function(self,key){
if(self.$all_str){return self.$strings.hasOwnProperty(key)}
if(self.$jsobj && self.$jsobj.hasOwnProperty(key)){return true}
if(self.table && self.table[_b_.hash(key)]!==undefined){return true}
return false}
dict.$delete_string=function(self,key){
if(self.$all_str){var ix=self.$strings[key]
if(ix !==undefined){delete self.$strings[key]}}
if(self.$jsobj){delete self.$jsobj[key]}
if(self.table){delete self.table[_b_.hash(key)]}}
dict.$missing={}
dict.$get_string=function(self,key){
if(self.$all_str && self.$strings.hasOwnProperty(key)){return self.$strings[key]}
if(self.$jsobj && self.$jsobj.hasOwnProperty(key)){return self.$jsobj[key]}
if(self.table && dict.__len__(self)){var indices=self.table[_b_.hash(key)]
if(indices !==undefined){return self._values[indices[0]]}}
return _b_.dict.$missing}
dict.$getitem_string=function(self,key){
if(self.$all_str && self.$strings.hasOwnProperty(key)){return self.$strings[key]}
if(self.$jsobj && self.$jsobj.hasOwnProperty(key)){return self.$jsobj[key]}
if(self.table){var indices=self.table[_b_.hash(key)]
if(indices !==undefined){return self._values[indices[0]]}}
throw _b_.KeyError.$factory(key)}
dict.$keys_string=function(self){
var res=[]
if(self.$all_str){return Object.keys(self.$strings)}
if(self.$jsobj){res=res.concat(Object.keys(self.$jsobj))}
if(self.table){res=res.concat(self._keys.filter((x)=> x !==undefined))}
return res}
dict.$setitem_string=function(self,key,value){
if(self.$all_str){self.$strings[key]=value
return _b_.None}else{var h=_b_.hash(key),indices=self.table[h]
if(indices !==undefined){self._values[indices[0]]=value
return _b_.None}}
var index=self._keys.length
self.$strings[key]=index
self._keys.push(key)
self._values.push(value)
self.$version++
return _b_.None}
dict.$getitem=function(self,key,ignore_missing){
if(self.$all_str){if(typeof key=='string'){if(self.$strings.hasOwnProperty(key)){return self.$strings[key]}}else{var hash_method=$B.$getattr($B.get_class(key),'__hash__')
if(hash_method !==_b_.object.__hash__){convert_all_str(self)
var lookup=dict.$lookup_by_key(self,key)
if(lookup.found){return lookup.value}}}}else if(self.$jsobj){if(self.$exclude && self.$exclude(key)){throw _b_.KeyError.$factory(key)}
if(self.$jsobj.hasOwnProperty(key)){return self.$jsobj[key]}
if(! self.table){throw _b_.KeyError.$factory(key)}}else{var lookup=dict.$lookup_by_key(self,key)
if(lookup.found){return lookup.value}}
if(! ignore_missing){if(self.__class__ !==dict && ! ignore_missing){try{var missing_method=$B.$getattr(self.__class__,"__missing__",_b_.None)}catch(err){console.log(err)}
if(missing_method !==_b_.None){return missing_method(self,key)}}}
throw _b_.KeyError.$factory(key)}
dict.__hash__=_b_.None
function init_from_list(self,args){var i=0
for(var item of args){if(item.length !=2){throw _b_.ValueError.$factory("dictionary "+
`update sequence element #${i} has length ${item.length}; 2 is required`)}
dict.$setitem(self,item[0],item[1])
i++}}
dict.__init__=function(self,first,second){if(first===undefined){return _b_.None}
if(second===undefined){if((! first.$kw)&& $B.$isinstance(first,$B.JSObj)){for(var key in first){dict.$setitem(self,key,first[key])}
return _b_.None}else if(first.$jsobj){self.$jsobj={}
for(var attr in first.$jsobj){self.$jsobj[attr]=first.$jsobj[attr]}
self.$all_str=false
return $N}else if(first[Symbol.iterator]){init_from_list(self,first)
return $N}else if(first.__class__===$B.generator){init_from_list(self,first.js_gen)
return $N}}
var $=$B.args("dict",1,{self:null},["self"],arguments,{},"first","second")
var args=$.first
if(args.length > 1){throw _b_.TypeError.$factory("dict expected at most 1 argument"+
", got 2")}else if(args.length==1){args=args[0]
if(args.__class__===dict){for(var entry of dict.$iter_items_with_hash(args)){dict.$setitem(self,entry.key,entry.value,entry.hash)}}else{var keys=$B.$getattr(args,"keys",null)
if(keys !==null){var gi=$B.$getattr(args,"__getitem__",null)
if(gi !==null){
gi=$B.$call(gi)
var kiter=_b_.iter($B.$call(keys)())
while(true){try{var key=_b_.next(kiter),value=gi(key)
dict.__setitem__(self,key,value)}catch(err){if(err.__class__===_b_.StopIteration){break}
throw err}}
return $N}}
if(! Array.isArray(args)){args=_b_.list.$factory(args)}
init_from_list(self,args)}}
for(var key in $.second.$jsobj){dict.$setitem(self,key,$.second.$jsobj[key])}
return _b_.None}
dict.__iter__=function(self){return _b_.iter(dict.keys(self))}
dict.__ior__=function(self,other){
dict.update(self,other)
return self}
dict.__len__=function(self){var _count=0
if(self.$all_str){return Object.keys(self.$strings).length}
if(self.$jsobj){for(var attr in self.$jsobj){if(attr.charAt(0)!="$" &&
((! self.$exclude)||! self.$exclude(attr))){_count++}}
return _count}
for(var d of self._keys){if(d !==undefined){_count++}}
return _count}
dict.__ne__=function(self,other){var res=dict.__eq__(self,other)
return res===_b_.NotImplemented ? res :! res}
dict.__new__=function(cls){if(cls===undefined){throw _b_.TypeError.$factory("int.__new__(): not enough arguments")}
var instance=$B.empty_dict()
instance.__class__=cls
if(cls !==dict){instance.__dict__=$B.empty_dict()}
return instance}
dict.__or__=function(self,other){
if(! $B.$isinstance(other,dict)){return _b_.NotImplemented}
var res=dict.copy(self)
dict.update(res,other)
return res}
function __newobj__(){
var $=$B.args('__newobj__',0,{},[],arguments,{},'args',null),args=$.args
var res=$B.empty_dict()
res.__class__=args[0]
return res}
dict.__reduce_ex__=function(self,protocol){return $B.fast_tuple([__newobj__,$B.fast_tuple([self.__class__]),_b_.None,_b_.None,dict.items(self)])}
dict.__repr__=function(self){$B.builtins_repr_check(dict,arguments)
if(self.$jsobj){
return dict.__repr__(jsobj2dict(self.$jsobj,self.$exclude))}
if($B.repr.enter(self)){return "{...}"}
var res=[],key,value
for(var entry of dict.$iter_items_with_hash(self)){res.push(_b_.repr(entry.key)+": "+_b_.repr(entry.value))}
$B.repr.leave(self)
return "{"+res.join(", ")+"}"}
dict.$iter_items_reversed=function*(d){var version=d.$version
for(var i=d._keys.length-1;i >=0;i--){var key=d._keys[i]
if(key !==undefined){yield $B.fast_tuple([key,d._values[i]])
if(d.$version !==version){throw _b_.RuntimeError.$factory('changed in iteration')}}}
if(d.$version !==version){throw _b_.RuntimeError.$factory('changed in iteration')}}
dict.$iter_keys_reversed=function*(d){for(var entry of dict.$iter_items_reversed(d)){yield entry[0]}}
dict.$iter_values_reversed=function*(d){for(var entry of dict.$iter_items_reversed(d)){yield entry[1]}}
function make_reverse_iterator(name,iter_func){
var klass=$B.make_class(name,function(d){return{
__class__:klass,d,iter:iter_func(d),make_iter:function(){return iter_func(d)}}}
)
klass.__iter__=function(self){self[Symbol.iterator]=self.make_iter
return self}
klass.__next__=function(self){var res=self.iter.next()
if(res.done){throw _b_.StopIteration.$factory('')}
return res.value}
klass.__reduce_ex__=function(self,protocol){return $B.fast_tuple([_b_.iter,$B.fast_tuple([Array.from(self.make_iter())])])}
$B.set_func_names(klass,'builtins')
return klass}
dict_reversekeyiterator=make_reverse_iterator(
'dict_reversekeyiterator',dict.$iter_keys_reversed)
dict.__reversed__=function(self){return dict_reversekeyiterator.$factory(self)}
dict.__ror__=function(self,other){
if(! $B.$isinstance(other,dict)){return _b_.NotImplemented}
var res=dict.copy(other)
dict.update(res,self)
return res}
dict.__setitem__=function(self,key,value){var $=$B.args("__setitem__",3,{self:null,key:null,value:null},["self","key","value"],arguments,{},null,null)
return dict.$setitem($.self,$.key,$.value)}
function convert_all_str(d){
d.$all_str=false
for(var key in d.$strings){dict.$setitem(d,key,d.$strings[key])}}
dict.$setitem=function(self,key,value,$hash,from_setdefault){
if(self.$all_str){if(typeof key=='string'){var int=parseInt(key)
if(isNaN(int)||int >=0){self.$strings[key]=value
return _b_.None}else{
convert_all_str(self)}}else{convert_all_str(self)}}
if(self.$jsobj){if(self.$from_js){
value=$B.pyobj2jsobj(value)}
if(self.$jsobj.__class__===_b_.type){self.$jsobj[key]=value
if(key=="__init__" ||key=="__new__"){
self.$jsobj.$factory=$B.$instance_creator(self.$jsobj)}}else{self.$jsobj[key]=value}
return $N}else if(self.__class__===$B.jsobj_as_pydict){return $B.jsobj_as_pydict.__setitem__(self,key,value)}
if(key instanceof String){key=key.valueOf()}
var hash=$hash !==undefined ? $hash :$B.$hash(key)
var index
if(self.table[hash]===undefined){index=self._keys.length
self.table[hash]=[index]}else{if(! from_setdefault){
var lookup=dict.$lookup_by_key(self,key,hash)
if(lookup.found){self._values[lookup.index]=value
return _b_.None}}
index=self._keys.length
if(self.table[hash]===undefined){
self.table[hash]=[index]}else{self.table[hash].push(index)}}
self._keys.push(key)
self._values.push(value)
self._hashes.push(hash)
self.$version++
return _b_.None}
$B.make_rmethods(dict)
dict.clear=function(){
var $=$B.args("clear",1,{self:null},["self"],arguments,{},null,null),self=$.self
self.table=Object.create(null)
self._keys=[]
self._values=[]
self.$all_str=true
self.$strings=new $B.str_dict()
if(self.$jsobj){for(var attr in self.$jsobj){if(attr.charAt(0)!=="$" && attr !=="__class__"){delete self.$jsobj[attr]}}}
self.$version++
return $N}
dict.copy=function(self){
var $=$B.args("copy",1,{self:null},["self"],arguments,{},null,null),self=$.self,res=$B.empty_dict()
if(self.__class__===_b_.dict){$copy_dict(res,self)
return res}
var it=$B.make_js_iterator(self)
for(var k of it){console.log('iteration yields key',k)}
return res}
dict.fromkeys=function(){var $=$B.args("fromkeys",3,{cls:null,keys:null,value:null},["cls","keys","value"],arguments,{value:_b_.None},null,null),keys=$.keys,value=$.value
var cls=$.cls,res=$B.$call(cls)(),klass=$B.get_class(res),
keys_iter=$B.$iter(keys),setitem=klass===dict ? dict.$setitem :$B.$getattr(klass,'__setitem__')
while(1){try{var key=_b_.next(keys_iter)
setitem(res,key,value)}catch(err){if($B.is_exc(err,[_b_.StopIteration])){return res}
throw err}}}
dict.get=function(){var $=$B.args("get",3,{self:null,key:null,_default:null},["self","key","_default"],arguments,{_default:$N},null,null)
try{
return dict.$getitem($.self,$.key,true)}catch(err){if($B.$isinstance(err,_b_.KeyError)){return $._default}else{throw err}}}
var dict_items=$B.make_class("dict_items",function(d){return{
__class__:dict_items,dict:d,make_iter:function*(){for(var entry of dict.$iter_items_with_hash(d)){yield $B.fast_tuple([entry.key,entry.value])}}}}
)
dict_items.__iter__=function(self){return dict_itemiterator.$factory(self.make_iter)}
dict_items.__len__=function(self){return dict.__len__(self.dict)}
dict_items.__reduce__=function(self){var items=Array.from(self.make_iter())
return $B.fast_tuple([_b_.iter,$B.fast_tuple([items])])}
dict_items.__repr__=function(self){var items=Array.from(self.make_iter())
items=items.map($B.fast_tuple)
return 'dict_items('+_b_.repr(items)+')'}
dict_reverseitemiterator=make_reverse_iterator(
'dict_reverseitemiterator',dict.$iter_items_reversed)
dict_items.__reversed__=function(self){return dict_reverseitemiterator.$factory(self.dict)}
make_view_comparison_methods(dict_items)
$B.set_func_names(dict_items,'builtins')
var dict_itemiterator=$B.make_class('dict_itemiterator',function(make_iter){return{
__class__:dict_itemiterator,iter:make_iter(),make_iter}}
)
dict_itemiterator.__iter__=function(self){self[Symbol.iterator]=function(){return self.iter}
return self}
dict_itemiterator.__next__=function(self){var res=self.iter.next()
if(res.done){throw _b_.StopIteration.$factory('')}
return $B.fast_tuple(res.value)}
dict_itemiterator.__reduce_ex__=function(self,protocol){return $B.fast_tuple([_b_.iter,$B.fast_tuple([Array.from(self.make_iter())])])}
$B.set_func_names(dict_itemiterator,'builtins')
dict.items=function(self){var $=$B.args('items',1,{self:null},['self'],arguments,{},null,null)
return dict_items.$factory(self)}
var dict_keys=$B.make_class("dict_keys",function(d){return{
__class__:dict_keys,dict:d,make_iter:function(){return dict.$iter_keys_check(d)}}}
)
dict_keys.__iter__=function(self){return dict_keyiterator.$factory(self.make_iter)}
dict_keys.__len__=function(self){return dict.__len__(self.dict)}
dict_keys.__reduce__=function(self){var items=Array.from(self.make_iter())
return $B.fast_tuple([_b_.iter,$B.fast_tuple([items])])}
dict_keys.__repr__=function(self){var items=Array.from(self.make_iter())
return 'dict_keys('+_b_.repr(items)+')'}
dict_keys.__reversed__=function(self){return dict_reversekeyiterator.$factory(self.dict)}
make_view_comparison_methods(dict_keys)
$B.set_func_names(dict_keys,'builtins')
var dict_keyiterator=$B.make_class('dict_keyiterator',function(make_iter){return{
__class__:dict_keyiterator,iter:make_iter(),make_iter}}
)
dict_keyiterator.__iter__=function(self){self[Symbol.iterator]=function(){return self.iter}
return self}
dict_keyiterator.__next__=function(self){var res=self.iter.next()
if(res.done){throw _b_.StopIteration.$factory('')}
return res.value}
dict_keyiterator.__reduce_ex__=function(self,protocol){return $B.fast_tuple([_b_.iter,$B.fast_tuple([Array.from(self.make_iter())])])}
$B.set_func_names(dict_keyiterator,'builtins')
dict.keys=function(self){var $=$B.args('keys',1,{self:null},['self'],arguments,{},null,null)
return dict_keys.$factory(self)}
dict.pop=function(){var missing={},$=$B.args("pop",3,{self:null,key:null,_default:null},["self","key","_default"],arguments,{_default:missing},null,null),self=$.self,key=$.key,_default=$._default
try{var res=dict.__getitem__(self,key)
dict.__delitem__(self,key)
return res}catch(err){if(err.__class__===_b_.KeyError){if(_default !==missing){return _default}
throw err}
throw err}}
dict.popitem=function(self){$B.check_nb_args_no_kw('popitem',1,arguments)
if(dict.__len__(self)==0){throw _b_.KeyError.$factory("'popitem(): dictionary is empty'")}
if(self.$all_str){for(var key in self.$strings){}
var res=$B.fast_tuple([key,self.$strings[key]])
delete self.$strings[key]
self.$version++
return res}
var index=self._keys.length-1
while(index >=0){if(self._keys[index]!==undefined){var res=$B.fast_tuple([self._keys[index],self._values[index]])
delete self._keys[index]
delete self._values[index]
self.$version++
return res}
index--}}
dict.setdefault=function(){var $=$B.args("setdefault",3,{self:null,key:null,_default:null},["self","key","_default"],arguments,{_default:$N},null,null),self=$.self,key=$.key,_default=$._default
_default=_default===undefined ? _b_.None :_default
if(self.$all_str){if(! self.$strings.hasOwnProperty(key)){self.$strings[key]=_default}
return self.$strings[key]}
if(self.$jsobj){if(! self.$jsobj.hasOwnProperty(key)){self.$jsobj[key]=_default}
return self.$jsobj[key]}
var lookup=dict.$lookup_by_key(self,key)
if(lookup.found){return lookup.value}
var hash=lookup.hash
dict.$setitem(self,key,_default,hash,true)
return _default}
dict.update=function(self){var $=$B.args("update",1,{"self":null},["self"],arguments,{},"args","kw"),self=$.self,args=$.args,kw=$.kw
if(args.length > 0){var o=args[0]
if($B.$isinstance(o,dict)){if(o.$jsobj){o=jsobj2dict(o.$jsobj)}
$copy_dict(self,o)}else if(_b_.hasattr(o,"keys")){var _keys=_b_.list.$factory($B.$call($B.$getattr(o,"keys"))())
for(var i=0,len=_keys.length;i < len;i++){var _value=$B.$getattr(o,"__getitem__")(_keys[i])
dict.$setitem(self,_keys[i],_value)}}else{var it=_b_.iter(o),i=0
while(true){try{var item=_b_.next(it)}catch(err){if(err.__class__===_b_.StopIteration){break}
throw err}
try{key_value=_b_.list.$factory(item)}catch(err){throw _b_.TypeError.$factory("cannot convert dictionary"+
" update sequence element #"+i+" to a sequence")}
if(key_value.length !==2){throw _b_.ValueError.$factory("dictionary update "+
"sequence element #"+i+" has length "+
key_value.length+"; 2 is required")}
dict.$setitem(self,key_value[0],key_value[1])
i++}}}
$copy_dict(self,kw)
return $N}
var dict_values=$B.make_class("dict_values",function(d){return{
__class__:dict_values,dict:d,make_iter:function(){return dict.$iter_values_check(d)}}}
)
dict_values.__iter__=function(self){return dict_valueiterator.$factory(self.make_iter)}
dict_values.__len__=function(self){return dict.__len__(self.dict)}
dict_values.__reduce__=function(self){var items=Array.from(self.make_iter())
return $B.fast_tuple([_b_.iter,$B.fast_tuple([items])])}
dict_values.__repr__=function(self){var items=Array.from(self.make_iter())
return 'dict_values('+_b_.repr(items)+')'}
dict_reversevalueiterator=make_reverse_iterator(
'dict_reversevalueiterator',dict.$iter_values_reversed)
dict_values.__reversed__=function(self){return dict_reversevalueiterator.$factory(self.dict)}
make_view_comparison_methods(dict_values)
$B.set_func_names(dict_values,'builtins')
var dict_valueiterator=$B.make_class('dict_valueiterator',function(make_iter){return{
__class__:dict_valueiterator,iter:make_iter(),make_iter}}
)
dict_valueiterator.__iter__=function(self){self[Symbol.iterator]=function(){return self.iter}
return self}
dict_valueiterator.__next__=function(self){var res=self.iter.next()
if(res.done){throw _b_.StopIteration.$factory('')}
return res.value}
dict_valueiterator.__reduce_ex__=function(self,protocol){return $B.fast_tuple([_b_.iter,$B.fast_tuple([Array.from(self.make_iter())])])}
$B.set_func_names(dict_valueiterator,'builtins')
dict.values=function(self){var $=$B.args('values',1,{self:null},['self'],arguments,{},null,null)
return dict_values.$factory(self)}
dict.$literal=function(items){var res=$B.empty_dict()
for(var item of items){dict.$setitem(res,item[0],item[1],item[2])}
return res}
dict.$factory=function(){var res=dict.__new__(dict)
var args=[res]
for(var arg of arguments){args.push(arg)}
dict.__init__.apply(null,args)
return res}
_b_.dict=dict
$B.set_func_names(dict,"builtins")
dict.__class_getitem__=_b_.classmethod.$factory(dict.__class_getitem__)
$B.empty_dict=function(){return{
__class__:dict,table:Object.create(null),_keys:[],_values:[],_hashes:[],$strings:new $B.str_dict(),$version:0,$order:0,$all_str:true}}
dict.fromkeys=_b_.classmethod.$factory(dict.fromkeys)
var mappingproxy=$B.mappingproxy=$B.make_class("mappingproxy",function(obj){if($B.$isinstance(obj,dict)){
var res=$B.obj_dict(dict.$to_obj(obj))}else{var res=$B.obj_dict(obj)}
res.__class__=mappingproxy
res.$version=0
return res}
)
mappingproxy.$match_mapping_pattern=true 
mappingproxy.__repr__=function(self){var d=$B.empty_dict()
for(var key in self.$jsobj){dict.$setitem(d,key,self.$jsobj[key])}
return dict.__repr__(d)}
mappingproxy.__setitem__=function(){throw _b_.TypeError.$factory("'mappingproxy' object does not support "+
"item assignment")}
for(var attr in dict){if(mappingproxy[attr]!==undefined ||
["__class__","__mro__","__new__","__init__","__delitem__","clear","fromkeys","pop","popitem","setdefault","update"].indexOf(attr)>-1){continue}
if(typeof dict[attr]=="function"){mappingproxy[attr]=(function(key){return function(){return dict[key].apply(null,arguments)}})(attr)}else{mappingproxy[attr]=dict[attr]}}
$B.set_func_names(mappingproxy,"builtins")
function jsobj2dict(x,exclude){exclude=exclude ||function(){return false}
var d=$B.empty_dict()
for(var attr in x){if(attr.charAt(0)!="$" && ! exclude(attr)){if(x[attr]===null){dict.$setitem(d,attr,_b_.None)}else if(x[attr]===undefined){continue}else if(x[attr].$jsobj===x){dict.$setitem(d,attr,d)}else{dict.$setitem(d,attr,$B.$JS2Py(x[attr]))}}}
return d}
$B.obj_dict=function(obj,exclude){var klass=obj.__class__ ||$B.get_class(obj)
if(klass !==undefined && klass.$native){throw $B.attr_error("__dict__",obj)}
var res={__class__:dict,$jsobj:obj,$exclude:exclude ||function(){return false}}
return res}
var jsobj_as_pydict=$B.jsobj_as_pydict=$B.make_class('jsobj_as_pydict',function(jsobj){return{
__class__:jsobj_as_pydict,obj:jsobj ||{},new_keys:[],$version:0}}
)
jsobj_as_pydict.__contains__=function(self,key){if(self.new_keys.indexOf(key)>-1){return true}
return self.obj[key]!==undefined}
jsobj_as_pydict.__delitem__=function(self,key){jsobj_as_pydict.__getitem__(self,key)
delete self.obj[key]
var ix=self.new_keys.indexOf(key)
if(ix >-1){self.new_keys.splice(ix,1)}}
jsobj_as_pydict.__eq__=function(self,other){if(other.__class__ !==jsobj_as_pydict &&
! $B.$isinstance(other,_b_.dict)){return _b_.NotImplemented}
var self1=$B.empty_dict()
other1=$B.empty_dict()
dict.__init__(self1,jsobj_as_pydict.items(self))
dict.__init__(other1,$B.get_class(other).items(other))
return dict.__eq__(self1,other1)}
jsobj_as_pydict.__ne__=function(self,other){var eq=jsobj_as_pydict.__eq__(self,other)
return eq===_b_.NotImplemented ? eq :! eq}
jsobj_as_pydict.__getitem__=function(self,key){if(self.obj.hasOwnProperty(key)){return self.obj[key]}
throw _b_.KeyError.$factory(key)}
jsobj_as_pydict.__iter__=function(self){return _b_.iter(jsobj_as_pydict.keys(self))}
jsobj_as_pydict.__len__=function(self){var len=0
for(var key in self.obj){len++}
return len+self.new_keys.length}
jsobj_as_pydict.__or__=function(self,other){
if(! $B.$isinstance(other,[dict,jsobj_as_pydict])){return _b_.NotImplemented}
var res=jsobj_as_pydict.copy(self)
jsobj_as_pydict.update(res,other)
return res}
jsobj_as_pydict.__repr__=function(self){if($B.repr.enter(self)){return "{...}"}
var res=[],items=_b_.list.$factory(jsobj_as_pydict.items(self))
for(var item of items){res.push(_b_.repr(item[0])+": "+_b_.repr(item[1]))}
$B.repr.leave(self)
return "{"+res.join(", ")+"}"}
jsobj_as_pydict.__setitem__=function(self,key,value){self.obj[key]=value}
jsobj_as_pydict.clear=function(self){self.obj={}
return _b_.None}
jsobj_as_pydict.copy=function(self){var copy=jsobj_as_pydict.$factory()
for(var key in self.obj){copy.obj[key]=self.obj[key]}
return copy}
jsobj_as_pydict.get=function(self,key,_default){_default=_default===undefined ? _b_.None :_default
if(! self.obj.hasOwnProperty(key)){return _default}
return self.obj[key]}
jsobj_as_pydict.$iter_items=function*(self){for(var key in self.obj){yield $B.fast_tuple([key,self.obj[key]])}}
jsobj_as_pydict.items=function(self){var items=Array.from(jsobj_as_pydict.$iter_items(self))
return _b_.iter(items)}
jsobj_as_pydict.keys=function(self){var items=Array.from(jsobj_as_pydict.$iter_items(self)),keys=items.map(x=> x[0])
return _b_.iter(keys)}
jsobj_as_pydict.pop=function(){var missing={},$=$B.args("pop",3,{self:null,key:null,_default:null},["self","key","_default"],arguments,{_default:missing},null,null),self=$.self,key=$.key,_default=$._default
if(self.obj.hasOwnProperty(key)){var res=self.obj[key]
delete self.obj[key]
return res}else{if(_default !==missing){return _default}
throw _b_.KeyError.$factory(key)}}
jsobj_as_pydict.popitem=function(self){$B.check_nb_args_no_kw('popitem',1,arguments)
for(var key in self.obj){var res=$B.fast_tuple([key,self.obj[key]])
delete self.obj[key]
return res}
throw _b_.KeyError.$factory("'popitem(): dictionary is empty'")}
jsobj_as_pydict.update=function(self,other){var klass=$B.get_class(other),keys=$B.$call($B.$getattr(klass,'keys')),getitem
for(var key of $B.make_js_iterator(keys(other))){if(! getitem){getitem=$B.$call($B.$getattr(klass,'__getitem__'))}
self.obj[key]=getitem(other,key)}
return _b_.None}
jsobj_as_pydict.values=function(self){var items=Array.from(jsobj_as_pydict.$iter_items(self)),values=items.map(x=> x[1])
return _b_.iter(values)}
$B.set_func_names(jsobj_as_pydict,'builtins')})(__BRYTHON__)
;
;(function($B){var _b_=$B.builtins,object=_b_.object,getattr=$B.$getattr,isinstance=$B.$isinstance
function check_not_tuple(self,attr){if(self.__class__===tuple){throw $B.attr_error(attr,self)}}
function $list(){
return list.$factory.apply(null,arguments)}
var list={__class__:_b_.type,__qualname__:'list',__mro__:[object],$is_class:true,$native:true,$match_sequence_pattern:true,
__dir__:object.__dir__}
list.__add__=function(self,other){if($B.get_class(self)!==$B.get_class(other)){var this_name=$B.class_name(self)
var radd=$B.$getattr(other,'__radd__',null)
if(radd===null){throw _b_.TypeError.$factory('can only concatenate '+
this_name+' (not "'+$B.class_name(other)+
'") to '+this_name)}
return _b_.NotImplemented}
var res=self.slice(),is_js=other.$brython_class=="js" 
for(const item of other){res.push(is_js ? $B.$JS2Py(item):item)}
res.__brython__=true
if(isinstance(self,tuple)){res=tuple.$factory(res)}
return res}
list.__bool__=function(self){return list.__len__(self)> 0}
list.__class_getitem__=function(cls,item){
if(! Array.isArray(item)){item=[item]}
return $B.GenericAlias.$factory(cls,item)}
list.__contains__=function(self,item){var $=$B.args("__contains__",2,{self:null,item:null},["self","item"],arguments,{},null,null),self=$.self,item=$.item
for(var _item of self){if($B.is_or_equals(_item,item)){return true}}
return false}
list.__delitem__=function(self,arg){if(isinstance(arg,_b_.int)){var pos=arg
if(arg < 0){pos=self.length+pos}
if(pos >=0 && pos < self.length){self.splice(pos,1)
return _b_.None}
throw _b_.IndexError.$factory($B.class_name(self)+
" index out of range")}
if(isinstance(arg,_b_.slice)){var step=arg.step
if(step===_b_.None){step=1}
var start=arg.start
if(start===_b_.None){start=step > 0 ? 0 :self.length}
var stop=arg.stop
if(stop===_b_.None){stop=step > 0 ? self.length :0}
if(start < 0){start=self.length+start}
if(stop < 0){stop=self.length+stop}
var res=[],i=null,pos=0
if(step > 0){if(stop > start){for(var i=start;i < stop;i+=step){if(self[i]!==undefined){res[pos++]=i}}}}else{if(stop < start){for(var i=start;i > stop;i+=step){if(self[i]!==undefined){res[pos++]=i}}
res.reverse()}}
var i=res.length
while(i--){self.splice(res[i],1)}
return _b_.None}
if(_b_.hasattr(arg,"__int__")||_b_.hasattr(arg,"__index__")){list.__delitem__(self,_b_.int.$factory(arg))
return _b_.None}
throw _b_.TypeError.$factory($B.class_name(self)+
" indices must be integer, not "+$B.class_name(arg))}
list.__eq__=function(self,other){var klass=isinstance(self,list)? list :tuple
if(isinstance(other,klass)){if(other.length==self.length){var i=self.length
while(i--){if(! $B.is_or_equals(self[i],other[i])){return false}}
return true}
return false}
return _b_.NotImplemented}
list.__getitem__=function(self,key){
$B.check_nb_args_no_kw("__getitem__",2,arguments)
return list.$getitem(self,key)}
list.$getitem=function(self,key){var klass=(self.__class__ ||$B.get_class(self))
var factory=function(list_res){list_res.__class__=klass
return list_res}
var int_key
try{int_key=$B.PyNumber_Index(key)}catch(err){}
if(int_key !==undefined){var items=self.valueOf(),pos=int_key
if(int_key < 0){pos=items.length+pos}
if(pos >=0 && pos < items.length){return items[pos]}
throw _b_.IndexError.$factory($B.class_name(self)+
" index out of range")}
if(key.__class__===_b_.slice ||isinstance(key,_b_.slice)){
if(key.start===_b_.None && key.stop===_b_.None &&
key.step===_b_.None){return self.slice()}
var s=_b_.slice.$conv_for_seq(key,self.length)
var res=[],i=null,items=self.valueOf(),pos=0,start=s.start,stop=s.stop,step=s.step
if(step > 0){if(stop <=start){return factory(res)}
for(var i=start;i < stop;i+=step){res[pos++]=items[i]}
return factory(res)}else{if(stop > start){return factory(res)}
for(var i=start;i > stop;i+=step){res[pos++]=items[i]}
return factory(res)}}
throw _b_.TypeError.$factory($B.class_name(self)+
" indices must be integer, not "+$B.class_name(key))}
list.__ge__=function(self,other){
if(! $B.$isinstance(other,list)){return _b_.NotImplemented}
var res=list.__le__(other,self)
if(res===_b_.NotImplemented){return res}
return res}
list.__gt__=function(self,other){
if(! $B.$isinstance(other,list)){return _b_.NotImplemented}
var res=list.__lt__(other,self)
if(res===_b_.NotImplemented){return res}
return res}
list.__hash__=_b_.None
list.__iadd__=function(){var $=$B.args("__iadd__",2,{self:null,x:null},["self","x"],arguments,{},null,null)
var x=list.$factory($B.$iter($.x))
for(var i=0;i < x.length;i++){$.self.push(x[i])}
return $.self}
list.__imul__=function(){var $=$B.args("__imul__",2,{self:null,x:null},["self","x"],arguments,{},null,null),x=$B.$GetInt($.x),len=$.self.length,pos=len
if(x==0){list.clear($.self)
return $.self}
for(var i=1;i < x;i++){for(j=0;j < len;j++){$.self[pos++]=$.self[j]}}
return $.self}
list.__init__=function(self,arg){var $=$B.args('__init__',1,{self:null},['self'],arguments,{},'args',null),self=$.self,args=$.args
if(args.length > 1){throw _b_.TypeError.$factory('expected at most 1 argument, got '+
args.length)}
var arg=args[0]
var len_func=$B.$call($B.$getattr(self,"__len__")),pop_func=$B.$getattr(self,"pop",_b_.None)
if(pop_func !==_b_.None){pop_func=$B.$call(pop_func)
while(len_func()){pop_func()}}
if(arg===undefined){return _b_.None}
var arg=$B.$iter(arg),next_func=$B.$call($B.$getattr(arg,"__next__")),pos=len_func()
while(1){try{var res=next_func()
self[pos++]=res}catch(err){if(err.__class__===_b_.StopIteration){break}
else{throw err}}}
return _b_.None}
var list_iterator=$B.make_iterator_class("list_iterator")
list_iterator.__reduce__=list_iterator.__reduce_ex__=function(self){return $B.fast_tuple([_b_.iter,$B.fast_tuple([list.$factory(self)]),0])}
list.__iter__=function(self){return list_iterator.$factory(self)}
list.__le__=function(self,other){
if(! isinstance(other,[list,_b_.tuple])){return _b_.NotImplemented}
var i=0
while(i < self.length && i < other.length &&
$B.is_or_equals(self[i],other[i])){i++}
if(i==self.length){
return self.length <=other.length}
if(i==other.length){
return false}
return $B.rich_comp('__le__',self[i],other[i])}
list.__len__=function(self){return self.length}
list.__lt__=function(self,other){
if(! isinstance(other,[list,_b_.tuple])){return _b_.NotImplemented}
var i=0
while(i < self.length && i < other.length &&
$B.is_or_equals(self[i],other[i])){i++}
if(i==self.length){
return self.length < other.length}
if(i==other.length){
return false}
return $B.rich_comp('__lt__',self[i],other[i])}
list.__mul__=function(self,other){try{other=$B.PyNumber_Index(other)}catch(err){throw _b_.TypeError.$factory("can't multiply sequence by non-int "+
`of type '${$B.class_name(other)}'`)}
if(self.length==0){return list.__new__(list)}
if(typeof other=='number'){if(other < 0){return list.__new__(list)}
if(self.length > $B.max_array_size/other){throw _b_.OverflowError.$factory(`cannot fit `+
`'${$B.class_name(other)}' into an index-sized integer`)}
var res=[],$temp=self.slice(),len=$temp.length
for(var i=0;i < other;i++){for(var j=0;j < len;j++){res.push($temp[j])}}
res.__class__=self.__class__
if(self.__brython__){res.__brython__=self.__brython__}
return res}else if($B.$isinstance(other,$B.long_int)){throw _b_.OverflowError.$factory(`cannot fit `+
`'${$B.class_name(other)}' into an index-sized integer`)}}
list.__new__=function(cls,...args){if(cls===undefined){throw _b_.TypeError.$factory("list.__new__(): not enough arguments")}
var res=[]
res.__class__=cls
res.__brython__=true
res.__dict__=$B.empty_dict()
return res}
function __newobj__(){
var $=$B.args('__newobj__',0,{},[],arguments,{},'args',null),args=$.args
var res=args.slice(1)
res.__class__=args[0]
return res}
list.__reduce_ex__=function(self){return $B.fast_tuple([__newobj__,$B.fast_tuple([self.__class__]),_b_.None,_b_.iter(self)])}
list.__repr__=function(self){$B.builtins_repr_check(list,arguments)
return list_repr(self)}
function list_repr(self){
if($B.repr.enter(self)){
return '[...]'}
var _r=[],res
for(var i=0;i < self.length;i++){_r.push(_b_.repr(self[i]))}
if($B.$isinstance(self,tuple)){if(self.length==1){res="("+_r[0]+",)"}else{res="("+_r.join(", ")+")"}}else{res="["+_r.join(", ")+"]"}
$B.repr.leave(self)
return res}
list.__rmul__=function(self,other){return list.__mul__(self,other)}
list.__setattr__=function(self,attr,value){if(self.__class__===list ||self.__class__===tuple){var cl_name=$B.class_name(self)
if(list.hasOwnProperty(attr)){throw _b_.AttributeError.$factory("'"+cl_name+
"' object attribute '"+attr+"' is read-only")}else{throw _b_.AttributeError.$factory(
"'"+cl_name+" object has no attribute '"+attr+"'")}}
_b_.dict.$setitem(self.__dict__,attr,value)
return _b_.None}
list.__setitem__=function(){var $=$B.args("__setitem__",3,{self:null,key:null,value:null},["self","key","value"],arguments,{},null,null),self=$.self,arg=$.key,value=$.value
list.$setitem(self,arg,value)}
list.$setitem=function(self,arg,value){
if(typeof arg=="number" ||isinstance(arg,_b_.int)){var pos=arg
if(arg < 0){pos=self.length+pos}
if(pos >=0 && pos < self.length){self[pos]=value}else{throw _b_.IndexError.$factory("list index out of range")}
return _b_.None}
if(isinstance(arg,_b_.slice)){var s=_b_.slice.$conv_for_seq(arg,self.length)
if(arg.step===null){$B.set_list_slice(self,s.start,s.stop,value)}else{$B.set_list_slice_step(self,s.start,s.stop,s.step,value)}
return _b_.None}
if(_b_.hasattr(arg,"__int__")||_b_.hasattr(arg,"__index__")){list.__setitem__(self,_b_.int.$factory(arg),value)
return _b_.None}
throw _b_.TypeError.$factory("list indices must be integer, not "+
$B.class_name(arg))}
list.append=function(self,x){$B.check_nb_args_no_kw("append",2,arguments)
self[self.length]=x
return _b_.None}
list.clear=function(){var $=$B.args("clear",1,{self:null},["self"],arguments,{},null,null)
while($.self.length){$.self.pop()}
return _b_.None}
list.copy=function(){var $=$B.args("copy",1,{self:null},["self"],arguments,{},null,null)
var res=$.self.slice()
res.__class__=self.__class__
res.__brython__=true
return res}
list.count=function(){var $=$B.args("count",2,{self:null,x:null},["self","x"],arguments,{},null,null)
var res=0
for(var _item of $.self){if($B.is_or_equals(_item,$.x)){res++}}
return res}
list.extend=function(){var $=$B.args("extend",2,{self:null,t:null},["self","t"],arguments,{},null,null)
var other=list.$factory(_b_.iter($.t))
for(var i=0;i < other.length;i++){$.self.push(other[i])}
return _b_.None}
list.index=function(){var missing={},$=$B.args("index",4,{self:null,x:null,start:null,stop:null},["self","x","start" ,"stop"],arguments,{start:0,stop:missing},null,null),self=$.self,start=$.start,stop=$.stop
var _eq=function(other){return $B.rich_comp("__eq__",$.x,other)}
if(start.__class__===$B.long_int){start=parseInt(start.value)*(start.pos ? 1 :-1)}
if(start < 0){start=Math.max(0,start+self.length)}
if(stop===missing){stop=self.length}else{if(stop.__class__===$B.long_int){stop=parseInt(stop.value)*(stop.pos ? 1 :-1)}
if(stop < 0){stop=Math.min(self.length,stop+self.length)}
stop=Math.min(stop,self.length)}
for(var i=start;i < stop;i++){if($B.rich_comp('__eq__',$.x,self[i])){return i}}
throw _b_.ValueError.$factory(_b_.repr($.x)+" is not in "+
$B.class_name(self))}
list.insert=function(){var $=$B.args("insert",3,{self:null,i:null,item:null},["self","i","item"],arguments,{},null,null)
$.self.splice($.i,0,$.item)
return _b_.None}
list.pop=function(){var missing={}
var $=$B.args("pop",2,{self:null,pos:null},["self","pos"],arguments,{pos:missing},null,null),self=$.self,pos=$.pos
check_not_tuple(self,"pop")
if(pos===missing){pos=self.length-1}
pos=$B.$GetInt(pos)
if(pos < 0){pos+=self.length}
var res=self[pos]
if(res===undefined){throw _b_.IndexError.$factory("pop index out of range")}
self.splice(pos,1)
return res}
list.remove=function(){var $=$B.args("remove",2,{self:null,x:null},["self","x"],arguments,{},null,null)
for(var i=0,len=$.self.length;i < len;i++){if($B.rich_comp("__eq__",$.self[i],$.x)){$.self.splice(i,1)
return _b_.None}}
throw _b_.ValueError.$factory(_b_.str.$factory($.x)+" is not in list")}
list.reverse=function(self){var $=$B.args("reverse",1,{self:null},["self"],arguments,{},null,null),_len=$.self.length-1,i=parseInt($.self.length/2)
while(i--){var buf=$.self[i]
$.self[i]=$.self[_len-i]
$.self[_len-i]=buf}
return _b_.None}
function $partition(arg,array,begin,end,pivot)
{var piv=array[pivot]
array=swap(array,pivot,end-1)
var store=begin
if(arg===null){if(array.$cl !==false){
var le_func=_b_.getattr(array.$cl,"__le__")
for(var ix=begin;ix < end-1;++ix){if(le_func(array[ix],piv)){array=swap(array,store,ix);
++store}}}else{for(var ix=begin;ix < end-1;++ix){if($B.$getattr(array[ix],"__le__")(piv)){array=swap(array,store,ix)
++store}}}}else{var len=array.length
for(var ix=begin;ix < end-1;++ix){var x=arg(array[ix])
if(array.length !==len){throw _b_.ValueError.$factory("list modified during sort")}
if($B.$getattr(x,"__le__")(arg(piv))){array=swap(array,store,ix)
++store}}}
array=swap(array,end-1,store)
return store}
function swap(_array,a,b){var tmp=_array[a]
_array[a]=_array[b]
_array[b]=tmp
return _array}
function $qsort(arg,array,begin,end){if(end-1 > begin){var pivot=begin+Math.floor(Math.random()*(end-begin))
pivot=$partition(arg,array,begin,end,pivot)
$qsort(arg,array,begin,pivot)
$qsort(arg,array,pivot+1,end)}}
function $elts_class(self){
if(self.length==0){return null}
var cl=$B.get_class(self[0]),i=self.length
while(i--){if($B.get_class(self[i])!==cl){return false}}
return cl}
list.sort=function(self){var $=$B.args("sort",1,{self:null},["self"],arguments,{},null,"kw")
check_not_tuple(self,"sort")
var func=_b_.None,reverse=false,kw_args=$.kw
for(var key in kw_args.$jsobj){if(key=="key"){func=kw_args.$jsobj[key]}else if(key=="reverse"){reverse=kw_args.$jsobj[key]}else{throw _b_.TypeError.$factory("'"+key+
"' is an invalid keyword argument for this function")}}
if(self.length==0){return _b_.None}
if(func !==_b_.None){func=$B.$call(func)}
self.$cl=$elts_class(self)
var cmp=null;
function basic_cmp(a,b){return $B.rich_comp("__lt__",a,b)?-1:
$B.rich_comp('__eq__',a,b)? 0 :1}
function reverse_cmp(a,b){return basic_cmp(b,a)}
if(func===_b_.None && self.$cl===_b_.str){if(reverse){cmp=function(b,a){return $B.$AlphabeticalCompare(a,b)}}else{cmp=function(a,b){return $B.$AlphabeticalCompare(a,b)}}}else if(func===_b_.None && self.$cl===_b_.int){if(reverse){cmp=function(b,a){return a-b}}else{cmp=function(a,b){return a-b}}}else{cmp=reverse ?
function(t1,t2){return basic_cmp(t2[0],t1[0])}:
function(t1,t2){return basic_cmp(t1[0],t2[0])}
if(func===_b_.None){cmp=reverse ? reverse_cmp :basic_cmp
self.sort(cmp)}else{var temp=[],saved=self.slice()
for(var i=0,len=self.length;i < len;i++){temp.push([func(self[i]),i])}
temp.sort(cmp)
for(var i=0,len=temp.length;i < len;i++){self[i]=saved[temp[i][1]]}}
return self.__brython__ ? _b_.None :self}
$B.$TimSort(self,cmp)
return self.__brython__ ? _b_.None :self}
$B.$list=function(t){t.__brython__=true
t.__class__=_b_.list
return t}
var factory=function(){var klass=this 
if(arguments.length==0){return $B.$list([])}
var $=$B.args(klass.__name__,1,{obj:null},["obj"],arguments,{},null,null),obj=$.obj
if(Array.isArray(obj)){
obj=obj.slice()
obj.__brython__=true;
if(obj.__class__==tuple){var res=obj.slice()
res.__class__=list
res.__brython__=true
return res}
return obj}
var res=Array.from($B.make_js_iterator(obj))
res.__brython__=true 
return res}
list.$factory=function(){return factory.apply(list,arguments)}
list.$unpack=function(obj){
try{return _b_.list.$factory(obj)}catch(err){try{var it=$B.$iter(obj),next_func=$B.$call($B.$getattr(it,"__next__"))}catch(err1){if($B.is_exc(err1,[_b_.TypeError])){throw _b_.TypeError.$factory(
`Value after * must be an iterable, not ${$B.class_name(obj)}`)}
throw err1}
throw err}}
$B.set_func_names(list,"builtins")
var JSArray=$B.JSArray=$B.make_class("JSArray",function(array){return{
__class__:JSArray,js:array}}
)
JSArray.__repr__=JSArray.__str__=function(){return "<JSArray object>"}
function make_args(args){var res=[args[0].js]
for(var i=1,len=args.length;i < len;i++){res.push(args[i])}
return res}
for(var attr in list){if($B.JSArray[attr]!==undefined){continue}
if(typeof list[attr]=="function"){$B.JSArray[attr]=(function(fname){return function(){return $B.$JS2Py(list[fname].apply(null,make_args(arguments)))}})(attr)}}
$B.set_func_names($B.JSArray,"builtins")
function $tuple(arg){return arg}
var tuple={__class__:_b_.type,__mro__:[object],__qualname__:'tuple',$is_class:true,$native:true,$match_sequence_pattern:true,}
var tuple_iterator=$B.make_iterator_class("tuple_iterator")
tuple.__iter__=function(self){return tuple_iterator.$factory(self)}
tuple.$factory=function(){var obj=factory.apply(tuple,arguments)
obj.__class__=tuple
return obj}
$B.fast_tuple=function(array){array.__class__=tuple
array.__brython__=true
array.__dict__=$B.empty_dict()
return array}
for(var attr in list){switch(attr){case "__delitem__":
case "__iadd__":
case "__imul__":
case "__setitem__":
case "append":
case "extend":
case "insert":
case "pop":
case "remove":
case "reverse":
case "sort":
break
default:
if(tuple[attr]===undefined){if(typeof list[attr]=="function"){tuple[attr]=(function(x){return function(){return list[x].apply(null,arguments)}})(attr)}}}}
tuple.__class_getitem__=function(cls,item){
if(! Array.isArray(item)){item=[item]}
return $B.GenericAlias.$factory(cls,item)}
tuple.__eq__=function(self,other){
if(other===undefined){return self===tuple}
return list.__eq__(self,other)}
function c_mul(a,b){s=((parseInt(a)*b)& 0xFFFFFFFF).toString(16)
return parseInt(s.substr(0,s.length-1),16)}
tuple.$getnewargs=function(self){return $B.fast_tuple([self])}
tuple.__getnewargs__=function(){return tuple.$getnewargs($B.single_arg('__getnewargs__','self',arguments))}
tuple.__hash__=function(self){
var x=0x3456789
for(var i=0,len=self.length;i < len;i++){var y=_b_.hash(self[i])
x=c_mul(1000003,x)^ y & 0xFFFFFFFF}
return x}
tuple.__init__=function(){
return _b_.None}
tuple.__new__=function(cls,...args){if(cls===undefined){throw _b_.TypeError.$factory("list.__new__(): not enough arguments")}
var self=[]
self.__class__=cls
self.__brython__=true
self.__dict__=$B.empty_dict()
if(args.length==0){return self}
var arg=$B.$iter(args[0]),next_func=$B.$call($B.$getattr(arg,"__next__"))
while(1){try{var item=next_func()
self.push(item)}
catch(err){if(err.__class__===_b_.StopIteration){break}
else{throw err}}}
return self}
tuple.__reduce_ex__=function(self){return $B.fast_tuple([__newobj__,$B.fast_tuple([self.__class__].concat(self.slice())),_b_.None,_b_.None])}
tuple.__repr__=function(self){$B.builtins_repr_check(tuple,arguments)
return list_repr(self)}
$B.set_func_names(tuple,"builtins")
_b_.list=list
_b_.tuple=tuple
_b_.object.__bases__=tuple.$factory()
_b_.type.__bases__=$B.fast_tuple([_b_.object])})(__BRYTHON__)
;
;(function($B){
var _b_=$B.builtins
var $GeneratorReturn={}
$B.generator_return=function(value){return{__class__:$GeneratorReturn,value:value}}
$B.generator=$B.make_class("generator",function(func,name){
var res=function(){var gen=func.apply(null,arguments)
gen.$name=name ||'generator'
gen.$func=func
gen.$has_run=false
return{
__class__:$B.generator,js_gen:gen}}
res.$infos=func.$infos
res.$is_genfunc=true
res.$name=name
return res}
)
$B.generator.__iter__=function(self){return self}
$B.generator.__next__=function(self){return $B.generator.send(self,_b_.None)}
$B.generator.__str__=function(self){var name=self.js_gen.$name ||'generator'
if(self.js_gen.$func && self.js_gen.$func.$infos){name=self.js_gen.$func.$infos.__qualname__}
return `<generator object ${name}>`}
$B.generator.close=function(self){var save_frame_obj=$B.frame_obj
if(self.$frame){$B.frame_obj=$B.push_frame(self.$frame)}
try{$B.generator.throw(self,_b_.GeneratorExit.$factory())}catch(err){if(! $B.is_exc(err,[_b_.GeneratorExit,_b_.StopIteration])){$B.frame_obj=save_frame_obj
throw _b_.RuntimeError.$factory("generator ignored GeneratorExit")}}
$B.frame_obj=save_frame_obj}
$B.generator.send=function(self,value){
var gen=self.js_gen
gen.$has_run=true
if(gen.$finished){throw _b_.StopIteration.$factory(value)}
if(gen.gi_running===true){throw _b_.ValueError.$factory("generator already executing")}
gen.gi_running=true
var save_frame_obj=$B.frame_obj
if(self.$frame){$B.frame_obj=$B.push_frame(self.$frame)}
try{var res=gen.next(value)}catch(err){gen.$finished=true
$B.frame_obj=save_frame_obj
throw err}
if($B.frame_obj !==null && $B.frame_obj.frame===self.$frame){$B.leave_frame()}
$B.frame_obj=save_frame_obj
if(res.value && res.value.__class__===$GeneratorReturn){gen.$finished=true
throw _b_.StopIteration.$factory(res.value.value)}
gen.gi_running=false
if(res.done){throw _b_.StopIteration.$factory(res.value)}
return res.value}
$B.generator.throw=function(self,type,value,traceback){var $=$B.args('throw',4,{self:null,type:null,value:null,traceback:null},['self','type','value','traceback'],arguments,{value:_b_.None,traceback:_b_.None},null,null),self=$.self,type=$.type,value=$.value,traceback=$.traceback
var gen=self.js_gen,exc=type
if(exc.$is_class){if(! _b_.issubclass(type,_b_.BaseException)){throw _b_.TypeError.$factory("exception value must be an "+
"instance of BaseException")}else if(value===undefined ||value===_b_.None){exc=$B.$call(exc)()}else if($B.$isinstance(value,type)){exc=value}}else{if(value===_b_.None){value=exc}else{exc=$B.$call(exc)(value)}}
if(traceback !==_b_.None){exc.$traceback=traceback}
var save_frame_obj=$B.frame_obj
if(self.$frame){$B.frame_obj=$B.push_frame(self.$frame)}
var res=gen.throw(exc)
$B.frame_obj=save_frame_obj
if(res.done){throw _b_.StopIteration.$factory(res.value)}
return res.value}
$B.set_func_names($B.generator,"builtins")
$B.async_generator=$B.make_class("async_generator",function(func){var f=function(){var gen=func.apply(null,arguments)
var res=Object.create(null)
res.__class__=$B.async_generator
res.js_gen=gen
return res}
return f}
)
var ag_closed={}
$B.async_generator.__aiter__=function(self){return self}
$B.async_generator.__anext__=function(self){return $B.async_generator.asend(self,_b_.None)}
$B.async_generator.aclose=function(self){self.js_gen.$finished=true
return _b_.None}
$B.async_generator.asend=async function(self,value){var gen=self.js_gen
if(gen.$finished){throw _b_.StopAsyncIteration.$factory(value)}
if(gen.ag_running===true){throw _b_.ValueError.$factory("generator already executing")}
gen.ag_running=true
var save_frame_obj=$B.frame_obj
if(self.$frame){$B.frame_obj=$B.push_frame(self.$frame)}
try{var res=await gen.next(value)}catch(err){gen.$finished=true
$B.frame_obj=save_frame_obj
throw err}
if($B.frame_obj !==null && $B.frame_obj.frame===self.$frame){$B.leave_frame()}
$B.frame_obj=save_frame_obj
if(res.done){throw _b_.StopAsyncIteration.$factory(value)}
if(res.value.__class__===$GeneratorReturn){gen.$finished=true
throw _b_.StopAsyncIteration.$factory(res.value.value)}
gen.ag_running=false
return res.value}
$B.async_generator.athrow=async function(self,type,value,traceback){var gen=self.js_gen,exc=type
if(exc.$is_class){if(! _b_.issubclass(type,_b_.BaseException)){throw _b_.TypeError.$factory("exception value must be an "+
"instance of BaseException")}else if(value===undefined){value=$B.$call(exc)()}}else{if(value===undefined){value=exc}else{exc=$B.$call(exc)(value)}}
if(traceback !==undefined){exc.$traceback=traceback}
var save_frame_obj=$B.frame_obj
if(self.$frame){$B.frame_obj=$B.push_frame(self.$frame)}
await gen.throw(value)
$B.frame_obj=save_frame_obj}
$B.set_func_names($B.async_generator,"builtins")})(__BRYTHON__)
;
;(function($B){var _b_=$B.builtins
var object=_b_.object
var _window=self;
function to_simple(value){switch(typeof value){case 'string':
case 'number':
return value
case 'boolean':
return value ? "true" :"false"
case 'object':
if(value===_b_.None){return 'null'}else if(value instanceof Number){return value.valueOf()}else if(value instanceof String){return value.valueOf()}
default:
throw _b_.TypeError.$factory("keys must be str, int, "+
"float, bool or None, not "+$B.class_name(value))}}
$B.pyobj2structuredclone=function(obj,strict){
strict=strict===undefined ? true :strict
if(typeof obj=="boolean" ||typeof obj=="number" ||
typeof obj=="string" ||obj instanceof String){return obj}else if(obj.__class__===_b_.float){return obj.value}else if(obj===_b_.None){return null }else if(Array.isArray(obj)||obj.__class__===_b_.list ||
obj.__class__===_b_.tuple){var res=new Array(obj.length);
for(var i=0,len=obj.length;i < len;++i){res[i]=$B.pyobj2structuredclone(obj[i]);}
return res}else if($B.$isinstance(obj,_b_.dict)){if(strict){for(var key of $B.make_js_iterator(_b_.dict.keys(obj))){if(typeof key !=='string'){throw _b_.TypeError.$factory("a dictionary with non-string "+
"keys does not support structured clone")}}}
var res={}
for(var entry of $B.make_js_iterator(_b_.dict.items(obj))){res[to_simple(entry[0])]=$B.pyobj2structuredclone(entry[1])}
return res}else{return obj}}
$B.structuredclone2pyobj=function(obj){if(obj===null){return _b_.None}else if(obj===undefined){return $B.Undefined}else if(typeof obj=="boolean" ||
typeof obj=="string"){return obj}else if(typeof obj=="number"){return Number.isInteger(obj)?
obj :
{__class__:_b_.float,value:obj}}else if(obj instanceof Number ||obj instanceof String){return obj.valueOf()}else if(Array.isArray(obj)||obj.__class__===_b_.list ||
obj.__class__===_b_.tuple){var res=_b_.list.$factory()
for(var i=0,len=obj.length;i < len;i++){res.push($B.structuredclone2pyobj(obj[i]))}
return res}else if(typeof obj=="object"){var res=$B.empty_dict()
for(var key in obj){_b_.dict.$setitem(res,key,$B.structuredclone2pyobj(obj[key]))}
return res}else{throw _b_.TypeError.$factory(_b_.str.$factory(obj)+
" does not support the structured clone algorithm")}}
var JSConstructor=$B.make_class('JSConstructor')
JSConstructor.__module__="<javascript>"
JSConstructor.__call__=function(_self){
return function(){var args=new Array(arguments.length+1)
args[0]=null
for(var i=0,len=arguments.length;i < len;i++){args[i+1]=pyobj2jsobj(arguments[i])}
var factory=_self.func.bind.apply(_self.func,args)
var res=new factory()
return $B.$JS2Py(res)}}
JSConstructor.__getattribute__=function(_self,attr){
if(attr=="__call__"){return function(){var args=new Array(arguments.length+1)
args[0]=null
for(var i=0,len=arguments.length;i < len;i++){args[i+1]=pyobj2jsobj(arguments[i])}
var factory=_self.func.bind.apply(_self.func,args)
var res=new factory()
return $B.$JS2Py(res)}}
return JSObject.__getattribute__(_self,attr)}
JSConstructor.$factory=function(obj){return{
__class__:JSConstructor,js:obj,func:obj.js_func}}
const JSOBJ=Symbol()
const PYOBJ=Symbol()
const PYOBJFCT=Symbol()
const PYOBJFCTS=Symbol()
var jsobj2pyobj=$B.jsobj2pyobj=function(jsobj,_this){
switch(jsobj){case true:
case false:
return jsobj}
if(jsobj===undefined){return $B.Undefined}
if(jsobj===null){return null}
if(Array.isArray(jsobj)){
Object.defineProperty(jsobj,"$is_js_array",{value:true});
return jsobj }
if(typeof jsobj==='number'){if(jsobj % 1===0){
return _b_.int.$factory(jsobj)}
return _b_.float.$factory(jsobj)}
if(typeof jsobj=="string"){return $B.String(jsobj)}
let pyobj=jsobj[PYOBJ]
if(pyobj !==undefined){return pyobj;}
if(typeof jsobj==="function"){
_this=_this===undefined ? null :_this
if(_this===null){const pyobj=jsobj[PYOBJFCT];
if(pyobj !==undefined){return pyobj}}else{const pyobjfcts=_this[PYOBJFCTS]
if(pyobjfcts !==undefined){const pyobj=pyobjfcts.get(jsobj)
if(pyobj !==undefined){return pyobj}}else{_this[PYOBJFCTS]=new Map()}}
var res=function(){var args=new Array(arguments.length)
for(var i=0,len=arguments.length;i < len;++i){args[i]=pyobj2jsobj(arguments[i])}
try{return jsobj2pyobj(jsobj.apply(_this,args))}catch(err){throw $B.exception(err)}}
if(_this===null){jsobj[PYOBJFCT]=res;}else{_this[PYOBJFCTS].set(jsobj,res)}
res[JSOBJ]=jsobj
res.$js_func=jsobj
res.$is_js_func=true
res.$infos={__name__:jsobj.name,__qualname__:jsobj.name}
return res}
if(jsobj.$kw){return jsobj}
if($B.$isNode(jsobj)){const res=$B.DOMNode.$factory(jsobj)
jsobj[PYOBJ]=res
res[JSOBJ]=jsobj
return res}
const _res=$B.JSObj.$factory(jsobj)
jsobj[PYOBJ]=_res
_res[JSOBJ]=jsobj
return _res;}
var pyobj2jsobj=$B.pyobj2jsobj=function(pyobj){
if(pyobj===true ||pyobj===false){return pyobj}
if(pyobj===$B.Undefined){return undefined}
if(pyobj===null){return null}
let _jsobj=pyobj[JSOBJ]
if(_jsobj !==undefined){return _jsobj}
var klass=$B.get_class(pyobj)
if(klass===undefined){
return pyobj}
if(klass===JSConstructor){
if(pyobj.js_func !==undefined){return pyobj.js_func}
return pyobj.js}
if(klass===$B.DOMNode ||
klass.__mro__.indexOf($B.DOMNode)>-1){
return pyobj}
if([_b_.list,_b_.tuple].indexOf(klass)>-1){
return pyobj.map(pyobj2jsobj)}
if(klass===_b_.dict ||_b_.issubclass(klass,_b_.dict)){
var jsobj={}
for(var entry of _b_.dict.$iter_items_with_hash(pyobj)){var key=entry.key
if(typeof key !=="string"){key=_b_.str.$factory(key)}
if(typeof entry.value==='function'){
entry.value.bind(jsobj)}
jsobj[key]=pyobj2jsobj(entry.value)}
return jsobj}
if(klass===_b_.str){
return pyobj.valueOf()}
if(klass===_b_.float){
return pyobj.value}
if(klass===$B.function ||klass===$B.method){if(pyobj.prototype &&
pyobj.prototype.constructor===pyobj &&
! pyobj.$is_func){
return pyobj}
if(pyobj.$is_async){
const jsobj=function(){var res=pyobj.apply(null,arguments)
return $B.coroutine.send(res)}
pyobj[JSOBJ]=jsobj
jsobj[PYOBJ]=pyobj
return jsobj}
var jsobj=function(){try{
var args=new Array(arguments.length)
for(var i=0;i < arguments.length;++i){args[i]=jsobj2pyobj(arguments[i])}
if(pyobj.prototype.constructor===pyobj && ! pyobj.$is_func){var res=new pyobj(...args)}else{var res=pyobj.apply(this,args)}
return pyobj2jsobj(res)}catch(err){$B.handle_error(err)}}
pyobj[JSOBJ]=jsobj
jsobj[PYOBJ]=pyobj
return jsobj}
return pyobj}
$B.JSConstructor=JSConstructor
function pyargs2jsargs(pyargs){var args=new Array(pyargs.length);
for(var i=0,len=pyargs.length;i < len;i++){var arg=pyargs[i]
if(arg !==undefined && arg !==null &&
arg.$kw !==undefined){
throw _b_.TypeError.$factory(
"A Javascript function can't take "+
"keyword arguments")}
args[i]=$B.pyobj2jsobj(arg)}
return args}
$B.JSObj=$B.make_class("JSObject",function(jsobj){if(Array.isArray(jsobj)){
jsobj.$is_js_array=true}else if(typeof jsobj=="function"){return jsobj2pyobj(jsobj)}else if(typeof jsobj=="number" && ! Number.isInteger(jsobj)){return{__class__:_b_.float,value:jsobj}}
return jsobj}
)
function check_big_int(x,y){if(typeof x !="bigint" ||typeof y !="bigint"){throw _b_.TypeError.$factory("unsupported operand type(s) for - : '"+
$B.class_name(x)+"' and '"+$B.class_name(y)+"'")}}
var js_ops={__add__:function(_self,other){check_big_int(_self,other)
return _self+other},__mod__:function(_self,other){check_big_int(_self,other)
return _self % other},__mul__:function(_self,other){check_big_int(_self,other)
return _self*other},__pow__:function(_self,other){check_big_int(_self,other)
return _self**other},__sub__:function(_self,other){check_big_int(_self,other)
return _self-other}}
for(var js_op in js_ops){$B.JSObj[js_op]=js_ops[js_op]}
$B.JSObj.__bool__=function(_self){if(typeof _self=='object'){for(var key in _self){return true}
return false}
return !! _self}
$B.JSObj.__contains__=function(_self,key){return key in _self}
$B.JSObj.__dir__=function(_self){var attrs=Object.keys(_self);
attrs=attrs.sort()
return attrs}
$B.JSObj.__eq__=function(_self,other){switch(typeof _self){case "object":
if(_self.__eq__ !==undefined){return _self.__eq__(other)}
if(Object.keys(_self).length !==Object.keys(other).length){return false}
if(_self===other){return true}
for(var key in _self){if(! $B.JSObj.__eq__(_self[key],other[key])){return false}}
case 'function':
if(_self.$is_js_func && other.$is_js_func){return _self.$js_func===other.$js_func}
return _self===other
default:
return _self===other}}
var iterator=$B.make_class('js_iterator',function(obj){return{
__class__:iterator,keys:Object.keys(obj),values:Object.values(obj),length:Object.keys(obj).length,counter:-1}}
)
iterator.__next__=function(_self){_self.counter++
if(_self.counter==_self.length){throw _b_.StopIteration.$factory('')}
return _self.keys[_self.counter]}
$B.set_func_names(iterator,'builtins')
$B.JSObj.__iter__=function(_self){return iterator.$factory(_self)}
$B.JSObj.__ne__=function(_self,other){return ! $B.JSObj.__eq__(_self,other)}
function jsclass2pyclass(js_class){
var proto=js_class.prototype,klass=$B.make_class(js_class.name)
klass.__init__=function(self){var args=pyargs2jsargs(Array.from(arguments).slice(1))
var js_obj=new proto.constructor(...args)
for(var attr in js_obj){_b_.dict.$setitem(self.__dict__,attr,$B.jsobj2pyobj(js_obj[attr]))}
return _b_.None}
klass.new=function(){var args=pyargs2jsargs(arguments)
return $B.JSObj.$factory(new proto.constructor(...args))}
var key,value
for([key,value]of Object.entries(Object.getOwnPropertyDescriptors(proto))){if(key=='constructor'){continue}
if(value.get){var getter=(function(v){return function(self){return v.get.call(self.__dict__.$jsobj)}})(value),setter=(function(v){return function(self,x){v.set.call(self.__dict__.$jsobj,x)}})(value)
klass[key]=_b_.property.$factory(getter,setter)}else{klass[key]=(function(m){return function(self){var args=Array.from(arguments).slice(1)
return proto[m].apply(self.__dict__.$jsobj,args)}})(key)}}
var js_parent=Object.getPrototypeOf(proto).constructor
if(js_parent.toString().startsWith('class ')){var py_parent=jsclass2pyclass(js_parent)
klass.__mro__=[py_parent].concat(klass.__mro__)}
var frame=$B.frame_obj.frame
if(frame){$B.set_func_names(klass,frame[2])}
return klass}
$B.JSObj.__getattribute__=function(_self,attr){var test=false 
if(test){console.log("__ga__",_self,attr)}
if(attr=="new" && typeof _self=="function"){
var new_func
if(_self.$js_func){new_func=function(){var args=pyargs2jsargs(arguments)
return $B.JSObj.$factory(new _self.$js_func(...args))}}else{new_func=function(){var args=pyargs2jsargs(arguments)
return $B.JSObj.$factory(new _self(...args))}}
new_func.$infos={__name__:attr,__qualname__:attr}
return new_func}
var js_attr=_self[attr]
if(js_attr==undefined && typeof _self=="function" && _self.$js_func){js_attr=_self.$js_func[attr]}
if(test){console.log('js_attr',js_attr,typeof js_attr,'\n is JS class ?',js_attr===undefined ? false :
js_attr.toString().startsWith('class '))}
if(js_attr===undefined){if(typeof _self=='object' && attr in _self){
return $B.Undefined}
if(typeof _self.getNamedItem=='function'){var res=_self.getNamedItem(attr)
if(res !==undefined){return $B.JSObj.$factory(res)}}
var klass=$B.get_class(_self),class_attr=$B.$getattr(klass,attr,null)
if(class_attr !==null){if(typeof class_attr=="function"){return function(){var args=new Array(arguments.length+1);
args[0]=_self;
for(var i=0,len=arguments.length;i < len;i++){args[i+1]=arguments[i];}
return $B.JSObj.$factory(class_attr.apply(null,args))}}else{return class_attr}}
throw $B.attr_error(attr,_self)}
if(js_attr !==null &&
js_attr.toString &&
typeof js_attr.toString=='function' &&
js_attr.toString().startsWith('class ')){
return jsclass2pyclass(js_attr)}else if(typeof js_attr==='function'){
return jsobj2pyobj(js_attr,_self.$js_func ||_self)}else{if(test){console.log('use JSObj.$factory on',js_attr)}
return $B.JSObj.$factory(js_attr)}}
$B.JSObj.__setattr__=function(_self,attr,value){_self[attr]=$B.pyobj2jsobj(value)
return _b_.None}
$B.JSObj.__getitem__=function(_self,key){if(typeof key=="string"){try{return $B.JSObj.__getattribute__(_self,key)}catch(err){if($B.is_exc(err,[_b_.AttributeError])){throw _b_.KeyError.$factory(err.name)}
throw err}}else if(typeof key=="number"){if(_self[key]!==undefined){return $B.JSObj.$factory(_self[key])}
if(typeof _self.length=='number'){if((typeof key=="number" ||typeof key=="boolean")&&
typeof _self.item=='function'){var rank=_b_.int.$factory(key)
if(rank < 0){rank+=_self.length}
var res=_self.item(rank)
if(res===null){throw _b_.IndexError.$factory(rank)}
return $B.JSObj.$factory(res)}}}else if(key.__class__===_b_.slice &&
typeof _self.item=='function'){var _slice=_b_.slice.$conv_for_seq(key,_self.length)
var res=new Array(Math.floor((_slice.stop-_slice.start)/_slice.step));
let offset=0;
for(var i=_slice.start;i < _slice.stop;i+=_slice.step){res[offset++]=_self.item(i);}
return res}
throw _b_.KeyError.$factory(key)}
$B.JSObj.__setitem__=$B.JSObj.__setattr__
$B.JSObj.__repr__=$B.JSObj.__str__=function(_self){if(typeof _self=='number'){return _self+''}
var js_repr=Object.prototype.toString.call(_self)
return `<Javascript object: ${js_repr}>`}
$B.JSObj.bind=function(_self,evt,func){
var js_func=function(ev){try{return func(jsobj2pyobj(ev))}catch(err){if(err.__class__ !==undefined){$B.handle_error(err)}else{try{$B.$getattr($B.get_stderr(),"write")(err)}catch(err1){console.log(err)}}}}
_self.$brython_events=_self.$brython_events ||{}
if(_self.$brython_events){_self.$brython_events[evt]=_self.$brython_events[evt]||[]
_self.$brython_events[evt].push([func,js_func])}
_self.addEventListener(evt,js_func)
return _b_.None}
$B.JSObj.bindings=function(_self){var res=$B.empty_dict()
if(_self.$brython_events){for(var key in _self.$brython_events){_b_.dict.$setitem(res,key,$B.fast_tuple(_self.$brython_events[key].map(x=> x[0])))}}
return res}
$B.JSObj.unbind=function(_self,evt,func){if(! _self.$brython_events){return _b_.None}
if(! _self.$brython_events[evt]){return _b_.None}
var events=_self.$brython_events[evt]
if(func===undefined){
for(var item of events){_self.removeEventListener(evt,item[1])}
delete _self.$brython_events[evt]}else{for(var i=0,len=events.length;i < len;i++){if(events[i][0]===func){events.splice(i,1)}}
if(events.length==0){delete _self.$brython_events[evt]}}}
$B.JSObj.to_dict=function(_self){
return $B.structuredclone2pyobj(_self)}
$B.set_func_names($B.JSObj,"builtins")
var js_list_meta=$B.make_class('js_list_meta')
js_list_meta.__mro__=[_b_.type,_b_.object]
js_list_meta.__getattribute__=function(_self,attr){if(_b_.list[attr]===undefined){throw _b_.AttributeError.$factory(attr)}
if(js_array[attr]){return js_array[attr]}
if(['__delitem__','__setitem__'].indexOf(attr)>-1){
return function(){var args=new Array(arguments.length)
args[0]=arguments[0]
for(var i=1,len=arguments.length;i < len;i++){args[i]=pyobj2jsobj(arguments[i])}
return _b_.list[attr].apply(null,args)}}else if(['__add__','__contains__','__eq__','__getitem__','__mul__','__ge__','__gt__','__le__','__lt__'].indexOf(attr)>-1){
return function(){var pylist=$B.$list(arguments[0].map(jsobj2pyobj))
return jsobj2pyobj(_b_.list[attr].call(null,pylist,...Array.from(arguments).slice(1)))}}
return function(){var js_array=arguments[0],t=jsobj2pyobj(js_array),args=[t]
return _b_.list[attr].apply(null,args)}}
$B.set_func_names(js_list_meta,'builtins')
var js_array=$B.js_array=$B.make_class('Array')
js_array.__class__=js_list_meta
js_array.__mro__=[$B.JSObj,_b_.object]
js_array.__getattribute__=function(_self,attr){if(_b_.list[attr]===undefined){
var proto=Object.getPrototypeOf(_self),res=proto[attr]
if(res !==undefined){
return jsobj2pyobj(res,_self)}
if(_self.hasOwnProperty(attr)){
return $B.JSObj.$factory(_self[attr])}
throw $B.attr_error(attr,_self)}
return function(){var args=pyobj2jsobj(Array.from(arguments))
return _b_.list[attr].call(null,_self,...args)}}
js_array.__getitem__=function(_self,i){i=$B.PyNumber_Index(i)
return $B.jsobj2pyobj(_self[i])}
js_array.__repr__=function(_self){if($B.repr.enter(_self)){
return '[...]'}
var _r=new Array(_self.length),res
for(var i=0;i < _self.length;++i){_r[i]=_b_.str.$factory(_self[i])}
res="["+_r.join(", ")+"]"
$B.repr.leave(_self)
return res}
$B.set_func_names(js_array,'javascript')
$B.SizedJSObj=$B.make_class('SizedJavascriptObject')
$B.SizedJSObj.__bases__=[$B.JSObj]
$B.SizedJSObj.__mro__=[$B.JSObj,_b_.object]
$B.SizedJSObj.__len__=function(_self){return _self.length}
$B.set_func_names($B.SizedJSObj,'builtins')
$B.IterableJSObj=$B.make_class('IterableJavascriptObject')
$B.IterableJSObj.__bases__=[$B.JSObj]
$B.IterableJSObj.__mro__=[$B.JSObj,_b_.object]
$B.IterableJSObj.__iter__=function(_self){return{
__class__:$B.IterableJSObj,it:obj[Symbol.iterator]()}}
$B.IterableJSObj.__len__=function(_self){return _self.length}
$B.IterableJSObj.__next__=function(_self){var value=_self.it.next()
if(! value.done){return jsobj2pyobj(value.value)}
throw _b_.StopIteration.$factory('')}
$B.set_func_names($B.IterableJSObj,'builtins')
$B.get_jsobj_class=function(obj){var proto=Object.getPrototypeOf(obj)
if(proto===null){return $B.JSObj}
if(proto[Symbol.iterator]!==undefined){return $B.IterableJSObj}else if(Object.getOwnPropertyNames(proto).indexOf('length')>-1){return $B.SizedJSObj}
return $B.JSObj}
$B.JSMeta=$B.make_class("JSMeta")
$B.JSMeta.__call__=function(cls){
var extra_args=new Array(arguments.length-1),klass=arguments[0]
for(var i=1,len=arguments.length;i < len;i++){extra_args[i-1]=arguments[i]}
var new_func=_b_.type.__getattribute__(klass,"__new__")
var instance=new_func.apply(null,arguments)
if(instance instanceof cls.__mro__[0].$js_func){
var init_func=_b_.type.__getattribute__(klass,"__init__")
if(init_func !==_b_.object.__init__){
var args=[instance].concat(extra_args)
init_func.apply(null,args)}}
return instance}
$B.JSMeta.__mro__=[_b_.type,_b_.object]
$B.JSMeta.__getattribute__=function(cls,attr){if(cls[attr]!==undefined){return cls[attr]}else if($B.JSMeta[attr]!==undefined){return $B.JSMeta[attr]}else{
return _b_.type.__getattribute__(cls,attr)}}
$B.JSMeta.__init_subclass__=function(){}
$B.JSMeta.__new__=function(metaclass,class_name,bases,cl_dict){
var body=`
    var _b_ = __BRYTHON__.builtins
    return function(){
        if(_b_.dict.$contains_string(cl_dict, '__init__')){
            var args = [this]
            for(var i = 0, len = arguments.length; i < len; i++){
                args.push(arguments[i])
            }
            _b_.dict.$getitem_string(cl_dict, '__init__').apply(this, args)
        }else{
            return new bases[0].$js_func(...arguments)
        }
    }`
var new_js_class=Function('cl_dict','bases',body)(cl_dict,bases)
new_js_class.prototype=Object.create(bases[0].$js_func.prototype)
new_js_class.prototype.constructor=new_js_class
new_js_class.$js_func=bases[0].$js_func
new_js_class.__class__=$B.JSMeta
new_js_class.__bases__=[bases[0]]
new_js_class.__mro__=[bases[0],_b_.type]
new_js_class.__qualname__=new_js_class.__name__=class_name
new_js_class.$is_js_class=true
return new_js_class}
$B.set_func_names($B.JSMeta,"builtins")})(__BRYTHON__)
;
;(function($B){var _b_=$B.builtins,object=_b_.object,_window=self
var py_immutable_to_js=$B.py_immutable_to_js=function(pyobj){if($B.$isinstance(pyobj,_b_.float)){return pyobj.value}else if($B.$isinstance(pyobj,$B.long_int)){return $B.long_int.$to_js_number(pyobj)}
return pyobj}
function js_immutable_to_py(jsobj){if(typeof jsobj=="number"){if(Number.isSafeInteger(jsobj)){return jsobj}else if(Number.isInteger(jsobj)){return $B.fast_long_int(BigInt(jsobj+''))}else{return $B.fast_float(jsobj)}}
return jsobj}
function $getMouseOffset(target,ev){ev=ev ||_window.event;
var docPos=$getPosition(target);
var mousePos=$mouseCoords(ev);
return{x:mousePos.x-docPos.x,y:mousePos.y-docPos.y};}
function $getPosition(e){var left=0,top=0,width=e.width ||e.offsetWidth,height=e.height ||e.offsetHeight,scroll=document.scrollingElement.scrollTop
while(e.offsetParent){left+=e.offsetLeft
top+=e.offsetTop
e=e.offsetParent}
left+=e.offsetLeft ||0
top+=e.offsetTop ||0
if(e.parentElement){
var parent_pos=$getPosition(e.parentElement)
left+=parent_pos.left
top+=parent_pos.top}
return{left:left,top:top,width:width,height:height}}
function trace(msg){var elt=document.getElementById("trace")
if(elt){elt.innerText+=msg}}
function $mouseCoords(ev){if(ev.type.startsWith("touch")){var res={}
res.x=_b_.int.$factory(ev.touches[0].screenX)
res.y=_b_.int.$factory(ev.touches[0].screenY)
res.__getattr__=function(attr){return this[attr]}
res.__class__="MouseCoords"
return res}
var posx=0,posy=0
if(!ev){var ev=_window.event}
if(ev.pageX ||ev.pageY){posx=ev.pageX
posy=ev.pageY}else if(ev.clientX ||ev.clientY){posx=ev.clientX+document.body.scrollLeft+
document.documentElement.scrollLeft
posy=ev.clientY+document.body.scrollTop+
document.documentElement.scrollTop}
var res={}
res.x=_b_.int.$factory(posx)
res.y=_b_.int.$factory(posy)
res.__getattr__=function(attr){return this[attr]}
res.__class__="MouseCoords"
return res}
var $DOMNodeAttrs=["nodeName","nodeValue","nodeType","parentNode","childNodes","firstChild","lastChild","previousSibling","nextSibling","attributes","ownerDocument"]
$B.$isNode=function(o){
return(
typeof Node==="object" ? o instanceof Node :
o && typeof o==="object" && typeof o.nodeType==="number" &&
typeof o.nodeName==="string"
)}
$B.$isNodeList=function(nodes){
try{var result=Object.prototype.toString.call(nodes)
var re=new RegExp("^\\[object (HTMLCollection|NodeList)\\]$")
return(typeof nodes==="object" &&
re.exec(result)!==null &&
nodes.length !==undefined &&
(nodes.length==0 ||
(typeof nodes[0]==="object" && nodes[0].nodeType > 0))
)}catch(err){return false}}
var $DOMEventAttrs_W3C=["NONE","CAPTURING_PHASE","AT_TARGET","BUBBLING_PHASE","type","target","currentTarget","eventPhase","bubbles","cancelable","timeStamp","stopPropagation","preventDefault","initEvent"]
var $DOMEventAttrs_IE=["altKey","altLeft","button","cancelBubble","clientX","clientY","contentOverflow","ctrlKey","ctrlLeft","data","dataFld","dataTransfer","fromElement","keyCode","nextPage","offsetX","offsetY","origin","propertyName","reason","recordset","repeat","screenX","screenY","shiftKey","shiftLeft","source","srcElement","srcFilter","srcUrn","toElement","type","url","wheelDelta","x","y"]
$B.$isEvent=function(obj){var flag=true
for(var i=0;i < $DOMEventAttrs_W3C.length;i++){if(obj[$DOMEventAttrs_W3C[i]]===undefined){flag=false;break}}
if(flag){return true}
for(var i=0;i < $DOMEventAttrs_IE.length;i++){if(obj[$DOMEventAttrs_IE[i]]===undefined){return false}}
return true}
var $NodeTypes={1:"ELEMENT",2:"ATTRIBUTE",3:"TEXT",4:"CDATA_SECTION",5:"ENTITY_REFERENCE",6:"ENTITY",7:"PROCESSING_INSTRUCTION",8:"COMMENT",9:"DOCUMENT",10:"DOCUMENT_TYPE",11:"DOCUMENT_FRAGMENT",12:"NOTATION"}
var Attributes=$B.make_class("Attributes",function(elt){return{__class__:Attributes,elt:elt}}
)
Attributes.__contains__=function(){var $=$B.args("__getitem__",2,{self:null,key:null},["self","key"],arguments,{},null,null)
if($.self.elt instanceof SVGElement){return $.self.elt.hasAttributeNS(null,$.key)}else if(typeof $.self.elt.hasAttribute=="function"){return $.self.elt.hasAttribute($.key)}
return false}
Attributes.__delitem__=function(){var $=$B.args("__getitem__",2,{self:null,key:null},["self","key"],arguments,{},null,null)
if(!Attributes.__contains__($.self,$.key)){throw _b_.KeyError.$factory($.key)}
if($.self.elt instanceof SVGElement){$.self.elt.removeAttributeNS(null,$.key)
return _b_.None}else if(typeof $.self.elt.hasAttribute=="function"){$.self.elt.removeAttribute($.key)
return _b_.None}}
Attributes.__getitem__=function(){var $=$B.args("__getitem__",2,{self:null,key:null},["self","key"],arguments,{},null,null)
if($.self.elt instanceof SVGElement &&
$.self.elt.hasAttributeNS(null,$.key)){return $.self.elt.getAttributeNS(null,$.key)}else if(typeof $.self.elt.hasAttribute=="function" &&
$.self.elt.hasAttribute($.key)){return $.self.elt.getAttribute($.key)}
throw _b_.KeyError.$factory($.key)}
Attributes.__iter__=function(self){self.$counter=0
var attrs=self.elt.attributes,items=[]
for(var i=0;i < attrs.length;i++){items.push(attrs[i].name)}
self.$items=items
return self}
Attributes.__next__=function(){var $=$B.args("__next__",1,{self:null},["self"],arguments,{},null,null)
if($.self.$counter < $.self.$items.length){var res=$.self.$items[$.self.$counter]
$.self.$counter++
return res}else{throw _b_.StopIteration.$factory("")}}
Attributes.__setitem__=function(){var $=$B.args("__setitem__",3,{self:null,key:null,value:null},["self","key","value"],arguments,{},null,null)
if($.self.elt instanceof SVGElement &&
typeof $.self.elt.setAttributeNS=="function"){$.self.elt.setAttributeNS(null,$.key,_b_.str.$factory($.value))
return _b_.None}else if(typeof $.self.elt.setAttribute=="function"){$.self.elt.setAttribute($.key,_b_.str.$factory($.value))
return _b_.None}
throw _b_.TypeError.$factory("Can't set attributes on element")}
Attributes.__repr__=Attributes.__str__=function(self){var attrs=self.elt.attributes,items=[]
for(var i=0;i < attrs.length;i++){items.push(attrs[i].name+': "'+
self.elt.getAttributeNS(null,attrs[i].name)+'"')}
return '{'+items.join(", ")+'}'}
Attributes.get=function(){var $=$B.args("get",3,{self:null,key:null,deflt:null},["self","key","deflt"],arguments,{deflt:_b_.None},null,null)
try{return Attributes.__getitem__($.self,$.key)}catch(err){if(err.__class__===_b_.KeyError){return $.deflt}else{throw err}}}
Attributes.keys=function(){return Attributes.__iter__.apply(null,arguments)}
Attributes.items=function(){var $=$B.args("values",1,{self:null},["self"],arguments,{},null,null),attrs=$.self.elt.attributes,values=[]
for(var i=0;i < attrs.length;i++){values.push([attrs[i].name,attrs[i].value])}
return _b_.list.__iter__(values)}
Attributes.values=function(){var $=$B.args("values",1,{self:null},["self"],arguments,{},null,null),attrs=$.self.elt.attributes,values=[]
for(var i=0;i < attrs.length;i++){values.push(attrs[i].value)}
return _b_.list.__iter__(values)}
$B.set_func_names(Attributes,"<dom>")
var DOMEvent=$B.DOMEvent=$B.make_class("DOMEvent",function(evt_name){
return DOMEvent.__new__(DOMEvent,evt_name)}
)
DOMEvent.__new__=function(cls,evt_name){var ev=new Event(evt_name)
ev.__class__=DOMEvent
if(ev.preventDefault===undefined){ev.preventDefault=function(){ev.returnValue=false}}
if(ev.stopPropagation===undefined){ev.stopPropagation=function(){ev.cancelBubble=true}}
return ev}
function dom2svg(svg_elt,coords){
var pt=svg_elt.createSVGPoint()
pt.x=coords.x
pt.y=coords.y
return pt.matrixTransform(svg_elt.getScreenCTM().inverse())}
DOMEvent.__getattribute__=function(self,attr){switch(attr){case '__repr__':
case '__str__':
return function(){return '<DOMEvent object>'}
case 'x':
return $mouseCoords(self).x
case 'y':
return $mouseCoords(self).y
case 'data':
if(self.dataTransfer !==null && self.dataTransfer !==undefined){return Clipboard.$factory(self.dataTransfer)}
return $B.$JS2Py(self['data'])
case 'target':
if(self.target !==undefined){return DOMNode.$factory(self.target)}
case 'char':
return String.fromCharCode(self.which)
case 'svgX':
if(self.target instanceof SVGSVGElement){return Math.floor(dom2svg(self.target,$mouseCoords(self)).x)}
throw _b_.AttributeError.$factory("event target is not an SVG "+
"element")
case 'svgY':
if(self.target instanceof SVGSVGElement){return Math.floor(dom2svg(self.target,$mouseCoords(self)).y)}
throw _b_.AttributeError.$factory("event target is not an SVG "+
"element")}
var res=self[attr]
if(res !==undefined){if(typeof res=="function"){var func=function(){var args=[]
for(var i=0;i < arguments.length;i++){args.push($B.pyobj2jsobj(arguments[i]))}
return res.apply(self,arguments)}
func.$infos={__name__:res.name,__qualname__:res.name}
return func}
return $B.$JS2Py(res)}
throw $B.attr_error(attr,self)}
var $DOMEvent=$B.$DOMEvent=function(ev){ev.__class__=DOMEvent
ev.$no_dict=true
if(ev.preventDefault===undefined){ev.preventDefault=function(){ev.returnValue=false}}
if(ev.stopPropagation===undefined){ev.stopPropagation=function(){ev.cancelBubble=true}}
return ev}
$B.set_func_names(DOMEvent,"browser")
var Clipboard=$B.make_class('Clipboard',function(data){return{
__class__ :Clipboard,__dict__:$B.empty_dict(),data :data}}
)
Clipboard.__getitem__=function(self,name){return self.data.getData(name)}
Clipboard.__setitem__=function(self,name,value){self.data.setData(name,value)}
$B.set_func_names(Clipboard,"<dom>")
function $EventsList(elt,evt,arg){
this.elt=elt
this.evt=evt
if($B.$isinstance(arg,_b_.list)){this.callbacks=arg}
else{this.callbacks=[arg]}
this.remove=function(callback){var found=false
for(var i=0;i < this.callbacks.length;i++){if(this.callbacks[i]===callback){found=true
this.callback.splice(i,1)
this.elt.removeEventListener(this.evt,callback,false)
break}}
if(! found){throw _b_.KeyError.$factory("not found")}}}
var OpenFile=$B.OpenFile=$B.make_class('OpenFile')
OpenFile.__module__="<pydom>"
OpenFile.$factory=function(file,mode,encoding){var res={__class__:$OpenFileDict,file:file,reader:new FileReader()}
if(mode==="r"){res.reader.readAsText(file,encoding)}else if(mode==="rb"){res.reader.readAsBinaryString(file)}
return res}
OpenFile.__getattr__=function(self,attr){if(self["get_"+attr]!==undefined){return self["get_"+attr]}
return self.reader[attr]}
OpenFile.__setattr__=function(self,attr,value){var obj=self.reader
if(attr.substr(0,2)=="on"){
var callback=function(ev){return value($DOMEvent(ev))}
obj.addEventListener(attr.substr(2),callback)}else if("set_"+attr in obj){return obj["set_"+attr](value)}else if(attr in obj){obj[attr]=value}else{_b_.setattr(obj,attr,value)}}
$B.set_func_names(OpenFile,"<dom>")
var dom={File :function(){},FileReader :function(){}}
dom.File.__class__=_b_.type
dom.File.__str__=function(){return "<class 'File'>"}
dom.FileReader.__class__=_b_.type
dom.FileReader.__str__=function(){return "<class 'FileReader'>"}
var DOMNode=$B.make_class('DOMNode',function(elt){return elt}
)
DOMNode.__add__=function(self,other){
var res=TagSum.$factory()
res.children=[self],pos=1
if($B.$isinstance(other,TagSum)){res.children=res.children.concat(other.children)}else if($B.$isinstance(other,[_b_.str,_b_.int,_b_.float,_b_.list,_b_.dict,_b_.set,_b_.tuple])){res.children[pos++]=DOMNode.$factory(
document.createTextNode(_b_.str.$factory(other)))}else if($B.$isinstance(other,DOMNode)){res.children[pos++]=other}else{
try{res.children=res.children.concat(_b_.list.$factory(other))}
catch(err){throw _b_.TypeError.$factory("can't add '"+
$B.class_name(other)+"' object to DOMNode instance")}}
return res}
DOMNode.__bool__=function(self){return true}
DOMNode.__contains__=function(self,key){
if(self.nodeType==9 && typeof key=="string"){return document.getElementById(key)!==null}
if(self.length !==undefined && typeof self.item=="function"){for(var i=0,len=self.length;i < len;i++){if(self.item(i)===key){return true}}}
return false}
DOMNode.__del__=function(self){
if(!self.parentNode){throw _b_.ValueError.$factory("can't delete "+_b_.str.$factory(self))}
self.parentNode.removeChild(self)}
DOMNode.__delattr__=function(self,attr){if(self[attr]===undefined){throw _b_.AttributeError.$factory(
`cannot delete DOMNode attribute '${attr}'`)}
delete self[attr]
return _b_.None}
DOMNode.__delitem__=function(self,key){if(self.nodeType==9){
var res=self.getElementById(key)
if(res){res.parentNode.removeChild(res)}
else{throw _b_.KeyError.$factory(key)}}else{
self.parentNode.removeChild(self)}}
DOMNode.__dir__=function(self){var res=[]
for(var attr in self){if(attr.charAt(0)!="$"){res.push(attr)}}
for(var attr in DOMNode){if(res.indexOf(attr)==-1){res.push(attr)}}
res.sort()
return res}
DOMNode.__eq__=function(self,other){return self==other}
DOMNode.__getattribute__=function(self,attr){switch(attr){case "attrs":
return Attributes.$factory(self)
case "children":
case "child_nodes":
case "class_name":
case "html":
case "parent":
case "text":
return DOMNode[attr](self)
case "height":
case "left":
case "top":
case "width":
if(self.tagName=="CANVAS" && self[attr]){return self[attr]}
if(self instanceof SVGElement){return self[attr].baseVal.value}
var computed=window.getComputedStyle(self).
getPropertyValue(attr)
if(computed !==undefined){if(computed==''){if(self.style[attr]!==undefined){return parseInt(self.style[attr])}else{return 0}}
var prop=Math.floor(parseFloat(computed)+0.5)
return isNaN(prop)? 0 :prop}else if(self.style[attr]){return parseInt(self.style[attr])}else{throw _b_.AttributeError.$factory("style."+attr+
" is not set for "+_b_.str.$factory(self))}
case "x":
case "y":
if(!(self instanceof SVGElement)){var pos=$getPosition(self)
return attr=="x" ? pos.left :pos.top}
case "clear":
case "closest":
return function(){return DOMNode[attr].call(null,self,...arguments)}
case "headers":
if(self.nodeType==9){
var req=new XMLHttpRequest();
req.open("GET",document.location,false)
req.send(null);
var headers=req.getAllResponseHeaders()
headers=headers.split("\r\n")
var res=$B.empty_dict()
for(var i=0;i < headers.length;i++){var header=headers[i]
if(header.strip().length==0){continue}
var pos=header.search(":")
res.__setitem__(header.substr(0,pos),header.substr(pos+1).lstrip())}
return res}
break
case "location":
attr="location"
break}
if(attr=="select" && self.nodeType==1 &&
["INPUT","TEXTAREA"].indexOf(self.tagName.toUpperCase())>-1){return function(selector){if(selector===undefined){self.select();return _b_.None}
return DOMNode.select(self,selector)}}
if(attr=="query" && self.nodeType==9){
var res={__class__:Query,_keys :[],_values :{}}
var qs=location.search.substr(1).split('&')
if(location.search !=""){for(var i=0;i < qs.length;i++){var pos=qs[i].search("="),elts=[qs[i].substr(0,pos),qs[i].substr(pos+1)],key=decodeURIComponent(elts[0]),value=decodeURIComponent(elts[1])
if(res._keys.indexOf(key)>-1){res._values[key].push(value)}else{res._keys.push(key)
res._values[key]=[value]}}}
return res}
var klass=$B.get_class(self)
var property=self[attr]
if(property !==undefined && self.__class__ &&
klass.__module__ !="browser.html" &&
klass.__module__ !="browser.svg" &&
! klass.$webcomponent){var from_class=$B.$getattr(klass,attr,null)
if(from_class !==null){property=from_class
if(typeof from_class==='function'){return property.bind(self,self)}}else{
var bases=self.__class__.__bases__
var show_message=true
for(var base of bases){if(base.__module__=="browser.html"){show_message=false
break}}
if(show_message){var from_class=$B.$getattr(self.__class__,attr,_b_.None)
if(from_class !==_b_.None){var frame=$B.frame_obj.frame,line=frame.$lineno
console.info("Warning: line "+line+", "+self.tagName+
" element has instance attribute '"+attr+"' set."+
" Attribute of class "+$B.class_name(self)+
" is ignored.")}}}}
if(property===undefined){
if(self.tagName){var ce=customElements.get(self.tagName.toLowerCase())
if(ce !==undefined && ce.$cls !==undefined){
var save_class=self.__class__
self.__class__=ce.$cls
try{var res=_b_.object.__getattribute__(self,attr)
self.__class__=save_class
return res}catch(err){self.__class__=save_class
if(! $B.is_exc(err,[_b_.AttributeError])){throw err}}}}else{return object.__getattribute__(self,attr)}}
var res=property
if(res !==undefined){if(res===null){return res}
if(typeof res==="function"){if(self.__class__ && self.__class__.$webcomponent){var method=$B.$getattr(self.__class__,attr,null)
if(method !==null){
return res.bind(self)}}
if(res.$is_func){
return res}
var func=(function(f,elt){return function(){var args=[],pos=0
for(var i=0;i < arguments.length;i++){var arg=arguments[i]
if(typeof arg=="function"){
if(arg.$cache){var f1=arg.$cache}else{var f1=function(dest_fn){return function(){try{return dest_fn.apply(null,arguments)}catch(err){$B.handle_error(err)}}}(arg)
arg.$cache=f1}
args.push(f1)}else{args.push($B.pyobj2jsobj(arg))}}
var result=f.apply(elt,args)
return $B.$JS2Py(result)}})(res,self)
func.$infos={__name__ :attr,__qualname__:attr}
func.$is_func=true
func.$python_function=res
return func}
if(attr=='style'){return $B.JSObj.$factory(self[attr])}
if(Array.isArray(res)){
return res}
return js_immutable_to_py(res)}
return object.__getattribute__(self,attr)}
DOMNode.__getitem__=function(self,key){if(self.nodeType==9){
if(typeof key.valueOf()=="string"){var res=self.getElementById(key)
if(res){return DOMNode.$factory(res)}
throw _b_.KeyError.$factory(key)}else{try{var elts=self.getElementsByTagName(key.__name__),res=[]
for(var i=0;i < elts.length;i++){res.push(DOMNode.$factory(elts[i]))}
return res}catch(err){throw _b_.KeyError.$factory(_b_.str.$factory(key))}}}else{if((typeof key=="number" ||typeof key=="boolean")&&
typeof self.item=="function"){var key_to_int=_b_.int.$factory(key)
if(key_to_int < 0){key_to_int+=self.length}
var res=DOMNode.$factory(self.item(key_to_int))
if(res===undefined){throw _b_.KeyError.$factory(key)}
return res}else if(typeof key=="string" &&
self.attributes &&
typeof self.attributes.getNamedItem=="function"){var attr=self.attributes.getNamedItem(key)
if(!!attr){return attr.value}
throw _b_.KeyError.$factory(key)}}}
DOMNode.__hash__=function(self){return self.__hashvalue__===undefined ?
(self.__hashvalue__=$B.$py_next_hash--):
self.__hashvalue__}
DOMNode.__iter__=function(self){
if(self.length !==undefined && typeof self.item=="function"){var items=[]
for(var i=0,len=self.length;i < len;i++){items.push(DOMNode.$factory(self.item(i)))}}else if(self.childNodes !==undefined){var items=[]
for(var i=0,len=self.childNodes.length;i < len;i++){items.push(DOMNode.$factory(self.childNodes[i]))}}
return $B.$iter(items)}
DOMNode.__le__=function(self,other){
if(self.nodeType==9){self=self.body}
if($B.$isinstance(other,TagSum)){for(var i=0;i < other.children.length;i++){self.appendChild(other.children[i])}}else if(typeof other=="string" ||typeof other=="number"){var txt=document.createTextNode(other.toString())
self.appendChild(txt)}else if(other instanceof Node){self.appendChild(other)}else{try{
var items=_b_.list.$factory(other)
items.forEach(function(item){DOMNode.__le__(self,item)})}catch(err){throw _b_.TypeError.$factory("can't add '"+
$B.class_name(other)+"' object to DOMNode instance")}}
return self }
DOMNode.__len__=function(self){return self.length}
DOMNode.__mul__=function(self,other){if($B.$isinstance(other,_b_.int)&& other.valueOf()> 0){var res=TagSum.$factory()
var pos=res.children.length
for(var i=0;i < other.valueOf();i++){res.children[pos++]=DOMNode.clone(self)}
return res}
throw _b_.ValueError.$factory("can't multiply "+self.__class__+
"by "+other)}
DOMNode.__ne__=function(self,other){return ! DOMNode.__eq__(self,other)}
DOMNode.__next__=function(self){self.$counter++
if(self.$counter < self.childNodes.length){return DOMNode.$factory(self.childNodes[self.$counter])}
throw _b_.StopIteration.$factory("StopIteration")}
DOMNode.__radd__=function(self,other){
var res=TagSum.$factory()
var txt=DOMNode.$factory(document.createTextNode(other))
res.children=[txt,self]
return res}
DOMNode.__str__=DOMNode.__repr__=function(self){var attrs=self.attributes,attrs_str="",items=[]
if(attrs !==undefined){var items=[]
for(var i=0;i < attrs.length;i++){items.push(attrs[i].name+'="'+
self.getAttributeNS(null,attrs[i].name)+'"')}}
var proto=Object.getPrototypeOf(self)
if(proto){var name=proto.constructor.name
if(name===undefined){
var proto_str=proto.constructor.toString()
name=proto_str.substring(8,proto_str.length-1)}
items.splice(0,0,name)
return "<"+items.join(" ")+">"}
var res="<DOMNode object type '"
return res+$NodeTypes[self.nodeType]+"' name '"+
self.nodeName+"'"+attrs_str+">"}
DOMNode.__setattr__=function(self,attr,value){
switch(attr){case "left":
case "top":
case "width":
case "height":
if($B.$isinstance(value,[_b_.int,_b_.float])&& self.nodeType==1){self.style[attr]=value+"px"
return _b_.None}else{throw _b_.ValueError.$factory(attr+" value should be"+
" an integer or float, not "+$B.class_name(value))}
break}
if(DOMNode["set_"+attr]!==undefined){return DOMNode["set_"+attr](self,value)}
function warn(msg){console.log(msg)
var frame=$B.frame_obj.frame
if(! frame){return}
if($B.get_option('debug')> 0){var file=frame.__file__,lineno=frame.$lineno
console.log("module",frame[2],"line",lineno)
if($B.file_cache.hasOwnProperty(file)){var src=$B.file_cache[file]
console.log(src.split("\n")[lineno-1])}}else{console.log("module",frame[2])}}
var proto=Object.getPrototypeOf(self),nb=0
while(!!proto && proto !==Object.prototype && nb++< 10){var descriptors=Object.getOwnPropertyDescriptors(proto)
if(!!descriptors &&
typeof descriptors.hasOwnProperty=="function"){if(descriptors.hasOwnProperty(attr)){if(!descriptors[attr].writable &&
descriptors[attr].set===undefined){warn("Warning: property '"+attr+
"' is not writable. Use element.attrs['"+
attr+"'] instead.")}
break}}else{break}
proto=Object.getPrototypeOf(proto)}
if(self.style && self.style[attr]!==undefined &&
attr !='src' 
){warn("Warning: '"+attr+"' is a property of element.style")}
self[attr]=py_immutable_to_js(value)
return _b_.None}
DOMNode.__setitem__=function(self,key,value){if(typeof key=="number"){self.childNodes[key]=value}else if(typeof key=="string"){if(self.attributes){if(self instanceof SVGElement){self.setAttributeNS(null,key,value)}else if(typeof self.setAttribute=="function"){self.setAttribute(key,value)}}}}
DOMNode.abs_left={__get__:function(self){return $getPosition(self).left},__set__:function(){throw _b_.AttributeError.$factory("'DOMNode' objectattribute "+
"'abs_left' is read-only")}}
DOMNode.abs_top={__get__:function(self){return $getPosition(self).top},__set__:function(){throw _b_.AttributeError.$factory("'DOMNode' objectattribute "+
"'abs_top' is read-only")}}
DOMNode.attach=DOMNode.__le__ 
DOMNode.bind=function(self,event){
var $=$B.args("bind",4,{self:null,event:null,func:null,options:null},["self","event","func","options"],arguments,{func:_b_.None,options:_b_.None},null,null),self=$.self,event=$.event,func=$.func,options=$.options
if(func===_b_.None){
return function(f){return DOMNode.bind(self,event,f)}}
var callback=(function(f){return function(ev){try{return $B.$call(f)($DOMEvent(ev))}catch(err){if(err.__class__ !==undefined){$B.handle_error(err)}else{try{$B.$getattr($B.get_stderr(),"write")(err)}
catch(err1){console.log(err)}}}}}
)(func)
callback.$infos=func.$infos
callback.$attrs=func.$attrs ||{}
callback.$func=func
if(typeof options=="boolean"){self.addEventListener(event,callback,options)}else if(options.__class__===_b_.dict){self.addEventListener(event,callback,_b_.dict.$to_obj(options))}else if(options===_b_.None){self.addEventListener(event,callback,false)}
self.$events=self.$events ||{}
self.$events[event]=self.$events[event]||[]
self.$events[event].push([func,callback])
return self}
DOMNode.children=function(self){var res=[]
if(self.nodeType==9){self=self.body}
for(var child of self.children){res.push(DOMNode.$factory(child))}
return res}
DOMNode.child_nodes=function(self){var res=[]
if(self.nodeType==9){self=self.body}
for(child of self.childNodes){res.push(DOMNode.$factory(child))}
return res}
DOMNode.clear=function(self){
var $=$B.args("clear",1,{self:null},["self"],arguments,{},null,null)
if(self.nodeType==9){self=self.body}
while(self.firstChild){self.removeChild(self.firstChild)}}
DOMNode.Class=function(self){if(self.className !==undefined){return self.className}
return _b_.None}
DOMNode.class_name=function(self){return DOMNode.Class(self)}
DOMNode.clone=function(self){var res=DOMNode.$factory(self.cloneNode(true))
var events=self.$events ||{}
for(var event in events){var evt_list=events[event]
evt_list.forEach(function(evt){var func=evt[0]
DOMNode.bind(res,event,func)})}
return res}
DOMNode.closest=function(self,selector){
var $=$B.args("closest",2,{self:null,selector:null},["self","selector"],arguments,{},null,null)
var res=self.closest(selector)
if(res===null){throw _b_.KeyError.$factory("no parent with selector "+selector)}
return DOMNode.$factory(res)}
DOMNode.bindings=function(self){
var res=$B.empty_dict()
for(var key in self.$events){_b_.dict.$setitem(res,key,self.$events[key].map(x=> x[1]))}
return res}
DOMNode.events=function(self,event){self.$events=self.$events ||{}
var evt_list=self.$events[event]=self.$events[event]||[],callbacks=[]
evt_list.forEach(function(evt){callbacks.push(evt[1])})
return callbacks}
function make_list(node_list){var res=[]
for(var i=0;i < node_list.length;i++){res.push(DOMNode.$factory(node_list[i]))}
return res}
DOMNode.get=function(self){
var args=[]
for(var i=1;i < arguments.length;i++){args.push(arguments[i])}
var $ns=$B.args("get",0,{},[],args,{},null,"kw"),$dict=$ns.kw.$jsobj
if($dict["name"]!==undefined){if(self.getElementsByName===undefined){throw _b_.TypeError.$factory("DOMNode object doesn't support "+
"selection by name")}
return make_list(self.getElementsByName($dict['name']))}
if($dict["tag"]!==undefined){if(self.getElementsByTagName===undefined){throw _b_.TypeError.$factory("DOMNode object doesn't support "+
"selection by tag name")}
return make_list(self.getElementsByTagName($dict["tag"]))}
if($dict["classname"]!==undefined){if(self.getElementsByClassName===undefined){throw _b_.TypeError.$factory("DOMNode object doesn't support "+
"selection by class name")}
return make_list(self.getElementsByClassName($dict['classname']))}
if($dict["id"]!==undefined){if(self.getElementById===undefined){throw _b_.TypeError.$factory("DOMNode object doesn't support "+
"selection by id")}
var id_res=document.getElementById($dict['id'])
if(! id_res){return[]}
return[DOMNode.$factory(id_res)]}
if($dict["selector"]!==undefined){if(self.querySelectorAll===undefined){throw _b_.TypeError.$factory("DOMNode object doesn't support "+
"selection by selector")}
return make_list(self.querySelectorAll($dict['selector']))}
return res}
DOMNode.getContext=function(self){
if(!("getContext" in self)){throw _b_.AttributeError.$factory("object has no attribute 'getContext'")}
return function(ctx){return $B.JSObj.$factory(self.getContext(ctx))}}
DOMNode.getSelectionRange=function(self){
if(self["getSelectionRange"]!==undefined){return self.getSelectionRange.apply(null,arguments)}}
DOMNode.html=function(self){var res=self.innerHTML
if(res===undefined){if(self.nodeType==9 && self.body){res=self.body.innerHTML}else{res=_b_.None}}
return res}
DOMNode.index=function(self,selector){var items
if(selector===undefined){items=self.parentElement.childNodes}else{items=self.parentElement.querySelectorAll(selector)}
var rank=-1
for(var i=0;i < items.length;i++){if(items[i]===self){rank=i;break}}
return rank}
DOMNode.inside=function(self,other){
var elt=self
while(true){if(other===elt){return true}
elt=elt.parentNode
if(! elt){return false}}}
DOMNode.options=function(self){
return new $OptionsClass(self)}
DOMNode.parent=function(self){if(self.parentElement){return DOMNode.$factory(self.parentElement)}
return _b_.None}
DOMNode.reset=function(self){
return function(){self.reset()}}
DOMNode.scrolled_left={__get__:function(self){return $getPosition(self).left-
document.scrollingElement.scrollLeft},__set__:function(){throw _b_.AttributeError.$factory("'DOMNode' objectattribute "+
"'scrolled_left' is read-only")}}
DOMNode.scrolled_top={__get__:function(self){return $getPosition(self).top-
document.scrollingElement.scrollTop},__set__:function(){throw _b_.AttributeError.$factory("'DOMNode' objectattribute "+
"'scrolled_top' is read-only")}}
DOMNode.select=function(self,selector){
if(self.querySelectorAll===undefined){throw _b_.TypeError.$factory("DOMNode object doesn't support "+
"selection by selector")}
return make_list(self.querySelectorAll(selector))}
DOMNode.select_one=function(self,selector){
if(self.querySelector===undefined){throw _b_.TypeError.$factory("DOMNode object doesn't support "+
"selection by selector")}
var res=self.querySelector(selector)
if(res===null){return _b_.None}
return DOMNode.$factory(res)}
DOMNode.setSelectionRange=function(self){
if(this["setSelectionRange"]!==undefined){return(function(obj){return function(){return obj.setSelectionRange.apply(obj,arguments)}})(this)}else if(this["createTextRange"]!==undefined){return(function(obj){return function(start_pos,end_pos){if(end_pos==undefined){end_pos=start_pos}
var range=obj.createTextRange()
range.collapse(true)
range.moveEnd("character",start_pos)
range.moveStart("character",end_pos)
range.select()}})(this)}}
DOMNode.set_class_name=function(self,arg){self.setAttribute("class",arg)}
DOMNode.set_html=function(self,value){if(self.nodeType==9){self=self.body}
self.innerHTML=_b_.str.$factory(value)}
DOMNode.set_style=function(self,style){
if(typeof style==='string'){self.style=style
return}else if(!$B.$isinstance(style,_b_.dict)){throw _b_.TypeError.$factory("style must be str or dict, not "+
$B.class_name(style))}
var items=_b_.list.$factory(_b_.dict.items(style))
for(var i=0;i < items.length;i++){var key=items[i][0],value=items[i][1]
if(key.toLowerCase()=="float"){self.style.cssFloat=value
self.style.styleFloat=value}else{switch(key){case "top":
case "left":
case "width":
case "height":
case "borderWidth":
if($B.$isinstance(value,_b_.int)){value=value+"px"}}
self.style[key]=value}}}
DOMNode.set_text=function(self,value){if(self.nodeType==9){self=self.body}
self.innerText=_b_.str.$factory(value)
self.textContent=_b_.str.$factory(value)}
DOMNode.set_value=function(self,value){self.value=_b_.str.$factory(value)}
DOMNode.submit=function(self){
return function(){self.submit()}}
DOMNode.text=function(self){if(self.nodeType==9){self=self.body}
var res=self.innerText ||self.textContent
if(res===null){res=_b_.None}
return res}
DOMNode.toString=function(self){if(self===undefined){return 'DOMNode'}
return self.nodeName}
DOMNode.trigger=function(self,etype){
if(self.fireEvent){self.fireEvent("on"+etype)}else{var evObj=document.createEvent("Events")
evObj.initEvent(etype,true,false)
self.dispatchEvent(evObj)}}
DOMNode.unbind=function(self,event){
self.$events=self.$events ||{}
if(self.$events==={}){return _b_.None}
if(event===undefined){for(var event in self.$events){DOMNode.unbind(self,event)}
return _b_.None}
if(self.$events[event]===undefined ||
self.$events[event].length==0){return _b_.None}
var events=self.$events[event]
if(arguments.length==2){
for(var i=0;i < events.length;i++){var callback=events[i][1]
self.removeEventListener(event,callback,false)}
self.$events[event]=[]
return _b_.None}
for(var i=2;i < arguments.length;i++){var callback=arguments[i],flag=false,func=callback.$func
if(func===undefined){
var found=false
for(var j=0;j < events.length;j++){if($B.is_or_equals(events[j][0],callback)){var func=callback,found=true
break}}
if(! found){throw _b_.TypeError.$factory("function is not an event callback")}}
for(var j=0;j < events.length;j++){if($B.$getattr(func,'__eq__')(events[j][0])){var callback=events[j][1]
self.removeEventListener(event,callback,false)
events.splice(j,1)
flag=true
break}}
if(!flag){throw _b_.KeyError.$factory('missing callback for event '+event)}}}
$B.set_func_names(DOMNode,"builtins")
var Query=$B.make_class("query")
Query.__contains__=function(self,key){return self._keys.indexOf(key)>-1}
Query.__getitem__=function(self,key){
var result=self._values[key]
if(result===undefined){throw _b_.KeyError.$factory(key)}else if(result.length==1){return result[0]}
return result}
var Query_iterator=$B.make_iterator_class("query string iterator")
Query.__iter__=function(self){return Query_iterator.$factory(self._keys)}
Query.__setitem__=function(self,key,value){self._values[key]=[value]
return _b_.None}
Query.__str__=Query.__repr__=function(self){
var elts=[]
for(var key in self._values){for(const val of self._values[key]){elts.push(encodeURIComponent(key)+"="+encodeURIComponent(val))}}
if(elts.length==0){return ""}else{return "?"+elts.join("&")}}
Query.getfirst=function(self,key,_default){
var result=self._values[key]
if(result===undefined){if(_default===undefined){return _b_.None}
return _default}
return result[0]}
Query.getlist=function(self,key){
var result=self._values[key]
if(result===undefined){return[]}
return result}
Query.getvalue=function(self,key,_default){try{return Query.__getitem__(self,key)}
catch(err){if(_default===undefined){return _b_.None}
return _default}}
Query.keys=function(self){return self._keys}
$B.set_func_names(Query,"<dom>")
var TagSum=$B.make_class("TagSum",function(){return{
__class__:TagSum,children:[],toString:function(){return "(TagSum)"}}}
)
TagSum.appendChild=function(self,child){self.children.push(child)}
TagSum.__add__=function(self,other){if($B.get_class(other)===TagSum){self.children=self.children.concat(other.children)}else if($B.$isinstance(other,[_b_.str,_b_.int,_b_.float,_b_.dict,_b_.set,_b_.list])){self.children=self.children.concat(
DOMNode.$factory(document.createTextNode(other)))}else{self.children.push(other)}
return self}
TagSum.__radd__=function(self,other){var res=TagSum.$factory()
res.children=self.children.slice()
res.children.splice(0,0,DOMNode.$factory(document.createTextNode(other)))
return res}
TagSum.__repr__=function(self){var res="<object TagSum> "
for(var i=0;i < self.children.length;i++){res+=self.children[i]
if(self.children[i].toString()=="[object Text]"){res+=" ["+self.children[i].textContent+"]\n"}}
return res}
TagSum.__str__=TagSum.toString=TagSum.__repr__
TagSum.clone=function(self){var res=TagSum.$factory()
for(var i=0;i < self.children.length;i++){res.children.push(self.children[i].cloneNode(true))}
return res}
$B.set_func_names(TagSum,"<dom>")
$B.TagSum=TagSum 
var win=$B.JSObj.$factory(_window)
win.get_postMessage=function(msg,targetOrigin){if($B.$isinstance(msg,dict)){var temp={__class__:"dict"},items=_b_.list.$factory(_b_.dict.items(msg))
items.forEach(function(item){temp[item[0]]=item[1]})
msg=temp}
return _window.postMessage(msg,targetOrigin)}
$B.DOMNode=DOMNode
$B.win=win})(__BRYTHON__)
;
(function($B){$B.pattern_match=function(subject,pattern){var _b_=$B.builtins,frame=$B.frame_obj.frame,locals=frame[1]
function bind(pattern,subject){if(pattern.alias){locals[pattern.alias]=subject}}
if(pattern.sequence){
if($B.$isinstance(subject,[_b_.str,_b_.bytes,_b_.bytearray])){
return false}
var Sequence
if($B.imported['collections.abc']){Sequence=$B.imported['collections.abc'].Sequence}
var deque
if($B.imported['collections']){deque=$B.imported['collections'].deque}
var supported=false
var klass=subject.__class__ ||$B.get_class(subject)
for(var base of[klass].concat(klass.__bases__ ||[])){if(base.$match_sequence_pattern){
supported=true
break}else if(base===Sequence ||base==deque){supported=true
break}}
if((! supported)&& Sequence){
supported=_b_.issubclass(klass,Sequence)}
if(! supported){return false}
if(pattern.sequence.length==1 &&
pattern.sequence[0].capture_starred=='_'){return true}
var subject_length=_b_.len(subject)
var nb_fixed_length=0
for(var item of pattern.sequence){if(! item.capture_starred){nb_fixed_length++}}
if(subject_length < nb_fixed_length){
return false}else if(subject_length==0 && pattern.sequence.length==0){
return true}
var it=_b_.iter(subject),nxt=$B.$getattr(it,'__next__'),store_starred=[],nb_matched_in_subject=0
for(var i=0,len=pattern.sequence.length;i < len;i++){if(pattern.sequence[i].capture_starred){
if(pattern.sequence[i].capture_starred=='_' &&
i==len-1){bind(pattern,subject)
return true}
var starred_match_length=subject_length-
nb_matched_in_subject-len+i+1
for(var j=0;j < starred_match_length;j++){store_starred.push(nxt())}
locals[pattern.sequence[i].capture_starred]=store_starred
nb_matched_in_subject+=starred_match_length}else{var subject_item=nxt()
var m=$B.pattern_match(subject_item,pattern.sequence[i])
if(! m){return false}
nb_matched_in_subject++}}
if(nb_matched_in_subject !=subject_length){return false}
bind(pattern,subject)
return true}
if(pattern.group){if(pattern.group.length==1){
if($B.pattern_match(subject,pattern.group[0])){bind(pattern,subject)
return true}}else{
pattern.sequence=pattern.group
return $B.pattern_match(subject,pattern)}}
if(pattern.or){
for(var item of pattern.or){if($B.pattern_match(subject,item)){bind(pattern,subject)
return true}}
return false}
if(pattern.mapping){
var supported=false
var Mapping
if($B.imported['collections.abc']){Mapping=$B.imported['collections.abc'].Mapping}
var klass=subject.__class__ ||$B.get_class(subject)
for(var base of[klass].concat(klass.__bases__ ||[])){
if(base.$match_mapping_pattern ||base===Mapping){supported=true
break}}
if((! supported)&& Mapping){supported=_b_.issubclass(klass,Mapping)}
if(! supported){return false}
var matched=[],keys=[]
for(var item of pattern.mapping){var key_pattern=item[0],value_pattern=item[1]
if(key_pattern.hasOwnProperty('literal')){var key=key_pattern.literal}else if(key_pattern.hasOwnProperty('value')){var key=key_pattern.value}
if(_b_.list.__contains__(keys,key)){throw _b_.ValueError.$factory('mapping pattern checks '+
'duplicate key ('+
_b_.str.$factory(key)+')')}
keys.push(key)
var missing=$B.make_class('missing',function(){return{
__class__:missing}}
)
try{var v=$B.$call($B.$getattr(subject,"get"))(key,missing)
if(v===missing){
return false}
if(! $B.pattern_match(v,value_pattern)){return false}
matched.push(key)}catch(err){if($B.is_exc(err,[_b_.KeyError])){return false}
throw err}}
if(pattern.rest){var rest=$B.empty_dict(),it=_b_.iter(subject)
while(true){try{var next_key=_b_.next(it)}catch(err){if($B.is_exc(err,[_b_.StopIteration])){locals[pattern.rest]=rest
return true}
throw err}
if(! _b_.list.__contains__(matched,next_key)){_b_.dict.__setitem__(rest,next_key,$B.$getitem(subject,next_key))}}}
return true}
if(pattern.class){var klass=pattern.class
if(! $B.$isinstance(klass,_b_.type)){throw _b_.TypeError.$factory('called match pattern must be a type')}
if(! $B.$isinstance(subject,klass)){return false}
if(pattern.args.length > 0){if([_b_.bool,_b_.bytearray,_b_.bytes,_b_.dict,_b_.float,_b_.frozenset,_b_.int,_b_.list,_b_.set,_b_.str,_b_.tuple].indexOf(klass)>-1){
if(pattern.args.length > 1){throw _b_.TypeError.$factory('for builtin type '+
$B.class_name(subject)+', a single positional '+
'subpattern is accepted')}
return $B.pattern_match(subject,pattern.args[0])}else{
var match_args=$B.$getattr(klass,'__match_args__',$B.fast_tuple([]))
if(! $B.$isinstance(match_args,_b_.tuple)){throw _b_.TypeError.$factory(
'__match_args__() did not return a tuple')}
if(pattern.args.length > match_args.length){throw _b_.TypeError.$factory(
'__match_args__() returns '+match_args.length+
' names but '+pattern.args.length+' positional '+
'arguments were passed')}
for(var i=0,len=pattern.args.length;i < len;i++){
var pattern_arg=pattern.args[i],klass_arg=match_args[i]
if(typeof klass_arg !=="string"){throw _b_.TypeError.$factory('item in __match_args__ '+
'is not a string: '+klass_arg)}
if(pattern.keywords.hasOwnProperty(klass_arg)){throw _b_.TypeError.$factory('__match_arg__ item '+
klass_arg+' was passed as keyword pattern')}
pattern.keywords[klass_arg]=pattern_arg}}}
for(var key in pattern.keywords){var v=$B.$getattr(subject,key,null)
if(v===null){return false}else if(! $B.pattern_match(v,pattern.keywords[key])){return false}}
bind(pattern,subject)
return true}
if(pattern.capture){if(pattern.capture !='_'){
locals[pattern.capture]=subject}
bind(pattern,subject)
return true}else if(pattern.capture_starred){
locals[pattern.capture_starred]=$B.$list(subject)
return true}else if(pattern.hasOwnProperty('literal')){var literal=pattern.literal
if(literal===_b_.None ||literal===_b_.True ||
literal===_b_.False){
return $B.$is(subject,literal)}
if($B.rich_comp('__eq__',subject,literal)){bind(pattern,subject)
return true}
return false}else if(pattern.hasOwnProperty('value')){if($B.rich_comp('__eq__',subject,pattern.value)){bind(pattern,subject)
return true}}else if(subject==pattern){return true}
return false}})(__BRYTHON__)
;
;(function($B){var _b_=$B.builtins
var coroutine=$B.coroutine=$B.make_class("coroutine")
coroutine.close=function(self){}
coroutine.send=function(self){if(! $B.$isinstance(self,coroutine)){var msg="object is not a coroutine"
if(typeof self=="function" && self.$infos && self.$infos.__code__ &&
self.$infos.__code__.co_flags & 128){msg+='. Maybe you forgot to call the async function ?'}
throw _b_.TypeError.$factory(msg)}
var res=self.$func.apply(null,self.$args)
res.then(function(){if(self.$frame_obj){$B.frame_obj=self.$frame_obj}}).
catch(function(err){if(self.$frame_obj){$B.frame_obj=self.$frame_obj}})
return res}
coroutine.__repr__=coroutine.__str__=function(self){if(self.$func.$infos){return "<coroutine "+self.$func.$infos.__name__+">"}else{return "<coroutine object>"}}
$B.set_func_names(coroutine,"builtins")
$B.make_async=func=>{
if(func.$is_genfunc){return func}
var f=function(){var args=arguments
return{
__class__:coroutine,$args:args,$func:func}}
f.$infos=func.$infos
f.$is_func=true
f.$is_async=true
return f}
$B.promise=function(obj){if(obj.__class__===coroutine){
obj.$frame_obj=$B.frame_obj
return coroutine.send(obj)}
if(typeof obj=="function"){return obj()}
return obj}})(__BRYTHON__)
;
(function($B){$B.builtin_class_flags={builtins:{1074287874:['ChildProcessError','StopIteration','IOError','AssertionError','FileExistsError','RecursionError','UnicodeTranslateError','UnicodeWarning','FileNotFoundError','MemoryError','KeyboardInterrupt','EOFError','FloatingPointError','ImportWarning','DeprecationWarning','ReferenceError','UnboundLocalError','UserWarning','IndexError','OSError','TypeError','ConnectionResetError','BlockingIOError','BufferError','IndentationError','NotImplementedError','BrokenPipeError','KeyError','PermissionError','TabError','ImportError','ResourceWarning','ConnectionRefusedError','ModuleNotFoundError','ProcessLookupError','EncodingWarning','EnvironmentError','InterruptedError','UnicodeError','Warning','UnicodeDecodeError','BaseExceptionGroup','SyntaxWarning','GeneratorExit','BaseException','NameError','Exception','WindowsError','TimeoutError','BytesWarning','ValueError','ConnectionError','OverflowError','RuntimeError','ArithmeticError','StopAsyncIteration','ZeroDivisionError','PendingDeprecationWarning','UnicodeEncodeError','SystemExit','FutureWarning','ConnectionAbortedError','NotADirectoryError','LookupError','AttributeError','SyntaxError','SystemError','RuntimeWarning','IsADirectoryError'],1073763848:['ExceptionGroup'],21500162:['bool'],4723970:['float','bytearray'],138941698:['bytes'],546050:['filter','map','property','classmethod','reversed','staticmethod','enumerate','zip','super'],529666:['complex','object'],541611330:['dict'],4740354:['set','frozenset'],21501186:['int'],38294818:['list'],545058:['memoryview'],528674:['range'],545026:['slice'],273159426:['str'],71849250:['tuple'],2156420354:['type'],},types:{545154:['async_generator','method-wrapper','getset_descriptor','classmethod_descriptor','member_descriptor','frame','coroutine','generator'],547202:['builtin_function_or_method'],545026:['cell','traceback'],528642:['code','ellipsis','NoneType','NotImplementedType'],678146:['function'],545090:['mappingproxy'],678274:['method_descriptor'],547074:['method'],546050:['module'],676226:['wrapper_descriptor'],}}})(__BRYTHON__)
;
 ;(function($B){var _b_=$B.builtins
var update=$B.update_obj=function(mod,data){for(attr in data){mod[attr]=data[attr]}}
var _window=self;
var modules={}
var browser={$package:true,$is_package:true,__initialized__:true,__package__:'browser',__file__:$B.brython_path.replace(new RegExp("/*$","g"),'')+
'/Lib/browser/__init__.py',bind:function(){
var $=$B.args("bind",3,{elt:null,evt:null,options:null},["elt","evt","options"],arguments,{options:_b_.None},null,null)
var options=$.options
if(typeof options=="boolean"){}else if(options.__class__===_b_.dict){var _options={}
for(var key of _b_.dict.$keys_string(options)){_options[key]=_b_.dict.$getitem_string(options,key)}
options=_options}else{options==false}
return function(callback){if($B.get_class($.elt)===$B.JSObj){
function f(ev){try{return callback($B.JSObj.$factory(ev))}catch(err){$B.handle_error(err)}}
$.elt.addEventListener($.evt,f,options)
return callback}else if($B.$isinstance($.elt,$B.DOMNode)){
$B.DOMNode.bind($.elt,$.evt,callback,options)
return callback}else if($B.$isinstance($.elt,_b_.str)){
var items=document.querySelectorAll($.elt)
for(var i=0;i < items.length;i++){$B.DOMNode.bind($B.DOMNode.$factory(items[i]),$.evt,callback,options)}
return callback}
try{var it=$B.$iter($.elt)
while(true){try{var elt=_b_.next(it)
$B.DOMNode.bind(elt,$.evt,callback)}catch(err){if($B.$isinstance(err,_b_.StopIteration)){break}
throw err}}}catch(err){if($B.$isinstance(err,_b_.AttributeError)){$B.DOMNode.bind($.elt,$.evt,callback)}
throw err}
return callback}},console:self.console && $B.JSObj.$factory(self.console),self:$B.win,win:$B.win,"window":$B.win,}
browser.__path__=browser.__file__
if($B.isNode){delete browser.window
delete browser.win}else if($B.isWebWorker){browser.is_webworker=true
delete browser.window
delete browser.win
browser.self.send=self.postMessage
browser.document=_b_.property.$factory(
function(){throw _b_.ValueError.$factory(
"'document' is not available in Web Workers")},function(self,value){browser.document=value}
)}else{browser.is_webworker=false
update(browser,{"alert":function(message){window.alert($B.builtins.str.$factory(message ||""))},confirm:$B.JSObj.$factory(window.confirm),"document":$B.DOMNode.$factory(document),doc:$B.DOMNode.$factory(document),
DOMEvent:$B.DOMEvent,DOMNode:$B.DOMNode,load:function(script_url){
var file_obj=$B.builtins.open(script_url)
var content=$B.$getattr(file_obj,'read')()
eval(content)},mouseCoords:function(ev){return $B.JSObj.$factory($mouseCoords(ev))},prompt:function(message,default_value){return $B.JSObj.$factory(window.prompt(message,default_value||''))},reload:function(){
var scripts=document.getElementsByTagName('script'),js_scripts=[]
scripts.forEach(function(script){if(script.type===undefined ||
script.type=='text/javascript'){js_scripts.push(script)
if(script.src){console.log(script.src)}}})
for(var mod in $B.imported){if($B.imported[mod].$last_modified){console.log('check',mod,$B.imported[mod].__file__,$B.imported[mod].$last_modified)}else{console.log('no date for mod',mod)}}},run_script:function(){var $=$B.args("run_script",2,{src:null,name:null},["src","name"],arguments,{name:"script_"+$B.UUID()},null,null)
var script=document.createElement('script')
script.setAttribute('id',$.name)
$B.run_script(script,$.src,$.name,$B.script_path,true)},URLParameter:function(name){name=name.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
var regex=new RegExp("[\\?&]"+name+"=([^&#]*)"),results=regex.exec(location.search);
results=results===null ? "" :
decodeURIComponent(results[1].replace(/\+/g," "));
return $B.builtins.str.$factory(results);}})
modules['browser.html']=(function($B){var _b_=$B.builtins
var TagSum=$B.TagSum
function makeTagDict(tagName){
var dict={__class__:_b_.type,__name__:tagName,__module__:"browser.html",__qualname__:tagName}
dict.__init__=function(){var $ns=$B.args('__init__',1,{self:null},['self'],arguments,{},'args','kw'),self=$ns['self'],args=$ns['args']
if(args.length==1){var first=args[0]
if($B.$isinstance(first,[_b_.str,_b_.int,_b_.float])){
self.innerHTML=_b_.str.$factory(first)}else if(first.__class__===TagSum){for(var i=0,len=first.children.length;i < len;i++){self.appendChild(first.children[i])}}else{if($B.$isinstance(first,$B.DOMNode)){self.appendChild(first)}else{try{
var items=_b_.list.$factory(first)
for(var item of items){$B.DOMNode.__le__(self,item)}}catch(err){if($B.get_option('debug',err)> 1){console.log(err,err.__class__,err.args)
console.log("first",first)
console.log(arguments)}
throw err}}}}
for(var arg in $ns.kw.$jsobj){
var value=$ns.kw.$jsobj[arg]
if(arg.toLowerCase().substr(0,2)=="on"){
$B.DOMNode.__setattr__(self,arg,value)}else if(arg.toLowerCase()=="style"){$B.DOMNode.set_style(self,value)}else{if(value !==false){
try{
arg=$B.imported["browser.html"].
attribute_mapper(arg)
self.setAttribute(arg,$B.pyobj2jsobj(value))}catch(err){throw _b_.ValueError.$factory(
"can't set attribute "+arg)}}}}}
dict.__mro__=[$B.DOMNode,$B.builtins.object]
dict.__new__=function(cls){
var res=document.createElement(tagName)
if(cls !==html[tagName]){
res.__class__=cls}
return res}
dict.__rmul__=function(self,num){return $B.DOMNode.__mul__(self,num)}
$B.set_func_names(dict,"browser.html")
return dict}
function makeFactory(klass,ComponentClass){
return(function(k){return function(){if(k.__name__=='SVG'){var res=$B.DOMNode.$factory(
document.createElementNS("http://www.w3.org/2000/svg","svg"),true)}else{try{var res=document.createElement(k.__name__)}catch(err){console.log('error '+err)
console.log('creating element',k.__name__)
throw err}}
var init=$B.$getattr(k,"__init__",null)
if(init !==null){init(res,...arguments)}
return res}})(klass)}
var tags=['A','ABBR','ACRONYM','ADDRESS','APPLET','AREA','B','BASE','BASEFONT','BDO','BIG','BLOCKQUOTE','BODY','BR','BUTTON','CAPTION','CENTER','CITE','CODE','COL','COLGROUP','DD','DEL','DFN','DIR','DIV','DL','DT','EM','FIELDSET','FONT','FORM','FRAME','FRAMESET','H1','H2','H3','H4','H5','H6','HEAD','HR','HTML','I','IFRAME','IMG','INPUT','INS','ISINDEX','KBD','LABEL','LEGEND','LI','LINK','MAP','MENU','META','NOFRAMES','NOSCRIPT','OBJECT','OL','OPTGROUP','OPTION','P','PARAM','PRE','Q','S','SAMP','SCRIPT','SELECT','SMALL','SPAN','STRIKE','STRONG','STYLE','SUB','SUP','SVG','TABLE','TBODY','TD','TEXTAREA','TFOOT','TH','THEAD','TITLE','TR','TT','U','UL','VAR',
'ARTICLE','ASIDE','AUDIO','BDI','CANVAS','COMMAND','DATA','DATALIST','EMBED','FIGCAPTION','FIGURE','FOOTER','HEADER','KEYGEN','MAIN','MARK','MATH','METER','NAV','OUTPUT','PROGRESS','RB','RP','RT','RTC','RUBY','SECTION','SOURCE','TEMPLATE','TIME','TRACK','VIDEO','WBR',
'DETAILS','DIALOG','MENUITEM','PICTURE','SUMMARY']
var html={}
html.tags=$B.empty_dict()
function maketag(tagName,ComponentClass){
if(!(typeof tagName=='string')){throw _b_.TypeError.$factory("html.maketag expects a string as argument")}
if(html[tagName]!==undefined){throw _b_.ValueError.$factory("cannot reset class for "
+tagName)}
var klass=makeTagDict(tagName)
klass.$factory=makeFactory(klass,ComponentClass)
html[tagName]=klass
_b_.dict.$setitem(html.tags,tagName,html[tagName])
return klass}
for(var tagName of tags){maketag(tagName)}
html.maketag=maketag
html.attribute_mapper=function(attr){return attr.replace(/_/g,'-')}
return html})(__BRYTHON__)}
modules['browser']=browser
$B.UndefinedType=$B.make_class("UndefinedType",function(){return $B.Undefined}
)
$B.UndefinedType.__mro__=[_b_.object]
$B.UndefinedType.__bool__=function(self){return false}
$B.UndefinedType.__repr__=function(self){return "<Javascript undefined>"}
$B.UndefinedType.__str__=$B.UndefinedType.__repr__;
$B.Undefined={__class__:$B.UndefinedType}
$B.set_func_names($B.UndefinedType,"javascript")
var super_class=$B.make_class("JavascriptSuper",function(){
var res=_b_.super.$factory()
var js_constr=res.__thisclass__.__bases__[0]
return function(){var obj=new js_constr.$js_func(...arguments)
console.log('obj from js constr',obj)
for(var attr in obj){console.log('attr',attr)
res.__self_class__.__dict__[attr]=$B.jsobj2pyobj(obj[attr])}
return obj}}
)
super_class.__getattribute__=function(self,attr){if(attr=="__init__" ||attr=="__call__"){return self.__init__}
return $B.$getattr(self.__self_class__,attr)}
$B.set_func_names(super_class,"javascript")
modules['javascript']={"this":function(){
if($B.js_this===undefined){return $B.builtins.None}
return $B.JSObj.$factory($B.js_this)},Date:self.Date && $B.JSObj.$factory(self.Date),extends:function(js_constr){if((!js_constr.$js_func)||
! js_constr.$js_func.toString().startsWith('class ')){console.log(js_constr)
throw _b_.TypeError.$factory(
'argument of extend must be a Javascript class')}
js_constr.__class__=_b_.type
return function(obj){obj.__bases__.splice(0,0,js_constr)
obj.__mro__.splice(0,0,js_constr)
return obj}},import_js:function(url,name){
var $=$B.args('import_js',2,{url:null,alias:null},['url','alias'],arguments,{alias:_b_.None},null,null),url=$.url
alias=$.alias
var xhr=new XMLHttpRequest(),result
xhr.open('GET',url,false)
xhr.onreadystatechange=function(){if(this.readyState==4){if(this.status==200){eval(this.responseText)
if(typeof $module !=='undefined'){result=$B.module.$factory(name)
for(var key in $module){result[key]=$B.jsobj2pyobj($module[key])}
result.__file__=url}else{result=_b_.ImportError.$factory('Javascript '+
`module at ${url} doesn't define $module`)}}else{result=_b_.ModuleNotFoundError.$factory(name)}}}
xhr.send()
if($B.$isinstance(result,_b_.BaseException)){$B.handle_error(result)}else{if(alias===_b_.None){
alias=url.split('.')
if(alias.length > 1){alias.pop()}
alias=alias.join('.')
result.__name__=alias}
$B.imported[alias]=result
var frame=$B.frame_obj.frame
frame[1][alias]=result}},import_modules:function(refs,callback,loaded){
if(loaded===undefined){loaded=[]}
if(! Array.isArray(refs)){throw _b_.TypeError.$factory(
`first argument mus be a list, got ${$B.class_name(refs)}`)}
if(refs.length > 1){var ref=refs.shift()
import(ref).then(function(module){loaded.push(module)
$B.imported.javascript.import_modules(refs,callback,loaded)}).catch($B.show_error)}else{import(refs[0]).then(function(module){loaded.push(module)
return $B.$call(callback).apply(null,loaded)}).catch($B.show_error)}},JSObject:$B.JSObj,JSON:{__class__:$B.make_class("JSON"),parse:function(){return $B.structuredclone2pyobj(
JSON.parse.apply(this,arguments))},stringify:function(obj,replacer,space){return JSON.stringify($B.pyobj2structuredclone(obj,false),$B.JSObj.$factory(replacer),space)}},jsobj2pyobj:function(obj){return $B.jsobj2pyobj(obj)},load:function(script_url){console.log('"javascript.load" is deprecrated. '+
'Use browser.load instead.')
var file_obj=$B.builtins.open(script_url)
var content=$B.$getattr(file_obj,'read')()
eval(content)},Math:self.Math && $B.JSObj.$factory(self.Math),NULL:null,NullType:$B.make_class('NullType'),Number:self.Number && $B.JSObj.$factory(self.Number),py2js:function(src,module_name){if(module_name===undefined){module_name='__main__'+$B.UUID()}
var js=$B.py2js({src,filename:'<string>'},module_name,module_name,$B.builtins_scope).to_js()
return $B.format_indent(js,0)},pyobj2jsobj:function(obj){return $B.pyobj2jsobj(obj)},RegExp:self.RegExp && $B.JSObj.$factory(self.RegExp),String:self.String && $B.JSObj.$factory(self.String),"super":super_class,UNDEFINED:$B.Undefined,UndefinedType:$B.UndefinedType}
modules.javascript.NullType.__module__='javascript'
modules.javascript.NullType.__eq__=function(_self,other){
return other===null ||other===$B.Undefined}
$B.set_func_names(modules.javascript.NullType,'javascript')
modules.javascript.UndefinedType.__module__='javascript'
var $io=$B.$io=$B.make_class("io",function(out){return{
__class__:$io,out,encoding:'utf-8'}}
)
$io.flush=function(self){if(self.buf){console[self.out](self.buf.join(''))
self.buf=[]}}
$io.write=function(self,msg){
if(self.buf===undefined){self.buf=[]}
if(typeof msg !="string"){throw _b_.TypeError.$factory("write() argument must be str, not "+
$B.class_name(msg))}
self.buf.push(msg)
return _b_.None}
var _b_=$B.builtins
modules['_sys']={
_getframe :function(){var $=$B.args("_getframe",1,{depth:null},['depth'],arguments,{depth:0},null,null),depth=$.depth,frame_obj=$B.frame_obj
for(var i=0;i < depth;i++){frame_obj=frame_obj.prev}
var res=frame_obj.frame
res.$pos=$B.count_frames()-depth-1
return res},breakpointhook:function(){var hookname=$B.$options.breakpoint,modname,dot,funcname,hook
if(hookname===undefined){hookname="pdb.set_trace"}
[modname,dot,funcname]=_b_.str.rpartition(hookname,'.')
if(dot==""){modname="builtins"}
try{$B.$import(modname)
hook=$B.$getattr($B.imported[modname],funcname)}catch(err){console.warn("cannot import breakpoint",hookname)
return _b_.None}
return $B.$call(hook).apply(null,arguments)},exc_info:function(){var frame_obj=$B.frame_obj,frame,exc
while(frame_obj !==null){frame=frame_obj.frame
exc=frame[1].$current_exception
if(exc){return _b_.tuple.$factory([exc.__class__,exc,$B.$getattr(exc,"__traceback__")])}
frame_obj=frame_obj.prev}
return _b_.tuple.$factory([_b_.None,_b_.None,_b_.None])},excepthook:function(exc_class,exc_value,traceback){$B.handle_error(exc_value)},exception:function(){var frame_obj=$B.frame_obj,frame,exc
while(frame_obj !==null){frame=frame_obj.frame
exc=frame[1].$current_exception
if(exc !==undefined){return exc}
frame_obj=frame_obj.prev}
return _b_.None},float_repr_style:'short',getdefaultencoding:function(){return 'utf-8'},getrecursionlimit:function(){return $B.recursion_limit},getrefcount:function(){return 0},gettrace:function(){return $B.tracefunc ||_b_.None},getunicodeinternedsize:function(){
return 0},last_exc:_b_.property.$factory(
function(){return $B.imported._sys.exception()},function(value){$B.frame_obj.frame.$current_exception=value}
),modules:_b_.property.$factory(
function(){return $B.obj_dict($B.imported)},function(self,value){throw _b_.TypeError.$factory("Read only property 'sys.modules'")}
),path:_b_.property.$factory(
function(){var filename=$B.get_filename_for_import()
return $B.import_info[filename].path},function(self,value){var filename=$B.get_filename_for_import()
$B.import_info[filename].path=value}
),meta_path:_b_.property.$factory(
function(){var filename=$B.get_filename()
return $B.import_info[filename].meta_path},function(self,value){var filename=$B.get_filename()
$B.import_info[filename].meta_path=value}
),path_hooks:_b_.property.$factory(
function(){var filename=$B.get_filename()
return $B.import_info[filename].path_hooks},function(self,value){var filename=$B.get_filename()
$B.import_info[filename].path_hooks=value}
),path_importer_cache:_b_.property.$factory(
function(){return _b_.dict.$factory($B.JSObj.$factory($B.path_importer_cache))},function(self,value){throw _b_.TypeError.$factory("Read only property"+
" 'sys.path_importer_cache'")}
),setrecursionlimit:function(value){$B.recursion_limit=value},settrace:function(){var $=$B.args("settrace",1,{tracefunc:null},['tracefunc'],arguments,{},null,null)
$B.tracefunc=$.tracefunc
$B.frame_obj.frame.$f_trace=$B.tracefunc
$B.tracefunc.$current_frame_id=$B.frame_obj.frame[0]
return _b_.None},stderr:console.error !==undefined ? $io.$factory("error"):
$io.$factory("log"),stdout:$io.$factory("log"),stdin:_b_.property.$factory(
function(){return $B.stdin},function(self,value){$B.stdin=value}
),vfs:_b_.property.$factory(
function(){if($B.hasOwnProperty("VFS")){return $B.obj_dict($B.VFS)}else{return _b_.None}},function(){throw _b_.TypeError.$factory("Read only property 'sys.vfs'")}
)}
var WarningMessage=$B.make_class("WarningMessage",function(){var $=$B.make_args("WarningMessage",8,{message:null,category:null,filename:null,lineno:null,file:null,line:null,source:null},['message','category','filename','lineno','file','line','source'],arguments,{file:_b_.None,line:_b_.None,source:_b_.None},null,null)
return{
__class__:WarningMessage,message:$.message,category:$.category,filename:$.filename,lineno:$.lineno,file:$.file,line:$.line,source:$.source,_category_name:_b_.bool.$factory($.category)?
$B.$getattr($.category,"__name__"):_b_.None}}
)
modules._warnings={_defaultaction:"default",_filters_mutated:function(){},_onceregistry:$B.empty_dict(),filters:[$B.fast_tuple(['default',_b_.None,_b_.DeprecationWarning,'__main__',0]),$B.fast_tuple(['ignore',_b_.None,_b_.DeprecationWarning,_b_.None,0]),$B.fast_tuple(['ignore',_b_.None,_b_.PendingDeprecationWarning,_b_.None,0]),$B.fast_tuple(['ignore',_b_.None,_b_.ImportWarning,_b_.None,0]),$B.fast_tuple(['ignore',_b_.None,_b_.ResourceWarning,_b_.None,0])
],warn:function(message){
var $=$B.args('warn',4,{message:null,category:null,stacklevel:null,source:null},['message','category','stacklevel','source'],arguments,{category:_b_.None,stacklevel:1,source:_b_.None},null,null),message=$.message,category=$.category,stacklevel=$.stacklevel
if($B.$isinstance(message,_b_.Warning)){category=$B.get_class(message)}
var filters
if($B.imported.warnings){filters=$B.imported.warnings.filters}else{filters=modules._warnings.filters}
if(filters[0][0]=='error'){var syntax_error=_b_.SyntaxError.$factory(message.args[0])
syntax_error.args[1]=[message.filename,message.lineno,message.offset,message.line]
syntax_error.filename=message.filename
syntax_error.lineno=message.lineno
syntax_error.offset=message.offset
syntax_error.line=message.line
throw syntax_error}
var warning_message
if(category===_b_.SyntaxWarning){var file=message.filename,lineno=message.lineno,line=message.text
warning_message={__class__:WarningMessage,message:message,category,filename:message.filename,lineno:message.lineno,file:_b_.None,line:_b_.None,source:_b_.None,_category_name:category.__name__}}else{var frame_rank=Math.max(0,$B.count_frames()-stacklevel),frame=$B.get_frame_at(frame_rank),file=frame.__file__,f_code=$B._frame.f_code.__get__(frame),lineno=frame.$lineno,src=$B.file_cache[file],line=src ? src.split('\n')[lineno-1]:null
warning_message={__class__:WarningMessage,message:message,category,filename:message.filename ||f_code.co_filename,lineno:message.lineno ||lineno,file:_b_.None,line:_b_.None,source:_b_.None,_category_name:category.__name__}}
if($B.imported.warnings){$B.imported.warnings._showwarnmsg_impl(warning_message)}else{var trace=''
if(file && lineno){trace+=`${file}:${lineno}: `}
trace+=$B.class_name(message)+': '+message.args[0]
if(line){trace+='\n    '+line.trim()}
var stderr=$B.get_stderr()
$B.$getattr(stderr,'write')(trace+'\n')
var flush=$B.$getattr(stderr,'flush',_b_.None)
if(flush !==_b_.None){flush()}}},warn_explicit:function(){
console.log("warn_explicit",arguments)}}
function load(name,module_obj){
module_obj.__class__=$B.module
module_obj.__name__=name
$B.imported[name]=module_obj
for(var attr in module_obj){if(typeof module_obj[attr]=='function'){module_obj[attr].$infos={__module__:name,__name__:attr,__qualname__:name+'.'+attr}}}}
for(var attr in modules){load(attr,modules[attr])}
if(!($B.isWebWorker ||$B.isNode)){modules['browser'].html=modules['browser.html']}
var _b_=$B.builtins
_b_.__builtins__=$B.module.$factory('__builtins__','Python builtins')
for(var attr in _b_){_b_.__builtins__[attr]=_b_[attr]
$B.builtins_scope.binding[attr]=true
if(_b_[attr].$is_class){if(_b_[attr].__bases__){_b_[attr].__bases__.__class__=_b_.tuple}else{_b_[attr].__bases__=$B.fast_tuple([_b_.object])}}}
_b_.__builtins__.__setattr__=function(attr,value){_b_[attr]=value}
$B.method_descriptor.__getattribute__=$B.function.__getattribute__
$B.wrapper_descriptor.__getattribute__=$B.function.__getattribute__
for(var name in _b_){var builtin=_b_[name]
if(_b_[name].__class__===_b_.type){_b_[name].__qualname__=name
_b_[name].__module__='builtins'
_b_[name].__name__=name
_b_[name].$is_builtin_class=true
$B.builtin_classes.push(_b_[name])
for(var key in _b_[name]){var value=_b_[name][key]
if(value===undefined ||value.__class__ ||
typeof value !='function'){continue}else if(key=="__new__"){value.__class__=$B.builtin_function_or_method}else if(key.startsWith("__")){value.__class__=$B.wrapper_descriptor}else{value.__class__=$B.method_descriptor}
value.__objclass__=_b_[name]}}else if(typeof builtin=='function'){builtin.$infos={__name__:name,__qualname__:name}}}
for(var attr in $B){if(Array.isArray($B[attr])){$B[attr].__class__=_b_.list}}
$B.cell=$B.make_class("cell",function(value){return{
__class__:$B.cell,$cell_contents:value}}
)
$B.cell.cell_contents=$B.$call(_b_.property)(
function(self){if(self.$cell_contents===null){throw _b_.ValueError.$factory("empty cell")}
return self.$cell_contents},function(self,value){self.$cell_contents=value}
)
var $comps=Object.values($B.$comps).concat(["eq","ne"])
$comps.forEach(function(comp){var op="__"+comp+"__"
$B.cell[op]=(function(op){return function(self,other){if(! $B.$isinstance(other,$B.cell)){return _b_.NotImplemented}
if(self.$cell_contents===null){if(other.$cell_contents===null){return op=="__eq__"}else{return["__ne__","__lt__","__le__"].indexOf(op)>-1}}else if(other.$cell_contents===null){return["__ne__","__gt__","__ge__"].indexOf(op)>-1}
return $B.rich_comp(op,self.$cell_contents,other.$cell_contents)}})(op)})
$B.set_func_names($B.cell,"builtins")
for(var flag in $B.builtin_class_flags.builtins){for(var key of $B.builtin_class_flags.builtins[flag]){if(_b_[key]){_b_[key].__flags__=parseInt(flag)}else{console.log('not in _b_',key)}}}
for(var flag in $B.builtin_class_flags.types){for(var key of $B.builtin_class_flags.types[flag]){if($B[key]){$B[key].__flags__=parseInt(flag)}}}
$B.AST={__class__:_b_.type,__mro__:[_b_.object],__name__:'AST',__qualname__:'AST',$is_class:true,$convert:function(js_node){if(js_node===undefined){return _b_.None}
var constr=js_node.constructor
if(constr && constr.$name){$B.create_python_ast_classes()
return $B.python_ast_classes[constr.$name].$factory(js_node)}else if(Array.isArray(js_node)){return js_node.map($B.AST.$convert)}else if(js_node.type){
switch(js_node.type){case 'int':
var value=js_node.value[1],base=js_node.value[0]
var res=parseInt(value,base)
if(! Number.isSafeInteger(res)){res=$B.long_int.$factory(value,base)}
return res
case 'float':
return $B.fast_float(parseFloat(js_node.value))
case 'imaginary':
return $B.make_complex(0,$B.AST.$convert(js_node.value))
case 'ellipsis':
return _b_.Ellipsis
case 'str':
if(js_node.is_bytes){return _b_.bytes.$factory(js_node.value,'latin-1')}
return js_node.value
case 'id':
if(['False','None','True'].indexOf(js_node.value)>-1){return _b_[js_node.value]}
break}}else if(['string','number'].indexOf(typeof js_node)>-1){return js_node}else if(js_node.$name){
return js_node.$name+'()'}else if([_b_.None,_b_.True,_b_.False].indexOf(js_node)>-1){return js_node}else if(js_node.__class__){return js_node}else{console.log('cannot handle',js_node)
return js_node}}}
$B.stdin={__class__:$io,__original__:true,closed:false,len:1,pos:0,read:function(){return ""},readline:function(){return ""}}})(__BRYTHON__)
;
(function($B){var _b_=$B.builtins
var trace=1
function compiler_error(ast_obj,message,end){var exc=_b_.SyntaxError.$factory(message)
exc.filename=state.filename
if(exc.filename !='<string>'){var src=$B.file_cache[exc.filename],lines=src.split('\n'),line=lines[ast_obj.lineno-1]
exc.text=line}else{exc.text=_b_.None}
exc.lineno=ast_obj.lineno
exc.offset=ast_obj.col_offset
end=end ||ast_obj
exc.end_lineno=end.end_lineno
exc.end_offset=end.end_col_offset
exc.args[1]=[exc.filename,exc.lineno,exc.offset,exc.text,exc.end_lineno,exc.end_offset]
exc.$frame_obj=$B.frame_obj
if($B.frame_obj===null){alert('tiens !')}
throw exc}
function fast_id(obj){
if(obj.$id !==undefined){return obj.$id}
return obj.$id=$B.UUID()}
function copy_position(target,origin){target.lineno=origin.lineno
target.col_offset=origin.col_offset
target.end_lineno=origin.end_lineno
target.end_col_offset=origin.end_col_offset}
function encode_position(a,b,c,d){if(d===undefined){return `[${[a, b, c]}]`}else{return `[${[a, b, c, d]}]`}}
$B.decode_position=function(pos){return pos}
function last_scope(scopes){var ix=scopes.length-1
while(scopes[ix].parent){ix--}
return scopes[ix]}
function Scope(name,type,ast){this.name=name
this.locals=new Set()
this.globals=new Set()
this.nonlocals=new Set()
this.freevars=new Set()
this.type=type
this.ast=ast}
function copy_scope(scope,ast,id){
var new_scope=new Scope(scope.name,scope.type,ast)
if(id !==undefined){
new_scope.id=id}
new_scope.parent=scope
return new_scope}
function make_local(module_id){return `locals_${module_id.replace(/\./g, '_')}`}
function qualified_scope_name(scopes,scope){
if(scope !==undefined && !(scope instanceof Scope)){console.log('bizarre',scope)
throw Error('scope étrange')}
var _scopes
if(! scope){_scopes=scopes.slice()}else{var ix=scopes.indexOf(scope)
if(ix >-1){_scopes=scopes.slice(0,ix+1)}else{_scopes=scopes.concat(scope)}}
var names=[]
for(var _scope of _scopes){if(! _scope.parent){names.push(_scope.name)}}
return names.join('_').replace(/\./g,'_')}
function module_name(scopes){var _scopes=scopes.slice()
var names=[]
for(var _scope of _scopes){if(! _scope.parent){names.push(_scope.name)}}
return names.join('.')}
function make_scope_name(scopes,scope){
if(scope===builtins_scope){return `_b_`}
return 'locals_'+qualified_scope_name(scopes,scope)}
function make_search_namespaces(scopes){var namespaces=[]
for(var scope of scopes.slice().reverse()){if(scope.parent ||scope.type=='class'){continue}else if(scope.is_exec_scope){namespaces.push('$B.exec_scope')}
namespaces.push(make_scope_name(scopes,scope))}
namespaces.push('_b_')
return namespaces}
function mangle(scopes,scope,name){if(name.startsWith('__')&& ! name.endsWith('__')){var ix=scopes.indexOf(scope)
while(ix >=0){if(scopes[ix].ast instanceof $B.ast.ClassDef){var scope_name=scopes[ix].name
while(scope_name.length > 0 && scope_name.startsWith('_')){scope_name=scope_name.substr(1)}
if(scope_name.length==0){
return name}
return '_'+scope_name+name}
ix--}}
return name}
function reference(scopes,scope,name){return make_scope_name(scopes,scope)+'.'+mangle(scopes,scope,name)}
function bind(name,scopes){var scope=$B.last(scopes),up_scope=last_scope(scopes)
name=mangle(scopes,up_scope,name)
if(up_scope.globals && up_scope.globals.has(name)){scope=scopes[0]}else if(up_scope.nonlocals.has(name)){for(var i=scopes.indexOf(up_scope)-1;i >=0;i--){if(scopes[i].locals.has(name)){return scopes[i]}}}
scope.locals.add(name)
return scope}
var CELL=5,FREE=4,LOCAL=1,GLOBAL_EXPLICIT=2,GLOBAL_IMPLICIT=3,SCOPE_MASK=15,SCOPE_OFF=11
var TYPE_CLASS=1,TYPE_FUNCTION=0,TYPE_MODULE=2
var DEF_GLOBAL=1,
DEF_LOCAL=2 ,
DEF_PARAM=2<<1,
DEF_NONLOCAL=2<<2,
USE=2<<3 ,
DEF_FREE=2<<4 ,
DEF_FREE_CLASS=2<<5,
DEF_IMPORT=2<<6,
DEF_ANNOT=2<<7,
DEF_COMP_ITER=2<<8 
function name_reference(name,scopes,position){var scope=name_scope(name,scopes)
return make_ref(name,scopes,scope,position)}
function make_ref(name,scopes,scope,position){if(scope.found){return reference(scopes,scope.found,name)}else if(scope.resolve=='all'){var scope_names=make_search_namespaces(scopes)
return `$B.resolve_in_scopes('${name}', [${scope_names}], [${position}])`}else if(scope.resolve=='local'){return `$B.resolve_local('${name}', [${position}])`}else if(scope.resolve=='global'){return `$B.resolve_global('${name}', _frame_obj)`}else if(Array.isArray(scope.resolve)){return `$B.resolve_in_scopes('${name}', [${scope.resolve}], [${position}])`}else if(scope.resolve=='own_class_name'){return `$B.own_class_name('${name}')`}}
function local_scope(name,scope){
var s=scope
while(true){if(s.locals.has(name)){return{found:true,scope:s}}
if(! s.parent){return{found:false}}
s=s.parent}}
function name_scope(name,scopes){
var test=false 
if(test){console.log('name scope',name,scopes.slice())
alert()}
var flags,block
if(scopes.length==0){
return{found:false,resolve:'all'}}
var scope=$B.last(scopes),up_scope=last_scope(scopes),name=mangle(scopes,scope,name)
if(up_scope.ast===undefined){console.log('no ast',scope)}
block=scopes.symtable.table.blocks.get(fast_id(up_scope.ast))
if(block===undefined){console.log('no block',scope,scope.ast,'id',fast_id(up_scope.ast))
console.log('scopes',scopes.slice())
console.log('symtable',scopes.symtable)}
try{flags=_b_.dict.$getitem_string(block.symbols,name)}catch(err){console.log('name',name,'not in symbols of block',block)
console.log('symtables',scopes.symtable)
return{found:false,resolve:'all'}}
var __scope=(flags >> SCOPE_OFF)& SCOPE_MASK,is_local=[LOCAL,CELL].indexOf(__scope)>-1
if(test){console.log('block',block,'is local',is_local)}
if(up_scope.ast instanceof $B.ast.ClassDef && name==up_scope.name){return{found:false,resolve:'own_class_name'}}
if(name=='__annotations__'){if(block.type==TYPE_CLASS && up_scope.has_annotation){is_local=true}else if(block.type==TYPE_MODULE){is_local=true}}
if(is_local){
var l_scope=local_scope(name,scope)
if(! l_scope.found){if(block.type==TYPE_CLASS){
scope.needs_frames=true
return{found:false,resolve:'global'}}else if(block.type==TYPE_MODULE){scope.needs_frames=true
return{found:false,resolve:'global'}}
return{found:false,resolve:'local'}}else{return{found:l_scope.scope}}}else if(scope.globals.has(name)){var global_scope=scopes[0]
if(global_scope.locals.has(name)){return{found:global_scope}}
scope.needs_frames=true
return{found:false,resolve:'global'}}else if(scope.nonlocals.has(name)){
for(var i=scopes.length-2;i >=0;i--){block=scopes.symtable.table.blocks.get(fast_id(scopes[i].ast))
if(block && _b_.dict.$contains_string(block.symbols,name)){var fl=_b_.dict.$getitem_string(block.symbols,name),local_to_block=
[LOCAL,CELL].indexOf((fl >> SCOPE_OFF)& SCOPE_MASK)>-1
if(! local_to_block){continue}
return{found:scopes[i]}}}}
if(scope.has_import_star){if(! is_local){scope.needs_frames=true}
return{found:false,resolve:is_local ? 'all' :'global'}}
for(var i=scopes.length-2;i >=0;i--){block=undefined
if(scopes[i].ast){block=scopes.symtable.table.blocks.get(fast_id(scopes[i].ast))}
if(scopes[i].globals.has(name)){scope.needs_frames=true
return{found:false,resolve:'global'}}
if(scopes[i].locals.has(name)&& scopes[i].type !='class'){return{found:scopes[i]}}else if(block && _b_.dict.$contains_string(block.symbols,name)){flags=_b_.dict.$getitem_string(block.symbols,name)
var __scope=(flags >> SCOPE_OFF)& SCOPE_MASK
if([LOCAL,CELL].indexOf(__scope)>-1){
return{found:false,resolve:'all'}}}
if(scopes[i].has_import_star){return{found:false,resolve:'all'}}}
if(builtins_scope.locals.has(name)){return{found:builtins_scope}}
var scope_names=make_search_namespaces(scopes)
return{found:false,resolve:scope_names}}
function resolve_in_namespace(name,ns){if(ns.$proxy){
return ns[name]===undefined ?{found:false}:
{found:true,value:ns[name]}}
if(! ns.hasOwnProperty){if(ns[name]!==undefined){return{found:true,value:ns[name]}}}else if(ns.hasOwnProperty(name)){return{found:true,value:ns[name]}}else if(ns.$dict){try{return{found:true,value:ns.$getitem(ns.$dict,name)}}catch(err){if(ns.$missing){try{return{
found:true,value:$B.$call(ns.$missing)(ns.$dict,name)}}catch(err){if(! $B.is_exc(err,[_b_.KeyError])){throw err}}}}}
return{found:false}}
$B.resolve=function(name){var checked=new Set(),current_globals,frame_obj=$B.frame_obj,frame
while(frame_obj !==null){frame=frame_obj.frame
if(current_globals===undefined){current_globals=frame[3]}else if(frame[3]!==current_globals){var v=resolve_in_namespace(name,current_globals)
if(v.found){return v.value}
checked.add(current_globals)
current_globals=frame[3]}
var v=resolve_in_namespace(name,frame[1])
if(v.found){return v.value}
frame_obj=frame_obj.prev}
if(! checked.has(frame[3])){var v=resolve_in_namespace(name,frame[3])
if(v.found){return v.value}}
if(builtins_scope.locals.has(name)){return _b_[name]}
throw $B.name_error(name)}
$B.resolve_local=function(name,position){
var frame=$B.frame_obj.frame
if(frame[1].hasOwnProperty){if(frame[1].hasOwnProperty(name)){return frame[1][name]}}else{var value=frame[1][name]
if(value !==undefined){return value}}
var exc=_b_.UnboundLocalError.$factory(`cannot access local variable `+
`'${name}' where it is not associated with a value`)
if(position){$B.set_exception_offsets(exc,position)}
throw exc}
$B.resolve_in_scopes=function(name,namespaces,position){for(var ns of namespaces){if(ns===$B.exec_scope){var exec_top,frame_obj=$B.frame_obj,frame
while(frame_obj !==null){frame=frame_obj.frame
if(frame.is_exec_top){exec_top=frame
break}
frame_obj=frame_obj.prev}
if(exec_top){for(var ns of[exec_top[1],exec_top[3]]){var v=resolve_in_namespace(name,ns)
if(v.found){return v.value}}}}else{var v=resolve_in_namespace(name,ns)
if(v.found){return v.value}}}
var exc=$B.name_error(name)
if(position){$B.set_exception_offsets(exc,position)}
throw exc}
$B.resolve_global=function(name,frame_obj){
while(frame_obj !==null){var frame=frame_obj.frame,v=resolve_in_namespace(name,frame[3])
if(v.found){return v.value}
if(frame.is_exec_top){break}
frame_obj=frame_obj.prev}
if(builtins_scope.locals.has(name)){return _b_[name]}
throw $B.name_error(name)}
$B.own_class_name=function(name){throw $B.name_error(name)}
var $operators=$B.op2method.subset("all")
var opname2opsign={}
for(var key in $operators){opname2opsign[$operators[key]]=key}
var opclass2dunder={}
for(var op_type of $B.op_types){
for(var operator in op_type){opclass2dunder[op_type[operator]]='__'+$operators[operator]+'__'}}
opclass2dunder['UAdd']='__pos__'
opclass2dunder['USub']='__neg__'
opclass2dunder['Invert']='__invert__'
var builtins_scope=new Scope("__builtins__")
for(var name in $B.builtins){builtins_scope.locals.add(name)}
function mark_parents(node){if(node.body && node.body instanceof Array){for(var child of node.body){child.$parent=node
mark_parents(child)}}else if(node.handlers){
var p={$parent:node,'type':'except_handler'}
for(var child of node.handlers){child.$parent=p
mark_parents(child)}}}
function add_body(body,scopes){var res=''
for(var item of body){js=$B.js_from_ast(item,scopes)
if(js.length > 0){res+=js+'\n'}}
return res.trimRight()}
function extract_docstring(ast_obj,scopes){
var js='_b_.None' 
if(ast_obj.body.length &&
ast_obj.body[0]instanceof $B.ast.Expr &&
ast_obj.body[0].value instanceof $B.ast.Constant){
var value=ast_obj.body[0].value.value
if(typeof value=='string'){js=ast_obj.body[0].value.to_js(scopes)
ast_obj.body.shift()}}
return js}
function init_comprehension(comp,scopes){if(comp.type=='genexpr'){return init_genexpr(comp,scopes)}
return `var next_func_${comp.id} = $B.make_js_iterator(expr, frame, ${comp.ast.lineno})\n`}
function init_genexpr(comp,scopes){var comp_id=comp.type+'_'+comp.id,varnames=Object.keys(comp.varnames ||{}).map(x=> `'${x}'`).join(', ')
return `var ${comp.locals_name} = {},\n`+
`locals = ${comp.locals_name}\n`+
`locals['.0'] = expr\n`+
`var frame = ["<${comp.type.toLowerCase()}>", ${comp.locals_name}, `+
`"${comp.module_name}", ${comp.globals_name}]\n`+
`frame.$has_generators = true\n`+
`frame.__file__ = '${scopes.filename}'\n`+
`frame.$lineno = ${comp.ast.lineno}\n`+
`frame.f_code = {\n`+
`co_argcount: 1,\n`+
`co_firstlineno:${comp.ast.lineno},\n`+
`co_name: "<${comp.type.toLowerCase()}>",\n`+
`co_filename: "${scopes.filename}",\n`+
`co_flags: ${comp.type == 'genexpr' ? 115 : 83},\n`+
`co_freevars: $B.fast_tuple([]),\n`+
`co_kwonlyargcount: 0,\n`+
`co_posonlyargount: 0,\n`+
`co_qualname: "<${comp.type.toLowerCase()}>",\n`+
`co_varnames: $B.fast_tuple(['.0', ${varnames}])\n`+
`}\n`+
`var next_func_${comp.id} = $B.make_js_iterator(expr, frame, ${comp.ast.lineno})\n`+
`frame.$f_trace = _b_.None\n`+
`var _frame_obj = $B.frame_obj\n`}
function make_comp(scopes){
var id=$B.UUID(),type=this.constructor.$name,symtable_block=scopes.symtable.table.blocks.get(fast_id(this)),varnames=symtable_block.varnames.map(x=> `"${x}"`),comp_iter,comp_scope=$B.last(scopes)
for(var symbol of _b_.dict.$iter_items_with_hash(symtable_block.symbols)){if(symbol.value & DEF_COMP_ITER){comp_iter=symbol.key}}
var comp_iter_scope=name_scope(comp_iter,scopes)
var first_for=this.generators[0],
outmost_expr=$B.js_from_ast(first_for.iter,scopes),nb_paren=1
var comp={ast:this,id,type,varnames,module_name:scopes[0].name,locals_name:make_scope_name(scopes),globals_name:make_scope_name(scopes,scopes[0])}
var js=init_comprehension(comp,scopes)
if(comp_iter_scope.found){js+=`var save_comp_iter = ${name_reference(comp_iter, scopes)}\n`}
if(this instanceof $B.ast.ListComp){js+=`var result_${id} = []\n`}else if(this instanceof $B.ast.SetComp){js+=`var result_${id} = _b_.set.$factory()\n`}else if(this instanceof $B.ast.DictComp){js+=`var result_${id} = $B.empty_dict()\n`}
var first=this.generators[0]
js+=`try{\n`+
`for(var next_${id} of next_func_${id}){\n`
var name=new $B.ast.Name(`next_${id}`,new $B.ast.Load())
copy_position(name,first_for.iter)
name.to_js=function(){return `next_${id}`}
var assign=new $B.ast.Assign([first.target],name)
assign.lineno=this.lineno
js+=assign.to_js(scopes)+'\n'
for(var _if of first.ifs){nb_paren++
js+=`if($B.$bool(${$B.js_from_ast(_if, scopes)})){\n`}
for(var comprehension of this.generators.slice(1)){js+=comprehension.to_js(scopes)
nb_paren++
for(var _if of comprehension.ifs){nb_paren++}}
if(this instanceof $B.ast.DictComp){var key=$B.js_from_ast(this.key,scopes),value=$B.js_from_ast(this.value,scopes)}else{var elt=$B.js_from_ast(this.elt,scopes)}
var has_await=comp_scope.has_await
js=`(${has_await ? 'async ' : ''}function(expr){\n`+js
js+=has_await ? 'var save_frame_obj = $B.frame_obj;\n' :''
if(this instanceof $B.ast.ListComp){js+=`result_${id}.push(${elt})\n`}else if(this instanceof $B.ast.SetComp){js+=`_b_.set.add(result_${id}, ${elt})\n`}else if(this instanceof $B.ast.DictComp){js+=`_b_.dict.$setitem(result_${id}, ${key}, ${value})\n`}
for(var i=0;i < nb_paren;i++){js+='}\n'}
js+=`}catch(err){\n`+
(has_await ? '$B.restore_frame_obj(save_frame_obj, locals)\n' :'')+
`$B.set_exc(err, frame)\n`+
`throw err\n}\n`+
(has_await ? '\n$B.restore_frame_obj(save_frame_obj, locals);' :'')
if(comp_iter_scope.found){js+=`${name_reference(comp_iter, scopes)} = save_comp_iter\n`}else{js+=`delete locals.${comp_iter}\n`}
js+=`return result_${id}\n`+
`}\n`+
`)(${outmost_expr})\n`
return js}
var exec_num={value:0}
function init_scopes(type,scopes){
var filename=scopes.symtable.table.filename,name=$B.url2name[filename]
if(name){name=name.replace(/-/g,'_')}else if(filename.startsWith('<')&& filename.endsWith('>')){name='exec'}else{name=filename.replace(/\./g,'_')}
var top_scope=new Scope(name,`${type}`,this),block=scopes.symtable.table.blocks.get(fast_id(this))
if(block && block.$has_import_star){top_scope.has_import_star=true}
scopes.push(top_scope)
var namespaces=scopes.namespaces
if(namespaces){top_scope.is_exec_scope=true
for(var key in namespaces.exec_globals){if(! key.startsWith('$')){top_scope.globals.add(key)}}
if(namespaces.exec_locals !==namespaces.exec_globals){for(var key in namespaces.exec_locals){if(! key.startsWith('$')){top_scope.locals.add(key)}}}}
return name}
function compiler_check(obj){var check_func=Object.getPrototypeOf(obj)._check
if(check_func){obj._check()}}
$B.ast.Assert.prototype.to_js=function(scopes){var test=$B.js_from_ast(this.test,scopes),msg=this.msg ? $B.js_from_ast(this.msg,scopes):''
return `if($B.set_lineno(frame, ${this.lineno}) && !$B.$bool(${test})){\n`+
`throw _b_.AssertionError.$factory(${msg})}\n`}
var CO_FUTURE_ANNOTATIONS=0x1000000
function annotation_to_str(obj){var s
if(obj instanceof $B.ast.Name){s=obj.id}else if(obj instanceof $B.ast.BinOp){s=annotation_to_str(obj.left)+'|'+annotation_to_str(obj.right)}else if(obj instanceof $B.ast.Subscript){s=annotation_to_str(obj.value)+'['+
annotation_to_str(obj.slice)+']'}else if(obj instanceof $B.ast.Constant){if(obj.value===_b_.None){s='None'}else{console.log('other constant',obj)}}else{console.log('other annotation',obj)}
return s}
$B.ast.AnnAssign.prototype.to_js=function(scopes){var postpone_annotation=scopes.symtable.table.future.features &
CO_FUTURE_ANNOTATIONS
var scope=last_scope(scopes)
var js=''
if(! scope.has_annotation){js+='locals.__annotations__ = locals.__annotations__ || $B.empty_dict()\n'
scope.has_annotation=true
scope.locals.add('__annotations__')}
if(this.target instanceof $B.ast.Name){var ann_value=postpone_annotation ?
`'${annotation_to_str(this.annotation)}'` :
$B.js_from_ast(this.annotation,scopes)}
if(this.value){js+=`var ann = ${$B.js_from_ast(this.value, scopes)}\n`
if(this.target instanceof $B.ast.Name && this.simple){var scope=bind(this.target.id,scopes),mangled=mangle(scopes,scope,this.target.id)
if(scope.type !="def"){
js+=`$B.$setitem(locals.__annotations__, `+
`'${mangled}', ${ann_value})\n`}
var target_ref=name_reference(this.target.id,scopes)
js+=`${target_ref} = ann`}else if(this.target instanceof $B.ast.Attribute){js+=`$B.$setattr(${$B.js_from_ast(this.target.value, scopes)}`+
`, "${this.target.attr}", ann)`}else if(this.target instanceof $B.ast.Subscript){js+=`$B.$setitem(${$B.js_from_ast(this.target.value, scopes)}`+
`, ${$B.js_from_ast(this.target.slice, scopes)}, ann)`}}else{if(this.target instanceof $B.ast.Name){if(this.simple && scope.type !='def'){var mangled=mangle(scopes,scope,this.target.id)
var ann=`'${this.annotation.id}'`
js+=`$B.$setitem(locals.__annotations__, `+
`'${mangled}', ${ann_value})`}}else{var ann=$B.js_from_ast(this.annotation,scopes)}}
return `$B.set_lineno(frame, ${this.lineno})\n`+js}
$B.ast.Assign.prototype.to_js=function(scopes){compiler_check(this)
var js=this.lineno ? `$B.set_lineno(frame, ${this.lineno})\n` :'',value=$B.js_from_ast(this.value,scopes)
function assign_one(target,value){if(target instanceof $B.ast.Name){return $B.js_from_ast(target,scopes)+' = '+value}else if(target instanceof $B.ast.Starred){return assign_one(target.value,value)}else if(target instanceof $B.ast.Subscript){return `$B.$setitem(${$B.js_from_ast(target.value, scopes)}`+
`, ${$B.js_from_ast(target.slice, scopes)}, ${value})`}else if(target instanceof $B.ast.Attribute){var attr=mangle(scopes,last_scope(scopes),target.attr)
return `$B.$setattr(${$B.js_from_ast(target.value, scopes)}`+
`, "${attr}", ${value})`}}
function assign_many(target,value){var js=''
var nb_targets=target.elts.length,has_starred=false,nb_after_starred
for(var i=0,len=nb_targets;i < len;i++){if(target.elts[i]instanceof $B.ast.Starred){has_starred=true
nb_after_starred=len-i-1
break}}
var iter_id='it_'+$B.UUID()
js+=`var ${iter_id} = $B.unpacker(${value}, ${nb_targets}, `+
`${has_starred}`
if(nb_after_starred !==undefined){js+=`, ${nb_after_starred}`}
var position=encode_position(target.col_offset,target.col_offset,target.end_col_offset)
js+=`, ${position})\n`
var assigns=[]
for(var elt of target.elts){if(elt instanceof $B.ast.Starred){assigns.push(assign_one(elt,`${iter_id}.read_rest()`))}else if(elt instanceof $B.ast.List ||
elt instanceof $B.ast.Tuple){assigns.push(assign_many(elt,`${iter_id}.read_one()`))}else{assigns.push(assign_one(elt,`${iter_id}.read_one()`))}}
js+=assigns.join('\n')
return js}
var value_id='v'+$B.UUID()
js+=`var ${value_id} = ${value}\n`
var assigns=[]
for(var target of this.targets){if(!(target instanceof $B.ast.Tuple)&&
!(target instanceof $B.ast.List)){assigns.push(assign_one(target,value_id))}else{assigns.push(assign_many(target,value_id))}}
js+=assigns.join('\n')
return js}
$B.ast.AsyncFor.prototype.to_js=function(scopes){if(!(last_scope(scopes).ast instanceof $B.ast.AsyncFunctionDef)){compiler_error(this,"'async for' outside async function")}
return $B.ast.For.prototype.to_js.bind(this)(scopes)}
$B.ast.AsyncFunctionDef.prototype.to_js=function(scopes){return $B.ast.FunctionDef.prototype.to_js.bind(this)(scopes)}
$B.ast.AsyncWith.prototype.to_js=function(scopes){
if(!(last_scope(scopes).ast instanceof $B.ast.AsyncFunctionDef)){compiler_error(this,"'async with' outside async function")}
function bind_vars(vars,scopes){if(vars instanceof $B.ast.Name){bind(vars.id,scopes)}else if(vars instanceof $B.ast.Tuple){for(var var_item of vars.elts){bind_vars(var_item,scopes)}}}
function add_item(item,js){var id=$B.UUID()
var s=`var mgr_${id} = `+
$B.js_from_ast(item.context_expr,scopes)+',\n'+
`mgr_type_${id} = _b_.type.$factory(mgr_${id}),\n`+
`aexit_${id} = $B.$getattr(mgr_type_${id}, '__aexit__'),\n`+
`aenter_${id} = $B.$getattr(mgr_type_${id}, '__aenter__'),\n`+
`value_${id} = await $B.promise($B.$call(aenter_${id})(mgr_${id})),\n`+
`exc_${id} = true\n`
if(has_generator){
s+=`locals.$context_managers = locals.$context_managers || []\n`+
`locals.$context_managers.push(mgr_${id})\n`}
s+='try{\ntry{\n'
if(item.optional_vars){
var value={to_js:function(){return `value_${id}`}}
copy_position(value,_with)
var assign=new $B.ast.Assign([item.optional_vars],value)
copy_position(assign,_with)
s+=assign.to_js(scopes)+'\n'}
s+=js
s+=`}catch(err_${id}){\n`+
`frame.$lineno = ${lineno}\n`+
`exc_${id} = false\n`+
`err_${id} = $B.exception(err_${id}, frame)\n`+
`var $b = await $B.promise(aexit_${id}(mgr_${id}, err_${id}.__class__, `+
`err_${id}, $B.$getattr(err_${id}, '__traceback__')))\n`+
`if(! $B.$bool($b)){\nthrow err_${id}\n}\n}\n`
s+=`}\nfinally{\n`+
`frame.$lineno = ${lineno}\n`+
`if(exc_${id}){\n`+
`await $B.promise(aexit_${id}(mgr_${id}, _b_.None, _b_.None, _b_.None))\n}\n}\n`
return s}
var _with=this,scope=last_scope(scopes),lineno=this.lineno
delete scope.is_generator
for(var item of this.items.slice().reverse()){if(item.optional_vars){bind_vars(item.optional_vars,scopes)}}
js=add_body(this.body,scopes)+'\n'
var has_generator=scope.is_generator
for(var item of this.items.slice().reverse()){js=add_item(item,js)}
return `$B.set_lineno(frame, ${this.lineno})\n`+js}
$B.ast.Attribute.prototype.to_js=function(scopes){var attr=mangle(scopes,last_scope(scopes),this.attr)
if(this.value instanceof $B.ast.Name && this.value.id=='axw'){return `${$B.js_from_ast(this.value, scopes)}.${attr}`}
var position=encode_position(this.value.col_offset,this.value.col_offset,this.end_col_offset)
return `$B.$getattr_pep657(${$B.js_from_ast(this.value, scopes)}, `+
`'${attr}', ${position})`}
$B.ast.AugAssign.prototype.to_js=function(scopes){var js,op_class=this.op.$name ? this.op :this.op.constructor
for(var op in $B.op2ast_class){if($B.op2ast_class[op][1]===op_class){var iop=op+'='
break}}
var value=$B.js_from_ast(this.value,scopes)
if(this.target instanceof $B.ast.Name){var scope=name_scope(this.target.id,scopes)
if(! scope.found){
var left_scope=scope.resolve=='global' ?
make_scope_name(scopes,scopes[0]):'locals'
return `${left_scope}.${this.target.id} = $B.augm_assign(`+
make_ref(this.target.id,scopes,scope)+`, '${iop}', ${value})`}else{var ref=`${make_scope_name(scopes, scope.found)}.${this.target.id}`
js=`${ref} = $B.augm_assign(${ref}, '${iop}', ${value})`}}else if(this.target instanceof $B.ast.Subscript){var op=opclass2dunder[this.op.constructor.$name]
js=`$B.$setitem((locals.$tg = ${this.target.value.to_js(scopes)}), `+
`(locals.$key = ${this.target.slice.to_js(scopes)}), `+
`$B.augm_assign($B.$getitem(locals.$tg, locals.$key), '${iop}', ${value}))`}else if(this.target instanceof $B.ast.Attribute){var op=opclass2dunder[this.op.constructor.$name],mangled=mangle(scopes,last_scope(scopes),this.target.attr)
js=`$B.$setattr((locals.$tg = ${this.target.value.to_js(scopes)}), `+
`'${mangled}', $B.augm_assign(`+
`$B.$getattr(locals.$tg, '${mangled}'), '${iop}', ${value}))`}else{var target=$B.js_from_ast(this.target,scopes),value=$B.js_from_ast(this.value,scopes)
js=`${target} = $B.augm_assign(${target}, '${iop}', ${value})`}
return `$B.set_lineno(frame, ${this.lineno})\n`+js}
$B.ast.Await.prototype.to_js=function(scopes){var ix=scopes.length-1
while(scopes[ix].parent){ix--}
while(scopes[ix].ast instanceof $B.ast.ListComp ||
scopes[ix].ast instanceof $B.ast.DictComp ||
scopes[ix].ast instanceof $B.ast.SetComp ||
scopes[ix].ast instanceof $B.ast.GeneratorExp){scopes[ix].has_await=true
ix--}
if(scopes[ix].ast instanceof $B.ast.AsyncFunctionDef){scopes[ix].has_await=true
return `await $B.promise(${$B.js_from_ast(this.value, scopes)})`}else if(scopes[ix].ast instanceof $B.ast.FunctionDef){compiler_error(this,"'await' outside async function",this.value)}else{compiler_error(this,"'await' outside function",this.value)}}
$B.ast.BinOp.prototype.to_js=function(scopes){
var name=this.op.$name ? this.op.$name :this.op.constructor.$name
var op=opclass2dunder[name]
var res=`$B.rich_op('${op}', ${$B.js_from_ast(this.left, scopes)}, `+
`${$B.js_from_ast(this.right, scopes)}`
var position=encode_position(this.left.col_offset,this.col_offset,this.end_col_offset,this.right.end_col_offset)
return res+`, ${position})`}
$B.ast.BoolOp.prototype.to_js=function(scopes){
var op=this.op instanceof $B.ast.And ? '! ' :''
var tests=[]
for(var i=0,len=this.values.length;i < len;i++){var value=this.values[i]
if(i < len-1){tests.push(`${op}$B.$bool(locals.$test = `+
`${$B.js_from_ast(value, scopes)}) ? locals.$test : `)}else{tests.push(`${$B.js_from_ast(value, scopes)}`)}}
return '('+tests.join('')+')'}
function in_loop(scopes){for(var scope of scopes.slice().reverse()){if(scope.ast instanceof $B.ast.For ||
scope.ast instanceof $B.ast.While){return true}}
return false}
$B.ast.Break.prototype.to_js=function(scopes){if(! in_loop(scopes)){compiler_error(this,"'break' outside loop")}
var js=''
for(var scope of scopes.slice().reverse()){if(scope.ast instanceof $B.ast.For ||
scope.ast instanceof $B.ast.While){js+=`no_break_${scope.id} = false\n`
break}}
js+=`break`
return js}
$B.ast.Call.prototype.to_js=function(scopes){var func=$B.js_from_ast(this.func,scopes),js=`$B.$call(${func}`
if(this.end_lineno==this.lineno){var position=encode_position(this.col_offset,this.col_offset,this.end_col_offset)
js+=`, ${position}`}
js+=')'
var args=make_args.bind(this)(scopes)
return js+(args.has_starred ? `.apply(null, ${args.js})` :
`(${args.js})`)}
function make_args(scopes){var js='',named_args=[],named_kwargs=[],starred_kwargs=[],has_starred=false
for(var arg of this.args){if(arg instanceof $B.ast.Starred){arg.$handled=true
has_starred=true}else{named_args.push($B.js_from_ast(arg,scopes))}}
var kwds=new Set()
for(var keyword of this.keywords){if(keyword.arg){if(kwds.has(keyword.arg)){compiler_error(keyword,`keyword argument repeated: ${keyword.arg}`)}
kwds.add(keyword.arg)
named_kwargs.push(
`${keyword.arg}: ${$B.js_from_ast(keyword.value, scopes)}`)}else{starred_kwargs.push($B.js_from_ast(keyword.value,scopes))}}
var args=''
named_args=named_args.join(', ')
if(! has_starred){args+=`${named_args}`}else{var start=true,not_starred=[]
for(var arg of this.args){if(arg instanceof $B.ast.Starred){if(not_starred.length > 0){var arg_list=not_starred.map(x=> $B.js_from_ast(x,scopes))
if(start){args+=`[${arg_list.join(', ')}]`}else{args+=`.concat([${arg_list.join(', ')}])`}
not_starred=[]}else if(args==''){args='[]'}
var starred_arg=$B.js_from_ast(arg.value,scopes)
args+=`.concat(_b_.list.$factory(${starred_arg}))`
start=false}else{not_starred.push(arg)}}
if(not_starred.length > 0){var arg_list=not_starred.map(x=> $B.js_from_ast(x,scopes))
if(start){args+=`[${arg_list.join(', ')}]`
start=false}else{args+=`.concat([${arg_list.join(', ')}])`}}
if(args[0]=='.'){console.log('bizarre',args)}}
if(named_kwargs.length+starred_kwargs.length==0){return{has_starred,js:js+`${args}`}}else{var kw=`{${named_kwargs.join(', ')}}`
for(var starred_kwarg of starred_kwargs){kw+=`, ${starred_kwarg}`}
kw=`{$kw:[${kw}]}`
if(args.length > 0){if(has_starred){kw=`.concat([${kw}])`}else{kw=', '+kw}}
return{has_starred,js:js+`${args}${kw}`}}}
$B.ast.ClassDef.prototype.to_js=function(scopes){var enclosing_scope=bind(this.name,scopes)
var class_scope=new Scope(this.name,'class',this)
var js='',locals_name=make_scope_name(scopes,class_scope),ref=this.name+$B.UUID(),glob=scopes[0].name,globals_name=make_scope_name(scopes,scopes[0]),decorators=[],decorated=false
for(var dec of this.decorator_list){decorated=true
var dec_id='decorator'+$B.UUID()
decorators.push(dec_id)
js+=`$B.set_lineno(frame, ${dec.lineno})\n`+
`var ${dec_id} = ${$B.js_from_ast(dec, scopes)}\n`}
js+=`$B.set_lineno(frame, ${this.lineno})\n`
var qualname=this.name
var ix=scopes.length-1
while(ix >=0){if(scopes[ix].parent){ix--}else if(scopes[ix].ast instanceof $B.ast.ClassDef){qualname=scopes[ix].name+'.'+qualname
ix--}else{break}}
var keywords=[],metaclass
for(var keyword of this.keywords){if(keyword.arg=='metaclass'){metaclass=keyword.value}
keywords.push(`["${keyword.arg}", `+
$B.js_from_ast(keyword.value,scopes)+']')}
var bases=this.bases.map(x=> $B.js_from_ast(x,scopes))
var has_type_params=this.type_params.length > 0
if(has_type_params){js+=`$B.$import('typing')\n`+
`var typing = $B.imported.typing\n`
var params=[]
for(var item of this.type_params){if(item instanceof $B.ast.TypeVar){params.push(`$B.$call(typing.TypeVar)('${item.name}')`)}else if(item instanceof $B.ast.TypeVarTuple){params.push(`$B.$call($B.$getattr(typing.Unpack, '__getitem__'))($B.$call(typing.TypeVarTuple)('${item.name.id}'))`)}else if(item instanceof $B.ast.ParamSpec){params.push(`$B.$call(typing.ParamSpec)('${item.name.id}')`)}}
bases.push(`typing.Generic.__class_getitem__(typing.Generic,`+
` $B.fast_tuple([${params}]))`)
for(var item of this.type_params){var name,param_type=item.constructor.$name
if(param_type=='TypeVar'){name=item.name}else{name=item.name.id}
js+=`locals.${name} = $B.$call(typing.${param_type})('${name}')\n`}}
var docstring=extract_docstring(this,scopes)
js+=`var ${ref} = (function(name, module, bases){\n`+
`var _frame_obj = $B.frame_obj,\n`+
`resolved_bases = $B.resolve_mro_entries(bases),\n`+
`metaclass = $B.get_metaclass(name, module, `+
`resolved_bases`
if(metaclass){js+=`, ${metaclass.to_js(scopes)}`}
js+=')\n'
js+=`var ${locals_name} = $B.make_class_namespace(metaclass, `+
`name, module ,"${qualname}", resolved_bases),\n`
js+=`locals = ${locals_name}\n`+
`if(resolved_bases !== bases){\nlocals.__orig_bases__ = bases}\n`+
`locals.__doc__ = ${docstring}\n`+
`var frame = [name, locals, module, ${globals_name}]\n`+
`frame.__file__ = '${scopes.filename}'\n`+
`frame.$lineno = ${this.lineno}\n`+
`frame.$f_trace = $B.enter_frame(frame)\n`+
`var _frame_obj = $B.frame_obj\n`
if(trace){js+=`if(frame.$f_trace !== _b_.None){\n$B.trace_line()}\n`}
scopes.push(class_scope)
js+=add_body(this.body,scopes)
scopes.pop()
var keywords=[]
for(var keyword of this.keywords){keywords.push(`["${keyword.arg}", `+
$B.js_from_ast(keyword.value,scopes)+']')}
if(trace){js+='\nif(frame.$f_trace !== _b_.None){\n'+
'$B.trace_return(_b_.None)\n'+
'}'}
js+='\n$B.leave_frame()\n'+
`return $B.$class_constructor('${this.name}', locals, metaclass, `+
`resolved_bases, bases, [${keywords.join(', ')}])\n`+
`})('${this.name}', '${glob}', $B.fast_tuple([${bases}]))\n`
var class_ref=reference(scopes,enclosing_scope,this.name)
if(decorated){class_ref=`decorated${$B.UUID()}`
js+='var '}
var bases=this.bases.map(x=> $B.js_from_ast(x,scopes))
js+=`${class_ref} = ${ref}\n`
if(decorated){js+=reference(scopes,enclosing_scope,this.name)+' = '
var decorate=class_ref
for(var dec of decorators.reverse()){decorate=`$B.$call(${dec})(${decorate})`}
js+=decorate+'\n'}
return js}
$B.ast.Compare.prototype.to_js=function(scopes){var left=$B.js_from_ast(this.left,scopes),comps=[]
var len=this.ops.length,prefix=len > 1 ? 'locals.$op = ' :''
for(var i=0;i < len;i++){var name=this.ops[i].$name ? this.ops[i].$name :this.ops[i].constructor.$name,op=opclass2dunder[name],right=this.comparators[i]
if(op===undefined){console.log('op undefined',this.ops[i])
alert()}
if(this.ops[i]instanceof $B.ast.In){comps.push(`$B.$is_member(${left}, `+
`${prefix}${$B.js_from_ast(right, scopes)})`)}else if(this.ops[i]instanceof $B.ast.NotIn){comps.push(`! $B.$is_member(${left}, `+
`${prefix}${$B.js_from_ast(right, scopes)})`)}else if(this.ops[i]instanceof $B.ast.Is){comps.push(`$B.$is(${left}, `+
`${prefix}${$B.js_from_ast(right, scopes)})`)}else if(this.ops[i]instanceof $B.ast.IsNot){comps.push(`! $B.$is(${left}, `+
`${prefix}${$B.js_from_ast(right, scopes)})`)}else{comps.push(`$B.rich_comp('${op}', ${left}, `+
`${prefix}${$B.js_from_ast(right, scopes)})`)}
if(len > 1){left='locals.$op'}}
return comps.join(' && ')}
$B.ast.comprehension.prototype.to_js=function(scopes){var id=$B.UUID(),iter=$B.js_from_ast(this.iter,scopes)
var js=`var next_func_${id} = $B.make_js_iterator(${iter}, frame, ${this.lineno})\n`+
`for(var next_${id} of next_func_${id}){\n`
var name=new $B.ast.Name(`next_${id}`,new $B.ast.Load())
copy_position(name,this.target)
name.to_js=function(){return `next_${id}`}
var assign=new $B.ast.Assign([this.target],name)
copy_position(assign,this.target)
js+=assign.to_js(scopes)+' // assign to target\n'
for(var _if of this.ifs){js+=`if($B.$bool(${$B.js_from_ast(_if, scopes)})){\n`}
return js}
$B.ast.Constant.prototype.to_js=function(scopes){if(this.value===true ||this.value===false){return this.value+''}else if(this.value===_b_.None){return '_b_.None'}else if(typeof this.value=="string"){var s=this.value,srg=$B.surrogates(s)
if(srg.length==0){return `'${s}'`}
return `$B.make_String('${s}', [${srg}])`}else if(this.value.__class__===_b_.bytes){return `_b_.bytes.$factory([${this.value.source}])`}else if(typeof this.value=="number"){return this.value}else if(this.value.__class__===$B.long_int){return `$B.fast_long_int(${this.value.value}n)`}else if(this.value.__class__===_b_.float){return `({__class__: _b_.float, value: ${this.value.value}})`}else if(this.value.__class__===_b_.complex){return `$B.make_complex(${this.value.$real.value}, ${this.value.$imag.value})`}else if(this.value===_b_.Ellipsis){return `_b_.Ellipsis`}else{console.log('invalid value',this.value)
throw SyntaxError('bad value',this.value)}}
$B.ast.Continue.prototype.to_js=function(scopes){if(! in_loop(scopes)){compiler_error(this,"'continue' not properly in loop")}
return 'continue'}
$B.ast.Delete.prototype.to_js=function(scopes){compiler_check(this)
var js=''
for(var target of this.targets){if(target instanceof $B.ast.Name){var scope=name_scope(target.id,scopes)
if(scope.found){scope.found.locals.delete(target.id)}
js+=`$B.$delete("${target.id}")\n`}else if(target instanceof $B.ast.Subscript){js+=`$B.$delitem(${$B.js_from_ast(target.value, scopes)}, `+
`${$B.js_from_ast(target.slice, scopes)})\n`}else if(target instanceof $B.ast.Attribute){js+=`_b_.delattr(${$B.js_from_ast(target.value, scopes)}, `+
`'${target.attr}')\n`}}
return `$B.set_lineno(frame, ${this.lineno})\n`+js}
$B.ast.Dict.prototype.to_js=function(scopes){var items=[],keys=this.keys,has_packed=false
function no_key(i){return keys[i]===_b_.None ||keys[i]===undefined}
for(var i=0,len=this.keys.length;i < len;i++){if(no_key(i)){
has_packed=true
items.push('_b_.list.$factory(_b_.dict.items('+
$B.js_from_ast(this.values[i],scopes)+'))')}else{var item=`[${$B.js_from_ast(this.keys[i], scopes)}, `+
`${$B.js_from_ast(this.values[i], scopes)}`
if(this.keys[i]instanceof $B.ast.Constant){var v=this.keys[i].value
if(typeof v=='string'){item+=', '+$B.$hash($B.string_from_ast_value(v))}else{try{var hash=$B.$hash(this.keys[i].value)
item+=`, ${hash}`}catch(err){}}}
items.push(item+']')}}
if(! has_packed){return `_b_.dict.$literal([${items}])`}
var first=no_key(0)? items[0]:`[${items[0]}]`,js='_b_.dict.$literal('+first
for(var i=1,len=items.length;i < len;i++){var arg=no_key(i)? items[i]:`[${items[i]}]`
js+=`.concat(${arg})`}
return js+')'}
$B.ast.DictComp.prototype.to_js=function(scopes){return make_comp.bind(this)(scopes)}
$B.ast.Expr.prototype.to_js=function(scopes){return `$B.set_lineno(frame, ${this.lineno});\n`+
$B.js_from_ast(this.value,scopes)}
$B.ast.Expression.prototype.to_js=function(scopes){init_scopes.bind(this)('expression',scopes)
return $B.js_from_ast(this.body,scopes)}
$B.ast.For.prototype.to_js=function(scopes){
var id=$B.UUID(),iter=$B.js_from_ast(this.iter,scopes),js=`frame.$lineno = ${this.lineno}\n`
var scope=$B.last(scopes),new_scope=copy_scope(scope,this,id)
scopes.push(new_scope)
if(this instanceof $B.ast.AsyncFor){js+=`var no_break_${id} = true,\n`+
`iter_${id} = ${iter},\n`+
`type_${id} = _b_.type.$factory(iter_${id})\n`+
`iter_${id} = $B.$call($B.$getattr(type_${id}, "__aiter__"))(iter_${id})\n`+
`type_${id} = _b_.type.$factory(iter_${id})\n`+
`var next_func_${id} = $B.$call(`+
`$B.$getattr(type_${id}, '__anext__'))\n`+
`while(true){\n`+
`  try{\n`+
`    var next_${id} = await $B.promise(next_func_${id}(iter_${id}))\n`+
`  }catch(err){\n`+
`    if($B.is_exc(err, [_b_.StopAsyncIteration])){\nbreak}\n`+
`    else{\nthrow err}\n`+
`  }\n`}else{js+=`var no_break_${id} = true,\n`+
`iterator_${id} = ${iter}\n`+
`for(var next_${id} of $B.make_js_iterator(iterator_${id}, frame, ${this.lineno})){\n`}
var name=new $B.ast.Name(`next_${id}`,new $B.ast.Load())
copy_position(name,this.iter)
name.to_js=function(){return `next_${id}`}
var assign=new $B.ast.Assign([this.target],name)
js+=assign.to_js(scopes)+'\n'
js+=add_body(this.body,scopes)
js+='\n}' 
scopes.pop()
if(this.orelse.length > 0){js+=`\nif(no_break_${id}){\n`+
add_body(this.orelse,scopes)+'}\n'}
return js}
$B.ast.FormattedValue.prototype.to_js=function(scopes){var value=$B.js_from_ast(this.value,scopes)
if(this.conversion==114){value=`_b_.repr(${value})`}else if(this.conversion==115){value=`_b_.str.$factory(${value})`}else if(this.conversion==97){value=`_b_.ascii(${value})`}
if(this.format_spec){value=`_b_.str.format('{0:' + `+
$B.js_from_ast(this.format_spec,scopes)+
` + '}', ${value})`}else if(this.conversion==-1){value=`_b_.str.$factory(${value})`}
return value}
function transform_args(scopes){
var has_posonlyargs=this.args.posonlyargs.length > 0,_defaults=[],nb_defaults=this.args.defaults.length,positional=this.args.posonlyargs.concat(this.args.args),ix=positional.length-nb_defaults,default_names=[],kw_defaults=[],annotations
for(var arg of positional.concat(this.args.kwonlyargs).concat(
[this.args.vararg,this.args.kwarg])){if(arg && arg.annotation){annotations=annotations ||{}
annotations[arg.arg]=arg.annotation}}
for(var i=ix;i < positional.length;i++){default_names.push(`${positional[i].arg}`)
_defaults.push(`${positional[i].arg}: `+
`${$B.js_from_ast(this.args.defaults[i - ix], scopes)}`)}
var ix=-1
for(var arg of this.args.kwonlyargs){ix++
if(this.args.kw_defaults[ix]===_b_.None){continue}
if(this.args.kw_defaults[ix]===undefined){_defaults.push(`${arg.arg}: _b_.None`)}else{var v=$B.js_from_ast(this.args.kw_defaults[ix],scopes)
_defaults.push(`${arg.arg}: `+v)
kw_defaults.push(`${arg.arg}: ${v}`)}}
var kw_default_names=[]
for(var kw of this.args.kwonlyargs){kw_default_names.push(`'${kw.arg}'`)}
return{default_names,_defaults,positional,has_posonlyargs,kw_defaults,kw_default_names,annotations}}
$B.ast.FunctionDef.prototype.to_js=function(scopes){var symtable_block=scopes.symtable.table.blocks.get(fast_id(this))
var in_class=last_scope(scopes).ast instanceof $B.ast.ClassDef,is_async=this instanceof $B.ast.AsyncFunctionDef
if(in_class){var class_scope=last_scope(scopes)}
var decorators=[],decorated=false,decs=''
for(var dec of this.decorator_list){decorated=true
var dec_id='decorator'+$B.UUID()
decorators.push(dec_id)
decs+=`$B.set_lineno(frame, ${dec.lineno})\n`
decs+=`var ${dec_id} = ${$B.js_from_ast(dec, scopes)} // decorator\n`}
var docstring=extract_docstring(this,scopes)
var parsed_args=transform_args.bind(this)(scopes),default_names=parsed_args.default_names,_defaults=parsed_args._defaults,positional=parsed_args.positional,has_posonlyargs=parsed_args.has_posonlyargs,kw_defaults=parsed_args.kw_defaults,kw_default_names=parsed_args.kw_default_names
var defaults=`$B.fast_tuple([${this.args.defaults.map(x => x.to_js(scopes))}])`,kw_defaults=kw_default_names.length==0 ? '_b_.None' :
`$B.obj_dict({${kw_defaults.join(', ')}})`
var func_scope=new Scope(this.name,'def',this)
scopes.push(func_scope)
var id=$B.UUID(),name1=this.name+'$'+id,name2=this.name+id
var has_type_params=this.type_params.length > 0,type_params=''
if(has_type_params){
var tp_name='type_params'
var type_params_scope=new Scope(tp_name,'type_params',this)
var type_params_ref=qualified_scope_name(scopes,type_params_scope)
var type_params=`$B.$import('typing')\n`+
`var typing = $B.imported.typing\n`
var name=this.type_params[0].name
for(var item of this.type_params){var name,param_type=item.constructor.$name
if(param_type=='TypeVar'){name=item.name}else{name=item.name.id}
bind(name,scopes)
type_params+=`locals_${type_params_ref}.${name} = `+
`$B.$call(typing.${param_type})('${name}')\n`}}
var args=positional.concat(this.args.kwonlyargs),slots=[],arg_names=[]
for(var arg of args){slots.push(arg.arg+': null')
bind(arg.arg,scopes)}
for(var arg of this.args.posonlyargs){arg_names.push(`'${arg.arg}'`)}
for(var arg of this.args.args.concat(this.args.kwonlyargs)){arg_names.push(`'${arg.arg}'`)}
if(this.args.vararg){bind(this.args.vararg.arg,scopes)}
if(this.args.kwarg){bind(this.args.kwarg.arg,scopes)}
if(this.$is_lambda){var _return=new $B.ast.Return(this.body)
copy_position(_return,this.body)
var body=[_return],function_body=add_body(body,scopes)}else{var function_body=add_body(this.body,scopes)}
var is_generator=symtable_block.generator
var parse_args=[name2]
var js=decs+
`$B.set_lineno(frame, ${this.lineno})\n`
if(is_async && ! is_generator){js+='async '}
js+=`function ${name2}(){\n`
var locals_name=make_scope_name(scopes,func_scope),gname=scopes[0].name,globals_name=make_scope_name(scopes,scopes[0])
js+=`var ${locals_name},
               locals\n`
parse_args.push('arguments')
var args_vararg=this.args.vararg===undefined ? 'null' :
"'"+this.args.vararg.arg+"'",args_kwarg=this.args.kwarg===undefined ? 'null':
"'"+this.args.kwarg.arg+"'"
if(positional.length==0 && slots.length==0 &&
this.args.vararg===undefined &&
this.args.kwarg===undefined){js+=`${locals_name} = locals = arguments.length == 0 ? {} : $B.args0(${parse_args.join(', ')})\n`}else{js+=`${locals_name} = locals = $B.args0(${parse_args.join(', ')})\n`}
js+=`var frame = ["${this.$is_lambda ? '<lambda>': this.name}", `+
`locals, "${gname}", ${globals_name}, ${name2}]
    if(locals.$has_generators){
        frame.$has_generators = true
    }
    frame.__file__ = '${scopes.filename}'
    frame.$lineno = ${this.lineno}
    frame.$f_trace = $B.enter_frame(frame)\n`
if(func_scope.needs_stack_length){js+=`var stack_length = $B.count_frames()\n`}
if(func_scope.needs_frames ||is_async){js+=`var _frame_obj = $B.frame_obj\n`+
`_linenums = $B.make_linenums()\n`}
if(is_async){js+='frame.$async = true\n'}
if(is_generator){js+=`locals.$is_generator = true\n`
if(is_async){js+=`var gen_${id} = $B.async_generator.$factory(async function*(){\n`}else{js+=`var gen_${id} = $B.generator.$factory(function*(){\n`}}
js+=`try{\n$B.js_this = this\n`
if(in_class){
var ix=scopes.indexOf(class_scope),parent=scopes[ix-1]
var scope_ref=make_scope_name(scopes,parent),class_ref=class_scope.name,
refs=class_ref.split('.').map(x=> `'${x}'`)
bind("__class__",scopes)
js+=`locals.__class__ =  `+
`$B.get_method_class(${name2}, ${scope_ref}, "${class_ref}", [${refs}])\n`}
js+=function_body+'\n'
if((! this.$is_lambda)&& !($B.last(this.body)instanceof $B.ast.Return)){
js+='var result = _b_.None\n'
if(trace){js+='if(frame.$f_trace !== _b_.None){\n'+
'$B.trace_return(_b_.None)\n}\n'}
js+='$B.leave_frame()\n'+
'return result\n'}
js+=`}catch(err){
    $B.set_exc(err, frame)\n`
if(func_scope.needs_frames){
js+=`err.$frame_obj = _frame_obj\n`+
`_linenums[_linenums.length - 1] = frame.$lineno\n`+
`err.$linenums = _linenums\n`}
if(trace){js+=`if((! err.$in_trace_func) && frame.$f_trace !== _b_.None){
        frame.$f_trace = $B.trace_exception()
        }\n`}
js+=`$B.leave_frame();throw err
    }
    }\n`
if(is_generator){js+=`, '${this.name}')\n`+
`var _gen_${id} = gen_${id}()\n`+
`_gen_${id}.$frame = frame\n`+
`$B.leave_frame()\n`+
`return _gen_${id}}\n` }
scopes.pop()
var func_name_scope=bind(this.name,scopes),in_class=func_name_scope.ast instanceof $B.ast.ClassDef
var qualname=in_class ? `${func_name_scope.name}.${this.name}` :
this.name
var flags=3
if(this.args.vararg){flags |=4}
if(this.args.kwarg){flags |=8}
if(is_generator){flags |=32}
if(is_async){flags |=128}
var parameters=[],locals=[],identifiers=_b_.dict.$keys_string(symtable_block.symbols)
var free_vars=[]
for(var ident of identifiers){var flag=_b_.dict.$getitem_string(symtable_block.symbols,ident),_scope=(flag >> SCOPE_OFF)& SCOPE_MASK
if(_scope==FREE){free_vars.push(`'${ident}'`)}
if(flag & DEF_PARAM){parameters.push(`'${ident}'`)}else if(flag & DEF_LOCAL){locals.push(`'${ident}'`)}}
var varnames=parameters.concat(locals)
js+=`${name2}.$is_func = true\n`
if(in_class){js+=`${name2}.$is_method = true\n`}
if(is_async){js+=`${name2}.$is_async = true\n`}
js+=`${name2}.$infos = {\n`+
`__module__: "${gname}",\n`+
`__name__: "${this.$is_lambda ? '<lambda>' : this.name}",\n`+
`__qualname__: "${this.$is_lambda ? '<lambda>' : qualname}",\n`+
`__defaults__: ${defaults},\n`+
`__globals__: _b_.globals(),\n`+
`__kwdefaults__: ${kw_defaults},\n`+
`__doc__: ${docstring},\n`+
`__code__:{\n`+
`co_argcount: ${positional.length},\n `+
`co_filename: '${scopes.filename}',\n`+
`co_firstlineno: ${this.lineno},\n`+
`co_flags: ${flags},\n`+
`co_freevars: $B.fast_tuple([${free_vars}]),\n`+
`co_kwonlyargcount: ${this.args.kwonlyargs.length},\n`+
`co_name: '${this.$is_lambda ? '<lambda>': this.name}',\n`+
`co_nlocals: ${varnames.length},\n`+
`co_posonlyargcount: ${this.args.posonlyargs.length},\n`+
`co_qualname: '${this.$is_lambda ? '<lambda>': qualname}',\n`+
`co_varnames: $B.fast_tuple([${varnames}])\n`+
`},\n`+
`arg_names: [${arg_names}],\n`+
`vararg: ${args_vararg},\n`+
`kwarg: ${args_kwarg}\n`+
`}\n`
if(is_async && ! is_generator){js+=`${name2} = $B.make_async(${name2})\n`}
js+=`$B.make_function_defaults(${name2})\n`
var mangled=mangle(scopes,func_name_scope,this.name),func_ref=`${make_scope_name(scopes, func_name_scope)}.${mangled}`
if(decorated){func_ref=`decorated${$B.UUID()}`
js+='var '}
js+=`${func_ref} = ${name2}\n`
if(this.returns ||parsed_args.annotations){if(has_type_params){scopes.push(type_params_scope)
type_params_scope.name=this.name+'_'+type_params_scope.name}
var ann_items=[]
if(this.returns){ann_items.push(`['return', ${this.returns.to_js(scopes)}]`)}
if(parsed_args.annotations){for(var arg_ann in parsed_args.annotations){var value=parsed_args.annotations[arg_ann].to_js(scopes)
if(in_class){arg_ann=mangle(scopes,class_scope,arg_ann)}
ann_items.push(`['${arg_ann}', ${value}]`)}}
if(has_type_params){scopes.pop()}
js+=`${func_ref}.__annotations__ = _b_.dict.$factory([${ann_items.join(', ')}])\n`}else{js+=`${func_ref}.__annotations__ = $B.empty_dict()\n`}
if(decorated){js+=`${make_scope_name(scopes, func_name_scope)}.${mangled} = `
var decorate=func_ref
for(var dec of decorators.reverse()){decorate=`$B.$call(${dec})(${decorate})`}
js+=decorate}
if(has_type_params){js=`var locals_${type_params_ref} = {\n}\n`+type_params+js}
return js}
$B.ast.GeneratorExp.prototype.to_js=function(scopes){var id=$B.UUID(),symtable_block=scopes.symtable.table.blocks.get(fast_id(this)),varnames=symtable_block.varnames.map(x=> `"${x}"`)
var expr=this.elt,first_for=this.generators[0],
outmost_expr=$B.js_from_ast(first_for.iter,scopes),nb_paren=1
var comp_scope=new Scope(`genexpr_${id}`,'comprehension',this)
scopes.push(comp_scope)
var comp={ast:this,id,type:'genexpr',varnames,module_name:scopes[0].name,locals_name:make_scope_name(scopes),globals_name:make_scope_name(scopes,scopes[0])}
var head=init_comprehension(comp,scopes)
var first=this.generators[0]
var js=`$B.enter_frame(frame)\n`+
`var next_func_${id} = $B.make_js_iterator(expr, frame, ${this.lineno})\n`+
`for(var next_${id} of next_func_${id}){\n`+
`frame.$f_trace = $B.enter_frame(frame)\n`
var name=new $B.ast.Name(`next_${id}`,new $B.ast.Load())
copy_position(name,first_for.iter)
name.to_js=function(){return `next_${id}`}
var assign=new $B.ast.Assign([first.target],name)
assign.lineno=this.lineno
js+=assign.to_js(scopes)+'\n'
for(var _if of first.ifs){nb_paren++
js+=`if($B.$bool(${$B.js_from_ast(_if, scopes)})){\n`}
for(var comprehension of this.generators.slice(1)){js+=comprehension.to_js(scopes)
nb_paren++
for(var _if of comprehension.ifs){nb_paren++}}
var elt=$B.js_from_ast(this.elt,scopes),has_await=comp_scope.has_await
js=`var gen${id} = $B.generator.$factory(${has_await ? 'async ' : ''}function*(expr){\n`+js
js+=has_await ? 'var save_frame_obj = $B.frame_obj;\n' :''
js+=`try{\n`+
` yield ${elt}\n`+
`}catch(err){\n`+
(has_await ? '$B.restore_frame_obj(save_frame_obj, locals)\n' :'')+
`$B.leave_frame()\nthrow err\n}\n`+
(has_await ? '\n$B.restore_frame_obj(save_frame_obj, locals);' :'')
for(var i=0;i < nb_paren-1;i++){js+='}\n'}
js+='$B.leave_frame()\n}\n'+
'$B.leave_frame()\n}, "<genexpr>")(expr)\n'
scopes.pop()
var func=`${head}\n${js}\nreturn gen${id}`
return `(function(expr){\n${func}\n})(${outmost_expr})\n`}
$B.ast.Global.prototype.to_js=function(scopes){var scope=last_scope(scopes)
for(var name of this.names){scope.globals.add(name)}
return ''}
$B.ast.If.prototype.to_js=function(scopes){var scope=$B.last(scopes),new_scope=copy_scope(scope,this)
var js=`if($B.set_lineno(frame, ${this.lineno}) && `+
`$B.$bool(${$B.js_from_ast(this.test, scopes)})){\n`
scopes.push(new_scope)
js+=add_body(this.body,scopes)+'\n}'
scopes.pop()
if(this.orelse.length > 0){if(this.orelse[0]instanceof $B.ast.If && this.orelse.length==1){js+='else '+$B.js_from_ast(this.orelse[0],scopes)+
add_body(this.orelse.slice(1),scopes)}else{js+='\nelse{\n'+add_body(this.orelse,scopes)+'\n}'}}
return js}
$B.ast.IfExp.prototype.to_js=function(scopes){return '($B.$bool('+$B.js_from_ast(this.test,scopes)+') ? '+
$B.js_from_ast(this.body,scopes)+': '+
$B.js_from_ast(this.orelse,scopes)+')'}
$B.ast.Import.prototype.to_js=function(scopes){var js=`$B.set_lineno(frame, ${this.lineno})\n`
for(var alias of this.names){js+=`$B.$import("${alias.name}", [], `
if(alias.asname){js+=`{'${alias.name}' : '${alias.asname}'}, `
bind(alias.asname,scopes)}else{js+='{}, '
bind(alias.name,scopes)}
var parts=alias.name.split('.')
for(var i=0;i < parts.length;i++){scopes.imports[parts.slice(0,i+1).join(".")]=true}
js+=`locals, true)\n`}
return js.trimRight()}
$B.ast.ImportFrom.prototype.to_js=function(scopes){if(this.module==='__future__'){if(!($B.last(scopes).ast instanceof $B.ast.Module)){compiler_error(this,'from __future__ imports must occur at the beginning of the file',$B.last(this.names))}}
var js=`$B.set_lineno(frame, ${this.lineno})\n`+
`var module = $B.$import_from("${this.module || ''}", `
var names=this.names.map(x=> `"${x.name}"`).join(', '),aliases=[]
for(var name of this.names){if(name.asname){aliases.push(`${name.name}: '${name.asname}'`)}}
js+=`[${names}], {${aliases.join(', ')}}, ${this.level}, locals);`
for(var alias of this.names){if(alias.asname){bind(alias.asname,scopes)}else if(alias.name=='*'){
last_scope(scopes).blurred=true
js+=`\n$B.import_all(locals, module)`}else{bind(alias.name,scopes)}}
return js}
$B.ast.JoinedStr.prototype.to_js=function(scopes){var items=this.values.map(s=> $B.js_from_ast(s,scopes))
if(items.length==0){return "''"}
return items.join(' + ')}
$B.ast.Lambda.prototype.to_js=function(scopes){
var id=$B.UUID(),name='lambda_'+$B.lambda_magic+'_'+id
var f=new $B.ast.FunctionDef(name,this.args,this.body,[])
f.lineno=this.lineno
f.$id=fast_id(this)
f.$is_lambda=true
var js=f.to_js(scopes),lambda_ref=reference(scopes,last_scope(scopes),name)
return `(function(){ ${js}\n`+
`return ${lambda_ref}\n})()`}
function list_or_tuple_to_js(func,scopes){if(this.elts.filter(x=> x instanceof $B.ast.Starred).length > 0){var parts=[],simple=[]
for(var elt of this.elts){if(elt instanceof $B.ast.Starred){elt.$handled=true
parts.push(`[${simple.join(', ')}]`)
simple=[]
parts.push(`_b_.list.$factory(${$B.js_from_ast(elt, scopes)})`)}else{simple.push($B.js_from_ast(elt,scopes))}}
if(simple.length > 0){parts.push(`[${simple.join(', ')}]`)}
var js=parts[0]
for(var part of parts.slice(1)){js+=`.concat(${part})`}
return `${func}(${js})`}
var elts=this.elts.map(x=> $B.js_from_ast(x,scopes))
return `${func}([${elts.join(', ')}])`}
$B.ast.List.prototype.to_js=function(scopes){return list_or_tuple_to_js.bind(this)('$B.$list',scopes)}
$B.ast.ListComp.prototype.to_js=function(scopes){compiler_check(this)
return make_comp.bind(this)(scopes)}
$B.ast.match_case.prototype.to_js=function(scopes){var js=`($B.set_lineno(frame, ${this.lineno}) && `+
`$B.pattern_match(subject, {`+
`${$B.js_from_ast(this.pattern, scopes)}})`
if(this.guard){js+=` && $B.$bool(${$B.js_from_ast(this.guard, scopes)})`}
js+=`){\n`
js+=add_body(this.body,scopes)+'\n}'
return js}
function is_irrefutable(pattern){switch(pattern.constructor){case $B.ast.MatchAs:
if(pattern.pattern===undefined){return pattern}else{return is_irrefutable(pattern.pattern)}
case $B.ast.MatchOr:
for(var i=0;i < pattern.patterns.length;i++){if(is_irrefutable(pattern.patterns[i])){if(i==pattern.patterns.length-1){
return pattern}
irrefutable_error(pattern.patterns[i])}}
break}}
function irrefutable_error(pattern){var msg=pattern.name ? `name capture '${pattern.name}'` :'wildcard'
msg+=' makes remaining patterns unreachable'
compiler_error(pattern,msg)}
function pattern_bindings(pattern){var bindings=[]
switch(pattern.constructor){case $B.ast.MatchAs:
if(pattern.name){bindings.push(pattern.name)}
break
case $B.ast.MatchSequence:
for(var p of pattern.patterns){bindings=bindings.concat(pattern_bindings(p))}
break
case $B.ast.MatchOr:
bindings=pattern_bindings(pattern.patterns[0])
err_msg='alternative patterns bind different names'
for(var i=1;i < pattern.patterns.length;i++){var _bindings=pattern_bindings(pattern.patterns[i])
if(_bindings.length !=bindings.length){compiler_error(pattern,err_msg)}else{for(var j=0;j < bindings.length;j++){if(bindings[j]!=_bindings[j]){compiler_error(pattern,err_msg)}}}}
break}
return bindings.sort()}
$B.ast.Match.prototype.to_js=function(scopes){var scope=$B.last(scopes),irrefutable
var js=`var subject = ${$B.js_from_ast(this.subject, scopes)}\n`,first=true
for(var _case of this.cases){if(! _case.guard){if(irrefutable){irrefutable_error(irrefutable)}
irrefutable=is_irrefutable(_case.pattern)}
var case_js=$B.js_from_ast(_case,scopes)
if(first){js+='if'+case_js
first=false}else{js+='else if'+case_js}}
return `$B.set_lineno(frame, ${this.lineno})\n`+js}
$B.ast.MatchAs.prototype.to_js=function(scopes){
var scope=$B.last(scopes)
var name=this.name===undefined ? '_' :this.name,params
if(this.pattern===undefined){params=`capture: '${name}'`}else{var pattern=$B.js_from_ast(this.pattern,scopes)
if(this.pattern instanceof $B.ast.MatchAs && this.pattern.name){
pattern=`group: [{${pattern}}]`}
params=`${pattern}, alias: '${name}'`}
if(scope.bindings){if(scope.bindings.indexOf(name)>-1){compiler_error(this,`multiple assignment to name '${name}' in pattern`)}
scope.bindings.push(name)}
return params}
$B.ast.MatchClass.prototype.to_js=function(scopes){var names=[]
for(var pattern of this.patterns.concat(this.kwd_patterns)){var name=pattern.name
if(name){if(names.indexOf(name)>-1){compiler_error(pattern,`multiple assignment to name '${name}' in pattern`)}
names.push(name)}}
names=[]
for(var i=0;i < this.kwd_attrs.length;i++){var kwd_attr=this.kwd_attrs[i]
if(names.indexOf(kwd_attr)>-1){compiler_error(this.kwd_patterns[i],`attribute name repeated in class pattern: ${kwd_attr}`)}
names.push(kwd_attr)}
var cls=$B.js_from_ast(this.cls,scopes),patterns=this.patterns.map(x=> `{${$B.js_from_ast(x, scopes)}}`)
var kw=[]
for(var i=0,len=this.kwd_patterns.length;i < len;i++){kw.push(this.kwd_attrs[i]+': {'+
$B.js_from_ast(this.kwd_patterns[i],scopes)+'}')}
return `class: ${cls}, args: [${patterns}], keywords: {${kw.join(', ')}}`}
$B.ast.MatchMapping.prototype.to_js=function(scopes){for(var key of this.keys){if(key instanceof $B.ast.Attribute ||
key instanceof $B.ast.Constant ||
key instanceof $B.ast.UnaryOp ||
key instanceof $B.ast.BinOp){continue}else{compiler_error(key,'mapping pattern keys may only match literals and attribute lookups')}}
var names=[]
for(var pattern of this.patterns){if(pattern instanceof $B.ast.MatchAs && pattern.name){if(names.indexOf(pattern.name)>-1){compiler_error(pattern,`multiple assignments to name '${pattern.name}' in pattern`)}
names.push(pattern.name)}}
var items=[]
for(var i=0,len=this.keys.length;i < len;i++){var key_prefix=this.keys[i]instanceof $B.ast.Constant ?
'literal: ' :'value: '
var key=$B.js_from_ast(this.keys[i],scopes),value=$B.js_from_ast(this.patterns[i],scopes)
items.push(`[{${key_prefix}${key}}, {${value}}]`)}
var js='mapping: ['+items.join(', ')+']'
if(this.rest){js+=`, rest: '${this.rest}'`}
return js}
$B.ast.MatchOr.prototype.to_js=function(scopes){is_irrefutable(this)
pattern_bindings(this)
var items=[]
for(var alt of this.patterns){items.push(`{${$B.js_from_ast(alt, scopes)}}`)}
var js=items.join(', ')
return `or: [${js}]`}
$B.ast.MatchSequence.prototype.to_js=function(scopes){var items=[],names=[]
for(var pattern of this.patterns){if(pattern instanceof $B.ast.MatchAs && pattern.name){if(names.indexOf(pattern.name)>-1){compiler_error(pattern,`multiple assignments to name '${pattern.name}' in pattern`)}
names.push(pattern.name)}
items.push('{'+$B.js_from_ast(pattern,scopes)+'}')}
return `sequence: [${items.join(', ')}]`}
$B.ast.MatchSingleton.prototype.to_js=function(scopes){var value=this.value===true ? '_b_.True' :
this.value===false ? '_b_.False' :
'_b_.None'
return `literal: ${value}`}
$B.ast.MatchStar.prototype.to_js=function(scopes){var name=this.name===undefined ? '_' :this.name
return `capture_starred: '${name}'`}
$B.ast.MatchValue.prototype.to_js=function(scopes){if(this.value instanceof $B.ast.Constant){return `literal: ${$B.js_from_ast(this.value, scopes)}`}else if(this.value instanceof $B.ast.Constant ||
this.value instanceof $B.ast.UnaryOp ||
this.value instanceof $B.ast.BinOp ||
this.value instanceof $B.ast.Attribute){return `value: ${$B.js_from_ast(this.value, scopes)}`}else{compiler_error(this,'patterns may only match literals and attribute lookups')}}
$B.ast.Module.prototype.to_js=function(scopes){mark_parents(this)
var name=init_scopes.bind(this)('module',scopes),namespaces=scopes.namespaces
var module_id=name,global_name=make_scope_name(scopes),mod_name=module_name(scopes)
var js=`// Javascript code generated from ast\n`+
`var $B = __BRYTHON__,\n_b_ = $B.builtins,\n`
if(! namespaces){js+=`${global_name} = $B.imported["${mod_name}"],\n`+
`locals = ${global_name},\n`+
`frame = ["${module_id}", locals, "${module_id}", locals]`}else{
js+=`locals = ${namespaces.local_name},\n`+
`globals = ${namespaces.global_name}`
if(name){js+=`,\nlocals_${name} = locals`}}
js+=`\nframe.__file__ = '${scopes.filename || "<string>"}'\n`+
`locals.__name__ = '${name}'\n`+
`locals.__doc__ = ${extract_docstring(this, scopes)}\n`
if(! scopes.imported){js+=`locals.__annotations__ = locals.__annotations__ || $B.empty_dict()\n`}
if(! namespaces){
js+=`frame.$f_trace = $B.enter_frame(frame)\n`}
js+=`$B.set_lineno(frame, 1)\n`+
'\nvar _frame_obj = $B.frame_obj,\n'+
'stack_length = $B.count_frames()\n'+
`try{\n`+
add_body(this.body,scopes)+'\n'+
(namespaces ? '' :`$B.leave_frame({locals, value: _b_.None})\n`)+
`}catch(err){\n`+
`$B.set_exc(err, frame)\n`
if(trace){js+=`if((! err.$in_trace_func) && frame.$f_trace !== _b_.None){\n`+
`frame.$f_trace = $B.trace_exception()\n`+
`}\n`}
js+=(namespaces ? '' :`$B.leave_frame({locals, value: _b_.None})\n`)+
'throw err\n'+
`}`
scopes.pop()
return js}
$B.ast.Name.prototype.to_js=function(scopes){if(this.ctx instanceof $B.ast.Store){
var scope=bind(this.id,scopes)
if(scope===$B.last(scopes)&& scope.freevars.has(this.id)){
scope.freevars.delete(this.id)}
return reference(scopes,scope,this.id)}else if(this.ctx instanceof $B.ast.Load){var res=name_reference(this.id,scopes,[this.col_offset,this.col_offset,this.end_col_offset])
if(this.id=='__debugger__' && res.startsWith('$B.resolve_in_scopes')){
return 'debugger'}
return res}}
$B.ast.NamedExpr.prototype.to_js=function(scopes){
var i=scopes.length-1
while(scopes[i].type=='comprehension'){i--}
var enclosing_scopes=scopes.slice(0,i+1)
enclosing_scopes.symtable=scopes.symtable
bind(this.target.id,enclosing_scopes)
return '('+$B.js_from_ast(this.target,enclosing_scopes)+' = '+
$B.js_from_ast(this.value,scopes)+')'}
$B.ast.Nonlocal.prototype.to_js=function(scopes){var scope=$B.last(scopes)
for(var name of this.names){scope.nonlocals.add(name)}
return ''}
$B.ast.Pass.prototype.to_js=function(scopes){return `$B.set_lineno(frame, ${this.lineno})\n`+
'void(0)'}
$B.ast.Raise.prototype.to_js=function(scopes){var js=`$B.set_lineno(frame, ${this.lineno})\n`+
'$B.$raise('
if(this.exc){js+=$B.js_from_ast(this.exc,scopes)}
if(this.cause){js+=', '+$B.js_from_ast(this.cause,scopes)}
return js+')'}
$B.ast.Return.prototype.to_js=function(scopes){
compiler_check(this)
var js=`$B.set_lineno(frame, ${this.lineno})\n`+
'var result = '+
(this.value ? $B.js_from_ast(this.value,scopes):' _b_.None')+
'\n'
if(trace){js+=`if(frame.$f_trace !== _b_.None){\n`+
`$B.trace_return(result)\n}\n`}
js+=`$B.leave_frame()\nreturn result\n`
return js}
$B.ast.Set.prototype.to_js=function(scopes){var elts=[]
for(var elt of this.elts){var js
if(elt instanceof $B.ast.Constant){js=`{constant: [${$B.js_from_ast(elt, scopes)}, `+
`${$B.$hash(elt.value)}]}`}else if(elt instanceof $B.ast.Starred){js=`{starred: ${$B.js_from_ast(elt.value, scopes)}}`}else{js=`{item: ${$B.js_from_ast(elt, scopes)}}`}
elts.push(js)}
return `_b_.set.$literal([${elts.join(', ')}])`}
$B.ast.SetComp.prototype.to_js=function(scopes){return make_comp.bind(this)(scopes)}
$B.ast.Slice.prototype.to_js=function(scopes){var lower=this.lower ? $B.js_from_ast(this.lower,scopes):'_b_.None',upper=this.upper ? $B.js_from_ast(this.upper,scopes):'_b_.None',step=this.step ? $B.js_from_ast(this.step,scopes):'_b_.None'
return `_b_.slice.$fast_slice(${lower}, ${upper}, ${step})`}
$B.ast.Starred.prototype.to_js=function(scopes){if(this.$handled){return `_b_.list.$unpack(${$B.js_from_ast(this.value, scopes)})`}
if(this.ctx instanceof $B.ast.Store){compiler_error(this,"starred assignment target must be in a list or tuple")}else{compiler_error(this,"can't use starred expression here")}}
$B.ast.Subscript.prototype.to_js=function(scopes){var value=$B.js_from_ast(this.value,scopes),slice=$B.js_from_ast(this.slice,scopes)
if(this.slice instanceof $B.ast.Slice){return `$B.getitem_slice(${value}, ${slice})`}else{var position=encode_position(this.value.col_offset,this.slice.col_offset,this.slice.end_col_offset)
return `$B.$getitem(${value}, ${slice},${position})`}}
$B.ast.Try.prototype.to_js=function(scopes){compiler_check(this)
var id=$B.UUID(),has_except_handlers=this.handlers.length > 0,has_else=this.orelse.length > 0,has_finally=this.finalbody.length > 0
var js=`$B.set_lineno(frame, ${this.lineno})\ntry{\n`
js+=`var stack_length_${id} = $B.count_frames()\n`
if(has_finally){js+=`var save_frame_obj_${id} = $B.frames_obj\n`}
if(has_else){js+=`var failed${id} = false\n`}
var try_scope=copy_scope($B.last(scopes))
scopes.push(try_scope)
js+=add_body(this.body,scopes)+'\n'
if(has_except_handlers){var err='err'+id
js+='}\n' 
js+=`catch(${err}){\n`+
`$B.set_exc(${err}, frame)\n`
if(trace){js+=`if(frame.$f_trace !== _b_.None){\n`+
`frame.$f_trace = $B.trace_exception()}\n`}
if(has_else){js+=`failed${id} = true\n`}
var first=true,has_untyped_except=false
for(var handler of this.handlers){if(first){js+='if'
first=false}else{js+='}else if'}
js+=`($B.set_lineno(frame, ${handler.lineno})`
if(handler.type){js+=` && $B.is_exc(${err}, `
if(handler.type instanceof $B.ast.Tuple){js+=`${$B.js_from_ast(handler.type, scopes)}`}else{js+=`[${$B.js_from_ast(handler.type, scopes)}]`}
js+=`)){\n`}else{has_untyped_except=true
js+='){\n'}
if(handler.name){bind(handler.name,scopes)
var mangled=mangle(scopes,try_scope,handler.name)
js+=`locals.${mangled} = ${err}\n`}
js+=add_body(handler.body,scopes)+'\n'
if(!($B.last(handler.body)instanceof $B.ast.Return)){
js+='$B.del_exc(frame)\n'}}
if(! has_untyped_except){
js+=`}else{\nthrow ${err}\n`}
js+='}\n'}
if(has_else ||has_finally){js+='}\n' 
js+='finally{\n'
var finalbody=`var exit = false\n`+
`if($B.count_frames() < stack_length_${id}){\n`+
`exit = true\n`+
`$B.frame_obj = $B.push_frame(frame)\n`+
`}\n`+
add_body(this.finalbody,scopes)
if(this.finalbody.length > 0 &&
!($B.last(this.finalbody)instanceof $B.ast.Return)){finalbody+=`\nif(exit){\n`+
`$B.leave_frame()\n`+
`}`}
var elsebody=`if($B.count_frames() == stack_length_${id} `+
`&& ! failed${id}){\n`+
add_body(this.orelse,scopes)+
'\n}' 
if(has_else && has_finally){js+=`try{\n`+
elsebody+
'\n}\n'+
`finally{\n`+finalbody+'}\n'}else if(has_else && ! has_finally){js+=elsebody}else{js+=finalbody}
js+='\n}\n' }else{js+='}\n' }
scopes.pop()
return js}
$B.ast.TryStar.prototype.to_js=function(scopes){
var id=$B.UUID(),has_except_handlers=this.handlers.length > 0,has_else=this.orelse.length > 0,has_finally=this.finalbody.length > 0
var js=`$B.set_lineno(frame, ${this.lineno})\ntry{\n`
js+=`var stack_length_${id} = $B.count_frames()\n`
if(has_finally){js+=`var save_frame_obj_${id} = $B.frame_obj\n`}
if(has_else){js+=`var failed${id} = false\n`}
var try_scope=copy_scope($B.last(scopes))
scopes.push(try_scope)
js+=add_body(this.body,scopes)+'\n'
if(has_except_handlers){var err='err'+id
js+='}\n' 
js+=`catch(${err}){\n`+
`$B.set_exc(${err}, frame)\n`
if(trace){js+=`if(frame.$f_trace !== _b_.None){\n`+
`frame.$f_trace = $B.trace_exception()\n`+
`}\n`}
js+=`if(! $B.$isinstance(${err}, _b_.BaseExceptionGroup)){\n`+
`${err} = _b_.BaseExceptionGroup.$factory(_b_.None, [${err}])\n`+
'}\n'+
`function fake_split(exc, condition){\n`+
`return condition(exc) ? `+
`$B.fast_tuple([exc, _b_.None]) : $B.fast_tuple([_b_.None, exc])\n`+
'}\n'
if(has_else){js+=`failed${id} = true\n`}
var first=true,has_untyped_except=false
for(var handler of this.handlers){js+=`$B.set_lineno(frame, ${handler.lineno})\n`
if(handler.type){js+="var condition = function(exc){\n"+
"    return $B.$isinstance(exc, "+
`${$B.js_from_ast(handler.type, scopes)})\n`+
"}\n"+
`var klass = $B.get_class(${err}),\n`+
`split_method = $B.$getattr(klass, 'split'),\n`+
`split = $B.$call(split_method)(${err}, condition),\n`+
'    matching = split[0],\n'+
'    rest = split[1]\n'+
'if(matching.exceptions !== _b_.None){\n'+
'    for(var err of matching.exceptions){\n'
if(handler.name){bind(handler.name,scopes)
var mangled=mangle(scopes,try_scope,handler.name)
js+=`locals.${mangled} = ${err}\n`}
js+=add_body(handler.body,scopes)+'\n'
if(!($B.last(handler.body)instanceof $B.ast.Return)){
js+='$B.del_exc(frame)\n'}
js+='}\n'
js+='}\n'
js+=`${err} = rest\n`}}
js+=`if(${err}.exceptions !== _b_.None){\n`+
`throw ${err}\n`+
'}\n'}
if(has_else ||has_finally){js+='}\n' 
js+='finally{\n'
var finalbody=`var exit = false\n`+
`if($B.count_frames() < stack_length_${id}){\n`+
`exit = true\n`+
`$B.frame_obj = $B.push_frame(frame)\n`+
`}\n`+
add_body(this.finalbody,scopes)
if(this.finalbody.length > 0 &&
!($B.last(this.finalbody)instanceof $B.ast.Return)){finalbody+=`\nif(exit){\n`+
`$B.leave_frame(locals)\n`+
`}`}
var elsebody=`if($B.count_frames() == stack_length_${id} `+
`&& ! failed${id}){\n`+
add_body(this.orelse,scopes)+
'\n}' 
if(has_else && has_finally){js+=`try{\n`+
elsebody+
'\n}\n'+
`finally{\n`+finalbody+'}\n'}else if(has_else && ! has_finally){js+=elsebody}else{js+=finalbody}
js+='\n}\n' }else{js+='}\n' }
scopes.pop()
return js}
$B.ast.Tuple.prototype.to_js=function(scopes){return list_or_tuple_to_js.bind(this)('$B.fast_tuple',scopes)}
$B.ast.TypeAlias.prototype.to_js=function(scopes){var value=this.value.to_js(scopes),type_params=this.type_params.map(x=> x.to_js(scopes))
return `locals.${this.name.id} = $B.make_type_alias('${this.name.id}', `+
`$B.fast_tuple([${type_params}]), ${value})\n`}
$B.ast.TypeVar.prototype.to_js=function(){return `$B.$call($B.imported.typing.TypeVar)('${this.name}')`}
$B.ast.UnaryOp.prototype.to_js=function(scopes){var operand=$B.js_from_ast(this.operand,scopes)
if(this.op instanceof $B.ast.Not){return `! $B.$bool(${operand})`}
if(typeof operand=="number" ||operand instanceof Number){if(this.op instanceof $B.ast.UAdd){return operand+''}else if(this.op instanceof $B.ast.USub){return-operand+''}}
var method=opclass2dunder[this.op.constructor.$name]
return `$B.$getattr($B.get_class(locals.$result = ${operand}), '${method}')(locals.$result)`}
$B.ast.While.prototype.to_js=function(scopes){var id=$B.UUID()
var scope=$B.last(scopes),new_scope=copy_scope(scope,this,id)
scopes.push(new_scope)
var js=`var no_break_${id} = true\n`
js+=`while($B.set_lineno(frame, ${this.lineno}) && `+
`$B.$bool(${$B.js_from_ast(this.test, scopes)})){\n`
js+=add_body(this.body,scopes)+'\n}'
scopes.pop()
if(this.orelse.length > 0){js+=`\nif(no_break_${id}){\n`+
add_body(this.orelse,scopes)+'}\n'}
return js}
var with_counter=[0]
$B.ast.With.prototype.to_js=function(scopes){
function add_item(item,js){var id=$B.UUID()
var s=`var mgr_${id} = `+
$B.js_from_ast(item.context_expr,scopes)+',\n'+
`klass = $B.get_class(mgr_${id})\n`+
`try{\n`+
`var exit_${id} = $B.$getattr(klass, '__exit__'),\n`+
`enter_${id} = $B.$getattr(klass, '__enter__')\n`+
`}catch(err){\n`+
`var klass_name = $B.class_name(mgr_${id})\n`+
`throw _b_.TypeError.$factory("'" + klass_name + `+
`"' object does not support the con`+
`text manager protocol")\n`+
`}\n`+
`var value_${id} = $B.$call(enter_${id})(mgr_${id}),\n`+
`exc_${id} = true\n`
if(in_generator){
s+=`locals.$context_managers = locals.$context_managers || []\n`+
`locals.$context_managers.push(mgr_${id})\n`}
s+='try{\ntry{\n'
if(item.optional_vars){var value={to_js:function(){return `value_${id}`}}
copy_position(value,_with)
var assign=new $B.ast.Assign([item.optional_vars],value)
copy_position(assign,_with)
s+=assign.to_js(scopes)+'\n'}
s+=js
s+=`}catch(err_${id}){\n`+
`frame.$lineno = ${lineno}\n`+
`exc_${id} = false\n`+
`err_${id} = $B.exception(err_${id}, frame)\n`+
`var $b = exit_${id}(mgr_${id}, err_${id}.__class__, `+
`err_${id}, $B.$getattr(err_${id}, '__traceback__'))\n`+
`if(! $B.$bool($b)){\n`+
`throw err_${id}\n`+
`}\n`+
`}\n`
s+=`}\nfinally{\n`+
`frame.$lineno = ${lineno}\n`+
(in_generator ? `locals.$context_managers.pop()\n` :'')+
`if(exc_${id}){\n`+
`try{\n`+
`exit_${id}(mgr_${id}, _b_.None, _b_.None, _b_.None)\n`+
`}catch(err){\n`+
`if($B.count_frames() < stack_length){\n`+
`$B.frame_obj = $B.push_frame(frame)\n`+
`}\n`+
`throw err\n`+
`}\n`+
`}\n`+
`}\n`
return s}
var _with=this,scope=last_scope(scopes),lineno=this.lineno
scope.needs_stack_length=true
js=add_body(this.body,scopes)+'\n'
var in_generator=scopes.symtable.table.blocks.get(fast_id(scope.ast)).generator
for(var item of this.items.slice().reverse()){js=add_item(item,js)}
return `$B.set_lineno(frame, ${this.lineno})\n`+js}
$B.ast.Yield.prototype.to_js=function(scopes){
var scope=last_scope(scopes)
if(scope.type !='def'){compiler_error(this,"'yield' outside function")}
last_scope(scopes).is_generator=true
var value=this.value ? $B.js_from_ast(this.value,scopes):'_b_.None'
return `yield ${value}`}
$B.ast.YieldFrom.prototype.to_js=function(scopes){
var scope=last_scope(scopes)
if(scope.type !='def'){compiler_error(this,"'yield' outside function")}
scope.is_generator=true
var value=$B.js_from_ast(this.value,scopes)
var n=$B.UUID()
return `yield* (function* f(){
        var _i${n} = _b_.iter(${value}),
                _r${n}
            var failed${n} = false
            try{
                var _y${n} = _b_.next(_i${n})
            }catch(_e){
                $B.set_exc(_e, frame)
                failed${n} = true
                $B.pmframe = $B.frame_obj.frame
                _e = $B.exception(_e)
                if(_e.__class__ === _b_.StopIteration){
                    var _r${n} = $B.$getattr(_e, "value")
                }else{
                    throw _e
                }
            }
            if(! failed${n}){
                while(true){
                    var failed1${n} = false
                    try{
                        $B.leave_frame()
                        var _s${n} = yield _y${n}
                        $B.frame_obj = $B.push_frame(frame)
                    }catch(_e){
                        $B.set_exc(_e, frame)
                        if(_e.__class__ === _b_.GeneratorExit){
                            var failed2${n} = false
                            try{
                                var _m${n} = $B.$getattr(_i${n}, "close")
                            }catch(_e1){
                                failed2${n} = true
                                if(_e1.__class__ !== _b_.AttributeError){
                                    throw _e1
                                }
                            }
                            if(! failed2${n}){
                                $B.$call(_m${n})()
                            }
                            throw _e
                        }else if($B.is_exc(_e, [_b_.BaseException])){
                            var sys_module = $B.imported._sys,
                                _x${n} = sys_module.exc_info()
                            var failed3${n} = false
                            try{
                                var _m${n} = $B.$getattr(_i${n}, "throw")
                            }catch(err){
                                failed3${n} = true
                                if($B.is_exc(err, [_b_.AttributeError])){
                                    throw err
                                }
                            }
                            if(! failed3${n}){
                                try{
                                    _y${n} = $B.$call(_m${n}).apply(null,
                                        _b_.list.$factory(_x${n}))
                                }catch(err){
                                    if($B.is_exc(err, [_b_.StopIteration])){
                                        _r${n} = $B.$getattr(err, "value")
                                        break
                                    }
                                    throw err
                                }
                            }
                        }
                    }
                    if(! failed1${n}){
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
            }
            return _r${n}
        })()`}
var state={}
$B.js_from_root=function(arg){var ast_root=arg.ast,symtable=arg.symtable,filename=arg.filename
namespaces=arg.namespaces,imported=arg.imported
if($B.show_ast_dump){console.log($B.ast_dump(ast_root))}
if($B.compiler_check){$B.compiler_check(ast_root,symtable)}
var scopes=[]
state.filename=filename
scopes.symtable=symtable
scopes.filename=filename
scopes.namespaces=namespaces
scopes.imported=imported
scopes.imports={}
var js=ast_root.to_js(scopes)
return{js,imports:scopes.imports}}
$B.js_from_ast=function(ast,scopes){if(! scopes.symtable){throw Error('perdu symtable')}
var js=''
scopes=scopes ||[]
if(ast.to_js !==undefined){if(ast.col_offset===undefined){var klass=ast.constructor.$name
if(['match_case'].indexOf(klass)==-1){console.log('pas de col offset pour',klass)
console.log(ast)
throw Error('ccc')
alert()}}
return ast.to_js(scopes)}
console.log("unhandled",ast.constructor.$name,ast)
return '// unhandled class ast.'+ast.constructor.$name}})(__BRYTHON__)
;
(function($B){var _b_=$B.builtins
var GLOBAL_PARAM="name '%s' is parameter and global",NONLOCAL_PARAM="name '%s' is parameter and nonlocal",GLOBAL_AFTER_ASSIGN="name '%s' is assigned to before global declaration",NONLOCAL_AFTER_ASSIGN="name '%s' is assigned to before nonlocal declaration",GLOBAL_AFTER_USE="name '%s' is used prior to global declaration",NONLOCAL_AFTER_USE="name '%s' is used prior to nonlocal declaration",GLOBAL_ANNOT="annotated name '%s' can't be global",NONLOCAL_ANNOT="annotated name '%s' can't be nonlocal",IMPORT_STAR_WARNING="import * only allowed at module level",NAMED_EXPR_COMP_IN_CLASS=
"assignment expression within a comprehension cannot be used in a class body",NAMED_EXPR_COMP_CONFLICT=
"assignment expression cannot rebind comprehension iteration variable '%s'",NAMED_EXPR_COMP_INNER_LOOP_CONFLICT=
"comprehension inner loop cannot rebind assignment expression target '%s'",NAMED_EXPR_COMP_ITER_EXPR=
"assignment expression cannot be used in a comprehension iterable expression",ANNOTATION_NOT_ALLOWED=
"'%s' can not be used within an annotation",DUPLICATE_ARGUMENT="duplicate argument '%s' in function definition",TYPEVAR_BOUND_NOT_ALLOWED="'%s' can not be used within a TypeVar bound",TYPEALIAS_NOT_ALLOWED="'%s' can not be used within a type alias",TYPEPARAM_NOT_ALLOWED=
"'%s' can not be used within the definition of a generic",DUPLICATE_TYPE_PARAM="duplicate type parameter '%s'"
var DEF_GLOBAL=1,
DEF_LOCAL=2 ,
DEF_PARAM=2<<1,
DEF_NONLOCAL=2<<2,
USE=2<<3 ,
DEF_FREE=2<<4 ,
DEF_FREE_CLASS=2<<5,
DEF_IMPORT=2<<6,
DEF_ANNOT=2<<7,
DEF_COMP_ITER=2<<8,
DEF_TYPE_PARAM=2<<9,
DEF_COMP_CELL=2<<10 
var DEF_BOUND=DEF_LOCAL |DEF_PARAM |DEF_IMPORT
var SCOPE_OFFSET=11,SCOPE_MASK=(DEF_GLOBAL |DEF_LOCAL |DEF_PARAM |DEF_NONLOCAL)
var LOCAL=1,GLOBAL_EXPLICIT=2,GLOBAL_IMPLICIT=3,FREE=4,CELL=5
var GENERATOR=1,GENERATOR_EXPRESSION=2
var CO_FUTURE_ANNOTATIONS=0x1000000 
var TYPE_CLASS=1,TYPE_FUNCTION=0,TYPE_MODULE=2
var NULL=undefined
var ModuleBlock=2,ClassBlock=1,FunctionBlock=0,AnnotationBlock=4,TypeVarBoundBlock=5,TypeAliasBlock=6,TypeParamBlock=7
var PyExc_SyntaxError=_b_.SyntaxError
function assert(test){if(! $B.$bool(test)){console.log('test fails',test)
throw Error('test fails')}}
function LOCATION(x){
return[x.lineno,x.col_offset,x.end_lineno,x.end_col_offset]}
function ST_LOCATION(x){
return[x.lineno,x.col_offset,x.end_lineno,x.end_col_offset]}
function _Py_Mangle(privateobj,ident){
var result,nlen,plen,ipriv,maxchar;
if(privateobj==NULL ||! ident.startsWith('__')){return ident;}
nlen=ident.length
plen=privateobj.length
if(ident.endsWith('__')||ident.search(/\./)!=-1){return ident;}
ipriv=0;
while(privateobj[ipriv]=='_')
ipriv++;
if(ipriv==plen){return ident;}
var prefix=privateobj.substr(ipriv)
return '_'+prefix+ident}
var top=NULL,lambda=NULL,genexpr=NULL,listcomp=NULL,setcomp=NULL,dictcomp=NULL,__class__=NULL,_annotation=NULL
var NoComprehension=0,ListComprehension=1,DictComprehension=2,SetComprehension=3,GeneratorExpression=4
var internals={}
function GET_IDENTIFIER(VAR){return VAR}
function Symtable(){this.filename=NULL;
this.stack=[]
this.blocks=new Map()
this.cur=NULL;
this.private=NULL;}
function id(obj){if(obj.$id !==undefined){return obj.$id}
return obj.$id=$B.UUID()}
function ste_new(st,name,block,key,lineno,col_offset,end_lineno,end_col_offset){var ste
ste={table:st,id:id(key),
name:name,directives:NULL,type:block,nested:0,free:0,varargs:0,varkeywords:0,opt_lineno:0,opt_col_offset:0,lineno:lineno,col_offset:col_offset,end_lineno:end_lineno,end_col_offset:end_col_offset}
if(st.cur !=NULL &&
(st.cur.nested ||
st.cur.type==FunctionBlock)){ste.nested=1;}
ste.child_free=0
ste.generator=0
ste.coroutine=0
ste.comprehension=NoComprehension
ste.returns_value=0
ste.needs_class_closure=0
ste.comp_inlined=0
ste.comp_iter_target=0
ste.comp_iter_expr=0
ste.symbols=$B.empty_dict()
ste.varnames=[]
ste.children=[]
st.blocks.set(ste.id,ste)
return ste}
$B._PySymtable_Build=function(mod,filename,future){var st=new Symtable(),seq
st.filename=filename;
st.future=future ||{}
st.type=TYPE_MODULE
if(!symtable_enter_block(st,'top',ModuleBlock,mod,0,0,0,0)){return NULL;}
st.top=st.cur
switch(mod.constructor){case $B.ast.Module:
seq=mod.body
for(var item of seq){visitor.stmt(st,item)}
break
case $B.ast.Expression:
visitor.expr(st,mod.body)
break
case $B.ast.Interactive:
seq=mod.body
for(var item of seq){visitor.stmt(st,item)}
break}
symtable_analyze(st)
return st.top;}
function PySymtable_Lookup(st,key){var v=st.blocks.get(key)
if(v){assert(PySTEntry_Check(v))}
return v}
function _PyST_GetSymbol(ste,name){if(! _b_.dict.$contains_string(ste.symbols,name)){return 0}
return _b_.dict.$getitem_string(ste.symbols,name)}
function _PyST_GetScope(ste,name){var symbol=_PyST_GetSymbol(ste,name);
return(symbol >> SCOPE_OFFSET)& SCOPE_MASK;}
function _PyST_IsFunctionLike(ste){return ste.type==FunctionBlock
||ste.type==TypeVarBoundBlock
||ste.type==TypeAliasBlock
||ste.type==TypeParamBlock;}
function PyErr_Format(exc_type,message,arg){if(arg){message=_b_.str.__mod__(message,arg)}
return exc_type.$factory(message)}
function PyErr_SetString(exc_type,message){return exc_type.$factory(message)}
function set_exc_info(exc,filename,lineno,offset,end_lineno,end_offset){exc.filename=filename
exc.lineno=lineno
exc.offset=offset+1
exc.end_lineno=end_lineno
exc.end_offset=end_offset+1
var src=$B.file_cache[filename]
if(src !==undefined){var lines=src.split('\n')
exc.text=lines[lineno-1]}else{exc.text=''}
exc.args[1]=[filename,exc.lineno,exc.offset,exc.text,exc.end_lineno,exc.end_offset]}
function error_at_directive(exc,ste,name){var data
assert(ste.directives)
for(var data of ste.directives){if(data[0]==name){set_exc_info(exc,ste.table.filename,data[1],data[2],data[3],data[4])
return 0}}
PyErr_SetString(PyExc_RuntimeError,"BUG: internal directive bookkeeping broken")
return 0}
function SET_SCOPE(DICT,NAME,I){DICT[NAME]=I}
function is_free_in_any_child(entry,key){for(var child_ste of entry.ste_children){var scope=_PyST_GetScope(child_ste,key)
if(scope==FREE){return 1}}
return 0}
function inline_comprehension(ste,comp,scopes,comp_free,inlined_cells){var pos=0
for(var item of _b_.dict.$iter_items_with_hash(comp.symbols)){
var k=item.key,comp_flags=item.value;
if(comp_flags & DEF_PARAM){
continue;}
var scope=(comp_flags >> SCOPE_OFFSET)& SCOPE_MASK;
var only_flags=comp_flags &((1 << SCOPE_OFFSET)-1)
if(scope==CELL ||only_flags & DEF_COMP_CELL){inlined_cells.add(k)}
var existing=_b_.dict.$contains_string(ste.symbols,k)
if(!existing){
var v_flags=only_flags
_b_.dict.$setitem(ste.symbols,k,v_flags);
SET_SCOPE(scopes,k,scope);}else{
if((existing & DEF_BOUND)&&
!is_free_in_any_child(comp,k)&&
ste.type !==ClassBlock){_b_.set.remove(comp_free,k)}}}
return 1;}
function analyze_name(ste,scopes,name,flags,bound,local,free,global,type_params,class_entry){if(flags & DEF_GLOBAL){if(flags & DEF_NONLOCAL){var exc=PyErr_Format(_b_.SyntaxError,"name '%s' is nonlocal and global",name)
error_at_directive(exc,ste,name)
throw exc}
SET_SCOPE(scopes,name,GLOBAL_EXPLICIT)
global.add(name)
if(bound){bound.delete(name)}
return 1}
if(flags & DEF_NONLOCAL){if(!bound){var exc=PyErr_Format(_b_.SyntaxError,"nonlocal declaration not allowed at module level");
error_at_directive(exc,ste,name)
throw exc}
if(! bound.has(name)){var exc=PyErr_Format(_b_.SyntaxError,"no binding for nonlocal '%s' found",name)
error_at_directive(exc,ste,name)
throw exc}
if(type_params.has(name)){var exc=PyErr_Format(_b_.SyntaxError,"nonlocal binding not allowed for type parameter '%s'",name);
error_at_directive(exc,ste,name)
throw exc}
SET_SCOPE(scopes,name,FREE)
ste.free=1
free.add(name)
return 1}
if(flags & DEF_BOUND){SET_SCOPE(scopes,name,LOCAL)
local.add(name)
global.delete(name)
if(flags & DEF_TYPE_PARAM){type_params.add(name)}else{type_params.delete(name)}
return 1}
if(class_entry !=NULL){var class_flags=_PyST_GetSymbol(class_entry,name);
if(class_flags & DEF_GLOBAL){SET_SCOPE(scopes,name,GLOBAL_EXPLICIT);
return 1;}
else if(class_flags & DEF_BOUND && !(class_flags & DEF_NONLOCAL)){SET_SCOPE(scopes,name,GLOBAL_IMPLICIT);
return 1;}}
if(bound && bound.has(name)){SET_SCOPE(scopes,name,FREE)
ste.free=1
free.add(name)
return 1}
if(global && global.has(name)){SET_SCOPE(scopes,name,GLOBAL_IMPLICIT)
return 1}
if(ste.nested){ste.free=1}
SET_SCOPE(scopes,name,GLOBAL_IMPLICIT)
return 1}
var SET_SCOPE
function analyze_cells(scopes,free,inlined_cells){var name,v,v_cell;
var success=0,pos=0;
v_cell=CELL;
if(!v_cell){return 0;}
for(var name in scopes){v=scopes[name]
scope=v;
if(scope !=LOCAL){continue;}
if(free.has(name)&& ! inlined_cells.has(name)){continue;}
scopes[name]=v_cell
free.delete(name)}
return 1}
function drop_class_free(ste,free){var res=free.delete('__class__')
if(res){ste.needs_class_closure=1}
var res=free.delete('__classdict__')
if(res){ste.needs_class_classdict=1}
return 1}
function update_symbols(symbols,scopes,bound,free,inlined_cells,classflag){var name,itr,v,v_scope,v_new,v_free,pos=0
for(var name of _b_.dict.$keys_string(symbols)){var flags=_b_.dict.$getitem_string(symbols,name)
if(inlined_cells.has(name)){flags |=DEF_COMP_CELL}
v_scope=scopes[name]
var scope=v_scope
flags |=(scope << SCOPE_OFFSET)
v_new=flags
if(!v_new){return 0;}
_b_.dict.$setitem_string(symbols,name,v_new)}
v_free=FREE << SCOPE_OFFSET
for(var name of free){v=_b_.dict.$get_string(symbols,name)
if(v !==_b_.dict.$missing){
if(classflag &&
v &(DEF_BOUND |DEF_GLOBAL)){var flags=v |DEF_FREE_CLASS;
v_new=flags;
if(! v_new){return 0;}
_b_.dict.$setitem_string(symbols,name,v_new)}
continue;}
if(bound && !bound.has(name)){continue;}
_b_.dict.$setitem_string(symbols,name,v_free)}
return 1}
function analyze_block(ste,bound,free,global,typeparams,class_entry){var name,v,local=NULL,scopes=NULL,newbound=NULL,newglobal=NULL,newfree=NULL,allfree=NULL,temp,i,success=0,pos=0;
local=new Set()
scopes={}
newglobal=new Set()
newfree=new Set()
newbound=new Set()
inlined_cells=new Set()
if(ste.type===ClassBlock){
Set_Union(newglobal,global)
if(bound){Set_Union(newbound,bound)}}
for(var name of _b_.dict.$keys_string(ste.symbols)){var flags=_b_.dict.$getitem_string(ste.symbols,name)
if(!analyze_name(ste,scopes,name,flags,bound,local,free,global,typeparams,class_entry)){return 0}}
if(ste.type !=ClassBlock){
if(_PyST_IsFunctionLike(ste)){Set_Union(newbound,local);}
if(bound){Set_Union(newbound,bound)}
Set_Union(newglobal,global);}else{
newbound.add('__class__')
newbound.add('__classdict__')}
for(var c of ste.children){var child_free=new Set()
var entry=c
var new_class_entry=NULL;
if(entry.can_see_class_scope){if(ste.type==ClassBlock){new_class_entry=ste}else if(class_entry){new_class_entry=class_entry}}
var inline_comp=entry.comprehension && ! entry.generator;
if(! analyze_child_block(entry,newbound,newfree,newglobal,typeparams,new_class_entry,child_free)){return 0}
if(inline_comp){if(! inline_comprehension(ste,entry,scopes,child_free,inlined_cells)){error();}
entry.comp_inlined=1;}
Set_Union(newfree,child_free);
if(entry.free ||entry.child_free){ste.child_free=1}}
for(var i=ste.children.length-1;i >=0;i--){var entry=ste.children[i];
if(entry.comp_inlined){ste.children.splice(i,0,...entry.children)}}
if(_PyST_IsFunctionLike(ste)&& !analyze_cells(scopes,newfree,inlined_cells)){return 0}else if(ste.type===ClassBlock && !drop_class_free(ste,newfree)){return 0}
if(!update_symbols(ste.symbols,scopes,bound,newfree,inlined_cells,ste.type===ClassBlock ||ste.can_see_class_scope)){return 0}
Set_Union(free,newfree)
success=1
return success}
function PySet_New(arg){if(arg===NULL){return new Set()}
return new Set(arg)}
function Set_Union(setA,setB){for(let elem of setB){setA.add(elem)}}
function analyze_child_block(entry,bound,free,global,typeparams,class_entry,child_free){
var temp_bound=PySet_New(bound),temp_free=PySet_New(free),temp_global=PySet_New(global),temp_typeparams=PySet_New(typeparams)
if(!analyze_block(entry,temp_bound,temp_free,temp_global,temp_typeparams,class_entry)){return 0}
Set_Union(child_free,temp_free);
return 1;}
function symtable_analyze(st){var free=new Set(),global=new Set(),typeparams=new Set()
return analyze_block(st.top,NULL,free,global,typeparams,NULL);}
function symtable_exit_block(st){var size=st.stack.length
st.cur=NULL;
if(size){st.stack.pop()
if(--size){st.cur=st.stack[size-1]}}
return 1}
function symtable_enter_block(st,name,block,ast,lineno,col_offset,end_lineno,end_col_offset){var prev
if(ast===undefined){console.log('call ste new, key undef',st,name)}
var ste=ste_new(st,name,block,ast,lineno,col_offset,end_lineno,end_col_offset)
st.stack.push(ste)
prev=st.cur
if(prev){ste.comp_iter_expr=prev.comp_iter_expr}
st.cur=ste
if(block===AnnotationBlock){return 1}
if(block===ModuleBlock){st.global=st.cur.symbols}
if(prev){prev.children.push(ste)}
return 1;}
function symtable_lookup(st,name){var mangled=_Py_Mangle(st.private,name)
if(!mangled){return 0;}
var ret=_PyST_GetSymbol(st.cur,mangled)
return ret;}
function symtable_add_def_helper(st,name,flag,ste,_location){var o,dict,val,mangled=_Py_Mangle(st.private,name)
if(!mangled){return 0}
dict=ste.symbols
if(_b_.dict.$contains_string(dict,mangled)){o=_b_.dict.$getitem_string(dict,mangled)
val=o
if((flag & DEF_PARAM)&&(val & DEF_PARAM)){
var exc=PyErr_Format(_b_.SyntaxError,DUPLICATE_ARGUMENT,name);
set_exc_info(exc,st.filename,..._location)
throw exc}
if((flag & DEF_TYPE_PARAM)&&(val & DEF_TYPE_PARAM)){var exc=PyErr_Format(_b_.SyntaxError,DUPLICATE_TYPE_PARAM,name);
set_exc_info(exc,st.filename,...location);
throw exc}
val |=flag}else{val=flag}
if(ste.comp_iter_target){
if(val &(DEF_GLOBAL |DEF_NONLOCAL)){var exc=PyErr_Format(_b_.SyntaxError,NAMED_EXPR_COMP_INNER_LOOP_CONFLICT,name);
set_exc_info(exc,st.filename,..._location)
throw exc}
val |=DEF_COMP_ITER}
o=val
if(o==NULL){return 0}
_b_.dict.$setitem(dict,mangled,o)
if(flag & DEF_PARAM){ste.varnames.push(mangled)}else if(flag & DEF_GLOBAL){
val=flag
if(st.global.hasOwnProperty(mangled)){
val |=st.global[mangled]}
o=val
if(o==NULL){return 0}
st.global[mangled]=o}
return 1}
function symtable_add_def(st,name,flag,_location){return symtable_add_def_helper(st,name,flag,st.cur,_location);}
function symtable_enter_type_param_block(st,name,ast,has_defaults,has_kwdefaults,kind,_location){var prev=st.cur,current_type=st.cur.type;
if(!symtable_enter_block(st,name,TypeParamBlock,ast,..._location)){return 0;}
prev.$type_param=st.cur
if(current_type===ClassBlock){st.cur.can_see_class_scope=1;
if(!symtable_add_def(st,"__classdict__",USE,_location)){return 0;}}
if(kind==$B.ast.ClassDef){
if(!symtable_add_def(st,"type_params",DEF_LOCAL,_location)){return 0;}
if(!symtable_add_def(st,"type_params",USE,_location)){return 0;}
st.st_private=name;
var generic_base=".generic_base";
if(!symtable_add_def(st,generic_base,DEF_LOCAL,_location)){return 0;}
if(!symtable_add_def(st,generic_base,USE,_location)){return 0;}}
if(has_defaults){var defaults=".defaults";
if(!symtable_add_def(st,defaults,DEF_PARAM,_location)){return 0;}}
if(has_kwdefaults){var kwdefaults=".kwdefaults";
if(!symtable_add_def(st,kwdefaults,DEF_PARAM,_location)){return 0;}}
return 1;}
function VISIT_QUIT(ST,X){return X}
function VISIT(ST,TYPE,V){var f=visitor[TYPE]
if(!f(ST,V)){VISIT_QUIT(ST,0);}}
function VISIT_SEQ(ST,TYPE,SEQ){for(var elt of SEQ){if(! visitor[TYPE](ST,elt)){VISIT_QUIT(ST,0)}}}
function VISIT_SEQ_TAIL(ST,TYPE,SEQ,START){for(var i=START,len=SEQ.length;i < len;i++){var elt=SEQ[i];
if(! visitor[TYPE](ST,elt)){VISIT_QUIT(ST,0)}}}
function VISIT_SEQ_WITH_NULL(ST,TYPE,SEQ){for(var elt of SEQ){if(! elt){continue }
if(! visitor[TYPE](ST,elt)){VISIT_QUIT((ST),0)}}}
function symtable_record_directive(st,name,lineno,col_offset,end_lineno,end_col_offset){var data,mangled,res;
if(!st.cur.directives){st.cur.directives=[]}
mangled=_Py_Mangle(st.private,name);
if(!mangled){return 0;}
data=$B.fast_tuple([mangled,lineno,col_offset,end_lineno,end_col_offset])
st.cur.directives.push(data);
return true}
function has_kwonlydefaults(kwonlyargs,kw_defaults){for(var i=0,len=kwonlyargs.length;i < len;i++){if(kw_defaults[i]){return 1;}}
return 0;}
var visitor={}
visitor.stmt=function(st,s){switch(s.constructor){case $B.ast.FunctionDef:
if(!symtable_add_def(st,s.name,DEF_LOCAL,LOCATION(s)))
VISIT_QUIT(st,0)
if(s.args.defaults)
VISIT_SEQ(st,expr,s.args.defaults)
if(s.args.kw_defaults)
VISIT_SEQ_WITH_NULL(st,expr,s.args.kw_defaults)
if(s.type_params.length > 0){if(!symtable_enter_type_param_block(
st,s.name,s.type_params,s.args.defaults !=NULL,has_kwonlydefaults(s.args.kwonlyargs,s.args.kw_defaults),s.constructor,LOCATION(s))){VISIT_QUIT(st,0);}
VISIT_SEQ(st,type_param,s.type_params);}
if(!visitor.annotations(st,s,s.args,s.returns))
VISIT_QUIT(st,0)
if(s.decorator_list){VISIT_SEQ(st,expr,s.decorator_list)}
if(!symtable_enter_block(st,s.name,FunctionBlock,s,...LOCATION(s))){VISIT_QUIT(st,0)}
VISIT(st,'arguments',s.args)
VISIT_SEQ(st,stmt,s.body)
if(!symtable_exit_block(st)){VISIT_QUIT(st,0)}
break;
case $B.ast.ClassDef:
var tmp;
if(!symtable_add_def(st,s.name,DEF_LOCAL,LOCATION(s)))
VISIT_QUIT(st,0)
VISIT_SEQ(st,expr,s.bases)
VISIT_SEQ(st,keyword,s.keywords)
if(s.decorator_list)
VISIT_SEQ(st,expr,s.decorator_list);
if(s.type_params.length > 0){if(!symtable_enter_type_param_block(st,s.name,s.type_params,false,false,s.constructor,LOCATION(s))){VISIT_QUIT(st,0);}
VISIT_SEQ(st,type_param,s.type_params);}
VISIT_SEQ(st,expr,s.bases);
VISIT_SEQ(st,keyword,s.keywords);
if(!symtable_enter_block(st,s.name,ClassBlock,s,s.lineno,s.col_offset,s.end_lineno,s.end_col_offset))
VISIT_QUIT(st,0)
tmp=st.private
st.private=s.name
if(s.type_params.length > 0){if(!symtable_add_def(st,'__type_params__',DEF_LOCAL,LOCATION(s))){VISIT_QUIT(st,0);}
var type_params=".type_params"
if(!symtable_add_def(st,'type_params',USE,LOCATION(s))){VISIT_QUIT(st,0);}}
VISIT_SEQ(st,stmt,s.body)
st.private=tmp
if(! symtable_exit_block(st))
VISIT_QUIT(st,0)
if(s.type_params.length > 0){if(!symtable_exit_block(st))
VISIT_QUIT(st,0);}
break
case $B.ast.TypeAlias:
VISIT(st,expr,s.name);
assert(s.name instanceof $B.ast.Name);
var name=s.name.id,is_in_class=st.cur.type===ClassBlock,is_generic=s.type_params.length > 0
if(is_generic){if(!symtable_enter_type_param_block(
st,name,s.type_params,false,false,s.kind,LOCATION(s))){VISIT_QUIT(st,0);}
VISIT_SEQ(st,type_param,s.type_params);}
if(!symtable_enter_block(st,name,TypeAliasBlock,s,LOCATION(s))){VISIT_QUIT(st,0);}
st.cur.can_see_class_scope=is_in_class;
if(is_in_class && !symtable_add_def(st,'__classdict__',USE,LOCATION(s.value))){VISIT_QUIT(st,0);}
VISIT(st,expr,s.value);
if(!symtable_exit_block(st)){VISIT_QUIT(st,0);}
if(is_generic){if(!symtable_exit_block(st))
VISIT_QUIT(st,0);}
break
case $B.ast.Return:
if(s.value){VISIT(st,expr,s.value)
st.cur.returns_value=1}
break
case $B.ast.Delete:
VISIT_SEQ(st,expr,s.targets)
break
case $B.ast.Assign:
VISIT_SEQ(st,expr,s.targets)
VISIT(st,expr,s.value)
break
case $B.ast.AnnAssign:
if(s.target instanceof $B.ast.Name){var e_name=s.target
var cur=symtable_lookup(st,e_name.id)
if(cur < 0){VISIT_QUIT(st,0)}
if((cur &(DEF_GLOBAL |DEF_NONLOCAL))
&&(st.cur.symbols !=st.global)
&& s.simple){var exc=PyErr_Format(_b_.SyntaxError,cur & DEF_GLOBAL ? GLOBAL_ANNOT :NONLOCAL_ANNOT,e_name.id)
exc.args[1]=[st.filename,s.lineno,s.col_offset+1,s.end_lineno,s.end_col_offset+1]
throw exc}
if(s.simple &&
! symtable_add_def(st,e_name.id,DEF_ANNOT |DEF_LOCAL,LOCATION(e_name))){VISIT_QUIT(st,0)}else{if(s.value
&& !symtable_add_def(st,e_name.id,DEF_LOCAL,LOCATION(e_name))){VISIT_QUIT(st,0)}}}else{VISIT(st,expr,s.target)}
if(!visitor.annotation(st,s.annotation)){VISIT_QUIT(st,0)}
if(s.value){VISIT(st,expr,s.value)}
break
case $B.ast.AugAssign:
VISIT(st,expr,s.target)
VISIT(st,expr,s.value)
break
case $B.ast.For:
VISIT(st,expr,s.target)
VISIT(st,expr,s.iter)
VISIT_SEQ(st,stmt,s.body)
if(s.orelse){VISIT_SEQ(st,stmt,s.orelse)}
break
case $B.ast.While:
VISIT(st,expr,s.test)
VISIT_SEQ(st,stmt,s.body)
if(s.orelse){VISIT_SEQ(st,stmt,s.orelse)}
break
case $B.ast.If:
VISIT(st,expr,s.test)
VISIT_SEQ(st,stmt,s.body)
if(s.orelse){VISIT_SEQ(st,stmt,s.orelse)}
break
case $B.ast.Match:
VISIT(st,expr,s.subject)
VISIT_SEQ(st,match_case,s.cases)
break
case $B.ast.Raise:
if(s.exc){VISIT(st,expr,s.exc)
if(s.cause){VISIT(st,expr,s.cause)}}
break
case $B.ast.Try:
VISIT_SEQ(st,stmt,s.body)
VISIT_SEQ(st,stmt,s.orelse)
VISIT_SEQ(st,excepthandler,s.handlers)
VISIT_SEQ(st,stmt,s.finalbody)
break
case $B.ast.TryStar:
VISIT_SEQ(st,stmt,s.body)
VISIT_SEQ(st,stmt,s.orelse)
VISIT_SEQ(st,excepthandler,s.handlers)
VISIT_SEQ(st,stmt,s.finalbody)
break
case $B.ast.Assert:
VISIT(st,expr,s.test)
if(s.msg){VISIT(st,expr,s.msg);}
break
case $B.ast.Import:
VISIT_SEQ(st,alias,s.names)
break
case $B.ast.ImportFrom:
VISIT_SEQ(st,alias,s.names)
break
case $B.ast.Global:
var seq=s.names
for(var name of seq){var cur=symtable_lookup(st,name)
if(cur < 0){VISIT_QUIT(st,0)}
if(cur &(DEF_PARAM |DEF_LOCAL |USE |DEF_ANNOT)){var msg
if(cur & DEF_PARAM){msg=GLOBAL_PARAM}else if(cur & USE){msg=GLOBAL_AFTER_USE}else if(cur & DEF_ANNOT){msg=GLOBAL_ANNOT}else{
msg=GLOBAL_AFTER_ASSIGN}
var exc=PyErr_Format(_b_.SyntaxError,msg,name)
set_exc_info(exc,st.filename,s.lineno,s.col_offset,s.end_lineno,s.end_col_offset)
throw exc}
if(! symtable_add_def(st,name,DEF_GLOBAL,LOCATION(s)))
VISIT_QUIT(st,0)
if(! symtable_record_directive(st,name,s.lineno,s.col_offset,s.end_lineno,s.end_col_offset))
VISIT_QUIT(st,0)}
break
case $B.ast.Nonlocal:
var seq=s.names;
for(var name of seq){var cur=symtable_lookup(st,name)
if(cur < 0){VISIT_QUIT(st,0)}
if(cur &(DEF_PARAM |DEF_LOCAL |USE |DEF_ANNOT)){var msg
if(cur & DEF_PARAM){msg=NONLOCAL_PARAM}else if(cur & USE){msg=NONLOCAL_AFTER_USE}else if(cur & DEF_ANNOT){msg=NONLOCAL_ANNOT}else{
msg=NONLOCAL_AFTER_ASSIGN}
var exc=PyErr_Format(_b_.SyntaxError,msg,name)
set_exc_info(exc,st.filename,s.lineno,s.col_offset,s.end_lineno,s.end_col_offset)
throw exc}
if(!symtable_add_def(st,name,DEF_NONLOCAL,LOCATION(s)))
VISIT_QUIT(st,0)
if(!symtable_record_directive(st,name,s.lineno,s.col_offset,s.end_lineno,s.end_col_offset))
VISIT_QUIT(st,0)}
break
case $B.ast.Expr:
VISIT(st,expr,s.value)
break
case $B.ast.Pass:
case $B.ast.Break:
case $B.ast.Continue:
break
case $B.ast.With:
VISIT_SEQ(st,'withitem',s.items)
VISIT_SEQ(st,stmt,s.body)
break
case $B.ast.AsyncFunctionDef:
if(!symtable_add_def(st,s.name,DEF_LOCAL,LOCATION(s)))
VISIT_QUIT(st,0)
if(s.args.defaults)
VISIT_SEQ(st,expr,s.args.defaults)
if(s.args.kw_defaults)
VISIT_SEQ_WITH_NULL(st,expr,s.args.kw_defaults)
if(!visitor.annotations(st,s,s.args,s.returns))
VISIT_QUIT(st,0)
if(s.decorator_list)
VISIT_SEQ(st,expr,s.decorator_list)
if(s.type_params.length > 0){if(!symtable_enter_type_param_block(
st,s.name,s.type_params,s.args.defaults !=NULL,has_kwonlydefaults(s.args.kwonlyargs,s.args.kw_defaults),s.constructor,LOCATION(s))){VISIT_QUIT(st,0);}
VISIT_SEQ(st,type_param,s.type_params);}
if(!visitor.annotations(st,s,s.args,s.returns))
VISIT_QUIT(st,0);
if(!symtable_enter_block(st,s.name,FunctionBlock,s,s.lineno,s.col_offset,s.end_lineno,s.end_col_offset))
VISIT_QUIT(st,0)
st.cur.coroutine=1
VISIT(st,'arguments',s.args)
VISIT_SEQ(st,stmt,s.body)
if(! symtable_exit_block(st))
VISIT_QUIT(st,0)
if(s.type_params.length > 0){if(!symtable_exit_block(st))
VISIT_QUIT(st,0);}
break
case $B.ast.AsyncWith:
VISIT_SEQ(st,withitem,s.items)
VISIT_SEQ(st,stmt,s.body)
break
case $B.ast.AsyncFor:
VISIT(st,expr,s.target)
VISIT(st,expr,s.iter)
VISIT_SEQ(st,stmt,s.body)
if(s.orelse){VISIT_SEQ(st,stmt,s.orelse)}
break
default:
console.log('unhandled',s)
break}
VISIT_QUIT(st,1)}
function symtable_extend_namedexpr_scope(st,e){assert(st.stack);
assert(e instanceof $B.ast.Name);
var target_name=e.id;
var i,size,ste;
size=st.stack.length
assert(size);
for(i=size-1;i >=0;i--){ste=st.stack[i]
if(ste.comprehension){var target_in_scope=_PyST_GetSymbol(ste,target_name);
if(target_in_scope & DEF_COMP_ITER){var exc=PyErr_Format(_b_.SyntaxError,NAMED_EXPR_COMP_CONFLICT,target_name);
set_exc_info(exc,st.filename,e.lineno,e.col_offset,e.ed_lineno,e.end_col_offset)
throw exc}
continue;}
if(_PyST_IsFunctionLike(ste)){var target_in_scope=_PyST_GetSymbol(ste,target_name);
if(target_in_scope & DEF_GLOBAL){if(!symtable_add_def(st,target_name,DEF_GLOBAL,LOCATION(e)))
VISIT_QUIT(st,0);}else{
if(!symtable_add_def(st,target_name,DEF_NONLOCAL,LOCATION(e)))
VISIT_QUIT(st,0);}
if(!symtable_record_directive(st,target_name,LOCATION(e)))
VISIT_QUIT(st,0);
return symtable_add_def_helper(st,target_name,DEF_LOCAL,ste,LOCATION(e));}
if(ste.type==ModuleBlock){if(!symtable_add_def(st,target_name,DEF_GLOBAL,LOCATION(e)))
VISIT_QUIT(st,0);
if(!symtable_record_directive(st,target_name,LOCATION(e)))
VISIT_QUIT(st,0);
return symtable_add_def_helper(st,target_name,DEF_GLOBAL,ste,LOCATION(e));}
if(ste.type==ClassBlock){var exc=PyErr_Format(_b_.SyntaxError,NAMED_EXPR_COMP_IN_CLASS);
set_exc_info(exc,st.filename,e.lineno,e.col_offset,e.end_lineno,e.end_col_offset);
throw exc}}
assert(0);
return 0;}
function symtable_handle_namedexpr(st,e){if(st.cur.comp_iter_expr > 0){
var exc=PyErr_Format(PyExc_SyntaxError,NAMED_EXPR_COMP_ITER_EXPR);
set_exc_info(exc,st.filename,e.lineno,e.col_offset,e.end_lineno,e.end_col_offset);
throw exc}
if(st.cur.comprehension){
if(!symtable_extend_namedexpr_scope(st,e.target))
return 0;}
VISIT(st,expr,e.value);
VISIT(st,expr,e.target);
return 1;}
const alias='alias',comprehension='comprehension',excepthandler='excepthandler',expr='expr',keyword='keyword',match_case='match_case',pattern='pattern',stmt='stmt',type_param='type_param',withitem='withitem'
visitor.expr=function(st,e){switch(e.constructor){case $B.ast.NamedExpr:
if(!symtable_raise_if_annotation_block(st,"named expression",e)){VISIT_QUIT(st,0);}
if(!symtable_handle_namedexpr(st,e))
VISIT_QUIT(st,0);
break;
case $B.ast.BoolOp:
VISIT_SEQ(st,'expr',e.values);
break;
case $B.ast.BinOp:
VISIT(st,'expr',e.left);
VISIT(st,'expr',e.right);
break;
case $B.ast.UnaryOp:
VISIT(st,'expr',e.operand);
break;
case $B.ast.Lambda:{if(!GET_IDENTIFIER('lambda'))
VISIT_QUIT(st,0);
if(e.args.defaults)
VISIT_SEQ(st,'expr',e.args.defaults);
if(e.args.kw_defaults)
VISIT_SEQ_WITH_NULL(st,'expr',e.args.kw_defaults);
if(!symtable_enter_block(st,lambda,FunctionBlock,e,e.lineno,e.col_offset,e.end_lineno,e.end_col_offset))
VISIT_QUIT(st,0);
VISIT(st,'arguments',e.args);
VISIT(st,'expr',e.body);
if(!symtable_exit_block(st))
VISIT_QUIT(st,0);
break;}
case $B.ast.IfExp:
VISIT(st,'expr',e.test);
VISIT(st,'expr',e.body);
VISIT(st,'expr',e.orelse);
break;
case $B.ast.Dict:
VISIT_SEQ_WITH_NULL(st,'expr',e.keys);
VISIT_SEQ(st,'expr',e.values);
break;
case $B.ast.Set:
VISIT_SEQ(st,'expr',e.elts);
break;
case $B.ast.GeneratorExp:
if(!visitor.genexp(st,e))
VISIT_QUIT(st,0);
break;
case $B.ast.ListComp:
if(!visitor.listcomp(st,e))
VISIT_QUIT(st,0);
break;
case $B.ast.SetComp:
if(!visitor.setcomp(st,e))
VISIT_QUIT(st,0);
break;
case $B.ast.DictComp:
if(!visitor.dictcomp(st,e))
VISIT_QUIT(st,0);
break;
case $B.ast.Yield:
if(!symtable_raise_if_annotation_block(st,"yield expression",e)){VISIT_QUIT(st,0);}
if(e.value)
VISIT(st,'expr',e.value);
st.cur.generator=1;
if(st.cur.comprehension){return symtable_raise_if_comprehension_block(st,e);}
break;
case $B.ast.YieldFrom:
if(!symtable_raise_if_annotation_block(st,"yield expression",e)){VISIT_QUIT(st,0);}
VISIT(st,'expr',e.value);
st.cur.generator=1;
if(st.cur.comprehension){return symtable_raise_if_comprehension_block(st,e);}
break;
case $B.ast.Await:
if(!symtable_raise_if_annotation_block(st,"await expression",e)){VISIT_QUIT(st,0);}
VISIT(st,'expr',e.value);
st.cur.coroutine=1;
break;
case $B.ast.Compare:
VISIT(st,'expr',e.left);
VISIT_SEQ(st,'expr',e.comparators);
break;
case $B.ast.Call:
VISIT(st,'expr',e.func);
VISIT_SEQ(st,'expr',e.args);
VISIT_SEQ_WITH_NULL(st,'keyword',e.keywords);
break;
case $B.ast.FormattedValue:
VISIT(st,'expr',e.value);
if(e.format_spec)
VISIT(st,'expr',e.format_spec);
break;
case $B.ast.JoinedStr:
VISIT_SEQ(st,'expr',e.values);
break;
case $B.ast.Constant:
break;
case $B.ast.Attribute:
VISIT(st,'expr',e.value);
break;
case $B.ast.Subscript:
VISIT(st,'expr',e.value);
VISIT(st,'expr',e.slice);
break;
case $B.ast.Starred:
VISIT(st,'expr',e.value);
break;
case $B.ast.Slice:
if(e.lower)
VISIT(st,expr,e.lower)
if(e.upper)
VISIT(st,expr,e.upper)
if(e.step)
VISIT(st,expr,e.step)
break;
case $B.ast.Name:
var flag=e.ctx instanceof $B.ast.Load ? USE :DEF_LOCAL
if(! symtable_add_def(st,e.id,flag,LOCATION(e)))
VISIT_QUIT(st,0);
if(e.ctx instanceof $B.ast.Load &&
_PyST_IsFunctionLike(st.cur)&&
e.id=="super"){if(!GET_IDENTIFIER('__class__')||
!symtable_add_def(st,'__class__',USE,LOCATION(e)))
VISIT_QUIT(st,0);}
break;
case $B.ast.List:
VISIT_SEQ(st,expr,e.elts);
break;
case $B.ast.Tuple:
VISIT_SEQ(st,expr,e.elts);
break;}
VISIT_QUIT(st,1);}
visitor.type_param=function(st,tp){switch(tp.constructor){case $B.ast.TypeVar:
if(!symtable_add_def(st,tp.name,DEF_TYPE_PARAM |DEF_LOCAL,LOCATION(tp)))
VISIT_QUIT(st,0);
if(tp.bound){var is_in_class=st.cur.can_see_class_scope;
if(!symtable_enter_block(st,tp.name,TypeVarBoundBlock,tp,LOCATION(tp)))
VISIT_QUIT(st,0);
st.cur.can_see_class_scope=is_in_class;
if(is_in_class && !symtable_add_def(st,"__classdict__",USE,LOCATION(tp.bound))){VISIT_QUIT(st,0);}
VISIT(st,expr,tp.bound);
if(!symtable_exit_block(st))
VISIT_QUIT(st,0);}
break;
case $B.ast.TypeVarTuple:
if(!symtable_add_def(st,tp.name,DEF_TYPE_PARAM |DEF_LOCAL,LOCATION(tp)))
VISIT_QUIT(st,0);
break;
case $B.ast.ParamSpec:
if(!symtable_add_def(st,tp.name,DEF_TYPE_PARAM |DEF_LOCAL,LOCATION(tp)))
VISIT_QUIT(st,0);
break;}
VISIT_QUIT(st,1);}
visitor.pattern=function(st,p){switch(p.constructor){case $B.ast.MatchValue:
VISIT(st,expr,p.value);
break;
case $B.ast.MatchSingleton:
break;
case $B.ast.MatchSequence:
VISIT_SEQ(st,pattern,p.patterns);
break;
case $B.ast.MatchStar:
if(p.name){symtable_add_def(st,p.name,DEF_LOCAL,LOCATION(p));}
break;
case $B.ast.MatchMapping:
VISIT_SEQ(st,expr,p.keys);
VISIT_SEQ(st,pattern,p.patterns);
if(p.rest){symtable_add_def(st,p.rest,DEF_LOCAL,LOCATION(p));}
break;
case $B.ast.MatchClass:
VISIT(st,expr,p.cls);
VISIT_SEQ(st,pattern,p.patterns);
VISIT_SEQ(st,pattern,p.kwd_patterns);
break;
case $B.ast.MatchAs:
if(p.pattern){VISIT(st,pattern,p.pattern);}
if(p.name){symtable_add_def(st,p.name,DEF_LOCAL,LOCATION(p));}
break;
case $B.ast.MatchOr:
VISIT_SEQ(st,pattern,p.patterns);
break;}
VISIT_QUIT(st,1);}
function symtable_implicit_arg(st,pos){var id='.'+pos
if(!symtable_add_def(st,id,DEF_PARAM,ST_LOCATION(st.cur))){return 0;}
return 1;}
visitor.params=function(st,args){var i;
if(!args)
return-1;
for(var arg of args){if(!symtable_add_def(st,arg.arg,DEF_PARAM,LOCATION(arg)))
return 0;}
return 1;}
visitor.annotation=function(st,annotation){var future_annotations=st.future.features & CO_FUTURE_ANNOTATIONS;
if(future_annotations &&
!symtable_enter_block(st,'_annotation',AnnotationBlock,annotation,annotation.lineno,annotation.col_offset,annotation.end_lineno,annotation.end_col_offset)){VISIT_QUIT(st,0);}
VISIT(st,expr,annotation);
if(future_annotations && !symtable_exit_block(st)){VISIT_QUIT(st,0);}
return 1;}
visitor.argannotations=function(st,args){var i;
if(!args)
return-1;
for(var arg of args){if(arg.annotation)
VISIT(st,expr,arg.annotation);}
return 1;}
visitor.annotations=function(st,o,a,returns){var future_annotations=st.future.ff_features & CO_FUTURE_ANNOTATIONS;
if(future_annotations &&
!symtable_enter_block(st,'_annotation',AnnotationBlock,o,o.lineno,o.col_offset,o.end_lineno,o.end_col_offset)){VISIT_QUIT(st,0);}
if(a.posonlyargs && !visitor.argannotations(st,a.posonlyargs))
return 0;
if(a.args && !visitor.argannotations(st,a.args))
return 0;
if(a.vararg && a.vararg.annotation)
VISIT(st,expr,a.vararg.annotation);
if(a.kwarg && a.kwarg.annotation)
VISIT(st,expr,a.kwarg.annotation);
if(a.kwonlyargs && !visitor.argannotations(st,a.kwonlyargs))
return 0;
if(future_annotations && !symtable_exit_block(st)){VISIT_QUIT(st,0);}
if(returns && !visitor.annotation(st,returns)){VISIT_QUIT(st,0);}
return 1;}
visitor.arguments=function(st,a){
if(a.posonlyargs && !visitor.params(st,a.posonlyargs))
return 0;
if(a.args && !visitor.params(st,a.args))
return 0;
if(a.kwonlyargs && !visitor.params(st,a.kwonlyargs))
return 0;
if(a.vararg){if(!symtable_add_def(st,a.vararg.arg,DEF_PARAM,LOCATION(a.vararg)))
return 0;
st.cur.varargs=1;}
if(a.kwarg){if(!symtable_add_def(st,a.kwarg.arg,DEF_PARAM,LOCATION(a.kwarg)))
return 0;
st.cur.varkeywords=1;}
return 1;}
visitor.excepthandler=function(st,eh){if(eh.type)
VISIT(st,expr,eh.type);
if(eh.name)
if(!symtable_add_def(st,eh.name,DEF_LOCAL,LOCATION(eh)))
return 0;
VISIT_SEQ(st,stmt,eh.body);
return 1;}
visitor.withitem=function(st,item){VISIT(st,'expr',item.context_expr);
if(item.optional_vars){VISIT(st,'expr',item.optional_vars);}
return 1;}
visitor.match_case=function(st,m){VISIT(st,pattern,m.pattern);
if(m.guard){VISIT(st,expr,m.guard);}
VISIT_SEQ(st,stmt,m.body);
return 1;}
visitor.alias=function(st,a){
var store_name,name=(a.asname==NULL)? a.name :a.asname;
var dot=name.search('\\.');
if(dot !=-1){store_name=name.substring(0,dot);
if(!store_name)
return 0;}else{store_name=name;}
if(name !="*"){var r=symtable_add_def(st,store_name,DEF_IMPORT,LOCATION(a));
return r;}else{if(st.cur.type !=ModuleBlock){var lineno=a.lineno,col_offset=a.col_offset,end_lineno=a.end_lineno,end_col_offset=a.end_col_offset;
var exc=PyErr_SetString(PyExc_SyntaxError,IMPORT_STAR_WARNING);
set_exc_info(exc,st.filename,lineno,col_offset,end_lineno,end_col_offset);
throw exc}
st.cur.$has_import_star=true
return 1;}}
visitor.comprehension=function(st,lc){st.cur.comp_iter_target=1;
VISIT(st,expr,lc.target);
st.cur.comp_iter_target=0;
st.cur.comp_iter_expr++;
VISIT(st,expr,lc.iter);
st.cur.comp_iter_expr--;
VISIT_SEQ(st,expr,lc.ifs);
if(lc.is_async){st.cur.coroutine=1;}
return 1;}
visitor.keyword=function(st,k){VISIT(st,expr,k.value);
return 1;}
function symtable_handle_comprehension(st,e,scope_name,generators,elt,value){var is_generator=(e.constructor===$B.ast.GeneratorExp);
var outermost=generators[0]
st.cur.comp_iter_expr++;
VISIT(st,expr,outermost.iter);
st.cur.comp_iter_expr--;
if(!scope_name ||
!symtable_enter_block(st,scope_name,FunctionBlock,e,e.lineno,e.col_offset,e.end_lineno,e.end_col_offset)){return 0;}
switch(e.constructor){case $B.ast.ListComp:
st.cur.comprehension=ListComprehension;
break;
case $B.ast.SetComp:
st.cur.comprehension=SetComprehension;
break;
case $B.ast.DictComp:
st.cur.comprehension=DictComprehension;
break;
default:
st.cur.comprehension=GeneratorExpression;
break;}
if(outermost.is_async){st.cur.coroutine=1;}
if(!symtable_implicit_arg(st,0)){symtable_exit_block(st);
return 0;}
st.cur.comp_iter_target=1;
VISIT(st,expr,outermost.target);
st.cur.comp_iter_target=0;
VISIT_SEQ(st,expr,outermost.ifs);
VISIT_SEQ_TAIL(st,comprehension,generators,1);
if(value)
VISIT(st,expr,value);
VISIT(st,expr,elt);
st.cur.generator=is_generator;
var is_async=st.cur.coroutine && !is_generator;
if(!symtable_exit_block(st)){return 0;}
if(is_async){st.cur.coroutine=1;}
return 1;}
visitor.genexp=function(st,e){return symtable_handle_comprehension(st,e,'genexpr',e.generators,e.elt,NULL);}
visitor.listcomp=function(st,e){return symtable_handle_comprehension(st,e,'listcomp',e.generators,e.elt,NULL);}
visitor.setcomp=function(st,e){return symtable_handle_comprehension(st,e,'setcomp',e.generators,e.elt,NULL);}
visitor.dictcomp=function(st,e){return symtable_handle_comprehension(st,e,'dictcomp',e.generators,e.key,e.value);}
function symtable_raise_if_annotation_block(st,name,e){var type=st.cur.type,exc
if(type==AnnotationBlock)
exc=PyErr_Format(PyExc_SyntaxError,ANNOTATION_NOT_ALLOWED,name);
else if(type==TypeVarBoundBlock)
exc=PyErr_Format(PyExc_SyntaxError,TYPEVAR_BOUND_NOT_ALLOWED,name);
else if(type==TypeAliasBlock)
exc=PyErr_Format(PyExc_SyntaxError,TYPEALIAS_NOT_ALLOWED,name);
else if(type==TypeParamBlock)
exc=PyErr_Format(PyExc_SyntaxError,TYPEPARAM_NOT_ALLOWED,name);
else
return 1;
set_exc_info(exc,st.filename,e.lineno,e.col_offset,e.end_lineno,e.end_col_offset);
throw exc}
function symtable_raise_if_comprehension_block(st,e){var type=st.cur.comprehension;
var exc=PyErr_SetString(PyExc_SyntaxError,(type==ListComprehension)? "'yield' inside list comprehension" :
(type==SetComprehension)? "'yield' inside set comprehension" :
(type==DictComprehension)? "'yield' inside dict comprehension" :
"'yield' inside generator expression");
exc.$frame_obj=$B.frame_obj
set_exc_info(exc,st.filename,e.lineno,e.col_offset,e.end_lineno,e.end_col_offset);
throw exc}
function _Py_SymtableStringObjectFlags(str,filename,start,flags){var st,mod,arena;
arena=_PyArena_New();
if(arena==NULL)
return NULL;
mod=_PyParser_ASTFromString(str,filename,start,flags,arena);
if(mod==NULL){_PyArena_Free(arena);
return NULL;}
var future=_PyFuture_FromAST(mod,filename);
if(future==NULL){_PyArena_Free(arena);
return NULL;}
future.features |=flags.cf_flags;
st=_PySymtable_Build(mod,filename,future);
PyObject_Free(future);
_PyArena_Free(arena);
return st;}})(__BRYTHON__)
;
var docs={ArithmeticError:"Base class for arithmetic errors.",AssertionError:"Assertion failed.",AttributeError:"Attribute not found.",BaseException:"Common base class for all exceptions",BaseExceptionGroup:"A combination of multiple unrelated exceptions.",BlockingIOError:"I/O operation would block.",BrokenPipeError:"Broken pipe.",BufferError:"Buffer error.",BytesWarning:"Base class for warnings about bytes and buffer related problems, mostly\nrelated to conversion from str or comparing to str.",ChildProcessError:"Child process error.",ConnectionAbortedError:"Connection aborted.",ConnectionError:"Connection error.",ConnectionRefusedError:"Connection refused.",ConnectionResetError:"Connection reset.",DeprecationWarning:"Base class for warnings about deprecated features.",EOFError:"Read beyond end of file.",Ellipsis:"",EncodingWarning:"Base class for warnings about encodings.",EnvironmentError:"Base class for I/O related errors.",Exception:"Common base class for all non-exit exceptions.",ExceptionGroup:"",False:"bool(x) -> bool\n\nReturns True when the argument x is true, False otherwise.\nThe builtins True and False are the only two instances of the class bool.\nThe class bool is a subclass of the class int, and cannot be subclassed.",FileExistsError:"File already exists.",FileNotFoundError:"File not found.",FloatingPointError:"Floating point operation failed.",FutureWarning:"Base class for warnings about constructs that will change semantically\nin the future.",GeneratorExit:"Request that a generator exit.",IOError:"Base class for I/O related errors.",ImportError:"Import can't find module, or can't find name in module.",ImportWarning:"Base class for warnings about probable mistakes in module imports",IndentationError:"Improper indentation.",IndexError:"Sequence index out of range.",InterruptedError:"Interrupted by signal.",IsADirectoryError:"Operation doesn't work on directories.",KeyError:"Mapping key not found.",KeyboardInterrupt:"Program interrupted by user.",LookupError:"Base class for lookup errors.",MemoryError:"Out of memory.",ModuleNotFoundError:"Module not found.",NameError:"Name not found globally.",None:"",NotADirectoryError:"Operation only works on directories.",NotImplemented:"",NotImplementedError:"Method or function hasn't been implemented yet.",OSError:"Base class for I/O related errors.",OverflowError:"Result too large to be represented.",PendingDeprecationWarning:"Base class for warnings about features which will be deprecated\nin the future.",PermissionError:"Not enough permissions.",ProcessLookupError:"Process not found.",RecursionError:"Recursion limit exceeded.",ReferenceError:"Weak ref proxy used after referent went away.",ResourceWarning:"Base class for warnings about resource usage.",RuntimeError:"Unspecified run-time error.",RuntimeWarning:"Base class for warnings about dubious runtime behavior.",StopAsyncIteration:"Signal the end from iterator.__anext__().",StopIteration:"Signal the end from iterator.__next__().",SyntaxError:"Invalid syntax.",SyntaxWarning:"Base class for warnings about dubious syntax.",SystemError:"Internal error in the Python interpreter.\n\nPlease report this to the Python maintainer, along with the traceback,\nthe Python version, and the hardware/OS platform and version.",SystemExit:"Request to exit from the interpreter.",TabError:"Improper mixture of spaces and tabs.",TimeoutError:"Timeout expired.",True:"bool(x) -> bool\n\nReturns True when the argument x is true, False otherwise.\nThe builtins True and False are the only two instances of the class bool.\nThe class bool is a subclass of the class int, and cannot be subclassed.",TypeError:"Inappropriate argument type.",UnboundLocalError:"Local name referenced but not bound to a value.",UnicodeDecodeError:"Unicode decoding error.",UnicodeEncodeError:"Unicode encoding error.",UnicodeError:"Unicode related error.",UnicodeTranslateError:"Unicode translation error.",UnicodeWarning:"Base class for warnings about Unicode related problems, mostly\nrelated to conversion problems.",UserWarning:"Base class for warnings generated by user code.",ValueError:"Inappropriate argument value (of correct type).",Warning:"Base class for warning categories.",WindowsError:"Base class for I/O related errors.",ZeroDivisionError:"Second argument to a division or modulo operation was zero.",__debug__:"bool(x) -> bool\n\nReturns True when the argument x is true, False otherwise.\nThe builtins True and False are the only two instances of the class bool.\nThe class bool is a subclass of the class int, and cannot be subclassed.",abs:"Return the absolute value of the argument.",aiter:"Return an AsyncIterator for an AsyncIterable object.",all:"Return True if bool(x) is True for all values x in the iterable.\n\nIf the iterable is empty, return True.",anext:"async anext(aiterator[, default])\n\nReturn the next item from the async iterator.  If default is given and the async\niterator is exhausted, it is returned instead of raising StopAsyncIteration.",any:"Return True if bool(x) is True for any x in the iterable.\n\nIf the iterable is empty, return False.",ascii:"Return an ASCII-only representation of an object.\n\nAs repr(), return a string containing a printable representation of an\nobject, but escape the non-ASCII characters in the string returned by\nrepr() using \\\\x, \\\\u or \\\\U escapes. This generates a string similar\nto that returned by repr() in Python 2.",bin:"Return the binary representation of an integer.\n\n   >>> bin(2796202)\n   '0b1010101010101010101010'",bool:"bool(x) -> bool\n\nReturns True when the argument x is true, False otherwise.\nThe builtins True and False are the only two instances of the class bool.\nThe class bool is a subclass of the class int, and cannot be subclassed.",breakpoint:"breakpoint(*args, **kws)\n\nCall sys.breakpointhook(*args, **kws).  sys.breakpointhook() must accept\nwhatever arguments are passed.\n\nBy default, this drops you into the pdb debugger.",bytearray:"bytearray(iterable_of_ints) -> bytearray\nbytearray(string, encoding[, errors]) -> bytearray\nbytearray(bytes_or_buffer) -> mutable copy of bytes_or_buffer\nbytearray(int) -> bytes array of size given by the parameter initialized with null bytes\nbytearray() -> empty bytes array\n\nConstruct a mutable bytearray object from:\n  - an iterable yielding integers in range(256)\n  - a text string encoded using the specified encoding\n  - a bytes or a buffer object\n  - any object implementing the buffer API.\n  - an integer",bytes:"bytes(iterable_of_ints) -> bytes\nbytes(string, encoding[, errors]) -> bytes\nbytes(bytes_or_buffer) -> immutable copy of bytes_or_buffer\nbytes(int) -> bytes object of size given by the parameter initialized with null bytes\nbytes() -> empty bytes object\n\nConstruct an immutable array of bytes from:\n  - an iterable yielding integers in range(256)\n  - a text string encoded using the specified encoding\n  - any object implementing the buffer API.\n  - an integer",callable:"Return whether the object is callable (i.e., some kind of function).\n\nNote that classes are callable, as are instances of classes with a\n__call__() method.",chr:"Return a Unicode string of one character with ordinal i; 0 <= i <= 0x10ffff.",classmethod:"classmethod(function) -> method\n\nConvert a function to be a class method.\n\nA class method receives the class as implicit first argument,\njust like an instance method receives the instance.\nTo declare a class method, use this idiom:\n\n  class C:\n      @classmethod\n      def f(cls, arg1, arg2, argN):\n          ...\n\nIt can be called either on the class (e.g. C.f()) or on an instance\n(e.g. C().f()).  The instance is ignored except for its class.\nIf a class method is called for a derived class, the derived class\nobject is passed as the implied first argument.\n\nClass methods are different than C++ or Java static methods.\nIf you want those, see the staticmethod builtin.",compile:"Compile source into a code object that can be executed by exec() or eval().\n\nThe source code may represent a Python module, statement or expression.\nThe filename will be used for run-time error messages.\nThe mode must be 'exec' to compile a module, 'single' to compile a\nsingle (interactive) statement, or 'eval' to compile an expression.\nThe flags argument, if present, controls which future statements influence\nthe compilation of the code.\nThe dont_inherit argument, if true, stops the compilation inheriting\nthe effects of any future statements in effect in the code calling\ncompile; if absent or false these statements do influence the compilation,\nin addition to any features explicitly specified.",complex:"Create a complex number from a real part and an optional imaginary part.\n\nThis is equivalent to (real + imag*1j) where imag defaults to 0.",copyright:"interactive prompt objects for printing the license text, a list of\n    contributors and the copyright notice.",credits:"interactive prompt objects for printing the license text, a list of\n    contributors and the copyright notice.",delattr:"Deletes the named attribute from the given object.\n\ndelattr(x, 'y') is equivalent to ``del x.y``",dict:"dict() -> new empty dictionary\ndict(mapping) -> new dictionary initialized from a mapping object's\n    (key, value) pairs\ndict(iterable) -> new dictionary initialized as if via:\n    d = {}\n    for k, v in iterable:\n        d[k] = v\ndict(**kwargs) -> new dictionary initialized with the name=value pairs\n    in the keyword argument list.  For example:  dict(one=1, two=2)",dir:"Show attributes of an object.\n\nIf called without an argument, return the names in the current scope.\nElse, return an alphabetized list of names comprising (some of) the attributes\nof the given object, and of attributes reachable from it.\nIf the object supplies a method named __dir__, it will be used; otherwise\nthe default dir() logic is used and returns:\n  for a module object: the module's attributes.\n  for a class object:  its attributes, and recursively the attributes\n    of its bases.\n  for any other object: its attributes, its class's attributes, and\n    recursively the attributes of its class's base classes.",divmod:"Return the tuple (x//y, x%y).  Invariant: div*y + mod == x.",enumerate:"Return an enumerate object.\n\n  iterable\n    an object supporting iteration\n\nThe enumerate object yields pairs containing a count (from start, which\ndefaults to zero) and a value yielded by the iterable argument.\n\nenumerate is useful for obtaining an indexed list:\n    (0, seq[0]), (1, seq[1]), (2, seq[2]), ...",eval:"Evaluate the given source in the C of globals and locals.\n\nThe source may be a string representing a Python expression\nor a code object as returned by compile().\nThe globals must be a dictionary and locals can be any mapping,\ndefaulting to the current globals and locals.\nIf only globals is given, locals defaults to it.",exec:"Execute the given source in the C of globals and locals.\n\nThe source may be a string representing one or more Python statements\nor a code object as returned by compile().\nThe globals must be a dictionary and locals can be any mapping,\ndefaulting to the current globals and locals.\nIf only globals is given, locals defaults to it.\nThe closure must be a tuple of cellvars, and can only be used\nwhen source is a code object requiring exactly that many cellvars.",exit:"",filter:"filter(function or None, iterable) --> filter object\n\nReturn an iterator yielding those items of iterable for which function(item)\nis true. If function is None, return the items that are true.",float:"Convert a string or number to a floating point number, if possible.",format:"Return type(value).__format__(value, format_spec)\n\nMany built-in types implement format_spec according to the\nFormat Specification Mini-language. See help('FORMATTING').\n\nIf type(value) does not supply a method named __format__\nand format_spec is empty, then str(value) is returned.\nSee also help('SPECIALMETHODS').",frozenset:"frozenset() -> empty frozenset object\nfrozenset(iterable) -> frozenset object\n\nBuild an immutable unordered collection of unique elements.",getattr:"Get a named attribute from an object.\n\ngetattr(x, 'y') is equivalent to x.y\nWhen a default argument is given, it is returned when the attribute doesn't\nexist; without it, an exception is raised in that case.",globals:"Return the dictionary containing the current scope's global variables.\n\nNOTE: Updates to this dictionary *will* affect name lookups in the current\nglobal scope and vice-versa.",hasattr:"Return whether the object has an attribute with the given name.\n\nThis is done by calling getattr(obj, name) and catching AttributeError.",hash:"Return the hash value for the given object.\n\nTwo objects that compare equal must also have the same hash value, but the\nreverse is not necessarily true.",help:"Define the builtin 'help'.\n\n    This is a wrapper around pydoc.help that provides a helpful message\n    when 'help' is typed at the Python interactive prompt.\n\n    Calling help() at the Python prompt starts an interactive help session.\n    Calling help(thing) prints help for the python object 'thing'.\n    ",hex:"Return the hexadecimal representation of an integer.\n\n   >>> hex(12648430)\n   '0xc0ffee'",id:"Return the identity of an object.\n\nThis is guaranteed to be unique among simultaneously existing objects.\n(CPython uses the object's memory address.)",input:"Read a string from standard input.  The trailing newline is stripped.\n\nThe prompt string, if given, is printed to standard output without a\ntrailing newline before reading input.\n\nIf the user hits EOF (*nix: Ctrl-D, Windows: Ctrl-Z+Return), raise EOFError.\nOn *nix systems, readline is used if available.",int:"int([x]) -> integer\nint(x, base=10) -> integer\n\nConvert a number or string to an integer, or return 0 if no arguments\nare given.  If x is a number, return x.__int__().  For floating point\nnumbers, this truncates towards zero.\n\nIf x is not a number or if base is given, then x must be a string,\nbytes, or bytearray instance representing an integer literal in the\ngiven base.  The literal can be preceded by '+' or '-' and be surrounded\nby whitespace.  The base defaults to 10.  Valid bases are 0 and 2-36.\nBase 0 means to interpret the base from the string as an integer literal.\n>>> int('0b100', base=0)\n4",isinstance:"Return whether an object is an instance of a class or of a subclass thereof.\n\nA tuple, as in ``isinstance(x, (A, B, ...))``, may be given as the target to\ncheck against. This is equivalent to ``isinstance(x, A) or isinstance(x, B)\nor ...`` etc.",issubclass:"Return whether 'cls' is derived from another class or is the same class.\n\nA tuple, as in ``issubclass(x, (A, B, ...))``, may be given as the target to\ncheck against. This is equivalent to ``issubclass(x, A) or issubclass(x, B)\nor ...``.",iter:"Get an iterator from an object.\n\nIn the first form, the argument must supply its own iterator, or be a sequence.\nIn the second form, the callable is called until it returns the sentinel.",len:"Return the number of items in a container.",license:"interactive prompt objects for printing the license text, a list of\n    contributors and the copyright notice.",list:"Built-in mutable sequence.\n\nIf no argument is given, the constructor creates a new empty list.\nThe argument must be an iterable if specified.",locals:"Return a dictionary containing the current scope's local variables.\n\nNOTE: Whether or not updates to this dictionary will affect name lookups in\nthe local scope and vice-versa is *implementation dependent* and not\ncovered by any backwards compatibility guarantees.",map:"map(func, *iterables) --> map object\n\nMake an iterator that computes the function using arguments from\neach of the iterables.  Stops when the shortest iterable is exhausted.",max:"max(iterable, *[, default=obj, key=func]) -> value\nmax(arg1, arg2, *args, *[, key=func]) -> value\n\nWith a single iterable argument, return its biggest item. The\ndefault keyword-only argument specifies an object to return if\nthe provided iterable is empty.\nWith two or more arguments, return the largest argument.",memoryview:"Create a new memoryview object which references the given object.",min:"min(iterable, *[, default=obj, key=func]) -> value\nmin(arg1, arg2, *args, *[, key=func]) -> value\n\nWith a single iterable argument, return its smallest item. The\ndefault keyword-only argument specifies an object to return if\nthe provided iterable is empty.\nWith two or more arguments, return the smallest argument.",next:"Return the next item from the iterator.\n\nIf default is given and the iterator is exhausted,\nit is returned instead of raising StopIteration.",object:"The base class of the class hierarchy.\n\nWhen called, it accepts no arguments and returns a new featureless\ninstance that has no instance attributes and cannot be given any.\n",oct:"Return the octal representation of an integer.\n\n   >>> oct(342391)\n   '0o1234567'",open:"Open file and return a stream.  Raise OSError upon failure.\n\nfile is either a text or byte string giving the name (and the path\nif the file isn't in the current working directory) of the file to\nbe opened or an integer file descriptor of the file to be\nwrapped. (If a file descriptor is given, it is closed when the\nreturned I/O object is closed, unless closefd is set to False.)\n\nmode is an optional string that specifies the mode in which the file\nis opened. It defaults to 'r' which means open for reading in text\nmode.  Other common values are 'w' for writing (truncating the file if\nit already exists), 'x' for creating and writing to a new file, and\n'a' for appending (which on some Unix systems, means that all writes\nappend to the end of the file regardless of the current seek position).\nIn text mode, if encoding is not specified the encoding used is platform\ndependent: locale.getencoding() is called to get the current locale encoding.\n(For reading and writing raw bytes use binary mode and leave encoding\nunspecified.) The available modes are:\n\n========= ===============================================================\nCharacter Meaning\n--------- ---------------------------------------------------------------\n'r'       open for reading (default)\n'w'       open for writing, truncating the file first\n'x'       create a new file and open it for writing\n'a'       open for writing, appending to the end of the file if it exists\n'b'       binary mode\n't'       text mode (default)\n'+'       open a disk file for updating (reading and writing)\n========= ===============================================================\n\nThe default mode is 'rt' (open for reading text). For binary random\naccess, the mode 'w+b' opens and truncates the file to 0 bytes, while\n'r+b' opens the file without truncation. The 'x' mode implies 'w' and\nraises an `FileExistsError` if the file already exists.\n\nPython distinguishes between files opened in binary and text modes,\neven when the underlying operating system doesn't. Files opened in\nbinary mode (appending 'b' to the mode argument) return contents as\nbytes objects without any decoding. In text mode (the default, or when\n't' is appended to the mode argument), the contents of the file are\nreturned as strings, the bytes having been first decoded using a\nplatform-dependent encoding or using the specified encoding if given.\n\nbuffering is an optional integer used to set the buffering policy.\nPass 0 to switch buffering off (only allowed in binary mode), 1 to select\nline buffering (only usable in text mode), and an integer > 1 to indicate\nthe size of a fixed-size chunk buffer.  When no buffering argument is\ngiven, the default buffering policy works as follows:\n\n* Binary files are buffered in fixed-size chunks; the size of the buffer\n  is chosen using a heuristic trying to determine the underlying device's\n  \"block size\" and falling back on `io.DEFAULT_BUFFER_SIZE`.\n  On many systems, the buffer will typically be 4096 or 8192 bytes long.\n\n* \"Interactive\" text files (files for which isatty() returns True)\n  use line buffering.  Other text files use the policy described above\n  for binary files.\n\nencoding is the name of the encoding used to decode or encode the\nfile. This should only be used in text mode. The default encoding is\nplatform dependent, but any encoding supported by Python can be\npassed.  See the codecs module for the list of supported encodings.\n\nerrors is an optional string that specifies how encoding errors are to\nbe handled---this argument should not be used in binary mode. Pass\n'strict' to raise a ValueError exception if there is an encoding error\n(the default of None has the same effect), or pass 'ignore' to ignore\nerrors. (Note that ignoring encoding errors can lead to data loss.)\nSee the documentation for codecs.register or run 'help(codecs.Codec)'\nfor a list of the permitted encoding error strings.\n\nnewline controls how universal newlines works (it only applies to text\nmode). It can be None, '', '\\n', '\\r', and '\\r\\n'.  It works as\nfollows:\n\n* On input, if newline is None, universal newlines mode is\n  enabled. Lines in the input can end in '\\n', '\\r', or '\\r\\n', and\n  these are translated into '\\n' before being returned to the\n  caller. If it is '', universal newline mode is enabled, but line\n  endings are returned to the caller untranslated. If it has any of\n  the other legal values, input lines are only terminated by the given\n  string, and the line ending is returned to the caller untranslated.\n\n* On output, if newline is None, any '\\n' characters written are\n  translated to the system default line separator, os.linesep. If\n  newline is '' or '\\n', no translation takes place. If newline is any\n  of the other legal values, any '\\n' characters written are translated\n  to the given string.\n\nIf closefd is False, the underlying file descriptor will be kept open\nwhen the file is closed. This does not work when a file name is given\nand must be True in that case.\n\nA custom opener can be used by passing a callable as *opener*. The\nunderlying file descriptor for the file object is then obtained by\ncalling *opener* with (*file*, *flags*). *opener* must return an open\nfile descriptor (passing os.open as *opener* results in functionality\nsimilar to passing None).\n\nopen() returns a file object whose type depends on the mode, and\nthrough which the standard file operations such as reading and writing\nare performed. When open() is used to open a file in a text mode ('w',\n'r', 'wt', 'rt', etc.), it returns a TextIOWrapper. When used to open\na file in a binary mode, the returned class varies: in read binary\nmode, it returns a BufferedReader; in write binary and append binary\nmodes, it returns a BufferedWriter, and in read/write mode, it returns\na BufferedRandom.\n\nIt is also possible to use a string or bytearray as a file for both\nreading and writing. For strings StringIO can be used like a file\nopened in a text mode, and for bytes a BytesIO can be used like a file\nopened in a binary mode.",ord:"Return the Unicode code point for a one-character string.",pow:"Equivalent to base**exp with 2 arguments or base**exp % mod with 3 arguments\n\nSome types, such as ints, are able to use a more efficient algorithm when\ninvoked using the three argument form.",print:"Prints the values to a stream, or to sys.stdout by default.\n\n  sep\n    string inserted between values, default a space.\n  end\n    string appended after the last value, default a newline.\n  file\n    a file-like object (stream); defaults to the current sys.stdout.\n  flush\n    whether to forcibly flush the stream.",property:"Property attribute.\n\n  fget\n    function to be used for getting an attribute value\n  fset\n    function to be used for setting an attribute value\n  fdel\n    function to be used for del'ing an attribute\n  doc\n    docstring\n\nTypical use is to define a managed attribute x:\n\nclass C(object):\n    def getx(self): return self._x\n    def setx(self, value): self._x = value\n    def delx(self): del self._x\n    x = property(getx, setx, delx, \"I'm the 'x' property.\")\n\nDecorators make defining new properties or modifying existing ones easy:\n\nclass C(object):\n    @property\n    def x(self):\n        \"I am the 'x' property.\"\n        return self._x\n    @x.setter\n    def x(self, value):\n        self._x = value\n    @x.deleter\n    def x(self):\n        del self._x",quit:"",range:"range(stop) -> range object\nrange(start, stop[, step]) -> range object\n\nReturn an object that produces a sequence of integers from start (inclusive)\nto stop (exclusive) by step.  range(i, j) produces i, i+1, i+2, ..., j-1.\nstart defaults to 0, and stop is omitted!  range(4) produces 0, 1, 2, 3.\nThese are exactly the valid indices for a list of 4 elements.\nWhen step is given, it specifies the increment (or decrement).",repr:"Return the canonical string representation of the object.\n\nFor many object types, including most builtins, eval(repr(obj)) == obj.",reversed:"Return a reverse iterator over the values of the given sequence.",round:"Round a number to a given precision in decimal digits.\n\nThe return value is an integer if ndigits is omitted or None.  Otherwise\nthe return value has the same type as the number.  ndigits may be negative.",set:"set() -> new empty set object\nset(iterable) -> new set object\n\nBuild an unordered collection of unique elements.",setattr:"Sets the named attribute on the given object to the specified value.\n\nsetattr(x, 'y', v) is equivalent to ``x.y = v``",slice:"slice(stop)\nslice(start, stop[, step])\n\nCreate a slice object.  This is used for extended slicing (e.g. a[0:10:2]).",sorted:"Return a new list containing all items from the iterable in ascending order.\n\nA custom key function can be supplied to customize the sort order, and the\nreverse flag can be set to request the result in descending order.",staticmethod:"staticmethod(function) -> method\n\nConvert a function to be a static method.\n\nA static method does not receive an implicit first argument.\nTo declare a static method, use this idiom:\n\n     class C:\n         @staticmethod\n         def f(arg1, arg2, argN):\n             ...\n\nIt can be called either on the class (e.g. C.f()) or on an instance\n(e.g. C().f()). Both the class and the instance are ignored, and\nneither is passed implicitly as the first argument to the method.\n\nStatic methods in Python are similar to those found in Java or C++.\nFor a more advanced concept, see the classmethod builtin.",str:"str(object='') -> str\nstr(bytes_or_buffer[, encoding[, errors]]) -> str\n\nCreate a new string object from the given object. If encoding or\nerrors is specified, then the object must expose a data buffer\nthat will be decoded using the given encoding and error handler.\nOtherwise, returns the result of object.__str__() (if defined)\nor repr(object).\nencoding defaults to sys.getdefaultencoding().\nerrors defaults to 'strict'.",sum:"Return the sum of a 'start' value (default: 0) plus an iterable of numbers\n\nWhen the iterable is empty, return the start value.\nThis function is intended specifically for use with numeric values and may\nreject non-numeric types.",super:"super() -> same as super(__class__, <first argument>)\nsuper(type) -> unbound super object\nsuper(type, obj) -> bound super object; requires isinstance(obj, type)\nsuper(type, type2) -> bound super object; requires issubclass(type2, type)\nTypical use to call a cooperative superclass method:\nclass C(B):\n    def meth(self, arg):\n        super().meth(arg)\nThis works for class methods too:\nclass C(B):\n    @classmethod\n    def cmeth(cls, arg):\n        super().cmeth(arg)\n",tuple:"Built-in immutable sequence.\n\nIf no argument is given, the constructor returns an empty tuple.\nIf iterable is specified the tuple is initialized from iterable's items.\n\nIf the argument is a tuple, the return value is the same object.",type:"type(object) -> the object's type\ntype(name, bases, dict, **kwds) -> a new type",vars:"Show vars.\n\nWithout arguments, equivalent to locals().\nWith an argument, equivalent to object.__dict__.",zip:"zip(*iterables, strict=False) --> Yield tuples until an input is exhausted.\n\n   >>> list(zip('abcdefg', range(3), range(4)))\n   [('a', 0, 0), ('b', 1, 1), ('c', 2, 2)]\n\nThe zip object yields n-length tuples, where n is the number of iterables\npassed as positional arguments to zip().  The i-th element in every tuple\ncomes from the i-th iterable argument to zip().  This continues until the\nshortest argument is exhausted.\n\nIf strict is true and one of the arguments is exhausted before the others,\nraise a ValueError.",}
for(var key in docs){if(__BRYTHON__.builtins[key]){__BRYTHON__.builtins[key].__doc__=docs[key]}}
;
