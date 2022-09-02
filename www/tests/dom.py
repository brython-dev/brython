from browser import window, document, html, svg

assert window.empty_list() == []
assert window.list1() == [1, 2, 'a', ['b']]
assert window.jsobj().to_dict() == {'a':1}

c = window.subscriptable('abracadabra')
assert len(c) == 11
assert c[2] == 'r'

Foo = window.get_constructor().new
assert Foo().foo == 'hi'

# test dynamic constructor creation
Constructor = window.base_class.extend().new
assert Constructor().name == 'base'
assert Constructor().extra == 'extra'

class A(html.DIV):
    def __init__(self, mybool):
        self.mybool = mybool

x = A(True)
assert x.mybool is True
x.mybool = False
assert x.mybool is False

y = A(False)
assert y.mybool == False

# test setting a callback function
f_called = False
def f(*args, **kwargs):
    global f_called
    f_called = True

element = document.getElementById('dom-test-element-id')
# test passing an additional argument after the callback f
element.addEventListener('click', f, True)
element.click()
assert f_called

# issue 829
# HTML attributes are case-insensitive
class A(html.DIV):
    def __init__(self):
        self.uV = 5
        self.f = 0.5
        self.Xyz = "mystring"
        self.zd = {"a": 3}
        self.long_int = 18446744073709552000

p = A()
assert not hasattr(p, "XYZ")
assert p.Xyz == "mystring"
assert p.uV == 5
assert p.f == 0.5
assert not hasattr(p, "uv")
assert p.zd == {"a": 3}
assert p.long_int == 18446744073709552000, p.long_int

# SVG attributes are case-sensitive
class B(svg.circle):
    def __init__(self):
        self.svg_uV = 6
        self.Abc = "anotherstring"

q = B()
assert q.svg_uV == 6
assert q.Abc == "anotherstring"
try:
    print('q.abc', q.abc)
    raise Exception("should have raised AttributeError")
except AttributeError:
    pass

# issue 888
import javascript
assert window.jsReturnsUndefined() is javascript.UNDEFINED

# issue 1327
num = document['banner_row'].attrs.get('test', 10)
assert num == 10

# issue 1384
class A(html.DIV):
    def __init__(self, s):
        self.myattr = s

x = A("Andy")
assert x.myattr == "Andy"
del x.myattr
assert not hasattr(x, "myattr")
try:
    del x.attrs
    raise Exception("should have raised AttributeError")
except AttributeError:
    pass

class B(svg.line):
    def __init__(self, s):
        self.myattr = s

y = B("Didier")
assert y.myattr == "Didier"
del y.myattr
assert not hasattr(y, "myattr")

# chained insertions
html.P() <= html.B() <= html.I("coucou")

# Brython-specific attributes
document <= (s := html.SPAN(style=dict(position="absolute", height="10px")))
for attr in ['abs_left', 'abs_top', 'top', 'width', 'height', 'width',
             'scrolled_left', 'scrolled_top']:
    assert isinstance(getattr(s, attr), int), getattr(s, attr)
assert s.inside(document)

# issue 1647
style={"background-color":"yellow", "display": "none"}
d = html.DIV("Hello world", style=style, id="mydiv")
document <= d

assert dict(d.attrs.items()) == {
  'style': 'background-color: yellow; display: none;',
  'id': 'mydiv'
}
assert set(d.attrs) == {"style", "id"}
assert set(d.attrs.keys()) == {"style", "id"}
assert set(d.attrs.values()) == {
    'background-color: yellow; display: none;',
    'mydiv'
}
assert "id" in d.attrs

# issue 2014
d.attrs["height"] = 4.5
assert d.attrs["height"] == "4.5", d.attrs["height"]

# set function as attribute
def func():
    pass

element.foo = func
assert element.foo == func