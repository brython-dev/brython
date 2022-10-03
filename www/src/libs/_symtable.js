var $module = (function($B){

var _b_ = $B.builtins

return {
    CELL: 5,
    DEF_ANNOT: 256,
    DEF_BOUND: 134,
    DEF_FREE: 32,
    DEF_FREE_CLASS: 64,
    DEF_GLOBAL: 1,
    DEF_IMPORT: 128,
    DEF_LOCAL: 2,
    DEF_NONLOCAL: 8,
    DEF_PARAM: 4,
    FREE: 4,
    GLOBAL_EXPLICIT: 2,
    GLOBAL_IMPLICIT: 3,
    LOCAL: 1,
    SCOPE_MASK: 15,
    SCOPE_OFF: 11,
    TYPE_CLASS: 1,
    TYPE_FUNCTION: 0,
    TYPE_MODULE: 2,
    USE: 16,
    symtable: function(){
        var $ = $B.args('symtable', 3,
            {code: null, filename: null, compile_type: null},
            ['code', 'filename', 'compile_type'], arguments,
            {}, null, null)
        var ast = _b_.compile($.code, $.filename, $.compile_type,
            $B.PyCF_ONLY_AST)
        // ast is an instance of Python class
        // _Py_Symtable_Build in symtable.js uses the underlying JS object
        return $B._PySymtable_Build(ast.$js_ast, $.filename)
    }
}

})(__BRYTHON__)