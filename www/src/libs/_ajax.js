// ajax
var $module = (function($B){

eval($B.InjectBuiltins())
var $N = $B.builtins.None

var ajax1 = $B.make_class("ajax1",
    function(){
        if(window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
            var xmlhttp = new XMLHttpRequest()
        }else{// code for IE6, IE5
            var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
        }
        xmlhttp.onreadystatechange = function(){
            // here, "this" refers to xmlhttp
            var state = this.readyState
            var timer = this.$requestTimer
            if(state == 0 && this.onuninitialized){this.onuninitialized()}
            else if(state == 1 && this.onloading){this.onloading()}
            else if(state == 2 && this.onloaded){this.onloaded()}
            else if(state == 3 && this.oninteractive){this.oninteractive()}
            else if(state == 4 && this.oncomplete){
                if(timer !== null){window.clearTimeout(timer)}
                this.oncomplete()
            }
        }
        return {
            __class__: ajax,
            js: xmlhttp,
            headers: {}
        }
    }
)

var add_to_res = function(res, key, val) {
    if(isinstance(val, list)){
        for (j = 0; j < val.length; j++) {
            add_to_res(res, key, val[j])
        }
    }else if (val instanceof File || val instanceof Blob){
        res.append(key, val)
    }else{res.append(key,str.$factory(val))}
}

function handle_kwargs(self, kw, method){
    var data,
        headers
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
            for(var key in headers){
                self.js.setRequestHeader(key, headers[key])
            }
        }else if(key.startsWith("on")){
            ajax.bind(self, key.substr(2), kw.$string_dict[key])
        }
    }
    if(method == "post" && ! headers){
        // For POST requests, set default header
        self.js.setRequestHeader("Content-type",
                                 "application/x-www-form-urlencoded")
    }
    return data
}

var ajax = {
    __class__: _b_.type,
    __mro__: [$B.JSObject, _b_.object],

    __getattribute__ : function(self, attr){
        // Special case for send : accept dict as parameters
        if(attr == 'send'){
            return function(params){
                return ajax.send(self, params)
            }
        }
        // Otherwise default to JSObject method
        return $B.JSObject.__getattribute__(self, attr)
    },

    __repr__ : function(self){return '<object Ajax>'},
    __str__ : function(self){return '<object Ajax>'},

    $infos: {
        __module__: "builtins",
        __name__: "ajax"
    },

    bind : function(self, evt, func){
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

    get: function(){
        var $ = $B.args("get", 3, {self:null, url: null, async: null},
                ["self", "url", "async"], arguments, {async: true},
                null, "kw"),
            self = $.self,
            url = $.url,
            async = $.async,
            kw = $.kw
        var qs = handle_kwargs(self, kw, "get")
        if(qs){
            url += "?" + qs
        }
        self.js.open("GET", url, async)
        self.js.send()
    },

    post: function(){
        var $ = $B.args("get", 3, {self:null, url: null, async: null},
                ["self", "url", "async"], arguments, {async: true},
                null, "kw"),
            self = $.self,
            url = $.url,
            async = $.async,
            kw = $.kw,
            data
        self.js.open("POST", url, async)
        var data = handle_kwargs(self, kw, "post")
        self.js.send(data)
    },

    send : function(self, params){
        // params can be Python dictionary or string
        //self.js.onreadystatechange = function(ev){console.log(ev.target)}
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
            throw _b_.TypeError("send() argument must be string or dictionary, not '" +
                str.$factory(params.__class__) + "'")
        }
        self.js.send(res)
        return $N
    },

    set_header : function(self,key,value){
        self.js.setRequestHeader(key,value)
        self.headers[key.toLowerCase()] = value.toLowerCase()
    },

    set_timeout : function(self,seconds,func){
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


$B.set_func_names(ajax)

return {ajax: ajax, Ajax: ajax, ajax1: ajax1}

})(__BRYTHON__)
