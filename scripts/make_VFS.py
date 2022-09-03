# -*- coding: utf-8 -*-

import ast
import json
import os
import re
import time

import python_minifier
import git

class Visitor(ast.NodeVisitor):
    """Used to list all the modules imported by a script."""

    def __init__(self, lib_path, package, file_name):
        self.imports = set()
        self.lib_path = lib_path
        self.package = package
        self.file_name = file_name

    def visit_Import(self, node):
        for alias in node.names:
            self.imports.add(alias.name)

    def visit_ImportFrom(self, node):
        if node.level > 0:
            package = self.package[:]
            level = node.level - 1
            while level:
                package.pop()
                level -= 1
            module = ".".join(package)
            if node.module:
                module += "." + node.module
        else:
            module = node.module
        self.imports.add(module)
        for alias in node.names:
            if alias.name == "*":
                continue
            else:
                # Only keep "from X import Y" if X.Y is a module, not if Y
                # is a variable defined in X
                path = os.path.join(self.lib_path, *module.split("."),
                    alias.name + ".py")
                if os.path.exists(path):
                    self.imports.add(module + "." + alias.name)

last_modifs_path = os.path.join(os.path.dirname(__file__), 'last_modifs.json')
last_modifs = {}
if not os.path.exists(last_modifs_path):
    with open(last_modifs_path, 'w', encoding='utf-8') as out:
        json.dump(last_modifs, out)
else:
    with open(last_modifs_path, encoding='utf-8') as f:
        last_modifs = json.load(f)

def check_changed(root, file_name):
    """Check if the last modification date changed since last build."""
    mtime = os.stat(os.path.join(root, file_name)).st_mtime
    if file_name not in last_modifs:
        last_modifs[file_name] = mtime
        return True
    elif mtime == last_modifs[file_name]:
        return False # file did not change
    else:
        last_modifs[file_name] = mtime
        print(file_name, 'changed')
        return True

def process(filename, exclude_dirs=['test','site-packages']):
    """Process a VFS filename for Brython."""
    print("Generating {}".format(filename))
    timestamp = int(1000 * time.time())
    nb = 0
    nb_err = 0
    main_root = os.path.dirname(filename)
    VFS = {"$timestamp": timestamp}
    print("generated VFS timestamp", timestamp)
    if os.path.exists(filename):
        with open(filename, encoding='utf-8') as f:
            vfs = f.readlines()[1:-1]
            vfs[0] = vfs[0][vfs[0].find('{'):]
            json_payload = ''.join(vfs)
            old_vfs = json.loads(json_payload)

    nb_unchanged = 0
    for stdlib_dir in ("libs", "Lib"):
        lib_path = os.path.join(main_root, stdlib_dir)
        for root, _dir, files in os.walk(lib_path):
            flag = False
            root_elts = root.split(os.sep)
            for exclude in exclude_dirs:
                if exclude in root_elts:
                   flag = True
                   continue
            if flag:
               continue  # skip these modules
            if '__pycache__' in _dir:
                _dir.remove("__pycache__")

            if stdlib_dir == "Lib":
                if root == lib_path:
                    package = []
                else:
                    package = root[len(lib_path) + 1:].split(os.sep)

            if root != lib_path and "__init__.py" not in files:
                # This is the case for package "browser"
                _file = "__init__.py"
                file_name = os.path.join(root, _file)
                vfs_path = os.path.join(root, _file).replace(main_root, '')
                vfs_path = vfs_path.replace("\\", "/")
                mod_name = vfs_path[len(stdlib_dir) + 2:].replace('/', '.')
                mod_name, ext = os.path.splitext(mod_name)
                mod_name = mod_name[:-9]
                VFS[mod_name] = [".py", "", [], 1]
                print("adding", mod_name)

            for _file in files:
                ext = os.path.splitext(_file)[1]
                if ext not in ('.js', '.py'):
                    continue
                if _file.endswith('.brython.js'):
                    continue
                if re.match(r'^module\d+\..*$', _file):
                    continue
                if not git.in_index(_file):
                    print(_file, "not in git index")
                    continue

                file_name = os.path.join(root, _file)

                vfs_path = os.path.join(root, _file).replace(main_root, '')
                vfs_path = vfs_path.replace("\\", "/")

                if vfs_path.startswith('/libs/crypto_js/rollups/'):
                   if _file not in ('md5.js', 'sha1.js', 'sha3.js',
                                'sha224.js', 'sha256.js', 'sha384.js',
                                'sha512.js'):
                      continue

                nb += 1

                mod_name = vfs_path[len(stdlib_dir) + 2:].replace('/', '.')
                mod_name, ext = os.path.splitext(mod_name)
                is_package = mod_name.endswith('__init__')
                if ext == ".py" and is_package:
                   mod_name = mod_name[:-9]

                tail = file_name[len(main_root) + 1:]
                if not check_changed(main_root, tail):
                    # if last modif time did not change, use the previous
                    # version stored in brython_stdlib.js
                    nb_unchanged += 1
                    VFS[mod_name] = old_vfs[mod_name]
                    continue

                try:
                    with open(file_name, encoding='utf-8') as f:
                        data = f.read()
                except:
                    print('error reading file', file_name)
                    raise
                if ext == '.py':
                    data = python_minifier.minify(data, preserve_lines=True)
                    path_elts = package[:]
                    if os.path.basename(filename) != "__init__.py":
                        path_elts.append(os.path.basename(file_name)[:-3])
                    fqname = ".".join(path_elts)
                    with open(os.path.join(root, file_name), encoding="utf-8") as f:
                        tree = ast.parse(f.read())
                        visitor = Visitor(lib_path, package, file_name)
                        visitor.visit(tree)
                        imports = sorted(list(visitor.imports))

                if ext == ".py":
                    if is_package:
                       VFS[mod_name] = [ext, data, imports, 1]
                    else:
                        VFS[mod_name] = [ext, data, imports]
                else:
                   VFS[mod_name] = [ext, data]
                print("adding {}".format(mod_name))

    print('{} files, {} errors'.format(nb, nb_err))
    print(nb_unchanged, 'unchanged')
    if nb_unchanged != nb:
        with open(filename, "w") as out:
          out.write('__BRYTHON__.use_VFS = true;\n')
          out.write('var scripts = {}\n'.format(json.dumps(VFS)))
          out.write('__BRYTHON__.update_VFS(scripts)\n')

        # save changes
        with open(last_modifs_path, 'w', encoding='utf-8') as out:
            json.dump(last_modifs, out)

if __name__ == '__main__':
    main_root = os.path.join(os.path.dirname(os.getcwd()), 'www', 'src')
    process(os.path.join(main_root, "py_VFS.js"))
