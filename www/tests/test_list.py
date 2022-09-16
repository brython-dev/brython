# list examples

z = [1, 2, 3]
assert z.__class__ == list
assert isinstance(z, list)
assert str(z) == "[1, 2, 3]"

a = ['spam', 'eggs', 100, 1234]
assert a[:2] + ['bacon', 2 * 2] == ['spam', 'eggs', 'bacon', 4]
assert 3 * a[:3] + ['Boo!'] == ['spam', 'eggs', 100,
    'spam', 'eggs', 100,
    'spam', 'eggs', 100, 'Boo!']
assert a[:] == ['spam', 'eggs', 100, 1234]
a[2] = a[2] + 23
assert a == ['spam', 'eggs', 123, 1234]
a[0:2] = [1, 12]
assert a == [1, 12, 123, 1234]
a[0:2] = []
assert a == [123, 1234]
a[1:1] = ['bletch', 'xyzzy']
assert a == [123, 'bletch', 'xyzzy', 1234]
a[:0] = a
assert a == [123, 'bletch', 'xyzzy', 1234, 123, 'bletch', 'xyzzy', 1234]
a[:] = []
assert a == []
a.extend('ab')
assert a == ['a', 'b']
a.extend([1, 2, 33])
assert a == ['a', 'b', 1, 2, 33]

# tuple
t = (1, 8)
assert t.__class__ == tuple
assert isinstance(t, tuple)
assert str(t) == '(1, 8)'

# bug reported on the mailing list
d = {}
d[(1, 3)] = None
d[(-1, 3)] = None
d[(1, -3)]  = None
d[(-1, -3)] = None

assert d == {(1, 3): None,
    (-1, 3): None,
    (1, -3): None,
    (-1, -3): None
}

# list subclass - issue 893
class List(list):

      def __getitem__(self, item):
        return "TEST"


lst = List()
assert lst.__getitem__(100) == "TEST"
assert lst[100] == "TEST"

x = ['a', 'r', 'bg', 'Z']
x.sort()
assert x == ['Z', 'a', 'bg', 'r']

x.sort(key=str.lower)
assert x == ['a', 'bg', 'r', 'Z']

x.sort(key=str.lower, reverse=True)
assert x == ['Z', 'r', 'bg', 'a']

x = ['a']
x.append('tail')
assert x == ['a', 'tail']
x.append([0,1])
assert x == ['a', 'tail', [0, 1]]

assert x.count('a') == 1
x.extend(['u', 'v'])

assert x == ['a', 'tail', [0, 1], 'u', 'v']

assert x.index('u') == 3

x.remove('tail')
assert x == ['a', [0, 1], 'u', 'v']

x.pop()
assert x == ['a', [0, 1], 'u']

x.pop(1)
assert x == ['a', 'u']

x = ['a', 'r', 'bg', 'Z']
x.reverse()
assert x == ['Z', 'bg', 'r', 'a']

del x[0]
assert x == ['bg', 'r', 'a']
del x[-1]
assert x == ['bg', 'r']

x += ['zz']
assert x == ['bg', 'r', 'zz']

assert x[1] == 'r'

assert 'r' in x
assert 'rty' not in x


# issue 218
a = [1, 2, 3]
a *= 2
assert a == [1, 2, 3, 1, 2, 3]

# issue 296
assert [4, 0, 4].index(4, 1) == 2

# issue 305
a = [1, 2, 3]
assert a.sort() is None

# issue 364
class A(list):

    def __init__(self, x):
        list.__init__(self, x)


z = A([1, 2, 3])
assert isinstance(z, A)
assert z == [1, 2, 3]
assert len(z) == 3
assert list.__len__(z) == 3

z.foo = 5
assert z.foo == 5

# issue 724
t = [2]
try:
    t.foo = 8
    raise Exception("sould have raised AttributeError")
except AttributeError:
    pass

class List(list):

    counter = 0

    def pop(self, index=-1):
        return "POP"

    def reverse(self):
        return "REVERSE"

    def __setitem__(self, k, v):
        List.counter = 1

    def sort(self, key=None, reverse=False):
        return "SORT"

t = List([2, 1])
assert t.sort() == "SORT"
t2 = List()
List()[0] = 0
assert List.counter == 1
assert List().reverse() == "REVERSE"
assert List().pop() == "POP"

# issue 941
assert not [1] < [1]
assert [1] < [1, 2]
assert [0] < [1]
assert not [3] < [1, 2]

assert not ['a'] < ['a']
assert ['a'] < ['a', 2]

# issue 993
assert sorted(['b3', 'a2', 'c1']) == ['a2', 'b3', 'c1']
assert sorted(['a2', 'b3', 'c1'], key=lambda a: a[1]) == ['c1', 'a2', 'b3']
assert sorted(['a2', 'b3', 'c1'], key=None) == ['a2', 'b3', 'c1']

ls = ['b3', 'a2', 'c1']; ls.sort()
assert ls == ['a2', 'b3', 'c1']
ls = ['a2', 'b3', 'c1']; ls.sort(key=lambda a:a[1])
assert ls == ['c1', 'a2', 'b3']
ls = ['a2', 'b3', 'c1']; ls.sort(key=None)
assert ls == ['a2', 'b3', 'c1']

# issue 1027
t = (4, 5, 6)
try:
    t.pop()
    raise Exception("should have raised AttributeError")
except AttributeError:
    pass

try:
    t.sort()
    raise Exception("should have raised AttributeError")
except AttributeError:
    pass

# issue 1044
a = []
try:
    a.push(1)
    raise Exception("should have raised AttributeError")
except AttributeError:
    pass

# issue 1045
a = ["a"]
b = ["b"]
assert a.sort() is None
assert (a + b).sort() is None

# issue 1081
class A(list):
    pass

test1 = A([1, 2, 3])
test1.append(4)
assert test1 == [1, 2, 3, 4]
test1.pop()
assert test1 == [1, 2, 3]

class B(A):
    pass

test2 = B([1, 2, 3])
test2.append(4)
assert test2 == [1, 2, 3, 4]
test2.pop()
assert test2 == [1, 2, 3]

# issue 1139
assert [*[1, 2, 3][:]] == [1, 2, 3]

# issue 1288
a = list(range(10))
a[::-4] = [10] * 3
assert a == [0, 10, 2, 3, 4, 10, 6, 7, 8, 10]

# issue 1289
assert ([2, 3] < [2]) is False
assert [2] < [2, 3]
assert [2, 3] > [2]

# issue 1292
lst = [1, 2, 3]
assert lst[-100:] == [1, 2, 3]
assert lst[:100] == [1, 2, 3]
assert lst[-100:100] == [1, 2, 3]

# issue 1333
a = ('x', 'y')

assert ('1', (*a,)) == ('1', ('x', 'y'))
assert ('a', (*range(4),)) == ('a', (0, 1, 2, 3))
assert ('1', (((*a,)))) == ('1', ('x', 'y'))

# issue 1337
L = [[0], [1]]
L[0].append(L[1])
L[1].append(L[0])
assert repr(L) == "[[0, [1, [...]]], [1, [0, [...]]]]"
assert str(L) == "[[0, [1, [...]]], [1, [0, [...]]]]"
assert repr(L[1]) == "[1, [0, [...]]]"

# issue 1368
class Test:
  def __init__(self):
    self.count = [1, 2, 3]
  def test_unpack(self):
    return [*self.count]

t = Test()
assert t.test_unpack() == [1, 2, 3]

s = [4, 5, 6]
assert [*s] == [4, 5, 6]

class A:
  x = [7, 8, 9]

assert [*A.x] == [7, 8, 9]

# issue 1389
class P(object):
    def __init__(self, x):
        self.value = x

    def __eq__(self, other):
        return self.value == other.value

    def __lt__(self, other):
        return self.value < other.value

    def __repr__(self):
        return f"P({self.value})"

a = P(5)
b = P(6)
assert not a == b
assert a != b
assert a < b

L = [P(7), P(3), P(5), P(1), P(3)]
L.sort()
assert L == [P(1), P(3), P(3), P(5), P(7)]

# issue 1593
t = [1, 2, 3]
try:
    t[1.1]
    raise Exception("should have raised TypeError")
except TypeError:
    pass

# issue 1630
t = (1, 2)
try:
    t.first = 1
    raise AssertionError("should have raised AttributeError")
except AttributeError:
    pass

# issue 1641
tup = (1, 2, 3)

try:
    tup[0] = 0
    raise AssertionError("should have raised TypeError")
except TypeError as exc:
    assert exc.args[0] == \
      "'tuple' object does not support item assignment"

try:
    tuple.__setitem__ = 0
    raise AssertionError("should have raised TypeError")
except TypeError as exc:
    assert exc.args[0] == \
        "cannot set '__setitem__' attribute of immutable type 'tuple'"

# issue 1701
t = [1, 2, 3, 4, 5]
del t[:0]
assert t == [1, 2, 3, 4, 5]
del t[:1]
assert t == [2, 3, 4, 5]

# issue 1713
class Foo(list):
    def __getitem__(self, index):
        raise NotImplementedError()

    def __delitem__(self, index):
        raise NotImplementedError()

    def __setitem__(self, index, value):
        raise NotImplementedError()

f = Foo((1, 2, 3, 4))
try:
    f[1:3:2]
    raise AssertionError('should have raised NotImplementedError')
except NotImplementedError:
    pass

try:
    del f[0:1]
    raise AssertionError('should have raised NotImplementedError')
except NotImplementedError:
    pass

# issue 1714
nb_calls_init = 0

class Foo(list):
    def __init__(self, initial):
        global nb_calls_init
        nb_calls_init += 1
        super().__init__(initial)

s = Foo('123456')
assert s[1::2] == ['2', '4', '6']
assert nb_calls_init == 1

# issue 1715
class Foo(list):
    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)


s = Foo()
assert s == []

# issue 1868
L = [1][::]
assert L.sort() is None

import copy
L = copy.copy([1])
assert L.sort() is None

#
try:
    eval('[*12]')
    raise Exception('should have raised TypeError')
except TypeError as exc:
    assert exc.args[0] == 'Value after * must be an iterable, not int'

# issue 2034
t = [1] * 2
assert t.sort() is None

print("passed all tests..")