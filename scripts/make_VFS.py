# -*- coding: utf-8 -*-

import ast
import json
import os
import pathlib
import re


import python_minifier

from .commands.lib.info import SRC_DIR


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
                if self.lib_path.joinpath(*module.split("."), alias.name+".py").exists():
                    self.imports.add(module + "." + alias.name)


def walk(p, skip_func):
    """
        A generator which will enumerate all elements of the directory
        tree starting at path :param:`p` for which :param:`skip_func` returns
        False.
    """
    for item in p.iterdir():
        if skip_func(item):
            pass
        elif item.is_dir():
            yield from walk(item, skip_func)
        else:
            yield item


def create_vfs(path, exclude_dirs=['test', 'site-packages'], progress_func=print):
    ret = {}

    def skip(p):
        for ex in exclude_dirs:
            if ex in p.parts:
                return True
        if '__pycache__' in p.parts:
            return True

        if p.is_file():
            if p.suffix not in ('.js', '.py'):
                return True
            if re.match(r'^module\d+\..*$', p.name):
                return True
            if '/'.join(p.parts[-4:-1]) == 'libs/crypto_js/rollups':
                if p.name not in ('md5.js', 'sha1.js', 'sha3.js',
                                  'sha224.js', 'sha384.js', 'sha512.js'):
                    return True
        return False

    nb = 0

    for subdir in ("libs", "Lib"):
        for p in walk(path / subdir, skip):
            nb += 1
            vfs_path = p.relative_to(path)
            data = p.read_text(encoding='utf-8')
            if p.suffix == '.py':
                tree = ast.parse(data)
                visitor = Visitor(path / subdir, vfs_path.pargs[1:])
                visitor.visit(tree)
                imports = sorted(list(visitor.imports))
                data = python_minifier.minify(data, preserve_lines=True)

            parent_mod_name = '.'.join(vfs_path.parts[1:-1])
            if p.stem == '__init__':
                ret[parent_mod_name] = [p.suffix, data, imports, 1]
                progress_func("Adding package {}".format(parent_mod_name))
            else:
                if parent_mod_name:
                    ret[parent_mod_name+'.'+p.stem] = [p.suffix, data]
                    if p.suffix == '.py':
                        ret[parent_mod_name+'.'+p.stem].append(imports)
                    progress_func("Adding {}".format(parent_mod_name+'.'+p.stem))
                else:
                    ret[p.stem] = [p.suffix, data]
                    if p.suffix == '.py':
                        ret[parent_mod_name+'.'+p.stem].append(imports)
                    progress_func("Adding {}".format(p.stem))
    return ret, nb


def process(filepath, exclude_dirs=['test', 'site-packages']):
    """Process a VFS filename for Brython."""
    print("Generating {}".format(str(filepath)))
    VFS, nb = create_vfs(filepath.parent, exclude_dirs=exclude_dirs)
    print('{} files'.format(nb))

    filepath.write_text('__BRYTHON__.use_VFS = true;\n' +
                        '__BRYTHON__.VFS={}\n\n'.format(json.dumps(VFS)))

if __name__ == '__main__':
    process(SRC_DIR / "py_VFS.js")
