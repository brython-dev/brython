// ajax
var $module = (function($B){

eval($B.InjectBuiltins())

var $XMLHttpDict = {__class__:$B.$type,__name__:'XMLHttp'}

$XMLHttpDict.__getattribute__ = function(self,attr){
    if(['headers','text','xml'].indexOf(attr)>-1){
        return $XMLHttpDict[attr](self)
    }
    return _b_.object.$dict.__getattribute__(self,attr)
}

$XMLHttpDict.__mro__ = [$XMLHttpDict, _b_.object.$dict]

$XMLHttpDict.__repr__ = function(self){return '<object XMLHttp>'}

$XMLHttpDict.__str__ = $XMLHttpDict.toString = $XMLHttpDict.__repr__

$XMLHttpDict.text = function(self){return self.responseText}

$XMLHttpDict.xml = function(self){return $DomObject(self.responseXML)}

$XMLHttpDict.headers = function(self){
    return list(self.getAllResponseHeaders().split('\n'))
}

$XMLHttpDict.get_header = function(){
    var reqobj = self;
    return function(header){ return reqobj.getResponseHeader(header) }
}

var $AjaxDict = {__class__:$B.$type,__name__:'ajax'}

$AjaxDict.__mro__ = [$AjaxDict, _b_.object.$dict]

$AjaxDict.__repr__ = function(self){return '<object Ajax>'}

$AjaxDict.__str__ = $AjaxDict.toString = $AjaxDict.__repr__

$AjaxDict.bind = function(self,evt,func){
    // req.bind(evt,func) is the same as req.on_evt = func
    self['on_'+evt]=func
}

$AjaxDict.open = function(self,method,url,async){
    self.$xmlhttp.open(method,url,async)
}

$AjaxDict.send = function(self,params){
    // params can be Python dictionary or string
    var res = ''
    if(!params){
        self.$xmlhttp.send();
        return;
    }else if(isinstance(params,str)){
        res = params
    }else if(isinstance(params,dict)){
        var items = _b_.list(_b_.dict.$dict.items(params))
        for(var i=0, _len_i = items.length; i < _len_i;i++){
            var key = encodeURIComponent(str(items[i][0]));
            if (isinstance(items[i][1],list)) {
                for (j = 0; j < items[i][1].length; j++) {
                    res += key +'=' + encodeURIComponent(str(items[i][1][j])) + '&'
                }
            } else {
                res += key + '=' + encodeURIComponent(str(items[i][1])) + '&'
            }
        }
        res = res.substr(0,res.length-1)
    }else{
        throw _b_.TypeError("send() argument must be string or dictionary, not '"+str(params.__class__)+"'")
    }
    self.$xmlhttp.send(res)
}

$AjaxDict.set_header = function(self,key,value){
    self.$xmlhttp.setRequestHeader(key,value)
}

$AjaxDict.set_timeout = function(self,seconds,func){
    self.$xmlhttp.$requestTimer = setTimeout(
        function() {self.$xmlhttp.abort();func()},
        seconds*1000);
}

function ajax(){

    var res = {
        __class__:$AjaxDict
    }

    if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
        var $xmlhttp=new XMLHttpRequest();
    }else{// code for IE6, IE5
        var $xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    $xmlhttp.$requestTimer = null
    $xmlhttp.__class__ = $XMLHttpDict

    $xmlhttp.onreadystatechange = function(){
        // here, "this" refers to $xmlhttp
        var state = this.readyState
        var req = this.$ajax
        var timer = this.$requestTimer
        var obj = this
        if(state===0 && 'on_uninitialized' in req){req.on_uninitialized(obj)}
        else if(state===1 && 'on_loading' in req){req.on_loading(obj)}
        else if(state===2 && 'on_loaded' in req){req.on_loaded(obj)}
        else if(state===3 && 'on_interactive' in req){req.on_interactive(obj)}
        else if(state===4 && 'on_complete' in req){
            if(timer !== null){window.clearTimeout(timer)}
            req.on_complete(obj)
        }
    }
    $xmlhttp.$ajax = res
    res.$xmlhttp = $xmlhttp
    return res
}

ajax.__class__ = $B.$factory
ajax.$dict = $AjaxDict

return {ajax:ajax}

})(__BRYTHON__)
