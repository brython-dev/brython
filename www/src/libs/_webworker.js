// Web Worker implementation

var $module = (function($B){

var _b_ = $B.builtins

var VFS = $B.brython_modules ? 'brython_modules' : 'brython_stdlib'

if($B.debug > 2){
    var brython_scripts = [
        'brython_builtins',

        'py_ast_classes',
        'unicode_data',
        'stdlib_paths',
        'version_info',

        'python_tokenizer',
        'py_ast',
        'py2js',
        'loaders',
        'py_utils',
        'py_object',
        'py_type',
        'py_builtin_functions',
        'py_sort',
        'py_exceptions',
        'py_range_slice',
        'py_bytes',
        'py_set',
        'js_objects',
        'py_import',
        'py_string',
        'py_int',
        'py_long_int',
        'py_float',
        'py_complex',
        'py_dict',
        'py_list',
        'py_generator',
        'py_dom',
        'py_pattern_matching',
        'async',
        'py_flags',
        'builtin_modules',
        'ast_to_js',
        'symtable',
        'builtins_docstrings',
        VFS]

}else{
    var brython_scripts = ['brython', VFS]
}

var wclass = $B.make_class("Worker",
    function(worker){
        var res = worker
        res.send = function(){
            var args = []
            for(var arg of arguments){
                args.push($B.pyobj2structuredclone(arg))
            }
            return res.postMessage.apply(this, args)
        }
        return res
    }
)

wclass.__mro__ = [$B.JSObj, _b_.object]

$B.set_func_names(wclass, "browser.worker")


var _Worker = $B.make_class("Worker", function(id, onmessage, onerror){
    var $ = $B.args("__init__", 3, {id: null, onmessage: null, onerror: null},
            ['id', 'onmessage', 'onerror'], arguments,
            {onmessage: _b_.None, onerror: _b_.None}, null, null),
        id = $.id,
        worker_script = $B.webworkers[id]

    if(worker_script === undefined){
        throw _b_.KeyError.$factory(id)
    }
    var src = worker_script.source
    var indexedDB = worker_script.attributes &&
            worker_script.attributes.hasNamedItem('indexedDB')
    var script_id = "worker" + $B.UUID(),
        filename = $B.script_path + "#" + id
    $B.url2name[filename] = script_id


    var js = $B.py2js({src, filename}, script_id).to_js(),
        header = '';
    brython_scripts.forEach(function(script){
        if(script != VFS || VFS == "brython_stdlib"){
            var url = $B.brython_path + script + ".js"
        }else{
            // attribute $B.brython_modules is set to the path of
            // brython_modules.js by the script itself
            var url = $B.brython_modules
        }
        if(! $B.$options.cache){ // cf. issue 1954
            url += '?' + (new Date()).getTime()
        }
        header += 'importScripts("' + url + '")\n'
    })
    // set __BRYTHON__.imported[script_id]
    header += `
    var $B = __BRYTHON__,
        _b_ = $B.builtins
    var module = $B.module.$factory("${script_id}")
    module.__file__ = "${filename}"
    module.__doc__ = _b_.None
    $B.imported["${script_id}"] = module\n`
    // restore brython_path
    header += '__BRYTHON__.brython_path = "' + $B.brython_path +
        '"\n'
    // restore path for imports (cf. issue #1305)
    header += '__BRYTHON__.path = "' + $B.path +'".split(",")\n'
    // Call brython() to initialize internal Brython values
    header += `brython(${JSON.stringify($B.$options)})\n`
    js = header + js
    js = `try{${js}}catch(err){$B.handle_error(err)}`
    var blob = new Blob([js], {type: "application/js"}),
        url = URL.createObjectURL(blob),
        w = new Worker(url),
        res = wclass.$factory(w)
    return res
})

function create_worker(){
    var $ = $B.args("__init__", 4,
                    {id: null, onready: null, onmessage: null, onerror: null},
                    ['id', 'onready', 'onmessage', 'onerror'], arguments,
                    {onready: _b_.None, onmessage: _b_.None, onerror: _b_.None},
                    null, null),
        id = $.id,
        worker_script = $B.webworkers[id],
        onready = $.onready === _b_.None ? _b_.None : $B.$call($.onready),
        onmessage = $.onmessage === _b_.None ? _b_.None : $B.$call($.onmessage),
        onerror = $.onerror === _b_.None ? _b_.None : $B.$call($.onerror)

    if(worker_script === undefined){
        throw _b_.RuntimeError.$factory(`No webworker with id '${id}'`)
    }
    var src = worker_script.source
    var script_id = "worker" + $B.UUID(),
        filename = $B.script_path + "#" + id
    $B.url2name[filename] = script_id
    $B.file_cache[filename] = src

    var js = $B.py2js({src, filename}, script_id).to_js(),
        header = '';
    for(var script of brython_scripts){
        if(script != VFS || VFS == "brython_stdlib"){
            var url = $B.brython_path + script + ".js"
        }else{
            // attribute $B.brython_modules is set to the path of
            // brython_modules.js by the script itself
            var url = $B.brython_modules
        }
        if(! $B.$options.cache){ // cf. issue 1954
            url += '?' + (new Date()).getTime()
        }
        header += 'importScripts("' + url + '")\n'
    }
    // set __BRYTHON__.imported[script_id]
    header += `
    var $B = __BRYTHON__,
        _b_ = $B.builtins
    var module = $B.module.$factory("${script_id}")
    module.__file__ = "${filename}"
    module.__doc__ = _b_.None
    $B.imported["${script_id}"] = module\n`

    header += '$B.file_cache[module.__file__] = `' + src + '`\n'
    // restore brython_path
    header += '__BRYTHON__.brython_path = "' + $B.brython_path +
        '"\n'
    // restore path for imports (cf. issue #1305)
    header += '__BRYTHON__.path = "' + $B.path +'".split(",")\n'
    // Call brython() to initialize internal Brython values
    header += `brython(${JSON.stringify($B.$options)})\n`

    // send dummy message to trigger resolution of Promise
    var ok_token = Math.random().toString(36).substr(2, 8),
        error_token = Math.random().toString(36).substr(2, 8)

    // open indexedDB cache before running worker code
    js = `$B.idb_open_promise().then(function(){\n` +
         `try{\n` +
             `${js}\n` +
             `self.postMessage('${ok_token}')\n` +
         `}catch(err){\n` +
             `self.postMessage("${error_token}Error in worker ${id}\\n" + $B.error_trace(err))\n` +
         `}\n})`
    js = header + js

    var p = new Promise(function(resolve, reject){
        try{
            var blob = new Blob([js], {type: "application/js"}),
                url = URL.createObjectURL(blob),
                w = new Worker(url),
                res = wclass.$factory(w)
        }catch(err){
            reject(err)
        }

        w.onmessage = function(ev){
            if(ev.data == ok_token){
                resolve(res)
            }else if(typeof ev.data == 'string' &&
                    ev.data.startsWith(error_token)){
                reject(ev.data.substr(error_token.length))
            }else{
                if(onmessage !== _b_.None){
                    onmessage(ev)
                }
                resolve(res)
            }
        }

        return res
    })

    var error_func = onerror === _b_.None ? console.debug : onerror

    if(onready !== _b_.None){
        p.then(onready).catch(error_func)
    }else{
        p.catch(error_func)
    }
    return _b_.None
}

return {
    Worker: _Worker,
    create_worker
}

})(__BRYTHON__)
