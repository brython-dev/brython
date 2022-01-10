(function($B){

var _b_ = $B.builtins

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


var $operators = $B.op2method.subset("all") // in py2js.js

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
    return res
}

$B.ast.Assert.prototype.to_js = function(scopes){
    var test = $B.js_from_ast(this.test, scopes),
        msg = this.msg ? $B.js_from_ast(this.msg, scopes) : ''
    return `if(!$B.$bool(${test})){\n` +
           `throw _b_.AssertionError.$factory(${msg})}\n`
}

$B.ast.Assign.prototype.to_js = function(scopes){
    var js = `locals.$lineno = ${this.lineno}\n`
    if(this.targets.length == 1){
        var target = this.targets[0]
        if(! (target instanceof $B.ast.Tuple) &&
               ! (target instanceof $B.ast.List)){
            return js + $B.js_from_ast(target, scopes) + ' = ' +
                $B.js_from_ast(this.value, scopes)
        }
    }
    var id = 'v' + $B.UUID()
    js += `var ${id} = ${$B.js_from_ast(this.value)}\n`
    for(var target of this.targets){
        js += $B.js_from_ast(target, scopes) + ` = ${id}\n`
    }
    return js
}

$B.ast.BinOp.prototype.to_js = function(scopes){
    var op = opclass2dunder[this.op.constructor.$name]
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

$B.ast.Compare.prototype.to_js = function(scopes){
    var left = $B.js_from_ast(this.left, scopes),
        comps = []
    for(var i = 0, len = this.ops.length; i < len; i++){
        var op = opclass2dunder[this.ops[i].constructor.$name],
            right = this.comparators[i]
        comps.push(`$B.rich_comp('${op}', ${left}, ` +
            `locals.$op = ${$B.js_from_ast(right, scopes)})`)
        left = 'locals.$op'
    }
    return comps.join(' && ')
}

$B.ast.Constant.prototype.to_js = function(scopes){
    if(this.value === true || this.value === false){
        return this.value + ''
    }else if(this.value === _b_.None){
        return '_b_.None'
    }
    var type = this.value.type,
        value = this.value.value

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
        case 'ellipisis':
            return `_b_.Ellipsis`
        case 'str':
            js = js.replace("'", "\\'")
            var lines = js.split('\n')
            return "'" + lines.join('\\\n') + "'"
    }
    console.log('unknown constant', this, value, value === true)
    return '// unknown'
}

$B.ast.Expr.prototype.to_js = function(scopes){
    return $B.js_from_ast(this.value, scopes)
}

$B.ast.FunctionDef.prototype.to_js = function(scopes){
    var func_scope = new Scope(this.name)
    scopes.push(func_scope)

    // process body first to detect possible "yield"s
    var function_body = add_body(this.body, scopes),
        is_generator = func_scope.is_generator

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
    js += `var $top_frame = ["${name}", locals, "${gname}", locals_${gname}]
    locals.$f_trace = $B.enter_frame($top_frame)
    var stack_length = $B.frames_stack.length\n`
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
    var js = `if(locals.$line_info = ${this.lineno} && ` +
        `$B.$bool(${$B.js_from_ast(this.test, scopes)})){\n`
    js += add_body(this.body, scopes) + '}'
    for(var orelse of this.orelse){
        if(orelse instanceof $B.ast.If){
            js += 'else ' + $B.js_from_ast(orelse, scopes)
        }else{
            js += 'else{\n' + $B.js_from_ast(orelse, scopes) + '}'
        }
    }
    scopes.pop()
    return js
}


$B.ast.Import.prototype.to_js = function(scopes){
    var js = ''
    for(var alias of this.names){
        js += `$B.$import("${alias.name}", [], `
        if(alias.asname){
            js += `{${alias.name} : "${alias.asname}"}, `
        }else{
            js += '{}, '
        }
        js += `locals, true)\n`
    }
    return js.trimRight()
}

$B.ast.ImportFrom.prototype.to_js = function(scopes){
    var js = `var module = $B.$import("${this.module}",`
    var names = this.names.map(x => `"${x.name}"`).join(', ')
    js += `[${names}], {}, {}, true);`
    for(var alias of this.names){
        if(alias.asname){
            js += `\nlocals.${alias.asname} = $B.$getattr(` +
                `$.imported["${this.module}"], "${alias.name}")`
        }
    }
    return js
}

$B.ast.Module.prototype.to_js = function(module_id){
    var scopes = [new Scope(module_id)],
        global_name = `locals_${module_id}`
    var js = `var $B = __BRYTHON__,
                  _b_ = $B.builtins,
                  ${global_name} = {},
                  locals = ${global_name},
                  $top_frame = ["${module_id}", locals, ` +
              `"${module_id}", locals]
    locals.$f_trace = $B.enter_frame($top_frame)
    var stack_length = $B.frames_stack.length;
    try{\n`

    js += add_body(this.body, scopes)

    js += `$B.leave_frame(locals)
    }catch(err){
    $B.set_exc(err)
    if((! err.$in_trace_func) && locals.$f_trace !== _b_.None){
    locals.$f_trace = $B.trace_exception()
    }
    $B.leave_frame(locals);throw err
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
    var js = 'var result = ' +
             (this.value ? $B.js_from_ast(this.value, scopes) : ' _b_.None')
    js += `\nif(locals.$f_trace !== _b_.None){\n` +
          `$B.trace_return(_b_.None)\n}\n` +
          `$B.leave_frame(locals)\nreturn result\n`
    return js
}

$B.ast.Try.prototype.to_js = function(scopes){
    var js = `locals.$lineno = ${this.lineno}\ntry{\n`
    js += add_body(this.body, scopes)
    var id = $B.UUID(),
        err = 'err' + id
    js += `}catch(${err}){\n` +
          `$B.set_exc(${err})\n` +
          `if(locals.$f_trace !== _b_.None){\n` +
          `locals.$f_trace = $B.trace_exception()}\n` +
          `locals.$failed${id} = true\nif(false){\n`
    if(this.handlers.length > 0){
        for(var handler of this.handlers){
            js += `}else if(locals.$lineno = ${handler.lineno}`
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
            js += add_body(handler.body, scopes)
        }
    }
    js += '}\n'
    if(this.orelse.length > 0 || this.finalbody.length > 0){
        js += '}finally{\n' +
              'var exit\n' +
              'if($B.frames_stack.length < stack_length){\n' +
              '// return in try/catch\n' +
              'exit = true\n'+
              '$B.frames_stack.push($top_frame)}\n'
        if(this.orelse.length > 0){
            js += `if(! locals.failed${id}){\n`
            js += add_body(this.orelse, scopes) + '}\n'
        }
        js += add_body(this.finalbody)
        js += 'if(exit){\n$B.leave_frame({locals})\n}\n'
    }
    js += '}\n'
    return js
}

$B.ast.Tuple.prototype.to_js = function(scopes){
    var elts = this.elts.map(x => $B.js_from_ast(x, scopes))
    return '$B.fast_tuple([' + elts.join(', ') + '])'
}

$B.ast.UnaryOp.prototype.to_js = function(scopes){
    var operand = $B.js_from_ast(this.operand, scopes)
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

$B.ast.Yield.prototype.to_js = function(scopes){
    var ix = scopes.length - 1
    while(scopes[ix].parent){
        ix--
    }
    scopes[ix].is_generator = true
    var value = this.value ? $B.js_from_ast(this.value, scopes) : '_b_.None'
    var js = `var result = ${value}\n` +
             `try{\n` +
             `$B.leave_frame({locals})\n` +
             `yield result\n` +
             `}catch(err){\n` +
             `$B.frames_stack.push($top_frame)\n` +
             `throw err\n}\n` +
             `$B.frames_stack.push($top_frame)\n`

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