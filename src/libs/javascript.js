var $module=(function($B) {
  return {
    JSObject: $B.JSObject,
    JSConstructor: $B.JSConstructor,
    console: $B.JSObject(window.console),
    load:function(script_url, names){
        // Load and eval() the Javascript file at script_url
        // Set the names in array "names" in the Javacript global namespace
        var file_obj = $B.builtins.open(script_url)
        var content = $B.builtins.getattr(file_obj, 'read')()
        eval(content)
        if(names!==undefined){
            if(!Array.isArray(names)){
                throw $B.builtins.TypeError("argument 'names' should be a list, not '"+$B.get_class(names).__name__)
            }else{
                for(var i=0;i<names.length;i++){
                    try{window[names[i]]=eval(names[i])}
                    catch(err){throw $B.builtins.NameError("name '"+names[i]+"' not found in script "+script_url)}
                }
            }
        }
    },
    py2js: function(src){return $B.py2js(src).to_js()},
    pyobj2jsobj:function(obj){ return $B.pyobj2jsobj(obj)},
    jsobj2pyobj:function(obj){ return $B.jsobj2pyobj(obj)}
  }
})(__BRYTHON__)
