# -*- coding: utf-8 -*-


"""Script to compact all Brython scripts in a single one."""


import datetime
import os
import re
import sys
import tarfile
import zipfile

import javascript_minifier

if(sys.version_info[0]!=3):
    raise ValueError("This script only works with Python 3")

# path of parent directory
pdir = os.path.dirname(os.getcwd())
# version info
version = [3, 3, 0, "alpha", 0]
implementation = [3, 2, 6, 'alpha', 0]

# version name
vname = '.'.join(str(x) for x in implementation[:3])
if implementation[3] == 'rc':
    vname += 'rc%s' % implementation[4]

abs_path = lambda _pth: os.path.join(os.path.dirname(os.getcwd()), 'www', 'src', _pth)
now = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')

# update version number
with open(abs_path('version_info.js'), 'w') as vinfo_file_out:
    # implementation[2] = now
    vinfo_file_out.write('__BRYTHON__.implementation = %s\n' % implementation)
    vinfo_file_out.write('__BRYTHON__.__MAGIC__ = "%s"\n' %
                         '.'.join(['%s' % _i for _i in implementation[:3]]))
    vinfo_file_out.write('__BRYTHON__.version_info = %s\n' % str(version))
    vinfo_file_out.write('__BRYTHON__.compiled_date = "%s"\n' % str(datetime.datetime.now()))
    # builtin module names = list of scripts in src/libs
    vinfo_file_out.write('__BRYTHON__.builtin_module_names = ["posix","sys","errno", "time",')
    _modules=['"%s"' % fname.split('.')[0] 
               for fname in os.listdir(abs_path('libs')) if fname.endswith('.js')]
    _modules.sort()    #sort modules so that git diff's don't change between runs
    vinfo_file_out.write(',\n    '.join(_modules))
    # add Python scripts in Lib that start with _ and arent found in CPython Lib
    # using sys.executable to find stdlib dir doesn't work under linux.
    stdlib_path = os.path.dirname(os.__file__)
    # stdlib_path = os.path.join(os.path.dirname(sys.executable),'Lib')
    stdlib_mods = [f for f in os.listdir(stdlib_path) if f.startswith('_')]
    stdlib_mods.sort()
    brython_mods = [f for f in os.listdir(abs_path('Lib'))
                    if f.startswith('_') and f != '__pycache__']
    brython_py_builtins = [os.path.splitext(x)[0]
                           for x in brython_mods if x not in stdlib_mods]
    brython_py_builtins.sort()
    vinfo_file_out.write(',\n    ' + ',\n    '.join(
                     ['"%s"' % f for f in brython_py_builtins]))
    vinfo_file_out.write(']\n')

    #log.info("Finished Writing file: " + abs_path('version_info.js'))

import make_stdlib_static
# build brython.js from base Javascript files
sources = [
    'brython_builtins', 'version_info', 'py2js', 
    'py_object', 'py_type', 'py_utils', 'py_builtin_functions', 
    'py_exceptions', 'py_range_slice', 'py_bytes', 'js_objects', 
    'stdlib_paths', 'py_import', 'py_float', 'py_int', 'py_long_int', 
    'py_complex', 'py_list', 'py_string', 'py_dict', 'py_set', 'py_dom', 
    'py_generator', 'builtin_modules', 'py_import_hooks', 'async'
]

res = '// brython.js brython.info\n'
res += '// version %s\n' % version
res += '// implementation %s\n' % implementation
res += '// version compiled from commented, indented source files '
res += 'at github.com/brython-dev/brython\n'
src_size = 0

for fname in sources:
    src = open(abs_path(fname)+'.js').read() + '\n'
    src_size += len(src)
    res += javascript_minifier.minify(src)

res = res.replace('context', 'C')

with open(abs_path('brython.js'), 'w') as the_brythonjs_file_output:
    the_brythonjs_file_output.write(res)

print(('size : originals %s compact %s gain %.2f' %
      (src_size, len(res), 100 * (src_size - len(res)) / src_size)))

sys.path.append("scripts")

try:
    import make_VFS  # isort:skip
except ImportError:
    print("Cannot find make_VFS, so we won't make py_VFS.js")
    make_VFS = None
    sys.exit()

make_VFS.process(os.path.join(pdir, 'www', 'src', 'py_VFS.js'))
# make distribution with core + libraries
with open(os.path.join(pdir, 'www', 'src', 'brython_dist.js'), 'w') as distrib_file:
    distrib_file.write(open(os.path.join(pdir, 'www', 'src', 'brython.js')).read())
    distrib_file.write(open(os.path.join(pdir, 'www', 'src', 'py_VFS.js')).read())
