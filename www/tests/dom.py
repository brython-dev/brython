from browser import window
from javascript import JSConstructor

assert window.empty_list() == []
assert window.list1() == [1, 2, 'a', ['b']]
assert window.jsobj().to_dict() == {'a':1}

c = window.subscriptable('abracadabra')
assert len(c) == 11
assert c[2] == 'r'

Foo = JSConstructor(window.get_constructor())
assert Foo().foo == 'hi'

# test dynamic constructor creation
Constructor = JSConstructor(window.base_class.extend())
assert Constructor().name == 'base'
assert Constructor().extra == 'extra'

