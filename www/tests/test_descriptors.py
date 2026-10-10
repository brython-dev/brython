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
print('passed all tests...')