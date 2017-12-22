"""This script creates the basic structure of a Brython project in the
current directory.
"""

import os
import shutil
import json
import argparse

parser = argparse.ArgumentParser()

parser.add_argument('--add_package',
    help="Add a CPython package in Lib/site-packages")

parser.add_argument('--install', help='Install Brython in an empty directory',
    action="store_true")

parser.add_argument('--make_dist', help='Make a Python distribution',
    action="store_true")

parser.add_argument('--modules',
    help='Create brython_modules.js with all the modules used by the application',
    action="store_true")

parser.add_argument('--port', help='Port for the built-in server',
    default=8080)

parser.add_argument('--reset', help='Reset brython_modules.js to stdlib',
    action="store_true")

parser.add_argument('--server', help='Start the built-in server',
    action="store_true")

parser.add_argument('--update', help='Update Brython scripts',
    action="store_true")

args = parser.parse_args()

files = ['README.txt', 'demo.html', 'brython.js', 'brython_stdlib.js',
    'unicode.txt']

if args.add_package:
    print('add package {}...'.format(args.add_package))
    package = __import__(args.add_package)
    package_file = os.path.dirname(package.__file__)
    lib_dir = os.path.join(os.getcwd(), 'Lib')
    if not os.path.exists(lib_dir):
        os.mkdir(lib_dir)
    dest_dir = os.path.join(lib_dir, 'site-packages')
    if not os.path.exists(dest_dir):
        os.mkdir(dest_dir)

    if os.path.splitext(package_file)[1] == '.egg':
        import zipfile
        zf = zipfile.ZipFile(package_file)
        for info in zf.infolist():
            if info.filename.startswith(('__pycache__', 'EGG-INFO')):
                continue
            zf.extract(info, dest_dir)
            print('extract', info.filename)
        zf.close()
        print('done')
    elif os.path.isdir(package_file):
        print('copy folder', package_file)
        dest_dir = os.path.join(dest_dir, args.add_package)
        if os.path.exists(dest_dir):
            shutil.rmtree(dest_dir)
        shutil.copytree(package_file, dest_dir)

if args.install:
    print('Installing Brython in an empty directory')

    src_path = os.path.join(os.path.dirname(__file__), 'data')

    if os.listdir(os.getcwd()):
        print('Brython can only be installed in an empty folder')
        import sys
        sys.exit()

    for path in files:
        shutil.copyfile(os.path.join(src_path, path), path)

if args.update:
    print('Update Brython scripts')

    src_path = os.path.join(os.path.dirname(__file__), 'data')

    for path in files:
        shutil.copyfile(os.path.join(src_path, path), path)

if args.reset:
    print('Reset brython_modules.js to standard distribution')
    shutil.copyfile(os.path.join(os.getcwd(), 'brython_stdlib.js'),
        os.path.join(os.getcwd(), 'brython_modules.js'))

if args.server:
    import server
    server.run(int(args.port))

if args.modules:
    print('Create brython_modules.js with all the modules used by the application')
    import list_modules

    finder = list_modules.ModulesFinder()
    finder.inspect()
    finder.make_brython_modules()

if args.make_dist:
    print('Make a Python distribution for the application')
    import list_modules
    finder = list_modules.ModulesFinder()
    finder.inspect()
    finder.make_brython_modules()
    finder.make_setup()
    print('done')