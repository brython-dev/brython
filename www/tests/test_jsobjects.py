# issue 744: Javascript objects should allow integer attribute names.
from browser import window
a = window.Uint8ClampedArray.new(10)

for i in range(10):
    a[i] = i
    assert a[i] == i

# Test dict initialization from native js objects
# JS objects are in script jsobj_tests.js
pyobj = window.test_jsobj.to_dict()
assert pyobj["null_value"] is None
assert pyobj["undef_value"] is NotImplemented
assert pyobj["test_num"] == 10
assert len(list(pyobj.items())) == 3
assert len(list(pyobj.values())) == 3
assert len(list(pyobj.keys())) == 3

# Test that setting jsobject dict value to None
# makes it a javascript undefined
pyobj['python_none'] = None
assert window.test_null('python_none')

# Test setdefault
assert pyobj.setdefault('default') is None

# issue 1003
jsobj = window.JSON.parse('{"foo": "bar"}')

for k, v in dict(jsobj).items():
    print(k, v) # Prints foo bar as would be expected

test = {}
try:
    test.update(jsobj)
    raise Exception("should have raised ValueError")
except ValueError:
    pass

test.update(dict(jsobj))
assert test == {"foo": "bar"}

test = {}
test.update(jsobj.to_dict())
assert test == {"foo": "bar"}

test = {}
for k, v in dict(jsobj).items():
    test[k] = v
assert test == {"foo": "bar"}

# issue 1017
t = window.a_table
assert len(t.headers) == 1

t["headers"].append({})
assert len(t["headers"]) == 2
t["headers"][0]["value"] = 9
assert t.headers[0].value == 9

# issue 1023
def f(x):
    x()

try:
    f(window.initClass())
    raise Exception("should have raised TypeError")
except TypeError:
    pass

x = window.initJSWithEq()
assert 'x' == x
assert x == 'x'

# test parsing json with a null value
import javascript
obj = javascript.JSON.parse('{"foo": null}')
assert obj == {"foo": None}
