"""Documentation of module a."""

def f():
    print(__annotations__)
print(type(__builtins__))
__builtins__.open # cf. issue 2196

try:
    f()
    raise Exception('should have raised NameError')
except NameError:
    pass

def range(*args):
    return ['a', 'b', 'c']

A = 6

print("file", __file__)