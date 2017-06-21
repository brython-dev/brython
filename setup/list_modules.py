"""Detect all Python scripts in HTML pages in current folder and subfolders.
"""

import os
import html.parser
import ast
import json

# Get all modules in the Brython standard distribution.
# They must be in brython_stdlib.js somewhere in the current directory
# or below.
stdlib = {}
for dirname, dirnames, filenames in os.walk(os.getcwd()):
    for filename in filenames:
        if filename == "brython_stdlib.js":
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
    Use set packages() to cache results.
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

for dirname, dirnames, filenames in os.walk(os.getcwd()):
    for filename in filenames:
        name, ext = os.path.splitext(filename)
        if not ext == ".py":
            continue
        if dirname == os.getcwd():
            # modules in the same directory
            path = os.path.join(dirname, filename)
            with open(path, encoding="utf-8") as fobj:
                user_modules[name] = [ext, fobj.read()]
        elif is_package(dirname):
            # modules in packages below current directory
            path = os.path.join(dirname, filename)
            package = dirname[len(os.getcwd()) + 1:].replace(os.sep, '.')
            if filename == "__init__.py":
                module_name = package
            else:
                module_name = "{}.{}".format(package, name)
            with open(path, encoding="utf-8") as fobj:
                user_modules[module_name] = [ext, fobj.read()]
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
    
class Parser(html.parser.HTMLParser):
    """Used to extract all Brython scripts in HTML pages."""

    def __init__(self, path, **kw):
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
                        print('start of vfs tag', self.getpos())
                        self.vfs = True
                        self.has_vfs = True
                        self.attrs = attrs
                        self.start = self.getpos()
                        return
        self.vfs = False

    def handle_endtag(self, tag):
        if tag.lower() == "script" and self.vfs:
            print('end of vfs tag', self.getpos())
            self.end = self.getpos()

class Visitor(ast.NodeVisitor):
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
        package = self.package.split('.')
        for _ in range(node.level - 1):
            package.pop()
        package = '.'.join(package)
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
        visitor = Visitor(package=package)
        visitor.visit(tree)
        for module in visitor.imports:
            if module in self.modules:
                continue
            for module_dict in [stdlib, user_modules]:
                if module in module_dict:
                    self.modules.add(module)
                    if module_dict[module][0] == '.py':
                        imports = self.get_imports(module_dict[module][1])
    
        return visitor.imports
    
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
        for dirname, dirnames, filenames in os.walk(self.directory):
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
                    parser = Parser(dirname)
                    with open(path, encoding=charset_detector.encoding) as fobj:
                        parser.feed(fobj.read())
                    for script in parser.scripts:
                        script = self.norm_indent(script)
                        try:
                            self.get_imports(script)
                        except SyntaxError:
                            print('syntax error')
                            print(script)
                elif ext.lower() == '.py':
                    if dirname != self.directory and not is_package(dirname):
                        continue
                    # get package name
                    package = dirname[len(self.directory) + 1:] or None
                    with open(path, encoding="utf-8") as fobj:
                        try:
                            self.get_imports(fobj.read(), package)
                        except SyntaxError:
                            print('syntax error', path)

    def make_brython_modules(self):        
        # build a Virtual File System (VFS)
        vfs = {}
        for module in self.modules:
            if module in stdlib:
                vfs[module] = stdlib[module]
            else:
                vfs[module] = user_modules[module]
        
        # save in brython_modules.js
        with open("brython_modules.js", "w", encoding="utf-8") as out:
            out.write("__BRYTHON__.use_VFS = true\n__BRYTHON__.VFS = ")
            json.dump(vfs, out)

    def make_setup(self):
        """Make the setup script for the application."""
        # get all HTML files
        html_files = []
        for dirname, dirnames, filenames in os.walk(self.directory):
            for filename in filenames:
                if os.path.splitext(filename)[1] == '.html':
                    print(301, dirname, filename)
                    path = os.path.join(dirname, filename)
                    # detect charset
                    charset_detector = CharsetDetector()
                    with open(path, encoding="iso-8859-1") as fobj:
                        charset_detector.feed(fobj.read())
                    
                    # get text/python scripts
                    parser = VFSReplacementParser(dirname)
                    with open(path, encoding=charset_detector.encoding) as fobj:
                        parser.feed(fobj.read())
                    if not parser.has_vfs:
                        continue
                    with open(path, encoding=charset_detector.encoding) as fobj:
                        lines = fobj.readlines()
                        start_line, start_pos = parser.start
                        end_line, end_pos = parser.end
                        res = ''.join(lines[:start_line - 1])
                        for num in range(start_line - 1, end_line):
                            res += lines[num].replace("brython_stdlib.js",
                                "brython_modules.js")
                        res += ''.join(lines[end_line:])
                        print(res[-500:])
                            

if __name__ == "__main__":
    ModulesFinder().make_setup()