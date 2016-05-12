// ajax
var $module = (function($B){

eval($B.InjectBuiltins())
var $N = $B.builtins.None


function ajax(){

    if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
        var xmlhttp=new XMLHttpRequest();
    }else{// code for IE6, IE5
        var xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function(){
        // here, "this" refers to xmlhttp
        var state = this.readyState
        var req = this.$ajax
        req.js.text = this.responseText
        var timer = this.$requestTimer
        if(state===0 && this.onuninitialized){this.onuninitialized(req)}
        else if(state===1 && this.onloading){this.onloading(req)}
        else if(state===2 && this.onloaded){this.onloaded(req)}
        else if(state===3 && this.oninteractive){this.oninteractive(req)}
        else if(state===4 && this.oncomplete){
            if(timer !== null){window.clearTimeout(timer)}
            this.oncomplete(req)
        }
    }
    var res = {__class__:ajax.$dict, js:xmlhttp}
    xmlhttp.$ajax = res
    return res
}

ajax.__class__ = $B.$factory

ajax.$dict = {

    __class__:$B.$type,
    __name__:'ajax',
    $factory: ajax,
    
    __getattribute__ : function(self, attr){
        // Special case for send : accept dict as parameters
        if(attr=='send'){
            return function(params){
                return ajax.$dict.send(self, params)
            }
        }
        // Otherwise default to JSObject method
        return $B.JSObject.$dict.__getattribute__(self, attr)
    },
    
    __repr__ : function(self){return '<object Ajax>'},
    __str__ : function(self){return '<object Ajax>'},
    
    bind : function(self, evt, func){
        // req.bind(evt,func) is the same as req.onevt = func
        self.js['on'+evt] = func
        return $N
    },
    
    send : function(self,params){
        // params can be Python dictionary or string
        //self.js.onreadystatechange = function(ev){console.log(ev.target)}
        var res = ''
        if(!params){
            self.js.send();
            return $N;
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
        self.js.send(res)
        return $N
    },
    
    set_header : function(self,key,value){
        self.js.setRequestHeader(key,value)
    },
    
    set_timeout : function(self,seconds,func){
        self.js.$requestTimer = setTimeout(
            function() {self.js.abort();func()},
            seconds*1000);
    }
}

ajax.$dict.__mro__ = [ajax.$dict, $B.JSObject.$dict, _b_.object.$dict]

$B.set_func_names(ajax.$dict)

return {ajax:ajax}

})(__BRYTHON__)
