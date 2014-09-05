assert 'a'.__class__ == str
assert isinstance('a',str)
x = 1
assert x.__class__ == int
assert isinstance(x,int)
assert str(x)=="1"
y=3.14
assert y.__class__ == float
assert isinstance(3.14,float)
assert str(y)=="3.14"
z=[1,2,3]
assert z.__class__ == list
assert isinstance(z,list)
assert str(z)=="[1, 2, 3]"
d = {1:'Z','y':88}
assert d.__class__ == dict
assert isinstance(d,dict)
assert str(d)=="{1:'Z','y':88}"
t = (1,8)
assert t.__class__ == tuple
assert isinstance(t,tuple)
assert str(t)=='(1, 8)'

print("passed all tests..")
