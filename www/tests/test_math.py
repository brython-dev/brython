import math

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

assert math.ldexp(float("inf"), -10**20) == float("inf")

assert almost_equal(math.log1p(1/math.e-1), -1)
assert almost_equal(math.log1p(0), 0)
assert almost_equal(math.log1p(math.e-1), 1)
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

print("passed all tests..")
