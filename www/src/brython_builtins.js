"use strict";
var __BRYTHON__ = globalThis.__BRYTHON__ || {}  // global object with brython built-ins

try{
    // "async function*" is not supported in old versions of Microsoft Edge
    eval("async function* f(){}")
}catch(err){
    console.warn("Your browser is not fully supported. If you are using " +
        "Microsoft Edge, please upgrade to the latest version")
}

(function($B) {

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
    $B.brython_path = elts.join('/') + '/'
}else{
    if(! $B.brython_path.endsWith("/")){
        $B.brython_path += "/"
    }
}

var parts_re = new RegExp('(.*?)://(.*?)/(.*)'),
    mo = parts_re.exec($B.brython_path)
if(mo){
    $B.full_url = {protocol: mo[1],
                   host: mo[2],
                   address: mo[3]}
    if(['http', 'https'].includes(mo[1])){
        $B.domain = mo[1] + '://' + mo[2]
    }
}

// Get the URL of the directory where the script stands
var path = _window.location.origin + _window.location.pathname,
    path_elts = path.split("/")
path_elts.pop()
$B.script_dir = path_elts.join("/")

mo = parts_re.exec($B.script_dir)
if(mo){
    if(['http', 'https'].includes(mo[1])){
        $B.script_domain = mo[1] + '://' + mo[2]
    }
}else{
    var parts_re_root = new RegExp('(.*?)://(.*?)'),
        mo = parts_re_root.exec($B.script_dir)
    if(mo && ['http', 'https'].includes(mo[1])){
        // script is at server root (issue #2412)
        $B.script_domain = $B.script_dir
    }
}

$B.strip_host = function(url){
    try{
        var parsed_url = new URL(url)
        return parsed_url.pathname.substr(1) + parsed_url.search +
            parsed_url.hash
    }catch{
        console.log(Error().stack)
        throw Error("not a url: " + url)
    }
}

// URL of the script where function brython() is called
// Remove part after # (cf. issue #2035)
var href = $B.script_path = _window.location.href.split('#')[0],
    href_elts = href.split('/')
href_elts.pop()
if($B.isWebWorker || $B.isNode){
    href_elts.pop()
}
$B.curdir = href_elts.join('/')

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

// compiler flags, used in libs/_ast.js and compile()
$B.PyCF_ONLY_AST = 1024
$B.PyCF_TYPE_COMMENTS = 0x1000
$B.CO_FUTURE_ANNOTATIONS = 0x1000000
$B.PyCF_ALLOW_INCOMPLETE_INPUT = 0x4000

$B.COMPILER_FLAGS = {
    OPTIMIZED: 1,
    NEWLOCALS: 2,
    VARARGS: 4,
    VARKEYWORDS: 8,
    NESTED: 16,
    GENERATOR: 32,
    NOFREE: 64,
    COROUTINE: 128,
    ITERABLE_COROUTINE: 256,
    ASYNC_GENERATOR: 512
}
var DEF_GLOBAL = 1,           /* global stmt */
    DEF_LOCAL = 2 ,           /* assignment in code block */
    DEF_PARAM = 2 << 1,         /* formal parameter */
    DEF_NONLOCAL = 2 << 2,      /* nonlocal stmt */
    USE = 2 << 3 ,              /* name is used */
    DEF_FREE = 2 << 4 ,         /* name used but not defined in nested block */
    DEF_FREE_CLASS = 2 << 5,    /* free variable from class's method */
    DEF_IMPORT = 2 << 6,        /* assignment occurred via import */
    DEF_ANNOT = 2 << 7,         /* this name is annotated */
    DEF_COMP_ITER = 2 << 8,     /* this name is a comprehension iteration variable */
    DEF_TYPE_PARAM = 2 << 9,    /* this name is a type parameter */
    DEF_COMP_CELL = 2 << 10       /* this name is a cell in an inlined comprehension */

var DEF_BOUND = DEF_LOCAL | DEF_PARAM | DEF_IMPORT

/* GLOBAL_EXPLICIT and GLOBAL_IMPLICIT are used internally by the symbol
   table.  GLOBAL is returned from PyST_GetScope() for either of them.
   It is stored in ste_symbols at bits 12-15.
*/
var SCOPE_OFFSET = 12,
    SCOPE_OFF = SCOPE_OFFSET,
    SCOPE_MASK = (DEF_GLOBAL | DEF_LOCAL | DEF_PARAM | DEF_NONLOCAL)

var LOCAL = 1,
    GLOBAL_EXPLICIT = 2,
    GLOBAL_IMPLICIT = 3,
    FREE = 4,
    CELL = 5

var TYPE_CLASS = 1,
    TYPE_FUNCTION = 0,
    TYPE_MODULE = 2

$B.SYMBOL_FLAGS = {
    DEF_GLOBAL,       /* global stmt */
    DEF_LOCAL,        /* assignment in code block */
    DEF_PARAM,        /* formal parameter */
    DEF_NONLOCAL,     /* nonlocal stmt */
    USE,              /* name is used */
    DEF_FREE,         /* name used but not defined in nested block */
    DEF_FREE_CLASS,   /* free variable from class's method */
    DEF_IMPORT,       /* assignment occurred via import */
    DEF_ANNOT,        /* this name is annotated */
    DEF_COMP_ITER,    /* this name is a comprehension iteration variable */
    DEF_TYPE_PARAM,   /* this name is a type parameter */
    DEF_COMP_CELL,    /* this name is a cell in an inlined comprehension */

    DEF_BOUND,

    SCOPE_OFFSET,
    SCOPE_OFF,
    SCOPE_MASK,

    LOCAL,
    GLOBAL_EXPLICIT,
    GLOBAL_IMPLICIT,
    FREE,
    CELL,

    TYPE_CLASS,
    TYPE_FUNCTION,
    TYPE_MODULE
}

// minimum and maximum safe integers
$B.max_int = Math.pow(2, 53) - 1
$B.min_int = -$B.max_int

$B.int_max_str_digits = 4300
$B.str_digits_check_threshold = 640

// maximum array size (Javascript constraint)
$B.max_array_size = 2 ** 32 - 1

$B.recursion_limit = 900

// Mapping between operators and special Python method names
$B.op2method = {
    operations: {
        "**": "pow", "//": "floordiv", "<<": "lshift", ">>": "rshift",
        "+": "add", "-": "sub", "*": "mul", "/": "truediv", "%": "mod",
        "@": "matmul" // PEP 465
    },
    augmented_assigns: {
        "//=": "ifloordiv", ">>=": "irshift", "<<=": "ilshift", "**=": "ipow",
        "+=": "iadd","-=": "isub", "*=": "imul", "/=": "itruediv",
        "%=": "imod", "&=": "iand","|=": "ior","^=": "ixor", "@=": "imatmul"
    },
    binary: {
        "&": "and", "|": "or", "~": "invert", "^": "xor"
    },
    comparisons: {
        "<": "lt", ">": "gt", "<=": "le", ">=": "ge", "==": "eq", "!=": "ne"
    },
    boolean: {
        "or": "or", "and": "and", "in": "in", "not": "not", "is": "is"
    },
    subset: function(){
        var res = {},
            keys = []
        if(arguments[0] == "all"){
            keys = Object.keys($B.op2method)
            keys.splice(keys.indexOf("subset"), 1)
        }else{
            for(var arg of arguments){
                keys.push(arg)
            }
        }
        for(var key of keys){
            var ops = $B.op2method[key]
            if(ops === undefined){
                throw Error(key)
            }
            for(var attr in ops){
                res[attr] = ops[attr]
            }
        }
        return res
    }
}

$B.method_to_op = {}
for(var category in $B.op2method){
    for(var op in $B.op2method[category]){
        var method = `__${$B.op2method[category][op]}__`
        $B.method_to_op[method] = op
    }
}


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
$B.$py_UUID = Math.floor(Math.random() * 2 ** 50)

// Magic name used in lambdas
$B.lambda_magic = Math.random().toString(36).substr(2, 8)

// Function attributes
const func_attrs = ['__module__', '__name__', '__qualname__', '__file__',
    '__defaults__', '__kwdefaults__', '__doc__', 'arg_names',
    'args_vararg', 'args_kwarg', 'positional_length', 'lineno', 'flags',
    'free_vars', 'kwonlyargs_length', 'posonlyargs_length', 'varnames',
    '__annotations__', '__type_params__',
    'method_class'
    ]

// Rank of function attributes in .$function_infos
var i = 0
$B.func_attrs = {}
for(var func_attr of func_attrs){
    $B.func_attrs[func_attr] = i++
}

// Set attributes of klass methods
$B.set_func_names = function(klass, module){
    klass.__module__ = module
    for(var attr in klass){
        if(typeof klass[attr] == 'function'){
            $B.add_function_infos(klass, attr)
        }
    }
}

$B.add_function_infos = function(klass, attr){
    var module = klass.__module__
    $B.set_function_infos(klass[attr],
        {
            __doc__: klass[attr].__doc__ || '',
            __module__: module,
            __name__: attr,
            __qualname__ : klass.__qualname__ + '.' + attr,
            __defaults__: [],
            __kwdefaults__: {}
       }
    )
    if(klass[attr].$type == "classmethod"){
        klass[attr].__class__ = $B.method
    }
}

// Set function attributes
$B.set_function_infos = function(f, attrs){
    f.$function_infos = f.$function_infos ?? []
    for(var key in attrs){
        if($B.func_attrs[key] === undefined){
            throw Error('no function attribute ' + key)
        }
        f.$function_infos[$B.func_attrs[key]] = attrs[key]
    }
}

$B.set_function_attr = function(func, attr, value){
    if($B.func_attrs[attr] === undefined){
        throw Error('no function attribute ' + attr)
    }
    func.$function_infos[$B.func_attrs[attr]] = value
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

$B.loadBrythonPackage = function(brythonPackage){
    $B.use_VFS = true
    $B.update_VFS(brythonPackage)
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
        console.log(token.type, $B.builtins.repr(token.string),
        `[${token.lineno}.${token.col_offset}-` +
        `${token.end_lineno}.${token.end_col_offset}]`,
        token.line)
    }
}

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

$B.pythonToAST = function(python_code, filename, mode){
    let parser = new $B.Parser(python_code, filename ?? 'test', mode ?? 'file')
    return $B._PyPegen.run_parser(parser)
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

var fakeScript = $B.fakeScript = function(filename){
    this.options = {}
}

fakeScript.prototype.getAttribute = function(key){
    return this.options[key] ?? null
}

fakeScript.prototype.dispatchEvent = function(){
    // ignore
}

$B.runPythonSource = function(src, options){
    var script_id

    if(options){
        if(typeof options == 'string'){
            script_id = options
        }else if(options.constructor === Object){
            if(options.hasOwnProperty('id')){
                script_id = options.id
                delete options.id
            }
        }else{
            console.debug('invalid options argument:', options)
        }
    }
    // Simulate an HTML <script> tag so we can use $B.run_script()
    var script = new fakeScript(),
        url = $B.script_path = globalThis.location.href.split('#')[0]
    // Set options to the fake <script> tag
    if(options){
        for(var [key, value] of Object.entries(options)){
            script.options[key] = value
        }
    }
    script_id = script_id ?? 'python_script_' + $B.UUID()
    $B.run_script(script, src, script_id, url, true)
    return $B.imported[script_id]
}

$B.importPythonModule = function(name, options){
    return $B.runPythonSource('import ' + name, options)
}

})(__BRYTHON__);
