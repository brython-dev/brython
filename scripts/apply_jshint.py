import os
import re

this_dir = os.getcwd()
parent_dir = os.path.dirname(this_dir)
src_dir = os.path.join(parent_dir, 'www', 'src')
libs_dir = os.path.join(src_dir, 'libs')

config_path = os.path.join(this_dir, 'jshint_config.json')
report_file = os.path.join(this_dir, 'jshint_report.txt')

if os.path.exists(report_file):
    os.remove(report_file)

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
          'SVGElement', 'SVGSVGElement', 'atob', 'navigator', 'crypto',
          'WorkerNavigator', 'Node', 'Event', 'location', 'self',
          'CustomEvent', 'customElements', 'Intl']

def get_undefined(path):
    if os.path.exists(report_file):
        os.remove(report_file)
    found = []
    os.system(f'jshint --config {config_path} {path} >> {report_file}')
    with open(report_file, encoding='utf-8') as f:
        for line in f:
            if mo := re.search("'(.*)' is not defined", line):
                undef = mo.groups()[0]
                if undef not in ignore:
                    found.append(line)
    return found

# apply to core Brython scripts
for script in core_scripts:
    print(script)
    path = os.path.join(src_dir, f'{script}.js')
    undefined += get_undefined(path)

# apply to standard libray modules implemented in Javascript
libs_dir = os.path.join(parent_dir, 'www', 'src', 'libs')

for filename in os.listdir(libs_dir):
    if not filename.endswith('.js'):
        continue
    print(filename)
    path = os.path.join(libs_dir, filename)
    undefined += get_undefined(path)

with open('jshint_undefined.txt', 'w', encoding='utf-8') as out:
    for line in undefined:
        out.write(line)