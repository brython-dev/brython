import sys

# issue 1218
x = "Outer stack frame"

def t():
    x = "Inner stack frame"
    my_locals = sys._getframe(0).f_locals
    assert my_locals['x'] == "Inner stack frame"
    outer_locals = sys._getframe(1).f_locals
    assert outer_locals['x'] == "Outer stack frame"

t()

# trace functions
traces = []
def f(frame, event, arg):
    global first_line
    if isinstance(arg, tuple):
        arg = arg[0]
    if not traces:
        first_line = frame.f_lineno
    trace = [event, frame.f_code.co_name,
        frame.f_lineno - first_line, arg]

    traces.append(trace)
    return f

sys.settrace(f)

def g(x):
  for i in range(2):
      pass
  try:
      1/0
  except:
      pass # ignore exception
  for car in 'abc':
      pass
  return x

g(44)

def h():
    pass

h()

class A:

  def f(self):
    print("A.f")
    return 4

A()

expected = [
    ['call', 'g', 0, None],
    ['line', 'g', 1, None],
    ['line', 'g', 2, None],
    ['line', 'g', 1, None],
    ['line', 'g', 2, None],
    ['line', 'g', 1, None],
    ['line', 'g', 3, None],
    ['line', 'g', 4, None],
    ['exception', 'g', 4, ZeroDivisionError],
    ['line', 'g', 5, None],
    ['line', 'g', 6, None],
    ['line', 'g', 7, None],
    ['line', 'g', 8, None],
    ['line', 'g', 7, None],
    ['line', 'g', 8, None],
    ['line', 'g', 7, None],
    ['line', 'g', 8, None],
    ['line', 'g', 7, None],
    ['line', 'g', 9, None],
    ['return', 'g', 9, 44],
    ['call', 'h', 13, None],
    ['line', 'h', 14, None],
    ['return', 'h', 14, None],
    ['call', 'A', 18, None],
    ['line', 'A', 18, None],
    ['line', 'A', 20, None],
    ['return', 'A', 20, None]
]

if traces != expected:
  for i, (line1, line2) in enumerate(zip(traces, expected)):
    if line1 == line2:
      print('same line', i, 'traces', line1, 'expected', line2)
    else:
      print('diff line', i, 'traces', line1, 'expected', line2)
      raise AssertionError('result is not the same as expected')
  else:
      print('remaining in traces\n', traces[i:],
          '\nremaining in expected', expected[i:])

# remove trace for next tests
sys.settrace(None)
