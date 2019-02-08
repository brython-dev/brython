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

function handle_kwargs(kw, method){
    var data,
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
        timeout: timeout,
        headers: headers
    }
}

function get(){
    var $ = $B.args("get", 2, {url: null, async: null},
            ["url", "async"], arguments, {async: true},
            null, "kw"),
        url = $.url,
        async = $.async,
        kw = $.kw
    var args = handle_kwargs(kw, "get"),
        init = {
            method: "GET",
            headers: args.headers,
            cache: "no-cache"
        }
    if(args.body){
        url = url + "?" + args.body
        console.log("add body", args.body)
    }
    var promise = {
        __class__: $B.coroutine,
        $args: [url, init],
        $func: function(){
            return fetch.apply(null, promise.$args)
        }
    }
    return promise
}

function post(){
    var $ = $B.args("post", 1, {url: null},
            ["url"], arguments, {},
            null, "kw"),
        url = $.url,
        kw = $.kw,
        data
    var args = handle_kwargs(kw, "post")
    var init = {
            method: "POST",
            headers: args.headers,
            body: args.body
        }
    var promise = {
        __class__: $B.coroutine,
        $args: [url, init],
        $func: function(){
            return fetch.apply(null, promise.$args)
        }
    }
    return promise
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

function run(coro){
    var noop = function(){}
    var $ = $B.args("run", 3, {coro: null, onsuccess: null, onerror: null},
            ["coro", "onsuccess", "onerror"], arguments,
            {onsuccess: noop, onerror: noop},
            null, null),
        coro = $.coro,
        onsuccess = $.onsuccess,
        onerror = $.onerror
    return $B.coroutine.send(coro).then(onsuccess).catch(onerror)
}

return {get: get, post: post, run: run, sleep: sleep}

})(__BRYTHON__)
