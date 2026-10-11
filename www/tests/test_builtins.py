builtins_names = """__name__
__doc__
__package__
__loader__
__spec__
__build_class__
__import__
abs
all
any
ascii
bin
breakpoint
callable
chr
compile
delattr
dir
divmod
eval
exec
format
getattr
globals
hasattr
hash
hex
id
input
isinstance
issubclass
iter
aiter
len
locals
max
min
next
anext
oct
ord
pow
print
repr
round
setattr
sorted
sum
vars
None
Ellipsis
NotImplemented
False
True
bool
memoryview
bytearray
bytes
classmethod
complex
dict
enumerate
filter
float
frozenset
property
int
list
map
object
range
reversed
set
slice
staticmethod
str
super
tuple
type
zip
__debug__
BaseException
Exception
TypeError
StopAsyncIteration
StopIteration
GeneratorExit
SystemExit
KeyboardInterrupt
ImportError
ModuleNotFoundError
OSError
EnvironmentError
IOError
WindowsError
EOFError
RuntimeError
RecursionError
NotImplementedError
NameError
UnboundLocalError
AttributeError
SyntaxError
IndentationError
TabError
LookupError
IndexError
KeyError
ValueError
UnicodeError
UnicodeEncodeError
UnicodeDecodeError
UnicodeTranslateError
AssertionError
ArithmeticError
FloatingPointError
OverflowError
ZeroDivisionError
SystemError
ReferenceError
MemoryError
BufferError
Warning
UserWarning
EncodingWarning
DeprecationWarning
PendingDeprecationWarning
SyntaxWarning
RuntimeWarning
FutureWarning
ImportWarning
UnicodeWarning
BytesWarning
ResourceWarning
ConnectionError
BlockingIOError
BrokenPipeError
ChildProcessError
ConnectionAbortedError
ConnectionRefusedError
ConnectionResetError
FileExistsError
FileNotFoundError
IsADirectoryError
NotADirectoryError
InterruptedError
PermissionError
ProcessLookupError
TimeoutError
open
quit
exit
copyright
credits
license
help"""

import builtins
for name in builtins_names.split('\n'):
    assert name in builtins.__dict__, name

from tester import assert_raises

# a builtin that takes exactly one argument or a fixed number of them says so
for func in [abs, len, ord, repr]:
    name = func.__name__
    assert_raises(TypeError, func,
        msg=f'{name}() takes exactly one argument (0 given)')
    assert_raises(TypeError, func, 1, 2,
        msg=f'{name}() takes exactly one argument (2 given)')

for func in [divmod, hasattr, isinstance]:
    name = func.__name__
    assert_raises(TypeError, func, 1,
        msg=f'{name} expected 2 arguments, got 1')
    assert_raises(TypeError, func, 1, 2, 3,
        msg=f'{name} expected 2 arguments, got 3')

# a method does not count its instance
for obj, name in [(set(), 'add'), ([], 'append'), ('a', 'join')]:
    qualname = f'{type(obj).__name__}.{name}'
    assert_raises(TypeError, getattr(obj, name),
        msg=f'{qualname}() takes exactly one argument (0 given)')
    assert_raises(TypeError, getattr(obj, name), 1, 2,
        msg=f'{qualname}() takes exactly one argument (2 given)')
    assert_raises(TypeError, getattr(type(obj), name), obj,
        msg=f'{qualname}() takes exactly one argument (0 given)')
    assert_raises(TypeError, getattr(obj, name), x=1,
        msg=f'{qualname}() takes no keyword arguments')