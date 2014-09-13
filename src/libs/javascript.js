var $module=(function($B) {
  return {
    JSObject: $B.JSObject,
    JSConstructor: $B.JSConstructor,
    console: $B.JSObject(window.console),
    py2js: function(src){return $B.py2js(src).to_js()},
    pyobj2jsobj:function(obj){ return $B.pyobj2jsobj(obj)},
    jsobj2pyobj:function(obj){ return $B.jsobj2pyobj(obj)}
  }
})(__BRYTHON__)
