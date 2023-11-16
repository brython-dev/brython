"use strict";
var __BRYTHON__ = globalThis.__BRYTHON__ || {}  // global object with brython built-ins

try{
    // "async function*" is not supported in old versions of Microsoft Edge
    eval("async function* f(){}")
}catch(err){
    console.warn("Your browser is not fully supported. If you are using " +
        "Microsoft Edge, please upgrade to the latest version")
}
;(function($B) {

// Detect whether we are in a Web Worker
$B.isWebWorker = ('undefined' !== typeof WorkerGlobalScope) &&
                  ("function" === typeof importScripts) &&
                  (navigator instanceof WorkerNavigator)

$B.isNode = (typeof process !=='undefined') && (process.release.name === 'node')
    && (process.__nwjs !== 1)


var _window = globalThis;

_window.location ||= {
            href:'',
            origin: '',
            pathname: ''
        };

_window.navigator ||= {userLanguage: ''}

_window.document  ||= {
	getElementsByTagName: () => [{src: "http://localhost/"}],  // TODO: maybe needs some adaptations
	currentScript: {src: "http://localhost/"}, // TODO: maybe needs some adaptations
	querySelectorAll: () => []
}

_window.HTMLElement ||= class HTMLElement {};
_window.MutationObserver ||= function() { this.observe = () => {};  }; 
_window.customElements   ||= {define: () => {} };

var href = _window.location.href
$B.protocol = href.split(':')[0]

$B.BigInt = _window.BigInt
$B.indexedDB = _window.indexedDB

var $path

if($B.brython_path === undefined){
    // Get url of this script brython_builtins.js
    var this_url;
    if($B.isWebWorker){
        this_url = _window.location.href;
        if(this_url.startsWith("blob:")){
            this_url = this_url.substr(5)
        }
    }else{
        this_url = document.currentScript.src
    }
    
    var elts = this_url.split('/');
    elts.pop()
    // brython_path is the url of the directory holding brython core scripts
    // It is used to import modules of the standard library
    $path = $B.brython_path = elts.join('/') + '/'
}else{
    if(! $B.brython_path.endsWith("/")){
        $B.brython_path += "/"
    }
    $path = $B.brython_path
}

var parts_re = new RegExp('(.*?)://(.*?)/(.*)'),
    mo = parts_re.exec($B.brython_path)
if(mo){
    $B.full_url = {protocol: mo[1],
                   host: mo[2],
                   address: mo[3]}
}

// Get the URL of the directory where the script stands
var path = _window.location.origin + _window.location.pathname,
    path_elts = path.split("/")
path_elts.pop()
var $script_dir = $B.script_dir = path_elts.join("/")

// Populated in py2js.brython(), used for sys.argv
$B.__ARGV = []

// For all the scripts defined in the page as webworkers, mapping between
// script name and its source code
$B.webworkers = {}

// File cache, indexed by module paths
$B.file_cache = {}

// Mapping between script url and script name
$B.url2name = {}

// Mapping between script url and script object
$B.scripts = {}

// Mapping between script url and import-related information (path, metapath,
// path hooks)
$B.import_info = {}

// Maps the name of imported modules to the module object
$B.imported = {}

// Maps the name of modules to the matching Javascript code
$B.precompiled = {}

// Current frame
$B.frame_obj = null

// Python __builtins__
// Set to Object.create(null) instead of {}
// to avoid conflicts with JS attributes such as "constructor"
$B.builtins = Object.create(null)

$B.builtins_scope = {id:'__builtins__', module:'__builtins__', binding: {}}

// Builtin functions : used in py2js to simplify the code produced by a call
$B.builtin_funcs = {}

// Builtin classes
$B.builtin_classes = []

// enable to list the wrappers

$B.wrappers_JS2Py = new Map();
$B.wrappers_Py2JS = new Map();

$B.SYMBOL_JS2PY_WRAPPER = Symbol();
$B.SYMBOL_PY2JS_WRAPPER = Symbol();

$B.SYMBOL_JSOBJ = Symbol();
$B.SYMBOL_PYOBJ = Symbol();

$B.addJS2PyWrapper = function(jsclass, fct) {
	if( Object.hasOwnProperty(jsclass.prototype, $B.SYMBOL_JS2PY_WRAPPER) ) {
		console.log(jsclass);
		throw new Error("A JS2PY Wrapper already has been defined for", jsclass.constructor.name);
	}
	jsclass.prototype[$B.SYMBOL_JS2PY_WRAPPER] = fct;
	$B.wrappers_JS2Py.set(jsclass, fct);
}
$B.addPy2JSWrapper = function (pyclass, fct) {
	if( pyclass[$B.SYMBOL_PY2JS_WRAPPER] !== undefined )
		throw new Error("A PY2JS Wrapper already has been defined for", pyclass.__name__);
	pyclass[$B.SYMBOL_PY2JS_WRAPPER] = fct;
	$B.wrappers_Py2JS.set(pyclass, fct);
}

$B.__getattr__ = function(attr){return this[attr]}
$B.__setattr__ = function(attr, value){
    // limited to some attributes
    if(['debug', 'stdout', 'stderr'].indexOf(attr) > -1){
        $B[attr] = value
    }else{
        throw $B.builtins.AttributeError.$factory(
            '__BRYTHON__ object has no attribute ' + attr)
    }
}

// system language ( _not_ the one set in browser settings)
// cf http://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
$B.language = _window.navigator.userLanguage || _window.navigator.language

$B.locale = "C" // can be reset by locale.setlocale

// Set attribute "tz_name", used in module time to return the
// attribute tm_zone of struct_time instances
var date = new Date()
var formatter = new Intl.DateTimeFormat($B.language, {timeZoneName: 'short'}),
    short = formatter.format(date)
formatter = new Intl.DateTimeFormat($B.language, {timeZoneName: 'long'})
var long = formatter.format(date)
var ix = 0,
    minlen = Math.min(short.length, long.length)
while(ix < minlen && short[ix] == long[ix]){
    ix++
}
$B.tz_name = long.substr(ix).trim()


$B.PyCF_ONLY_AST = 1024 // compiler flags, used in libs/_ast.js and compile()

if($B.isWebWorker){
    $B.charset = "utf-8"
}else{
    // document charset ; defaults to "utf-8"
    $B.charset = document.characterSet || document.inputEncoding || "utf-8"
}

// minimum and maximum safe integers
$B.max_int = Math.pow(2, 53) - 1
$B.min_int = -$B.max_int

$B.max_float = new Number(Number.MAX_VALUE)
$B.min_float = new Number(Number.MIN_VALUE)

$B.int_max_str_digits = 4300
$B.str_digits_check_threshold = 640

// maximum array size (Javascript constraint)
$B.max_array_size = 2 ** 32 - 1

$B.recursion_limit = 200

// PEP 657 – Include Fine Grained Error Locations in Traceback (Python 3.11)
$B.pep657 = true

// special repr() for some codepoints, used in py_string.js and py_bytes.js
$B.special_string_repr = {
    8: "\\x08",
    9: "\\t",
    10: "\\n",
    11: "\\x0b",
    12: "\\x0c",
    13: "\\r",
    92: "\\\\",
    160: "\\xa0"
}

// Used to compute the hash value of some objects (see
// py_builtin_functions.js)
$B.$py_next_hash = Math.pow(2, 53) - 1

// $py_UUID guarantees a unique id.  Do not use this variable
// directly, use the $B.UUID function defined in py_utils.js
$B.$py_UUID = 0

// Magic name used in lambdas
$B.lambda_magic = Math.random().toString(36).substr(2, 8)

// Set __name__ attribute of klass methods
$B.set_func_names = function(klass, module){
    for(var attr in klass){
        if(typeof klass[attr] == 'function'){
            klass[attr].$infos = {
                __doc__: klass[attr].__doc__ || "",
                __module__: module,
                __qualname__ : klass.__qualname__ + '.' + attr,
                __name__: attr
            }
            if(klass[attr].$type == "classmethod"){
                klass[attr].__class__ = $B.method
            }
        }
    }
    klass.__module__ = module
}

var has_storage = typeof(Storage) !== "undefined"
if(has_storage){
    $B.has_local_storage = false
    // add attributes local_storage and session_storage
    try{
        if(localStorage){
            $B.local_storage = localStorage
            $B.has_local_storage = true
        }
    }catch(err){}
    $B.has_session_storage = false
    try{
        if(sessionStorage){
            $B.session_storage = sessionStorage
            $B.has_session_storage = true
        }
    }catch(err){}
}else{
    $B.has_local_storage = false
    $B.has_session_storage = false
}

$B.globals = function(){
    // Can be used in Javascript console to inspect global namespace
    return $B.frame_obj.frame[3]
}

$B.scripts = {} // for Python scripts embedded in a JS file

$B.$options = {}

$B.builtins_repr_check = function(builtin, args){
    // Called when entering method __repr__ of builtin classes, to check the
    // the number of arguments, and that the only argument is an instance of
    // the builtin class
    var $ = $B.args('__repr__', 1, {self: null}, ['self'], args,
            {}, null, null),
        self = $.self
    if(! $B.$isinstance(self, builtin)){
        var _b_ = $B.builtins
        throw _b_.TypeError.$factory("descriptor '__repr__' requires a " +
            `'${builtin.__name__}' object but received a ` +
            `'${$B.class_name(self)}'`)
    }
}

// Update the Virtual File System
$B.update_VFS = function(scripts){
    $B.VFS = $B.VFS || {}
    var vfs_timestamp = scripts.$timestamp
    if(vfs_timestamp !== undefined){
        delete scripts.$timestamp
    }
    for(var script in scripts){
        if($B.VFS.hasOwnProperty(script)){
            console.warn("Virtual File System: duplicate entry " + script)
        }
        $B.VFS[script] = scripts[script]
        $B.VFS[script].timestamp = vfs_timestamp
    }
    $B.stdlib_module_names = Object.keys($B.VFS)
}

$B.add_files = function(files){
    // Used to add files that programs can open with open()
    $B.files = $B.files || {}
    for(var file in files){
        $B.files[file] = files[file]
    }
}

$B.has_file = function(file){
    // Used to check if a file was added to $B.files
    return ($B.files && $B.files.hasOwnProperty(file))
}

$B.show_tokens = function(src, mode){
    // show the tokens generated by python_tokenizer.js for source code src
    for(var token of $B.tokenizer(src, '<string>', mode || 'file')){
        console.log(token.type, $B.builtins.repr(token.string), token.start, token.end, token.line)
    }
}

// Can be used in Javascript programs to run Python code
var py2js_magic = Math.random().toString(36).substr(2, 8)

function from_py(src, script_id){
    if(! $B.options_parsed){
        // parse options so that imports succeed
        $B.parse_options()
    }

    // fake names
    script_id = script_id  || 'python_script_' + $B.UUID()
    var filename = $B.script_path + '#' + script_id
    $B.url2name[filename] = script_id
    $B.imported[script_id] = {}

    var root = __BRYTHON__.py2js({src, filename},
                                 script_id, script_id,
                                 __BRYTHON__.builtins_scope)
    return root.to_js()
}

$B.getPythonModule = function(name){
    return $B.imported[name]
}

$B.python_to_js = function(src, script_id){
    /*

    Meant to be used in a Javascript program to execute Python code

    Returns JS source code that, when executed, returns the globals object for
    the Python program

    Example:

        var ns = eval(__BRYTHON__.python_to_js("x = 1 + 2"))
        console.log(ns.x) // 3

    */

    return "(function() {\n" + from_py(src, script_id) + "\nreturn locals}())"
}

$B.pythonToJS = $B.python_to_js

$B.runPythonSource = function(src, script_id){
    var js = from_py(src, script_id) + '\nreturn locals'
    var func = new Function('$B', '_b_', js)
    $B.imported[script_id] = func($B, $B.builtins)
    return $B.imported[script_id]
}

})(__BRYTHON__)
