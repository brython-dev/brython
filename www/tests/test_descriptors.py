# -*- coding: utf-8 -*-

# the __set__ and __delete__ of a builtin descriptor return None
A = type("A", (), {"__slots__": ("x",), "p": property(int, lambda *a: 5, lambda *a: 6)})
a = A()
for d in (A.x, A.p):
    assert d.__set__(a, 1) is None
    assert d.__delete__(a) is None
    assert type(d).__delete__.__name__ == "__delete__"

class Descriptor (object):
    
    def __init__ (self):
        self.value = None
    
    def __get__ (self, obj, cls = None):
        return (obj, cls, self.value)
    
    def __set__ (self, obj, value):
        self.value = value
        

class Obj (object):
    
    property = Descriptor ()
    
    def test (self):
        assert self.property == (self, Obj, None)
        self.property = 'VALUE'
        assert (self.property == (self, Obj, 'VALUE'))


o = Obj ()
o.test ()

# object.__setattr__ returns None, whatever the descriptor's __set__ returns
class Returning:
    def __set__(self, obj, value):
        return 5

class Held:
    d = Returning()

assert object.__setattr__(Held(), "d", 1) is None

# a method descriptor called through its type checks its receiver
class K:
    pass

class L(list):
    pass

for call, args, message in [
        (list.append, (K(), 5),
            "descriptor 'append' for 'list' objects doesn't apply to a 'K' object"),
        (dict.get, (K(), 1),
            "descriptor 'get' for 'dict' objects doesn't apply to a 'K' object"),
        (str.upper, (1,),
            "descriptor 'upper' for 'str' objects doesn't apply to a 'int' object")]:
    try:
        call(*args)
        raise AssertionError(f"{call} accepted {args[0]!r}")
    except TypeError as exc:
        assert str(exc) == message, str(exc)

rows = L()
list.append(rows, 5)
assert rows == [5]
assert str.upper("ab") == "AB"

print('passed all tests...')