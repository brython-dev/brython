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

print("passed all tests..")
