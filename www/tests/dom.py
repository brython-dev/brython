from browser import window, document, html

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
