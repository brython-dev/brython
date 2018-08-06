var $module=(function($B){

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
    ASYNC_GENERATOR: 512
}
return mod

})(__BRYTHON__)