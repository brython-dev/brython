x = set(['a', 'r', 'bg', 'Z'])
assert x == set(['bg', 'Z', 'a', 'r'])

assert len(x) == 4
x.add('tail')
assert len(x) == 5
x.add('tail')
assert len(x) == 5
assert 'r' in x
assert 'rty' not in x

y = set([1, 2, 3])
assert x.isdisjoint(y)
y.add('r')
assert not x.isdisjoint(y)

z = set(['a', 'r'])
assert z.issubset(x)
assert z <= x
assert z < x
assert x.issuperset(z)
assert x >= z
assert x > z
assert not z.issubset(y)

assert z | y == {'a', 'r', 1, 2, 3}
assert z.union(y) == {'a', 'r', 1, 2, 3}

assert x & y == {'r'}
assert x.intersection(y) == {'r'}

assert x-y == {'a', 'bg', 'Z', 'tail'}

assert z ^ y == {'a', 1, 2, 3}

x.remove('tail')
assert x == {'a', 'r', 'bg', 'Z'}
x.discard('azerty')
assert x == {'a', 'r', 'bg', 'Z'}
x.discard('a')
assert x == {'r', 'bg', 'Z'}

z.pop()
z.pop()
try:
    z.pop()
except KeyError:
    pass

x.clear()
assert len(x) == 0

x = frozenset(['a', 'r', 'bg', 'Z'])
assert str(x).startswith("frozenset({")
assert x == set(['bg', 'Z', 'a', 'r'])

assert len(x) == 4
try:
    x.add('tail')
except AttributeError:
    pass
assert len(x) == 4
assert 'r' in x
assert 'rty' not in x


class foo(set):
    def show(self):
        return 'show'


x = foo([1, 2])
assert x.show() == 'show'

# issue 543
assert {''} | {0} == {'', 0}

s = set(range(20))
s.intersection_update({5})
assert s == {5}

# issue 797 test set inplace operators
# from stdlib Lib/test/test_set.py
word = 'simsalabim'
otherword = 'madagascar'

# test __ior__
s = set(word)
# NOTE: use a function otherwise `s = s | other` is tested (not inplace)


def update(s):
    s |= set(otherword)


update(s)
for c in (word + otherword):
    assert c in s

# test __iand__
s = set(word)


def intersection_update(s):
    s &= set(otherword)


intersection_update(s)
for c in (word + otherword):
    if c in otherword and c in word:
        assert c in s
    else:
        assert c not in s

# test __isub__
s = set(word)


def difference_update(s):
    s -= set(otherword)


difference_update(s)
for c in (word + otherword):
    if c in word and c not in otherword:
        assert c in s
    else:
        assert c not in s

# test __ixor__
s = set(word)


def symmetric_difference_update(s):
    s ^= set(otherword)


symmetric_difference_update(s)
for c in (word + otherword):
    if (c in word) ^ (c in otherword):
        assert c in s
    else:
        assert c not in s

# test inplace on self
s = set(word)
t = s.copy()


def update_self(t):
    t |= t
    assert t == s


update_self(t)
assert t == s


def intersection_update_self(t):
    t &= t
    assert t == s


intersection_update_self(t)
assert t == s


def difference_update_self(t):
    t -= t
    assert t == set()


difference_update_self(t)
assert t == set()
t = s.copy()


def symmetric_difference_update_self(t):
    t ^= t
    assert t == set()


symmetric_difference_update_self(t)
assert t == set()

# from stdlib Lib/test/test_set:TestOnlySetsInBinaryOps
# test update operator
s = set(word)
try:
    s |= otherword
except TypeError:
    pass
else:
    assert 0, "expected TypeError"

# test intersection update operator
try:
    s &= otherword
except TypeError:
    pass
else:
    assert 0, "expected TypeError"

# test sym difference update operator
try:
    s ^= otherword
except TypeError:
    pass
else:
    assert 0, "expected TypeError"

# test difference update operator
try:
    s -= otherword
except TypeError:
    pass
else:
    assert 0, "expected TypeError"

print("passed all tests..")
