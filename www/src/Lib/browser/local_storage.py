# local storage in browser
import sys
from javascript import JSObject

class __UnProvided():
    pass

class LocalStorage():
    storage_type = "local_storage"

    def __init__(self):
        if not sys.has_local_storage:
            raise EnvironmentError("LocalStorage not available")
        self.store = JSObject(__BRYTHON__.local_storage)

    def __delitem__(self, key):
        if (not isinstance(key, str)):
            raise TypeError("key must be string")
        if key not in self:
            raise KeyError(key)
        self.store.removeItem(key)

    def __getitem__(self, key):
        if (not isinstance(key, str)):
            raise TypeError("key must be string")
        res = __BRYTHON__.JSObject(self.store.getItem(key))
        if res:
            return res
        raise KeyError(key)

    def __setitem__(self, key, value):
        if (not isinstance(key, str)):
            raise TypeError("key must be string")
        if (not isinstance(value, str)):
            raise TypeError("value must be string")
        self.store.setItem(key, value)

    # implement "in" functionality
    def __contains__(self, key):
        if (not isinstance(key, str)):
            raise TypeError("key must be string")
        res = __BRYTHON__.JSObject(self.store.getItem(key))
        if res is None:
            return False
        return True

    def __iter__(self):
        keys = self.keys()
        return keys.__iter__()

    def get(self, key, default=None):
        if (not isinstance(key, str)):
            raise TypeError("key must be string")
        return __BRYTHON__.JSObject(self.store.getItem(key)) or default

    def pop(self, key, default=__UnProvided()):
        if (not isinstance(key, str)):
            raise TypeError("key must be string")
        if type(default) is __UnProvided:
            ret = self.get(key)
            del self[key]  # will throw key error if doesn't exist
            return ret
        else:
            if key in self:
                ret = self.get(key)
                del self[key]
                return ret
            else:
                return default

    # while a real dict provides a view, returning a generator would less helpful than simply returning a list
    # and creating a custom iterator is overkill and would likely result in slower performance
    def keys(self):
        return [__BRYTHON__.JSObject(self.store.key(i)) for i in range(self.store.length)]

    def values(self):
        return [__BRYTHON__.JSObject(self.__getitem__(k)) for k in self.keys()]

    def items(self):
        return list(zip(self.keys(), self.values()))

    def clear(self):
        self.store.clear()

    def __len__(self):
        return self.store.length

if sys.has_local_storage:
    storage = LocalStorage()
