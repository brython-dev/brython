from tester import assert_raises

x = [1, 2]
z = iter(x)
assert z.__next__() == 1
assert z.__next__() == 2
z = iter(x)
assert next(z) == 1
next(z)
try:
    next(z)
except StopIteration:
    pass

x = "az"
z = iter(x)
assert z.__next__() == 'a'
assert z.__next__() == 'z'
z = iter(x)
assert next(z) == 'a'
next(z)
try:
    next(z)
except StopIteration:
    pass

x = {'a': 1, 'b': 2}
z = iter(x)

# in python 3 these are not always in the order of a then b
i = next(z)
assert i in ('a', 'b')
j = next(z)
assert j in ('a', 'b') and j != i

x = {'a', 1}
z = iter(x)

#from python3 1 comes first, then 'a' (but lets not assume order)
i = next(z)
assert i in (1, 'a')
j = next(z)
assert j in (1, 'a') and j != i

x = {'a': 1}.items()
y = iter(x)
assert next(y) == ('a', 1)   #python3 returns this as a tuple and not a list
try:
    next(y)
except StopIteration:
    pass

class Counter:

    def __init__(self, low, high):
        self.current = low
        self.high = high

    def __iter__(self):
        return self

    def __next__(self):
        if self.current > self.high:
            raise StopIteration
        else:
            self.current += 1
            return self.current - 1


x = Counter(2, 8)
assert next(x) == 2

assert isinstance(range(5), range)
x = (i for i in range(3))
assert str(x.__class__) == "<class 'generator'>"

x = iter([1, 2, 3])
assert str(x.__class__) == "<class 'list_iterator'>"

# issue 742
def test():
    a = yield from X
    if A:
        pass
    else:
        pass

X = range(5)
A = True
gen = test()
assert list(gen) == list(range(5))

# issue 1051
assert next(iter([]), 'The End!') == 'The End!'

# PR 2715
class C:

    def __len__(self):
      return 9

    def __getitem__(self, i):
        if i > 2:
            raise OSError
        return i

try:
  for i in C():
    pass
  raise Exception('should have raised OSError')
except OSError:
  assert i == 2

# another iterator with __len__ and __getitem__
class A:

  def __init__(self):
      self.data = 'abcde'

  def __len__(self):
      return len(self.data)

  def __getitem__(self, i):
      return self.data[i]


for char in A():
    char

# issue 2761
it = iter("abc")
print(type(it))
assert "z" not in it
assert not all(c in it for c in "xyz")

class A:

  def __init__(self):
    self.data = 'abcd'

  def __len__(self):
    return len(self.data)

  def __getitem__(self, num):
    return self.data[num]

assert 'd' in A()
assert 'z' not in A()

# issue 2928 - two-argument iter(callable, sentinel)
readings_2928 = iter(["12.5", "13.0", "STOP", "14.2"])
assert list(iter(lambda: next(readings_2928), "STOP")) == ["12.5", "13.0"]

# a callable that returns the sentinel first yields nothing
assert list(iter(lambda: "STOP", "STOP")) == []

# next() raises StopIteration once the sentinel is seen, and the iterator
# stays exhausted afterwards - it does not resume on the next value
values_2928 = iter(["a", "STOP", "b"])
it_2928 = iter(values_2928.__next__, "STOP")
assert next(it_2928) == "a"
assert_raises(StopIteration, next, it_2928)
assert next(it_2928, None) is None
assert next(it_2928, None) is None

# a second pass over an exhausted callable iterator yields nothing
drained_2928 = iter(iter([1, 2, "STOP", 3]).__next__, "STOP")
assert list(drained_2928) == [1, 2]
assert list(drained_2928) == []

# the sentinel is the left operand of the comparison, as in CPython
class Sentinel_2928:
    def __eq__(self, other):
        return True

class Value_2928:
    def __eq__(self, other):
        return False

assert next(iter(Value_2928, Sentinel_2928()), None) is None

# the comparison keeps CPython's identity shortcut: the callable returning the
# sentinel object itself stops the iteration even when __eq__ says otherwise
class NeverEqual_2928:
    def __eq__(self, other):
        return False

same_2928 = NeverEqual_2928()
assert next(iter(lambda: same_2928, same_2928), "STOPPED") == "STOPPED"

# a comparison that returns an object is converted to a boolean
class Falsy_2928:
    def __bool__(self):
        return False

class FalsyResult_2928:
    def __eq__(self, other):
        return Falsy_2928()

assert next(iter(lambda: "v", FalsyResult_2928()), "STOPPED") == "v"

class Truthy_2928:
    def __bool__(self):
        return True

class TruthyResult_2928:
    def __eq__(self, other):
        return Truthy_2928()

assert next(iter(lambda: "v", TruthyResult_2928()), "STOPPED") == "STOPPED"

# StopIteration raised by the callable exhausts the iterator
def stop_2928():
    raise StopIteration

stopping_2928 = iter(stop_2928, "X")
assert next(stopping_2928, None) is None
assert next(stopping_2928, None) is None

# any other exception propagates and leaves the iterator usable
calls_2928 = []

def flaky_2928():
    calls_2928.append(1)
    if len(calls_2928) == 1:
        raise ValueError("boom")
    return "later" if len(calls_2928) < 4 else "STOP"

flaky_it_2928 = iter(flaky_2928, "STOP")
assert_raises(ValueError, next, flaky_it_2928)
assert next(flaky_it_2928) == "later"
assert next(flaky_it_2928) == "later"
assert next(flaky_it_2928, None) is None

print("passed all tests...")
