try:
    from browser import __BRYTHON__, console
except:
    __BRYTHON__ = None
    import traceback
    import io

def check(exc, expected):
    if __BRYTHON__:
        trace = __BRYTHON__.error_trace(exc)
        assert expected in trace
    else:
        out = io.StringIO()
        traceback.print_exc(file=out)
        assert expected in out.getvalue()

# ZeroDiv error on single line
expected = """\
    1 / 0
    ~~^~~"""

try:
    1 / 0
except ZeroDivisionError as exc:
    check(exc, expected)

# ZeroDiv error on multiline expression
expected = """\
      (1 /
       ~~^
          (2 -
          ~~~~
    2)"""
try:
  (1 /
      (2 -
2)
)
except ZeroDivisionError as exc:
    check(exc, expected)

# not callable error
expected = """\
    x()
    ~^^"""
try:
    x = 1
    x()
except TypeError as exc:
    check(exc, expected)

# "not callable" error
expected = """
    abc[
    ~~~~
      'cde'
      ~~~~~
      ]()
      ~^^
"""
try:
    abc = {'cde': 1}
    abc[
      'cde'
      ]()
except TypeError as exc:
    check(exc, expected)

expected = """
    t[
    ~~
        0][
        ~~^
     22 +
     ^^^^
     3
     ^
         ]
         ^
"""

# index error
try:
    t = [[]]
    t[
        0][
     22 +
     3
         ]
except IndexError as exc:
    check(exc, expected)

expected = """
    a, [b, c], [d, e] = [1, [2, 3], [5]]
               ^^^^^^
"""

try:
    a, [b, c], [d, e] = [1, [2, 3], [5]]
except ValueError as exc:
    check(exc, expected)

# inside class body
expected = [
"""
    class A:
    ...<4 lines>...
        import zerodiverror
""", """
    class B:
    ...<2 lines>...
      import zerodiverror
""", """
    import zerodiverror
""", """
    1 / 0
    ~~^~~
"""]

try:
    class A:

      class B:
        def f(self):
          pass
        import zerodiverror
except ZeroDivisionError as exc:
    for exp in expected:
        check(exc, exp)

# raise SyntaxError (issue #2529)
expected = """    raise SyntaxError('rien', ('test', 3, 2, 'coucou'))
  File "test", line 3
    coucou
     ^
"""

try:
    raise SyntaxError('rien', ('test', 3, 2, 'coucou'))
except SyntaxError as exc:
    check(exc, expected)

# delete key in dict
expected = """
    del t[4]
        ~^^^
"""

try:
    t = {}
    del t[4]
except KeyError as exc:
    check(exc, expected)

expected = """
    del t[4]
        ~^^^
"""

# delete key in list
try:
    t = []
    del t[4]
except IndexError as exc:
    check(exc, expected)

# delete attribute
expected = """
    del t.foo
        ^^^^^
"""

try:
    t = []
    del t.foo
except AttributeError as exc:
    check(exc, expected)