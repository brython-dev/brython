# issue 3
matrix = ['%s%d'%(a,n) for a in 'abc' for n in [1,2,3]]
assert 'a1' in matrix

# issue 5
range_tuple = tuple(range(7))
assert range_tuple == (0,1,2,3,4,5,6)

# issue 6
map_tuples = zip( 'abc', [1,2,3])
map_array = ['%s%d'%(l, n) for l, n in map_tuples
    if '%s%d'%(l, n) in 'a1b2']
assert 'a1' in map_array, 'incorrect tuple %s'%map_array

# issue 7
def fail_local():
    local_abc = 'abc'
    letnum = [[letter+str(num) for letter in local_abc]
            for num in range(3)]
    return letnum

local_fail = fail_local()
assert ['a0', 'b0', 'c0'] in local_fail, 'failed local %s'%local_fail

def fail_local1():
    local_abc = 'abc'
    letnum = dict((num,[letter+str(num) for letter in local_abc]) for num in range(3))
    return letnum

fail_local1()

# issue 14
a = {1:1,2:4}
assert a.pop(1) == 1, 'Error in pop'
assert a=={2:4}

# issue 15
def no_lambda(fail_arg):
    lbd = lambda arg= fail_arg: arg
    return [i for i in lbd()]

assert no_lambda([1,2]) == [1,2], 'Fail lambda namespace'

# issue 16
class Noeq:
    def __init__(self,oid):
        self.oid = oid

ne1, ne2 = Noeq(0),Noeq(1)
fail_rmv = [ne1, ne2]
fail_rmv.remove(ne1)
assert fail_rmv == [ne2], 'Fail remove obj from list'

# issue 17
class No_dic_comp:
    def __init__(self,oid):
        self.oid = oid
        self.ldic = {i: self.oid for i in 'ab'}

ndc = No_dic_comp(0)
assert ndc.ldic['a'] == 0, ne1

# issue 18
class Base:
    pass

class No_inherit(Base):
    def __init__(self,oid,ab):
        self.oid , self.ab= oid, ab

ndc = No_inherit(0,'ab')
assert  isinstance(ndc,No_inherit),'Not instance %s'%ndc
assert ndc.oid == 0,  ndc.oid

# issue 19
class No_static:
    OBJID = 0
    def __init__(self,oid):
        self.oid = oid
        self.gid = No_static.OBJID
        No_static.OBJID += 1

gids = (No_static(0).gid,No_static(1).gid)
assert gids == (0,1), 'Fail incrementing static (%d,%d)'%gids

# issue 20
assert 'fail slice string!'[5:-1] == 'slice string', 'Failure in string slicing'

#issue 21
_s='   abc   '
assert _s.rjust(15, 'b') == 'bbbbbb   abc   '

# issue 23 : json
import json
original = [[1,1],{'1':1}]
pyjson = str(original).replace("'",'"').replace(' ','')
jsoned=json.dumps(original).replace(' ','')
pythoned=json.loads(jsoned)
assert original == pythoned, 'python %s is not json %s'%(original, pythoned)
assert jsoned == pyjson, 'json %s is not python %s'%(jsoned, pyjson)

x = """{
    "menu": {
        "id": "file",
        "value": "File",
        "popup": {
            "menuitem": [
                { "value": "New", "onclick": "CreateNewDoc()" },
                { "value": "Open", "onclick": "OpenDoc()" },
                { "value": "Close", "onclick": "CloseDoc()" }
            ]
        }
    }
}"""
y = json.loads(x)
assert y["menu"]["value"]=="File"
assert y["menu"]["popup"]["menuitem"][1]["value"]=="Open"

# issue 24
import math
eval_zero = eval('math.sin(0)')
exec('exec_zero=math.sin(0)')
assert eval_zero == exec_zero, 'no math in exe or eval for sin(0) = %f'%math.sin(0)

# issue 29
import math
eval_zero = eval('math.sin(%d)'%0)
#eval_zero = 0
exec('exec_zero=math.sin(%d)'%0)
assert eval_zero == exec_zero, ' exe or eval for fails string subs = %f'%math.sin(0)

# issue 30
def delete(delete):
    return delete

class Delete:
    def delete(self):
        delete = 0
        return delete

delete = delete(Delete().delete())
assert delete == 0, 'name delete cannot be used %s'%delete

# issue 31
SEED= 0
class Base:
    def __init__(self):
        global SEED
        self.value = SEED = SEED + 1

class Inherit(Base):
    def __init__(self):
        global SEED
        self.value = SEED = SEED + 1

one = (Inherit().value)
assert one == 1, 'Init recursed: %d'%one

#issue 43
class myclass:
  @property
  def getx(self):
      return 5

c=myclass()
assert c.getx == 5

#issue 45

assert 2**2 == 4
assert 2.0**2 == 4.0
assert 2**2.0 == 4.0
assert 2.0**2.0 == 4.0
#also do 3**2 since 2**2 == 2*2
assert 3**2 == 9
assert 3.0**2 == 9.0
assert 3**2.0 == 9.0
assert 3.0**2.0 == 9.0

# issue 55
assert 1 <= 3 <= 5
assert not 1 <= (3+3) <= 5

# issue 70
class Dummy:
    def __init__(self, foo):
        self.foo = foo

dummy = Dummy(3)

assert -dummy.foo == -3

# issue 71
def rect(x,y,width, height):
    pass

assert [rect(x=0, y=0, width=10, height=10) for i in range(2)], 'error in list'

# issue 75
assert {0:42}[0] ==  42

# issue 80
def twice(n):
    yield n
    yield n
f = twice(2)
assert next(f) == 2
assert next(f) == 2

# issue #81
class foo:
    def __init__(self,x):
        self.x = x
    def __ior__(self,z):
        self.x = 33
        return self
    def __str__(self):
        return self.x

X = foo(4)
X |= 1
assert X.x == 33

# issue 85

try:
    exec("def foo(x, x, x=1, x=2):\n pass")
    # -> does not raise SyntaxError
    raise Exception('should have raised SyntaxError')
except SyntaxError:
    pass

def foo(x, y, verbose=False):
    pass

try:
    foo(1, 2, 3, verbose=True)
    raise Exception('should have raised TypeError')
except TypeError:
    pass

try:
    eval("foo(1, 2, 3, verbose=True, verbose=False)")
    raise Exception('should have raised SyntaxError')
except SyntaxError:
    pass

# issue #86
def foo(x, *args, verbose=False):
    assert locals()=={'verbose':False,'x':1,'args':(2,)}

foo(1, 2)

# issue #87

def foo(*args):
    assert isinstance(args,tuple)

foo(1,2)

# issue 95 : trailing comma in dict or set literals
a = {1,2,}
assert a == {1,2}

b = {'a':1,'b':2,}
assert b == {'a':1,'b':2}

#issue 101   - new style classes are the default
class MyClass(object):
  def __init__(self, s):
      self.string=s

class MyClass1:
  def __init__(self, s):
      self.string=s

_m=MyClass("abc")
_m1=MyClass1("abc")
#assert dir(_m) == dir(_m1)    <===  fix me, these should be equal
assert _m.string==_m1.string

# issue 112
x=0
class foo:
    y = 1
    z = [x,y]
assert foo().z == [0,1]

#issue 114
import random

_a=random.randrange(10)
assert 0 <= _a < 10

_a=random.randrange(1,10)
assert 1 <= _a < 10

_a=random.randrange(1,10,2)
assert _a in (1,3,5,7,9)

# issue 118
assert 1.27e+5 == 127000.0
assert 1.27E+5 == 127000.0
assert 1.27e+5 == 127000.0
assert 1.27E5 == 127000.0

# issue 122
class Cl(object):
    def __init__(self):
        self._x = None

    @property
    def x(self):
        return self._x

    @x.setter
    def x(self, value):
        self._x = value

my_cl = Cl
my_cl.x = 123
assert my_cl.x==123

# issue 125
a = [1,2]
a.clear()
assert a == []

a = [3,6,'a']
c = a
b = a.copy()
assert b == a
b.append(4)
a.append(99)

assert b != a
assert c == a

# issue 126
assert ''' \'inner quote\'''', 'fails inner quote'
assert " \'inner quote\'", 'fails inner quote'
assert ' \'inner quote\'', 'fails inner quote'
assert """ \"inner quote\"""", 'fails inner quote'
assert " \"inner quote\"", 'fails inner quote'

# issue 128
LIST = []
class Parent:
    def __init__(self):
        self.level = self.get_level()
        self.inherited()
    def get_level(self): return 0
    def inherited(self):
        self.override()
        return self
    def override(self):
        LIST.append((self, self.level))
        return self


class Child(Parent):
    def get_level(self): return 1
    def override(self):
        LIST.append((self, self.level))
        return self


class Sibling(Parent):
    def __init__(self):
        self.level = self.get_level()
        Parent.__init__(self)
    def get_level(self): return 1
    def override(self):
        LIST.append((self, self.level))
        return self

parent = Parent()
#assert str(parent)=='<Parent object>',str(parent)
child = Child()
#assert str(child)=='<Child object>'
sibil = Sibling()
#assert str(sibil)== '<Sibling object>'
given = sibil.override()
assert sibil.level==1
assert given.level==1
assert [l[1] for l in LIST]==[0,1,1,1]

assert parent == parent.override()
assert sibil == given

# issue 129
def rect(x,y,width, height):
    pass

def comp(x,y,width, height):
    return[rect(x=x, y=y, width=10, height=10) for i in range(2)]

assert comp(1,2,3,4), 'error in list'

# issue 132
a = 1
if a is not None and not isinstance(a,int):
    raise AssertionError

# issue 134
run_else = False
for i in range(4):
 pass
else:
 run_else = True

assert run_else

run_else = False
assert not run_else
for i in range(10):
 if i>7:
  break
else:
 run_else = True

assert not run_else

run_else = False
n=10
while n>5:
 n -= 1
else:
 run_else = True

assert run_else    

# issue 135
assert pow(*(2,3)) == 8
assert pow(*(2,-3)) == 0.125
assert pow(*(-2,3)) == -8
assert pow(*(-2,-3)) == -0.125

# issue 137
assert int('-10') == -10

# issue 139
try:
    d = []
    d[3]
except (IndexError,TypeError) as err:
    pass # just check that there is no SyntaxError

# issue 157 : check that the 2nd line doesn't raise a SyntaxError
y=1 
a=(1/3,-y/4)

# issue 158
class A:
    def __init__(self,val):
        self.a=val

class B:
    def __init__(self,val):
        self.b=val
        self.c=A(val)

b=B(2)
#assert str(b)=='<B object>'

# issue #166
assert pow(2,3,4) == 0
assert pow(2,3,3) == 2
try:
    pow(2.2,3,4)
    raise Exception('should have raised TypeError')
except TypeError:
    pass
try:
    pow('2',3)
    raise Exception('should have raised TypeError')
except TypeError:
    pass

# issue 170
assert (lambda *args:args)(3,4,5)==(3, 4, 5)

# issue 173
def gofun(fun):
    def ifun():
        funi = fun
        return [fun(i) for i in (0,1)]
    return ifun()

def pr(x):
    return x

zero_one = gofun(pr)
assert zero_one == [0, 1], 'Expected [0, 1] but got: %s'% zero_one

# issue 174
assert '%d' % (1,) == '1'

# issue 175
def foo():
    pass
r = foo()
assert r is None

# issue 177
class _ParameterKind(int):
    def __new__(self, *args, name):
        obj = int.__new__(self, *args)
        obj._name = name
        return obj

    def __str__(self):
        return self._name

    def __repr__(self):
        return '<_ParameterKind: {!r}>'.format(self._name)

_POSITIONAL_ONLY        = _ParameterKind(0, name='POSITIONAL_ONLY')

# issue 198
assert 2 << 16 != 4
assert 2 << 16 == 131072

# issue 208
try:
    spam = 0
except:
    spam = 1
else:
    spam = 2
assert spam == 2

# issue 209
assert "ko" if None else "ok"=="ok"
assert ("ko" if None else "ok")=="ok"
assert ("ko" if [] else "ok")=="ok"
assert ("ko" if {} else "ok")=="ok"
assert ("ko" if False else "ok")=="ok"

# issue 210
class myRepr:
  def repr(self, a):
      return a

class myclass:
    _repr=myRepr()
    repr= _repr.repr

    def myfunc(self):
        return self.repr('test')

_m=myclass()
assert _m.myfunc()=='test'

# issue 212
class Test:
    def sound(self, a=""):
        return "moo: " + a

class Test2(Test):
    def sound(self):
        return super().sound("apple")

assert Test2().sound()=='moo: apple'

# issue 213
import math
assert str(math.atan2(0.,-0.)).startswith('3.14')

# issue 214
n = 0
assert 1+n if n else 0 == 0
n = 7
assert 1 + n*n if n else 0 == 50

# issue 217
def myfunc(code, code1):
    code.append('1')
    code.append('2')
    code.append('3')

a=[]
b=0
myfunc(a, b)

assert a==['1', '2', '3']

# issue 218
_d = { 0: b'a', 1: b'b'}

assert [v[0] for v in _d.items()] == [0, 1]


# issue 219
y=3
w=2
w2=1

y, w, w2 = -y, -w, -w2
assert y == -3
assert w == -2
assert w2 == -1

#issue 220
assert '{} {} {}'.format(1, 2, 3) == '1 2 3'

# issue 222
atuple = ()
assert not type(atuple) != type(atuple), "type of tuple is different of itself"

# bug in assignment of attributes or subscriptions to exec() or eval()
x={}
x['a'] = eval("2")
assert x=={'a':2}

# issue 224
assert '{0}, {1}, {2}'.format('a', 'b', 'c') == 'a, b, c'

# issue 225
a = dict()
a[1,2]=3
assert a[1,2] == 3

# issue 226
b = { -20 : -1, -21 : 2, 2 : 0 }

# issue 227
b = [ ((-20, 2), 1), ((-21, 1), 2), ((-2,0), 2)]
assert sorted(b) == [((-21, 1), 2), ((-20, 2), 1), ((-2, 0), 2)]

# bug in string format
assert 'Coordinates: {latitude}, {b}'.format(latitude='2', b='4')=='Coordinates: 2, 4'

# check that trailing comma is supported in function calls
def foo(a=2,):
    print(a)

# issue 236 : packing
a,*b,c = [1, 2, 3, 4, 5]
assert a==1
assert b==[2,3,4]
assert c==5

*a,b = [1, 2, 3, 4, 5]
assert a==[1, 2, 3, 4]
assert b==5

a,b,*c = [1, 2, 3, 4, 5, 6]
assert a==1
assert b==2
assert c==[3, 4, 5, 6]

# issue 237
res = []
for i in -1,0,1:
    res.append(i)

y = 2
for i in -3*y,2*y:
    res.append(i)

assert res==[-1, 0, 1, -6, 4]

# issue 238
import operator

# example used in the docs
inventory = [('apple', 3), ('banana', 2), ('pear', 5), ('orange', 1)]
getcount = operator.itemgetter(1)

assert list(map(getcount, inventory)) == [3, 2, 5, 1]
assert sorted(inventory, key=getcount) == [('orange', 1), ('banana', 2), ('apple', 3), ('pear', 5)]

# issue 239
assert '' in ''

# issue 240
d = dict.fromkeys(['a','b'],3)
assert d=={'a':3, 'b':3}

# augmented assignement in class body
class A:
    x = 8
    x += 1

assert A().x==9

# issue 243
class Dad:
    @property
    def prop(self):
        return 1

    @prop.setter
    def prop(self, val):
        print(200 + val)

x = []

class Son(Dad):
    @Dad.prop.setter
    def prop(self, val):
        x.append(400 +val)


son = Son()
son.prop = 4
assert x ==[404]

# issue 247
zlist = [0]
assert zlist == [1] or zlist == [0]

# issue 264
import itertools
assert list(itertools.permutations([1,2,3])) == [(1, 2, 3), (1, 3, 2), (2, 1, 3), (2, 3, 1), (3, 1, 2), (3, 2, 1)]

# issue 268
from base64 import b64encode, b64decode
assert b64encode(b'decode error') == b'ZGVjb2RlIGVycm9y' 
assert b64decode(b'ZGVjb2RlIGVycm9y') == b'decode error'

# issue 272
assert round(-0.9) == -1

# issue 275
text='a'
assert text.split(';',1) == ['a']

# issue 276
import re
pat=re.compile(r"(\<[a-z0-9A-Z\-]+\>)")

s="this is <fun> is <it> not"

result=re.search(pat, s)
assert result.groups() == ('<fun>',)

# issue 279
# check that this doesn't raise a SyntaxError
data = [{'name': 'Data {}'.format(i+1), # comment
         'x': i+1} for i in range(10)] # x value
         
# issue 282
assert int('1') == 1
assert int('  1  ') == 1
assert int('1  ') == 1
assert int('  1') == 1
assert int(1) == 1
assert int(1.1) == 1
assert int('011', 2) == 3
assert int('011', 8) == 9

#issue 283
try:
    int("")
except ValueError:
    pass
try:
    int("   ")
except ValueError:
    pass

#issue 284
class CustomStr(str): pass

_a=CustomStr('')
assert isinstance(_a, str)

# issue 285
class Foo3(int):
  def __int__(self):
      return self

assert int(Foo3()) == 0

#issue 286
try:
  float('')
except ValueError:
  pass

#issue 287
try:
    max([])
except ValueError:
    pass
try:
    max(key = lambda x:x)
except TypeError:
    pass
try:
    max(default = 'k')
except TypeError:
    pass
assert max([], default = 'k') == 'k'
assert max([1,2,3], default = 'k') == 3
try:
    max(1,2,3, default = 'k')
except TypeError:
    pass
assert max(1,2,3) == 3
assert max([1,2,3]) == 3
assert max(1,2,3, key = lambda x: -x) == 1
assert max([1,2,3], key = lambda x: -x, default = 'k') == 1
assert min(1,2,3) == 1
assert min([1,2,3]) == 1
assert min(1,2,3, key = lambda x: -x) == 3

# issue 288
class CustomStr(str): pass
class CustomBytes(bytes): pass
class CustomByteArray(bytearray): pass

values = [b'100',
                  bytearray(b'100'),
                  CustomStr('100'),
                  CustomBytes(b'100'),
                  CustomByteArray(b'100')]

assert str(values)== "[b'100', bytearray(b'100'), '100', b'100', bytearray(b'100')]"

# issue 294
assert [1][::-1] == [1]
