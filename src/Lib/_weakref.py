class ProxyType:

    def __init__(self,obj):
        self.obj = obj

CallableProxyType = ProxyType
ProxyTypes = [ProxyType,CallableProxyType]

class ReferenceType:

    def __init__(self,obj,callback):
        self.obj = obj
        self.callback = callback

class ref:

    def __init__(self,obj,callback=None):
        self.obj = ReferenceType(obj,callback)
        self.callback=callback

def getweakrefcount(obj):
    return 1

def getweakrefs(obj):
    return obj


def proxy(obj,callback):
    return ProxyType(obj)

