Syntax
------

Brython follows the Python syntax:

- whitespaces are significant and define blocks
- lists are created with `[]` or `list()`, tuples with `()` or `tuple()`, dictionaries with `{}` or `dict()` and sets with `set()`
- list, dict and set comprehensions:

 - `[ expr for item in iterable if condition ]`
 - `dict((i,2*i) for i in range(5))`
 - `set(x for x in 'abcdcga')`

- generators (keyword `yield`), generator expressions : `foo(x for x in bar if x>5)`
- ternary operator: `x = r1 if condition else r2`
- functions can be defined with any combination of fixed arguments, default values, variable positional arguments 
 and variable keyword arguments : `def foo(x, y=0, *args, **kw):`
- unpacking of argument lists or dictionaries in function calls: `x = foo(*args, **kw)`
- classes with multiple inheritance
- decorators
- imports :  
 - `import foo`
 - `from foo import X`
 - `import foo as bar`
 - `from foo import X as Y`
 - `from foo import *`

Keywords and built-in functions
-------------------------------

Brython supports all the keywords and most functions of Python 3 :

- keywords : `as, assert, break, class, continue, def, del, elif, else, except, False, finally, for, from, global, if, import, is, lambda, None, nonlocal, pass, return, True, try, while, with, yield`
- built-in functions : `abs(), all(), any(), ascii(), bin(), bool(), bytes(), callable(), chr(), classmethod(), delattr(), dict(), dir(), divmod(), enumerate(), eval(), exec(), filter(), float(), frozenset(), getattr(), globals(), hasattr(), hash(), hex(), id(), input(), int(), isinstance(), iter(), len(), list(), locals(), map(), max(), min(), next(), object(), open(), ord(), pow(), print(), property(), range(), repr(), reversed(), round(), set(), setattr(), slice(), sorted(), str(), sum(), super(), tuple(), type(), zip(), __import__()`

By default, `print()` will output to the web browser console and so are the error messages. `sys.stderr` and `sys.stdout` can be assigned to an object with a `write()` method, and this allows for the redirection of output to go to a window or text area, for example

`sys.stdin` is not implemented at this time, however there is an `input()` built-in function that will open a blocking input dialog (a prompt).

To open a print dialog (to a printer), call `window.print` (`window` is defined in module **browser**)

The following built-in functions `memoryview(), vars()` are not implemented in the current version
