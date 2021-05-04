from copy import copy, deepcopy

# issue 451
assert copy({1}) == {1}
assert copy({1: 2}) == {1: 2}

# issue 603
a = [[1], 2, 3]
b = copy(a)
b[0] += [10]
assert a == [[1, 10], 2, 3]
assert b == [[1, 10], 2, 3]

# issue 918
class MyClass:

    def __init__(self, some_param):
        self.x = some_param


obj = MyClass("aaa")
obj2 = copy(obj)
assert obj2.x == "aaa"

# issue 979
a = {1}
b = deepcopy(a)
assert b == {1}


# issue 1655
class MyList(list):
  pass

assert str(deepcopy(MyList([1]))) == '[1]'
assert str(copy(MyList([1]))) == '[1]'

class MyTuple(tuple):
  pass

assert str(deepcopy(MyTuple([1]))) == '(1,)'
assert str(copy(MyTuple([1]))) == '(1,)'

class MyDict(dict):
  pass

assert str(deepcopy(MyDict({1: 2}))) == '{1: 2}'
assert str(copy(MyDict({1: 2}))) == '{1: 2}'

class MySet(set):
  pass

assert str(deepcopy(MySet(['a']))) == "MySet({'a'})"
assert str(copy(MySet(['a']))) == "MySet({'a'})"

class MyFrozenset(frozenset):
  pass

assert str(deepcopy(MyFrozenset(['b']))) == "MyFrozenset({'b'})"
assert str(copy(MyFrozenset(['b']))) == "MyFrozenset({'b'})"

class MyString(str):
  pass

assert str(deepcopy(MyString('a'))) == 'a'
assert str(copy(MyString('a'))) == 'a'

class MyInt(int):
  pass

assert str(deepcopy(MyInt(33))) == '33'
assert str(copy(MyInt(33))) == '33'

class MyFloat(float):
  pass

assert str(deepcopy(MyFloat(37.2))) == '37.2'
assert str(copy(MyFloat(37.2))) == '37.2'

class MyComplex(complex):
  pass

assert str(deepcopy(MyComplex(3.2 + 6j))) == '(3.2+6j)'
assert str(copy(MyComplex(3.2 + 6j))) == '(3.2+6j)'

class MyBytes(bytes):
  pass

assert str(deepcopy(MyBytes(b'abc'))) == "b'abc'"
assert str(copy(MyBytes(b'abc'))) == "b'abc'"

print("passed all tests...")