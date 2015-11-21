# -*- coding: utf-8 -*-


import json
import os
import re

import javascript_minifier
import python_minifier

try:
    import io as StringIO
except ImportError:
    import cStringIO as StringIO  # lint:ok


###############################################################################

def process_unittest(filename):
    """Process a VFS filename for Brython."""
    print("Generating {}".format(filename))
    nb = 0
    nb_err = 0
    _main_root = os.path.dirname(filename)
    _VFS = {}
    for _mydir in ("Lib",):
        for _root, _dir, _files in os.walk(os.path.join(_main_root, _mydir)):
            if 'unittest' not in _root:
               if 'test' not in _root:
                  continue

            if '__pycache__' in _root:
               continue

            for _file in _files:
                _ext = os.path.splitext(_file)[1]
                if _ext not in ('.py'):
                    continue
                nb += 1

                file_name = os.path.join(_root, _file)
                encoding = "utf-8"
                try:
                    src = open(file_name, encoding=encoding).read()
                except:
                    encoding = "iso-8859-1"
                    src = open(file_name, encoding=encoding).read()

                if _ext.lower() == '.py':
                    try:
                        _data = python_minifier.minify(src)
                    except Exception as error:
                        print(error)
                        nb_err += 1

                _vfs_filename = os.path.join(_root, _file).replace(_main_root, '')
                _vfs_filename = _vfs_filename.replace("\\", "/")

                mod_name = _vfs_filename[len(_mydir) + 2:].replace('/', '.')
                mod_name, ext = os.path.splitext(mod_name)
                is_package = mod_name.endswith('__init__')
                if is_package:
                    mod_name = mod_name[:-9]
                    _VFS[mod_name] = [_data, 1]
                else:
                    _VFS[mod_name] = [_data]
                print(("Adding %s %s" % (mod_name, _vfs_filename)))
    print('%s files, %s errors' % (nb, nb_err))

    with open(filename, "w") as file_to_write_VFS:
        file_to_write_VFS.write('__BRYTHON__.libs = __BRYTHON__.libs || {};\n')
        file_to_write_VFS.write("__BRYTHON__.=libs['unittest']=%s;\n\n" % json.dumps(_VFS))

        file_to_write_VFS.write("""
  __BRYTHON__.import_from_unittest function(mod_name){
  var stored = __BRYTHON__.libs['unittest'][mod_name]
  if(stored!==undefined){
    var module_contents = stored[0]
    var $is_package = stored[1]
    var path = 'py_unittest'
    var module = {name:mod_name,__class__:$B.$ModuleDict,$is_package:$is_package}
    if($is_package){var package=mod_name}
    else{
      var elts = mod_name.split('.')
      elts.pop()
      var package = elts.join('.')
    }
    $B.modules[mod_name].$package = $is_package
    $B.modules[mod_name].__package__ = package

    run_py(module,path,module_contents)
    return true
  }
  return null
}
// add this import function to brython by doing the following:
// <body onload="brython({custom_import_funcs:[__BRYTHON__.import_from_unittest]})">
// this will allow us to import unittest modules.
""")


def process(filename, exclude_dirs=['unittest','test','site-packages']):
    """Process a VFS filename for Brython."""
    print("Generating {}".format(filename))
    nb = 0
    nb_err = 0
    _main_root = os.path.dirname(filename)
    _VFS = {}
    for _mydir in ("libs", "Lib"):
        for _root, _dir, _files in os.walk(os.path.join(_main_root, _mydir)):
            #if _root.endswith('lib_migration'):
            _flag=False
            for _exclude in exclude_dirs:
                if _exclude in _root: #_root.endswith(_exclude):
                   _flag=True
                   continue
            if _flag:
               continue  # skip these modules
            if '__pycache__' in _root:
                continue
            nb += 1

            for _file in _files:
                _ext = os.path.splitext(_file)[1]
                if _ext not in ('.js', '.py'):
                    continue
                if re.match(r'^module\d+\..*$', _file):
                    continue
                nb += 1

                file_name = os.path.join(_root, _file)
                _data = open(file_name, encoding='utf-8').read()
            
                if _ext == '.py':
                   _data = python_minifier.minify(_data, preserve_lines=True)

                _vfs_filename = os.path.join(_root, _file).replace(_main_root, '')
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
                print(("adding %s %s" % (mod_name, _vfs_filename)))
    print('%s files, %s errors' % (nb, nb_err))
    with open(filename, "w") as file_to_write_VFS:
      file_to_write_VFS.write('__BRYTHON__.use_VFS = true;\n')
      file_to_write_VFS.write('__BRYTHON__.VFS=%s;\n\n' % json.dumps(_VFS))


###############################################################################


if __name__ == '__main__':
    _main_root = os.path.join(os.path.dirname(os.getcwd()), 'www', 'src')
    process(os.path.join(_main_root, "py_VFS.js"))
