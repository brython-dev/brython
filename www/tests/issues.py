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
import datetime
target = time.struct_time([1970, 1, 1, 0, 0, 0, 3, 1, 0])
assert time.gmtime(0).args == target.args
target = time.struct_time([1970, 1, 1, 0, 1, 40, 3, 1, 0])
assert time.gmtime(100).args == target.args
target = time.struct_time([2001, 9, 9, 1, 46, 40, 6, 252, 0])
assert time.gmtime(1000000000).args == target.args
target1 = datetime.datetime(1969, 12, 31, 12, 0)
target2 = datetime.datetime(1970, 1, 1, 12, 0)
## depending on timezone this could be any hour near midnight Jan 1st, 1970
assert target1 <= datetime.datetime.fromtimestamp(0) <= target2

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
#assert type(foo.__dict__) == dict

# issue 183
x=4
cd=dict(globals())
cd.update(locals())
exec("x=x+4",cd)

assert x == 4
assert cd['x'] == 8

y=5
yd=dict(globals())
yd.update(locals())
co=compile("y=y+4","","exec")
exec(co,yd)

assert yd['y'] == 9
assert y == 5

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

t = 1,2
try:
    t[0]=1
except TypeError:
    pass

# issue 298
n = 1
for n in range(n): pass
assert n == 0

#issue 301 
t = 1,2
assertRaises(TypeError, t.__setitem__, 0, 1)

try:
    t[0]=1
except TypeError:
    pass
else:
    raise Exception('should have raised TypeError')

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
assert x, y == 3, 2

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

# issue 364
class A(list):
    def __init__(self, x):
        list.__init__(self, x)

z = A([1,2,3])
assert isinstance(z, A)
assert z == [1, 2, 3]
assert len(z) == 3
assert list.__len__(z) == 3

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

# ==========================================
# Finally, report that all tests have passed
# ==========================================
print('passed all tests')
