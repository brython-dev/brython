import * as fs from 'https://deno.land/std/fs/mod.ts';
import * as path from 'https://deno.land/std/path/mod.ts';

const __filename = path.fromFileUrl(import.meta.url);
const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
const brythonSrcPath = path.join(__dirname, '..', 'www', 'src', 'brython.js')

var document = {};
// @ts-ignore
document.getElementsByTagName = () => [{src: ''}];
var window = {};
// @ts-ignore
window.location = {href: ''};
// @ts-ignore
window.navigator = {}
// @ts-ignore
window.confirm = () => true;
// @ts-ignore
window.console = console;
// @ts-ignore
document.$py_src = {}
// @ts-ignore
document.$debug = 0

var self = {};
var __BRYTHON__ = {}
// @ts-ignore
__BRYTHON__.$py_module_path = {}
// @ts-ignore
__BRYTHON__.$py_module_alias = {}
// @ts-ignore
__BRYTHON__.$py_next_hash = -Math.pow(2, 53)
// @ts-ignore
__BRYTHON__.exception_stack = []
// @ts-ignore
__BRYTHON__.scope = {}
// @ts-ignore
__BRYTHON__.modules = {}

// Read and eval library
var jscode = await fs.readFileStr(brythonSrcPath, { encoding: "utf8" });
console.log(`jscode is ${jscode}`)
eval(jscode);

async function $import_hooks(mod_name: string, path: string, from_stdlib: any) {
    var search_path = ['./www/src/libs', './www/src/Lib'];
    var ext = ['.js', '.py'];
    var mods = [mod_name, mod_name + '/__init__'];

    for (var i = 0, _len_i = search_path.length; i < _len_i; i++) {
        for (var j = 0, _len_j = ext.length; j < _len_j; j++) {
            for (var k = 0, _len_k = mods.length; k < _len_k; k++) {
                var path = search_path[i] + '/' + mods[k] + ext[j]
                var module_contents;
                try {
                    module_contents = await fs.readFileStr(path, { encoding: "utf8" })
                    if (module_contents !== undefined) {
                        if (ext[j] === '.js') {
                            // @ts-ignore
                            return $import_js_module(mod_name, alias, names, path, module_contents)
                        }
                        // @ts-ignore
                        __BRYTHON__.$py_module_path[mod_name] = path
                        // @ts-ignore
                        __BRYTHON__.imported[mod_name] = path
                        return module_contents
                    }
                } catch (err) {
                }
            }
        }
    }
    console.log("error time!");
    let res = Error()
    res.name = 'NotFoundError'
    res.message = "No module named '" + mod_name + "'"
    throw res
}

var $compile_python = function (module_contents: any, module: any) {
    // @ts-ignore
    var root = __BRYTHON__.py2js(module_contents, module)
    var body = root.children
    root.children = []
    // use the module pattern : module name returns the results of an anonymous function
    // @ts-ignore
    var mod_node = new $Node('expression')
    // @ts-ignore
    new $NodeJSCtx(mod_node, '$module=(function()')
    root.insert(0, mod_node)
    mod_node.children = body
    // search for module-level names : functions, classes and variables
    var mod_names = []
    for (var i = 0, _len_i = mod_node.children.length; i < _len_i; i++) {
        var node = mod_node.children[i]
        // use function get_ctx()
        // because attribute 'context' is renamed by make_dist...
        var ctx = node.get_ctx().tree[0]
        if (ctx.type === 'def' || ctx.type === 'class') {
            if (mod_names.indexOf(ctx.name) === -1) {
                mod_names.push(ctx.name)
            }
        } else if (ctx.type === 'from') {
            for (var j = 0, _len_j = ctx.names.length; j < _len_j; j++) {
                var name = ctx.names[j];
                if (name === '*') {
                    // just pass, we don't want to include '*'
                } else if (ctx.aliases[name] !== undefined) {
                    if (mod_names.indexOf(ctx.aliases[name]) === -1) {
                        mod_names.push(ctx.aliases[name])
                    }
                } else {
                    if (mod_names.indexOf(ctx.names[j]) === -1) {
                        mod_names.push(ctx.names[j])
                    }
                }
            }
        } else if (ctx.type === 'assign') {
            var left = ctx.tree[0]
            if (left.type === 'expr' && left.tree[0].type === 'id' && left.tree[0].tree.length === 0) {
                var id_name = left.tree[0].value
                if (mod_names.indexOf(id_name) === -1) {
                    mod_names.push(id_name)
                }
            }
        }
    }
    // create the object that will be returned when the anonymous function is run
    var ret_code = 'return {'
    for (var i = 0, _len_i = mod_names.length; i < _len_i; i++) {
        ret_code += mod_names[i] + ':' + mod_names[i] + ','
    }
    ret_code += '__getattr__:function(attr){return this[attr]},'
    ret_code += '__setattr__:function(attr,value){this[attr]=value}'
    ret_code += '}'
    // @ts-ignore
    var ret_node = new $Node('expression')
    // @ts-ignore
    new $NodeJSCtx(ret_node, ret_code)
    mod_node.add(ret_node)
    // add parenthesis for anonymous function execution

    // @ts-ignore
    var ex_node = new $Node('expression')
    // @ts-ignore
    new $NodeJSCtx(ex_node, ')()')
    root.add(ex_node)

    try {
        var js = root.to_js()
        return js;
    } catch (err) {
        eval('throw ' + err.name + '(err.message)')
    }
    return undefined;
}

async function execute_python_script(filename: string) {
    const _py_src = await fs.readFileStr(filename, { encoding: 'utf8' })
    // @ts-ignore
    __BRYTHON__.$py_module_path['__main__'] = './'
    // @ts-ignore
    var js = __BRYTHON__.python_to_js(_py_src, '__main_soln__')
    eval(js);
}

// @ts-ignore
__BRYTHON__.$py_module_path = __BRYTHON__.$py_module_path || {}
// @ts-ignore
__BRYTHON__.$py_module_alias = __BRYTHON__.$py_module_alias || {}
// @ts-ignore
__BRYTHON__.exception_stack = __BRYTHON__.exception_stack || []
// @ts-ignore
__BRYTHON__.scope = __BRYTHON__.scope || {}
// @ts-ignore
__BRYTHON__.imported = __BRYTHON__.imported || {}
// @ts-ignore
__BRYTHON__.modules = __BRYTHON__.modules || {}
// @ts-ignore
__BRYTHON__.compile_python = $compile_python
// @ts-ignore
__BRYTHON__.import_hooks = $import_hooks

// @ts-ignore
__BRYTHON__.debug = 0
// @ts-ignore
__BRYTHON__.$options = {}
// @ts-ignore
__BRYTHON__.$options.debug = 0

var filename = Deno.args[2];
await execute_python_script(filename)
