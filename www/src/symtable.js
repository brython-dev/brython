"use strict";
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
    DUPLICATE_ARGUMENT = "duplicate argument '%s' in function definition",
    TYPEVAR_BOUND_NOT_ALLOWED = "%s cannot be used within a TypeVar bound",
    TYPEALIAS_NOT_ALLOWED = "%s cannot be used within a type alias",
    TYPEPARAM_NOT_ALLOWED =
        "%s cannot be used within the definition of a generic",
    DUPLICATE_TYPE_PARAM = "duplicate type parameter '%s'"

/* Flags for def-use information */

var DEF_GLOBAL = 1,           /* global stmt */
    DEF_LOCAL = 2 ,           /* assignment in code block */
    DEF_PARAM = 2 << 1,         /* formal parameter */
    DEF_NONLOCAL = 2 << 2,      /* nonlocal stmt */
    USE = 2 << 3 ,              /* name is used */
    DEF_FREE = 2 << 4 ,         /* name used but not defined in nested block */
    DEF_FREE_CLASS = 2 << 5,    /* free variable from class's method */
    DEF_IMPORT = 2 << 6,        /* assignment occurred via import */
    DEF_ANNOT = 2 << 7,         /* this name is annotated */
    DEF_COMP_ITER = 2 << 8,     /* this name is a comprehension iteration variable */
    DEF_TYPE_PARAM = 2 << 9,    /* this name is a type parameter */
    DEF_COMP_CELL = 2 << 10       /* this name is a cell in an inlined comprehension */

var DEF_BOUND = DEF_LOCAL | DEF_PARAM | DEF_IMPORT

/* GLOBAL_EXPLICIT and GLOBAL_IMPLICIT are used internally by the symbol
   table.  GLOBAL is returned from PyST_GetScope() for either of them.
   It is stored in ste_symbols at bits 12-15.
*/
var SCOPE_OFFSET = 12,
    SCOPE_MASK = (DEF_GLOBAL | DEF_LOCAL | DEF_PARAM | DEF_NONLOCAL)

var LOCAL = 1,
    GLOBAL_EXPLICIT = 2,
    GLOBAL_IMPLICIT = 3,
    FREE = 4,
    CELL = 5

var TYPE_MODULE = 2

var NULL = undefined

var ModuleBlock = 2,
    ClassBlock = 1,
    FunctionBlock = 0,
    AnnotationBlock = 4,
    TypeVarBoundBlock = 5,
    TypeAliasBlock = 6,
    TypeParamBlock = 7

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
    var plen,
        ipriv
    if (privateobj == NULL || ! ident.startsWith('__')) {
        return ident;
    }
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
    while(privateobj[ipriv] == '_'){
        ipriv++
    }
    if(ipriv == plen){
        return ident /* Don't mangle if class is just underscores */
    }
    var prefix = privateobj.substr(ipriv)
    return '_' + prefix + ident
}

var lambda = NULL

var NoComprehension = 0,
    ListComprehension = 1,
    DictComprehension = 2,
    SetComprehension = 3,
    GeneratorExpression = 4

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

function id(obj){
    if(obj.$id !== undefined){
        return obj.$id
    }
    return obj.$id = $B.UUID()
}

function ste_new(st, name, block,
        key, lineno, col_offset,
        end_lineno, end_col_offset){

    var ste

    ste = {
        table: st,
        id: id(key), /* ste owns reference to AST object */
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
    ste.comp_inlined = 0
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
            for(let item of seq){
                visitor.stmt(st, item)
            }
            break
        case $B.ast.Expression:
            visitor.expr(st, mod.body)
            break
        case $B.ast.Interactive:
            seq = mod.body
            for(let item of seq){
                visitor.stmt(st, item)
            }
            break
    }

    /* Make the second symbol analysis pass */
    symtable_analyze(st)

    return st.top;
}

function _PyST_GetSymbol(ste, name){
    if(! _b_.dict.$contains_string(ste.symbols, name)){
        return 0
    }
    return _b_.dict.$getitem_string(ste.symbols, name)
}

function _PyST_GetScope(ste, name){
    var symbol = _PyST_GetSymbol(ste, name);
    return (symbol >> SCOPE_OFFSET) & SCOPE_MASK;
}

function _PyST_IsFunctionLike(ste){
    return ste.type == FunctionBlock
        || ste.type == TypeVarBoundBlock
        || ste.type == TypeAliasBlock
        || ste.type == TypeParamBlock;
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
    assert(ste.directives)
    for(var data of ste.directives){
        if(data[0] == name){
            set_exc_info(exc, ste.table.filename,
                data[1], data[2], data[3], data[4])
            return 0
        }
    }
    throw _b_.RuntimeError.$factory(
        "BUG: internal directive bookkeeping broken")
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
   The first pass collects raw facts from the AST via the visitor.*
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

function is_free_in_any_child(entry, key){
    for (var child_ste of entry.ste_children){
        var scope = _PyST_GetScope(child_ste, key)
        if(scope == FREE){
            return 1
        }
    }
    return 0
}

function inline_comprehension(ste, comp, scopes, comp_free, inlined_cells){
    for(var item of _b_.dict.$iter_items(comp.symbols)) {
        // skip comprehension parameter
        var k = item.key,
            comp_flags = item.value;
        if (comp_flags & DEF_PARAM) {
            // assert(_PyUnicode_EqualToASCIIString(k, ".0"));
            continue;
        }
        var scope = (comp_flags >> SCOPE_OFFSET) & SCOPE_MASK;
        var only_flags = comp_flags & ((1 << SCOPE_OFFSET) - 1)
        if(scope == CELL || only_flags & DEF_COMP_CELL){
           inlined_cells.add(k)
        }
        var existing = _b_.dict.$contains_string(ste.symbols, k)
        if (!existing) {
            // name does not exist in scope, copy from comprehension
            //assert(scope != FREE || PySet_Contains(comp_free, k) == 1);
            var v_flags = only_flags
            _b_.dict.$setitem(ste.symbols, k, v_flags);
            SET_SCOPE(scopes, k, scope);
        } else {
            // free vars in comprehension that are locals in outer scope can
            // now simply be locals, unless they are free in comp children,
            // or if the outer scope is a class block
            if ((existing & DEF_BOUND) &&
                    !is_free_in_any_child(comp, k) &&
                    ste.type !== ClassBlock) {
                _b_.set.remove(comp_free, k)
            }
        }
    }
    return 1;
}

/* Decide on scope of name, given flags.

   The namespace dictionaries may be modified to record information
   about the new name.  For example, a new global will add an entry to
   global.  A name that was global can be changed to local.
*/

function analyze_name(ste, scopes, name, flags,
             bound, local, free,
             global, type_params, class_entry){
    if(flags & DEF_GLOBAL){
        if(flags & DEF_NONLOCAL){
            let exc = PyErr_Format(_b_.SyntaxError,
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
        if(!bound){
            let exc = PyErr_Format(_b_.SyntaxError,
                         "nonlocal declaration not allowed at module level");
            error_at_directive(exc, ste, name)
            throw exc
        }
        if (! bound.has(name)) {
            let exc = PyErr_Format(_b_.SyntaxError,
                "no binding for nonlocal '%s' found", name)
            error_at_directive(exc, ste, name)
            throw exc
        }
        if(type_params.has(name)){
            let exc = PyErr_Format(_b_.SyntaxError,
                         "nonlocal binding not allowed for type parameter '%s'",
                         name);
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
        if (flags & DEF_TYPE_PARAM) {
            type_params.add(name)
        }else{
            type_params.delete(name)
        }
        return 1
    }
    // If we were passed class_entry (i.e., we're in an ste_can_see_class_scope scope)
    // and the bound name is in that set, then the name is potentially bound both by
    // the immediately enclosing class namespace, and also by an outer function namespace.
    // In that case, we want the runtime name resolution to look at only the class
    // namespace and the globals (not the namespace providing the bound).
    // Similarly, if the name is explicitly global in the class namespace (through the
    // global statement), we want to also treat it as a global in this scope.
    if (class_entry != NULL) {
        var class_flags = _PyST_GetSymbol(class_entry, name);
        if (class_flags & DEF_GLOBAL) {
            SET_SCOPE(scopes, name, GLOBAL_EXPLICIT)
            return 1;
        }else if (class_flags & DEF_BOUND &&
                !(class_flags & DEF_NONLOCAL)) {
            SET_SCOPE(scopes, name, GLOBAL_IMPLICIT)
            return 1
        }
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

/* If a name is defined in free and also in locals, then this block
   provides the binding for the free variable.  The name should be
   marked CELL in this block and removed from the free list.

   Note that the current block's free variables are included in free.
   That's safe because no name can be free and local in the same scope.
*/

function analyze_cells(scopes, free, inlined_cells){
    var v,
        v_cell;

    v_cell = CELL;
    if (!v_cell){
        return 0;
    }
    for(let name in scopes){
        v = scopes[name]
        //assert(PyLong_Check(v));
        var scope = v;
        if (scope != LOCAL){
            continue;
        }
        if (free.has(name) && ! inlined_cells.has(name)){
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
    res = free.delete('__classdict__')
    if(res){
        ste.needs_class_classdict = 1
    }
    return 1
}

/* Enter the final scope information into the ste_symbols dict.
 *
 * All arguments are dicts.  Modifies symbols, others are read-only.
*/
function update_symbols(symbols, scopes, bound, free, inlined_cells, classflag){
    var v,
        v_scope,
        v_new,
        v_free

    /* Update scope information for all symbols in this scope */
    for(let name of _b_.dict.$keys_string(symbols)){
        var test = false // name == 'Callable'
        let flags = _b_.dict.$getitem_string(symbols, name)
        if(test){
            console.log('in update symbols, name', name, 'flags', flags,
            flags & DEF_COMP_CELL)
        }
        if(inlined_cells.has(name)){
            flags |= DEF_COMP_CELL
        }
        v_scope = scopes[name]
        var scope = v_scope
        if(test){
            console.log('name', name, 'scopes[name]', scopes[name],
                ' flags |=', scope << SCOPE_OFFSET)
        }
        flags |= (scope << SCOPE_OFFSET)
        v_new = flags
        if (!v_new){
            return 0;
        }
        if(test){
            console.log('set symbol', name, 'v_new', v_new, 'def comp cell',
                DEF_COMP_CELL,
                v_new & DEF_COMP_CELL)
        }
        _b_.dict.$setitem_string(symbols, name, v_new)
    }

    /* Record not yet resolved free variables from children (if any) */
    v_free = FREE << SCOPE_OFFSET

    for(let name of free){

        v = _b_.dict.$get_string(symbols, name)

        /* Handle symbol that already exists in this scope */
        if (v !== _b_.dict.$missing) {
            /* Handle a free variable in a method of
               the class that has the same name as a local
               or global in the class scope.
            */
            if  (classflag &&
                 v & (DEF_BOUND | DEF_GLOBAL)) {
                let flags = v | DEF_FREE_CLASS;
                v_new = flags;
                if (! v_new) {
                    return 0;
                }
                _b_.dict.$setitem_string(symbols, name, v_new)
            }
            /* It's a cell, or already free in this scope */
            continue;
        }
        /* Handle global symbol */
        if (bound && !bound.has(name)) {
            continue;       /* it's a global */
        }
        /* Propagate new free symbol up the lexical stack */
        _b_.dict.$setitem_string(symbols, name, v_free)
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


function analyze_block(ste, bound, free, global, typeparams, class_entry){
    var success = 0

    let local = new Set()  /* collect new names bound in block */
    let scopes = {}  /* collect scopes defined for each name */

    /* Allocate new global, bound and free variable sets.  hese
       sets hold the names visible in nested blocks.  For
       ClassBlocks, the bound and global names are initialized
       before analyzing names, because class bindings aren't
       visible in methods.  For other blocks, they are initialized
       after names are analyzed.
     */

    /* TODO(jhylton): Package these dicts in a struct so that we
       can write reasonable helper functions?
    */
    let newglobal = new Set()
    let newfree = new Set()
    let newbound = new Set()
    let inlined_cells = new Set()

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

    for(let name of _b_.dict.$keys_string(ste.symbols)){
        var flags = _b_.dict.$getitem_string(ste.symbols, name)
        if (!analyze_name(ste, scopes, name, flags,
                          bound, local, free, global,
                          typeparams, class_entry)){
            return 0
        }
    }

    /* Populate global and bound sets to be passed to children. */
    if (ste.type != ClassBlock) {
        /* Add function locals to bound set */
        if (_PyST_IsFunctionLike(ste)) {
            Set_Union(newbound, local);
        }
        /* Pass down previously bound symbols */
        if (bound) {
            Set_Union(newbound, bound)
        }
        /* Pass down known globals */
        Set_Union(newglobal, global);

    }else{
        /* Special-case __class__ and __classdict__ */
        newbound.add('__class__')
        newbound.add('__classdict__')
    }

    /* Recursively call analyze_child_block() on each child block.

       newbound, newglobal now contain the names visible in
       nested blocks.  The free variables in the children will
       be collected in allfree.
    */

    for (var c of ste.children){
        var child_free = new Set()
        let entry = c

        var new_class_entry = NULL;
        if (entry.can_see_class_scope) {
            if(ste.type == ClassBlock){
                new_class_entry = ste
            }else if(class_entry){
                new_class_entry = class_entry
            }
        }

        var inline_comp = entry.comprehension && ! entry.generator;
        if (! analyze_child_block(entry, newbound, newfree, newglobal,
                                 typeparams, new_class_entry, child_free)){
            return 0
        }
        if (inline_comp) {
            if (! inline_comprehension(ste, entry, scopes, child_free,
                    inlined_cells)) {
                // error
            }
            entry.comp_inlined = 1;
        }
        Set_Union(newfree, child_free);
        /* Check if any children have free variables */
        if (entry.free || entry.child_free){
            ste.child_free = 1
        }
    }
    /* Splice children of inlined comprehensions into our children list */
    for(let i = ste.children.length - 1; i >= 0; i--) {
        let entry = ste.children[i];
        if (entry.comp_inlined) {
            ste.children.splice(i, 0, ...entry.children)
        }
    }

    // Set_Union(newfree, child_free)

    /* Check if any local variables must be converted to cell variables */
    if (_PyST_IsFunctionLike(ste) && !analyze_cells(scopes, newfree, inlined_cells)){
        return 0
    }else if (ste.type === ClassBlock && !drop_class_free(ste, newfree)){
        return 0
    }
    /* Records the results of the analysis in the symbol table entry */
    if (!update_symbols(ste.symbols, scopes, bound, newfree, inlined_cells,
                        ste.type === ClassBlock || ste.can_see_class_scope)){
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
                    global, typeparams, class_entry, child_free){
    /* Copy the bound and global dictionaries.

       These dictionaries are used by all blocks enclosed by the
       current block.  The analyze_block() call modifies these
       dictionaries.

    */
    var temp_bound = PySet_New(bound),
        temp_free = PySet_New(free),
        temp_global = PySet_New(global),
        temp_typeparams = PySet_New(typeparams)

    if (!analyze_block(entry, temp_bound, temp_free, temp_global,
            temp_typeparams, class_entry)){
        return 0
    }
    Set_Union(child_free, temp_free);
    return 1;
}

function symtable_analyze(st){
    var free = new Set(),
        global = new Set(),
        typeparams = new Set()

    return analyze_block(st.top, NULL, free, global, typeparams, NULL);
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
    if(ast === undefined){
        console.log('call ste new, key undef', st, name)
    }
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
    if(_b_.dict.$contains_string(dict, mangled)){
        o = _b_.dict.$getitem_string(dict, mangled)
        val = o
        if ((flag & DEF_PARAM) && (val & DEF_PARAM)) {
            /* Is it better to use 'mangled' or 'name' here? */
            let exc = PyErr_Format(_b_.SyntaxError, DUPLICATE_ARGUMENT, name);
            set_exc_info(exc, st.filename, ..._location)
            throw exc
        }
        if ((flag & DEF_TYPE_PARAM) && (val & DEF_TYPE_PARAM)) {
            let exc = PyErr_Format(_b_.SyntaxError, DUPLICATE_TYPE_PARAM, name);
            set_exc_info(exc, st.filename, ...location);
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
            let exc = PyErr_Format(_b_.SyntaxError,
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

function symtable_enter_type_param_block(st, name,
                               ast, has_defaults, has_kwdefaults,
                               kind,
                               _location){
    var prev = st.cur,
        current_type = st.cur.type;
    if(!symtable_enter_block(st, name, TypeParamBlock, ast, ..._location)) {
        return 0;
    }
    prev.$type_param = st.cur
    if (current_type === ClassBlock) {
        st.cur.can_see_class_scope = 1;
        if (!symtable_add_def(st,"__classdict__", USE, _location)) {
            return 0;
        }
    }
    if(kind == $B.ast.ClassDef) {
        // It gets "set" when we create the type params tuple and
        // "used" when we build up the bases.
        if (!symtable_add_def(st, "type_params", DEF_LOCAL,
                              _location)) {
            return 0;
        }
        if (!symtable_add_def(st, "type_params", USE,
                              _location)) {
            return 0;
        }
        st.st_private = name;
        // This is used for setting the generic base
        var generic_base = ".generic_base";
        if (!symtable_add_def(st, generic_base, DEF_LOCAL,
                              _location)) {
            return 0;
        }
        if (!symtable_add_def(st, generic_base, USE,
                              _location)) {
            return 0;
        }
    }
    if (has_defaults) {
        var defaults = ".defaults";
        if (!symtable_add_def(st, defaults, DEF_PARAM,
                              _location)) {
            return 0;
        }
    }
    if (has_kwdefaults) {
        var kwdefaults = ".kwdefaults";
        if (!symtable_add_def(st, kwdefaults, DEF_PARAM,
                              _location)) {
            return 0;
        }
    }
    return 1;
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
    var f = visitor[TYPE]
    if (!f(ST, V)){
        VISIT_QUIT(ST, 0);
    }
}

function VISIT_SEQ(ST, TYPE, SEQ) {
    for (var elt of SEQ){
        if (! visitor[TYPE](ST, elt)){
            VISIT_QUIT(ST, 0)
        }
    }
}

function VISIT_SEQ_TAIL(ST, TYPE, SEQ, START) {
    for (var i = START, len = SEQ.length; i < len; i++) {
        var elt = SEQ[i];
        if (! visitor[TYPE](ST, elt)){
            VISIT_QUIT(ST, 0)
        }
    }
}

function VISIT_SEQ_WITH_NULL(ST, TYPE, SEQ) {
    for (var elt of SEQ) {
        if(! elt){
            continue /* can be NULL */
        }
        if(! visitor[TYPE](ST, elt)){
            VISIT_QUIT((ST), 0)
        }
    }
}

function symtable_record_directive(st, name, lineno,
                          col_offset, end_lineno, end_col_offset){
    var data,
        mangled
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

function has_kwonlydefaults(kwonlyargs, kw_defaults){
    for (var i = 0, len = kwonlyargs.length; i < len; i++) {
        if(kw_defaults[i]){
            return 1;
        }
    }
    return 0;
}

var visitor = {}

visitor.stmt = function(st, s){
    switch (s.constructor) {
    case $B.ast.FunctionDef:
        if (!symtable_add_def(st, s.name, DEF_LOCAL, LOCATION(s)))
            VISIT_QUIT(st, 0)
        if (s.args.defaults)
            VISIT_SEQ(st, expr, s.args.defaults)
        if (s.args.kw_defaults)
            VISIT_SEQ_WITH_NULL(st, expr, s.args.kw_defaults)
        if (s.type_params.length > 0) {
            if (!symtable_enter_type_param_block(
                    st, s.name,
                    s.type_params,
                    s.args.defaults != NULL,
                    has_kwonlydefaults(s.args.kwonlyargs,
                                       s.args.kw_defaults),
                    s.constructor,
                    LOCATION(s))) {
                VISIT_QUIT(st, 0);
            }
            VISIT_SEQ(st, type_param, s.type_params);
        }

        if (!visitor.annotations(st, s, s.args,
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
        if(s.type_params.length > 0) {
            if (!symtable_exit_block(st)){
                VISIT_QUIT(st, 0)
            }
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
        if(s.type_params.length > 0){
            if (!symtable_enter_type_param_block(st, s.name,
                                                s.type_params,
                                                false, false, s.constructor,
                                                LOCATION(s))) {
                VISIT_QUIT(st, 0);
            }
            VISIT_SEQ(st, type_param, s.type_params);
        }
        VISIT_SEQ(st, expr, s.bases);
        VISIT_SEQ(st, keyword, s.keywords);
        if (!symtable_enter_block(st, s.name, ClassBlock,
                                  s, s.lineno, s.col_offset,
                                  s.end_lineno, s.end_col_offset))
            VISIT_QUIT(st, 0)
        tmp = st.private
        st.private = s.name
        if(s.type_params.length > 0){
            if (!symtable_add_def(st, '__type_params__',
                                  DEF_LOCAL, LOCATION(s))) {
                VISIT_QUIT(st, 0);
            }
            if (!symtable_add_def(st, 'type_params',
                                  USE, LOCATION(s))) {
                VISIT_QUIT(st, 0);
            }
        }
        VISIT_SEQ(st, stmt, s.body)
        st.private = tmp
        if(! symtable_exit_block(st))
            VISIT_QUIT(st, 0)
        if(s.type_params.length > 0){
            if (!symtable_exit_block(st))
                VISIT_QUIT(st, 0);
        }
        break

    case $B.ast.TypeAlias:
        VISIT(st, expr, s.name);
        assert(s.name instanceof $B.ast.Name);
        var name = s.name.id,
            is_in_class = st.cur.type === ClassBlock,
            is_generic = s.type_params.length > 0
        if(is_generic){
            if (!symtable_enter_type_param_block(
                    st, name,
                    s.type_params,
                    false, false, s.kind,
                    LOCATION(s))) {
                VISIT_QUIT(st, 0);
            }
            VISIT_SEQ(st, type_param, s.type_params);
        }
        if (!symtable_enter_block(st, name, TypeAliasBlock,
                                  s, LOCATION(s))){
            VISIT_QUIT(st, 0);
        }
        st.cur.can_see_class_scope = is_in_class;
        if(is_in_class && !symtable_add_def(st, '__classdict__',
                USE, LOCATION(s.value))) {
            VISIT_QUIT(st, 0);
        }
        VISIT(st, expr, s.value);
        if (!symtable_exit_block(st)){
            VISIT_QUIT(st, 0);
        }
        if (is_generic) {
            if (!symtable_exit_block(st))
                VISIT_QUIT(st, 0);
        }
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
        if(!visitor.annotation(st, s.annotation)){
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
        if (!visitor.annotations(st, s, s.args,
                                        s.returns))
            VISIT_QUIT(st, 0)
        if (s.decorator_list)
            VISIT_SEQ(st, expr, s.decorator_list)
        if (s.type_params.length > 0) {
            if (!symtable_enter_type_param_block(
                    st, s.name,
                    s.type_params,
                    s.args.defaults != NULL,
                    has_kwonlydefaults(s.args.kwonlyargs,
                                       s.args.kw_defaults),
                    s.constructor,
                    LOCATION(s))) {
                VISIT_QUIT(st, 0);
            }
            VISIT_SEQ(st, type_param, s.type_params);
        }
        if (!visitor.annotations(st, s, s.args, s.returns))
            VISIT_QUIT(st, 0);
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
        if (s.type_params.length > 0) {
            if (!symtable_exit_block(st))
                VISIT_QUIT(st, 0);
        }
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
    default:
        console.log('unhandled', s)
        break
    }
    VISIT_QUIT(st, 1)
}

function symtable_extend_namedexpr_scope(st, e){
    assert(st.stack)
    assert(e instanceof $B.ast.Name)

    var target_name = e.id
    var i,
        size,
        ste
    size = st.stack.length
    assert(size)

    /* Iterate over the stack in reverse and add to the nearest adequate scope */
    for (i = size - 1; i >= 0; i--) {
        ste = st.stack[i]

        /* If we find a comprehension scope, check for a target
         * binding conflict with iteration variables, otherwise skip it
         */
        if (ste.comprehension) {
            let target_in_scope = _PyST_GetSymbol(ste, target_name);
            if(target_in_scope & DEF_COMP_ITER){
                let exc = PyErr_Format(_b_.SyntaxError, NAMED_EXPR_COMP_CONFLICT, target_name);
                set_exc_info(exc, st.filename, e.lineno, e.col_offset,
                    e.ed_lineno, e.end_col_offset)
                throw exc
            }
            continue;
        }

        /* If we find a FunctionBlock entry, add as GLOBAL/LOCAL or NONLOCAL/LOCAL */
        if (_PyST_IsFunctionLike(ste)) {
            let target_in_scope = _PyST_GetSymbol(ste, target_name);
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
            let exc = PyErr_Format(_b_.SyntaxError, NAMED_EXPR_COMP_IN_CLASS);
            set_exc_info(exc, st.filename, e.lineno, e.col_offset,
                              e.end_lineno, e.end_col_offset);
            throw exc
        }
    }

    /* We should always find either a function-like block, ModuleBlock or ClassBlock
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
      type_param = 'type_param',
      withitem = 'withitem'

visitor.expr = function(st, e){
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
        if (!visitor.genexp(st, e))
            VISIT_QUIT(st, 0);
        break;
    case $B.ast.ListComp:
        if (!visitor.listcomp(st, e))
            VISIT_QUIT(st, 0);
        break;
    case $B.ast.SetComp:
        if (!visitor.setcomp(st, e))
            VISIT_QUIT(st, 0);
        break;
    case $B.ast.DictComp:
        if (!visitor.dictcomp(st, e))
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
                _PyST_IsFunctionLike(st.cur) &&
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

visitor.type_param = function(st, tp){
  switch(tp.constructor) {
    case $B.ast.TypeVar:
        if (!symtable_add_def(st, tp.name, DEF_TYPE_PARAM | DEF_LOCAL, LOCATION(tp)))
            VISIT_QUIT(st, 0);
        if (tp.bound) {
            var is_in_class = st.cur.can_see_class_scope;
            if (!symtable_enter_block(st, tp.name,
                                      TypeVarBoundBlock, tp,
                                      LOCATION(tp)))
                VISIT_QUIT(st, 0);
            st.cur.can_see_class_scope = is_in_class;
            if (is_in_class && !symtable_add_def(st, "__classdict__", USE, LOCATION(tp.bound))) {
                VISIT_QUIT(st, 0);
            }
            VISIT(st, expr, tp.bound);
            if (!symtable_exit_block(st))
                VISIT_QUIT(st, 0);
        }
        break;
    case $B.ast.TypeVarTuple:
        if (!symtable_add_def(st, tp.name, DEF_TYPE_PARAM | DEF_LOCAL, LOCATION(tp)))
            VISIT_QUIT(st, 0);
        break;
    case $B.ast.ParamSpec:
        if (!symtable_add_def(st, tp.name, DEF_TYPE_PARAM | DEF_LOCAL, LOCATION(tp)))
            VISIT_QUIT(st, 0);
        break;
    }
    VISIT_QUIT(st, 1);
}

visitor.pattern = function(st, p){
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

visitor.params = function(st, args){
    if(! args){
        return -1
    }
    for(var arg of args){
        if(! symtable_add_def(st, arg.arg, DEF_PARAM, LOCATION(arg)))
            return 0
    }
    return 1
}

visitor.annotation = function(st, annotation){
    var future_annotations = st.future.features & $B.CO_FUTURE_ANNOTATIONS
    if (future_annotations &&
        !symtable_enter_block(st, '_annotation', AnnotationBlock,
                              annotation,
                              annotation.lineno,
                              annotation.col_offset,
                              annotation.end_lineno,
                              annotation.end_col_offset)) {
        VISIT_QUIT(st, 0)
    }
    VISIT(st, expr, annotation)
    if(future_annotations && !symtable_exit_block(st)){
        VISIT_QUIT(st, 0)
    }
    return 1
}

visitor.argannotations = function(st, args){
    if(!args){
        return -1
    }
    for(var arg of args){
        if(arg.annotation){
            VISIT(st, expr, arg.annotation)
        }
    }
    return 1
}

visitor.annotations = function(st, o, a, returns){
    var future_annotations = st.future.ff_features & $B.CO_FUTURE_ANNOTATIONS;
    if (future_annotations &&
        !symtable_enter_block(st, '_annotation', AnnotationBlock,
                              o, o.lineno, o.col_offset, o.end_lineno,
                              o.end_col_offset)) {
        VISIT_QUIT(st, 0);
    }
    if (a.posonlyargs && !visitor.argannotations(st, a.posonlyargs))
        return 0;
    if (a.args && !visitor.argannotations(st, a.args))
        return 0;
    if (a.vararg && a.vararg.annotation)
        VISIT(st, expr, a.vararg.annotation);
    if (a.kwarg && a.kwarg.annotation)
        VISIT(st, expr, a.kwarg.annotation);
    if (a.kwonlyargs && !visitor.argannotations(st, a.kwonlyargs))
        return 0;
    if (future_annotations && !symtable_exit_block(st)) {
        VISIT_QUIT(st, 0);
    }
    if (returns && !visitor.annotation(st, returns)) {
        VISIT_QUIT(st, 0);
    }
    return 1;
}

visitor.arguments = function(st, a){
    /* skip default arguments inside function block
       XXX should ast be different?
    */
    if (a.posonlyargs && !visitor.params(st, a.posonlyargs))
        return 0;
    if (a.args && !visitor.params(st, a.args))
        return 0;
    if (a.kwonlyargs && !visitor.params(st, a.kwonlyargs))
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


visitor.excepthandler = function(st, eh){
    if (eh.type)
        VISIT(st, expr, eh.type);
    if (eh.name)
        if (!symtable_add_def(st, eh.name, DEF_LOCAL, LOCATION(eh)))
            return 0;
    VISIT_SEQ(st, stmt, eh.body);
    return 1;
}

visitor.withitem = function(st, item){
    VISIT(st, 'expr', item.context_expr);
    if (item.optional_vars) {
        VISIT(st, 'expr', item.optional_vars);
    }
    return 1;
}

visitor.match_case = function(st, m){
    VISIT(st, pattern, m.pattern);
    if (m.guard) {
        VISIT(st, expr, m.guard);
    }
    VISIT_SEQ(st, stmt, m.body);
    return 1;
}

visitor.alias = function(st, a){
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


visitor.comprehension = function(st, lc){
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

visitor.keyword = function(st, k){
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

visitor.genexp = function(st, e){
    return symtable_handle_comprehension(st, e, 'genexpr',
                                         e.generators,
                                         e.elt, NULL);
}

visitor.listcomp = function(st, e){
    return symtable_handle_comprehension(st, e, 'listcomp',
                                         e.generators,
                                         e.elt, NULL);
}

visitor.setcomp = function(st, e){
    return symtable_handle_comprehension(st, e, 'setcomp',
                                         e.generators,
                                         e.elt, NULL);
}

visitor.dictcomp = function(st, e){
    return symtable_handle_comprehension(st, e, 'dictcomp',
                                         e.generators,
                                         e.key,
                                         e.value);
}

function symtable_raise_if_annotation_block(st, name, e){
    var type = st.cur.type,
        exc
    if (type == AnnotationBlock)
        exc = PyErr_Format(PyExc_SyntaxError, ANNOTATION_NOT_ALLOWED, name);
    else if (type == TypeVarBoundBlock)
        exc = PyErr_Format(PyExc_SyntaxError, TYPEVAR_BOUND_NOT_ALLOWED, name);
    else if (type == TypeAliasBlock)
        exc = PyErr_Format(PyExc_SyntaxError, TYPEALIAS_NOT_ALLOWED, name);
    else if (type == TypeParamBlock)
        exc = PyErr_Format(PyExc_SyntaxError, TYPEPARAM_NOT_ALLOWED, name);
    else
        return 1;

    set_exc_info(exc, st.filename, e.lineno, e.col_offset,
                                   e.end_lineno, e.end_col_offset);
    throw exc
}

function symtable_raise_if_comprehension_block(st, e) {
    var type = st.cur.comprehension;
    var exc = PyErr_SetString(PyExc_SyntaxError,
            (type == ListComprehension) ? "'yield' inside list comprehension" :
            (type == SetComprehension) ? "'yield' inside set comprehension" :
            (type == DictComprehension) ? "'yield' inside dict comprehension" :
            "'yield' inside generator expression");
    exc.$frame_obj = $B.frame_obj
    set_exc_info(exc, st.filename, e.lineno, e.col_offset,
                                      e.end_lineno, e.end_col_offset);
    throw exc
}

})(__BRYTHON__)
