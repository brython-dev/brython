from browser import window

assert window.empty_list()==[]
assert window.list1()==[1, 2, 'a', ['b']]
assert window.jsobj().to_dict()=={'a':1}
