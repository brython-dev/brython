function run($B){
__BRYTHON__.debug = 1

function ajax_load(){
    if(this.readyState==4){
        if(this.status==200){
            __BRYTHON__.module_source[this.module] = this.responseText.length
            if(this.path != "libs"){
                var root = __BRYTHON__.py2js(this.responseText, this.module,
                    this.module, "__builtins__")
                __BRYTHON__.module_source[this.module] = root.to_js()
                for(var key in root.imports){
                    if(!__BRYTHON__.module_source.hasOwnProperty(key)){
                        tasks.splice(0, 0, [inImported, key])
                    }
                }
            }
        }else if(this.status==404){
            if(this.path == "Lib"){
                tasks.splice(0, 0, [ajax_libs, this.module])
            }else if(this.path == "libs"){
                tasks.splice(0, 0, [ajax_current_dir, this.module])
            }else if(this.path == "current-dir"){
                tasks.splice(0, 0, [ajax_site_packages, this.module])
            }
        }
        loop()
    }
}

function ajax_Lib(module){
    var req = new XMLHttpRequest()
    req.open("GET", "/src/Lib/" + module + ".py", true)
    req.onreadystatechange = ajax_load
    req.module = module
    req.path = "Lib"
    req.send()
}

function ajax_libs(module){
    var req = new XMLHttpRequest()
    req.open("GET", "/src/libs/" + module + ".js", true)
    req.onreadystatechange = ajax_load
    req.module = module
    req.path = "libs"
    req.send()
}

function ajax_current_dir(module){
    var req = new XMLHttpRequest()
    req.open("GET", module + ".py", true)
    req.onreadystatechange = ajax_load
    req.module = module
    req.path = "current-dir"
    req.send()
}

function ajax_site_packages(module){
    var req = new XMLHttpRequest()
    req.open("GET", "/src/Lib/site-packages/" + module + ".py", true)
    req.onreadystatechange = ajax_load
    req.module = module
    req.path = "site-packages"
    req.send()
}

function inImported(module){
    if(__BRYTHON__.imported.hasOwnProperty(module)){
        __BRYTHON__.module_source[module] = "in imported"
    }else if(__BRYTHON__.stdlib.hasOwnProperty(module)){
        tasks.splice(0, 0, [idb_search, module])
    }else{
        tasks.splice(0, 0, [ajax_current_dir, module])
    }
    loop()
}

var idb_cx

function idb_load(evt, module){
    //document.write("idb load "+module+"<br>")
    var results = evt.target.result,
        res
    if(results!==undefined){
        for(var i=0;i<results.length;i++){
            if(results[i].ext==".pyjs"){
                res = results[i]
            }
        }
        res = res || results[0]
        if(res===undefined){
            // not found : search in VFS
            if(__BRYTHON__.VFS[module] !== undefined){
                // precompile module
                var elts = __BRYTHON__.VFS[module],
                    ext = elts[0],
                    source = elts[1],
                    is_package = elts.length==3
                if(ext==".py"){
                    var root = __BRYTHON__.py2js(source, module, module, "__builtins__"),
                        js = root.to_js(),
                        imports = root.imports
                    imports = Object.keys(imports).join(",")
                    tasks.splice(0, 0, [store_precompiled, [module, js, imports, is_package],
                        function(evt){return stored(evt, module)}])
                }else{
                    source += "\nvar $locals_" +
                        module.replace(/\./g, "_") + " = $module"
                    __BRYTHON__.module_source[module] = source
                }
            }else{
                console.log('not found', module)
            }
        }else if(res.ext==".pyjs"){
            // precompiled source
            __BRYTHON__.module_source[module] = res.content
            if(res.imports.length>0){
                var subimports = res.imports.split(",")
                for(var i=0;i<subimports.length;i++){
                    var subimport = subimports[i]
                    if(subimport==""){
                        console.log('bizarre', module)
                    }
                    if(subimport.startsWith(".")){
                        var url_elts = module.split("."),
                            nb_dots = 0
                        while(subimport.startsWith(".")){
                            nb_dots++
                            subimport = subimport.substr(1)
                        }
                        var elts = url_elts.slice(0, nb_dots)
                        if(subimport){
                            elts = elts.concat([subimport])
                        }
                        subimport = elts.join(".")
                    }
                    if(!__BRYTHON__.imported.hasOwnProperty(subimport) &&
                            !__BRYTHON__.module_source.hasOwnProperty(subimport)){
                        tasks.splice(0, 0, [idb_search, subimport])
                    }
                }
            }
        }else if(res.ext==".py"){
            // precompile module
            var root = __BRYTHON__.py2js(res.content, module, module, "__builtins__"),
                js = root.to_js(),
                imports = root.imports
            imports = Object.keys(imports).join(",")
            tasks.splice(0, 0, [store_precompiled, [module, js, imports, res.is_package],
                function(evt){return stored(evt, module)}])

        }else if(res.ext==".js"){
            var src = res.content
            src += "\nvar $locals_" +
                module.replace(/\./g, "_") + " = $module"
            __BRYTHON__.module_source[module] = src
        }
    }
    loop()
}

function stored(evt, module){
    // Called when the precompiled Javascript for module has been stored
    // in the indexedDB database.
    // We add the task "idb_search", knowing that this time it will use the
    // compiled version.
    tasks.splice(0, 0, [idb_search, module])
    loop()
}

function store_precompiled(args, callback){
    // Sends a request to store the compiled Javascript for a module.
    var module = args[0],
        js = args[1],
        imports = args[2],
        is_package = args[3]

    var db = idb_cx.result,
        tx = db.transaction("modules", "readwrite"),
        store = tx.objectStore("modules"),
        cursor = store.openCursor(),
        data = {"name": module, "content": js,
            "imports": imports,
            "ext": ".pyjs", "is_package": is_package},
        request = store.put(data)
    request.onsuccess = function(evt){return stored(evt, module)}
}

function idb_get(module, callback){
    // Sends a request to the indexedDB database for the module name.
    // If there is a Python module of this name, there may be 2 records,
    // one with the Python source and one with the compiled Javascript,
    // this is why the method is "getAll()".
    //document.write("idb_get "+module+" "+idb_cx.result+"<br>")
    var db = idb_cx.result,
        tx = db.transaction("modules", "readonly")
    //document.write("transaction "+tx+"<br>")
    //console.log('transaction', tx)
    try{
        var store = tx.objectStore("modules")
            req = store.getAll(module)
        //document.write("ok"+"<br>")
        req.onsuccess = function(evt){idb_load(evt, module)}
    }catch(err){
        console.log('error', err)
        //document.write(err)
    }
}

function idb_search(module, callback){
    //if(module=="datetime"){document.write("idb search "+module+"<br>")}
    tasks.splice(0, 0, [idb_get, module])
    loop()
}

function create_db(evt){
    // The database did not previously exist, create object store.
    var db = idb_cx.result,
        store = db.createObjectStore("modules", {"keyPath": "name"})
    store.onsuccess = function(){
        loop()
    }
    store.onerror = function(){
        //document.write('erreur !')
        console.log('erreur')
    }
}

function idb_open(obj, callback){
    console.log('idb open')
    idb_cx = indexedDB.open("brython_stdlib")
    idb_cx.onsuccess = function(){
        console.log('success')
        var db = idb_cx.result
        if(!db.objectStoreNames.contains("modules")){
            var version = db.version
            db.close()
            console.log('create object store', version)
            idb_cx = indexedDB.open("brython_stdlib", version+1)
            idb_cx.onupgradeneeded = function(){
                console.log("upgrade needed")
                var db = idb_cx.result,
                    store = db.createObjectStore("modules", {"keyPath": "name"})
                store.onsuccess = loop
            }
            idb_cx.onversionchanged = function(){
                console.log("version changed")
            }
            idb_cx.onsuccess = function(){
                console.log("db opened", idb_cx)
                var db = idb_cx.result,
                    store = db.createObjectStore("modules", {"keyPath": "name"})
                store.onsuccess = function(){
                    loop()
                }
            }
        }else{
            console.log("object store exists")
            loop()
        }
    }
    idb_cx.onupgradeneeded = function(){
        console.log("upgrade needed")
        var db = idb_cx.result,
            store = db.createObjectStore("modules", {"keyPath": "name"})
        store.onsuccess = function(){
            loop()
        }
    }
    idb_cx.onerror = function(){
        console.log('erreur open')
    }
}

var tasks = [],
    scripts = document.querySelectorAll('[type="text/pythonXXX"]')

// Build the list of tasks to run.
// A task is a list of items:
// - item[0] is a function, or the string "execute"
// - if it is a function, it is executed with the arguments in item[1] and
//   optionally item[2]. The function may add a new task at the beginning of
//   the tasks list.
// - if it is the string "execute", item[1] is the Javascript code to execute

// Start with the task that opens the database, or create it if it doesn't
// exists.
tasks.push([idb_open, null, function(){console.log("upgrade needed")}])

for(var i=0; i<scripts.length; i++){
    var src = scripts[i].textContent,
        root = __BRYTHON__.py2js(src, "__main__" + i, "__main__" + i, "__builtins__"),
        js = root.to_js(),
        imports = Object.keys(root.imports)

    for(var j=0; j<imports.length;j++){
       tasks.push([inImported, imports[j]])
    }
    tasks.push(["execute", js])
}

// Function loop() takes the first task in the tasks list and processes it.
// The function executed in loop() may itself call loop().
function loop(){
    if(tasks.length==0){
        // No more tasks to process.
        idb_cx.result.close()
        return
    }
    var task = tasks.shift()
    var func = task[0],
        arg = task[1]
    if(func == "execute"){
        try{
            eval(arg)
        }catch(err){
            if($B.debug>1){
                console.log(err)
                for(var attr in err){
                   console.log(attr+' : ', err[attr])
                }
            }

            // If the error was not caught by the Python runtime, build an
            // instance of a Python exception
            if(err.$py_error===undefined){
                console.log('Javascript error', err)
                //console.log(js)
                //for(var attr in $err){console.log(attr+': '+$err[attr])}
                err=_b_.RuntimeError(err+'')
            }

            // Print the error traceback on the standard error stream
            var name = err.__name__,
                trace = _b_.getattr(err,'info')
            if(name=='SyntaxError' || name=='IndentationError'){
                var offset = err.args[3]
                trace += '\n    ' + ' '.repeat(offset) + '^' +
                    '\n' + name+': '+err.args[0]

            }else{
                trace += '\n'+name+': ' + err.args
            }
            try{
                _b_.getattr($B.stderr,'write')(trace)
            }catch(print_exc_err){
                console.log(trace)
            }
            // Throw the error to stop execution
            throw err

        }
        loop()
    }else{
        func(arg)
    }
}

loop()
}

run(__BRYTHON__)
