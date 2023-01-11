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
    for(var key of _b_.dict.$keys_string(kw)){
        if(key == "data"){
            var params = _b_.dict.$getitem_string(kw, key)
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
                var items = []
                for(var key of _b_.dict.$keys_string(params)){
                    var value = _b_.dict.$getitem_string(params, key)
                    items.push(encodeURIComponent(key) + "=" +
                               encodeURIComponent($B.pyobj2jsobj(value)))
                }
                data = items.join("&")
            }
        }else if(key == "headers"){
            headers = _b_.dict.$to_obj(_b_.dict.$getitem_string(kw, key))
        }else if(key.startsWith("on")){
            var event = key.substr(2)
            if(event == "timeout"){
                timeout.func = _b_.dict.$getitem_string(kw, key)
            }else{
                ajax.bind(self, event, _b_.dict.getitem_string(kw, key))
            }
        }else if(key == "timeout"){
            timeout.seconds = _b_.dict.$getitem_string(kw, key)
        }else if(key == "cache"){
            cache = _b_.dict.$getitem_string(kw, key)
        }else if(key == "format"){
            format = _b_.dict.$getitem_string(kw, key)
        }
    }
    if(method == "post"){
        // For POST requests, set default header
        if(! headers.hasOwnProperty("Content-type")){
            headers["Content-Type"] = "application/x-www-form-urlencoded"
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
            if(args.body &&
                    ['POST', 'PUT', 'DELETE', 'PATCH'].indexOf(method) > -1){
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
            exc.$stack = coro.$stack.concat([$B.last(exc.$stack)])
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
    if(seconds.__class__ === _b_.float){
        seconds = seconds.value
    }else if(typeof seconds != "number"){
        throw _b_.TypeError.$factory("'sleep' argument must be " +
            "int or float, not " + $B.class_name(seconds))
    }
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

function make_error(name, module){
    var error_obj = {
        $name: name,
        $qualname: module + '.' + name,
        $is_class: true,
        __module__: module
    }
    var error = $B.$class_constructor(name, error_obj,
        _b_.tuple.$factory([_b_.Exception]), ["_b_.Exception"], [])
    error.__doc__ = _b_.None
    error.$factory = $B.$instance_creator(error)
    $B.set_func_names(error, module)
    return error
}


var InvalidStateError = $B.make_class('InvalidStateError')
InvalidStateError.__bases__ = [_b_.Exception, _b_.object]
InvalidStateError.__mro__ = [_b_.Exception, _b_.object]
$B.set_func_names(InvalidStateError, 'browser.aio')

var CancelledError = $B.make_class('CancelledError')
CancelledError.__bases__ = [_b_.Exception, _b_.object]
CancelledError.__mro__ = [_b_.Exception, _b_.object]
$B.set_func_names(CancelledError, 'browser.aio')


var Future = $B.make_class("Future",
    function(){
        var methods = {}
        var promise = new Promise(function(resolve, reject){
            methods.resolve = resolve
            methods.reject = reject
        })
        promise._methods = methods
        promise._done = false
        promise.__class__ = Future
        return promise
    }
)

Future.done = function(){
    var $ = $B.args('done', 1, {self:null},
                    ['self'], arguments, {}, null, null)
    return !! self._done
}

Future.set_result = function(self, value){
    var $ = $B.args('set_result', 2, {self:null, value: null},
                    ['self', 'value'], arguments, {}, null, null)
    self._done = true
    return self._methods.resolve(value)
}

Future.set_exception = function(self, exception){
    var $ = $B.args('set_exception', 2, {self:null, exception: null},
                    ['self', 'exception'], arguments, {}, null, null)
    self._done = true
    return self._methods.reject(exception)
}

$B.set_func_names(Future, 'browser.aio')

return {
    ajax,
    event,
    get,
    iscoroutine,
    iscoroutinefunction,
    post,
    run,
    sleep,
    Future
}

})(__BRYTHON__)
