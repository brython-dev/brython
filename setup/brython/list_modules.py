"""Detect all Python scripts in HTML pages in current folder and subfolders.
Generate brython_modules.js, a bundle with all the modules and packages used
by an application.
Generate a Python package ready for installation and upload on PyPI.
"""


import os
import shutil
import html.parser
import json
import traceback
import sys
import time
import io
import tokenize
import token
import logging

logger = logging.getLogger(__name__)

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
        dst = os.path.join(os.getcwd(), path)
        head, tail = os.path.split(dst)
        if not os.path.exists(head):
            os.mkdir(head)
        shutil.copyfile(os.path.join(src_path, path), dst)

"""


class FromImport:

    def __init__(self):
        self.source = ''
        self.type = "from"
        self.level = 0
        self.expect = "source"
        self.names = []

    def __str__(self):
        return '<import ' + str(self.names) + ' from ' + str(self.source) +'>'


class Import:

    def __init__(self):
        self.type = "import"
        self.expect = "module"
        self.modules = []

    def __str__(self):
        return '<import ' + str(self.modules) + '>'


class ImportsFinder:

    def __init__(self, *args, **kw):
        self.package = kw.pop("package") or ""

    def find(self, src):
        """Find imports in source code src. Uses the tokenize module instead
        of ast in previous Brython version, so that this script can be run
        with CPython versions older than the one implemented in Brython."""
        imports = set()
        importing = None
        f = io.BytesIO(src.encode("utf-8"))
        for tok_type, tok_string, *_ in tokenize.tokenize(f.readline):
            tok_type = token.tok_name[tok_type]
            if importing is None:
                if tok_type == "NAME" and tok_string in ["import", "from"]:
                    context = Import() if tok_string == "import" \
                        else FromImport()
                    importing = True
            else:
                if tok_type == "NEWLINE":
                    imports.add(context)
                    importing = None
                else:
                    self.transition(context, tok_type, tok_string)

        if importing:
            imports.add(context)

        # Transform raw import objects into a list of qualified module names
        self.imports = set()
        for imp in imports:
            if isinstance(imp, Import):
                for mod in imp.modules:
                    parts = mod.split('.')
                    while parts:
                        self.imports.add('.'.join(parts))
                        parts.pop()
            elif isinstance(imp, FromImport):
                source = imp.source
                if imp.level > 0:
                    if imp.level == 1:
                        imp.source = self.package
                    else:
                        parts = self.package.split(".")
                        imp.source = '.'.join(parts[:1 - imp.level])
                    if source:
                        imp.source += '.' + source
                parts = imp.source.split('.')
                while parts:
                    self.imports.add('.'.join(parts))
                    parts.pop()
                self.imports.add(imp.source)
                for name in imp.names:
                    parts = name.split('.')
                    while parts:
                        self.imports.add(imp.source + '.' + '.'.join(parts))
                        parts.pop()

    def transition(self, context, token, value):
        if context.type == "from":
            if token == "NAME":
                if context.expect == "source":
                    if value == "import" and context.level:
                        # syntax "from . import name"
                        context.expect = "names"
                    else:
                        context.source += value
                        context.expect = "."
                elif context.expect == "." and value == "import":
                    context.expect = "names"
                elif context.expect == "names":
                    context.names.append(value)
                    context.expect = ","
            elif token == "OP":
                if value == "," and context.expect == ",":
                    context.expect = "names"
                elif value == "." and context.expect == ".":
                    context.source += '.'
                    context.expect = "source"
                elif value == "." and context.expect == "source":
                    context.level += 1

        elif context.type == "import":
            if token == "NAME":
                if context.expect == "module":
                    if context.modules and context.modules[-1].endswith("."):
                        context.modules[-1] += value
                    else:
                        context.modules.append(value)
                    context.expect = '.'
            elif token == "OP":
                if context.expect == ".":
                    if value == ".":
                        context.modules[-1] += '.'
                    context.expect = "module"


class ModulesFinder:

    def __init__(self, directory=os.getcwd(), stdlib={}, user_modules={}):
        self.directory = directory
        self.modules = set()

        self.stdlib = stdlib
        self.user_modules = user_modules

    def get_imports(self, src, package=None):
        """Get all imports in source code src."""
        finder = ImportsFinder(package=package)
        finder.find(src)
        for module in finder.imports:
            if module in self.modules:
                continue
            found = False
            for module_dict in [self.stdlib, self.user_modules]:
                if module in module_dict:
                    found = True
                    self.modules.add(module)
                    if module_dict[module][0] == '.py':
                        is_package = len(module_dict[module]) == 4
                        if is_package:
                            package = module
                        elif "." in module:
                            package = module[:module.rfind(".")]
                        else:
                            package = ""
                        module_dict[module][2] = list(self.get_imports(
                            module_dict[module][1], package))
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
        site_packages = 'Lib{0}site-packages{0}'.format(os.sep)
        imports = set()
        for dirname, dirnames, filenames in os.walk(self.directory):
            for name in dirnames:
                if name.endswith('__dist__') or name.endswith("__pycache__"):
                    # don't inspect files in the subfolder __dist__
                    dirnames.remove(name)
                    break
            for filename in filenames:
                path = os.path.join(dirname, filename)
                if path == __file__:
                    continue
                ext = os.path.splitext(filename)[1]
                if ext.lower() == '.html':
                    print("script in html", filename)
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
                            self.get_imports(script)
                        except SyntaxError:
                            print('syntax error', path)
                            traceback.print_exc(file=sys.stderr)
                elif ext.lower() == '.py':
                    #print("python", filename)
                    if filename == "list_modules.py":
                        continue
                    if dirname != self.directory and not is_package(dirname):
                        continue
                    # get package name
                    package = dirname[len(self.directory) + 1:] or None
                    if package is not None and \
                            package.startswith(site_packages):
                        package = package[len('Lib/site-packages/'):]

                    # print(path)
                    with open(path, encoding="utf-8") as fobj:
                        try:
                            imports |= self.get_imports(fobj.read(), package)
                        except SyntaxError:
                            print('syntax error', path)
                            traceback.print_exc(file=sys.stderr)

    def make_brython_modules(self, path):
        """Build brython_modules.js from the list of modules needed by the
        application.
        """
        vfs = {"$timestamp": int(1000 * time.time())}
        for module in self.modules:
            dico = self.stdlib if module in self.stdlib else self.user_modules
            vfs[module] = dico[module]
            elts = module.split('.')
            for i in range(1, len(elts)):
                pkg = '.'.join(elts[:i])
                if not pkg in vfs:
                    vfs[pkg] = dico[pkg]
        # save in brython_modules.js
        if os.path.exists(path):
            # If brython_modules.js already exists, check if there have been
            # changes. Cf. issue #1471.
            changes = False
            with open(path, encoding="utf-8") as f:
                content = f.read()
                start_str = "var scripts = "
                start_pos = content.find(start_str)
                end_pos = content.find("__BRYTHON__.update_VFS(scripts)")
                data = content[start_pos + len(start_str):end_pos].strip()
                old_vfs = json.loads(data)
                if old_vfs.keys() != vfs.keys():
                    changes = True
                else:
                    changes = True
                    for key in old_vfs:
                        if key == "$timestamp":
                            continue
                        if not key in vfs:
                            break
                        elif vfs[key][1] != old_vfs[key][1]:
                            break
                    else: # no break
                        changes = False

            if not changes:
                print("No change: brython_modules.js not updated")
                return

        with open(path, "w", encoding="utf-8") as out:
            # Add VFS_timestamp ; used to test if the indexedDB must be
            # refreshed
            out.write("__BRYTHON__.VFS_timestamp = {}".format(
                int(1000 * time.time())))
            # if run outside a Web Worker, the script sets the attribute
            # __BRYTHON__.brython_modules to the path of brython_modules.js,
            # so that it is imported by libs/_webworker.js instead of
            # brython_stdlib.js (cf. issue #1964)
            out.write(
                "\nif(typeof document !== 'undefined'){\n"
                "    __BRYTHON__.brython_modules = "
                "$B.last(document.getElementsByTagName('script')).src\n"
                "}")
            out.write("\n__BRYTHON__.use_VFS = true\nvar scripts = ")
            json.dump(vfs, out)
            out.write("\n__BRYTHON__.update_VFS(scripts)")


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
                parts = path[len(os.getcwd()) + 1:].split(os.sep)
                files.append("os.path.join(" +
                             ", ".join(repr(part) for part in parts) +")")
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

        info["files"] = ',\n'.join(files)

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
def parse_stdlib(stdlib_dir, js_name='brython_stdlib.js'):
    path = os.path.join(stdlib_dir, js_name)
    with open(path, encoding="utf-8") as fobj:
        modules = fobj.read()
        modules = modules[modules.find('{'):
                          modules.find('__BRYTHON__.update_VFS(')]
        stdlib = json.loads(modules)

    return stdlib


def load_stdlib_sitepackages():
    """
    Search brython_stdlib.js, and load it
    Load site-packages from the current directory
    :return:

    """
    stdlib_dir = None
    for dirname, dirnames, filenames in os.walk(os.getcwd()):
        for filename in filenames:
            if filename == "brython_stdlib.js":
                stdlib_dir = dirname
                stdlib = parse_stdlib(stdlib_dir)
                break

    if not stdlib_dir:
        raise FileNotFoundError("Could not find brython_stdlib.js in this"
                                " directory or below")

    # search in site-packages
    sp_dir = os.path.join(stdlib_dir, "Lib", "site-packages")
    if os.path.exists(sp_dir):
        print("search in site-packages...")
        mf = ModulesFinder()
        for dirpath, dirnames, filenames in os.walk(sp_dir):
            if dirpath.endswith("__pycache__"):
                continue
            package = dirpath[len(sp_dir) + 1:]
            for filename in filenames:
                if not filename.endswith(".py"):
                    continue
                fullpath = os.path.join(dirpath, filename)
                #print(fullpath)
                is_package = False
                if not package:
                    # file in site-packages
                    module = os.path.splitext(filename)[0]
                else:
                    elts = package.split(os.sep)
                    is_package = filename == "__init__.py"
                    if not is_package:
                        elts.append(os.path.splitext(filename)[0])
                    module = ".".join(elts)
                with open(fullpath, encoding="utf-8") as f:
                    src = f.read()
                #imports = mf.get_imports(src)
                stdlib[module] = [".py", src, None]
                if is_package:
                    stdlib[module].append(1)

    return stdlib_dir, stdlib

packages = {os.getcwd(), os.getcwd() + '/Lib/site-packages'}

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
        if current in packages:
            packages.add(folder)
            return True


def load_user_modules(module_dir=os.getcwd()):
    user_modules = {}
    for dirname, dirnames, filenames in os.walk(module_dir):
        for filename in filenames:
            name, ext = os.path.splitext(filename)
            if not ext == ".py" or filename == "list_modules.py":
                continue
            if dirname == os.getcwd():
                # modules in the same directory
                path = os.path.join(dirname, filename)
                with open(path, encoding="utf-8") as fobj:
                    try:
                        src = fobj.read()
                    except:
                        logger.error("Unable to read %s", path)
                mf = ModulesFinder(dirname)
                imports = sorted(list(mf.get_imports(src)))
                user_modules[name] = [ext, src, imports]
            elif is_package(dirname):
                # modules in packages below current directory
                path = os.path.join(dirname, filename)
                package = dirname[len(os.getcwd()) + 1:].replace(os.sep, '.')
                if package.startswith('Lib.site-packages.'):
                    package = package[len('Lib.site-packages.'):]
                if filename == "__init__.py":
                    module_name = package
                else:
                    module_name = "{}.{}".format(package, name)
                with open(path, encoding="utf-8") as fobj:
                    src = fobj.read()
                #mf = ModulesFinder(dirname)
                #imports = mf.get_imports(src, package or None)
                #imports = sorted(list(imports))
                user_modules[module_name] = [ext, src, None]
                if module_name == package:
                    user_modules[module_name].append(1)

    return user_modules


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
                if key == 'type' and value in ("text/python", "text/python3"):
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
    # print(sorted(list(finder.modules)))


