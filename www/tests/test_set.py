x = set(['a','r','bg','Z'])
assert x==set(['bg','Z','a','r'])

assert len(x)==4
x.add('tail')
assert len(x)==5
x.add('tail')
assert len(x)==5
assert 'r' in x
assert 'rty' not in x

y = set([1,2,3])
assert x.isdisjoint(y)
y.add('r')
assert not x.isdisjoint(y)

z = set(['a','r'])
assert z.issubset(x)
assert z <= x
assert z < x
assert x.issuperset(z)
assert x >= z
assert x > z
assert not z.issubset(y)

assert z|y == {'a','r',1,2,3}
assert z.union(y) == {'a','r',1,2,3}

assert x&y=={'r'}
assert x.intersection(y)=={'r'}

assert x-y=={'a','bg','Z','tail'}

assert z^y == {'a',1,2,3}

x.remove('tail')
assert x=={'a','r','bg','Z'}
x.discard('azerty')
assert x=={'a','r','bg','Z'}
x.discard('a')
assert x=={'r','bg','Z'}

z.pop()
z.pop()
try:z.pop()
except KeyError:pass

x.clear()
assert len(x)==0

x = frozenset(['a','r','bg','Z'])
assert str(x).startswith("frozenset({")
assert x==set(['bg','Z','a','r'])

assert len(x)==4
try:
    x.add('tail')
except AttributeError:
    pass
assert len(x)==4
assert 'r' in x
assert 'rty' not in x

class foo(set):
    def show(self):
        return 'show'

x = foo([1,2])
assert x.show()=='show'

print("passed all tests..")

