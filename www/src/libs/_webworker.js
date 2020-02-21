// Web Worker implementation

var $module = (function($B){

var _b_ = $B.builtins

var brython_scripts = ['brython', 'brython_stdlib']

var wclass = $B.make_class("Worker",
    function(worker){
        return {
            __class__: wclass,
            js: worker
        }
    }
)
wclass.__mro__ = [$B.JSObject, _b_.object]
wclass.send = function(self){
    var $ = $B.args("send", 1, {self: null}, ["self"], arguments, {}, "args",
                null),
            args = $.args
    for(var i = 0, len = args.length; i < len; i++){
        args[i] = $B.pyobj2structuredclone(args[i])
    }
    self.js.postMessage.apply(self.js, args)
}

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
            js = __BRYTHON__.imported.javascript.py2js(src,
                script_id),
            header = 'var $locals_' + script_id +' = {}\n';
        brython_scripts.forEach(function(script){
            var url = $B.brython_path + script + ".js?" +
                (new Date()).getTime()
            header += 'importScripts("' + url + '")\n'
        })
        // restore brython_path
        header += '__BRYTHON__.brython_path = "' + $B.brython_path +
            '"\n'
        // restore path for imports (cf. issue #1305)
        header += '__BRYTHON__.path = "' + $B.path +'".split(",")\n'
        // Call brython() to initialize internal Brython values
        header += 'brython(1)\n'
        js = header + js
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
