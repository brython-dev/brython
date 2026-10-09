# -*- coding: utf-8 -*-

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

print('passed all tests...')