"""Javascript objects used in this script are in jsobj_tests.js."""

# issue 744: Javascript objects should allow integer attribute names.
from browser import window
import javascript

a = window.Uint8ClampedArray.new(10)

for i in range(10):
    a[i] = i
    assert a[i] == i

# Test dict initialization from native js objects
# JS objects are in script jsobj_tests.js
pyobj = window.test_jsobj.to_dict()
print(pyobj)
assert pyobj["null_value"] is None
assert pyobj["undef_value"] is javascript.UNDEFINED
assert pyobj["test_num"] == 10
assert len(list(pyobj.items())) == 3
assert len(list(pyobj.values())) == 3
assert len(list(pyobj.keys())) == 3

# Test that setting jsobject dict value to None
# makes it a javascript undefined
pyobj['python_none'] = None
#assert window.test_null('python_none')

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

# issue 1352
x = window.eval()
assert x == javascript.UNDEFINED
assert type(x) == javascript.UndefinedType

# issue #1376
setattr(window, 'foo', [])

window.foo.append('one')
window.foo.append('two')
assert window.foo == ['one', 'two']

setattr(window, 'bar', [])
bar = window.bar
bar.append('one')
bar = window.bar
bar.append('two')
assert bar == ['one', 'two']

# issue 1388
t = []
t.extend(window.root.children)
assert t[0].x == 2

# issue 1418
class Rectangle(window.Rectangle):
  pass

r = Rectangle(3, 4)
assert r.height == 3
assert r.width == 4
assert r.surface() == 12

class Square(window.Square):
  pass

s = Square(5)
assert s.x == 5
assert s.surface() == 25

# issue 1484
assert abs(window.get_float()) == window.get_float()

# issue 1490
class JSON_DUMMY_IMPL:
    dumps = window.JSON.stringify
    loads = window.JSON.parse

dummy_json = JSON_DUMMY_IMPL

s = '{"x":1,"y":"ab"}'

obj = dummy_json.loads(s)
assert obj["x"] == 1
assert dummy_json.dumps(obj) == s

# issue 1417
b1 = window.BigInt('23456')
b2 = window.BigInt('78901')
assert b1 + b2 == window.BigInt(str(23456 + 78901))
assert b1 - b2 == window.BigInt(str(23456 - 78901))
assert b1 * b2 == window.BigInt(str(23456 * 78901))
assert b1 % b2 == window.BigInt(str(23456 % 78901))

b3 = window.BigInt('2')
assert b1 ** b3 == window.BigInt(str(23456 ** 2))

for num in [1, 4.7]:
    try:
        b1 + num
        raise Exception("should have raised TypeError")
    except TypeError:
        pass

# javascript.extends() and javascript.super()
@javascript.extends(window.Rectangle)
class Square2:

    def __init__(self, length):
        javascript.super()(length, length)
        self.name = 'Square2'

    def f(self):
        return javascript.super().surface()

assert Square2(10).name == "Square2"
assert Square2(25).surface() == 625
assert Square2(20).f() == 400

# issue 1696
window.jsFunction1696('asdf'.isupper)

# issue 1918
assert isinstance(window.test_jsobj, javascript.JSObject)

# import Javascript modules
javascript.import_js('js_test.js')
assert js_test.x == 1

# issue 1996
js = __BRYTHON__.python_to_js("x = 1 + 2")
ns = window.eval(js)
assert ns.x == 3

print("all tests ok...")