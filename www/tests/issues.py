from tester import assertRaises

# issue 5
assert(isinstance(__debug__, bool))

# issue #6 : unknown encoding: windows-1250
s = "Dziś jeść ryby"
b = s.encode('windows-1250')
assert b == b'Dzi\x9c je\x9c\xe6 ryby'
assert b.decode('windows-1250') == "Dziś jeść ryby"

# issue #7 : attribute set on module is not available from inside the module
import inject_name_in_module
inject_name_in_module.xxx = 123
assert inject_name_in_module.xxx == 123
# XXX temporarily comment next line
#assert inject_name_in_module.yyy() == 246

# issue #15 in PierreQuentel/brython
class a(object):
    def __init__(self):
        self.x = 9

a.__init__

class b(a):

    def __init__(s):
        super().__init__()
        assert s.x == 9

z = b()

# issue 12
x = {'a': 1}
assert 'a' in x

class ToDir:

    def init(self):
        pass

instanceToDir = ToDir()

dictToDir = ({k: getattr(instanceToDir, k)
    for k in dir(instanceToDir) if '__' not in k})

castdictToDir={str(k): getattr(instanceToDir, k)
    for k in dir(instanceToDir) if '__' not in k}

assert 'init' in castdictToDir, \
    'init not in castdictToDir: %s' % list(dictToDir.keys())
assert castdictToDir["init"] == instanceToDir.init , \
    'init not init method: %s' % castdictToDir["init"]
assert 'init' in dictToDir, \
    'init not in dictToDir: %s' % list(dictToDir.keys())
assert dictToDir["init"] == instanceToDir.init , \
    'init not init method: %s' % dictToDir["init"]

# issue 32
assert 5 < 10 < 5 * 10 < 100

# issue 16 : isolate Python Namespacing
i = 5
def foo():
    def bar():
        return i
    res = []
    for i in range(5):
        res.append(bar())
    return res
assert foo() == [0, 1, 2, 3, 4]

# issue 82 : Ellipsis literal (...) missing
def f():
    ...

# issue 83
import sys
assert sys.version_info > (3, 0, 0)
assert sys.version_info >= (3, 0, 0)

assert not sys.version_info == (3, 0, 0)
assert sys.version_info != (3, 0, 0)

assert not sys.version_info < (3, 0, 0)
assert not sys.version_info <= (3, 0, 0)

# issue #100
class A:

    if True:
        def aaa(self, x):
            return x

class B(A):

    if True:
        def aaa(self, x):
            return super().aaa(x)

b = B()
assert b.aaa(0) == 0

# issue 108
def funcattrs(**kwds):
    def decorate(func):
        func.__dict__.update(kwds)
        return func
    return decorate

class C(object):
    @funcattrs(abc=1, xyz="haha")
    @funcattrs(booh=42)
    def foo(self):
        return 42

assert C().foo() == 42
assert C.foo.abc == 1
assert C.foo.xyz == "haha"
assert C.foo.booh == 42

# issue 118
class A:

    def toString(self):
        return "whatever"

assert A().toString() == "whatever"

# issue 126
class MyType(type):

    def __getattr__(cls, attr):
        return "whatever"

class MyParent(metaclass=MyType):
    pass

class MyClass(MyParent):
    pass

assert MyClass.spam == "whatever"
assert MyParent.spam == "whatever"

# issue 121
def recur(change_namespace=0):
    if change_namespace:
        x = 2
        return
    else:
        x = 1
    def nested():
        return x
    recur(change_namespace=1)
    return nested()

assert recur() == 1

#issue 131
import time

target = time.struct_time([1970, 1, 1, 0, 0, 0, 3, 1, 0])
assert time.gmtime(0).args == target.args
target = time.struct_time([1970, 1, 1, 0, 1, 40, 3, 1, 0])
assert time.gmtime(100).args == target.args
target = time.struct_time([2001, 9, 9, 1, 46, 40, 6, 252, 0])
assert time.gmtime(1000000000).args == target.args

try:
    time.asctime(1)
except TypeError:
    pass
except:
    ValueError("Should have raised TypeError")
try:
    time.asctime((1, 2, 3, 4))
except TypeError:
    pass
except:
    ValueError("Should have raised TypeError")
assert time.asctime(time.gmtime(0)) == 'Thu Jan  1 00:00:00 1970'
tup = tuple(time.gmtime(0).args)
assert time.asctime(tup) == 'Thu Jan  1 00:00:00 1970'

# issue 137
codeobj = compile("3 + 4", "<example>", "eval")
assert eval(codeobj) == 7

x = 7
codeobj = compile("x + 4", "<example>", "eval")
assert eval(codeobj) == 11

# issue 154
class MyMetaClass(type):

    def __str__(cls):
        return "Hello"

class MyClass(metaclass=MyMetaClass):
    pass

assert str(MyClass) == "Hello"

# issue 155
class MyMetaClass(type):
    pass

class MyClass(metaclass=MyMetaClass):
    pass

MyOtherClass = MyMetaClass("DirectlyCreatedClass", (), {})

assert isinstance(MyClass, MyMetaClass), type(MyClass)
assert isinstance(MyOtherClass, MyMetaClass), type(MyOtherClass)

# traceback objects
import types

try:
    raise ValueError
except ValueError:
    tb = sys.exc_info()[2]
    assert isinstance(tb, types.TracebackType)

# repr of type(None)
assert repr(type(None)) == "<class 'NoneType'>"

# nonlocal
def f():
    def g():
        nonlocal t
        return t
    t = 1
    return g

assert f()() == 1

def f():
    k = 1
    def g():
        def r():
            nonlocal k
            return k + 1
        return r()
    return g()

assert f() == 2

# setting __class__
class A:pass
class B:
    x = 1

a = A()
assert not hasattr(a, 'x')
a.__class__ = B
assert a.x == 1

# hashable objects
class X:

    def __hash__(self):
        return hash(1.0)

    def __eq__(self, other):
        return other == 1

a = {1: 'a', X(): 'b'}
assert a == {1: 'b'}
assert X() in a
assert a[X()] == 'b'

class X:

    def __hash__(self):
        return hash('u')

a = {'u': 'a', X(): 'b'}
assert set(a.values()) == {'a', 'b'}
assert not X() in a

b = {'u': 'a'}
assert not X() in b

class X:

    def __hash__(self):
        return hash('u')

    def __eq__(self, other):
        return other == 'u'

a = {'u': 'a', X(): 'b'}
assert a == {'u': 'b'}
assert X() in a
assert a[X()] == 'b'

# issue 176
x = [1, 2, 3]
assert sum(-y for y in x) == -6

# issue 186
source = [0, 1, 2, 3]
total = sum(source.pop() for _ in range(len(source)))
assert total == 6, "expected 6 but instead was %d" % total

# issue 177
ModuleType = type(sys)
foo = ModuleType("foo", "foodoc")
assert foo.__name__ == "foo"
assert foo.__doc__ == "foodoc"

# issue 203
def f(z):
    z += 1
    return z

x = 1.0
assert x != f(x)

# issue 207
for x in range(0x7ffffff0, 0x8000000f):
    assert x & x == x, "%s & %s == %s" % (hex(x), hex(x), hex(x & x))
    assert x | x == x, "%s | %s == %s" % (hex(x), hex(x), hex(x | x))

for x in range(0x17ffffff0, 0x17fffffff):
    assert x & x == x, "%s & %s == %s" % (hex(x), hex(x), hex(x & x))
    assert x | x == x, "%s | %s == %s" % (hex(x), hex(x), hex(x | x))

# issue 208
a = 5
assert globals().get('a')  == 5

# not an official issue
class Cmp:
    def __init__(self,arg):
        self.arg = arg

    def __repr__(self):
        return '<Cmp %s>' % self.arg

    def __eq__(self, other):
        return self.arg == other

a = Cmp(1)
b = Cmp(1)

assert a == b
assert not (a != b)


# bug with property setter
class Test:

    @property
    def clicked(self):
        return self.func

    @clicked.setter
    def clicked(self, callback):
        self.func = callback

t = Test()
t.clicked = lambda x: x+7 #"clicked"
assert t.clicked(7) == 14

# issue 249
x = [a.strip() for a in [
  " foo ",
  " bar ",
]]
assert x == ['foo', 'bar']

# issue 250
assert 2 ** 3 ** 4 == 2417851639229258349412352

# issue 258
a = [1, 2, 3]
b, *c = a
assert c == [2, 3]

# issue 261 (__slots__)
class A:
    __slots__ = 'x',

A.x
a = A()
a.x = 9
assert a.x == 9
try:
    a.y = 0
except AttributeError:
    pass
except:
    raise

# issue 274
import base64
b = bytearray(b'<Z\x00N')
b64 = base64.b64encode( b )
assert b64 == b'PFoATg=='

buf = bytearray(b'EZ\x86\xdd\xabN\x86\xdd\xabNE[\x86\xdd\xabN\x86\xdd\xabN')
b64 = base64.b64encode( buf )
assert b64 == b'RVqG3atOht2rTkVbht2rTobdq04='

# issue 279
x = 0

if False:
    x += 2
    x += 3

for n in range(2):
    x += 1
    x += 1

assert x == 4

# issue 280
for n in range(5):
    pass

assert n == 4

#issue 297
assert type((1,) * 2) == tuple

t = 1, 2
try:
    t[0] = 1
    raise Exception('should have raised AttributeError')
except AttributeError:
    pass

# issue 298
n = 1
for n in range(n):
    pass
assert n == 0

# issue 301
t = 1, 2
assertRaises(AttributeError, getattr, t, "__setitem__")

# issue 307
x = 1
assertRaises(AttributeError, setattr, x, '__add__', 1)
assertRaises(AttributeError, setattr, x, 'y', 1)

# issue 310
assert 4 in range(5)
assert 4 in range(0, 5, 2)
assert not 1 in range(0, 5, 2)

assert 1 in range(10, 0, -1)
assert 10 in range(10, 0, -1)
assert not 1 in range(10, 0, -2)
assert not 0 in range(10, 0, -2)

# issue 316
class Test():

    def __pos__(self):
        return 'plus'

    def __neg__(self):
        return 'minus'

    def __invert__(self):
        return 'invert'


a = Test()
assert +a == 'plus'
assert -a == 'minus'
assert ~a == 'invert'

for x in 1, 1.2, 1 + 2j, 2 ** 54:
    assert +x == x

assert -True == -1

# issue 317
assert eval("-1") == -1

# issue 322
a = 0000
b = int(00)
c = 000 + 1
d = 0000 * 10
assert a == 0
assert b == 0
assert c == 1
assert d == 0

# unpacking in target list
for a, *b in [[1, 2, 3]]:
    assert a == 1
    assert b == [2, 3]

# issue 327
def f():
    a += 1

assertRaises(UnboundLocalError, f)

def f():
    a = a + 1

assertRaises(UnboundLocalError, f)

a = 3

def plus():
    print(a)
    a = 7

assertRaises(UnboundLocalError, plus)

def plus():
    global axd
    print(axd)

assertRaises(NameError, plus)

def f():
    for i in 1, 2:
        if i == 2:
            x = a
        else:
            a = 1
    return x

assert f() == 1

def f():
    for i in 1, 2:
        if i == 2:
            a += 1
        else:
            a = 1
    return a

assert f() == 2

# issue 335
def f():
    "hello"("3")

assertRaises(TypeError, f)

# issue 342
try:
    from .spam import eggs
except SystemError as ie:
    assert str(ie) == \
        "Parent module '' not loaded, cannot perform relative import"

# issue 343
a76gf = 0

def f():
    a76gf = 1
    def g():
        nonlocal a76gf
        a76gf = a76gf + 1
        return a76gf
    assert g() == 2
f()

# issue 344
def f():
    a2fx = 1
    def g():
        nonlocal a2fx
        a2fx = 2
    g()
    assert a2fx == 2
f()

# issue 347
from abc import ABCMeta, abstractmethod

class interface(metaclass=ABCMeta):

    @abstractmethod
    def test(self):
        return


class implementation(interface):

    def test(self):
        return


i = implementation()

assert isinstance(i, implementation)
assert isinstance(i, interface)

# classes with abstract methods can't be instanciated
class A(metaclass=ABCMeta):
    @abstractmethod
    def foo(self): pass

assertRaises(TypeError, A)

# same for subclasses
class B(A):
    pass

assertRaises(TypeError, B)

# class C overrides foo so it has no abstract method, it can have instances
class C(A):

    def foo(self):
        return 42

assert C().foo() == 42

# issue 348
x, y = y, x = 2, 3
assert x, y == (3, 2)

# issue 355
class kk:

    def __init__(self, enum):
        pass


lambda enum: enum

def foo(enum): pass

# issue 360
assert "André".isidentifier()

# issue 363
a = float('nan')
b = 1
c = a - b

# issue 371
assert (not 'x' in ['x', 'y'] and 2 == 1) == False

# issue 375
def f():
    "test" %3

assertRaises(TypeError, f)

# issues 387 and 388
class A():
    pass

class B():
    pass

a1 = A()
a2 = A()

assert hash(A) != hash(B)
assert hash(A) != hash(a1)
assert hash(A) != hash(a2)

class A():
    pass

class B():
    pass

d = {A: "class A"}

def test():
    d[B]

assertRaises(KeyError, test)

# issue 389
gen = (n * n for n in range(10))
assert list(gen) == [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
assert list(gen) == []

# issue 391
def f():
    ["a"] + 5

assertRaises(TypeError, f)

# sum with booleans
assert sum([True, False]) == 1
assert 1.2 + True == 2.2

# issue #392
class A:

  def __init__(self):
    self.b = [1 for n in range(10)]
    self.b[3] = 0


eval = A()

assert [c for c in range(10) if eval.b[c] == 0] == [3]

# restore original "eval"
eval = __builtins__.eval

# issue 394
import base64
b = b"\x7F\x7B\xED\x96"
b64 = base64.b64encode(b)
assert b64 == b"f3vtlg=="
newb = base64.b64decode(b64)
assert newb == b

e = base64.b64encode(b'data to encode')
assert e == b"ZGF0YSB0byBlbmNvZGU="
assert base64.b64decode(e, validate=True) == b'data to encode'

# issue 412
assert not True and not False or True
assert False and not False or True
assert False and not False or not False
assert False and not True or True
assert False and not True or not False
assert not True and not True or True
assert not True and not True or not False
assert not True and not False or True
assert not True and not False or not False

# set attribute __doc__ of a function
def test():
    """original text"""
    pass

assert test.__doc__ == """original text"""
test.__doc__ = "new text"
assert test.__doc__ == "new text"

# issue 443
class Pepe:

    def __getitem__(self, arg):
        return arg


pepe = Pepe()

assert pepe[0:1] == slice(0, 1)

assert pepe[1, 0, 0:10:2] == (1, 0, slice(0, 10, 2))
assert pepe[0, 0:10:1] == (0, slice(0, 10, 1))
assert pepe[0, 0] == (0, 0)
assert pepe[0, :] == (0, slice(None, None, None))
assert pepe[0, 1, 1, 1, 2, 3, 4, :] == \
    (0, 1, 1, 1, 2, 3, 4, slice(None, None, None))

# issue 448
d = {0 : [1]}
d[0] += [2]
assert d == {0: [1, 2]}

# issue 449
a = [[1]]
a[0] += [2]
assert a == [[1, 2]]

# issue 450
assert True == True
assert True != False
assert False == False
assert not (True == None)
assert True != None

# issue 451
import copy
assert copy.copy({1}) == {1}
assert copy.copy({1: 2}) == {1: 2}

# issue 465
class A:

    def __init__(self, value):
        self.value = value

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def __str__(self):
        return str(self.value)


a = A(1)
with a as x:
    assert str(x) == "1"

with A(2) as x:
    assert str(x) == "2"

with A(3):
    pass

# ternary is an expression
a = eval('1 if 3 == 4 else 0')
assert a == 0

# issue 480
def test(throw=True):
    pass

test(throw=False)

# issue 485
class Test:

    pass

a = Test()
b = Test()
d = {a: 1, b: 2}

assert d[a] == 1
assert d[b] == 2

# issue 481
flag = False

def extend_instance(obj, cls):
    """
        Apply mixins to a class instance after creation
        (thanks http://stackoverflow.com/questions/8544983/dynamically-mixin-a-base-class-to-an-instance-in-python)
    """

    base_cls = obj.__class__
    base_cls_name = obj.__class__.__name__
    obj.__class__ = type("Extended"+base_cls_name, (cls,base_cls),{})

class Mixin(object):

    def __setattr__(self, name, value):
        if not name.startswith('_'):
            #print("Mixin setting", name, "to", value, super().__setattr__)
            super().__setattr__(name,value)
        else:
            super().__setattr__(name,value)


class Test:

    def __init__(self):
        self._dct={}

    def __setattr__(self, name, value):
        global flag
        if not name.startswith('_'):
            self._dct[name] = value
            flag = True
        else:
            super().__setattr__(name, value)

    def __getattr__(self):
        if not name.startswith('_'):
            return self._dct[name]
        else:
            return getattr(self, name)

t = Test()
extend_instance(t, Mixin)
t.c = 20
assert flag

# bug in comprehensions
a = [1, 2]
b = [3, 4]
odd = [x for x in a + b if x % 2]
assert odd == [1, 3]

# issue 506
class TestRound:

    def __round__(self, n=None):
        if n is None:
            return 10
        else:
            return n


tr = TestRound()

assert type(round(3.0)) == int, \
    "Round called without second argument should return int"
assert type(round(3.1111, 3)) == float, \
    "Round called without second argument should return same type as first arg"
assert type(round(3.0, 0)) == float, \
    "Round called without second argument should return same type as first arg"
assert round(3.1111, 3) == 3.111
assert type(round(0, 3)) == int, \
    "Round called without second argument should return same type as first arg"
assert round(tr, 3) == 3, \
    "Round called on obj with __round__ method should use it"
assert round(tr) == 10, \
    "Round called on obj with __round__ method should use it"

# Bankers rounding (issue #513)
assert round(-9.5) == -10
assert round(-0.5) == 0
assert round(2.5) == 2
assert round(9.5) == 10
assert round(100.5) == 100

# issue 523
borders_distance = [(-5, 0), (4, 0), (0, -3), (0, 4)]
mx, my = min(borders_distance, key=lambda m: abs(m[0] + m[1]))
assert (mx, my) == (0, -3)

# issue 500
order = []
try:
    order.append('try')
except KeyError as exc:
    order.append('except')
else:
    order.append('else')
finally:
    order.append('finally')

assert order == ['try', 'else', 'finally']

# issue 542
def test(*args):
    return args

a01 = [0, 1]

assert test(*a01, 2, 3) == (0, 1, 2, 3)

args = a01 + [2, 3]
assert test(*args) == (0, 1, 2, 3)

def test(**kw):
    return kw

d1 = {'x': 2}
d2 = {'y': 3}
assert test(u=1, **d1, **d2) == {'u': 1, 'x': 2, 'y': 3}

# issue 545
k = 3
nb = 0
for k in range(k):
    nb += 1
assert nb == 3

# issue 547
a = (1,)
b = a
a += (2,)
assert b == (1,)

# issue 549
a = 5.0
a **= 2
assert a == 25.0
a //= 25
assert a == 1.0

# issue 550
assert True & False is False
assert True | False is True
assert True ^ False is True

# issue 551
y = -1;
assert y == -1

# issue 553
sxz = 'abc'
assert [sxz for sxz in sxz] == ['a', 'b', 'c']
assert {sxz for sxz in sxz} == {'a', 'b', 'c'}
assert {sxz: sxz for sxz in sxz} == {'a': 'a', 'b': 'b', 'c': 'c'}
g = (sxz for sxz in sxz)
assert list(g) == ['a', 'b', 'c']

# issue 554
nbcalls = 0
def f():
    global nbcalls
    nbcalls += 1

def g(unused_arg=f()):
    pass

assert nbcalls == 1

# issue 499
data = [1, 2, 3]
data = (item for item in data)
assert list(data) == [1, 2, 3]

# issue 557
from math import sin, log

class N:

    def __float__(self):
        return 42.0


num = N()
assert sin(num) == -0.9165215479156338
assert log(num) == 3.7376696182833684

# issue 560
class Base:

    @classmethod
    def test(cls):
        return cls


class Derived(Base):

    def __init__(self):
        pass


assert Derived.test() == Derived
d = Derived()
assert d.test() == Derived

# issue 563
assert str(False + False) == '0'
assert False + True == 1
assert True + True == 2

# issue 572: sort should be stable
words = ["Bed", "Axe", "Cat", "Court", "Axle", "Beer"]
words.sort()
words.sort(key=len, reverse=True)

assert words == ['Court', 'Axle', 'Beer', 'Axe', 'Bed', 'Cat']

# chained comparisons
x = 0

def impure():
  global x
  x += 1
  return x

assert 0 < impure() <= 1

# issue 576
class Patched:
    def method(self, first="patched1", second="patched2"):
        return(first, second)


class Patcher:

    def __init__(self):
        Patched.method = self.method  # monkey patches with instantiated method

    def method(self, first="patcher1", second="patcher2"):
        return(first, second)


Patched.method = Patcher.method  # monkey patches with non instantiated method
assert ("tester1", "patcher2") == Patched().method("tester1")
Patcher()
assert ("tester1", "patcher2") == Patched().method("tester1"), \
    "instead returns %s %s" % Patched().method()

# issue 578

try:
    raise 1
except TypeError:
    pass

class A:
    pass

try:
    raise A()
except TypeError:
    pass

def test():
    return IOError()

try:
    raise test()
except IOError:
    pass

# issue 582
def nothing():
    a = lambda: 1 \
        or 2
    return a()

assert nothing() == 1

# issue 584
try:
    from __future__ import non_existing_feature
except SyntaxError:
    pass

# issue 501
class Test:
    def __iter__(self):
        self._blocking = True
        yield self

def test_yield():
    b = yield from Test()
    return b

test = []
for b in test_yield():
    test.append(b)

assert test[0]._blocking is True

# issue 588
def yoba(a, b):
    return a + b

assertRaises(TypeError, yoba, 1, 2, 3)

# issue 592
assert pow(97, 1351, 723) == 385

# issue 595
assert float(True) == 1.0

# issue 598
class A(object):

    __slots__ = "attr"

    def __init__(self, attr=0):
        self.attr  = attr


a = A()

# issue 600
class A:

    def __eq__(self, other):
        return True


class B(A):

    def __eq__(self, other):
        return False


# check that B.__eq__ is used because B is a subclass of A
assert A() != B()
a = A()
b = B()
assert a != b
assert b != a

# issue 603
import copy
a = [[1], 2, 3]
b = copy.copy(a)
b[0] += [10]
assert a == [[1, 10], 2, 3]
assert b == [[1, 10], 2, 3]

# issue 604
class StopCompares:

    def __eq__(self, other):
        return 1 / 0


checkfirst = list([1, StopCompares()])
assert(1 in checkfirst)

# issue 615
class A:
    spam = 5

assertRaises(TypeError, A, 5)

try:
    class A(spam="foo"):
        pass
    raise AssertionError("should have raised TypeError")
except TypeError:
    pass

# issue 619
from browser.html import H2

class _ElementMixIn:

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._sargs = []
        self._kargs = {}

    def mytest(self):
        self._sargs.append(5)

    def mytest2(self):
        self._kargs[5] = '5'


kls = type('h2', (_ElementMixIn, H2,), {})

x = kls()
x.mytest()
assert x._sargs == [5]
x.mytest2()
assert x._kargs[5] == '5'

# issue 649
class test:

    def test(self):
        return 1


assert test().test() == 1

# issue 658
kk = [i for i in [
        1,  # 1st quadrant
        2
]]
assert kk == [1, 2]

kk = (i for i in [
        1, # a comment
        2
])
assert list(kk) == [1, 2]

# issue 663
a = {}
a[5] = b = 0
assert a[5] == 0

# issue 659
class A:
    def x(self):
        pass

assert A().x.__name__ == "x"
assert A.x.__name__ == "x"

# issue 669
assert 0.1 is 0.1
assert not(1 is 1.0)

# issue 673
class A:

    __z = 7

    def __init__(self):
        self.__x = 20


a = A()
assert a._A__x == 20
assert a._A__z == 7

class Mapping:

    def __init__(self, iterable):
        self.items_list = []
        self.__update(iterable)

    def update(self, iterable):
        for item in iterable:
            self.items_list.append(item)

    __update = update   # private copy of original update() method


class MappingSubclass(Mapping):

    def update(self, keys, values):
        # provides new signature for update()
        # but does not break __init__()
        for item in zip(keys, values):
            self.items_list.append(item)


mapping = Mapping(range(3))
mapping.update(range(7, 10))
assert mapping.items_list == [0, 1, 2, 7, 8, 9]

map2 = MappingSubclass(range(3))
map2.update(['a', 'b'], [8, 9])
assert map2.items_list == [0, 1, 2, ('a', 8), ('b', 9)]

class B:

    def __print(self, name):
        return name


assert B()._B__print('ok') == 'ok'

# issue 680
class A:

    def __getattribute__(self, name):
        return super().__getattribute__(name)

    def test(self):
        return 'test !'


assert A().test() == "test !"

# issue 681
found = [x for x in ['a', 'b', 'c']
                     if x and not x.startswith('-')][-1]
assert found == 'c'

assert [0, 1][-1] == 1
assert {-1: 'a'}[-1] == 'a'

# issue 691
class C(object):
    pass

c1 = C()
c1.x = 42
assert c1.__dict__['x'] == 42
c1.__dict__.clear()
assert c1.__dict__ == {}

class C(object):
    pass
c2 = C()
c2.x = 42
c2.__dict__ = dict()
assert c2.__dict__ == {}

try:
    c2.__dict__ = 6
except TypeError:
    pass

# issue 699
def members(obj):
    for m in dir(obj):
        getattr(obj, m)

members(int)

class Foo:
    def foo(self):
        pass


members(Foo)

# issue 701
assert type((1, 2, 3)[:0]) == tuple
assert type((1, 2, 3)[1:2:-1]) == tuple
assert type((1, 2, 3)[0:2]) == tuple

# generalised unpacking for function calls
def f(*args, **kw):
    return args, kw

res = f(3, *[1, 8], 5, y=2, **{'a': 0}, **{'z': 3})
assert res[0] == (3, 1, 8, 5)
assert res[1] == {'y': 2, 'a': 0, 'z': 3}

# issue 702
def f():
    return

try:
    f > 5
    raise Exception("should have raised TypeError")
except TypeError:
    pass

try:
    min <= 'a'
    raise Exception("should have raised TypeError")
except TypeError:
    pass

import random
try:
    random.random < 1
    raise Exception("should have raised TypeError")
except TypeError:
    pass

class A:
    pass

try:
    A < 'x'
    raise Exception("should have raised TypeError")
except TypeError:
    pass

# issue 729
head, *tail = 1, 2, 3
assert tail == [2, 3]

# issue 743
def test(msg = 'a', e_type: int = 10):
    pass

# issue 751
class Z: pass

try:
    (10, Z()) <= (10, Z())
    raise Exception("should have raised TypeError")
except TypeError:
    pass

try:
    a = [100, 100, 100, 100, 100, 70, 100, 100, 70, 70, 100,
     70, 70, 70, 100, 70, 70, 100, 70, 70, 70, 70, 100, 70,
     70, 70, 70, 70, 100, 70, 70, 70, 100, 70, 70, 70, 70,
     70, 70, 100]
    b = [(v, Z()) for v in a]
    sorted(b, reverse=True)
    raise Exception("should have raised TypeError")
except TypeError:
    pass

# issue 753
# cf. https://github.com/mziccard/node-timsort/issues/14
a = [1.0, 1.0, 1.0, 1.0, 1.0, 0.5, 1.0, 0.5, 0.5, 1.0,
     0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 1.0, 0.5,
     0.5, 0.5, 0.5, 0.5, 1.0, 0.5, 1.0, 0.5, 0.5, 0.5,
     0.6, 1.0]

a.sort()
for i in range(len(a) - 1):
    assert a[i] <= a[i + 1]


# issue 755
assert '{}'.format(int) == "<class 'int'>"

class C:
    pass

assert '{}'.format(C) == "<class '__main__.C'>"

import javascript
assert javascript.jsobj2pyobj(javascript.NULL) is None
undef = javascript.jsobj2pyobj(javascript.UNDEFINED)
assert not undef

# issue 760
class A(object):

   def __str__(self):
       return "an A"


class B(A):

    def __repr__(self):
       return '<B>()'


b = B()
assert str(b) == "an A"

# issue 761
class A:

    def __str__(self):
        return 'an A'


assert '{0}'.format(A()) == 'an A'

# issue 776
def f():
    d = {
        a: b
        for k in keys
        if k not in (
            "name",
        )  # comment
    }

# issue 778
import os
assertRaises(NotImplementedError, os.listdir)

# issue 780
def g():
    print(xtr) # should crash, of course

def f():
    xtr = 42
    g()

assertRaises(NameError, f)

# issue 781

# can't call strings
assertRaises(TypeError, 'a')
assertRaises(TypeError, 'a', 1)
assertRaises(TypeError, 'a', {'x': 1})

# can't call lists
t = [1, 2]
assertRaises(TypeError, t)
assertRaises(TypeError, t, 1)
assertRaises(TypeError, t, {'x': 1})

# can't call dicts
d = {1: 'a'}
assertRaises(TypeError,d)
assertRaises(TypeError, d, 1)
assertRaises(TypeError, d, {'x': 1})

# issue 782
class Greetings:

    default = None

    def hello(self):
        return "Hello!"


_func_body = """\
def {name}():
    if {obj} is None:
        {obj} = {init}
    return {obj}.{name}()
"""

def_str = _func_body.format(obj='Greetings.default',
    init='Greetings()', name="hello")
exec(def_str, globals())

assert hello() == "Hello!"

# issue 801
class L:

    def __init__(self):
        self._called = 0

    def get_list(self):
        self._called += 1
        return [0]


l = L()

for i in l.get_list():
    pass

assert l._called == 1

# issue 808
class A:
  pass


class B(object):

    def __init__(self, *args, **kwargs):
        self.res = None

    def __setattr__(self, *args, **kwargs):
        res = None
        if len(args) == 2 and hasattr(self, args[0]):
            old = getattr(self, args[0])
            new = args[1]
            res = super(B, self).__setattr__(*args, **kwargs)
        else:
            res = super(B, self).__setattr__(*args, **kwargs)
        return res


class C(B,A):
  pass


c = C()

"""
import ipaddress
assert repr(ipaddress.ip_address('192.168.0.1')) == "IPv4Address('192.168.0.1')"
assert repr(ipaddress.ip_address('2001:db8::')) == "IPv6Address('2001:db8::')"
"""
# issue 811
try:
    exec("a + b = 1")
    raise Exception("should have raised SyntaxError")
except SyntaxError:
    pass

# issue 813
class A:

    def __radd__(self, other):
        return 99

    def __rmul__(self, other):
        return 100


assert [5] + A() == 99
assert [6] * A() == 100

# issue reported on the Google Group
# https://groups.google.com/forum/?fromgroups=#!topic/brython/U6cmUP9Q6Y8
class ndarray:

  def __getitem__(self, val):
    return val


t = ndarray()

assert slice(1, 5, None) == slice(1, 5, None)
assert t[1:5, 7] == (slice(1, 5, None), 7)

# test attribute __code__.co_code of functions
def f():
    print(10)

assert f.__code__.co_code.startswith("function f")

# Regression introduced in 6888c6d67b3d5b44905a09fa427a84bef2c7b304
class A:
    pass

global_x = None
def target(x=None):
    global global_x
    global_x = x

obj_dict = A().__dict__
obj_dict['target_key'] = target
obj_dict['target_key'](x='hello')

assert global_x == 'hello'

# issue 835
x = 0

class A:

    assert x == 0

    def x(self):
        pass

    assert callable(x)


# issue 836
def f():
    if False:
        wxc = 0
    else:
        print(wxc)

assertRaises(UnboundLocalError, f)

def g():
    if False:
        vbn = 0
    print(vbn)

assertRaises(UnboundLocalError, f)

# issue 838
import sys
assert type(random) == type(sys)

# issue 843
try:
    raise FileNotFoundError()
except FloatingPointError:
    assert False
except FileNotFoundError:
    assert sys.exc_info()[0] == FileNotFoundError

# Test exception raising with and without parens for
# custom and builtin exception types
class CustomException(Exception):
    pass


try:
    raise Exception()
except Exception:
    pass

try:
    raise Exception
except Exception:
    pass

try:
    raise CustomException()
except CustomException:
    pass

try:
    raise CustomException
except CustomException:
    pass

# Make sure that accessing tb.tb_next doesn't lead to an infinite loop
try:
    raise Exception()
except:
    (_, _, tb) = sys.exc_info()
    while tb:
        tb = tb.tb_next


# PEP 448
assert dict(**{'x': 1}, y=2, **{'z': 3}) == {"x": 1, "y": 2, "z": 3}
try:
    d = dict(**{'x': 1}, y=2, **{'z': 3, 'x': 9})
    raise Exception("should have raised TypeError")
except TypeError:
    pass

r = range(2)
t = *r, *range(2), 4
assert t == (0, 1, 0, 1, 4)

t = [*range(4), 4]
assert t == [0, 1, 2, 3, 4]

assert {*range(4), 4} == {0, 1, 2, 3, 4}
assert {*[0, 1], 2} == {0, 1, 2}
assert {*(0, 1), 2} == {0, 1, 2}
assert {4, *t} == {0, 1, 2, 3, 4}

assert {'x': 1, **{'y': 2, 'z': 3}} == {'x': 1, 'y': 2, 'z': 3}

assert {'x': 1, **{'x': 2}} == {'x': 2}
assert {**{'x': 2}, 'x': 1} == {'x': 1}

assertRaises(SyntaxError, exec, "d = {'x': 1, *[1]}")
assertRaises(SyntaxError, exec, "d = {'x', **{'y': 1}}")
assertRaises(SyntaxError, exec, "d = {*[1], 'x': 2}")
assertRaises(SyntaxError, exec, "d = {**{'x': 1}, 2}")
assertRaises(SyntaxError, exec, "t = *range(4)")

# issue 909
t1 = [*[1]]
assert t1 == [1]
t2 = [*(1, 2)]
assert t2 == [1, 2]

# issue 854
class A(object):

    def __init__(self):
        self.x = 0

    def f():
        pass


class B(A): pass

assert 'f' in dir(A)
assert 'f' in dir(B)

assert 'x' in dir(A())
assert 'x' in dir(B())

# issue 869
class A(object):

    def __init__(self):
        self.value = 0

    def __iadd__(self, val):
        self.value += val
        return self.value


class B(object):
    def __init__(self):
        self.a = A()


b = B()
b.a += 10
assert b.a == 10

# issue 873
str(globals())

# issue 883
for _ in range(2):
    for _ in range(2):
        pass

# issue 900
"".format(**globals())

# issue 901 : _jsre's SRE_Pattern lacking methods: .sub(), .subn(), .split(), and .fullmatch()
import _jsre as re

regex = re.compile('a|b')

# These methods work!
assert regex.match('ab') is not None
assert regex.search(' ab') is not None
assert regex.findall('ab') == ['a', 'b']

def switch(m):
    return 'a' if m.group(0) == 'b' else 'b'

# Missing: .sub()
assert regex.sub(switch, 'ba') == 'ab'

# Missing: .fullmatch()
# assert regex.fullmatch('b') is not None

# Missing: .split()
#assert regex.split('cacbca', maxsplit=2) == ['c', 'c', 'ca']

# Missing: .subn()
#assert regex.subn(switch, 'ba') == ('ab', 2)

# Broken: .finditer()
#assert [m.group(0) for m in regex.finditer('ab')] == ['a', 'b']

# issue 918
import copy

class MyClass:

    def __init__(self, some_param):
        self.x = some_param


obj = MyClass("aaa")
obj2 = copy.copy(obj)
assert obj2.x == "aaa"

# issue 923
v = 1
del v
try:
    print(v)
    raise Exception("should have raised NameError")
except NameError:
    pass

hello = {"a": 1, "b": 2}
del(hello["a"]) # with parenthesis
assert len(hello) == 1

# issue 925
class A():

    def __lt__(self, other):
        return 1

    def __gt__(self, other):
        return 2


assert (1 < A()) == 2
assert (A() < 1) == 1

# issue 936
assert not (2 == "2")
assert 2 != "2"
assert not ("2" == 2)
assert "2" != 2

try:
    2 <= "2"
except TypeError as exc:
    assert "<=" in exc.args[0]

# issue 939
class A:
    def __bool__(self):
        raise TypeError("Not a bool!")

try:
    if A():
        pass
    raise Exception("should have raised TypeError")
except TypeError as exc:
    assert exc.args[0] == "Not a bool!"

try:
    bool(A())
    raise Exception("should have raised TypeError")
except TypeError as exc:
    assert exc.args[0] == "Not a bool!"

# issue 940
assertRaises(SyntaxError, lambda: exec('a.foo = x += 3', {'a': A(), 'x': 10}))
assertRaises(SyntaxError, lambda: exec('x = a.foo += 3', {'a': A(), 'x': 10}))

# issue 944
src = """def f():
    pass
f():
"""
assertRaises(SyntaxError, exec, src)

# issue 948
try:
    exec("a = +25, b = 25")
    raise Exception("should have raised SyntaxError")
except SyntaxError as exc:
    assert exc.args[0] == "can't assign to operator"

# issue 949
class A(object):

    def __getattr__(self, name):
        return 'A-%s' % name


try:
    A.foo
    raise Exception("should have raised AttributeError")
except AttributeError:
    pass

# issue 951
class A(object):
    pass

a = A()
a.__dict__['_x'] = {1: 2}
a._x[3] = 4
assert len(a._x) == 2

# issue 952
try:
    exec("x += 1, y = 2")
    raise Exception("should have raised SyntaxError")
except SyntaxError as exc:
    assert exc.args[0] == "invalid syntax"

# issue 953
adk = 4
def f():
    if False:
        adk = 1
    else:
        print(adk)

assertRaises(UnboundLocalError, f)

# issue 959
try:
    exec("x + x += 10")
    raise Exception("should have raised SyntaxError")
except SyntaxError as exc:
    assert exc.args[0] == "can't assign to operator"

# issue 965
assertRaises(SyntaxError, exec, "if:x=2")
assertRaises(SyntaxError, exec, "while:x=2")
assertRaises(SyntaxError, exec, "for x in:x")

# issue 973
try:
    exec("x = 400 - a, y = 400 - b")
    raise Exception("should have raised SyntaxError")
except SyntaxError as exc:
    assert exc.args[0] == "can't assign to operator"

# issue 975
l = [1, 2, 3]
try:
    l[:,:]
    raise Exception("should have raised TypeError")
except TypeError:
    pass

def f():
    global x985
    print(x985)

def g():
    global x985
    x985 = 1

assertRaises(NameError, f)

# issue 1024
assert [x for x in range(10) if x % 2 if x % 3] == [1, 5, 7]

result = []
for x, in [(1,), (2,), (3,)]:
    result.append(x)
assert result == [1, 2, 3]

assert [x(False)
        for x in (lambda x: False if x else True, lambda x: True if x else False)
        if x(False)] == [True]

def test_yield_in_comprehensions(self):
    # Check yield in comprehensions
    def g2(): [x for x in [(yield 1)]]

# issue 1026
assertRaises(SyntaxError, exec, "x += y += 5")

# augmented assignment to a global variable
def f():
    global xaz25
    xaz25 += 1

xaz25 = 8
f()
assert xaz25 == 9

# issue 1048
class Foo:
    bar = 1

foo = Foo()
assertRaises(AttributeError, delattr, foo, 'bar')

class C:

    def __init__(self):
        self._x = None
        self.count = 0

    def getx(self):
        return self._x

    def setx(self, value):
        self._x = value

    def delx(self):
        self.count += 1
        del self._x

    x = property(getx, setx, delx, "I'm the 'x' property.")

c = C()
delattr(c, "x")
assert c.count == 1

# setting __defaults__ to functions (issue #1053)

def ftrk(x, y=5):
    return x + y

assert ftrk(1) == 6

ftrk.__defaults__ = (4, 1)
assert ftrk(1) == 2
assert ftrk() == 5
ftrk.__defaults__ = ()

assertRaises(TypeError, ftrk)

ftrk.__defaults__ = (4, 1)
assert ftrk(1) == 2
assert ftrk() == 5
ftrk.__defaults__ = None

assertRaises(TypeError, ftrk)

def g():
    def h(x, y):
        return x + y
    h.__defaults__ = (3,)
    return h

assert g()(1) == 4

class A:
    def ftrk2(self, x):
        return x + 1

a = A()
assert a.ftrk2(2) == 3
A.ftrk2.__defaults__ = (2,)
assert a.ftrk2() == 3, a.ftrk2()

class B:

    def __new__(cls, a):
        obj = object.__new__(cls)
        obj.a = a
        return obj

    def show(self):
        return self.a

b = B(2)
assert b.show() == 2
B.__new__.__defaults__ = (8,)
b2 = B()
assert b2.show() == 8

# issue 1059
import os
try:
    issues_py_dir = os.path.dirname(__file__)
    z_txt_path = os.path.join(issues_py_dir, "z.txt")
except NameError:
    z_txt_path = "z.txt"

with open(z_txt_path, encoding="utf-8") as f:
    t = [line for line in f]
assert len(t) == 3

with open(z_txt_path, encoding="utf-8") as f:
    assert f.readlines() == t

# issue 1063
class A(object):
  pass

y = [1, 2, 3]
x = A()

t = []

for x.foo in y:
    t.append(x.foo)

assert t == y

# issue 1062
assertRaises(SyntaxError, exec, "x[]")
assertRaises(SyntaxError, exec, "x{}")

# issue 1068
class Class():

    def method(self):
      return __class__.__name__

assert Class().method() == "Class"

def f():
    print(__class__)

assertRaises(NameError, f)

# issue 1085
expected = [
    (0, 10, 1),
    (0, 10, 1),
    (0, 1, 1),
    (0, 1, 1),
    (1, 10, 1),
    (1, 10, 1),
    (1, 1, 1),
    (1, 1, 1)
]

tmp = (None, 1)
for i in range(8):
    target = slice(
        tmp[bool(i & 4)],
        tmp[bool(i & 2)],
        tmp[bool(i & 1)]
    )
    assert target.indices(10) == expected[i]

test_pool = [((85, None, None), 9, (9, 9, 1)),
    ((-32, None, None), 84, (52, 84, 1)),
    ((None, -40, None), 97, (0, 57, 1)),
    ((-89, None, -5), 86, (-1, -1, -5)),
    ((-92, -10, None), 0, (0, 0, 1)),
    ((99, None, None), 22, (22, 22, 1)),
    ((-85, -90, 8), 60, (0, 0, 8)),
    ((76, None, -9), 10, (9, -1, -9)),
    ((None, None, 8), 54, (0, 54, 8)),
    ((None, -86, None), 71, (0, 0, 1)),
    ((None, -83, None), 4, (0, 0, 1)),
    ((-78, None, -7), 27, (-1, -1, -7)),
    ((None, 3, None), 71, (0, 3, 1)),
    ((91, None, 3), 15, (15, 15, 3)),
    ((None, None, 2), 35, (0, 35, 2)),
    ((None, None, None), 46, (0, 46, 1)),
    ((None, 94, None), 64, (0, 64, 1)),
    ((6, None, 2), 57, (6, 57, 2)),
    ((43, None, 9), 70, (43, 70, 9)),
    ((83, None, None), 93, (83, 93, 1)),
    ((None, None, -7), 37, (36, -1, -7)),
    ((None, -27, None), 70, (0, 43, 1)),
    ((None, -22, None), 89, (0, 67, 1)),
    ((-79, -39, 9), 20, (0, 0, 9)),
    ((None, 83, None), 89, (0, 83, 1)),
    ((96, None, None), 8, (8, 8, 1)),
    ((None, -37, None), 35, (0, 0, 1)),
    ((None, -62, -2), 78, (77, 16, -2)),
    ((-31, -37, 3), 9, (0, 0, 3)),
    ((None, None, None), 92, (0, 92, 1)),
    ((35, 54, None), 10, (10, 10, 1)),
    ((-55, None, 7), 55, (0, 55, 7)),
    ((None, None, 7), 97, (0, 97, 7)),
    ((None, 92, None), 70, (0, 70, 1)),
    ((None, -37, None), 57, (0, 20, 1)),
    ((None, None, None), 71, (0, 71, 1)),
    ((-98, -76, -7), 10, (-1, -1, -7)),
    ((-90, 44, None), 66, (0, 44, 1)),
    ((None, None, 2), 16, (0, 16, 2)),
    ((61, -54, None), 35, (35, 0, 1)),
    ((4, -12, None), 36, (4, 24, 1)),
    ((None, 78, -7), 92, (91, 78, -7)),
    ((-48, None, 2), 47, (0, 47, 2)),
    ((-16, 55, None), 8, (0, 8, 1)),
    ((None, None, 1), 6, (0, 6, 1)),
    ((-73, None, None), 67, (0, 67, 1)),
    ((65, None, -1), 30, (29, -1, -1)),
    ((12, None, None), 61, (12, 61, 1)),
    ((33, None, None), 31, (31, 31, 1)),
    ((None, None, -3), 96, (95, -1, -3)),
    ((None, None, None), 15, (0, 15, 1)),
    ((19, -65, 8), 39, (19, 0, 8)),
    ((85, -4, 9), 40, (40, 36, 9)),
    ((-82, None, None), 6, (0, 6, 1)),
    ((29, None, 6), 94, (29, 94, 6)),
    ((None, 14, -2), 63, (62, 14, -2)),
    ((None, 15, 6), 30, (0, 15, 6)),
    ((None, None, None), 22, (0, 22, 1)),
    ((None, None, 1), 88, (0, 88, 1)),
    ((87, -7, None), 47, (47, 40, 1)),
    ((None, -12, 8), 68, (0, 56, 8)),
    ((-70, None, 8), 1, (0, 1, 8)),
    ((-21, None, 1), 24, (3, 24, 1)),
    ((None, None, None), 54, (0, 54, 1)),
    ((None, None, 9), 28, (0, 28, 9)),
    ((31, -25, None), 13, (13, 0, 1)),
    ((16, 33, None), 63, (16, 33, 1)),
    ((None, 86, 3), 58, (0, 58, 3)),
    ((None, -63, -1), 68, (67, 5, -1)),
    ((None, 7, -3), 76, (75, 7, -3)),
    ((92, 24, 7), 76, (76, 24, 7)),
    ((3, 65, None), 78, (3, 65, 1)),
    ((None, None, -9), 45, (44, -1, -9)),
    ((None, 85, None), 21, (0, 21, 1)),
    ((77, None, 1), 33, (33, 33, 1)),
    ((None, None, None), 81, (0, 81, 1)),
    ((-2, 50, 6), 52, (50, 50, 6)),
    ((-39, 6, 2), 89, (50, 6, 2)),
    ((None, -26, None), 15, (0, 0, 1)),
    ((66, None, -1), 98, (66, -1, -1)),
    ((None, None, None), 37, (0, 37, 1)),
    ((3, -48, None), 14, (3, 0, 1)),
    ((None, 84, None), 12, (0, 12, 1)),
    ((79, 87, -2), 72, (71, 71, -2)),
    ((None, -97, -7), 68, (67, -1, -7)),
    ((None, 62, None), 86, (0, 62, 1)),
    ((-54, None, 3), 71, (17, 71, 3)),
    ((77, None, None), 78, (77, 78, 1)),
    ((None, None, -7), 87, (86, -1, -7)),
    ((None, None, None), 59, (0, 59, 1)),
    ((None, -24, None), 15, (0, 0, 1)),
    ((None, None, 7), 72, (0, 72, 7)),
    ((None, None, 2), 79, (0, 79, 2)),
    ((-50, None, None), 4, (0, 4, 1)),
    ((None, -97, -5), 68, (67, -1, -5)),
    ((22, None, None), 67, (22, 67, 1)),
    ((-72, None, -2), 93, (21, -1, -2)),
    ((8, None, -6), 88, (8, -1, -6)),
    ((-53, 31, -6), 0, (-1, -1, -6)),
    ((None, None, None), 0, (0, 0, 1))]

for args, cut, res in test_pool:
    test = slice(*args)
    res_test = test.indices(cut)
    assert res == res_test, \
        '{test}.indices({cut}) should be {res}, not {res_test}'.format(**locals())

# too many positional arguments
def f(a, b, *, x=3):
    print(a, b, x)

assertRaises(TypeError, f, 1, 2, 3)

# issue 1122
class A(Exception):
    pass

class B(object):
    def __getattr__(self, attr):
        raise A()

ok = False

try:
    b = B()
    b.attr
except A:
    ok = True
except:
    pass

assert(ok)

# issue 1125
from typing import Union

row = Union[int, str]

def do() -> None:
  a: row = 4

do()

# issue 1133
try:
    set
except NameError:
    from sets import Set as set

if False:
    set = list

assert set([1, 2]) == {1, 2}

# issue 1209
assertRaises(SyntaxError, exec, "x:+=1")

# issue 1210
assertRaises(SyntaxError, exec, r"\\")
assertRaises(SyntaxError, exec, r"\\\n")
assertRaises(SyntaxError, exec,
    "def f():\n    \\\\")
assertRaises(SyntaxError, exec,
    "def f():\n    \\\\\n")

# issue 1229
class A:

    def __str__(self):
        return "real str"

a = A()
assert str(a) == "real str"

a.__str__ = lambda : "fake str"
assert str(a) == "real str"

# issue 1233
for x1233 in range(0):
    pass

assertRaises(NameError, exec, "x1233")

# ==========================================
# Finally, report that all tests have passed
# ==========================================
print('passed all tests')
