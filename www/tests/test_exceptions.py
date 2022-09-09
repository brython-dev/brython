import io
import traceback
import re

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