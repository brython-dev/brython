# -*- coding: utf-8 -*-


"""Make VFS for Brython."""


import json
import os
import sys

import pyminifier

try:
    import io as StringIO
except ImportError:
    import cStringIO as StringIO  # lint:ok
# Check to see if slimit or some other minification library is installed and
# Set minify equal to slimit's minify function.
try:
    import slimit
    js_minify = slimit.minify
except ImportError as error:
    print(error)
    js_minify = slimit = None


###############################################################################


def process(filename):
    """Process a VFS filename for Brython."""
    print("Generating {}".format(filename))
    nb = 0
    nb_err = 0
    _main_root = os.path.dirname(filename)
    _VFS = {}
    for _mydir in ("libs", "Lib"):
        for _root, _dir, _files in os.walk(os.path.join(_main_root, _mydir)):
            if _root.endswith('lib_migration'):
                continue  # skip these modules
            if '__pycache__' in _root:
                continue
            for _file in _files:
                _ext = os.path.splitext(_file)[1]
                if _ext not in ('.js', '.py'):
                    continue
                nb += 1

                file_name = os.path.join(_root, _file)
                try:  # python 3
                    with open(file_name, encoding="utf-8") as file_with_data:
                        _data = file_with_data.read()
                except Exception as reason:  # python 2
                     with open(file_name, "r") as file_with_data:
                        _data = str(file_with_data.read()).decode("utf-8")

                if not len(_data):
                    print("No data for {} ({}).".format(_file, type(_data)))

                if _ext.lower() in '.js' and js_minify and _data:
                    try:
                        _data = js_minify(_data)
                    except Exception as error:
                        print(error)
                elif _ext.lower() == '.py' and _data:
                    try:
                        _data = pyminifier.remove_comments_and_docstrings(
                            _data)
                        _data = pyminifier.dedent(_data)
                    except Exception as error:
                        print(error)
                        nb_err += 1

                _vfs_filename = os.path.join(
                    _root, _file).replace(_main_root, '')
                _vfs_filename = _vfs_filename.replace("\\", "/")

                if _vfs_filename.startswith('/libs/crypto_js/rollups/'):
                    if _file not in ('md5.js', 'sha1.js', 'sha3.js',
                                     'sha224.js', 'sha384.js', 'sha512.js'):
                        continue

                mod_name = _vfs_filename[len(_mydir) + 2:].replace('/', '.')
                mod_name, ext = os.path.splitext(mod_name)
                is_package = mod_name.endswith('__init__')
                if is_package:
                    mod_name = mod_name[:-9]
                    _VFS[mod_name] = [ext, _data, 1]
                else:
                    _VFS[mod_name] = [ext, _data]
                print(("Adding %s %s" % (mod_name, _vfs_filename)))
    print('%s files, %s errors' % (nb, nb_err))
    with open(filename, "w") as file_to_write_VFS:
        file_to_write_VFS.write('__BRYTHON__.use_VFS = true;\n')
        file_to_write_VFS.write('__BRYTHON__.VFS=%s;\n\n' % json.dumps(_VFS))


###############################################################################


if __name__ == '__main__':
    _main_root = os.path.join(os.getcwd(), '../src')
    process(os.path.join(_main_root, "py_VFS.js"))
