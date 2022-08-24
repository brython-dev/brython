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


print("passed all tests...")