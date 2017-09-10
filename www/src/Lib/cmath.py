#############################################################################################################
# The code below was ported by Jonathan L. Verner from CPython's C implementation in Modules/cmathmodule.c 
# (https://github.com/python/cpython/blob/84e6311dee71bb104e1779c89cf22ff703799086/Modules/cmathmodule.c)
#
# It is Licensed under the same license as the above file, i.e. PSF License Version 2
#
# Copyright (c) PSF 2017, (c) Jonathan L. Verner, 2017
#
#############################################################################################################

import math
import sys

def takes_complex(func):
    def decorated(x):
        if isinstance(x, complex):
            return func(x)
        elif type(x) in [int, float]:
            return func(complex(x))
        elif hasattr(x,'__complex__'):
            c = x.__complex__()
            if not isinstance(c, complex):
                raise TypeError("A complex number is required")
            else:
                return func(c)
        elif hasattr(x,'__float__'):
            try:
                c = complex(x.__float__(),0)
            except:
                raise TypeError("A complex number is required")
            return func(c)
        else:
            raise TypeError("A complex number is required")
    if hasattr(func,'__doc__'):
        decorated.__doc__ = func.__doc__
    if hasattr(func,'__name__'):
        decorated.__name__ = func.__name__
    return decorated

@takes_complex
def isfinite(x):
    return math.isfinite(x.imag) and math.isfinite(x.real)

@takes_complex
def phase(x):
    """Return phase, also known as the argument, of a complex."""
    return math.atan2(x.imag, x.real)
    
@takes_complex
def polar(x):
    """ 
        Convert a complex from rectangular coordinates to polar coordinates. 
        
        The function returns a tuple with the two elements r and phi. 
        r is the distance from 0 and phi the phase angle.
    """
    phi = math.atan2(x.imag, x.real)
    r = math.sqrt(x.real**2+x.imag**2)
    return r, phi

def rect(r, phi):
    """
        Convert from polar coordinates to rectangular coordinates and return a complex.
    """
    if math.isinf(r) or math.isinf(phi):
        # need to raise Domain error if r is a nonzero number and phi
        # is infinite
        if math.isinf(phi) and r != .0 and not math.isnan(r):
            raise ValueError("math domain error")
        
        # if r is +/-infinity and phi is finite but nonzero then
        # result is (+-INF +-INF i), but we need to compute cos(phi)
        # and sin(phi) to figure out the signs.
        if -_INF < phi < _INF and phi != .0:
            if r > 0:
                _real = math.copysign(_INF, math.cos(phi))
                _imag = math.copysign(_INF, math.sin(phi))
            else:
                _real = -math.copysign(_INF, cos(phi));
                _imag = -math.copysign(_INF, sin(phi));
            return complex(_real, _imag)
        return _SPECIAL_VALUE(complex(r,phi), _rect_special_values)

    else:
        if phi == .0:
            # TODO: Not sure this applies to Brython ??
            # Workaround for buggy results with phi=-0.0 on OS X 10.8.  
            # See bugs.python.org/issue18513.
            return complex(r, phi*r)
        else:
            return complex(r*math.cos(phi), r*math.sin(phi))
            
@takes_complex
def sqrt(x):
    """
       Return the square root of x. 
       
       This has the same branch cut as log().
    """
    #   Method: use symmetries to reduce to the case when x = z.real and y
    #   = z.imag are nonnegative.  Then the real part of the result is
    #   given by
    #
    #       s = sqrt((x + hypot(x, y))/2)
    #
    #   and the imaginary part is
    #
    #        d = (y/2)/s
    #
    #   If either x or y is very large then there's a risk of overflow in
    #   computation of the expression x + hypot(x, y).  We can avoid this
    #   by rewriting the formula for s as:
    #
    #       s = 2*sqrt(x/8 + hypot(x/8, y/8))
    #
    #   This costs us two extra multiplications/divisions, but avoids the
    #   overhead of checking for x and y large.
    #   If both x and y are subnormal then hypot(x, y) may also be
    #   subnormal, so will lack full precision.  We solve this by rescaling
    #   x and y by a sufficiently large power of 2 to ensure that x and y
    #   are normal.
    s, d, ax, ay = .0, .0, math.fabs(x.real), math.fabs(x.imag)
    
    ret = _SPECIAL_VALUE(x, _sqrt_special_values)
    if ret is not None:
        return ret

    if x.real == .0 and x.imag == .0:
        _real = .0
        _imag = x.imag
        return complex(_real,_imag)

    if ax < sys.float_info.min and ay < sys.float_info.min and (ax > 0. or ay > 0.):
        #here we catch cases where hypot(ax, ay) is subnormal
        ax = math.ldexp(ax, _CM_SCALE_UP);
        s = math.ldexp(math.sqrt(ax + math.hypot(ax, math.ldexp(ay, _CM_SCALE_UP))),_CM_SCALE_DOWN)
    else:
        ax /= 8.0;
        s = 2.0*math.sqrt(ax + math.hypot(ax, ay/8.0));
    
    d = ay/(2.0*s)

    if x.real >= .0:
        _real = s;
        _imag = math.copysign(d, x.imag)
    else:
        _real = d;
        _imag = math.copysign(s, x.imag)
    
    return complex(_real,_imag)

@takes_complex
def acos(x):
    """ 
        Return the arc cosine of x. 
    
        There are two branch cuts: One extends right from 1 along the real axis to ∞, continuous from below. 
        The other extends left from -1 along the real axis to -∞, continuous from above.
    """
    
    ret = _SPECIAL_VALUE(x, _acos_special_values)
    if ret is not None:
        return ret
    
    if math.fabs(x.real) > _CM_LARGE_DOUBLE or math.fabs(x.imag) > _CM_LARGE_DOUBLE:
        
        # avoid unnecessary overflow for large arguments
        _real = math.atan2(math.fabs(x.imag), x.real)
        
        # split into cases to make sure that the branch cut has the
        # correct continuity on systems with unsigned zeros
        if x.real < 0:
            _imag = -math.copysign(math.log(math.hypot(x.real/2., x.imag/2.)) + _M_LN2*2., x.imag);
        else:
            _imag = math.copysign(math.log(math.hypot(x.real/2., x.imag/2.)) + _M_LN2*2., -x.imag);
    else:
        s1 = complex(float(1-x.real), -x.imag)
        s1 = sqrt(s1)
        s2 = complex(1.0+x.real, x.imag)
        s2 = sqrt(s2)
        _real = 2.0*math.atan2(s1.real, s2.real);
        _imag = math.asinh(s2.real*s1.imag - s2.imag*s1.real)
    
    return complex(_real,_imag)

@takes_complex
def acosh(x):
    """
        Return the hyperbolic arc cosine of x. 
        
        There is one branch cut, extending left from 1 along the real axis to -∞, continuous from above.
    """
    ret = _SPECIAL_VALUE(x, _acosh_special_values)
    if ret is not None:
        return ret
    
    if math.fabs(x.real) > _CM_LARGE_DOUBLE or math.fabs(x.imag) > _CM_LARGE_DOUBLE:
        # avoid unnecessary overflow for large arguments
        _real = math.log(math.hypot(x.real/2.0, x.imag/2.0)) + _M_LN2*2.0
        _imag = math.atan2(x.imag, x.real);
    else:
        s1 = sqrt(complex(x.real-1.0, x.imag))
        s2 = sqrt(complex(x.real+1.0, x.imag))
        _real = math.asinh(s1.real*s2.real + s1.imag*s2.imag)
        _imag = 2.*math.atan2(s1.imag, s2.real)

    return complex(_real,_imag)

@takes_complex
def asin(x):
    """
        Return the arc sine of x. 
    
        This has the same branch cuts as acos().
    """
    # asin(z) == -i asinh(iz)
    s = complex(-x.imag, x.real)
    s = asinh(s)
    return complex(s.imag, -s.real)

@takes_complex
def asinh(x):
    """
        Return the hyperbolic arc sine of x. 
        
        There are two branch cuts: One extends from 1j along the imaginary axis to ∞j, continuous from the right. 
        The other extends from -1j along the imaginary axis to -∞j, continuous from the left.
    """
    ret = _SPECIAL_VALUE(x, _asinh_special_values)
    if ret is not None:
        return ret

    if math.fabs(x.real) > _CM_LARGE_DOUBLE or math.fabs(x.imag) > _CM_LARGE_DOUBLE:
        if x.imag >= .0:
            _real = math.copysign(math.log(math.hypot(x.real/2., x.imag/2.)) + _M_LN2*2., x.real)
        else:
            _real = -math.copysign(math.log(math.hypot(x.real/2., x.imag/2.)) + _M_LN2*2., -x.real)
        _imag = math.atan2(x.imag,math.fabs(x.real))
    else:
        s1 = sqrt(complex(1.0+x.imag, -x.real))
        s2 = sqrt(complex(1.0-x.imag, x.real))
        _real = math.asinh(s1.real*s2.imag-s2.real*s1.imag)
        _imag = math.atan2(x.imag, s1.real*s2.real-s1.imag*s2.imag)
    return complex(_real,_imag)

@takes_complex
def atan(x):
    """
        Return the arc tangent of x. 
        
        There are two branch cuts: One extends from 1j along the imaginary axis to ∞j, continuous from the right. 
        The other extends from -1j along the imaginary axis to -∞j, continuous from the left.
    """
    s = atanh(complex(-x.imag, x.real))
    return complex(s.imag, -s.real)

@takes_complex
def atanh(x):
    """
        Return the hyperbolic arc tangent of x. 
        
        There are two branch cuts: One extends from 1 along the real axis to ∞, continuous from below. 
        The other extends from -1 along the real axis to -∞, continuous from above.
    """

    ret = _SPECIAL_VALUE(x, _atanh_special_values)
    if ret is not None:
        return ret

    # Reduce to case where x.real >= 0., using atanh(z) = -atanh(-z).
    if x.real < .0:
        return -(atanh(-x))

    ay = math.fabs(x.imag)
    
    if x.real > _CM_SQRT_LARGE_DOUBLE or ay > _CM_SQRT_LARGE_DOUBLE:
        
        #   if math.fabs(z) is large then we use the approximation
        #   atanh(z) ~ 1/z +/- i*pi/2 (+/- depending on the sign
        #   of x.imag)
        
        h = math.hypot(x.real/2., x.imag/2.)  # safe from overflow
        _real = x.real/4./h/h
        
        #   the two negations in the next line cancel each other out
        #   except when working with unsigned zeros: they're there to
        #   ensure that the branch cut has the correct continuity on
        #   systems that don't support signed zeros
        
        _imag = -math.copysign(math.pi/2., -x.imag)
    
    elif x.real == 1.0 and ay < _CM_SQRT_DBL_MIN:
    
        # C99 standard says:  atanh(1+/-0.) should be inf +/- 0i
        if (ay == .0):
            raise ValueError("math domain error")
        else:
            _real = -math.log(math.sqrt(ay)/math.sqrt(math.hypot(ay, 2.)))
            _imag = math.copysign(math.atan2(2.0, -ay)/2, x.imag)
    
    else:
    
        _real = math.log1p(4.*x.real/((1-x.real)*(1-x.real) + ay*ay))/4.
        _imag = -math.atan2(-2.*x.imag, (1-x.real)*(1+x.real) - ay*ay)/2.
        errno = 0
    
    return complex(_real,_imag)

@takes_complex
def cos(x):
    """Return the cosine of x."""
    return cosh(complex(-x.imag, x.real))

@takes_complex
def cosh(x):
    """Return the hyperbolic cosine of x."""
    
    # special treatment for cosh(+/-inf + iy) if y is not a NaN
    if isinf(x):
        if -_INF < x.imag < _INF and x.imag != .0:
            if x.real > 0:
                _real = math.copysign(_INF, math.cos(x.imag))
                _imag = math.copysign(_INF, math.sin(x.imag))
            else:
                _real = math.copysign(_INF, math.cos(x.imag))
                _imag = -math.copysign(_INF, math.sin(x.imag))
            return complex(_real,_imag)
        else:
            # need to raise math domain error if y is +/- infinity and x is not a NaN
            if x.imag != .0 and not math.isnan(x.real):
                raise ValueError("math domain error")
            return _SPECIAL_VALUE(x,_cosh_special_values)
    
    if math.fabs(x.real) > _CM_LOG_LARGE_DOUBLE:
        #  deal correctly with cases where cosh(x.real) overflows but
        #  cosh(z) does not. 
        x_minus_one = x.real - math.copysign(1.0, x.real)
        _real = cos(x.imag) * math.cosh(x_minus_one) * math.e
        _imag = sin(x.imag) * math.sinh(x_minus_one) * math.e
    else:
        _real = math.cos(x.imag) * math.cosh(x.real)
        _imag = math.sin(x.imag) * math.sinh(x.real)
    
    ret = complex(_real, _imag)
    #  detect overflow 
    if isinf(ret):
        raise OverflowError()
    return ret

@takes_complex
def exp(x):
    """ Return the exponential value e**x."""
    if math.isinf(x.real) or math.isinf(x.imag):
        # need to raise DomainError if y is +/- infinity and x is not -infinity or NaN
        if math.isinf(x.imag) and (-_INF < x.real < _INF or math.isinf(x.real) and x.real > 0):
            raise ValueError("math domain error")
        
        if math.isinf(x.real) and -_INF < x.imag < _INF and x.imag != .0:
            if x.real > 0:
                _real = math.copysign(_INF, cos(x.imag))
                _imag = math.copysign(_INF, sin(x.imag))
            else:
                _real = math.copysign(.0, cos(x.imag))
                _imag = math.copysign(.0, sin(x.imag))
            return complex(_real, _imag)
 
        return _SPECIAL_VALUE(x, _exp_special_values)    
 

    if x.real > _CM_LOG_LARGE_DOUBLE:
        l = math.exp(x.real-1.);
        _real = l*math.cos(x.imag)*math.e
        _imag = l*math.sin(x.imag)*math.e
    else:
        l = math.exp(x.real);
        _real = l*math.cos(x.imag)
        _imag = l*math.sin(x.imag)

    if math.isinf(_real) or math.isinf(_imag):
        raise OverflowError()
    
    return complex(_real, _imag)

@takes_complex
def isinf(x):
    """Return True if the real or the imaginary part of x is positive or negative infinity."""
    return math.isinf(x.real) or math.isinf(x.imag)

@takes_complex
def isnan(x):
    """Return True if the real or imaginary part of x is not a number (NaN)."""
    return math.isnan(x.real) or math.isnan(x.imag)


@takes_complex
def _to_complex(x):
    return x

def log(x, base=None):
    """
        Returns the logarithm of x to the given base. If the base is not specified, returns the natural logarithm of x. 
        
        There is one branch cut, from 0 along the negative real axis to -∞, continuous from above.
    """
    #    The usual formula for the real part is log(hypot(z.real, z.imag)).
    #    There are four situations where this formula is potentially
    #    problematic:
    #
    #    (1) the absolute value of z is subnormal.  Then hypot is subnormal,
    #    so has fewer than the usual number of bits of accuracy, hence may
    #    have large relative error.  This then gives a large absolute error
    #    in the log.  This can be solved by rescaling z by a suitable power
    #    of 2.
    #
    #    (2) the absolute value of z is greater than DBL_MAX (e.g. when both
    #    z.real and z.imag are within a factor of 1/sqrt(2) of DBL_MAX)
    #    Again, rescaling solves this.
    #
    #    (3) the absolute value of z is close to 1.  In this case it's
    #    difficult to achieve good accuracy, at least in part because a
    #    change of 1ulp in the real or imaginary part of z can result in a
    #    change of billions of ulps in the correctly rounded answer.
    #
    #    (4) z = 0.  The simplest thing to do here is to call the
    #    floating-point log with an argument of 0, and let its behaviour
    #    (returning -infinity, signaling a floating-point exception, setting
    #    errno, or whatever) determine that of c_log.  So the usual formula
    #    is fine here.
    
    x = _to_complex(x)
    #if type(x) == str:
        #raise TypeError("A complex number is required")
    
    #if type(x) != complex:
        #x = complex(x)

    if base is not None:
         x = log(x)
         base = log(base)
         x = x/base

    ret = _SPECIAL_VALUE(x, _log_special_values)
    if ret is not None:
        return ret

    ax = math.fabs(x.real)
    ay = math.fabs(x.imag)
    
    if ax > _CM_LARGE_DOUBLE or ay > _CM_LARGE_DOUBLE:
        _real = math.log(math.hypot(ax/2.0, ay/2.0)) + _M_LN2
    elif ax < sys.float_info.min and ay < sys.float_info.min:
        if ax > .0 or ay > .0:
            # catch cases where math.hypot(ax, ay) is subnormal 
            _real = math.log(math.hypot(math.ldexp(ax, sys.float_info.mant_dig), math.ldexp(ay, sys.float_info.mant_dig))) - sys.float_info.mant_dig*_M_LN2
        else:
            # math.log(+/-0. +/- 0i)
            raise ValueError("math domain error")
            _real = -_INF
            _imag = math.atan2(x.imag, x.real)
    else:
        h = math.hypot(ax, ay)
        if 0.71 <= h and h <= 1.73:
            am = max(ax,ay)
            an = min(ax,ay)
            _real = math.log1p((am-1)*(am+1)+an*an)/2.
        else:
            _real = math.log(h)
    _imag = math.atan2(x.imag, x.real)
    return complex(_real, _imag)

@takes_complex
def log10(x):
    """
        Return the base-10 logarithm of x. 
        
        This has the same branch cut as log().
    """
    ret = log(x);
    _real = ret.real / _M_LN10
    _imag = ret.imag / _M_LN10
    return complex(_real, _imag)

@takes_complex
def sin(x):
    """ Return the sine of x. """
    # sin(x) = -i sinh(ix)
    s = complex(-x.imag, x.real)
    s = sinh(s)
    return complex(s.imag, -s.real)

@takes_complex
def sinh(x):
    """ Return the hyperbolic sine of x. """
    
    if math.isinf(x.real) or math.isinf(x.imag):
        # need to raise DomainError if y is +/- infinity and x is not
        # a NaN and not -infinity
        if math.isinf(x.imag) and not math.isnan(x.real):
            raise ValueError("math domain error")
        
        if math.isinf(x.real) and -_INF < x.imag < _INF and x.imag != .0:
            if x.real > 0:
                _real = math.copysign(_INF, cos(x.imag))
                _imag = math.copysign(_INF, sin(x.imag))
            else:
                _real = -math.copysign(_INF, cos(x.imag))
                _imag = math.copysign(_INF, sin(x.imag))
            return complex(_real, _imag)
        
        return  _SPECIAL_VALUE(x,_sinh_special_values)

    if math.fabs(x.real) > _CM_LOG_LARGE_DOUBLE:
        x_minus_one = x.real - math.copysign(1.0, x.real)
        _real = math.cos(x.imag)*math.sinh(x.imag)*math.e
        _imag = math.sin(x.imag)*math.cosh(x.imag)*math.e
    else:
        _real = math.cos(x.imag)*math.sinh(x.real)
        _imag = math.sin(x.imag)*math.cosh(x.real)

    if math.isinf(_real) or math.isinf(_imag):
        raise OverflowError()
    
    return complex(_real, _imag)  

@takes_complex
def tan(x):
    """ Return the tangent of x. """
    s = atanh(complex(-x.imag, x.real))
    return complex(s.imag, -s.real)
    
@takes_complex
def tanh(x):
    """ Return the hyperbolic tangent of x. """
    """


    """

    # Formula:
    #       tanh(x+iy) = (tanh(x)(1+tan(y)^2) + i tan(y)(1-tanh(x))^2) /
    #       (1+tan(y)^2 tanh(x)^2)
    #       To avoid excessive roundoff error, 1-tanh(x)^2 is better computed
    #       as 1/cosh(x)^2.  When math.fabs(x) is large, we approximate 1-tanh(x)^2
    #       by 4 exp(-2*x) instead, to avoid possible overflow in the
    #       computation of cosh(x).
    #    
    
    if isinf(x):
        if math.isinf(x.imag) and -_INF < x.real < _INF:
            raise ValueError("math domain error")
        
        # special treatment for tanh(+/-inf + iy) if y is finite and nonzero 
        if math.isinf(x.real) and -_INF < x.imag < _INF and x.imag != .0:
            if x.real > 0:
                _real = 1.0
                _imag = math.copysign(.0, 2.0*math.sin(x.imag)*math.cos(x.imag))
            else:
                _real = -1.0
                _imag = math.copysign(.0, 2.*math.sin(x.imag)*math.cos(x.imag))
            return complex(_real, _imag)
        return  _SPECIAL_VALUE(x, _tanh_special_values)

    # danger of overflow in 2.*z.imag !
    if math.fabs(x.real) > _CM_LOG_LARGE_DOUBLE:
        _real = math.copysign(1., x.real)
        _imag = 4.*math.sin(x.imag)*math.cos(x.imag)*math.exp(-2.*math.fabs(x.real))
    else:
        tx = math.tanh(x.real)
        ty = math.tan(x.imag)
        cx = 1.0/math.cosh(x.real)
        txty = tx*ty
        denom = 1. + txty*txty
        _real = tx*(1.+ty*ty)/denom
        _imag = ((ty/denom)*cx)*cx
    return complex(_real, _imag)


pi = math.pi
e = math.e

_CM_LARGE_DOUBLE = sys.float_info.max/4
_CM_SQRT_LARGE_DOUBLE = math.sqrt(_CM_LARGE_DOUBLE)
_CM_LOG_LARGE_DOUBLE = math.log(_CM_LARGE_DOUBLE)
_CM_SQRT_DBL_MIN = math.sqrt(sys.float_info.min)
_M_LN2 = 0.6931471805599453094  #  natural log of 2
_M_LN10 = 2.302585092994045684  #  natural log of 10

if sys.float_info.radix == 2:
    _CM_SCALE_UP = int((2*(sys.float_info.mant_dig/2) + 1))
elif sys.float_info.radix == 16:
    _CM_SCALE_UP = int((4*sys.float_info.mant_dig+1))
else:
    raise ("cmath implementation expects the float base to be either 2 or 16, got "+str(sys.float_info.radix)+" instead.")
_CM_SCALE_DOWN =int((-(_CM_SCALE_UP+1)/2))

_INF = float('inf')
_NAN = float('nan')
_PI  = math.pi
_P14 = 0.25*math.pi
_P12 = 0.5*math.pi
_P34 = 0.75*math.pi
_U   = -9.5426319407711027e33 # unlikely value, used as placeholder


_ST_NINF  = 0  # negative infinity
_ST_NEG   = 1  # negative finite number (nonzero)
_ST_NZERO = 2  # -0.
_ST_PZERO = 3  # +0.
_ST_POS   = 4  # positive finite number (nonzero)
_ST_PINF  = 5  # positive infinity
_ST_NAN   = 6  # Not a Number


def _SPECIAL_VALUE(z, table):
    if not math.isfinite(z.real) or not math.isfinite(z.imag):
        return table[_special_type(z.real)][_special_type(z.imag)]
    else:
        return None

def _special_type(x):
    if -_INF < x < _INF:
        if x != 0:
            if math.copysign(1.0, x) == 1.0:
                return _ST_POS
            else:
                return _ST_NEG
        else:
            if math.copysign(1.0, x) == 1.0:
                return _ST_PZERO
            else:
                return _ST_NZERO
    if math.isnan(x):
        return _ST_NAN
    if math.copysign(1.0, x) == 1.0:
        return _ST_PINF
    else:
        return _ST_NINF

_acos_special_values = [
    [complex(_P34,_INF), complex(_PI,_INF), complex(_PI,_INF), complex(_PI,-_INF), complex(_PI,-_INF), complex(_P34,-_INF), complex(_NAN,_INF)],
    [complex(_P12,_INF), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_P12,-_INF), complex(_NAN,_NAN)],
    [complex(_P12,_INF), complex(_U,_U), complex(_P12,0.), complex(_P12,-0.), complex(_U,_U), complex(_P12,-_INF), complex(_P12,_NAN)],
    [complex(_P12,_INF), complex(_U,_U), complex(_P12,0.), complex(_P12,-0.), complex(_U,_U), complex(_P12,-_INF), complex(_P12,_NAN)],
    [complex(_P12,_INF), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_P12,-_INF), complex(_NAN,_NAN)],
    [complex(_P14,_INF), complex(0.,_INF), complex(0.,_INF), complex(0.,-_INF), complex(0.,-_INF), complex(_P14,-_INF), complex(_NAN,_INF)],
    [complex(_NAN,_INF), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,-_INF), complex(_NAN,_NAN)],
]

_acosh_special_values = [
    [complex(_INF,-_P34), complex(_INF,-_PI), complex(_INF,-_PI), complex(_INF,_PI), complex(_INF,_PI), complex(_INF,_P34), complex(_INF,_NAN)],
    [complex(_INF,-_P12), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_INF,_P12), complex(_NAN,_NAN)],
    [complex(_INF,-_P12), complex(_U,_U), complex(0.,-_P12), complex(0.,_P12), complex(_U,_U), complex(_INF,_P12), complex(_NAN,_NAN)],
    [complex(_INF,-_P12), complex(_U,_U), complex(0.,-_P12), complex(0.,_P12), complex(_U,_U), complex(_INF,_P12), complex(_NAN,_NAN)],
    [complex(_INF,-_P12), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_INF,_P12), complex(_NAN,_NAN)],
    [complex(_INF,-_P14), complex(_INF,-0.), complex(_INF,-0.), complex(_INF,0.), complex(_INF,0.), complex(_INF,_P14), complex(_INF,_NAN)],
    [complex(_INF,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_INF,_NAN), complex(_NAN,_NAN)],
]

_asinh_special_values = [
    [complex(-_INF,-_P14), complex(-_INF,-0.), complex(-_INF,-0.), complex(-_INF,0.), complex(-_INF,0.), complex(-_INF,_P14), complex(-_INF,_NAN)],
    [complex(-_INF,-_P12), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(-_INF,_P12), complex(_NAN,_NAN)],
    [complex(-_INF,-_P12), complex(_U,_U), complex(-0.,-0.), complex(-0.,0.), complex(_U,_U), complex(-_INF,_P12), complex(_NAN,_NAN)],
    [complex(_INF,-_P12), complex(_U,_U), complex(0.,-0.), complex(0.,0.), complex(_U,_U), complex(_INF,_P12), complex(_NAN,_NAN)],
    [complex(_INF,-_P12), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_INF,_P12), complex(_NAN,_NAN)],
    [complex(_INF,-_P14), complex(_INF,-0.), complex(_INF,-0.), complex(_INF,0.), complex(_INF,0.), complex(_INF,_P14), complex(_INF,_NAN)],
    [complex(_INF,_NAN), complex(_NAN,_NAN), complex(_NAN,-0.), complex(_NAN,0.), complex(_NAN,_NAN), complex(_INF,_NAN), complex(_NAN,_NAN)],
]

_atanh_special_values = [
    [complex(-0.,-_P12), complex(-0.,-_P12), complex(-0.,-_P12), complex(-0.,_P12), complex(-0.,_P12), complex(-0.,_P12), complex(-0.,_NAN)],
    [complex(-0.,-_P12), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(-0.,_P12), complex(_NAN,_NAN)],
    [complex(-0.,-_P12), complex(_U,_U), complex(-0.,-0.), complex(-0.,0.), complex(_U,_U), complex(-0.,_P12), complex(-0.,_NAN)],
    [complex(0.,-_P12), complex(_U,_U), complex(0.,-0.), complex(0.,0.), complex(_U,_U), complex(0.,_P12), complex(0.,_NAN)],
    [complex(0.,-_P12), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(0.,_P12), complex(_NAN,_NAN)],
    [complex(0.,-_P12), complex(0.,-_P12), complex(0.,-_P12), complex(0.,_P12), complex(0.,_P12), complex(0.,_P12), complex(0.,_NAN)],
    [complex(0.,-_P12), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(0.,_P12), complex(_NAN,_NAN)],
]

_cosh_special_values = [
    [complex(_INF,_NAN), complex(_U,_U), complex(_INF,0.), complex(_INF,-0.), complex(_U,_U), complex(_INF,_NAN), complex(_INF,_NAN)],
    [complex(_NAN,_NAN), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_NAN,_NAN), complex(_NAN,_NAN)],
    [complex(_NAN,0.), complex(_U,_U), complex(1.,0.), complex(1.,-0.), complex(_U,_U), complex(_NAN,0.), complex(_NAN,0.)],
    [complex(_NAN,0.), complex(_U,_U), complex(1.,-0.), complex(1.,0.), complex(_U,_U), complex(_NAN,0.), complex(_NAN,0.)],
    [complex(_NAN,_NAN), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_NAN,_NAN), complex(_NAN,_NAN)],
    [complex(_INF,_NAN), complex(_U,_U), complex(_INF,-0.), complex(_INF,0.), complex(_U,_U), complex(_INF,_NAN), complex(_INF,_NAN)],
    [complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,0.), complex(_NAN,0.), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN)],
]

_exp_special_values = [
    [complex(0.,0.), complex(_U,_U), complex(0.,-0.), complex(0.,0.), complex(_U,_U), complex(0.,0.), complex(0.,0.)],
    [complex(_NAN,_NAN), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_NAN,_NAN), complex(_NAN,_NAN)],
    [complex(_NAN,_NAN), complex(_U,_U), complex(1.,-0.), complex(1.,0.), complex(_U,_U), complex(_NAN,_NAN), complex(_NAN,_NAN)],
    [complex(_NAN,_NAN), complex(_U,_U), complex(1.,-0.), complex(1.,0.), complex(_U,_U), complex(_NAN,_NAN), complex(_NAN,_NAN)],
    [complex(_NAN,_NAN), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_NAN,_NAN), complex(_NAN,_NAN)],
    [complex(_INF,_NAN), complex(_U,_U), complex(_INF,-0.), complex(_INF,0.), complex(_U,_U), complex(_INF,_NAN), complex(_INF,_NAN)],
    [complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,-0.), complex(_NAN,0.), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN)],
]

_log_special_values = [
    [complex(_INF,-_P34), complex(_INF,-_PI), complex(_INF,-_PI), complex(_INF,_PI), complex(_INF,_PI), complex(_INF,_P34), complex(_INF,_NAN)],
    [complex(_INF,-_P12), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_INF,_P12), complex(_NAN,_NAN)],
    [complex(_INF,-_P12), complex(_U,_U), complex(-_INF,-_PI), complex(-_INF,_PI), complex(_U,_U), complex(_INF,_P12), complex(_NAN,_NAN)],
    [complex(_INF,-_P12), complex(_U,_U), complex(-_INF,-0.), complex(-_INF,0.), complex(_U,_U), complex(_INF,_P12), complex(_NAN,_NAN)],
    [complex(_INF,-_P12), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_INF,_P12), complex(_NAN,_NAN)],
    [complex(_INF,-_P14), complex(_INF,-0.), complex(_INF,-0.), complex(_INF,0.), complex(_INF,0.), complex(_INF,_P14), complex(_INF,_NAN)],
    [complex(_INF,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_INF,_NAN), complex(_NAN,_NAN)],
]

_sinh_special_values = [
    [complex(_INF,_NAN), complex(_U,_U), complex(-_INF,-0.), complex(-_INF,0.), complex(_U,_U), complex(_INF,_NAN), complex(_INF,_NAN)],
    [complex(_NAN,_NAN), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_NAN,_NAN), complex(_NAN,_NAN)],
    [complex(0.,_NAN), complex(_U,_U), complex(-0.,-0.), complex(-0.,0.), complex(_U,_U), complex(0.,_NAN), complex(0.,_NAN)],
    [complex(0.,_NAN), complex(_U,_U), complex(0.,-0.), complex(0.,0.), complex(_U,_U), complex(0.,_NAN), complex(0.,_NAN)],
    [complex(_NAN,_NAN), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_NAN,_NAN), complex(_NAN,_NAN)],
    [complex(_INF,_NAN), complex(_U,_U), complex(_INF,-0.), complex(_INF,0.), complex(_U,_U), complex(_INF,_NAN), complex(_INF,_NAN)],
    [complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,-0.), complex(_NAN,0.), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN)],
]

_sqrt_special_values = [
    [complex(_INF,-_INF), complex(0.,-_INF), complex(0.,-_INF), complex(0.,_INF), complex(0.,_INF), complex(_INF,_INF), complex(_NAN,_INF)],
    [complex(_INF,-_INF), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_INF,_INF), complex(_NAN,_NAN)],
    [complex(_INF,-_INF), complex(_U,_U), complex(0.,-0.), complex(0.,0.), complex(_U,_U), complex(_INF,_INF), complex(_NAN,_NAN)],
    [complex(_INF,-_INF), complex(_U,_U), complex(0.,-0.), complex(0.,0.), complex(_U,_U), complex(_INF,_INF), complex(_NAN,_NAN)],
    [complex(_INF,-_INF), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_INF,_INF), complex(_NAN,_NAN)],
    [complex(_INF,-_INF), complex(_INF,-0.), complex(_INF,-0.), complex(_INF,0.), complex(_INF,0.), complex(_INF,_INF), complex(_INF,_NAN)],
    [complex(_INF,-_INF), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_INF,_INF), complex(_NAN,_NAN)],
]

_tanh_special_values = [
    [complex(-1.,0.), complex(_U,_U), complex(-1.,-0.), complex(-1.,0.), complex(_U,_U), complex(-1.,0.), complex(-1.,0.)],
    [complex(_NAN,_NAN), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_NAN,_NAN), complex(_NAN,_NAN)],
    [complex(_NAN,_NAN), complex(_U,_U), complex(-0.,-0.), complex(-0.,0.), complex(_U,_U), complex(_NAN,_NAN), complex(_NAN,_NAN)],
    [complex(_NAN,_NAN), complex(_U,_U), complex(0.,-0.), complex(0.,0.), complex(_U,_U), complex(_NAN,_NAN), complex(_NAN,_NAN)],
    [complex(_NAN,_NAN), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_NAN,_NAN), complex(_NAN,_NAN)],
    [complex(1.,0.), complex(_U,_U), complex(1.,-0.), complex(1.,0.), complex(_U,_U), complex(1.,0.), complex(1.,0.)],
    [complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,-0.), complex(_NAN,0.), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN)],
]

_rect_special_values = [
    [complex(_INF,_NAN), complex(_U,_U), complex(-_INF,0.), complex(-_INF,-0.), complex(_U,_U), complex(_INF,_NAN), complex(_INF,_NAN)],
    [complex(_NAN,_NAN), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_NAN,_NAN), complex(_NAN,_NAN)],
    [complex(0.,0.), complex(_U,_U), complex(-0.,0.), complex(-0.,-0.), complex(_U,_U), complex(0.,0.), complex(0.,0.)],
    [complex(0.,0.), complex(_U,_U), complex(0.,-0.), complex(0.,0.), complex(_U,_U), complex(0.,0.), complex(0.,0.)],
    [complex(_NAN,_NAN), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_U,_U), complex(_NAN,_NAN), complex(_NAN,_NAN)],
    [complex(_INF,_NAN), complex(_U,_U), complex(_INF,-0.), complex(_INF,0.), complex(_U,_U), complex(_INF,_NAN), complex(_INF,_NAN)],
    [complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,0.), complex(_NAN,0.), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN)],
]
