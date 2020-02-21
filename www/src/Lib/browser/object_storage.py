from javascript import JSON

class _UnProvided():
    pass


class ObjectStorage():

    def __init__(self, storage):
        self.storage = storage

    def __delitem__(self, key):
        del self.storage[JSON.stringify(key)]

    def __getitem__(self, key):
        return JSON.parse(self.storage[JSON.stringify(key)])

    def __setitem__(self, key, value):
        self.storage[JSON.stringify(key)] = JSON.stringify(value)

    def __contains__(self, key):
        return JSON.stringify(key) in self.storage

    def get(self, key, default=None):
        if JSON.stringify(key) in self.storage:
            return self.storage[JSON.stringify(key)]
        return default

    def pop(self, key, default=_UnProvided()):
        if type(default) is _UnProvided or JSON.stringify(key) in self.storage:
            return JSON.parse(self.storage.pop(JSON.stringify(key)))
        return default

    def __iter__(self):
        keys = self.keys()
        return keys.__iter__()

    def keys(self):
        return [JSON.parse(key) for key in self.storage.keys()]

    def values(self):
        return [JSON.parse(val) for val in self.storage.values()]

    def items(self):
        return list(zip(self.keys(), self.values()))

    def clear(self):
        self.storage.clear()

    def __len__(self):
        return len(self.storage)
