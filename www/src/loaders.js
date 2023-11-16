// Script with function to load scripts and modules, including indexedDB cache
"use strict";
(function($B){

var _b_ = $B.builtins

if($B.VFS_timestamp && $B.VFS_timestamp > $B.timestamp){
    // A VFS created by python -m brython --modules has its own
    // timestamp. If it is after the one in brython.js, use it
    $B.timestamp = $B.VFS_timestamp
}

function idb_load(evt, module){
    // Callback function of a request to the indexedDB database with a module
    // name as key.
    // If the module is precompiled and its timestamp is the same as in
    // brython_stdlib, use the precompiled Javascript.
    // Otherwise, get the source code from brython_stdlib.js.
    var res = evt.target.result

    var timestamp = $B.timestamp,
        debug = $B.get_page_option('debug')

    if(res === undefined || res.timestamp != $B.timestamp ||
            ($B.VFS[module] && res.source_ts !== $B.VFS[module].timestamp)){
        // Not found or not with the same date as in brython_stdlib.js:
        // search in VFS
        if($B.VFS[module] !== undefined){
            var elts = $B.VFS[module],
                ext = elts[0],
                source = elts[1]
            if(ext == ".py"){
                var imports = elts[2],
                    is_package = elts.length == 4,
                    source_ts = elts.timestamp,
                    __package__

                // Temporarily set $B.imported[module] for relative imports
                if(is_package){__package__ = module}
                else{
                    var parts = module.split(".")
                    parts.pop()
                    __package__ = parts.join(".")
                }
                $B.imported[module] = $B.module.$factory(module, "",
                    __package__)
                $B.url2name[module] = module
                try{
                    var root = $B.py2js(
                            {src:source, filename: module}, module, module),
                        js = root.to_js()
                }catch(err){
                    $B.handle_error(err)
                }
                // Delete temporary import
                delete $B.imported[module]
                if(debug > 1){
                    console.log("precompile", module)
                }
            }else{
                console.log('bizarre', module, ext)
            }
        }else{
            // Module not found : do nothing
        }
    }else{
        // Precompiled Javascript found in indexedDB database.
        if(res.is_package){
            $B.precompiled[module] = [res.content]
        }else{
            $B.precompiled[module] = res.content
        }
        if(res.imports.length > 0){
            // res.imports is a string with the modules imported by the current
            // modules, separated by commas
            if(debug > 1){
                console.log(module, "imports", res.imports)
            }
            var subimports = res.imports.split(",")
            for(var i = 0; i < subimports.length; i++){
                var subimport = subimports[i]
                if(subimport.startsWith(".")){
                    // Relative imports
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
                if(!$B.imported.hasOwnProperty(subimport) &&
                        !$B.precompiled.hasOwnProperty(subimport)){
                    // If the code of the required module is not already
                    // loaded, add a task for this.
                    if($B.VFS.hasOwnProperty(subimport)){
                        var submodule = $B.VFS[subimport],
                            ext = submodule[0],
                            source = submodule[1]
                        if(submodule[0] == ".py"){
                            $B.tasks.splice(0, 0, [idb_get, subimport])
                        }else{
                            add_jsmodule(subimport, source)
                        }
                    }
                }
            }
        }
    }
    loop()
}

function store_precompiled(module, js, source_ts, imports, is_package){
    // Sends a request to store the compiled Javascript for a module.
    var db = $B.idb_cx.result,
        tx = db.transaction("modules", "readwrite"),
        store = tx.objectStore("modules"),
        cursor = store.openCursor(),
        data = {"name": module,
            "content": js,
            "imports": imports,
            "timestamp": __BRYTHON__.timestamp,
            "source_ts": source_ts,
            "is_package": is_package
            },
        request = store.put(data)
    if($B.get_page_option('debug') > 1){
        console.log("store precompiled", module, "package", is_package)
    }
    document.dispatchEvent(new CustomEvent('precompile',
        {detail: 'cache module '  + module}))
    var ix = $B.outdated.indexOf(module)
    if(ix > -1){
        $B.outdated.splice(ix, 1)
    }
    request.onsuccess = function(evt){
        // Restart the task "idb_get", knowing that this time it will use
        // the compiled version.
        $B.tasks.splice(0, 0, [idb_get, module])
        loop()
    }
}


function idb_get(module){
    // Sends a request to the indexedDB database for the module name.
    var db = $B.idb_cx.result,
        tx = db.transaction("modules", "readonly")
    try{
        var store = tx.objectStore("modules"),
            req = store.get(module)
        req.onsuccess = function(evt){
            idb_load(evt, module)
        }
    }catch(err){
        console.info('error', err)
    }
}

$B.idb_open_promise = function(){
    return new Promise(function(resolve, reject){
        $B.idb_name = "brython-cache"
        var idb_cx = $B.idb_cx = indexedDB.open($B.idb_name)

        idb_cx.onsuccess = function(){
            var db = idb_cx.result
            if(!db.objectStoreNames.contains("modules")){
                var version = db.version
                db.close()
                idb_cx = indexedDB.open($B.idb_name, version + 1)
                idb_cx.onupgradeneeded = function(){
                    var db = $B.idb_cx.result,
                        store = db.createObjectStore("modules", {"keyPath": "name"})
                    store.onsuccess = resolve
                }
                idb_cx.onsuccess = function(){
                    var db = idb_cx.result,
                        store = db.createObjectStore("modules", {"keyPath": "name"})
                    store.onsuccess = resolve
                }
            }else{
                // Preload all compiled modules

                var tx = db.transaction("modules", "readwrite"),
                    store = tx.objectStore("modules"),
                    record,
                    outdated = []

                var openCursor = store.openCursor()

                openCursor.onerror = function(evt){
                    reject("open cursor error")
                }

                openCursor.onsuccess = function(evt){
                    var cursor = evt.target.result
                    if(cursor){
                        record = cursor.value
                        // A record is valid if the Brython engine timestamp is
                        // the same as record.timestamp, and the timestamp of the
                        // VFS file where the file stands is the same as
                        // record.source_ts
                        if(record.timestamp == $B.timestamp){
                            if(!$B.VFS || !$B.VFS[record.name] ||
                                    $B.VFS[record.name].timestamp == record.source_ts){
                                // Load in __BRYTHON__.precompiled
                                if(record.is_package){
                                    $B.precompiled[record.name] = [record.content]
                                }else{
                                    $B.precompiled[record.name] = record.content
                                }
                            }else{
                                // If module with name record.name exists in a VFS
                                // and its timestamp is not the VFS timestamp,
                                // remove from cache
                                outdated.push(record.name)
                            }
                        }else{
                            outdated.push(record.name)
                        }
                        cursor.continue()
                    }else{
                        $B.outdated = outdated
                        resolve()
                    }
                }
            }
        }
        idb_cx.onupgradeneeded = function(){
            var db = idb_cx.result,
                store = db.createObjectStore("modules", {"keyPath": "name"})
            store.onsuccess = resolve
        }
        idb_cx.onerror = function(){
            // Proceed without indexedDB
            $B.idb_cx = null
            $B.idb_name = null
            $B.$options.indexedDB = false
            reject('could not open indexedDB database')
        }
    })
}


$B.idb_open = function(obj){
    $B.idb_name = "brython-cache"
    var idb_cx = $B.idb_cx = indexedDB.open($B.idb_name)

    idb_cx.onsuccess = function(){
        var db = idb_cx.result
        if(! db.objectStoreNames.contains("modules")){
            var version = db.version
            db.close()
            console.info('create object store', version)
            idb_cx = indexedDB.open($B.idb_name, version + 1)
            idb_cx.onupgradeneeded = function(){
                console.info("upgrade needed")
                var db = $B.idb_cx.result,
                    store = db.createObjectStore("modules", {"keyPath": "name"})
                store.onsuccess = loop
            }
            idb_cx.onversionchanged = function(){
                console.log("version changed")
            }
            idb_cx.onsuccess = function(){
                console.info("db opened", idb_cx)
                var db = idb_cx.result,
                    store = db.createObjectStore("modules", {"keyPath": "name"})
                store.onsuccess = loop
            }
        }else{
            if($B.get_page_option('debug') > 1){
                console.info("using indexedDB for stdlib modules cache")
            }
            // Preload all compiled modules

            var tx = db.transaction("modules", "readwrite"),
                store = tx.objectStore("modules"),
                record,
                outdated = []

            var openCursor = store.openCursor()

            openCursor.onerror = function(evt){
                console.log("open cursor error", evt)
            }

            openCursor.onsuccess = function(evt){
                var cursor = evt.target.result
                if(cursor){
                    record = cursor.value
                    // A record is valid if the Brython engine timestamp is
                    // the same as record.timestamp, and the timestamp of the
                    // VFS file where the file stands is the same as
                    // record.source_ts
                    if(record.timestamp == $B.timestamp){
                        if(!$B.VFS || !$B.VFS[record.name] ||
                                $B.VFS[record.name].timestamp == record.source_ts){
                            // Load in __BRYTHON__.precompiled
                            if(record.is_package){
                                $B.precompiled[record.name] = [record.content]
                            }else{
                                $B.precompiled[record.name] = record.content
                            }
                            if($B.get_page_option('debug') > 1){
                                console.info("load from cache", record.name)
                            }
                        }else{
                            // If module with name record.name exists in a VFS
                            // and its timestamp is not the VFS timestamp,
                            // remove from cache
                            outdated.push(record.name)
                        }
                    }else{
                        outdated.push(record.name)
                    }
                    cursor.continue()
                }else{
                    if($B.get_page_option('debug') > 1){
                        console.log("done")
                    }
                    $B.outdated = outdated
                    loop()
                }
            }
        }
    }
    idb_cx.onupgradeneeded = function(){
        console.info("upgrade needed")
        var db = idb_cx.result,
            store = db.createObjectStore("modules", {"keyPath": "name"})
        store.onsuccess = loop
    }
    idb_cx.onerror = function(){
        console.info('could not open indexedDB database')
        // Proceed without indexedDB
        $B.idb_cx = null
        $B.idb_name = null
        $B.$options.indexedDB = false
        loop()
    }
}

$B.ajax_load_script = function(s){
    var script = s.script,
        url = s.url,
        name = s.name,
        rel_path = url.substr($B.script_dir.length + 1)

    if($B.files && $B.files.hasOwnProperty(rel_path)){
        // File is present in Virtual File System
        var src = atob($B.files[rel_path].content)
        $B.tasks.splice(0, 0, [$B.run_script,
            script, src, name, url, true])
        loop()
    }else if($B.protocol != "file"){
        $B.script_filename = url
        $B.scripts[url] = script
        var req = new XMLHttpRequest(),
            cache = $B.get_option('cache'),
            qs = cache ? '' :
                    (url.search(/\?/) > -1 ? '&' : '?') + Date.now()
        req.open("GET", url + qs, true)
        req.onreadystatechange = function(){
            if(this.readyState == 4){
                if(this.status == 200){
                    var src = this.responseText
                    if(s.is_ww){
                        $B.webworkers[name] = script
                        $B.file_cache[url] = src
                        // dispatch 'load' event (cf. issue 2215)
                        $B.dispatch_load_event(script)
                    }else{
                        $B.tasks.splice(0, 0, [$B.run_script, script, src, name,
                            url, true])
                    }
                    loop()
                }else if(this.status == 404){
                    throw Error(url + " not found")
                }
            }
        }
        req.send()
    }else{
        throw _b_.IOError.$factory("can't load external script at " +
            script.url + " (Ajax calls not supported with protocol file:///)")
    }
}

function add_jsmodule(module, source){
    // Use built-in Javascript module
    source += "\nvar $locals_" +
        module.replace(/\./g, "_") + " = $module"
    $B.precompiled[module] = source
}

var inImported = $B.inImported = function(module){
    if($B.imported.hasOwnProperty(module)){
        // already imported, do nothing
    }else if(__BRYTHON__.VFS && __BRYTHON__.VFS.hasOwnProperty(module)){
        var elts = __BRYTHON__.VFS[module]
        if(elts === undefined){console.log('bizarre', module)}
        var ext = elts[0],
            source = elts[1],
            is_package = elts.length == 4
        if(ext==".py"){
            if($B.idb_cx && !$B.idb_cx.$closed){
                $B.tasks.splice(0, 0, [idb_get, module])
            }
        }else{
            add_jsmodule(module, source)
        }
    }else{
        console.log("bizarre", module)
    }
    loop()
}

function report_precompile(mod){
    if(!$B.isWebWorker){
        document.dispatchEvent(new CustomEvent('precompile',
            {detail: 'remove outdated ' + mod +
             ' from cache'}))
    }
}

function report_close(){
    if(!$B.isWebWorker){
        document.dispatchEvent(new CustomEvent('precompile',
            {detail: "close"}))
    }
}

function report_done(mod){
    if(!$B.isWebWorker){
        document.dispatchEvent(new CustomEvent("brython_done",
            {detail: $B.obj_dict($B.$options)}))
    }
}

var loop = $B.loop = function(){
    if($B.tasks.length == 0){
        // No more task to process.
        if($B.idb_cx && ! $B.idb_cx.$closed){
            var db = $B.idb_cx.result,
                tx = db.transaction("modules", "readwrite"),
                store = tx.objectStore("modules")
            while($B.outdated.length > 0){
                var module = $B.outdated.pop(),
                    req = store.delete(module)
                req.onsuccess = (function(mod){
                    return function(event){
                        if($B.get_page_option('debug') > 1){
                            console.info("delete outdated", mod)
                        }
                        report_precompile(mod)
                    }
                })(module)
            }
            report_close()
            $B.idb_cx.result.close()
            $B.idb_cx.$closed = true
        }
        // dispatch event "brython_done"
        report_done()
        return
    }
    var task = $B.tasks.shift(),
        func = task[0],
        args = task.slice(1)

    if(func == "execute"){
        try{
            var script = task[1],
                script_id = script.__name__.replace(/\./g, "_"),
                module = $B.module.$factory(script.__name__)
            module.__file__ = script.__file__
            module.__doc__ = script.__doc__
            $B.imported[script_id] = module
            var module = new Function(script.js + `\nreturn locals`)()
            for(var key in module){
                if(! key.startsWith('$')){
                    $B.imported[script_id][key] = module[key]
                }
            }
            // dispatch "load" event on the <script> element
            $B.dispatch_load_event(script.script_element)
        }catch(err){
            // If the error was not caught by the Python runtime, build an
            // instance of a Python exception
            if(err.__class__ === undefined){
                if(err.$py_exc){
                    err = err.$py_exc
                }else{
                    $B.freeze(err)
                    var stack = err.$stack,
                        frame_obj = err.$frame_obj,
                        linenums = err.$linenums
                    var lineNumber = err.lineNumber
                    if(lineNumber !== undefined){
                        console.log('around line', lineNumber)
                        console.log(script.js.split('\n').
                            slice(lineNumber - 4, lineNumber).join('\n'))
                        // console.log('script\n', script.js)
                    }
                    $B.print_stack()
                    err = _b_.RuntimeError.$factory(err + '')
                    err.$stack = stack
                    err.$frame_obj = frame_obj
                    err.$linenums = linenums
                }
            }
            $B.handle_error(err)
        }
        loop()
    }else{
        // Run function with arguments
        try{
            func.apply(null, args)
        }catch(err){
            $B.handle_error(err)
        }
    }
}

$B.tasks = []
$B.has_indexedDB = self.indexedDB !== undefined

function required_stdlib_imports(imports, start){
    // Returns the list of modules from the standard library needed by
    // the modules in "imports"
    var nb_added = 0
    start = start || 0
    for(var i = start; i < imports.length; i++){
        var module = imports[i]
        if($B.imported.hasOwnProperty(module)){continue}
        var mod_obj = $B.VFS[module]
        if(mod_obj === undefined){console.log("undef", module)}
        if(mod_obj[0] == ".py"){
            var subimports = mod_obj[2] // list of modules needed by this mod
            subimports.forEach(function(subimport){
                if(!$B.imported.hasOwnProperty(subimport) &&
                        imports.indexOf(subimport) == -1){
                    if($B.VFS.hasOwnProperty(subimport)){
                        imports.push(subimport)
                        nb_added++
                    }
                }
            })
        }
    }
    if(nb_added){
        required_stdlib_imports(imports, imports.length - nb_added)
    }
    return imports
}

})(__BRYTHON__)

