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

