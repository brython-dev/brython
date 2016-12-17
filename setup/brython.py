"""This script creates the basic structure of a Brython project in the
current directory.
"""

import os
import shutil
import json
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--install', help='Install Brython in an empty directory',
    action="store_true")
parser.add_argument('--modules', 
    help='Create brython_modules.js with all the modules used by the application',
    action="store_true")
parser.add_argument('--reset', help='Reset brython_modules.js to stdlib',
    action="store_true")
parser.add_argument('--update', help='Update Brython scripts',
    action="store_true")
args = parser.parse_args()

if args.install:
    print('Installing Brython in an empty directory')
    
    src_path = os.path.join(os.path.dirname(__file__), 'data')

    if os.listdir(os.getcwd()):
        print('Brython can only be installed in an empty folder')
        import sys
        sys.exit()
    
    for path in 'demo.html', 'brython.js', 'brython_stdlib.js':
        shutil.copyfile(os.path.join(src_path, path), path)

if args.update:
    print('Update Brython scripts')

    src_path = os.path.join(os.path.dirname(__file__), 'data')

    for path in 'demo.html', 'brython.js', 'brython_stdlib.js':
        shutil.copyfile(os.path.join(src_path, path), path)
        
if args.reset:
    print('Reset brython_modules.js to standard distribution')
    shutil.copyfile(os.path.join(os.getcwd(), 'brython_stdlib.js'),
        os.path.join(os.getcwd(), 'brython_modules.js'))

if args.modules:
    print('Create brython_modules.js with all the modules used by the application')
    from data.tools import make_bundle
    
    folder = os.getcwd()
    
    more_modules = make_bundle.bundle(folder, ignore=["*.js"])
    
    print('add modules', list(more_modules))
    
    # read modules in /dist/brython_stdlib
    with open("brython_stdlib.js", encoding="utf-8") as fobj:
        src = fobj.read()
    # skip first line
    src = src[src.find('\n'):].lstrip()
    # skip assignment to __BRYTHON__.VFS
    src = src[src.find('=')+1:].lstrip()
    # load all modules in brython_stdlib as a Python dict
    mods = json.loads(src.strip())
    
    # update with new modules
    mods.update(more_modules)
    
    # if there is a file .bundle-modules, use it to select only the requested
    # modules
    include_path = ".bundle-include"

    if os.path.exists(include_path):
        with open(include_path, encoding="utf-8") as fobj:
            bundle_list = [m.strip() for m in fobj if m.strip()]
        mods = {k:v for (k, v) in mods.items() if k in bundle_list}
    
    # save new version of brython_modules
    with open("brython_modules.js", "w", encoding="utf-8") as out:
        out.write('__BRYTHON__.use_VFS = true;\n')
        out.write('__BRYTHON__.VFS = {}\n'.format(json.dumps(mods)))    