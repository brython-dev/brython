x=[1,2]
z = iter(x)
assert z.__next__()==1
assert z.__next__()==2
z=iter(x)
assert next(z)==1
next(z)
try:
    next(z)
except StopIteration:
    pass

x="az"
z = iter(x)
assert z.__next__()=='a'
assert z.__next__()=='z'
z=iter(x)
assert next(z)=='a'
next(z)
try:
    next(z)
except StopIteration:
    pass

x = {'a':1,'b':2}
z = iter(x)

# in python 3 these are not always in the order of a then b
i=next(z)
assert i in ('a', 'b')
j=next(z)
assert j in ('a', 'b') and j != i

x = {'a',1}
z = iter(x)

#from python3 1 comes first, then 'a' (but lets not assume order)
i=next(z)
assert i in (1, 'a')
j=next(z)
assert j in (1, 'a') and j != i

x = {'a':1}.items()
y = iter(x)
assert next(y)==('a',1)   #python3 returns this as a tuple and not a list
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

x = Counter(2,8)
assert next(x)==2

assert isinstance(range(5),range)
x = (i for i in range(3))
assert str(x.__class__)=="<class 'generator'>"

x = iter([1,2,3])
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

print("passed all tests...")
