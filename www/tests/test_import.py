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
vfs_path = __BRYTHON__.script_dir + '/test.vfs.js'
sys.path.insert(0, vfs_path)

from hello import *
assert get_hello() == 'Hello'
assert world.get_world() == 'world'

import foo
assert foo.get_foo() == 'foo'
assert foo.get_bar() == 'bar'

print('passed all tests')

