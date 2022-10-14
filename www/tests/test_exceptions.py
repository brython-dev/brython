import io
import traceback
import re
import sys

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

source = "def myfunc():\n error"
code = compile(source, 'foo.py', 'exec')
exec(code)
expected = """File "foo.py", line 2, in myfunc"""

try:
    myfunc()
except NameError as exc:
    import traceback
    import io
    out = io.StringIO()
    traceback.print_exc(file=out)
    assert expected in out.getvalue()

# issue 2021
def f():
    f()

try:
    f()
except RecursionError:
    the_traceback = traceback.format_exc()
    assert ', in f' in the_traceback
    assert '[Previous line repeated' in the_traceback
except:
    print('Failure in testTraceback')

# issue 2060
ne = NameError('dero')
assert str(ne) == 'dero'

try:
  dero
except NameError as exc:
  assert exc.name == 'dero'
  assert exc.args[0] == "name 'dero' is not defined"
  assert str(exc) == exc.args[0]

class A:
  def __init__(self):
    self.attribute = 0

a = A()
try:
  a.atribute
except AttributeError as exc:
  assert exc.args[0] == str(exc) == "'A' object has no attribute 'atribute'"
  assert exc.obj == a

# issue 2073
# exception in evaluation of iterable: error trace does not include <listcomp>
try:
    [i for i in 1 / 0]
except ZeroDivisionError as exc:
    exc_type, exc_value, tb = sys.exc_info()
    this_frame = sys._getframe()
    frames = []
    append = False
    while tb:
        frame = tb.tb_frame
        if frame is this_frame:
            append = True
        if append:
            frames.append(frame.f_code.co_name)
        tb = tb.tb_next
    assert frames == ['<module>'], frames

# exception in evaluation of iter(iterable): error trace does not include <listcomp>
try:
    [i for i in 3]
except TypeError as exc:
    exc_type, exc_value, tb = sys.exc_info()
    this_frame = sys._getframe()
    frames = []
    append = False
    while tb:
        frame = tb.tb_frame
        if frame is this_frame:
            append = True
        if append:
            frames.append(frame.f_code.co_name)
        tb = tb.tb_next
    assert frames == ['<module>'], frames


# exception happens in iteration: error trace includes <listcomp>
def gen():
    yield 1/0

try:
    [i for i in gen()]
except ZeroDivisionError as exc:
    exc_type, exc_value, tb = sys.exc_info()
    this_frame = sys._getframe()
    frames = []
    append = False
    while tb:
        frame = tb.tb_frame
        if frame is this_frame:
            append = True
        if append:
            frames.append(frame.f_code.co_name)
        tb = tb.tb_next
    assert frames == ['<module>', '<listcomp>', 'gen'], frames