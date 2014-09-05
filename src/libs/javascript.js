var $module=(function($B) {
  return {
    JSObject: $B.JSObject,
    JSConstructor: $B.JSConstructor,
    console: $B.JSObject(window.console),
    py2js: function(src){return $B.py2js(src).to_js()}
  }
})(__BRYTHON__)
