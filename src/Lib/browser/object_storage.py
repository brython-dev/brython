import pickle

class __UnProvided():
    pass


class ObjectStorage():

    def __init__(self, storage):
        self.storage = storage

    def __delitem__(self, key):
        del self.storage[pickle.dumps(key)]

    def __getitem__(self, key):
        return pickle.loads(self.storage[pickle.dumps(key)])

    def __setitem__(self, key, value):
        self.storage[pickle.dumps(key)] = pickle.dumps(value)

    def __contains__(self, key):
        return pickle.dumps(key) in self.storage

    def get(self, key, default=None):
        if pickle.dumps(key) in self.storage:
            return self.storage[pickle.dumps(key)]
        return default

    def pop(self, key, default=__UnProvided()):
        if type(default) is __UnProvided or pickle.dumps(key) in self.storage:
            return pickle.loads(self.storage.pop(pickle.dumps(key)))
        return default

    def __iter__(self):
        keys = self.keys()
        return keys.__iter__()

    def keys(self):
        return [pickle.loads(key) for key in self.storage.keys()]

    def values(self):
        return [pickle.loads(val) for val in self.storage.values()]

    def items(self):
        return list(zip(self.keys(), self.values()))

    def clear(self):
        self.storage.clear()

    def __len__(self):
        return len(self.storage)
