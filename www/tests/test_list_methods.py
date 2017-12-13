x = ['a','r','bg','Z']
x.sort()
assert x==['Z','a','bg','r']

x.sort(key=str.lower)
assert x==['a','bg','r','Z']

x.sort(key=str.lower,reverse=True)
assert x==['Z','r','bg','a']

x = ['a']
x.append('tail')
assert x == ['a','tail']
x.append([0,1])
assert x == ['a','tail',[0,1]]

assert x.count('a')==1
x.extend(['u','v'])

assert x==['a','tail',[0,1],'u','v']

assert x.index('u')==3

x.remove('tail')
assert x==['a',[0,1],'u','v']

x.pop()
assert x==['a',[0,1],'u']

x.pop(1)
assert x==['a','u']

x = ['a','r','bg','Z']
x.reverse()
assert x==['Z','bg','r','a']

del x[0]
assert x == ['bg','r','a']
del x[-1]
assert x == ['bg','r']

x += ['zz']
assert x == ['bg','r','zz']

assert x[1] == 'r'

assert 'r' in x
assert 'rty' not in x



# issue 364
class A(list):
    def __init__(self, x):
        list.__init__(self, x)

z = A([1,2,3])
assert isinstance(z, A)
assert z == [1, 2, 3]
assert len(z) == 3
assert list.__len__(z) == 3

# issue 724
t = [2]
try:
    t.foo = 8
    raise Exception("sould have raised AttributeError")
except AttributeError:
    pass

z.foo = 5
assert z.foo == 5

print("passed all tests..")
