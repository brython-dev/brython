from browser import window

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

