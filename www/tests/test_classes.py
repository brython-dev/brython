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

print('passed all tests..')
