import simple

class Simple2:
    def __init__(self):
        self.info = "SimpleClass2"

class Simple3(simple.Simple):
  def __init__(self):
      simple.Simple.__init__(self)

text = "text in simple"

assert simple.text == text

_s=simple.Simple()
_s3=Simple3()
assert _s.info==_s3.info

import recursive_import
_s=recursive_import.myClass()

assert str(_s) == "success!"

import from_import_test.b
assert from_import_test.b.v == 1

import from_import_test.c
assert from_import_test.c.v == 1

# test of keyword "global" in functions of an imported module
import global_in_imported
assert global_in_imported.X == 15

from delegator import Delegator
delegate = Delegator([])

# test VFS path entry finder and from <module> import *
import sys
# Ensure that VFS path finder is installed
from _importlib import VFSPathFinder
if VFSPathFinder not in sys.path_hooks:
    sys.path_hooks.insert(0, VFSPathFinder)
    print('WARNING: VFS path hook installed')
else:
    print('INFO: VFS path finder already installed')

print('Testing VFS for .py files')

# Add VFS file URL at the beginning of import search path
vfs_url = __BRYTHON__.brython_path + '../tests/test.vfs.js'
sys.path.insert(0, vfs_url)

from hello import *

assert get_hello() == 'Hello from py'
assert world.get_world() == 'py world'

import foo
assert foo.get_foo() == 'foo from py'
assert foo.get_bar() == 'bar from py'

# Assertions for issue #7
import test_issue7 # brythontest2 in #7 => test_issue7
test_issue7.xxx = 123
assert test_issue7.xxx == 123
assert test_issue7.yyy() == 246

# Repeat tests for .pyc VFS file
print('Testing VFS for .pyc files')

# Override VFS entry in sys.path
vfs_pyc_url = __BRYTHON__.brython_path + '../tests/test_pyc.vfs.js'
sys.path[0] = vfs_pyc_url

from hello_pyc import *

assert get_hello() == 'Hello from pyc'
assert world.get_world() == 'pyc world'

import foo_pyc
assert foo_pyc.get_foo() == 'foo from pyc'
assert foo_pyc.get_bar() == 'bar from pyc'

# Assertions for issue #7
import test_issue7_pyc # brythontest2 in #7 => test_issue7_pyc
test_issue7_pyc.xxx = 123
assert test_issue7_pyc.xxx == 123
assert test_issue7_pyc.yyy() == 369


# Repeat tests for .pyc.js files deployed at a given path
print('Testing deployment of .pyc.js files')

# Install in sys.path the folder containing compiled py modules
pyc_path = __BRYTHON__.brython_path + '../tests/pycache'
sys.path[0] = pyc_path

# Optimize module imports
# i.e only send AJAX requests for .pyc.js files when processing this path
from _importlib import optimize_import_for_path
optimize_import_for_path(pyc_path, 'pyc.js')

try:
    from hello_pyc2 import *

    assert get_hello() == 'Hello from pyc2'
    assert world.get_world() == 'pyc2 world'

    import foo_pyc2
    assert foo_pyc2.get_foo() == 'foo from pyc2'
    assert foo_pyc2.get_bar() == 'bar from pyc2'

    # Assertions for issue #7
    import test_issue7_pyc2 # brythontest2 in #7 => test_issue7_pyc2
    test_issue7_pyc2.xxx = 123
    assert test_issue7_pyc2.xxx == 123
    assert test_issue7_pyc2.yyy() == 120
finally:
    # Ensure that this path will not affect subsequent import
    sys.path.remove(pyc_path);

# Test setting sys.path using link tags
from browser import doc

l = doc.location
none_path = doc['link_none1'].href + '/'
assert __BRYTHON__.path_importer_cache[none_path] is None
none_path = doc['link_none2'].href + '/'
assert __BRYTHON__.path_importer_cache[none_path] is None

empty_vfs_url = doc['link_empty_vfs'].href + '/'
assert __BRYTHON__.path_importer_cache[empty_vfs_url].vfs is not None

# issue 768
import modtest

print('passed all tests')

