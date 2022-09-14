(function($B){

var _b_ = $B.builtins

/* error strings used for warnings */
var GLOBAL_PARAM = "name '%s' is parameter and global",
    NONLOCAL_PARAM = "name '%s' is parameter and nonlocal",
    GLOBAL_AFTER_ASSIGN = "name '%s' is assigned to before global declaration",
    NONLOCAL_AFTER_ASSIGN = "name '%s' is assigned to before nonlocal declaration",
    GLOBAL_AFTER_USE = "name '%s' is used prior to global declaration",
    NONLOCAL_AFTER_USE = "name '%s' is used prior to nonlocal declaration",
    GLOBAL_ANNOT = "annotated name '%s' can't be global",
    NONLOCAL_ANNOT = "annotated name '%s' can't be nonlocal",
    IMPORT_STAR_WARNING = "import * only allowed at module level",
    NAMED_EXPR_COMP_IN_CLASS =
    "assignment expression within a comprehension cannot be used in a class body",
    NAMED_EXPR_COMP_CONFLICT =
    "assignment expression cannot rebind comprehension iteration variable '%s'",
    NAMED_EXPR_COMP_INNER_LOOP_CONFLICT =
    "comprehension inner loop cannot rebind assignment expression target '%s'",
    NAMED_EXPR_COMP_ITER_EXPR =
    "assignment expression cannot be used in a comprehension iterable expression",
    ANNOTATION_NOT_ALLOWED =
    "'%s' can not be used within an annotation",
    DUPLICATE_ARGUMENT = "duplicate argument '%s' in function definition"

/* Flags for def-use information */

var DEF_GLOBAL = 1,           /* global stmt */
    DEF_LOCAL = 2 ,           /* assignment in code block */
    DEF_PARAM = 2<<1,         /* formal parameter */
    DEF_NONLOCAL = 2<<2,      /* nonlocal stmt */
    USE = 2<<3 ,              /* name is used */
    DEF_FREE = 2<<4 ,         /* name used but not defined in nested block */
    DEF_FREE_CLASS = 2<<5,    /* free variable from class's method */
    DEF_IMPORT = 2<<6,        /* assignment occurred via import */
    DEF_ANNOT = 2<<7,         /* this name is annotated */
    DEF_COMP_ITER = 2<<8     /* this name is a comprehension iteration variable */

var DEF_BOUND = DEF_LOCAL | DEF_PARAM | DEF_IMPORT

/* GLOBAL_EXPLICIT and GLOBAL_IMPLICIT are used internally by the symbol
   table.  GLOBAL is returned from PyST_GetScope() for either of them.
   It is stored in ste_symbols at bits 12-15.
*/
var SCOPE_OFFSET = 11,
    SCOPE_MASK = (DEF_GLOBAL | DEF_LOCAL | DEF_PARAM | DEF_NONLOCAL)

var LOCAL = 1,
    GLOBAL_EXPLICIT = 2,
    GLOBAL_IMPLICIT = 3,
    FREE = 4,
    CELL = 5

var GENERATOR = 1,
    GENERATOR_EXPRESSION = 2

var CO_FUTURE_ANNOTATIONS = 0x1000000 // CPython Include/code.h

var TYPE_CLASS = 1,
    TYPE_FUNCTION = 0,
    TYPE_MODULE = 2

var NULL = undefined

var ModuleBlock = 2,
    ClassBlock = 1,
    FunctionBlock = 0,
    AnnotationBlock = 4

var PyExc_SyntaxError = _b_.SyntaxError

function assert(test){
    if(! $B.$bool(test)){
        console.log('test fails', test)
        throw Error('test fails')
    }
}

function LOCATION(x){
    // (x)->lineno, (x)->col_offset, (x)->end_lineno, (x)->end_col_offset
    return [x.lineno, x.col_offset, x.end_lineno, x.end_col_offset]
}

function ST_LOCATION(x){
    // (x)->ste_lineno, (x)->ste_col_offset, (x)->ste_end_lineno, (x)->ste_end_col_offset
    return [x.lineno, x.col_offset, x.end_lineno, x.end_col_offset]
}


function _Py_Mangle(privateobj, ident){
    /* Name mangling: __private becomes _classname__private.
       This is independent from how the name is used. */
    var result,
        nlen, plen, ipriv,
        maxchar;
    if (privateobj == NULL || ! ident.startsWith('__')) {
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

    if (ident.endsWith('__') || ident.search(/\./) != -1) {
        return ident; /* Don't mangle __whatever__ */
    }
    /* Strip leading underscores from class name */
    ipriv = 0;
    while (privateobj[ipriv] == '_')
        ipriv++;
    if (ipriv == plen) {
        return ident; /* Don't mangle if class is just underscores */
    }
    var prefix = privateobj.substr(ipriv)
    return '_' + prefix + ident
}

var top = NULL,
    lambda = NULL,
    genexpr = NULL,
    listcomp = NULL,
    setcomp = NULL,
    dictcomp = NULL,
    __class__ = NULL,
    _annotation = NULL

var NoComprehension = 0,
    ListComprehension = 1,
    DictComprehension = 2,
    SetComprehension = 3,
    GeneratorExpression = 4

var internals = {}

function GET_IDENTIFIER(VAR){
    return VAR
}

function Symtable(){

    this.filename = NULL;

    this.stack = []
    this.blocks = new Map()
    this.cur = NULL;
    this.private = NULL;

}

function ste_new(st, name, block,
        key, lineno, col_offset,
        end_lineno, end_col_offset){

    var ste

    ste = {
        table: st,
        id: _b_.id(key), /* ste owns reference to AST object */
        name: name,

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
    if(st.cur != NULL &&
            (st.cur.nested ||
             st.cur.type == FunctionBlock)){
        ste.nested = 1;
    }
    ste.child_free = 0
    ste.generator = 0
    ste.coroutine = 0
    ste.comprehension = NoComprehension
    ste.returns_value = 0
    ste.needs_class_closure = 0
    ste.comp_iter_target = 0
    ste.comp_iter_expr = 0

    ste.symbols = $B.empty_dict()
    ste.varnames = []
    ste.children = []

    st.blocks.set(ste.id, ste)

    return ste
}


$B._PySymtable_Build = function(mod, filename, future){
    var st = new Symtable(),
        seq
    st.filename = filename;
    st.future = future || {}
    st.type = TYPE_MODULE

    /* Make the initial symbol information gathering pass */
    if(!symtable_enter_block(st, 'top', ModuleBlock, mod, 0, 0, 0, 0)){
        return NULL;
    }

    st.top = st.cur
    switch(mod.constructor){
        case $B.ast.Module:
            seq = mod.body
            for(var item of seq){
                symtable_visit_stmt(st, item)
            }
            break
        case $B.ast.Expression:
            symtable_visit_expr(st, mod.body)
            break
        case $B.ast.Interactive:
            seq = mod.body
            for(var item of seq){
                symtable_visit_stmt(st, item)
            }
            break
    }

    /* Make the second symbol analysis pass */
    symtable_analyze(st)

    return st.top;
}

function PySymtable_Lookup(st, key){
    var v = st.blocks.get(key)
    if(v){
        assert(PySTEntry_Check(v))
    }
    return v
}

function _PyST_GetSymbol(ste, name){
    if(! ste.symbols.$string_dict.hasOwnProperty(name)){
        return 0
    }
    return ste.symbols.$string_dict[name][0]
}

function PyErr_Format(exc_type, message, arg){
    if(arg){
        message = _b_.str.__mod__(message, arg)
    }
    return exc_type.$factory(message)
}

function PyErr_SetString(exc_type, message){
    return exc_type.$factory(message)
}

function set_exc_info(exc, filename, lineno, offset, end_lineno, end_offset){
    exc.filename = filename
    exc.lineno = lineno
    exc.offset = offset + 1
    exc.end_lineno = end_lineno
    exc.end_offset = end_offset + 1
    var src = $B.file_cache[filename]
    if(src !== undefined){
        var lines = src.split('\n')
        exc.text = lines[lineno - 1]
    }else{
        exc.text = ''
    }
    exc.args[1] = [filename, exc.lineno, exc.offset, exc.text,
                   exc.end_lineno, exc.end_offset]
}

function error_at_directive(exc, ste, name){
    var data
    assert(ste.directives)
    for (var data of ste.directives) {
        if(data[0] == name){
            set_exc_info(exc, ste.table.filename,
                data[1], data[2], data[3], data[4])
            return 0
        }
    }
    PyErr_SetString(PyExc_RuntimeError,
                    "BUG: internal directive bookkeeping broken")
    return 0
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
    DICT[NAME] = I
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
            var exc = PyErr_Format(_b_.SyntaxError,
                         "name '%s' is nonlocal and global",
                         name)
            error_at_directive(exc, ste, name)
            throw exc
        }
        SET_SCOPE(scopes, name, GLOBAL_EXPLICIT)
        global.add(name)
        if (bound){
            bound.delete(name)
        }
        return 1
    }
    if (flags & DEF_NONLOCAL) {
        if (!bound) {
            var exc = PyErr_Format(_b_.SyntaxError,
                         "nonlocal declaration not allowed at module level");
            error_at_directive(exc, ste, name)
            throw exc
        }
        if (! bound.has(name)) {
            var exc = PyErr_Format(_b_.SyntaxError,
                "no binding for nonlocal '%s' found", name)
            error_at_directive(exc, ste, name)
            throw exc
        }
        SET_SCOPE(scopes, name, FREE)
        ste.free = 1
        free.add(name)
        return 1
    }
    if (flags & DEF_BOUND) {
        SET_SCOPE(scopes, name, LOCAL)
        local.add(name)
        global.delete(name)
        return 1
    }
    /* If an enclosing block has a binding for this name, it
       is a free variable rather than a global variable.
       Note that having a non-NULL bound implies that the block
       is nested.
    */
    if (bound && bound.has(name)) {
        SET_SCOPE(scopes, name, FREE)
        ste.free = 1
        free.add(name)
        return 1
    }
    /* If a parent has a global statement, then call it global
       explicit?  It could also be global implicit.
     */
    if (global && global.has(name)) {
        SET_SCOPE(scopes, name, GLOBAL_IMPLICIT)
        return 1
    }
    if (ste.nested){
        ste.free = 1
    }
    SET_SCOPE(scopes, name, GLOBAL_IMPLICIT)
    return 1
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
    for(var name in scopes){
        v = scopes[name]
        //assert(PyLong_Check(v));
        scope = v;
        if (scope != LOCAL){
            continue;
        }
        if (free.has(name)){
            continue;
        }
        /* Replace LOCAL with CELL for this name, and remove
           from free. It is safe to replace the value of name
           in the dict, because it will not cause a resize.
         */
        scopes[name] = v_cell
        free.delete(name)
    }
    return 1
}

function drop_class_free(ste, free){
    var res = free.delete('__class__')
    if(res){
        ste.needs_class_closure = 1
    }
    return 1
}

/* Enter the final scope information into the ste_symbols dict.
 *
 * All arguments are dicts.  Modifies symbols, others are read-only.
*/
function update_symbols(symbols, scopes, bound, free, classflag){
    var name,
        itr,
        v,
        v_scope,
        v_new,
        v_free,
        pos = 0

    /* Update scope information for all symbols in this scope */
    for(var name in symbols.$string_dict){
        var flags = symbols.$string_dict[name][0]
        v_scope = scopes[name]
        var scope = v_scope
        flags |= (scope << SCOPE_OFFSET)
        v_new = flags
        if (!v_new){
            return 0;
        }
        symbols.$string_dict[name][0] = v_new
    }

    /* Record not yet resolved free variables from children (if any) */
    v_free = FREE << SCOPE_OFFSET
    itr = _b_.iter(free)
    var next_func = $B.$getattr(itr, '__next__')

    while (true) {
        try{
            name = next_func()
        }catch(err){
            break
        }
        v = symbols.$string_dict[name][0]

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
                symbols.$string_dict[name][0] = v_new
            }
            /* It's a cell, or already free in this scope */
            continue;
        }
        /* Handle global symbol */
        if (bound && !bound.has(name)) {
            continue;       /* it's a global */
        }
        /* Propagate new free symbol up the lexical stack */
        symbols.$string_dict[name][0] = v_free
    }

    return 1

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

    local = new Set()  /* collect new names bound in block */
    scopes = {}  /* collect scopes defined for each name */

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
    newglobal = new Set()
    newfree = new Set()
    newbound = new Set()

    /* Class namespace has no effect on names visible in
       nested functions, so populate the global and bound
       sets to be passed to child blocks before analyzing
       this one.
     */
    if (ste.type === ClassBlock) {
        /* Pass down known globals */
        Set_Union(newglobal, global)

        /* Pass down previously bound symbols */
        if (bound) {
            Set_Union(newbound, bound)
        }
    }

    for(var name in ste.symbols.$string_dict){
        var flags = ste.symbols.$string_dict[name][0]
        if (!analyze_name(ste, scopes, name, flags,
                          bound, local, free, global)){
            return 0
        }
    }


    /* Populate global and bound sets to be passed to children. */
    if (ste.type != ClassBlock) {
        /* Add function locals to bound set */
        if (ste.type == FunctionBlock) {
            Set_Union(newbound, local);
        }
        /* Pass down previously bound symbols */
        if (bound) {
            Set_Union(newbound, bound)
        }
        /* Pass down known globals */
        Set_Union(newglobal, global);

    }else{
        /* Special-case __class__ */
        newbound.add('__class__')
    }

    /* Recursively call analyze_child_block() on each child block.

       newbound, newglobal now contain the names visible in
       nested blocks.  The free variables in the children will
       be collected in allfree.
    */
    allfree = new Set()

    for (var c of ste.children){
        var entry = c
        if (! analyze_child_block(entry, newbound, newfree, newglobal,
                                 allfree)){
            return 0
        }
        /* Check if any children have free variables */
        if (entry.free || entry.child_free){
            ste.child_free = 1
        }
    }

    Set_Union(newfree, allfree)

    /* Check if any local variables must be converted to cell variables */
    if (ste.type === FunctionBlock && !analyze_cells(scopes, newfree)){
        return 0
    }else if (ste.type === ClassBlock && !drop_class_free(ste, newfree)){
        return 0
    }
    /* Records the results of the analysis in the symbol table entry */
    if (!update_symbols(ste.symbols, scopes, bound, newfree,
                        ste.type === ClassBlock)){
        return 0
    }
    Set_Union(free, newfree)

    success = 1
    return success
}

function PySet_New(arg){
    if(arg === NULL){
        return new Set()
    }
    return new Set(arg)
}

function Set_Union(setA, setB) {
    for (let elem of setB) {
        setA.add(elem)
    }
}

function analyze_child_block(entry, bound, free,
                    global, child_free){
    /* Copy the bound and global dictionaries.

       These dictionaries are used by all blocks enclosed by the
       current block.  The analyze_block() call modifies these
       dictionaries.

    */
    var temp_bound = PySet_New(bound),
        temp_free = PySet_New(free),
        temp_global = PySet_New(global)

    if (!analyze_block(entry, temp_bound, temp_free, temp_global)){
        return 0
    }
    Set_Union(child_free, temp_free);
    return 1;
}

function symtable_analyze(st){
    var free = new Set(),
        global = new Set()

    return analyze_block(st.top, NULL, free, global);
}

/* symtable_enter_block() gets a reference via ste_new.
   This reference is released when the block is exited, via the DECREF
   in symtable_exit_block().
*/

function symtable_exit_block(st){
    var size = st.stack.length

    st.cur = NULL;
    if (size) {
        st.stack.pop()
        if (--size){
            st.cur = st.stack[size - 1]
        }
    }
    return 1
}

function symtable_enter_block(st, name, block,
                     ast, lineno, col_offset,
                     end_lineno, end_col_offset){
    var prev
    var ste = ste_new(st, name, block, ast,
                      lineno, col_offset, end_lineno, end_col_offset)

    st.stack.push(ste)
    prev = st.cur
    /* bpo-37757: For now, disallow *all* assignment expressions in the
     * outermost iterator expression of a comprehension, even those inside
     * a nested comprehension or a lambda expression.
     */
    if (prev) {
        ste.comp_iter_expr = prev.comp_iter_expr
    }
    /* The entry is owned by the stack. Borrow it for st_cur. */
    st.cur = ste

    /* Annotation blocks shouldn't have any affect on the symbol table since in
     * the compilation stage, they will all be transformed to strings. They are
     * only created if future 'annotations' feature is activated. */
    if (block === AnnotationBlock) {
        return 1
    }

    if (block === ModuleBlock){
        st.global = st.cur.symbols
    }
    if (prev) {
        prev.children.push(ste)
    }
    return 1;
}

function symtable_lookup(st, name){
    var mangled = _Py_Mangle(st.private, name)
    if (!mangled){
        return 0;
    }
    var ret = _PyST_GetSymbol(st.cur, mangled)
    return ret;
}

function symtable_add_def_helper(st, name, flag, ste, _location){

    var o, dict, val, mangled = _Py_Mangle(st.private, name)

    if (!mangled){
        return 0
    }
    dict = ste.symbols
    if(dict.$string_dict.hasOwnProperty(mangled)){
        o = dict.$string_dict[mangled][0]
        val = o
        if ((flag & DEF_PARAM) && (val & DEF_PARAM)) {
            /* Is it better to use 'mangled' or 'name' here? */
            var exc = PyErr_Format(_b_.SyntaxError, DUPLICATE_ARGUMENT, name);
            set_exc_info(exc, st.filename, ..._location)
            throw exc
        }
        val |= flag
    }else{
        val = flag
    }
    if (ste.comp_iter_target) {
        /* This name is an iteration variable in a comprehension,
         * so check for a binding conflict with any named expressions.
         * Otherwise, mark it as an iteration variable so subsequent
         * named expressions can check for conflicts.
         */
        if (val & (DEF_GLOBAL | DEF_NONLOCAL)) {
            var exc = PyErr_Format(_b_.SyntaxError,
                NAMED_EXPR_COMP_INNER_LOOP_CONFLICT, name);
            set_exc_info(exc, st.filename, ..._location)
            throw exc
        }
        val |= DEF_COMP_ITER
    }
    o = val
    if (o == NULL){
        return 0
    }
    _b_.dict.$setitem(dict, mangled, o)

    if (flag & DEF_PARAM) {
        ste.varnames.push(mangled)
    } else if (flag & DEF_GLOBAL) {
        /* XXX need to update DEF_GLOBAL for other flags too;
           perhaps only DEF_FREE_GLOBAL */
        val = flag
        if (st.global.hasOwnProperty(mangled)){ // (o = PyDict_GetItemWithError(st.global, mangled))) {
            val |= st.global[mangled]
        }
        o = val
        if (o == NULL){
            return 0
        }
        st.global[mangled] = o
    }
    return 1
}

function symtable_add_def(st, name, flag, _location){
    return symtable_add_def_helper(st, name, flag, st.cur, _location);
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
    if (!f(ST, V)){
        VISIT_QUIT(ST, 0);
    }
}

function VISIT_SEQ(ST, TYPE, SEQ) {
    for (var elt of SEQ){
        if (! eval(`symtable_visit_${TYPE}`)(ST, elt)){
            VISIT_QUIT(ST, 0)
        }
    }
}

function VISIT_SEQ_TAIL(ST, TYPE, SEQ, START) {
    for (var i = START, len = SEQ.length; i < len; i++) {
        var elt = SEQ[i];
        if (! eval(`symtable_visit_${TYPE}`)((ST), elt)){
            VISIT_QUIT(ST, 0)
        }
    }
}

function VISIT_SEQ_WITH_NULL(ST, TYPE, SEQ) {
    for (var elt of SEQ) {
        if(! elt){
            continue /* can be NULL */
        }
        if(! eval(`symtable_visit_${TYPE}`)(ST, elt)){
            VISIT_QUIT((ST), 0)
        }
    }
}

function symtable_record_directive(st, name, lineno,
                          col_offset, end_lineno, end_col_offset){
    var data, mangled, res;
    if (!st.cur.directives) {
        st.cur.directives = []
    }
    mangled = _Py_Mangle(st.private, name);
    if (!mangled){
        return 0;
    }
    data = $B.fast_tuple([mangled, lineno, col_offset, end_lineno, end_col_offset])
    st.cur.directives.push(data);
    return true
}


function symtable_visit_stmt(st, s){
    switch (s.constructor) {
    case $B.ast.FunctionDef:
        if (!symtable_add_def(st, s.name, DEF_LOCAL, LOCATION(s)))
            VISIT_QUIT(st, 0)
        if (s.args.defaults)
            VISIT_SEQ(st, expr, s.args.defaults)
        if (s.args.kw_defaults)
            VISIT_SEQ_WITH_NULL(st, expr, s.args.kw_defaults)
        if (!symtable_visit_annotations(st, s, s.args,
                                        s.returns))
            VISIT_QUIT(st, 0)
        if(s.decorator_list){
            VISIT_SEQ(st, expr, s.decorator_list)
        }
        if (!symtable_enter_block(st, s.name,
                                  FunctionBlock, s,
                                  ...LOCATION(s))){
            VISIT_QUIT(st, 0)
        }
        VISIT(st, 'arguments', s.args)
        VISIT_SEQ(st, stmt, s.body)
        if(!symtable_exit_block(st)){
            VISIT_QUIT(st, 0)
        }
        break;
    case $B.ast.ClassDef:
        var tmp;
        if (!symtable_add_def(st, s.name, DEF_LOCAL, LOCATION(s)))
            VISIT_QUIT(st, 0)
        VISIT_SEQ(st, expr, s.bases)
        VISIT_SEQ(st, keyword, s.keywords)
        if (s.decorator_list)
            VISIT_SEQ(st, expr, s.decorator_list);
        if (!symtable_enter_block(st, s.name, ClassBlock,
                                  s, s.lineno, s.col_offset,
                                  s.end_lineno, s.end_col_offset))
            VISIT_QUIT(st, 0)
        tmp = st.private
        st.private = s.name
        VISIT_SEQ(st, stmt, s.body)
        st.private = tmp
        if(! symtable_exit_block(st))
            VISIT_QUIT(st, 0)
        break
    case $B.ast.Return:
        if(s.value){
            VISIT(st, expr, s.value)
            st.cur.returns_value = 1
        }
        break
    case $B.ast.Delete:
        VISIT_SEQ(st, expr, s.targets)
        break
    case $B.ast.Assign:
        VISIT_SEQ(st, expr, s.targets)
        VISIT(st, expr, s.value)
        break
    case $B.ast.AnnAssign:
        if(s.target instanceof $B.ast.Name){
            var e_name = s.target
            var cur = symtable_lookup(st, e_name.id)
            if (cur < 0) {
                VISIT_QUIT(st, 0)
            }
            if((cur & (DEF_GLOBAL | DEF_NONLOCAL))
                    && (st.cur.symbols != st.global)
                    && s.simple){
                var exc = PyErr_Format(_b_.SyntaxError,
                             cur & DEF_GLOBAL ? GLOBAL_ANNOT : NONLOCAL_ANNOT,
                             e_name.id)
                exc.args[1] = [st.filename,
                               s.lineno,
                               s.col_offset + 1,
                               s.end_lineno,
                               s.end_col_offset + 1]
                throw exc
            }
            if(s.simple &&
               ! symtable_add_def(st, e_name.id,
                                  DEF_ANNOT | DEF_LOCAL, LOCATION(e_name))){
                VISIT_QUIT(st, 0)
            }else{
                if(s.value
                    && !symtable_add_def(st, e_name.id, DEF_LOCAL, LOCATION(e_name))){
                    VISIT_QUIT(st, 0)
                }
            }
        }else{
            VISIT(st, expr, s.target)
        }
        if(!symtable_visit_annotation(st, s.annotation)){
            VISIT_QUIT(st, 0)
        }

        if(s.value){
            VISIT(st, expr, s.value)
        }
        break
    case $B.ast.AugAssign:
        VISIT(st, expr, s.target)
        VISIT(st, expr, s.value)
        break
    case $B.ast.For:
        VISIT(st, expr, s.target)
        VISIT(st, expr, s.iter)
        VISIT_SEQ(st, stmt, s.body)
        if(s.orelse){
            VISIT_SEQ(st, stmt, s.orelse)
        }
        break
    case $B.ast.While:
        VISIT(st, expr, s.test)
        VISIT_SEQ(st, stmt, s.body)
        if (s.orelse){
            VISIT_SEQ(st, stmt, s.orelse)
        }
        break
    case $B.ast.If:
        /* XXX if 0: and lookup_yield() hacks */
        VISIT(st, expr, s.test)
        VISIT_SEQ(st, stmt, s.body)
        if (s.orelse){
            VISIT_SEQ(st, stmt, s.orelse)
        }
        break
    case $B.ast.Match:
        VISIT(st, expr, s.subject)
        VISIT_SEQ(st, match_case, s.cases)
        break
    case $B.ast.Raise:
        if(s.exc){
            VISIT(st, expr, s.exc)
            if(s.cause){
                VISIT(st, expr, s.cause)
            }
        }
        break
    case $B.ast.Try:
        VISIT_SEQ(st, stmt, s.body)
        VISIT_SEQ(st, stmt, s.orelse)
        VISIT_SEQ(st, excepthandler, s.handlers)
        VISIT_SEQ(st, stmt, s.finalbody)
        break
    case $B.ast.TryStar:
        VISIT_SEQ(st, stmt, s.body)
        VISIT_SEQ(st, stmt, s.orelse)
        VISIT_SEQ(st, excepthandler, s.handlers)
        VISIT_SEQ(st, stmt, s.finalbody)
        break
    case $B.ast.Assert:
        VISIT(st, expr, s.test)
        if(s.msg){
            VISIT(st, expr, s.msg);
        }
        break
    case $B.ast.Import:
        VISIT_SEQ(st, alias, s.names)
        break
    case $B.ast.ImportFrom:
        VISIT_SEQ(st, alias, s.names)
        break
    case $B.ast.Global:
        var seq = s.names
        for(var name of seq){
            var cur = symtable_lookup(st, name)
            if(cur < 0){
                VISIT_QUIT(st, 0)
            }
            if(cur & (DEF_PARAM | DEF_LOCAL | USE | DEF_ANNOT)){
                var msg
                if(cur & DEF_PARAM){
                    msg = GLOBAL_PARAM
                }else if(cur & USE){
                    msg = GLOBAL_AFTER_USE
                }else if(cur & DEF_ANNOT) {
                    msg = GLOBAL_ANNOT
                }else{  /* DEF_LOCAL */
                    msg = GLOBAL_AFTER_ASSIGN
                }
                var exc = PyErr_Format(_b_.SyntaxError, msg, name)
                set_exc_info(exc, st.filename, s.lineno, s.col_offset,
                               s.end_lineno, s.end_col_offset)
                throw exc
            }
            if(! symtable_add_def(st, name, DEF_GLOBAL, LOCATION(s)))
                VISIT_QUIT(st, 0)
            if(! symtable_record_directive(st, name, s.lineno, s.col_offset,
                                           s.end_lineno, s.end_col_offset))
                VISIT_QUIT(st, 0)
        }
        break

    case $B.ast.Nonlocal:
        var seq = s.names;
        for (var name of seq) {
            var cur = symtable_lookup(st, name)
            if(cur < 0){
                VISIT_QUIT(st, 0)
            }
            if(cur & (DEF_PARAM | DEF_LOCAL | USE | DEF_ANNOT)){
                var msg
                if(cur & DEF_PARAM){
                    msg = NONLOCAL_PARAM
                }else if(cur & USE) {
                    msg = NONLOCAL_AFTER_USE
                }else if(cur & DEF_ANNOT) {
                    msg = NONLOCAL_ANNOT
                }else{  /* DEF_LOCAL */
                    msg = NONLOCAL_AFTER_ASSIGN
                }
                var exc = PyErr_Format(_b_.SyntaxError, msg, name)
                set_exc_info(exc, st.filename, s.lineno, s.col_offset,
                               s.end_lineno, s.end_col_offset)
                throw exc
            }
            if (!symtable_add_def(st, name, DEF_NONLOCAL, LOCATION(s)))
                VISIT_QUIT(st, 0)
            if (!symtable_record_directive(st, name, s.lineno, s.col_offset,
                                           s.end_lineno, s.end_col_offset))
                VISIT_QUIT(st, 0)
        }
        break

    case $B.ast.Expr:
        VISIT(st, expr, s.value)
        break
    case $B.ast.Pass:
    case $B.ast.Break:
    case $B.ast.Continue:
        /* nothing to do here */
        break
    case $B.ast.With:
        VISIT_SEQ(st, 'withitem', s.items)
        VISIT_SEQ(st, stmt, s.body)
        break
    case $B.ast.AsyncFunctionDef:
        if (!symtable_add_def(st, s.name, DEF_LOCAL, LOCATION(s)))
            VISIT_QUIT(st, 0)
        if (s.args.defaults)
            VISIT_SEQ(st, expr, s.args.defaults)
        if (s.args.kw_defaults)
            VISIT_SEQ_WITH_NULL(st, expr,
                                s.args.kw_defaults)
        if (!symtable_visit_annotations(st, s, s.args,
                                        s.returns))
            VISIT_QUIT(st, 0)
        if (s.decorator_list)
            VISIT_SEQ(st, expr, s.decorator_list)
        if (!symtable_enter_block(st, s.name,
                                  FunctionBlock, s,
                                  s.lineno, s.col_offset,
                                  s.end_lineno, s.end_col_offset))
            VISIT_QUIT(st, 0)
        st.cur.coroutine = 1
        VISIT(st, 'arguments', s.args)
        VISIT_SEQ(st, stmt, s.body)
        if(! symtable_exit_block(st))
            VISIT_QUIT(st, 0)
        break
    case $B.ast.AsyncWith:
        VISIT_SEQ(st, withitem, s.items)
        VISIT_SEQ(st, stmt, s.body)
        break
    case $B.ast.AsyncFor:
        VISIT(st, expr, s.target)
        VISIT(st, expr, s.iter)
        VISIT_SEQ(st, stmt, s.body)
        if(s.orelse){
            VISIT_SEQ(st, stmt, s.orelse)
        }
        break
    }
    VISIT_QUIT(st, 1)
}

function symtable_extend_namedexpr_scope(st, e){
    assert(st.stack);
    assert(e instanceof $B.ast.Name);

    var target_name = e.id;
    var i, size, ste;
    size = st.stack.length
    assert(size);

    /* Iterate over the stack in reverse and add to the nearest adequate scope */
    for (i = size - 1; i >= 0; i--) {
        ste = st.stack[i]

        /* If we find a comprehension scope, check for a target
         * binding conflict with iteration variables, otherwise skip it
         */
        if (ste.comprehension) {
            var target_in_scope = _PyST_GetSymbol(ste, target_name);
            if(target_in_scope & DEF_COMP_ITER){
                var exc = PyErr_Format(_b_.SyntaxError, NAMED_EXPR_COMP_CONFLICT, target_name);
                set_exc_info(exc, st.filename, e.lineno, e.col_offset,
                    e.ed_lineno, e.end_col_offset)
                throw exc
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
            var exc = PyErr_Format(_b_.SyntaxError, NAMED_EXPR_COMP_IN_CLASS);
            set_exc_info(exc, st.filename, e.lineno, e.col_offset,
                              e.end_lineno, e.end_col_offset);
            throw exc
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
        var exc = PyErr_Format(PyExc_SyntaxError, NAMED_EXPR_COMP_ITER_EXPR);
        set_exc_info(exc, st.filename, e.lineno, e.col_offset,
                                       e.end_lineno, e.end_col_offset);
        throw exc
    }
    if (st.cur.comprehension) {
        /* Inside a comprehension body, so find the right target scope */
        if (!symtable_extend_namedexpr_scope(st, e.target))
            return 0;
    }
    VISIT(st, expr, e.value);
    VISIT(st, expr, e.target);
    return 1;
}

const alias = 'alias',
      comprehension = 'comprehension',
      excepthandler = 'excepthandler',
      expr = 'expr',
      keyword = 'keyword',
      match_case = 'match_case',
      pattern = 'pattern',
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
            VISIT(st, 'expr', e.value);
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
        VISIT_SEQ(st, 'expr', e.values);
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
        if (e.lower)
            VISIT(st, expr, e.lower)
        if (e.upper)
            VISIT(st, expr, e.upper)
        if (e.step)
            VISIT(st, expr, e.step)
        break;
    case $B.ast.Name:
        var flag = e.ctx instanceof $B.ast.Load ? USE : DEF_LOCAL
        if (! symtable_add_def(st, e.id, flag, LOCATION(e)))
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
    switch (p.constructor) {
    case $B.ast.MatchValue:
        VISIT(st, expr, p.value);
        break;
    case $B.ast.MatchSingleton:
        /* Nothing to do here. */
        break;
    case $B.ast.MatchSequence:
        VISIT_SEQ(st, pattern, p.patterns);
        break;
    case $B.ast.MatchStar:
        if (p.name) {
            symtable_add_def(st, p.name, DEF_LOCAL, LOCATION(p));
        }
        break;
    case $B.ast.MatchMapping:
        VISIT_SEQ(st, expr, p.keys);
        VISIT_SEQ(st, pattern, p.patterns);
        if (p.rest) {
            symtable_add_def(st, p.rest, DEF_LOCAL, LOCATION(p));
        }
        break;
    case $B.ast.MatchClass:
        VISIT(st, expr, p.cls);
        VISIT_SEQ(st, pattern, p.patterns);
        VISIT_SEQ(st, pattern, p.kwd_patterns);
        break;
    case $B.ast.MatchAs:
        if (p.pattern) {
            VISIT(st, pattern, p.pattern);
        }
        if (p.name) {
            symtable_add_def(st, p.name, DEF_LOCAL, LOCATION(p));
        }
        break;
    case $B.ast.MatchOr:
        VISIT_SEQ(st, pattern, p.patterns);
        break;
    }
    VISIT_QUIT(st, 1);
}

function symtable_implicit_arg(st, pos){
    var id = '.' + pos
    if (!symtable_add_def(st, id, DEF_PARAM, ST_LOCATION(st.cur))) {
        return 0;
    }
    return 1;
}

function symtable_visit_params(st, args){
    var i;

    if (!args)
        return -1;

    for (var arg of args) {
        if (!symtable_add_def(st, arg.arg, DEF_PARAM, LOCATION(arg)))
            return 0;
    }

    return 1;
}

function symtable_visit_annotation(st, annotation){
    var future_annotations = st.future.features & CO_FUTURE_ANNOTATIONS;
    if (future_annotations &&
        !symtable_enter_block(st, '_annotation', AnnotationBlock,
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

    for (var arg of args) {
        if (arg.annotation)
            VISIT(st, expr, arg.annotation);
    }

    return 1;
}

function symtable_visit_annotations(st, o, a, returns){
    var future_annotations = st.future.ff_features & CO_FUTURE_ANNOTATIONS;
    if (future_annotations &&
        !symtable_enter_block(st, '_annotation', AnnotationBlock,
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
    if (eh.type)
        VISIT(st, expr, eh.type);
    if (eh.name)
        if (!symtable_add_def(st, eh.name, DEF_LOCAL, LOCATION(eh)))
            return 0;
    VISIT_SEQ(st, stmt, eh.body);
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
    var dot = name.search('\\.');
    if (dot != -1) {
        store_name = name.substring(0, dot);
        if (!store_name)
            return 0;
    }else{
        store_name = name;
    }
    if (name != "*") {
        var r = symtable_add_def(st, store_name, DEF_IMPORT, LOCATION(a));
        return r;
    }else{
        if (st.cur.type != ModuleBlock) {
            var lineno = a.lineno,
                col_offset = a.col_offset,
                end_lineno = a.end_lineno,
                end_col_offset = a.end_col_offset;
            var exc = PyErr_SetString(PyExc_SyntaxError, IMPORT_STAR_WARNING);
            set_exc_info(exc, st.filename, lineno, col_offset,
                                              end_lineno, end_col_offset);
            throw exc
        }
        // Brython-specific : set attribute $has_import_star, used in name
        // resolution in ast_to_js.js
        st.cur.$has_import_star = true
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
    var is_generator = (e.constructor === $B.ast.GeneratorExp);
    var outermost = generators[0]
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
    switch(e.constructor) {
        case $B.ast.ListComp:
            st.cur.comprehension = ListComprehension;
            break;
        case $B.ast.SetComp:
            st.cur.comprehension = SetComprehension;
            break;
        case $B.ast.DictComp:
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
        st.cur.coroutine = 1;
    }
    return 1;
}

function symtable_visit_genexp(st, e){
    return symtable_handle_comprehension(st, e, 'genexpr',
                                         e.generators,
                                         e.elt, NULL);
}

function symtable_visit_listcomp(st,e){
    return symtable_handle_comprehension(st, e, 'listcomp',
                                         e.generators,
                                         e.elt, NULL);
}

function symtable_visit_setcomp(st, e){
    return symtable_handle_comprehension(st, e, 'setcomp',
                                         e.generators,
                                         e.elt, NULL);
}

function symtable_visit_dictcomp(st, e){
    return symtable_handle_comprehension(st, e, 'dictcomp',
                                         e.generators,
                                         e.key,
                                         e.value);
}

function symtable_raise_if_annotation_block(st, name, e){
    if (st.cur.type != AnnotationBlock) {
        return 1;
    }

    var exc = PyErr_Format(PyExc_SyntaxError, ANNOTATION_NOT_ALLOWED, name);
    set_exc_info(exc, st.filename, e.lineno, e.col_offset,
                                   e.end_lineno, e.end_col_offset);
    throw exc
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