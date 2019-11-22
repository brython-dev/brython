import math

from tester import assertRaises

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
assert math.factorial(5.) == 120

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
assert math.expm1(1e-5) == 0.000010000050000166668

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

print("passed all tests..")
