try:
    from browser import __BRYTHON__, console
except:
    __BRYTHON__ = None
    import traceback
    import io

expected = """\
    1 / 0
    ~~^~~"""

try:
    1 / 0
except ZeroDivisionError as exc:
    if __BRYTHON__:
        trace = __BRYTHON__.error_trace(exc)
        assert expected in trace, trace
    else:
        out = io.StringIO()
        traceback.print_exc(file=out)
        assert expected in out.getvalue()

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
    if __BRYTHON__:
        trace = __BRYTHON__.error_trace(exc)
        assert expected in trace, trace
    else:
        out = io.StringIO()
        traceback.print_exc(file=out)
        assert expected in out.getvalue()

# not callable
expected = """\
    x()
    ~^^"""
try:
    x = 1
    x()
except TypeError as exc:
    if __BRYTHON__:
        trace = __BRYTHON__.error_trace(exc)
        assert expected in trace, trace
    else:
        out = io.StringIO()
        traceback.print_exc(file=out)
        assert expected in out.getvalue()


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
    if __BRYTHON__:
      trace = __BRYTHON__.error_trace(exc)
      assert expected in trace, trace
    else:
      out = io.StringIO()
      traceback.print_exc(file=out)
      assert expected in out.getvalue()

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

try:
    t = [[]]
    t[
        0][
     22 +
     3
         ]
except IndexError as exc:
    if __BRYTHON__:
      trace = __BRYTHON__.error_trace(exc)
      assert expected in trace, trace
    else:
      out = io.StringIO()
      traceback.print_exc(file=out)
      assert expected in out.getvalue(), out.getvalue()

expected = """
    a, [b, c], [d, e] = [1, [2, 3], [5]]
               ^^^^^^
"""

try:
    a, [b, c], [d, e] = [1, [2, 3], [5]]
except ValueError as exc:
    if __BRYTHON__:
      trace = __BRYTHON__.error_trace(exc)
      assert expected in trace, trace
    else:
      out = io.StringIO()
      traceback.print_exc(file=out)
      assert expected in out.getvalue(), out.getvalue()

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
    if __BRYTHON__:
      trace = __BRYTHON__.error_trace(exc)
      for exp in expected:
          assert exp in trace, trace
    else:
      out = io.StringIO()
      traceback.print_exc(file=out)
      for exp in expected:
          assert exp in out.getvalue(), out.getvalue()
