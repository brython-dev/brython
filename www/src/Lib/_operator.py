"""Operator interface.

This module exports a set of functions implemented in C corresponding
to the intrinsic operators of Python.  For example, operator.add(x, y)
is equivalent to the expression x+y.  The function names are those
used for special methods; variants without leading and trailing
'__' are also provided for convenience."""

def _compare_digest(a, b):
    """Return 'a == b'.
    This function uses an approach designed to prevent
    timing analysis, making it appropriate for cryptography.

    a and b must both be of the same type: either str (ASCII only),
    or any bytes-like object.

    Note: If a and b are of different lengths, or if an error occurs,
    a timing attack could theoretically reveal information about the
    types and lengths of a and b--but not their values."""
    if isinstance(a, str) and isinstance(b, str) and \
            a.isascii() and b.isascii():
        return a == b
    elif isinstance(a, bytes) and isinstance(b, bytes):
        return a == b
    raise TypeError("unsupported operand types")
    
def abs(*args,**kw):
    """Same as abs(a)."""
    pass

def add(*args,**kw):
    """Same as a + b."""
    pass

def and_(*args,**kw):
    """Same as a & b."""
    pass

class attrgetter(object):
    """attrgetter(attr, ...) --> attrgetter object

    Return a callable object that fetches the given attribute(s) from its operand.
    After f = attrgetter('name'), the call f(r) returns r.name.
    After g = attrgetter('name', 'date'), the call g(r) returns (r.name, r.date).
    After h = attrgetter('name.first', 'name.last'), the call h(r) returns
    (r.name.first, r.name.last)."""


    __call__ = "<slot wrapper '__call__' of 'operator.attrgetter' objects>"

    __delattr__ = "<slot wrapper '__delattr__' of 'object' objects>"

    __dir__ = "<method '__dir__' of 'object' objects>"

    __eq__ = "<slot wrapper '__eq__' of 'object' objects>"

    __format__ = "<method '__format__' of 'object' objects>"

    __ge__ = "<slot wrapper '__ge__' of 'object' objects>"

    __getattribute__ = "<slot wrapper '__getattribute__' of 'operator.attrgetter' objects>"

    __gt__ = "<slot wrapper '__gt__' of 'object' objects>"

    __hash__ = "<slot wrapper '__hash__' of 'object' objects>"

    __init__ = "<slot wrapper '__init__' of 'object' objects>"

    def __init_subclass__(*args,**kw):
        """This method is called when a class is subclassed.
        The default implementation does nothing. It may be
        overridden to extend subclasses.
        """
        pass

    __le__ = "<slot wrapper '__le__' of 'object' objects>"

    __lt__ = "<slot wrapper '__lt__' of 'object' objects>"

    __ne__ = "<slot wrapper '__ne__' of 'object' objects>"

    def __new__(*args,**kw):
        """Create and return a new object.  See help(type) for accurate signature."""
        pass

    __reduce__ = "<method '__reduce__' of 'operator.attrgetter' objects>"

    __reduce_ex__ = "<method '__reduce_ex__' of 'object' objects>"

    __repr__ = "<slot wrapper '__repr__' of 'operator.attrgetter' objects>"

    __setattr__ = "<slot wrapper '__setattr__' of 'object' objects>"

    __sizeof__ = "<method '__sizeof__' of 'object' objects>"

    __str__ = "<slot wrapper '__str__' of 'object' objects>"

    def __subclasshook__(*args,**kw):
        """Abstract classes can override this to customize issubclass().
        This is invoked early on by abc.ABCMeta.__subclasscheck__().
        It should return True, False or NotImplemented.  If it returns
        NotImplemented, the normal algorithm is used.  Otherwise, it
        overrides the normal algorithm (and the outcome is cached).
        """
        pass
def concat(*args,**kw):
    """Same as a + b, for a and b sequences."""
    pass

def contains(*args,**kw):
    """Same as b in a (note reversed operands)."""
    pass

def countOf(*args,**kw):
    """Return the number of times b occurs in a."""
    pass

def delitem(*args,**kw):
    """Same as del a[b]."""
    pass

def eq(*args,**kw):
    """Same as a == b."""
    pass

def floordiv(*args,**kw):
    """Same as a // b."""
    pass

def ge(*args,**kw):
    """Same as a >= b."""
    pass

def getitem(*args,**kw):
    """Same as a[b]."""
    pass

def gt(*args,**kw):
    """Same as a > b."""
    pass

def iadd(*args,**kw):
    """Same as a += b."""
    pass

def iand(*args,**kw):
    """Same as a &= b."""
    pass

def iconcat(*args,**kw):
    """Same as a += b, for a and b sequences."""
    pass

def ifloordiv(*args,**kw):
    """Same as a //= b."""
    pass

def ilshift(*args,**kw):
    """Same as a <<= b."""
    pass

def imatmul(*args,**kw):
    """Same as a @= b."""
    pass

def imod(*args,**kw):
    """Same as a %= b."""
    pass

def imul(*args,**kw):
    """Same as a *= b."""
    pass

def index(*args,**kw):
    """Same as a.__index__()"""
    pass

def indexOf(*args,**kw):
    """Return the first index of b in a."""
    pass

def inv(*args,**kw):
    """Same as ~a."""
    pass

def invert(*args,**kw):
    """Same as ~a."""
    pass

def ior(*args,**kw):
    """Same as a |= b."""
    pass

def ipow(*args,**kw):
    """Same as a **= b."""
    pass

def irshift(*args,**kw):
    """Same as a >>= b."""
    pass

def is_(*args,**kw):
    """Same as a is b."""
    pass

def is_not(*args,**kw):
    """Same as a is not b."""
    pass

def isub(*args,**kw):
    """Same as a -= b."""
    pass

class itemgetter(object):
    """itemgetter(item, ...) --> itemgetter object

    Return a callable object that fetches the given item(s) from its operand.
    After f = itemgetter(2), the call f(r) returns r[2].
    After g = itemgetter(2, 5, 3), the call g(r) returns (r[2], r[5], r[3])"""


    __call__ = "<slot wrapper '__call__' of 'operator.itemgetter' objects>"

    __delattr__ = "<slot wrapper '__delattr__' of 'object' objects>"

    __dir__ = "<method '__dir__' of 'object' objects>"

    __eq__ = "<slot wrapper '__eq__' of 'object' objects>"

    __format__ = "<method '__format__' of 'object' objects>"

    __ge__ = "<slot wrapper '__ge__' of 'object' objects>"

    __getattribute__ = "<slot wrapper '__getattribute__' of 'operator.itemgetter' objects>"

    __gt__ = "<slot wrapper '__gt__' of 'object' objects>"

    __hash__ = "<slot wrapper '__hash__' of 'object' objects>"

    __init__ = "<slot wrapper '__init__' of 'object' objects>"

    def __init_subclass__(*args,**kw):
        """This method is called when a class is subclassed.
        The default implementation does nothing. It may be
        overridden to extend subclasses.
        """
        pass

    __le__ = "<slot wrapper '__le__' of 'object' objects>"

    __lt__ = "<slot wrapper '__lt__' of 'object' objects>"

    __ne__ = "<slot wrapper '__ne__' of 'object' objects>"

    def __new__(*args,**kw):
        """Create and return a new object.  See help(type) for accurate signature."""
        pass

    __reduce__ = "<method '__reduce__' of 'operator.itemgetter' objects>"

    __reduce_ex__ = "<method '__reduce_ex__' of 'object' objects>"

    __repr__ = "<slot wrapper '__repr__' of 'operator.itemgetter' objects>"

    __setattr__ = "<slot wrapper '__setattr__' of 'object' objects>"

    __sizeof__ = "<method '__sizeof__' of 'object' objects>"

    __str__ = "<slot wrapper '__str__' of 'object' objects>"

    def __subclasshook__(*args,**kw):
        """Abstract classes can override this to customize issubclass().
        This is invoked early on by abc.ABCMeta.__subclasscheck__().
        It should return True, False or NotImplemented.  If it returns
        NotImplemented, the normal algorithm is used.  Otherwise, it
        overrides the normal algorithm (and the outcome is cached).
        """
        pass
def itruediv(*args,**kw):
    """Same as a /= b."""
    pass

def ixor(*args,**kw):
    """Same as a ^= b."""
    pass

def le(*args,**kw):
    """Same as a <= b."""
    pass

def length_hint(*args,**kw):
    """Return an estimate of the number of items in obj.
    This is useful for presizing containers when building from an iterable.

    If the object supports len(), the result will be exact.
    Otherwise, it may over- or under-estimate by an arbitrary amount.
    The result will be an integer >= 0."""
    pass

def lshift(*args,**kw):
    """Same as a << b."""
    pass

def lt(*args,**kw):
    """Same as a < b."""
    pass

def matmul(*args,**kw):
    """Same as a @ b."""
    pass

class methodcaller(object):
    """methodcaller(name, ...) --> methodcaller object

    Return a callable object that calls the given method on its operand.
    After f = methodcaller('name'), the call f(r) returns r.name().
    After g = methodcaller('name', 'date', foo=1), the call g(r) returns
    r.name('date', foo=1)."""


    __call__ = "<slot wrapper '__call__' of 'operator.methodcaller' objects>"

    __delattr__ = "<slot wrapper '__delattr__' of 'object' objects>"

    __dir__ = "<method '__dir__' of 'object' objects>"

    __eq__ = "<slot wrapper '__eq__' of 'object' objects>"

    __format__ = "<method '__format__' of 'object' objects>"

    __ge__ = "<slot wrapper '__ge__' of 'object' objects>"

    __getattribute__ = "<slot wrapper '__getattribute__' of 'operator.methodcaller' objects>"

    __gt__ = "<slot wrapper '__gt__' of 'object' objects>"

    __hash__ = "<slot wrapper '__hash__' of 'object' objects>"

    __init__ = "<slot wrapper '__init__' of 'object' objects>"

    def __init_subclass__(*args,**kw):
        """This method is called when a class is subclassed.
        The default implementation does nothing. It may be
        overridden to extend subclasses.
        """
        pass

    __le__ = "<slot wrapper '__le__' of 'object' objects>"

    __lt__ = "<slot wrapper '__lt__' of 'object' objects>"

    __ne__ = "<slot wrapper '__ne__' of 'object' objects>"

    def __new__(*args,**kw):
        """Create and return a new object.  See help(type) for accurate signature."""
        pass

    __reduce__ = "<method '__reduce__' of 'operator.methodcaller' objects>"

    __reduce_ex__ = "<method '__reduce_ex__' of 'object' objects>"

    __repr__ = "<slot wrapper '__repr__' of 'operator.methodcaller' objects>"

    __setattr__ = "<slot wrapper '__setattr__' of 'object' objects>"

    __sizeof__ = "<method '__sizeof__' of 'object' objects>"

    __str__ = "<slot wrapper '__str__' of 'object' objects>"

    def __subclasshook__(*args,**kw):
        """Abstract classes can override this to customize issubclass().
        This is invoked early on by abc.ABCMeta.__subclasscheck__().
        It should return True, False or NotImplemented.  If it returns
        NotImplemented, the normal algorithm is used.  Otherwise, it
        overrides the normal algorithm (and the outcome is cached).
        """
        pass
def mod(*args,**kw):
    """Same as a % b."""
    pass

def mul(*args,**kw):
    """Same as a * b."""
    pass

def ne(*args,**kw):
    """Same as a != b."""
    pass

def neg(*args,**kw):
    """Same as -a."""
    pass

def not_(*args,**kw):
    """Same as not a."""
    pass

def or_(*args,**kw):
    """Same as a | b."""
    pass

def pos(*args,**kw):
    """Same as +a."""
    pass

def pow(*args,**kw):
    """Same as a ** b."""
    pass

def rshift(*args,**kw):
    """Same as a >> b."""
    pass

def setitem(*args,**kw):
    """Same as a[b] = c."""
    pass

def sub(*args,**kw):
    """Same as a - b."""
    pass

def truediv(*args,**kw):
    """Same as a / b."""
    pass

def truth(*args,**kw):
    """Return True if a is true, False otherwise."""
    pass

def xor(*args,**kw):
    """Same as a ^ b."""
    pass
