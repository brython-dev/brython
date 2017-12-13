import collections

_d=collections.defaultdict(int)

_d['a']+=1
_d['a']+=2
_d['b']+=4

assert _d['a'] == 3
assert _d['b'] == 4

s = 'mississippi'
for k in s:
    _d[k] += 1

_values=list(_d.values())
_values.sort()
assert _values == [1, 2, 3, 4, 4, 4]

_keys=list(_d.keys())
_keys.sort()
assert _keys == ['a', 'b', 'i', 'm', 'p', 's']

#now try with default being list (ie, empty list)
_listdict=collections.defaultdict(list)

for _i in range(10):
    _listdict['mylist'].append(_i)

assert _listdict['not called'] == []
assert _listdict['mylist'] == [0,1,2,3,4,5,6,7,8,9]

# namedtuple
a = collections.namedtuple("foo", "bar bash bing")(1, 2, 3)
assert a.bar == 1
assert a.bash == 2
assert repr(a) == 'foo(bar=1, bash=2, bing=3)'

# issue 725
A = collections.namedtuple('A', ('x', 'y'))
a = A(0, 0)
d = dict({'x': 1})
b = a._replace(**d)
assert b.x == 1

# iteration on deque

d = collections.deque([1, 6, 2, 4])
assert list(d) == [1, 6, 2, 4]
