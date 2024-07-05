(function($B){

var _b_ = $B.builtins,
    dict = $B.builtins.dict
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
mod.COMPILER_FLAG_NAMES = dict.$factory([
     [1, "OPTIMIZED"],
     [2, "NEWLOCALS"],
     [4, "VARARGS"],
     [8, "VARKEYWORDS"],
    [16, "NESTED"],
    [32, "GENERATOR"],
    [64, "NOFREE"],
   [128, "COROUTINE"],
   [256, "ITERABLE_COROUTINE"],
   [512, "ASYNC_GENERATOR"]
])

$B.addToImported('dis', mod)

})(__BRYTHON__)