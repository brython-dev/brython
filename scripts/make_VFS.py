# -*- coding: utf-8 -*-

import json
import os
import re

import python_minifier

def process(filename, exclude_dirs=['test','site-packages']):
    """Process a VFS filename for Brython."""
    print("Generating {}".format(filename))
    nb = 0
    nb_err = 0
    main_root = os.path.dirname(filename)
    VFS = {}
    for stdlib_dir in ("libs", "Lib"):
        for root, _dir, files in os.walk(os.path.join(main_root, stdlib_dir)):
            flag = False
            root_elts = root.split(os.sep)
            for exclude in exclude_dirs:
                if exclude in root_elts:
                   flag = True
                   continue
            if flag:
               continue  # skip these modules
            if '__pycache__' in root:
                continue
            nb += 1

            for _file in files:
                ext = os.path.splitext(_file)[1]
                if ext not in ('.js', '.py'):
                    continue
                if re.match(r'^module\d+\..*$', _file):
                    continue
                nb += 1

                file_name = os.path.join(root, _file)
                with open(file_name, encoding='utf-8') as f:
                        data = f.read()

                if ext == '.py':
                   data = python_minifier.minify(data, preserve_lines=True)

                vfs_path = os.path.join(root, _file).replace(main_root, '')
                vfs_path = vfs_path.replace("\\", "/")

                if vfs_path.startswith('/libs/crypto_js/rollups/'):
                   if _file not in ('md5.js', 'sha1.js', 'sha3.js',
                                'sha224.js', 'sha384.js', 'sha512.js'):
                      continue

                mod_name = vfs_path[len(stdlib_dir) + 2:].replace('/', '.')
                mod_name, ext = os.path.splitext(mod_name)
                is_package = mod_name.endswith('__init__')
                if is_package:
                   mod_name = mod_name[:-9]
                   VFS[mod_name] = [ext, data, 1]
                else:
                   VFS[mod_name] = [ext, data]
                print("adding {}".format(mod_name))

    print('{} files, {} errors'.format(nb, nb_err))
    with open(filename, "w") as out:
      out.write('__BRYTHON__.use_VFS = true;\n')
      out.write('__BRYTHON__.VFS={}\n\n'.format(json.dumps(VFS)))



if __name__ == '__main__':
    main_root = os.path.join(os.path.dirname(os.getcwd()), 'www', 'src')
    process(os.path.join(main_root, "py_VFS.js"))
