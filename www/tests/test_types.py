import sys

def _f(): pass

FunctionType = type(_f)
assert isinstance(_f, FunctionType)

LambdaType = type(lambda: None)         # Same as FunctionType
assert isinstance(lambda: None, LambdaType)

CodeType = type(_f.__code__)
assert isinstance(_f.__code__, CodeType)

MappingProxyType = type(type.__dict__)
assert isinstance(type.__dict__, MappingProxyType)

SimpleNamespace = type(sys.implementation)
assert isinstance(sys.implementation, SimpleNamespace)

def _g():
    yield 1

GeneratorType = type(_g())
assert isinstance(_g(), GeneratorType)

class _C:

    def _m(self): pass


MethodType = type(_C()._m)
assert isinstance(_C()._m, MethodType)

class A:
    pass

def f(*args):
    return args

m = MethodType(f, A)
assert m(6) == (A, 6)

BuiltinFunctionType = type(len)
assert isinstance(len, BuiltinFunctionType)

BuiltinMethodType = type([].append)     # Same as BuiltinFunctionType
assert isinstance([].append, BuiltinMethodType)

ModuleType = type(sys)
assert isinstance(sys, ModuleType)

try:
    raise TypeError
except TypeError:
    tb = sys.exc_info()[2]
    TracebackType = type(tb)
    FrameType = type(tb.tb_frame)

assert isinstance(tb, TracebackType)
assert isinstance(tb.tb_frame, FrameType)

GetSetDescriptorType = type(FunctionType.__code__)
assert isinstance(FunctionType.__code__, GetSetDescriptorType)

MemberDescriptorType = type(FunctionType.__globals__)
assert isinstance(FunctionType.__globals__, MemberDescriptorType)

# found at https://www.cs.cmu.edu/~112/notes/notes-oop-part1.html

from types import SimpleNamespace

# Now we can create new object representing dogs:

dog1 = SimpleNamespace(name='Dino', age=10, breed='shepherd')
assert str(dog1) == "namespace(name='Dino', age=10, breed='shepherd')", str(dog1)
assert dog1.name == "Dino"

# Next, let's show that this is in fact mutable:

dog1.name = 'Fred'
assert str(dog1) == "namespace(name='Fred', age=10, breed='shepherd')", str(dog1)
assert dog1.name == "Fred"

# Now let's show that == works properly:

dog2 = SimpleNamespace(name='Spot', age=12, breed='poodle')
dog3 = SimpleNamespace(name='Fred', age=10, breed='shepherd')

assert dog1 != dog2
assert dog1 == dog3

# Finally, let's see what the type of a dog object is:

assert str(type(dog1)) == "<class 'types.SimpleNamespace'>"

# issue 1726
from typing import TypedDict

class Movie(TypedDict, total=False):
    name: str
    year: int

# issue 1976
class A(TypedDict):
   a: int

assert A(a=1) == {'a': 1}


print("Passed all tests...")
