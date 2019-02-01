// ajax
var $module = (function($B){

eval($B.InjectBuiltins())
var $N = $B.builtins.None,
    _b_ = $B.builtins

var add_to_res = function(res, key, val) {
    if(isinstance(val, list)){
        for (j = 0; j < val.length; j++) {
            add_to_res(res, key, val[j])
        }
    }else if (val instanceof File || val instanceof Blob){
        res.append(key, val)
    }else{res.append(key,str.$factory(val))}
}

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
        }else if(key=="headers"){
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
    if(method == "post" && ! headers){
        // For POST requests, set default header
        headers = {"Content-type": "application/x-www-form-urlencoded"}
    }
    return {data: data,
            timeout: timeout,
            headers: headers}
}

function get(){
    var $ = $B.args("get", 2, {url: null, async: null},
            ["url", "async"], arguments, {async: true},
            null, "kw"),
        url = $.url,
        async = $.async,
        kw = $.kw
    var args = handle_kwargs(kw, "get")
    if(kw.data){
        url += "?" + kw.data
    }
    var init = {
        method: "GET",
        headers: args.headers
        }
    if(args.data){url = url + "?" + args.data}
    var promise = {
        __class__: $B.coroutine,
        $args: [url, init],
        $func: function(){
            return fetch.apply(null, arguments)
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
        data: args.data
        }
    return fetch(url, init)
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
    console.log("run", coro)
    return $B.coroutine.send(coro).then(onsuccess).catch(onerror)
}

return {get: get, post: post, run: run, sleep: sleep}

})(__BRYTHON__)
