class Foo(object):
  def __init__(self): self.value = 10

  def __rsub__(self, other): return 55

  def __rlshift__(self, other): return other * self.value

  def __rmul__(self, other): return 77
  
assert 1.5 << Foo() == 15.0
assert 2 << Foo() == 20
assert 'a' << Foo() == 'aaaaaaaaaa'

try:
    print(Foo()*Foo())
except TypeError:
    pass
except:
    raise

d={'a':1,'b':2}
try:
    d+1
except TypeError:
    pass
except:
    raise
    
assert d*Foo()==77

t = [1, 2, 'a']

try:
    d*3.5
except TypeError:
    pass
except:
    raise

assert t-Foo()==55

# infix operator : recipe on the ActiveState cookbook
# http://code.activestate.com/recipes/384122-infix-operators/

# definition of an Infix operator class
# this recipe also works in jython
# calling sequence for the infix is either:
#  x |op| y
# or:
# x <<op>> y

class Infix:

    def __init__(self, function):
        self.function = function

    def __ror__(self, other):
        return Infix(lambda x, self=self, other=other: self.function(other, x))

    def __or__(self, other):
        return self.function(other)

    def __call__(self, value1, value2):
        return self.function(value1, value2)

# Examples

# simple multiplication
x=Infix(lambda x,y: x*y)
assert 2 |x| 4 == 8

# class checking
isa=Infix(lambda x,y: x.__class__==y.__class__)
assert [1,2,3] |isa| []

# inclusion checking
is_in=Infix(lambda x,y: x in y)
assert  1 |is_in| {1:'one'}

# an infix div operator
import operator
div=Infix(operator.floordiv)
assert (10 |div| (4 |div| 2)) == 5

# functional programming (not working in jython, use the "curry" recipe! )
def curry(f,x):
    def curried_function(*args, **kw):
        return f(*((x,)+args),**kw)
    return curried_function
curry=Infix(curry)

add5= operator.add |curry| 5
assert add5(6) == 11

