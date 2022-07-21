// Web Worker implementation

var $module = (function($B){

var _b_ = $B.builtins

var VFS = $B.brython_modules ? 'brython_modules' : 'brython_stdlib'

if($B.debug > 2){
    var brython_scripts = [
        'brython_builtins',
        'version_info',
        'python_tokenizer',
        'py_ast',
        'py2js',
        'loaders',
        'py_object',
        'py_type',
        'py_utils',
        'py_sort',
        'py_builtin_functions',
        'py_exceptions',
        'py_range_slice',
        'py_bytes',
        'py_set',
        'js_objects',
        'stdlib_paths',
        'py_import',
        'unicode_data',
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
        'builtin_modules',
        'async',
        'ast_to_js',
        'symtable',
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
        src = $B.webworkers[id]

    if(src === undefined){
        throw _b_.KeyError.$factory(id)
    }
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

return {
    Worker: _Worker
}

})(__BRYTHON__)
