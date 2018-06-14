
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
exec("x = x + 4",cd)

assert x == 4
assert cd['x'] == 8

y = 5
yd = dict(globals())
yd.update(locals())
co=compile("y = y + 4", "", "exec")
exec(co, yd)

assert yd['y'] == 9
assert y == 5

# issue 533
err = """def f():
    x = yaz
f()"""
try:
    exec(err)
except NameError:
    pass

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
g = { 'x':0 }
try:
    exec('print(y)', g)
    raise Exception("should have raised NameError")
except NameError:
    pass

# globals and locals
glob = {"y": 9}
loc = {"x": 2}
exec("z = y", glob, loc)
assert loc["z"] == 9
exec("z = x", glob, loc)
assert loc["z"] == 2

exec("z = y", glob)
assert glob["z"] == 9
