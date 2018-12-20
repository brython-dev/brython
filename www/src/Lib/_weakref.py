# Minimal implementation of _weakref

class ProxyType:

    def __init__(self, obj):
        object.__setattr__(self, "obj", obj)

    def __setattr__(self, attr, value):
        setattr(object.__getattribute__(self, "obj"), attr, value)

    def __getattr__(self, attr):
        return getattr(object.__getattribute__(self, "obj"), attr)

CallableProxyType = ProxyType
ProxyTypes = [ProxyType, CallableProxyType]

class ReferenceType:

    def __init__(self,obj,callback):
        self.obj = obj
        self.callback = callback

class ref:

    def __init__(self, obj, callback=None):
        self.obj = ReferenceType(obj, callback)
        self.callback = callback

    def __call__(self):
        return self.obj.obj

    def __hash__(self):
        return hash(self.obj.obj)

    def __eq__(self, other):
        return self.obj.obj == other.obj.obj

def getweakrefcount(obj):
    return 1

def getweakrefs(obj):
    return obj

def _remove_dead_weakref(*args):
    pass

def proxy(obj, callback=None):
    return ProxyType(obj)

