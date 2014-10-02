var $module=(function($B) {
  return {
    $$alert:$B._alert,
    confirm: function(message){return $B.JSObject(window.confirm(message))},
    console:{log:function(data){window.console.log(data)}},
    $$document:$B.$DOMNode(document),
    doc: $B.$DOMNode(document),   //want to use document instead of doc
    DOMEvent:$B.DOMEvent,
    DOMNode:$B.DOMNode,
    mouseCoords: function(ev){return $B.JSObject($mouseCoords(ev))},
    prompt: function(message, default_value){
        return $B.JSObject(window.prompt(message, default_value||''))
    },
    win: $B.win,
    $$window: $B.win
  }
})(__BRYTHON__)
