// import modules
"use strict";

(function($B){

var _b_ = $B.builtins,
    _window = globalThis

// var dbUpdater = new Worker($B.brython_path + 'indexedDBupdater.js')

// Class for modules
var Module = $B.module = $B.make_class("module",
    function(name, doc, $package){
        return {
            ob_type: Module,
            __builtins__: _b_.__builtins__,
            __name__: name,
            __doc__: doc || _b_.None,
            __package__: $package || _b_.None
        }
    }
)

Module.__annotations__ = _b_.property.$factory(
    function(){
        return 'coucou'
    }
)

Module.__dict__ = $B.getset_descriptor.$factory(
    Module,
    '__dict__',
    function(mod){
        return $B.obj_dict(mod)
    }
)

Module.__dir__ = function(self){
    if(self.__dir__){
        return $B.$call(self.__dir__)()
    }
    var res = []
    for(var key in self){
        if(key.startsWith('$') || key == '__class__'){
            continue
        }
        res[res.length] = key
    }
    return $B.$list(res.sort())
}

Module.__new__ = function(cls, name, doc, $package){
    return {
        __class__: cls,
        __builtins__: _b_.__builtins__,
        __name__: name,
        __doc__: doc || _b_.None,
        __package__: $package || _b_.None
    }
}

Module.__repr__ = Module.__str__ = function(self){
    var res = "<module " + self.__name__
    res += self.__file__ === undefined ? " (built-in)" :
        ' at ' + self.__file__
    return res + ">"
}

Module.__setattr__ = function(self, attr, value){
    if(self.__name__ == '__builtins__'){
        // set a Python builtin
        $B.builtins[attr] = value
    }else if(self.__name__ == 'builtins'){
        _b_[attr] = value
    }else{
        self[attr] = value
    }
}

$B.set_func_names(Module, "builtins")

$B.make_import_paths = function(filename){
    // Set $B.meta_path, the list of finders to use for imports
    //
    // The original list in $B.meta_path is made of 3 finders defined in
    // py_import.js :
    // - finder_VFS : in the Virtual File System : a Javascript object with
    //   source of the standard distribution
    // - finder_static_stlib : use the script stdlib_path.js to identify the
    //   packages and modules in the standard distribution
    // - finder_path : search module at different urls
    var filepath = $B.script_domain ? $B.script_domain + '/' + filename : filename
    var elts = filepath.split('/')
    elts.pop()
    var script_dir = elts.join('/'),
        path = [$B.brython_path + 'Lib',
            $B.brython_path + 'libs',
            script_dir,
            $B.brython_path + 'Lib/site-packages']

    var meta_path = [],
        path_hooks = []

    // $B.use_VFS is set to true if the script brython_stdlib.js or
    // brython_modules.js has been loaded in the page. In this case we use the
    // Virtual File System (VFS)
    if($B.use_VFS){
        meta_path.push($B.finders.VFS)
    }
    var static_stdlib_import = $B.get_option_from_filename('static_stdlib_import',
        filename)
    if(static_stdlib_import !== false && $B.protocol != "file"){
        // Add finder using static paths
        meta_path.push($B.finders.stdlib_static)
        // Remove /Lib and /libs in sys.path :
        // if we use the static list and the module
        // was not find in it, it's no use searching twice in the same place
        if(path.length > 3) {
            path.shift()
            path.shift()
        }
    }

    // If option "pythonpath" is specified, use it instead of the current
    // script directory
    var pythonpath = $B.get_option_from_filename('pythonpath', filename)
    if(pythonpath){
        // replace script_dir by paths in pythonpath
        var ix = path.indexOf(script_dir)
        if(ix === -1){
            console.log('bizarre, script_dir', script_dir,
                'not in path', path)
        }else{
            var fullpaths = []
            for(var p of pythonpath){
                if(p == '.'){
                    fullpaths.push(script_dir)
                }else if(p.startsWith('/')){
                    // issue 2428
                    fullpaths.push($B.script_domain + p)
                }else if(p.split('://')[0].startsWith('http')){
                    // absolute path, cf. issue 2480
                    fullpaths.push(p)
                }else if(! p.startsWith($B.script_domain)){
                    fullpaths.push(script_dir + '/' + p)
                }else{
                    fullpaths.push(p)
                }
             }
             path.splice(ix, 1, ...fullpaths)
        }
    }
    // Use the defaut finder using sys.path if protocol is not file://
    if($B.protocol !== "file"){
        meta_path.push($B.finders.path)
        path_hooks.push($B.url_hook)
    }
    $B.import_info[filename] = {meta_path, path_hooks, path}
}

function $download_module(mod, url){
    var xhr = new XMLHttpRequest(),
        fake_qs = "?v=" + (new Date().getTime()),
        res = null,
        mod_name = mod.__name__
    if($B.get_option('cache')){
        xhr.open("GET", url, false)
    }else{
        xhr.open("GET", url + fake_qs, false)
    }
    var timer = _window.setTimeout(function(){
            xhr.abort()
        }, 5000)
    xhr.send()

    if($B.$CORS){
        if(xhr.status == 200 || xhr.status == 0){
           res = xhr.responseText
        }else{
           res = $B.EXC(_b_.ModuleNotFoundError, "No module named '" +
               mod_name + "'")
        }
    }else{
        if(xhr.readyState == 4){
            if(xhr.status == 200){
                res = xhr.responseText
                mod.$last_modified =
                    xhr.getResponseHeader("Last-Modified")
            }else{
                // don't throw an exception here, it will not be caught
                // (issue #30)
                console.info("Trying to import " + mod_name +
                    ", not found at url " + url)
                res = $B.EXC(_b_.ModuleNotFoundError, "No module named '" +
                    mod_name + "'")
            }
        }
    }

    _window.clearTimeout(timer)
    // sometimes chrome doesn't set res correctly, so if res == null,
    // assume no module found
    if(res == null){
        $B.RAISE(_b_.ModuleNotFoundError, "No module named '" +
            mod_name + "' (res is null)")
    }

    if($B.$isinstance(res, _b_.BaseException)){
        throw res
    } // module not found
    return res
}

$B.$download_module = $download_module

$B.addToImported = function(name, modobj){
    if($B.imported[name]){
        for(var attr in $B.imported[name]){
            if(! modobj.hasOwnProperty(attr)){
                modobj[attr] = $B.imported[name][attr]
            }
        }
    }
    $B.imported[name] = modobj
    if(modobj === undefined){
        $B.RAISE(_b_.ImportError, 'imported not set by module')
    }
    modobj.__class__ = Module
    modobj.__name__ = name
    for(var attr in modobj){
        if(typeof modobj[attr] == "function" && ! modobj[attr].$infos){
            modobj[attr].$infos = {
                __module__: name,
                __name__: attr,
                __qualname__: attr,
                __code__: {
                    co_filename: modobj.__file__,
                    co_code: modobj[attr] + '',
                    co_flags: $B.COMPILER_FLAGS.OPTIMIZED | $B.COMPILER_FLAGS.NEWLOCALS
                }
            }
            modobj[attr].$in_js_module = true
        }else if($B.$isinstance(modobj[attr], _b_.type) &&
                ! modobj[attr].hasOwnProperty('__module__')){
            modobj[attr].__module__ = name
        }
    }
}

function run_js(module_contents, path, _module){
    var keys_before = new Set(Object.keys(globalThis))
    try{
        new Function(module_contents)()
    }catch(err){
        throw $B.exception(err)
    }
    var new_keys = (new Set(Object.keys(globalThis))).difference(keys_before)
    var modobj = $B.imported[_module.__name__]
    if(modobj === undefined){
        $B.RAISE(_b_.ImportError, 'imported not set by module')
    }
    modobj.__class__ = Module
    modobj.__name__ = _module.__name__
    for(var new_key of new_keys){
        modobj[new_key] = globalThis[new_key]
        delete globalThis[new_key]
    }
    for(var attr in modobj){
        if(typeof modobj[attr] == "function" && ! modobj[attr].$infos){
            modobj[attr].$infos = {
                __module__: _module.__name__,
                __name__: attr,
                __qualname__: attr
            }
            modobj[attr].$in_js_module = true
        }else if($B.$isinstance(modobj[attr], _b_.type) &&
                ! modobj[attr].hasOwnProperty('__module__')){
            console.log('set module to', attr, modobj[attr])
            console.log($B.$isinstance(127, _b_.type))
            modobj[attr].__module__ = _module.__name__
        }
    }
    return true
}

function run_py(module_contents, path, module, compiled) {
    // set file cache for path ; used in built-in function open()
    var filename = module.__file__
    $B.file_cache[filename] = module_contents
    $B.url2name[filename] = module.__name__
    var root,
        js,
        mod_name = module.__name__, // might be modified inside module, eg _pydecimal
        src
    if(! compiled){
        src = {
            src: module_contents,
            filename,
            imported: true
        }
        try{
            root = $B.py2js(src, module,
                            module.__name__, $B.builtins_scope)
        }catch(err){
            err.$frame_obj = $B.frame_obj
            if($B.get_option('debug', err) > 1){
                console.log('error in imported module', module)
                console.log('stack', $B.make_frames_stack(err.$frame_obj))
            }
            throw err
        }

    }

    try{
        js = compiled ? module_contents : root.to_js()
        if($B.get_option('debug') == 10){
           console.log("code for module " + module.__name__)
           console.log($B.format_indent(js, 0))
        }
        src = js
        js = "var $module = (function(){\n" + js
        var prefix = 'locals_'
        js += 'return ' + prefix
        js += module.__name__.replace(/\./g, "_") + "})(__BRYTHON__)\n" +
            "return $module"
        var module_id = prefix + module.__name__.replace(/\./g, '_')
        //console.log(module.__name__, js.length)
        //console.log(js)
        var mod = (new Function(module_id, js))(module)
    }catch(err){
        err.$frame_obj = err.$frame_obj || $B.frame_obj
        if($B.get_option('debug', err) > 2){
            console.log(err + " for module " + module.__name__)
            console.log("module", module)
            console.log(root)
            // console.log(err)
            if($B.get_option('debug', err) > 1){
                console.log($B.format_indent(js, 0))
            }
            for(let attr in err){
                console.log(attr, err[attr])
            }
            console.log("message: " + err.$message)
            console.log("filename: " + err.fileName)
            console.log("linenum: " + err.lineNumber)
            console.log(js.split('\n').slice(err.lineNumber - 3, err.lineNumber + 3).join('\n'))
            console.log(err.stack)
        }
        throw err
    }

    var imports = Object.keys(root.imports).join(",")

    try{
        // Apply side-effects upon input module object
        for(let attr in mod){
            module[attr] = mod[attr]
        }
        module.__initializing__ = false
        return {
            content: src,
            name: mod_name,
            imports,
            is_package: module.$is_package,
            path,
            timestamp: $B.timestamp,
            source_ts: module.__spec__.loader_state.timestamp
        }
    }catch(err){
        console.log("" + err + " " + " for module " + module.__name__)
        for(let attr in err){
            console.log(attr + " " + err[attr])
        }
        if($B.get_option('debug') > 0){
            console.log("line info " + __BRYTHON__.line_info)
        }
        throw err
    }
}

$B.run_py = run_py // used in importlib.basehook
$B.run_js = run_js


var ModuleSpec = $B.make_class("ModuleSpec",
    function(fields) {
        fields.__class__ = ModuleSpec
        fields.__dict__ = $B.empty_dict()
        return fields
    }
)

ModuleSpec.__str__ = ModuleSpec.__repr__ = function(self){
    var res = `ModuleSpec(name='${self.name}', ` +
        `loader=${_b_.str.$factory(self.loader)}, ` +
        `origin='${self.origin}'`
    if(self.submodule_search_locations !== _b_.None){
        res += `, submodule_search_locations=` +
            `${_b_.str.$factory(self.submodule_search_locations)}`
    }
    return res + ')'
}

$B.set_func_names(ModuleSpec, "builtins")


function parent_package(mod_name) {
    // Return a module's parent package
    var parts = mod_name.split(".")
    parts.pop()
    return parts.join(".")
}

// Finder for a Virtual File System.
// Used if brython_stdlib.js or brython_modules.js or a "Brython
// package" is loaded in the page.
var VFSFinder = $B.make_class("VFSFinder",
    function(){
        return {
            __class__: VFSFinder
        }
    }
)

VFSFinder.find_spec = function(cls, fullname){
    var stored,
        is_package,
        timestamp

    if(!$B.use_VFS){
        return _b_.None
    }
    stored = $B.VFS[fullname]
    if(stored === undefined){
        return _b_.None
    }
    is_package = stored[3] || false
    timestamp = stored.timestamp

    if(stored){
        var is_builtin = $B.builtin_module_names.indexOf(fullname) > -1
        return ModuleSpec.$factory({
            name : fullname,
            loader: VFSLoader.$factory(),
            // FIXME : Better origin string.
            origin : is_builtin? "built-in" : "brython_stdlib",
            // FIXME: Namespace packages ?
            submodule_search_locations: is_package? $B.$list([]) : _b_.None,
            loader_state: {
                stored: stored,
                timestamp:timestamp
            },
            // FIXME : Where exactly compiled module is stored ?
            cached: _b_.None,
            parent: is_package? fullname : parent_package(fullname),
            has_location: _b_.False
        })
    }
}

$B.set_func_names(VFSFinder, "<import>")

for(let method in VFSFinder){
    if(typeof VFSFinder[method] == "function"){
        VFSFinder[method] = _b_.classmethod.$factory(
            VFSFinder[method])
    }
}

// Loader for VFS modules
const VFSLoader = $B.make_class("VFSLoader",
    function(){
        return {
            __class__: VFSLoader
        }
    }
)

VFSLoader.create_module = function(){
    // Fallback to default module creation
    return _b_.None
}

VFSLoader.exec_module = function(self, modobj){
    // Besides module exection, handles the storage of the module in the
    // indexedBD cache
    var stored = modobj.__spec__.loader_state.stored,
        timestamp = modobj.__spec__.loader_state.timestamp
    var ext = stored[0],
        module_contents = stored[1],
        imports = stored[2]
    modobj.$is_package = stored[3] || false
    var path = "VFS." + modobj.__name__
    path += modobj.$is_package ? "/__init__.py" : ext
    modobj.__file__ = path
    $B.file_cache[modobj.__file__] = $B.VFS[modobj.__name__][1]
    $B.url2name[modobj.__file__] = modobj.__name__
    if(ext == '.js'){
        run_js(module_contents, modobj.__path__, modobj)
    }else if($B.precompiled.hasOwnProperty(modobj.__name__)){
        if($B.get_option('debug') > 1){
            console.info("load", modobj.__name__, "from precompiled")
        }
        var parts = modobj.__name__.split(".")
        for(var i = 0; i < parts.length; i++){
            var parent = parts.slice(0, i + 1).join(".")
            if($B.imported.hasOwnProperty(parent) &&
                    $B.imported[parent].__initialized__){
                continue
            }
            // Initialise $B.imported[parent]
            var mod_js = $B.precompiled[parent],
                is_package = modobj.$is_package
            if(mod_js === undefined){
                // Might be the case if the code in package __init__.py
                // imports a submodule : the parent of the submodule is not
                // yet in precompiled
                continue
            }
            if(Array.isArray(mod_js)){
                mod_js = mod_js[0]
            }
            var mod = $B.imported[parent] = Module.$factory(parent,
                undefined, is_package)
            mod.__initialized__ = true
            mod.__spec__ = modobj.__spec__
            if(is_package){
                mod.__path__ = "<stdlib>"
                mod.__package__ = parent
                mod.$is_package = true
            }else{
                let elts = parent.split(".")
                elts.pop()
                mod.__package__ = elts.join(".")
            }
            mod.__file__ = path
            try{
                var parent_id = parent.replace(/\./g, "_"),
                    prefix = 'locals_'
                mod_js += "return " + prefix + parent_id
                var $module = new Function(prefix + parent_id, mod_js)(
                    mod)
            }catch(err){
                if($B.get_option('debug') > 1){
                    console.log('error in module', mod)
                    console.log(err)
                    for(var k in err){console.log(k, err[k])}
                    console.log(Object.keys($B.imported))
                    console.log(modobj, "mod_js", mod_js)
                }
                throw err
            }
            for(var attr in $module){
                mod[attr] = $module[attr]
            }
            $module.__file__ = path
            if(i > 0){
                // Set attribute of parent module
                $B.builtins.setattr(
                    $B.imported[parts.slice(0, i).join(".")],
                    parts[i], $module)
            }

        }
        return $module

    }else{
        var mod_name = modobj.__name__
        if($B.get_option('debug') > 1){
            console.log("run Python code from VFS", mod_name)
        }
        var path = $B.brython_path + '/' + modobj.__file__
        var record = run_py(module_contents, path, modobj)
        record.imports = imports.join(',')
        record.is_package = modobj.$is_package
        record.timestamp = $B.timestamp
        record.source_ts = timestamp
        $B.precompiled[mod_name] = record.is_package ? [record.content] :
            record.content
        let elts = mod_name.split(".")
        if(elts.length > 1){
            elts.pop()
        }
        if($B.get_page_option('indexeddb') && $B.indexedDB &&
                $B.idb_name){
            // Store the compiled Javascript in indexedDB cache
            // $B.idb_name may not be defined if we are in a web worker
            // and the main script is run without a VFS (cf. issue #1202)
            var idb_cx = indexedDB.open($B.idb_name)
            idb_cx.onsuccess = function(evt){
                var db = evt.target.result,
                    tx = db.transaction("modules", "readwrite"),
                    store = tx.objectStore("modules"),
                    request = store.put(record)
                request.onsuccess = function(){
                    if($B.get_option('debug') > 1){
                        console.info(modobj.__name__, "stored in db")
                    }
                }
                request.onerror = function(){
                    console.info("could not store " + modobj.__name__)
                }
            }
        }
    }
}

$B.set_func_names(VFSLoader, "builtins")

// Finder for modules in the standard library when brython_stdlib.js is
// not included in the page.
var StdlibStaticFinder = $B.make_class("StdlibStaticFinder",
    function(){
        return {
            __class__: StdlibStaticFinder
        }
    }
)

StdlibStaticFinder.find_spec = function(self, fullname){
    // find_spec() relies on $B.stdlib, a precompiled list of the existing
    // modules in subdirectories Lib and libs below the directory where
    // brython.js stands. This list is in file stdlib_paths.js.
    if($B.stdlib && $B.get_option('static_stdlib_import')){
        var address = $B.stdlib[fullname]
        if(address === undefined){
            var elts = fullname.split(".")
            if(elts.length > 1){
                elts.pop()
                var $package = $B.stdlib[elts.join(".")]
                if($package && $package[1]){
                    address = ["py"]
                }
            }
        }
        if(address !== undefined){
            var ext = address[0],
                is_pkg = address[1] !== undefined,
                path = $B.brython_path +
                       ((ext == "py")? "Lib/" : "libs/") +
                       fullname.replace(/\./g, "/"),
                metadata = {
                    ext: ext,
                    is_package: is_pkg,
                    path: path + (is_pkg? "/__init__.py" :
                                  ((ext == "py")? ".py" : ".js")),
                    address: address
                },
                _module = Module.$factory(fullname)
                metadata.code = $download_module(_module, metadata.path)

            var res = ModuleSpec.$factory({
                name : fullname,
                loader: PathLoader.$factory(),
                // FIXME : Better origin string.
                origin : metadata.path,
                submodule_search_locations: is_pkg? $B.$list([path]) : _b_.None,
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

$B.set_func_names(StdlibStaticFinder, "<import>")

for(let method in StdlibStaticFinder){
    if(typeof StdlibStaticFinder[method] == "function"){
        StdlibStaticFinder[method] = _b_.classmethod.$factory(
            StdlibStaticFinder[method])
    }
}

StdlibStaticFinder.$factory = function (){
    return {__class__: StdlibStaticFinder}
}

// Finder for modules in a list of directories.
// By default, this list has one element, the directory of the current script.
// It can be extended with the option "python_path" passed to brython().
var PathFinder = $B.make_class("PathFinder",
    function(){
        return {
            __class__: PathFinder
        }
    }
)

PathFinder.find_spec = function(cls, fullname, path){
    if($B.VFS && $B.VFS[fullname]){
        // If current module is in VFS (ie standard library) it's
        // pointless to search in other locations
        return _b_.None
    }
    if($B.is_none(path)){
        // [Import spec] Top-level import , use sys.path
        path = get_info('path')
    }

    for(var i = 0, li = path.length; i < li; ++i){
        var path_entry = path[i]
        if(path_entry[path_entry.length - 1] != "/"){
            path_entry += "/"
        }
        // Try path hooks cache first
        var finder = $B.path_importer_cache[path_entry]
        if(finder === undefined){
            // Use path hooks, a list of callables that return finders.
            // By default, the only path hook is function url_hook below,
            // which returns PathEntryFinder.
            var path_hooks = get_info('path_hooks')
            for(var j = 0, lj = path_hooks.length; j < lj; ++j){
                var hook = path_hooks[j]
                try{
                    finder = $B.$call(hook)(path_entry)
                    $B.path_importer_cache[path_entry] = finder
                    break
                }catch(e){
                    if(e.__class__ !== _b_.ImportError){
                        throw e
                    }
                }
            }
        }
        // Skip this path entry if finder turns out to be None
        if($B.is_none(finder)){
            continue
        }
        // If a finder was found with the path hooks, call its method
        // find_spec() to return a ModuleSpec or None.
        var find_spec = $B.$getattr(finder, "find_spec"),
            spec = $B.$call(find_spec)(fullname)
        if(!$B.is_none(spec)){
            return spec
        }
    }
    return _b_.None
}

$B.set_func_names(PathFinder, "<import>")

for(let method in PathFinder){
    if(typeof PathFinder[method] == "function"){
        PathFinder[method] = _b_.classmethod.$factory(
            PathFinder[method])
    }
}

// Find modules deployed in a hierarchy under a given base URL
var PathEntryFinder = $B.make_class("PathEntryFinder",
    function(path_entry, hint){
        return {
            __class__: PathEntryFinder,
            path_entry: path_entry,
            hint: hint
        }
    }
)

PathEntryFinder.find_spec = function(self, fullname){
    // Search a module at different locations.
    // self has an attribute "path_entry" set to the directory where
    // modules should be searched.
    // The finder executes Ajax calls at urls <path_entry>/<fullname>.py
    // and <path_entry>/<fullname>/__init__.py
    var loader_data = {},
        notfound = true,
        hint = self.hint,
        base_path = self.path_entry + fullname.match(/[^.]+$/g)[0],
        modpaths = [],
        py_ext = $B.get_option('python_extension') // defaults to .py (issue #1748)
    var tryall = hint === undefined
    if(tryall || hint == 'py'){
        // either py or undefined , try py or js code
        modpaths = modpaths.concat([[base_path + py_ext, "py", false],
            [base_path + "/__init__" + py_ext, "py", true],
            [base_path + '.js', 'js', false]])
    }
    for(var j = 0; notfound && j < modpaths.length; ++j){
        try{
            var file_info = modpaths[j],
                module = {__name__:fullname, $is_package: false}
            loader_data.code = $download_module(module, file_info[0],
                undefined)
            notfound = false
            loader_data.ext = file_info[1]
            loader_data.is_package = file_info[2]
            loader_data.timestamp = Date.parse(module.$last_modified)
            if(hint === undefined){
                self.hint = file_info[1]
                // Top-level import
                $B.path_importer_cache[self.path_entry] = self
            }
            if (loader_data.is_package) {
                // Populate cache in advance to speed up submodule imports
                $B.path_importer_cache[base_path + '/'] =
                        $B.$call(url_hook)(base_path + '/', self.hint)
            }
            loader_data.path = file_info[0]
        }catch(err){
            if(err.__class__ !== _b_.ModuleNotFoundError){
                throw err
            }
        }
    }
    if(!notfound){
        return ModuleSpec.$factory({
            name : fullname,
            loader: PathLoader.$factory(),
            origin : loader_data.path,
            // FIXME: Namespace packages ?
            submodule_search_locations: loader_data.is_package?
                $B.$list([base_path]): _b_.None,
            loader_state: loader_data,
            // FIXME : Where exactly compiled module is stored ?
            cached: _b_.None,
            parent: loader_data.is_package? fullname :
                                            parent_package(fullname),
            has_location: _b_.True})
    }
    return _b_.None
}

$B.set_func_names(PathEntryFinder, "builtins")

// Loader for modules or packages found by StdlibStaticFinder or PathFinder
var PathLoader = $B.make_class("PathLoader",
    function(){
        return {
            __class__: PathLoader
        }
    }
)

PathLoader.create_module = function(){
    // Fallback to default module creation
    return _b_.None
}

PathLoader.exec_module = function(self, module){
    // The finder (StdlibStaticFinder, or PathFinder through an import hook)
    // has set the attributes "code" (the source code), "ext" (file
    // extension : "py" or "js"), "path" (the module url) and "is_package" to
    // the attribute "loader_state" of the module spec.
    var metadata = module.__spec__.loader_state
    module.$is_package = metadata.is_package
    if(metadata.ext == "py"){
        run_py(metadata.code, metadata.path, module)
    }else{
        run_js(metadata.code, metadata.path, module)
    }
}

var url_hook = $B.url_hook = function(path_entry){
    // path hook: a function that returns a path entry finder for the
    // specified path
    path_entry = path_entry.endsWith("/") ? path_entry : path_entry + "/"
    return PathEntryFinder.$factory(path_entry)
}

function get_info(info){
    var filename = $B.get_filename(),
        import_info = $B.import_info[filename]
    if(import_info === undefined && info == 'meta_path'){
        $B.make_import_paths(filename)
    }
    return $B.import_info[filename][info]
}

function import_engine(mod_name, _path, from_stdlib){
    /*
    Main import engine. Uses finders in sys.meta_math.

    sys.meta_path is built in function brython(), based on the options
    passed to this function.
    The available meta paths are :
    - VFSFinder : search in the Virtual File System ; used if
      brython_stdlib.js or brython_modules.js was loaded in the page
    - StdlibStaticFinder : search modules of the stdlib by Ajax calls to
      a url stored in a static JS object stored in stdlib_paths.js. This
      meta path is used by defaut and disabled if option
      static_stdlib_import is set to false
    - PathFinder : search modules by Ajax calls to a list of locations
      (current directory, site-packages). The search is made on the module
      name and if not found on module_name/__init__.py in case the module
      is a package

    If the protocol is file:, StdlibStaticFinder and PathFinder are not
    in sys.meta_path (Ajax calls are not supported in this case)

    For each finder, run its method find_spec(mod_name, _path)
    If the method returns a ModuleSpec instance, get the loader set as
    the attribute "loader" of the spec, run its methods create_module(spec)
    and exec_module(module).

    If everything is ok, set sys.modules[mod_name] to the module object
    and return it.

    If no spec was found, raise ModuleNotFoundError.
    If one of the methods raise an exception, raise it.
    */
    var meta_path = get_info('meta_path').slice(),
        _sys_modules = $B.imported,
        _loader,
        spec

    if(from_stdlib){
        // When importing from a module in the standard library, remove
        // finder_path from the finders : the module can't be in the current
        // directory.
        var path_ix = meta_path.indexOf($B.finders["path"])
        if(path_ix > -1){
            meta_path.splice(path_ix, 1)
        }
    }
    for(var i = 0, len = meta_path.length; i < len; i++){
        var _finder = meta_path[i],
            find_spec = $B.$getattr(_finder, "find_spec", _b_.None)
        if(find_spec == _b_.None){
            // If find_spec is not defined for the meta path, try the legacy
            // method find_module()
            var find_module = $B.$getattr(_finder, "find_module", _b_.None)
            if(find_module !== _b_.None){
                _loader = find_module(mod_name, _path)
                if(_loader !== _b_.None){
                    // The loader has a method load_module()
                    var load_module = $B.$getattr(_loader, "load_module"),
                        module = $B.$call(load_module)(mod_name)
                    _sys_modules[mod_name] = module
                    return module
                }
            }
        }else{
            spec = $B.$call(find_spec)(mod_name, _path)
            if(!$B.is_none(spec)){
                module = $B.imported[spec.name]
                if(module !== undefined){
                    // If module of same name is already in imports, return it
                    return _sys_modules[spec.name] = module
                }
                _loader = $B.$getattr(spec, "loader", _b_.None)
                break
            }
        }
    }

    if(_loader === undefined){
        // No import spec found
        var message = mod_name
        if($B.protocol == "file"){
            message += " (warning: cannot import local files with protocol 'file')"
        }
        var exc = $B.EXC(_b_.ModuleNotFoundError, message)
        exc.name = mod_name
        throw exc
    }

    // Import spec represents a match
    if($B.is_none(module)){
        if(spec === _b_.None){
            $B.RAISE(_b_.ModuleNotFoundError, mod_name)
        }
        var _spec_name = $B.$getattr(spec, "name")

        // Create module object
        if(!$B.is_none(_loader)){
            var create_module = $B.$getattr(_loader, "create_module", _b_.None)
            if(!$B.is_none(create_module)){
                module = $B.$call(create_module)(spec)
            }
        }
        if(module === undefined){$B.RAISE(_b_.ImportError, mod_name)}
        if($B.is_none(module)){
            // FIXME : Initialize __doc__ and __package__
            module = $B.module.$factory(mod_name)
        }
    }
    module.__name__ = _spec_name
    module.__loader__ = _loader
    module.__package__ = $B.$getattr(spec, "parent", "")
    module.__spec__ = spec

    var locs = $B.$getattr(spec, "submodule_search_locations")
    // Brython-specific var
    if(module.$is_package = !$B.is_none(locs)){
        module.__path__ = locs
    }
    if($B.$getattr(spec, "has_location")){
        module.__file__ = $B.$getattr(spec, "origin")
    }
    var cached = $B.$getattr(spec, "cached")
    if(! $B.is_none(cached)){
        module.__cached__ = cached
    }

    if($B.is_none(_loader)){
        if(!$B.is_none(locs)){
            _sys_modules[_spec_name] = module
        }else{
            $B.RAISE(_b_.ImportError, mod_name)
        }
    }else{
        var exec_module = $B.$getattr(_loader, "exec_module", _b_.None)
        if($B.is_none(exec_module)){
            // FIXME : Remove !!! Backwards compat in CPython
            module = $B.$getattr(_loader, "load_module")(_spec_name)
        }else{
            _sys_modules[_spec_name] = module
            try{
                exec_module(module)
            }catch(e){
                delete _sys_modules[_spec_name]
                throw e
           }
        }
    }
    return _sys_modules[_spec_name]
}

$B.path_importer_cache = {}

function import_error(mod_name){
    var exc = $B.EXC(_b_.ImportError, mod_name)
    exc.name = mod_name
    throw exc
}

// Default __import__ function
$B.$__import__ = function(mod_name, globals, locals, fromlist){
    var $test = false // mod_name == "tatsu.utils._command"
    if($test){console.log("__import__", mod_name, 'fromlist', fromlist);alert()}
    // Main entry point for __import__
    //
    // If the module name mod_name is already in $B.imported, return it.
    //

    //
    // In import_engine, each of the finders in the meta path has a method
    // find_spec(). This method is called with module name and path and
    // a "spec" object, or None. If None, import_engine uses the next meta
    // path, if any.
    // The "spec" object has an attribute loader (usually the meta path
    // itself). The attribute create_module of the loader is called, then
    // its attribute exec_module.
    // exec_module initializes $B.imported to a module object.

   // [Import spec] Halt import logic
   var from_stdlib = false

   // Check if the script that imports the module is in the standard library.
   // If so, it's no use trying to import with PathFinder (in the importer's
   // directory)
   if(globals.$jsobj && globals.$jsobj.__file__){
       var file = globals.$jsobj.__file__
       if((file.startsWith($B.brython_path + "Lib/") &&
               ! file.startsWith($B.brython_path + "Lib/site-packages/")) ||
               file.startsWith($B.brython_path + "libs/") ||
               file.startsWith("VFS.")){
           from_stdlib = true
       }
   }

   var modobj = $B.imported[mod_name],
       parsed_name = mod_name.split('.'),
       has_from = fromlist.length > 0

   if(modobj == _b_.None){
       // [Import spec] Stop loading loop right away
       import_error(mod_name)
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
            modobj = $B.imported[_mod_name]
            if($test){
                console.log("iter", i, _mod_name, "\nmodobj", modobj,
                    "\n__path__", __path__, Array.isArray(__path__))
                alert()
            }
            if(modobj == _b_.None){
                // [Import spec] Stop loading loop right away
                import_error(_mod_name)
            }else if(modobj === undefined){
                try{
                    import_engine(_mod_name, __path__, from_stdlib)
                }catch(err){
                    delete $B.imported[_mod_name]
                    throw err
                }
                if($B.is_none($B.imported[_mod_name])){
                    import_error(_mod_name)
                }else{
                    // [Import spec] Preserve module invariant
                    if(_parent_name){
                        _b_.setattr($B.imported[_parent_name], parsed_name[i],
                                    $B.imported[_mod_name])
                    }
                }
            }else if($B.imported[_parent_name] &&
                        $B.imported[_parent_name][parsed_name[i]] === undefined){
                // issue 1494
                _b_.setattr($B.imported[_parent_name], parsed_name[i],
                    $B.imported[_mod_name])
            }
            // [Import spec] If __path__ can not be accessed an ImportError is raised
            if(i < len){
                try{
                    __path__ = $B.$getattr($B.imported[_mod_name], "__path__")
                }catch(e){
                    // If this is the last but one part, and the last part is
                    // an attribute of module, and this attribute is a module,
                    // return it. This is the case for os.path for instance
                    if(i == len - 1 &&
                            $B.imported[_mod_name][parsed_name[len]] &&
                            $B.imported[_mod_name][parsed_name[len]].__class__ ===
                                $B.module){
                        return $B.imported[_mod_name][parsed_name[len]]
                    }
                    if(has_from){ // "from a import b" : ImportError
                        import_error(mod_name)
                    }else{
                        // "import a.b" if a is not a package : ModuleNotFoundError
                        var exc = $B.EXC(_b_.ModuleNotFoundError)
                        exc.__traceback__ = $B.make_tb()
                        exc.msg = "No module named '" + mod_name +"'; '" +
                            _mod_name + "' is not a package"
                        exc.args = $B.fast_tuple([exc.msg])
                        exc.name = mod_name
                        exc.path = _b_.None
                        throw exc
                    }
                }
            }
       }
    }else{
        if($B.imported[parsed_name[0]] &&
                parsed_name.length == 2){
            try{
                if($B.imported[parsed_name[0]][parsed_name[1]] === undefined){
                    $B.$setattr($B.imported[parsed_name[0]], parsed_name[1],
                        modobj)
                }
            }catch(err){
                console.log("error", parsed_name, modobj)
                throw err
            }
        }
    }

    if(fromlist.length > 0){
        // Return module object matching requested module name
        return $B.imported[mod_name]
    }else{
        // Return module object for top-level package
        let package_name = mod_name
        while(parsed_name.length > 1){
            var module = parsed_name.pop();
            package_name = parsed_name.join('.')
            if($B.imported[package_name] === undefined){
                // may happen if the modules defines __name__ = "X.Y" and package
                // X has not been imported
                $B.$import(package_name, [], {}, locals)
                $B.imported[package_name][module] = $B.imported[mod_name]
                mod_name = module
            }
        }
        return $B.imported[package_name]
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

 * @return None
 */
$B.$import = function(mod_name, fromlist, aliases, locals, inum){
    /*
    mod_name: module name specified in the import statement
    fromlist: names specified in "from" statement
    aliases: aliases used to override local variable name bindings
             (eg "import traceback as tb")
    locals: local namespace import bindings will be applied upon
    inum: instruction number
    */
    var test = false // mod_name == 'browser' // fromlist.length == 1 && fromlist[0] == "aliases"
    if(test){
        console.log('import', mod_name, fromlist, aliases)
    }
    // special case
    if(mod_name == '_frozen_importlib_external'){
        // "import _frozen_importlib_external [as A]" is translated to
        // "from importlib import _bootstrap_external [as A]"
        var ns, alias
        if(aliases[mod_name]){
            [ns, alias] = aliases[mod_name]
        }else{
            [ns, alias] = [locals, mod_name]
        }
        $B.$import_from("importlib", ["_bootstrap_external"],
                       {_bootstrap_external: [ns, alias]}, locals, 0)
        // set attribute _bootstrap_external of importlib._bootstrap
        // and _frozen_importlib
        let _bootstrap = $B.imported.importlib._bootstrap,
            _bootstrap_external = $B.imported.importlib['_bootstrap_external']
        _bootstrap_external._set_bootstrap_module(_bootstrap)
        _bootstrap._bootstap_external = _bootstrap_external

        let _frozen_importlib = $B.imported._frozen_importlib
        if(_frozen_importlib){
            _frozen_importlib._bootstrap_external = _bootstrap_external
        }
        return
    }
    var level = 0,
        frame = $B.frame_obj.frame,
        current_module = frame[2],
        parts = current_module.split('.')
    while(mod_name.length > 0 && mod_name.startsWith('.')){
        level++
        mod_name = mod_name.substr(1)
        if(parts.length == 0){
            $B.RAISE(_b_.ImportError, "Parent module '' not loaded, "+
                "cannot perform relative import")
        }
        current_module = parts.join('.')
        parts.pop()
    }
    if(level > 0){
        mod_name = current_module +
            (mod_name.length > 0 ? '.' + mod_name : '')

    }

    parts = mod_name.split(".")
    // For . , .. and so on , remove one relative step
    if(mod_name[mod_name.length - 1] == "."){
        parts.pop()
    }
    var norm_parts = [],
        prefix = true
    for(var p of parts){
        if(prefix && p == ""){
            // Move up in package hierarchy
            var elt = norm_parts.pop()
            if(elt === undefined){
                $B.RAISE(_b_.ImportError, "Parent module '' not loaded, "+
                    "cannot perform relative import")
            }
        }else{
            prefix = false;
            norm_parts.push(p)
        }
    }
    mod_name = norm_parts.join(".")
    fromlist = fromlist === undefined ? [] : fromlist
    aliases = aliases === undefined ? {} : aliases
    locals = locals === undefined ? {} : locals

    if(test){
        console.log('step 2, mod_name', mod_name, 'fromlist', fromlist)
        //alert()
    }

    if($B.get_option('debug') == 10){
       console.log("$import "+mod_name)
       console.log("use VFS ? "+$B.use_VFS)
       console.log("use static stdlib paths ? " +
           $B.get_option('static_stdlib_import'))
    }

    // [Import spec] Resolve __import__ in global namespace
    var current_frame = $B.frame_obj.frame,
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
                        $B.$getattr(__import__, "__call__")
    if(test){
        console.log('use importer', importer, 'mod_name', mod_name, 'fromlist', fromlist)
        //alert()
    }
    try{
        var modobj = importer(mod_name, globals, undefined, fromlist, 0)
    }catch(err){
        if(test){
            console.log('set error', err.__class__)
        }
        $B.set_inum(inum)
        throw err
    }
    if(test){
        console.log('step 3, mod_name', mod_name, 'fromlist', fromlist)
        console.log('modobj', modobj)
        //alert()
    }

    // Apply bindings upon local namespace
    if(! fromlist || fromlist.length == 0){
        // import mod_name [as alias]
        // FIXME : Ensure this will work for relative imports
        let alias = aliases[mod_name]
        if(alias){
            var [ns, name] = alias
            ns[name] = $B.imported[mod_name]
        }else{
            locals[norm_parts[0]] = modobj
            // TODO: After binding 'a' should we also bind 'a.b' , 'a.b.c' , ... ?
        }
    }else{
        var __all__ = fromlist,
            thunk = {}
        if(fromlist && fromlist[0] == "*"){
            if(test){
                console.log('import *', modobj)
                //alert()
            }
            __all__ = $B.$getattr(modobj, "__all__", thunk);
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
            for(let name of __all__){
                var [ns, alias] = [locals, name]
                if(aliases[name]){
                    [ns, alias] = aliases[name]
                }
                try{
                    // [Import spec] Check if module has an attribute by that name
                    ns[alias] = $B.$getattr(modobj, name)
                    if(ns[alias] && ns[alias].$js_func){ // issue 2395
                        ns[alias] = ns[alias].$js_func
                    }
                }catch($err1){
                    if(! $B.is_exc($err1, [_b_.AttributeError])){
                        $B.set_inum(inum)
                        throw $err1
                    }
                    // [Import spec] attempt to import a submodule with that name ...
                    // FIXME : level = 0 ? level = 1 ?
                    try{
                        if(test){
                            console.log('try to import', mod_name + '.' + name)
                        }
                        $B.$call(__import__)(mod_name + '.' + name,
                            globals, undefined, [], 0)
                        // [Import spec] ... then check imported module again for name
                        ns[alias] = $B.$getattr(modobj, name)
                    }catch($err3){
                        if(test){
                            console.log('error 3', $err3)
                        }
                        $B.set_inum(inum)
                        if(! $B.is_exc($err3, [_b_.ImportError])){
                            throw $err3
                        }
                        // [Import spec] Attribute not found
                        if(mod_name === "__future__"){
                            // special case for __future__, cf issue #584
                            var exc = $B.EXC(_b_.SyntaxError,
                                "future feature " + name + " is not defined")
                            throw exc
                        }
                        // calculate suggestion based on module namespace
                        // (new in Python 3.12)
                        var $frame = [mod_name, modobj, mod_name, modobj],
                            suggestion = $B.offer_suggestions_for_name_error($err3, $frame)
                        if($err3.$py_error){
                            $err3.__class__ = _b_.ImportError
                            $err3.args[0] = `cannot import name '${name}' ` +
                                `from '${mod_name}'`
                            if(modobj.__file__){
                                $err3.args[0] += ` (${modobj.__file__})`
                            }
                            $err3.$suggestion = suggestion
                            throw $err3
                        }
                        if($B.get_option('debug') > 2){
                            console.log('no name', name, 'in module', modobj)
                            console.log($err3)
                            console.log($B.frame_obj.frame)
                        }
                        $B.RAISE(_b_.ImportError,
                            "cannot import name '" + name + "'")
                    }
                }
            }
        }
        return locals
    }
}

$B.$import_from = function(module, names, aliases, level, locals, inum){
    // Import names from modules; level is 0 for absolute import, > 0
    // for relative import (number of dots before module name)
    var current_module_name = $B.frame_obj.frame[2],
        parts = current_module_name.split('.'),
        relative = level > 0,
        current_module
    if(relative){
        // form "from .. import X" or "from .foo import bar"
        // If current module is a package, the first . is the package, else
        // it is the module's package
        current_module = $B.imported[parts.join('.')]
        if(current_module === undefined){
            $B.set_inum(inum)
            $B.RAISE(_b_.ImportError,
                'attempted relative import with no known parent package')
        }
        if(! current_module.$is_package){
            if(parts.length == 1){
                $B.set_inum(inum)
                $B.RAISE(_b_.ImportError,
                    'attempted relative import with no known parent package')
            }else{
                parts.pop()
                current_module = $B.imported[parts.join('.')]
            }
        }
        while(level > 0){
            current_module = $B.imported[parts.join('.')]
            if(! current_module.$is_package){
                $B.set_inum(inum)
                $B.RAISE(_b_.ImportError,
                    'attempted relative import with no known parent package')
            }
            level--
            parts.pop()
        }
        if(module){
            // form "from .foo import bar"
            var submodule = current_module.__name__ + '.' + module
            $B.$import(submodule, [], {}, {}, inum)
            current_module = $B.imported[submodule]
        }
        // get names from a package
        if(names.length > 0 && names[0] == '*'){
            // eg "from .common import *"
            for(var key in current_module){
                if(key.startsWith('$') || key.startsWith('_')){
                    continue
                }
                locals[key] = current_module[key]
            }
        }else{
            for(var name of names){
                var ns, alias
                if(aliases[name]){
                    [ns, alias] = aliases[name]
                }else{
                    [ns, alias] = [locals, name]
                }
                if(current_module[name] !== undefined){
                    // name is defined in the package module (__init__.py)
                    ns[alias] = current_module[name]
                }else{
                    // try to import module in the package
                    var sub_module = current_module.__name__ + '.' + name
                    $B.$import(sub_module, [], {}, {})
                    ns[alias] = $B.imported[sub_module]
                }
            }
        }
    }else{
        // import module
        $B.$import(module, names, aliases, locals, inum)
    }
}

// List of finders, also used by brython()
$B.$meta_path = [VFSFinder, StdlibStaticFinder, PathFinder]

$B.finders = {
    VFS: VFSFinder,
    stdlib_static: StdlibStaticFinder,
    path: PathFinder
}

function optimize_import_for_path(path, filetype){
    if (path.slice(-1) != "/") { path = path + "/" }
    // Ensure sys is loaded
    var value = (filetype == 'none')? _b_.None :
        url_hook(path, filetype)
    $B.path_importer_cache[path] = value
}

// Introspection for builtin importers
var Loader = {__class__:$B.$type,
    __mro__: [_b_.object],
    __name__ : "Loader"
}

var _importlib_module = {
    __class__ : Module,
    __name__ : "_importlib",
    Loader: Loader,
    VFSFinder: VFSFinder,
    StdlibStatic: StdlibStaticFinder,
    ImporterPath: PathFinder,
    UrlPathFinder: url_hook,
    optimize_import_for_path : optimize_import_for_path
}
_importlib_module.__repr__ = _importlib_module.__str__ = function(){
return "<module '_importlib' (built-in)>"
}
$B.imported["_importlib"] = _importlib_module

})(__BRYTHON__);

