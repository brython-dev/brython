(function($B){

var _b_ = $B.builtins,
    dict = $B.builtins.dict

var mod = {
    dis:function(src){
        $B.$py_module_path['__main__'] = $B.brython_path
        return __BRYTHON__.py2js(src,'__main__','__main__',
            $B.builtins_scope).to_js()
    },
    COMPILER_FLAG_NAMES: $B.builtins.dict.$factory(),
    Positions: function(){
        return _b_.None
    }
}

// COMPILER_FLAGS is defined in brython_builtins.js
for(var key in $B.COMPILER_FLAGS){
    mod[key] = $B.COMPILER_FLAGS[key]
    _b_.dict.$setitem(mod.COMPILER_FLAG_NAMES, mod[key], key)
}

$B.addToImported('dis', mod)

})(__BRYTHON__)