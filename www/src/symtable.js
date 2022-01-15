(function($B){

var _b_ = $B.builtins

/* error strings used for warnings */
var GLOBAL_PARAM = "name '%U' is parameter and global"

var NONLOCAL_PARAM = "name '%U' is parameter and nonlocal"

var GLOBAL_AFTER_ASSIGN = "name '%U' is assigned to before global declaration"

var NONLOCAL_AFTER_ASSIGN = "name '%U' is assigned to before nonlocal declaration"

var GLOBAL_AFTER_USE = "name '%U' is used prior to global declaration"

var NONLOCAL_AFTER_USE = "name '%U' is used prior to nonlocal declaration"

var GLOBAL_ANNOT = "annotated name '%U' can't be global"

var NONLOCAL_ANNOT = "annotated name '%U' can't be nonlocal"

var IMPORT_STAR_WARNING = "import * only allowed at module level"

var NAMED_EXPR_COMP_IN_CLASS =
    "assignment expression within a comprehension cannot be used in a class body"

var NAMED_EXPR_COMP_CONFLICT =
    "assignment expression cannot rebind comprehension iteration variable '%U'"

var NAMED_EXPR_COMP_INNER_LOOP_CONFLICT =
    "comprehension inner loop cannot rebind assignment expression target '%U'"

var NAMED_EXPR_COMP_ITER_EXPR =
    "assignment expression cannot be used in a comprehension iterable expression"

var ANNOTATION_NOT_ALLOWED =
    "'%s' can not be used within an annotation"

/* Flags for def-use information */

var DEF_GLOBAL = 1           /* global stmt */
var DEF_LOCAL = 2            /* assignment in code block */
var DEF_PARAM = 2<<1         /* formal parameter */
var DEF_NONLOCAL = 2<<2      /* nonlocal stmt */
var USE = 2<<3               /* name is used */
var DEF_FREE = 2<<4          /* name used but not defined in nested block */
var DEF_FREE_CLASS = 2<<5    /* free variable from class's method */
var DEF_IMPORT = 2<<6        /* assignment occurred via import */
var DEF_ANNOT = 2<<7         /* this name is annotated */
var DEF_COMP_ITER = 2<<8     /* this name is a comprehension iteration variable */

var DEF_BOUND = DEF_LOCAL | DEF_PARAM | DEF_IMPORT

/* GLOBAL_EXPLICIT and GLOBAL_IMPLICIT are used internally by the symbol
   table.  GLOBAL is returned from PyST_GetScope() for either of them.
   It is stored in ste_symbols at bits 12-15.
*/
var SCOPE_OFFSET = 11
var SCOPE_MASK = (DEF_GLOBAL | DEF_LOCAL | DEF_PARAM | DEF_NONLOCAL)

var LOCAL = 1
var GLOBAL_EXPLICIT = 2
var GLOBAL_IMPLICIT = 3
var FREE = 4
var CELL = 5

var GENERATOR = 1
var GENERATOR_EXPRESSION = 2

var NULL = undefined

function LOCATION(x){
    // (x)->lineno, (x)->col_offset, (x)->end_lineno, (x)->end_col_offset
    this.x = x
}

function _Py_Mangle(privateobj, ident){
    /* Name mangling: __private becomes _classname__private.
       This is independent from how the name is used. */
    var result,
        nlen, plen, ipriv,
        maxchar;
    if (privateobj == NULL ||
        ! ident.startsWith('__')) {
        return ident;
    }
    nlen = ident.length
    plen = privateobj.length
    /* Don't mangle __id__ or names with dots.

       The only time a name with a dot can occur is when
       we are compiling an import statement that has a
       package name.

       TODO(jhylton): Decide whether we want to support
       mangling of the module name, e.g. __M.X.
    */
    if ((ident[nlen - 1] == '_' &&
         ident[nlen - 2] == '_') ||
        ident.find('.') != -1) {
        return ident; /* Don't mangle __whatever__ */
    }
    /* Strip leading underscores from class name */
    ipriv = 0;
    while (privateobj[ipriv] == '_')
        ipriv++;
    if (ipriv == plen) {
        return ident; /* Don't mangle if class is just underscores */
    }
    plen -= ipriv;

    maxchar = PyUnicode_MAX_CHAR_VALUE(ident);
    if (PyUnicode_MAX_CHAR_VALUE(privateobj) > maxchar)
        maxchar = PyUnicode_MAX_CHAR_VALUE(privateobj);

    result = PyUnicode_New(1 + nlen + plen, maxchar);
    if (!result)
        return 0;
    /* ident = "_" + priv[ipriv:] + ident # i.e. 1+plen+nlen bytes */
    PyUnicode_WRITE(PyUnicode_KIND(result), PyUnicode_DATA(result), 0, '_');
    if (PyUnicode_CopyCharacters(result, 1, privateobj, ipriv, plen) < 0) {
        Py_DECREF(result);
        return NULL;
    }
    if (PyUnicode_CopyCharacters(result, plen+1, ident, 0, nlen) < 0) {
        Py_DECREF(result);
        return NULL;
    }
    assert(_PyUnicode_CheckConsistency(result, 1));
    return result;
}
var top = NULL,
    lambda = NULL,
    genexpr = NULL,
    listcomp = NULL,
    setcomp = NULL,
    dictcomp = NULL,
    __class__ = NULL,
    _annotation = NULL

var _comprehension_type = {
    NoComprehension: 0,
    ListComprehension: 1,
    DictComprehension: 2,
    SetComprehension: 3,
    GeneratorExpression: 4 }

var internals = {}

function GET_IDENTIFIER(VAR){
    return VAR
}

function Symtable(){

    this.filename = NULL;
    this.blocks = NULL;

    this.stack = []
    this.blocks = {}
    this.cur = NULL;
    this.private = NULL;

}

function ste_new(st, name, block,
        key, lineno, col_offset,
        end_lineno, end_col_offset){
    var ste = NULL,
        k = NULL;

    k = key;
    if (k == NULL)
        return NULL
    ste = {
        table: st,
        id: k, /* ste owns reference to k */
        name: name,

        symbols: NULL,
        varnames: NULL,
        children: NULL,

        directives: NULL,

        type: block,
        nested: 0,
        free: 0,
        varargs: 0,
        varkeywords: 0,
        opt_lineno: 0,
        opt_col_offset: 0,
        lineno: lineno,
        col_offset: col_offset,
        end_lineno: end_lineno,
        end_col_offset: end_col_offset
    }
    if (st.cur != NULL &&
        (st.cur.ste_nested ||
         st.cur.ste_type == FunctionBlock))
        ste.nested = 1;
    ste.child_free = 0;
    ste.generator = 0;
    ste.coroutine = 0;
    ste.comprehension = _comprehension_type.NoComprehension;
    ste.returns_value = 0;
    ste.needs_class_closure = 0;
    ste.comp_iter_target = 0;
    ste.comp_iter_expr = 0;

    ste.symbols = {};
    ste.varnames = [];
    ste.children = [];

    st.blocks[ste.id] = ste

    return ste;
}
$B._PySymtable_Build = function(mod, filename){
    var st = new Symtable,
        seq
    st.filename = filename;

    /* Make the initial symbol information gathering pass */
    if (! GET_IDENTIFIER('top') ||
        !symtable_enter_block(st, top, $B.ast.Module, mod, 0, 0, 0, 0)) {
        return NULL;
    }

    st.top = st.cur;
    switch (mod.constructor) {
    case $B.ast.Module:
        seq = mod.body;
        for(var item of seq){
            symtable_visit_stmt(st, item)
        }
        break
    case $B.ast.Expression_kind:
        symtable_visit_expr(st, mod.body)
        break;
    case $B.ast.Interactive:
        seq = mod.body;
        for(var item of seq){
            symtable_visit_stmt(st, item)
        }
        break;
    }

    /* Make the second symbol analysis pass */
    symtable_analyze(st)

    return st;
}

function PySymtable_Lookup(st, key){
    var v = st.blocks[key]
    if(v){
        assert(PySTEntry_Check(v))
    }
    return v
}

function _PyST_GetSymbol(ste, name)
{
    if(! ste.symbols.hasOwnProperty(name)){
        return 0
    }
    return ste.symbols[name]
}

function _PyST_GetScope(ste, name){
    var symbol = _PyST_GetSymbol(ste, name);
    return (symbol >> SCOPE_OFFSET) & SCOPE_MASK;
}

function error_at_directive(ste, name){
    var data;
    assert(ste.ste_directives);
    for (i = 0; i < PyList_GET_SIZE(ste.directives); i++) {
        data = PyList_GET_ITEM(ste.directives, i);
        assert(PyTuple_CheckExact(data));
        assert(PyUnicode_CheckExact(PyTuple_GET_ITEM(data, 0)));
        if (PyUnicode_Compare(PyTuple_GET_ITEM(data, 0), name) == 0) {
            PyErr_RangedSyntaxLocationObject(ste.table.filename,
                                             PyLong_AsLong(PyTuple_GET_ITEM(data, 1)),
                                             PyLong_AsLong(PyTuple_GET_ITEM(data, 2)) + 1,
                                             PyLong_AsLong(PyTuple_GET_ITEM(data, 3)),
                                             PyLong_AsLong(PyTuple_GET_ITEM(data, 4)) + 1);

            return 0;
        }
    }
    PyErr_SetString(PyExc_RuntimeError,
                    "BUG: internal directive bookkeeping broken");
    return 0;
}


/* Analyze raw symbol information to determine scope of each name.

   The next several functions are helpers for symtable_analyze(),
   which determines whether a name is local, global, or free.  In addition,
   it determines which local variables are cell variables; they provide
   bindings that are used for free variables in enclosed blocks.

   There are also two kinds of global variables, implicit and explicit.  An
   explicit global is declared with the global statement.  An implicit
   global is a free variable for which the compiler has found no binding
   in an enclosing function scope.  The implicit global is either a global
   or a builtin.  Python's module and class blocks use the xxx_NAME opcodes
   to handle these names to implement slightly odd semantics.  In such a
   block, the name is treated as global until it is assigned to; then it
   is treated as a local.

   The symbol table requires two passes to determine the scope of each name.
   The first pass collects raw facts from the AST via the symtable_visit_*
   functions: the name is a parameter here, the name is used but not defined
   here, etc.  The second pass analyzes these facts during a pass over the
   PySTEntryObjects created during pass 1.

   When a function is entered during the second pass, the parent passes
   the set of all name bindings visible to its children.  These bindings
   are used to determine if non-local variables are free or implicit globals.
   Names which are explicitly declared nonlocal must exist in this set of
   visible names - if they do not, a syntax error is raised. After doing
   the local analysis, it analyzes each of its child blocks using an
   updated set of name bindings.

   The children update the free variable set.  If a local variable is added to
   the free variable set by the child, the variable is marked as a cell.  The
   function object being defined must provide runtime storage for the variable
   that may outlive the function's frame.  Cell variables are removed from the
   free set before the analyze function returns to its parent.

   During analysis, the names are:
      symbols: dict mapping from symbol names to flag values (including offset scope values)
      scopes: dict mapping from symbol names to scope values (no offset)
      local: set of all symbol names local to the current scope
      bound: set of all symbol names local to a containing function scope
      free: set of all symbol names referenced but not bound in child scopes
      global: set of all symbol names explicitly declared as global
*/

function SET_SCOPE(DICT, NAME, I) {
    $B.$setitem(DICT, NAME, I)
}

/* Decide on scope of name, given flags.

   The namespace dictionaries may be modified to record information
   about the new name.  For example, a new global will add an entry to
   global.  A name that was global can be changed to local.
*/

function analyze_name(ste, scopes, name, flags,
             bound, local, free,
             global){
    if(flags & DEF_GLOBAL){
        if(flags & DEF_NONLOCAL){
            PyErr_Format(PyExc_SyntaxError,
                         "name '%U' is nonlocal and global",
                         name);
            return error_at_directive(ste, name);
        }
        SET_SCOPE(scopes, name, GLOBAL_EXPLICIT);
        if (PySet_Add(global, name) < 0){
            return 0;
        }
        if (bound && (PySet_Discard(bound, name) < 0)){
            return 0;
        }
        return 1;
    }
    if (flags & DEF_NONLOCAL) {
        if (!bound) {
            PyErr_Format(PyExc_SyntaxError,
                         "nonlocal declaration not allowed at module level");
            return error_at_directive(ste, name);
        }
        if (!PySet_Contains(bound, name)) {
            PyErr_Format(PyExc_SyntaxError,
                         "no binding for nonlocal '%U' found",
                         name);

            return error_at_directive(ste, name);
        }
        SET_SCOPE(scopes, name, FREE);
        ste.free = 1;
        return PySet_Add(free, name) >= 0;
    }
    if (flags & DEF_BOUND) {
        SET_SCOPE(scopes, name, LOCAL);
        if (_b_.set.add(local, name) < 0){
            return 0;
        }
        try{
            _b_.set.remove(global, name)
        }catch(err){
            // ignore
        }
        return 1;
    }
    /* If an enclosing block has a binding for this name, it
       is a free variable rather than a global variable.
       Note that having a non-NULL bound implies that the block
       is nested.
    */
    if (bound && PySet_Contains(bound, name)) {
        SET_SCOPE(scopes, name, FREE);
        ste.free = 1;
        return PySet_Add(free, name) >= 0;
    }
    /* If a parent has a global statement, then call it global
       explicit?  It could also be global implicit.
     */
    if (global && _b_.set.__contains__(global, name)) {
        SET_SCOPE(scopes, name, GLOBAL_IMPLICIT);
        return 1;
    }
    if (ste.nested){
        ste.free = 1;
    }
    SET_SCOPE(scopes, name, GLOBAL_IMPLICIT);
    return 1;
}

var SET_SCOPE

/* If a name is defined in free and also in locals, then this block
   provides the binding for the free variable.  The name should be
   marked CELL in this block and removed from the free list.

   Note that the current block's free variables are included in free.
   That's safe because no name can be free and local in the same scope.
*/

function analyze_cells(scopes, free){
    var name, v, v_cell;
    var success = 0,
        pos = 0;

    v_cell = CELL;
    if (!v_cell){
        return 0;
    }
    while (PyDict_Next(scopes, pos, name, v)) {
        assert(PyLong_Check(v));
        scope = v;
        if (scope != LOCAL){
            continue;
        }
        if (!PySet_Contains(free, name)){
            continue;
        }
        /* Replace LOCAL with CELL for this name, and remove
           from free. It is safe to replace the value of name
           in the dict, because it will not cause a resize.
         */
        if (PyDict_SetItem(scopes, name, v_cell) < 0){
            return success
        }
        if (PySet_Discard(free, name) < 0){
            return success
        }
    }
    success = 1;
    return success
}

function drop_class_free(ste, free){
    var res;
    if (!GET_IDENTIFIER(__class__)){
        return 0;
    }
    res = PySet_Discard(free, __class__);
    if (res < 0){
        return 0;
    }
    if (res){
        ste.needs_class_closure = 1;
    }
    return 1;
}

/* Enter the final scope information into the ste_symbols dict.
 *
 * All arguments are dicts.  Modifies symbols, others are read-only.
*/
function update_symbols(symbols, scopes, bound, free, classflag){
    var name = NULL,
        itr = NULL,
        v = NULL,
        v_scope = NULL,
        v_new = NULL,
        v_free = NULL,
        pos = 0;

    /* Update scope information for all symbols in this scope */
    for(var name in symbols){
    // while (PyDict_Next(symbols, pos, name, v)) {
        var v = symbols[name]
        var scope, flags;
        flags = v;
        v_scope = _b_.dict.$getitem(scopes, name);
        // assert(v_scope && PyLong_Check(v_scope));
        scope = v_scope;
        flags |= (scope << SCOPE_OFFSET);
        v_new = flags;
        if (!v_new){
            return 0;
        }
        symbols[name] = v_new
    }

    /* Record not yet resolved free variables from children (if any) */
    v_free = FREE << SCOPE_OFFSET;
    itr = _b_.iter(free);

    var next_func = $B.$getattr(itr, '__next__')
    while (true) {
        try{
            var name = next_func()
        }catch(err){
            break
        }
        v = symbols[name]

        /* Handle symbol that already exists in this scope */
        if (v) {
            /* Handle a free variable in a method of
               the class that has the same name as a local
               or global in the class scope.
            */
            if  (classflag &&
                 v & (DEF_BOUND | DEF_GLOBAL)) {
                var flags = v | DEF_FREE_CLASS;
                v_new = flags;
                if (!v_new) {
                    return 0;
                }
                symbols[name] = v_new
            }
            /* It's a cell, or already free in this scope */
            continue;
        }
        else if (PyErr_Occurred()) {
            return 0;
        }
        /* Handle global symbol */
        if (bound && !PySet_Contains(bound, name)) {
            continue;       /* it's a global */
        }
        /* Propagate new free symbol up the lexical stack */
        symbols[name] = v_free
    }

    return 1;

}

/* Make final symbol table decisions for block of ste.

   Arguments:
   ste -- current symtable entry (input/output)
   bound -- set of variables bound in enclosing scopes (input).  bound
       is NULL for module blocks.
   free -- set of free variables in enclosed scopes (output)
   globals -- set of declared global variables in enclosing scopes (input)

   The implementation uses two mutually recursive functions,
   analyze_block() and analyze_child_block().  analyze_block() is
   responsible for analyzing the individual names defined in a block.
   analyze_child_block() prepares temporary namespace dictionaries
   used to evaluated nested blocks.

   The two functions exist because a child block should see the name
   bindings of its enclosing blocks, but those bindings should not
   propagate back to a parent block.
*/


function analyze_block(ste, bound, free, global){
    var name, v, local = NULL, scopes = NULL, newbound = NULL,
        newglobal = NULL, newfree = NULL, allfree = NULL,
        temp, i, success = 0, pos = 0;

    local = PySet_New(NULL);  /* collect new names bound in block */
    if (!local){
        return 0
    }
    scopes = $B.empty_dict();  /* collect scopes defined for each name */

    /* Allocate new global and bound variable dictionaries.  These
       dictionaries hold the names visible in nested blocks.  For
       ClassBlocks, the bound and global names are initialized
       before analyzing names, because class bindings aren't
       visible in methods.  For other blocks, they are initialized
       after names are analyzed.
     */

    /* TODO(jhylton): Package these dicts in a struct so that we
       can write reasonable helper functions?
    */
    newglobal = PySet_New(NULL);
    newfree = PySet_New(NULL);
    newbound = PySet_New(NULL);

    /* Class namespace has no effect on names visible in
       nested functions, so populate the global and bound
       sets to be passed to child blocks before analyzing
       this one.
     */
    if (ste.type === $B.ast.ClassDef) {
        /* Pass down known globals */
        temp = PyNumber_InPlaceOr(newglobal, global);
        if (!temp){
            return 0
        }
        /* Pass down previously bound symbols */
        if (bound) {
            temp = PyNumber_InPlaceOr(newbound, bound);
            if (!temp){
                return 0
            }
        }
    }

    for(var name in ste.symbols){
        var flags = ste.symbols[name]
        if (!analyze_name(ste, scopes, name, flags,
                          bound, local, free, global))
            return 0
    }


    /* Populate global and bound sets to be passed to children. */
    if (ste.type != $B.ast.ClassDef) {
        /* Add function locals to bound set */
        if (ste.type == $B.ast.FunctionDef) {
            temp = PyNumber_InPlaceOr(newbound, local);
            if (!temp){
                return 0
            }
        }
        /* Pass down previously bound symbols */
        if (bound) {
            newbound = _b_.set.union(newbound, bound)
        }
        /* Pass down known globals */
        newglobal = _b_.set.union(newglobal, global);

    }else{
        /* Special-case __class__ */
        if (!GET_IDENTIFIER('__class__')){
            return 0
        }
        _b_.set.add(newbound, __class__)
    }

    /* Recursively call analyze_child_block() on each child block.

       newbound, newglobal now contain the names visible in
       nested blocks.  The free variables in the children will
       be collected in allfree.
    */
    allfree = PySet_New(NULL);

    for (var c of ste.children){
        var entry;
        assert(c && PySTEntry_Check(c));
        entry = c;
        if (!analyze_child_block(entry, newbound, newfree, newglobal,
                                 allfree)){
            return 0
        }
        /* Check if any children have free variables */
        if (entry.free || entry.child_free){
            ste.child_free = 1
        }
    }

    newfree = _b_.set.union(newfree, allfree)

    /* Check if any local variables must be converted to cell variables */
    if (ste.type === $B.ast.FunctionDef && !analyze_cells(scopes, newfree)){
        return 0
    }else if (ste.type === $B.ast.ClassDef && !drop_class_free(ste, newfree)){
        return 0
    }
    /* Records the results of the analysis in the symbol table entry */
    if (!update_symbols(ste.symbols, scopes, bound, newfree,
                        ste.type === $B.ast.ClassDef)){
        return 0
    }
    free = _b_.set.union(free, newfree)

    success = 1;
    return success
}

function PySet_New(arg){
    if(arg === NULL){
        return _b_.set.$factory()
    }
    return _b_.set.$factory([arg])
}

function analyze_child_block(entry, bound, free,
                    global, child_free){
    console.log('analyse child block, bound', bound)
    var temp_bound = NULL, temp_global = NULL, temp_free = NULL,
        temp

    /* Copy the bound and global dictionaries.

       These dictionaries are used by all blocks enclosed by the
       current block.  The analyze_block() call modifies these
       dictionaries.

    */
    //console.log('bound', bound, 'free', free, 'global', global)
    temp_bound = PySet_New(bound);
    temp_free = PySet_New(free);
    temp_global = PySet_New(global);

    if (!analyze_block(entry, temp_bound, temp_free, temp_global)){
        return 0
    }
    temp = PyNumber_InPlaceOr(child_free, temp_free);
    if (!temp){
        return 0
    }
    return 1;
}

function symtable_analyze(st){
    var free, global, r;

    free = PySet_New(NULL);
    global = PySet_New(NULL);

    r = analyze_block(st.top, NULL, free, global);
    return r;
}

/* symtable_enter_block() gets a reference via ste_new.
   This reference is released when the block is exited, via the DECREF
   in symtable_exit_block().
*/

function symtable_exit_block(st){
    var size;

    st.cur = NULL;
    size = PyList_GET_SIZE(st.stack);
    if (size) {
        if (PyList_SetSlice(st.stack, size - 1, size, NULL) < 0){
            return 0;
        }
        if (--size){
            st.cur = PyList_GET_ITEM(st.stack, size - 1);
        }
    }
    return 1;
}

function symtable_enter_block(st, name, block,
                     ast, lineno, col_offset,
                     end_lineno, end_col_offset){
    var prev = NULL, ste;

    ste = ste_new(st, name, block, ast, lineno, col_offset, end_lineno, end_col_offset);

    st.stack.push(ste)
    prev = st.cur;
    /* bpo-37757: For now, disallow *all* assignment expressions in the
     * outermost iterator expression of a comprehension, even those inside
     * a nested comprehension or a lambda expression.
     */
    if (prev) {
        ste.comp_iter_expr = prev.comp_iter_expr;
    }
    /* The entry is owned by the stack. Borrow it for st_cur. */
    st.cur = ste;

    /* Annotation blocks shouldn't have any affect on the symbol table since in
     * the compilation stage, they will all be transformed to strings. They are
     * only created if future 'annotations' feature is activated. */
    if (block === $B.ast.Annotation) {
        return 1;
    }

    if (block == $B.ast.Module){
        st.global = st.cur.symbols;
    }
    if (prev) {
        prev.children.append(ste)
    }
    return 1;
}

function symtable_lookup(st, name){
    var mangled = _Py_Mangle(st.private, name);
    if (!mangled){
        return 0;
    }
    var ret = _PyST_GetSymbol(st.cur, mangled);
    return ret;
}

function symtable_add_def_helper(st, name, flag, ste,
                        lineno, col_offset, end_lineno, end_col_offset){
    var o, dict, val, mangled = _Py_Mangle(st.private, name);

    if (!mangled){
        return 0;
    }
    dict = ste.symbols;
    try{
        o = _b_.dict.$getitem(dict, mangled)
        val = o
        if ((flag & DEF_PARAM) && (val & DEF_PARAM)) {
            /* Is it better to use 'mangled' or 'name' here? */
            PyErr_Format(PyExc_SyntaxError, DUPLICATE_ARGUMENT, name);
            PyErr_RangedSyntaxLocationObject(st.filename,
                                             lineno, col_offset + 1,
                                             end_lineno, end_col_offset + 1);
            return 0
        }
        val |= flag;
    }catch(err){
        val = flag;
    }
    if (ste.comp_iter_target) {
        /* This name is an iteration variable in a comprehension,
         * so check for a binding conflict with any named expressions.
         * Otherwise, mark it as an iteration variable so subsequent
         * named expressions can check for conflicts.
         */
        if (val & (DEF_GLOBAL | DEF_NONLOCAL)) {
            PyErr_Format(PyExc_SyntaxError,
                NAMED_EXPR_COMP_INNER_LOOP_CONFLICT, name);
            PyErr_RangedSyntaxLocationObject(st.filename,
                                             lineno, col_offset + 1,
                                             end_lineno, end_col_offset + 1);
            return 0
        }
        val |= DEF_COMP_ITER;
    }
    o = val
    if (o == NULL){
        return 0
    }
    dict[mangled] = o

    if (flag & DEF_PARAM) {
        if (PyList_Append(ste.varnames, mangled) < 0){
            return 0
        }
    } else if (flag & DEF_GLOBAL) {
        /* XXX need to update DEF_GLOBAL for other flags too;
           perhaps only DEF_FREE_GLOBAL */
        val = flag;
        if ((o = PyDict_GetItemWithError(st.global, mangled))) {
            val |= o
        }else if (PyErr_Occurred()) {
            return 0
        }
        o = val
        if (o == NULL){
            return 0
        }
        if (PyDict_SetItem(st.global, mangled, o) < 0) {
            return 0
        }
    }
    return 1;
}

function symtable_add_def(st, name, flag,
                 lineno, col_offset, end_lineno, end_col_offset){
    return symtable_add_def_helper(st, name, flag, st.cur,
                        lineno, col_offset, end_lineno, end_col_offset);
}

/* VISIT, VISIT_SEQ and VIST_SEQ_TAIL take an ASDL type as their second argument.
   They use the ASDL name to synthesize the name of the C type and the visit
   function.

   VISIT_SEQ_TAIL permits the start of an ASDL sequence to be skipped, which is
   useful if the first node in the sequence requires special treatment.

   VISIT_QUIT macro returns the specified value exiting from the function but
   first adjusts current recursion counter depth.
*/

function VISIT_QUIT(ST, X){
    return X
}

function VISIT(ST, TYPE, V){
    var f = eval(`symtable_visit_${TYPE}`)
    if (!f((ST), (V))){
        VISIT_QUIT((ST), 0);
    }
}

function VISIT_SEQ(ST, TYPE, SEQ) {
    var i
    var seq = SEQ; /* avoid variable capture */
    for (var elt of seq){
        if (! eval(`symtable_visit_${TYPE}`)((ST), elt)){
            VISIT_QUIT((ST), 0)
        }
    }
}

function VISIT_SEQ_TAIL(ST, TYPE, SEQ, START) {
    var i, seq = SEQ; /* avoid variable capture */
    for (i = (START); i < asdl_seq_LEN(seq); i++) {
        var elt = asdl_seq_GET(seq, i);
        if (! eval(`symtable_visit_${TYPE}`)((ST), elt)){
            VISIT_QUIT((ST), 0)
        }
    }
}

function VISIT_SEQ_WITH_NULL(ST, TYPE, SEQ) {
    var i = 0, seq = (SEQ); /* avoid variable capture */
    for (i = 0; i < asdl_seq_LEN(seq); i++) {
        var elt = asdl_seq_GET(seq, i);
        if (!elt) continue; /* can be NULL */
        if (! eval(`symtable_visit_${TYPE}`)((ST), elt)){
            VISIT_QUIT((ST), 0);
        }
    }
}

function symtable_record_directive(st, name, lineno,
                          col_offset, end_lineno, end_col_offset){
    var data, mangled, res;
    if (!st.cur.directives) {
        st.cur.directives = PyList_New(0);
    }
    mangled = _Py_Mangle(st.private, name);
    if (!mangled){
        return 0;
    }
    data = Py_BuildValue("(Niiii)", mangled, lineno, col_offset, end_lineno, end_col_offset);
    if (!data){
        return 0;
    }
    res = PyList_Append(st.cur.directives, data);
    return res == 0;
}


function symtable_visit_stmt(st, s){
    switch (s.constructor) {
    case $B.ast.FunctionDef:
        if (!symtable_add_def(st, s.v.FunctionDef.name, DEF_LOCAL, LOCATION(s)))
            VISIT_QUIT(st, 0);
        if (s.v.FunctionDef.args.defaults)
            VISIT_SEQ(st, expr, s.v.FunctionDef.args.defaults);
        if (s.v.FunctionDef.args.kw_defaults)
            VISIT_SEQ_WITH_NULL(st, expr, s.v.FunctionDef.args.kw_defaults);
        if (!symtable_visit_annotations(st, s, s.v.FunctionDef.args,
                                        s.v.FunctionDef.returns))
            VISIT_QUIT(st, 0);
        if (s.v.FunctionDef.decorator_list)
            VISIT_SEQ(st, expr, s.v.FunctionDef.decorator_list);
        if (!symtable_enter_block(st, s.v.FunctionDef.name,
                                  FunctionBlock, s,
                                  LOCATION(s)))
            VISIT_QUIT(st, 0);
        VISIT(st, 'arguments', s.v.FunctionDef.args);
        VISIT_SEQ(st, stmt, s.v.FunctionDef.body);
        if (!symtable_exit_block(st))
            VISIT_QUIT(st, 0);
        break;
    case $B.ast.ClassDef: {
        var tmp;
        if (!symtable_add_def(st, s.v.ClassDef.name, DEF_LOCAL, LOCATION(s)))
            VISIT_QUIT(st, 0);
        VISIT_SEQ(st, expr, s.v.ClassDef.bases);
        VISIT_SEQ(st, keyword, s.v.ClassDef.keywords);
        if (s.v.ClassDef.decorator_list)
            VISIT_SEQ(st, expr, s.v.ClassDef.decorator_list);
        if (!symtable_enter_block(st, s.v.ClassDef.name, ClassBlock,
                                  s, s.lineno, s.col_offset,
                                  s.end_lineno, s.end_col_offset))
            VISIT_QUIT(st, 0);
        tmp = st.private;
        st.private = s.v.ClassDef.name;
        VISIT_SEQ(st, stmt, s.v.ClassDef.body);
        st.private = tmp;
        if (!symtable_exit_block(st))
            VISIT_QUIT(st, 0);
        break;
    }
    case $B.ast.Return:
        if (s.v.Return.value) {
            VISIT(st, expr, s.v.Return.value);
            st.cur.returns_value = 1;
        }
        break;
    case $B.ast.Delete:
        VISIT_SEQ(st, expr, s.v.Delete.targets);
        break;
    case $B.ast.Assig:
        VISIT_SEQ(st, expr, s.v.Assign.targets);
        VISIT(st, expr, s.v.Assign.value);
        break;
    case $B.ast.AnnAssign:
        if (s.v.AnnAssign.target.kind == Name_kind) {
            var e_name = s.v.AnnAssign.target;
            var cur = symtable_lookup(st, e_name.v.Name.id);
            if (cur < 0) {
                VISIT_QUIT(st, 0);
            }
            if ((cur & (DEF_GLOBAL | DEF_NONLOCAL))
                && (st.cur.symbols != st.global)
                && s.v.AnnAssign.simple) {
                PyErr_Format(PyExc_SyntaxError,
                             cur & DEF_GLOBAL ? GLOBAL_ANNOT : NONLOCAL_ANNOT,
                             e_name.v.Name.id);
                PyErr_RangedSyntaxLocationObject(st.filename,
                                                 s.lineno,
                                                 s.col_offset + 1,
                                                 s.end_lineno,
                                                 s.end_col_offset + 1);
                VISIT_QUIT(st, 0);
            }
            if (s.v.AnnAssign.simple &&
                !symtable_add_def(st, e_name.v.Name.id,
                                  DEF_ANNOT | DEF_LOCAL, LOCATION(e_name))) {
                VISIT_QUIT(st, 0);
            }
            else {
                if (s.v.AnnAssign.value
                    && !symtable_add_def(st, e_name.v.Name.id, DEF_LOCAL, LOCATION(e_name))) {
                    VISIT_QUIT(st, 0);
                }
            }
        }
        else {
            VISIT(st, expr, s.v.AnnAssign.target);
        }
        if (!symtable_visit_annotation(st, s.v.AnnAssign.annotation)) {
            VISIT_QUIT(st, 0);
        }

        if (s.v.AnnAssign.value) {
            VISIT(st, expr, s.v.AnnAssign.value);
        }
        break;
    case $B.ast.AugAssign:
        VISIT(st, expr, s.v.AugAssign.target);
        VISIT(st, expr, s.v.AugAssign.value);
        break;
    case $B.ast.For:
        VISIT(st, expr, s.v.For.target);
        VISIT(st, expr, s.v.For.iter);
        VISIT_SEQ(st, stmt, s.v.For.body);
        if (s.v.For.orelse)
            VISIT_SEQ(st, stmt, s.v.For.orelse);
        break;
    case $B.ast.Whil:
        VISIT(st, expr, s.v.While.test);
        VISIT_SEQ(st, stmt, s.v.While.body);
        if (s.v.While.orelse)
            VISIT_SEQ(st, stmt, s.v.While.orelse);
        break;
    case $B.ast.If:
        /* XXX if 0: and lookup_yield() hacks */
        VISIT(st, expr, s.v.If.test);
        VISIT_SEQ(st, stmt, s.v.If.body);
        if (s.v.If.orelse)
            VISIT_SEQ(st, stmt, s.v.If.orelse);
        break;
    case $B.ast.Match:
        VISIT(st, expr, s.v.Match.subject);
        VISIT_SEQ(st, match_case, s.v.Match.cases);
        break;
    case $B.ast.Raise:
        if (s.v.Raise.exc) {
            VISIT(st, expr, s.v.Raise.exc);
            if (s.v.Raise.cause) {
                VISIT(st, expr, s.v.Raise.cause);
            }
        }
        break;
    case $B.ast.Try:
        VISIT_SEQ(st, stmt, s.v.Try.body);
        VISIT_SEQ(st, stmt, s.v.Try.orelse);
        VISIT_SEQ(st, excepthandler, s.v.Try.handlers);
        VISIT_SEQ(st, stmt, s.v.Try.finalbody);
        break;
    case $B.ast.TryStar:
        VISIT_SEQ(st, stmt, s.v.TryStar.body);
        VISIT_SEQ(st, stmt, s.v.TryStar.orelse);
        VISIT_SEQ(st, excepthandler, s.v.TryStar.handlers);
        VISIT_SEQ(st, stmt, s.v.TryStar.finalbody);
        break;
    case $B.ast.Assert:
        VISIT(st, expr, s.v.Assert.test);
        if (s.v.Assert.msg)
            VISIT(st, expr, s.v.Assert.msg);
        break;
    case $B.ast.Import:
        VISIT_SEQ(st, alias, s.v.Import.names);
        break;
    case $B.ast.ImportFrom:
        VISIT_SEQ(st, alias, s.v.ImportFrom.names);
        break;
    case $B.ast.Global:
        var i,
            seq = s.v.Global.names;
        for (i = 0; i < asdl_seq_LEN(seq); i++) {
            var name = asdl_seq_GET(seq, i);
            var cur = symtable_lookup(st, name);
            if (cur < 0)
                VISIT_QUIT(st, 0);
            if (cur & (DEF_PARAM | DEF_LOCAL | USE | DEF_ANNOT)) {
                var msg;
                if (cur & DEF_PARAM) {
                    msg = GLOBAL_PARAM;
                } else if (cur & USE) {
                    msg = GLOBAL_AFTER_USE;
                } else if (cur & DEF_ANNOT) {
                    msg = GLOBAL_ANNOT;
                } else {  /* DEF_LOCAL */
                    msg = GLOBAL_AFTER_ASSIGN;
                }
                PyErr_Format(PyExc_SyntaxError,
                             msg, name);
                PyErr_RangedSyntaxLocationObject(st.filename,
                                                 s.lineno,
                                                 s.col_offset + 1,
                                                 s.end_lineno,
                                                 s.end_col_offset + 1);
                VISIT_QUIT(st, 0);
            }
            if (!symtable_add_def(st, name, DEF_GLOBAL, LOCATION(s)))
                VISIT_QUIT(st, 0);
            if (!symtable_record_directive(st, name, s.lineno, s.col_offset,
                                           s.end_lineno, s.end_col_offset))
                VISIT_QUIT(st, 0);
        }
        break;

    case $B.ast.Nonlocal:
        var i,
            seq = s.v.Nonlocal.names;
        for (i = 0; i < asdl_seq_LEN(seq); i++) {
            var name = asdl_seq_GET(seq, i);
            var cur = symtable_lookup(st, name);
            if (cur < 0)
                VISIT_QUIT(st, 0);
            if (cur & (DEF_PARAM | DEF_LOCAL | USE | DEF_ANNOT)) {
                var msg;
                if (cur & DEF_PARAM) {
                    msg = NONLOCAL_PARAM;
                } else if (cur & USE) {
                    msg = NONLOCAL_AFTER_USE;
                } else if (cur & DEF_ANNOT) {
                    msg = NONLOCAL_ANNOT;
                } else {  /* DEF_LOCAL */
                    msg = NONLOCAL_AFTER_ASSIGN;
                }
                PyErr_Format(PyExc_SyntaxError, msg, name);
                PyErr_RangedSyntaxLocationObject(st.filename,
                                                 s.lineno,
                                                 s.col_offset + 1,
                                                 s.end_lineno,
                                                 s.end_col_offset + 1);
                VISIT_QUIT(st, 0);
            }
            if (!symtable_add_def(st, name, DEF_NONLOCAL, LOCATION(s)))
                VISIT_QUIT(st, 0);
            if (!symtable_record_directive(st, name, s.lineno, s.col_offset,
                                           s.end_lineno, s.end_col_offset))
                VISIT_QUIT(st, 0);
        }
        break;

    case $B.ast.Expr:
        VISIT(st, expr, s.v.Expr.value);
        break;
    case $B.ast.Pass:
    case $B.ast.Break:
    case $B.ast.Continue:
        /* nothing to do here */
        break;
    case $B.ast.With:
        VISIT_SEQ(st, 'withitem', s.items);
        VISIT_SEQ(st, stmt, s.body);
        break;
    case $B.ast.AsyncFunctionDef:
        if (!symtable_add_def(st, s.name, DEF_LOCAL, LOCATION(s)))
            VISIT_QUIT(st, 0);
        if (s.args.defaults)
            VISIT_SEQ(st, expr, s.args.defaults);
        if (s.args.kw_defaults)
            VISIT_SEQ_WITH_NULL(st, expr,
                                s.args.kw_defaults);
        if (!symtable_visit_annotations(st, s, s.args,
                                        s.returns))
            VISIT_QUIT(st, 0);
        if (s.decorator_list)
            VISIT_SEQ(st, expr, s.decorator_list);
        if (!symtable_enter_block(st, s.name,
                                  $B.ast.FunctionDef, s,
                                  s.lineno, s.col_offset,
                                  s.end_lineno, s.end_col_offset))
            VISIT_QUIT(st, 0);
        st.cur.coroutine = 1;
        VISIT(st, 'arguments', s.args);
        VISIT_SEQ(st, stmt, s.body);
        if (!symtable_exit_block(st))
            VISIT_QUIT(st, 0);
        break;
    case $B.ast.AsyncWith:
        VISIT_SEQ(st, withitem, s.items);
        VISIT_SEQ(st, stmt, s.body);
        break;
    case $B.ast.AsyncFor:
        VISIT(st, expr, s.v.AsyncFor.target);
        VISIT(st, expr, s.v.AsyncFor.iter);
        VISIT_SEQ(st, stmt, s.v.AsyncFor.body);
        if (s.v.AsyncFor.orelse)
            VISIT_SEQ(st, stmt, s.v.AsyncFor.orelse);
        break;
    }
    VISIT_QUIT(st, 1);
}

function symtable_extend_namedexpr_scope(st, e){
    assert(st.st_stack);
    assert(e.kind == Name_kind);

    var target_name = e.v.Name.id;
    var i, size, ste;
    size = PyList_GET_SIZE(st.stack);
    assert(size);

    /* Iterate over the stack in reverse and add to the nearest adequate scope */
    for (i = size - 1; i >= 0; i--) {
        ste = PyList_GET_ITEM(st.stack, i);

        /* If we find a comprehension scope, check for a target
         * binding conflict with iteration variables, otherwise skip it
         */
        if (ste.comprehension) {
            var target_in_scope = _PyST_GetSymbol(ste, target_name);
            if (target_in_scope & DEF_COMP_ITER) {
                PyErr_Format(PyExc_SyntaxError, NAMED_EXPR_COMP_CONFLICT, target_name);
                PyErr_RangedSyntaxLocationObject(st.filename,
                                                  e.lineno,
                                                  e.col_offset + 1,
                                                  e.end_lineno,
                                                  e.end_col_offset + 1);
                VISIT_QUIT(st, 0);
            }
            continue;
        }

        /* If we find a FunctionBlock entry, add as GLOBAL/LOCAL or NONLOCAL/LOCAL */
        if (ste.type == FunctionBlock) {
            var target_in_scope = _PyST_GetSymbol(ste, target_name);
            if (target_in_scope & DEF_GLOBAL) {
                if (!symtable_add_def(st, target_name, DEF_GLOBAL, LOCATION(e)))
                    VISIT_QUIT(st, 0);
            } else {
                if (!symtable_add_def(st, target_name, DEF_NONLOCAL, LOCATION(e)))
                    VISIT_QUIT(st, 0);
            }
            if (!symtable_record_directive(st, target_name, LOCATION(e)))
                VISIT_QUIT(st, 0);

            return symtable_add_def_helper(st, target_name, DEF_LOCAL, ste, LOCATION(e));
        }
        /* If we find a ModuleBlock entry, add as GLOBAL */
        if (ste.type == ModuleBlock) {
            if (!symtable_add_def(st, target_name, DEF_GLOBAL, LOCATION(e)))
                VISIT_QUIT(st, 0);
            if (!symtable_record_directive(st, target_name, LOCATION(e)))
                VISIT_QUIT(st, 0);

            return symtable_add_def_helper(st, target_name, DEF_GLOBAL, ste, LOCATION(e));
        }
        /* Disallow usage in ClassBlock */
        if (ste.type == ClassBlock) {
            PyErr_Format(PyExc_SyntaxError, NAMED_EXPR_COMP_IN_CLASS);
            PyErr_RangedSyntaxLocationObject(st.filename,
                                              e.lineno,
                                              e.col_offset + 1,
                                              e.end_lineno,
                                              e.end_col_offset + 1);
            VISIT_QUIT(st, 0);
        }
    }

    /* We should always find either a FunctionBlock, ModuleBlock or ClassBlock
       and should never fall to this case
    */
    assert(0);
    return 0;
}

function symtable_handle_namedexpr(st, e){
    if (st.cur.comp_iter_expr > 0) {
        /* Assignment isn't allowed in a comprehension iterable expression */
        PyErr_Format(PyExc_SyntaxError, NAMED_EXPR_COMP_ITER_EXPR);
        PyErr_RangedSyntaxLocationObject(st.filename,
                                          e.lineno,
                                          e.col_offset + 1,
                                          e.end_lineno,
                                          e.end_col_offset + 1);
        return 0;
    }
    if (st.cur.comprehension) {
        /* Inside a comprehension body, so find the right target scope */
        if (!symtable_extend_namedexpr_scope(st, e.v.NamedExpr.target))
            return 0;
    }
    VISIT(st, expr, e.v.NamedExpr.value);
    VISIT(st, expr, e.v.NamedExpr.target);
    return 1;
}

const expr = 'expr',
      stmt = 'stmt',
      withitem = 'withitem'

function symtable_visit_expr(st, e){

    switch (e.constructor) {
    case $B.ast.NamedExpr:
        if (!symtable_raise_if_annotation_block(st, "named expression", e)) {
            VISIT_QUIT(st, 0);
        }
        if(!symtable_handle_namedexpr(st, e))
            VISIT_QUIT(st, 0);
        break;
    case $B.ast.BoolOp:
        VISIT_SEQ(st, 'expr', e.values);
        break;
    case $B.ast.BinOp:
        VISIT(st, 'expr', e.left);
        VISIT(st, 'expr', e.right);
        break;
    case $B.ast.UnaryOp:
        VISIT(st, 'expr', e.operand);
        break;
    case $B.ast.Lambda: {
        if (!GET_IDENTIFIER('lambda'))
            VISIT_QUIT(st, 0);
        if (e.args.defaults)
            VISIT_SEQ(st, 'expr', e.args.defaults);
        if (e.args.kw_defaults)
            VISIT_SEQ_WITH_NULL(st, 'expr', e.args.kw_defaults);
        if (!symtable_enter_block(st, lambda,
                                  FunctionBlock, e,
                                  e.lineno, e.col_offset,
                                  e.end_lineno, e.end_col_offset))
            VISIT_QUIT(st, 0);
        VISIT(st, 'arguments', e.args);
        VISIT(st, 'expr', e.body);
        if (!symtable_exit_block(st))
            VISIT_QUIT(st, 0);
        break;
    }
    case $B.ast.IfExp:
        VISIT(st, 'expr', e.test);
        VISIT(st, 'expr', e.body);
        VISIT(st, 'expr', e.orelse);
        break;
    case $B.ast.Dict:
        VISIT_SEQ_WITH_NULL(st, 'expr', e.keys);
        VISIT_SEQ(st, 'expr', e.values);
        break;
    case $B.ast.Set:
        VISIT_SEQ(st, 'expr', e.elts);
        break;
    case $B.ast.GeneratorExp:
        if (!symtable_visit_genexp(st, e))
            VISIT_QUIT(st, 0);
        break;
    case $B.ast.ListComp:
        if (!symtable_visit_listcomp(st, e))
            VISIT_QUIT(st, 0);
        break;
    case $B.ast.SetComp:
        if (!symtable_visit_setcomp(st, e))
            VISIT_QUIT(st, 0);
        break;
    case $B.ast.DictComp:
        if (!symtable_visit_dictcomp(st, e))
            VISIT_QUIT(st, 0);
        break;
    case $B.ast.Yield:
        if (!symtable_raise_if_annotation_block(st, "yield expression", e)) {
            VISIT_QUIT(st, 0);
        }
        if (e.value)
            VISIT(st, 'expr', e.v.Yield.value);
        st.cur.generator = 1;
        if (st.cur.comprehension) {
            return symtable_raise_if_comprehension_block(st, e);
        }
        break;
    case $B.ast.YieldFrom:
        if (!symtable_raise_if_annotation_block(st, "yield expression", e)) {
            VISIT_QUIT(st, 0);
        }
        VISIT(st, 'expr', e.value);
        st.cur.generator = 1;
        if (st.cur.comprehension) {
            return symtable_raise_if_comprehension_block(st, e);
        }
        break;
    case $B.ast.Await:
        if (!symtable_raise_if_annotation_block(st, "await expression", e)) {
            VISIT_QUIT(st, 0);
        }
        VISIT(st, 'expr', e.value);
        st.cur.coroutine = 1;
        break;
    case $B.ast.Compare:
        VISIT(st, 'expr', e.left);
        VISIT_SEQ(st, 'expr', e.comparators);
        break;
    case $B.ast.Call:
        VISIT(st, 'expr', e.func);
        VISIT_SEQ(st, 'expr', e.args);
        VISIT_SEQ_WITH_NULL(st, 'keyword', e.keywords);
        break;
    case $B.ast.FormattedValue:
        VISIT(st, 'expr', e.value);
        if (e.format_spec)
            VISIT(st, 'expr', e.format_spec);
        break;
    case $B.ast.JoinedStr:
        VISIT_SEQ(st, 'expr', e.v.JoinedStr.values);
        break;
    case $B.ast.Constant:
        /* Nothing to do here. */
        break;
    /* The following exprs can be assignment targets. */
    case $B.ast.Attribute:
        VISIT(st, 'expr', e.value);
        break;
    case $B.ast.Subscript:
        VISIT(st, 'expr', e.value);
        VISIT(st, 'expr', e.slice);
        break;
    case $B.ast.Starred:
        VISIT(st, 'expr', e.value);
        break;
    case $B.ast.Slice:
        if (e.v.Slice.lower)
            VISIT(st, expr, e.lower)
        if (e.v.Slice.upper)
            VISIT(st, expr, e.upper)
        if (e.v.Slice.step)
            VISIT(st, expr, e.step)
        break;
    case $B.ast.Name:
        if (!symtable_add_def(st, e.id,
                              e.ctx instanceof $B.ast.Load ? USE : DEF_LOCAL, LOCATION(e)))
            VISIT_QUIT(st, 0);
        /* Special-case super: it counts as a use of __class__ */
        if (e.ctx instanceof $B.ast.Load &&
                st.cur.type === $B.ast.FunctionDef &&
                e.id == "super") {
            if (!GET_IDENTIFIER('__class__') ||
                !symtable_add_def(st, '__class__', USE, LOCATION(e)))
                VISIT_QUIT(st, 0);
        }
        break;
    /* child nodes of List and Tuple will have expr_context set */
    case $B.ast.List:
        VISIT_SEQ(st, expr, e.elts);
        break;
    case $B.ast.Tuple:
        VISIT_SEQ(st, expr, e.elts);
        break;
    }
    VISIT_QUIT(st, 1);
}

function symtable_visit_pattern(st, p){
    switch (p.kind) {
    case MatchValue_kind:
        VISIT(st, expr, p.v.MatchValue.value);
        break;
    case MatchSingleton_kind:
        /* Nothing to do here. */
        break;
    case MatchSequence_kind:
        VISIT_SEQ(st, pattern, p.v.MatchSequence.patterns);
        break;
    case MatchStar_kind:
        if (p.v.MatchStar.name) {
            symtable_add_def(st, p.v.MatchStar.name, DEF_LOCAL, LOCATION(p));
        }
        break;
    case MatchMapping_kind:
        VISIT_SEQ(st, expr, p.v.MatchMapping.keys);
        VISIT_SEQ(st, pattern, p.v.MatchMapping.patterns);
        if (p.v.MatchMapping.rest) {
            symtable_add_def(st, p.v.MatchMapping.rest, DEF_LOCAL, LOCATION(p));
        }
        break;
    case MatchClass_kind:
        VISIT(st, expr, p.v.MatchClass.cls);
        VISIT_SEQ(st, pattern, p.v.MatchClass.patterns);
        VISIT_SEQ(st, pattern, p.v.MatchClass.kwd_patterns);
        break;
    case MatchAs_kind:
        if (p.v.MatchAs.pattern) {
            VISIT(st, pattern, p.v.MatchAs.pattern);
        }
        if (p.v.MatchAs.name) {
            symtable_add_def(st, p.v.MatchAs.name, DEF_LOCAL, LOCATION(p));
        }
        break;
    case MatchOr_kind:
        VISIT_SEQ(st, pattern, p.v.MatchOr.patterns);
        break;
    }
    VISIT_QUIT(st, 1);
}

function symtable_implicit_arg(st, pos){
    var id = PyUnicode_FromFormat(".%d", pos);
    if (id == NULL)
        return 0;
    if (!symtable_add_def(st, id, DEF_PARAM, ST_LOCATION(st.cur))) {
        return 0;
    }
    return 1;
}

function symtable_visit_params(st, args){
    var i;

    if (!args)
        return -1;

    for (i = 0; i < asdl_seq_LEN(args); i++) {
        var arg = asdl_seq_GET(args, i);
        if (!symtable_add_def(st, arg.arg, DEF_PARAM, LOCATION(arg)))
            return 0;
    }

    return 1;
}

function symtable_visit_annotation(st, annotation){
    var future_annotations = st.future.ff_features & CO_FUTURE_ANNOTATIONS;
    if (future_annotations &&
        !symtable_enter_block(st, GET_IDENTIFIER(_annotation), AnnotationBlock,
                              annotation, annotation.lineno,
                              annotation.col_offset, annotation.end_lineno,
                              annotation.end_col_offset)) {
        VISIT_QUIT(st, 0);
    }
    VISIT(st, expr, annotation);
    if (future_annotations && !symtable_exit_block(st)) {
        VISIT_QUIT(st, 0);
    }
    return 1;
}

function symtable_visit_argannotations(st, args){
    var i;

    if (!args)
        return -1;

    for (i = 0; i < asdl_seq_LEN(args); i++) {
        var arg = asdl_seq_GET(args, i);
        if (arg.annotation)
            VISIT(st, expr, arg.annotation);
    }

    return 1;
}

function symtable_visit_annotations(st, o, a, returns){
    var future_annotations = st.future.ff_features & CO_FUTURE_ANNOTATIONS;
    if (future_annotations &&
        !symtable_enter_block(st, GET_IDENTIFIER(_annotation), AnnotationBlock,
                              o, o.lineno, o.col_offset, o.end_lineno,
                              o.end_col_offset)) {
        VISIT_QUIT(st, 0);
    }
    if (a.posonlyargs && !symtable_visit_argannotations(st, a.posonlyargs))
        return 0;
    if (a.args && !symtable_visit_argannotations(st, a.args))
        return 0;
    if (a.vararg && a.vararg.annotation)
        VISIT(st, expr, a.vararg.annotation);
    if (a.kwarg && a.kwarg.annotation)
        VISIT(st, expr, a.kwarg.annotation);
    if (a.kwonlyargs && !symtable_visit_argannotations(st, a.kwonlyargs))
        return 0;
    if (future_annotations && !symtable_exit_block(st)) {
        VISIT_QUIT(st, 0);
    }
    if (returns && !symtable_visit_annotation(st, returns)) {
        VISIT_QUIT(st, 0);
    }
    return 1;
}

function symtable_visit_arguments(st, a){
    /* skip default arguments inside function block
       XXX should ast be different?
    */
    if (a.posonlyargs && !symtable_visit_params(st, a.posonlyargs))
        return 0;
    if (a.args && !symtable_visit_params(st, a.args))
        return 0;
    if (a.kwonlyargs && !symtable_visit_params(st, a.kwonlyargs))
        return 0;
    if (a.vararg) {
        if (!symtable_add_def(st, a.vararg.arg, DEF_PARAM, LOCATION(a.vararg)))
            return 0;
        st.cur.varargs = 1;
    }
    if (a.kwarg) {
        if (!symtable_add_def(st, a.kwarg.arg, DEF_PARAM, LOCATION(a.kwarg)))
            return 0;
        st.cur.varkeywords = 1;
    }
    return 1;
}


function symtable_visit_excepthandler(st, eh){
    if (eh.v.ExceptHandler.type)
        VISIT(st, expr, eh.v.ExceptHandler.type);
    if (eh.v.ExceptHandler.name)
        if (!symtable_add_def(st, eh.v.ExceptHandler.name, DEF_LOCAL, LOCATION(eh)))
            return 0;
    VISIT_SEQ(st, stmt, eh.v.ExceptHandler.body);
    return 1;
}

function symtable_visit_withitem(st, item){
    VISIT(st, 'expr', item.context_expr);
    if (item.optional_vars) {
        VISIT(st, 'expr', item.optional_vars);
    }
    return 1;
}

function symtable_visit_match_case(st, m){
    VISIT(st, pattern, m.pattern);
    if (m.guard) {
        VISIT(st, expr, m.guard);
    }
    VISIT_SEQ(st, stmt, m.body);
    return 1;
}

function symtable_visit_alias(st, a){
    /* Compute store_name, the name actually bound by the import
       operation.  It is different than a->name when a->name is a
       dotted package name (e.g. spam.eggs)
    */
    var store_name,
        name = (a.asname == NULL) ? a.name : a.asname;
    var dot = PyUnicode_FindChar(name, '.', 0,
                                        PyUnicode_GET_LENGTH(name), 1);
    if (dot != -1) {
        store_name = PyUnicode_Substring(name, 0, dot);
        if (!store_name)
            return 0;
    }else{
        store_name = name;
    }
    if (name != "*") {
        var r = symtable_add_def(st, store_name, DEF_IMPORT, LOCATION(a));
        return r;
    }else {
        if (st.cur.type != ModuleBlock) {
            var lineno = a.lineno,
                col_offset = a.col_offset,
                end_lineno = a.end_lineno,
                end_col_offset = a.end_col_offset;
            PyErr_SetString(PyExc_SyntaxError, IMPORT_STAR_WARNING);
            PyErr_RangedSyntaxLocationObject(st.st_filename,
                                             lineno, col_offset + 1,
                                             end_lineno, end_col_offset + 1);
            return 0;
        }
        return 1;
    }
}


function symtable_visit_comprehension(st, lc){
    st.cur.comp_iter_target = 1;
    VISIT(st, expr, lc.target);
    st.cur.comp_iter_target = 0;
    st.cur.comp_iter_expr++;
    VISIT(st, expr, lc.iter);
    st.cur.comp_iter_expr--;
    VISIT_SEQ(st, expr, lc.ifs);
    if (lc.is_async) {
        st.cur.coroutine = 1;
    }
    return 1;
}


function symtable_visit_keyword(st, k){
    VISIT(st, expr, k.value);
    return 1;
}


function symtable_handle_comprehension(st, e,
                              scope_name, generators,
                              elt, value){
    var is_generator = (e.kind == GeneratorExp_kind);
    var outermost = asdl_seq_GET(generators, 0);
    /* Outermost iterator is evaluated in current scope */
    st.cur.comp_iter_expr++;
    VISIT(st, expr, outermost.iter);
    st.cur.comp_iter_expr--;
    /* Create comprehension scope for the rest */
    if (!scope_name ||
        !symtable_enter_block(st, scope_name, FunctionBlock, e,
                              e.lineno, e.col_offset,
                              e.end_lineno, e.end_col_offset)) {
        return 0;
    }
    switch(e.kind) {
        case ListComp_kind:
            st.cur.comprehension = ListComprehension;
            break;
        case SetComp_kind:
            st.cur.comprehension = SetComprehension;
            break;
        case DictComp_kind:
            st.cur.comprehension = DictComprehension;
            break;
        default:
            st.cur.comprehension = GeneratorExpression;
            break;
    }
    if (outermost.is_async) {
        st.cur.coroutine = 1;
    }

    /* Outermost iter is received as an argument */
    if (!symtable_implicit_arg(st, 0)) {
        symtable_exit_block(st);
        return 0;
    }
    /* Visit iteration variable target, and mark them as such */
    st.cur.comp_iter_target = 1;
    VISIT(st, expr, outermost.target);
    st.cur.comp_iter_target = 0;
    /* Visit the rest of the comprehension body */
    VISIT_SEQ(st, expr, outermost.ifs);
    VISIT_SEQ_TAIL(st, comprehension, generators, 1);
    if (value)
        VISIT(st, expr, value);
    VISIT(st, expr, elt);
    st.cur.generator = is_generator;
    var is_async = st.cur.coroutine && !is_generator;
    if (!symtable_exit_block(st)) {
        return 0;
    }
    if (is_async) {
        st.ur.coroutine = 1;
    }
    return 1;
}

function symtable_visit_genexp(st, e){
    return symtable_handle_comprehension(st, e, GET_IDENTIFIER(genexpr),
                                         e.v.GeneratorExp.generators,
                                         e.v.GeneratorExp.elt, NULL);
}

function symtable_visit_listcomp(st,e){
    return symtable_handle_comprehension(st, e, GET_IDENTIFIER(listcomp),
                                         e.v.ListComp.generators,
                                         e.v.ListComp.elt, NULL);
}

function symtable_visit_setcomp(st, e){
    return symtable_handle_comprehension(st, e, GET_IDENTIFIER(setcomp),
                                         e.v.SetComp.generators,
                                         e.v.SetComp.elt, NULL);
}

function symtable_visit_dictcomp(st, e){
    return symtable_handle_comprehension(st, e, GET_IDENTIFIER(dictcomp),
                                         e.v.DictComp.generators,
                                         e.v.DictComp.key,
                                         e.v.DictComp.value);
}

function symtable_raise_if_annotation_block(st, name, e){
    if (st.cur.type != AnnotationBlock) {
        return 1;
    }

    PyErr_Format(PyExc_SyntaxError, ANNOTATION_NOT_ALLOWED, name);
    PyErr_RangedSyntaxLocationObject(st.filename,
                                     e.lineno,
                                     e.col_offset + 1,
                                     e.end_lineno,
                                     e.end_col_offset + 1);
    return 0;
}

function symtable_raise_if_comprehension_block(st, e) {
    var type = st.cur.comprehension;
    PyErr_SetString(PyExc_SyntaxError,
            (type == ListComprehension) ? "'yield' inside list comprehension" :
            (type == SetComprehension) ? "'yield' inside set comprehension" :
            (type == DictComprehension) ? "'yield' inside dict comprehension" :
            "'yield' inside generator expression");
    PyErr_RangedSyntaxLocationObject(st.filename,
                                     e.lineno, e.col_offset + 1,
                                     e.end_lineno, e.end_col_offset + 1);
    VISIT_QUIT(st, 0);
}

function _Py_SymtableStringObjectFlags(str, filename,
                              start, flags){
    var st,
        mod,
        arena;

    arena = _PyArena_New();
    if (arena == NULL)
        return NULL;

    mod = _PyParser_ASTFromString(str, filename, start, flags, arena);
    if (mod == NULL) {
        _PyArena_Free(arena);
        return NULL;
    }
    var future = _PyFuture_FromAST(mod, filename);
    if (future == NULL) {
        _PyArena_Free(arena);
        return NULL;
    }
    future.features |= flags.cf_flags;
    st = _PySymtable_Build(mod, filename, future);
    PyObject_Free(future);
    _PyArena_Free(arena);
    return st;
}

})(__BRYTHON__)