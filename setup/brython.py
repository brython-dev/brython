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

for path in '.bundle-ignore', 'server.py', 'index.html', 'update_bundle.py':
    shutil.copyfile(os.path.join(src_path, path),
        path)

# tools to generate a distribution for the project - WIP
os.mkdir('tools')
for path in os.listdir(os.path.join(src_path, 'tools')):
    fullpath = os.path.join(src_path, 'tools', path)
    if os.path.isfile(fullpath):
        shutil.copyfile(fullpath,
            os.path.join('tools', path))

# put core Brython script (brython.js) and a bundle of the standard
# distribution
os.mkdir('dist')
for path in os.listdir(os.path.join(src_path, 'dist')):
    shutil.copyfile(os.path.join(src_path, 'dist', path),
        os.path.join(os.getcwd(), 'dist', path))
