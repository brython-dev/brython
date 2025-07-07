import traceback
import linecache

def exec_with_line_numbers(src):
    fake_name = "<fake_file>"
    linecache.cache[fake_name] = (len(src), None, src.splitlines(True), fake_name)
    exec(compile(src, fake_name, "exec"))

# issue 859
try:
    exec_with_line_numbers('''\
def f():
    return 1 / 0
f()
''')
except Exception:
    exception_info = traceback.format_exc()
    assert '1 / 0' in exception_info
    assert ', in f' in exception_info

# issue 885
try:
    exec_with_line_numbers('1/0')
except Exception:
    assert '1/0' in traceback.format_exc()

# issue 887
try:
    exec_with_line_numbers("exec('def f(): return 1/0\\nf()')")
except ZeroDivisionError:
    trace = traceback.format_exc()
    assert 'exec(\'def f(): return 1/0\\nf()\')' in trace
    assert 'f()' in trace
    assert 'def f(): return 1/0\\n' in trace

# issue 961
try:
    exec_with_line_numbers('''\
def g():
    1 / 0

def h():
    x = lambda: g()
    x()

def f():
    h()

f()
''')
except ZeroDivisionError:
    trace = traceback.format_exc()
    assert "line 9, in f" in trace
    assert "line 6, in h" in trace
    assert "line 5, in <lambda>" in trace
    assert "line 2, in g" in trace

# issue 976
try:
    exec_with_line_numbers("""t = (
                    1, 2, 3,
                    4, 5 6
            )""")
    raise Exception("should have raised SyntaxError")
except SyntaxError as exc:
    assert exc.lineno == 3