"use strict";
(function($B){

var _b_ = $B.builtins

function ast_dump(tree, indent){
    var attr,
        value
    indent = indent || 0
    if(tree === _b_.None){
        // happens in dictionary keys for **kw
        return 'None'
    }else if(typeof tree == 'string'){
        return `'${tree}'`
    }else if(typeof tree == 'number'){
        return tree + ''
    }else if(tree.imaginary){
        return tree.value + 'j'
    }else if(Array.isArray(tree)){
        if(tree.length == 0){
            return '[]'
        }
        res = '[\n'
        var items = []
        for(var x of tree){
            try{
                items.push(ast_dump(x, indent + 1))
            }catch(err){
                console.log('error', tree)
                console.log('for item', x)
                throw err
            }
        }
        res += items.join(',\n')
        return res + ']'
    }else if(tree.$name){
        return tree.$name + '()'
    }else if(tree instanceof $B.ast.MatchSingleton){
        return `MatchSingleton(value=${$B.AST.$convert(tree.value)})`
    }else if(tree instanceof $B.ast.Constant){
        value = tree.value
        // For imaginary numbers, value is an object with
        // attribute "imaginary" set
        if(value.imaginary){
            return `Constant(value=${_b_.repr(value.value)}j)`
        }
        return `Constant(value=${$B.AST.$convert(value)})`
    }
    var proto = Object.getPrototypeOf(tree).constructor
    var res = '  '.repeat(indent) + proto.$name + '('
    if($B.ast_classes[proto.$name] === undefined){
        console.log('no ast class', proto)
    }
    var attr_names = $B.ast_classes[proto.$name].split(','),
        attrs = []
    // remove trailing * in attribute names
    attr_names = attr_names.map(x => (x.endsWith('*') || x.endsWith('?')) ?
                                     x.substr(0, x.length - 1) : x)
    if([$B.ast.Name].indexOf(proto) > -1){
        for(attr of attr_names){
            if(tree[attr] !== undefined){
                attrs.push(`${attr}=${ast_dump(tree[attr])}`)
            }
        }
        return res + attrs.join(', ') + ')'
    }
    for(attr of attr_names){
        if(tree[attr] !== undefined){
            value = tree[attr]
            attrs.push(attr + '=' +
                ast_dump(tree[attr], indent + 1).trimStart())
        }
    }
    if(attrs.length > 0){
        res += '\n'
        res += attrs.map(x => '  '.repeat(indent + 1) + x).join(',\n')
    }
    res  += ')'
    return res
}


function string_from_ast_value(value){
    // remove escaped "'" in string value
    return value.replace(new RegExp("\\\\'", 'g'), "'")
}


function compiler_error(ast_obj, message, end){
    prefix = ''
    var exc = _b_.SyntaxError.$factory(message)
    exc.filename = state.filename
    if(exc.filename != '<string>'){
        var src = $B.file_cache[exc.filename],
            lines = src.split('\n'),
            line = lines[ast_obj.lineno - 1]
        exc.text = line
    }else{
        exc.text = _b_.None
    }
    exc.lineno = ast_obj.lineno
    exc.offset = ast_obj.col_offset + 1
    end = end || ast_obj
    exc.end_lineno = end.end_lineno
    exc.end_offset = end.end_col_offset + 1
    exc.args[1] = [exc.filename, exc.lineno, exc.offset, exc.text,
                   exc.end_lineno, exc.end_offset]
    exc.__traceback__ = $B.make_tb()
    throw exc
}

var uuid = Math.floor(Math.random() * 1000000)
function make_id(){
    uuid += 1
    return uuid
}

function fast_id(obj){
    // faster than calling _b_.id
    if(obj.$id !== undefined){
        return obj.$id
    }
    return obj.$id = make_id()
}

function copy_position(target, origin){
    target.lineno = origin.lineno
    target.col_offset = origin.col_offset
    target.end_lineno = origin.end_lineno
    target.end_col_offset = origin.end_col_offset
}

function encode_position(){
    return `[${Array.from(arguments).join(',')}]`
}

$B.decode_position = function(pos){
    return pos
}

function get_source_from_position(scopes, ast_obj){
    scopes.lines = scopes.lines ?? scopes.src.split('\n')
    var lines = scopes.lines,
        start_line = lines[ast_obj.lineno - 1],
        res
    if(ast_obj.end_lineno == ast_obj.lineno){
        res = start_line.substring(ast_obj.col_offset, ast_obj.end_col_offset)
    }else{
        var res = start_line.substr(ast_obj.col_offset),
            line_num = ast_obj.lineno + 1
        while(line_num < ast_obj.end_lineno){
            res += lines[line_num - 1].trimLeft()
            line_num++
        }
        res += lines[ast_obj.end_lineno - 1].substr(0, ast_obj.end_col_offset).trimLeft()
    }
    return res.replace(new RegExp("'", 'g'), "\\'")
}

function get_names(ast_obj){
    // get all names used in ast object
    var res = new Set()
    if(ast_obj instanceof $B.ast.Name){
        res.add(ast_obj)
    }else if(ast_obj instanceof $B.ast.Subscript){
        for(var item of get_names(ast_obj.value)){
            res.add(item)
        }
    }
    return res
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
    if(up_scope.type == 'class'){
        up_scope.maybe_locals = up_scope.maybe_locals ?? new Set()
        up_scope.maybe_locals.add(name)
    }
    return scope
}

var SF = $B.SYMBOL_FLAGS // in brython_builtins.js

function name_reference(name, scopes, ast_obj){
    var scope = name_scope(name, scopes)
    return make_ref(name, scopes, scope, ast_obj)
}

function make_ref(name, scopes, scope, ast_obj){
    var test = false // name == 'record' && scopes[scopes.length - 1].name == "g"
    if(test){
        console.log('make ref', name, scopes.slice(), scope)
    }
    if(scope.found){
        var res = reference(scopes, scope.found, name)
        if(test){
            console.log('res', res)
        }
        return res
    }else{
        var inum = add_to_positions(scopes, ast_obj)
        if(scope.resolve == 'all'){
            var scope_names = make_search_namespaces(scopes)
            return `$B.resolve_in_scopes('${name}', [${scope_names}], ${inum})`
        }else if(scope.resolve == 'local'){
            return `$B.resolve_local('${name}', ${inum})`
        }else if(scope.resolve == 'global'){
            return `$B.resolve_global('${name}', _frame_obj, ${inum})`
        }else if(Array.isArray(scope.resolve)){
            return `$B.resolve_in_scopes('${name}', [${scope.resolve}], ${inum})`
        }else if(scope.resolve == 'own_class_name'){
            return `$B.own_class_name('${name}', ${inum})`
        }
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
    var test = false // name == 'xw' // && scopes[scopes.length - 1].name == "g"
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
        up_scope = last_scope(scopes)
    name = mangle(scopes, scope, name)

    // Use symtable to detect if the name is local to the block
    if(up_scope.ast === undefined){
        console.log('no ast', scope)
    }
    block = scopes.symtable.table.blocks.get(fast_id(up_scope.ast))
    if(block === undefined){
        console.log('no block', scope, scope.ast, 'id', fast_id(up_scope.ast))
        console.log('scopes', scopes.slice())
        console.log('symtable', scopes.symtable)
    }
    if(test){
        console.log('block symbols', block.symbols)
    }
    try{
        flags = _b_.dict.$getitem_string(block.symbols, name)
    }catch(err){
        console.log('name', name, 'not in symbols of block', block)
        console.log('symtables', scopes.symtable)
        console.log('scopes', scopes.slice())
        return {found: false, resolve: 'all'}
    }
    let __scope = (flags >> SF.SCOPE_OFF) & SF.SCOPE_MASK,
        is_local = [SF.LOCAL, SF.CELL].indexOf(__scope) > -1
    if(test){
        console.log('block', block, 'is local', is_local, '__scope', __scope)
        console.log('flags', flags, 'scopeoff', SF.SCOPE_OFF, 'scope mask', SF.SCOPE_MASK)
    }
    if(up_scope.ast instanceof $B.ast.ClassDef && name == up_scope.name){
        return {found: false, resolve: 'own_class_name'}
    }
    // special case
    if(name == '__annotations__'){
        if(block.type == SF.TYPE_CLASS && up_scope.has_annotation){
            is_local = true
        }else if(block.type == SF.TYPE_MODULE){
            is_local = true
        }
    }
    if(test){
        console.log('is local ???', is_local, 'scope', scope)
    }
    if(is_local){
        // name is local (symtable) but may not have yet been bound in scope
        // If scope is a "subscope", look in its parents
        var l_scope = local_scope(name, scope)
        if(test){
            console.log('l_scope', l_scope)
        }
        if(! l_scope.found){
            if(block.type == SF.TYPE_CLASS){
                // In class definition, unbound local variables are looked up
                // in the global namespace (Language Reference 4.2.2)
                scope.needs_frames = true
                if(scope.maybe_locals && scope.maybe_locals.has(name)){
                    return {found: false, resolve: 'local'}
                }
                return {found: false, resolve: 'global'}
            }else if(block.type == SF.TYPE_MODULE){
                scope.needs_frames = true
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
        scope.needs_frames = true
        return {found: false, resolve: 'global'}
    }else if(scope.nonlocals.has(name)){
        // Search name in the surrounding scopes, using symtable
        for(let i = scopes.length - 2; i >= 0; i--){
            block = scopes.symtable.table.blocks.get(fast_id(scopes[i].ast))
            if(block && _b_.dict.$contains_string(block.symbols, name)){
                var fl = _b_.dict.$getitem_string(block.symbols, name),
                    local_to_block =
                        [SF.LOCAL, SF.CELL].indexOf((fl >> SF.SCOPE_OFF) & SF.SCOPE_MASK) > -1
                if(! local_to_block){
                    continue
                }
                return {found: scopes[i]}
            }
        }
    }

    if(scope.has_import_star){
        if(! is_local){
            scope.needs_frames = true
        }
        return {found: false, resolve: is_local ? 'all' : 'global'}
    }
    for(let i = scopes.length - 2; i >= 0; i--){
        block = undefined
        if(scopes[i].ast){
            block = scopes.symtable.table.blocks.get(fast_id(scopes[i].ast))
        }
        if(scopes[i].globals.has(name)){
            scope.needs_frames = true
            return {found: false, resolve: 'global'}
        }
        if(scopes[i].locals.has(name) && scopes[i].type != 'class'){
            return {found: scopes[i]} // reference(scopes, scopes[i], name)
        }else if(block && _b_.dict.$contains_string(block.symbols, name)){
            flags = _b_.dict.$getitem_string(block.symbols, name)
            let __scope = (flags >> SF.SCOPE_OFF) & SF.SCOPE_MASK
            if([SF.LOCAL, SF.CELL].indexOf(__scope) > -1){
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
                    if(! $B.is_exc(err, [_b_.KeyError])){
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
        current_globals,
        frame_obj = $B.frame_obj,
        frame

    while(frame_obj !== null){
        frame = frame_obj.frame
        if(current_globals === undefined){
            current_globals = frame[3]
        }else if(frame[3] !== current_globals){
            let v = resolve_in_namespace(name, current_globals)
            if(v.found){
                return v.value
            }
            checked.add(current_globals)
            current_globals = frame[3]
        }
        let v = resolve_in_namespace(name, frame[1])
        if(v.found){
            return v.value
        }
        frame_obj = frame_obj.prev
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

$B.resolve_local = function(name, inum){
    // Translation of a reference to "name" when symtable reports that "name"
    // is local, but it has not been bound in scope locals
    if($B.frame_obj !== null){

        var frame = $B.frame_obj.frame
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
    }
    var exc = _b_.UnboundLocalError.$factory(`cannot access local variable ` +
              `'${name}' where it is not associated with a value`)
    $B.set_inum(inum)
    throw exc
}

$B.resolve_in_scopes = function(name, namespaces, inum){
    for(var ns of namespaces){
        if(ns === $B.exec_scope){
            var exec_top,
                frame_obj = $B.frame_obj,
                frame
            while(frame_obj !== null){
                frame = frame_obj.frame
                if(frame.is_exec_top){
                    exec_top = frame
                    break
                }
                frame_obj = frame_obj.prev
            }
            if(exec_top){
                for(var ns1 of [exec_top[1], exec_top[3]]){
                    let v = resolve_in_namespace(name, ns1)
                    if(v.found){
                        return v.value
                    }
                }
            }
        }else{
            let v = resolve_in_namespace(name, ns)
            if(v.found){
                return v.value
            }
        }
    }
    var exc = $B.name_error(name)
    $B.set_inum(inum)
    throw exc
}

$B.resolve_global = function(name, frame_obj, inum){
    // Resolve in globals or builtins
    while(frame_obj !== null){
        var frame = frame_obj.frame,
            v = resolve_in_namespace(name, frame[3])
        if(v.found){
            return v.value
        }
        if(frame.is_exec_top){
            break
        }
        frame_obj = frame_obj.prev
    }
    if(builtins_scope.locals.has(name)){
        return _b_[name]
    }
    $B.set_inum(inum)
    throw $B.name_error(name)
}

$B.own_class_name = function(name, inum){
    $B.set_inum(inum)
    throw $B.name_error(name)
}

var $operators = $B.op2method.subset("all") // in brython_builtins.js

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
        for(let child of node.body){
            child.$parent = node
            mark_parents(child)
        }
    }else if(node.handlers){
        // handlers in try block
        var p = {$parent: node, 'type': 'except_handler'}
        for(let child of node.handlers){
            child.$parent = p
            mark_parents(child)
        }
    }
}

var prefix = '',
    tab = '  '

function indent(n){
    n = n ?? 1
    prefix += tab.repeat(n)
}
function dedent(n){
    n = n ?? 1
    prefix = prefix.substr(n * tab.length)
}

function add_body(body, scopes){
    var res = '';
    let js;
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
    if(comp.type == 'genexpr'){
        return init_genexpr(comp, scopes)
    }
    // Code common to comprehensions
    return prefix + `var next_func_${comp.id} = $B.make_js_iterator(expr, frame, ${comp.ast.lineno})\n`
}

function init_genexpr(comp, scopes){
    var varnames = Object.keys(comp.varnames || {}).map(x => `'${x}'`).join(', ')
    return prefix + `var ${comp.locals_name} = {},\n` +
           prefix + tab + tab + `locals = ${comp.locals_name}\n` +
           prefix + `locals['.0'] = expr\n` +
           prefix + `var frame = ["<${comp.type.toLowerCase()}>", ${comp.locals_name}, ` +
               `"${comp.module_name}", ${comp.globals_name}]\n` +
           prefix + `frame.$has_generators = true\n` +
           prefix + `frame.__file__ = '${scopes.filename}'\n` +
           prefix + `frame.$lineno = ${comp.ast.lineno}\n` +
           prefix + `$B.make_f_code(frame, [${varnames}])\n` +
           prefix + `var next_func_${comp.id} = $B.make_js_iterator(expr, frame, ${comp.ast.lineno})\n` +
           prefix + `frame.$f_trace = _b_.None\n` +
           prefix + `var _frame_obj = $B.frame_obj\n`
}

function comp_bindings(comp, bindings){
    if(comp.target instanceof $B.ast.Name){
        bindings.add(comp.target.id)
    }else if(comp.target.elts){
        for(var elt of comp.target.elts){
            comp_bindings({target: elt}, bindings)
        }
    }
    return bindings
}

function make_comp(scopes){
    // Code common to list / set / dict comprehensions
    // List all names bound inside the comprehension generators
    var bindings = new Set()
    for(var gen of this.generators){
        comp_bindings(gen, bindings)
    }
    var save_locals = new Set()
    var plen = prefix.length
    var comp_prefix = prefix
    var id = make_id(),
        type = this.constructor.$name,
        symtable_block = scopes.symtable.table.blocks.get(fast_id(this)),
        varnames = Object.keys(symtable_block.symbols.$strings).map(x => `"${x}"`),
        comp_iter,
        comp_scope = $B.last(scopes),
        upper_comp_scope = comp_scope

    // Check the names bound in the comprehension that would shadow names
    // in the comprehension scope
    for(var name of comp_scope.locals){
        if(bindings.has(name)){
            save_locals.add(name)
        }
    }
    while(upper_comp_scope.parent){
        upper_comp_scope = upper_comp_scope.parent
        for(var name of upper_comp_scope.locals){
            if(bindings.has(name)){
                save_locals.add(name)
            }
        }
    }
    var comp_scope_block = scopes.symtable.table.blocks.get(
                                 fast_id(upper_comp_scope.ast)),
        comp_scope_symbols = comp_scope_block.symbols

    var initial_nb_await_in_scope = upper_comp_scope.nb_await === undefined ? 0 :
                            upper_comp_scope.nb_await

    for(var symbol of _b_.dict.$iter_items(symtable_block.symbols)){
        if(symbol.value & SF.DEF_COMP_ITER){
            comp_iter = symbol.key
        }
    }
    var comp_iter_scope = name_scope(comp_iter, scopes)
    var first_for = this.generators[0],
        // outmost expression is evaluated in enclosing scope
        outmost_expr = $B.js_from_ast(first_for.iter, scopes),
        nb_paren = 1

    var comp = {ast:this, id, type, varnames,
                module_name: scopes[0].name,
                locals_name: make_scope_name(scopes),
                globals_name: make_scope_name(scopes, scopes[0])}

    indent()
    if(prefix.length > plen + tab.length){
        console.warn('JS indentation issue')
    }
    var js = init_comprehension(comp, scopes)

    if(comp_iter_scope.found){
        js += prefix + `var save_comp_iter = ${name_reference(comp_iter, scopes)}\n`
    }
    for(var name of save_locals){
        js += prefix + `var save_${name} = ${name_reference(name, scopes)}\n`
    }
    if(this instanceof $B.ast.ListComp){
        js += prefix + `var result_${id} = $B.$list([])\n`
    }else if(this instanceof $B.ast.SetComp){
        js += prefix + `var result_${id} = _b_.set.$factory()\n`
    }else if(this instanceof $B.ast.DictComp){
        js += prefix + `var result_${id} = $B.empty_dict()\n`
    }

    // special case for first generator
    var first = this.generators[0]
    js += prefix + `try{\n`
    indent()
    js += prefix + `for(var next_${id} of next_func_${id}){\n`
    indent()
    var save_target_flags
    if(first.target instanceof $B.ast.Name){
        var target_name = first.target.id
        if(comp_scope_symbols.$strings.hasOwnProperty(target_name)){
            save_target_flags = comp_scope_symbols.$strings[target_name]
            comp_scope_symbols.$strings[target_name] = SF.LOCAL << SF.SCOPE_OFF
        }
    }
    // assign result of iteration to target
    var name = new $B.ast.Name(`next_${id}`, new $B.ast.Load())
    copy_position(name, first_for.iter)
    name.to_js = function(){return `next_${id}`}

    var assign = new $B.ast.Assign([first.target], name)
    assign.lineno = this.lineno
    js += assign.to_js(scopes) + '\n'

    for(let _if of first.ifs){
        nb_paren++
        js += prefix + `if($B.$bool(${$B.js_from_ast(_if, scopes)})){\n`
        indent()
    }

    for(var comprehension of this.generators.slice(1)){
        js += comprehension.to_js(scopes)
        nb_paren++
        for(let _if of comprehension.ifs){
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

    if(save_target_flags){
        comp_scope_symbols.$strings[target_name] = save_target_flags
    }
    // count if nb_await was incremented
    var final_nb_await_in_scope = upper_comp_scope.nb_await === undefined ? 0 :
                                  upper_comp_scope.nb_await
    var has_await = final_nb_await_in_scope > initial_nb_await_in_scope

    // If the element has an "await", attribute has_await is set to the scope
    // Use it to make the function aync or not
    js = `(${has_await ? 'async ' : ''}function(expr){\n` + js

    js += has_await ? 'var save_frame_obj = $B.frame_obj;\n' : ''

    if(this instanceof $B.ast.ListComp){
        js += prefix + `result_${id}.push(${elt})\n`
    }else if(this instanceof $B.ast.SetComp){
        js += prefix + `_b_.set.add(result_${id}, ${elt})\n`
    }else if(this instanceof $B.ast.DictComp){
        js += prefix + `_b_.dict.$setitem(result_${id}, ${key}, ${value})\n`
    }

    dedent()
    for(var i = 0; i < nb_paren; i++){
        js += prefix + '}\n'
        dedent()
    }
    js += prefix + `}catch(err){\n`
    indent()
    js += (has_await ? prefix + `$B.restore_frame_obj(save_frame_obj, ${comp.locals_name})\n` : '') +
          prefix + `$B.set_exc(err, frame)\n` +
          prefix + `throw err\n`
    dedent()
    js += prefix + `}\n` +
          (has_await ? prefix + `\n$B.restore_frame_obj(save_frame_obj, ${comp.locals_name});` : '')

    for(var name of save_locals){
        js += prefix + `${name_reference(name, scopes)} = save_${name}\n`
    }
    if(comp_iter_scope.found){
        js += prefix + `${name_reference(comp_iter, scopes)} = save_comp_iter\n`
    }
    js += prefix + `return result_${id}\n`
    dedent()
    js += prefix + `}` + `)(${outmost_expr})\n`
    if(prefix.length != plen){
        console.log('comprehension, prefix length start', plen,
            'end', prefix.length)
        console.log('file', scopes.filename)
        console.log(this)
        console.log('>>>\n', js, '\n<<<')
    }

    return js
}

function init_scopes(type, scopes){
    // Common to Expression and Module
    // Initializes the first scope in scopes
    // namespaces can be passed by exec() or eval()
    var filename = scopes?.symtable?.table?.filename,
        name = $B.url2name[filename]

    if(name){
        name = name.replace(/-/g, '_') // issue 1958
    } else if(filename === undefined) {
        name = 'exec' //TODO: ???
    }else if(filename.startsWith('<') && filename.endsWith('>')){
        name = 'exec'
    }else{
        name = filename.replace(/\./g, '_')
    }

    var top_scope = new Scope(name, `${type}`, this),
        block = scopes.symtable.table.blocks.get(fast_id(this))
    if(block && block.$has_import_star){
        top_scope.has_import_star = true
    }
    scopes.push(top_scope)
    var namespaces = scopes.namespaces
    if(namespaces){
        top_scope.is_exec_scope = true
        for(let key in namespaces.exec_globals){
            if(! key.startsWith('$')){
                top_scope.globals.add(key)
            }
        }
        if(namespaces.exec_locals !== namespaces.exec_globals){
            if(namespaces.exec_locals[$B.LOCALS_PROXY]){
                // used for locals in exec / eval
                for(let item of $B.make_js_iterator(namespaces.exec_locals.$target)){
                    top_scope.locals.add(item)
                }
            }else{
                for(let key in namespaces.exec_locals){
                    if(! key.startsWith('$')){
                        top_scope.locals.add(key)
                    }
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

function check_assign_or_delete(obj, target, action){
    action = action ?? 'assign to'
    if(target instanceof $B.ast.Attribute){
        if(target.attr == '__debug__'){
            compiler_error(obj, `cannot ${action} __debug__`, target)
        }
    }else if(target instanceof $B.ast.Name){
        if(target.id == '__debug__'){
            compiler_error(obj, `cannot ${action} __debug__`, target)
        }
    }else if(target instanceof $B.ast.Tuple){
        for(var elt of target.elts){
            check_assign_or_delete(elt, elt, action)
        }
    }else if(target instanceof $B.ast.Starred){
        check_assign_or_delete(obj, target.value, action)
    }
}

function check_is_arg(e){
    if (! (e instanceof $B.ast.Constant)){
        return true
    }
    var value = e.value
    return (value === _b_.None
         || value === false
         || value === true
         || value === _b_.Ellipsis)
}

function check_compare(op_name, left, right, scopes){
    var test_left = check_is_arg(left),
        test_right = check_is_arg(right)
    if(! test_left || ! test_right){
        var item = test_left ? right : left,
            name = $B.class_name(item.value)
        $B.warn(_b_.SyntaxWarning, `"${op_name}" with '${name}' literal. ` +
                        `Did you mean "=="?`,
                        scopes.filename, item)
    }
}

function check_type_params(ast_obj){
    var type_params = ast_obj.type_params
    if(Array.isArray(type_params)){
        var has_defaults = false
        for(var type_param of type_params){
            if(type_param.default_value === undefined && has_defaults){
                throw compiler_error(type_param, `non-default type ` +
                    `parameter '${type_param.name}' follows default type parameter`)
            }else if(type_param.default_value){
                has_defaults = true
            }
        }
    }
}

function maybe_add_static(attr, scopes){
    // If last scope is a function inside a class and the value of attr is
    // "self", add attr to the class static_attributes set
    var last = last_scope(scopes)
    if(last.type == "def"){
        var ix = scopes.indexOf(last) - 1
        while(scopes[ix]){
            last = last_scope(scopes.slice(0, ix + 1))
            if(last.type == "class"){
                last.static_attributes = last.static_attributes ??
                    new Set()
                last.static_attributes.add(attr.attr)
                return
            }else if(last.type == "def"){
                ix = scopes.indexOf(last) - 1
            }else{
                return
            }
        }
    }
}

function add_to_positions(scopes, ast_obj){
    // add a positions table to the list of positions for current frame
    var up_scope = last_scope(scopes)
    up_scope.positions = up_scope.positions ?? []
    up_scope.positions[up_scope.positions.length] = encode_position([
        ast_obj.lineno, ast_obj.end_lineno,
        ast_obj.col_offset, ast_obj.end_col_offset
    ])
    return 1 + 2 * (up_scope.positions.length - 1)
}

$B.ast.Assert.prototype.to_js = function(scopes){
    var test = $B.js_from_ast(this.test, scopes),
        msg = this.msg ? $B.js_from_ast(this.msg, scopes) : "''"

    var inum = add_to_positions(scopes, this.test)
    var js = prefix + `$B.set_lineno(frame, ${this.lineno})\n`
    return js + prefix + `$B.assert(${test}, ${msg}, ${inum})`
}

function annotation_to_str(obj, scopes){
    return get_source_from_position(scopes, obj)
}

$B.ast.AnnAssign.prototype.to_js = function(scopes){
    compiler_check(this)
    var postpone_annotation = scopes.symtable.table.future.features &
            $B.CO_FUTURE_ANNOTATIONS
    var scope = last_scope(scopes)
    var js = ''
    if(! scope.has_annotation){
        js += prefix + 'locals.__annotations__ = locals.__annotations__ || $B.empty_dict()\n'
        scope.has_annotation = true
        scope.locals.add('__annotations__')
    }
    if(this.target instanceof $B.ast.Name){
        var ann_value = postpone_annotation ?
                `'${annotation_to_str(this.annotation, scopes)}'` :
                $B.js_from_ast(this.annotation, scopes)
    }
    if(this.value){
        js += prefix + `var ann = ${$B.js_from_ast(this.value, scopes)}\n`
        if(this.target instanceof $B.ast.Name && this.simple){
            let scope = bind(this.target.id, scopes),
                mangled = mangle(scopes, scope, this.target.id)
            if(scope.type != "def"){
                // Update __annotations__ only for classes and modules
                js += prefix + `$B.$setitem(locals.__annotations__, ` +
                      `'${mangled}', ${ann_value})\n`
            }
            let target_ref = name_reference(this.target.id, scopes)
            js += prefix + `${target_ref} = ann`
        }else if(this.target instanceof $B.ast.Attribute){
            js += prefix + `$B.$setattr(${$B.js_from_ast(this.target.value, scopes)}` +
                `, "${this.target.attr}", ann)`
        }else if(this.target instanceof $B.ast.Subscript){
            js += prefix + `$B.$setitem(${$B.js_from_ast(this.target.value, scopes)}` +
                `, ${$B.js_from_ast(this.target.slice, scopes)}, ann)`
        }
    }else{
        if(this.target instanceof $B.ast.Name){
            if(this.simple && scope.type != 'def'){
                let mangled = mangle(scopes, scope, this.target.id)
                js += prefix + `$B.$setitem(locals.__annotations__, ` +
                    `'${mangled}', ${ann_value})`
            }
        }
    }
    return prefix + `$B.set_lineno(frame, ${this.lineno})\n` + js
}

$B.ast.AnnAssign.prototype._check = function(){
    check_assign_or_delete(this, this.target)
}

$B.ast.Assign.prototype.to_js = function(scopes){
    compiler_check(this)
    var js = this.lineno ? prefix + `$B.set_lineno(frame, ${this.lineno})\n` : '',
        value = $B.js_from_ast(this.value, scopes)

    function assign_one(target, value){
        if(target instanceof $B.ast.Name){
            return prefix + $B.js_from_ast(target, scopes) + ' = ' + value
        }else if(target instanceof $B.ast.Starred){
            return assign_one(target.value, value)
        }else if(target instanceof $B.ast.Subscript){
            return prefix + `$B.$setitem(${$B.js_from_ast(target.value, scopes)}` +
                `, ${$B.js_from_ast(target.slice, scopes)}, ${value})`
        }else if(target instanceof $B.ast.Attribute){
            if(target.value.id == 'self'){
                maybe_add_static(target, scopes)
            }
            var attr = mangle(scopes, last_scope(scopes), target.attr)
            return prefix + `$B.$setattr(${$B.js_from_ast(target.value, scopes)}` +
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
        var iter_id = 'it_' + make_id()
        var position = encode_position("'Unpack'",
            target.lineno, target.col_offset,
            target.end_lineno, target.end_col_offset)
        var inum = add_to_positions(scopes, target)
        js += prefix + `var ${iter_id} = $B.unpacker(${value}, ${nb_targets}, ` +
             `${has_starred}`
        if(nb_after_starred !== undefined){
            js += `, ${nb_after_starred}`
        }

        js += `, ${inum})\n`
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
    if(this.targets.length == 1){
        let target = this.targets[0]
        if(! (target instanceof $B.ast.Tuple) &&
               ! (target instanceof $B.ast.List)){
            js += assign_one(this.targets[0], value)
            return js
        }
    }
    var value_id = 'v' + make_id()
    js += prefix + `var ${value_id} = ${value}\n`

    var assigns = []
    for(let target of this.targets){
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


$B.ast.Assign.prototype._check = function(){
    for(var target of this.targets){
        check_assign_or_delete(this, target)
    }
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
        var id = make_id()
        var s = prefix + `var mgr_${id} = ` +
              $B.js_from_ast(item.context_expr, scopes) + ',\n'
        indent(2)
        s += prefix + `mgr_type_${id} = _b_.type.$factory(mgr_${id}),\n` +
             prefix + `aexit_${id} = $B.$getattr(mgr_type_${id}, '__aexit__'),\n` +
             prefix + `aenter_${id} = $B.$getattr(mgr_type_${id}, '__aenter__'),\n` +
             prefix + `value_${id} = await $B.promise($B.$call(aenter_${id})(mgr_${id})),\n` +
             prefix + `exc_${id} = true\n`
        if(has_generator){
            // add/update attribute used to close context managers in
            // leave_frame()
            s += prefix + `locals.$context_managers = locals.$context_managers || []\n` +
                 `locals.$context_managers.push(mgr_${id})\n`
        }
        dedent(2)
        s += prefix + 'try{\n'
        indent()
        s += prefix + 'try{\n'
        indent()
        if(item.optional_vars){
            //bind_vars(item.optional_vars, scopes)
            var value = {to_js: function(){return `value_${id}`}}
            copy_position(value, _with)
            var assign = new $B.ast.Assign([item.optional_vars], value)
            copy_position(assign, _with)
            s += assign.to_js(scopes) + '\n'
        }
        s += js
        dedent()
        s += prefix + `}catch(err_${id}){\n`
        indent()
        s += prefix + `frame.$lineno = ${lineno}\n` +
             prefix + `exc_${id} = false\n` +
             prefix + `err_${id} = $B.exception(err_${id}, frame)\n` +
             prefix + `var $b = await $B.promise(aexit_${id}(mgr_${id}, err_${id}.__class__, \n` +
             prefix + tab.repeat(4) + `err_${id}, $B.$getattr(err_${id}, '__traceback__')))\n` +
             prefix + `if(! $B.$bool($b)){\n` +
             prefix + tab + `throw err_${id}\n` +
             prefix + `}\n`
        dedent()
        s += prefix + `}\n`
        dedent()
        s += prefix + `}finally{\n`
        indent()
        s += prefix + `frame.$lineno = ${lineno}\n` +
             prefix + `if(exc_${id}){\n` +
             prefix + tab + `await $B.promise(aexit_${id}(mgr_${id}, _b_.None, _b_.None, _b_.None))\n` +
             prefix + `}\n`
        dedent()
        s += prefix + `}\n`
        return s
    }

    var _with = this,
        scope = last_scope(scopes),
        lineno = this.lineno
    delete scope.is_generator

    // bind context managers aliases first
    for(let item of this.items.slice().reverse()){
        if(item.optional_vars){
            bind_vars(item.optional_vars, scopes)
        }
    }

    indent(2)
    var js = add_body(this.body, scopes) + '\n'
    dedent(2)
    var has_generator = scope.is_generator
    for(let item of this.items.slice().reverse()){
        js = add_item(item, js)
    }
    return prefix + `$B.set_lineno(frame, ${this.lineno})\n` + js
}

$B.ast.Attribute.prototype.to_js = function(scopes){
    var attr = mangle(scopes, last_scope(scopes), this.attr)
    var position = encode_position("'Attr'",
            this.value.lineno, this.value.col_offset, this.end_col_offset)
    var inum = add_to_positions(scopes, this)
    return `$B.$getattr_pep657(${$B.js_from_ast(this.value, scopes)}, ` +
           `'${attr}', ${inum})`
}

$B.ast.AugAssign.prototype.to_js = function(scopes){
    compiler_check(this)
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
            let left_scope = scope.resolve == 'global' ?
                make_scope_name(scopes, scopes[0]) : 'locals'
            js = prefix + `${left_scope}.${this.target.id} = $B.augm_assign(` +
                make_ref(this.target.id, scopes, scope, this.target) + `, '${iop}', ${value})`
        }else{
            let ref = `${make_scope_name(scopes, scope.found)}.${this.target.id}`
            js = prefix + `${ref} = $B.augm_assign(${ref}, '${iop}', ${value})`
        }
    }else if(this.target instanceof $B.ast.Subscript){
        js = prefix + `$B.$setitem((locals.$tg = ${this.target.value.to_js(scopes)}), ` +
            `(locals.$key = ${this.target.slice.to_js(scopes)}), ` +
            `$B.augm_assign($B.$getitem(locals.$tg, locals.$key), '${iop}', ${value}))`
    }else if(this.target instanceof $B.ast.Attribute){
        let mangled = mangle(scopes, last_scope(scopes), this.target.attr)
        js = prefix + `$B.$setattr((locals.$tg = ${this.target.value.to_js(scopes)}), ` +
            `'${mangled}', $B.augm_assign(` +
            `$B.$getattr(locals.$tg, '${mangled}'), '${iop}', ${value}))`
    }else{
        let target = $B.js_from_ast(this.target, scopes),
            value = $B.js_from_ast(this.value, scopes)
        js = prefix + `${target} = $B.augm_assign(${target}, '${iop}', ${value})`
    }
    return prefix + `$B.set_lineno(frame, ${this.lineno})\n` + js
}

$B.ast.AugAssign.prototype._check = function(){
    check_assign_or_delete(this, this.target)
}

$B.ast.Await.prototype.to_js = function(scopes){
    var ix = scopes.length - 1
    while(scopes[ix].parent){
        ix--
    }
    // Increment the number of 'await' in scope. Used to detect if
    // comprehensions inside the scope have 'await'
    scopes[ix].nb_await = scopes[ix].nb_await === undefined ? 1 :
                          scopes[ix].nb_await + 1
    while(scopes[ix].ast instanceof $B.ast.ListComp ||
            scopes[ix].ast instanceof $B.ast.DictComp ||
            scopes[ix].ast instanceof $B.ast.SetComp ||
            scopes[ix].ast instanceof $B.ast.GeneratorExp){
        scopes[ix].has_await = true
        ix--
    }
    if(scopes[ix].ast instanceof $B.ast.AsyncFunctionDef){
        scopes[ix].has_await = true
        return prefix + `await $B.promise(${$B.js_from_ast(this.value, scopes)})`
    }else if(scopes[ix].ast instanceof $B.ast.FunctionDef){
        compiler_error(this, "'await' outside async function", this.value)
    }else{
        compiler_error(this, "'await' outside function", this.value)
    }
}

$B.ast.BinOp.prototype.to_js = function(scopes){
    var res
    var position = encode_position("'BinOp'",
        this.lineno, this.col_offset,
        this.end_lineno, this.end_col_offset,
        this.left.lineno, this.left.col_offset,
        this.left.end_lineno, this.left.end_col_offset,
        this.right.lineno, this.right.col_offset,
        this.right.end_lineno, this.right.end_col_offset)
    var inum = add_to_positions(scopes, this)
    var name = this.op.constructor.$name
    var op = opclass2dunder[name]
    if(this.left instanceof $B.ast.Constant &&
            this.right instanceof $B.ast.Constant){
        // calculate result at translation time
        try{
            res = $B.rich_op(op, this.left.value, this.right.value)
            if(typeof res == 'string'){
                res = res.replace(new RegExp("'", 'g'), "\\'")
            }
            var ast_obj = new $B.ast.Constant(res)
            return ast_obj.to_js(scopes)
        }catch(err){
            // error will be handled at runtime
        }
    }
    return `$B.rich_op('${op}', ` +
        `${$B.js_from_ast(this.left, scopes)}, ` +
        `${$B.js_from_ast(this.right, scopes)}, ${inum})`
}

$B.ast.BoolOp.prototype.to_js = function(scopes){
    // The expression x and y first evaluates x; if x is false, its value is
    // returned; otherwise, y is evaluated and the resulting value is
    // returned.
    // The expression x or y first evaluates x; if x is true, its value is
    // returned; otherwise, y is evaluated and the resulting value is
    // returned.
    var tests = []
    if(this.$dont_evaluate){
        // If the expression is the test of "if" or "while", it's useless to
        // compute the value, the boolean value is enough
        let op = this.op instanceof $B.ast.And ? ' && ' : ' || '
        for(let i = 0, len = this.values.length; i < len; i++){
            let value = this.values[i]
            tests.push(`$B.$bool(${$B.js_from_ast(value, scopes)})`)
        }
        return '(' + tests.join(op) + ')'
    }else{
        let op = this.op instanceof $B.ast.And ? '! ' : ''
        for(let i = 0, len = this.values.length; i < len; i++){
            let value = this.values[i]
            if(i < len - 1){
                tests.push(`${op}$B.$bool(locals.$test = ` +
                    `${$B.js_from_ast(value, scopes)}) ? locals.$test : `)
            }else{
                tests.push(`${$B.js_from_ast(value, scopes)}`)
            }
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
        if(scope.ast instanceof $B.ast.For ||
                scope.ast instanceof $B.ast.While){
            js += prefix + `no_break_${scope.id} = false\n`
            break
        }
    }
    js += prefix + `break`
    return js
}

$B.ast.Call.prototype.to_js = function(scopes){
    compiler_check(this)
    var position = encode_position("'Call'",
        this.lineno, this.col_offset,
        this.end_lineno, this.end_col_offset,
        this.func.end_lineno, this.func.end_col_offset)
    var inum = add_to_positions(scopes, this)
    var func =  $B.js_from_ast(this.func, scopes),
        js = `$B.$call(${func}, ${inum})`

    var args = make_args.bind(this)(scopes),
        args_js = args.js.trim()

    return js + (args.has_starred ? `.apply(null, ${args_js})` :
                                    `(${args_js})`)
}

$B.ast.Call.prototype._check = function(){
    for(var kw of this.keywords){
        if(kw.arg == '__debug__'){
            compiler_error(this, "cannot assign to __debug__", kw)
        }
    }
}

function make_args(scopes){
    var js = '',
        named_args = [],
        named_kwargs = [],
        starred_kwargs = [],
        has_starred = false
    for(let arg of this.args){
        if(arg instanceof $B.ast.Starred){
            arg.$handled = true
            has_starred = true
        }else{
            named_args.push($B.js_from_ast(arg, scopes))
        }
    }
    var kwds = new Set()
    for(var keyword of this.keywords){
        if(keyword.arg){
            if(kwds.has(keyword.arg)){
                compiler_error(keyword,
                    `keyword argument repeated: ${keyword.arg}`)
            }
            kwds.add(keyword.arg)
            named_kwargs.push(
                `${keyword.arg}: ${$B.js_from_ast(keyword.value, scopes)}`)
        }else{
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
        for(let arg of this.args){
            if(arg instanceof $B.ast.Starred){
                if(not_starred.length > 0){
                    let arg_list = not_starred.map(x => $B.js_from_ast(x, scopes))
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
            let arg_list = not_starred.map(x => $B.js_from_ast(x, scopes))
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
        kw = `{$kw:[${kw}]}`
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
        ref = this.name + make_id(),
        glob = scopes[0].name,
        globals_name = make_scope_name(scopes, scopes[0]),
        decorators = [],
        decorated = false
    for(let dec of this.decorator_list){
        decorated = true
        var dec_id = 'decorator' + make_id()
        decorators.push(dec_id)
        js += prefix + `$B.set_lineno(frame, ${dec.lineno})\n` +
              prefix + `var ${dec_id} = ${$B.js_from_ast(dec, scopes)}\n`
    }

    js += prefix + `$B.set_lineno(frame, ${this.lineno}, 'ClassDef')\n`
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

    var bases = this.bases.map(x => $B.js_from_ast(x, scopes))
    var has_type_params = this.type_params.length > 0
    if(has_type_params){
        check_type_params(this)
        js += prefix + `function TYPE_PARAMS_OF_${this.name}(){\n`
        indent()
        js += prefix + `$B.$import('_typing')\n` +
              prefix + `var _typing = $B.imported._typing\n`
        var params = [],
            need_typing_module
        for(let item of this.type_params){
            if(item instanceof $B.ast.TypeVar){
                params.push(`${item.name}`)
            }else if(item instanceof $B.ast.TypeVarTuple){
                params.push(`unpack(${item.name})`)
                need_typing_module = true
            }else if(item instanceof $B.ast.ParamSpec){
                params.push(`${item.name}`)
            }
        }
        bases.push(`generic_base`)
        if(need_typing_module){
            js += prefix + `$B.$import('typing')\n` +
                  prefix + 'var typing = $B.imported.typing\n' +
                  prefix + `var unpack = $B.$call($B.$getattr(typing.Unpack, '__getitem__'))\n`
        }
        var name_map = new Map()
        for(let item of this.type_params){
            var name,
                param_type = item.constructor.$name
            if(['TypeVar', 'TypeVarTuple', 'ParamSpec'].includes(param_type)){
                name = item.name
            }else{
                name = item.name.id
            }
            name_map.set(item, name)
            js += prefix + `var ${name} = $B.$call(_typing.${param_type})('${name}')\n`
        }
        js += prefix + `var generic_base = _typing.Generic.__class_getitem__(_typing.Generic,` +
                ` $B.fast_tuple([${params.join(', ')}]))\n`
    }

    var keywords = [],
        metaclass,
        meta = ''
    for(var keyword of this.keywords){
        if(keyword.arg == 'metaclass'){
            metaclass = keyword.value
            meta = metaclass.to_js(scopes)
        }else{
            keywords.push(`["${keyword.arg}", ` +
                $B.js_from_ast(keyword.value, scopes) + ']')
        }
    }

    // Detect doc string
    var docstring = extract_docstring(this, scopes)

    var inum = add_to_positions(scopes, this)

    js += prefix + `var ${ref} = (function(name, module, bases`
              + (metaclass ? ', meta' : '') +
              `){\n`
    indent()
    js += prefix + `$B.frame_obj.frame.inum = ${inum}\n`
    js += prefix + `var _frame_obj = $B.frame_obj,\n`
    indent(2)
    js += prefix + `resolved_bases = $B.resolve_mro_entries(bases),\n` +
          prefix + `metaclass = $B.get_metaclass(name, module, ` +
          `resolved_bases`

    if(metaclass){
        js += `, meta`
    }
    js += ')\n'
    dedent(2)

    js += prefix + `var ${locals_name} = $B.make_class_namespace(metaclass, ` +
              `name, module, "${qualname}", bases, resolved_bases),\n`

    indent(2)
    js += prefix + `locals = ${locals_name}\n` +
          prefix + `locals.__doc__ = ${docstring}\n`
    dedent(2)
    js += prefix + `var frame = [name, locals, module, ${globals_name}]\n` +
          prefix + `$B.enter_frame(frame, __file__, ${this.lineno})\n` +
          prefix + `var _frame_obj = $B.frame_obj\n` +
          prefix + `if(frame.$f_trace !== _b_.None){\n` +
          prefix + tab + `$B.trace_line()\n` +
          prefix + `}\n`

    if(has_type_params){
        var tp_refs = []
        for(var item of this.type_params){
            tp_refs.push(`${name_map.get(item)}`)
        }
        js += prefix + `locals.__type_params__ = $B.fast_tuple([${tp_refs.join(', ')}])\n`
    }

    scopes.push(class_scope)

    var index_for_positions = js.length

    js += add_body(this.body, scopes) + '\n'

    if(class_scope.positions){
        js = js.substr(0, index_for_positions) +
             prefix + `frame.positions = [${class_scope.positions}]\n` +
             js.substr(index_for_positions)
    }

    scopes.pop()

    var static_attrs = []
    if(class_scope.static_attributes){
        static_attrs = Array.from(class_scope.static_attributes).map(x => `"${x}"`)
    }

    js += prefix + '$B.trace_return_and_leave(frame, _b_.None)\n' +
          prefix + `return $B.$class_constructor('${this.name}', locals, metaclass, ` +
              `resolved_bases, bases, [${keywords.join(', ')}], ` +
              `[${static_attrs}], ${this.lineno})\n`


    dedent()
    js += prefix + `})('${this.name}',${globals_name}.__name__ ?? '${glob}', ` +
          `$B.fast_tuple([${bases}])` +
          (metaclass ? ', ' + meta : '') +
          `)\n`

    if(has_type_params){
        js += prefix + `return ${ref}\n`
        dedent()
        js += prefix + '}\n'
    }

    var class_ref = reference(scopes, enclosing_scope, this.name)

    js += prefix
    if(decorated){
        class_ref = `decorated${make_id()}`
        js += 'var '
    }

    js += `${class_ref} = `
    if(has_type_params){
        js += `TYPE_PARAMS_OF_${this.name}()\n`
    }else{
        js += `${ref}\n`
    }
    if(decorated){
        js += prefix + reference(scopes, enclosing_scope, this.name) + ' = '
        var decorate = class_ref
        for(let dec of decorators.reverse()){
            decorate = `$B.$call(${dec})(${decorate})`
        }
        js += decorate + '\n'
    }

    return js
}

$B.ast.Compare.prototype.to_js = function(scopes){
    var test_left = check_is_arg(this.left)
    var left = $B.js_from_ast(this.left, scopes),
        comps = []
    var len = this.ops.length,
        prefix

    for(var i = 0; i < len; i++){
        var name = this.ops[i].$name ? this.ops[i].$name : this.ops[i].constructor.$name,
            op = opclass2dunder[name],
            right = this.comparators[i]
        if(op === undefined){
            console.log('op undefined', this.ops[i])
            alert()
        }
        // For chained comparison, store each intermediate result in locals.$op
        prefix = i < len - 1 ? 'locals.$op = ' : ''
        if(this.ops[i] instanceof $B.ast.In){
            comps.push(`$B.$is_member(${left}, ` +
                `${prefix}${$B.js_from_ast(right, scopes)})`)
        }else if(this.ops[i] instanceof $B.ast.NotIn){
            comps.push(`! $B.$is_member(${left}, ` +
                `${prefix}${$B.js_from_ast(right, scopes)})`)
        }else if(this.ops[i] instanceof $B.ast.Is){
            check_compare('is', this.left, right, scopes)
            comps.push(`$B.$is(${left}, ` +
                `${prefix}${$B.js_from_ast(right, scopes)})`)
        }else if(this.ops[i] instanceof $B.ast.IsNot){
            check_compare('is not', this.left, right, scopes)
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
    var id = make_id(),
        iter = $B.js_from_ast(this.iter, scopes)

    var js = prefix + `var next_func_${id} = $B.make_js_iterator(${iter}, frame, ${this.lineno})\n` +
             prefix + `for(var next_${id} of next_func_${id}){\n`
    indent()
    // assign result of iteration to target
    var name = new $B.ast.Name(`next_${id}`, new $B.ast.Load())
    copy_position(name, this.target)
    name.to_js = function(){return `next_${id}`}
    var assign = new $B.ast.Assign([this.target], name)
    copy_position(assign, this.target)
    js += assign.to_js(scopes) + '\n'

    for(var _if of this.ifs){
        js += prefix + `if($B.$bool(${$B.js_from_ast(_if, scopes)})){\n`
        indent()
    }

    return js
}

$B.ast.Constant.prototype.to_js = function(){
    if(this.value === true || this.value === false){
        return this.value + ''
    }else if(this.value === _b_.None){
        return '_b_.None'
    }else if(typeof this.value == "string"){
        var s = this.value,
            srg = $B.surrogates(s) // in py_string.js
        if(srg.length == 0){
            return `'${s}'`
        }
        return `$B.make_String('${s}', [${srg}])`
    }else if(this.value.__class__ === _b_.bytes){
        return `_b_.bytes.$factory([${this.value.source}])`
    }else if(typeof this.value == "number"){
        if(Number.isInteger(this.value)){
            return this.value
        }else{
            return `({__class__: _b_.float, value: ${this.value}})`
        }
    }else if(this.value.__class__ === $B.long_int){
        return `$B.fast_long_int(${this.value.value}n)`
    }else if(this.value.__class__ === _b_.float){
        return `({__class__: _b_.float, value: ${this.value.value}})`
    }else if(this.value.__class__ === _b_.complex){
        return `$B.make_complex(${this.value.$real.value}, ${this.value.$imag.value})`
    }else if(this.value === _b_.Ellipsis){
        return `_b_.Ellipsis`
    }else{
        console.log('invalid value', this.value)
        throw SyntaxError('bad value', this.value)
    }
}

$B.ast.Continue.prototype.to_js = function(scopes){
    if(! in_loop(scopes)){
        compiler_error(this, "'continue' not properly in loop")
    }
    return prefix + 'continue'
}

$B.ast.Delete.prototype.to_js = function(scopes){
    compiler_check(this)
    var js = ''
    for(var target of this.targets){
        var inum = add_to_positions(scopes, target)
        if(target instanceof $B.ast.Name){
            var scope = name_scope(target.id, scopes)
            if(scope.found){
                scope.found.locals.delete(target.id)
            }
            js += `$B.$delete("${target.id}", ${inum})\n`
        }else if(target instanceof $B.ast.Subscript){
            js += `$B.$delitem(${$B.js_from_ast(target.value, scopes)}, ` +
                  `${$B.js_from_ast(target.slice, scopes)}, ${inum})\n`
        }else if(target instanceof $B.ast.Attribute){
            js += `$B.$delattr(${$B.js_from_ast(target.value, scopes)}, ` +
                  `'${target.attr}', ${inum})\n`
        }
    }
    return prefix + `$B.set_lineno(frame, ${this.lineno})\n` +
           prefix + js
}

$B.ast.Delete.prototype._check = function(){
    for(var target of this.targets){
        check_assign_or_delete(this, target, 'delete')
    }
}

$B.ast.Dict.prototype.to_js = function(scopes){
    var items = [],
        keys = this.keys,
        has_packed = false

    function no_key(i){
        return keys[i] === _b_.None || keys[i] === undefined
    }

    // Build arguments = a list of 2-element lists
    for(let i = 0, len = this.keys.length; i < len; i++){
        if(no_key(i)){
            // format **t
            has_packed = true
            items.push('_b_.list.$factory(_b_.dict.items(' +
                      $B.js_from_ast(this.values[i], scopes) + '))')
        }else{
            var item = `[${$B.js_from_ast(this.keys[i], scopes)}, ` +
                       `${$B.js_from_ast(this.values[i], scopes)}`
            if(this.keys[i] instanceof $B.ast.Constant){
                var v = this.keys[i].value
                if(typeof v == 'string'){
                    item += ', ' + $B.$hash(string_from_ast_value(v))
                }else{
                    try{
                        var hash = $B.$hash(this.keys[i].value)
                        item += `, ${hash}`
                    }catch(err){
                        // not hashable, will be raised at runtime
                    }
                }
            }
            items.push(item + ']')
        }
    }
    if(! has_packed){
        return `_b_.dict.$literal([${items}])`
    }
    // dict display has items of the form **t
    var first = no_key(0) ? items[0] : `[${items[0]}]`,
        js = '_b_.dict.$literal(' + first
    for(let i = 1, len = items.length; i < len; i++){
        let arg = no_key(i) ? items[i] : `[${items[i]}]`
        js += `.concat(${arg})`
    }
    return js + ')'
}

$B.ast.DictComp.prototype.to_js = function(scopes){
    return make_comp.bind(this)(scopes)
}

$B.ast.Expr.prototype.to_js = function(scopes){
    return prefix + `$B.set_lineno(frame, ${this.lineno});\n` +
           prefix + $B.js_from_ast(this.value, scopes)
}

$B.ast.Expression.prototype.to_js = function(scopes){
    init_scopes.bind(this)('expression', scopes)
    var res = $B.js_from_ast(this.body, scopes)
    var positions = scopes[scopes.length - 1].positions
    if(positions){
        res = prefix + `(frame.positions = [${positions}], ` +
              res +')'
    }
    return res
}

$B.ast.For.prototype.to_js = function(scopes){
    // Create a new scope with the same name to avoid binding in the enclosing
    // scope.
    compiler_check(this)
    var id = make_id(),
        iter = $B.js_from_ast(this.iter, scopes),
        js = prefix + `frame.$lineno = ${this.lineno}\n`
    // Create a new scope with the same name to avoid binding in the enclosing
    // scope.
    var scope = $B.last(scopes),
        new_scope = copy_scope(scope, this, id)
    scopes.push(new_scope)

    if(this instanceof $B.ast.AsyncFor){
        js += prefix + `var no_break_${id} = true,\n` +
              prefix + tab + tab + `iter_${id} = ${iter},\n` +
              prefix + tab + tab + `type_${id} = _b_.type.$factory(iter_${id})\n` +
              prefix + `iter_${id} = $B.$call($B.$getattr(type_${id}, "__aiter__"))(iter_${id})\n` +
              prefix + `type_${id} = _b_.type.$factory(iter_${id})\n` +
              prefix + `var next_func_${id} = $B.$call(` +
                  `$B.$getattr(type_${id}, '__anext__'))\n` +
              prefix + `while(true){\n`
        indent()
        js += prefix + `try{\n`+
              prefix + tab + `var next_${id} = await $B.promise(next_func_${id}(iter_${id}))\n` +
              prefix + `}catch(err){\n`+
              prefix + tab + `if($B.is_exc(err, [_b_.StopAsyncIteration])){\n` +
              prefix + tab + tab + `break\n` +
              prefix + tab + `}else{\n` +
              prefix + tab + tab + `throw err\n` +
              prefix + tab + '}\n' +
              prefix + `}\n`
        dedent()
    }else{
        js += prefix + `var no_break_${id} = true,\n` +
              prefix + tab + tab + `iterator_${id} = ${iter}\n` +
              prefix + `for(var next_${id} of $B.make_js_iterator(` +
                  `iterator_${id}, frame, ${this.lineno})){\n`
    }
    // assign result of iteration to target
    var name = new $B.ast.Name(`next_${id}`, new $B.ast.Load())
    copy_position(name, this.iter)
    name.to_js = function(){return `next_${id}`}
    var assign = new $B.ast.Assign([this.target], name)

    indent()

    js += assign.to_js(scopes) + '\n'

    js += add_body(this.body, scopes)

    dedent()
    js += '\n' + prefix + '}\n' // close 'while' loop

    scopes.pop()

    if(this.orelse.length > 0){
        js += prefix + `if(no_break_${id}){\n`
        indent()
        js += add_body(this.orelse, scopes) + '\n'
        dedent()
        js += prefix + '}\n'
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
        kw_defaults = [],
        annotations
    for(let arg of positional.concat(this.args.kwonlyargs).concat(
            [this.args.vararg, this.args.kwarg])){
        if(arg && arg.annotation){
            annotations = annotations || {}
            annotations[arg.arg] = arg.annotation
        }
    }
    for(var i = ix; i < positional.length; i++){
        default_names.push(`${positional[i].arg}`)
        _defaults.push(`${positional[i].arg}: ` +
            `${$B.js_from_ast(this.args.defaults[i - ix], scopes)}`)
    }
    ix = -1
    for(let arg of this.args.kwonlyargs){
        ix++
        if(this.args.kw_defaults[ix] === _b_.None){
            continue
        }
        if(this.args.kw_defaults[ix] === undefined){
            _defaults.push(`${arg.arg}: _b_.None`)
        }else{
            var v = $B.js_from_ast(this.args.kw_defaults[ix], scopes)
            _defaults.push(`${arg.arg}: ` + v)
            kw_defaults.push(`${arg.arg}: ${v}`)
        }
    }
    var kw_default_names = []
    for(var kw of this.args.kwonlyargs){
        kw_default_names.push(`'${kw.arg}'`)
    }

    return {default_names, _defaults, positional, has_posonlyargs,
            kw_defaults, kw_default_names, annotations}
}



const args0_fcts = $B.args_parsers = [];

function getArgs0(hasPosOnly, posOnlyDefaults, hasPos, posDefaults, hasVargars, hasNamedOnly, namedOnlyDefaults, hasKWargs) {

    const IDX =      hasPosOnly
            | posOnlyDefaults    << 1
            | hasPos        << 3
            | posDefaults        << 4
            | hasVargars        << 6
            | hasNamedOnly        << 7
            | namedOnlyDefaults    << 8
            | hasKWargs        << 10;

    const args0 = args0_fcts[IDX];

    if(args0 !== undefined)
        return args0;

    const fct = args0_fcts[IDX] = generate_args0(hasPosOnly, posOnlyDefaults, hasPos, posDefaults, hasVargars, hasNamedOnly, namedOnlyDefaults, hasKWargs);

    fct.id = IDX;

    return fct;
}
$B.getArgs0 = getArgs0;

const DEFAULTS = getArgs0.DEFAULTS = {
    NONE: 0,
    SOME: 1,
    ALL : 3
}


// deno run generator.js
// hasPos / posDefaults are pos parameters excluding posOnly parameters.
function generate_args0(...args) {
    return new Function('fct', 'args',  generate_args0_str(...args) );
}


function generate_args0_str(hasPosOnly, posOnlyDefaults, hasPos, posDefaults, hasVargars, hasNamedOnly, namedOnlyDefaults, hasKWargs) {

    let fct =
//`function args0_NEW(fct, args) {
`
    const LAST_ARGS = args[args.length-1];
    const HAS_KW = LAST_ARGS !== undefined && LAST_ARGS !== null && LAST_ARGS.$kw !== undefined;

    let ARGS_POS_COUNT        = args.length;
    let ARGS_NAMED            = null;

    if( HAS_KW ) {
        --ARGS_POS_COUNT;
        ARGS_NAMED = LAST_ARGS.$kw;
    }


    const result = {};

    // using const should enable the browser to perform some optimisation.
    const $INFOS = fct.$infos;
    const $CODE  = $INFOS.__code__;
`;

    if( hasPos || hasPosOnly || hasNamedOnly )
        fct += `
    const PARAMS_NAMES        = $INFOS.arg_names;
`;

    let PARAMS_POS_COUNT = "0";
    if( hasPos || hasPosOnly ) {
        PARAMS_POS_COUNT = "PARAMS_POS_COUNT";
        fct += `
    const PARAMS_POS_COUNT    = $CODE.co_argcount;
`;
    }

    let PARAMS_POS_DEFAULTS_OFFSET = PARAMS_POS_COUNT;
    let PARAMS_POS_DEFAULTS_COUNT = "0";

    if( posOnlyDefaults !== DEFAULTS.NONE || posDefaults !== DEFAULTS.NONE ) {

        PARAMS_POS_DEFAULTS_OFFSET = "PARAMS_POS_DEFAULTS_OFFSET";
        PARAMS_POS_DEFAULTS_COUNT  = "PARAMS_POS_DEFAULTS_COUNT";

        fct += `
    const PARAMS_POS_DEFAULTS = $INFOS.__defaults__;
    const PARAMS_POS_DEFAULTS_COUNT = PARAMS_POS_DEFAULTS.length;

    const PARAMS_POS_DEFAULTS_OFFSET= ${PARAMS_POS_COUNT} - PARAMS_POS_DEFAULTS_COUNT;

`;
    }

    fct += `
    let offset = 0;
`;

    if( hasVargars ) {
        fct +=
`
    result[$INFOS.vararg] = $B.fast_tuple( Array.prototype.slice.call(args, ${PARAMS_POS_COUNT}, ARGS_POS_COUNT ) ); //TODO: opti, better way to construct tuple from subarray ?
`

        if( hasPosOnly || hasPos ) {

            fct +=
`
    const min = Math.min( ARGS_POS_COUNT, ${PARAMS_POS_COUNT} );
    for( ; offset < min ; ++offset)
        result[ PARAMS_NAMES[offset] ] = args[offset];
`
        }
    } else {
        fct +=
`
    if( ARGS_POS_COUNT > ${PARAMS_POS_COUNT} ) {
        $B.args0_old(fct, args);
        throw new Error('Too much positional arguments given (args0 should have raised an error) !');
    }
`
        if( hasPosOnly || hasPos ) {

            fct +=
`
    for( ; offset < ARGS_POS_COUNT ; ++offset)
        result[ PARAMS_NAMES[offset] ] = args[offset];
`
        }
    }



    // verify if it truly has no kw arguments.
    if( ! hasPos && ! hasNamedOnly && ! hasKWargs ) {
        fct += `
    if( HAS_KW === true ) {

        for(let argname in ARGS_NAMED[0] ) {
            $B.args0_old(fct, args);
            throw new Error('No named arguments expected !!!');
        }

        for(let id = 1; id < ARGS_NAMED.length; ++id ) {

            const kargs = ARGS_NAMED[id];
            for(let argname of $B.unpack_mapping( fct, kargs) ) { //TODO: not optimal
                $B.args0_old(fct, args);
                throw new Error('No named arguments expected !!!');
            }
        }
    }
`;
    } else {
        fct += `
    if( HAS_KW === false ) {
    `;
    }

    if( hasPos || hasPosOnly ) {

        if( posOnlyDefaults !== DEFAULTS.ALL && posDefaults !== DEFAULTS.ALL ) {

            fct += `
        if( offset < ${PARAMS_POS_DEFAULTS_OFFSET} ) {
            $B.args0_old(fct, args);
            throw new Error('Not enough positional arguments given (args0 should have raised an error) !');
        }
`
        }

        if( posOnlyDefaults !== DEFAULTS.NONE || posDefaults !== DEFAULTS.NONE) {
            fct += `
        for(let i = offset - PARAMS_POS_DEFAULTS_OFFSET;
            i < PARAMS_POS_DEFAULTS_COUNT;
            ++i)
            result[ PARAMS_NAMES[offset++] ] = PARAMS_POS_DEFAULTS[i];`
        }
    }

    if( hasKWargs ) {
        fct += `
        result[$INFOS.kwarg] = __BRYTHON__.empty_dict();`
    }

    if( hasNamedOnly && namedOnlyDefaults !== DEFAULTS.ALL) {
        fct += `
        $B.args0_old(fct, args);
        throw new Error('Named argument expected (args0 should have raised an error) !');
`
    } else if( namedOnlyDefaults !== DEFAULTS.NONE ) {
        fct += `
        const kwargs_defaults_values = fct.$kwdefaults_values;

        for(let i = 0; i < kwargs_defaults_values.length; ++i )
                result[ PARAMS_NAMES[offset++] ] = kwargs_defaults_values[i];
`
    }

    fct += `
        return result;
`

    // verify if it truly has no kw arguments.
    if( ! hasPos && ! hasNamedOnly && ! hasKWargs ) {
        return fct;
    } else {
        fct += `
    }
`;
    }

    if( namedOnlyDefaults !== DEFAULTS.NONE) {
        fct += `
    const kwargs_defaults = fct.$kwdefaults;
`
    }

    if( hasPosOnly ) {

        fct += `
    const PARAMS_POSONLY_COUNT         = $CODE.co_posonlyargcount;

    if( offset < PARAMS_POSONLY_COUNT ) {

        `;
        if( posOnlyDefaults !== DEFAULTS.SOME) {
            fct += `
        if( offset < ${PARAMS_POS_DEFAULTS_OFFSET} ) {
            $B.args0_old(fct, args);
            throw new Error('Not enough positional parameters given (args0 should have raised an error) !');
        }
`
        }
        if( posOnlyDefaults === DEFAULTS.NONE) {
            fct += `
        $B.args0_old(fct, args);
        throw new Error('Not enough positional parameters given (args0 should have raised an error) !');
`;
        }

        fct += `
        const max = ${PARAMS_POS_DEFAULTS_COUNT} - (${PARAMS_POS_COUNT} - PARAMS_POSONLY_COUNT);

        // default parameters
        for(let i = offset - ${PARAMS_POS_DEFAULTS_OFFSET};
                i < max;
                ++i)
            result[ PARAMS_NAMES[offset++] ] = PARAMS_POS_DEFAULTS[i];
    }
`
    }

    if( hasKWargs) {

        fct += `
    const extra = {};

    let nb_extra_args = 0;
`

        if(hasPos || hasNamedOnly ) {
            fct += `
    const HAS_PARAMS = fct.$hasParams;
`;
        }
    }

    fct += `

    let nb_named_args = 0;


    const kargs = ARGS_NAMED[0];

    for(let argname in kargs) {
        `;

        if( ! hasKWargs ) {
            fct += `
        result[ argname ] = kargs[argname];
        ++nb_named_args;
`;
        }

        if( hasKWargs ) {
            if( ! hasNamedOnly && ! hasPos ) {
                fct += `
        extra[ argname ] = kargs[argname];
        ++nb_extra_args;
`
            } else {
                fct += `
        if( HAS_PARAMS.has(argname) ) {
            result[ argname ] = kargs[argname];
            ++nb_named_args;
        } else {
            extra[ argname ] = kargs[argname];
            ++nb_extra_args;
        }
`
            }
        }

        fct += `
    }

    for(let id = 1; id < ARGS_NAMED.length; ++id ) {

        const kargs = ARGS_NAMED[id];

        for(let item of $B.unpack_mapping(fct, kargs) ) {
            let argname = item.key
            if( typeof argname !== "string") {
                $B.args0_old(fct, args);
                throw new Error('Non string key passed in **kargs');
            }
            `;

            if( ! hasKWargs ) {
                fct += `
            result[ argname ] = item.value;
            ++nb_named_args;
`;
            }

            if( hasKWargs ) {
                if( ! hasNamedOnly && ! hasPos ) {

                    fct += `
            extra[ argname ] = $B.$getitem(kargs, argname);
            ++nb_extra_args;
`
                } else {
                    fct += `
            if( HAS_PARAMS.has(argname) ) {
                result[ argname ] = $B.$getitem(kargs, argname);
                ++nb_named_args;
            } else {
                extra[ argname ] = $B.$getitem(kargs, argname);
                ++nb_extra_args;
            }
`
                }
            }

            fct += `
        }
    }
`

    fct += `
    let found = 0;
    let ioffset = offset;
`;

    if(    (hasPosOnly || hasPos)
        && (! hasPosOnly || posOnlyDefaults !== DEFAULTS.ALL)
        && (! hasPos     || posDefaults !== DEFAULTS.ALL) ) {
        fct += `
    for( ; ioffset < ${PARAMS_POS_DEFAULTS_OFFSET}; ++ioffset) {

        const key = PARAMS_NAMES[ioffset];
        if( key in result ) // maybe could be speed up using "!(key in result)"
            continue;

        $B.args0_old(fct, args);
        throw new Error('Missing a named arguments (args0 should have raised an error) !');
    }
`
    }
    if( (hasPosOnly && posOnlyDefaults !== DEFAULTS.NONE) || (hasPos && posDefaults !== DEFAULTS.NONE) ) {
        fct += `
    for( ; ioffset < PARAMS_POS_COUNT; ++ioffset) {

        const key = PARAMS_NAMES[ioffset];
        if( key in result )
            continue;

        result[key] = PARAMS_POS_DEFAULTS[ioffset - ${PARAMS_POS_DEFAULTS_OFFSET}];
    ++found;
    }
`
    }

    if( hasNamedOnly ) {

        fct += `
        for( ; ioffset < PARAMS_NAMES.length; ++ioffset) {

            const key = PARAMS_NAMES[ioffset];
            if( key in result )
                continue;
`
        if( namedOnlyDefaults === DEFAULTS.SOME) {
            fct += `
            if( ! kwargs_defaults.has(key) ) {
                $B.args0_old(fct, args);

                throw new Error('Missing a named arguments (args0 should have raised an error) !');
            }
`
        }
        if( namedOnlyDefaults === DEFAULTS.NONE ) {
            fct += `
            $B.args0_old(fct, args);

            throw new Error('Missing a named arguments (args0 should have raised an error) !');
`
        }

        if( namedOnlyDefaults !== DEFAULTS.NONE) {
            fct += `

            result[key] = kwargs_defaults.get(key);
            ++found;
`;
        }

        fct += `
        }
`;
    }

    if( hasNamedOnly || hasPos )
        fct += `
        if( found + nb_named_args !== PARAMS_NAMES.length - offset) {
            $B.args0_old(fct, args);
            throw new Error('Inexistant or duplicate named arguments (args0 should have raised an error) !');
        }
`;

    if( hasKWargs ) {
        fct += `
    if( Object.keys(extra).length !== nb_extra_args ) {
        $B.args0_old(fct, args);
        throw new Error('Duplicate name given to **kargs parameter (args0 should have raised an error) !');
    }
    result[$INFOS.kwarg] = __BRYTHON__.builtins.dict.$from_js(extra);
`
    }

    fct += `
    return result
    `;

    //fct += `}`;
    return fct;
}


function type_param_in_def(tp, ref, scopes){
    var gname = scopes[0].name,
        globals_name = make_scope_name(scopes, scopes[0])
    var js = ''
    var name,
        param_type = tp.constructor.$name
    if(['TypeVar', 'TypeVarTuple', 'ParamSpec'].includes(param_type) ){
        name = tp.name
    }else{
        name = tp.name.id
    }
    bind(name, scopes)
    if(tp.bound){
        // symtable defines a block of type 'TypeVarBoundBlock' associated
        // with tp
        var typevarscope = new Scope(name, 'typevarbound', tp)
        scopes.push(typevarscope)
        js += `function BOUND_OF_${name}(){\n` +
              `var current_frame = $B.frame_obj.frame,\n` +
              `frame = ['BOUND_OF_${name}', {}, '${gname}', ${globals_name}]\n` +
              `$B.enter_frame(frame, __file__, ${tp.bound.lineno})\n` +
              `try{\n` +
              `var res = ${tp.bound.to_js(scopes)}\n` +
              `$B.leave_frame()\nreturn res\n` +
              `}catch(err){\n` +
              `$B.leave_frame()\n` +
              `throw err\n}\n}\n`
        scopes.pop()
    }
    js += prefix + `locals_${ref}.${name} = ` +
        `$B.$call(_typing.${param_type})('${name}', {$kw: [{infer_variance: true}]})\n` +
        prefix + `type_params.push(locals_${ref}.${name})\n`
    if(tp.bound){
        if(! tp.bound.elts){
            js += `_typing.${param_type}._set_lazy_eval(locals_${ref}.${name}, ` +
                `'__bound__', BOUND_OF_${name})\n`
        }else{
            js += `_typing.${param_type}._set_lazy_eval(locals_${ref}.${name}, ` +
                `'__constraints__', BOUND_OF_${name})\n`
        }
    }
    return js
}


$B.ast.FunctionDef.prototype.to_js = function(scopes){
    compiler_check(this)
    var symtable_block = scopes.symtable.table.blocks.get(fast_id(this))
    var in_class = last_scope(scopes).ast instanceof $B.ast.ClassDef,
        is_async = this instanceof $B.ast.AsyncFunctionDef,
        mangle_arg = x => x
    if(in_class){
        var class_scope = last_scope(scopes)
        mangle_arg = x => mangle(scopes, class_scope, x)
    }

    // bind function name in function enclosing scope
    var func_name_scope = bind(this.name, scopes)

    var gname = scopes[0].name,
        globals_name = make_scope_name(scopes, scopes[0])

    var decorators = [],
        decorated = false,
        decs_declare = this.decorator_list.length > 0 ?
                           prefix + '// declare decorators\n' : ''

    // evaluate decorator in enclosing scope
    for(let dec of this.decorator_list){
        decorated = true
        var dec_id = 'decorator' + make_id()
        decorators.push(dec_id)
        decs_declare += prefix + `$B.set_lineno(frame, ${dec.lineno})\n`
        decs_declare += prefix + `var ${dec_id} = ${$B.js_from_ast(dec, scopes)}\n`
    }

    // Detect doc string
    var docstring = extract_docstring(this, scopes)

    // Parse args
    var parsed_args = transform_args.bind(this)(scopes),
        positional = parsed_args.positional,
        kw_defaults = parsed_args.kw_defaults,
        kw_default_names = parsed_args.kw_default_names

    var defaults = this.args.defaults.length == 0 ? '_b_.None' :
            `[${this.args.defaults.map(x => x.to_js(scopes))}]`
    kw_defaults = kw_default_names.length == 0 ? '_b_.None' :
            `{${kw_defaults.join(', ')}}`

    var id = make_id(),
        name2 = this.name + id

    // Type params (PEP 695)
    var has_type_params = this.type_params.length > 0,
        type_params = ''

    if(has_type_params){
        // create a scope for type params
        check_type_params(this)
        var tp_name = `type_params_${name2}`
        var type_params_scope = new Scope(tp_name, 'type_params',
            this.type_params)
        scopes.push(type_params_scope)
        var type_params_ref = qualified_scope_name(scopes, type_params_scope)

        var type_params_func = `function TYPE_PARAMS_OF_${name2}(){\n`

        // generate code to store type params in the scope namespace
        type_params = prefix + `$B.$import('_typing')\n` +
              prefix + `var _typing = $B.imported._typing\n` +
              prefix + `var locals_${type_params_ref} = {},\n` +
              prefix + tab + tab + `locals = locals_${type_params_ref},\n` +
              prefix + tab + tab + `frame = ['${type_params_ref}', locals, '${gname}', ${globals_name}],\n` +
              prefix + tab + tab + `type_params = []\n` +
              prefix + `$B.enter_frame(frame, '${scopes.filename}', ${this.lineno})\n`
        for(var item of this.type_params){
            type_params += type_param_in_def(item, type_params_ref, scopes)
        }
        type_params_func += type_params
    }

    var func_scope = new Scope(this.name, 'def', this)
    scopes.push(func_scope)

    var args = positional.concat(this.args.kwonlyargs),
        slots = [],
        arg_names = []
    for(let arg of args){
        slots.push(arg.arg + ': null')
        // bind argument in function scope
        bind(arg.arg, scopes)
    }
    for(let arg of this.args.posonlyargs){
        arg_names.push(`'${mangle_arg(arg.arg)}'`)
    }

    for(let arg of this.args.args.concat(this.args.kwonlyargs)){
        arg_names.push(`'${mangle_arg(arg.arg)}'`)
    }

    if(this.args.vararg){
        bind(mangle_arg(this.args.vararg.arg), scopes)
    }
    if(this.args.kwarg){
        bind(mangle_arg(this.args.kwarg.arg), scopes)
    }

    var is_generator = symtable_block.generator

    // process body first to detect possible "yield"s
    var function_body
    indent(is_generator ? 3 : 2)

    if(this.$is_lambda){
        var _return = new $B.ast.Return(this.body)
        copy_position(_return, this.body)
        var body = [_return]
        function_body = add_body(body, scopes)
    }else{
        function_body = add_body(this.body, scopes)
    }
    dedent(is_generator ? 3 : 2)

    var parse_args = [name2]

    var js = prefix + `$B.set_lineno(frame, ${this.lineno})\n` + prefix

    if(is_async && ! is_generator){
        js += 'async '
    }

    js += `function ${name2}(){\n`

    indent()

    var locals_name = make_scope_name(scopes, func_scope)
    js += prefix + `var locals\n`

    parse_args.push('arguments')

    var args_vararg = this.args.vararg === undefined ? 'null' :
                      "'" + mangle_arg(this.args.vararg.arg) + "'",
        args_kwarg = this.args.kwarg === undefined ? 'null':
                     "'" + mangle_arg(this.args.kwarg.arg) + "'"

    if(positional.length == 0 && slots.length == 0 &&
            this.args.vararg === undefined &&
            this.args.kwarg === undefined){
        js += prefix + `var ${locals_name} = locals = {};\n`
        // generate error message
        js += prefix + `if(arguments.length !== 0){\n` +
              prefix + tab + `${name2}.$args_parser(${parse_args.join(', ')})\n` +
              prefix + `}\n`
    }else{
        js += prefix + `var ${locals_name} = locals = ` +
              `${name2}.$args_parser(${parse_args.join(', ')})\n`
    }

    js += prefix + `var frame = ["${this.$is_lambda ? '<lambda>': this.name}", ` +
          `locals, "${gname}", ${globals_name}, ${name2}]\n` +
          prefix + `$B.enter_frame(frame, __file__, ${this.lineno})\n`

    if(func_scope.positions){
        js += prefix + `frame.positions = [${func_scope.positions}]\n`
    }

    if(func_scope.needs_stack_length){
        js += prefix + `var stack_length = $B.count_frames()\n`
    }

    if(func_scope.needs_frames || is_async){
        js += prefix + `var _frame_obj = $B.frame_obj\n`
    }

    if(is_async){
        js += prefix + 'frame.$async = true\n'
    }

    if(is_generator){
        js += prefix + `locals.$is_generator = true\n`
        if(is_async){
            js += prefix + `var gen_${id} = async function*(){\n`
        }else{
            js += prefix + `var gen_${id} = function*(){\n`
        }
        indent()
    }
    js += prefix + `try{\n`
    indent()
    js += prefix + `$B.js_this = this\n`
    if(in_class){
        // Set local name "__class__"
        var ix = scopes.indexOf(class_scope),
            parent = scopes[ix - 1]

        var scope_ref = make_scope_name(scopes, parent),
            class_ref = class_scope.name, // XXX qualname
            refs = class_ref.split('.').map(x => `'${x}'`)
        bind("__class__", scopes)
        js += prefix + `locals.__class__ =  ` +
                  `$B.get_method_class(${name2}, ${scope_ref}, "${class_ref}", [${refs}])\n`
    }

    js += function_body + '\n'

    if((! this.$is_lambda) && ! ($B.last(this.body) instanceof $B.ast.Return)){
        // add an explicit "return None"
        js += prefix + 'return $B.trace_return_and_leave(frame, _b_.None)\n'
    }

    dedent()
    js += prefix + `}catch(err){\n`
    indent()

    if(func_scope.needs_frames){
        js += prefix + `$B.set_exc_and_trace(frame, err)\n` +
              `$B.leave_frame()\n` +
              `throw err\n`
    }else{
        js += prefix + `$B.set_exc_and_leave(frame, err)\n`
    }
    dedent()
    js += prefix + `}\n`
    dedent()
    js += prefix + `}`

    if(is_generator){
        js += '\n' + prefix + `gen_${id} = `
        if(is_async){
            js += `$B.async_generator.$factory(`
        }else{
            js += `$B.generator.$factory(`
        }
        js += `gen_${id}, '${this.name}')\n`
        js += prefix + `var _gen_${id} = gen_${id}()\n` +
              prefix + `_gen_${id}.$frame = frame\n` +
              prefix + `$B.leave_frame()\n` +
              prefix + `return _gen_${id}\n` // close gen
        dedent()
        js += prefix + '}\n'
    }else{
        js += '\n'
    }

    scopes.pop()

    var qualname = in_class ? `${func_name_scope.name}.${this.name}` :
                              this.name

    // Flags
    var flags = $B.COMPILER_FLAGS.OPTIMIZED | $B.COMPILER_FLAGS.NEWLOCALS
    if(this.args.vararg){
        flags |= $B.COMPILER_FLAGS.VARARGS
    }
    if(this.args.kwarg){
        flags |= $B.COMPILER_FLAGS.VARKEYWORDS
    }
    if(is_generator){
        flags |= $B.COMPILER_FLAGS.GENERATOR
    }
    if(is_async){
        flags |= $B.COMPILER_FLAGS.COROUTINE
    }

    var parameters = [],
        locals = [],
        identifiers = _b_.dict.$keys_string(symtable_block.symbols)

    var free_vars = []
    for(var ident of identifiers){
        var flag = _b_.dict.$getitem_string(symtable_block.symbols, ident),
            _scope = (flag >> SF.SCOPE_OFF) & SF.SCOPE_MASK
        if(_scope == SF.FREE){
            free_vars.push(`'${ident}'`)
        }
        if(flag & SF.DEF_PARAM){
            parameters.push(`'${ident}'`)
        }else if(flag & SF.DEF_LOCAL){
            locals.push(`'${ident}'`)
        }
    }
    var varnames = parameters.concat(locals)
    // Set attribute $is_func to distinguish Brython functions from JS
    // Used in py_dom.js / DOMNode.__getattribute__
    if(in_class){
        js += prefix + `${name2}.$is_method = true\n`
    }

    var anns
    if(this.returns || parsed_args.annotations){
        var features = scopes.symtable.table.future.features,
            postponed = features & $B.CO_FUTURE_ANNOTATIONS
        if(postponed){
            // PEP 563
            var src = scopes.src
            if(src === undefined){
                console.log('no src, filename', scopes)
            }
        }
        var ann_items = []
        if(parsed_args.annotations){
            for(var arg_ann in parsed_args.annotations){
                var ann_ast = parsed_args.annotations[arg_ann]
                if(in_class){
                    arg_ann = mangle(scopes, class_scope, arg_ann)
                }
                if(postponed){
                    // PEP 563
                    var ann_str = annotation_to_str(ann_ast, scopes)
                    ann_items.push(`['${arg_ann}', '${ann_str}']`)
                }else{
                    var value = ann_ast.to_js(scopes)
                    ann_items.push(`['${arg_ann}', ${value}]`)
                }
            }
        }
        if(this.returns){
            if(postponed){
                var ann_str = annotation_to_str(this.returns, scopes)
                ann_items.push(`['return', '${ann_str}']`)
            }else{
                ann_items.push(`['return', ${this.returns.to_js(scopes)}]`)
            }
        }
        anns = `[${ann_items.join(', ')}]`
    }else{
        anns = `[]`
    }

    // Set admin infos
    js += prefix + `${name2}.$function_infos = [` +
        `'${gname}', ` +
        `'${this.$is_lambda ? '<lambda>': this.name}', ` +
        `'${this.$is_lambda ? '<lambda>': qualname}', ` +
        `__file__, ` +
        `${defaults}, ` +
        `${kw_defaults}, ` +
        `${docstring}, ` +
        `[${arg_names}], ` +
        `${args_vararg}, ` +
        `${args_kwarg},\n` +
        // make f.__code__
        prefix + tab + `${positional.length}, ` +
        `${this.lineno}, ` +
        `${flags}, ` +
        `[${free_vars}], ` +
        `${this.args.kwonlyargs.length}, ` +
        `${this.args.posonlyargs.length}, ` +
        `[${varnames}], ` +
        `${anns}, ` +
        `${has_type_params ? 'type_params' : '[]'}]\n`;

    js += prefix + `${name2}.$args_parser = $B.make_args_parser_and_parse\n`

    if(is_async && ! is_generator){
        js += prefix + `${name2} = $B.make_async(${name2})\n`
    }

    var mangled = mangle(scopes, func_name_scope, this.name),
        func_ref = `${make_scope_name(scopes, func_name_scope)}.${mangled}`

    if(decorated){
        func_ref = `decorated${make_id()}`
        js += prefix + 'var '
    }else{
        js += prefix
    }

    js += `${func_ref} = ${name2}\n`

    if(has_type_params){
        scopes.pop()
    }

    if(decorated && ! has_type_params){
        js += prefix + `${make_scope_name(scopes, func_name_scope)}.${mangled} = `
        let decorate = func_ref
        for(let dec of decorators.reverse()){
            decorate = `$B.$call(${dec})(${decorate})`
        }
        js += decorate
    }

    if(has_type_params){
        // complete function TYPE_PARAMS_OF_func()
        type_params_func += '\n' + js + '\n' +
            `${name2}.__type_params__ = $B.fast_tuple(type_params)\n` +
            `$B.leave_frame()\n` +
            `return ${name2}\n}\n`

        js = type_params_func
        if(decorated){
            // decorate outside of TYPE_PARAMS_OF_
            js += `var ${func_ref} = TYPE_PARAMS_OF_${name2}()\n` +
                `${make_scope_name(scopes, func_name_scope)}.${mangled} = `
            let decorate = func_ref
            for(let dec of decorators.reverse()){
                decorate = `$B.$call(${dec})(${decorate})`
            }
            js += decorate
        }else{
            js += `var locals_${type_params_ref} = TYPE_PARAMS_OF_${name2}()\n`
        }
    }
    js = decs_declare + js
    return js
}

$B.ast.FunctionDef.prototype._check = function(){
    for(var arg of this.args.args){
        if(arg instanceof $B.ast.arg){
            if(arg.arg == '__debug__'){
                compiler_error(arg, 'cannot assign to __debug__')
            }
        }
    }
    for(var arg of this.args.kwonlyargs){
        if(arg instanceof $B.ast.arg){
            if(arg.arg == '__debug__'){
                compiler_error(arg, 'cannot assign to __debug__')
            }
        }
    }
    if(this.args.kwarg && this.args.kwarg.arg == '__debug__'){
        compiler_error(this.args.kwarg, 'cannot assign to __debug__')
    }
}

$B.ast.GeneratorExp.prototype.to_js = function(scopes){
    var id = make_id(),
        symtable_block = scopes.symtable.table.blocks.get(fast_id(this)),
        varnames = symtable_block.varnames.map(x => `"${x}"`)

    var first_for = this.generators[0],
        // outmost expression is evaluated in enclosing scope
        outmost_expr = $B.js_from_ast(first_for.iter, scopes),
        nb_paren = 1

    var comp_scope = new Scope(`genexpr_${id}`, 'comprehension', this)
    scopes.push(comp_scope)

    var comp = {ast:this, id, type: 'genexpr', varnames,
                module_name: scopes[0].name,
                locals_name: make_scope_name(scopes),
                globals_name: make_scope_name(scopes, scopes[0])}

    indent()
    var head = init_comprehension(comp, scopes)

    var js = prefix + `var gen${id} = $B.generator.$factory(${has_await ? 'async ' : ''}function*(expr){\n`

    // special case for first generator
    var first = this.generators[0]
    indent()
    js += prefix + `$B.enter_frame(frame, __file__, ${this.lineno})\n` +
          prefix + `var next_func_${id} = $B.make_js_iterator(expr, frame, ${this.lineno})\n` +
          prefix + `for(var next_${id} of next_func_${id}){\n`
    indent()
    js += prefix + `$B.enter_frame(frame, __file__, ${this.lineno})\n`
    // assign result of iteration to target
    var name = new $B.ast.Name(`next_${id}`, new $B.ast.Load())
    copy_position(name, first_for.iter)
    name.to_js = function(){return `next_${id}`}
    var assign = new $B.ast.Assign([first.target], name)
    assign.lineno = this.lineno
    js += assign.to_js(scopes) + '\n'

    for(let _if of first.ifs){
        nb_paren++
        js += prefix + `if($B.$bool(${$B.js_from_ast(_if, scopes)})){\n`
        indent()
    }

    for(var comprehension of this.generators.slice(1)){
        js += comprehension.to_js(scopes)
        nb_paren++
        for(let _if of comprehension.ifs){
            nb_paren++
        }
    }

    dedent(2)

    // Translate element. This must be done after translating comprehensions
    // so that target names are bound
    var elt = $B.js_from_ast(this.elt, scopes),
        has_await = comp_scope.has_await

    // If the element has an "await", attribute has_await is set to the scope
    // Use it to make the function aync or not
    dedent()

    indent(3)

    js += has_await ? prefix + 'var save_frame_obj = $B.frame_obj;\n' : ''
    js += prefix + `try{\n` +
          prefix + tab + `yield ${elt}\n` +
          prefix + `}catch(err){\n` +
          (has_await ? prefix + tab + '$B.restore_frame_obj(save_frame_obj, locals)\n' : '') +
          prefix + tab + `$B.leave_frame()\n` +
          prefix + tab + `throw err\n` +
          prefix + `}\n`
    dedent()
    js += (has_await ? prefix +'\n$B.restore_frame_obj(save_frame_obj, locals);' : '')

    for(var i = 0; i < nb_paren - 1; i++){
        js += prefix + '}\n'
        dedent()
    }
    js += prefix + '$B.leave_frame()\n'
    dedent()
    js += prefix + '}\n'
    js += prefix + '$B.leave_frame()\n'
    js += prefix + '}, "<genexpr>")(expr)\n'

    scopes.pop()
    var func = `${head}\n${js}\n` + prefix + `return gen${id}`
    dedent()
    return prefix + `(function(expr){\n${func}\n` +
           prefix + `})(${outmost_expr})\n`
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
    var js = prefix + `if($B.set_lineno(frame, ${this.lineno}) && `
    if(this.test instanceof $B.ast.BoolOp){
        this.test.$dont_evaluate = true
        js += `${$B.js_from_ast(this.test, scopes)}){\n`
    }else{
        js += `$B.$bool(${$B.js_from_ast(this.test, scopes)})){\n`
    }
    scopes.push(new_scope)
    indent()
    js += add_body(this.body, scopes) + '\n'
    dedent()
    js += prefix +'}'
    scopes.pop()
    if(this.orelse.length > 0){
        if(this.orelse[0] instanceof $B.ast.If && this.orelse.length == 1){
            js += 'else ' + $B.js_from_ast(this.orelse[0], scopes).trimLeft()
            indent()
            js += add_body(this.orelse.slice(1), scopes)
            dedent()
        }else{
            js += 'else{\n'
            scopes.push(copy_scope(scope, this))
            indent()
            js += add_body(this.orelse, scopes)
            dedent()
            scopes.pop()
            js += '\n' + prefix + '}'
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
    var js = prefix + `$B.set_lineno(frame, ${this.lineno})\n`
    var inum = add_to_positions(scopes, this)
    for(var alias of this.names){
        js += prefix + `$B.$import("${alias.name}", [], `
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

        js += `locals, ${inum})\n`
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

    var js = prefix + `$B.set_lineno(frame, ${this.lineno})\n` +
             prefix + `$B.$import_from("${this.module || ''}", `
    var names = this.names.map(x => `"${x.name}"`).join(', '),
        aliases = []
    for(var name of this.names){
        if(name.asname){
            aliases.push(`${name.name}: '${name.asname}'`)
        }
    }
    var inum = add_to_positions(scopes, this)
    js += `[${names}], {${aliases.join(', ')}}, ${this.level}, locals, ${inum});`

    for(var alias of this.names){
        if(alias.asname){
            bind(alias.asname, scopes)
        }else if(alias.name == '*'){
            // mark scope as "blurred" by the presence of "from X import *"
            last_scope(scopes).blurred = true
        }else{
            bind(alias.name, scopes)
        }
    }
    return js
}

$B.ast.Interactive.prototype.to_js = function(scopes){
    mark_parents(this)
    // create top scope
    var name = init_scopes.bind(this)('module', scopes)

    var module_id = name,
        global_name = make_scope_name(scopes),
        mod_name = module_name(scopes)

    var js = `// Javascript code generated from ast\n` +
             `var $B = __BRYTHON__,\n_b_ = $B.builtins,\n`

    js += `${global_name} = {}, // $B.imported["${mod_name}"],\n` +
          `locals = ${global_name},\n` +
          `frame = ["${module_id}", locals, "${module_id}", locals]`

    js += `\nvar __file__ = '${scopes.filename ?? "<string>"}'\n` +
          `locals.__name__ = '${name}'\n` +
          `locals.__doc__ = ${extract_docstring(this, scopes)}\n`

    if(! scopes.imported){
          js += `locals.__annotations__ = locals.__annotations__ || $B.empty_dict()\n`
    }


        // for exec(), frame is put on top of the stack inside
        // py_builtin_functions.js / $$eval()

    js += `$B.enter_frame(frame, __file__, 1)\n`
    js += '\nvar _frame_obj = $B.frame_obj\n'
    js += 'var stack_length = $B.count_frames()\n'

    js += `try{\n` +
              add_body(this.body, scopes) + '\n' +
              `$B.leave_frame({locals, value: _b_.None})\n` +
          `}catch(err){\n` +
              `$B.set_exc_and_trace(frame, err)\n` +
              `$B.leave_frame({locals, value: _b_.None})\n` +
              'throw err\n' +
          `}`
    scopes.pop()

    console.log('Interactive', js)
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
    var id = make_id(),
        name = 'lambda_' + $B.lambda_magic + '_' + id
    var f = new $B.ast.FunctionDef(name, this.args, this.body, [])
    f.lineno = this.lineno
    f.$id = fast_id(this) // FunctionDef accesses symtable through id
    f.$is_lambda = true
    indent()
    var js = f.to_js(scopes),
        lambda_ref = reference(scopes, last_scope(scopes), name)
    js = `(function(){\n${js}\n` +
        prefix + `return ${lambda_ref}\n`
    dedent()
    return js + prefix + `})()`
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
    indent()
    js += add_body(this.body, scopes) + '\n'
    dedent()
    js += prefix + '}'

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
            var err_msg = 'alternative patterns bind different names'
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
    var irrefutable
    var js = prefix + `var subject = ${$B.js_from_ast(this.subject, scopes)}\n`,
        first = true
    for(var _case of this.cases){
        if(! _case.guard){
            if(irrefutable){
                irrefutable_error(irrefutable)
            }
            irrefutable = is_irrefutable(_case.pattern)
        }

        if(first){
            js += prefix + 'if'
            first = false
        }else{
            js += 'else if'
        }
        js += $B.js_from_ast(_case, scopes)
    }
    return prefix + `$B.set_lineno(frame, ${this.lineno})\n`+ js
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
    for(let pattern of this.patterns.concat(this.kwd_patterns)){
        let name = pattern.name
        if(name){
            if(names.indexOf(name) > -1){
                compiler_error(pattern,
                     `multiple assignment to name '${name}' in pattern`)
            }
            names.push(name)
        }
    }

    names = []
    for(let i = 0; i < this.kwd_attrs.length; i++){
        let kwd_attr = this.kwd_attrs[i]
        if(names.indexOf(kwd_attr) > -1){
            compiler_error(this.kwd_patterns[i],
                `attribute name repeated in class pattern: ${kwd_attr}`)
        }
        names.push(kwd_attr)
    }

    var cls = $B.js_from_ast(this.cls, scopes),
        patterns = this.patterns.map(x => `{${$B.js_from_ast(x, scopes)}}`)
    var kw = []
    for(let i = 0, len = this.kwd_patterns.length; i < len; i++){
        kw.push(this.kwd_attrs[i] + ': {' +
            $B.js_from_ast(this.kwd_patterns[i], scopes) + '}')
    }
    return `class: ${cls}, args: [${patterns}], keywords: {${kw.join(', ')}}`
}

$B.ast.MatchMapping.prototype.to_js = function(scopes){
    for(let key of this.keys){
        if(key instanceof $B.ast.Attribute ||
                key instanceof $B.ast.Constant ||
                key instanceof $B.ast.UnaryOp ||
                key instanceof $B.ast.BinOp){
            continue
        }else{
            compiler_error(key,
                'mapping pattern keys may only match literals and attribute lookups')
        }
    }
    var names = []
    for(let pattern of this.patterns){
        if(pattern instanceof $B.ast.MatchAs && pattern.name){
            if(names.indexOf(pattern.name) > -1){
                compiler_error(pattern,
                    `multiple assignments to name '${pattern.name}' in pattern`)
            }
            names.push(pattern.name)
        }
    }
    var items = []
    for(let i = 0, len = this.keys.length; i < len; i++){
        let key_prefix = this.keys[i] instanceof $B.ast.Constant ?
                            'literal: ' : 'value: ',
            key = $B.js_from_ast(this.keys[i], scopes),
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

$B.ast.MatchSingleton.prototype.to_js = function(){
    var value = this.value === true ? '_b_.True' :
                this.value === false ? '_b_.False' :
                '_b_.None'

    return `literal: ${value}`
}

$B.ast.MatchStar.prototype.to_js = function(){
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
    if(prefix.length != 0){
        console.log('prefix length at start', prefix.length)
    }
    mark_parents(this)
    // create top scope; namespaces can be passed by exec()
    var name = init_scopes.bind(this)('module', scopes),
        namespaces = scopes.namespaces

    var module_id = name,
        global_name = make_scope_name(scopes),
        mod_name = module_name(scopes)

    var js = `var $B = __BRYTHON__,\n    _b_ = $B.builtins,\n`
    if(! namespaces){
        js += `    ${global_name} = $B.imported["${mod_name}"],\n` +
              `    locals = ${global_name},\n` +
              `    frame = ["${module_id}", locals, "${module_id}", locals]`
    }else{
        // If module is run in an exec(), name "frame" is defined
        js += `    locals = ${namespaces.local_name},\n` +
              `    globals = ${namespaces.global_name}`
        if(name){
            let local_name = ('locals_' + name).replace(/\./g, '_')
            js += `,\n    ${local_name} = locals`
        }
    }

    js += `\nvar __file__ = '${scopes.filename ?? "<string>"}'\n` +
          `locals.__name__ = '${name}'\n` +
          `locals.__doc__ = ${extract_docstring(this, scopes)}\n`

    var insert_positions = js.length
    if(! scopes.imported){
          js += `locals.__annotations__ = locals.__annotations__ || $B.empty_dict()\n`
    }


    // for exec(), frame is put on top of the stack inside
    // py_builtin_functions.js / $eval()
    if(! namespaces){
          js += `$B.enter_frame(frame, __file__, 1)\n`
          js += '\nvar _frame_obj = $B.frame_obj\n'
    }
    js += 'var stack_length = $B.count_frames()\n'

    js += `try{\n`
    indent()
    js += add_body(this.body, scopes) + '\n' +
          prefix + `$B.leave_frame({locals, value: _b_.None})\n`
    dedent()
    js += prefix + `}catch(err){\n`
    indent()
    js += prefix + `$B.set_exc_and_trace(frame, err)\n` +
              prefix + `$B.leave_frame({locals, value: _b_.None})\n` +
              prefix + 'throw err\n'
    dedent()
    js += prefix + `}`
    var positions = scopes[scopes.length - 1].positions
    if(positions && positions.length > 0){
        var rest = js.substr(insert_positions)
        js = js.substr(0, insert_positions) +
             `frame.positions = [${positions}]\n`
        js += rest
    }
    scopes.pop()
    if(prefix.length != 0){
        console.warn('wrong indent !', prefix.length)
        // console.warn(scopes.src)
        // throw Error()
        prefix = ''
    }
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
        var scope = name_scope(this.id, scopes)
        if(scope.found === $B.last(scopes)){
            return 'locals.' + mangle(scopes, scope.found, this.id)
        }
        var res = name_reference(this.id, scopes, this)
        if(this.id == '__debugger__' && res.startsWith('$B.resolve_in_scopes')){
            // Special case : name __debugger__ is translated to Javascript
            // "debugger" if not bound in Brython code
            return 'debugger'
        }
        return res
    }
}

$B.ast.NamedExpr.prototype.to_js = function(scopes){
    compiler_check(this)
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

$B.ast.NamedExpr.prototype._check = function(){
    check_assign_or_delete(this, this.target)
}

$B.ast.Nonlocal.prototype.to_js = function(scopes){
    var scope = $B.last(scopes)
    for(var name of this.names){
        scope.nonlocals.add(name)
    }
    return ''
}

$B.ast.Pass.prototype.to_js = function(){
    return prefix + `$B.set_lineno(frame, ${this.lineno})\n` +
           prefix + 'void(0)'
}

$B.ast.Raise.prototype.to_js = function(scopes){
    var js = prefix + `$B.set_lineno(frame, ${this.lineno})\n` +
             prefix + '$B.$raise('
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
    if(last_scope(scopes).type != 'def'){
        compiler_error(this, "'return' outside function")
    }

    compiler_check(this)
    var js = prefix + `$B.set_lineno(frame, ${this.lineno})\n` +
             prefix + `return $B.trace_return_and_leave(frame, ` +
             (this.value ? $B.js_from_ast(this.value, scopes) : ' _b_.None') +
             ')\n'
    return js
}

function remove_escapes(value){
    for(var key in $B.escape2cp){ // in py_string.js
        value = value.replace(new RegExp('\\\\' + key, 'g'), $B.escape2cp[key])
    }
    return value
}

$B.ast.Set.prototype.to_js = function(scopes){
    var elts = []
    for(var elt of this.elts){
        var js
        if(elt instanceof $B.ast.Constant){
            var v = elt.value
            if(typeof v == 'string'){
                v = remove_escapes(v)
            }
            js = `{constant: [${$B.js_from_ast(elt, scopes)}, ` +
                 `${$B.$hash(v)}]}`
        }else if(elt instanceof $B.ast.Starred){
            js = `{starred: ${$B.js_from_ast(elt.value, scopes)}}`
        }else{
            js = `{item: ${$B.js_from_ast(elt, scopes)}}`
        }
        elts.push(js)
    }

    return `_b_.set.$literal([${elts.join(', ')}])`
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
        var position = encode_position("'Subscript'",
            this.value.lineno, this.value.col_offset,
            this.value.end_lineno, this.value.end_col_offset,
            this.slice.lineno, this.slice.col_offset,
            this.end_lineno, this.end_col_offset)
        var inum = add_to_positions(scopes, this)
        return `$B.$getitem(${value}, ${slice}, ${inum})`
    }
}

$B.ast.Try.prototype.to_js = function(scopes){
    compiler_check(this)
    var id = make_id(),
        has_except_handlers = this.handlers.length > 0,
        has_else = this.orelse.length > 0,
        has_finally = this.finalbody.length > 0

    var js = prefix + `$B.set_lineno(frame, ${this.lineno})\n` +
             prefix + `try{\n`
    indent()

    // Save stack length. Used if there is an 'else' clause and no 'finally':
    // if the 'try' body ran without an exception and ended with a 'return',
    // don't execute the 'else' clause
    js += prefix + `var stack_length_${id} = $B.count_frames()\n`

    // Save execution stack in case there are return statements and a finally
    // block
    js += prefix + `var save_frame_obj_${id} = $B.frame_obj\n`
    if(has_else){
        js += prefix + `var failed${id} = false\n`
    }

    var try_scope = copy_scope($B.last(scopes))
    scopes.push(try_scope)
    js += add_body(this.body, scopes) + '\n'
    dedent()
    if(has_except_handlers){
        var err = 'err' + id
        js += prefix + '}' // close try
        js += `catch(${err}){\n`
        indent()
        js += prefix + `$B.set_exc_and_trace(frame, ${err})\n`
        if(has_else){
            js += prefix + `failed${id} = true\n`
        }
        var first = true,
            has_untyped_except = false
        for(var handler of this.handlers){
            if(first){
                js += prefix + 'if'
                first = false
            }else{
                js += prefix + '}else if'
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
            indent()
            if(handler.name){
                bind(handler.name, scopes)
                var mangled = mangle(scopes, try_scope, handler.name)
                js += prefix + `locals.${mangled} = ${err}\n`
            }
            js += add_body(handler.body, scopes) + '\n'
            if(! ($B.last(handler.body) instanceof $B.ast.Return)){
                // delete current exception
                js += prefix + '$B.del_exc(frame)\n'
                js += prefix + `$B.frame_obj = save_frame_obj_${id}\n`
            }
            dedent()
        }
        if(! has_untyped_except){
            // handle other exceptions
            js += prefix + `}else{\n` +
                  prefix + tab + `throw ${err}\n`
        }
        // close last if
        js += prefix + '}\n'
        dedent()
    }
    if(has_else || has_finally){
        js += prefix + '}' // close try
        js += 'finally{\n'
        indent()
        if(has_else && has_finally){
            // "else" will be wrapped in a 'try' and
            // "finally" in a 'finally'
            indent()
        }
        var finalbody = prefix + `var exit = false\n` +
                        prefix + `if($B.count_frames() < stack_length_${id}){\n` +
                        prefix + tab + `exit = true\n` +
                        prefix + tab +`$B.frame_obj = $B.push_frame(frame)\n` +
                        prefix + `}\n` +
                        add_body(this.finalbody, scopes)
        if(this.finalbody.length > 0 &&
                ! ($B.last(this.finalbody) instanceof $B.ast.Return)){
            finalbody += '\n' + prefix + `if(exit){\n` +
                         prefix + tab + `$B.leave_frame()\n` +
                         prefix + `}`
        }
        // The 'else' clause is executed if no exception was raised, and if
        // there was no 'return' in the 'try' block (in which case the stack
        // was popped from)
        var elsebody = prefix + `if($B.count_frames() == stack_length_${id} ` +
                       `&& ! failed${id}){\n`
        indent()
        elsebody += add_body(this.orelse, scopes)
        dedent()
        elsebody += '\n' + prefix + '}' // close "if"

        if(has_else && has_finally){
            dedent()
            js += prefix + `try{\n` +
                  elsebody +
                  '\n' + prefix + '}' + // close "try"
                  `finally{\n` + finalbody + '\n' +
                  prefix + '}\n'
        }else if(has_else && ! has_finally){
            js += elsebody + '\n'
        }else{
            js += finalbody + '\n'
        }
        dedent()
        js += prefix + '}\n' // close "finally"
    }else{
        js += '}\n' // close catch
    }
    scopes.pop()
    return js
}

$B.ast.TryStar.prototype.to_js = function(scopes){
    // PEP 654 try...except*...
    var id = make_id(),
        has_except_handlers = this.handlers.length > 0,
        has_else = this.orelse.length > 0,
        has_finally = this.finalbody.length > 0

    var js = prefix + `$B.set_lineno(frame, ${this.lineno})\n` +
             prefix + `try{\n`
    indent()
    // Save stack length. Used if there is an 'else' clause and no 'finally':
    // if the 'try' body ran without an exception and ended with a 'return',
    // don't execute the 'else' clause
    js += prefix + `var stack_length_${id} = $B.count_frames()\n`

    // Save execution stack in case there are return statements and a finally
    // block
    if(has_finally){
        js += prefix + `var save_frame_obj_${id} = $B.frame_obj\n`
    }
    if(has_else){
        js += prefix + `var failed${id} = false\n`
    }

    var try_scope = copy_scope($B.last(scopes))
    scopes.push(try_scope)
    js += add_body(this.body, scopes) + '\n'
    if(has_except_handlers){
        var err = 'err' + id
        dedent()
        js += prefix + '}' // close try
        js += `catch(${err}){\n`
        indent()
        js += prefix + `$B.set_exc_and_trace(frame, ${err})\n` +
              prefix + `if(! $B.$isinstance(${err}, _b_.BaseExceptionGroup)){\n` +
              prefix + tab + `${err} = _b_.BaseExceptionGroup.$factory(_b_.None, [${err}])\n` +
              prefix + '}\n' +
              prefix + `function fake_split(exc, condition){\n` +
              prefix + tab + `return condition(exc) ? ` +
                  `$B.fast_tuple([exc, _b_.None]) : $B.fast_tuple([_b_.None, exc])\n` +
              prefix + '}\n'
        if(has_else){
            js += prefix + `failed${id} = true\n`
        }
        for(var handler of this.handlers){
            js += prefix + `$B.set_lineno(frame, ${handler.lineno})\n`
            if(handler.type){
                js += prefix + "var condition = function(exc){\n" +
                      prefix + tab + "return $B.$isinstance(exc, " +
                      `${$B.js_from_ast(handler.type, scopes)})\n` +
                      prefix + "}\n" +
                      prefix + `var klass = $B.get_class(${err}),\n`
                indent()
                js += prefix + `split_method = $B.$getattr(klass, 'split'),\n` +
                      prefix + `split = $B.$call(split_method)(${err}, condition),\n` +
                      prefix + 'matching = split[0],\n' +
                      prefix + 'rest = split[1]\n'
                dedent()
                js += prefix + 'if(matching.exceptions !== _b_.None){\n'
                indent()
                js += prefix + 'for(var err of matching.exceptions){\n'
                indent()
                if(handler.name){
                    bind(handler.name, scopes)
                    var mangled = mangle(scopes, try_scope, handler.name)
                    js += prefix + `locals.${mangled} = ${err}\n`
                }
                js += add_body(handler.body, scopes) + '\n'
                if(! ($B.last(handler.body) instanceof $B.ast.Return)){
                    // delete current exception
                    js += prefix + '$B.del_exc(frame)\n'
                }
                dedent()
                js += prefix + '}\n'
                dedent()
                js += prefix + '}\n'
                js += prefix + `${err} = rest\n`
            }
        }
        js += prefix + `if(${err}.exceptions !== _b_.None){\n` +
              prefix + tab + `throw ${err}\n` +
              prefix + '}\n'
        dedent()
    }
    if(has_else || has_finally){
        js += prefix + '}' // close try
        js += 'finally{\n'
        indent()
        if(has_else && has_finally){
            indent()
        }
        var finalbody = prefix + `var exit = false\n` +
                        prefix + `if($B.count_frames() < stack_length_${id}){\n` +
                        prefix + tab + `exit = true\n` +
                        prefix + tab + `$B.frame_obj = $B.push_frame(frame)\n` +
                        prefix + `}\n` +
                        add_body(this.finalbody, scopes)
        if(this.finalbody.length > 0 &&
                ! ($B.last(this.finalbody) instanceof $B.ast.Return)){
            finalbody += '\n' + prefix + `if(exit){\n` +
                         prefix + tab + `$B.leave_frame(locals)\n` +
                         prefix + `}`
        }
        // The 'else' clause is executed if no exception was raised, and if
        // there was no 'return' in the 'try' block (in which case the stack
        // was popped from)
        var elsebody = prefix + `if($B.count_frames() == stack_length_${id} ` +
                       `&& ! failed${id}){\n`
        indent()
        elsebody += add_body(this.orelse, scopes)
        dedent()
        elsebody += '\n' + prefix + '}' // close "if"
        if(has_else && has_finally){
            dedent()
            js += prefix + `try{\n` +
                  elsebody + '\n' +
                  prefix + '}' + // close "try"
                  `finally{\n` + finalbody + '\n' +
                  prefix + '}'
        }else if(has_else && ! has_finally){
            js += elsebody
        }else{
            js += finalbody
        }
        dedent()
        js += '\n' + prefix + '}\n' // close "finally"
    }else{
        js += prefix + '}\n' // close catch
    }
    scopes.pop()
    return js
}

$B.ast.Tuple.prototype.to_js = function(scopes){
    return list_or_tuple_to_js.bind(this)('$B.fast_tuple', scopes)
}

$B.ast.TypeAlias.prototype.to_js = function(scopes){
    // For type aliases, symtable creates 2 blocks, one for the type params
    // and another one for the type alias. We create the 2 matching scopes
    var type_param_scope = new Scope('type_params', 'type_params', this.type_params)
    scopes.push(type_param_scope)
    var type_alias_scope = new Scope('type_alias', 'type_alias', this)
    scopes.push(type_alias_scope)

    var type_params_names = []

    check_type_params(this)

    for(var type_param of this.type_params){
        if(type_param instanceof $B.ast.TypeVar){
            type_params_names.push(type_param.name)
        }else if(type_param instanceof $B.ast.TypeVarTuple ||
                type_param instanceof $B.ast.ParamSpec){
            type_params_names.push(type_param.name.id)
        }
    }

    for(var name of type_params_names){
        bind(name, scopes)
    }

    var qualified_name = qualified_scope_name(scopes, type_alias_scope)
    var value = this.value.to_js(scopes)
    scopes.pop()
    scopes.pop()
    var js = prefix + `$B.$import('_typing')\n`
    // create locals for the type param scope
    js += prefix + `var locals_${qualified_scope_name(scopes, type_param_scope)} = {}\n`
    // emulate the function that creates the instance of TypeAliasType
    // as explained in Python Reference
    // https://docs.python.org/3/reference/compound_stmts.html#generic-type-aliases
    js += prefix + `function TYPE_PARAMS_OF_${this.name.id}(){\n`
    indent()
    js += prefix + `var locals_${qualified_name} = {},\n` +
          prefix + tab + tab + `locals = locals_${qualified_name}, \n` +
          prefix + tab + tab + `type_params = $B.fast_tuple([])\n`
    for(var i = 0, len = this.type_params.length; i < len; i++){
        js += prefix + `type_params.push(locals.${type_params_names[i]} = ` +
                  `${this.type_params[i].to_js()})\n`
    }
    // create the function called when the attribute __value__ of the
    // TypeAliasType instance is resolved ("lazy evaluation")
    js += prefix + `function get_value(){\n` +
          prefix + tab + `return ${value}\n` +
          prefix + `}\n`
    // The function returns an instance of _typing.TypeAliasType
    js += prefix + `var res = $B.$call($B.imported._typing.TypeAliasType)` +
          `('${this.name.id}', get_value)\n` +
          prefix + `$B.$setattr(res, '__module__', $B.frame_obj.frame[2])\n` +
          prefix + `$B.$setattr(res, '__type_params__', type_params)\n` +
          prefix + `return res\n`
    dedent()
    js += prefix + `}\n` +
          prefix + `locals.${this.name.id} = TYPE_PARAMS_OF_${this.name.id}()`
    return js
}

$B.ast.TypeVar.prototype.to_js = function(){
    check_type_params(this)
    return `$B.$call($B.imported._typing.TypeVar)('${this.name}', ` +
        `{$kw: [{infer_variance: true}]})`
}

$B.ast.TypeVarTuple.prototype.to_js = function(){
    return `$B.$call($B.imported._typing.TypeVarTuple)('${this.name.id}')`
}

$B.ast.ParamSpec.prototype.to_js = function(){
    return `$B.$call($B.imported._typing.ParamSpec)('${this.name.id}')`
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
    var id = make_id()

    // Create a new scope with the same name to avoid binding in the enclosing
    // scope.
    var scope = $B.last(scopes),
        new_scope = copy_scope(scope, this, id)

    scopes.push(new_scope)

    // Set a variable to detect a "break"
    var js = prefix + `var no_break_${id} = true\n`

    js += prefix + `while($B.set_lineno(frame, ${this.lineno}) && `
    if(this.test instanceof $B.ast.BoolOp){
        this.test.$dont_evaluate = true
        js += `${$B.js_from_ast(this.test, scopes)}){\n`
    }else{
        js += `$B.$bool(${$B.js_from_ast(this.test, scopes)})){\n`
    }
    indent()
    js += add_body(this.body, scopes)
    dedent()
    js += '\n' + prefix + '}\n'

    scopes.pop()

    if(this.orelse.length > 0){
        js += prefix + `if(no_break_${id}){\n`
        indent()
        js += add_body(this.orelse, scopes)
        dedent()
        js += '\n' + prefix + '}\n'
    }

    return js
}

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
        var id = make_id()
        var s = prefix + `var mgr_${id} = ` +
              $B.js_from_ast(item.context_expr, scopes) + ',\n' +
              prefix + `klass = $B.get_class(mgr_${id})\n` +
              prefix + `try{\n`
        indent()
        s += prefix + `var exit_${id} = $B.$getattr(klass, '__exit__'),\n` +
             prefix + tab + `enter_${id} = $B.$getattr(klass, '__enter__')\n`
        dedent()
        s += prefix + `}catch(err){\n`
        indent()
        s += prefix + `var klass_name = $B.class_name(mgr_${id})\n` +
             prefix + `throw _b_.TypeError.$factory("'" + klass_name + ` +
                      `"' object does not support the con` +
                      // split word 'context', replaced by "C" in brython.js...
                      `text manager protocol")\n`
        dedent()
        s += prefix + `}\n` +
             prefix + `var value_${id} = $B.$call(enter_${id})(mgr_${id}),\n` +
             prefix + tab +  `exc_${id} = true\n`
        if(in_generator){
            // add/update attribute used to close context managers in
            // leave_frame()
            s += prefix + `locals.$context_managers = locals.$context_managers || []\n` +
                 prefix + `locals.$context_managers.push(mgr_${id})\n`
        }
        s += prefix + 'try{\n'
        indent()
        s += prefix + 'try{\n'
        indent()
        if(item.optional_vars){
            var value = {to_js: function(){return `value_${id}`}}
            copy_position(value, _with)
            var assign = new $B.ast.Assign([item.optional_vars], value)
            copy_position(assign, _with)
            s += assign.to_js(scopes) + '\n'
        }
        s += js
        dedent()
        s += prefix + `}catch(err_${id}){\n`
        indent()
        s += prefix + `frame.$lineno = ${lineno}\n` +
             prefix + `exc_${id} = false\n` +
             prefix + `err_${id} = $B.exception(err_${id}, frame)\n` +
             prefix + `var $b = exit_${id}(mgr_${id}, err_${id}.__class__, ` +
                  `err_${id}, \n` +
             prefix + tab.repeat(4) + `$B.$getattr(err_${id}, '__traceback__'))\n` +
             prefix + `if(! $B.$bool($b)){\n` +
             prefix + tab + `throw err_${id}\n` +
             prefix + `}\n`
        dedent()
        s += prefix + `}\n`
        dedent()
        s += prefix + `}finally{\n`
        indent()
        s += prefix + `frame.$lineno = ${lineno}\n` +
             (in_generator ? prefix + `locals.$context_managers.pop()\n` : '') +
             prefix + `if(exc_${id}){\n`
        indent()
        s += prefix + `try{\n` +
             prefix + tab + `exit_${id}(mgr_${id}, _b_.None, _b_.None, _b_.None)\n` +
             prefix + `}catch(err){\n`
             // If an error occurs in __exit__, make sure the
             // stack frame is preserved (it may have been
             // modified by a "return" in the "with" block)
        indent()
        s += prefix + `if($B.count_frames() < stack_length){\n` +
             prefix + tab + `$B.frame_obj = $B.push_frame(frame)\n` +
             prefix + `}\n` +
             prefix + `throw err\n`
        dedent()
        s += prefix + `}\n`
        dedent()
        s += prefix + `}\n`
        dedent()
        s += prefix + `}\n`
        return s
    }

    var _with = this,
        scope = last_scope(scopes),
        lineno = this.lineno

    scope.needs_stack_length = true

    indent(2)
    var js = add_body(this.body, scopes) + '\n'
    dedent(2)
    var in_generator = scopes.symtable.table.blocks.get(fast_id(scope.ast)).generator
    for(var item of this.items.slice().reverse()){
        js = add_item(item, js)
    }
    return prefix + `$B.set_lineno(frame, ${this.lineno})\n` + js
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
    var n = make_id()
    var res = `yield* (function* f(){\n`
    indent()
    var js = `
        var _i${n} = _b_.iter(${value.trimRight()}),
            _r${n}
        var failed${n} = false
        try{
            var _y${n} = _b_.next(_i${n})
        }catch(_e){
            $B.set_exc(_e, frame)
            failed${n} = true
            $B.pmframe = $B.frame_obj.frame
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
                    $B.frame_obj = $B.push_frame(frame)
                }catch(_e){
                    $B.set_exc(_e, frame)
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
                            _x${n} = sys_module.exc_info()
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
                                if($B.is_exc(err, [_b_.StopIteration])){
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
        return _r${n}`
    var lines = js.split('\n').slice(1)
    var head = lines[0].length - lines[0].trimLeft().length
    for(var line of lines){
        var trimmed = line.trimLeft(),
            tlen = trimmed.length
        if(tlen == 0){
            res += '\n'
            continue
        }
        var line_head = line.length - tlen
        var line_indent = (line_head - head) / 4
        if(line_indent < 0){
            /*
            console.log(js)
            console.log('bug for line', line)
            console.log(scopes.filename)
            console.log('code for value\n', value)
            console.log('value ends with LN ?', value.endsWith('\n'))
            */
            console.warn('wrong indentation')
            line_indent = 0
        }
        res += prefix + tab.repeat(line_indent) + trimmed + '\n'
    }
    dedent()
    res += prefix + '})()'

    return res
}

var state = {}

$B.js_from_root = function(arg){
    var ast_root = arg.ast,
        symtable = arg.symtable,
        filename = arg.filename,
        src = arg.src,
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
    scopes.src = src
    scopes.namespaces = namespaces
    scopes.imported = imported
    scopes.imports = {}
    scopes.indent = 0
    var js_tab = $B.get_option('js_tab')
    tab = ' '.repeat(js_tab)
    var js = ast_root.to_js(scopes)
    return {js, imports: scopes.imports}
}

$B.js_from_ast = function(ast, scopes){
    if(! scopes.symtable){
        throw Error('perdu symtable')
    }
    scopes = scopes || []
    if(ast.to_js !== undefined){
        if(ast.col_offset === undefined){
            var klass = ast.constructor.$name
            if(['match_case'].indexOf(klass) == -1){
                console.log('no col_offset for', klass)
                console.log(ast)
                throw Error('no col offset')
            }
        }
        return ast.to_js(scopes)
    }
    console.log("unhandled", ast.constructor.$name, ast, typeof ast)
    return '// unhandled class ast.' + ast.constructor.$name
}

})(__BRYTHON__)
