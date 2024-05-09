from tester import assert_raises

class baz:

    A = 8


class bar(baz):

    x = 0

    def test(self):
        return 'test in bar'

    def test1(self, x):
        return x * 'test1'


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
assert obj.test() == 'test in foo'
assert obj.test1(2) == 'test1test1'
assert obj.test2() == 'test2'

assert obj.machin == 99

class stack(list):

    def dup(self):
        if len(self):
            self.append(self[-1])


x = stack([1, 7])
assert str(x) == '[1, 7]'
x.dup()
assert str(x) == '[1, 7, 7]'

class foo(list):
    pass


class bar(foo):
    pass


assert str(bar()) == '[]'

# subclass method of native JS object (issue #75)
class myint(int):

    def __add__(self, x):
        raise NotImplementedError


x = myint(42)
assert x == 42
assert x - 8 == 34 # instance supports method __sub__
try:
    print(x + 10)
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
assert a.x == 9

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


a = myclass()
assert a.__doc__ == None

b = myclass1()
assert b.__doc__ == None

# classmethod
def g(obj, x):
  assert type(obj) is A
  return A(x)

class A:

    def __init__(self, arg):
        self.arg = arg

    @classmethod
    def foo(cls, x):
        return cls(x)

    bar = g

assert A(5).foo(88).arg == 88
assert A(6).bar(89).arg == 89

assert A(5).foo.__self__ is A

import re
_IS_BLANK_OR_COMMENT = re.compile(r'^[ ]*(#.*)?$').match

class B:

  def f(self):
    return 'f'

class A:
    f = B().f
    g = _IS_BLANK_OR_COMMENT
    def h(self):
      pass
    @classmethod
    def m(cls):
      pass

assert A.m.__self__ is A
assert A().f() == 'f'
assert A().g('# comment')

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
assert str(A.f).startswith("<function A.f")
assert str(type(A.f)) == "<class 'function'>", str(type(A.f))
assert str(a.f).startswith("<bound method A.f of"), str(a.f)
assert str(type(a.f)) == "<class 'method'>"
assert str(a.f.__func__).startswith("<function A.f")

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


# setting __class__
class A:pass
class B:
    x = 1

a = A()
assert not hasattr(a, 'x')
a.__class__ = B
assert a.x == 1

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

# issue 905
class A:
    prop: str


class B(A):
    pass


assert B.__annotations__ == {}

# issue 922
class A:

    __slots__ = ['_r']
    x = 0

    def __getattr__(self, name):
        A.x = "getattr"

    def __setattr__(self, name, value):
        A.x = "setattr"


a = A()
a.b
assert A.x == "getattr"
a.b = 9
assert A.x == "setattr"

# issue 1012
class test:

    nb_set = 0

    def __init__(self):
        self.x = 1

    @property
    def x(self):
        return 'a'

    @x.setter
    def x(self, val):
        test.nb_set += 1


t = test()
assert t.x == "a"
assert test.nb_set == 1, test.nb_set

# issue 1083
class Gentleman(object):
  def introduce_self(self):
    return "Hello, my name is %s" % self.name

class Base(object):pass
class Person(Base):
  def __init__(self, name):
    self.name = name

p = Person("John")
Person.__bases__=(Gentleman,object,)
assert p.introduce_self() == "Hello, my name is John"

q = Person("Pete")
assert q.introduce_self() == "Hello, my name is Pete"

# a class inherits 2 classes with different metaclasses
class BasicMeta(type):
    pass

class ManagedProperties(BasicMeta):
    pass

def with_metaclass(meta, *bases):
    class metaclass(meta):
        def __new__(cls, name, this_bases, d):
            return meta(name, bases, d)
    return type.__new__(metaclass, "NewBase", (), {})

class EvalfMixin(object):
  pass

class Basic(with_metaclass(ManagedProperties)):
  pass

class Expr1(Basic, EvalfMixin):
  pass

class Expr2(EvalfMixin, Basic):
  pass

assert Expr1.__class__ is ManagedProperties
assert Expr2.__class__ is ManagedProperties

# issue 1390
class desc(object):
    def __get__(self, instance, owner):
        return 5

class A:
    x = desc()

assert A.x == 5

# issue 1392
class A():
    b = "This is b"
    message = "This is a"

    def __init__(self):
        self.x = 5

assert "b" in A.__dict__
assert "message" in A.__dict__
assert "__init__" in A.__dict__

d = A.__dict__["__dict__"]
try:
    d.b
    raise Exception("should have raised AttributeError")
except AttributeError:
    pass

# super() with multiple inheritance
trace = []

class A:
  pass

class B:
  def __init__(self):
    trace.append("init B")

class C(A, B):
  def __init__(self):
    superinit = super(C, self).__init__
    superinit()

C()
assert trace == ['init B']

# issue 1457
class CNS:
    def __init__(self):
        self._dct = {}
    def __setitem__(self, item, value):
        self._dct[item.lower()] = value
    def __getitem__(self, item):
        return self._dct[item]

class CMeta(type):
    @classmethod
    def __prepare__(metacls, name, bases, **kwds):
        return {'__annotations__': CNS()}

class CC(metaclass=CMeta):
    XX: 'ANNOT'

assert CC.__annotations__['xx'] == 'ANNOT'

# similar to issue 600: == with subclassing
class A_eqWithoutOverride:
    pass

class B_eqWithoutOverride(A_eqWithoutOverride):
    pass

a_eqWithoutOverride = A_eqWithoutOverride()
b_eqWithoutOverride = B_eqWithoutOverride()
assert (a_eqWithoutOverride == a_eqWithoutOverride)
assert (b_eqWithoutOverride == b_eqWithoutOverride)
assert (a_eqWithoutOverride != b_eqWithoutOverride)
assert not (a_eqWithoutOverride == b_eqWithoutOverride)
assert (b_eqWithoutOverride != a_eqWithoutOverride)
assert not (b_eqWithoutOverride == a_eqWithoutOverride)

# issue 1488
class Foobar:

    class Foo:

        def __str__(self):
            return "foo"

    class Bar(Foo):

        def __init__(self):
            super().__init__()

        def __str__(self):
            return "bar"

assert str(Foobar.Bar()) == "bar"

# super() in a function outside of a class
def f():
    super()

try:
    f()
    raise Exception("should have raised RuntimeError")
except RuntimeError as exc:
    assert exc.args[0] == "super(): no arguments"

# super() with a single argument
# found in https://www.artima.com/weblogs/viewpost.jsp?thread=236278
class B:
    a = 1

class C(B):
    pass

class D(C):
    sup = super(C)

d = D()
assert d.sup.a == 1

# class attributes set to builtin functions became *static* methods for
# instances (is this documented ?)
def not_builtin(instance, x):
    return x

class WithBuiltinFuncs:

    builtin_func = abs
    not_builtin_func = not_builtin

    def test(self):
        # self.not_builtin_func(x) is self.__class__.not_builtin_func(self, x)
        assert self.not_builtin_func(3) == 3
        # self.builtin_func(x) is self.__class__.builtin_func(x)
        assert self.builtin_func(-2) == 2

WithBuiltinFuncs().test()

# Set attributes with aliased names
class A:

    def __init__(self):
        self.length = 0


a = A()
a.message = "test"
assert a.__dict__["message"] == "test"
assert a.length == 0

# issue 1551
class MyClass:

    def __init__(self):
       self.x = 1

    def __getattribute__(self, name):
        raise Exception("This will never happen")


m = MyClass()
try:
    m.x
except Exception as exc:
    assert exc.args[0] == "This will never happen"

# issue 1737
class A: pass

class B(A): pass

assert A.__bases__ == (object,)
assert B.__bases__ == (A,)

assert object.__bases__ == ()
assert type.__bases__ == (object,)
assert type.__mro__ == (type, object)
assert object.mro() == [object]
assert list.__bases__ == (object,)

try:
    type.mro()
    raise AssertionError('should have raised TypeError')
except TypeError:
    pass

# issue 1740
class A:

    class B:
        def __init__(self):
            pass

    B()

# issue 1779
class A:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        t.append('I am A')

t = []

class MetaB(type):
    def __call__(cls, *args, **kwargs):
        t.append('MetaB Call')
        self = super().__call__(*args, **kwargs)  # create
        return self


class B(metaclass=MetaB):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        t.append('I am B')

class C(B, A):
  pass

c = C()
assert t == ['MetaB Call', 'I am A', 'I am B']

del t[:]

D = type('C', (B, A,), {})

d = D()
assert t == ['MetaB Call', 'I am A', 'I am B']

# issue 1884
assert_raises(SyntaxError, exec, 'class(x):\n pass')

# reference to class inside class definition raises NameError
assert_raises(NameError, exec, "class A:\n A")

# also for annotations
assert_raises(NameError, exec, "class A:\n x:A")

# except with __future__ annotations
exec("""from __future__ import annotations
class A:
    x: A

assert A.__annotations__ == {'x': 'A'}
""", {})

# mangle attributes for augmented assignments
class A:

  def __init__(self):
      self.__scale = 1

  def upscale(self):
      assert self.__scale == 1
      self.__scale += 1

a = A()
a.upscale()
assert a._A__scale == 2

# setting attribute __class__ inside a class definition
class A:

  @property
  def __class__(self):
    return 99

assert A.__class__ is type
assert type(A.__dict__['__class__']) is property
assert A().__class__ == 99

# issue 2033
class Meta(type):
    def __new__(cls, name, bases, namespace):
        assert namespace.get("__qualname__", None) == "Foo"
        return super().__new__(cls, name, bases, namespace)

class Foo(metaclass=Meta):
    pass

# issue 2038
class Slotted:
    __slots__ = { "slot" }

assert Slotted.__slots__ == {"slot"}
assert str(Slotted.slot) == "<member 'slot' of 'Slotted' objects>"

s = Slotted()
s.slot = 42
assert Slotted.slot.__get__(s) == 42
assert s.slot == 42

assert_raises(AttributeError, setattr, s, 'x', 9)

# issue 2039
assert isinstance(classmethod(print), classmethod)
assert isinstance(staticmethod(print), staticmethod)
assert isinstance(property(print), property)

# issue 2043
class HasClassMethod:
    @classmethod
    def class_method(cls): pass

assert isinstance(HasClassMethod.class_method.__dict__, dict)

# issue 2057
trace = []

class PluginBase:
    @classmethod
    def __init_subclass__(cls, **kwargs):
        trace.append((cls, PluginBase))
        super().__init_subclass__(**kwargs)


class Client:
    # this is implicitly a @classmethod
    def __init_subclass__(cls, **kwargs):
        trace.append((cls, Client))
        super().__init_subclass__(**kwargs)


class Plugin(Client, PluginBase):
    def __init_subclass__(cls, **kwargs):
        trace.append((cls, Plugin))
        super().__init_subclass__(**kwargs)


class Plugin1(Plugin):
    pass

assert trace == [(Plugin, Client),
                 (Plugin, PluginBase),
                 (Plugin1, Plugin),
                 (Plugin1, Client),
                 (Plugin1, PluginBase)]

# `klass.x = y` is `klass.__class__.__setattr__(klass, x, y)`
t = []
class Meta(type):

  def __setattr__(cls, attr, value):
    t.append('Meta setattr')
    type.__setattr__(cls, attr, value)

class A(metaclass=Meta):
    ONE = 1

assert not t
A.TWO = 2
assert len(t) == 1

# bases of a class may not be classes
t = []

class Base:

  def __new__(cls, *args):
    t.append('new')
    return object.__new__(cls)

  def __init__(*args):
    t.append('init')

  def f(self):
    return 99

base = Base()
assert t == ['new', 'init']
base.g = 12

base2 = Base()
assert len(t) == 4

base2.truc = 754

class A(base, base2):
  x = 8

assert len(t) == 6

assert hasattr(Base, '__mro__')
assert not hasattr(A, '__mro__')

assert A.f() == 99
assert not hasattr(A, "g") # although A.__bases__[0] has "g"

assert not isinstance(A, type)

assert A.__class__ is Base

t = list[int]

assert not issubclass(t, type)

class B(list[int]):
  pass

# class with abstract method cannot be instanciated
import abc

class AbstractClass(metaclass=abc.ABCMeta):

    @abc.abstractmethod
    def abstractMethod1(self):
        pass


class ConcreteClass(AbstractClass):

    def __init__(self):
        self.me = "me"


assert_raises(TypeError, ConcreteClass)

# instances of a class that defines __eq__ and not __hash__
# are not hashable
class A:

  def __eq__(self, other):
    return True

hash(A)
assert_raises(TypeError, hash, A())

# metaclass __new__ and __init__ receive extra keyword arguments
class Meta(type):

  def __new__(meta, name, bases, ns, **kw):
      assert kw == {'x': 9}
      return type.__new__(meta, name, bases, ns)

  def __init__(cls, name, bases, ns, **kw):
      assert kw == {'x': 9}

class A(x=9, metaclass=Meta):
    pass

# create classes with type()
t = []

class Meta(type):

    def __new__(*args):
        t.append('new')
        return type.__new__(*args)

    def __init__(*args):
        t.append('init')


class B(metaclass=Meta):
    pass

assert t == ['new', 'init']

C = type('C', (B,), {'x': 1})
assert C.__class__ is Meta
assert t == ['new', 'init', 'new', 'init']

assert_raises(TypeError, type, 'D', (), {'x': 1}, metaclass=Meta)

D = type('D', (), {'x': 1})
assert D.__class__ is type

# issue 2159
class A:
  @property
  def m(self):
    return 1

assert A().m == 1

class B(A):
 @property
 def m(self):
   return super().m + 1

assert B().m == 2

# if A.__new__ returns a instance of a subclass of A, call A.__init__
t = []
class A:

  def __new__(cls):
      return object.__new__(B)

  def __init__(self, *args):
      t.append('init A')

class B(A):
  pass

A()
assert t == ['init A']

# report error when a property has no setter
class A:

  @property
  def x(self):
    return 'I am x'

a = A()
assert a.x == 'I am x'

assert_raises(AttributeError, setattr, a, 'x', 'coucou',
  msg="property 'x' of 'A' object has no setter")

# issue 2434
class A:
    def f(self, __v, **__kw):
        assert __v == 1
        assert _A__v == 1
        assert __kw == {'x': 2}
        assert _A__kw == {'x': 2}

A().f(1, x=2)
assert A.f.__code__.co_varnames == ('self', '_A__v', '_A__kw')

# issue 2435
class A:
    a = "-".join

assert A().a(['a', 'b']) == 'a-b'

print('passed all tests..')
