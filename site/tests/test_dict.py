x = dict([['a',1],['r',2],['bg',3],['Z',4]])
y = dict(zip(['a','r','Z','bg'],[1,2,4,3]))
z = {'bg':3,'Z':4,'a':1,'r':2}
assert x==y
assert x==z
assert y==z

assert x['a']==1
assert x.get('a')==1
assert x.get('uiop',99)==99

y = x.copy()
assert x==y
y.clear()
assert len(y)==0
assert len(x)==4

# subclass
class foo(dict):
    def show(self):
        return 'show'

x = foo({1:2})
assert x.show() == 'show'
assert str(x)=="{1:2}"
assert isinstance(x,dict)

print("passed all tests..")
