from tester import assertRaises

# issue 5
assert(isinstance(__debug__,bool))

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
        assert s.x==9
z = b()

# issue 12
x = {'a':1}
assert 'a' in x

class ToDir:
    def init(self):
        pass

instanceToDir = ToDir()

dictToDir=({k: getattr(instanceToDir,k)
    for k in dir(instanceToDir) if '__' not in k})

castdictToDir={str(k): getattr(instanceToDir,k)
    for k in dir(instanceToDir) if '__' not in k}


assert 'init' in castdictToDir, 'init not in castdictToDir: %s' % list(dictToDir.keys())
assert castdictToDir["init"]==instanceToDir.init , 'init not init method: %s' % castdictToDir["init"]
assert 'init' in dictToDir, 'init not in dictToDir: %s' % list(dictToDir.keys())
assert dictToDir["init"]==instanceToDir.init , 'init not init method: %s' % dictToDir["init"]

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

#issue 83
import sys
assert sys.version_info > (3,0,0)
assert sys.version_info >= (3,0,0)

assert not sys.version_info == (3,0,0)
assert sys.version_info != (3,0,0)

assert not sys.version_info < (3,0,0)
assert not sys.version_info <= (3,0,0)

#issue 98
assert int.from_bytes(b'\xfc', 'big') == 252
assert int.from_bytes(bytearray([252,0]), 'big') == 64512
assert int.from_bytes(b'\x00\x10', byteorder='big') == 16
assert int.from_bytes(b'\x00\x10', byteorder='little') == 4096
assert int.from_bytes(b'\xfc\x00', byteorder='big', signed=True) == -1024
assert int.from_bytes(b'\xfc\x00', byteorder='big', signed=False) == 64512
assert int.from_bytes([255, 0, 0], byteorder='big') == 16711680

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
assert b.aaa(0)==0

# issue 108
def funcattrs(**kwds):
    def decorate(func):
        func.__dict__.update(kwds)
        return func
    return decorate

class C(object):
       @funcattrs(abc=1, xyz="haha")
       @funcattrs(booh=42)
       def foo(self): return 42

assert C().foo() == 42
assert C.foo.abc == 1
assert C.foo.xyz == "haha"
assert C.foo.booh == 42

# issue 115
a = 1
assert a.numerator == 1
assert a.denominator == 1
assert a.real == 1
assert a.imag == 0
assert isinstance(a.imag, int) == True
a = 1 + 2j
assert a.real == 1
assert a.imag == 2
assert isinstance(a.real, float) == True
assert isinstance(a.imag, float) == True


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

#issue 127
assert "aaa+AAA".split("+") == ['aaa', 'AAA']

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
    time.asctime((1,2,3,4))
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
import sys
import types

try:
    raise ValueError
except ValueError:
    tb = sys.exc_info()[2]
    assert isinstance(tb, types.TracebackType)

# issue 156
from collections import abc
assert isinstance(dict(one=1), abc.Mapping)
assert issubclass(dict, abc.Mapping)


# issue 169
from random import seed, shuffle
first = list(range(20))
seed(31416)
shuffle(first)
second = list(range(20))
seed(31416)
shuffle(second)
assert first == second, "Same seed does not produce same random results"

# True and False are instances of int
assert isinstance(True, int)
assert isinstance(False, int)

# repr of type(None)
assert repr(type(None)) == "<class 'NoneType'>"

# nonlocal
def f():
    def g():
        nonlocal t
        return t
    t = 1
    return g

assert f()()==1

def f():
    k = 1
    def g():
        def r():
            nonlocal k
            return k+1
        return r()
    return g()

assert f()==2

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
    def __hash__(self): return hash(1.0)
    def __eq__(self, other): return other == 1

a = {1: 'a', X(): 'b'}
assert a=={1:'b'}
assert X() in a
assert a[X()]=='b'

class X:
    def __hash__(self): return hash('u')

a = {'u': 'a', X(): 'b'}
assert set(a.values())=={'a', 'b'}
assert not X() in a

b = {'u':'a'}
assert not X() in b

class X:
    def __hash__(self): return hash('u')
    def __eq__(self, other): return other=='u'
    pass

a = {'u': 'a', X(): 'b'}
assert a == {'u': 'b'}
assert X() in a
assert a[X()]=='b'

# issue 176
x = [1,2,3]
assert sum(-y for y in x) == -6

# issue 186
source = [0, 1, 2, 3]
total = sum(source.pop() for _ in range(len(source)))
assert total == 6, "expected 6 but instead was %d" % total

# issue 177
import sys
ModuleType=type(sys)
foo=ModuleType("foo", "foodoc")
assert foo.__name__=="foo"
assert foo.__doc__=="foodoc"

# issue 201
import json
d=json.loads("""{"a":1,"b":2.1}""")
assert d == {'a': 1, 'b': 2.1}
assert type(d['a']) == int
assert type(d['b']) == float

# issue 203
def f(z):
  z += 1
  return z

x = 1.0

assert x != f(x)

# issue 204
import math
m, e = math.frexp(abs(123.456))
assert m == 0.9645
assert m * (1 << 24) == 16181624.832

# issue 207

for x in range(0x7ffffff0, 0x8000000f):
    assert x & x == x, "%s & %s == %s" % (hex(x), hex(x), hex(x & x))
    assert x | x == x, "%s | %s == %s" % (hex(x), hex(x), hex(x | x))

for x in range(0x17ffffff0, 0x17fffffff):
    assert x & x == x, "%s & %s == %s" % (hex(x), hex(x), hex(x & x))
    assert x | x == x, "%s | %s == %s" % (hex(x), hex(x), hex(x | x))

# issue 208
a=5
assert globals().get('a')  == 5

# not an official issue
class Cmp:
    def __init__(self,arg):
        self.arg = arg

    def __repr__(self):
        return '<Cmp %s>' % self.arg

    def __eq__(self, other):
        return self.arg == other

a=Cmp(1)
b=Cmp(1)

assert a == b
assert not (a != b)

# issue 218
a = [1,2,3]
a *= 2
assert a == [1, 2, 3, 1, 2, 3]

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
assert 2**3**4 == 2417851639229258349412352

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

import base64
buf = bytearray(b'EZ\x86\xdd\xabN\x86\xdd\xabNE[\x86\xdd\xabN\x86\xdd\xabN')
b64 = base64.b64encode( buf )
assert b64 == b'RVqG3atOht2rTkVbht2rTobdq04='

# issue 279
x = 0
if False: x+=2;x+=3
for n in range(2): x+=1;x+=1
assert x==4

# issue 280
for n in range(5):
    pass
assert n==4

# issue 294
assert int.from_bytes(bytes=b'some_bytes',byteorder='big') == 545127616933790290830707

# issue 296
assert [4,0,4].index(4,1) == 2

#issue 297
assert type((1,)*2) == tuple

t = 1, 2
try:
    t[0] = 1
    raise Exception('should have raised AttributeError')
except AttributeError:
    pass

# issue 298
n = 1
for n in range(n): pass
assert n == 0

#issue 301
t = 1,2
assertRaises(AttributeError, getattr, t, "__setitem__")

# issue 303
assert "{0:.{1}f}".format(1.123,1) == "1.1"

# issue 305
a = [1, 2, 3]
assert a.sort() is None

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

for x in 1, 1.2, 1+2j, 2**54:
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
for a,*b in [[1, 2, 3]]:
    assert a == 1
    assert b == [2, 3]

# issue 327
def f():
    a += 1

assertRaises(UnboundLocalError, f)

def f():
    a = a+1

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
    for i in 1,2:
        if i==2:
            x = a
        else:
            a = 1
    return x

assert f()==1

def f():
    for i in 1,2:
        if i==2:
            a += 1
        else:
            a = 1
    return a

assert f()==2

# issue 335
def f():
    "hello"("3")

assertRaises(TypeError, f)

# issue 342
try:
    from .spam import eggs
except SystemError as ie:
    assert str(ie)=="Parent module '' not loaded, cannot perform relative import"

# issue 343
a76gf = 0

def f():
    a76gf = 1
    def g():
        nonlocal a76gf
        a76gf=a76gf+1
        return a76gf
    assert g()==2
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
    def foo(self): return 42

assert C().foo() == 42

# issue 348
x, y = y, x = 2, 3
assert x, y == (3, 2)

# issue 350
a = float("-inf")
b = float("-infinity")
assert a == b
assert repr(a) == '-inf'
assert a * 1. == b
assert a * 1 == b

# issue 352
a = float("inf")
assert a*1 == a

# issue 355
class kk:
    def __init__(self, enum):
        pass

lambda enum: enum

def foo(enum): pass

# issue 360
assert "André".isidentifier()

# issue 361
FULL_ENGLISH_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
FULL_ENTEAN_ALPHABET =  "AZYXEWVTISRLPNOMQKJHUGFDCB"
tran_tab = str.maketrans(FULL_ENGLISH_ALPHABET, FULL_ENTEAN_ALPHABET, 'sh')
assert "PETEshelley".translate(tran_tab) == "MEHEelley"

# issue 363
a = float('nan')
b = 1
c = a-b

# issue 371
assert (not 'x' in ['x', 'y'] and 2==1) == False

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
    ["a"]+5

assertRaises(TypeError, f)

# sum with booleans
assert sum([True, False]) == 1
assert 1.2+True == 2.2

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

# issue 423
assert 'a'.islower()
assert 'A'.isupper()
assert 'Ⰰ'.isupper() # U+2C00     GLAGOLITIC CAPITAL LETTER AZU
assert 'a0123'.islower()
assert not '0123'.islower() # no uppercase, lowercase or titlecase letter
assert not '0123'.isupper()
assert not '!!!'.isupper()
assert not '!!!'.islower()

# issue 421
assert "{:.0f}".format(2.1) == "2"
assert "{:.0f}".format(-2.1) == "-2"

# set attribute __doc__ of a function
def test():
    """original text"""
    pass

assert test.__doc__ == """original text"""
test.__doc__ = "new text"
assert test.__doc__ == "new text"

# issue 433

# Once pull request 494 is integrated we should
# use `math.isclose` instead of `my_isclose`
# Floats should not test for equality !
import math
def my_isclose(a, b, rel_tol=1e-09, abs_tol=1e-09):
    if a == b:
        return True
    diff = abs(a-b)
    return diff <= abs(a)*rel_tol or diff <= abs(b)*rel_tol or diff <= abs_tol

assert my_isclose(10**1j, (-0.6682015101903132+0.7439803369574931j))
assert my_isclose(10.5**(3+1j), (-814.610144261598+822.4998197514079j))

assert my_isclose(math.e**1j, (0.5403023058681398+0.8414709848078965j))

assert my_isclose((1+2j)**1j, (0.2291401859804338+0.23817011512167555j))

# issue 434
import collections
Set = collections.defaultdict(lambda: None)
Set[0]
Set[int]
Set[str]

# issue 443
class Pepe:
    def __getitem__(self, arg):
        return arg

pepe = Pepe()

assert pepe[0:1] == slice(0, 1)

assert pepe[1,0,0:10:2] == (1, 0, slice(0, 10, 2))
assert pepe[0, 0:10:1] == (0, slice(0, 10, 1))
assert pepe[0,0] == (0, 0)
assert pepe[0,:] == (0, slice(None, None, None))
assert pepe[0,1,1,1,2,3,4,:] == (0, 1, 1, 1, 2, 3, 4, slice(None, None, None))

# issue 448
d = { 0 : [1] }
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
assert copy.copy({1:2}) == {1:2}

# issue 456
assert {0, 1, 2}.issuperset([0, 1])
assert not {0, 1, 2}.issuperset([2, 3])

assert {0, 1}.issubset(range(3))
assert not {7, 8}.issubset([6, 7])

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
d = {a:1,b:2}

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

    def __setattr__(self,name,value):
        global flag
        if not name.startswith('_'):
            self._dct[name]=value
            #print("Test setting", name, "to", value)
            flag = True
        else:
            super().__setattr__(name,value)
    def __getattr__(self):
        if not name.startswith('_'):
            return self._dct[name]
        else:
            return getattr(self,name)

t=Test()
extend_instance(t,Mixin)
t.c=20
assert flag

# bug in comprehensions
a = [1, 2]
b = [3, 4]
odd = [x for x in a+b if x%2]
assert odd == [1, 3]

# Bug in generators (GitHub Issue #502)

def test_gen():
    for i in range(1):
        yield i
    return 20

g = test_gen()
next(g)
try:
    next(g)
except StopIteration as exc:
    assert exc.value == 20


# Bug in round (GitHub Issue #506)

class TestRound:
    def __round__(self, n=None):
        if n is None:
            return 10
        else:
            return n
tr = TestRound()


assert type(round(3.0)) == int, "Round called without second argument should return int"
assert type(round(3.1111, 3)) == float, "Round called without second argument should return same type as first arg"
assert type(round(3.0, 0)) == float, "Round called without second argument should return same type as first arg"
assert round(3.1111, 3) == 3.111
assert type(round(0, 3)) == int, "Round called without second argument should return same type as first arg"
assert round(tr, 3) == 3, "Round called on obj with __round__ method should use it"
assert round(tr) == 10, "Round called on obj with __round__ method should use it"

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

# issue 529
x = [-644475]
assert "{:,}".format(int(x[0])) == "-644,475"

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
y=-1;
assert y == -1

# issue 553
sxz = 'abc'
assert [sxz for sxz in sxz] == ['a', 'b', 'c']
assert {sxz for sxz in sxz} == {'a', 'b', 'c'}
assert {sxz:sxz for sxz in sxz} == {'a': 'a', 'b': 'b', 'c': 'c'}
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

# issue 558
a = set([5, 10])
b = set(a)
a.difference_update([5])
assert a == {10}
assert b == {5, 10}

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

# Issue 572: Sort should be stable
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
assert ("tester1", "patcher2") == Patched().method("tester1"), "instead returns %s %s" % Patched().method()

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

# issue 601
assert {1:1}.keys() == {1}
assert {1} == {1:1}.keys()
assert {1:1}.items() == {(1,1)}
assert {1:2}.values() == {2}

# issue 602
d = {} #should crash with mutation in for loop dict error
d[1] = 1
try:
    for i in d:
        d[i+1] = 1
    raise Exception('should fail')
except RuntimeError:
    pass

# issue 603
import copy
a = [[1],2,3]
b = copy.copy(a)
b[0] += [10]
assert a == [[1, 10], 2, 3]
assert b == [[1, 10], 2, 3]

# issue 604
class StopCompares:
    def __eq__(self, other):
        return 1/0

checkfirst = list([1, StopCompares()])
assert(1 in checkfirst)

# issue 614
from collections import namedtuple
N = namedtuple('N', 'spam, length, eggs')
n = N(5, 6, 7)
assert n.length == 6

M = namedtuple('M', 'a, b, c')
m = M(5, 6, 7)
try:
    m.length
    raise AssertionError("should have raised AttributeError")
except AttributeError:
    pass

# issue 615
class A:
    spam = 5

try:
    a = A(5)
    raise AssertionError("should have raised TypeError")
except TypeError:
    pass

try:
    class A(spam="foo"):
        pass
    raise AssertionError("should have raised TypeError")
except TypeError:
    pass

# issue 619
import sys
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
found = [x for x in ['a','b','c']
                     if x and not x.startswith('-')][-1]
assert found == 'c'

assert [0, 1][-1] == 1
assert {-1: 'a'}[-1] == 'a'

# issue 691
class C(object): pass
c1 = C()
c1.x = 42
assert c1.__dict__['x'] == 42
c1.__dict__.clear()
assert c1.__dict__ == {}

class C(object): pass
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
assert type( (1,2,3)[:0] ) == tuple
assert type( (1,2,3)[1:2:-1] ) == tuple
assert type( (1,2,3)[0:2] ) == tuple

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

# issue 731
from random import randrange
assert set([randrange(1, 4, 1) for i in range(100)]) == set([1, 2, 3])
assert set([randrange(1, 4, 2) for i in range(100)]) == set([1, 3])
assert set([randrange(0, 4, 2) for i in range(100)]) == set([0, 2])
assert set([randrange(0, 5, 2) for i in range(100)]) == set([0, 2, 4])
assert set([randrange(1, 4, 3) for i in range(100)]) == set([1])
assert set([randrange(0, 4, 3) for i in range(100)]) == set([0, 3])
assert set([randrange(0, 5, 3) for i in range(100)]) == set([0, 3])
assert set([randrange(0, 6, 3) for i in range(100)]) == set([0, 3])
assert set([randrange(0, 7, 3) for i in range(100)]) == set([0, 3, 6])
assert set([randrange(1, 4, 3) for i in range(100)]) == set([1])
assert set([randrange(1, 5, 3) for i in range(100)]) == set([1, 4])
assert set([randrange(1, 6, 3) for i in range(100)]) == set([1, 4])
assert set([randrange(1, 7, 3) for i in range(100)]) == set([1, 4])
assert set([randrange(1, 8, 3) for i in range(100)]) == set([1, 4, 7])


# issue 743
def test(msg = 'a', e_type: int = 10):
    pass

# issue 744: Javascript objects should allow integer attribute names.
from browser import window
a = window.Uint8ClampedArray.new(10)

for i in range(10):
    a[i] = i
    assert a[i] == i

# issue 749
assert float.__eq__(1.5, 1.5)
assert float.__eq__(1.0, 1)
assert not float.__eq__(1, 0)
assert int.__eq__(1, 1)
assert not int.__eq__(1, 0)

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

# Issue 753
# This array trips over a bug in the sorting library that we use:
#    see https://github.com/mziccard/node-timsort/issues/14
a = [1.0, 1.0, 1.0, 1.0, 1.0, 0.5, 1.0, 0.5, 0.5, 1.0,
     0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 1.0, 0.5,
     0.5, 0.5, 0.5, 0.5, 1.0, 0.5, 1.0, 0.5, 0.5, 0.5,
     0.6, 1.0]

a.sort()
for i in range(len(a) - 1):
    assert a[i] <= a[i+1]


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

# issue 765
def sub_gen(expect):
    res = yield None
    assert res == expect, "Value should be sent to the inner generator"
    return res

def main_gen(expect):
    r = yield from sub_gen(expect)
    assert r == expect, "Value returned from the inner generator should be result of yield from expression"
    return r

expect_value = 30
g = main_gen(expect_value)
assert g.send(None) is None
try:
    g.send(expect_value)
    assert False, "Return from iterator should send StopIteration"
except StopIteration as e:
    assert e.value == expect_value

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
try:
    os.listdir()
    raise Exception("should have raised NotImplementedError")
except NotImplementedError:
    pass

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

# issue 794
assert (-1024).to_bytes(2, "big", signed=True) == b'\xfc\x00'
assert (1024).to_bytes(2, "big") == b'\x04\x00'
assert (1024).to_bytes(2, "little") == b'\x00\x04'

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

# issue 823
x = 5
s = "Distance {}km".format(x)
assert s == "Distance 5km"

x = 5.1
s = "Distance {}km".format(x)
assert s == "Distance 5.1km"

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
import random
assert type(random) == type(sys)

# issue 843
import sys

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


# Issue 859
import traceback as tb

def f():
    return 1 / 0

try:
    f()
except Exception:
    exception_info = tb.format_exc()
    assert 'f()' in exception_info
    assert '1 / 0' in exception_info
    assert ', in f' in exception_info

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

# ==========================================
# Finally, report that all tests have passed
# ==========================================
print('passed all tests')
