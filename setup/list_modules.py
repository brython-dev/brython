"""Detect all Python scripts in HTML pages in current folder and subfolders.
Generate brython_modules.js, a bundle with all the modules and packages used
by an application.
Generate a Python package ready for installation and upload on PyPI.
"""

import os
import shutil
import html.parser
import ast
import json
import traceback
import sys
import time

# Template for application setup.py script
setup = """from setuptools import setup, find_packages

import os

if os.path.exists('README.rst'):
    with open('README.rst', encoding='utf-8') as fobj:
        LONG_DESCRIPTION = fobj.read()

setup(
    name='{app_name}',
    version='{version}',

    # The project's main homepage.
    url='{url}',

    # Author details
    author='{author}',
    author_email='{author_email}',

    # License
    license='{license}',

    packages=['data'],
    py_modules=["{app_name}"],
    package_data={{'data':[{files}]}}
)
"""

# Template for the application script
app = """import os
import shutil
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--install',
    help='Install {app_name} in an empty directory',
    action="store_true")
args = parser.parse_args()

files = ({files})

if args.install:
    print('Installing {app_name} in an empty directory')

    src_path = os.path.join(os.path.dirname(__file__), 'data')

    if os.listdir(os.getcwd()):
        print('{app_name} can only be installed in an empty folder')
        import sys
        sys.exit()

    for path in files:
        shutil.copyfile(os.path.join(src_path, path), path)

"""

class ImportsFinder(ast.NodeVisitor):
    """Used to detect all imports in an AST tree and store the results in
    attribute imports.
    """

    def __init__(self, *args, **kw):
        self.package = kw.pop("package") or ""
        ast.NodeVisitor.__init__(self, *args, **kw)
        self.imports = set()

    def visit_Import(self, node):
        for name in node.names:
            if name.name != '*':
                # For "import A.B.C", modules A, A.B and A.B.C must be stored
                # in self.imports
                elts = name.name.split('.')
                while elts:
                    self.imports.add('.'.join(elts))
                    elts.pop()

    def visit_ImportFrom(self, node):
        if node.level == 0:
            package = ""
        else:
            parts = self.package.split('.')
            for _ in range(node.level - 1):
                parts.pop()
            package = '.'.join(parts)
        if package:
            package += '.'
        if node.module is None:
            # syntax "from .. import name1, name2"
            self.imports.add(package)
            for name in node.names:
                if name.name != '*':
                    self.imports.add('{}{}'.format(package, name.name))
        else:
            # syntax "from .foo import name1, name2"
            self.imports.add('{}{}'.format(package, node.module))
            for name in node.names:
                if name.name != "*":
                    self.imports.add('{}{}.{}'.format(package, node.module,
                        name.name))


class ModulesFinder:

    def __init__(self, directory=os.getcwd()):
        self.directory = directory
        self.modules = set()

    def get_imports(self, src, package=None):
        """Get all imports in source code src."""
        tree = ast.parse(src)
        finder = ImportsFinder(package=package)
        finder.visit(tree)
        for module in finder.imports:
            if module in self.modules:
                continue
            for module_dict in [stdlib, user_modules]:
                if module in module_dict:
                    self.modules.add(module)
                    if module_dict[module][0] == '.py':
                        is_package = len(module_dict[module]) == 4
                        if is_package:
                            package = module
                        else:
                            package = module[:module.rfind(".")]
                        imports = self.get_imports(module_dict[module][1],
                            package)

        return finder.imports

    def norm_indent(self, script):
        """Scripts in Brython page may start with an indent, remove it before
        building the AST.
        """
        indent = None
        lines = []
        for line in script.split('\n'):
            if line.strip() and indent is None:
                indent = len(line) - len(line.lstrip())
                line = line[indent:]
            elif indent is not None:
                line = line[indent:]
            lines.append(line)
        return '\n'.join(lines)

    def inspect(self):
        """Walk the directory to find all pages with Brython scripts, parse
        them to get the list of modules needed to make them run.
        """
        imports = set()
        for dirname, dirnames, filenames in os.walk(self.directory):
            for name in dirnames:
                if name.endswith('__dist__'):
                    # don't inspect files in the subfolder __dist__
                    dirnames.remove(name)
                    break
            for filename in filenames:
                path = os.path.join(dirname, filename)
                if path == __file__:
                    continue
                ext = os.path.splitext(filename)[1]
                if ext.lower() == '.html':
                    # detect charset
                    charset_detector = CharsetDetector()
                    with open(path, encoding="iso-8859-1") as fobj:
                        charset_detector.feed(fobj.read())

                    # get text/python scripts
                    parser = BrythonScriptsExtractor(dirname)
                    with open(path, encoding=charset_detector.encoding) as fobj:
                        parser.feed(fobj.read())
                    for script in parser.scripts:
                        script = self.norm_indent(script)
                        try:
                            imports |= self.get_imports(script)
                        except SyntaxError:
                            print('syntax error', path)
                            traceback.print_exc(file=sys.stderr)
                elif ext.lower() == '.py':
                    if filename == "list_modules.py":
                        continue
                    if dirname != self.directory and not is_package(dirname):
                        continue
                    # get package name
                    package = dirname[len(self.directory) + 1:] or None
                    with open(path, encoding="utf-8") as fobj:
                        try:
                            imports |= self.get_imports(fobj.read(), package)
                        except SyntaxError:
                            print('syntax error', path)
                            traceback.print_exc(file=sys.stderr)
        self.imports = sorted(list(imports))

    def make_brython_modules(self):
        """Build brython_modules.js from the list of modules needed by the
        application.
        """
        vfs = {}
        for module in self.modules:
            dico = stdlib if module in stdlib else user_modules
            vfs[module] = dico[module]
            elts = module.split('.')
            for i in range(1, len(elts)):
                pkg = '.'.join(elts[:i])
                if not pkg in vfs:
                    vfs[pkg] = dico[pkg]

        # save in brython_modules.js
        path = os.path.join(stdlib_dir, "brython_modules.js")
        with open(path, "w", encoding="utf-8") as out:
            # Add VFS_timestamp ; used to test if the indexedDB must be
            # refreshed
            out.write("__BRYTHON__.VFS_timestamp = {}\n".format(
                int(1000*time.time())))
            out.write("__BRYTHON__.use_VFS = true\n__BRYTHON__.VFS = ")
            json.dump(vfs, out)

    def _dest(self, base_dir, dirname, filename):
        """Build the destination path for a file."""
        elts = dirname[len(os.getcwd()) + 1:].split(os.sep)
        dest_dir = base_dir
        for elt in elts:
            dest_dir = os.path.join(dest_dir, elt)
            if not os.path.exists(dest_dir):
                os.mkdir(dest_dir)
        return os.path.join(dest_dir, filename)

    def make_setup(self):
        """Make the setup script (setup.py) and the entry point script
        for the application."""
        # Create a temporary directory
        temp_dir = '__dist__'
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        os.mkdir(temp_dir)

        # Create a package "data" in this directory
        data_dir = os.path.join(temp_dir, 'data')
        os.mkdir(data_dir)
        with open(os.path.join(data_dir, "__init__.py"), "w") as out:
            out.write('')

        # If there is a brython_setup.json file, use it to get information
        if os.path.exists("brython_setup.json"):
            with open("brython_setup.json", encoding="utf-8") as fobj:
                info = json.load(fobj)
        else:
            # Otherwise, ask setup information
            while True:
                app_name = input("Application name: ")
                if app_name:
                    break
            while True:
                version = input("Version: ")
                if version:
                    break
            author = input("Author: ")
            author_email = input("Author email: ")
            license = input("License: ")
            url = input("Project url: ")
            info = {
                "app_name": app_name,
                "version": version,
                "author": author,
                "author_email": author_email,
                "license": license,
                "url": url
            }
            # Store information in brython_setup.json
            with open("brython_setup.json", "w", encoding="utf-8") as out:
                json.dump(info, out, indent=4)

        # Store all application files in the temporary directory. In HTML
        # pages, replace "brython_stdlib.js" by "brython_modules.js"
        files = []
        for dirname, dirnames, filenames in os.walk(self.directory):
            if dirname == "__dist__":
                continue
            if "__dist__" in dirnames:
                dirnames.remove("__dist__")
            for filename in filenames:
                path = os.path.join(dirname, filename)
                files.append(path[len(os.getcwd()) + 1:])
                if os.path.splitext(filename)[1] == '.html':
                    # detect charset
                    charset_detector = CharsetDetector()
                    with open(path, encoding="iso-8859-1") as fobj:
                        charset_detector.feed(fobj.read())
                    encoding = charset_detector.encoding

                    # get text/python scripts
                    parser = VFSReplacementParser(dirname)
                    with open(path, encoding=encoding) as fobj:
                        parser.feed(fobj.read())
                    if not parser.has_vfs:
                        # save file
                        dest = self._dest(data_dir, dirname, filename)
                        shutil.copyfile(path, dest)
                        continue
                    with open(path, encoding=encoding) as fobj:
                        lines = fobj.readlines()
                        start_line, start_pos = parser.start
                        end_line, end_pos = parser.end
                        res = ''.join(lines[:start_line - 1])
                        for num in range(start_line - 1, end_line):
                            res += lines[num].replace("brython_stdlib.js",
                                "brython_modules.js")
                        res += ''.join(lines[end_line:])
                    dest = self._dest(data_dir, dirname, filename)
                    with open(dest, 'w', encoding=encoding) as out:
                        out.write(res)
                else:
                    dest = self._dest(data_dir, dirname, filename)
                    shutil.copyfile(path, dest)

        info["files"] = ',\n'.join('"{}"'.format(file) for file in files)

        # Generate setup.py from the template in string setup
        path = os.path.join(temp_dir, "setup.py")
        with open(path, "w", encoding="utf-8") as out:
            out.write(setup.format(**info))

        # Generate the application script from the template in string app
        path = os.path.join(temp_dir, "{}.py".format(info["app_name"]))
        with open(path, "w", encoding="utf-8") as out:
            out.write(app.format(**info))

# Get all modules in the Brython standard distribution.
# They must be in brython_stdlib.js somewhere in the current directory
# or below.
print('searching brython_stdlib.js...')
stdlib = {}
stdlib_dir = None
for dirname, dirnames, filenames in os.walk(os.getcwd()):
    for filename in filenames:
        if filename == "brython_stdlib.js":
            stdlib_dir = dirname
            path = os.path.join(dirname, filename)
            with open(path, encoding="utf-8") as fobj:
                modules = fobj.read()
                modules = modules[modules.find('{'):]
                stdlib = json.loads(modules)


# get all Python modules and packages
user_modules = {}

packages = set()

def is_package(folder):
    """Test if folder is a package, ie has __init__.py and all the folders
    above until os.getcwd() also have __init__.py.
    Use set "packages" to cache results.
    """
    if folder in packages:
        return True
    current = folder
    while True:
        if not os.path.exists(os.path.join(current, "__init__.py")):
            return False
        current = os.path.dirname(current)
        if current == os.getcwd():
            packages.add(folder)
            return True

print('finding packages...')
for dirname, dirnames, filenames in os.walk(os.getcwd()):
    for filename in filenames:
        name, ext = os.path.splitext(filename)
        if not ext == ".py" or filename == "list_modules.py":
            continue
        if dirname == os.getcwd():
            # modules in the same directory
            path = os.path.join(dirname, filename)
            with open(path, encoding="utf-8") as fobj:
                src = fobj.read()
            mf = ModulesFinder(dirname)
            imports = sorted(list(mf.get_imports(src)))
            user_modules[name] = [ext, src, imports]
        elif is_package(dirname):
            # modules in packages below current directory
            path = os.path.join(dirname, filename)
            package = dirname[len(os.getcwd()) + 1:].replace(os.sep, '.')
            if filename == "__init__.py":
                module_name = package
            else:
                module_name = "{}.{}".format(package, name)
            with open(path, encoding="utf-8") as fobj:
                src = fobj.read()
            mf = ModulesFinder(dirname)
            imports = sorted(list(mf.get_imports(src)))
            user_modules[module_name] = [ext, src, imports]
            if module_name == package:
                user_modules[module_name].append(1)


class CharsetDetector(html.parser.HTMLParser):
    """Used to detect <meta charset="..."> in HTML page."""

    def __init__(self, *args, **kw):
        kw.setdefault('convert_charrefs', True)
        try:
            html.parser.HTMLParser.__init__(self, *args, **kw)
        except TypeError:
            # convert_charrefs is only supported by Python 3.4+
            del kw['convert_charrefs']
            html.parser.HTMLParser.__init__(self, *args, **kw)

        self.encoding = "iso-8859-1"

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "meta":
            for key, value in attrs:
                if key == "charset":
                    self.encoding = value

class BrythonScriptsExtractor(html.parser.HTMLParser):
    """Used to extract all Brython scripts in HTML pages."""

    def __init__(self, dirname, **kw):
        kw.setdefault('convert_charrefs', True)
        try:
            html.parser.HTMLParser.__init__(self, **kw)
        except TypeError:
            # convert_charrefs is only supported by Python 3.4+
            del kw['convert_charrefs']
            html.parser.HTMLParser.__init__(self, **kw)

        self.dirname = dirname
        self.scripts = []
        self.py_tags = [] # stack of Python blocks
        self.tag_stack = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "script":
            _type = "js_script"
            src = None
            for key, value in attrs:
                if key == 'type' and value == "text/python":
                    _type = "py_script"
                elif key == "src":
                    src = value
            if _type == "py_script" and src:
                _type = "py_script_with_src"
                path = os.path.join(self.dirname, src)
                with open(path, encoding="utf-8") as fobj:
                    self.scripts.append(fobj.read())
            self.tag_stack.append(_type)

    def handle_endtag(self, tag):
        if tag.lower() == "script":
            self.tag_stack.pop()

    def handle_data(self, data):
        """Data is printed unchanged"""
        if data.strip():
            if self.tag_stack and self.tag_stack[-1].lower() == "py_script":
                self.scripts.append(data)


class VFSReplacementParser(html.parser.HTMLParser):
    """Used to replace brython_stdlib.js by brython_modules.js in HTML
    pages."""

    def __init__(self, path, **kw):
        kw.setdefault('convert_charrefs', True)
        try:
            html.parser.HTMLParser.__init__(self, **kw)
        except TypeError:
            # convert_charrefs is only supported by Python 3.4+
            del kw['convert_charrefs']
            html.parser.HTMLParser.__init__(self, **kw)
        self.vfs = False
        self.has_vfs = False

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "script":
            _type = "js_script"
            src = None
            for key, value in attrs:
                if key == "src":
                    elts = value.split("/")
                    if elts and elts[-1] == "brython_stdlib.js":
                        self.vfs = True
                        self.has_vfs = True
                        self.attrs = attrs
                        self.start = self.getpos()
                        return
        self.vfs = False

    def handle_endtag(self, tag):
        if tag.lower() == "script" and self.vfs:
            self.end = self.getpos()


if __name__ == "__main__":
    finder = ModulesFinder()
    finder.inspect()
    print(sorted(list(finder.modules)))
