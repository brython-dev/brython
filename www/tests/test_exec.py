from tester import assert_raises

# issues 62, 63 and 64
import test_sp

s = 'a = 3'
exec(s, test_sp.__dict__)
assert test_sp.a == 3
del test_sp.__dict__['a']
try:
    test_sp.a
    raise ValueError('should have raised AttributeError')
except AttributeError:
    pass
except:
    raise ValueError('should have raised AttributeError')

# issue 183
x = 4
cd = dict(globals())
cd.update(locals())
exec("x = x + 4", cd)

assert x == 4
assert cd['x'] == 8

y = 5
yd = dict(globals())
yd.update(locals())
co = compile("y = y + 4", "", "exec")
exec(co, yd)

assert yd['y'] == 9
assert y == 5

# issue 533
err = """def f():
    x = yaz
f()"""
assert_raises(NameError, exec, err)

# issue 686
s = "message = 5"
t = {}
exec(s, t)
assert 'message' in t
exec('x = message', t)
assert 'x' in t
assert t['x'] == 5

# issue 690
t = {}
exec("""def f():
    global x
    x = 3
""", t)
exec("f()", t)
assert t['x'] == 3

# issue 748
y = 42
g = {'x':0}
assert_raises(NameError, exec, 'print(y)', g)

# globals and locals
glob = {"y": 9}
loc = {"x": 2}
exec("z = y", glob, loc)
assert loc["z"] == 9
exec("z = x", glob, loc)
assert loc["z"] == 2

exec("z = y", glob)
assert glob["z"] == 9

# issue 894
def f():
    assert 'foo' in g

g = {'f': f}

exec('def foo(): pass\nf()', g)

# scope
az = 0

def f():
    exec("az")

f()
exec('def foo(): pass\nf()', g)

# issue 969
def test():
    x = 3
    y = eval('x+3')
    assert y == 6

test()

# issue 970
assert_raises(SyntaxError, exec, "\\",
              msg='unexpected EOF while parsing')

assert_raises(SyntaxError, exec, '\\\\',
              msg='unexpected character after line continuation character')

# issue 1188
assert_raises(NameError, exec, "x.foo()\nx=3", {}, {})

# issue 1223
eval("[x for x in range(3)]")

# issue 1244
var = 'hi'
# bug 1 -- this assert statement should pass but doesn't
assert 'var' in globals()

g = {}

exec('''
var = 123
def f():
    return(var)
''', g)

# this assert passes, which is good
assert 'var' in g

# bug 2 -- var is undefined when f is called
assert g['f']() == 123

# issue 1597 (locals can be any mapping type)
import collections

x = eval("a", {}, collections.defaultdict(list))
assert x == []

y = eval("a", {}, collections.defaultdict(list, a=1))
assert y == 1

z = eval("a", {}, collections.UserDict(a=2))
assert z == 2

# issue 1808
class A: pass
assert_raises(TypeError, exec, A(),
              msg='exec() arg 1 must be a string, ' \
                  'bytes or code object')

# issue 1852
code = '''
a = 0
raise Exception()
'''

g = dict()
try:
    exec(code, g)
except:
    pass
assert g['a'] == 0

# issue 1972
import sys
try:
    exec('''x1972 = 1
print(y1972)
''')
    raise Exception('should have raised NameError')
except NameError as exc:
    tb = sys.exc_info()[2]
    linenos = []
    while tb is not None:
        linenos.append(tb.tb_frame.f_lineno)
        tb = tb.tb_next
    linenos[-1] == 2

# issue 1987
compile('def aa():pass', 'aa.py', 'exec')

# issue 1998
def click():
    exec(("""
try:
    from a import A as B
except:
    pass
assert B == 6
    """))
    # exec() does not modify function locals
    assert_raises(NameError, eval, 'B')

click()

# explicit locals
ns1 = {}
ns2 = {'x': 0}

exec("assert locals()['x'] == 0", ns1, ns2)

# issue 2131
assert eval("True and True") is True

x = 10
y = 60
assert eval('x < 100 and True and y < 100') is True

# in Python 3.13 locals and globals can be passed as keywords
locs = {'x': 'hello'}
globs = {'x': 'coucou'}
exec("y = x", locals=locs, globals=globs)
assert locs['y'] == 'hello'

# set __name__
t = []
exec("""
t.append(__name__)
""")
assert t == [__name__]

ns = {'__name__': 'exec', 't': []}
exec("""
t.append(__name__)
""", ns)
assert ns['t'] == ['exec']

# issue 3019: "from module import name" in code compiled with compile()
# and then run with exec() raised a Javascript TypeError
_ex = {}
exec(compile("from math import sqrt", "<string>", "exec"), _ex)
assert _ex['sqrt'](9) == 3

# same with an alias
_ex = {}
exec(compile("from math import sqrt as sq", "<string>", "exec"), _ex)
assert _ex['sq'](9) == 3

# same with "from module import *"
_ex = {}
exec(compile("from math import *", "<string>", "exec"), _ex)
assert _ex['sqrt'](9) == 3

# same with a relative import (module is None in the ast)
try:
    exec(compile("from . import x", "<string>", "exec"), {})
except ImportError:
    pass

# issue 3020: several constructs in code compiled with compile() and then
# run with exec() generated invalid Javascript, because optional AST fields
# were Python None instead of undefined

# assert without message
exec(compile("assert True", "<string>", "exec"), {})

# raise with an exception
try:
    exec(compile("raise RuntimeError('MyError')", "<string>", "exec"), {})
except RuntimeError as exc:
    assert str(exc) == 'MyError'
else:
    raise AssertionError('raise was not executed')

# bare raise in an except block
try:
    exec(compile(
        "try:\n"
        "    raise ValueError('x')\n"
        "except ValueError:\n"
        "    raise\n", "<string>", "exec"), {})
except ValueError:
    pass
else:
    raise AssertionError('bare raise was not executed')

# except with a name
exec(compile(
    "try:\n"
    "    raise ValueError('x')\n"
    "except ValueError as exc:\n"
    "    assert str(exc) == 'x'\n", "<string>", "exec"), {})

# raise ... from ...
try:
    exec(compile("raise RuntimeError('e') from ValueError('c')",
                 "<string>", "exec"), {})
except RuntimeError as exc:
    assert isinstance(exc.__cause__, ValueError)
else:
    raise AssertionError('raise from was not executed')

# return / yield without a value
_ns = {}
exec(compile("def f():\n"
             "    return\n"
             "def g():\n"
             "    return 1\n"
             "def gen():\n"
             "    yield\n", "<string>", "exec"), _ns)
assert _ns['f']() is None
assert _ns['g']() == 1
assert list(_ns['gen']()) == [None]

# slices with optional bounds
_ns = {'x': [1, 2, 3, 4]}
exec(compile("a = x[1:]\n"
             "b = x[:2]\n"
             "c = x[::2]\n"
             "d = x[1:3:1]\n", "<string>", "exec"), _ns)
assert _ns['a'] == [2, 3, 4]
assert _ns['b'] == [1, 2]
assert _ns['c'] == [1, 3]
assert _ns['d'] == [2, 3]

# with statement, with and without "as"
_ns = {}
exec(compile("class C:\n"
             "    def __enter__(self):\n"
             "        return 42\n"
             "    def __exit__(self, *args):\n"
             "        pass\n"
             "with C():\n"
             "    pass\n"
             "with C() as v:\n"
             "    r = v\n", "<string>", "exec"), _ns)
assert _ns['r'] == 42

# f-string without format spec
assert eval(compile("f'{1 + 1}'", "<string>", "eval"), {}) == '2'

# keyword unpacking
_ns = {}
exec(compile("def f(**kw):\n"
             "    return kw\n"
             "r = f(**{'a': 1})\n", "<string>", "exec"), _ns)
assert _ns['r'] == {'a': 1}

# match: mapping rest, sequence star, wildcard
_ns = {}
exec(compile("def f(x):\n"
             "    match x:\n"
             "        case {'a': 1, **rest}:\n"
             "            return rest\n"
             "        case [1, *rest]:\n"
             "            return rest\n"
             "        case _:\n"
             "            return None\n", "<string>", "exec"), _ns)
assert _ns['f']({'a': 1, 'b': 2}) == {'b': 2}
assert _ns['f']([1, 2, 3]) == [2, 3]
assert _ns['f']('other') is None

print("passed all tests...")