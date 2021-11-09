var $module = (function($B){

    var _b_ = $B.builtins,
        ast = $B.ast, // created in py2js
        mod = {}
    mod.PyCF_ONLY_AST = $B.PyCF_ONLY_AST
    mod.AST = $B.AST // in builtin_modules.js
    $B.create_python_ast_classes() // in py_ast.js
    for(var klass in ast){
        mod[klass] = $B.python_ast_classes[klass]
    }
    return mod

}
)(__BRYTHON__)
