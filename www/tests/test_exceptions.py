import io
import traceback
import re

from tester import assert_raises

src = """def f():
  f()

f()"""

expected = """  File "<string>", line 4, in <module>
  File "<string>", line 2, in f
  File "<string>", line 2, in f
  File "<string>", line 2, in f"""

try:
    exec(src)
except RecursionError as exc:
    out = io.StringIO()
    traceback.print_exc(file=out)
    trace = out.getvalue()
    assert expected in trace
    assert re.search(r"[Previous line repeated \d+ more times]", trace)
    assert "RecursionError: maximum recursion depth exceeded" in trace

src = """x = 0

def f():
    global x
    x += 1
    if x < 10:
        f()
    1 / 0
f()"""

expected = """  File "<string>", line 9, in <module>
  File "<string>", line 7, in f
  File "<string>", line 7, in f
  File "<string>", line 7, in f
  [Previous line repeated 6 more times]
  File "<string>", line 8, in f
ZeroDivisionError: division by zero"""

try:
    exec(src)
except ZeroDivisionError as exc:
    out = io.StringIO()
    traceback.print_exc(file=out)
    trace = out.getvalue()
    assert expected in trace

# PEP 654 (Exception Groups and except*)

assert_raises(TypeError,
    ExceptionGroup,
    'issues',
    [ValueError('bad value'), BaseException('base')],
    msg = 'Cannot nest BaseExceptions in an ExceptionGroup')

e = BaseExceptionGroup('issues',
        [ValueError('bad value'), TypeError('bad type')])
assert type(e) is ExceptionGroup

import io

eg = BaseExceptionGroup(
    "one",
    [
        BaseException(1),
        ExceptionGroup(
            "two",
             [TypeError(2), ValueError(3)]
        ),
        ExceptionGroup(
             "three",
              [OSError(4)]
        )
    ]
)

def normalize(multiline):
    """Set line ends to \n"""
    multiline = multiline.replace('\r\n', '\n')
    multiline = multiline.replace('\r', '\n')
    return multiline

import traceback

out = io.StringIO()
traceback.print_exception(eg, file=out)
expected = normalize("""  | BaseExceptionGroup: one (3 sub-exceptions)
  +-+---------------- 1 ----------------
    | BaseException: 1
    +---------------- 2 ----------------
    | ExceptionGroup: two (2 sub-exceptions)
    +-+---------------- 1 ----------------
      | TypeError: 2
      +---------------- 2 ----------------
      | ValueError: 3
      +------------------------------------
    +---------------- 3 ----------------
    | ExceptionGroup: three (1 sub-exception)
    +-+---------------- 1 ----------------
      | OSError: 4
      +------------------------------------
""")
got = normalize(out.getvalue())

assert got == expected

type_errors = eg.subgroup(lambda e: isinstance(e, TypeError))
out = io.StringIO()
expected = normalize("""  | ExceptionGroup: one (1 sub-exception)
  +-+---------------- 1 ----------------
    | ExceptionGroup: two (1 sub-exception)
    +-+---------------- 1 ----------------
      | TypeError: 2
      +------------------------------------
""")
traceback.print_exception(type_errors, file=out)
assert normalize(out.getvalue()) == expected

type_errors, rest = eg.split(lambda e: isinstance(e, TypeError))
out = io.StringIO()
expected = normalize("""  | ExceptionGroup: one (1 sub-exception)
  +-+---------------- 1 ----------------
    | ExceptionGroup: two (1 sub-exception)
    +-+---------------- 1 ----------------
      | TypeError: 2
      +------------------------------------
""")
traceback.print_exception(type_errors, file=out)
assert normalize(out.getvalue()) == expected

out = io.StringIO()
expected = normalize("""  | BaseExceptionGroup: one (3 sub-exceptions)
  +-+---------------- 1 ----------------
    | BaseException: 1
    +---------------- 2 ----------------
    | ExceptionGroup: two (1 sub-exception)
    +-+---------------- 1 ----------------
      | ValueError: 3
      +------------------------------------
    +---------------- 3 ----------------
    | ExceptionGroup: three (1 sub-exception)
    +-+---------------- 1 ----------------
      | OSError: 4
      +------------------------------------
""")
traceback.print_exception(rest, file=out)
assert normalize(out.getvalue()) == expected

def f(src):
    s = []
    try:
        exec(src)
    except * TypeError:
        ...
    except* ValueError as e:
        ...
    except*  (ZeroDivisionError, FileNotFoundError) as e:
        s.append('zero')
    else:
        s.append('no exception')
    finally:
        s.append('end')
    return s

assert f("1 / 0") == ['zero', 'end']
assert f("x = 0") == ['no exception', 'end']

# PEP 678 – Enriching Exceptions with Notes
try:
    1 / 0
except ZeroDivisionError as exc:
    assert_raises(AttributeError, getattr, exc, '__notes__')
    exc.add_note('zero')
    assert exc.__notes__ == ['zero']
  