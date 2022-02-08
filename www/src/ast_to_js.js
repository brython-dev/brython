(function($B){

var _b_ = $B.builtins


$B.set_func_infos = function(func, name, qualname, docstring){
    func.$is_func = true
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


function make_local(module_id){
    return `locals_${module_id.replace(/\./g, '_')}`
}

function make_scope_name(scopes, scope){
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
    return 'locals_' + names.join('_').replace(/\./g, '_')
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
    var scope = last_scope(scopes)
    name = mangle(scopes, scope, name)
    if(scope.globals && scope.globals.has(name)){
        scope = scopes[0]
    }else if(scope.nonlocals.has(name)){
        for(var i = scopes.indexOf(scope) - 1; i >= 0; i--){
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

function binding_scope(name, scopes){
    // return the scope where name is bound, or undefined
    var flags,
        block
    if(scopes.length == 0){
        // case of Expression
        return `$B.resolve('${name}')`
    }
    var scope = last_scope(scopes),
        name = mangle(scopes, scope, name)
    // Use symtable to detect if the name is local to the block
    if(scope.ast === undefined){
        console.log('no ast', scope)
    }
    block = scopes.symtable.table.blocks.get(_b_.id(scope.ast))
    if(block === undefined){
        console.log('no block', scope, scope.ast, 'id', _b_.id(scope.ast))
        console.log('symtable', scopes.symtable)
    }
    try{
        flags = block.symbols.$string_dict[name][0]
    }catch(err){
        console.log('name', name, 'not in symbols of block', block)
        return `$B.resolve('${name}')`
    }
    var __scope = (flags >> SCOPE_OFF) & SCOPE_MASK
    if([LOCAL, CELL].indexOf(__scope) > -1){
        // name is local (symtable) but may not have yet been bound in scope
        if(! scope.locals.has(name)){
            if(block.type == TYPE_CLASS){
                // In class definition, unbound local variables are looked up
                // in the global namespace (Language Reference 4.2.2)
                return `$B.resolve_global('${name}')`
            }else if(block.type == TYPE_MODULE){
                return `$B.resolve_global('${name}')`
            }
            return `$B.resolve_local('${name}')`
        }else{
            return reference(scopes, scope, name)
        }
    }else if(scope.globals.has(name)){
        var global_scope = scopes[0]
        if(global_scope.locals.has(name)){
            return reference(scopes, scopes[0], name)
        }
        return `$B.resolve_global('${name}')`
    }else if(scope.nonlocals.has(name)){
        // Search name in the surrounding scopes, using symtable
        for(var i = scopes.length - 2; i >= 0; i--){
            block = scopes.symtable.table.blocks.get(_b_.id(scopes[i].ast))
            if(block && block.symbols.$string_dict[name]){
                return reference(scopes, scopes[i], name)
            }
        }
    }
    if(scope.has_import_star){
        return `$B.resolve('${name}')`
    }
    for(var i = scopes.length - 2; i >= 0; i--){
        block = undefined
        if(scopes[i].ast){
            block = scopes.symtable.table.blocks.get(_b_.id(scopes[i].ast))
        }
        if(scopes[i].locals.has(name)){
            return reference(scopes, scopes[i], name)
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
                return `$B.resolve('${name}')`
            }
        }
        if(scopes[i].has_import_star){
            return `$B.resolve('${name}')`
        }
    }
    if(builtins_scope.locals.has(name)){
        return `_b_.${name}`
    }

    return `$B.resolve('${name}')`
}

function binding_scope1(name, scopes){
    // return the scope where name is bound, or undefined
    var scope = last_scope(scopes)
    if(scope.ast){
        // Use symtable to detect if the name is local to the block
        var block = scopes.symtable.table.blocks.get(_b_.id(scope.ast))
        try{
            flags = block.symbols.$string_dict[name][0]
        }catch(err){
            console.log(name, block)
            throw err
        }
        var __scope = (flags >> SCOPE_OFF) & SCOPE_MASK
        if([LOCAL, CELL].indexOf(__scope) > -1){
            // name is local
            return scope
        }
        if(scope.globals.has(name)){
            return scopes[0]
        }else if(scope.nonlocals.has(name)){
            for(var i = scopes.length - 2; i >=0; i--){
                if(scopes[i].locals.has(name)){
                    return scopes[i]
                }
            }
        }
    }
    for(var i = scopes.length - 1; i >= 0; i--){
        var block = scopes.symtable.table.blocks.get(scopes[i].ast)
        if(scopes[i].locals.has(name)){
            return scopes[i]
        }
    }
    if(builtins_scope.locals.has(name)){
        return builtins_scope
    }
}

function resolve_in_namespace(name, ns){
    if(ns.hasOwnProperty(name)){
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

$B.resolve_local = function(name){
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
    throw _b_.UnboundLocalError.$factory(`local variable '${name}' ` +
        'referenced before assignment')
}

$B.resolve_global = function(name){
    // Resolve in globals or builtins
    var frame = $B.last($B.frames_stack)
    if(frame[3].hasOwnProperty(name)){
        return frame[3][name]
    }
    if(builtins_scope.locals.has(name)){
        return _b_[name]
    }
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

function init_comprehension(comp){
    // Code common to comprehensions and generator expressions
    var comp_id = comp.type + '_' + comp.id,
        varnames = Object.keys(comp.varnames || {}).map(x => `'${x}'`).join(', ')
    return `var ${comp.locals_name} = {},\n` +
               `locals = ${comp.locals_name}\n` +
               `locals.$lineno = ${comp.ast.lineno}\n` +
           `locals.$comp_code = {\n` +
               `co_argcount: 1,\n` +
               `co_firstlineno:${comp.ast.lineno},\n` +
               `co_name: "<${comp.type}>",\n` +
               `co_flags: ${comp.type == 'genexpr' ? 115 : 83},\n` +
               `co_freevars: $B.fast_tuple([]),\n` +
               `co_kwonlyargcount: 0,\n` +
               `co_posonlyargount: 0,\n` +
               `co_varnames: $B.fast_tuple(['.0', ${varnames}])\n` +
           `}\n` +
           `locals['.0'] = expr\n` +
           `var top_frame = ["${comp_id}", ${comp.locals_name}, ` +
           `"${comp.module_name}", ${comp.globals_name}]\n` +
           `locals.$f_trace = $B.enter_frame(top_frame)\n`
}

function make_comp(scopes){
    // Code common to list / set / dict comprehensions
    var id = $B.UUID(),
        type = this.constructor.$name,
        symtable_block = scopes.symtable.table.blocks.get(_b_.id(this)),
        varnames = symtable_block.varnames.map(x => `"${x}"`)

    var expr = this.elt,
        first_for = this.generators[0],
        // outmost expression is evaluated in enclosing scope
        outmost_expr = $B.js_from_ast(first_for.iter, scopes),
        nb_paren = 1

    var comp_scope = new Scope(`${type}_${id}`, 'comprehension', this)
    scopes.push(comp_scope)

    var comp = {ast:this, id, type, varnames,
                module_name: scopes[0].name,
                locals_name: make_scope_name(scopes),
                globals_name: make_scope_name(scopes, scopes[0])}

    var js = init_comprehension(comp)

    if(this instanceof $B.ast.ListComp){
        js += `var result_${id} = []\n`
    }else if(this instanceof $B.ast.SetComp){
        js += `var result_${id} = _b_.set.$factory()\n`
    }else if(this instanceof $B.ast.DictComp){
        js += `var result_${id} = $B.empty_dict()\n`
    }

    // special case for first generator
    var first = this.generators[0]
    js += `var next_func_${id} = $B.next_of(expr)\n` +
          `while(true){\ntry{\nvar next_${id} = next_func_${id}()\n` +
          `}catch(err){\nif($B.is_exc(err, [_b_.StopIteration])){\n` +
          `break\n}else{\n$B.leave_frame({locals, value: _b_.None})\n ` +
          `throw err\n}\n}\n`
    // assign result of iteration to target
    var name = new $B.ast.Name(`next_${id}`, new $B.ast.Load())
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
    js += `try{\n`
    if(this instanceof $B.ast.ListComp){
        js += `result_${id}.push(${elt})\n`
    }else if(this instanceof $B.ast.SetComp){
        js += `_b_.set.add(result_${id}, ${elt})\n`
    }else if(this instanceof $B.ast.DictComp){
        js += `_b_.dict.$setitem(result_${id}, ${key}, ${value})\n`
    }

    js += `}catch(err){\n` +
          (has_await ? '$B.restore_stack(save_stack, locals)\n' : '') +
          `$B.leave_frame(locals)\nthrow err\n}` +
          (has_await ? '\n$B.restore_stack(save_stack, locals);' : '')

    for(var i = 0; i < nb_paren; i++){
        js += '}\n'
    }

    js += `\n$B.leave_frame({locals, value: _b_.None})`
    js += `\nreturn result_${id}`
    js += `\n}\n)(${outmost_expr})\n`

    scopes.pop()
    return js
}

function init_scopes(type, scopes, namespaces){
    // Common to Expression and Module
    // Initializes the first scope in scopes
    // namespaces can be passed by exec() or eval()
    var name = scopes.symtable.table.filename
    var top_scope = new Scope(name, `${type}`, this),
        block = scopes.symtable.table.blocks.get(_b_.id(this))
    if(block.$has_import_star){
        top_scope.has_import_star = true
    }
    if(namespaces){
        for(var key in namespaces.exec_globals){
            if(! key.startsWith('$')){
                top_scope.locals.add(key)
            }
        }
        for(var key in namespaces.exec_locals){
            if(! key.startsWith('$')){
                top_scope.locals.add(key)
            }
        }
    }
    scopes.push(top_scope)
    return name
}

$B.ast.Assert.prototype.to_js = function(scopes){
    var test = $B.js_from_ast(this.test, scopes),
        msg = this.msg ? $B.js_from_ast(this.msg, scopes) : ''
    return `if((locals.$lineno = ${this.lineno}) && !$B.$bool(${test})){\n` +
           `throw _b_.AssertionError.$factory(${msg})}\n`
}

$B.ast.AnnAssign.prototype.to_js = function(scopes){
    if(this.value){
        var scope = bind(this.target.id, scopes)
        var js = `var ann = ${$B.js_from_ast(this.value, scopes)}\n` +
            `$B.$setitem(locals.__annotations__, ` +
            `'${this.target.id}', ${$B.js_from_ast(this.annotation, scopes)})\n` +
            `locals_${scope.name}.${this.target.id} = ann`
    }else{
        if(this.annotation instanceof $B.ast.Name){
            var ann = `'${this.annotation.id}'`
        }else{
            var ann = $B.js_from_ast(this.annotation, scopes)
        }
        var js = `$B.$setitem(locals.__annotations__, ` +
            `'${this.target.id}', ${ann})`
    }
    return js
}

$B.ast.Assign.prototype.to_js = function(scopes){
    var js = `locals.$lineno = ${this.lineno}\n`,
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
        var id = $B.UUID()
        js += `var it_${id} = $B.unpacker(${value}, ${nb_targets}, ` +
             `${has_starred}`
        if(nb_after_starred !== undefined){
            js += `, ${nb_after_starred}`
        }
        js += `)\n`
        var assigns = []
        for(var elt of target.elts){
            if(elt instanceof $B.ast.Starred){
                assigns.push(assign_one(elt, `it_${id}.read_rest()`))
            }else if(elt instanceof $B.ast.List){
                assigns.push(assign_many(elt, `it_${id}.read_one()`))
            }else{
                assigns.push(assign_one(elt, `it_${id}.read_one()`))
            }
        }
        js += assigns.join('\n')

        return js
    }

    if(this.targets.length == 1){
        var target = this.targets[0]
        if(! (target instanceof $B.ast.Tuple) &&
               ! (target instanceof $B.ast.List)){
            return js + assign_one(target, value)
        }else{
            return js + assign_many(target, value)
        }
    }
    var id = 'v' + $B.UUID()
    js += `var ${id} = ${value}\n`
    for(var target of this.targets){
        js += assign_one(target, id) + '\n'
    }
    return js
}

$B.ast.AsyncFunctionDef.prototype.to_js = function(scopes){
    return $B.ast.FunctionDef.prototype.to_js.bind(this)(scopes)
}

$B.ast.Attribute.prototype.to_js = function(scopes){
    var attr = mangle(scopes, last_scope(scopes), this.attr)
    return `$B.$getattr(${$B.js_from_ast(this.value, scopes)}, ` +
        `'${attr}')`
}

$B.ast.AugAssign.prototype.to_js = function(scopes){
    var op_class = this.op.constructor
    for(var op in $B.op2ast_class){
        if($B.op2ast_class[op][1] === op_class){
            var iop = op + '='
            break
        }
    }
    var value = $B.js_from_ast(this.value, scopes)
    if(this.target instanceof $B.ast.Name){
        var scope = binding_scope1(this.target.id, scopes)
        if(! scope || op == '@' || op == '//'){
            return `locals.${this.target.id} = $B.augm_assign(` +
                `$B.resolve('${this.target.id}'), '${iop}', ${value})`
        }else{
            var ref = `${make_scope_name(scopes, scope)}.${this.target.id}`
            return ref + ` = typeof ${ref} == "number" && ` +
                `$B.is_safe_int(locals.$result = ${ref} ${op} ${value}) ?\n` +
                `locals.$result : $B.augm_assign(${ref}, '${iop}', ${value})`
        }
    }else if(this.target instanceof $B.ast.Subscript){
        var op = opclass2dunder[this.op.constructor.$name]
        return `$B.$setitem((locals.$tg = ${this.target.value.to_js(scopes)}), ` +
            `(locals.$key = ${this.target.slice.to_js(scopes)}), $B.rich_op('${op}', ` +
            `$B.$getitem(locals.$tg, locals.$key), ${value}))`
    }else if(this.target instanceof $B.ast.Attribute){
        var op = opclass2dunder[this.op.constructor.$name]
        return `$B.$setattr((locals.$tg = ${this.target.value.to_js(scopes)}), ` +
            `'${this.target.attr}', $B.rich_op('${op}', ` +
            `$B.$getattr(locals.$tg, '${this.target.attr}'), ${value}))`
    }
    var js,
        target = $B.js_from_ast(this.target, scopes),
        value = $B.js_from_ast(this.value, scopes)
    var js = `${target} = $B.augm_assign(${target}, '${iop}', ${value})`
    return js
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
    var op = opclass2dunder[this.op.constructor.$name]
    return `$B.rich_op('${op}', ${$B.js_from_ast(this.left, scopes)}, ` +
        `${$B.js_from_ast(this.right, scopes)})`
}

$B.ast.BoolOp.prototype.to_js = function(scopes){
    // The expression x and y first evaluates x; if x is false, its value is
    // returned; otherwise, y is evaluated and the resulting value is
    // returned.
    // The expression x or y first evaluates x; if x is true, its value is
    // returned; otherwise, y is evaluated and the resulting value is
    // returned.

    // Implement this as a JS anonymous self-executing function
    // The test on each item is "! $B.$bool(item)" for And, "$B.$bool(item)"
    // for Or
    var op = this.op instanceof $B.ast.And ? '! ' : '',
        items = [],
        js = '(function(){\n'
    for(var value of this.values){
        js += `var item = ${$B.js_from_ast(value, scopes)}\n` +
              `if(${op}$B.$bool(item)){\nreturn item\n}\n`
    }
    js += `return item\n})()`
    return js
}

$B.ast.Break.prototype.to_js = function(scopes){
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
    var js = '$B.$call(' + $B.js_from_ast(this.func, scopes) + ')'
    var named_args = [],
        starred_args = [],
        named_kwargs = [],
        starred_kwargs = [],
        has_starred = false
    for(var arg of this.args){
        if(arg instanceof $B.ast.Starred){
            has_starred = true
            starred_args.push($B.js_from_ast(arg.value, scopes))
        }else{
            named_args.push($B.js_from_ast(arg, scopes))
        }
    }
    for(var keyword of this.keywords){
        if(keyword.arg){
            named_kwargs.push(
                `${keyword.arg}: ${$B.js_from_ast(keyword.value, scopes)}`)
        }else{
            has_starred = true
            starred_kwargs.push($B.js_from_ast(keyword.value, scopes))
        }
    }

    if(has_starred){
        js += '.apply(null, '
    }else{
        js += '('
    }
    var args = ''
    named_args = named_args.join(', ')
    if(! has_starred){
        args += `${named_args}`
    }else{
        args += `[${named_args}]`
        for(var starred_arg of starred_args){
            args += `.concat(_b_.list.$factory(${starred_arg}))`
        }
    }

    if(named_kwargs.length + starred_kwargs.length == 0){
        return js + `${args})`
    }else if(starred_kwargs.length == 0){
        var sk = "{$nat: 'kw', kw:{" + named_kwargs.join(', ') + '}}'
        if(has_starred){
            args += `.concat([${sk}])`
        }else{
            args += (args.length == 0 ? sk : `, ${sk}`)
        }
    }else{
        args += ".concat([{$nat: 'kw', kw:[{" + named_kwargs.join(', ') + '}'
        for(var starred_kwarg of starred_kwargs){
            args += `, ${starred_kwarg}`
        }
        args += ']}])'
    }
    return js + args + ')'
}

$B.ast.ClassDef.prototype.to_js = function(scopes){
    var enclosing_scope = bind(this.name, scopes)
    var class_scope = new Scope(this.name, 'class', this)

    var js = `locals.$lineno = ${this.lineno}\n`,
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
        js += `var ${dec_id} = ${$B.js_from_ast(dec, scopes)}\n`
    }

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
    var docstring = '_b_.None'
    if(this.body[0] instanceof $B.ast.Expr &&
            this.body[0].value instanceof $B.ast.Constant &&
            typeof this.body[0].value.value == "string"){
        docstring = this.body.splice(0, 1)[0].to_js(scopes)
    }

    js += `var ${ref} = (function(){\n` +
          `var ${locals_name} = {__annotations__: $B.empty_dict()},\n` +
          `locals = ${locals_name}\n` +
          `locals.$name = "${this.name}"\n` +
          `locals.$qualname = "${qualname}"\n` +
          `locals.$is_class = true\n` +
          `var top_frame = ["${ref}", locals, "${glob}", ${globals_name}]\n` +
          `top_frame.__file__ = '${scopes.filename}'\n` +
          `locals.$f_trace = $B.enter_frame(top_frame)\n`

    js += add_body(this.body, scopes)

    scopes.pop()

    js += `\n$B.leave_frame({locals})\nreturn locals\n})()\n`

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
        //js += `locals_${enclosing_scope.name}.${this.name} = ${class_ref}`
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
        var op = opclass2dunder[this.ops[i].constructor.$name],
            right = this.comparators[i]
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

    var js = `var next_func_${id} = $B.next_of(${iter})\n` +
             `while(true){\ntry{\nvar next_${id} = next_func_${id}()\n` +
             `}catch(err){\nif($B.is_exc(err, [_b_.StopIteration])){\n` +
             `break\n}else{\n$B.leave_frame({locals, value: _b_.None})\n ` +
             `throw err\n}\n}\n`
    // assign result of iteration to target
    var name = new $B.ast.Name(`next_${id}`, new $B.ast.Load())
    name.to_js = function(){return `next_${id}`}
    var assign = new $B.ast.Assign([this.target], name)
    assign.lineno = this.lineno
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
            lines = lines.map(line => line.replace(/\\/g, '\\\\'))
            value = lines.join('\\n\\\n')
            value = value.replace(new RegExp('\r', 'g'), '\\r').
                          replace(new RegExp('\t', 'g'), '\\t').
                          replace(new RegExp('\x07', 'g'), '\\x07')


            if(value.indexOf("'") == -1){
                return `$B.String('${value}')`
            }else if(value.indexOf('"') == -1){
                return `$B.String("${value}")`
            }else{
                value = value.replace(new RegExp("'", "g"), "\\'")
                return `$B.String('${value}')`
            }
    }
    console.log('unknown constant', this, value, value === true)
    return '// unknown'
}

$B.ast.Continue.prototype.to_js = function(scopes){
    return 'continue'
}

$B.ast.Delete.prototype.to_js = function(scopes){
    var js = ''
    for(var target of this.targets){
        if(target instanceof $B.ast.Name){
            js += `$B.$delete("${target.id}")\n`
        }else if(target instanceof $B.ast.Subscript){
            js += `$B.$delitem(${$B.js_from_ast(target.value, scopes)}, ` +
                  `${$B.js_from_ast(target.slice, scopes)})\n`
        }else if(target instanceof $B.ast.Attribute){
            js += `_b_.delattr(${$B.js_from_ast(target.value, scopes)}, ` +
                  `'${target.attr}')\n`
        }
    }
    return js
}
$B.ast.Dict.prototype.to_js = function(scopes){
    var items = [],
        packed = []
    for(var i = 0, len = this.keys.length; i < len; i++){
        if(this.keys[i] === _b_.None){
            // format t = {
            packed.push('_b_.list.$factory(_b_.dict.items(' +
                      $B.js_from_ast(this.values[i], scopes) + '))')
        }else{
            items.push(`[${$B.js_from_ast(this.keys[i], scopes)}, ` +
                       `${$B.js_from_ast(this.values[i], scopes)}]`)
        }
    }
    var res = `_b_.dict.$factory([${items}]`
    for(var p of packed){
        res += `.concat(${p})`
    }
    return res + ')'
}

$B.ast.DictComp.prototype.to_js = function(scopes){
    return make_comp.bind(this)(scopes)
}

$B.ast.Expr.prototype.to_js = function(scopes){
    return `locals.$lineno = ${this.lineno};\n`+
        $B.js_from_ast(this.value, scopes)
}

$B.ast.Expression.prototype.to_js = function(scopes, namespaces){
    // create top scope; namespaces can be passed by exec()
    init_scopes.bind(this)('expression', scopes, namespaces)
    return $B.js_from_ast(this.body, scopes)
}

$B.ast.For.prototype.to_js = function(scopes){
    // Create a new scope with the same name to avoid binding in the enclosing
    // scope.
    var id = $B.UUID(),
        iter = $B.js_from_ast(this.iter, scopes)
    var scope = $B.last(scopes),
        new_scope = new Scope(scope.name, scope.type, this)
    new_scope.id = id
    // Create a new scope with the same name to avoid binding in the enclosing
    // scope.
    new_scope.parent = scope
    scopes.push(new_scope)

    var js = `var no_break_${id} = true\n` +
             `var next_func_${id} = $B.next_of(${iter})\n` +
             `while(true){\ntry{\nvar next_${id} = next_func_${id}()\n` +
             `}catch(err){\nif($B.is_exc(err, [_b_.StopIteration])){\n` +
             `break\n}else{\n ` +
             `throw err\n}\n}\n`
    // assign result of iteration to target
    var name = new $B.ast.Name(`next_${id}`, new $B.ast.Load())
    name.to_js = function(){return `next_${id}`}
    var assign = new $B.ast.Assign([this.target], name)
    assign.lineno = this.lineno
    js += assign.to_js(scopes) + '\n'

    js += add_body(this.body, scopes)

    js += '\n}' // close 'while' loop

    if(this.orelse.length > 0){
        js += `\nif(no_break_${id}){\n` +
              add_body(this.orelse, scopes) + '}\n'
    }

    scopes.pop()

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

function is_free(x){
    return (x >> SCOPE_OFF) & SCOPE_MASK == FREE
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
        decs += `var ${dec_id} = ${$B.js_from_ast(dec, scopes)} // decorator\n`
    }

    // Detect doc string
    var docstring = '_b_.None'
    if(this.body[0] instanceof $B.ast.Expr &&
            this.body[0].value instanceof $B.ast.Constant &&
            typeof this.body[0].value.value == "string"){
        docstring = this.body.splice(0, 1)[0].value.to_js(scopes)
    }

    // Evaluate default values in enclosing scope
    var has_posonlyargs = this.args.posonlyargs.length > 0,
        _defaults = [],
        nb_defaults = this.args.defaults.length,
        positional = this.args.posonlyargs.concat(this.args.args),
        ix = positional.length - nb_defaults,
        default_names = []
    for(var i = ix; i < positional.length; i++){
        default_names.push(`defaults.${positional[i].arg}`)
        _defaults.push(`${positional[i].arg}: ` +
            `${$B.js_from_ast(this.args.defaults[i - ix], scopes)}`)
    }
    var ix = 0
    for(var arg of this.args.kwonlyargs){
        if(this.args.kw_defaults[ix] === _b_.None){
            break
        }
        _defaults.push(`${arg.arg}: ` +
            $B.js_from_ast(this.args.kw_defaults[ix], scopes))
        ix++
    }

    var func_scope = new Scope(this.name, 'def', this)
    scopes.push(func_scope)

    var kw_default_names = []
    for(var kw of this.args.kwonlyargs){
        kw_default_names.push(`defaults.${kw.arg}`)
    }

    var default_str = `{${_defaults.join(', ')}}`

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
    var function_body = add_body(this.body, scopes),
        is_generator = func_scope.is_generator

    var id = $B.UUID(),
        name1 = this.name + '$' + id,
        name2 = this.name + id

    var js = decs
    js += `var ${name1} = function(defaults){\n`

    if(is_async){
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
    js += `var $top_frame = ["${this.name}", locals, "${gname}", ${globals_name}, ${name2}]
    $top_frame.__file__ = '${scopes.filename}'
    locals.$f_trace = $B.enter_frame($top_frame)
    locals.$lineno = ${this.lineno}
    var stack_length = $B.frames_stack.length\n`

    if(is_generator){
        js += `locals.$is_generator = true\n`
        if(is_async){
            js += `var gen_${id} = $B.async_generator.$factory(function*(){\n`
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

    if(! ($B.last(this.body) instanceof $B.ast.Return)){
        // add an explicit "return None"
        js += 'var result = _b_.None\n' +
              'if(locals.$f_trace !== _b_.None){\n' +
              '$B.trace_return(_b_.None)\n}\n' +
              '$B.leave_frame(locals);return result\n'
    }

    js += `}catch(err){
    $B.set_exc(err)
    if((! err.$in_trace_func) && locals.$f_trace !== _b_.None){
    ${locals_name}.$f_trace = $B.trace_exception()
    }
    $B.leave_frame(locals);throw err
    }
    }\n`

    if(is_generator){
        js += `, '${this.name}')\n` +
              `var _gen_${id} = gen_${id}()\n` +
              `_gen_${id}.$frame = $top_frame\n` +
              `$B.leave_frame()\n` +
              `return _gen_${id}}\n` // close gen
    }

    scopes.pop()

    var func_name_scope = bind(this.name, scopes)
    var qualname = func_name_scope.type == 'class' ?
        `${func_name_scope.name}.${this.name}` : this.name

    // Flags
    var flags = 67
    if(this.args.vararg){flags |= 4}
    if(this.args.kwarg){flags |= 8}
    if(is_generator){flags |= 32}

    var varnames = symtable_block.varnames.map(x => `"${x}"`)
    var identifiers = Object.keys(symtable_block.symbols.$string_dict)

    var free_vars = []
    for(var ident of identifiers){
        var flag = symtable_block.symbols.$string_dict[ident][0],
            _scope = (flag >> SCOPE_OFF) & SCOPE_MASK
        if(_scope == FREE){
            free_vars.push(`'${ident}'`)
        }
    }
    // Set attribute $is_func to distinguish Brython functions from JS
    // Used in py_dom.js / DOMNode.__getattribute__
    js += `${name2}.$is_func = true\n`
    // Set admin infos
    js += `${name2}.$infos = {\n` +
        `__name__: "${this.name}", __qualname__: "${qualname}",\n` +
        `__defaults__: $B.fast_tuple([${default_names}]), ` +
        `__kwdefaults__: $B.fast_tuple([${kw_default_names}]),\n` +
        `__doc__: ${docstring},\n` +
        `__code__:{\n` +
        `co_argcount: ${positional.length},\n ` +
        `co_filename: ${make_local(scopes[0].name)}.__file__,\n` +
        `co_firstlineno: ${this.lineno},\n` +
        `co_flags: ${flags},\n` +
        `co_freevars: $B.fast_tuple([${free_vars}]),\n` +
        `co_kwonlyargcount: ${this.args.kwonlyargs.length},\n` +
        `co_name: '${this.name}',\n` +
        `co_nlocals: ${varnames.length},\n` +
        `co_posonlyargcount: ${this.args.posonlyargs.length},\n` +
        `co_varnames: [${varnames}]\n` +
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

    var func_ref = `${make_scope_name(scopes, func_name_scope)}.${this.name}`

    if(decorated){
        func_ref = `decorated${$B.UUID()}`
        js += 'var '
    }

    js += `${func_ref} = ${name1}(${default_str})\n` +
          `${func_ref}.$set_defaults = function(value){\n`+
          `return ${func_ref} = ${name1}(value)\n}\n`

    if(decorated){
        js += `${make_scope_name(scopes, func_name_scope)}.${this.name} = `
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

    var js = init_comprehension(comp)

    // special case for first generator
    var first = this.generators[0]
    js += `var next_func_${id} = $B.next_of(expr)\n` +
          `while(true){\ntry{\nvar next_${id} = next_func_${id}()\n` +
          `}catch(err){\nif($B.is_exc(err, [_b_.StopIteration])){\n` +
          `break\n}else{\n$B.leave_frame({locals, value: _b_.None})\n ` +
          `throw err\n}\n}\n`
    // assign result of iteration to target
    var name = new $B.ast.Name(`next_${id}`, new $B.ast.Load())
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
    js = `$B.generator.$factory(${has_await ? 'async ' : ''}function*(expr){\n` + js

    js += has_await ? 'var save_stack = $B.save_stack();\n' : ''
    js += `try{\n` +
          ` yield ${elt}\n` +
          `}catch(err){\n` +
          (has_await ? '$B.restore_stack(save_stack, locals)\n' : '') +
          `$B.leave_frame(locals)\nthrow err\n}\n` +
          (has_await ? '\n$B.restore_stack(save_stack, locals);' : '')

    for(var i = 0; i < nb_paren; i++){
        js += '}\n'
    }

    js += `\n$B.leave_frame({locals, value: _b_.None})` +
          `}, "<genexpr>")(${outmost_expr})\n`

    scopes.pop()
    return js
}

$B.ast.Global.prototype.to_js = function(scopes){
    var scope = $B.last(scopes)
    for(var name of this.names){
        scope.globals.add(name)
    }
    return ''
}

$B.ast.If.prototype.to_js = function(scopes){
    var scope = $B.last(scopes),
        new_scope = new Scope(scope.name, scope.type, this)
    // Create a new scope with the same name to avoid binding in the enclosing
    // scope.
    new_scope.parent = scope
    scopes.push(new_scope)
    var js = `if((locals.$lineno = ${this.lineno}) && ` +
        `$B.$bool(${$B.js_from_ast(this.test, scopes)})){\n`
    js += add_body(this.body, scopes) + '\n}'
    if(this.orelse.length > 0){
        if(this.orelse[0] instanceof $B.ast.If && this.orelse.length == 1){
            js += 'else ' + $B.js_from_ast(this.orelse[0], scopes) +
                  add_body(this.orelse.slice(1), scopes)
        }else{
            js += '\nelse{\n' + add_body(this.orelse, scopes) + '\n}'
        }
    }
    scopes.pop()
    return js
}

$B.ast.IfExp.prototype.to_js = function(scopes){
    return '($B.$bool(' + $B.js_from_ast(this.test, scopes) + ') ? ' +
        $B.js_from_ast(this.body, scopes) + ': ' +
        $B.js_from_ast(this.orelse, scopes) + ')'
}

$B.ast.Import.prototype.to_js = function(scopes){
    var js = `locals.$lineno = ${this.lineno}\n`
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
    if(this.level == 0){
        module = this.module
    }else{
        var scope = last_scope(scopes),
            parts = scope.name.split('.')
        if(this.level > parts.length){
            return `throw _b_.ImportError.$factory(` +
                `"Parent module '' not loaded, cannot perform relative import")`
        }
        for(var i = 0; i < this.level - 1; i++){
            parts.pop()
        }
        var top_module = $B.imported[parts.join('.')]
        if(top_module && ! top_module.$is_package){
            parts.pop()
        }
        var module = parts.join('.')
        if(this.module){
            module += '.' + this.module
        }
    }

    var js = `locals.$lineno = ${this.lineno}\n` +
             `var module = $B.$import("${module}",`
    var names = this.names.map(x => `"${x.name}"`).join(', ')
    js += `[${names}], {}, locals);`

    for(var alias of this.names){
        if(alias.asname){
            bind(alias.asname, scopes)
            js += `\nlocals.${alias.asname} = $B.$getattr(` +
                  `$B.imported["${this.module}"], "${alias.name}")`
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
    var id = $B.UUID(),
        name = 'lambda_' + $B.lambda_magic + '_' + id

    var name1 = name + '$' + id
    var _defaults = [],
        nb_defaults = this.args.defaults.length,
        positional = this.args.posonlyargs.concat(this.args.args),
        ix = positional.length - nb_defaults,
        default_names = []
    for(var i = ix; i < positional.length; i++){
        default_names.push(`defaults.${positional[i].arg}`)
        _defaults.push(`${positional[i].arg}: ` +
            `${$B.js_from_ast(this.args.defaults[i - ix], scopes)}`)
    }
    var kw_default_names = []
    for(var kw of this.args.kwonlyargs){
        kw_default_names.push(`defaults.${kw.arg}`)
    }

    var func_scope = new Scope(name, 'def', this)
    scopes.push(func_scope)

    // process body first to detect possible "yield"s
    var function_body = add_body([this.body], scopes),
        is_generator = func_scope.is_generator

    var locals_name = make_scope_name(scopes, func_scope),
        gname = scopes[0].name,
        globals_name = make_scope_name(scopes, scopes[0])

    var default_str = `{${_defaults.join(', ')}}`

    var args = positional.concat(this.args.kwonlyargs),
        parse_args = [`"<lambda>"`, args.length],
        slots = [],
        arg_names = []
    for(var arg of args){
        slots.push(arg.arg + ': null')
        arg_names.push(`'${arg.arg}'`)
    }

    parse_args.push('{' + slots.join(', ') + '} , ' +
        '[' + arg_names.join(', ') + '], ' +
        'arguments, defaults, ' +
        (this.args.vararg ? `'${this.args.vararg.arg}', ` : 'null, ') +
        (this.args.kwarg ? `'${this.args.kwarg.arg}'` : 'null'))
    if(this.args.vararg){
        args.push(this.args.vararg)
    }
    if(this.args.kwarg){
        args.push(this.args.kwarg)
    }
    for(var arg of args){
        bind(arg.arg, scopes)
    }

    var js = '(function(defaults){\n'

    if(is_generator){
        js += `var ${name} = function*(){\n`
    }else{
        js += `var ${name} = function(){\n`
    }
    js += `var ${locals_name},\nlocals\n` +
          `${locals_name} = locals = $B.args(${parse_args.join(', ')})\n` +
          `var $top_frame = ["${name}", locals, "${gname}", ${globals_name}]
    locals.$f_trace = $B.enter_frame($top_frame)
    locals.$lineno = ${this.lineno}
    var stack_length = $B.frames_stack.length\n`

    if(is_generator){
        js += `locals.$is_generator = true\n`
    }
    js += `try{\n$B.js_this = this\n`

    js += 'var result = ' + function_body + '\n'

    if(! ($B.last(this.body) instanceof $B.ast.Return)){
        // add an explicit "return None"
        js += 'if(locals.$f_trace !== _b_.None){\n' +
              '$B.trace_return(_b_.None)\n}\n' +
              '$B.leave_frame(locals)\nreturn result\n'
    }

    js += `}catch(err){
    $B.set_exc(err)
    if((! err.$in_trace_func) && locals.$f_trace !== _b_.None){
    locals.$f_trace = $B.trace_exception()
    }
    $B.leave_frame(locals);throw err
    }
    }\n`

    scopes.pop()
    var scope = last_scope(scopes)
    var qualname = scope.type == 'class' ? `${scope.name}.${this.name}` :
                                           this.name

    js += `${name}.$infos = {\n` +
              `__defaults__: $B.fast_tuple([${default_names}]), ` +
              `__kwdefaults__: $B.fast_tuple([${kw_default_names}]),\n` +
              `__code__:{\n` +
                  `co_name: '<lambda>'\n` +
              `}\n` +
          `}\n`

    if(is_generator){
        js += `return $B.generator.$factory(${name}, '<lambda>')`
    }else{
        js += `return ${name}`
    }
    js += `})(${default_str})\n`

    return js
}

function list_or_tuple_to_js(func, scopes){
    if(this.elts.filter(x => x instanceof $B.ast.Starred).length > 0){
        var parts = [],
            simple = []
        for(var elt of this.elts){
            if(elt instanceof $B.ast.Starred){
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
    return make_comp.bind(this)(scopes)
}

$B.ast.match_case.prototype.to_js = function(scopes){
    var js = `((locals.$lineno = ${this.lineno}) && ` +
             `$B.pattern_match(subject, {` +
             `${$B.js_from_ast(this.pattern, scopes)}})`
    if(this.guard){
        js += ` && $B.$bool(${$B.js_from_ast(this.guard, scopes)})`
    }
    js += `){\n`

    js += add_body(this.body, scopes) + '\n}'

    return js
}

$B.ast.Match.prototype.to_js = function(scopes){
    var js = `var subject = ${$B.js_from_ast(this.subject, scopes)}\n`
        first = true
    for(var _case of this.cases){
        var case_js = $B.js_from_ast(_case, scopes)
        if(first){
            js += 'if' + case_js
            first = false
        }else{
            js += 'else if' + case_js
        }
    }
    return js
}

$B.ast.MatchAs.prototype.to_js = function(scopes){
    // if the pattern is None, the node represents a capture pattern
    // (i.e a bare name) and will always succeed.
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
    return params
}

$B.ast.MatchClass.prototype.to_js = function(scopes){
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
    var items = []
    for(var i = 0, len = this.keys.length; i < len; i++){
        var key_prefix = this.keys[i] instanceof $B.ast.Constant ?
                            'literal: ' : 'value: '
        items.push(`[{${key_prefix}${$B.js_from_ast(this.keys[i], scopes)}}, ` +
                   `{${$B.js_from_ast(this.patterns[i], scopes)}}]`)
    }
    var js = 'mapping: [' + items.join(', ') + ']'
    if(this.rest){
        js += `, rest: '${this.rest}'`
    }
    return js
}

$B.ast.MatchOr.prototype.to_js = function(scopes){
    var js = this.patterns.map(x => `{${$B.js_from_ast(x, scopes)}}`).join(', ')
    return `or: [${js}]`
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
    }else{
        return `value: ${$B.js_from_ast(this.value, scopes)}`
    }
}

$B.ast.MatchSequence.prototype.to_js = function(scopes){
    var items = []
    for(var pattern of this.patterns){
        items.push('{' + $B.js_from_ast(pattern, scopes) + '}')
    }
    return `sequence: [${items.join(', ')}]`
}

$B.ast.Module.prototype.to_js = function(scopes, namespaces){
    // create top scope; namespaces can be passed by exec()
    var name = init_scopes.bind(this)('module', scopes, namespaces)

    var module_id = name,
        global_name = make_scope_name(scopes)

    var js = `// generated from ast\n` +
             `var $B = __BRYTHON__,\n_b_ = $B.builtins,\n`
    if(! namespaces){
        js += `${global_name} = {},\nlocals = ${global_name},\n` +
              `$top_frame = ["${module_id}", locals, "${module_id}", locals]`
    }else{
        js += `locals = ${namespaces.local_name},\n` +
              `globals = ${namespaces.global_name},\n` +
              `$top_frame = ["${module_id}", locals, "${module_id}_globals", globals]`
    }
    js += `\n$top_frame.__file__ = '${scopes.filename}'\n`
    js += `\nlocals.__file__ = '${scopes.filename || "<string>"}'\n` +
          `locals.__name__ = '${name}'\n`
    if(! namespaces){
        // for exec(), frame is put on top of the stack inside
        // py_builtin_functions.js / eval1()
        js += `locals.$f_trace = $B.enter_frame($top_frame)\n`
    }
    js += `locals.$lineno = ${this.lineno}\n` +
          `var stack_length = $B.frames_stack.length\n` +
          `try{\n` +
              add_body(this.body, scopes) + '\n' +
              `$B.leave_frame(locals)\n` +
          `}catch(err){\n` +
              `$B.set_exc(err)\n` +
              `if((! err.$in_trace_func) && locals.$f_trace !== _b_.None){\n` +
                  `locals.$f_trace = $B.trace_exception()\n` +
              `}\n` +
              `$B.leave_frame(locals);throw err\n` +
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
        return binding_scope(this.id, scopes)
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
    return 'void(0)'
}

$B.ast.Raise.prototype.to_js = function(scopes){
    var js = `locals.$lineno = ${this.lineno}\n` +
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
    var js = `locals.$lineno = ${this.lineno}\n` +
             'var result = ' +
             (this.value ? $B.js_from_ast(this.value, scopes) : ' _b_.None')
    js += `\nif(locals.$f_trace !== _b_.None){\n` +
          `$B.trace_return(_b_.None)\n}\n` +
          `$B.leave_frame(locals)\nreturn result\n`
    return js
}

$B.ast.Set.prototype.to_js = function(scopes){
    var elts = this.elts.map(x => $B.js_from_ast(x, scopes))
    return '_b_.set.$factory([' + elts.join(', ') + '])'
}

$B.ast.SetComp.prototype.to_js = function(scopes){
    return make_comp.bind(this)(scopes)
}

$B.ast.Slice.prototype.to_js = function(scopes){
    var lower = this.lower ? $B.js_from_ast(this.lower, scopes) : '_b_.None',
        upper = this.upper ? $B.js_from_ast(this.upper, scopes) : '_b_.None',
        step = this.step ? $B.js_from_ast(this.step, scopes) : '_b_.None'
    return `_b_.slice.$factory(${lower}, ${upper}, ${step})`
}

$B.ast.Starred.prototype.to_js = function(scopes){
    return `_b_.list.$factory(${$B.js_from_ast(this.value, scopes)})`
}

$B.ast.Subscript.prototype.to_js = function(scopes){
    var func = this.slice instanceof $B.ast.Slice ? 'getitem_slice' :
                                                    '$getitem'
    return `$B.${func}(${$B.js_from_ast(this.value, scopes)}, ` +
        `${$B.js_from_ast(this.slice, scopes)})`
}

$B.ast.Try.prototype.to_js = function(scopes){
    var id = $B.UUID(),
        has_except_handlers = this.handlers.length > 0,
        has_else = this.orelse.length > 0,
        has_finally = this.finalbody.length > 0

    var js = `locals.$lineno = ${this.lineno}\ntry{\n`

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
        var first = true
        for(var handler of this.handlers){
            if(first){
                js += 'if'
                first = false
            }else{
                js += '}else if'
            }
            js += `(locals.$lineno = ${handler.lineno}`
            if(handler.type){
                js += ` && $B.is_exc(${err}, `
                if(handler.type instanceof $B.ast.Tuple){
                    js += `${$B.js_from_ast(handler.type, scopes)}`
                }else{
                    js += `[${$B.js_from_ast(handler.type, scopes)}]`
                }
                js += `)){\n`
            }else{
                js += '){\n'
            }
            if(handler.name){
                bind(handler.name, scopes)
                js += `locals.${handler.name} = ${err}\n`
            }
            js += add_body(handler.body, scopes) + '\n'
            if(! ($B.last(handler.body) instanceof $B.ast.Return)){
                // delete current exception
                js += '$B.del_exc()\n'
            }
        }
        // close last if
        js += '}\n'
    }
    if(has_else || has_finally){
        js += '}\n' // close try
        js += 'finally{\n'
        var finalbody = `$B.frames_stack = save_stack_${id}\n` +
                        add_body(this.finalbody, scopes)
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
    return `$B.$getattr(${operand}, '${method}')()`
}

$B.ast.While.prototype.to_js = function(scopes){
    var id = $B.UUID(),
        scope = $B.last(scopes),
        new_scope = new Scope(scope.name, scope.type)
    // Create a new scope with the same name to avoid binding in the enclosing
    // scope.
    new_scope.parent = scope
    scopes.push(new_scope)

    // Set a variable to detect a "break"
    var js = `var no_break_${id} = true\n`

    js += `while((locals.$lineno = ${this.lineno}) && ` +
        `$B.$bool(${$B.js_from_ast(this.test, scopes)})){\n`
    js += add_body(this.body, scopes) + '\n}'

    if(this.orelse.length > 0){
        js += `\nif(no_break_${id}){\n` +
              add_body(this.orelse, scopes) + '}\n'
    }

    scopes.pop()
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
              `exit_${id} = $B.$getattr(mgr_${id}.__class__, ` +
              `"__exit__"),\n` +
              `value_${id} = $B.$call($B.$getattr(mgr_${id}.__class__, ` +
                  `'__enter__'))(mgr_${id}),\n` +
              `exc_${id} = true\n`
        if(has_generator){
            // add/update attribute used to close context managers in
            // leave_frame()
            s += `locals.$context_managers = locals.$context_managers || []\n` +
                 `locals.$context_managers.push(mgr_${id})\n`
        }
        s += 'try{\ntry{\n'
        if(item.optional_vars){
            var assign = new $B.ast.Assign([item.optional_vars],
                {to_js: function(){return `value_${id}`}})
            s += assign.to_js(scopes) + '\n'
        }
        s += js
        s += `}catch(err_${id}){\n` +
              `locals.$lineno = ${lineno}\n` +
              `exc_${id} = false\n` +
              `err_${id} = $B.exception(err_${id}, true)\n` +
              `var $b = exit_${id}(mgr_${id}, err_${id}.__class__, ` +
              `err_${id}, $B.$getattr(err_${id}, '__traceback__'))\n` +
              `if(! $B.$bool($b)){\nthrow err_${id}\n}\n}\n`
        s += `}\nfinally{\n` +
              `locals.$lineno = ${lineno}\n` +
              `if(exc_${id}){\n` +
              `exit_${id}(mgr_${id}, _b_.None, _b_.None, _b_.None)\n}\n}`
        return s
    }

    var scope = last_scope(scopes),
        lineno = this.lineno
    delete scope.is_generator

    js = add_body(this.body, scopes) + '\n'
    var has_generator = scope.is_generator
    for(var item of this.items.slice().reverse()){
        js = add_item(item, js)
    }
    return `locals.$lineno = ${lineno}\n` + js
}

$B.ast.Yield.prototype.to_js = function(scopes){
    // Mark current scope as generator
    last_scope(scopes).is_generator = true
    var value = this.value ? $B.js_from_ast(this.value, scopes) : '_b_.None'

    //return `yield (function(){\nreturn ${value}}\n)()`
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
    last_scope(scopes).is_generator = true
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
                        $B.leave_frame({locals})
                        var _s${n} = yield _y${n}
                        $B.frames_stack.push($top_frame)
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

$B.js_from_root = function(ast_root, symtable, filename, namespaces){
    var scopes = []
    scopes.symtable = symtable
    scopes.filename = filename
    scopes.imports = {}
    var js = ast_root.to_js(scopes, namespaces)
    return js
}

$B.js_from_ast = function(ast, scopes){
    if(! scopes.symtable){
        throw Error('perdu symtable')
    }
    var js = ''
    scopes = scopes || []
    if(ast.to_js !== undefined){
        return ast.to_js(scopes)
    }
    console.log("unhandled", ast.constructor.$name)
    return '// unhandled class ast.' + ast.constructor.$name
}

})(__BRYTHON__)