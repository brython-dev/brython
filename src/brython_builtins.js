var __BRYTHON__=__BRYTHON__ || {}  // global object with brython built-ins

;(function($B) {

// Get url of this script brython_builtins.js
var scripts = document.getElementsByTagName('script')
var this_url = scripts[scripts.length-1].src
var elts = this_url.split('/')
elts.pop()
// brython_path is the url of the directory holding brython core scripts
// It is used to import modules of the standard library
var $path = $B.brython_path = elts.join('/')+'/'

// Get the URL of the directory where the script stands
var $href = $B.script_path = window.location.href
var $href_elts = $href.split('/')
$href_elts.pop()
var $script_dir = $B.script_dir = $href_elts.join('/')

// __BRYTHON__.path is the list of paths where Python modules are searched
$B.path = [$path+'Lib', $script_dir, $path+'Lib/site-packages']

// Name bindings in scopes
// Name "x" defined in a scope is a key of the dictionary
// __BRYTHON__.bound[scope.id]
$B.bound = {}

// Maps a module name to the matching module object
// A module can be the body of a script, or the body of a block inside a
// script, such as in exec() or in a comprehension
$B.modules = {}

// Maps the name of imported modules to the module object
$B.imported = {
    __main__:{__class__:$B.$ModuleDict,__name__:'__main__'}
}

// Maps a Python block (module, function, class) name to a Javascript object
// mapping the names defined in this block to their value
$B.vars = {}

// Maps block names to a dictionary indexed by names defined as global
// inside the block
$B.globals = {}

// Stack of executing scripts
$B.exec_stack = []

// Python __builtins__
$B.builtins = {
    __repr__:function(){return "<module 'builtins>'"},
    __str__:function(){return "<module 'builtins'>"},    
}

// Builtin functions : used in py2js to simplify the code produced by a call
$B.builtin_funcs = {}

$B.__getattr__ = function(attr){return this[attr]}
$B.__setattr__ = function(attr,value){
    // limited to some attributes
    if(['debug', 'stdout', 'stderr'].indexOf(attr)>-1){$B[attr]=value}
    else{throw $B.builtins.AttributeError('__BRYTHON__ object has no attribute '+attr)}
}

// system language ( _not_ the one set in browser settings)
// cf http://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
$B.language = window.navigator.userLanguage || window.navigator.language

// document charset ; defaults to "utf-8"
$B.charset = document.characterSet || document.inputEncoding || "utf-8"

$B.date = function(){
    if(arguments.length===0) return $B.JSObject(new Date())
    if(arguments.length===1) return $B.JSObject(new Date(arguments[0]))
    if(arguments.length===7) return $B.JSObject(new Date(arguments[0],
        arguments[1]-1,arguments[2],arguments[3],
        arguments[4],arguments[5],arguments[6]))
}

$B.has_local_storage = typeof(Storage)!=="undefined"
if($B.has_local_storage){
    // add attributes local_storage and session_storage
    $B.local_storage = localStorage
    $B.session_storage = sessionStorage
}

$B._indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB
$B.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction
$B.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange

$B.has_indexedDB = typeof($B._indexedDB) !== "undefined"
if ($B.has_indexedDB) {
   $B.indexedDB = function() {return $B.JSObject($B._indexedDB)}
}

$B.re = function(pattern,flags){return $B.JSObject(new RegExp(pattern,flags))}
$B.has_json = typeof(JSON)!=="undefined"

$B.has_websocket = (function(){
    try{var x=window.WebSocket;return x!==undefined}
    catch(err){return false}
})

})(__BRYTHON__)
