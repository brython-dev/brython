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
print('passed all tests...')