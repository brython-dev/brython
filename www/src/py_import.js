// import modules

;(function($B){

var _b_ = $B.builtins

$B.$ModuleDict = {
    __class__ : $B.$type,
    __name__ : 'module'
}
$B.$ModuleDict.__repr__ = $B.$ModuleDict.__str__ = function(self){
    return '<module '+self.__name__+'>'
}
$B.$ModuleDict.__mro__ = [$B.$ModuleDict,_b_.object.$dict]

function module(name,doc,package){
    return {__class__:$B.$ModuleDict,
        __name__:name,
        __doc__:doc||_b_.None,
        __package__:package||_b_.None
    }
}

module.__class__ = $B.$factory
module.$dict = $B.$ModuleDict
$B.$ModuleDict.$factory = module

/**
 * Module's parent package name
 */
function parent_package(mod_name) {
    var parts = mod_name.split('.');
    parts.pop();
    return parts.join('.');
}

function $importer(){
    // returns the XMLHTTP object to handle imports
    var $xmlhttp = new XMLHttpRequest();
    if ($B.$CORS && "withCredentials" in $xmlhttp) {
       // Check if the XMLHttpRequest object has a "withCredentials" property.
       // "withCredentials" only exists on XMLHTTPRequest2 objects.
    } else if ($B.$CORS && typeof window.XDomainRequest != "undefined") {
      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      $xmlhttp = new window.XDomainRequest();
    } else if (window.XMLHttpRequest){
      // Otherwise, CORS is not supported by the browser. or CORS is not activated by developer/programmer
      // code for IE7+, Firefox, Chrome, Opera, Safari
      //$xmlhttp=new XMLHttpRequest();  // we have already an instance of XMLHttpRequest
    }else{// code for IE6, IE5
      // Otherwise, CORS is not supported by the browser. or CORS is not activated by developer/programmer
      $xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }

    var fake_qs;
    switch ($B.$options.cache) {
       case 'version':
            fake_qs="?v="+$B.version_info[2]
            break;
       case 'browser':
            fake_qs=''
            break;
       default:
            fake_qs="?v="+$B.UUID()
    }

    var timer = setTimeout( function() {
        $xmlhttp.abort()
        throw _b_.ImportError("No module named '"+module+"'")}, 5000)
    return [$xmlhttp,fake_qs,timer]
}

function $download_module(module,url){
    var imp = $importer()
    var $xmlhttp = imp[0],fake_qs=imp[1],timer=imp[2],res=null

    $xmlhttp.open('GET',url+fake_qs,false)

    if ($B.$CORS) {
      $xmlhttp.onload=function() {
         if ($xmlhttp.status == 200 || $xmlhttp.status == 0) {
            res = $xmlhttp.responseText
         } else {
            res = _b_.FileNotFoundError("No module named '"+module+"'")
         }
      }
      $xmlhttp.onerror=function() {
         res = _b_.FileNotFoundError("No module named '"+module+"'")
      }
    } else {
      $xmlhttp.onreadystatechange = function(){
        if($xmlhttp.readyState==4){
            window.clearTimeout(timer)
            if($xmlhttp.status==200 || $xmlhttp.status==0){res=$xmlhttp.responseText}
            else{
                // don't throw an exception here, it will not be caught (issue #30)
            console.log('Error '+$xmlhttp.status+' means that Python module '+module+' was not found at url '+url)
                res = _b_.FileNotFoundError("No module named '"+module+"'")
            }
        }
      }
    }
    if('overrideMimeType' in $xmlhttp){$xmlhttp.overrideMimeType("text/plain")}
    $xmlhttp.send()

    //sometimes chrome doesn't set res correctly, so if res == null, assume no module found
    if(res == null) throw _b_.FileNotFoundError("No module named '"+module+"' (res is null)")

    //console.log('res', res)
    if(res.constructor===Error){throw res} // module not found
    return res
}

$B.$download_module=$download_module

function import_js(module,path) {
    try{var module_contents=$download_module(module.name, path)}
    catch(err){return null}
    run_js(module_contents,path,module)
    return true
}

function run_js(module_contents,path,module){
    // FIXME : Enhanced module isolation e.g. run_js arg names , globals ...
    eval(module_contents);

    // check that module name is in namespace
    try{$module}
    catch(err){
        throw _b_.ImportError("name '$module' is not defined in module")
    }
    if (module !== undefined) {
        // FIXME : This might not be efficient . Refactor js modules instead.
        // Overwrite original module object . Needed e.g. for reload()
        for (var attr in $module) { module[attr] = $module[attr]; }
        $module = module;
    }
    else {
        // add class and __str__
        $module.__class__ = $B.$ModuleDict
        $module.__name__ = module.name
        $module.__repr__=$module.__str__ = function(){
          if ($B.builtin_module_names.indexOf(module.name) > -1) {
             return "<module '"+module.name+"' (built-in)>"
          }
    
          //if(module.name == 'builtins') return "<module '"+module.name+"' (built-in)>"
          return "<module '"+module.name+"' from "+path+" >"
        }
    
        $module.toString = function(){return "<module '"+module.name+"' from "+path+" >"}
        if(module.name != 'builtins') { // builtins do not have a __file__ attribute
          $module.__file__ = path
        }
    }
    return true
}

function show_ns(){
    var kk = Object.keys(window)
    for (var i=0, _len_i = kk.length; i < _len_i; i++){
        console.log(kk[i])
        if(kk[i].charAt(0)=='$'){console.log(eval(kk[i]))}
    }
    console.log('---')
}

function import_py(module,path,package){
    // import Python module at specified path
    var mod_name = module.__name__;
    try{
        var module_contents=$download_module(mod_name, path)
    }catch(err){
        return null
    }
    $B.imported[mod_name].$is_package = module.$is_package
    if(path.substr(path.length-12)=='/__init__.py'){
        //module.is_package = true
        $B.imported[mod_name].__package__ = mod_name
        $B.imported[mod_name].$is_package = module.$is_package = true
    }else if(package){
        $B.imported[mod_name].__package__ = package
    }else{
        var mod_elts = mod_name.split('.')
        mod_elts.pop()
        $B.imported[mod_name].__package__ = mod_elts.join('.')
    }
    $B.imported[mod_name].__file__ = path
    return run_py(module_contents,path,module)
}

//$B.run_py is needed for import hooks..
$B.run_py=run_py=function(module_contents,path,module) {
    var $Node = $B.$Node,$NodeJSCtx=$B.$NodeJSCtx
    $B.$py_module_path[module.name]=path

    var root = $B.py2js(module_contents,module.__name__,
        module.__name__,'__builtins__')

    var body = root.children
    root.children = []
    // use the module pattern : module name returns the results of an anonymous function
    var mod_node = new $Node('expression')
    new $NodeJSCtx(mod_node,'var $module=(function()')
    root.insert(0,mod_node)
    for(var i=0, _len_i = body.length; i < _len_i;i++){mod_node.add(body[i])}

    // $globals will be returned when the anonymous function is run
    var ret_node = new $Node('expression')
    new $NodeJSCtx(ret_node,'return $locals_'+module.__name__.replace(/\./g,'_'))
    mod_node.add(ret_node)
    // add parenthesis for anonymous function execution
    
    var ex_node = new $Node('expression')
    new $NodeJSCtx(ex_node,')(__BRYTHON__)')
    root.add(ex_node)
    
    try{
        var js = root.to_js()
        if ($B.$options.debug == 10) {
           console.log('code for module '+module.__name__)
           console.log(js)
        }
        eval(js)

    }catch(err){
        console.log(err+' for module '+module.__name__)
        //for(var attr in err){
            //console.log(attr, err[attr])
        //}
        console.log('message: '+err.$message)
        console.log('filename: '+err.fileName)
        console.log('linenum: '+err.lineNumber)
        if($B.debug>0){console.log('line info '+ $B.line_info)}
        throw err
    }
    
    try{
        // Create module object
        var mod = eval('$module')
        // Apply side-effects upon input module object
        for (var attr in mod) {
            module[attr] = mod[attr];
        }
        module.__initializing__ = false
        return true
    }catch(err){
        console.log(''+err+' '+' for module '+module.name)
        for(var attr in err) console.log(attr+' '+err[attr])

        if($B.debug>0){console.log('line info '+__BRYTHON__.line_info)}
        throw err
    }
}

function new_spec(fields) {
    // TODO : Add Python-related fields e.g. ModuleSpec class
    return fields;
}

// Virtual File System optimized module import
importer_VFS = {
    'find_spec' : function(self, fullname, path, prev_module) {
        if (!$B.use_VFS) {
            return _b_.None;
        }
        var stored = $B.VFS[mod_name];
        if (stored===undefined) {
            return _b_.None;
        }
        var is_package = stored[2],
            is_builtin = $B.builtin_module_names.indexOf(fullname) > -1;
        return new_spec({name : fullname,
                         loader: self,
                         // FIXME : Better origin string.
                         origin : is_builtin? 'built-in' : 'py_VFS',
                         // FIXME: Namespace packages ?
                         submodule_search_locations: is_package? [] : _b_.None,
                         loader_state: {stored: stored},
                         // FIXME : Where exactly compiled module is stored ?
                         cached: _b_.None,
                         parent: is_package? fullname : parent_package(fullname),
                         has_location: _b_.False});
    },
    'create_module' : function(self, spec) {
        // Fallback to default module creation
        return _b_.None;
    },
    'exec_module' : function(self, module) {
        var stored = module.__spec__.loader_state.stored;
        delete module.__spec__['loader_state'];
        var ext = stored[0],
            module_contents = stored[1];
        module.$is_package = stored[2];
        if (ext == '.js') {run_js(module_contents, module.__path__, module)}
        else {run_py(module_contents, module.__path__, module)}
        console.log('import '+module.__name__+' from VFS')
    }
}

importer_VFS.__repr__ = importer_VFS.__str__ = importer_VFS.toString = 
    function() { return '<object importer_VFS>' }

/**
 * Module importer optimizing module lookups via stdlib_paths.js
 */
importer_stdlib_static = {
    'find_spec' : function(self, fullname, path, prev_module) {
        if ($B.stdlib) {
            var address = $B.stdlib[fullname];
            if (address !== undefined) {
                var ext = address[0],
                    is_pkg = address[1] !== undefined,
                    path = $B.brython_path + ((ext == 'py')? 'Lib/' : 'libs/') +
                           fullname.replace(/\./g, '/'),
                    metadata = {ext: ext,
                                is_package: is_pkg,
                                path: path + (is_pkg? '/__init__.py' :
                                              ((ext == 'py')? '.py' : '.js')),
                                address: address}
                return new_spec({name : fullname,
                                 loader: self,
                                 // FIXME : Better origin string.
                                 origin : metadata.path,
                                 submodule_search_locations: is_pkg? [path] : _b_.None,
                                 loader_state: metadata,
                                 // FIXME : Where exactly compiled module is stored ?
                                 cached: _b_.None,
                                 parent: is_pkg? fullname :
                                                     parent_package(fullname),
                                 has_location: _b_.True});
            }
        }
        return _b_.None;
    },
    'create_module' : function(self, spec) {
        // Fallback to default module creation
        return _b_.None;
    },
    'exec_module' : function(self, module) {
        var metadata = module.__spec__.loader_state;
        delete module.__spec__['loader_state'];
        module.$is_package = metadata.is_package; 
        if (metadata.ext == 'py') {
            import_py(module, metadata.path, module.__package__);
        }
        else {
            import_js(module, metadata.path);
        }
    }
}

importer_stdlib_static.__repr__ = importer_stdlib_static.__str__ =
importer_stdlib_static.toString = 
    function() { return '<object importer_stdlib_static>' }


/**
 * Search an import path for .js and .py modules
 */
importer_path = {
    'find_spec' : function(self, fullname, path, prev_module) {
        if (is_none(path)) {
            // [Import spec] Top-level import , use sys.path
            path = $B.path;
        }
        for (var i = 0, li = path.length; i<li; ++i) {
            var path_entry = path[i];
            if (path_entry[path_entry.length - 1] != '/') {
                path_entry += '/'
            }
            // Try path hooks cache first
            var finder = $B.path_importer_cache[path_entry];
            if (finder === undefined) {
                var finder_notfound = true;
                for (var j = 0, lj = $B.path_hooks.length;
                     j < lj && finder_notfound;
                     ++j) {
                    var hook = $B.path_hooks[j];
                    try {
                        finder = _b_.getattr(hook, '__call__')(path_entry)
                        finder_notfound = false;
                    }
                    catch (e) {
                        if (e.__class__ !== _b_.ImportError.$dict) { throw e; }
                    }
                }
                if (finder_notfound) {
                    $B.path_importer_cache[path_entry] = _b_.None;
                }
            }
            var spec = _b_.getattr(_b_.getattr(finder, 'find_spec'),
                                   '__call__')(finder, fullname, prev_module);
            if (!is_none(spec)) {
                return spec;
            }
        }
        return _b_.None;
    },
    'create_module' : function(self, spec) {
        // Fallback to default module creation
        return _b_.None;
    },
    'exec_module' : function(self, module) {
        var _spec = _b_.getattr(module, '__spec__'),
            code = _spec.loader_state.code;
        module.$is_package = _spec.loader_state.is_package,
        delete _spec.loader_state['code'];
        if (_spec.loader_state.type == 'py') {
            run_py(code, _spec.origin, module);
        }
        else if (_spec.loader_state.type == 'js') {
            run_js(code, _spec.origin, module)
        }
    }
}

importer_path.__repr__ = importer_path.__str__ = importer_path.toString = 
    function() { return '<object importer_path>' }

// FIXME : Add this code elsewhere ?
$B.path_hooks = [];
$B.path_importer_cache = {};

/**
 * Find modules packaged in a js script to be used as a virtual file system
 *
 * @param {string}      URL pointing at location of VFS js file
 */
VfsPathFinder = function(path) {
    if (path.substr(-1) == '/') {
        path = path.slice(0, -1);
    }
    var ext = path.substr(-7);
    if (ext != '.vfs.js') {
        throw _b_.ImportError('VFS file URL must end with .vfs.js extension');
    }
    this.path = path;
    this.load_vfs();
}

VfsPathFinder.prototype.load_vfs = function() {
    try { var code = $download_module('<VFS>', this.path) }
    catch (e) {
        this.vfs = undefined;
        throw new _b_.ImportError(e.$message || e.message);
    }
    eval(code);
    try {
        this.vfs = $vfs;
    }
    catch (e) { throw new _b_.ImportError('Expecting $vfs var in VFS file'); }
    $B.path_importer_cache[this.path + '/'] = this;
}

VfsPathFinder.prototype.find_spec = function(self, fullname, module) {
    if (self.vfs === undefined) {
        try { self.load_vfs() }
        catch(e) {
            console.log("Could not load VFS while importing '" + fullname + "'");
            return _b_.None;
        }
    }
    var stored = self.vfs[fullname];
    if (stored === undefined) {
        return _b_.None;
    }
    var is_package = stored[2];
    return new_spec({name : fullname,
                     loader: importer_VFS,
                     // FIXME : Better origin string.
                     origin : self.path + '#' + fullname,
                     // FIXME: Namespace packages ?
                     submodule_search_locations: is_package? [self.path] : _b_.None,
                     loader_state: {stored: stored},
                     // FIXME : Where exactly compiled module is stored ?
                     cached: _b_.None,
                     parent: is_package? fullname : parent_package(fullname),
                     has_location: _b_.True});
}

VfsPathFinder.prototype.invalidate_caches = function(self) {
    self.vfs = undefined;
}

VfsPathFinder.prototype.__repr__ = function() {
    return "<VfsPathFinder for '" + this.path + "'>"
}

vfs_hook = function(path) { return new VfsPathFinder(path); }

vfs_hook.__repr__ = vfs_hook.__str__ = vfs_hook.toString = function() {
    return '<function path_hook_for_VfsPathFinder>';
}
$B.path_hooks.push(vfs_hook);

/**
 * Find modules deployed in a hierarchy under a given base URL
 *
 * @param {string}      search path URL, used as a reference during ihe import
 * @param {string}      one of 'js', 'py' or undefined (i.e. yet unknown)
 */
UrlPathFinder = function(path, hint) {
    this.path = path;
    this.hint = hint;
}

UrlPathFinder.prototype.find_spec = function(self, fullname, module) {
    var loader_data = {},
        notfound = true,
        hint = self.hint,
        path_entry = self.path,
        base_path = path_entry + fullname.match(/[^.]+$/g)[0],
        modpaths = [];
    if (hint != 'py') {
        // either js or undefined , try js code
        modpaths = [[base_path + '.js', 'js', false]];
    }
    if (hint != 'js') {
        // either py or undefined , try py code
        modpaths = modpaths.concat([[base_path + '.py', 'py', false],
                                    [base_path + '/__init__.py',
                                     'py', true]]);
    }
    for (var j = 0; notfound && j < modpaths.length; ++j) {
        try{
            var file_info = modpaths[j];
            loader_data.code=$download_module(fullname, file_info[0]);
            notfound = false;
            if (self.hint === undefined) {
                // First time path is considered for top-level import
                self.hint = file_info[1]
                $B.path_importer_cache[self.path] = self;
            }
            loader_data.type = file_info[1];
            loader_data.is_package = file_info[2];
            if (loader_data.is_package) {
                // Populate cache in advance to speed up submodule imports
                $B.path_importer_cache[base_path + '/'] =
                        new UrlPathFinder(base_path + '/', self.hint);
            }
            loader_data.path = file_info[0];
        }catch(err){
        }
    }
    if (!notfound) {
        return new_spec({
            name : fullname,
            loader: importer_path,
            origin : loader_data.path,
            // FIXME: Namespace packages ?
            submodule_search_locations: loader_data.is_package? [base_path]:
                                                                _b_.None,
            loader_state: loader_data,
            // FIXME : Where exactly compiled module is stored ?
            cached: _b_.None,
            parent: loader_data.is_package? fullname :
                                            parent_package(fullname),
            has_location: _b_.True});
    }
    return _b_.None;
}

UrlPathFinder.prototype.invalidate_caches = function(self) {
    // TODO: Implement
}

UrlPathFinder.prototype.__repr__ = function() {
    return "<UrlPathFinder for '" + this.path + "'" +
           (this.hint !== undefined? " format '" + this.hint + "'": '') + '>';
        //console.log('mod_path', mod_path) 
}

url_hook = function(path) { return new UrlPathFinder(path); };
url_hook.__repr__ = url_hook.__str__ = url_hook.toString = function() {
    return '<function path_hook_for_UrlPathFinder>';
}
$B.path_hooks.push(url_hook);

window.is_none = function (o) {
    return o === undefined || o == _b_.None;
}

// Default __import__ function
// TODO: Include at runtime in importlib.__import__
$B.$__import__ = function (mod_name, globals, locals, fromlist, level){
   // [Import spec] Halt import logic
   var modobj = $B.imported[mod_name],
       parsed_name = mod_name.split('.');
   if (modobj == _b_.None) {
       // [Import spec] Stop loading loop right away
       throw _b_.ImportError(parent_name) 
   }

   if (modobj === undefined) {
       // [Import spec] Argument defaults and preconditions
       // get name of module this was called in
       if (is_none(globals)) {
            var current_frame = $B.frames_stack[$B.frames_stack.length-1];
            globals = current_frame[3];
       }
       var origin = globals.__name__
       if (is_none(fromlist)) {
            fromlist = [];
       }
       if (is_none(level)) {
            level = 0;
       }
       // TODO: Async module download and request multiplexing
       for (var i = 0, modsep = '', _mod_name = '', l = parsed_name.length - 1,
                __path__ = _b_.None; i <= l; ++i) {
            var _parent_name = _mod_name;
            _mod_name += modsep + parsed_name[i];
            modsep = '.';
            var modobj = $B.imported[_mod_name];
            if (modobj == _b_.None) {
                // [Import spec] Stop loading loop right away
                throw _b_.ImportError(_mod_name) 
            }
            else if (modobj === undefined) {
                try {window.import_hooks(_mod_name, origin, __path__)}
                catch(err) {
                    delete $B.imported[_mod_name]
                }
        
                if (is_none($B.imported[_mod_name])) {
                    throw _b_.ImportError(_mod_name) 
                }
                else {
                    // [Import spec] Preserve module invariant
                    // FIXME : Better do this in import_hooks ?
                    if (_parent_name) {
                        _b_.setattr($B.imported[_parent_name], parsed_name[i],
                                    $B.imported[_mod_name]);
                    }
                }
            }
            // else { } // [Import spec] Module cache hit . Nothing to do.
            // [Import spec] If __path__ can not be accessed an ImportError is raised
            if (i < l) {
                try { __path__ = _b_.getattr($B.imported[_mod_name], '__path__') }
                catch (e) { throw _b_.ImportError(_mod_name) }
            }
       }
   }
   // else { } // [Import spec] Module cache hit . Nothing to do.

   if (fromlist.length > 0) {
        // Return module object matching requested module name
        return $B.imported[mod_name]
   }
   else {
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
 * @param {string}      Name of the module invoking the import statement
 * @param {list}        Attribute names specified in from statement
 * @param {dict}        Aliases used to override local variable name bindings
 * @param {dict}        Local namespace import bindings will be applied upon
 * @return None
 */
$B.$import = function(mod_name,origin,fromlist, aliases, locals){
    var parts = mod_name.split('.');
    // For . , .. and so on , remove one relative step
    if (mod_name[mod_name.length - 1] == '.') { parts.pop() }
    if (mod_name[0] == '.') {
        // Relative imports
        norm_parts = _b_.getattr($B.imported[origin], '__package__', '');
        // Add a dummy item at the end so that initial dot corresponds to current pkg
        norm_parts = (norm_parts == '')? ['']: (norm_parts + '.').split('.');
    }
    else {
        var norm_parts = []
    }
    prefix = true;
    for(var i = 0, _len_i = parts.length; i < _len_i;i++){
        var p = parts[i];
        if (prefix && p == '') {
            // Move up in package hierarchy
            elt = norm_parts.pop();
            if (elt === undefined) {
                throw _b_.ImportError("Parent module '' not loaded, cannot perform relative import");
            }
        }
        else {
            prefix=false;
            norm_parts.push(p.substr(0,2)=='$$' ? p.substr(2) : p)
        }
    }
    var mod_name = norm_parts.join('.')
    
    if ($B.$options.debug == 10) {
       console.log('$import '+mod_name+' origin '+origin)
       console.log('use VFS ? '+$B.use_VFS)
       console.log('use static stdlib paths ? '+$B.static_stdlib_import)  
    }
    //if ($B.$options.debug == 10) {show_ns()}

    // [Import spec] Resolve __import__ in global namespace
    var current_frame = $B.frames_stack[$B.frames_stack.length-1];
    globals = current_frame[3];
    __import__ = globals['__import__'];
    if (__import__ === undefined) {
        // [Import spec] Fall back to
        __import__ = $B.$__import__;

    /*
    var current_path = $B.last($B.frames_stack)[1].__file__

    for(var i=0;i<$B.path.length;i++){
        console.log(i,'path',$B.path[i],'stdlib ?', $B.path[i]==stdlib_path,
            'site-pacakes ?',$B.path[i]==site_packages_path,
            'current ?',$B.path[i]==current_path)
    }
    */
    }
    // FIXME: Should we need locals dict supply it in, now it is useless
    var modobj = _b_.getattr(__import__,
                             '__call__')(mod_name, globals, undefined, fromlist, 0);

    // Apply bindings upon local namespace
    if (!fromlist || fromlist.length == 0) {
        // import mod_name [as alias]
        // FIXME : Ensure this will work for relative imports
        var alias = aliases[mod_name];
        if (alias) {
            locals[alias] = $B.imported[mod_name];
        }
        else {
            locals[norm_parts[0]] = modobj;
            // TODO: After binding 'a' should we also bind 'a.b' , 'a.b.c' , ... ? 
        }
    }
    else {
        var __all__ = fromlist,
            thunk = {};
        if (fromlist && fromlist[0] == '*') {
            __all__ = _b_.getattr(modobj, '__all__', thunk);
            if (__all__ !== thunk) {
                // from modname import * ... when __all__ is defined
                // then fallback to importing __all__ names with no alias
                aliases = {};
            }
        }
        if (__all__ === thunk) {
            // from mod_name import * ... when __all__ is not defined
            for (var attr in modobj) {
                if (attr[0] !== '_') {
                    locals[attr] = modobj[attr];
                }
            }
        }
        else {
            // from mod_name import N1 [as V1], ... Nn [as Vn]
            // from modname import * ... when __all__ is defined
            for (var i = 0, l = __all__.length; i < l; ++i) {
                var name = __all__[i];
                var alias = aliases[name] || name;
                try {
                    // [Import spec] Check if module has an attribute by that name
                    locals[alias] = _b_.getattr(modobj, name);
                }
                catch ($err1) {
                    // [Import spec] attempt to import a submodule with that name ...
                    // FIXME : level = 0 ? level = 1 ?
                    try {
                        _b_.getattr(__import__,
                                    '__call__')(mod_name + '.' + name,
                                                globals, undefined, [], 0);
                    }
                    catch ($err2) {
                        if ($err2.__class__ = _b_.ImportError.$dict) {
                            throw _b_.ImportError("cannot import name '" + name + "'")
                        }
                        throw $err2;
                    }
                    try {
                        // [Import spec] ... then check imported module again for name
                        locals[alias] = _b_.getattr(modobj, name);
                    }
                    catch ($err3) {
                        // [Import spec] On attribute not found , raise ImportError
                        if ($err3.__class__ === _b_.AttributeError.$dict) {
                            $err3.__class__ = _b_.ImportError.$dict;
                        }
                    }
                }
            }
        }
    }
}

$B.meta_path = [importer_VFS, importer_stdlib_static, importer_path];

})(__BRYTHON__)
