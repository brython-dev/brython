import os
import re

src_dir = os.path.join(os.path.dirname(os.getcwd()), 'www', 'src')

os.chdir(src_dir)

core_scripts = [
    'brython_builtins',

    # generated
    'py_ast_classes', # from Python.asdl
    'unicode_data',   # from Unicode database
    'stdlib_paths',   # from current standard library files
    'version_info',   # from version, implementation, timestamp

    # core Brython scripts
    'python_tokenizer',
    'py_ast',
    'py2js',
    'loaders',
    'py_utils',
    'py_object',
    'py_type',
    'py_builtin_functions',
    'py_sort',
    'py_exceptions',
    'py_range_slice',
    'py_bytes',
    'py_set',
    'py_import',
    'py_string',
    'py_int',
    'py_long_int',
    'py_float',
    'py_complex',
    'py_dict',
    'py_list',
    'py_generator',
    'js_objects',
    'py_dom',
    'py_pattern_matching',
    'async',
    'py_flags',
    'builtin_modules',
    'ast_to_js',
    'symtable',
    'builtins_docstrings',
    'brython_ready'
]

undefined = []

ignore = ['__BRYTHON__', 'console', 'alert', 'document', 'window',
          'indexedDB', 'localStorage', 'sessionStorage', 'XMLHttpRequest',
          'SVGElement', 'SVGSVGElement', 'atob', 'navigator',
          'WorkerNavigator', 'Node', 'Event', 'location', 'self', 
          'CustomEvent', 'customElements', 'Intl']

for script in core_scripts:
    os.remove('jshint_report.txt')
    print(script)
    os.system(f'jshint --config jshint_config.json {script}.js >> jshint_report.txt')
    with open('jshint_report.txt', encoding='utf-8') as f:
        for line in f:
            if mo := re.search("'(.*)' is not defined", line):
                undef = mo.groups()[0]
                if undef not in ignore:
                    undefined.append(line)

with open('jshint_undefined.txt', 'w', encoding='utf-8') as out:
    for line in undefined:
        out.write(line)