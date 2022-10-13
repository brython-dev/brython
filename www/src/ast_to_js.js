(function($B){

var _b_ = $B.builtins

function compiler_error(ast_obj, message, end){
    var exc = _b_.SyntaxError.$factory(message)
    exc.filename = state.filename
    if(exc.filename != '<string>'){
        var src = $B.file_cache[exc.filename],
            lines = src.split('\n'),
            line = lines[ast_obj.lineno - 1]
        exc.text = line
    }else{
        exc.text = _b_.none
    }
    exc.lineno = ast_obj.lineno
    exc.offset = ast_obj.col_offset + 1
    end = end || ast_obj
    exc.end_lineno = end.end_lineno
    exc.end_offset = end.end_col_offset + 1
    exc.args[1] = [exc.filename, exc.lineno, exc.offset, exc.text,
                   exc.end_lineno, exc.end_offset]
    exc.$stack = $B.frames_stack.slice()
    throw exc
}

$B.set_func_infos = function(func, name, qualname, docstring){
    func.$is_func = true
}

function copy_position(target, origin){
    target.lineno = origin.lineno
    target.col_offset = origin.col_offset
    target.end_lineno = origin.end_lineno
    target.end_col_offset = origin.end_col_offset
}

function last_scope(scopes){
    var ix = scopes.length - 1
    while(scopes[ix].parent){
        ix--
    }
    return scopes[ix]
}

function Scope(name, type, ast){
    this.name = name
    this.locals = new Set()
    this.globals = new Set()
    this.nonlocals = new Set()
    this.freevars = new Set()
    this.type = type
    this.ast = ast
}

function copy_scope(scope, ast, id){
    // Create a new scope inside scope
    // Used for statements that create a block (If, While...) so that
    // bindings don't use the enclosing scope
    var new_scope = new Scope(scope.name, scope.type, ast)
    if(id !== undefined){
        // passed by ast.For, used in ast.Break to set the flag to execute
        // the "else" clause or not
        new_scope.id = id
    }
    new_scope.parent = scope
    return new_scope
}

function make_local(module_id){
    return `locals_${module_id.replace(/\./g, '_')}`
}

function qualified_scope_name(scopes, scope){
    // Return the name of the locals object for a scope in scopes
    // scope defaults to the last item in scopes
    // If scope is not in scopes, add it at the end of scopes
    if(scope !== undefined && ! (scope instanceof Scope)){
        console.log('bizarre', scope)
        throw Error('scope étrange')
    }
    var _scopes
    if(! scope){
        _scopes = scopes.slice()
    }else{
        var ix = scopes.indexOf(scope)
        if(ix > -1){
            _scopes = scopes.slice(0, ix + 1)
        }else{
            _scopes = scopes.concat(scope)
        }
    }
    var names = []
    for(var _scope of _scopes){
        if(! _scope.parent){
            names.push(_scope.name)
        }
    }
    return names.join('_').replace(/\./g, '_')
}

function module_name(scopes){
    var _scopes = scopes.slice()
    var names = []
    for(var _scope of _scopes){
        if(! _scope.parent){
            names.push(_scope.name)
        }
    }
    return names.join('.')
}

function make_scope_name(scopes, scope){
    // Return the name of the locals object for a scope in scopes
    // scope defaults to the last item in scopes
    // If scope is not in scopes, add it at the end of scopes
    if(scope === builtins_scope){
        return `_b_`
    }
    return 'locals_' + qualified_scope_name(scopes, scope)
}

function make_search_namespaces(scopes){
    var namespaces = []
    for(var scope of scopes.slice().reverse()){
        if(scope.parent || scope.type == 'class'){
            continue
        }else if(scope.is_exec_scope){
            namespaces.push('$B.exec_scope')
        }
        namespaces.push(make_scope_name(scopes, scope))
    }
    namespaces.push('_b_')
    return namespaces
}

function mangle(scopes, scope, name){
    if(name.startsWith('__') && ! name.endsWith('__')){
        var ix = scopes.indexOf(scope)
        while(ix >= 0){
            if(scopes[ix].ast instanceof $B.ast.ClassDef){
                var scope_name = scopes[ix].name
                while(scope_name.length > 0 && scope_name.startsWith('_')){
                    scope_name = scope_name.substr(1)
                }
                if(scope_name.length == 0){
                    // if class name is only made of _, don't mangle
                    return name
                }
                return '_' + scope_name + name
            }
            ix--
        }
    }
    return name
}

function reference(scopes, scope, name){
    return make_scope_name(scopes, scope) + '.' + mangle(scopes, scope, name)
}

function bind(name, scopes){
    var scope = $B.last(scopes),
        up_scope = last_scope(scopes)
    name = mangle(scopes, up_scope, name)
    if(up_scope.globals && up_scope.globals.has(name)){
        scope = scopes[0]
    }else if(up_scope.nonlocals.has(name)){
        for(var i = scopes.indexOf(up_scope) - 1; i >= 0; i--){
            if(scopes[i].locals.has(name)){
                return scopes[i]
            }
        }
    }
    scope.locals.add(name)
    return scope
}

var CELL = 5,
    FREE = 4,
    LOCAL = 1,
    GLOBAL_EXPLICIT = 2,
    GLOBAL_IMPLICIT = 3,
    SCOPE_MASK = 15,
    SCOPE_OFF = 11

var TYPE_CLASS = 1,
    TYPE_FUNCTION = 0,
    TYPE_MODULE = 2

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

function name_reference(name, scopes, position){
    var scope = name_scope(name, scopes)
    return make_ref(name, scopes, scope, position)
}

function make_ref(name, scopes, scope, position){
    if(scope.found){
        return reference(scopes, scope.found, name)
    }else if(scope.resolve == 'all'){
        var scope_names = make_search_namespaces(scopes)
        return `$B.resolve_in_scopes('${name}', [${scope_names}], [${position}])`
    }else if(scope.resolve == 'local'){
        return `$B.resolve_local('${name}', [${position}])`
    }else if(scope.resolve == 'global'){
        return `$B.resolve_global('${name}', _frames)`
    }else if(Array.isArray(scope.resolve)){
        return `$B.resolve_in_scopes('${name}', [${scope.resolve}], [${position}])`
    }else if(scope.resolve == 'own_class_name'){
        return `$B.own_class_name('${name}')`
    }
}

function local_scope(name, scope){
    // Search name in locals of scope, and of its parents if
    // scope is a "subscope"
    var s = scope
    while(true){
        if(s.locals.has(name)){
            return {found: true, scope: s}
        }
        if(! s.parent){
            return {found: false}
        }
        s = s.parent
    }
}

function name_scope(name, scopes){
    // return the scope where name is bound, or undefined
    var test = false // name == 'x'
    if(test){
        console.log('name scope', name, scopes.slice())
        alert()
    }
    var flags,
        block
    if(scopes.length == 0){
        // case of Expression
        return {found: false, resolve: 'all'}
    }
    var scope = $B.last(scopes),
        up_scope = last_scope(scopes),
        name = mangle(scopes, scope, name)

    // Use symtable to detect if the name is local to the block
    if(up_scope.ast === undefined){
        console.log('no ast', scope)
    }
    block = scopes.symtable.table.blocks.get(_b_.id(up_scope.ast))
    if(block === undefined){
        console.log('no block', scope, scope.ast, 'id', _b_.id(up_scope.ast))
        console.log('scopes', scopes.slice())
        console.log('symtable', scopes.symtable)
    }
    try{
        flags = block.symbols.$string_dict[name][0]
    }catch(err){
        console.log('name', name, 'not in symbols of block', block)
        return {found: false, resolve: 'all'}
    }
    var __scope = (flags >> SCOPE_OFF) & SCOPE_MASK,
        is_local = [LOCAL, CELL].indexOf(__scope) > -1
    if(test){
        console.log('block', block, 'is local', is_local)
    }
    if(up_scope.ast instanceof $B.ast.ClassDef && name == up_scope.name){
        return {found: false, resolve: 'own_class_name'}
    }
    // special case
    if(name == '__annotations__'){
        if(block.type == TYPE_CLASS && up_scope.has_annotation){
            is_local = true
        }else if(block.type == TYPE_MODULE){
            is_local = true
        }
    }
    if(is_local){
        // name is local (symtable) but may not have yet been bound in scope
        // If scope is a "subscope", look in its parents
        var l_scope = local_scope(name, scope)
        if(! l_scope.found){
            if(block.type == TYPE_CLASS){
                // In class definition, unbound local variables are looked up
                // in the global namespace (Language Reference 4.2.2)
                return {found: false, resolve: 'global'}
            }else if(block.type == TYPE_MODULE){
                return {found: false, resolve: 'global'}
            }
            return {found: false, resolve: 'local'}
        }else{
            return {found: l_scope.scope}
        }
    }else if(scope.globals.has(name)){
        var global_scope = scopes[0]
        if(global_scope.locals.has(name)){
            return {found: global_scope}
        }
        return {found: false, resolve: 'global'}
    }else if(scope.nonlocals.has(name)){
        // Search name in the surrounding scopes, using symtable
        for(var i = scopes.length - 2; i >= 0; i--){
            block = scopes.symtable.table.blocks.get(_b_.id(scopes[i].ast))
            if(block && block.symbols.$string_dict[name]){
                var fl = block.symbols.$string_dict[name],
                    local_to_block =
                        [LOCAL, CELL].indexOf((fl >> SCOPE_OFF) & SCOPE_MASK) > -1
                if(! local_to_block){
                    continue
                }
                return {found: scopes[i]}
            }
        }
    }

    if(scope.has_import_star){
        return {found: false, resolve: is_local ? 'all' : 'global'}
    }
    for(var i = scopes.length - 2; i >= 0; i--){
        block = undefined
        if(scopes[i].ast){
            block = scopes.symtable.table.blocks.get(_b_.id(scopes[i].ast))
        }
        if(scopes[i].globals.has(name)){
            return {found: false, resolve: 'global'}
        }
        if(scopes[i].locals.has(name) && scopes[i].type != 'class'){
            return {found: scopes[i]} // reference(scopes, scopes[i], name)
        }else if(block && block.symbols.$string_dict[name]){
            flags = block.symbols.$string_dict[name][0]
            var __scope = (flags >> SCOPE_OFF) & SCOPE_MASK
            if([LOCAL, CELL].indexOf(__scope) > -1){
                /* name is local to a surrounding scope but not yet bound
                Example :
                    i = 5
                    def foo():
                        def bar():
                            return i
                        res = []
                        for i in range(5):
                            res.append(bar())
                        return res

                    x = foo()
                    assert x == [0, 1, 2, 3, 4]

                The "i" in bar() is local to foo, but not bound. It is bound
                at module level. The translation must be "resolve('id')", *not*
                "locals_<module_id>.i"
                */
                return {found: false, resolve: 'all'}
            }
        }
        if(scopes[i].has_import_star){
            return {found: false, resolve: 'all'}
        }
    }
    if(builtins_scope.locals.has(name)){
        return {found: builtins_scope}
    }

    var scope_names = make_search_namespaces(scopes)
    return {found: false, resolve: scope_names}
}


function resolve_in_namespace(name, ns){
    if(ns.$proxy){
        // namespace is a proxy around the locals argument of exec()
        return ns[name] === undefined ? {found: false} :
                            {found: true, value: ns[name]}
    }
    if(! ns.hasOwnProperty){
        if(ns[name] !== undefined){
            return {found: true, value: ns[name]}
        }
    }else if(ns.hasOwnProperty(name)){
        return {found: true, value: ns[name]}
    }else if(ns.$dict){
        try{
            return {found: true, value: ns.$getitem(ns.$dict, name)}
        }catch(err){
            if(ns.$missing){
                try{
                    return {
                        found: true,
                        value: $B.$call(ns.$missing)(ns.$dict, name)
                    }
                }catch(err){
                    if(! $B.$is_exc(err, [_b_.KeyError])){
                        throw err
                    }
                }
            }
        }
    }
    return {found: false}
}

$B.resolve = function(name){
    var checked = new Set(),
        current_globals
    for(var frame of $B.frames_stack.slice().reverse()){
        if(current_globals === undefined){
            current_globals = frame[3]
        }else if(frame[3] !== current_globals){
            var v = resolve_in_namespace(name, current_globals)
            if(v.found){
                return v.value
            }
            checked.add(current_globals)
            current_globals = frame[3]
        }
        var v = resolve_in_namespace(name, frame[1])
        if(v.found){
            return v.value
        }
    }
    if(! checked.has(frame[3])){
        var v = resolve_in_namespace(name, frame[3])
        if(v.found){
            return v.value
        }
    }
    if(builtins_scope.locals.has(name)){
        return _b_[name]
    }
    throw $B.name_error(name)
}

$B.resolve_local = function(name, position){
    // Translation of a reference to "name" when symtable reports that "name"
    // is local, but it has not been bound in scope locals
    var frame = $B.last($B.frames_stack)
    if(frame[1].hasOwnProperty){
        if(frame[1].hasOwnProperty(name)){
            return frame[1][name]
        }
    }else{
        var value = frame[1][name]
        if(value !== undefined){
            return value
        }
    }
    var exc = _b_.UnboundLocalError.$factory(`local variable '${name}' ` +
        'referenced before assignment')
    if(position){
        $B.set_exception_offsets(exc, position)
    }
    throw exc
}

$B.resolve_in_scopes = function(name, namespaces, position){
    for(var ns of namespaces){
        if(ns === $B.exec_scope){
            var exec_top
            for(var frame of $B.frames_stack.slice().reverse()){
                if(frame.is_exec_top){
                    exec_top = frame
                    break
                }
            }
            if(exec_top){
                for(var ns of [exec_top[1], exec_top[3]]){
                    var v = resolve_in_namespace(name, ns)
                    if(v.found){
                        return v.value
                    }
                }
            }
        }else{
            var v = resolve_in_namespace(name, ns)
            if(v.found){
                return v.value
            }
        }
    }
    var exc = $B.name_error(name)
    if(position){
        $B.set_exception_offsets(exc, position)
    }
    throw exc
}

$B.resolve_global = function(name, _frames){
    // Resolve in globals or builtins
    for(var frame of _frames.slice().reverse()){
        var v = resolve_in_namespace(name, frame[3])
        if(v.found){
            return v.value
        }
        if(frame.is_exec_top){
            break
        }
    }
    if(builtins_scope.locals.has(name)){
        return _b_[name]
    }
    throw _b_.NameError.$factory(name)
}

$B.own_class_name = function(name){
    throw _b_.NameError.$factory(name)
}

var $operators = $B.op2method.subset("all") // in py2js.js

var opname2opsign = {}
for(var key in $operators){
    opname2opsign[$operators[key]] = key
}

// Map operator class names to dunder method names
var opclass2dunder = {}

for(var op_type of $B.op_types){ // in py_ast.js
    for(var operator in op_type){
        opclass2dunder[op_type[operator]] = '__' + $operators[operator] + '__'
    }
}

opclass2dunder['UAdd'] = '__pos__'
opclass2dunder['USub'] = '__neg__'
opclass2dunder['Invert'] = '__invert__'

var builtins_scope = new Scope("__builtins__")
for(var name in $B.builtins){
    builtins_scope.locals.add(name)
}

function mark_parents(node){
    if(node.body && node.body instanceof Array){
        for(var child of node.body){
            child.$parent = node
            mark_parents(child)
        }
    }else if(node.handlers){
        // handlers in try block
        var p = {$parent: node, 'type': 'except_handler'}
        for(var child of node.handlers){
            child.$parent = p
            mark_parents(child)
        }
    }
}

function add_body(body, scopes){
    var res = ''
    for(var item of body){
        js = $B.js_from_ast(item, scopes)
        if(js.length > 0){
            res += js + '\n'
        }
    }
    return res.trimRight()
}

function extract_docstring(ast_obj, scopes){
    /*
    Extract docstring from ast_obj body.
    Used for modules, classes and functions.
    The result is a Javascript "template string" to preserve multi-line
    docstrings.
    */
    var js = '_b_.None' // default
    if(ast_obj.body.length &&
            ast_obj.body[0] instanceof $B.ast.Expr &&
            ast_obj.body[0].value instanceof $B.ast.Constant){
        // docstring
        var value = ast_obj.body[0].value.value
        if(typeof value == 'string'){
            js = ast_obj.body[0].value.to_js(scopes)
            ast_obj.body.shift()
        }
    }
    return js
}

function init_comprehension(comp, scopes){
    // Code common to comprehensions and generator expressions
    var comp_id = comp.type + '_' + comp.id,
        varnames = Object.keys(comp.varnames || {}).map(x => `'${x}'`).join(', ')
    return `var ${comp.locals_name} = {},\n` +
               `locals = ${comp.locals_name}\n` +
           `locals['.0'] = expr\n` +
           `var frame = ["<${comp.type.toLowerCase()}>", ${comp.locals_name}, ` +
           `"${comp.module_name}", ${comp.globals_name}]\n` +
           `frame.__file__ = '${scopes.filename}'\n` +
           `frame.$lineno = ${comp.ast.lineno}\n` +
           `frame.f_code = {\n` +
               `co_argcount: 1,\n` +
               `co_firstlineno:${comp.ast.lineno},\n` +
               `co_name: "<${comp.type.toLowerCase()}>",\n` +
               `co_filename: "${scopes.filename}",\n` +
               `co_flags: ${comp.type == 'genexpr' ? 115 : 83},\n` +
               `co_freevars: $B.fast_tuple([]),\n` +
               `co_kwonlyargcount: 0,\n` +
               `co_posonlyargount: 0,\n` +
               `co_varnames: $B.fast_tuple(['.0', ${varnames}])\n` +
           `}\n` +
           `var next_func_${comp.id} = $B.next_of1(expr, frame, ${comp.ast.lineno})\n` +
           `locals.$f_trace = $B.enter_frame(frame)\n` +
           `var _frames = $B.frames_stack.slice()\n`
}

function make_comp(scopes){
    // Code common to list / set / dict comprehensions
    var id = $B.UUID(),
        type = this.constructor.$name,
        symtable_block = scopes.symtable.table.blocks.get(_b_.id(this)),
        varnames = symtable_block.varnames.map(x => `"${x}"`)

    var first_for = this.generators[0],
        // outmost expression is evaluated in enclosing scope
        outmost_expr = $B.js_from_ast(first_for.iter, scopes),
        nb_paren = 1

    var comp_scope = new Scope(`${type}_${id}`, 'comprehension', this)
    scopes.push(comp_scope)

    var comp = {ast:this, id, type, varnames,
                module_name: scopes[0].name,
                locals_name: make_scope_name(scopes),
                globals_name: make_scope_name(scopes, scopes[0])}

    var js = init_comprehension(comp, scopes)

    if(this instanceof $B.ast.ListComp){
        js += `var result_${id} = []\n`
    }else if(this instanceof $B.ast.SetComp){
        js += `var result_${id} = _b_.set.$factory()\n`
    }else if(this instanceof $B.ast.DictComp){
        js += `var result_${id} = $B.empty_dict()\n`
    }

    // special case for first generator
    var first = this.generators[0]
    js += `try{\n` +
              `for(var next_${id} of next_func_${id}){\n`
    // assign result of iteration to target
    var name = new $B.ast.Name(`next_${id}`, new $B.ast.Load())
    copy_position(name, first_for.iter)
    name.to_js = function(){return `next_${id}`}
    var assign = new $B.ast.Assign([first.target], name)
    assign.lineno = this.lineno
    js += assign.to_js(scopes) + '\n'

    for(var _if of first.ifs){
        nb_paren++
        js += `if($B.$bool(${$B.js_from_ast(_if, scopes)})){\n`
    }

    for(var comprehension of this.generators.slice(1)){
        js += comprehension.to_js(scopes)
        nb_paren++
        for(var _if of comprehension.ifs){
            nb_paren++
        }
    }

    // Translate element. This must be done after translating comprehensions
    // so that target names are bound
    if(this instanceof $B.ast.DictComp){
        var key = $B.js_from_ast(this.key, scopes),
            value = $B.js_from_ast(this.value, scopes)
    }else{
        var elt = $B.js_from_ast(this.elt, scopes)
    }
    var has_await = comp_scope.has_await

    // If the element has an "await", attribute has_await is set to the scope
    // Use it to make the function aync or not
    js = `(${has_await ? 'async ' : ''}function(expr){\n` + js

    js += has_await ? 'var save_stack = $B.save_stack();\n' : ''
    if(this instanceof $B.ast.ListComp){
        js += `result_${id}.push(${elt})\n`
    }else if(this instanceof $B.ast.SetComp){
        js += `_b_.set.add(result_${id}, ${elt})\n`
    }else if(this instanceof $B.ast.DictComp){
        js += `_b_.dict.$setitem(result_${id}, ${key}, ${value})\n`
    }

    for(var i = 0; i < nb_paren; i++){
        js += '}\n'
    }
    js += `}catch(err){\n` +
          (has_await ? '$B.restore_stack(save_stack, locals)\n' : '') +
          `$B.leave_frame()\n` +
          `$B.set_exc(err)\n` +
          `throw err\n}\n` +
          (has_await ? '\n$B.restore_stack(save_stack, locals);' : '')


    js += `\n$B.leave_frame()`
    js += `\nreturn result_${id}`
    js += `\n}\n)(${outmost_expr})\n`

    scopes.pop()
    return js
}

var exec_num = {value: 0}

function init_scopes(type, scopes){
    // Common to Expression and Module
    // Initializes the first scope in scopes
    // namespaces can be passed by exec() or eval()
    var filename = scopes.symtable.table.filename,
        name = $B.url2name[filename]

    if(name){
        name = name.replace(/-/g, '_') // issue 1958
    }else if(filename.startsWith('<') && filename.endsWith('>')){
        name = 'exec'
    }else{
        name = filename.replace(/\./g, '_')
    }

    var top_scope = new Scope(name, `${type}`, this),
        block = scopes.symtable.table.blocks.get(_b_.id(this))
    if(block && block.$has_import_star){
        top_scope.has_import_star = true
    }
    scopes.push(top_scope)
    var namespaces = scopes.namespaces
    if(namespaces){
        top_scope.is_exec_scope = true
        for(var key in namespaces.exec_globals){
            if(! key.startsWith('$')){
                top_scope.globals.add(key)
            }
        }
        if(namespaces.exec_locals !== namespaces.exec_globals){
            for(var key in namespaces.exec_locals){
                if(! key.startsWith('$')){
                    top_scope.locals.add(key)
                }
            }
        }
    }
    return name
}

function compiler_check(obj){
    var check_func = Object.getPrototypeOf(obj)._check
    if(check_func){
        obj._check()
    }
}

$B.ast.Assert.prototype.to_js = function(scopes){
    var test = $B.js_from_ast(this.test, scopes),
        msg = this.msg ? $B.js_from_ast(this.msg, scopes) : ''
    return `if($B.set_lineno(frame, ${this.lineno}) && !$B.$bool(${test})){\n` +
           `throw _b_.AssertionError.$factory(${msg})}\n`
}

var CO_FUTURE_ANNOTATIONS = 0x1000000

function annotation_to_str(obj){
    var s
    if(obj instanceof $B.ast.Name){
        s = obj.id
    }else if(obj instanceof $B.ast.BinOp){
        s = annotation_to_str(obj.left) + '|' + annotation_to_str(obj.right)
    }else if(obj instanceof $B.ast.Subscript){
        s = annotation_to_str(obj.value) + '[' +
                annotation_to_str(obj.slice) + ']'
    }else if(obj instanceof $B.ast.Constant){
        if(obj.value === _b_.None){
            s = 'None'
        }else{
            console.log('other constant', obj)
        }
    }else{
        console.log('other annotation', obj)
    }
    return s
}

$B.ast.AnnAssign.prototype.to_js = function(scopes){
    var postpone_annotation = scopes.symtable.table.future.features &
            CO_FUTURE_ANNOTATIONS
    var scope = last_scope(scopes)
    var js = ''
    if(! scope.has_annotation){
        js += 'locals.__annotations__ = $B.empty_dict()\n'
        scope.has_annotation = true
        scope.locals.add('__annotations__')
    }
    if(this.target instanceof $B.ast.Name){
        var ann_value = postpone_annotation ?
                `'${annotation_to_str(this.annotation)}'` :
                $B.js_from_ast(this.annotation, scopes)
    }
    if(this.value){
        js += `var ann = ${$B.js_from_ast(this.value, scopes)}\n`
        if(this.target instanceof $B.ast.Name && this.simple){
            var scope = bind(this.target.id, scopes),
                mangled = mangle(scopes, scope, this.target.id)
            if(scope.type != "def"){
                // Update __annotations__ only for classes and modules
                js += `$B.$setitem(locals.__annotations__, ` +
                      `'${mangled}', ${ann_value})\n`
            }
            var target_ref = name_reference(this.target.id, scopes)
            js += `${target_ref} = ann`
        }else if(this.target instanceof $B.ast.Attribute){
            js += `$B.$setattr(${$B.js_from_ast(this.target.value, scopes)}` +
                `, "${this.target.attr}", ann)`
        }else if(this.target instanceof $B.ast.Subscript){
            js += `$B.$setitem(${$B.js_from_ast(this.target.value, scopes)}` +
                `, ${$B.js_from_ast(this.target.slice, scopes)}, ann)`
        }
    }else{
        if(this.target instanceof $B.ast.Name){
            if(this.simple && scope.type != 'def'){
                var mangled = mangle(scopes, scope, this.target.id)
                var ann = `'${this.annotation.id}'`
                js += `$B.$setitem(locals.__annotations__, ` +
                    `'${mangled}', ${ann_value})`
            }
        }else{
            var ann = $B.js_from_ast(this.annotation, scopes)
        }
    }
    return `$B.set_lineno(frame, ${this.lineno})\n` + js
}

$B.ast.Assign.prototype.to_js = function(scopes){
    compiler_check(this)
    var js = this.lineno ? `$B.set_lineno(frame, ${this.lineno})\n` : '',
        value = $B.js_from_ast(this.value, scopes)

    function assign_one(target, value){
        if(target instanceof $B.ast.Name){
            return $B.js_from_ast(target, scopes) + ' = ' + value
        }else if(target instanceof $B.ast.Starred){
            return assign_one(target.value, value)
        }else if(target instanceof $B.ast.Subscript){
            return `$B.$setitem(${$B.js_from_ast(target.value, scopes)}` +
                `, ${$B.js_from_ast(target.slice, scopes)}, ${value})`
        }else if(target instanceof $B.ast.Attribute){
            var attr = mangle(scopes, last_scope(scopes), target.attr)
            return `$B.$setattr(${$B.js_from_ast(target.value, scopes)}` +
                `, "${attr}", ${value})`
        }
    }

    function assign_many(target, value){
        var js = ''
        var nb_targets = target.elts.length,
            has_starred = false,
            nb_after_starred
        for(var i = 0, len = nb_targets; i < len; i++){
            if(target.elts[i] instanceof $B.ast.Starred){
                has_starred = true
                nb_after_starred = len - i - 1
                break
            }
        }
        var iter_id = 'it_' + $B.UUID()
        js += `var ${iter_id} = $B.unpacker(${value}, ${nb_targets}, ` +
             `${has_starred}`
        if(nb_after_starred !== undefined){
            js += `, ${nb_after_starred}`
        }
        if($B.pep657){
            js += `, [${target.col_offset}, ${target.col_offset}, ${target.end_col_offset}]`
        }
        js += `)\n`
        var assigns = []
        for(var elt of target.elts){
            if(elt instanceof $B.ast.Starred){
                assigns.push(assign_one(elt, `${iter_id}.read_rest()`))
            }else if(elt instanceof $B.ast.List ||
                    elt instanceof $B.ast.Tuple){
                assigns.push(assign_many(elt, `${iter_id}.read_one()`))
            }else{
                assigns.push(assign_one(elt, `${iter_id}.read_one()`))
            }
        }
        js += assigns.join('\n')
        return js
    }

    // evaluate value once
    var value_id = 'v' + $B.UUID()
    js += `var ${value_id} = ${value}\n`

    var assigns = []
    for(var target of this.targets){
        if(! (target instanceof $B.ast.Tuple) &&
               ! (target instanceof $B.ast.List)){
            assigns.push(assign_one(target, value_id))
        }else{
            assigns.push(assign_many(target, value_id))
        }
    }

    js += assigns.join('\n')
    return js
}

$B.ast.AsyncFor.prototype.to_js = function(scopes){
    if(! (last_scope(scopes).ast instanceof $B.ast.AsyncFunctionDef)){
        compiler_error(this, "'async for' outside async function")
    }
    return $B.ast.For.prototype.to_js.bind(this)(scopes)
}

$B.ast.AsyncFunctionDef.prototype.to_js = function(scopes){
    return $B.ast.FunctionDef.prototype.to_js.bind(this)(scopes)
}

$B.ast.AsyncWith.prototype.to_js = function(scopes){
    /*
        async with EXPR as VAR:
            BLOCK

    is equivalent to

        mgr = (EXPR)
        aexit = type(mgr).__aexit__
        aenter = type(mgr).__aenter__

        VAR = await aenter(mgr)
        try:
            BLOCK
        except:
            if not await aexit(mgr, *sys.exc_info()):
                raise
        else:
            await aexit(mgr, None, None, None)
    */

    if(! (last_scope(scopes).ast instanceof $B.ast.AsyncFunctionDef)){
        compiler_error(this, "'async with' outside async function")
    }

    function bind_vars(vars, scopes){
        if(vars instanceof $B.ast.Name){
            bind(vars.id, scopes)
        }else if(vars instanceof $B.ast.Tuple){
            for(var var_item of vars.elts){
                bind_vars(var_item, scopes)
            }
        }
    }

    function add_item(item, js){
        var id = $B.UUID()
        var s = `var mgr_${id} = ` +
              $B.js_from_ast(item.context_expr, scopes) + ',\n' +
              `mgr_type_${id} = _b_.type.$factory(mgr_${id}),\n` +
              `aexit_${id} = $B.$getattr(mgr_type_${id}, '__aexit__'),\n` +
              `aenter_${id} = $B.$getattr(mgr_type_${id}, '__aenter__'),\n` +
              `value_${id} = await $B.promise($B.$call(aenter_${id})(mgr_${id})),\n` +
              `exc_${id} = true\n`
        if(has_generator){
            // add/update attribute used to close context managers in
            // leave_frame()
            s += `locals.$context_managers = locals.$context_managers || []\n` +
                 `locals.$context_managers.push(mgr_${id})\n`
        }
        s += 'try{\ntry{\n'
        if(item.optional_vars){
            //bind_vars(item.optional_vars, scopes)
            var value = {to_js: function(){return `value_${id}`}}
            copy_position(value, _with)
            var assign = new $B.ast.Assign([item.optional_vars], value)
            copy_position(assign, _with)
            s += assign.to_js(scopes) + '\n'
        }
        s += js
        s += `}catch(err_${id}){\n` +
              `frame.$lineno = ${lineno}\n` +
              `exc_${id} = false\n` +
              `err_${id} = $B.exception(err_${id}, frame)\n` +
              `var $b = await $B.promise(aexit_${id}(mgr_${id}, err_${id}.__class__, ` +
              `err_${id}, $B.$getattr(err_${id}, '__traceback__')))\n` +
              `if(! $B.$bool($b)){\nthrow err_${id}\n}\n}\n`
        s += `}\nfinally{\n` +
              `frame.$lineno = ${lineno}\n` +
              `if(exc_${id}){\n` +
              `await $B.promise(aexit_${id}(mgr_${id}, _b_.None, _b_.None, _b_.None))\n}\n}\n`
        return s
    }

    var _with = this,
        scope = last_scope(scopes),
        lineno = this.lineno
    delete scope.is_generator

    // bind context managers aliases first
    for(var item of this.items.slice().reverse()){
        if(item.optional_vars){
            bind_vars(item.optional_vars, scopes)
        }
    }

    js = add_body(this.body, scopes) + '\n'
    var has_generator = scope.is_generator
    for(var item of this.items.slice().reverse()){
        js = add_item(item, js)
    }
    return `$B.set_lineno(frame, ${this.lineno})\n` + js
}

$B.ast.Attribute.prototype.to_js = function(scopes){
    var attr = mangle(scopes, last_scope(scopes), this.attr)
    if($B.pep657){
        return `$B.$getattr_pep657(${$B.js_from_ast(this.value, scopes)}, ` +
               `'${attr}', ` +
               `[${this.value.col_offset}, ${this.value.col_offset}, ` +
               `${this.end_col_offset}])`
    }
    return `$B.$getattr(${$B.js_from_ast(this.value, scopes)}, ` +
        `'${attr}')`
}

$B.ast.AugAssign.prototype.to_js = function(scopes){
    var js,
        op_class = this.op.$name ? this.op : this.op.constructor
    for(var op in $B.op2ast_class){
        if($B.op2ast_class[op][1] === op_class){
            var iop = op + '='
            break
        }
    }

    var value = $B.js_from_ast(this.value, scopes)

    if(this.target instanceof $B.ast.Name){
        var scope = name_scope(this.target.id, scopes)
        if(! scope.found){
            // The left part of the assignment must be an attribute of a
            // namespace (global or local), not a call to $B.resolve
            var left_scope = scope.resolve == 'global' ?
                make_scope_name(scopes, scopes[0]) : 'locals'
            return `${left_scope}.${this.target.id} = $B.augm_assign(` +
                make_ref(this.target.id, scopes, scope) + `, '${iop}', ${value})`
        }else{
            var ref = `${make_scope_name(scopes, scope.found)}.${this.target.id}`
            if(op == '@' || op == '//' || op == '%' || op == '<<'){
                js = `${ref} = $B.augm_assign(${ref}, '${iop}', ${value})`
            }else{
                js = ref + ` = typeof ${ref} == "number" && ` +
                    `$B.is_safe_int(locals.$result = ${ref} ${op} ${value}) ?\n` +
                    `locals.$result : $B.augm_assign(${ref}, '${iop}', ${value})`
            }
        }
    }else if(this.target instanceof $B.ast.Subscript){
        var op = opclass2dunder[this.op.constructor.$name]
        js = `$B.$setitem((locals.$tg = ${this.target.value.to_js(scopes)}), ` +
            `(locals.$key = ${this.target.slice.to_js(scopes)}), ` +
            `$B.augm_assign($B.$getitem(locals.$tg, locals.$key), '${iop}', ${value}))`
    }else if(this.target instanceof $B.ast.Attribute){
        var op = opclass2dunder[this.op.constructor.$name],
            mangled = mangle(scopes, last_scope(scopes), this.target.attr)
        js = `$B.$setattr((locals.$tg = ${this.target.value.to_js(scopes)}), ` +
            `'${mangled}', $B.augm_assign(` +
            `$B.$getattr(locals.$tg, '${mangled}'), '${iop}', ${value}))`
    }else{
        var target = $B.js_from_ast(this.target, scopes),
            value = $B.js_from_ast(this.value, scopes)
        js = `${target} = $B.augm_assign(${target}, '${iop}', ${value})`
    }
    return `$B.set_lineno(frame, ${this.lineno})\n` + js
}

$B.ast.Await.prototype.to_js = function(scopes){
    var ix = scopes.length - 1
    while(scopes[ix].parent){
        ix--
    }
    scopes[ix].has_await = true
    return `await $B.promise(${$B.js_from_ast(this.value, scopes)})`
}

$B.ast.BinOp.prototype.to_js = function(scopes){
    // temporarily support old (py2js.js) and new (python_parser.js) versions
    var name = this.op.$name ? this.op.$name : this.op.constructor.$name
    var op = opclass2dunder[name]
    var res = `$B.rich_op('${op}', ${$B.js_from_ast(this.left, scopes)}, ` +
        `${$B.js_from_ast(this.right, scopes)}`
    if($B.pep657){
        res += `, [${this.left.col_offset}, ${this.col_offset}, ` +
               `${this.end_col_offset}, ${this.right.end_col_offset}]`
    }
    return res + ')'
}

$B.ast.BoolOp.prototype.to_js = function(scopes){
    // The expression x and y first evaluates x; if x is false, its value is
    // returned; otherwise, y is evaluated and the resulting value is
    // returned.
    // The expression x or y first evaluates x; if x is true, its value is
    // returned; otherwise, y is evaluated and the resulting value is
    // returned.

    var op = this.op instanceof $B.ast.And ? '! ' : ''
    var tests = []
    for(var i = 0, len = this.values.length; i < len; i++){
        var value = this.values[i]
        if(i < len - 1){
            tests.push(`${op}$B.$bool(locals.$test = ` +
                `${$B.js_from_ast(value, scopes)}) ? locals.$test : `)
        }else{
            tests.push(`${$B.js_from_ast(value, scopes)}`)
        }
    }
    return '(' + tests.join('') + ')'

}

function in_loop(scopes){
    for(var scope of scopes.slice().reverse()){
        if(scope.ast instanceof $B.ast.For ||
                scope.ast instanceof $B.ast.While){
            return true
        }
    }
    return false
}

$B.ast.Break.prototype.to_js = function(scopes){
    if(! in_loop(scopes)){
        compiler_error(this, "'break' outside loop")
    }
    var js = ''
    for(var scope of scopes.slice().reverse()){
        if(scope.ast instanceof $B.ast.For){
            js += `no_break_${scope.id} = false\n`
            break
        }
    }
    js += `break`
    return js
}

$B.ast.Call.prototype.to_js = function(scopes){
    var js = '$B.$call(' + $B.js_from_ast(this.func, scopes)
    if($B.pep657){
        js += `, [${this.col_offset}, ${this.col_offset}, ${this.end_col_offset}]`
    }
    var args = make_args.bind(this)(scopes)
    return js + ')' + (args.has_starred ? `.apply(null, ${args.js})` :
                                    `(${args.js})`)
}

function make_args(scopes){
    var js = '',
        named_args = [],
        named_kwargs = [],
        starred_kwargs = [],
        has_starred = false
    for(var arg of this.args){
        if(arg instanceof $B.ast.Starred){
            arg.$handled = true
            has_starred = true
        }else{
            named_args.push($B.js_from_ast(arg, scopes))
        }
    }
    for(var keyword of this.keywords){
        if(keyword.arg){
            named_kwargs.push(
                `${keyword.arg}: ${$B.js_from_ast(keyword.value, scopes)}`)
        }else{
            //has_starred = true
            starred_kwargs.push($B.js_from_ast(keyword.value, scopes))
        }
    }

    var args = ''
    named_args = named_args.join(', ')
    if(! has_starred){
        args += `${named_args}`
    }else{
        var start = true,
            not_starred = []
        for(var arg of this.args){
            if(arg instanceof $B.ast.Starred){
                if(not_starred.length > 0){
                    var arg_list = not_starred.map(x => $B.js_from_ast(x, scopes))
                    if(start){
                        args += `[${arg_list.join(', ')}]`
                    }else{
                        args += `.concat([${arg_list.join(', ')}])`
                    }
                    not_starred = []
                }else if(args == ''){
                    args = '[]'
                }
                var starred_arg = $B.js_from_ast(arg.value, scopes)
                args += `.concat(_b_.list.$factory(${starred_arg}))`
                start = false
            }else{
                not_starred.push(arg)
            }
        }
        if(not_starred.length > 0){
            var arg_list = not_starred.map(x => $B.js_from_ast(x, scopes))
            if(start){
                args += `[${arg_list.join(', ')}]`
                start = false
            }else{
                args += `.concat([${arg_list.join(', ')}])`
            }
        }
        if(args[0] == '.'){
            console.log('bizarre', args)
        }
    }

    if(named_kwargs.length + starred_kwargs.length == 0){
        return {has_starred, js: js + `${args}`}
    }else{
        var kw = `{${named_kwargs.join(', ')}}`
        for(var starred_kwarg of starred_kwargs){
            kw += `, ${starred_kwarg}`
        }
        kw = `{$nat: 'kw', kw:[${kw}]}`
        if(args.length > 0){
            if(has_starred){
                kw = `.concat([${kw}])`
            }else{
                kw = ', ' + kw
            }
        }
        return {has_starred, js: js + `${args}${kw}`}
    }
}

$B.ast.ClassDef.prototype.to_js = function(scopes){
    var enclosing_scope = bind(this.name, scopes)
    var class_scope = new Scope(this.name, 'class', this)

    var js = '',
        locals_name = make_scope_name(scopes, class_scope),
        ref = this.name + $B.UUID(),
        glob = scopes[0].name,
        globals_name = make_scope_name(scopes, scopes[0]),
        decorators = [],
        decorated = false
    for(var dec of this.decorator_list){
        decorated = true
        var dec_id = 'decorator' + $B.UUID()
        decorators.push(dec_id)
        js += `$B.set_lineno(frame, ${dec.lineno})\n` +
              `var ${dec_id} = ${$B.js_from_ast(dec, scopes)}\n`
    }

    js += `$B.set_lineno(frame, ${this.lineno})\n`
    var qualname = this.name
    var ix = scopes.length - 1
    while(ix >= 0){
        if(scopes[ix].parent){
            ix--
        }else if(scopes[ix].ast instanceof $B.ast.ClassDef){
            qualname = scopes[ix].name + '.' + qualname
            ix--
        }else{
            break
        }
    }

    scopes.push(class_scope)

    // Detect doc string
    var docstring = extract_docstring(this, scopes)

    js += `var ${ref} = (function(){\n` +
          `var ${locals_name} = {},\n` +
          `locals = ${locals_name}\n` +
          `locals.$name = "${this.name}"\n` +
          `locals.$qualname = "${qualname}"\n` +
          `locals.$is_class = true\n` +
          `var frame = ["${this.name}", locals, "${glob}", ${globals_name}]\n` +
          `frame.__file__ = '${scopes.filename}'\n` +
          `frame.$lineno = ${this.lineno}\n` +
          `locals.$f_trace = $B.enter_frame(frame)\n` +
          `var _frames = $B.frames_stack.slice()\n` +
          `if(locals.$f_trace !== _b_.None){$B.trace_line()}\n`

    js += `locals.__annotations__ = $B.empty_dict()\n`
    class_scope.has_annotation = true
    class_scope.locals.add('__annotations__')

    js += add_body(this.body, scopes)

    scopes.pop()

    js += '\nif(locals.$f_trace !== _b_.None){\n' +
              '$B.trace_return(_b_.None)\n' +
          '}\n' +
          '$B.leave_frame()\n' +
          'return locals\n})()\n'

    var class_ref = reference(scopes, enclosing_scope, this.name)

    if(decorated){
        class_ref = `decorated${$B.UUID()}`
        js += 'var '
    }
    var bases = this.bases.map(x => $B.js_from_ast(x, scopes))

    var keywords = []
    for(var keyword of this.keywords){
        keywords.push(`["${keyword.arg}", ` +
            $B.js_from_ast(keyword.value, scopes) + ']')
    }

    js += `${class_ref} = $B.$class_constructor("${this.name}", ${ref}, ` +
          `$B.fast_tuple([${bases}]), [], [${keywords.join(', ')}])\n` +
          `${class_ref}.__doc__ = ${docstring}\n`

    if(decorated){
        js += reference(scopes, enclosing_scope, this.name) + ' = '
        var decorate = class_ref
        for(var dec of decorators.reverse()){
            decorate = `$B.$call(${dec})(${decorate})`
        }
        js += decorate + '\n'
    }

    return js
}

$B.ast.Compare.prototype.to_js = function(scopes){
    var left = $B.js_from_ast(this.left, scopes),
        comps = []
    // For chained comparison, store each intermediate result in locals.$op
    var len = this.ops.length,
        prefix = len > 1 ? 'locals.$op = ' : ''

    for(var i = 0; i < len; i++){
        var name = this.ops[i].$name ? this.ops[i].$name : this.ops[i].constructor.$name,
            op = opclass2dunder[name],
            right = this.comparators[i]
        if(op === undefined){
            console.log('op undefined', this.ops[i])
            alert()
        }
        if(this.ops[i] instanceof $B.ast.In){
            comps.push(`$B.$is_member(${left}, ` +
                `${prefix}${$B.js_from_ast(right, scopes)})`)
        }else if(this.ops[i] instanceof $B.ast.NotIn){
            comps.push(`! $B.$is_member(${left}, ` +
                `${prefix}${$B.js_from_ast(right, scopes)})`)
        }else if(this.ops[i] instanceof $B.ast.Is){
            comps.push(`$B.$is(${left}, ` +
                `${prefix}${$B.js_from_ast(right, scopes)})`)
        }else if(this.ops[i] instanceof $B.ast.IsNot){
            comps.push(`! $B.$is(${left}, ` +
                `${prefix}${$B.js_from_ast(right, scopes)})`)
        }else{
            comps.push(`$B.rich_comp('${op}', ${left}, ` +
                `${prefix}${$B.js_from_ast(right, scopes)})`)
        }
        if(len > 1){
            left = 'locals.$op'
        }
    }
    return comps.join(' && ')
}

$B.ast.comprehension.prototype.to_js = function(scopes){
    var id = $B.UUID(),
        iter = $B.js_from_ast(this.iter, scopes)

    var js = `var next_func_${id} = $B.next_of1(${iter}, frame, ${this.lineno})\n` +
             `for(var next_${id} of next_func_${id}){\n`
    // assign result of iteration to target
    var name = new $B.ast.Name(`next_${id}`, new $B.ast.Load())
    copy_position(name, this.target)
    name.to_js = function(){return `next_${id}`}
    var assign = new $B.ast.Assign([this.target], name)
    copy_position(assign, this.target)
    js += assign.to_js(scopes) + ' // assign to target\n'

    for(var _if of this.ifs){
        js += `if($B.$bool(${$B.js_from_ast(_if, scopes)})){\n`
    }

    return js
}

$B.ast.Constant.prototype.to_js = function(scopes){
    if(this.value === true || this.value === false){
        return this.value + ''
    }else if(this.value === _b_.None){
        return '_b_.None'
    }else if(typeof this.value == "string"){
        var type = 'str',
            value = this.value
    }else if(this.value.__class__ === _b_.bytes){
        return `_b_.bytes.$factory([${this.value.source}])`
    }else if(typeof this.value == "number"){
        return this.value
    }else if(this.value.__class__ === $B.long_int){
        return `$B.fast_long_int(${this.value.value}n)`
    }else if(this.value instanceof Number){
        return `{__class__: _b_.float, value: ${+this.value}}`
    }else if(this.value.__class__ === _b_.complex){
        return `$B.make_complex(${this.value.$real.value}, ${this.value.$imag.value})`
    }else{
        var type = this.value.type,
            value = this.value.value
    }

    switch(type){
        case 'int':
            var v = parseInt(value[1], value[0])
            if(v > $B.min_int && v < $B.max_int){
                return v + ''
            }else{
                var v = $B.long_int.$factory(value[1], value[0])
                return '$B.fast_long_int("' + v.value + '", ' + v.pos + ')'
            }
        case 'float':
            // number literal
            if(/^\d+$/.exec(value) || /^\d+\.\d*$/.exec(value)){
                return '(new Number(' + value + '))'
            }
            return '_b_.float.$factory(' + value + ')'
        case 'imaginary':
            var v = $B.ast.Constant.prototype.to_js.bind({value})(scopes)
            return '$B.make_complex(0,' + v + ')'
        case 'ellipsis':
            return `_b_.Ellipsis`
        case 'str':
            var lines = value.split('\n')
            // lines = lines.map(line => line.replace(/\\/g, '\\\\'))
            value = lines.join('\\n\\\n')
            value = value.replace(new RegExp('\r', 'g'), '\\r').
                          replace(new RegExp('\t', 'g'), '\\t').
                          replace(new RegExp('\x07', 'g'), '\\x07')
            return `$B.String(${value})`
    }
    console.log('unknown constant', this, value, value === true)
    return '// unknown'
}

$B.ast.Continue.prototype.to_js = function(scopes){
    if(! in_loop(scopes)){
        compiler_error(this, "'continue' not properly in loop")
    }
    return 'continue'
}

$B.ast.Delete.prototype.to_js = function(scopes){
    compiler_check(this)
    var js = ''
    for(var target of this.targets){
        if(target instanceof $B.ast.Name){
            var scope = name_scope(target.id, scopes)
            if(scope.found){
                scope.found.locals.delete(target.id)
            }
            js += `$B.$delete("${target.id}")\n`
        }else if(target instanceof $B.ast.Subscript){
            js += `$B.$delitem(${$B.js_from_ast(target.value, scopes)}, ` +
                  `${$B.js_from_ast(target.slice, scopes)})\n`
        }else if(target instanceof $B.ast.Attribute){
            js += `_b_.delattr(${$B.js_from_ast(target.value, scopes)}, ` +
                  `'${target.attr}')\n`
        }
    }
    return `$B.set_lineno(frame, ${this.lineno})\n` + js
}
$B.ast.Dict.prototype.to_js = function(scopes){
    var items = [],
        keys = this.keys,
        has_packed = false

    function no_key(i){
        return keys[i] === _b_.None || keys[i] === undefined
    }

    // Build arguments = a list of 2-element lists
    for(var i = 0, len = this.keys.length; i < len; i++){
        if(no_key(i)){
            // format **t
            has_packed = true
            items.push('_b_.list.$factory(_b_.dict.items(' +
                      $B.js_from_ast(this.values[i], scopes) + '))')
        }else{
            try{
                items.push(`[${$B.js_from_ast(this.keys[i], scopes)}, ` +
                           `${$B.js_from_ast(this.values[i], scopes)}]`)
            }catch(err){
                throw err
            }
        }
    }
    if(! has_packed){
        return `_b_.dict.$factory([${items}])`
    }
    // dict display has items of the form **t
    var first = no_key(0) ? items[0] : `[${items[0]}]`,
        js = '_b_.dict.$factory(' + first
    for(var i = 1, len = items.length; i < len; i++){
        var arg = no_key(i) ? items[i] : `[${items[i]}]`
        js += `.concat(${arg})`
    }
    return js + ')'
}

$B.ast.DictComp.prototype.to_js = function(scopes){
    return make_comp.bind(this)(scopes)
}

$B.ast.Expr.prototype.to_js = function(scopes){
    return `$B.set_lineno(frame, ${this.lineno});\n`+
        $B.js_from_ast(this.value, scopes)
}

$B.ast.Expression.prototype.to_js = function(scopes){
    init_scopes.bind(this)('expression', scopes)
    return $B.js_from_ast(this.body, scopes)
}

$B.ast.For.prototype.to_js = function(scopes){
    // Create a new scope with the same name to avoid binding in the enclosing
    // scope.
    var id = $B.UUID(),
        iter = $B.js_from_ast(this.iter, scopes),
        js
    // Create a new scope with the same name to avoid binding in the enclosing
    // scope.
    var scope = $B.last(scopes),
        new_scope = copy_scope(scope, this, id)
    scopes.push(new_scope)

    if(this instanceof $B.ast.AsyncFor){
        js = `var iter_${id} = ${iter},\n` +
                 `type_${id} = _b_.type.$factory(iter_${id})\n` +
            `iter_${id} = $B.$call($B.$getattr(type_${id}, "__aiter__"))(iter_${id})\n` +
            `var next_func_${id} = $B.$call(` +
            `$B.$getattr(type_${id}, '__anext__'))\n` +
            `while(true){\n`+
            `  try{\n`+
            `    var next_${id} = await $B.promise(next_func_${id}(iter_${id}))\n` +
            `  }catch(err){\n`+
            `    if($B.is_exc(err, [_b_.StopAsyncIteration])){\nbreak}\n` +
            `    else{\nthrow err}\n`+
            `  }\n`
    }else{
        js = `var no_break_${id} = true\n` +
             `for(var next_${id} of $B.next_of1(${iter}, frame, ${this.lineno})){\n`
    }
    // assign result of iteration to target
    var name = new $B.ast.Name(`next_${id}`, new $B.ast.Load())
    copy_position(name, this.iter)
    name.to_js = function(){return `next_${id}`}
    var assign = new $B.ast.Assign([this.target], name)
    //assign.lineno = this.lineno
    js += assign.to_js(scopes) + '\n'

    js += add_body(this.body, scopes)

    js += '\n}' // close 'while' loop

    scopes.pop()

    if(this.orelse.length > 0){
        js += `\nif(no_break_${id}){\n` +
              add_body(this.orelse, scopes) + '}\n'
    }

    return js
}

$B.ast.FormattedValue.prototype.to_js = function(scopes){
    var value = $B.js_from_ast(this.value, scopes)
    if(this.conversion == 114){
        value = `_b_.repr(${value})`
    }else if(this.conversion == 115){
        value = `_b_.str.$factory(${value})`
    }else if(this.conversion == 97){
        value = `_b_.ascii(${value})`
    }

    if(this.format_spec){
        value = `_b_.str.format('{0:' + `+
                $B.js_from_ast(this.format_spec, scopes) +
                ` + '}', ${value})`
    }else if(this.conversion == -1){
        value = `_b_.str.$factory(${value})`
    }
    return value
}

function transform_args(scopes){
    // Code common to FunctionDef and Lambda
    var has_posonlyargs = this.args.posonlyargs.length > 0,
        _defaults = [],
        nb_defaults = this.args.defaults.length,
        positional = this.args.posonlyargs.concat(this.args.args),
        ix = positional.length - nb_defaults,
        default_names = [],
        annotations
    for(var arg of positional.concat(this.args.kwonlyargs).concat(
            [this.args.vararg, this.args.kwarg])){
        if(arg && arg.annotation){
            annotations = annotations || {}
            annotations[arg.arg] = arg.annotation
        }
    }
    for(var i = ix; i < positional.length; i++){
        default_names.push(`defaults.${positional[i].arg}`)
        _defaults.push(`${positional[i].arg}: ` +
            `${$B.js_from_ast(this.args.defaults[i - ix], scopes)}`)
    }
    var ix = -1
    for(var arg of this.args.kwonlyargs){
        ix++
        if(this.args.kw_defaults[ix] === _b_.None){
            continue
        }
        if(this.args.kw_defaults[ix] === undefined){
            _defaults.push(`${arg.arg}: _b_.None`)
        }else{
            _defaults.push(`${arg.arg}: ` +
                $B.js_from_ast(this.args.kw_defaults[ix], scopes))
        }
    }
    var kw_default_names = []
    for(var kw of this.args.kwonlyargs){
        kw_default_names.push(`defaults.${kw.arg}`)
    }

    var default_str = `{${_defaults.join(', ')}}`

    return {default_names, _defaults, positional, has_posonlyargs,
            kw_default_names, default_str, annotations}
}

$B.ast.FunctionDef.prototype.to_js = function(scopes){
    var symtable_block = scopes.symtable.table.blocks.get(_b_.id(this))
    var in_class = last_scope(scopes).ast instanceof $B.ast.ClassDef,
        is_async = this instanceof $B.ast.AsyncFunctionDef
    if(in_class){
        var class_scope = last_scope(scopes)
    }

    var decorators = [],
        decorated = false,
        decs = ''

    // evaluate decorator in enclosing scope
    for(var dec of this.decorator_list){
        decorated = true
        var dec_id = 'decorator' + $B.UUID()
        decorators.push(dec_id)
        decs += `$B.set_lineno(frame, ${dec.lineno})\n`
        decs += `var ${dec_id} = ${$B.js_from_ast(dec, scopes)} // decorator\n`
    }

    // Detect doc string
    var docstring = extract_docstring(this, scopes)

    // Parse args
    var parsed_args = transform_args.bind(this)(scopes),
        default_names = parsed_args.default_names,
        _defaults = parsed_args._defaults,
        positional = parsed_args.positional,
        has_posonlyargs = parsed_args.has_posonlyargs,
        kw_default_names = parsed_args.kw_default_names,
        default_str = parsed_args.default_str

    var func_scope = new Scope(this.name, 'def', this)
    scopes.push(func_scope)

    var args = positional.concat(this.args.kwonlyargs),
        parse_args = [`"${this.name}"`, positional.length],
        slots = [],
        arg_names = []
    for(var arg of args){
        slots.push(arg.arg + ': null')
        // bind argument in function scope
        bind(arg.arg, scopes)
    }
    for(var arg of this.args.posonlyargs){
        arg_names.push(`'${arg.arg}'`)
    }
    if(has_posonlyargs){
        // add fake argument name to indicate end of positional args
        arg_names.push("'/'")
    }
    for(var arg of this.args.args.concat(this.args.kwonlyargs)){
        arg_names.push(`'${arg.arg}'`)
    }

    if(this.args.vararg){
        bind(this.args.vararg.arg, scopes)
    }
    if(this.args.kwarg){
        bind(this.args.kwarg.arg, scopes)
    }

    // process body first to detect possible "yield"s
    if(this.$is_lambda){
        var _return = new $B.ast.Return(this.body)
        copy_position(_return, this.body)
        var body = [_return],
            function_body = add_body(body, scopes)
    }else{
        var function_body = add_body(this.body, scopes)
    }
    var is_generator = symtable_block.generator

    var id = $B.UUID(),
        name1 = this.name + '$' + id,
        name2 = this.name + id

    var js = decs +
             `$B.set_lineno(frame, ${this.lineno})\n` +
             `var ${name1} = function(defaults){\n`

    if(is_async && ! is_generator){
        js += 'async '
    }

    js += `function ${name2}(){\n`

    var locals_name = make_scope_name(scopes, func_scope),
        gname = scopes[0].name,
        globals_name = make_scope_name(scopes, scopes[0])
    js += `var ${locals_name},
               locals\n`

    parse_args.push('{' + slots.join(', ') + '} , ' +
        '[' + arg_names.join(', ') + '], ' +
        'arguments, defaults, ' +
        (this.args.vararg ? `'${this.args.vararg.arg}', ` :
            (this.args.kwonlyargs.length > 0 ? "'*', " : 'null, ')) +
        (this.args.kwarg ? `'${this.args.kwarg.arg}'` : 'null'))
    js += `${locals_name} = locals = $B.args(${parse_args.join(', ')})\n`
    js += `var frame = ["${this.name}", locals, "${gname}", ${globals_name}, ${name2}]
    frame.__file__ = '${scopes.filename}'
    frame.$lineno = ${this.lineno}
    locals.$f_trace = $B.enter_frame(frame)
    var _frames = $B.frames_stack.slice()
    var stack_length = $B.frames_stack.length\n`

    if(is_async){
        js += 'frame.$async = true\n'
    }

    if(is_generator){
        js += `locals.$is_generator = true\n`
        if(is_async){
            js += `var gen_${id} = $B.async_generator.$factory(async function*(){\n`
        }else{
            js += `var gen_${id} = $B.generator.$factory(function*(){\n`
        }
    }
    js += `try{\n$B.js_this = this\n`
    if(in_class){
        // Set local name "__class__"
        var ix = scopes.indexOf(class_scope),
            parent = scopes[ix - 1]

        var scope_ref = make_scope_name(scopes, parent),
            class_ref = class_scope.name // XXX qualname
        bind("__class__", scopes)
        js += `locals.__class__ = ` +
            `$B.get_method_class(${scope_ref}, "${class_ref}")\n`
    }

    js += function_body + '\n'

    if((! this.$is_lambda) && ! ($B.last(this.body) instanceof $B.ast.Return)){
        // add an explicit "return None"
        js += 'var result = _b_.None\n' +
              'if(locals.$f_trace !== _b_.None){\n' +
              '$B.trace_return(_b_.None)\n}\n' +
              '$B.leave_frame();return result\n'
    }

    js += `}catch(err){
    $B.set_exc(err)
    if((! err.$in_trace_func) && locals.$f_trace !== _b_.None){
    ${locals_name}.$f_trace = $B.trace_exception()
    }
    $B.leave_frame();throw err
    }
    }\n`

    if(is_generator){
        js += `, '${this.name}')\n` +
              `var _gen_${id} = gen_${id}()\n` +
              `_gen_${id}.$frame = frame\n` +
              `$B.leave_frame()\n` +
              `return _gen_${id}}\n` // close gen
    }

    scopes.pop()

    var func_name_scope = bind(this.name, scopes),
        in_class = func_name_scope.ast instanceof $B.ast.ClassDef

    var qualname = in_class ? `${func_name_scope.name}.${this.name}` :
                              this.name

    // Flags
    var flags = 67
    if(this.args.vararg){flags |= 4}
    if(this.args.kwarg){flags |= 8}
    if(is_generator){flags |= 32}

    var parameters = [],
        locals = [],
        identifiers = Object.keys(symtable_block.symbols.$string_dict)

    var free_vars = []
    for(var ident of identifiers){
        var flag = symtable_block.symbols.$string_dict[ident][0],
            _scope = (flag >> SCOPE_OFF) & SCOPE_MASK
        if(_scope == FREE){
            free_vars.push(`'${ident}'`)
        }
        if(flag & DEF_PARAM){
            parameters.push(`'${ident}'`)
        }else if(flag & DEF_LOCAL){
            locals.push(`'${ident}'`)
        }
    }
    var varnames = parameters.concat(locals)
    // Set attribute $is_func to distinguish Brython functions from JS
    // Used in py_dom.js / DOMNode.__getattribute__
    js += `${name2}.$is_func = true\n`
    if(in_class){
        js += `${name2}.$is_method = true\n`
    }
    if(is_async){
        js += `${name2}.$is_async = true\n`
    }
    // Set admin infos
    js += `${name2}.$infos = {\n` +
        `__name__: "${this.name}", __qualname__: "${qualname}",\n` +
        `__defaults__: $B.fast_tuple([${default_names}]), ` +
        `__kwdefaults__: $B.fast_tuple([${kw_default_names}]),\n` +
        `__doc__: ${docstring},\n` +
        `__code__:{\n` +
        `co_argcount: ${positional.length},\n ` +
        `co_filename: '${scopes.filename}',\n` +
        `co_firstlineno: ${this.lineno},\n` +
        `co_flags: ${flags},\n` +
        `co_freevars: $B.fast_tuple([${free_vars}]),\n` +
        `co_kwonlyargcount: ${this.args.kwonlyargs.length},\n` +
        `co_name: '${this.name}',\n` +
        `co_nlocals: ${varnames.length},\n` +
        `co_posonlyargcount: ${this.args.posonlyargs.length},\n` +
        `co_varnames: $B.fast_tuple([${varnames}])\n` +
        `}\n}\n`

    if(is_async){
        if(is_generator){
            js += `return ${name2}`
        }else{
            js += `return $B.make_async(${name2})`
        }
    }else{
        js += `return ${name2}`
    }
    js += `}\n`

    var mangled = mangle(scopes, func_name_scope, this.name),
        func_ref = `${make_scope_name(scopes, func_name_scope)}.${mangled}`

    if(decorated){
        func_ref = `decorated${$B.UUID()}`
        js += 'var '
    }

    js += `${func_ref} = ${name1}(${default_str})\n` +
          `${func_ref}.$set_defaults = function(value){\n`+
          `return ${func_ref} = ${name1}(value)\n}\n`

    if(this.returns || parsed_args.annotations){
        var ann_items = []
        if(this.returns){
            ann_items.push(`['return', ${this.returns.to_js(scopes)}]`)
        }
        if(parsed_args.annotations){
            for(var arg_ann in parsed_args.annotations){
                var value = parsed_args.annotations[arg_ann].to_js(scopes)
                if(in_class){
                    arg_ann = mangle(scopes, class_scope, arg_ann)
                }
                ann_items.push(`['${arg_ann}', ${value}]`)
            }
        }
        js += `${func_ref}.__annotations__ = _b_.dict.$factory([${ann_items.join(', ')}])\n`
    }else{
        js += `${func_ref}.__annotations__ = $B.empty_dict()\n`
    }
    if(decorated){
        js += `${make_scope_name(scopes, func_name_scope)}.${mangled} = `
        var decorate = func_ref
        for(var dec of decorators.reverse()){
            decorate = `$B.$call(${dec})(${decorate})`
        }
        js += decorate
    }

    return js
}

$B.ast.GeneratorExp.prototype.to_js = function(scopes){
    var id = $B.UUID(),
        symtable_block = scopes.symtable.table.blocks.get(_b_.id(this)),
        varnames = symtable_block.varnames.map(x => `"${x}"`)

    var expr = this.elt,
        first_for = this.generators[0],
        // outmost expression is evaluated in enclosing scope
        outmost_expr = $B.js_from_ast(first_for.iter, scopes),
        nb_paren = 1

    var comp_scope = new Scope(`genexpr_${id}`, 'comprehension', this)
    scopes.push(comp_scope)

    var comp = {ast:this, id, type: 'genexpr', varnames,
                module_name: scopes[0].name,
                locals_name: make_scope_name(scopes),
                globals_name: make_scope_name(scopes, scopes[0])}

    var head = init_comprehension(comp, scopes)

    // special case for first generator
    var first = this.generators[0]
    var js = `var next_func_${id} = $B.next_of1(expr, frame, ${this.lineno})\n` +
          `for(var next_${id} of next_func_${id}){\n` +
              `locals.$f_trace = $B.enter_frame(frame)\n`
    // assign result of iteration to target
    var name = new $B.ast.Name(`next_${id}`, new $B.ast.Load())
    copy_position(name, first_for.iter)
    name.to_js = function(){return `next_${id}`}
    var assign = new $B.ast.Assign([first.target], name)
    assign.lineno = this.lineno
    js += assign.to_js(scopes) + '\n'

    for(var _if of first.ifs){
        nb_paren++
        js += `if($B.$bool(${$B.js_from_ast(_if, scopes)})){\n`
    }

    for(var comprehension of this.generators.slice(1)){
        js += comprehension.to_js(scopes)
        nb_paren++
        for(var _if of comprehension.ifs){
            nb_paren++
        }
    }

    // Translate element. This must be done after translating comprehensions
    // so that target names are bound
    var elt = $B.js_from_ast(this.elt, scopes),
        has_await = comp_scope.has_await

    // If the element has an "await", attribute has_await is set to the scope
    // Use it to make the function aync or not
    js = `var gen${id} = $B.generator.$factory(${has_await ? 'async ' : ''}function*(expr){\n` + js

    js += has_await ? 'var save_stack = $B.save_stack();\n' : ''
    js += `try{\n` +
          ` yield ${elt}\n` +
          `}catch(err){\n` +
          (has_await ? '$B.restore_stack(save_stack, locals)\n' : '') +
          `$B.leave_frame()\nthrow err\n}\n` +
          (has_await ? '\n$B.restore_stack(save_stack, locals);' : '')

    for(var i = 0; i < nb_paren - 1; i++){
        js += '}\n'
    }
    js += '$B.leave_frame()\n}\n'

    js += `\n}, "<genexpr>")(expr)\n`

    scopes.pop()
    var func = `${head}\n${js}\n$B.leave_frame()\nreturn gen${id}`
    return `(function(expr){\n${func}\n})(${outmost_expr})\n`
}

$B.ast.Global.prototype.to_js = function(scopes){
    var scope = last_scope(scopes)
    for(var name of this.names){
        scope.globals.add(name)
    }
    return ''
}

$B.ast.If.prototype.to_js = function(scopes){
    var scope = $B.last(scopes),
        new_scope = copy_scope(scope, this)
    // Create a new scope with the same name to avoid binding in the enclosing
    // scope.
    var js = `if($B.set_lineno(frame, ${this.lineno}) && ` +
        `$B.$bool(${$B.js_from_ast(this.test, scopes)})){\n`
    scopes.push(new_scope)
    js += add_body(this.body, scopes) + '\n}'
    scopes.pop()
    if(this.orelse.length > 0){
        if(this.orelse[0] instanceof $B.ast.If && this.orelse.length == 1){
            js += 'else ' + $B.js_from_ast(this.orelse[0], scopes) +
                  add_body(this.orelse.slice(1), scopes)
        }else{
            js += '\nelse{\n' + add_body(this.orelse, scopes) + '\n}'
        }
    }
    return js
}

$B.ast.IfExp.prototype.to_js = function(scopes){
    return '($B.$bool(' + $B.js_from_ast(this.test, scopes) + ') ? ' +
        $B.js_from_ast(this.body, scopes) + ': ' +
        $B.js_from_ast(this.orelse, scopes) + ')'
}

$B.ast.Import.prototype.to_js = function(scopes){
    var js = `$B.set_lineno(frame, ${this.lineno})\n`
    for(var alias of this.names){
        js += `$B.$import("${alias.name}", [], `
        if(alias.asname){
            js += `{'${alias.name}' : '${alias.asname}'}, `
            bind(alias.asname, scopes)
        }else{
            js += '{}, '
            bind(alias.name, scopes)
        }
        var parts = alias.name.split('.')
        for(var i = 0; i < parts.length; i++){
            scopes.imports[parts.slice(0, i + 1).join(".")] = true
        }

        js += `locals, true)\n`
    }
    return js.trimRight()
}

$B.ast.ImportFrom.prototype.to_js = function(scopes){
    if(this.module === '__future__'){
        if(! ($B.last(scopes).ast instanceof $B.ast.Module)){
            compiler_error(this,
                'from __future__ imports must occur at the beginning of the file',
                $B.last(this.names))
        }
    }

    var js = `$B.set_lineno(frame, ${this.lineno})\n` +
             `var module = $B.$import_from("${this.module || ''}", `
    var names = this.names.map(x => `"${x.name}"`).join(', '),
        aliases = []
    for(var name of this.names){
        if(name.asname){
            aliases.push(`${name.name}: '${name.asname}'`)
        }
    }
    js += `[${names}], {${aliases.join(', ')}}, ${this.level}, locals);`

    for(var alias of this.names){
        if(alias.asname){
            bind(alias.asname, scopes)
        }else if(alias.name == '*'){
            // mark scope as "blurred" by the presence of "from X import *"
            last_scope(scopes).blurred = true
            js += `\n$B.import_all(locals, module)`
        }else{
            bind(alias.name, scopes)
        }
    }
    return js
}

$B.ast.JoinedStr.prototype.to_js = function(scopes){
    var items = this.values.map(s => $B.js_from_ast(s, scopes))
    if(items.length == 0){
        return "''"
    }
    return items.join(' + ')
}

$B.ast.Lambda.prototype.to_js = function(scopes){
    // Reuse FunctionDef, with a specific name
    var id = $B.UUID(),
        name = 'lambda_' + $B.lambda_magic + '_' + id
    var f = new $B.ast.FunctionDef(name, this.args, this.body, [])
    f.lineno = this.lineno
    f.$id = _b_.id(this) // FunctionDef accesses symtable through if
    f.$is_lambda = true
    var js = f.to_js(scopes),
        lambda_ref = reference(scopes, last_scope(scopes), name)
    return `(function(){ ${js}\n` +
        `return ${lambda_ref}\n})()`
}

function list_or_tuple_to_js(func, scopes){
    if(this.elts.filter(x => x instanceof $B.ast.Starred).length > 0){
        var parts = [],
            simple = []
        for(var elt of this.elts){
            if(elt instanceof $B.ast.Starred){
                elt.$handled = true
                parts.push(`[${simple.join(', ')}]`)
                simple = []
                parts.push(`_b_.list.$factory(${$B.js_from_ast(elt, scopes)})`)
            }else{
                simple.push($B.js_from_ast(elt, scopes))
            }
        }
        if(simple.length > 0){
            parts.push(`[${simple.join(', ')}]`)
        }
        var js = parts[0]
        for(var part of parts.slice(1)){
            js += `.concat(${part})`
        }
        return `${func}(${js})`
    }

    var elts = this.elts.map(x => $B.js_from_ast(x, scopes))
    return `${func}([${elts.join(', ')}])`
}

$B.ast.List.prototype.to_js = function(scopes){
    return list_or_tuple_to_js.bind(this)('$B.$list', scopes)
}

$B.ast.ListComp.prototype.to_js = function(scopes){
    compiler_check(this)
    return make_comp.bind(this)(scopes)
}

$B.ast.match_case.prototype.to_js = function(scopes){
    var js = `($B.set_lineno(frame, ${this.lineno}) && ` +
             `$B.pattern_match(subject, {` +
             `${$B.js_from_ast(this.pattern, scopes)}})`
    if(this.guard){
        js += ` && $B.$bool(${$B.js_from_ast(this.guard, scopes)})`
    }
    js += `){\n`

    js += add_body(this.body, scopes) + '\n}'

    return js
}

function is_irrefutable(pattern){
    switch(pattern.constructor){
        case $B.ast.MatchAs:
            if(pattern.pattern === undefined){
                return pattern
            }else{
                return is_irrefutable(pattern.pattern)
            }
        case $B.ast.MatchOr:
            for(var i = 0; i < pattern.patterns.length; i++){
                if(is_irrefutable(pattern.patterns[i])){
                    if(i == pattern.patterns.length - 1){
                        // Only the last alt in a MatchOr may be irrefutable
                        return pattern
                    }
                    // Otherwise it's a SyntaxError
                    irrefutable_error(pattern.patterns[i])
                }
            }
            break
    }
}

function irrefutable_error(pattern){
    var msg = pattern.name ? `name capture '${pattern.name}'` : 'wildcard'
    msg +=  ' makes remaining patterns unreachable'
    compiler_error(pattern, msg)
}

function pattern_bindings(pattern){
    var bindings = []
    switch(pattern.constructor){
        case $B.ast.MatchAs:
            if(pattern.name){
                bindings.push(pattern.name)
            }
            break
        case $B.ast.MatchSequence:
            for(var p of pattern.patterns){
                bindings = bindings.concat(pattern_bindings(p))
            }
            break
        case $B.ast.MatchOr:
            bindings = pattern_bindings(pattern.patterns[0])
            err_msg = 'alternative patterns bind different names'
            for(var i = 1; i < pattern.patterns.length; i++){
                var _bindings = pattern_bindings(pattern.patterns[i])
                if(_bindings.length != bindings.length){
                    compiler_error(pattern, err_msg)
                }else{
                    for(var j = 0; j < bindings.length; j++){
                        if(bindings[j] != _bindings[j]){
                            compiler_error(pattern, err_msg)
                        }
                    }
                }
            }
            break
    }
    return bindings.sort()
}

$B.ast.Match.prototype.to_js = function(scopes){
    var scope = $B.last(scopes),
        irrefutable
    var js = `var subject = ${$B.js_from_ast(this.subject, scopes)}\n`,
        first = true
    for(var _case of this.cases){
        if(! _case.guard){
            if(irrefutable){
                irrefutable_error(irrefutable)
            }
            irrefutable = is_irrefutable(_case.pattern)
        }

        var case_js = $B.js_from_ast(_case, scopes)
        if(first){
            js += 'if' + case_js
            first = false
        }else{
            js += 'else if' + case_js
        }
    }
    return `$B.set_lineno(frame, ${this.lineno})\n`+ js
}

$B.ast.MatchAs.prototype.to_js = function(scopes){
    // if the pattern is None, the node represents a capture pattern
    // (i.e a bare name) and will always succeed.
    var scope = $B.last(scopes)
    var name = this.name === undefined ? '_' : this.name,
        params
    if(this.pattern === undefined){
        params = `capture: '${name}'`
    }else{
        var pattern = $B.js_from_ast(this.pattern, scopes)
        if(this.pattern instanceof $B.ast.MatchAs && this.pattern.name){
            // put inner MatchAs pattern inside a one-element group, otherwise
            // the inner MatchAs name would be overridden by this MatchAs name
            pattern = `group: [{${pattern}}]`
        }
        params = `${pattern}, alias: '${name}'`
    }
    if(scope.bindings){
        if(scope.bindings.indexOf(name) > -1){
            compiler_error(this,
                `multiple assignment to name '${name}' in pattern`)
        }
        scope.bindings.push(name)
    }
    return params
}

$B.ast.MatchClass.prototype.to_js = function(scopes){
    var names = []
    for(var pattern of this.patterns.concat(this.kwd_patterns)){
        var name = pattern.name
        if(name){
            if(names.indexOf(name) > -1){
                compiler_error(pattern,
                     `multiple assignment to name '${name}' in pattern`)
            }
            names.push(name)
        }
    }

    names = []
    for(var i = 0; i < this.kwd_attrs.length; i++){
        var kwd_attr = this.kwd_attrs[i]
        if(names.indexOf(kwd_attr) > -1){
            compiler_error(this.kwd_patterns[i],
                `attribute name repeated in class pattern: ${kwd_attr}`)
        }
        names.push(kwd_attr)
    }

    var cls = $B.js_from_ast(this.cls, scopes),
        patterns = this.patterns.map(x => `{${$B.js_from_ast(x, scopes)}}`)
    var kw = []
    for(var i = 0, len = this.kwd_patterns.length; i < len; i++){
        kw.push(this.kwd_attrs[i] + ': {' +
            $B.js_from_ast(this.kwd_patterns[i], scopes) + '}')
    }
    return `class: ${cls}, args: [${patterns}], keywords: {${kw.join(', ')}}`
}

$B.ast.MatchMapping.prototype.to_js = function(scopes){
    var keys = []
    for(var key of this.keys){
        if(key instanceof $B.ast.Attribute){
            continue
        }else if(key instanceof $B.ast.Constant ||
                key instanceof $B.ast.UnaryOp ||
                key instanceof $B.ast.BinOp){
            var value = eval(key.to_js(scopes))
            if(_b_.list.__contains__(keys, value)){
                compiler_error(this, 'mapping pattern checks duplicate key ' +
                    `(${_b_.repr(value)})`)
            }
            keys.push(value)
        }else{
            compiler_error(key,
                'mapping pattern keys may only match literals and attribute lookups')
        }
    }
    var names = []
    for(var pattern of this.patterns){
        if(pattern instanceof $B.ast.MatchAs && pattern.name){
            if(names.indexOf(pattern.name) > -1){
                compiler_error(pattern,
                    `multiple assignments to name '${pattern.name}' in pattern`)
            }
            names.push(pattern.name)
        }
    }
    var items = []
    for(var i = 0, len = this.keys.length; i < len; i++){
        var key_prefix = this.keys[i] instanceof $B.ast.Constant ?
                            'literal: ' : 'value: '
        var key = $B.js_from_ast(this.keys[i], scopes),
            value = $B.js_from_ast(this.patterns[i], scopes)
        items.push(`[{${key_prefix}${key}}, {${value}}]`)
    }
    var js = 'mapping: [' + items.join(', ') + ']'
    if(this.rest){
        js += `, rest: '${this.rest}'`
    }
    return js
}

$B.ast.MatchOr.prototype.to_js = function(scopes){
    is_irrefutable(this)
    pattern_bindings(this)
    var items = []
    for(var alt of this.patterns){
        items.push(`{${$B.js_from_ast(alt, scopes)}}`)
    }
    var js = items.join(', ')
    return `or: [${js}]`
}

$B.ast.MatchSequence.prototype.to_js = function(scopes){
    var items = [],
        names = []
    for(var pattern of this.patterns){
        if(pattern instanceof $B.ast.MatchAs && pattern.name){
            if(names.indexOf(pattern.name) > -1){
                compiler_error(pattern,
                    `multiple assignments to name '${pattern.name}' in pattern`)
            }
            names.push(pattern.name)
        }
        items.push('{' + $B.js_from_ast(pattern, scopes) + '}')
    }
    return `sequence: [${items.join(', ')}]`
}

$B.ast.MatchSingleton.prototype.to_js = function(scopes){
    var value = this.value === true ? '_b_.True' :
                this.value === false ? '_b_.False' :
                '_b_.None'

    return `literal: ${value}`
}

$B.ast.MatchStar.prototype.to_js = function(scopes){
    var name = this.name === undefined ? '_' : this.name
    return `capture_starred: '${name}'`
}

$B.ast.MatchValue.prototype.to_js = function(scopes){
    if(this.value instanceof $B.ast.Constant){
        return `literal: ${$B.js_from_ast(this.value, scopes)}`
    }else if(this.value instanceof $B.ast.Constant ||
                this.value instanceof $B.ast.UnaryOp ||
                this.value instanceof $B.ast.BinOp ||
                this.value instanceof $B.ast.Attribute){
        return `value: ${$B.js_from_ast(this.value, scopes)}`
    }else{
        compiler_error(this,
            'patterns may only match literals and attribute lookups')
    }
}

$B.ast.Module.prototype.to_js = function(scopes){
    mark_parents(this)
    // create top scope; namespaces can be passed by exec()
    var name = init_scopes.bind(this)('module', scopes),
        namespaces = scopes.namespaces

    var module_id = name,
        global_name = make_scope_name(scopes),
        mod_name = module_name(scopes)

    var js = `// Javascript code generated from ast\n` +
             `var $B = __BRYTHON__,\n_b_ = $B.builtins,\n`
    if(! namespaces){
        js += `${global_name} = $B.imported["${mod_name}"],\n` +
              `locals = ${global_name},\n` +
              `frame = ["${module_id}", locals, "${module_id}", locals]`
    }else{
        // If module is run in an exec(), name "frame" is defined
        js += `locals = ${namespaces.local_name},\n` +
              `globals = ${namespaces.global_name}`
        if(name){
            js += `,\nlocals_${name} = locals`
        }
    }
    js += `\nframe.__file__ = '${scopes.filename || "<string>"}'\n` +
          `locals.__name__ = '${name}'\n` +
          `locals.__doc__ = ${extract_docstring(this, scopes)}\n`

    if(! scopes.imported){
          js += `locals.__annotations__ = locals.__annotations__ || $B.empty_dict()\n`
    }

    if(! namespaces){
        // for exec(), frame is put on top of the stack inside
        // py_builtin_functions.js / $$eval()
        js += `locals.$f_trace = $B.enter_frame(frame)\n`
    }
    js += `$B.set_lineno(frame, 1)\n` +
          '\nvar _frames = $B.frames_stack.slice()\n' +
          `var stack_length = $B.frames_stack.length\n` +
          `try{\n` +
              add_body(this.body, scopes) + '\n' +
              (namespaces ? '' : `$B.leave_frame({locals, value: _b_.None})\n`) +
          `}catch(err){\n` +
              `$B.set_exc(err)\n` +
              `if((! err.$in_trace_func) && locals.$f_trace !== _b_.None){\n` +
                  `locals.$f_trace = $B.trace_exception()\n` +
              `}\n` +
              (namespaces ? '' : `$B.leave_frame({locals, value: _b_.None})\n`) +
              'throw err\n' +
          `}`
    scopes.pop()
    return js
}

$B.ast.Name.prototype.to_js = function(scopes){
    if(this.ctx instanceof $B.ast.Store){
        // In which namespace should it be stored ?
        var scope = bind(this.id, scopes)
        if(scope === $B.last(scopes) && scope.freevars.has(this.id)){
            // name was referenced but is declared local afterwards
            scope.freevars.delete(this.id)
        }
        return reference(scopes, scope, this.id)
    }else if(this.ctx instanceof $B.ast.Load){
        var res = name_reference(this.id, scopes,
             [this.col_offset, this.col_offset, this.end_col_offset])
        if(this.id == '__debugger__' && res.startsWith('$B.resolve_in_scopes')){
            // Special case : name __debugger__ is translated to Javascript
            // "debugger" if not bound in Brython code
            return 'debugger'
        }
        return res
    }
}

$B.ast.NamedExpr.prototype.to_js = function(scopes){
    // Named expressions in a comprehension are bound in the enclosing scope
    var i = scopes.length - 1
    while(scopes[i].type == 'comprehension'){
        i--
    }
    var enclosing_scopes = scopes.slice(0, i + 1)
    enclosing_scopes.symtable = scopes.symtable
    bind(this.target.id, enclosing_scopes)
    return '(' + $B.js_from_ast(this.target, enclosing_scopes) + ' = ' +
        $B.js_from_ast(this.value, scopes) + ')'
}

$B.ast.Nonlocal.prototype.to_js = function(scopes){
    var scope = $B.last(scopes)
    for(var name of this.names){
        scope.nonlocals.add(name)
    }
    return ''
}

$B.ast.Pass.prototype.to_js = function(scopes){
    return `$B.set_lineno(frame, ${this.lineno})\n` +
           'void(0)'
}

$B.ast.Raise.prototype.to_js = function(scopes){
    var js = `$B.set_lineno(frame, ${this.lineno})\n` +
             '$B.$raise('
    if(this.exc){
        js += $B.js_from_ast(this.exc, scopes)
    }
    if(this.cause){
        js += ', ' + $B.js_from_ast(this.cause, scopes)
    }
    return js + ')'
}

$B.ast.Return.prototype.to_js = function(scopes){
    // check that return is inside a function
    compiler_check(this)
    var js = `$B.set_lineno(frame, ${this.lineno})\n` +
             'var result = ' +
             (this.value ? $B.js_from_ast(this.value, scopes) : ' _b_.None')
    js += `\nif(locals.$f_trace !== _b_.None){\n` +
          `$B.trace_return(result)\n}\n` +
          `$B.leave_frame()\nreturn result\n`
    return js
}

$B.ast.Set.prototype.to_js = function(scopes){
    for(var elt of this.elts){
        if(elt instanceof $B.ast.Starred){
            elt.$handled = true
        }
    }
    var call_obj = {args: this.elts, keywords: []}
    var call = make_args.bind(call_obj)(scopes),
        js = call.js
    if(! call.has_starred){
        js = `[${js}]`
    }

    return `_b_.set.$factory(${js})`
}

$B.ast.SetComp.prototype.to_js = function(scopes){
    return make_comp.bind(this)(scopes)
}

$B.ast.Slice.prototype.to_js = function(scopes){
    var lower = this.lower ? $B.js_from_ast(this.lower, scopes) : '_b_.None',
        upper = this.upper ? $B.js_from_ast(this.upper, scopes) : '_b_.None',
        step = this.step ? $B.js_from_ast(this.step, scopes) : '_b_.None'
    return `_b_.slice.$fast_slice(${lower}, ${upper}, ${step})`
}

$B.ast.Starred.prototype.to_js = function(scopes){
    if(this.$handled){
        return `_b_.list.$unpack(${$B.js_from_ast(this.value, scopes)})`
    }
    if(this.ctx instanceof $B.ast.Store){
        compiler_error(this,
            "starred assignment target must be in a list or tuple")
    }else{
        compiler_error(this, "can't use starred expression here")
    }
}

$B.ast.Subscript.prototype.to_js = function(scopes){
    var value = $B.js_from_ast(this.value, scopes),
        slice = $B.js_from_ast(this.slice, scopes)
    if(this.slice instanceof $B.ast.Slice){
        return `$B.getitem_slice(${value}, ${slice})`
    }else{
        if($B.pep657){
            return `$B.$getitem(${value}, ${slice}, ` +
                `[${this.value.col_offset}, ${this.slice.col_offset}, ` +
                `${this.slice.end_col_offset}])`
        }
        return `$B.$getitem(${value}, ${slice})`
    }
}

$B.ast.Try.prototype.to_js = function(scopes){
    compiler_check(this)
    var id = $B.UUID(),
        has_except_handlers = this.handlers.length > 0,
        has_else = this.orelse.length > 0,
        has_finally = this.finalbody.length > 0

    var js = `$B.set_lineno(frame, ${this.lineno})\ntry{\n`

    // Save stack length. Used if there is an 'else' clause and no 'finally':
    // if the 'try' body ran without an exception and ended with a 'return',
    // don't execute the 'else' clause
    js += `var stack_length_${id} = $B.frames_stack.length\n`

    // Save execution stack in case there are return statements and a finally
    // block
    if(has_finally){
        js += `var save_stack_${id} = $B.frames_stack.slice()\n`
    }
    if(has_else){
        js += `var failed${id} = false\n`
    }

    var try_scope = copy_scope($B.last(scopes))
    scopes.push(try_scope)
    js += add_body(this.body, scopes) + '\n'
    if(has_except_handlers){
        var err = 'err' + id
        js += '}\n' // close try
        js += `catch(${err}){\n` +
              `$B.set_exc(${err})\n` +
              `if(locals.$f_trace !== _b_.None){\n` +
              `locals.$f_trace = $B.trace_exception()}\n`
        if(has_else){
            js += `failed${id} = true\n`
        }
        var first = true,
            has_untyped_except = false
        for(var handler of this.handlers){
            if(first){
                js += 'if'
                first = false
            }else{
                js += '}else if'
            }
            js += `($B.set_lineno(frame, ${handler.lineno})`
            if(handler.type){
                js += ` && $B.is_exc(${err}, `
                if(handler.type instanceof $B.ast.Tuple){
                    js += `${$B.js_from_ast(handler.type, scopes)}`
                }else{
                    js += `[${$B.js_from_ast(handler.type, scopes)}]`
                }
                js += `)){\n`
            }else{
                has_untyped_except = true
                js += '){\n'
            }
            if(handler.name){
                bind(handler.name, scopes)
                var mangled = mangle(scopes, try_scope, handler.name)
                js += `locals.${mangled} = ${err}\n`
            }
            js += add_body(handler.body, scopes) + '\n'
            if(! ($B.last(handler.body) instanceof $B.ast.Return)){
                // delete current exception
                js += '$B.del_exc()\n'
            }
        }
        if(! has_untyped_except){
            // handle other exceptions
            js += `}else{\nthrow ${err}\n`
        }
        // close last if
        js += '}\n'
    }
    if(has_else || has_finally){
        js += '}\n' // close try
        js += 'finally{\n'
        var finalbody = `var exit = false\n` +
                        `if($B.frames_stack.length < stack_length_${id}){\n` +
                            `exit = true\n` +
                            `$B.frames_stack.push(frame)\n` +
                        `}\n` +
                        add_body(this.finalbody, scopes)
        if(this.finalbody.length > 0 &&
                ! ($B.last(this.finalbody) instanceof $B.ast.Return)){
            finalbody += `\nif(exit){\n` +
                           `$B.leave_frame()\n` +
                        `}`
        }
        // The 'else' clause is executed if no exception was raised, and if
        // there was no 'return' in the 'try' block (in which case the stack
        // was popped from)
        var elsebody = `if($B.frames_stack.length == stack_length_${id} ` +
                       `&& ! failed${id}){\n` +
                       add_body(this.orelse, scopes) +
                       '\n}' // close "if"
        if(has_else && has_finally){
            js += `try{\n` +
                  elsebody +
                  '\n}\n' + // close "try"
                  `finally{\n` + finalbody + '}\n'
        }else if(has_else && ! has_finally){
            js += elsebody
        }else{
            js += finalbody
        }
        js += '\n}\n' // close "finally"
    }else{
        js += '}\n' // close catch
    }
    scopes.pop()
    return js
}

$B.ast.Tuple.prototype.to_js = function(scopes){
    return list_or_tuple_to_js.bind(this)('$B.fast_tuple', scopes)
}

$B.ast.UnaryOp.prototype.to_js = function(scopes){
    var operand = $B.js_from_ast(this.operand, scopes)
    if(this.op instanceof $B.ast.Not){
        return `! $B.$bool(${operand})`
    }
    if(typeof operand == "number" || operand instanceof Number){
        if(this.op instanceof $B.ast.UAdd){
            return operand + ''
        }else if(this.op instanceof $B.ast.USub){
            return -operand + ''
        }
    }
    var method = opclass2dunder[this.op.constructor.$name]
    return `$B.$getattr($B.get_class(locals.$result = ${operand}), '${method}')(locals.$result)`
}

$B.ast.While.prototype.to_js = function(scopes){
    var id = $B.UUID()

    // Create a new scope with the same name to avoid binding in the enclosing
    // scope.
    var scope = $B.last(scopes),
        new_scope = copy_scope(scope, this)

    scopes.push(new_scope)

    // Set a variable to detect a "break"
    var js = `var no_break_${id} = true\n`

    js += `while($B.set_lineno(frame, ${this.lineno}) && ` +
        `$B.$bool(${$B.js_from_ast(this.test, scopes)})){\n`
    js += add_body(this.body, scopes) + '\n}'

    scopes.pop()

    if(this.orelse.length > 0){
        js += `\nif(no_break_${id}){\n` +
              add_body(this.orelse, scopes) + '}\n'
    }


    return js
}

var with_counter = [0]

$B.ast.With.prototype.to_js = function(scopes){
    /* PEP 243 says that

    with EXPR as VAR:
        BLOCK

    is transformed into

    mgr = (EXPR)
    exit = type(mgr).__exit__  # Not calling it yet
    value = type(mgr).__enter__(mgr)
    exc = True
    try:
        try:
            VAR = value  # Only if "as VAR" is present
            BLOCK
        except:
            # The exceptional case is handled here
            exc = False
            if not exit(mgr, *sys.exc_info()):
                raise
            # The exception is swallowed if exit() returns true
    finally:
        # The normal and non-local-goto cases are handled here
        if exc:
            exit(mgr, None, None, None)

    */

    function add_item(item, js){
        var id = $B.UUID()
        var s = `var mgr_${id} = ` +
              $B.js_from_ast(item.context_expr, scopes) + ',\n' +
              `klass = $B.get_class(mgr_${id})\n` +
              `try{\n` +
                  `var exit_${id} = $B.$getattr(klass, '__exit__'),\n` +
                      `enter_${id} = $B.$getattr(klass, '__enter__')\n` +
              `}catch(err){\n` +
                  `var klass_name = $B.get_class(mgr_${id})\n` +
                  `throw _b_.TypeError.$factory("'" + klass_name + ` +
                      `"' object does not support the con` +
                      // split word 'context', replaced by "C" in brython.js...
                      `text manager protocol")\n` +
              `}\n` +
              `var value_${id} = $B.$call($B.$getattr(klass, ` +
                  `'__enter__'))(mgr_${id}),\n` +
              `exc_${id} = true\n`
        if(in_generator){
            // add/update attribute used to close context managers in
            // leave_frame()
            s += `locals.$context_managers = locals.$context_managers || []\n` +
                 `locals.$context_managers.push(mgr_${id})\n`
        }
        s += 'try{\ntry{\n'
        if(item.optional_vars){
            var value = {to_js: function(){return `value_${id}`}}
            copy_position(value, _with)
            var assign = new $B.ast.Assign([item.optional_vars], value)
            copy_position(assign, _with)
            s += assign.to_js(scopes) + '\n'
        }
        s += js
        s += `}catch(err_${id}){\n` +
                  `frame.$lineno = ${lineno}\n` +
                  `exc_${id} = false\n` +
                  `err_${id} = $B.exception(err_${id}, frame)\n` +
                  `var $b = exit_${id}(mgr_${id}, err_${id}.__class__, ` +
                  `err_${id}, $B.$getattr(err_${id}, '__traceback__'))\n` +
                  `if(! $B.$bool($b)){\n` +
                      `throw err_${id}\n` +
                  `}\n` +
              `}\n`

        s += `}\nfinally{\n` +
                  `frame.$lineno = ${lineno}\n` +
                  (in_generator ? `locals.$context_managers.pop()\n` : '') +
                  `if(exc_${id}){\n` +
                      `try{\n` +
                          `exit_${id}(mgr_${id}, _b_.None, _b_.None, _b_.None)\n` +
                      `}catch(err){\n` +
                          // If an error occurs in __exit__, make sure the
                          // stack frame is preserved (it may have been
                          // modified by a "return" in the "with" block)
                          `if($B.frames_stack.length < stack_length){\n` +
                              `$B.frames_stack.push(frame)\n` +
                          `}\n` +
                          `throw err\n` +
                      `}\n` +
                  `}\n` +
              `}\n`
        return s
    }

    var _with = this,
        scope = last_scope(scopes),
        lineno = this.lineno

    js = add_body(this.body, scopes) + '\n'
    var in_generator = scopes.symtable.table.blocks.get(_b_.id(scope.ast)).generator
    for(var item of this.items.slice().reverse()){
        js = add_item(item, js)
    }
    return `$B.set_lineno(frame, ${this.lineno})\n` + js
}

$B.ast.Yield.prototype.to_js = function(scopes){
    // Mark current scope as generator
    var scope = last_scope(scopes)
    if(scope.type != 'def'){
        compiler_error(this, "'yield' outside function")
    }
    last_scope(scopes).is_generator = true
    var value = this.value ? $B.js_from_ast(this.value, scopes) : '_b_.None'
    return `yield ${value}`
}

$B.ast.YieldFrom.prototype.to_js = function(scopes){
    /* PEP 380 :

        RESULT = yield from EXPR

    is semantically equivalent to

        _i = iter(EXPR)
        try:
            _y = next(_i)
        except StopIteration as _e:
            _r = _e.value
        else:
            while 1:
                try:
                    _s = yield _y
                except GeneratorExit as _e:
                    try:
                        _m = _i.close
                    except AttributeError:
                        pass
                    else:
                        _m()
                    raise _e
                except BaseException as _e:
                    _x = sys.exc_info()
                    try:
                        _m = _i.throw
                    except AttributeError:
                        raise _e
                    else:
                        try:
                            _y = _m(*_x)
                        except StopIteration as _e:
                            _r = _e.value
                            break
                else:
                    try:
                        if _s is None:
                            _y = next(_i)
                        else:
                            _y = _i.send(_s)
                    except StopIteration as _e:
                        _r = _e.value
                        break
        RESULT = _r
    */
    var scope = last_scope(scopes)
    if(scope.type != 'def'){
        compiler_error(this, "'yield' outside function")
    }
    scope.is_generator = true
    var value = $B.js_from_ast(this.value, scopes)
    var n = $B.UUID()
    return `yield* (function* f(){
        var _i${n} = _b_.iter(${value}),
                _r${n}
            var failed${n} = false
            try{
                var _y${n} = _b_.next(_i${n})
            }catch(_e){
                $B.set_exc(_e)
                failed${n} = true
                $B.pmframe = $B.last($B.frames_stack)
                _e = $B.exception(_e)
                if(_e.__class__ === _b_.StopIteration){
                    var _r${n} = $B.$getattr(_e, "value")
                }else{
                    throw _e
                }
            }
            if(! failed${n}){
                while(true){
                    var failed1${n} = false
                    try{
                        $B.leave_frame()
                        var _s${n} = yield _y${n}
                        $B.frames_stack.push(frame)
                    }catch(_e){
                        if(_e.__class__ === _b_.GeneratorExit){
                            var failed2${n} = false
                            try{
                                var _m${n} = $B.$getattr(_i${n}, "close")
                            }catch(_e1){
                                failed2${n} = true
                                if(_e1.__class__ !== _b_.AttributeError){
                                    throw _e1
                                }
                            }
                            if(! failed2${n}){
                                $B.$call(_m${n})()
                            }
                            throw _e
                        }else if($B.is_exc(_e, [_b_.BaseException])){
                            var sys_module = $B.imported._sys,
                                _x = sys_module.exc_info()
                            var failed3${n} = false
                            try{
                                var _m${n} = $B.$getattr(_i${n}, "throw")
                            }catch(err){
                                failed3${n} = true
                                if($B.is_exc(err, [_b_.AttributeError])){
                                    throw err
                                }
                            }
                            if(! failed3${n}){
                                try{
                                    _y${n} = $B.$call(_m${n}).apply(null,
                                        _b_.list.$factory(_x${n}))
                                }catch(err){
                                    if($B.$is_exc(err, [_b_.StopIteration])){
                                        _r${n} = $B.$getattr(err, "value")
                                        break
                                    }
                                    throw err
                                }
                            }
                        }
                    }
                    if(! failed1${n}){
                        try{
                            if(_s${n} === _b_.None){
                                _y${n} = _b_.next(_i${n})
                            }else{
                                _y${n} = $B.$call($B.$getattr(_i${n}, "send"))(_s${n})
                            }
                        }catch(err){
                            if($B.is_exc(err, [_b_.StopIteration])){
                                _r${n} = $B.$getattr(err, "value")
                                break
                            }
                            throw err
                        }
                    }
                }
            }
            return _r${n}
        })()`
}
var state = {}

$B.js_from_root = function(arg){
    var ast_root = arg.ast,
        symtable = arg.symtable,
        filename = arg.filename
        namespaces = arg.namespaces,
        imported = arg.imported

    if($B.show_ast_dump){
        console.log($B.ast_dump(ast_root))
    }
    if($B.compiler_check){
        $B.compiler_check(ast_root, symtable)
    }
    var scopes = []
    state.filename = filename
    scopes.symtable = symtable
    scopes.filename = filename
    scopes.namespaces = namespaces
    scopes.imported = imported
    scopes.imports = {}
    var js = ast_root.to_js(scopes)
    return {js, imports: scopes.imports}
}

$B.js_from_ast = function(ast, scopes){
    if(! scopes.symtable){
        throw Error('perdu symtable')
    }
    var js = ''
    scopes = scopes || []
    if(ast.to_js !== undefined){
        if(ast.col_offset === undefined){
            var klass = ast.constructor.$name
            if(['match_case'].indexOf(klass) == -1){
                console.log('pas de col offset pour', klass)
                console.log(ast)
                throw Error('ccc')
                alert()
            }
        }
        return ast.to_js(scopes)
    }
    console.log("unhandled", ast.constructor.$name)
    return '// unhandled class ast.' + ast.constructor.$name
}

})(__BRYTHON__)