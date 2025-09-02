import os
import datetime
import time

from version import version, implementation

script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
abs_path = lambda _pth: os.path.join(script_dir, 'www',
    'src', _pth)

now = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')

timestamp = int(1000 * time.time())

# update version number
with open(abs_path('version_info.js'), 'w') as out:
    out.write('"use strict";\n')
    out.write(f'__BRYTHON__.implementation = {implementation}\n')
    out.write(f'__BRYTHON__.version_info = {version}\n')
    out.write(f'__BRYTHON__.compiled_date = "{datetime.datetime.now()}"\n')
    out.write(f'__BRYTHON__.timestamp = {timestamp}\n')
    # builtin module names = list of scripts in src/libs
    out.write('__BRYTHON__.builtin_module_names = [')
    _modules = ['"%s"' % fname.split('.')[0]
               for fname in os.listdir(abs_path('libs'))
               if fname.endswith('.js')]

    # Sort modules so that git diff's don't change between runs
    _modules.sort()
    out.write(',\n    '.join(_modules))
    out.write('];\n')
