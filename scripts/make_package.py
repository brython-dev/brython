import json
import os
import re
import ast

import python_minifier

class Visitor(ast.NodeVisitor):
    """Used to list all the modules imported by a script."""

    def __init__(self, lib_path, package):
        self.imports = set()
        self.lib_path = lib_path
        self.package = package

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


def make(package_name, package_path, exclude_dirs=None):
    print("Generating package {}".format(package_name))
    VFS = {}
    nb = 0
    if exclude_dirs is None:
        exclude_dirs = []
    for dirpath, dirnames, filenames in os.walk(package_path):
        flag = False
        root_elts = dirpath.split(os.sep)
        for exclude in exclude_dirs:
            if exclude in root_elts:
               flag = True
               continue
        if flag:
           continue  # skip these modules
        if '__pycache__' in dirnames:
            dirnames.remove("__pycache__")

        if dirpath == package_path:
            package = []
        else:
            package = dirpath[len(package_path) + 1:].split(os.sep)

        for filename in filenames:
            ext = os.path.splitext(filename)[1]
            if ext not in ('.js', '.py'):
                continue
            if filename.endswith(".brython.js"):
                continue

            nb += 1
            absname = os.path.join(dirpath, filename)
            with open(absname, encoding='utf-8') as f:
                data = f.read()

            if ext == '.py':
                data = python_minifier.minify(data, preserve_lines=True)
                path_elts = package[:]
                if os.path.basename(filename) != "__init__.py":
                    path_elts.append(os.path.basename(filename)[:-3])
                fqname = ".".join(path_elts)
                with open(absname, encoding="utf-8") as f:
                    tree = ast.parse(f.read())
                    visitor = Visitor(package_path, package)
                    visitor.visit(tree)
                    imports = sorted(list(visitor.imports))

            mod_name = filename.replace(os.sep, '.')
            mod_name = package_name + "." + mod_name
            mod_name, ext = os.path.splitext(mod_name)
            is_package = mod_name.endswith('__init__')
            if ext == ".py":
                if is_package:
                   mod_name = mod_name[:-9]
                   VFS[mod_name] = [ext, data, imports, 1]
                else:
                    VFS[mod_name] = [ext, data, imports]
            else:
               VFS[mod_name] = [ext, data]
            print("adding {}".format(mod_name))

    print('{} files'.format(nb))
    with open(os.path.join(package_path, package_name + ".brython.js"),
            "w", encoding="utf-8") as out:
        out.write('__BRYTHON__.use_VFS = true;\n')
        out.write('var scripts = {}\n'.format(json.dumps(VFS)))
        out.write('__BRYTHON__.update_VFS(scripts)\n')

if __name__ == "__main__":
    src_dir = os.path.join(os.path.dirname(os.getcwd()), "www", "src", "Lib",
        "browser", "widgets")

    make("widgets", src_dir)