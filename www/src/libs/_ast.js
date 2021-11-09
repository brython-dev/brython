var $module = (function($B){

    var _b_ = $B.builtins,
        ast = $B.ast, // created in py2js
        mod = {}
    mod.PyCF_ONLY_AST = $B.PyCF_ONLY_AST
    mod.AST = $B.make_class('AST')
    for(var klass in ast){
        mod[klass] = $B.make_class(ast[klass].$name, ast[klass])
    }
    return mod

}
)(__BRYTHON__)
