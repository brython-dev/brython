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

print("tests pass")