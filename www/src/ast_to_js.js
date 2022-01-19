(function($B){

var _b_ = $B.builtins


$B.set_func_infos = function(func, name, qualname, docstring){
    func.$is_func = true
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

function bind(name, scopes){
    var scope = $B.last(scopes)
    if(scope.globals && scope.globals.has(name)){
        scope = scopes[0]
    }
    scope.locals.add(name)
    return scope
}

function binding_scope(name, scopes){
    // return the scope where name is bound, or undefined
    var scope = $B.last(scopes)
    if(scope.ast){
        var block = scopes.symtable.table.blocks.get(scope.ast),
            symbol = block.symbols.$string_dict[name][0]
        if(symbol & 2){
            // name is local
            return scope
        }
    }
    if(scope.globals.has(name)){
        return scopes[0]
    }else{
        for(var i = scopes.length - 1; i >= 0; i--){
            if(scopes[i].locals.has(name)){
                return scopes[i]
            }
        }
        if(builtins_scope.locals.has(name)){
            return builtins_scope
        }
    }
}

$B.resolve = function(name){
    for(var frame of $B.frames_stack.slice().reverse()){
        if(frame[1].hasOwnProperty(name)){
            return frame[1][name]
        }
    }
    throw $B.name_error(name)
}

$B.resolve_local = function(name){
    // Translation of a reference to "name" when symtable reports that "name"
    // is local, but it has not been bound in scope locals
    var frame = $B.last($B.frames_stack)
    if(frame[1].hasOwnProperty(name)){
        return frame[1][name]
    }
    throw _b_.UnboundLocalError.$factory(`local variable '${name}' ` +
        'referenced before assignment')
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
    return res
}

// functions shared by comprehensions
var Comprehension = {
    admin_infos: function(comp){
        var id = comp.type + '_' + comp.id,
            gscope = comp.scopes[0],
            module = gscope.name,
            module_ref = module.replace(/\./g, '_')
        return `var locals_${id} = {},
            locals = locals_${id}
        locals.$line_info = ${comp.ast.lineno}\n` +
        Comprehension.code(comp) +
        `var top_frame = ["${id}", locals_${id}, "${module}", locals_${module_ref}]
        locals.$f_trace = $B.enter_frame(top_frame)
        `
    },
    code: function(comp){
        var varnames = Object.keys(comp.varnames || {}).map(x => `'${x}'`).join(', ')
        return `locals.$comp_code = {
            co_argcount: 1,
            co_firstlineno:${comp.ast.lineno},
            co_name: "<${comp.type}>",
            co_flags: ${comp.type == 'genexpr' ? 115 : 83},
            co_freevars: $B.fast_tuple([]),
            co_kwonlyargcount: 0,
            co_posonlyargount: 0,
            co_varnames: $B.fast_tuple(['.0', ${varnames}])
        }
        locals['.0'] = expr\n`
    },
    generators: function(comp){
        // Return a list of comprehensions
        // ast.comprehension(target, iter, ifs, is_async)
        var comprehensions = []
        for(item of comp){
            if(item.type == 'for'){
                comprehensions.push(
                    new ast.comprehension(
                        ast_or_obj(item.tree[0]),
                        ast_or_obj(item.tree[1]),
                        [],
                        item.is_async ? 1 : 0
                    )
                )
            }else{
                $B.last(comprehensions).ifs.push(ast_or_obj(item.tree[0]))
            }
        }
        return comprehensions
    },
    make_comp: function(comp, context){
        comp.comprehension = true
        comp.parent = context.parent
        comp.binding = {}
        comp.id = comp.type + $B.UUID()
        var scope = $get_scope(context)
        comp.parent_block = scope
        while(scope){
            if(scope.context && scope.context.tree &&
                    scope.context.tree.length > 0 &&
                    scope.context.tree[0].async){
                comp.async = true
                break
            }
            scope = scope.parent_block
        }
        comp.module = $get_module(context).module
        comp.module_ref = comp.module.replace(/\./g, '_')
        context.parent.tree[context.parent.tree.length - 1] = comp
        Comprehension.set_parent_block(context.tree[0], comp)
    },
    set_parent_block: function(ctx, parent_block){
        if(ctx.tree){
            for(var item of ctx.tree){
                if(item.comprehension){
                    item.parent_block = parent_block
                }
                Comprehension.set_parent_block(item, parent_block)
            }
        }
    },
    get_awaits: function(ctx, awaits){
        // Return the list of Await below context "ctx"
        awaits = awaits || []
        if(ctx.type == 'await'){
            awaits.push(ctx)
        }else if(ctx.tree){
            for(var item of ctx.tree){
                Comprehension.get_awaits(item, awaits)
            }
        }
        return awaits
    },
    has_await: function(ctx){
        //
        var node = $get_node(ctx),
            awaits = Comprehension.get_awaits(ctx)
        for(var aw of awaits){
            var ix = node.awaits.indexOf(aw)
            if(ix > -1){
                node.awaits.splice(ix, 1)
            }
        }
        return awaits.length > 0
    }
}

$B.ast.Assert.prototype.to_js = function(scopes){
    var test = $B.js_from_ast(this.test, scopes),
        msg = this.msg ? $B.js_from_ast(this.msg, scopes) : ''
    return `if(!$B.$bool(${test})){\n` +
           `throw _b_.AssertionError.$factory(${msg})}\n`
}

$B.ast.AnnAssign.prototype.to_js = function(scopes){
    console.log($B.ast_dump(this))
    if(this.value){
        var scope = bind(this.target.id, scopes)
        var js = `var ann = ${$B.js_from_ast(this.value, scopes)}\n` +
            `$B.$setitem(locals.__annotations__, ` +
            `'${this.target.id}', ${$B.js_from_ast(this.annotation, scopes)})\n` +
            `locals_${scope.name}.${this.target.id} = ann`
    }else{
        var js = `$B.$setitem(locals.__annotations__, ` +
            `'${this.target.id}', ${$B.js_from_ast(this.annotation, scopes)})`
    }
    return js
}

$B.ast.Assign.prototype.to_js = function(scopes){
    var js = `locals.$lineno = ${this.lineno}\n`,
        value = $B.js_from_ast(this.value, scopes)

    function assign_one(target, value){
        if(target instanceof $B.ast.Name){
            return $B.js_from_ast(target, scopes) + ' = ' +
                value
        }else if(target instanceof $B.ast.Starred){
            return assign_one(target.value, value)
        }else if(target instanceof $B.ast.Subscript){
            return `$B.$setitem(${$B.js_from_ast(target.value, scopes)}` +
                `, ${$B.js_from_ast(target.slice, scopes)}, ${value})`
        }else if(target instanceof $B.ast.Attribute){
            return `$B.$setattr(${$B.js_from_ast(target.value, scopes)}` +
                `, "${target.attr}", ${value})`
        }
    }

    if(this.targets.length == 1){
        var target = this.targets[0]
        if(! (target instanceof $B.ast.Tuple) &&
               ! (target instanceof $B.ast.List)){
           return js + assign_one(target, value)
        }else{
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
            js = `var it = $B.unpacker(${value}, ${nb_targets}, ` +
                 `${has_starred}`
            if(nb_after_starred !== undefined){
                js += `, ${nb_after_starred}`
            }
            js += `)\n`
            var assigns = []
            for(var elt of target.elts){
                if(elt instanceof $B.ast.Starred){
                    assigns.push(assign_one(elt, 'it.read_rest()'))
                }else{
                    assigns.push(assign_one(elt, 'it.read_one()'))
                }
            }
            js += assigns.join('\n')

            return js
        }
    }
    var id = 'v' + $B.UUID()
    js += `var ${id} = ${value}\n`
    for(var target of this.targets){
        js += assign_one(target, id) + '\n'
    }
    return js
}

$B.ast.Attribute.prototype.to_js = function(scopes){
    return `$B.$getattr(${$B.js_from_ast(this.value, scopes)}, ` +
        `'${this.attr}')`
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
        var scope = binding_scope(this.target.id, scopes)
        if(! scope){
            return `locals.${this.target.id} = $B.augm_assign(` +
                `$B.resolve('${this.target.id}'), '${iop}', ${value})`
        }else{
            var ref = `locals_${scope.name}.${this.target.id}`
            return ref + ` = typeof ${ref} == "number" && ` +
                `$B.is_safe_int(locals.$result = ${ref} ${op} ${value}) ?\n` +
                `locals.$result : $B.augm_assign(${ref}, '${iop}', ${value})`
        }
    }else if(this.target instanceof $B.ast.Subscript){
        return `$B.$setitem(($locals.$tg = ${target.value.to_js()}), ` +
            `($locals.$key = ${target.tree[0].to_js()}), $B.augm_assign($B.$getitem(` +
            `$locals.$tg, $locals.$key), '${this.op}', ${this.tree[1].to_js()}))`
    }else if(this.target instanceof $B.ast.Attribute){
        return `$B.$setattr(($locals.$tg = ${target.value.to_js()}), ` +
            `'${target.name}', $B.augm_assign($B.$getattr(` +
            `$locals.$tg, '${target.name}'), '${this.op}', ${this.tree[1].to_js()}))`
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

$B.ast.Call.prototype.to_js = function(scopes){
    var js = '$B.$call(' + $B.js_from_ast(this.func, scopes) + ')'
    var args = []
    for(var arg of this.args){
        args.push($B.js_from_ast(arg, scopes))
    }
    js += '(' + args.join(', ') + ')'
    return js
}

$B.ast.ClassDef.prototype.to_js = function(scopes){
    var class_scope = new Scope(this.name, 'class')
    scopes.push(class_scope)

    var js = '',
        name = this.name,
        ref = name + $B.UUID(),
        glob = scopes[0].name,
        decorators = [],
        decorated = false
    for(var dec of this.decorator_list){
        decorated = true
        var dec_id = 'decorator' + $B.UUID()
        decorators.push(dec_id)
        console.log($B.js_from_ast(dec, scopes))
        js += `var ${dec_id} = ${$B.js_from_ast(dec, scopes)}\n`
    }

    js += `var ${ref} = (function(){\n` +
          `var locals_${this.name} = {__annotations__: $B.empty_dict()},\n` +
          `locals = locals_${this.name}\n` +
          `locals.$name = "${this.name}"\n` +
          `locals.$is_class = true\n` +
          `var top_frame = ["${ref}", locals, "${glob}", locals_${glob}]\n` +
          `locals.$f_trace = $B.enter_frame(top_frame)\n`

    js += add_body(this.body, scopes)

    scopes.pop()
    var scope = bind(this.name, scopes)

    js += `$B.leave_frame({locals})\nreturn locals\n})()\n`

    var class_ref = `locals_${scope.name}.${this.name}`

    if(decorated){
        class_ref = `decorated${$B.UUID()}`
        js += 'var '
    }
    var bases = this.bases.map(x => $B.js_from_ast(x, scopes))

    js += `${class_ref} = $B.$class_constructor("${this.name}", ${ref}, ` +
          `[${bases}],[],[])\n`

    if(decorated){
        var decorate = class_ref
        for(var dec of this.decorator_list.reverse()){
            decorate = `$B.$call(${dec})(${decorate})`
        }
        js += decorate + '\n'
    }

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
        case 'ellipisis':
            return `_b_.Ellipsis`
        case 'str':
            var lines = value.split('\n')
            lines = lines.map(line => line.replace(/\\/g, '\\\\'))
            value = lines.join('\\n\\\n')
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
    return $B.js_from_ast(this.value, scopes)
}

$B.ast.For.prototype.to_js = function(scopes){
    var id = $B.UUID(),
        iter = $B.js_from_ast(this.iter, scopes)

    var js = `var no_break_${id} = true\n` +
             `var next_func_${id} = $B.next_of(${iter})\n` +
             `while(true){\ntry{\nvar next_${id} = next_func_${id}()\n` +
             `}catch(err){\nif($B.is_exc(err, [_b_.StopIteration])){\n` +
             `break\n}else{\n$B.leave_frame({locals, value: _b_.None})\n ` +
             `throw err\n}\n}\n`
    // assign result of iteration to target
    var name = new $B.ast.Name(`next_${id}`, new $B.ast.Load())
    name.to_js = function(){return `next_${id}`}
    var assign = new $B.ast.Assign([this.target], name)
    assign.lineno = this.lineno
    js += assign.to_js(scopes) + '\n'

    js += add_body(this.body, scopes)

    js += '\n}' // close 'while' loop
    return js
}

$B.ast.FunctionDef.prototype.to_js = function(scopes){
    var func_scope = new Scope(this.name, 'def', this)
    scopes.push(func_scope)

    // Detect doc string
    var docstring = '_b_.None'
    if(this.body[0] instanceof $B.ast.Expr &&
            this.body[0].value instanceof $B.ast.Constant &&
            typeof this.body[0].value.value == "string"){
        docstring = this.body.splice(0, 1)[0].to_js()
    }

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

    var default_str = `{${_defaults.join(', ')}}`

    var args = positional.concat(this.args.kwonlyargs),
        parse_args = [`"${this.name}"`, args.length],
        slots = [],
        arg_names = []
    for(var arg of args){
        slots.push(arg.arg + ': null')
        arg_names.push(`'${arg.arg}'`)
        // bind argument in function scope
        bind(arg.arg, scopes)
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

    var js = '',
        decorators = [],
        decorated = false
    for(var dec of this.decorator_list){
        decorated = true
        var dec_id = 'decorator' + $B.UUID()
        decorators.push(dec_id)
        console.log($B.js_from_ast(dec, scopes))
        js += `var ${dec_id} = ${$B.js_from_ast(dec, scopes)} // decorator\n`
    }

    js += `var ${name1} = function(defaults){\n`

    if(is_generator){
        js += `function* ${name2}(){\n`
    }else{
        js += `function ${name2}(){\n`
    }
    var local_name = `locals_${this.name}`
    var gname = scopes[0].name
    js += `var ${local_name},
               locals\n`

    parse_args.push('{' + slots.join(', ') + '} , ' +
        '[' + arg_names.join(', ') + '], ' +
        'arguments, defaults, ' +
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
    }\n`

    scopes.pop()
    var scope = bind(this.name, scopes)
    var qualname = scope.type == 'class' ? `${scope.name}.${this.name}` :
                                           this.name

    js += `${name2}.$infos = {\n` +
        `__name__: "${this.name}", __qualname__: "${qualname}",\n` +
        `__defaults__: $B.fast_tuple([${default_names}]), ` +
        `__kwdefaults__: $B.fast_tuple([${kw_default_names}]),\n` +
        `__doc__: ${docstring}\n` +
        `}\n`

    js += `return ${name2}
    }\n`

    var func_ref = `locals_${scope.name}.${this.name}`

    if(decorated){
        func_ref = `decorated${$B.UUID()}`
        js += 'var '
    }

    if(is_generator){
        js += `${func_ref} = $B.generator.$factory` +
            `(${name1}(${default_str}), "${this.name}")\n`
    }else{
        js += `${func_ref} = ${name1}(${default_str})\n`
    }
    js += `${func_ref}.$set_defaults = function(value){\n`+
          `return ${func_ref} = ${name1}(value)\n}\n`

    if(decorated){
        js += `locals_${$B.last(scopes).name}.${this.name} = `
        var decorate = func_ref
        for(var dec of decorators.reverse()){
            decorate = `$B.$call(${dec})(${decorate})`
        }
        js += decorate
    }

    return js
}

function first_generator(comp, scopes){
    var first = comp.ast.generators[0],
        id = comp.id
    var js = `var next_func_${id} = $B.next_of(expr)\n` +
          `while(true){\ntry{\nvar next_${id} = next_func_${id}()\n` +
          `}catch(err){\nif($B.is_exc(err, [_b_.StopIteration])){\n` +
          `break\n}else{\n$B.leave_frame({locals, value: _b_.None})\n ` +
          `throw err\n}\n}\n`
    // assign result of iteration to target
    var name = new $B.ast.Name(`next_${id}`, new $B.ast.Load())
    name.to_js = function(){return `next_${id}`}
    var assign = new $B.ast.Assign([first.target], name)
    assign.lineno = comp.ast.lineno
    js += assign.to_js(scopes) + '\n'

    for(var _if of first.ifs){
        nb_paren++
        js += `if($B.$bool(${$B.js_from_ast(_if, scopes)})){\n`
    }

    return js
}


$B.ast.GeneratorExp.prototype.to_js = function(scopes){
    var id = $B.UUID()

    var comp_scope = new Scope(`genexpr_${id}`, 'comprehension')
    scopes.push(comp_scope)

    var expr = this.elt,
        first_for = this.generators[0],
        outmost_expr = $B.js_from_ast(first_for.iter, scopes),
        nb_paren = 1,
        comp = {ast:this, id, scopes, type: 'genexpr'}

    var js = Comprehension.admin_infos(comp)

    // special case for first generator
    js += first_generator(comp, scopes)
    /*
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
    */

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
        new_scope = new Scope(scope.name, scope.type)
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

$B.ast.Lambda.prototype.to_js = function(scopes){
    var id = $B.UUID(),
        name = 'lambda_' + $B.lambda_magic + '_' + id
    var func_scope = new Scope(name, 'def', this)
    scopes.push(func_scope)

    var gname = scopes[0].name

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
    js += `var locals_${name},\nlocals\n` +
          `locals_${name} = locals = $B.args(${parse_args.join(', ')})\n` +
          `var $top_frame = ["${name}", locals, "${gname}", locals_${gname}]
    locals.$f_trace = $B.enter_frame($top_frame)
    var stack_length = $B.frames_stack.length\n`

    // process body first to detect possible "yield"s
    var function_body = add_body([this.body], scopes),
        is_generator = func_scope.is_generator


    if(is_generator){
        js += `locals.$is_generator = true\n`
    }
    js += `try{\n$B.js_this = this\n`

    js += 'var result = ' + function_body

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
    var scope = bind(this.name, scopes)
    var qualname = scope.type == 'class' ? `${scope.name}.${this.name}` :
                                           this.name

    js += `${name}.$infos = {\n` +
        `__defaults__: $B.fast_tuple([${default_names}]), ` +
        `__kwdefaults__: $B.fast_tuple([${kw_default_names}]),\n` +
        `}\n`

    js += `return ${name}
    })(${default_str})\n`

    return js
}

$B.ast.List.prototype.to_js = function(scopes){
    var elts = this.elts.map(x => $B.js_from_ast(x, scopes))
    return '$B.$list([' + elts.join(', ') + '])'
}

function make_comp(scopes){
    var id = $B.UUID(),
        type = this.constructor.$name


    var comp_scope = new Scope(`${type}_${id}`, 'comprehension')
    scopes.push(comp_scope)

    var expr = this.elt,
        first_for = this.generators[0],
        outmost_expr = $B.js_from_ast(first_for.iter, scopes),
        nb_paren = 1

    var js = Comprehension.admin_infos({ast: this, id, scopes, type})
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

$B.ast.ListComp.prototype.to_js = function(scopes){
    return make_comp.bind(this)(scopes)
}

$B.ast.Module.prototype.to_js = function(scopes){
    scopes.push(new Scope(this.$id, 'module'))
    var module_id = this.$id,
        global_name = `locals_${module_id}`
    var js = `// generated from ast
              var $B = __BRYTHON__,
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
        if(scope === $B.last(scopes) && scope.freevars.has(this.id)){
            // name was referenced but is declared local afterwards
            scope.freevars.delete(this.id)
        }
        return `locals_${scope.name}.${this.id}`
    }else if(this.ctx instanceof $B.ast.Load){
        var scope = binding_scope(this.id, scopes)
        if(! scope){
            return `$B.resolve("${this.id}")`
        }else if(scope === builtins_scope){
            return `_b_.${this.id}`
        }else{
            if(scope == $B.last(scopes) && ! scope.locals.has(this.id)){
                // local but not yet bound
                return `$B.resolve_local("${this.id}")`
            }
            return `locals_${scope.name}.${this.id}`
        }
    }
}

$B.ast.Pass.prototype.to_js = function(scopes){
    return 'void(0)'
}

$B.ast.Return.prototype.to_js = function(scopes){
    var js = 'var result = ' +
             (this.value ? $B.js_from_ast(this.value, scopes) : ' _b_.None')
    js += `\nif(locals.$f_trace !== _b_.None){\n` +
          `$B.trace_return(_b_.None)\n}\n` +
          `$B.leave_frame(locals)\nreturn result\n`
    return js
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

$B.ast.Subscript.prototype.to_js = function(scopes){
    return `$B.$getitem(${$B.js_from_ast(this.value, scopes)}, ` +
        `${$B.js_from_ast(this.slice, scopes)})`
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
            console.log('add orelse body', this.orelse, 'scopes', scopes.slice())
            js += add_body(this.orelse, scopes) + '}\n'
        }
        js += add_body(this.finalbody, scopes)
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

$B.ast.While.prototype.to_js = function(scopes){
    var scope = $B.last(scopes),
        new_scope = new Scope(scope.name, scope.type)
    // Create a new scope with the same name to avoid binding in the enclosing
    // scope.
    new_scope.parent = scope
    scopes.push(new_scope)
    var js = `while(locals.$line_info = ${this.lineno} && ` +
        `$B.$bool(${$B.js_from_ast(this.test, scopes)})){\n`
    js += add_body(this.body, scopes) + '}'
    scopes.pop()
    return js
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


$B.js_from_root = function(ast_root, symtable){
    var scopes = []
    scopes.symtable = symtable
    console.log('symtable', scopes.symtable)
    return $B.js_from_ast(ast_root, scopes)
}

$B.js_from_ast = function(ast, scopes){
    if(! scopes.symtable){
        console.log('on a perdu symtable', scopes)
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