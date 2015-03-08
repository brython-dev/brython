from browser.local_storage import storage  # legacy import
from browser.session_storage import storage as sess_storage  # legacy import
from browser.object_storage import ObjectStorage

assert(storage.storage_type == "local_storage")
assert(sess_storage.storage_type == "session_storage")

storage.clear()
sess_storage.clear()

session_storage = sess_storage
local_storage = storage

session_storage['hi'] = "blah"
assert(session_storage.get("hi") == "blah")
session_storage['foo'] = "arg"
assert(session_storage.pop('foo') == "arg")
assert(sorted(session_storage.keys()) == ['hi'])
assert(len(session_storage) == 1)
del session_storage['hi']
assert(len(session_storage.keys()) == 0)
try:
    local_storage.pop('hi')
except KeyError:
    pass
else:
    raise Exception("pop with no default on missing key did not raise key error")
assert(local_storage.pop('hi', "passed again") == "passed again")
local_storage['hi'] = '5'
for key in local_storage:
    assert(local_storage[key] == '5')
assert(local_storage.items() == [('hi', '5')])
   
object_storage = ObjectStorage(local_storage)
object_storage.clear()
object_storage['mah'] = {"hi": 5}
assert(object_storage['mah'] == {'hi': 5})
object_storage[['hello', 'there']] = "gracias"
assert(object_storage[['hello', 'there']] == "gracias")
obj = object_storage.pop('mah')
assert(obj['hi'] == 5)
assert(obj == {"hi": 5})
assert(len(object_storage) == 1)
for itm in object_storage:
    assert(itm == ['hello', 'there'])
for k, v in object_storage.items():
    assert(k == ['hello', 'there'])
    assert(v == "gracias")
assert(object_storage.get('not here') == None)
del object_storage[['hello', 'there']]
assert(len(object_storage) == 0)

print("passed all tests")
