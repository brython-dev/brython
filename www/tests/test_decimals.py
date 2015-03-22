from decimal import Decimal

a = Decimal('5.1')
b = Decimal('3.14')
c = 4
d = 3.14

assert a + b == Decimal('8.24')
assert a - b == Decimal('1.96')
assert a * b == Decimal('16.014')

# test below gives a different result in CPython because precision is set to
# 26 in the CPython decimal module and 17 in the Brython version, because of 
# Javascript precision

# fix me
#assert a / b == Decimal('1.6242038216560510')

assert a + c == Decimal('9.1')
assert a - c == Decimal('1.1')
assert a * c == Decimal('20.4')

assert a / c == Decimal('1.275')

assert Decimal('3') + Decimal('4') == Decimal('7')

assert Decimal() == Decimal('0')

assert str(Decimal(45)) == '45'
assert str(Decimal(-45)) == '-45'
assert str(Decimal('500000123')) == '500000123'
assert str(Decimal('0')) == '0'
assert str(Decimal(0)) == '0'

assert str(Decimal('45')) == '45'
assert str(Decimal('-45')) == '-45'
assert str(Decimal(500000123)) == '500000123'

for n in range(0, 32):
    for sign in (-1, 1):
        for x in range(-5, 5):
            i = sign * (2**n + x)
            d = Decimal(i)
            assert str(d) == str(i)

#empty
assert str(Decimal('')) == 'NaN'
assert str(Decimal('45')) == '45'
assert str(Decimal('45.34')), '45.34'
assert str(Decimal('45e2')) == '4.5E+3'

#just not a number
assert str(Decimal('ugly')) == 'NaN'

#leading and trailing whitespace permitted
assert str(Decimal('1.3E4 \n')) == '1.3E+4'
assert str(Decimal('  -7.89')) == '-7.89'
assert str(Decimal("  3.45679  ")) ==  '3.45679'


# unicode whitespace
for lead in ["", ' ', '\u00a0', '\u205f']:
    for trail in ["", ' ', '\u00a0', '\u205f']:
        assert str(Decimal(lead + '9.311E+28' + trail)) == '9.311E+28'
