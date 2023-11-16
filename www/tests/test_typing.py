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