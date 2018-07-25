class baz:
  A = 8
class bar(baz):
  x = 0
  def test(self):
    return 'test in bar'
  def test1(self,x):
    return x*'test1'

class truc:
    machin = 99

class foo(bar,truc):
 def test(self):
  return 'test in foo'
 def test2(self):
   return 'test2'

obj = foo()
#assert str(bar.test)=="<function bar.test>"
assert obj.A == 8
assert obj.x == 0
assert obj.test()=='test in foo'
assert obj.test1(2)=='test1test1'
assert obj.test2()=='test2'

assert obj.machin == 99

class stack(list):

    def dup(self):
        if len(self):
            self.append(self[-1])

x = stack([1,7])
assert str(x)=='[1, 7]'
x.dup()
assert str(x)=='[1, 7, 7]'

class foo(list):
    pass
class bar(foo):
    pass
assert str(bar())=='[]'

# subclass method of native JS object (issue #75)
class myint(int):
    def __add__(self, x):
        raise NotImplementedError
x = myint(42)
assert x==42
assert x-8==34 # instance supports method __sub__
try:
    print(x+10)
    raise ValueError('__add__ should raise NotImplementedError')
except NotImplementedError:
    pass

# __call__

class StaticCall():
    def __init__(self):
        self.from_init = 88
    def __call__(self, *args, **kwargs):
        return 99

assert StaticCall().from_init == 88
assert StaticCall()() == 99

# property and object descriptors

class myclass:
  def __init__(self):
    self.a = 2

  @property
  def getx(self):
      return self.a + 5

assert myclass().getx == 7

@property
def gety(self):
    print(self.a)
    return self.a + 9

x.gety = gety

assert x.gety is gety

# bug 61
class A:
    def __getattr__(self, x):
        return 2

assert A().y == 2

# Setting and deleting attributes in a class are reflected
# in the classes instances
class foo():pass
a = foo()
foo.x = 9
assert 'x' in dir(foo)
assert a.x==9

del foo.x
try:
    a.x
    raise Exception("should have raised AttributeError")
except AttributeError:
    pass


class myclass:
  pass

class myclass1(myclass):
  pass

a=myclass()
assert a.__doc__ == None

b=myclass1()
assert b.__doc__ == None

# classmethod
class A:
    def __init__(self, arg):
        self.arg = arg
    @classmethod
    def foo(cls, x):
        return cls(x)

assert A(5).foo(88).arg == 88

# If a rich-comparison method returns NotImplemented
# we should retry with the reflected operator of the other object.
# If that returns NotImplemented too, we should return False.
class EqualityTester:
    count = 0
    def __eq__(self, other):
        EqualityTester.count += 1
        return NotImplemented

class ReflectedSuccess:
    count = 0
    def __eq__(self, other):
        if isinstance(other, EqualityTester):
            return True
        elif isinstance(other, ReflectedSuccess):
            ReflectedSuccess.count += 1
            if self.count > 1:
                return True
            else:
                return NotImplemented

a, b = EqualityTester(), EqualityTester()
c = ReflectedSuccess()
assert not (a == b)                 # Both objects return Notimplemented => result should be False
assert EqualityTester.count == 2    # The previous line should call the __eq__ method on both objects
assert (c == c)                     # The second call to __eq__ should succeed
assert ReflectedSuccess.count == 2
assert (a == c)
assert (c == a)

class Tester:

    def __init__(self, name):
        self.name = name

    def __eq__(self, other):
        return NotImplemented

    def __ne__(self, other):
        return NotImplemented

    def __le__(self, other):
        return NotImplemented

    def __ge__(self, other):
        return NotImplemented

assert not (Tester('a') == Tester('b'))
assert Tester('a') != Tester('b')

try:
    Tester('x') >= Tester('y')
    raise Exception("should have raised TypeError")
except TypeError:
    pass

# singleton
class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]

class A(metaclass=Singleton):

    def __init__(self):
        self.t = []

A().t.append(1)
assert A().t == [1]

# reset __init__
class A:
    pass

def init(self, x):
    self.x = x

A.__init__ = init
a = A(5)
assert a.x == 5

# string representation
class A:

    def f(self, y):
        return y

    @classmethod
    def f_cl(cls, x):
        return x

a = A()
assert str(A.f) == "<function A.f>"
assert str(type(A.f)) == "<class 'function'>"
assert str(a.f) == "<bound method A.f of <__main__.A object>>"
assert str(type(a.f)) == "<class 'method'>"
assert str(a.f.__func__) == "<function A.f>"

assert a.f.__func__ == A.f
assert A.f_cl == a.f_cl

assert A.f_cl(3) == 3
assert a.f_cl(8) == 8

# A subclass inherits its parent metaclass
class Meta(type):
    pass

class A(metaclass=Meta):
    pass

class B(A):
    pass

assert type(B) == Meta

# name mangling
class TestMangling:
    def test(self):
        try:
            raise Exception(10)
        except Exception as __e:
            assert __e == __e

t = TestMangling()
t.test()

# call __instancecheck__ for isinstance()
class Enumeration(type):
    def __instancecheck__(self, other):
        return True


class EnumInt(int, metaclass=Enumeration):
    pass

assert isinstance('foo', EnumInt)

# metaclass with multiple inheritance
class Meta(type):
    pass

class A(metaclass=Meta):
    pass

class B(str, A):
    pass

assert B.__class__ == Meta

class C:
    pass

class D(A, C):
    pass

assert D.__class__ == Meta

class Meta1(type):
    pass
class Meta2(type):
    pass

class A1(metaclass=Meta1):
    pass
class A2(metaclass=Meta2):
    pass

try:
    class B(A1, A2):
        pass
    raise Exception("should have raised TypeError")
except TypeError:
    pass

class Meta3(Meta1):
    pass

class A3(metaclass=Meta3):
    pass

class C(A3, A1):
    pass

assert C.__class__ == Meta3



print('passed all tests..')
