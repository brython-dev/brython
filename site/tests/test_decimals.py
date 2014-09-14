import decimal

a = decimal.Decimal('5.1')
b = decimal.Decimal('3.14')
c = 4
d = 3.14

assert a + b == decimal.Decimal('8.24')
assert a - b == decimal.Decimal('1.96')
assert a * b == decimal.Decimal('16.014')

# test below gives a different result in CPython because precision is set to
# 26 in the CPython decimal module and 17 in the Brython version, because of 
# Javascript precision
assert a / b == decimal.Decimal('1.6242038216560510')

assert a + c == decimal.Decimal('9.1')
assert a - c == decimal.Decimal('1.1')
assert a * c == decimal.Decimal('20.4')

assert a / c == decimal.Decimal('1.275')
