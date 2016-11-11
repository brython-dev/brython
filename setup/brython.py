"""This script creates the basic structure of a Brython project in the
current directory.
"""

import os
import shutil
import json

print('Installing brython')
src_path = os.path.join(os.path.dirname(__file__), 'data')

if os.listdir(os.getcwd()):
    print('Brython can only be installed in an empty folder')
    import sys
    sys.exit()

for path in 'server.py', 'index.html':
    shutil.copyfile(os.path.join(src_path, path),
        path)

# tools to generate a distribution for the project - WIP
os.mkdir('tools')
for path in 'make_bundle.py', 'python_minifier.py':
    shutil.copyfile(os.path.join(src_path, path),
        os.path.join('tools', path))

# put core Brython script (brython.js) and a bundle of the standard
# distribution
os.mkdir('dist')
shutil.copyfile(os.path.join(src_path, 'lib', 'brython.js'),
    os.path.join(os.getcwd(), 'dist', 'brython.js'))
shutil.copyfile(os.path.join(src_path, 'lib', 'brython_stdlib.js'),
    os.path.join(os.getcwd(), 'dist', 'brython_stdlib.js'))

