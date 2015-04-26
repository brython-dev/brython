# numbers
x = 1
assert x.__class__ == int
assert isinstance(x,int)
assert str(x)=="1"

assert 2+2==4
assert (50-5*6)/4 == 5.0
assert 8/5 == 1.6
assert 7//3 == 2
assert 7//-3 == -3
width=20
height=5*9
assert width*height == 900
x=y=z=0
assert x == 0
assert y == 0
assert z == 0

assert 3 * 3.75 / 1.5 == 7.5
assert 7.0 / 2 == 3.5

y=3.14
assert y.__class__ == float
assert isinstance(3.14,float)
assert str(y)=="3.14"

x = -3
assert x.__abs__() == 3
assert -x.__abs__() == -3

assert x.__ceil__() == x
assert x.__ceil__() == -3

assert x.__divmod__(2) == (-2, 1)

# complex numbers
x = 8j
y = 8.3j
z = 3.2e6j
a = 4+2j
b = 2-3j
c = 3.0-3j

assert a*b == 14 - 8j
assert x*x == -64
assert x-7j == 1j
assert -7j+x == 1j
assert x-2.0j == 6j
assert 1/a == 0.2 - 0.1j
assert 2.0/a == 0.4 - 0.2j
assert 1+a == 5+2j
assert 2-a == -2-2j
assert 3*a == 12+6j
assert 1.0+a == 5+2j
assert 2.0-a == -2-2j
assert 3.0*a == 12+6j

assert hash(1.0) == 1

print('passed all tests...')
