// ajax
__BRYTHON__.imported._ajax = (function($B){


var $N = $B.builtins.None,
    _b_ = $B.builtins

var add_to_res = function(res, key, val) {
    if($B.$isinstance(val, _b_.list)){
        for (j = 0; j < val.length; j++) {
            add_to_res(res, key, val[j])
        }
    }else if (val instanceof File || val instanceof Blob){
        res.append(key, val)
    }else{res.append(key, _b_.str.$factory(val))}
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
    var xhr = req.js
    if(xhr.responseType == "json"){
        return $B.structuredclone2pyobj(xhr.response)
    }
    if(req.charset_user_defined){
        // on blocking mode, xhr.response is a string
        var bytes = []
        for(var i = 0, len = xhr.response.length; i < len; i++){
            var cp = xhr.response.codePointAt(i)
            if(cp > 0xf700){
                bytes.push(cp - 0xf700)
            }else{
                bytes.push(cp)
            }
        }
    }else if(typeof xhr.response == "string"){
        if(req.mode == 'binary'){
            return _b_.str.encode(xhr.response, req.encoding || 'utf-8')
        }
        return xhr.response
    }else{
        // else it's an ArrayBuffer
        var buf = new Uint8Array(xhr.response),
            bytes = Array.from(buf.values())
    }
    var b = _b_.bytes.$factory(bytes)
    if(req.mode == "binary"){
        return b
    }else if(req.mode == "document"){
        return $B.JSObj.$factory(xhr.response)
    }else{
        var encoding = req.encoding || "utf-8"
        return _b_.bytes.decode(b, encoding)
    }
}

function stringify(d){
    var items = []
    for(var entry of $B.make_js_iterator(_b_.dict.items(d))){
        items.push(encodeURIComponent(entry[0]) + "=" +
                   encodeURIComponent(entry[1]))
    }
    return items.join("&")
}

function handle_kwargs(self, kw, method){
    // kw was created with $B.obj_dict(), its keys/values are in kw.$jsobj
    var data,
        encoding,
        headers={},
        cache,
        mode = "text",
        timeout = {}

    for(var key in kw.$jsobj){
        if(key == "data"){
            var params = kw.$jsobj[key]
            if(typeof params == "string" || params instanceof FormData){
                data = params
            }else if(params.__class__ === _b_.dict){
                var from_dict = []
                for(var key of $B.make_js_iterator(_b_.dict.keys(params))){
                    if(typeof key !== 'string'){
                        throw _b_.ValueError.$factory(
                            'data only supports string keys, got ' +
                            `'${$B.class_name(key)}' object`)
                    }
                    from_dict.push(`${key}=${_b_.dict.$getitem(params, key)}`)
                }
                data = from_dict.join('&')
            }else{
                throw _b_.TypeError.$factory("wrong type for data: " +
                    $B.class_name(params))
            }
        }else if(key == "encoding"){
            encoding = kw.$jsobj[key]
        }else if(key == "headers"){
            var value = kw.$jsobj[key]
            if(! $B.$isinstance(value, _b_.dict)){
                throw _b_.ValueError.$factory(
                    "headers must be a dict, not " + $B.class_name(value))
            }
            for(var key of _b_.dict.$keys_string(value)){
                headers[key.toLowerCase()] = _b_.dict.$getitem_string(value, key)
            }
        }else if(key.startsWith("on")){
            var event = key.substr(2)
            if(event == "timeout"){
                timeout.func = kw.$jsobj[key]
            }else{
                var f = kw.$jsobj[key]
                ajax.bind(self, event, f)
            }
        }else if(key == "mode"){
            var mode = kw.$jsobj[key]
        }else if(key == "timeout"){
            timeout.seconds = kw.$jsobj[key]
        }else if(key == "cache"){
            cache = kw.$jsobj[key]
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

    return {cache, data, encoding, headers, mode, timeout}
}

var ajax = $B.make_class('ajax')

ajax.__repr__ = function(self){
    return '<object Ajax>'
}

ajax.__getattribute__ = function(self, attr){
    if(ajax[attr] !== undefined){
        return function(){
            return ajax[attr].call(null, self, ...arguments)
        }
    }else if(attr == "text"){
        return _read(self)
    }else if(attr == "json"){
        if(self.js.responseType == "json"){
            return _read(self)
        }else{
            var resp = _read(self)
            try{
                return $B.structuredclone2pyobj(JSON.parse(resp))
            }catch(err){
                console.log('attr json, invalid resp', resp)
                throw err
            }
        }
    }else if(self.js[attr] !== undefined){
        if(typeof self.js[attr] == "function"){
            return function(){
                if(attr == "setRequestHeader"){
                    ajax.set_header.call(null, self, ...arguments)
                }else{
                    if(attr == 'overrideMimeType'){
                        console.log('override mime type')
                        self.hasMimeType = true
                    }
                    return self.js[attr](...arguments)
                }
            }
        }else{
            return self.js[attr]
        }
    }else if(attr == "xml"){
        return $B.JSObj.$factory(self.js.responseXML)
    }
}

ajax.bind = function(self, evt, func){
    // req.bind(evt,func) is the same as req.onevt = func
    self.js['on' + evt] = function(){
        try{
            return func.apply(null, arguments)
        }catch(err){
            $B.handle_error(err)
        }
    }
    return _b_.None
}

ajax.open = function(){
    var $ = $B.args('open', 4,
            {self: null, method: null, url: null, async: null},
            ['self', 'method', 'url', 'async'], arguments,
            {async: true}, null, null),
        self = $.self,
        method = $.method,
        url = $.url,
        async = $.async
    if(typeof method !== "string"){
        throw _b_.TypeError.$factory(
            'open() argument method should be string, got ' +
            $B.class_name(method))
    }
    if(typeof url !== "string"){
        throw _b_.TypeError.$factory(
            'open() argument url should be string, got ' +
            $B.class_name(url))
    }
    self.$method = method
    self.blocking = ! self.async
    self.js.open(method, url, async)
}

ajax.read = function(self){
    return _read(self)
}

ajax.send = function(self, params){
    // params can be Python dictionary or string
    var content_type
    for(var key in self.headers){
        var value = self.headers[key]
        self.js.setRequestHeader(key, value)
        if(key == 'content-type'){
            content_type = value
        }
    }
    if((self.encoding || self.blocking) && ! self.hasMimeType){
        // On blocking mode, or if an encoding has been specified,
        // override Mime type so that bytes are not processed
        // (unless the Mime type has been explicitely set)
        self.js.overrideMimeType('text/plain;charset=x-user-defined')
        self.charset_user_defined = true
    }
    var res = ''
    if(! params){
        self.js.send()
        return _b_.None
    }
    if($B.$isinstance(params, _b_.str)){
        res = params
    }else if($B.$isinstance(params, _b_.dict)){
        if(content_type == 'multipart/form-data'){
            // The FormData object serializes the data in the 'multipart/form-data'
            // content-type so we may as well override that header if it was set
            // by the user.
            res = new FormData()
            var items = _b_.list.$factory(_b_.dict.items(params))
            for(var i = 0, len = items.length; i < len; i++){
                add_to_res(res, _b_.str.$factory(items[i][0]), items[i][1])
            }
        }else{
            if(self.$method && self.$method.toUpperCase() == "POST" &&
                    ! content_type){
                // Set default Content-Type for POST requests
                self.js.setRequestHeader("Content-Type",
                    "application/x-www-form-urlencoded")
            }
            var items = _b_.list.$factory(_b_.dict.items(params))
            for(var i = 0, len = items.length; i < len; i++){
                var key = encodeURIComponent(_b_.str.$factory(items[i][0]));
                if($B.$isinstance(items[i][1], _b_.list)){
                    for (j = 0; j < items[i][1].length; j++) {
                        res += key +'=' +
                            encodeURIComponent(_b_.str.$factory(items[i][1][j])) + '&'
                    }
                }else{
                    res += key + '=' +
                        encodeURIComponent(_b_.str.$factory(items[i][1])) + '&'
                }
            }
            res = res.substr(0, res.length - 1)
        }
    }else if(params instanceof FormData){
        res = params
    }else{
        throw _b_.TypeError.$factory(
            "send() argument must be string or dictionary, not '" +
            _b_.str.$factory(params.__class__) + "'")
    }
    self.js.send(res)
    return _b_.None
}

ajax.set_header = function(self, key, value){
    self.headers[key.toLowerCase()] = value
}

ajax.set_timeout = function(self, seconds, func){
    self.js.$requestTimer = setTimeout(
        function() {
            self.js.abort()
            func()
        },
        seconds * 1000)
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
        if(state == 0 && this.onuninitialized){
            this.onuninitialized(res)
        }else if(state == 1 && this.onloading){
            this.onloading(res)
        }else if(state == 2 && this.onloaded){
            this.onloaded(res)
        }else if(state == 3 && this.oninteractive){
            this.oninteractive(res)
        }else if(state == 4 && this.oncomplete){
            if(timer !== null){
                window.clearTimeout(timer)
            }
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
    self.blocking = $.blocking
    var items = handle_kwargs(self, kw, method),
        mode = self.mode = items.mode,
        encoding = self.encoding = items.encoding
        qs = items.data,
        timeout = items.timeout
    set_timeout(self, timeout)
    if(qs){
        url += "?" + qs
    }
    if(! (items.cache === true)){
        url += (qs ? "&" : "?") + (new Date()).getTime()
    }
    self.js.open(method.toUpperCase(), url, async)

    if(async){
        if(mode == "json" || mode == "document"){
            self.js.responseType = mode
        }else{
            self.js.responseType = "arraybuffer"
            if(mode != "text" && mode != "binary"){
                throw _b_.ValueError.$factory("invalid mode: " + mode)
            }
        }
    }else{
        self.js.overrideMimeType('text/plain;charset=x-user-defined')
        self.charset_user_defined = true
    }
    for(var key in items.headers){
        self.js.setRequestHeader(key, items.headers[key])
    }
    // Add function read() to return str or bytes according to mode
    self.js.send()
}

function _request_with_body(method){
    var $ = $B.args(method, 3, {method: null, url: null, blocking: null},
        ["method", "url", "blocking"], arguments, {blocking: false},
        null, "kw"),
        method = $.method,
        url = $.url,
        async = !$.blocking,
        kw = $.kw,
        content_type
    var self = ajax.$factory()
    self.js.open(method.toUpperCase(), url, async)
    var items = handle_kwargs(self, kw, method),
        data = items.data,
        timeout = items.timeout
    if($B.$isinstance(data, _b_.dict)){
        data = stringify(data)
    }

    set_timeout(self, timeout)
    for(var key in items.headers){
        var value = items.headers[key]
        self.js.setRequestHeader(key, value)
        if(key == 'content-type'){
            content_type = value
        }
    }
    if(method.toUpperCase() == 'POST' && !content_type){
        // set default Content-Type for POST requests
        self.js.setRequestHeader('Content-Type',
            'application/x-www-form-urlencoded')
    }

    // Add function read() to return str or bytes according to mode
    self.js.read = function(){
        return _read(self)
    }
    self.js.send(data)
}

function form_data(form){
    var missing = {},
        $ = $B.args('form_data', 1, {form: null}, ['form'], arguments,
            {form: missing}, null, null)
    if($.form === missing){
        return new FormData()
    }else{
        return new FormData($.form)
    }
}

function connect(){
    _request_without_body.call(null, "connect", ...arguments)
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

function patch(){
    _request_with_body.call(null, "put", ...arguments)
}

function post(){
    _request_with_body.call(null, "post", ...arguments)
}

function put(){
    _request_with_body.call(null, "put", ...arguments)
}

function trace(){
    _request_without_body.call(null, "trace", ...arguments)
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

    var items = handle_kwargs(self, kw, method),
        data = items.data,
        headers = items.headers,
        timeout = items.timeout

    for(var key in items.headers){
        var value = items.headers[key]
        self.js.setRequestHeader(key, value)
        if(key == 'content-type'){
            content_type = value
        }
    }
    set_timeout(self, timeout)

    if(kw.$jsobj.hasOwnProperty('method')){
        method = kw.$jsobj.method
    }

    if(kw.$jsobj.hasOwnProperty('field_name')){
        field_name = kw.$jsobj.field_name
    }

    var formdata = new FormData()
    formdata.append(field_name, file, file.name)

    if(items.data){
        if(items.data instanceof FormData){
            // append additional data
            for(var d of items.data){
                formdata.append(d[0], d[1])
            }
        }else if($B.$isinstance(items.data, _b_.dict)){
            for(var d of _b_.list.$factory(_b_.dict.items(items.data))){
                formdata.append(d[0], d[1])
            }
        }else{
            throw _b_.ValueError.$factory(
                'data value must be a dict of form_data')
        }
    }

    self.js.open(method, url, _b_.True)
    self.js.send(formdata)

    for(var key in kw.$jsobj){
        if(key.startsWith("on")){
            ajax.bind(self, key.substr(2), kw.$jsobj[key])
        }
    }
}

$B.set_func_names(ajax)

return {
    ajax: ajax,
    Ajax: ajax,
    delete: _delete,
    file_upload: file_upload,
    connect,
    form_data,
    get,
    head,
    options,
    patch,
    post,
    put,
    trace
}

})(__BRYTHON__)
