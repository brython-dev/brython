import os
import datetime
import time

from version import version, implementation
from directories import src_dir

now = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')

timestamp = int(1000 * time.time())

# update version number
with open(os.path.join(src_dir, 'version_info.js'), 'w') as out:
    out.write('"use strict";\n')
    out.write(f'__BRYTHON__.implementation = {implementation}\n')
    out.write(f'__BRYTHON__.version_info = {version}\n')
    out.write(f'__BRYTHON__.compiled_date = "{datetime.datetime.now()}"\n')
    out.write(f'__BRYTHON__.timestamp = {timestamp}\n')
    # builtin module names = list of scripts in src/libs
    out.write('__BRYTHON__.builtin_module_names = [')
    libs_dir = os.path.join(src_dir, 'libs')
    _modules = ['"%s"' % fname.split('.')[0]
               for fname in os.listdir(libs_dir)
               if fname.endswith('.js')]

    # Sort modules so that git diff's don't change between runs
    _modules.sort()
    out.write(',\n    '.join(_modules))
    out.write('];\n')
