"""Documentation of module a."""

def f():
    print(__annotations__)

try:
    f()
    raise Exception('should have raised NameError')
except NameError:
    pass

def range(*args):
    return ['a', 'b', 'c']

A = 6

print("file", __file__)