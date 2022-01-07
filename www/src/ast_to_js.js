(function($B){
function Scope(name){
    this.name = name
    this.locals = new Set()
    this.globals = new Set()
    this.nonlocals = new Set()
}

function bind(name, scopes){
    var scope = $B.last(scopes)
    if(scope.globals && scope.globals.has(name)){
        scope = scopes[0]
    }
    scope.locals.add(name)
    return scope
}

$B.resolve = function(name){
    for(var frame of $B.frames_stack.slice().reverse()){
        if(frame[1].hasOwnProperty(name)){
            return frame[1][name]
        }
    }
    throw $B.name_error(name)
}

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
    return res
}

$B.ast.Assign.prototype.to_js = function(scopes){
    if(this.targets.length == 1){
        var target = this.targets[0]
        if(! (target instanceof $B.ast.Tuple) &&
               ! (target instanceof $B.ast.List)){
            return $B.js_from_ast(target, scopes) + ' = ' +
                $B.js_from_ast(this.value, scopes)
        }
    }
    var id = 'v' + $B.UUID(),
        js = `var ${id} = ${$B.js_from_ast(this.value)}\n`
    for(var target of this.targets){
        js += $B.js_from_ast(target, scopes) + ` = ${id}\n`
    }
    return js
}

$B.ast.BinOp.prototype.to_js = function(scopes){
    var op = '__' + this.op.constructor.$name.toLowerCase() + '__'
    return `$B.rich_op('${op}', ${$B.js_from_ast(this.left, scopes)}, ` +
        `${$B.js_from_ast(this.right, scopes)})`
}

$B.ast.Call.prototype.to_js = function(scopes){
    var js = '$B.$call(' + $B.js_from_ast(this.func, scopes) + ')'
    var args = []
    for(var arg of this.args){
        args.push($B.js_from_ast(arg, scopes))
    }
    js += '(' + args.join(', ') + ')'
    return js
}

$B.ast.Constant.prototype.to_js = function(scopes){
    var js = $B.AST.$convert(this.value) // in builtin_modules.js
    if(typeof js == "string"){
        js = js.replace("'", "\\'")
        var lines = js.split('\n')
        return "'" + lines.join('\\\n') + "'\n"
    }
    return js
}

$B.ast.Expr.prototype.to_js = function(scopes){
    return $B.js_from_ast(this.value, scopes)
}

$B.ast.FunctionDef.prototype.to_js = function(scopes){
    var func_scope = new Scope(this.name)
    scopes.push(func_scope)

    // process body here to detect possible "yield"s
    var function_body = add_body(this.body, scopes),
        is_generator = func_scope.is_generator

    console.log('generator ?', is_generator)

    var _defaults = [],
        nb_defaults = this.args.defaults.length,
        positional = this.args.posonlyargs.concat(this.args.args),
        ix = positional.length - nb_defaults
    for(var i = ix; i < positional.length; i++){
        _defaults.push(`${positional[i].arg}: ` +
            `${$B.js_from_ast(this.args.defaults[i - ix])}`)
    }
    var default_str = `{${_defaults.join(', ')}}`
    var id = $B.UUID(),
        name1 = this.name + '$' + id,
        name2 = this.name + id
    var js = `var ${name1} = function($defaults){\n`
    if(is_generator){
        js += `function* ${name2}(){\n`
    }else{
        js += `function ${name2}(){\n`
    }
    var local_name = `locals_${this.name}`
    var gname = scopes[0].name
    js += `var ${local_name},
               locals\n`
    var args = this.args.posonlyargs.concat(this.args.args).
                         concat(this.args.kwonlyargs),
        parse_args = [`"${this.name}"`, args.length],
        slots = [],
        arg_names = []
    for(var arg of args){
        slots.push(arg.arg + ': null')
        arg_names.push(`'${arg.arg}'`)
    }
    parse_args.push('{' + slots.join(', ') + '} , ' +
        '[' + arg_names.join(', ') + '], ' +
        'arguments, $defaults, ' +
        (this.args.vararg ? `'${this.args.vararg.arg}', ` : 'null, ') +
        (this.args.kwarg ? `'${this.args.kwarg.arg}'` : 'null'))
    js += `${local_name} = locals = $B.args(${parse_args.join(', ')})\n`
    js += `var $top_frame = ["${name}", locals, "${gname}", globals]
    locals.$f_trace = $B.enter_frame($top_frame)\n`
    if(is_generator){
        js += `locals.$is_generator = true\n`
    }
    js += `try{\n$B.js_this = this\n`

    js += function_body

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
    ${local_name}.$f_trace = $B.trace_exception()
    }
    $B.leave_frame(locals);throw err
    }
    }
    return ${name2}
    }\n`
    scopes.pop()
    bind(this.name, scopes)
    var func_ref = `locals_${$B.last(scopes).name}.${this.name}`
    js += `${func_ref} = ${name1}(${default_str})\n` +
          `${func_ref}.$set_defaults = function(value){\n`+
          `return ${func_ref} = ${name1}(value)\n}\n`

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
        new_scope = new Scope(scope.name)
    // Create a new scope with the same name to avoid binding in the enclosing
    // scope.
    new_scope.parent = scope
    scopes.push(new_scope)
    var js = 'if($B.$bool(' + $B.js_from_ast(this.test, scopes) + ')){\n'
    js += add_body(this.body, scopes) + '}'
    scopes.pop()
    return js
}

$B.ast.Module.prototype.to_js = function(module_id){
    var scopes = [new Scope(module_id)],
        global_name = `locals_${module_id}`
    var js = `var $B = __BRYTHON__,
                  _b_ = $B.builtins,
                  ${global_name} = {},
                  globals = ${global_name},
                  $top_frame = ["${module_id}", globals, ` +
              `"${module_id}", globals]
    globals.$f_trace = $B.enter_frame($top_frame)
    try{\n`

    js += add_body(this.body, scopes)

    js += `$B.leave_frame(globals)
    }catch(err){
    $B.set_exc(err)
    if((! err.$in_trace_func) && globals.$f_trace !== _b_.None){
    globals.$f_trace = $B.trace_exception()
    }
    $B.leave_frame(globals);throw err
    }`

    scopes.pop()
    return js
}

$B.ast.Name.prototype.to_js = function(scopes){
    if(this.ctx instanceof $B.ast.Store){
        // In which namespace should it be stored ?
        var scope = bind(this.id, scopes)
        return `locals_${scope.name}.${this.id}`
    }else if(this.ctx instanceof $B.ast.Load){
        var scope = $B.last(scopes)
        if(scope.globals.has(this.id)){
            return `locals_${scopes[0].name}.${this.id}`
        }else{
            for(var i = scopes.length - 1; i >= 0; i--){
                if(scopes[i].locals.has(this.id)){
                    return `locals_${scopes[i].name}.${this.id}`
                }
            }
            if(builtins_scope.locals.has(this.id)){
                return `_b_.${this.id}`
            }
            return `$B.resolve("${this.id}")`
        }
    }
}

$B.ast.Return.prototype.to_js = function(scopes){
    console.log('return', this)
    var js = 'var result = ' + (this.value ? $B.js_from_ast(this.value, scopes) :
                                            ' _b_.None')
    js += `\nif(locals.$f_trace !== _b_.None){
    $B.trace_return(_b_.None)
    }
    $B.leave_frame(locals);return result
    `
    return js
}

$B.ast.Yield.prototype.to_js = function(scopes){
    var ix = scopes.length - 1
    while(scopes[ix].parent){
        ix--
    }
    scopes[ix].is_generator = true
    var value = this.value ? $B.js_from_ast(this.value, scopes) : '_b_.None'
    var js = `var result = ${value};
        try{
          $B.leave_frame({locals})
          yield result;
        }catch(err2){
          $B.frames_stack.push($top_frame)
          throw err2
        }
        $B.frames_stack.push($top_frame)\n`

    return js
}

$B.js_from_root = function(ast_root, module_id){
    return $B.js_from_ast(ast_root, module_id)
}

$B.js_from_ast = function(ast, scopes){
    var js = ''
    scopes = scopes || []
    if(ast.to_js !== undefined){
        return ast.to_js(scopes)
    }
    console.log($B.ast_dump(ast))
    return '// unhandled class ast.' + ast.constructor.$name
}

})(__BRYTHON__)