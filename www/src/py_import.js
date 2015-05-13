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
    catch(err){$B.$pop_exc();return null}
    run_js(module,path,module_contents)
    return true
}

function run_js(module,path,module_contents){
    eval(module_contents)
    // check that module name is in namespace
    try{$module}
    catch(err){
        throw _b_.ImportError("name '$module' is not defined in module")
    }
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
    $B.imported[module.name] = $B.modules[module.name] = $module
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
    try{
        var module_contents=$download_module(module.name, path)
    }catch(err){
        $B.$pop_exc()
        return null
    }
    $B.imported[module.name].$is_package = module.$is_package
    if(path.substr(path.length-12)=='/__init__.py'){
        //module.is_package = true
        $B.imported[module.name].__package__ = module.name
        $B.imported[module.name].$is_package = module.$is_package = true
    }else if(package){
        $B.imported[module.name].__package__ = package
    }else{
        var mod_elts = module.name.split('.')
        mod_elts.pop()
        $B.imported[module.name].__package__ = mod_elts.join('.')
    }
    $B.imported[module.name].__file__ = path
    return run_py(module,path,module_contents)
}

//$B.run_py is needed for import hooks..
$B.run_py=run_py=function(module,path,module_contents) {
    var $Node = $B.$Node,$NodeJSCtx=$B.$NodeJSCtx
    $B.$py_module_path[module.name]=path

    var root = $B.py2js(module_contents,module.name,
        module.name,'__builtins__')

    var body = root.children
    root.children = []
    // use the module pattern : module name returns the results of an anonymous function
    var mod_node = new $Node('expression')
    new $NodeJSCtx(mod_node,'var $module=(function()')
    root.insert(0,mod_node)
    for(var i=0, _len_i = body.length; i < _len_i;i++){mod_node.add(body[i])}

    // $globals will be returned when the anonymous function is run
    var ret_node = new $Node('expression')
    new $NodeJSCtx(ret_node,'return $locals_'+module.name.replace(/\./g,'_'))
    mod_node.add(ret_node)
    // add parenthesis for anonymous function execution
    
    var ex_node = new $Node('expression')
    new $NodeJSCtx(ex_node,')(__BRYTHON__)')
    root.add(ex_node)
    
    try{
        var js = root.to_js()
        if ($B.$options.debug == 10) {
           console.log('code for module '+module.name)
           console.log(js)
        }
        eval(js)

    }catch(err){
        console.log(err+' for module '+module.name)
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
        // add some attributes
        mod.__class__ = $B.$ModuleDict
        mod.__name__ = module.name
        mod.__repr__ = mod.__str__ = function(){
          if ($B.builtin_module_names.indexOf(module.name) > -1) {
             return "<module '"+module.name+"' (built-in)>"
          }
          return "<module '"+module.name+"' from "+path+" >"
        }

        //mod.toString = function(){return "module "+module.name}
        mod.__initializing__ = false
        mod.$is_package = module.$is_package
        $B.imported[module.name] = $B.modules[module.name] = mod
        return true
    }catch(err){
        console.log(''+err+' '+' for module '+module.name)
        for(var attr in err) console.log(attr+' '+err[attr])

        if($B.debug>0){console.log('line info '+__BRYTHON__.line_info)}
        throw err
    }
}

function import_from_VFS(mod_name, origin, package){
    var stored = $B.VFS[mod_name]
    if(stored===undefined && package){
        stored = $B.VFS[package+'.'+mod_name]
    }
    if(stored!==undefined){
        var ext = stored[0]
        var module_contents = stored[1]
        var $is_package = stored[2]
        var path = 'py_VFS'
        var module = {name:mod_name,__class__:$B.$ModuleDict,$is_package:$is_package}
        if($is_package){var package=mod_name}
        else{
            var elts = mod_name.split('.')
            elts.pop()
            var package = elts.join('.')
        }
        $B.modules[mod_name].$is_package = $is_package
        $B.modules[mod_name].__package__ = package
        if (ext == '.js') {run_js(module,path,module_contents)}
        else{run_py(module,path,module_contents)}
        console.log('import '+mod_name+' from VFS')
        return true
    }
    return null
}

function import_from_stdlib_static(mod_name,origin,package){
    var address = $B.stdlib[mod_name]
    if(address!==undefined){
        var ext = address[0]
        var $is_package = address[1]!==undefined
        var path = $B.brython_path
        if(ext=='py'){path+='Lib/'}
        else{path+='libs/'}
        path += mod_name.replace(/\./g,'/')
        if($is_package){path+='/__init__.py'}
        else if(ext=='py'){path+='.py'}
        else{path+='.js'}
        
        if(ext=='py'){
            return import_py({name:mod_name,__class__:$B.$ModuleDict,$is_package:$is_package},path,package)
        }else{
            return import_js({name:mod_name,__class__:$B.$ModuleDict},path)
        }
    }
    // if module not found, return null
    return null
}

function import_from_stdlib(mod_name, origin, package){
    var module = {name:mod_name,__class__:$B.$ModuleDict}
    var js_path = $B.brython_path+'libs/'+mod_name+'.js'
    var js_mod = import_js(module, js_path)
    if(js_mod!==null) return true
    
    mod_path = mod_name.replace(/\./g,'/')

    var py_paths = [$B.brython_path+'Lib/'+mod_path+'.py',
        $B.brython_path+'Lib/'+mod_path+'/__init__.py']
    for(var i=0, _len_i = py_paths.length; i < _len_i;i++){
        var py_mod = import_py(module, py_paths[i],package)
        if(py_mod!==null) return true
    }
    return null
}

function import_from_site_packages(mod_name, origin, package){
    var module = {name:mod_name}
    mod_path = mod_name.replace(/\./g,'/')
    var py_paths = [$B.brython_path+'Lib/site-packages/'+mod_path+'.py',
        $B.brython_path+'Lib/site-packages/'+mod_path+'/__init__.py']
    for(var i=0, _len_i = py_paths.length; i < _len_i;i++){
        var py_mod = import_py(module, py_paths[i], package)
        if(py_mod!==null){
            //console.log(py_paths[i].substr(py_paths[i].length-12))
            if(py_paths[i].substr(py_paths[i].length-12)=='/__init__.py'){
                // Since "__init__.py" was imported, module is a package
                $B.imported[mod_name].$is_package = true;
                py_mod.__package__ = mod_name  // py_mod is bool!!
            }
            return py_mod
        }
    }
    return null
}

function import_from_caller_folder(mod_name,origin,package){
    
    var module = {name:mod_name}
    var origin_path = $B.$py_module_path[origin]
    var origin_dir_elts = origin_path.split('/')
    origin_dir_elts.pop()
    origin_dir = origin_dir_elts.join('/')
    
    var mod_elts = mod_name.split('.')
    var origin_elts = origin.split('.')
    
    while(mod_elts[0]==origin_elts[0]){mod_elts.shift();origin_elts.shift()}

    mod_path = mod_elts.join('/')
    //mod_path = mod_name.replace(/\./g,'/')
    var py_paths = [origin_dir+'/'+mod_path+'.py',
        origin_dir+'/'+mod_path+'/__init__.py']

    for (var i=0, _len_i = $B.path.length; i < _len_i; i++) {
        if ($B.path[i].substring(0,4)=='http') continue
        var _path = origin_dir+'/'+ $B.path[i]+'/' 
        py_paths.push(_path+ mod_path + ".py")
        py_paths.push(_path+ mod_path + "/__init__.py")
    }

    for(var i=0, _len_i = py_paths.length; i < _len_i;i++){
        //console.log(module, py_paths[i])
        var py_mod = import_py(module, py_paths[i],package)
        if(py_mod!==null) {
            return py_mod
        }
    }
    return null    
}

function import_from_package(mod_name,origin,package){
    var mod_elts = mod_name.split('.'),
        package_elts = package.split('.')
    for(var i=0;i<package_elts.length;i++){mod_elts.shift()}
    var package_path = $B.imported[package].__file__
    if(package_path===undefined){console.log('__file__ indefini pour package '+package)}
    var py_path = package_path.split('/')
    py_path.pop()
    py_path = py_path.concat(mod_elts)
    py_path = py_path.join('/')
    py_paths = [py_path+'.py', py_path+'/__init__.py']
    for(var i=0;i<2;i++){
        var module = {name:mod_name}
        var py_mod = import_py(module,py_paths[i],package)
        if(py_mod!==null) return py_mod
    }
    return null    
}

$B.$import = function(mod_name,origin){

    // Import the module named "mod_name" from the module called "origin"
    // 
    // The function sets __BRYTHON__.modules[mod_name] and 
    // __BRYTHON__.imported[mod_name] to an object representing the
    // imported module, or raises ImportError if the module couldn't be
    // found or loaded
    //
    // The function returns None

    
    var parts = mod_name.split('.')
    var norm_parts = []
    for(var i = 0, _len_i = parts.length; i < _len_i;i++){
        norm_parts.push(parts[i].substr(0,2)=='$$' ? parts[i].substr(2) : parts[i])
    }
    mod_name = norm_parts.join('.')
    
    if($B.imported[origin]===undefined){var package = ''}
    else{var package = $B.imported[origin].__package__}

    if ($B.$options.debug == 10) {
       console.log('$import '+mod_name+' origin '+origin)
       console.log('use VFS ? '+$B.use_VFS)
       console.log('use static stdlib paths ? '+$B.static_stdlib_import)  
    }
    //if ($B.$options.debug == 10) {show_ns()}
    
    // If the module has already been imported, it is stored in $B.imported

    if($B.imported[mod_name]!==undefined){return}
    
    var mod,funcs = []
    
    // "funcs" is a list of functions used to find the module
    //
    // Brython provides several options :
    //
    // - use of a single script py_VFS.js that stores all the modules in the
    //   standard distribution
    //   If this script is loaded in the HTML page, it sets the attribute
    //   __BRYTHON__.use_VFS to True
    //
    // - use of the script stdlib_paths.js that stores a mapping between the
    //   name of the modules in the standard distribution to their location
    //   (urls relative to the path of brython.js)
    //   Unless the option "static_stdlib_import" is set to false in the 
    //   arguments of the function brython(), this mapping will be used
    //
    // - make Ajax calls to find the module or the package named "mod_name"
    //   in the path of the standard distribution (/libs or /Lib), then in
    //   /Lib/site-packages (for 3rd party modules), then in the folder of
    //   the "calling" script, identified by "origin"

    if($B.use_VFS){
        funcs = [import_from_VFS, 
            import_from_stdlib_static] // some modules in std lib are not in 
                                       // py_VFS, eg unittest
    }else if($B.static_stdlib_import){
        funcs = [import_from_stdlib_static]
    }else{
        funcs = [import_from_stdlib]
    }

    // custom functions to use to search/import modules 
    // ie, think localStorage, or maybe google drive
    // default is undefined
    if ($B.$options['custom_import_funcs'] !== undefined) {
       funcs = funcs.concat($B.$options['custom_import_funcs'])
    }

    funcs = funcs.concat([import_from_site_packages, 
                          import_from_caller_folder])


    // If the module name is qualified (form "import X.Y") we must import
    // X, then import X.Y
    var mod_elts = mod_name.split('.')
    
    if(mod_elts[0]==package && mod_elts.length==2){
        // For the form "from . import x", search name "x" in the package, ie
        // in the names defined in __init__.py
        if($B.imported[package]===undefined){
            console.log('mod_elts ['+mod_elts+']','package',package,'undef')
        }
        var res = $B.imported[package][mod_elts[1]]
        if(res!==undefined){return res}
    }

    for(var i=0, _len_i = mod_elts.length; i < _len_i;i++){
        
        // Loop to import all the elements of the module name
    
        var elt_name = mod_elts.slice(0,i+1).join('.')
        if($B.imported[elt_name]!==undefined){
            // module is already imported
            if(!$B.use_VFS && $B.imported[elt_name].$is_package){
                // If it's a package, the search will be inside this package
                package = elt_name
                package_path = $B.imported[elt_name].__file__
                funcs = [ import_from_package ]
            }
            continue // to next element
        }

        // Initialise attributes "modules" and "imported" of __BRYTHON__
        $B.modules[elt_name]=$B.imported[elt_name]={
            __class__:$B.$ModuleDict,
            toString:function(){return '<module '+elt_name+'>'}
        }
    
        // Try all the functions ; exit as soon as one of them returns a value
        var flag = false
        for( var j = 0, _len_j = funcs.length; j < _len_j;j++){
            var res = funcs[j](elt_name,origin,package)
            if(res!==null){
                flag = true
                if(i>0){
                    var pmod = mod_elts.slice(0,i).join('.')
                    $B.modules[pmod][mod_elts[i]] = $B.modules[elt_name]
                }
                break
            }
        }

        if(!flag){
            // The module couldn't be imported : erase the value in "modules" and
            // "imported", then raise ImportError
            $B.modules[elt_name]=undefined
            $B.imported[elt_name]=undefined
            throw _b_.ImportError("cannot import "+elt_name)
        }
        
        if(!($B.use_VFS && j==0) // if VFS is used but module was not found in py_VFS
            && i<mod_elts.length-1 
            && $B.imported[elt_name].$is_package){
            // If the module found is a package, the search will go on inside
            // this package
            package = elt_name
            package_path = $B.modules[elt_name].__file__
            funcs = [ import_from_package ]
        }
    }
}

$B.$import_from = function(mod_name,names,origin){
    // used for "from X import A,B,C"
    // mod_name is the name of the module
    // names is a list of names
    // origin : name of the module where the import is requested
    // if mod_name matches a module, the names are searched in the module
    // if mod_name matches a package (file mod_name/__init__.py) the names
    // are searched in __init__.py, or as module names in the package
    
    if ($B.$options.debug == 10) {
      //console.log('import from '+mod_name);show_ns()
    }
    if(mod_name.substr(0,2)=='$$'){mod_name=mod_name.substr(2)}
    mod_name = mod_name.replace(/\$/g,'')
    var mod = $B.imported[mod_name]
    if(mod===undefined){
        $B.$import(mod_name,origin)
        mod=$B.imported[mod_name]
    }
    
    for(var i=0, _len_i = names.length; i < _len_i;i++){
        if(mod[names[i]]===undefined){
            if(mod.$is_package){
                var sub_mod = mod_name+'.'+names[i].replace(/\$/g,'')
                $B.$import(sub_mod,origin)
                mod[names[i]] = $B.modules[sub_mod]
            }else{
                throw _b_.ImportError("cannot import name "+names[i])
            }
        }
    }
    return mod
}

})(__BRYTHON__)
