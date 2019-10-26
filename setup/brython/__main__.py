"""This script creates the basic structure of a Brython project in the
current directory.
"""

import os
import shutil
import json
import argparse

from . import implementation

if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    parser.add_argument('--add_package',
        help="Add a CPython package in Lib/site-packages")

    parser.add_argument('--install', help='Install Brython in an empty directory',
        action="store_true")

    parser.add_argument('--make_dist', help='Make a Python distribution',
        action="store_true")

    parser.add_argument('--make_package', help='Make a loadable Python package')

    parser.add_argument('--modules',
        help='Create brython_modules.js with all the modules used by the application',
        action="store_true")

    parser.add_argument('--reset', help='Reset brython_modules.js to stdlib',
        action="store_true")

    parser.add_argument('--update', help='Update Brython scripts',
        action="store_true")

    args = parser.parse_args()

    files = ['README.txt', 'demo.html', 'index.html',
        'brython.js', 'brython_stdlib.js', 'unicode.txt']

    if args.add_package:
        print('add package {}...'.format(args.add_package))
        package = __import__(args.add_package)
        package_file = package.__file__
        package_dir = os.path.dirname(package_file)
        lib_dir = os.path.join(os.getcwd(), 'Lib')
        if not os.path.exists(lib_dir):
            os.mkdir(lib_dir)
        dest_dir = os.path.join(lib_dir, 'site-packages')
        if not os.path.exists(dest_dir):
            os.mkdir(dest_dir)

        if os.path.splitext(package_dir)[1] == '.egg':
            import zipfile
            zf = zipfile.ZipFile(package_dir)
            for info in zf.infolist():
                if info.filename.startswith(('__pycache__', 'EGG-INFO')):
                    continue
                zf.extract(info, dest_dir)
                print('extract', info.filename)
            zf.close()
            print('done')
        elif not package_dir.split(os.sep)[-1] == "site-packages":
            print('copy folder', package_dir)
            dest_dir = os.path.join(dest_dir, args.add_package)
            if os.path.exists(dest_dir):
                shutil.rmtree(dest_dir)
            shutil.copytree(package_dir, dest_dir)
        else:
            print('copy single file', package_file)
            shutil.copyfile(package_file, os.path.join(dest_dir,
                os.path.basename(package_file)))

    if args.install:
        print('Installing Brython {} in an empty directory'.format(implementation))

        data_path = os.path.join(os.path.dirname(__file__), 'data')

        if os.listdir(os.getcwd()):
            print('Brython can only be installed in an empty folder')
            import sys
            sys.exit()

        for path in os.listdir(data_path):
            shutil.copyfile(os.path.join(data_path, path), path)

    if args.update:
        print('Update Brython scripts to version {}'.format(implementation))

        data_path = os.path.join(os.path.dirname(__file__), 'data')

        for path in os.listdir(data_path):
            shutil.copyfile(os.path.join(data_path, path), path)

    if args.reset:
        print('Reset brython_modules.js to standard distribution')
        shutil.copyfile(os.path.join(os.getcwd(), 'brython_stdlib.js'),
            os.path.join(os.getcwd(), 'brython_modules.js'))

    if args.modules:
        print('Create brython_modules.js with all the modules used by the application')
        from . import list_modules

        finder = list_modules.ModulesFinder()
        finder.inspect()
        finder.make_brython_modules()

    if args.make_dist:
        print('Make a Python distribution for the application')
        from . import list_modules
        finder = list_modules.ModulesFinder()
        finder.inspect()
        finder.make_brython_modules()
        finder.make_setup()
        print('done')

    if args.make_package:
        package_name = args.make_package
        from . import make_package
        make_package.make(package_name, os.getcwd())
        print("done")