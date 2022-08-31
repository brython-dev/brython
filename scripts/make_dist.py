# -*- coding: utf-8 -*-

"""Script to compact all Brython scripts in a single one."""

import time
import datetime
import os
import re
import sys

import javascript_minifier
from version import version, implementation

cpython_version = sys.version_info
if cpython_version[0] < version[0] or \
        cpython_version[1] < version [1]:
    print("This script requires Python >= {}.{}".format(*version[:2]))
    sys.exit()

# path of parent directory
pdir = os.path.dirname(os.getcwd())

# version name
vname = '.'.join(str(x) for x in implementation[:3])
if implementation[3] == 'rc':
    vname += 'rc%s' % implementation[4]
vname2 = '.'.join(str(x) for x in implementation[:2])
vname1 = str(implementation[0])

script_dir = os.path.dirname(os.getcwd())
abs_path = lambda _pth: os.path.join(script_dir, 'www',
    'src', _pth)

def run():
    now = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')

    timestamp = int(1000 * time.time())

    # update version number
    with open(abs_path('version_info.js'), 'w') as vinfo_file_out:
        # implementation[2] = now
        vinfo_file_out.write('__BRYTHON__.implementation = %s\n'
            %implementation)
        vinfo_file_out.write('__BRYTHON__.__MAGIC__ = "%s"\n' %
            '.'.join(['%s' % _i for _i in implementation[:3]]))
        vinfo_file_out.write('__BRYTHON__.version_info = %s\n' % str(version))
        vinfo_file_out.write('__BRYTHON__.compiled_date = "%s"\n'
            %str(datetime.datetime.now()))
        vinfo_file_out.write('__BRYTHON__.timestamp = {}\n'.format(timestamp))
        # builtin module names = list of scripts in src/libs
        vinfo_file_out.write('__BRYTHON__.builtin_module_names = [')
        _modules = ['"%s"' % fname.split('.')[0]
                   for fname in os.listdir(abs_path('libs'))
                   if fname.endswith('.js')]

        # Sort modules so that git diff's don't change between runs
        _modules.sort()
        vinfo_file_out.write(',\n    '.join(_modules))
        vinfo_file_out.write(']\n')

    import make_stdlib_static

    # build brython.js from base Javascript files
    sources = [
        'brython_builtins',
        'version_info',
        'python_tokenizer',
        'py_ast',
        'py2js',
        'loaders',
        'py_object',
        'py_type',
        'py_utils',
        'py_sort',
        'py_builtin_functions',
        'py_exceptions',
        'py_range_slice',
        'py_bytes',
        'py_set',
        'js_objects',
        'stdlib_paths',
        'py_import',
        'unicode_data',
        'py_string',
        'py_int',
        'py_long_int',
        'py_float',
        'py_complex',
        'py_dict',
        'py_list',
        'py_generator',
        'py_dom',
        'py_pattern_matching',
        'builtin_modules',
        'builtins_docstrings',
        'async',
        'ast_to_js',
        'symtable'
    ]

    res = """// brython.js brython.info
// version {}
// implementation {}
// version compiled from commented, indented source files at
// github.com/brython-dev/brython
""".format(version, implementation)

    res_no_static = res # same but without static stdlib files
    src_size = 0

    for fname in sources:
        src = open(abs_path(fname)+'.js').read() + '\n'
        src_size += len(src)
        try:
            mini = javascript_minifier.minify(src) + ";\n"
        except:
            print('error in', fname)
            raise
        res += mini
        if fname == 'stdlib_paths':
            res_no_static += "__BRYTHON__.stdlib = {}\n"
        else:
            res_no_static += mini

    res = re.sub(r'\bcontext\b', 'C', res)
    res_no_static = re.sub(r'\bcontext\b', 'C', res_no_static)

    with open(abs_path('brython.js'), 'w', newline="\n") as out:
        out.write(res)

    with open(abs_path('brython_no_static.js'), 'w', newline="\n") as out:
        out.write(res_no_static)

    print(('size : originals %s compact %s gain %.2f' %
          (src_size, len(res), 100 * (src_size - len(res)) / src_size)))

    # add scripts that use Python grammar to parse source code and produce
    # the Abstract Syntax Tree
    import transform_full_grammar
    transform_full_grammar.generate_javascript()

    src = ''
    for fname in ['string_parser', 'number_parser', 'action_helpers',
            'python_parser', 'full_grammar']:
        src = open(abs_path(fname)+'.js').read() + '\n'
        try:
            mini = javascript_minifier.minify(src) + ";\n"
        except:
            print('error in', fname)
            raise
        res += mini

    with open(abs_path('brython_standard_parser.js'), 'w', newline="\n") as out:
        out.write(res)


    sys.path.append("scripts")

    try:
        import make_VFS
    except ImportError:
        print("Cannot find make_VFS, so we won't make brython_stdlib.js.js")
        make_VFS = None
        sys.exit()

    make_VFS.process(os.path.join(pdir, 'www', 'src', 'brython_stdlib.js'))


if __name__ == "__main__":
    run()
