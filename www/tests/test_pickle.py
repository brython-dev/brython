import pickle

for proto in range(pickle.HIGHEST_PROTOCOL + 1):
    data = {1:"a", 2:"b", 3:"c"}
    it = iter(data)
    d = pickle.dumps(it, proto)
    print(proto, "dumps", d)
    it = pickle.loads(d)
    assert sorted(it) == sorted(data)

    it = pickle.loads(d)
    try:
        drop = next(it)
    except StopIteration:
        continue
    d = pickle.dumps(it, proto)
    it = pickle.loads(d)
    del data[drop]
    assert sorted(it) == sorted(data)