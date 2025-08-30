# -*- coding: utf-8 -*-

"""Script to compact all Brython scripts in a single one."""

import os
import re
import sys

import javascript_minifier
from version import version, implementation

cpython_version = sys.version_info
if cpython_version[0] != version[0] or \
        cpython_version[1] != version [1]:
    print("This script requires Python {}.{}".format(*version[:2]))
    sys.exit(1)

# version name
vname = '.'.join(str(x) for x in implementation[:3])
if implementation[3] == 'rc':
    vname += 'rc%s' % implementation[4]
vname2 = '.'.join(str(x) for x in implementation[:2])
vname1 = str(implementation[0])

# path of parent directory
pdir = os.path.dirname(os.getcwd())

script_dir = os.path.dirname(os.getcwd())

def abs_path(path):
    return os.path.join(script_dir, 'www', 'src', path)

def run():
    import make_stdlib_static     # generates /src/stdlib_paths.js
    import make_version_info      # generates /src/version_info.js

    # build brython.js from base Javascript files
    sources = [
        'brython_builtins',

        'py_ast_classes',
        'stdlib_paths',
        'unicode_data',
        'version_info',

        'py_tokens',
        'python_tokenizer',
        'py_ast',
        'py2js',
        'loaders',
        'py_utils',
        'py_object',
        'py_type',
        'py_functions',
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
        'js_objects',
        'py_generator',
        'py_dom',
        'py_pattern_matching',
        'async',
        'py_flags',
        'builtin_modules',
        'ast_to_js',
        'symtable',

        'action_helpers',
        'string_parser',
        'number_parser',
        'python_parser',
        'pegen',
        'gen_parse',
        'brython_ready'

    ]

    res = f"""// brython.js brython.info
// version {version}
// implementation {implementation}
// version compiled from commented, indented source files at
// github.com/brython-dev/brython
"""

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

    # remove strict mode for brython.js - better to silently ignore than to
    # get weird errors at runtime
    res = re.sub('"use strict";\n', "", res)
    res_no_static = re.sub('"use strict";\n', "", res_no_static)

    with open(abs_path('brython.js'), 'w', newline="\n") as out:
        out.write(res)

    with open(abs_path('brython_no_static.js'), 'w', newline="\n") as out:
        out.write(res_no_static)

    print(('size : originals %s compact %s gain %.2f' %
          (src_size, len(res), 100 * (src_size - len(res)) / src_size)))

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
