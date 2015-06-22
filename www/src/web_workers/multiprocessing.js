self.addEventListener('message', function (e) {

    //we get an error when we put var before __BRYTHON__ below
    __BRYTHON__ = { isa_web_worker: true }

    //importScripts('brython.js')
    importScripts('/src/brython_builtins.js', '/src/version_info.js',
        '/src/py2js.js',
        '/src/py_object.js', '/src/py_type.js', '/src/py_utils.js',
        '/src/py_builtin_functions.js', '/src/py_set.js',
        '/src/js_objects.js',
        '/src/py_import.js', '/src/py_int.js', '/src/py_float.js',
        '/src/py_complex.js',
        '/src/py_dict.js', '/src/py_list.js', '/src/py_string.js');

    __BRYTHON__.$py_src = {}

    // Mapping between a module name and its path (url)
    __BRYTHON__.$py_module_path = {}

    // path_hook used in py_import.js
    __BRYTHON__.path_hooks = []

    // Maps a module name to matching module object
    // A module can be the body of a script, or the body of a block inside a
    // script, such as in exec() or in a comprehension
    __BRYTHON__.modules = {}

    // Maps the name of imported modules to the module object
    __BRYTHON__.imported = {}

    // Options passed to brython(), with default values
    __BRYTHON__.$options = {}

    // Used to compute the hash value of some objects (see
    // py_builtin_functions.js)
    __BRYTHON__.$py_next_hash = -Math.pow(2, 53)

    __BRYTHON__.$options = {}
    __BRYTHON__.debug = __BRYTHON__.$options.debug = 0

    // Stacks for exceptions and function calls, used for exception handling
    __BRYTHON__.call_stack = []

    // Maps a Python block (module, function, class) to a Javascript object
    // mapping the names defined in this block to their value
    __BRYTHON__.vars = {}

    // capture all standard output
    var output = []
    __BRYTHON__.stdout = {
        write: function (data) {
            output.push(data)
        }
    }

    // insert already defined builtins
    for (var $py_builtin in __BRYTHON__.builtins) {
        eval("var " + $py_builtin + "=__BRYTHON__.builtins[$py_builtin]")
    }

    var $defaults = {}
    eval('var _result=(' + e.data.target + ')(' + e.data.args + ')')


    if (e.data.pos !== undefined) {
        // allows parent to know where this individual result belongs in the
        // result list
        self.postMessage({
            stdout: output.join(''),
            result: _result,
            pos: e.data.pos
        })
    } else {
        self.postMessage({
            stdout: output.join(''),
            result: _result.toString()
        })
    }

}, false);
