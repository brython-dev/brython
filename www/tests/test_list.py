# list examples

z=[1,2,3]
assert z.__class__ == list
assert isinstance(z,list)
assert str(z)=="[1, 2, 3]"

a=['spam','eggs',100,1234]
print(a[:2]+['bacon',2*2])
print(3*a[:3]+['Boo!'])
print(a[:])
a[2]=a[2]+23
print(a)
a[0:2]=[1,12]
print(a)
a[0:2]=[]
print(a)
a[1:1]=['bletch','xyzzy']
print(a)
a[:0]=a
print(a)
a[:]=[]
print(a)
a.extend('ab')
print(a)
a.extend([1,2,33])
print(a)

# tuple
t = (1,8)
assert t.__class__ == tuple
assert isinstance(t,tuple)
assert str(t)=='(1, 8)'

# bug reported on the mailing list
d = {}
d[ (1,3) ] = None
d[ (-1,3) ] = None
d[ (1,-3) ] = None
d[ (-1,-3) ] = None

assert d == { (1, 3): None,
    (-1, 3): None,
    (1, -3): None,
    (-1, -3): None
}
