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
        cache = false,
        format = "text",
        headers = {},
        timeout = {}
    for(var key in kw.$string_dict){
        if(key == "data"){
            var params = kw.$string_dict[key][0]
            if(typeof params == "string"){
                data = params
            }else if(_b_.isinstance(params, _b_.bytes)){
                data = new ArrayBuffer(params.source.length)
                var array = new Int8Array(data)
                for(var i = 0, len = params.source.length; i < len; i++){
                    array[i] = params.source[i]
                }
            }else{
                if(params.__class__ !== _b_.dict){
                    throw _b_.TypeError.$factory("wrong type for data, " +
                        "expected dict, bytes or str, got " + 
                        $B.class_name(params))
                }
                params = params.$string_dict
                var items = []
                for(var key in params){
                    items.push(encodeURIComponent(key) + "=" +
                               encodeURIComponent(params[key][0]))
                }
                data = items.join("&")
            }
        }else if(key == "headers"){
            headers = _b_.dict.$to_obj(kw.$string_dict[key][0])
        }else if(key.startsWith("on")){
            var event = key.substr(2)
            if(event == "timeout"){
                timeout.func = kw.$string_dict[key][0]
            }else{
                ajax.bind(self, event, kw.$string_dict[key][0])
            }
        }else if(key == "timeout"){
            timeout.seconds = kw.$string_dict[key][0]
        }else if(key == "cache"){
            cache = kw.$string_dict[key][0]
        }else if(key == "format"){
            format = kw.$string_dict[key][0]
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
        method = $.method.toUpperCase(),
        url = $.url,
        kw = $.kw
    var args = handle_kwargs(kw, "get")
    if(method == "GET" && ! args.cache){
        url = url + "?ts" + (new Date()).getTime() + "=0"
    }
    if(args.body && method == "GET"){
        url = url + (args.cache ? "?" : "&") + args.body
    }
    var func = function(){
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
            if(method == "POST" && args.body){
                xhr.send(args.body)
            }else{
                xhr.send()
            }
        })
    }
    func.$infos = {
        __name__: "ajax_" + method
    }
    return {
        __class__: $B.coroutine,
        $args: [url, args],
        $func: func
    }
}

function event(){
    // event(element, *names) is a Promise on the events "names" happening on
    // the element. This promise always resolves (never rejects) with the
    // first triggered DOM event.
    var $ = $B.args("event", 1, {element: null},
            ["element"], arguments, {}, "names", null),
        element = $.element,
        names = $.names
    return new Promise(function(resolve){
        var callbacks = []
        names.forEach(function(name){
            var callback = function(evt){
                // When one of the handled events is triggered, all bindings
                // are removed
                callbacks.forEach(function(items){
                    $B.DOMNode.unbind(element, items[0], items[1])
                })
                resolve($B.$DOMEvent(evt))
            }
            callbacks.push([name, callback])
            $B.DOMNode.bind(element, name, callback)
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
    var res = $B.empty_dict()
    if(headers.length > 0){
        // Convert the header string into an array
        // of individual headers
        var lines = headers.trim().split(/[\r\n]+/)
        // Create a map of header names to values
        lines.forEach(function(line){
          var parts = line.split(': ')
          var header = parts.shift()
          var value = parts.join(': ')
          _b_.dict.$setitem(res, header, value)
        })
    }
    return res
})

function get(){
    return ajax.bind(null, "GET").apply(null, arguments)
}

function iscoroutine(f){
    return f.__class__ === $B.coroutine
}

function iscoroutinefunction(f){
    return (f.$infos.__code__.co_flags & 128) != 0
}

function post(){
    return ajax.bind(null, "POST").apply(null, arguments)
}

function run(coro){
    var handle_success = function(){
            $B.leave_frame()
        },
        handle_error = function(err){
            // coro.$stack is a snapshot of the frames stack when the async
            // function was called. Restore it to get the correct call tree
            console.log("Exception in asynchronous function")
            err.$stack = coro.$stack.concat([$B.last(err.$stack)])
            $B.handle_error(err)
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
    var save_stack = $B.frames_stack.slice()
    $B.coroutine.send(coro).then(onsuccess).catch(error_func)
    $B.frames_stack = save_stack
    return _b_.None
}

function sleep(seconds){
    var func = function(){
        return new Promise(resolve => setTimeout(
            function(){resolve(_b_.None)}, 1000 * seconds))
    }
    func.$infos = {
        __name__: "sleep"
    }
    return {
        __class__: $B.coroutine,
        $args: [seconds],
        $func: func
    }
}

return {
    ajax: ajax,
    event: event,
    get: get,
    iscoroutine: iscoroutine,
    iscoroutinefunction: iscoroutinefunction,
    post: post,
    run: run,
    sleep: sleep
}

})(__BRYTHON__)
