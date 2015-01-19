var $module=(function($B) {
  return {
    alert:function(message){window.alert($B.builtins.str(message))},
    confirm: function(message){return $B.JSObject(window.confirm(message))},
    console:{log:function(data){window.console.log("DeprecationWarning: console.log() will be deprecated,\n"+
		                                           "use print() instead.\n");
		                        window.console.log(data)}},
    document:$B.$DOMNode(document),
    doc: $B.$DOMNode(document),   //want to use document instead of doc
    DOMEvent:$B.DOMEvent,
    DOMNode:$B.DOMNode,
    mouseCoords: function(ev){return $B.JSObject($mouseCoords(ev))},
    prompt: function(message, default_value){
        return $B.JSObject(window.prompt(message, default_value||''))
    },
    win: $B.win,
    window: $B.win,
    URLParameter:function(name) {
       name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
       var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
           results = regex.exec(location.search);
       results= results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
       return $B.builtins.str(results);
    }
  }
})(__BRYTHON__)
