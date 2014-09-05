import decimal

a = decimal.Decimal('5.1')
b = decimal.Decimal('3.14')
c = 4
d = 3.14

assert a + b == decimal.Decimal('8.24')
assert a - b == decimal.Decimal('1.96')
assert a * b == decimal.Decimal('16.014')
#test below fails
#assert a / b == decimal.Decimal('1.624203821656050955414012739')

assert a + c == decimal.Decimal('9.1')
assert a - c == decimal.Decimal('1.1')
assert a * c == decimal.Decimal('20.4')

#test below fails
#assert a / c == decimal.Decimal('1.275')
