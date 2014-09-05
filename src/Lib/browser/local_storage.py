# local storage in browser

class LocalStorage:

    def __init__(self):
        if not __BRYTHON__.has_local_storage:
            raise NameError('local storage is not supported by the browser')
        self.store = __BRYTHON__.local_storage()
        
    def __delitem__(self,key):
        self.store.removeItem(key)

    def __getitem__(self,key):
        res = self.store.getItem(key)
        if res:
           return res
        raise KeyError(key)

    def __setitem__(self,key,value):
        self.store.setItem(key,value)

    #implement "in" functionality
    def __contains__(self, key):
        res=self.store.getItem(key)
        if res:
           return True

        return False

    def keys(self):
        return [self.store.key(i) for i in range(self.store.length)]

    def values(self):
        return [self.__getitem__(k) for k in self.keys()]

    def items(self):
        return zip(self.keys(),self.values())
        
    def clear(self):
		self.store.clear()

storage = LocalStorage()
