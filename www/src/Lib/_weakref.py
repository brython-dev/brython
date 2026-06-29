# Minimal implementation of _weakref

class ProxyType:

    def __init__(self, obj):
        object.__setattr__(self, "obj", obj)

    def __setattr__(self, attr, value):
        setattr(object.__getattribute__(self, "obj"), attr, value)

    def __getattr__(self, attr):
        return getattr(object.__getattribute__(self, "obj"), attr)

    # CPython's weakproxy proxies the operator slots (len, iter, ==,
    # hash, arithmetic, str, …) to the wrapped object via its slot
    # table. Python looks up these dunders on the CLASS, sidestepping
    # __getattr__, so they need explicit forwarders here.
    #
    # `__repr__` is the one slot CPython's weakproxy does NOT forward:
    # it has its own format showing proxy identity (matches that here).

    # Sequence / mapping
    def __len__(self):
        return len(object.__getattribute__(self, "obj"))

    def __iter__(self):
        return iter(object.__getattribute__(self, "obj"))

    def __getitem__(self, key):
        return object.__getattribute__(self, "obj")[key]

    def __setitem__(self, key, value):
        object.__getattribute__(self, "obj")[key] = value

    def __delitem__(self, key):
        del object.__getattribute__(self, "obj")[key]

    def __contains__(self, item):
        return item in object.__getattribute__(self, "obj")

    # Comparison
    def __eq__(self, other):
        return object.__getattribute__(self, "obj") == other

    def __ne__(self, other):
        return object.__getattribute__(self, "obj") != other

    def __lt__(self, other):
        return object.__getattribute__(self, "obj") < other

    def __le__(self, other):
        return object.__getattribute__(self, "obj") <= other

    def __gt__(self, other):
        return object.__getattribute__(self, "obj") > other

    def __ge__(self, other):
        return object.__getattribute__(self, "obj") >= other

    # hash / bool / str — all forwarded (CPython's weakproxy_hash /
    # _bool / _str all delegate to the wrapped object's slot).
    def __hash__(self):
        return hash(object.__getattribute__(self, "obj"))

    def __bool__(self):
        return bool(object.__getattribute__(self, "obj"))

    def __str__(self):
        return str(object.__getattribute__(self, "obj"))

    # repr: CPython's weakproxy has its OWN repr ("<weakproxy at 0x…;
    # to 'X' at 0x…>"), it does NOT forward to the wrapped object's
    # repr — match that.
    def __repr__(self):
        obj = object.__getattribute__(self, "obj")
        return (f"<weakproxy at {id(self):#x}; to "
                f"'{type(obj).__name__}' at {id(obj):#x}>")

    # Arithmetic (the subset CPython's weakproxy slot table forwards)
    def __add__(self, other):
        return object.__getattribute__(self, "obj") + other

    def __mul__(self, other):
        return object.__getattribute__(self, "obj") * other

    def __rmul__(self, other):
        return other * object.__getattribute__(self, "obj")

    # Pickling: __reduce_ex__/__reduce__ and __class__ are found on object
    # (the class), so __getattr__ never sees them — forward them explicitly,
    # so a proxy pickles to a copy of the referent built from its __class__.
    def __reduce_ex__(self, proto):
        return object.__getattribute__(self, "obj").__reduce_ex__(proto)

    def __reduce__(self):
        return object.__getattribute__(self, "obj").__reduce__()

    @property
    def __class__(self):
        return type(object.__getattribute__(self, "obj"))

CallableProxyType = ProxyType
ProxyTypes = [ProxyType, CallableProxyType]

class ReferenceType:

    def __init__(self,obj,callback):
        self.obj = obj
        self.callback = callback

class ref:

    def __new__(cls, *args, **kw):
        return object.__new__(cls)
        
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

