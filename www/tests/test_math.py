import math

from tester import assertRaises, assert_raises

def almost_equal(actual, expected):
    return abs(actual - expected) < 0.00001

assert math.acos(0.57) == 0.9642904715818097
assert math.acos(1) == 0.0
assert math.acos(-1) == 3.141592653589793
assert math.acos(0) == 1.5707963267948966

assert math.acosh(45) == 4.499686190671499
assert math.acosh(30) == 4.0940666686320855
assert math.acosh(1) == 0.0
assert math.acosh(10) == 2.993222846126381
assert math.acosh(90) == 5.192925985263684

assert math.asin(0) == 0.0
assert math.asin(1) == 1.5707963267948966
assert math.asin(0.5) == 0.5235987755982989
assert math.asin(-1) == -1.5707963267948966

assert math.asinh(45) == 4.49993310426429
assert math.asinh(30) == 4.09462222433053
assert almost_equal(math.asinh(1), 0.881373587019543)
assert math.asinh(10) == 2.99822295029797
assert math.asinh(90) == 5.192987713658941

assert math.atan(0) == 0.0
assert math.atan(1) == 0.7853981633974483
assert math.atan(0.5) == 0.4636476090008061
assert math.atan(-1) == -0.7853981633974483

assert math.factorial(0) == 1
assert math.factorial(1) == 1
assert math.factorial(2) == 2
assert math.factorial(5) == 120
# issue 1856
assertRaises(TypeError, math.factorial, 5.)

assert almost_equal(math.acosh(1), 0)

assert almost_equal(math.asinh(0), 0)
assert almost_equal(math.asinh(1), 0.88137358701954305)

assert math.trunc(1.9) == 1.0

assert math.ceil(0.5) == 1
assert math.ceil(1.0) == 1
assert math.ceil(1.5) == 2
assert math.ceil(-0.5) == 0

assert math.ldexp(float("inf"), -10 ** 20) == float("inf")

assert almost_equal(math.log1p(1 / math.e-1), -1)
assert almost_equal(math.log1p(0), 0)
assert almost_equal(math.log1p(math.e - 1), 1)
assert almost_equal(math.log1p(1), math.log(2))

assert almost_equal(math.acosh(1), 0)
assert almost_equal(math.acosh(2), 1.3169578969248168)

assert math.isinf(math.asinh(float("inf")))

assert almost_equal(math.asinh(0), 0)
assert almost_equal(math.asinh(1), 0.88137358701954305)

assert almost_equal(math.asinh(-1), -0.88137358701954305)

assert almost_equal(math.atanh(0), 0)
assert almost_equal(math.atanh(0.5), 0.54930614433405489)

assert almost_equal(math.atanh(-0.5), -0.54930614433405489)

assert math.isnan(math.atanh(float("nan")))

assert math.trunc(1.9) == 1.0

class foo(object):

    def __trunc__(self):
        return "truncated"


assert math.trunc(foo()) == "truncated"

assert math.copysign(1.0, -5) == -1.0
assert math.copysign(-1.0, 5) == 1.0

assert almost_equal(math.ceil(0.5), 1)
assert almost_equal(math.ceil(1.0), 1)
assert almost_equal(math.ceil(1.5), 2)
assert almost_equal(math.ceil(-0.5), 0)

assert almost_equal(math.ceil(-1.0), -1)
assert almost_equal(math.ceil(-1.5), -1)

class TestCeil:

  def __ceil__(self):
      return 42


assert almost_equal(math.ceil(TestCeil()), 42)

class StrangeCeil:

    def __ceil__(self):
        return "this is a string"


assert math.ceil(StrangeCeil()) == "this is a string"

# tests for math.nan and math.inf (some tests could be shared with py_float.js)
assert math.nan != math.nan
assert math.inf > 10
assert math.inf > -10
assert -math.inf < 10
assert -math.inf < -10

# tests for math.isclose
cases = [
    {'a': 1e10, 'b': 1.00001e10, 'rel_tol': 1e-09, 'abs_tol': 0.0},
    {'a': 1e-7, 'b': 1e-8, 'rel_tol': 1e-09, 'abs_tol': 0.0},
    {'a': 1e-8, 'b': 1e-9, 'rel_tol': 1e-09, 'abs_tol': 0.0},
    {'a': 1e10, 'b': 1.0001e10, 'rel_tol': 1e-09, 'abs_tol': 0.0},
    {'a': 1.0, 'b': 1.0, 'rel_tol': 1e-09, 'abs_tol': 0.0},
    {'a': 1.0, 'b': 1.01, 'rel_tol': 1, 'abs_tol': 0.0},
    {'a': 1.0, 'b': 1.01, 'rel_tol': 0.001, 'abs_tol': 0.0},
    {'a': math.nan, 'b': math.nan, 'rel_tol': 1e-09, 'abs_tol': 0.0},
    {'a': math.inf, 'b': 10, 'rel_tol': 1e-09, 'abs_tol': 0.0}
]
expected = [False, False, False, False, True, True, False, False, False]
for case, result in zip(cases, expected):
    assert math.isclose(**case) == result

# issue 204
m, e = math.frexp(abs(123.456))
assert m == 0.9645
assert m * (1 << 24) == 16181624.832

# issue 433
# Floats should not test for equality !
def my_isclose(a, b, rel_tol=1e-09, abs_tol=1e-09):
    if a == b:
        return True
    diff = abs(a-b)
    return diff <= abs(a)*rel_tol or diff <= abs(b)*rel_tol or diff <= abs_tol

assert my_isclose(10 ** 1j, (-0.6682015101903132 + 0.7439803369574931j))
assert my_isclose(10.5 ** (3 + 1j), (-814.610144261598 + 822.4998197514079j))

assert my_isclose(math.e ** 1j, (0.5403023058681398 + 0.8414709848078965j))

assert my_isclose((1 + 2j) ** 1j, (0.2291401859804338 + 0.23817011512167555j))

# issue 924
assert math.gcd(234, 78) == 78

# issue 1108
assert math.copysign(1.0, -0.0) == -1.0

# issue 1109
assert my_isclose(math.expm1(1e-5), 0.000010000050000166668), math.expm1(1e-5)

# issue 1110
assert math.log10(1000) == 3.0

# issue 1111
log1p = math.log1p(1e-5)
assert (log1p == 0.00000999995000033333 or # CPython, Edge
        log1p == 0.000009999950000333332) # Firefox, Chrome

# issue 1112
assert math.gamma(2) == 1.0

# issue 1113
assert math.lgamma(2) == 0.0

# issue 1246
assertRaises(TypeError, math.cos)

# issue 1308
assert math.factorial(69) == 171122452428141311372468338881272839092270544893520369393648040923257279754140647424000000000000000

# issue 1312
assert math.comb(5, 2) == 10
assert math.comb(69, 12) == 8815083648488

assert math.perm(69, 12) == 4222439171759589580800

x = math.prod(range(1, 33))
assert x == 263130836933693530167218012160000000

assert math.isqrt(x) == 512962802680363491

y = math.factorial(69)
assert math.isqrt(y) == 13081378078327271990661335578798848847474255303826

assert math.dist([1, 2, 3], [4, 5, 6]) == 5.196152422706632

# issue 1314
assert math.gcd(pow(2, 53) - 2, 2) == 2
assert math.gcd(pow(2, 53) - 1, 2) == 1

# issue 1397
assert math.dist((1.0, 1.0), (1.5, 0.0))  == 1.118033988749895

# issue 1401
class Angle(float):
    def __new__(cls, angle, point):
        return super().__new__(cls, angle)
    def __init__(self, angle, point):
        self.points = point

x = Angle(36.9, (1,2))
y = Angle(53.1, (3,4))

assert (x, x + y, x < y, x ** 0.5) == (36.9, 90.0, True, 6.074537019394976)
assert almost_equal(math.sin(x), -0.7167370231606575)
assert (abs(x), int(x), math.log(x)) == \
       (36.9, 36, 3.6082115510464816)

# issue 1590
assert math.acosh(1e155) == 357.593836594637

# issue 1591
assert math.lgamma(1e3) == 5905.220423209181

# issue 1594
for x in [-1, -1.0, 0, 0.0, float('-inf')]:
    assertRaises(ValueError, math.gamma, x)

# issue 1758
assert math.dist((0,0),(1,0)) == 1.0

# issue 1759
assert math.ceil(5) == 5

# issue 1784
assert str(math.pow(1, 1)) == "1.0"
assert str(math.pow(1, 0.5)) == "1.0"

# issue 1811
assert math.hypot(1) == 1.0
assert math.hypot() == 0

# issue 1813
assert math.log2(1 << 53) == 53.0
assert math.log2((1<<53) + 657889) == 53.00000000010537

assert math.log2(1 << 1024) == 1024
assert math.log(1 << 1024) == 709.782712893384
assert math.log10(1 << 1024) == 308.25471555991675, math.log10(1 << 1024)

assert math.log1p(1 << 1024 - 1) == 709.0895657128241
try:
    math.log1p(1 << 1024)
    raise Exception("should have riased OverflowError")
except OverflowError:
    pass

# issue 1842
assert not math.isclose(0.1, 0)

# issue 1957
assert math.isclose(math.gamma(-26.7), -9.622839430100812e-28)

assert math.gamma(0.25) == 3.6256099082219087
assert math.gamma(-0.25) == -4.90166680986071

assert math.gamma(1.25) == 0.9064024770554773
assert math.gamma(0.75) == 1.2254167024651779
assert math.gamma(0.25) == 3.6256099082219087
assert math.gamma(-0.25) == -4.90166680986071, math.gamma(-0.25)
assert math.gamma(-0.75) == -4.834146544295877

args = [-26.7, 0.25, -0.25, 1.25, 0.75, -0.75]
expected = [-62.208243223652396,
1.2880225246980772,
1.5895753125511862,
-0.0982718364218127,
0.203280951431295,
1.5757045971498584]

for x, r in zip(args, expected):
    assert math.isclose(math.lgamma(x), r)

# issue 1989
assert_raises(ValueError, math.log, 0, msg="math domain error")
assert_raises(ValueError, math.log10, 0, msg="math domain error")
assert_raises(ValueError, math.log2, 0, msg="math domain error")

# rewriting of math.comb
math.comb(1200, 575)

print("passed all tests..")
