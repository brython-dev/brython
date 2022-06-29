import json
import os
import re
import time
import ast

from . import python_minifier

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


def make(package_name, package_path, exclude_dirs=None, output_path=None):
    if not package_name:
        raise ValueError("package name is not specified")
    print("Generating package {}".format(package_name))
    VFS = {"$timestamp": int(1000 * time.time())}
    has_init = os.path.exists(os.path.join(package_path, "__init__.py"))
    nb = 0
    if exclude_dirs is None:
        exclude_dirs = []
    for dirpath, dirnames, filenames in os.walk(package_path):
        flag = False
        root_elts = dirpath.split(os.sep)
        for exclude in exclude_dirs:
            if exclude in root_elts:
               continue
        if '__pycache__' in dirnames:
            dirnames.remove("__pycache__")

        if dirpath == package_path:
            package = []
        else:
            package = dirpath[len(package_path) + 1:].split(os.sep)
        if has_init:
            package.insert(0, package_name)

        for filename in filenames:
            name, ext = os.path.splitext(filename)
            if ext not in ('.py', '.js'):
                continue
            is_package = name.endswith('__init__')
            if is_package:
                mod_name = '.'.join(package)
            else:
                mod_name = '.'.join(package + [name])

            nb += 1
            absname = os.path.join(dirpath, filename)
            with open(absname, encoding='utf-8') as f:
                data = f.read()

            if ext == ".py":
                data = python_minifier.minify(data, preserve_lines=True)
            path_elts = package[:]
            if os.path.basename(filename) != "__init__.py":
                path_elts.append(os.path.basename(filename)[:-3])
            fqname = ".".join(path_elts)
            if ext == ".py":
                with open(absname, encoding="utf-8") as f:
                    tree = ast.parse(f.read())
                    visitor = Visitor(package_path, package)
                    visitor.visit(tree)
                    imports = sorted(list(visitor.imports))
            else:
                imports = []
            if is_package:
                VFS[mod_name] = [ext, data, imports, 1]
            else:
                VFS[mod_name] = [ext, data, imports]

            print("adding {} package {}".format(mod_name, is_package))

    if nb == 0:
        print("No Python file found in current directory")
    else:
        print('{} files'.format(nb))

        output_path = output_path or os.path.join(package_path, package_name + ".brython.js")
        with open(output_path, "w", encoding="utf-8") as out:
            out.write('__BRYTHON__.use_VFS = true;\n')
            out.write('var scripts = {}\n'.format(json.dumps(VFS)))
            out.write('__BRYTHON__.update_VFS(scripts)\n')

if __name__ == "__main__":
    import sys
    package_name = sys.argv[1] if len(sys.argv) > 1 else ""
    src_dir = sys.argv[2] if len(sys.argv) > 2 else os.getcwd()

    make(package_name, src_dir)
