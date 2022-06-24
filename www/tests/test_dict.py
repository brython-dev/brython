d = {1: 'Z','y': 88}
assert d.__class__ == dict
assert isinstance(d, dict)
assert str(d) == "{1: 'Z', 'y': 88}"

x = dict([['a', 1], ['r', 2], ['bg', 3], ['Z', 4]])
y = dict(zip(['a', 'r', 'Z', 'bg'], [1, 2, 4, 3]))
z = {'bg': 3, 'Z': 4, 'a': 1, 'r': 2}
assert x == y
assert x == z
assert y == z

assert x['a'] == 1
assert x.get('a') == 1
assert x.get('uiop', 99) == 99

y = x.copy()
assert x == y
y.clear()
assert len(y) == 0
assert len(x) == 4

# subclass
class foo(dict):
    def show(self):
        return 'show'

x = foo({1: 2})
assert x.show() == 'show'
assert str(x) == "{1: 2}"
assert isinstance(x, dict)

_list = []
data = {"var":[1, 2, 3]}
data["var2"] = data.get("var")

_list = list(data.items())
_list.append(("other", data))
assert repr(_list) == ("[('var', [1, 2, 3]), ('var2', [1, 2, 3]), "
    "('other', {'var': [1, 2, 3], 'var2': [1, 2, 3]})]")

d = {}
d[1] = d
assert repr(d) == '{1: {...}}'

# Test that functions are hashable
def f(): return 5
def g(): return 6

d = {
    f: 1,
    g: 2,
}

assert d[f] == 1
assert d[g] == 2
assert hash(f) != hash(g)

# issue 601
assert {1: 1}.keys() == {1}
assert {1} == {1: 1}.keys()
assert {1: 1}.items() == {(1, 1)}
assert {1: 2}.values() != {2}

# issue 602
d = {} #should crash with mutation in for loop dict error
d[1] = 1
try:
    for i in d:
        d[i + 1] = 1
    raise Exception('should fail')
except RuntimeError:
    pass

# issue 434
pairs = ['']
try:
    dict(pair.split('=', 1) for pair in pairs)
    raise AssertionError('should have raised ValueError')
except ValueError:
    pass

# issue 994
d = {False: "Test", True: "Test2"}
assert d[False] == "Test"
assert d[0] == "Test"
assert d[True] == "Test2"
assert d[1] == "Test2"

# issue 1000
main = {
    3: 1
}

diff = {
    4: 1
}

class A:
    def __hash__(self):
        return 4
    def __eq__(self, other):
        return True

assert not (main == diff)
assert diff == {A(): 1}
assert not (main == {A(): 1})

# membership doesn't raise exception "dict changed size during iteration"
# cf. issue 1114
class X:
    def __eq__(self, other):
        d.clear()
        return NotImplemented

d = {0: set()}
assert not (0, X()) in d.items()

# issue 1285 : preserve insertion order

d = dict()
d.update({(1, 0): 0, (2, 0): 0, (3, 0): 0})
assert str(d) == "{(1, 0): 0, (2, 0): 0, (3, 0): 0}"

import random

class A:
    pass

keys = [1, 'a', (2, 3), 2, 'c', (5, 6, 7), A()]

for i in range(100):
    random.shuffle(keys)
    d = {k: k for k in keys}
    assert list(d) == keys

while keys:
    key = random.choice(keys)
    keys.remove(key)
    del d[key]
    assert list(d) == keys

# issue 1290
assert len({'a': 'b'}.values()) == 1
assert len({'a': 'b'}.keys()) == 1
assert len({'a': 'b'}.items()) == 1

# issue 1337
d = {}
d['a'] = []
d['b'] = {0: d}
assert repr(d) == str(d) == "{'a': [], 'b': {0: {...}}}"

# PEP 584
d = {'spam': 1, 'eggs': 2, 'cheese': 3}
e = {'cheese': 'cheddar', 'aardvark': 'Ethel'}
assert d | e == {'spam': 1, 'eggs': 2, 'cheese': 'cheddar',
                 'aardvark': 'Ethel'}
assert e | d == {'aardvark': 'Ethel', 'spam': 1, 'eggs': 2, 'cheese': 3}
d |= e
assert d == {'spam': 1, 'eggs': 2, 'cheese': 'cheddar', 'aardvark': 'Ethel'}

# issue 1437
a = {1:1, 2:2}
a.update({1:3})
assert str(a) == '{1: 3, 2: 2}'
a.update({4:4})
assert str(a) == '{1: 3, 2: 2, 4: 4}'

b = {'a': 1, 'b': 2}
b['a'] = 3
assert str(b) == "{'a': 3, 'b': 2}"

# issue 1450
d = {}

class Exc(Exception): pass

class BadHash(object):
    fail = False
    def __hash__(self):
        if self.fail:
            raise Exc()
        else:
            return 42

x = BadHash()
d[x] = 42
x.fail = True
try:
    d.__getitem__(x)
    raise Exception("should have raise Exc")
except Exc:
    pass

# handle 1 and True, 0 and False
d = {'a': 1, 1: 2, 1.5: 3, True: 4, False: 5, None: 6}
assert str(d) == "{'a': 1, 1: 4, 1.5: 3, False: 5, None: 6}"

d = {'a': 1, 1: 2, 'b': 3, True: 4}
assert str(d) == "{'a': 1, 1: 4, 'b': 3}"

d = {'a': 1, True: 2, 'b': 3, 1: 4}
assert str(d) == "{'a': 1, True: 4, 'b': 3}"

# issue 1859
assert 'constructor' not in {}

# syntax errors in comprehensions
from tester import assert_raises

assert_raises(SyntaxError,
              exec,
              "{**t for x in y}",
              msg='dict unpacking cannot be used in dict comprehension')

assert_raises(SyntaxError,
              exec,
              "{*t for x in y}",
              msg='iterable unpacking cannot be used in comprehension')

print("passed all tests..")
