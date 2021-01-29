import collections, collections.abc

_d = collections.defaultdict(int)

_d['a'] += 1
_d['a'] += 2
_d['b'] += 4

assert _d['a'] == 3
assert _d['b'] == 4

s = 'mississippi'
for k in s:
    _d[k] += 1

_values = list(_d.values())
_values.sort()
assert _values == [1, 2, 3, 4, 4, 4]

_keys = list(_d.keys())
_keys.sort()
assert _keys == ['a', 'b', 'i', 'm', 'p', 's']

#now try with default being list (ie, empty list)
_listdict = collections.defaultdict(list)

for _i in range(10):
    _listdict['mylist'].append(_i)

assert _listdict['not called'] == []
assert _listdict['mylist'] == [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

# namedtuple
a = collections.namedtuple("foo", "bar bash bing")(1, 2, 3)
assert a.bar == 1
assert a.bash == 2
assert repr(a) == 'foo(bar=1, bash=2, bing=3)'

# issue 156
assert isinstance(dict(one=1), collections.abc.Mapping)
assert issubclass(dict, collections.abc.Mapping)

# issue 434
Set = collections.defaultdict(lambda: None)
Set[0]
Set[int]
Set[str]

# issue 614
N = collections.namedtuple('N', 'spam, length, eggs')
n = N(5, 6, 7)
assert n.length == 6

M = collections.namedtuple('M', 'a, b, c')
m = M(5, 6, 7)
try:
    m.length
    raise AssertionError("should have raised AttributeError")
except AttributeError:
    pass

# issue 725
A = collections.namedtuple('A', ('x', 'y'))
a = A(0, 0)
d = dict({'x': 1})
b = a._replace(**d)
assert b.x == 1

# iteration on deque
d = collections.deque([1, 6, 2, 4])
assert list(d) == [1, 6, 2, 4]

# issue 998
d = collections.OrderedDict()
d['a'] = 2
d['b'] = 3
assert list(d.keys()) == ["a", "b"]
assert list(d.values()) == [2, 3]
assert list(d.items()) == [("a", 2), ("b", 3)]

# issue 1053
N = collections.namedtuple('N', 'a b')
N.__new__.__defaults__ = (3, 4)
n = N()
assert n.a == 3
assert n.b == 4

# issue 1277
N = collections.namedtuple('N', 'x y')
N.x.__doc__ = """my doc."""
assert f'doc={N.x.__doc__}' == "doc=my doc."

# issue 1598
from collections import defaultdict
d = defaultdict(int)
d.setdefault("bar", []).extend([123])  # assign a different type at run-time
assert d["bar"] == [123]

print("passed all tests...")