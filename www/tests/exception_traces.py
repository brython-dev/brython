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

    
expected = """\
    abc[
    ~~~~
      'cde'
      ~~~~~
      ]()"""
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
    