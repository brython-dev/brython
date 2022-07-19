import simple

assert simple.__doc__ == "Documentation string of module simple.", simple.__doc__

class Simple2:

    def __init__(self):
        self.info = "SimpleClass2"

class Simple3(simple.Simple):

    def __init__(self):
        simple.Simple.__init__(self)

text = "text in simple"

assert simple.text == text

_s = simple.Simple()
_s3 = Simple3()
assert _s.info == _s3.info

import recursive_import
_s = recursive_import.myClass()

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

# issue 768
import modtest

# issue 1261
import colorsys
colorsys.ONE_THIRD # no AttributeError

from colorsys import *
try:
    ONE_THIRD
    raise Exception("should have raised NameError")
except NameError:
    pass

# use "__getattr__" and "__dir__" at module level (PEP 562)
assert simple.strange == "a strange name"
assert set(dir(simple)) == {"Simple", "text", "strange", "unknown"}, dir(simple)

# issue 1483
# search in site-packages, but only if the script is served at the right
# location compared to the Brython engine
brython_loc = __BRYTHON__.brython_path.split('//')[1].split('/')
script_loc = __BRYTHON__.script_path.split('//')[1].split('/')
if script_loc[0] == brython_loc[0]:
    from foobar import *
    assert str(Foo()) == "foo"

import import_bug

print('passed all tests')
