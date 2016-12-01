"""This script creates the basic structure of a Brython project in the
current directory.
"""

import os
import shutil
import json
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--install', help='Install Brython locally',
    action="store_true")
parser.add_argument('--reset', help='Reset brython_modules.js to stdlib',
    action="store_true")
parser.add_argument('--update', help='Update brython_modules.js',
    action="store_true")
args = parser.parse_args()

if args.install:
    print('Installing Brython')
    
    src_path = os.path.join(os.path.dirname(__file__), 'data')

    if os.listdir(os.getcwd()):
        print('Brython can only be installed in an empty folder')
        import sys
        sys.exit()
    
    for path in ('.bundle-ignore', 'index.html', 'brython.js',
        'brython_stdlib.js', 'brython_modules.js'):
            shutil.copyfile(os.path.join(src_path, path),
                path)
    
if args.reset:
    print('Reset brython_modules.js to standard distribution')
    shutil.copyfile(os.path.join(os.getcwd(), 'dist', 'brython_stdlib.js'),
        os.path.join(os.getcwd(), 'dist', 'brython_modules.js'))

if args.update:
    print('Update Brython modules')
    from data.tools import make_bundle
    
    folder = os.getcwd()
    more_modules = make_bundle.bundle(folder)
    
    print('add modules', list(more_modules))
    
    # read modules in /dist/brython_stdlib
    bm_path = os.path.join(folder, 'dist', 'brython_stdlib.js')
    with open(bm_path, encoding="utf-8") as fobj:
        src = fobj.read()
    # skip first line
    src = src[src.find('\n'):].lstrip()
    # skip assignment to __BRYTHON__.VFS
    src = src[src.find('=')+1:].lstrip()
    # load all modules in brython_stdlib as a Python dict
    mods = json.loads(src.strip())
    
    # update with new modules
    mods.update(more_modules)
    # save new version of brython_modules
    bm_path = os.path.join(folder, 'dist', 'brython_modules.js')
    with open(bm_path, "w", encoding="utf-8") as out:
        out.write('__BRYTHON__.use_VFS = true;\n')
        out.write('__BRYTHON__.VFS = {}\n'.format(json.dumps(mods)))    