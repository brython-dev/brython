// websocket
var $module = (function($B){

    var $WebSocketDict = {
        __class__ :$B.$type,
        __name__:'WebSocket'
    }
    
    $WebSocketDict.bind = function(self,event,callback){
        self.$ws['on'+event] = callback
    }
    
    $WebSocketDict.send = function(self,data){
        self.$ws.send(data)
    }
        
    $WebSocketDict.close = function(self){
        self.$ws.close()
    }
    
    $WebSocketDict.__mro__ = [$WebSocketDict,$B.builtins.object.$dict]
    
    function websocket(host){
        var $socket = new WebSocket(host);
        var res = {
            __class__:$WebSocketDict,
            $ws : $socket
        }
        res.$websocket = $socket
        return res
    }
    websocket.__class__ = $B.$factory
    websocket.$dict = $WebSocketDict
    
    return {websocket:websocket}

})(__BRYTHON__)
