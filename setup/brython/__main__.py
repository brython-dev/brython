"""This script creates the basic structure of a Brython project in the
current directory.
"""

import os
import shutil
import argparse
import pathlib

from . import implementation


def main():
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(title='subcommands', dest='subcommand',
        help="Use --help with any subcommand to see more details")

    # Init
    init_parser = subparsers.add_parser('install', aliases=['init'],
        help='Install Brython in an empty directory',
        description='Initialize an empty directory with basic Brython files '
                    '(brython.js, brython_stdlib.js, index.html etc)')
    init_parser.add_argument('--install-dir', default=os.getcwd(),
        help='Install Brython to this directory (default to current dir)')

    # Update
    update_parser = subparsers.add_parser('update',
        help='Update Brython scripts (brython.js, brython_stdlib.js)',
        description="Replace brython scripts in selected dir "
                    "with latest known to brython-cli")

    update_parser.add_argument('--update-dir',
        help='Update Brython scripts in this directory '
             '(default to current dir)')

    # Add package
    add_package_parser = subparsers.add_parser('add_package',
        help="Add already-installed Python package to Brython project",
        description="Add an already-installed, pure-Python package "
                    "from current CPython environment "
                    "into current Brython project's ./Lib/site-packages")

    add_package_parser.add_argument('package', help="package name")
    add_package_parser.add_argument('--dest-dir',
        help="Optionally specify alternate destination dir")

    # Make package
    make_package_parser = subparsers.add_parser('make_package',
        help="Make a browser loadable Python package script",
        description="Make a loadable {package_name}.brython.js package file "
                    "from regular python package")

    make_package_parser.add_argument('package_name',
        help="name used to import this package. as in (`import {package_name}`)")
    make_package_parser.add_argument('--src-dir', metavar='SOURCE_DIR',
        help="package source dir (defaults to current dir)")
    make_package_parser.add_argument('--exclude-dirs', nargs='+', metavar='EXCLUDE_DIR',
        help="directories under src-dir to exclude")
    make_package_parser.add_argument('-o', '--output-path',
        help="package file output path (defaults to {package_name}.brython.js in source dir)")

    # Make modules
    make_modules_parser = subparsers.add_parser('make_modules',
        help="Create brython_modules.js with all the modules used by the application",
        description="Create brython_modules.js with all the modules used by the application")

    make_modules_parser.add_argument('-o', '--output-path',
        help='Optionally specify modules file output path')

    make_modules_parser.add_argument('--reset', help='Reset brython_modules.js to stdlib',
        action="store_true")

    # Server
    start_server_parser = subparsers.add_parser('start_server',
        help="Start development server",
        description="Start development server")

    start_server_parser.add_argument('port', nargs="?", default=8000, type=int,
        help='Start development server on given port')

    # Others
    make_dist_parser = subparsers.add_parser('make_dist',
        help="Make a Python distribution",
        description="Make a Python distribution")

    make_file_system_parser = subparsers.add_parser('make_file_system',
        help="Make a virtual file system",
        description="Make a virtual file system")

    parser.add_argument('--version', help='Brython version number',
        action="store_true")

    args = parser.parse_args()

    files = ['README.txt', 'demo.html', 'index.html',
        'brython.js', 'brython_stdlib.js', 'unicode.txt']

    if args.subcommand == 'add_package':
        print('add package {}...'.format(args.package))
        package = __import__(args.package)
        package_file = package.__file__
        package_dir = os.path.dirname(package_file)
        lib_dir = os.path.join(os.getcwd(), 'Lib')
        if not os.path.exists(lib_dir):
            os.mkdir(lib_dir)
        dest_dir = os.path.join(lib_dir, 'site-packages') if (not args.dest_dir) else args.dest_dir
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
            dest_dir = os.path.join(dest_dir, args.package)
            if os.path.exists(dest_dir):
                shutil.rmtree(dest_dir)
            shutil.copytree(package_dir, dest_dir)
        else:
            print('copy single file', package_file)
            shutil.copyfile(package_file, os.path.join(dest_dir,
                os.path.basename(package_file)))

    if args.subcommand == 'install' or args.subcommand == 'init':
        print('Installing Brython {}'.format(implementation))

        data_path = os.path.join(os.path.dirname(__file__), 'data')
        install_dir = args.install_dir
        install_dir_files = os.listdir(install_dir)

        if install_dir_files and 'brython.js' in install_dir_files:
            override = input(
                'brython.js is already present in this directory.'
                ' Override ? (Y/N)'
            )
            if override.lower() != 'y':
                import sys
                print('exiting')
                sys.exit()

        for path in os.listdir(data_path):
            # note: here '/' is pathlib.Path join operator
            dest_path = pathlib.Path(install_dir) / pathlib.Path(path)
            try:
                shutil.copyfile(os.path.join(data_path, path), dest_path)
            except shutil.SameFileError:
                print(f'{path} has not been moved. Are the same file.')

        print('done')

    if args.subcommand == 'update':
        print('Update Brython scripts to version {}'.format(implementation))
        # here '/' is Path join operator
        data_path = pathlib.Path(os.path.dirname(__file__)) / 'data'
        update_dir = pathlib.Path(args.update_dir)

        # Update only specific safe files, as user may have customized index.html etc
        for path in ['brython.js', 'brython_stdlib.js']:
            dest_path = pathlib.Path(update_dir) / pathlib.Path(path)
            shutil.copyfile(os.path.join(data_path, path), dest_path)

    if args.subcommand == 'make_modules':
        if args.reset:
            print('Reset brython_modules.js to local standard distribution')
            stdlib_file_path = pathlib.Path.cwd() / 'brython_stdlib.js'
            modules_file_path = (
                args.output_path if args.output_path
                else pathlib.Path.cwd() / 'brython_modules.js')
            shutil.copyfile(stdlib_file_path, modules_file_path)
        else:
            print('Create brython_modules.js with all the modules used by the '
                'application')
            from . import list_modules

            print('searching brython_stdlib.js...')
            stdlib_dir, stdlib = list_modules.load_stdlib_sitepackages()

            print('finding packages...')
            user_modules = list_modules.load_user_modules()
            finder = list_modules.ModulesFinder(stdlib=stdlib, user_modules=user_modules)
            finder.inspect()
            path = os.path.join(stdlib_dir, "brython_modules.js")
            output_path = path if (not args.output_path) else args.output_path
            finder.make_brython_modules(output_path)

    if args.subcommand == 'make_dist':
        print('Make a Python distribution for the application')
        from . import list_modules

        print('searching brython_stdlib.js...')
        stdlib_dir, stdlib = list_modules.load_stdlib_sitepackages()

        print('finding packages...')
        user_modules = list_modules.load_user_modules()
        finder = list_modules.ModulesFinder(stdlib=stdlib, user_modules=user_modules)
        finder.inspect()
        path = os.path.join(stdlib_dir, "brython_modules.js")
        finder.make_brython_modules(path)
        finder.make_setup()
        print('done')

    if args.subcommand == 'make_file_system':
        print('Create a Javascript file for all the files in the directory')
        args_fs = args.make_file_system.split("#")
        if len(args_fs) > 2:
            raise ValueError("--make_file_systems expects at most 2 "
                "arguments, got " + str(len(args_fs)))
        vfs_name = args_fs[0]
        prefix = args_fs[1] if len(args_fs) > 1 else None
        from .make_file_system import make
        make(vfs_name, prefix)
        print('done')

    if args.subcommand == 'make_package':
        package_name = args.package_name
        package_path = args.src_dir
        exclude_dirs = args.exclude_dirs
        output_path = args.output_path
        from . import make_package
        make_package.make(package_name, package_path, exclude_dirs, output_path)
        print("done")

    if args.subcommand == 'start_server':
        # start development server
        import http.server
        import sysconfig
        cpython_site_packages = sysconfig.get_path("purelib")

        class Handler(http.server.CGIHTTPRequestHandler):

            def guess_type(self, path):
                ctype = super().guess_type(path)
                # in case the mimetype associated with .js in the Windows
                # registry is not correctly set
                if os.path.splitext(path)[1] == ".js":
                    ctype = "application/javascript"
                return ctype

            def translate_path(self, path):
                """Map /cpython_site_packages to local CPython site-packages
                directory."""
                elts = path.split('/')
                if len(elts) > 1 and elts[0] == '':
                    if elts[1] == 'cpython_site_packages':
                        elts[-1] = elts[-1].split("?")[0]
                        return os.path.join(cpython_site_packages, *elts[2:])
                return super().translate_path(path)

        print("Brython development server. "
              "Not meant to be used in production.")

        print("For a different port provide command-line option "
              "'--port PORT'.")
        print("Press CTRL+C to Quit.\n")
        http.server.test(HandlerClass=Handler, port=args.port)

    if args.subcommand is None:
        if not args.version:
            parser.print_help()

    if args.version:
        print('Brython version', implementation)


if __name__ == "__main__":
    main()
