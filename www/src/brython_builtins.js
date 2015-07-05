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

// Mapping between a module name and its path (url)
$B.$py_module_path = {}

// __BRYTHON__.path is the list of paths where Python modules are searched
$B.path = [$path+'Lib', $path+'libs', $script_dir, $path+'Lib/site-packages']

// Name bindings in scopes
// Name "x" defined in a scope is a key of the dictionary
// __BRYTHON__.bound[scope.id]
$B.bound = {}

// for the time being, a flag will be used to know if we should 
// enable async functionality.
$B.async_enabled=false
if ($B.async_enabled) $B.block = {}

// Maps a module name to the matching module object
// A module can be the body of a script, or the body of a block inside a
// script, such as in exec() or in a comprehension
$B.modules = {}

// Maps the name of imported modules to the module object
$B.imported = {}

// Distionary used to save the loval variables of a generator
$B.vars = {}

// Maps block names to a dictionary indexed by names defined as global
// inside the block
$B.globals = {}

// Frames stack
$B.frames_stack = []

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

// minimum and maximum safe integers
$B.max_int = Math.pow(2,53)-1
$B.min_int = -$B.max_int

var has_storage = typeof(Storage)!=="undefined"
if(has_storage){
    $B.has_local_storage = false
    // add attributes local_storage and session_storage
    try {
        if (localStorage) {
            $B.local_storage = localStorage
            $B.has_local_storage = true
        }
    } catch (err) { }
    $B.has_session_storage = false
    try {
        if (sessionStorage) {
            $B.session_storage = sessionStorage
            $B.has_session_storage = true
        }
    } catch (err) { }
} else {
    $B.has_local_storage = false
    $B.has_session_storage = false
}

var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB
$B.has_indexedDB = indexedDB !== undefined
if($B.has_indexedDB){
    $B.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction
    $B.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange
    
    $B.indexedDB = function(){return $B.JSObject(indexedDB)}
}

$B.re = function(pattern,flags){return $B.JSObject(new RegExp(pattern,flags))}
$B.has_json = typeof(JSON)!=="undefined"

$B.has_websocket = window.WebSocket!==undefined


})(__BRYTHON__)
