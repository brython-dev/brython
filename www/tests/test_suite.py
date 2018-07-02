# numbers
assert 2 + 2 == 4
assert (50 - 5 * 6) / 4 == 5.0
assert 8 / 4 * 2 == 4.0
assert 8 / 5 == 1.6
assert 7 // 3 == 2
assert 7 // -3 == -3
assert 4 - 2 - 2 == 0

width = 20
height = 5 * 9
assert width * height == 900

x = 6
x += 7 + 8
assert x == 21

x = y = z = 0
assert x == 0
assert y == 0
assert z == 0

# hex, octal, binary literals
a = 0xaf
assert a == 175
a = 0Xaf
assert a == 175
a = 0o754
assert a == 492
a = 0O754
assert a == 492
a = 0b10100110
assert a == 166
a = 0B10100110
assert a == 166

# bitwise operators
assert ~3 == -4
x = 3
assert ~x == -4
assert  ~1 & ~10 | 8 == -4
assert 2 << 16 == 131072
assert 131072 >> 16 == 2

# __neg__
assert -x == -3
y = 2.1
assert -y == -2.1

#not sure how to convert this to assert (raise)?
try:
  print(n)
  print("Failed.. n should be undefined, but n:", n)
except:
  pass

assert 3 * 3.75 / 1.5 == 7.5

assert 7.0 / 2 == 3.5

# strings
assert 'spam eggs' == "spam eggs"

assert 'doesn\'t' == "doesn't"
assert '"Yes," he said.' == "\"Yes,\" he said."
assert '"Isn\'t," she said.' == "\"Isn't,\" she said."
hello = "This is a rather long string containing\n\
several lines of text just as you would do in C.\n\
    Note that whitespace at the beginning of the line is\
 significant."

assert len(hello) == 158

hello = """\
Usage: thingy [OPTIONS]
     -h                        Display this usage message
     -H hostname               Hostname to connect to
"""
assert len(hello) == 136

hello1 = """This is a rather long string containing
several lines of text just as you would do in C.
    Note that whitespace at the beginning of the line is
 significant."""

assert len(hello1) == 159

hello = r"This is a rather long string containing\n\
several lines of text much as you would do in C."

assert len(hello) == 91

word = 'Help' + 'A'
assert word == 'HelpA'
assert word*5 == "HelpAHelpAHelpAHelpAHelpA"

assert 'str' 'ing' == 'string'

assert 'str'.strip() + 'ing' == 'string'
assert ' str '.strip() + 'ing' == 'string'

# string methods
x = 'fooss'
assert x.replace('o', 'X', 20) == 'fXXss'

assert 'GhFF'.lower() == 'ghff'

assert x.lstrip('of') == 'ss'

x = 'aZjhkhZyuy'

assert x.find('Z') == 1
assert x.rfind('Z') == 6
assert x.rindex('Z') == 6

try:
    x.rindex('K')
    print("Failed.. Should have raised ValueError, instead returned %s" % x.rindex('K'))
except ValueError:
    pass

assert x.split('h') == ['aZj', 'k', 'Zyuy']
assert x.split('h', 1) == ['aZj', 'khZyuy']
assert x.split('h', 2) == ['aZj', 'k', 'Zyuy']
assert x.rsplit('h') == ['aZj', 'k', 'Zyuy']
assert x.rsplit('h', 1) == ['aZjhk', 'Zyuy']
assert x.rsplit('y', 2) == ['aZjhkhZ', 'u', '']
assert x.startswith('aZ')
assert x.strip('auy') == 'ZjhkhZ'
assert x.upper() == 'AZJHKHZYUY'

# list examples
a = ['spam', 'eggs', 100, 1234]
assert a[:2] + ['bacon', 2 * 2] == ['spam', 'eggs', 'bacon', 4]
assert 3 * a[:3] + ['Boo!'] == ['spam', 'eggs', 100, 'spam', 'eggs', 100, 
    'spam', 'eggs', 100, 'Boo!']
assert a[:] == ['spam', 'eggs', 100, 1234]

a[2] = a[2] + 23
assert a == ['spam', 'eggs', 123, 1234]

a[0:2] = [1, 12]
assert a == [1, 12, 123, 1234]

a[0:2] = []
assert a == [123, 1234]

a[1:1] = ['bletch','xyzzy']
assert a == [123, 'bletch', 'xyzzy', 1234]


a[:0] = a
assert a == [123, 'bletch', 'xyzzy', 1234, 123, 'bletch', 'xyzzy', 1234]

a[:] = []
assert a == []

a.extend('ab')
assert a == ['a', 'b']

a.extend([1, 2, 33])
assert a == ['a', 'b', 1, 2, 33]

# lambda
g = lambda x, y=99: 2 * x + y
assert g(10, 6) == 26
assert g(10) == 119

x = [lambda x: x * 2,lambda y: y * 3]
assert x[0](5) == 10
assert x[1](10) == 30

# inline functions and classes
def foo(x):return 2*x
assert foo(3) == 6
class foo(list): pass
class bar(foo): pass
assert str(bar()) == "[]"

i = 10
while i > 0: i -= 1
if not True:print('true!')
else:pass

assert bin(12) == '0b1100'
assert oct(12) == '0o14'
assert hex(12) == '0xc'
assert bin(-12) == '-0b1100'
assert oct(-12) == '-0o14'
assert hex(-12) == '-0xc'

# bytes
b = b'12345'
assert len(b) == 5

# enumerate
enum_obj = enumerate('abcdefghij')
enum_first = next(enum_obj)
assert isinstance(enum_first, tuple)
assert enum_first[0] == 0

enum_obj = enumerate(['first', 'second'], start=1)
enum_first = next(enum_obj)
assert enum_first[0] ==  1


# filter
test_list = [0, -1, 1, 2, -2]
true_values = list(filter(None, test_list))
assert true_values == [-1, 1, 2, -2]
negative_values = list(filter(lambda x: x < 0, test_list))
assert negative_values == [-1, -2]

# dir
class FooParent():
    const = 0

class Foo(FooParent):
    def do_something(self):
        pass

foo = Foo()
foo_contents = dir(foo)
assert 'do_something' in foo_contents
assert 'const' in foo_contents

# non-ASCII variable names
donnée = 10
машина = 9
ήλιος = 4

assert donnée + машина + ήλιος == 23

# Korean
def 안녕하세요():
    return "hello"

assert 안녕하세요() == "hello"

# functions and methods
class foo:
    def method(self, x):
        return(x)

assert foo().method(5) == 5
a = foo.method
assert foo.method == foo.method
x = foo()
assert x.method == x.method

def m1(self, x):
    return 2 * x

foo.method = m1
b = foo.method
assert a != b
assert foo().method(5) == 10

y = foo()

assert x.method != y.method

def f():
    pass
def g():
    pass

assert f != g

# use of "global" in functions
a = 9

def f():
    global a
    res = [x for x in range(a)]
    a = 8
    return res

assert f() == [0, 1, 2, 3, 4, 5, 6, 7, 8]
assert a == 8

# nested function scopes
def f(method, arg):
    def cb(ev):
        return method(ev, arg)
    return cb

def g(*z):
    return z

a = f(g, 5)
b = f(g, 11)

assert a(8) == (8, 5)
assert b(13) == (13, 11)

# nonlocal and global
x = 0

def f():
    x = 1
    res = []
    def g():
        global x
        return x
    res.append(g())
    def h():
        nonlocal x
        return x
    res.append(h())
    return res

assert f() == [0, 1]

def P():
    b = 1
    def Q():
        nonlocal b
        b += 1
        return b
    return Q()
assert P() == 2

# use imported names
from a import *

res = []
for i in range(10):
    res.append(i)

assert res == ['a', 'b', 'c']

# __setattr__ defined in a class

class A:
    def __init__(self, x):
        self.x = x

    def __setattr__(self, k, v):
        object.__setattr__(self, k, 2 * v)

a = A(4)
assert a.x == 8

# nested scopes
def f():
    x = 1
    def g():
        assert x == 1
        def h():
            assert x == 1
            return x + 1
        return h()
    return g()

assert f() == 2

# check that name "constructor" is valid
constructor = 0

# exception attributes
try:
    'a' + 2
except TypeError as exc:
    assert exc.args[0] == "Can't convert int to str implicitly"

# check that line is in exception info
x = []
try:
    x[1]
except IndexError as exc:
    assert 'line' in exc.info

# vars()
class A:
    def __init__(self, x):
        self.x = x

assert A(5).__dict__ == {'x': 5}
assert vars(A(5)) == {'x': 5}

# @ operator (PEP 465)
class A:
    def __init__(self, a, b, c, d):
        self.a = a
        self.b = b
        self.c = c
        self.d = d

    def __matmul__(self, other):
        return A(
            self.a * other.a + self.b * other.c,
            self.a * other.b + self.b * other.d,
            self.c + other.a + self.d + other.c,
            self.c * other.b + self.d * other.d)

    def __str__(self):
        return "({} {})\n({} {})".format(self.a, self.b,
            self.c, self.d)


    def __eq__(self, other):
        return (self.a == other.a and
            self.b == other.b and
            self.c == other.c and
            self.d == other.d)

a1 = A(1, 2, 3, 4)
a2 = A(2, 3, 4, 5)
a3 = A(10, 13, 13, 29)

assert a1 @ a2 == a3

a1 @= a2
assert a1 == a3
print('passed all tests...')