# local storage in browser
from javascript import JSObject

class UnProvided():
    pass

class LocalStorage:
    storage_type = "local_storage"

    def __init__(self):
        if not __BRYTHON__.has_local_storage:
            raise NameError('local storage is not supported by the browser')
        self.store = __BRYTHON__.local_storage()

    def __delitem__(self, key):
        if key not in self:
            raise KeyError(key)
        self.store.removeItem(key)

    def __getitem__(self, key):
        res = self.store.getItem(key)
        if res:
            return JSObject(res)
        raise KeyError(key)

    def __setitem__(self, key, value):
        self.store.setItem(key, value)

    # implement "in" functionality
    def __contains__(self, key):
        res = self.store.getItem(key)
        if res:
            return True
        return False

    def __iter__(self):
        keys = self.keys()
        return keys.__iter__()

    def get(self, key, default=None):
        return JSObject(self.store.getItem(key)) or default

    def pop(self, key, default=UnProvided()):
        if type(default) is UnProvided:
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
        return [JSObject(self.store.key(i)) for i in range(self.store.length)]

    def values(self):
        return [JSObject(self.__getitem__(k)) for k in self.keys()]

    def items(self):
        return list(zip(self.keys(), self.values()))

    def clear(self):
        self.store.clear()

    def __len__(self):
        return self.store.length

#     @property
#     def storage(self):
#         '''
#         Legacy support for browser.local_storage.storage
#         '''
#         import warnings
#         print("browser.{0}.storage is deprecated. Just use browser.{0} instead".format(self.storage_type))
#         warnings.warn("browser.{0}.storage is deprecated. Just use browser.{0} instead".format(self.storage_type), DeprecationWarning)
#         return self

storage = LocalStorage()
