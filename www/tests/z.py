def g():
    1 / 0

def h():
    x = lambda: g()
    x()

def f():
    h()