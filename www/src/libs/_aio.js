// Replacement for asyncio.
//
// CPython asyncio can't be implemented for Brython because it relies on
// blocking function (eg run(), run_until_complete()), and such functions
// can't be defined in Javascript. It also manages an event loop, and a
// browser only has its own built-in event loop.
//
// This module exposes functions whose result can be "await"-ed inside
// asynchrounous functions defined by "async def".

var $module = (function($B){

var _b_ = $B.builtins

var responseType = {
    "text": "text",
    "binary": "arraybuffer",
    "dataURL": "arraybuffer"
}

function handle_kwargs(kw, method){
    var data,
        cache = "no-cache",
        format = "text",
        headers = {},
        timeout = {}
    for(var key in kw.$string_dict){
        if(key == "data"){
            var params = kw.$string_dict[key]
            if(typeof params == "string"){
                data = params
            }else{
                if(params.__class__ !== _b_.dict){
                    throw _b_.TypeError.$factory("wrong type for data, " +
                        "expected dict or str, got " + $B.class_name(params))
                }
                params = params.$string_dict
                var items = []
                for(var key in params){
                    items.push(encodeURIComponent(key) + "=" +
                               encodeURIComponent(params[key]))
                }
                data = items.join("&")
            }
        }else if(key == "headers"){
            headers = kw.$string_dict[key].$string_dict
        }else if(key.startsWith("on")){
            var event = key.substr(2)
            if(event == "timeout"){
                timeout.func = kw.$string_dict[key]
            }else{
                ajax.bind(self, event, kw.$string_dict[key])
            }
        }else if(key == "timeout"){
            timeout.seconds = kw.$string_dict[key]
        }else if(key == "cache"){
            cache = kw.$string_dict[key]
        }else if(key == "format"){
            format = kw.$string_dict[key]
        }
    }
    if(method == "post"){
        // For POST requests, set default header
        if(! headers.hasOwnProperty("Content-type")){
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        }
        if(data && !headers.hasOwnProperty("Content-Length")){
            headers["Content-Length"] = data.length
        }
    }
    return {
        body: data,
        cache: cache,
        format: format,
        timeout: timeout,
        headers: headers
    }
}

function ajax(){
    var $ = $B.args("ajax", 2, {method: null, url: null},
            ["method", "url"], arguments, {},
            null, "kw"),
        method = $.method,
        url = $.url,
        kw = $.kw
    var args = handle_kwargs(kw, "get")
    if(! args.cache){
        url = "?ts" + (new Date()).getTime() + "=0"
    }
    if(args.body){
        url = url + (args.cache ? "?" : "&") + args.body
    }
    return {
        __class__: $B.coroutine,
        $args: [url, args],
        $func: function(){
            return new Promise(function(resolve, reject){
                var xhr = new XMLHttpRequest()
                xhr.open(method, url, true)
                for(key in args.headers){
                    xhr.setRequestHeader(key, args.headers[key])
                }
                xhr.format = args.format
                xhr.responseType = responseType[args.format]
                xhr.onreadystatechange = function(){
                    if(this.readyState == 4){
                        this.__class__ = HTTPRequest
                        resolve(this)
                    }
                }
                xhr.send()
            })
        }
    }
}

function event(){
    // event(element, name) is a Promise on the event "name" happening on the
    // element. This promise always resolves (never rejects) with the DOM event.
    var $ = $B.args("event", 2, {element: null, name: null},
            ["element", "name"], arguments, {}, null, null),
        element = $.element,
        name = $.name
    return new Promise(function(resolve){
        element.elt.addEventListener(name, function(evt){
            resolve($B.$DOMEvent(evt))
        })
    })
}

var HTTPRequest = $B.make_class("Request")

HTTPRequest.data = _b_.property.$factory(function(self){
    if(self.format == "binary"){
        var view = new Uint8Array(self.response)
        return _b_.bytes.$factory(Array.from(view))
    }else if(self.format == "text"){
        return self.responseText
    }else if(self.format == "dataURL"){
        var base64String = btoa(String.fromCharCode.apply(null,
            new Uint8Array(self.response)))
        return "data:" + self.getResponseHeader("Content-Type") +
            ";base64," + base64String
    }
})

HTTPRequest.response_headers = _b_.property.$factory(function(self){
    var headers = self.getAllResponseHeaders()
    if(headers === null){return _b_.None}
    var res = _b_.dict.$factory()
    if(headers.length > 0){
        // Convert the header string into an array
        // of individual headers
        var lines = headers.trim().split(/[\r\n]+/)
        // Create a map of header names to values
        lines.forEach(function(line){
          var parts = line.split(': ')
          var header = parts.shift()
          var value = parts.join(': ')
          res.$string_dict[header] = value
        })
    }
    return res
})

function get(){
    var args = ["GET"]
    for(var i = 0, len = arguments.length; i < len; i++){
        args.push(arguments[i])
    }
    return ajax.apply(null, args)
}

function iscoroutine(f){
    return f.__class__ === $B.coroutine
}

function iscoroutinefunction(f){
    return (f.$infos.__code__.co_flags & 128) != 0
}

function post(){
    var args = ["POST"]
    for(var i = 0, len = arguments.length; i < len; i++){
        args.push(arguments[i])
    }
    return ajax.apply(null, args)
}

function run(coro){
    var handle_success = function(){
            $B.leave_frame()
        },
        handle_error = function(ev){
            var err_msg = "Traceback (most recent call last):\n"
            err_msg += $B.print_stack(ev.$stack)
            err_msg += "\n" + ev.__class__.$infos.__name__ +
                ': ' + ev.args[0]
            $B.builtins.print(err_msg)
            throw ev
        }

    var $ = $B.args("run", 3, {coro: null, onsuccess: null, onerror: null},
            ["coro", "onsuccess", "onerror"], arguments,
            {onsuccess: handle_success, onerror: handle_error},
            null, null),
        coro = $.coro,
        onsuccess = $.onsuccess,
        onerror = $.onerror

    if(onerror !== handle_error){
        function error_func(exc){
            try{
                onerror(exc)
            }catch(err){
                handle_error(err)
            }
        }
    }else{
        error_func = handle_error
    }
    $B.coroutine.send(coro).then(onsuccess).catch(error_func)
    return _b_.None
}

function sleep(seconds){
    return {
        __class__: $B.coroutine,
        $args: [seconds],
        $func: function(){
            return new Promise(resolve => setTimeout(resolve, 1000 * seconds))
        }
    }
}

var brython_scripts = ['brython', 'brython_stdlib']

var wclass = $B.make_class("Worker",
    function(worker){
        return {
            __class__: wclass,
            js: worker
        }
    }
)

wclass.__getattribute__ = $B.JSObject.__getattribute__
wclass.bind = $B.JSObject.bind
wclass.send = function(self){
    var f = $B.JSObject.__getattribute__(self, "postMessage")
    f.js.apply(null, Array.prototype.slice.call(arguments, 1))
}

$B.set_func_names(wclass, "browser.aio")

var _Worker = $B.make_class("Worker", function(url, onmessage, onerror){
    var $ = $B.args("__init__", 3, {url: null, onmessage: null, onerror: null},
            ['url', 'onmessage', 'onerror'], arguments,
            {onmessage: _b_.None, onerror: _b_.None}, null, null),
        url = $.url
    return new Promise(function(resolve, reject){
        fetch(url, {cache: 'no-cache'}).then(function(resp){
            var save_path = $B.brython_path
            if(resp.status != 200){
                reject(_b_.FileNotFoundError.$factory(url))
                return
            }
            resp.text().then(function(src){
                var script_id = "worker" + $B.UUID()
                try{
                    var js = __BRYTHON__.imported.javascript.py2js(src, script_id)
                }catch(err){
                    return reject(err)
                }
                var header = 'var $locals_' + script_id +' = {}\n';
                brython_scripts.forEach(function(script){
                    var url = $B.brython_path + script + ".js?" +
                        (new Date()).getTime()
                    header += 'importScripts("' + url + '")\n'
                })
                // restore brython_path
                header += '__BRYTHON__.brython_path = "' + $B.brython_path +
                    '"\n'
                header += 'brython(1)\n'; // to initialize internal Brython values
                js = header + js
                var blob = new Blob([js], {type: "application/js"}),
                    url = URL.createObjectURL(blob),
                    w = new Worker(url),
                    res = wclass.$factory(w)
                resolve(res)
            }).catch(function(err){
                reject(err)
            })
        })
    })
})

return {
    ajax: ajax,
    event: event,
    get: get,
    iscoroutine: iscoroutine,
    iscoroutinefunction: iscoroutinefunction,
    post: post,
    run: run,
    sleep: sleep,
    Worker: _Worker
}

})(__BRYTHON__)
