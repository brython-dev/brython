var $module=(function($B) {
  return {
    alert:function(message){window.alert($B.builtins.str(message))},
    confirm: $B.JSObject(window.confirm),
    console:$B.JSObject(window.console),
    document:$B.DOMNode(document),
    doc: $B.DOMNode(document),   //want to use document instead of doc
    DOMEvent:$B.DOMEvent,
    DOMNode:$B.DOMNode,
    mouseCoords: function(ev){return $B.JSObject($mouseCoords(ev))},
    prompt: function(message, default_value){
        return $B.JSObject(window.prompt(message, default_value||''))
    },
    reload: function(){
        // Try to reload all scripts and all imported modules
        var scripts=document.getElementsByTagName('script'),$elts=[]
        // Freeze the list of scripts here ; other scripts can be inserted on
        // the fly by viruses
        for(var i=0;i<scripts.length;i++){
            var script = scripts[i]
            if(script.type!="text/python" && script.type!="text/python3"){
                $elts.push(script)
            }
        }
        console.log('scripts to reload', $elts)
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
