import json

class _UnProvided():
    pass


class ObjectStorage():

    def __init__(self, storage):
        self.storage = storage

    def __delitem__(self, key):
        del self.storage[json.dumps(key)]

    def __getitem__(self, key):
        return json.loads(self.storage[json.dumps(key)])

    def __setitem__(self, key, value):
        self.storage[json.dumps(key)] = json.dumps(value)

    def __contains__(self, key):
        return json.dumps(key) in self.storage

    def get(self, key, default=None):
        if json.dumps(key) in self.storage:
            return self.storage[json.dumps(key)]
        return default

    def pop(self, key, default=_UnProvided()):
        if type(default) is _UnProvided or json.dumps(key) in self.storage:
            return json.loads(self.storage.pop(json.dumps(key)))
        return default

    def __iter__(self):
        keys = self.keys()
        return keys.__iter__()

    def keys(self):
        return [json.loads(key) for key in self.storage.keys()]

    def values(self):
        return [json.loads(val) for val in self.storage.values()]

    def items(self):
        return list(zip(self.keys(), self.values()))

    def clear(self):
        self.storage.clear()

    def __len__(self):
        return len(self.storage)
