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

function set_timeout(self, timeout){
    if(timeout.seconds !== undefined){
        self.js.$requestTimer = setTimeout(
            function() {
                self.js.abort()
                if(timeout.func){
                    timeout.func()
                }
            },
            timeout.seconds * 1000)
    }
}

function _read(req){
    var xhr = req.js,
        res
    if(xhr.responseType == "json"){
        return $B.structuredclone2pyobj(xhr.response)
    }else if(xhr.responseType == "" || xhr.responseType == "text"){
        return xhr.responseText
    }
    var abuf = new Uint8Array(xhr.response)
    res = []
    for(var i = 0, len = abuf.length; i < len; i++){
        res.push(abuf[i])
    }
    var b = _b_.bytes.$factory(res)

    if(xhr.mode == "binary"){
        return b
    }else{
        var encoding = xhr.encoding || "utf-8"
        return _b_.bytes.decode(b, encoding)
    }
}

function handle_kwargs(self, kw, method){
    var data,
        encoding,
        headers,
        cache,
        mode = "text",
        timeout = {}
    for(var key in kw.$string_dict){
        if(key == "data"){
            var params = kw.$string_dict[key][0]
            if(typeof params == "string"){
                data = params
            }else if(params.__class__ === _b_.dict){
                params = params.$string_dict
                var items = []
                for(var key in params){
                    items.push(encodeURIComponent(key) + "=" +
                               encodeURIComponent(params[key][0]))
                }
                data = items.join("&")
            }else{
                throw _b_.TypeError.$factory("wrong type for data: " +
                    $B.class_name(params))
            }
        }else if(key == "encoding"){
            encoding = kw.$string_dict[key][0]
            self.js.encoding = encoding
        }else if(key == "headers"){
            var value = kw.$string_dict[key][0]
            if(! _b_.isinstance(value, _b_.dict)){
                throw _b_.ValueError.$factory(
                    "headers must be a dict, not " + $B.class_name(value))
            }
            headers = value.$string_dict
            for(var key in headers){
                self.js.setRequestHeader(key, headers[key][0])
            }
        }else if(key.startsWith("on")){
            var event = key.substr(2)
            if(event == "timeout"){
                timeout.func = kw.$string_dict[key][0]
            }else{
                var f = kw.$string_dict[key][0]
                ajax.bind(self, event, f)
            }
        }else if(key == "mode"){
            var mode = kw.$string_dict[key][0]
            if(mode == "json"){
                self.js.responseType = "json"
            }else{
                self.js.responseType = "arraybuffer"
                if(mode != "text" && mode != "binary"){
                    throw _b_.ValueError.$factory("invalid mode: " + mode)
                }
            }
            self.js.mode = mode
        }else if(key == "timeout"){
            timeout.seconds = kw.$string_dict[key][0]
        }else if(key == "cache"){
            cache = kw.$string_dict[key][0]
        }
    }
    if(encoding && mode != "text"){
        throw _b_.ValueError.$factory("encoding not supported for mode " +
            mode)
    }
    if((method == "post" || method == "put") && ! headers){
        // For POST requests, set default header
        self.js.setRequestHeader("Content-type",
                                 "application/x-www-form-urlencoded")
    }
    return {
        cache: cache,
        data:data,
        encoding: encoding,
        mode: mode,
        timeout: timeout
    }
}

var ajax = {
    __class__: _b_.type,
    __mro__: [_b_.object],

    __repr__ : function(self){return '<object Ajax>'},
    __str__ : function(self){return '<object Ajax>'},

    $infos: {
        __module__: "builtins",
        __name__: "ajax"
    },

    __getattribute__: function(self, attr){
        if(ajax[attr] !== undefined){
            return function(){
                return ajax[attr].call(null, self, ...arguments)
            }
        }else if(self.js[attr] !== undefined){
            if(typeof self.js[attr] == "function"){
                return function(){
                    if(attr == "setRequestHeader"){
                        self.$has_request_header = true
                    }else if(attr == "open"){
                        self.$method = arguments[0]
                    }
                    return self.js[attr](...arguments)
                }
            }else{
                return self.js[attr]
            }
        }else if(attr == "text"){
            return self.js.responseText
        }else if(attr == "xml"){
            return self.js.responseXML
        }
    },


    bind: function(self, evt, func){
        // req.bind(evt,func) is the same as req.onevt = func
        self.js['on' + evt] = function(){
            try{
                return func.apply(null, arguments)
            }catch(err){
                if(err.__class__ !== undefined){
                    var msg = _b_.getattr(err, 'info') +
                        '\n' + err.__class__.$infos.__name__
                    if(err.args){msg += ': ' + err.args[0]}
                    try{getattr($B.stderr, "write")(msg)}
                    catch(err){console.log(msg)}
                }else{
                    try{getattr($B.stderr, "write")(err)}
                    catch(err1){console.log(err)}
                }
            }
        }
        return $N
    },

    send: function(self, params){
        // params can be Python dictionary or string
        var res = ''
        if(!params){
            self.js.send()
            return $N
        }else if(isinstance(params, str)){
            res = params
        }else if(isinstance(params, dict)){
            if(self.headers['content-type'] == 'multipart/form-data'){
                // The FormData object serializes the data in the 'multipart/form-data'
                // content-type so we may as well override that header if it was set
                // by the user.
                res = new FormData()
                var items = _b_.list.$factory(_b_.dict.items(params))
                for(var i = 0, len = items.length; i < len; i++){
                    add_to_res(res, str.$factory(items[i][0]), items[i][1])
                }
            }else{
                if(self.$method && self.$method.toUpperCase() == "POST" &&
                        ! self.$has_request_header){
                    self.js.setRequestHeader("Content-Type",
                        "application/x-www-form-urlencoded")
                }
                var items = _b_.list.$factory(_b_.dict.items(params))
                for(var i = 0, len = items.length; i < len; i++){
                    var key = encodeURIComponent(str.$factory(items[i][0]));
                    if(isinstance(items[i][1], list)){
                        for (j = 0; j < items[i][1].length; j++) {
                            res += key +'=' +
                                encodeURIComponent(str.$factory(items[i][1][j])) + '&'
                        }
                    }else{
                        res += key + '=' +
                            encodeURIComponent(str.$factory(items[i][1])) + '&'
                    }
                }
                res = res.substr(0, res.length - 1)
            }
        }else{
            throw _b_.TypeError.$factory(
                "send() argument must be string or dictionary, not '" +
                str.$factory(params.__class__) + "'")
        }
        self.js.send(res)
        return $N
    },

    set_header: function(self,key,value){
        self.js.setRequestHeader(key,value)
        self.headers[key.toLowerCase()] = value.toLowerCase()
    },

    set_timeout: function(self, seconds, func){
        self.js.$requestTimer = setTimeout(
            function() {self.js.abort();func()},
            seconds * 1000)
    }

}

ajax.$factory = function(){

    if(window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
        var xmlhttp = new XMLHttpRequest()
    }else{// code for IE6, IE5
        var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
    }
    xmlhttp.onreadystatechange = function(){
        // here, "this" refers to xmlhttp
        var state = this.readyState
        if(this.responseType == "" || this.responseType == "text"){
            res.js.text = this.responseText
        }
        var timer = this.$requestTimer
        if(state == 0 && this.onuninitialized){this.onuninitialized(res)}
        else if(state == 1 && this.onloading){this.onloading(res)}
        else if(state == 2 && this.onloaded){this.onloaded(res)}
        else if(state == 3 && this.oninteractive){this.oninteractive(res)}
        else if(state == 4 && this.oncomplete){
            if(timer !== null){window.clearTimeout(timer)}
            this.oncomplete(res)
        }
    }
    var res = {
        __class__: ajax,
        js: xmlhttp,
        headers: {}
    }
    return res
}

function _request_without_body(method){
    var $ = $B.args(method, 3, {method: null, url: null, blocking: null},
        ["method", "url", "blocking"], arguments, {blocking: false},
        null, "kw"),
    method = $.method,
    url = $.url,
    async = !$.blocking,
    kw = $.kw
    var self = ajax.$factory()
    self.js.open(method.toUpperCase(), url, async)
    var items = handle_kwargs(self, kw, method),
        qs = items.data,
        timeout = items.timeout
    set_timeout(self, timeout)
    if(qs){
        url += "?" + qs
    }
    if(! (items.cache === true)){
        url += (qs ? "&" : "?") + (new Date()).getTime()
    }
    // Add function read() to return str or bytes according to mode
    self.js.read = function(){
        return _read(self)
    }
    self.js.send()
}

function _request_with_body(method){
    var $ = $B.args(method, 3, {method: null, url: null, blocking: null},
        ["method", "url", "blocking"], arguments, {blocking: false},
        null, "kw"),
    method = $.method,
    url = $.url,
    async = !$.blocking,
    kw = $.kw

    var self = ajax.$factory()
    self.js.open(method.toUpperCase(), url, async)
    var items = handle_kwargs(self, kw, method),
        data = items.data,
        timeout = items.timeout
    set_timeout(self, timeout)
    // Add function read() to return str or bytes according to mode
    self.js.read = function(){
        return _read(self)
    }
    self.js.send(data)
}

function _delete(){
    _request_without_body.call(null, "delete", ...arguments)
}

function get(){
    _request_without_body.call(null, "get", ...arguments)
}

function head(){
    _request_without_body.call(null, "head", ...arguments)
}

function options(){
    _request_without_body.call(null, "options", ...arguments)
}

function post(){
    _request_with_body.call(null, "post", ...arguments)
}

function put(){
    _request_with_body.call(null, "put", ...arguments)
}

function file_upload(){
    // ajax.file_upload(url, file, method="POST", **callbacks)
    var $ = $B.args("file_upload", 2, {url: null, "file": file},
            ["url", "file"], arguments, {}, null, "kw"),
        url = $.url,
        file = $.file,
        kw = $.kw

    var self = ajax.$factory(),
        method = 'POST',
        field_name = 'filetosave'

    if(kw.$string_dict.method !== undefined){
        method = kw.$string_dict.method[0]
    }

    if(kw.$string_dict.field_name !== undefined){
        field_name = kw.$string_dict.field_name[0]
    }

    var formdata = new FormData()
    formdata.append(field_name, file, file.name)

    self.js.open(method, url, True)
    self.js.send(formdata)

    for(key in kw.$string_dict){
        if(key.startsWith("on")){
            ajax.bind(self, key.substr(2), kw.$string_dict[key][0])
        }
    }
}

$B.set_func_names(ajax)

return {
    ajax: ajax,
    Ajax: ajax,
    $$delete: _delete,
    file_upload: file_upload,
    get: get,
    head: head,
    options: options,
    post: post,
    put: put
}

})(__BRYTHON__)
