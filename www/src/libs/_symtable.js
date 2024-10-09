(function($B){

var _b_ = $B.builtins

var module = $B.SYMBOL_FLAGS // in brython_builtins.js

module.symtable = function(){
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


$B.addToImported('_symtable', module)

})(__BRYTHON__)