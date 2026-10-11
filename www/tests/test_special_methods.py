from tester import assertRaises

class Exc(Exception):
    pass

class A:
    """Special methods not defined."""
    pass

a = A()
assert bool(a)
assert not callable(a)
format(a) # no exception
hash(a) # no exception

for special in [abs, bin, complex, float, hex, int, len, reversed, round]:
    assertRaises(TypeError, special, a)

a1 = A()
# Set object attributes with special method names
for special in ['abs', 'bool', 'call', 'complex', 'float', 'format', 'hash',
        'int', 'len', 'reversed', 'round']:
    setattr(a1, f"__{special}__", lambda *args: 1)

for special in [abs, bin, complex, float, hex, int, len, reversed, round]:
    assertRaises(TypeError, special, a1)

class B:
    """Special methods raise exceptions."""

    def __abs__(self):
        raise Exc()

    def __bool__(self):
        raise Exc()

    def __call__(self):
        raise Exc()

    def __complex__(self):
        raise Exc()

    def __float__(self):
        raise Exc()

    def __format__(self, fmt):
        raise Exc()

    def __hash__(self):
        raise Exc()

    def __index__(self):
        raise Exc()

    def __int__(self):
        raise Exc()

    def __len__(self):
        raise Exc()

    def __reversed__(self):
        raise Exc()

    def __round__(self, n=None):
        raise Exc()

b = B()
assert callable(b)
assertRaises(Exc, b)

for special in [abs, bin, bool, complex, float, format, hash, hex, int, len,
        reversed, round]:
    assertRaises(Exc, special, b)

b1 = B()

# Set object attributes with special method names
for special in ['abs', 'bool', 'call', 'complex', 'float', 'format', 'hash',
        'int', 'len', 'reversed', 'round']:
    setattr(b1, f"__{special}__", lambda *args: 1)

for special in [abs, bin, bool, complex, float, format, hash, hex, int, len,
        reversed, round]:
    assertRaises(Exc, special, b1)

class BadRepr(object):

    def __repr__(self):
        raise Exc()

d = {1: BadRepr()}
assertRaises(Exc, repr, d)

class A:
    pass

a = A()
a.__add__ = lambda other: 99

assertRaises(TypeError, exec, "a + 7", globals())

# a subscript finds its method in the class, never asking the metaclass
class Hidden(type):
    def __getattribute__(cls, name):
        if name in ("__getitem__", "__setitem__", "__delitem__"):
            raise AttributeError(name)
        return type.__getattribute__(cls, name)

class Store(metaclass=Hidden):
    def __init__(self):
        self.held = {}

    def __getitem__(self, key):
        return key

    def __setitem__(self, key, value):
        self.held[key] = value

    def __delitem__(self, key):
        del self.held[key]

store = Store()
assert store[0:1] == slice(0, 1)
store["k"] = 1
assert store.held == {"k": 1}
del store["k"]
assert store.held == {}
assertRaises(TypeError, lambda: object()[0:1])

print("tests pass")