from tester import assert_raises

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
assert word * 5 == "HelpAHelpAHelpAHelpAHelpA"

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
def foo(x):return 2 * x
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

# use imported names : override built-in range
from a import *

res = []
for i in range(10):
    res.append(i)

assert res == ['a', 'b', 'c']

# restore built-in range
range = __builtins__.range
assert list(range(2)) == [0, 1]

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
    pass #assert exc.args[0] == "Can't convert int to str implicitly", exc.args

# check that line is in exception info
x = []
try:
    x[1]
except IndexError as exc:
    assert exc.args[0] == 'list index out of range'

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

    def __rmatmul__(self, other):
        return A(
            other.a * self.a + other.b * self.c,
            other.a * self.b + other.b * self.d,
            other.c + self.a + other.d + self.c,
            other.c * self.b + other.d * self.d)

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

class B:

    def __init__(self, a, b, c, d):
        self.a = a
        self.b = b
        self.c = c
        self.d = d


assert B(1, 2, 3, 4) @ A(2, 3, 4, 5) == a3
# sys.exc_info
import sys

try:
    1 / 0
except:
    exc_class, exc, tb = sys.exc_info()
    assert exc_class is ZeroDivisionError

assert sys.exc_info() == (None, None, None)

try:
    1 / 0
except ZeroDivisionError:
    assert sys.exc_info()[0] is ZeroDivisionError
finally:
    assert sys.exc_info() == (None, None, None)

# comparisons with None
msg = "'{}' not supported between instances of '{}' and 'NoneType'"

class X:
    pass


for value in [0.,
              0,
              "a",
              b"a",
              (bytearray(b'ab'), "bytearray(b'ab')"),
              ((), "()"),
              [],
              ({}, "{{}}"),
              set(),
              frozenset(),
              1j,
              None,
              True,
              False,
              (SyntaxError, "SyntaxError"),
              (range(2), "range(2)"),
              ((x for x in range(2)), "(x for x in range(2))"),
              (map(len, ["a", "bc"]), 'map(len, ["a", "bc"])'),
              (zip(["a", "b"], [1, 2]), 'zip(["a", "b"], [1, 2])'),
              (len, "len"),
              (X, "X"),
              (X(), "X()")]:

    if isinstance(value, tuple):
        value, vrepr = value
    else:
        vrepr = repr(value)

    s = f"{vrepr} {{}} None"

    for op in [">", "<", ">=", "<="]:
        try:
            eval(s.format(op))
            raise Exception(f"{op} should have raised TypeError")
        except Exception as exc:
            assert exc.args[0] == msg.format(op, type(value).__name__), \
                (op, exc.args[0], msg.format(op, type(value).__name__))

    if value is not None:
        assert value != None
        assert not (value == None)

# PEP 570 (positional-only parameters)
def pos_only_arg(arg, /):
    return arg

pos_only_arg(1)
assert_raises(TypeError, pos_only_arg, arg=2)

def kwd_only_arg(*, arg):
    return arg

assert kwd_only_arg(arg=2) == 2
assert_raises(TypeError, kwd_only_arg, 1)

def combined_example(pos_only, /, standard, *, kwd_only):
    return pos_only, standard, kwd_only

assert combined_example(1, 2, kwd_only=3) == (1, 2, 3)
assert combined_example(1, standard=2, kwd_only=3) == (1, 2, 3)
assert_raises(TypeError, combined_example, 1, 2, 3)

# del
attr = 5
del attr
for attr in range(5):
    pass

# PEP 572 (assignement expressions)

def f(x):
    return x

(y := f(8))
assert y == 8

assert_raises(SyntaxError, exec, "y0 = y1 := f(5)")

y0 = (y1 := f(5))
assert y0 == 5
assert y1 == 5

assert_raises(SyntaxError, exec, "foo(x = y := f(x))")

assert_raises(SyntaxError, exec,
    """def foo(answer = p := 42):
    pass""")

def foo(answer=(p := 42)):
    return answer, p

assert foo() == (42, 42)
assert foo(5) == (5, 42)

assert_raises(SyntaxError, exec,
    """def foo(answer: p := 42 = 5):
    pass""")

def foo1(answer: (p := 42) = 5):
    return (answer, p)

assert foo1() == (5, 42)
assert foo1(8) == (8, 42)

assert_raises(SyntaxError, exec, "lambda x:= 1")
assert_raises(SyntaxError, exec, "(lambda x:= 1)")

f = lambda: (x := 1)
assert f() == 1

assert f'{(xw:=10)}' == "10"
assert xw == 10

z = 3
assert f'{z:=5}' == '    3'

total = 0
partial_sums = [total := total + v for v in range(5)]
assert total == 10

def assign_expr_in_comp_global():
    global total
    [total := total + v for v in range(5)]

assign_expr_in_comp_global()
assert total == 20

def assign_expr_in_comp_nonlocal():
    x = 0
    def g():
        nonlocal x
        [ x := x + i for i in range(5)]
    g()
    return x

assert assign_expr_in_comp_nonlocal() == 10

# operation with unary neg
def f(x, y):
  return -x[1]*y[2], -x[0]*y[2]

assert f([1, 2, 3], [4, 5, 6]) == (-12, -6)

# issue 1355
def f():
  [{ # comment
    0: 0} # comment
    for _ in []]

# issue 1363
a = (b) = (c) = "test"
assert a == "test"
assert b == "test"
assert c == "test"

# issue 1387
x = 10

a = -7
b = a + 5 * x if a < 0 else a
assert b == 43

a = 7
b = a + 5 * x if a < 0 else a
assert b == 7

# PEP 585
import types

assert str(list[str]) == 'list[str]'
assert str(list[str, int]) == 'list[str, int]'
assert str(list[int, ...]) == 'list[int, ...]'
assert str(tuple[str]) == 'tuple[str]'
assert isinstance(list[str], types.GenericAlias)

try:
    isinstance([1, 2, 3], list[str])
    raise Exception("should have raised TypeError")
except TypeError:
    pass

try:
    issubclass(list, list[str])
    raise Exception("should have raised TypeError")
except TypeError:
    pass

assert list[str]([2, 'a']) == [2, 'a']
assert list[str].__origin__ is list
assert list[str].__args__ == (str,)

assert not (list is list[str])
assert list != list[str]
assert list[str] == list[str]

# issue 1535
assert [x for x in "abc" if "xyz"[0 if 1 else 2] < "z"] == ['a', 'b', 'c']

# issue 1545
assert (lambda:
    # A greeting.
    'hi')() == 'hi'
assert (lambda: (
    # A greeting.
    "hi"
))() == 'hi'

assert (lambda: (
    '''
    # not a comment
    hi
    '''
))() == "\n    # not a comment\n    hi\n    "

assert lambda:(  # A greeter.
    print('hi')  # Short for "Hello".
)() == 'hi'

# issue 1557
assert_raises(SyntaxError, exec, "a, b += 1")
assert_raises(SyntaxError, exec, "(a, b) += 1")
assert_raises(SyntaxError, exec, "[a, b] += 1")
assert_raises(SyntaxError, exec, "{a, b} += 1")
assert_raises(SyntaxError, exec, "{a: 0, b: 1} += 1")
assert_raises(SyntaxError, exec, "{} += 1")

# issue 1642
assert_raises(SyntaxError, exec, "(=)")
assert_raises(SyntaxError, exec, "(=0)")
assert_raises(SyntaxError, exec, '(=")')

# issue 1654
class MyClass(list):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for index in range(len(self)):
            argument = self[index]
            if type(argument) == list:
                argument = self.__class__(argument)
                self[index] = argument

a = MyClass([1, 2, [3, 4, 5]])
assert type(a[2]) is MyClass

# issue 1693
t = []
if 1: t.append('a');t.append('b')
else: t.append('c')

assert t == ['a', 'b']

t = []
if 1: t.append('a');t.append('b');
else: t.append('c')

assert t == ['a', 'b']

lambda:{};t.append('c');
assert t[-1] == 'c'

# issue 1697
try:
    for x1697.y in [0]:
        pass
    raise Exception('should have raised NameError')
except NameError:
    pass

# issue 1718 (tabulations)
characters = {
    "amber": {
        'ascension': {
            'element_1': 'agnidus_agate',
        },
        'element': 'pyro'
    }
}

# issue 1721
def f():
    y = g(0 <= x <= 1)
    return y

def g(x):
  return x

x = 0.5
assert f()

x = 2
assert not f()

# issue 1802
assert_raises(SyntaxError, exec, ".x = 4")

# issue 1803
assert_raises(SyntaxError, exec, "050")

# issue 1807
assert_raises(SyntaxError, exec, '-')

# issue 1819
assert eval("-5 - 8") == -13

assert [0 < a < 2 for a in (0, 1)] == [False, True]

# unpacking in "for" target
lists = [
  [0, 1, 2, 3],
  ['ab', 'b', 'c']
  ]

groups = []
for x, *y, z in lists:
  groups.append((x, y, z))

assert groups == [(0, [1, 2], 3), ('ab', ['b'], 'c')]

# various flavours of try / except / else / finally
def try_except1():
    try:
        return 1
    except ZeroDivisionError:
        return 2

assert try_except1() == 1

def try_except2():
    try:
        return 1 / 0
    except ZeroDivisionError:
        return 2

assert try_except2() == 2

def try_except_else1():
    try:
        return 1
    except ZeroDivisionError:
        return 2
    else:
        return 3

assert try_except_else1() == 1

def try_except_else2():
    try:
        return 1 / 0
    except ZeroDivisionError:
        return 2
    else:
        return 3

assert try_except_else2() == 2

def try_finally():
    try:
        return 1
    finally:
        return 4

assert try_finally() == 4

def try_except_else_finally():
    try:
        return 1
    except ZeroDivisionError:
        return 2
    else:
        return 3
    finally:
        return 4

#assert try_except_else_finally() == 4

args = ['invalid syntax', ['<string>', 1, 2, 'a f']]

info, [filename, lineno, offset, line] = args
assert filename == '<string>'

items = [(1, 2), (3, 4)]
t = []
for i, (key, value) in enumerate(items):
  t.append((key, value))

assert t == items

# issue 1961
src = '''
xs = ["a", "a", "b", "a", "c"]
n = 0
def count(xs):
    for x in xs:
        print("So far, n is", n)
        n += 1
count(xs)
'''

try:
    exec(src)
    raise Exception('should have raises UnboundLocalError')
except UnboundLocalError as exc:
    assert str(exc) == "local variable 'n' referenced before assignment"

# symtable syntax errors
def test_syntax_error(code, message):
    try:
        exec(code)
        print(f'{code} should have raised\nSyntaxError: {message}')
    except SyntaxError as exc:
        if exc.msg != message:
            print(f'code {code} expected {message}, got {exc.msg}')

tests = [
    ("[p for n in (p := ['a', 'b', 'c'])]",
    "assignment expression cannot be used in a comprehension iterable expression"),
    ("class A:\n [x:=1 for _ in range(5)]",
    "assignment expression within a comprehension cannot be used in a class body"),
    ("[i for i in range(5) if (j := 0) for k[j + 1] in range(5)]",
    "comprehension inner loop cannot rebind assignment expression target 'j'"),
    ("[(a := 1) for a, (*b, c[d+e::f(g)], h.i) in [1]]",
    "assignment expression cannot rebind comprehension iteration variable 'a'"),
    ("[(b := 1) for a, (*b, c[d+e::f(g)], h.i) in [1]]",
    "assignment expression cannot rebind comprehension iteration variable 'b'"),
    ("def f(x, x):\n pass",
    "duplicate argument 'x' in function definition")
    ]

for code, expected in tests:
    test_syntax_error(code, expected)

# docstrings
def f():
    """Docstring of function f()."""

assert f.__doc__ == "Docstring of function f()."

class A:
    """Docstring of class A."""

assert A.__doc__ == "Docstring of class A."

# chained assignments and unpacking
x, y = info = (1, 2)
assert x == 1
assert y == 2
assert info == (1, 2)

# error in function calls
def f():
    pass


assert_raises(TypeError, f, 1,
  msg='f() takes 0 positional arguments but 1 was given')

assert_raises(TypeError, f, 1, 2,
  msg='f() takes 0 positional arguments but 2 were given')

assert_raises(TypeError, f, 1, 2, x=0,
  msg="f() got an unexpected keyword argument 'x'")

assert_raises(TypeError, f, 1, 2, x=0, y=1,
  msg="f() got an unexpected keyword argument 'x'")

def f(x=0):
  pass


assert_raises(TypeError, f, 1, 2,
  msg="f() takes from 0 to 1 positional arguments but 2 were given")

assert_raises(TypeError, f, 1, x=2,
  msg="f() got multiple values for argument 'x'")

def f(x, *, h):
  pass

assert_raises(TypeError, f, 1, 2,
  msg="f() takes 1 positional argument but 2 were given")

assert_raises(TypeError, f, 1, h=2, k=4,
  msg="f() got an unexpected keyword argument 'k'")

def f(f=5, *g: 6, h): 
    pass    
print('passed all tests...')