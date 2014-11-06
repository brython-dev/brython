# -*- coding: utf-8 -*-


import json
import os

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
    js_minify = None


###############################################################################


def process(filename):
  print(("generating %s" % filename))
  nb = 0
  nb_err = 0
  _main_root = os.path.dirname(filename)
  _VFS={}
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

            with open(os.path.join(_root, _file), "r") as file_with_data:
                _data = file_with_data.read()
            
            if len(_data)==0:
                print('no data for %s' %_file)
                _data = unicode('')
                print(_data,type(_data))
            else:
                _data =_data.decode('utf-8')

            if _ext in ('.js'):
               if js_minify is not None:
                  try:
                    _data = js_minify(_data)
                  except:
                    pass
            elif _ext == '.py' and len(_data)>0:
               try:
                 _data = pyminifier.remove_comments_and_docstrings(_data)
                 _data = pyminifier.dedent(_data)
               except:
                 nb_err += 1

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
  print('%s files, %s errors' %(nb,nb_err))
  with open(filename, "w") as file_to_write_VFS:
    file_to_write_VFS.write('__BRYTHON__.use_VFS = true;\n')
    file_to_write_VFS.write('__BRYTHON__.VFS=%s;\n\n' % json.dumps(_VFS))


###############################################################################


if __name__ == '__main__':
    _main_root = os.path.join(os.getcwd(), '../src')
    process(os.path.join(_main_root, "py_VFS.js"))
