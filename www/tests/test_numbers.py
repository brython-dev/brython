# numbers

from tester import assert_raises

x = 1
assert x.__class__ == int
assert isinstance(x, int)
assert str(x) == "1"

assert 2 + 2 == 4
assert (50 - 5 * 6) / 4 == 5.0
assert 8 / 5 == 1.6
assert 7 // 3 == 2
assert 7 // -3 == -3
width = 20
height = 5 * 9
assert width * height == 900
x = y = z = 0
assert x == 0
assert y == 0
assert z == 0

assert 3 * 3.75 / 1.5 == 7.5
assert 7.0 / 2 == 3.5

y = 3.14
assert y.__class__ == float
assert isinstance(3.14, float)
assert str(y) == "3.14"

x = -3
assert x.__abs__() == 3
assert -x.__abs__() == -3

assert x.__ceil__() == x
assert x.__ceil__() == -3

assert x.__divmod__(2) == (-2, 1)


#issue 98
assert int.from_bytes(b'\xfc', 'big') == 252
assert int.from_bytes(bytearray([252, 0]), 'big') == 64512
assert int.from_bytes(b'\x00\x10', byteorder='big') == 16
assert int.from_bytes(b'\x00\x10', byteorder='little') == 4096
assert int.from_bytes(b'\xfc\x00', byteorder='big', signed=True) == -1024
assert int.from_bytes(b'\xfc\x00', byteorder='big', signed=False) == 64512
assert int.from_bytes([255, 0, 0], byteorder='big') == 16711680

# issue 115
a = 1
assert a.numerator == 1
assert a.denominator == 1
assert a.real == 1
assert a.imag == 0
assert isinstance(a.imag, int) == True
a = 1 + 2j
assert a.real == 1
assert a.imag == 2
assert isinstance(a.real, float) == True
assert isinstance(a.imag, float) == True

# True and False are instances of int
assert isinstance(True, int)
assert isinstance(False, int)

# issue 294
assert int.from_bytes(bytes=b'some_bytes',byteorder='big') == \
    545127616933790290830707

# issue 350
a = float("-inf")
b = float("-infinity")
assert a == b
assert repr(a) == '-inf'
assert a * 1. == b
assert a * 1 == b

# issue 352
a = float("inf")
assert a * 1 == a

# complex numbers
x = 8j
y = 8.3j
z = 3.2e6j
a = 4 + 2j
b = 2 - 3j
c = 3.0 - 3j

assert a * b == 14 - 8j
assert x * x == -64
assert x - 7j == 1j
assert -7j + x == 1j
assert x - 2.0j == 6j
assert 1 / a == 0.2 - 0.1j
assert 2.0 / a == 0.4 - 0.2j
assert 1 + a == 5 + 2j
assert 2 - a == -2 -2j
assert 3 * a == 12 + 6j
assert 1.0 + a == 5 + 2j
assert 2.0 - a == -2 -2j
assert 3.0 * a == 12 + 6j
assert abs(3 + 4j) == 5
assert abs(4 + 3j) == 5.0
assert abs(4 + 3j) == abs(3 + 4j)

# issue 498
assert (1 + 2j) * 2.4 == 2.4 + 4.8j

assert hash(1.0) == 1

r = 0
t = 0.5
assert int(r + t)==0
assert int(r + 0.5)==0

# long integers
import math

assert 10 ** 50 / math.pi == 3.183098861837907e+49
assert 10 ** 50 // math.pi == 3.183098861837907e+49
assert 10 ** 50 / 2 == 5e+49
assert 10 ** 50 // 2 == 50000000000000000000000000000000000000000000000000

assert 54545400516506505640987 ** 54 == 6094516993408491992717058206554386213417915204282550520580173630741479188519340788843629287628151801401531280484190484808107809271896207848468766316369387868615942195705186609725632301540802654841087447819153660908915523083623229576696678140304820900222252911769804932640891926749203064507743998679197424915190740760487839030635635524983269458329073226234934906817084587829534314798088951835646661008306240083129624656185367771063790241091117474534590020274074136357197645935060221291548216756250807752871656640000397916793935066325678308875294763565871249294663947951463338441414225943925113720065959282539207445752286988465907078586737338772584087046523710599804501329581165543748980030118117212198624410981372454011696164126682234324920269752028023856536950012015786770231258409600204108521358592401364755168512993999226284880314977761963287301136818231324076353404996749453313086116069644242663548622522635961543805984510834241759298667823778964361782775453343709473315538820123572991073589042203709526463926126985507611602224263739126014633222508048003050310698628707258846954246136227525382040513707929524854001570426683736205561486053982749877898481108145486760466316963709172336931026901114323426213180770145849112343689

assert int('100000000000000000000000000000000', 2) == 4294967296
assert int('102002022201221111211', 3) == 4294967296
assert int('10000000000000000', 4) == 4294967296
assert int('32244002423141', 5) == 4294967296
assert int('1550104015504', 6) == 4294967296
assert int('211301422354', 7) == 4294967296
assert int('40000000000', 8) == 4294967296
assert int('12068657454', 9) == 4294967296
assert int('4294967296', 10) == 4294967296
assert int('1904440554', 11) == 4294967296
assert int('9ba461594', 12) == 4294967296
assert int('535a79889', 13) == 4294967296
assert int('2ca5b7464', 14) == 4294967296
assert int('1a20dcd81', 15) == 4294967296
assert int('100000000', 16) == 4294967296
assert int('a7ffda91', 17) == 4294967296
assert int('704he7g4', 18) == 4294967296
assert int('4f5aff66', 19) == 4294967296
assert int('3723ai4g', 20) == 4294967296
assert int('281d55i4', 21) == 4294967296
assert int('1fj8b184', 22) == 4294967296
assert int('1606k7ic', 23) == 4294967296
assert int('mb994ag', 24) == 4294967296
assert int('hek2mgl', 25) == 4294967296
assert int('dnchbnm', 26) == 4294967296
assert int('b28jpdm', 27) == 4294967296
assert int('8pfgih4', 28) == 4294967296
assert int('76beigg', 29) == 4294967296
assert int('5qmcpqg', 30) == 4294967296
assert int('4q0jto4', 31) == 4294967296
assert int('4000000', 32) == 4294967296
assert int('3aokq94', 33) == 4294967296
assert int('2qhxjli', 34) == 4294967296
assert int('2br45qb', 35) == 4294967296
assert int('1z141z4', 36) == 4294967296

a = 2 ** 53 - 3
assert a + 10 == 9007199254740999
assert a + 11 == 9007199254741000

# float subclass
class Float(float):

    def __eq__(self, other):
        if not float.__eq__(self, other) and self.almost_equal(other):
            raise FloatCompError('you probably meant almost equal')
        return float.__eq__(self, other)

    def almost_equal(self, other):
        return abs(self - other) < 10 ** -8


class FloatCompError(Exception):
    pass


assert str(Float(0.3)) == "0.3"
assert Float(0.1) + Float(0.1) == Float(0.2)

float_sum = Float(0.1) + Float(0.1) + Float(0.1)
assert Float(0.3).almost_equal(float_sum)
try:
    Float(0.3) == float_sum
    raise Exception("should have raised FloatCompError")
except FloatCompError:
    pass

# issue 564
x = 2
assert isinstance(.5 * x, float)
assert isinstance(1.0 + x, float)
assert isinstance(3.0 - x, float)

# issue 749
assert float.__eq__(1.5, 1.5)
assert float.__eq__(1.0, 1)
assert_raises(TypeError, float.__eq__, 1, 0)
assert int.__eq__(1, 1)
assert not int.__eq__(1, 0)

# issue 794
assert (-1024).to_bytes(2, "big", signed=True) == b'\xfc\x00'
assert (1024).to_bytes(2, "big") == b'\x04\x00'
assert (1024).to_bytes(2, "little") == b'\x00\x04'

# issue 840
x = 123 ** 20
y = 123 ** 20
assert (id(x) != id(y) or x is y)

# PEP 515
from tester import assertRaises

population = 65_345_123
assert population == 65345123

population = int("65_345_123")
assert population == 65345123

assertRaises(ValueError, int, "_12000")

amount = 10_000_000.0
assert amount == 10000000.0

addr = 0xCAFE_F00D
assert addr == 0xCAFEF00D

flags = 0b_0011_1111_0100_1110
assert flags == 0b0011111101001110

flags = int('0b_1111_0000', 2)
assert flags == 0b11110000

assert complex("8_7.6+2_67J") == (87.6 + 267j)
assertRaises(ValueError, complex, "_8_7.6+2_67J")
assertRaises(ValueError, complex, "8_7.6+_2_67J")

# issue 955
x = True

try:
    x.real = 2
    raise Exception("should have raised AttributeError")
except AttributeError as exc:
    assert "is not writable" in exc.args[0]

try:
    x.foo = "a"
    raise Exception("should have raised AttributeError")
except AttributeError as exc:
    assert "has no attribute 'foo'" in exc.args[0]

# issue 967
assert not (True == "Toggle")
assert True == True
assert True == 1
assert not (True == 8)
assert True == 1.0
assert not (True == 1.1)
assert not (False == "Toggle")
assert False == False
assert False == 0
assert False == 0.0
assert not (False == 8)

# issue 982
try:
    int("0x505")
    raise Exception("should have raised ValueError")
except ValueError:
    pass

# issue 1001
assert 1j / 1 == 1j
assert 1j / 1.0 == 1j

# issue 1033
from fractions import *
x = Fraction(1,1000000000000000)/10
assert str(x) == "1/10000000000000000"

# issue 1040
assert True + 2 == 3
assert False + 2 == 2
assert True * 3 == 3
assert False * 3 == 0
assert True / 2 == 0.5
assert False / 2 == 0
try:
    1 / False
    raise Exception("should have raised ZeroDivisionError")
except ZeroDivisionError:
    pass

# issue 1049
class Myfloat(float):
    pass

assert issubclass(Myfloat, float)

# issue 1092
assert (1024).to_bytes(4, byteorder='big') == b'\x00\x00\x04\x00'

# issue 1098
def test(x, pattern):
    assert x == pattern, f'''{x!r} != {pattern!r}'''

test( f'''{1.230e-1}''',     '0.123'   )
test( f'''{1.230e-11}''',    '1.23e-11')
test( f'''{1.230e-10}''',    '1.23e-10')
test( f'''{1.230e-3:8.6}''', ' 0.00123')
test( f'''{1.230e-3:1.6}''', '0.00123' )
test(f'''{1.23e-11:1.6}''', '1.23e-11')
test( f'''{1.23e-10:1.6}''', '1.23e-10')
test( f'''{1.23e-10:9.6}''',' 1.23e-10')
test(     f'''{1.23e-10:1.15}''', '1.23e-10')
test(1.23e-10.__format__('1.15'), '1.23e-10')

# issue 1115
class sffloat(float):
    def __new__(cls, value, sf=None):
        return super().__new__(cls, value)

    def __init__(self, value, sf=None):
        float.__init__(value)
        self.sf = sf

assert issubclass(sffloat, float)

a = sffloat(1.0,2)
b = sffloat(2.0,3)
assert isinstance(a, float)

assert a * b == 2.0
assert a.sf == 2
assert b.sf == 3

# issue 1156
try:
    isinstance(42, 43)
    raise Exception("should have raised TypeError")
except TypeError:
    pass

# issue 1211
assert .1j == .1j
assert .1j + 2 == 2 + 0.1j

# issue 1127
class A:

    def __rand__(self, other):
        return "A-rand"

    def __ror__(self, other):
        return "A-ror"

    def __rxor__(self, other):
        return "A-rxor"

assert False | A() == "A-ror"
assert True | A() == "A-ror"
assert False & A() == "A-rand"
assert True & A() == "A-rand"
assert False ^ A() == "A-rxor"
assert True ^ A() == "A-rxor"

# issue 1234
assert round(3.75, 1) == 3.8
assert round(3.65, 1) == 3.6
assert round(-3.75, 1) == -3.8
assert round(-3.65, 1) == -3.6
assert round(3.5) == 4
assert round(4.5) == 4

# issue 1245
assert eval("0j") == 0j

# as_integer_ratio() on integers
x = 19
assert x.as_integer_ratio() == (19, 1)

# & for long integers
for v1, v2 in [
    [1159881389885703599, 175],
    [150273702580583655 , 231],
    [44546835894733115 , 59],
    [41015041878610679 , 247],
    [39486404811214316 , 236],
    [1160951258495706706 , 82],
    [1155612917570132469 , 245],
    [1159836934008928109 , 109],
    [42204022534141352 , 168],
    [145243080305115916 , 12]
]:
    assert v1 & 255 == v2, (v1, v1 & 255)

# issue 1462
version = 4
y = ~(0xc000 << 48)

v1 = [187960246019804370053780003135367084637,
      274884922330976856010930418028929036539,
      105227283519715779713489012916810741558,
      340042838099585802003913759154293459601]

v2 = [187960246019804370049168317116939696733,
      274884922330976856010930418028929036539,
      105227283519715779699653954861528577846,
      340042838099585802003913759154293459601]

v3 = [187960246019804370058391689153794472541,
      274884922330976856020153790065783812347,
      105227283519715779708877326898383353654,
      340042838099585802013137131191148235409]

v4 = [187960246019803765595481881839207119453,
      274884922330975873767925353179579363579,
      105227283519715099688103793669472581430,
      340042838099585348665954775705207720593]

v5 = [187960246019804067826936785496500795997,
      274884922330976175999380256836873040123,
      105227283519715401919558697326766257974,
      340042838099585650897409679362501397137]

for i in range(4):
  x = v1[i]
  x &= y
  assert x == v2[i]
  x |= 0x8000 << 48
  assert x == v3[i]
  x &= ~(0xf000 << 64)
  assert x == v4[i]
  x |= version << 76
  assert x == v5[i]

# issue 1298
assert str(pow(10, Fraction(1))) == "10"
assert str(pow(10, Fraction(-1))) == "1/10"
assert str(pow(Fraction(10), 1)) == "10"
assert str(pow(Fraction(10), -1)) == "1/10"

# issue 1295
nums = ['1.0472', '5.236']
formatted = [f'{(float(i)*180/3.1446464646):.2g}' for i in nums]
assert formatted == ['60', '3e+02']

formatted = [f'{(float(i)*180/3.1446464646):#.2G}' for i in nums]
assert formatted == ['60.', '3.0E+02']

formatted = [f'{(float(i)*180/3.1446464646):.3g}' for i in nums]
assert formatted == ['59.9', '300']

formatted = [f'{(float(i)*180/3.1446464646):.4g}' for i in nums]
assert formatted == ['59.94', '299.7']

# issue 1299
assert pow(38, -1, mod=97) == 23
assert 23 * 38 % 97 == 1

# issue 1300
assert 3.14_15_93j == 3.141593j

# issue 1309
x = pow(2, 64) + Fraction(1, 2)
assert x == Fraction(36893488147419103233, 2)

# issue 1315
dm = divmod(pow(2, 64) - 1, pow(2, 32))
assert dm == (4294967295, 4294967295)
assert str(dm) == '(4294967295, 4294967295)'

# issue 1328
assert float(pow(2, 53) - 1) - (pow(2, 53) - 1) == 0.0
assert (pow(2, 53) - 1) - float(pow(2, 53) - 1) == 0.0

def fact(n):
  r = 1
  for i in range(2, n + 1):
      r *= i
  return r
big = fact(150)
assert big >> 3 == 7141729945557318238098666081576317503986941973251408022818546979147478640605674799140821811084413893172138484843356775520333281274835563058294493649490258321867824011966972366165669661305620309050677098840264805679640283709440000000000000000000000000000000000000
assert big << 3 == 457070716515668367238314629220884320255164286288090113460387006665438632998763187145012595909402489163016863029974833633301330001589476035730847593567376532599540736765886231434602858323559699779243334325776947563496978157404160000000000000000000000000000000000000

# issue 1330
assert repr(float(pow(10,16)-2)) == '9999999999999998.0'
assert repr(float(pow(10,16)-1)) == '1e+16'

assert repr(1000000000000000000.1) == '1e+18'
assert repr(float(10 ** 16)) == '1e+16'
assert repr(float(10 ** 15)) == '1000000000000000.0'
assert repr(float(10 ** 3)) == '1000.0'
assert repr(100000000000000005.0) == '1e+17'
assert repr(100000000000000025.0) == '1.0000000000000003e+17'
assert repr(0.0001) == '0.0001'
assert repr(0.00001) == '1e-05'
assert repr(0.0000031416) == '3.1416e-06'

# issue 1338
assert -100000000000000 % 14000000000000000 == 13900000000000000

# issue 1396
assert "|{0:.4}|".format(1.2345678) == "|1.235|"

# issue 1412
i = 4
i += 100000000000000000

assert i == 100000000000000004

i = 1000000000000000
i += 4

assert i == 1000000000000004

# issue 1491
assert ~0x3f == -64
assert -0x3f == -63
assert +0x3F == 63

s = 0x2000000000003f
assert 0x2000000000003f == 9007199254741055
assert +0x2000000000003f == 9007199254741055
assert -0x2000000000003f == -9007199254741055
assert ~0x2000000000003f == -9007199254741056

# issue 1504
assert int('db1e8800bc27a3', base=16) == 61676589376350115

# issue 1511
assert 5 + float('inf') == float('inf')
assert 5 + float('-inf') == float('-inf')
assert float('nan') != float('nan')
assert math.isnan(float('-inf') + float('inf'))
assert math.isnan(float('inf') - float('inf'))
assert float('-inf') - float('inf') == float('-inf')

assert 5 - float('inf') == float('-inf')
assert 5 - float('-inf') == float('inf')
assert float('-inf') - float('inf') == float('-inf')
assert float('inf') + float('inf') == float('inf')

# issue 1512
assert math.isnan(5 + float('nan'))
assert math.isnan(5 - float('nan'))
assert math.isnan(float('nan') + float('nan'))
assert math.isnan(float('nan') - float('nan'))
assert math.isnan(float('nan') - float('inf'))
assert math.isnan(float('nan') + float('inf'))
assert math.isnan(float('nan') - float('-inf'))
assert math.isnan(float('nan') - float('-inf'))

# issue 1524
assert isinstance(10 // 3.1, float)

class Float(float):
  pass

assert 10 // Float(2) == 5.0

# issue 1558
values = [
    [
        76840139,
        b'\x00\x00\x00\x00\x00\x00\x00\x00\x04\x94|\xcb',
        b'\xcb|\x94\x04\x00\x00\x00\x00\x00\x00\x00\x00'
    ],
    [
        7684013976526520320,
        b'\x00\x00\x00\x00j\xa3\x1a\x00\x00\x00\x00\x00',
        b'\x00\x00\x00\x00\x00\x1a\xa3j\x00\x00\x00\x00'
    ]
]

for value in values:
    for i, byteorder in enumerate(["big", "little"]):
        b = int.to_bytes(value[0], 12, byteorder)
        assert b == value[1 + i]
        assert int.from_bytes(b, byteorder) == value[0]

# issue 1578
assert str(1e-6) == "1e-06"
assert str(1e-7) == "1e-07"
assert str(1e-8) == "1e-08"
assert str(1e-12) == "1e-12"
assert str(1.2e-123) == "1.2e-123"
assert str(1e6) == "1000000.0"
assert str(1e7) == "10000000.0"
assert str(1e8) == "100000000.0"
assert str(1e12) == "1000000000000.0"
assert str(1.2e123) == "1.2e+123"

# issue 1666
a = 0.1
assert abs(a) == 0.1

a = 10**(-1)
assert abs(a) == 0.1

# issue 1686
class Squared(int):
    def __mul__(self, other):
        return self**2 * other

    def __rmul__(self, other):
        return self**2 * other

x = Squared(4)
y = 3
assert x * y == 48
assert y * x == 48

# augmented assignment on list item
a = [1800]
a[0] += -260.7
assert a[0] == 1539.3

# hash of integers
assert hash(2 ** 61 - 2) == 2 ** 61 - 2
assert hash(2 ** 61 - 1) == 0
assert hash(-(2 ** 61 - 1)) == 0

class Int(int):
  pass

assert hash(Int(2**61)) == 1

class IntH(int):

  def __hash__(self):
     return 99

assert hash(IntH(0)) == 99

# issue 1784
assert str(1 ** 1) == "1"
assert str(pow(1, 1)) == "1"
assert str(1 ** 0.5) == "1.0"
assert str(pow(1, 0.5)) == "1.0"

a = 2 ** 63 + 67
assert divmod(a, 445677) == (20695194135786, 78753)
assert divmod(a, -445677) == (-20695194135787, -366924)
assert divmod(-a, 445677) == (-20695194135787, 366924)
assert divmod(-a, -445677) == (20695194135786, -78753)

assert str(float(a)) == "9.223372036854776e+18"
assert str(float(-a)) == "-9.223372036854776e+18"

# issue 1840
assert 0 // 10 ** 100 == 0

# issue 1864
assertRaises(NameError, exec, "_12")
assert 1_2 == 12
assertRaises(SyntaxError, exec, "12_")

assertRaises(SyntaxError, exec, "_12.34e56")
assert 1_2.34e56 == 1.234e+57
assertRaises(SyntaxError, exec, "12_.34e56")
assertRaises(SyntaxError, exec, "12._34e56")
assert 12.3_4e56 == 1.234e+57
assertRaises(SyntaxError, exec, "12.34e_56")
assert 12.34e5_6 == 1.234e+57
assertRaises(SyntaxError, exec, "12.34e56_")

# issue 1885
assertRaises(TypeError, exec, '1 / float')

# issue 1924
n = 19
assert n.bit_count() == 3
assert (-n).bit_count() == 3

n = 2 ** 70 + 567444332
assert n.bit_count() == 14

# issue 1947
a = -1 + 1j
assert a ** 3 == 2+2j
assert a ** -1 == (-0.5-0.5j)

assert (-0.5 + math.sqrt(3) / 2 * 1j) ** 3 == (0.9999999999999998 +
    1.1102230246251565e-16j)

# issue 1955
a = -1
a %= 2
assert(a == 1)

# issue 1960
assert int('-10', 0) == -10
assert int('-0b010', 0) == -2
assert int('-0o010', 0) == -8
assert int('-0x010', 0) == -16

# issue 1994
x = 0
x += 0.5
assert x == abs(x), (x, abs(x))

# method __complex__
x = 2j
assert x.__complex__() is x

# issue 2023
assert_raises(TypeError, eval, "1 % 'a'",
    msg="unsupported operand type(s) for %: 'int' and 'str'")

# issue 2026
x = 65152
x <<= 112
assert x == 338288524927261089654018896841347694592

# issue 2058
hash(0.1)

# issue 2087
import sys
assert sys.int_info.default_max_str_digits == 4300
assert sys.int_info.str_digits_check_threshold == 640

assert sys.get_int_max_str_digits() == 4300
s = '2' * 5000
assert_raises(ValueError, int, s)

sys.set_int_max_str_digits(5100)
int(s)

# issue 2095
x = -.00001
assert f'{x:z.1f}' == '0.0'

# issue 2110
rsa129 = 114381625757888867669235779976146612010218296721242362562561842935706935245733897830597123563958705058989075147599290026879543541
e = 9007
m = 200805001301070903002315180419000118050019172105011309190800151919090618010705
s = 96869613754622061477140922254355882905759991124574319874695120930816298225145708356931476622883989628013391990551829945157815154
assert pow(m, e, rsa129) == s

m = 200805001301070903002315180419000118050019172105011309190800151919090618010705
assert pow(m, 2) == m*m
assert pow(m, 2, rsa129) == m * m % rsa129

assert pow(pow(2, 53) - 1, 1, 2) == 1
assert pow(pow(2, 53), 1, 2) == 0

# issue 2122
nzi64 = int("0x910FDB1DBC8650BE", 16)
ltnzi64 = int("0x3C039E0D19DFDB8A", 16)
gAnswer = (ltnzi64 - nzi64) % (2 ** 64)
assert gAnswer == 0xAAF3C2EF5D598ACC, gAnswer

# digits in non-latin alphabets
assert int('9' + chr(int('17E4', 16)) + 'b', 16) == 2379

# issue 2228
assert int(0.00005) == 0
assert int(3.9) == 3
assert int(-3.9) == -3

# issue 2361
assert_raises(TypeError, float, lambda: None,
    msg="float() argument must be a string or a real number, not 'function'")

# issue 2363
assert_raises(ValueError, int, '')

# issue
ints = [1, 10, 20, 30, 40, 50, 60]

expected = ["-8000000000000000",
            "-040000000000000",
            "-000100000000000",
            "-000000400000000",
            "-000000001000000",
            "-000000000004000",
            "-000000000000010"]

for imm6, exp in zip(ints, expected):
    assert f"{(~((1 << (64 - imm6)) - 1)):016X}" == exp

# issue 2396
x = (-1.1 - 1j)
x + 1
x += 1
x + 2j
x += 2j
x + 1.5 + 2j
x += 1.5 + 2j

x - 1
x -=1
x - 2j
x -= 2j
x - 1.5 - 2j
x -= 1.5 + 2j

x * 1
x *= 1
x * 2j
x *= 2j
x * (1.5 + 2j)
x *= (1.5 + 2j)

# issue 2407
p = 800275543
q = 33679599593
e = 65537
n = p * q
d = pow(e, -1, (p-1) * (q-1))

assert d == 21203499539617337777

# issue 2465
assert type(2 ** 53) == int

# issue 2506
assert 1.0 // 0.1 == 9, 1.0 // 0.1
assert divmod(1.0, 0.1) == (9.0, 0.09999999999999995)
assert float.__divmod__(2.5, 7) == (0.0, 2.5)
assert float.__divmod__(6.3, 2 ** 64) == (0.0, 6.3)

# use __index__ for sequence multiplication
class X:

  def __index__(self):
      return 2

assert [2] * X() == [2, 2]
assert X() * [3] == [3, 3]

# issue 2527
False.as_integer_ratio()
False.bit_count
False.bit_length
False.to_bytes()

# issue 2543
x = 10
x /= 2
assert isinstance(x, float)

# issue 2544
2 + 1j
x = (2+1j) / 3.2
assert x == (0.625+0.3125j)

z = 2 + 3j
z /= 2 ** 64
assert z == (1.0842021724855044e-19+1.6263032587282567e-19j)

assert complex.__truediv__(2+3j, 'a') is NotImplemented
assert complex.__mul__(2+3j, 'a') is NotImplemented

assert_raises(TypeError, eval, "2 + 3j / 'a'",
  msg="unsupported operand type(s) for /: 'complex' and 'str'")

# issue 2658
assert 2 ** 53 == float(2 ** 53)

print('passed all tests...')
