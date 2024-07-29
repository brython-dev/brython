import _typing
from tester import assert_raises

type NonGenTA = list[tuple]

assert NonGenTA.__name__ == 'NonGenTA'
assert NonGenTA.__module__ == '__main__'
assert NonGenTA.__type_params__ == ()
assert str(NonGenTA.__value__) == 'list[tuple]'

type GenTA[T] = list[tuple[T, T]]

assert GenTA.__name__ == 'GenTA'
assert GenTA.__module__ == '__main__'
assert str(GenTA.__type_params__) == '(T,)'
assert type(GenTA.__type_params__[0]) is _typing.TypeVar
assert str(GenTA.__value__) == 'list[tuple[T, T]]'

type GenTA1[U] = list[tuple[T, T]]

assert_raises(AttributeError, getattr, GenTA1, 'dummy')
assert_raises(NameError, getattr, GenTA1, '__value__',
    msg="name 'T' is not defined")

# generic function with lazy evaluation
def func[T:int](arg):
  assert str(T) == 'T'
  assert T.__bound__ == int
  assert T.__constraints__ == ()

func(0)

def dec1(f):
  t.append('dec1')
  return f

def dec2(f):
  t.append('dec2')
  return f

t = []

@dec1
@dec2
def func[T:(int, 1/0)](arg):
  assert str(T) == 'T'
  assert T.__bound__ is None
  assert_raises(ZeroDivisionError, getattr, T, '__constraints__')

assert t == ['dec2', 'dec1']
func(0)

# issue 2375
from typing import Protocol
from collections.abc import Sized
class MySized(Sized, Protocol):
    pass

# PEP 696
from typing import TypeVar, Generic, reveal_type

DefaultStrT = TypeVar("DefaultStrT", default=str)
DefaultIntT = TypeVar("DefaultIntT", default=int)
DefaultBoolT = TypeVar("DefaultBoolT", default=bool)
T = TypeVar("T")
T1 = TypeVar("T1")
T2 = TypeVar("T2")

try:
  class NonDefaultFollowsDefault(Generic[DefaultStrT, T]): ...  # Invalid: non-default TypeVars cannot follow ones with defaults
  raise AssertionError('should have raised TypeError')
except TypeError as exc:
  print(exc.args[0])
  pass

class NoNoneDefaults(Generic[DefaultStrT, DefaultIntT]): ...

(
    NoNoneDefaults ==
    NoNoneDefaults[str] ==
    NoNoneDefaults[str, int]
)  # All valid


class OneDefault(Generic[T, DefaultBoolT]): ...

OneDefault[float] == OneDefault[float, bool]  # Valid
reveal_type(OneDefault)          # type is type[OneDefault[T, DefaultBoolT = bool]]
reveal_type(OneDefault[float]()) # type is OneDefault[float, bool]


class AllTheDefaults(Generic[T1, T2, DefaultStrT, DefaultIntT, DefaultBoolT]): ...

reveal_type(AllTheDefaults)                  # type is type[AllTheDefaults[T1, T2, DefaultStrT = str, DefaultIntT = int, DefaultBoolT = bool]]
reveal_type(AllTheDefaults[int, complex]())  # type is AllTheDefaults[int, complex, str, int, bool]
try:
  AllTheDefaults[int]  # Invalid: expected 2 arguments to AllTheDefaults
  raise Exception('should have raised TypeError')
except TypeError:
  pass
(
    AllTheDefaults[int, complex] ==
    AllTheDefaults[int, complex, str] ==
    AllTheDefaults[int, complex, str, int] ==
    AllTheDefaults[int, complex, str, int, bool]
)  # All valid

assert_raises(SyntaxError, exec, "type Alias[DefaultT = int, T] = tuple[DefaultT, T]",
    msg="non-default type parameter 'T' follows default type parameter")

assert_raises(SyntaxError, exec,
    "def generic_func[DefaultT = int, T](x: DefaultT, y: T) -> None: ...",
    msg="non-default type parameter 'T' follows default type parameter")

assert_raises(SyntaxError, exec,
    "class GenericClass[DefaultT = int, T]: ...",
    msg="non-default type parameter 'T' follows default type parameter")
    
print('all tests pass...')