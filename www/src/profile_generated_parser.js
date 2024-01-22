var fs = require('fs'),
    path = require('path');

document = {};
document.getElementsByTagName = () => [{ src: '' }];
document.querySelectorAll = () => [{ src: '' }];
window = {};
window.location = { href: '' };
window.navigator = {}
window.confirm = () => true;
window.console = console;
document.$py_src = {}
document.$debug = 0

addEventListener = () => { }

self = {};
__BRYTHON__ = {}
__BRYTHON__.$py_module_path = {}
__BRYTHON__.$py_module_alias = {}
__BRYTHON__.brython_path = 'http://localhost/brython.js'
__BRYTHON__.$py_next_hash = -Math.pow(2, 53)
__BRYTHON__.exception_stack = []
__BRYTHON__.scope = {}
__BRYTHON__.modules = {}


// Read and eval library

const libraries = ['brython_builtins.js', 'py_ast_classes.js', 'stdlib_paths.js',
'unicode_data.js', 'version_info.js', 'py_tokens.js', 'python_tokenizer.js',
'py_ast.js', 'py2js.js', 'loaders.js', 'py_utils.js', 'py_object.js', 'py_type.js',
'py_builtin_functions.js', 'py_sort.js', 'py_exceptions.js', 'py_range_slice.js',
'py_bytes.js', 'py_set.js', 'py_import.js', 'py_string.js', 'py_int.js', 'py_long_int.js',
'py_float.js', 'py_complex.js', 'py_dict.js', 'py_list.js', 'js_objects.js',
'py_generator.js', 'py_dom.js', 'py_pattern_matching.js', 'async.js', 'py_flags.js',
'builtin_modules.js', 'ast_to_js.js', 'symtable.js', 'brython_ready.js',
'action_helpers_generated_version.js', 'string_parser.js', 'number_parser.js',
'python_parser_peg_version.js', 'pegen.js', 'gen_parse.js'];

for (const library of libraries) {
    jscode = fs.readFileSync(library, 'utf8');
    eval(jscode);
}

function parse(filename, src) {
  var parser = new $B.Parser(src, filename, 'file')
  var _ast = $B._PyPegen_parse(parser)
  if (_ast === undefined) {
    parser = new $B.Parser(src, filename, 'file')
    parser.call_invalid_rules = true
    $B._PyPegen_parse(parser)
  } else {
    var imported
    var future = $B.future_features(_ast, filename)
    var symtable = $B._PySymtable_Build(_ast, filename, future)
    return $B.js_from_root({
      ast: _ast,
      symtable,
      filename,
      imported
    })
  }
}

// Assumes all files are well-formed
// function compile_python_script(py_src) {
//     __BRYTHON__.$py_module_path['__main__'] = './'
//     if (brython_implementation == 'brython_standard_parser.js') {
//         __BRYTHON__.parser_to_ast = 1
//     }
//     return __BRYTHON__.python_to_js(py_src, '__main_soln__');
// }

__BRYTHON__.$py_module_path = __BRYTHON__.$py_module_path || {}
__BRYTHON__.$py_module_alias = __BRYTHON__.$py_module_alias || {}
__BRYTHON__.exception_stack = __BRYTHON__.exception_stack || []
__BRYTHON__.scope = __BRYTHON__.scope || {}
__BRYTHON__.imported = __BRYTHON__.imported || {}
__BRYTHON__.modules = __BRYTHON__.modules || {}

__BRYTHON__.debug = 0
__BRYTHON__.$options = {}
__BRYTHON__.$options.debug = 0

function get_benchmark_paths(dir) {
    var results = []
    var list = fs.readdirSync(dir)
    list.forEach(function (file) {
        file = dir + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory()) {
            results = results.concat(get_benchmark_paths(file))
        } else {
            if (file.endsWith('/run_benchmark.py')) {
                results.push(file)
            }
        }
    })
    return results
}

var skip_tests = [
    'bm_generators',
    'bm_async_generators'
]

function main() {
    let pyperformance_dir = '../../../pyperformance/pyperformance'
    let benchmark_paths = get_benchmark_paths(pyperformance_dir)

    let start_time = performance.now()

    for (let i = 0; i < benchmark_paths.length; i++) {
        let benchmark_path = benchmark_paths[i]

        let skip = false
        for (let j = 0; j < skip_tests.length; j++) {
            if (benchmark_path.includes(skip_tests[j])) {
                skip = true
                break
            }
        }
        if (skip) {
            continue
        }

        let py_src = fs.readFileSync(benchmark_path, 'utf8')
        parse(benchmark_path, py_src)
        
    }

    let end_time = performance.now()
    console.log(end_time - start_time)

    console.log('done!')
}

main()
