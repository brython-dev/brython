#!/usr/bin/env python3
"""
Operator Interface

This module exports a set of functions corresponding to the intrinsic 
operators of Python.  For example, operator.add(x, y) is equivalent 
to the expression x+y.  The function names are those used for special 
methods; variants without leading and trailing '__' are also provided 
for convenience.

This is the pure Python implementation of the module.
"""

# downloaded from http://bugs.python.org/file28327/operator.py

#import builtins as _bi  #there is no builtins module

def lt(a, b):
    "Same as a < b."
    return a < b
__lt__ = lt

def le(a, b):
    "Same as a <= b."
    return a <= b
__le__ = le

def eq(a, b):
    "Same as a == b."
    return a == b
__eq__ = eq

def ne(a, b):
    "Same as a != b."
    return a != b
__ne__ = ne

def ge(a, b):
    "Same as a >= b."
    return a >= b
__ge__ = ge

def gt(a, b):
    "Same as a > b."
    return a > b
__gt__ = gt

def not_(a):
    "Same as not a."
    return not a
__not__ = not_

def truth(a):
    "Return True if a is true, False otherwise."
    #return _bi.bool(a)
    return bool(a)

def is_(a, b):
    "Same as a is b."
    return a is b

# brython does not like  (causes syntax error)
#def is_not(a, b):
#    "Same as a is not b."
#    return a is not b

#recursion error or just comment out and add code below function
#def abs(a):
#    "Same as abs(a)."
#    #return _bi.abs(a)
#    return abs(a)
__abs__ = abs
abs=abs


def add(a, b):
    "Same as a + b."
    return a + b
__add__ = add

def and_(a, b):
    "Same as a & b."
    return a & b
__and__ = and_

def floordiv(a, b):
    "Same as a // b."
    return a // b
__floordiv__ = floordiv

def index(a):
    "Same as a.__index__()."
    return a.__index__()
__index__ = index

def inv(a):
    "Same as ~a."
    return ~a    #brython does not like
    #return a^(2**31)
invert = __inv__ = __invert__ = inv

def lshift(a, b):
    "Same as a << b."
    return a << b
__lshift__ = lshift

def mod(a, b):
    "Same as a % b."
    return a % b
__mod__ = mod

def mul(a, b):
    "Same as a * b."
    return a * b
__mul__ = mul

def neg(a):
    "Same as -a."
    return -a
__neg__ = neg

def or_(a, b):
    "Same as a | b."
    return a | b
__or__ = or_

def pos(a):
    "Same as +a."
    return +a    #brython does not like

__pos__ = pos

def pow(a, b):
    "Same as a ** b."
    return a ** b
__pow__ = pow

def rshift(a, b):
    "Same as a >> b."
    return a >> b
__rshift__ = rshift

def sub(a, b):
    "Same as a - b."
    return a - b
__sub__ = sub

def truediv(a, b):
    "Same as a / b."
    return a / b
__truediv__ = truediv

def xor(a, b):
    "Same as a ^ b."
    return a ^ b
__xor__ = xor

def concat(a, b):
    "Same as a + b, for a and b sequences."
    if not (hasattr(a, '__getitem__') and hasattr(b, '__getitem__')):
        raise TypeError('a and b must be sequences')
    return a + b
__concat__ = concat

def contains(a, b):
    "Same as b in a (note reversed operands)."
    return b in a
__contains__ = contains

def countOf(a, b):
    "Return the number of times b occurs in a."
    count = 0
    for i in a:
        if i == b:
            count += 1
    return count

def delitem(a, b):
    "Same as del a[b]."
    del a[b]
__delitem__ = delitem

def getitem(a, b):
    "Same as a[b]."
    return a[b]
__getitem__ = getitem

#fixme  brython doesn't like this function
def indexOf(a, b):
    "Return the first index of b in a."
    #for i, j in _bi.enumerate(a):
    for i, j in enumerate(a):
        if j == b:
            return i
    else:
        raise ValueError('b not found in a')

def setitem(a, b, c):
    "Same as a[b] = c."
    a[b] = c
__setitem__ = setitem



class attrgetter:
    """
    Return a callable object that fetches the given attribute(s) from its operand.
    After f=attrgetter('name'), the call f(r) returns r.name.
    After g=attrgetter('name', 'date'), the call g(r) returns (r.name, r.date).
    After h=attrgetter('name.first', 'name.last'), the call h(r) returns
    (r.name.first, r.name.last).
    """
    def __init__(self, attr, *attrs):
        self._attrs = (attr,)
        self._attrs += attrs
        if any(not isinstance(attr, str) for attr in self._attrs):
            raise TypeError('attribute name must be a string')

    @staticmethod
    def _resolve_attr(obj, attr):
        for name in attr.split('.'):
            #obj = _bi.getattr(obj, name)
            obj = getattr(obj, name)
        return obj

    def __call__(self, obj):
        if len(self._attrs) == 1:
            return self._resolve_attr(obj, self._attrs[0])
        return tuple(self._resolve_attr(obj, attr) for attr in self._attrs)

class itemgetter:
    """
    Return a callable object that fetches the given item(s) from its operand.
    After f=itemgetter(2), the call f(r) returns r[2].
    After g=itemgetter(2,5,3), the call g(r) returns (r[2], r[5], r[3])
    """
    def __init__(self, item, *items):
        self._items = (item,)
        self._items += items

    def __call__(self, obj):
        if len(self._items) == 1:
            return obj[self._items[0]]
        return tuple(obj[item] for item in self._items)

class methodcaller:
    """
    Return a callable object that calls the given method on its operand.
    After f = methodcaller('name'), the call f(r) returns r.name().
    After g = methodcaller('name', 'date', foo=1), the call g(r) returns
    r.name('date', foo=1).
    """

    def __init__(self, name, *args, **kwargs):
        self._name = name
        self._args = args
        self._kwargs = kwargs

    def __call__(self, obj):
        return getattr(obj, self._name)(*self._args, **self._kwargs)


def iadd(a, b):
    "Same as a += b."
    a += b
    return a
__iadd__ = iadd

def iand(a, b):
    "Same as a &= b."
    a &= b
    return a
__iand__ = iand

def iconcat(a, b):
    "Same as a += b, for a and b sequences."
    if not (hasattr(a, '__getitem__') and hasattr(b, '__getitem__')):
        raise TypeError('a and b must be sequences')
    a += b
    return a
__iconcat__ = iconcat

def ifloordiv(a, b):
    "Same as a //= b."
    a //= b
    return a
__ifloordiv__ = ifloordiv

def ilshift(a, b):
    "Same as a <<= b."
    a <<= b
    return a
__ilshift__ = ilshift

def imod(a, b):
    "Same as a %= b."
    a %= b
    return a
__imod__ = imod

def imul(a, b):
    "Same as a *= b."
    a *= b
    return a
__imul__ = imul

def ior(a, b):
    "Same as a |= b."
    a |= b
    return a
__ior__ = ior

def ipow(a, b):
    "Same as a **= b."
    a **=b
    return a
__ipow__ = ipow

def irshift(a, b):
    "Same as a >>= b."
    a >>= b
    return a
__irshift__ = irshift

def isub(a, b):
    "Same as a -= b."
    a -= b
    return a
__isub__ = isub

def itruediv(a, b):
    "Same as a /= b."
    a /= b
    return a
__itruediv__ = itruediv

def ixor(a, b):
    "Same as a ^= b."
    a ^= b
    return a
__ixor__ = ixor

def length_hint(obj, default=0):
    """
    Return an estimate of the number of items in obj.
    This is useful for presizing containers when building from an iterable.

    If the object supports len(), the result will be exact. Otherwise, it may
    over- or under-estimate by an arbitrary amount. The result will be an
    integer >= 0.
    """
    try:
        return len(obj)
    except TypeError:
        try:
            val = obj.__length_hint__()
            if val is NotImplemented:
                raise TypeError
        except (AttributeError, TypeError):
            return default
        else:
            if not val > 0:
                raise ValueError('default must be > 0')
            return val

#try:
#    from _operator import *
#    from _operator import __doc__
#except ImportError:
#   pass
