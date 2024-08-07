(function($B){

var _b_ = $B.builtins,
    dict = $B.builtins.dict

var flag_names = {
    OPTIMIZED: 1,
    NEWLOCALS: 2,
    VARARGS: 4,
    VARKEYWORDS: 8,
    NESTED: 16,
    GENERATOR: 32,
    NOFREE: 64,
    COROUTINE: 128,
    ITERABLE_COROUTINE: 256,
    ASYNC_GENERATOR: 512
}

var mod = {
    dis:function(src){
        $B.$py_module_path['__main__'] = $B.brython_path
        return __BRYTHON__.py2js(src,'__main__','__main__',
            $B.builtins_scope).to_js()
    },
    OPTIMIZED: 1,
    NEWLOCALS: 2,
    VARARGS: 4,
    VARKEYWORDS: 8,
    NESTED: 16,
    GENERATOR: 32,
    NOFREE: 64,
    COROUTINE: 128,
    ITERABLE_COROUTINE: 256,
    ASYNC_GENERATOR: 512,
    COMPILER_FLAG_NAMES: $B.builtins.dict.$factory(),
    Positions: function(){
        return _b_.None
    }
}

for(var key in flag_names){
    mod[key] = flag_names[key]
    _b_.dict.$setitem(mod.COMPILER_FLAG_NAMES, flag_names[key], key)
}

$B.addToImported('dis', mod)

})(__BRYTHON__)