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