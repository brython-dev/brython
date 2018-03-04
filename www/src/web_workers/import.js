self.addEventListener('message', function (e) {

    //we get an error when we put var before __BRYTHON__ below
    __BRYTHON__ = { isa_web_worker: true }

    //importScripts('brython.js')
    importScripts('/src/brython_builtins.js', '/src/version_info.js',
        '/src/py2js.js',
        '/src/py_object.js', '/src/py_type.js', '/src/py_utils.js','/src/py_sort.js',
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

    import_js = function (module) {
        var name = module.name
        if (name.substr(0, 2) == '$$') {
            name = name.substr(2)
        }
        var filepath = __BRYTHON__.brython_path + 'libs/' + name + '.js'
        return [filepath, __BRYTHON__.$download_module(module.name, filepath)]
    }


    import_module_search_path = function (module, origin) {
        var search = [],
            path_modified = false
        var path_list = __BRYTHON__.path

        if (origin !== undefined) {
            // add path of origin script to list of paths to search
            var origin_path = __BRYTHON__.$py_module_path[origin]
            var elts = origin_path.split('/')
            elts.pop()
            origin_path = elts.join('/')
            if (path_list.indexOf(origin_path) == -1) {
                path_list.splice(0, 0, origin_path)
                path_modified = true
            }
        }

        var mod_path = module.name.replace(/\./g, '/')
        if (mod_path.substr(0, 2) == '$$') {
            mod_path = mod_path.substr(2)
        }
        if (!module.package_only) {
            // Attribute "package_only" is set for X in "import X.Y"
            // In this case, we don't have to search a file "X.py"
            search.push(mod_path)
        }
        search.push(mod_path + '/__init__')

        var flag = false
        for (var j = 0; j < search.length; j++) {
            var modpath = search[j]
            for (var i = 0; i < path_list.length; i++) {
                var path = path_list[i]
                if (path.charAt(path.length - 1) != '/') {
                    path += "/"
                }
                path += modpath
                    //console.log(path)
                try {
                    //var mod = $B.$import_py(module,path)
                    var module_contents = __BRYTHON__.$download_module(
                        module.name, path + '.py')
                    return [path + '.py', process_py_module(module,
                        path, module_contents)]
                    if (j == search.length - 1) {
                        mod.$package = true
                    }
                } catch (err) {
                    //console.log(err)
                    if (err.__class__.__name__ !== "FileNotFoundError") {
                        flag = true;
                        throw err
                    }
                }
                if (flag) {
                    break
                }
            }
            if (flag) {
                break
            }
        }

        // reset original path list
        if (path_modified) {
            path_list.splice(0, 1)
        }

        if (!flag) {
            throw __BRYTHON__.builtins.ImportError.$factory("module " + module.name +
                                                   " not found")
        }
    }


    process_py_module = function (module, path, module_contents) {
        var $Node = __BRYTHON__.$Node,
            $NodeJSCtx = __BRYTHON__.$NodeJSCtx
        __BRYTHON__.$py_module_path[module.name] = path

        var root = __BRYTHON__.py2js(module_contents, module.name)
        var body = root.children
        root.children = []
        // use the module pattern : module name returns results of an anonymous$
        var mod_node = new $Node('expression')
        new $NodeJSCtx(mod_node, 'var $module=(function()')
        root.insert(0, mod_node)
        for (var i = 0; i < body.length; i++) {
            mod_node.add(body[i])
        }

        // $globals will be returned when the anonymous function is run
        var ret_node = new $Node('expression')
        new $NodeJSCtx(ret_node, 'return $globals')
        mod_node.add(ret_node)
            // add parenthesis for anonymous function execution

        var ex_node = new $Node('expression')
        new $NodeJSCtx(ex_node, ')(__BRYTHON__)')
        root.add(ex_node)

        try {
            var js = root.to_js()
            return js
        } catch (err) {
            throw err
        }
        return ''
    }


    __import__ = function (module, origin) {
        var import_funcs = [import_js, import_module_search_path]
        if (module.name.search(/\./) > -1) {
            import_funcs = [import_module_search_path]
        }
        for (var j = 0; j < import_funcs.length; j++) {
            try {
                return import_funcs[j](module, origin)
            } catch (err) {
                if (err.__class__.__name__ === "FileNotFoundError") {
                    if (j == import_funcs.length - 1) {
                        throw err
                    } else {
                        continue
                    }
                } else {
                    throw err
                }
            }
        }
    }

    //inputs
    //  name of module
    //  search path
    //  origin
    //  brython path (used to look for .js files)

    __BRYTHON__.path = e.data.search_path
    __BRYTHON__.brython_path = e.data.brython_path

    module = { name: e.data.name }
    origin = e.data.origin

    // import returns javascript 'compiled' code
    var out = __import__(module, origin)
    var filepath = out[0]
    var jscode = out[1]

    self.postMessage({
        jscode: jscode,
        filepath: filepath
    })

}, false);
