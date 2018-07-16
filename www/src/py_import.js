// import modules

;(function($B){

var _b_ = $B.builtins,
    _window = self

var module = $B.module = {
    __class__ : _b_.type,
    __module__: "builtins",
    __mro__: [_b_.object],
    __name__ : "module",
    $is_class: true
}

module.__init__ = function(){}

module.__new__ = function(cls, name, doc, $package){
    return {
        __class__: cls,
        __name__: name,
        __doc__: doc || _b_.None,
        __package__: $package || _b_.None
    }
}

module.__repr__ = module.__str__ = function(self){
    return "<module " + self.__name__ + ">"
}


module.__setattr__ = function(self, attr, value){
    if(self.__name__ == "__builtins__"){
        // set a Python builtin
        $B.builtins[attr] = value
    }else{
        self[attr] = value
    }
}

module.$factory = function(name, doc, $package){
    return {
        __class__: module,
        __name__: name,
        __doc__: doc || _b_.None,
        __package__: $package || _b_.None
    }
}

$B.set_func_names(module, "builtins")

/**
 * Module's parent package name
 */
function parent_package(mod_name) {
    var parts = mod_name.split(".")
    parts.pop()
    return parts.join(".")
}

function $download_module(module, url, $package){
    $B.xhr = $B.xhr || new XMLHttpRequest()
    var xhr = $B.xhr,
        fake_qs

    switch ($B.$options.cache) {
        case "version":
            fake_qs = "?v=" + $B.version_info[2]
            break
        case "browser":
            fake_qs = ""
            break
        default:
            fake_qs = "?v=" + (new Date().getTime())
    }

    var timer = _window.setTimeout(function(){
            xhr.abort()
            throw _b_.ImportError.$factory("No module named '" + module + "'")
        }, 5000)

    var res = null,
        mod_name = module.__name__,
        res,
        t0 = new Date()

    $B.download_time = $B.download_time || 0

    xhr.open("GET", url + fake_qs, false)
    xhr.send()

    if($B.$CORS){
        if(xhr.status == 200 || xhr.status == 0){
           res = xhr.responseText
        }else{
           res = _b_.FileNotFoundError.$factory("No module named '" +
               mod_name + "'")
        }
    }else{
        if(xhr.readyState == 4){
            if(xhr.status == 200 || xhr.status == 0){
                res = xhr.responseText
                module.$last_modified =
                    xhr.getResponseHeader("Last-Modified")
            }else{
                // don't throw an exception here, it will not be caught
                // (issue #30)
                console.log("Error " + xhr.status +
                    " means that Python module " + mod_name +
                    " was not found at url " + url)
                res = _b_.FileNotFoundError.$factory("No module named '" +
                    mod_name + "'")
            }
        }
    }

    _window.clearTimeout(timer)
    // sometimes chrome doesn't set res correctly, so if res == null,
    // assume no module found
    if(res == null){
        throw _b_.FileNotFoundError.$factory("No module named '" +
            mod_name + "' (res is null)")
    }

    if(res.constructor === Error){throw res} // module not found
    $B.download_time += (new Date()) - t0
    return res
}

$B.$download_module = $download_module

function import_js(module, path) {
    try{
        var module_contents = $download_module(module, path, undefined)
    }catch(err){
        return null
    }
    run_js(module_contents, path, module)
    return true
}

function run_js(module_contents, path, _module){
    // FIXME : Enhanced module isolation e.g. run_js arg names , globals ...
    try{
        var $module = new Function(module_contents + ";\nreturn $module")()
        if($B.$options.store){_module.$js = module_contents}
    }catch(err){
        console.log(err)
        console.log(path, _module)
        throw err
    }
    // check that module name is in namespace
    try{$module}
    catch(err){
        console.log("no $module")
        throw _b_.ImportError.$factory("name '$module' is not defined in module")
    }

    if(_module !== undefined){
        // FIXME : This might not be efficient . Refactor js modules instead.
        // Overwrite original module object . Needed e.g. for reload()
        for(var attr in $module){
            _module[attr] = $module[attr]
        }
        $module = _module
        $module.__class__ = module // in case $module has __class__ (issue #838)
    }else{
        // add class and __str__
        $module.__class__ = module
        $module.__name__ = _module.name
        $module.__repr__ = $module.__str__ = function(){
          if($B.builtin_module_names.indexOf(_module.name) > -1){
             return "<module '" + _module.name + "' (built-in)>"
          }
          return "<module '" + _module.name + "' from " + path + " >"
        }

        if(_module.name != "builtins") { // builtins do not have a __file__ attribute
            $module.__file__ = path
        }
    }
    $B.imported[_module.__name__] = $module

    return true
}

function show_ns(){
    var kk = Object.keys(_window)
    for (var i = 0, len = kk.length; i < len; i++){
        console.log(kk[i])
        if(kk[i].charAt(0) == "$"){console.log(eval(kk[i]))}
    }
    console.log("---")
}

function import_py(module, path, $package){
    // import Python module at specified path
    var mod_name = module.__name__,
        module_contents = $download_module(module, path, $package)
    $B.imported[mod_name].$is_package = module.$is_package
    $B.imported[mod_name].$last_modified = module.$last_modified
    if(path.substr(path.length - 12) == "/__init__.py"){
        $B.imported[mod_name].__package__ = mod_name
        $B.imported[mod_name].__path__ = path
        $B.imported[mod_name].$is_package = module.$is_package = true
    }else if($package){
        $B.imported[mod_name].__package__ = $package
    }else{
        var mod_elts = mod_name.split(".")
        mod_elts.pop()
        $B.imported[mod_name].__package__ = mod_elts.join(".")
    }
    $B.imported[mod_name].__file__ = path
    return run_py(module_contents, path, module)
}

//$B.run_py is needed for import hooks..
function run_py(module_contents, path, module, compiled) {
    var root, js
    if(! compiled){
        var $Node = $B.$Node,
            $NodeJSCtx = $B.$NodeJSCtx
        $B.$py_module_path[module.__name__] = path

        root = $B.py2js(module_contents, module,
            module.__name__, $B.builtins_scope)

        if(module.__package__ !== undefined){
            root.binding["__package__"] = true
        }
        var body = root.children
        root.children = []
        // use the module pattern : module name returns the results of an anonymous function
        var mod_node = new $Node("expression")
        new $NodeJSCtx(mod_node,"var $module = (function()")
        root.insert(0, mod_node)
        for(var i = 0, len = body.length; i < len; i++){mod_node.add(body[i])}

        // $globals will be returned when the anonymous function is run
        var ret_node = new $Node("expression")
        new $NodeJSCtx(ret_node,"return $locals_" +
            module.__name__.replace(/\./g, "_"))
        mod_node.add(ret_node)
        // add parenthesis for anonymous function execution

        var ex_node = new $Node("expression")
        new $NodeJSCtx(ex_node, ")(__BRYTHON__)")
        root.add(ex_node)

    }

    try{
        js = compiled ? module_contents : root.to_js()
        //console.log('imports in', module.__name__, root.imports)
        if($B.$options.debug == 10){
           console.log("code for module " + module.__name__)
           console.log(js)
        }
        js += "; return $module"
        var $module = (new Function(js))() //eval(js)
    }catch(err){
        console.log(err + " for module " + module.__name__)
        console.log("module", module)
        console.log(root)
        console.log(err)
        if($B.debug > 1){
            js.split("\n").forEach(function(item, i){
                console.log(i+1, ":", item)
            })
        }
        //console.log(module_contents
        for(var attr in err){
            console.log(attr, err[attr])
        }
        console.log(_b_.getattr(err, "info", "[no info]"))
        console.log("message: " + err.$message)
        console.log("filename: " + err.fileName)
        console.log("linenum: " + err.lineNumber)
        if($B.debug > 0){console.log("line info " + $B.line_info)}
        throw err
    }finally{
        root = null
        js = null
        $B.clear_ns(module.__name__)
    }

    try{
        // Create module object
        var mod = eval("$module")
        // Apply side-effects upon input module object
        for(var attr in mod){
            module[attr] = mod[attr]
        }
        module.__initializing__ = false
        // $B.imported[mod.__name__] must be the module object, so that
        // setting attributes in a program affects the module namespace
        // See issue #7
        $B.imported[module.__name__] = module
        return true
    }catch(err){
        console.log("" + err + " " + " for module " + module.__name__)
        for(var attr in err){console.log(attr + " " + err[attr])}

        if($B.debug > 0){console.log("line info " + __BRYTHON__.line_info)}
        throw err
    }
}

$B.run_py = run_py

function new_spec(fields) {
    // TODO : Implement ModuleSpec class i.e. not a module object
    // add Python-related fields
    fields.__class__ = module
    return fields
}

// Virtual File System optimized module import
var finder_VFS = {
    __class__: _b_.type,
    __mro__: [_b_.object],
    __name__: "VFSFinder",

    create_module : function(cls, spec) {
        // Fallback to default module creation
        return _b_.None
    },

    exec_module : function(cls, modobj) {
        var stored = modobj.__spec__.loader_state.stored
        delete modobj.__spec__["loader_state"]
        var ext = stored[0],
            module_contents = stored[1],
            imports = stored[2]
        modobj.$is_package = stored[3] || false
        var path = $B.brython_path + "Lib/" + modobj.__name__
        if(modobj.$is_package){path += "/__init__.py"}
        modobj.__file__ = path
        if(ext == '.js'){run_js(module_contents, modobj.__path__, modobj)}
        else if($B.precompiled.hasOwnProperty(modobj.__name__)){
           var parts = modobj.__name__.split(".")
           for(var i = 0; i < parts.length; i++){
               var parent = parts.slice(0, i + 1).join(".")
               if($B.imported.hasOwnProperty(parent) &&
                       $B.imported[parent].__initialized__){
                   continue
               }
               // Initialise $B.imported[parent]
               var mod_js = $B.precompiled[parent],
                   is_package = Array.isArray(mod_js)
               if(is_package){mod_js=mod_js[0]}
               $B.imported[parent] = module.$factory(parent, undefined, is_package)
               $B.imported[parent].__initialized__ = true
               if(is_package){
                   $B.imported[parent].__path__ = "<stdlib>"
                   $B.imported[parent].__package__ = parent
               }else{
                   var elts = parent.split(".")
                   elts.pop()
                   $B.imported[parent].__package__ = elts.join(".")
               }
               try{
                   mod_js += "return $locals_" + parent.replace(/\./g, "_")
                   var $module = new Function(mod_js)()
               }catch(err){
                   console.log(mod_js)
                   console.log(err)
                   for(var k in err){console.log(k, err[k])}
                   console.log(Object.keys($B.imported))
                   throw err
               }
               for(var attr in $module){
                   $B.imported[parent][attr] = $module[attr]
               }
               if(i>0){
                   // Set attribute of parent module
                   $B.builtins.setattr($B.imported[parts.slice(0, i).join(".")],
                       parts[i], $module)
               }

           }
           return $module


        }else{
            console.log("run Python code from VFS", modobj.__name__)
            run_py(module_contents, modobj.__path__, modobj, ext == '.pyc.js')
        }
        if($B.debug > 1){
            console.log("import " + modobj.__name__ + " from VFS")
        }
    },

    find_module: function(cls, name, path){
        return {
            __class__: Loader,
            load_module: function(name, path){
                var spec = cls.find_spec(cls, name, path)
                var mod = module.$factory(name)
                $B.imported[name] = mod
                mod.__spec__ = spec
                cls.exec_module(cls, mod)
            }
        }
    },

    find_spec : function(cls, fullname, path, prev_module) {
        if(!$B.use_VFS){return _b_.None}
        var stored = $B.VFS[fullname]
        if(stored === undefined){return _b_.None}
        var is_package = stored[3] || false,
            is_builtin = $B.builtin_module_names.indexOf(fullname) > -1
        return new_spec({
            name : fullname,
            loader: cls,
            // FIXME : Better origin string.
            origin : is_builtin? "built-in" : "brython_stdlib",
            // FIXME: Namespace packages ?
            submodule_search_locations: is_package? [] : _b_.None,
            loader_state: {stored: stored},
            // FIXME : Where exactly compiled module is stored ?
            cached: _b_.None,
            parent: is_package? fullname : parent_package(fullname),
            has_location: _b_.False
        })
    }
}

$B.set_func_names(finder_VFS, "<import>")

for(var method in finder_VFS){
    if(typeof finder_VFS[method] == "function"){
        finder_VFS[method] = _b_.classmethod.$factory(
            finder_VFS[method])
    }
}

finder_VFS.$factory = function(){
    return {__class__: finder_VFS}
}

/**
 * Module importer optimizing module lookups via stdlib_paths.js
 */

var finder_stdlib_static = {
    $factory : finder_stdlib_static,
    __class__ : _b_.type,
    __mro__: [_b_.object],
    __name__ : "StdlibStatic",

    create_module : function(cls, spec) {
        // Fallback to default module creation
        return _b_.None
    },

    exec_module : function(cls, module) {
        var metadata = module.__spec__.loader_state
        module.$is_package = metadata.is_package
        if(metadata.ext == "py"){
            import_py(module, metadata.path, module.__package__)
        }else{
            import_js(module, metadata.path)
        }
        delete module.__spec__["loader_state"]
    },

    find_module: function(cls, name, path){
        var spec = cls.find_spec(cls, name, path)
        if(spec === _b_.None){return _b_.None}
        return {
            __class__:Loader,
            load_module: function(name, path){
                var mod = module.$factory(name)
                $B.imported[name] = mod
                mod.__spec__ = spec
                mod.__package__ = spec.parent
                cls.exec_module(cls, mod)
            }
        }
    },

    find_spec: function(cls, fullname, path, prev_module){
        if($B.stdlib && $B.$options.static_stdlib_import){
            var address = $B.stdlib[fullname]
            if(address === undefined){
                var elts = fullname.split(".")
                if(elts.length > 1){
                    elts.pop()
                    var $package = $B.stdlib[elts.join(".")]
                    if($package && $package[1]){address = ["py"]}
                }
            }
            if(address !== undefined){
                var ext = address[0],
                    is_pkg = address[1] !== undefined,
                    path = $B.brython_path + ((ext == "py")? "Lib/" : "libs/") +
                           fullname.replace(/\./g, "/"),
                    metadata = {
                        ext: ext,
                        is_package: is_pkg,
                        path: path + (is_pkg? "/__init__.py" :
                                      ((ext == "py")? ".py" : ".js")),
                        address: address
                    }

                var res = new_spec({
                    name : fullname,
                    loader: cls,
                    // FIXME : Better origin string.
                    origin : metadata.path,
                    submodule_search_locations: is_pkg? [path] : _b_.None,
                    loader_state: metadata,
                    // FIXME : Where exactly compiled module is stored ?
                    cached: _b_.None,
                    parent: is_pkg ? fullname : parent_package(fullname),
                    has_location: _b_.True
                 })
                 return res
            }
        }
        return _b_.None
    }
}

$B.set_func_names(finder_stdlib_static, "<import>")

for(var method in finder_stdlib_static){
    if(typeof finder_stdlib_static[method] == "function"){
        finder_stdlib_static[method] = _b_.classmethod.$factory(
            finder_stdlib_static[method])
    }
}

finder_stdlib_static.$factory = function (){
    return {__class__: finder_stdlib_static}
}

/**
 * Search an import path for .py modules
 */
var finder_path = {
    __class__: _b_.type,
    __mro__: [_b_.object],
    __name__: "ImporterPath",

    create_module : function(cls, spec) {
        // Fallback to default module creation
        return _b_.None
    },

    exec_module : function(cls, module) {
        var _spec = _b_.getattr(module, "__spec__"),
            code = _spec.loader_state.code;
        module.$is_package = _spec.loader_state.is_package,
        delete _spec.loader_state["code"]
        var src_type = _spec.loader_state.type
        if(src_type == "py" || src_type == "pyc.js"){
            run_py(code, _spec.origin, module, src_type == "pyc.js")
        }
        else if(_spec.loader_state.type == "js"){
            run_js(code, _spec.origin, module)
        }
    },

    find_module: function(cls, name, path){
        return finder_path.find_spec(cls, name, path)
    },

    find_spec : function(cls, fullname, path, prev_module) {
        if($B.is_none(path)){
            // [Import spec] Top-level import , use sys.path
            path = $B.path
        }
        for(var i = 0, li = path.length; i < li; ++i){
            var path_entry = path[i]
            if(path_entry[path_entry.length - 1] != "/"){
                path_entry += "/"
            }
            // Try path hooks cache first
            var finder = $B.path_importer_cache[path_entry]
            if(finder === undefined){
                var finder_notfound = true
                for(var j = 0, lj = $B.path_hooks.length;
                     j < lj && finder_notfound; ++j){
                    var hook = $B.path_hooks[j].$factory
                    try{
                        finder = (typeof hook == "function" ? hook :
                            _b_.getattr(hook, "__call__"))(path_entry)
                        finder_notfound = false
                    }catch(e){
                        if(e.__class__ !== _b_.ImportError){throw e}
                    }
                }
                if(finder_notfound){
                    $B.path_importer_cache[path_entry] = _b_.None
                }
            }
            // Skip this path entry if finder turns out to be None
            if($B.is_none(finder)){continue}
            var find_spec = _b_.getattr(finder, "find_spec"),
                fs_func = typeof find_spec == "function" ?
                    find_spec :
                    _b_.getattr(find_spec, "__call__")

            var spec = fs_func(fullname, prev_module)
            if(!$B.is_none(spec)){return spec}
        }
        return _b_.None
    }
}

$B.set_func_names(finder_path, "<import>")

for(var method in finder_path){
    if(typeof finder_path[method] == "function"){
        finder_path[method] = _b_.classmethod.$factory(
            finder_path[method])
    }
}

finder_path.$factory = function(){
    return {__class__: finder_path}
}


/**
 * Find modules packaged in a js script to be used as a virtual file system
 *
 * @param {string}      URL pointing at location of VFS js file
 */

var vfs_hook = {
    __class__: _b_.type,
    __mro__: [_b_.object],
    __name__: "VfsPathFinder",

    load_vfs: function(self) {
        try{var code = $download_module({__name__: "<VFS>"}, self.path)}
        catch(e){
            self.vfs = undefined
            throw new _b_.ImportError.$factory(e.$message || e.message)
        }
        eval(code)
        code = null
        try{self.vfs = $vfs}
        catch(e){
            throw new _b_.ImportError.$factory("Expecting $vfs var in VFS file")
        }
        $B.path_importer_cache[self.path + "/"] = self
    },

    find_spec: function(self, fullname, module){
        if(self.vfs === undefined){
            try{vfs_hook.load_vfs(self)}
            catch(e){
                console.log("Could not load VFS while importing '" +
                    fullname + "'")
                return _b_.None
            }
        }
        self.__class__.vfs = self.vfs
        var stored = self.vfs[fullname]
        if(stored === undefined){return _b_.None}
        var is_package = stored[2]
        return new_spec({
            name : fullname,
            loader: finder_VFS,
            // FIXME : Better origin string.
            origin : self.path + '#' + fullname,
            // FIXME: Namespace packages ?
            submodule_search_locations: is_package? [self.path] :
              _b_.None,
            loader_state: {stored: stored},
            // FIXME : Where exactly compiled module is stored ?
            cached: _b_.None,
            parent: is_package ? fullname : parent_package(fullname),
            has_location: _b_.True
        })
    },

    invalidate_caches: function(self){self.vfs = undefined}
}

vfs_hook.$factory = function(path) {
    if(path.substr(-1) == '/'){
        path = path.slice(0, -1)
    }
    var ext = path.substr(-7)
    if(ext != '.vfs.js'){
        throw _b_.ImportError.$factory('VFS file URL must end with .vfs.js extension');
    }
    self = {__class__: vfs_hook, path: path}
    return self
}

$B.set_func_names(vfs_hook, "<import>")

/**
 * Find modules deployed in a hierarchy under a given base URL
 *
 * @param {string}      search path URL, used as a reference during ihe import
 * @param {string}      one of 'js', 'py' or undefined (i.e. yet unknown)
 */

var url_hook = {
    __class__: _b_.type,
    __mro__: [_b_.object],
    __name__ : "UrlPathFinder",
    __repr__: function(self) {
        return "<UrlPathFinder" + (self.hint? " for '" + self.hint + "'":
                                   "(unbound)") + " at " + self.path_entry + '>'
    },

    find_spec : function(self, fullname, module) {
        var loader_data = {},
            notfound = true,
            hint = self.hint,
            base_path = self.path_entry + fullname.match(/[^.]+$/g)[0],
            modpaths = []
        var tryall = hint === undefined
        if(tryall || hint == "js"){
            // either js or undefined , try js code
            modpaths = [[base_path + ".js", "js", false]]
        }
        if(tryall || hint == 'pyc.js'){
            // either pyc or undefined , try pre-compiled module code
            modpaths = modpaths.concat([[base_path + ".pyc.js", "pyc.js", false],
                                        [base_path + "/__init__.pyc.js",
                                         "pyc.js", true]])
        }
        if(tryall || hint == 'py'){
            // either py or undefined , try py code
            modpaths = modpaths.concat([[base_path + ".py", "py", false],
                [base_path + "/__init__.py", "py", true]])
        }

        for(var j = 0; notfound && j < modpaths.length; ++j){
            try{
                var file_info = modpaths[j],
                    module = {__name__:fullname, $is_package: false}
                loader_data.code = $download_module(module, file_info[0],
                    undefined)
                notfound = false
                loader_data.type = file_info[1]
                loader_data.is_package = file_info[2]
                if(hint === undefined){
                    self.hint = file_info[1]
                    // Top-level import
                    $B.path_importer_cache[self.path_entry] = self
                }
                if (loader_data.is_package) {
                    // Populate cache in advance to speed up submodule imports
                    $B.path_importer_cache[base_path + '/'] =
                            url_hook.$factory(base_path + '/', self.hint)
                }
                loader_data.path = file_info[0]
            }catch(err){
            }
        }
        if(!notfound){
            return new_spec({
                name : fullname,
                loader: finder_path,
                origin : loader_data.path,
                // FIXME: Namespace packages ?
                submodule_search_locations: loader_data.is_package?
                    [base_path]: _b_.None,
                loader_state: loader_data,
                // FIXME : Where exactly compiled module is stored ?
                cached: _b_.None,
                parent: loader_data.is_package? fullname :
                                                parent_package(fullname),
                has_location: _b_.True})
        }
        return _b_.None
    },

    invalidate_caches : function(self) {
        // TODO: Implement
    }
}
url_hook.$factory = function(path_entry, hint){
    return {__class__: url_hook, path_entry: path_entry, hint: hint}
}
$B.set_func_names(url_hook, "<import>")


$B.path_importer_cache = {};
// see #247 - By adding these early some unnecesary AJAX requests are not sent
var _sys_paths = [[$B.script_dir + "/", "py"],
                  [$B.brython_path + "Lib/", "py"],
                  [$B.brython_path + "Lib/site-packages/", "py"],
                  [$B.brython_path + "libs/", "js"]]

for(var i = 0; i < _sys_paths.length; ++i){
    var _path = _sys_paths[i],
        _type = _path[1]
    _path = _path[0]
    $B.path_importer_cache[_path] = url_hook.$factory(_path, _type)
}
delete _path
delete _type
delete _sys_paths

// Default __import__ function
// TODO: Include at runtime in importlib.__import__
$B.$__import__ = function(mod_name, globals, locals, fromlist, level){
    // Main entry point for __import__
    //
    // If the module name mod_name is already in $B.imported, return it.
    //
    // Otherwise, function import_hooks() defined in py_import_hooks takes the
    // list of the "meta paths" valid for the application. This list is built
    // in function brython(), based on the options passed to this function.
    // The available meta paths are :
    // - finder_VFS : search in the Virtual File System ; used if
    //   brython_stdlib.js or brython_modules.js was loaded in the page
    // - finder_stdlib_static : search modules of the stdlib by Ajax calls to
    //   a url stored in a static JS object stored in stdlib_paths.js. This
    //   meta path is used by defaut and disabled if option
    //   static_stdlib_import is set to false
    // - finder_path : search modules by Ajax calls to a list of locations
    //   (current directory, site-packages). The search is made on the module
    //   name and if not found on module_name/__init__.py in case the module
    //   is a package
    // - finder_idb_cached : search modules in the IndexedDB cache
    //
    // In import_hooks, each of the finders in the meta path has a method
    // find_spec(). This method is called with module name and path and
    // a "spec" object, or None. If None, import_hooks uses the next meta
    // path, if any.
    // The "spec" object has an attribute loader (usually the meta path
    // itself). The attribute create_module of the loader is called, then
    // its attribute exec_module.
    // exec_module initializes $B.imported to a module object.


   // [Import spec] Halt import logic

   var modobj = $B.imported[mod_name],
       parsed_name = mod_name.split('.')
   if(modobj == _b_.None){
       // [Import spec] Stop loading loop right away
       throw _b_.ImportError.$factory(mod_name)
   }

   if(modobj === undefined){
       // [Import spec] Argument defaults and preconditions
       // get name of module this was called in
       if($B.is_none(fromlist)){
            fromlist = []
       }

       for(var i = 0, modsep = "", _mod_name = "", len = parsed_name.length - 1,
                __path__ = _b_.None; i <= len; ++i){
            var _parent_name = _mod_name;
            _mod_name += modsep + parsed_name[i]
            modsep = "."
            var modobj = $B.imported[_mod_name]
            if(modobj == _b_.None){
                // [Import spec] Stop loading loop right away
                throw _b_.ImportError.$factory(_mod_name)
            }else if (modobj === undefined){
                try{
                    $B.import_hooks(_mod_name, __path__, undefined)
                }catch(err){
                    delete $B.imported[_mod_name]
                    $B.imported[_mod_name] = null
                    throw err
                }

                if($B.is_none($B.imported[_mod_name])){
                    throw _b_.ImportError.$factory(_mod_name)
                }else{
                    // [Import spec] Preserve module invariant
                    // FIXME : Better do this in import_hooks ?
                    if(_parent_name){
                        _b_.setattr($B.imported[_parent_name], parsed_name[i],
                                    $B.imported[_mod_name])
                    }
                }
            }
            // else { } // [Import spec] Module cache hit . Nothing to do.
            // [Import spec] If __path__ can not be accessed an ImportError is raised
            if(i < len){
                try{
                    __path__ = _b_.getattr($B.imported[_mod_name], "__path__")
                }catch(e){
                    // If this is the last but one part, and the last part is
                    // an attribute of module, and this attribute is a module,
                    // return it. This is the case for os.path for instance
                    if(i == len - 1 &&
                            $B.imported[_mod_name][parsed_name[len]] &&
                            $B.imported[_mod_name][parsed_name[len]].__class__ ===
                                module){
                        return $B.imported[_mod_name][parsed_name[len]]
                    }
                    throw _b_.ImportError.$factory(_mod_name)
                }
            }
       }
   }
   // else { } // [Import spec] Module cache hit . Nothing to do.

   if(fromlist.length > 0){
        // Return module object matching requested module name
        return $B.imported[mod_name]
   }else{
        // Return module object for top-level package
        return $B.imported[parsed_name[0]]
   }
}

/**
 * Import a module and create corresponding bindings in the local namespace
 *
 * The function sets __BRYTHON__.modules[mod_name] and
 * __BRYTHON__.imported[mod_name] to an object representing the
 * imported module, or raises ImportError if the module couldn't be
 * found or loaded
 *
 * @param {string}      Module name specified in the import statement
 * @param {list}        Attribute names specified in from statement
 * @param {dict}        Aliases used to override local variable name bindings
 * @param {dict}        Local namespace import bindings will be applied upon
 * @return None
 */
$B.$import = function(mod_name, fromlist, aliases, locals){
    var parts = mod_name.split(".")
    // For . , .. and so on , remove one relative step
    if(mod_name[mod_name.length - 1] == "."){parts.pop()}
    var norm_parts = [],
        prefix = true
    for(var i = 0, len = parts.length; i < len; i++){
        var p = parts[i]
        if(prefix && p == ""){
            // Move up in package hierarchy
            elt = norm_parts.pop()
            if (elt === undefined) {
                throw _b_.ImportError.$factory("Parent module '' not loaded, "+
                    "cannot perform relative import")
            }
        }else{
            prefix = false;
            norm_parts.push(p.substr(0,2) == "$$" ? p.substr(2) : p)
        }
    }
    var mod_name = norm_parts.join(".")

    if($B.$options.debug == 10){
       console.log("$import "+mod_name)
       console.log("use VFS ? "+$B.use_VFS)
       console.log("use static stdlib paths ? "+$B.static_stdlib_import)
    }
    //if ($B.$options.debug == 10) {show_ns()}

    // [Import spec] Resolve __import__ in global namespace
    var current_frame = $B.frames_stack[$B.frames_stack.length - 1],
        _globals = current_frame[3],
        __import__ = _globals["__import__"],
        globals = $B.obj_dict(_globals)
    if(__import__ === undefined){
        // [Import spec] Fall back to
        __import__ = $B.$__import__
    }
    // FIXME: Should we need locals dict supply it in, now it is useless
    var importer = typeof __import__ == "function" ?
                        __import__ :
                        _b_.getattr(__import__, "__call__"),
        modobj = importer(mod_name, globals, undefined, fromlist, 0)

    // Apply bindings upon local namespace
    if(! fromlist || fromlist.length == 0){
        // import mod_name [as alias]
        // FIXME : Ensure this will work for relative imports
        var alias = aliases[mod_name]
        if(alias){
            locals[alias] = $B.imported[mod_name]
        }else{
            locals[$B.to_alias(norm_parts[0])] = modobj
            // TODO: After binding 'a' should we also bind 'a.b' , 'a.b.c' , ... ?
        }
    }else{
        var __all__ = fromlist,
            thunk = {}
        if(fromlist && fromlist[0] == "*"){
            __all__ = _b_.getattr(modobj, "__all__", thunk);
            if(__all__ !== thunk){
                // from modname import * ... when __all__ is defined
                // then fallback to importing __all__ names with no alias
                aliases = {}
            }
        }
        if(__all__ === thunk){
            // from mod_name import * ... when __all__ is not defined
            for(var attr in modobj){
                if(attr[0] !== "_"){
                    locals[attr] = modobj[attr]
                }
            }
        }else{
            // from mod_name import N1 [as V1], ... Nn [as Vn]
            // from modname import * ... when __all__ is defined
            for(var i = 0, l = __all__.length; i < l; ++i){
                var name = __all__[i]
                var alias = aliases[name] || name
                try{
                    // [Import spec] Check if module has an attribute by that name
                    locals[alias] = _b_.getattr(modobj, name);
                }catch($err1){
                    // [Import spec] attempt to import a submodule with that name ...
                    // FIXME : level = 0 ? level = 1 ?
                    try{
                        _b_.getattr(__import__, '__call__')(mod_name + '.' + name,
                            globals, undefined, [], 0);
                        // [Import spec] ... then check imported module again for name
                        locals[alias] = _b_.getattr(modobj, name);
                    }catch($err3){
                        // [Import spec] Attribute not found
                        if(mod_name === "__future__"){
                            // special case for __future__, cf issue #584
                            var frame = $B.last($B.frames_stack),
                                line_info = frame[3].$line_info,
                                line_elts = line_info.split(','),
                                line_num = parseInt(line_elts[0])
                            $B.$SyntaxError(frame[2],
                                "future feature " + name + " is not defined",
                                undefined, line_num)
                        }
                        // For other modules, raise ImportError
                        if($err3.$py_error){
                            var msg = $err3.__class__.__name__ + "\n" +
                                _b_.getattr($err3, "info")
                            throw _b_.ImportError.$factory("cannot import name '"+
                                name + "'\n\n" + msg)
                        }
                        console.log($err3)
                        throw _b_.ImportError.$factory(
                            "cannot import name '" + name + "'")
                    }
                }
            }
        }
    }
}

// List of path hooks. It is changed by function brython() depending
// on the options passed
$B.$path_hooks = [vfs_hook, url_hook]

// List of finders, also used by brython()
$B.$meta_path = [finder_VFS, finder_stdlib_static, finder_path]

function optimize_import_for_path(path, filetype){
    if (path.slice(-1) != "/") { path = path + "/" }
    // Ensure sys is loaded
    var value = (filetype == 'none')? _b_.None :
        url_hook.$factory(path, filetype)
    $B.path_importer_cache[path] = value
}

// Introspection for builtin importers
var Loader = {__class__:$B.$type,
    __mro__: [_b_.object],
    __name__ : "Loader"
}

var _importlib_module = {
    __class__ : module,
    __name__ : "_importlib",
    Loader: Loader,
    VFSFinder: finder_VFS,
    StdlibStatic: finder_stdlib_static,
    ImporterPath: finder_path,
    VFSPathFinder : vfs_hook,
    UrlPathFinder: url_hook,
    optimize_import_for_path : optimize_import_for_path
}
_importlib_module.__repr__ = _importlib_module.__str__ = function(){
return "<module '_importlib' (built-in)>"
}
$B.imported["_importlib"] = _importlib_module

})(__BRYTHON__)
