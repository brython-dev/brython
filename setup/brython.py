"""This script creates the basic structure of a Brython project in the
current directory.
"""

import os
import shutil
import json
import argparse

import list_modules

parser = argparse.ArgumentParser()

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

files = 'README.txt', 'demo.html', 'brython.js', 'brython_stdlib.js'

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
    finder = list_modules.ModulesFinder()
    finder.inspect()
    finder.make_brython_modules()

if args.make_dist:
    print('Make a Python distribution for the application')
    finder = list_modules.ModulesFinder()
    finder.inspect()
    finder.make_brython_modules()
    finder.make_setup()
    print('done')