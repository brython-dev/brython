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

_MISSING_IMPLEMENTATION_MESSAGE="""Not yet implemented, please consider sending a pull request with implementation to https://github.com/brython-dev/brython"""


def phase(x):
    """Return phase, also known as the argument, of a complex."""
    return math.atan2(x.imag, x.real)
    
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
        raise NotImplemented(_MISSING_IMPLEMENTATION_MESSAGE)
    else:
        if phi == .0:
            # TODO: Not sure this applies to Brython ??
            # Workaround for buggy results with phi=-0.0 on OS X 10.8.  
            # See bugs.python.org/issue18513.
            return complex(r,phi*r)
        else:
            return complex(r*cos(phi), r*sin(phi))
            

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

    ret = complex()
    s, d, ax, ay = .0, .0, abs(x.real), abs(x.imag)
    
    ret = _SPECIAL_VALUE(x, _sqrt_special_values)
    if ret is not None:
        return ret

    if x.real == .0 and x.imag == .0:
        ret.real = .0
        ret.imag = x.imag
        return ret

    if ax < sys.float_info.min and ay < sys.float_info.min and (ax > 0. or ay > 0.):
        #here we catch cases where hypot(ax, ay) is subnormal
        ax = math.ldexp(ax, _CM_SCALE_UP);
        s = math.ldexp(math.sqrt(ax + math.hypot(ax, math.ldexp(ay, _CM_SCALE_UP))),_CM_SCALE_DOWN)
    else:
        ax /= 8.0;
        s = 2.0*math.sqrt(ax + math.hypot(ax, ay/8.0));
    
    d = ay/(2.0*s)

    if x.real >= .0:
        ret.real = s;
        ret.imag = math.copysign(d, x.imag)
    else:
        ret.real = d;
        ret.imag = math.copysign(s, x.imag)
    
    return ret

def acos(x):
    """ 
        Return the arc cosine of x. 
    
        There are two branch cuts: One extends right from 1 along the real axis to ∞, continuous from below. 
        The other extends left from -1 along the real axis to -∞, continuous from above.
    """
    ret = complex()
    
    if abs(x.real) > _CM_LARGE_DOUBLE or abs(x.imag) > _CM_LARGE_DOUBLE:
        
        # avoid unnecessary overflow for large arguments
        ret.real = math.atan2(abs(x.imag), x.real)
        
        # split into cases to make sure that the branch cut has the
        # correct continuity on systems with unsigned zeros
        if x.real < 0:
            ret.imag = -math.copysign(math.log(math.hypot(x.real/2., x.imag/2.)) + _M_LN2*2., x.imag);
        else:
            ret.imag = math.copysign(math.log(math.hypot(x.real/2., x.imag/2.)) + _M_LN2*2., -x.imag);
    else:
        s1 = complex(float(1-x.real), -x.imag)
        s1 = sqrt(s1)
        s2 = complex(1.0+x.real, x.imag)
        s2 = sqrt(s2)
        ret.real = 2.0*math.atan2(s1.real, s2.real);
        ret.imag = math.asinh(s2.real*s1.imag - s2.imag*s1.real)
    
    return ret

def acosh(x):
    """
        Return the hyperbolic arc cosine of x. 
        
        There is one branch cut, extending left from 1 along the real axis to -∞, continuous from above.
    """
    raise NotImplemented(_MISSING_IMPLEMENTATION_MESSAGE)

def asin(x):
    """
        Return the arc sine of x. 
    
        This has the same branch cuts as acos().
    """
    # asin(z) == -i asinh(iz)
    s = complex(-x.imag, -x.real)
    s = asinh(s)
    return complex(s.imag, -s.real)


def asinh(x):
    """
        Return the hyperbolic arc sine of x. 
        
        There are two branch cuts: One extends from 1j along the imaginary axis to ∞j, continuous from the right. 
        The other extends from -1j along the imaginary axis to -∞j, continuous from the left.
    """
    raise NotImplemented(_MISSING_IMPLEMENTATION_MESSAGE)


def atan(x):
    """
        Return the arc tangent of x. 
        
        There are two branch cuts: One extends from 1j along the imaginary axis to ∞j, continuous from the right. 
        The other extends from -1j along the imaginary axis to -∞j, continuous from the left.
    """
    raise NotImplemented(_MISSING_IMPLEMENTATION_MESSAGE)

def atanh(x):
    """
        Return the hyperbolic arc tangent of x. 
        
        There are two branch cuts: One extends from 1 along the real axis to ∞, continuous from below. 
        The other extends from -1 along the real axis to -∞, continuous from above.
    """

def cos(x):
    """Return the cosine of x."""
    raise NotImplemented(_MISSING_IMPLEMENTATION_MESSAGE)


def cosh(x):
    """Return the hyperbolic cosine of x."""
    raise NotImplemented(_MISSING_IMPLEMENTATION_MESSAGE)

def exp(x):
    """ Return the exponential value e**x."""
    ret = complex()
    if math.isinf(x.real) or math.isinf(x.imag):
        if math.isinf(x.real) and -_INF < x.imag < _INF and x.imag != .0:
            if x.real > 0:
                ret.real = math.copysign(_INF, cos(x.imag))
                ret.imag = math.copysign(_INF, sin(x.imag))
            else:
                ret.real = math.copysign(.0, cos(x.imag))
                ret.imag = math.copysign(.0, sin(x.imag))
        else:
            raise NotImplemented(_MISSING_IMPLEMENTATION_MESSAGE)
    
 
        # need to raise DomainError if y is +/- infinity and x is not -infinity or NaN
        if math.isinf(x.imag) and (-_INF < x.real < _INF or math.isinf(x.real) and x.real > 0):
            raise ValueError("math domain error")
        return ret
    

    if x.real > _CM_LOG_LARGE_DOUBLE:
        l = math.exp(x.real-1.);
        ret.real = l*math.cos(x.imag)*math.e
        ret.imag = l*math.sin(x.imag)*math.e
    else:
        l = exp(x.real);
        ret.real = l*math.cos(x.imag)
        ret.imag = l*math.sin(x.imag)

    if math.isinf(ret.real) or math.isinf(ret.imag):
        raise OverflowError()
    
    return ret

def isinf(x):
    """Return True if the real or the imaginary part of x is positive or negative infinity."""
    return math.isinf(x.real) or math.isinf(x.imag)

def isnan(x):
    """Return True if the real or imaginary part of x is not a number (NaN)."""
    return math.isnan(x.real) or math.isnan(x.imag)

def log(x, base=None):
    """
        Returns the logarithm of x to the given base. If the base is not specified, returns the natural logarithm of x. 
        
        There is one branch cut, from 0 along the negative real axis to -∞, continuous from above.
    """
    raise NotImplemented(_MISSING_IMPLEMENTATION_MESSAGE)

def log10(x):
    """
        Return the base-10 logarithm of x. 
        
        This has the same branch cut as log().
    """
    raise NotImplemented(_MISSING_IMPLEMENTATION_MESSAGE)

def sin(x):
    """ Return the sine of x. """
    # sin(x) = -i sinh(ix)
    s = complex(-x.imag, x.real)
    s = sinh(s)
    return complex(s.imag, -s.real)

def sinh(x):
    """ Return the hyperbolic sine of x. """
    ret = complex()
    if math.isinf(x.real) or math.isinf(x.imag):
        if math.isinf(x.real) and -_INF < x.imag < _INF and x.imag != .0:
            if x.real > 0:
                ret.real = math.copysign(_INF, cos(x.imag))
                ret.imag = math.copysign(_INF, sin(x.imag))
            else:
                ret.real = -math.copysign(_INF, cos(x.imag))
                ret.imag = math.copysign(_INF, sin(x.imag))
        else:
            raise NotImplemented(_MISSING_IMPLEMENTATION_MESSAGE)
    
 
        # need to raise DomainError if y is +/- infinity and x is not
        # a NaN and not -infinity
        if math.isinf(x.imag) and not math.isnan(x.real):
            raise ValueError("math domain error")
        return ret
    

    if abs(x.real) > _CM_LOG_LARGE_DOUBLE:
        x_minus_one = x.real - math.copysign(1.0, x.real)
        ret.real = math.cos(x.imag)*math.sinh(x.imag)*math.e
        ret.imag = math.sin(x.imag)*math.cosh(x.imag)*math.e
    else:
        ret.real = math.cos(x.imag)*math.sinh(x.real)
        ret.imag = math.sin(x.imag)*math.cosh(x.real)

    if math.isinf(ret.real) or math.isinf(ret.imag):
        raise OverflowError()
    
    return ret   


def tan(x):
    """ Return the tangent of x. """
    
def tanh(x):
    """ Return the hyperbolic tangent of x. """

pi = math.pi
e = math.e



_CM_LARGE_DOUBLE = sys.float_info.max/4
_CM_SQRT_LARGE_DOUBLE = math.sqrt(_CM_LARGE_DOUBLE)
_CM_LOG_LARGE_DOUBLE = math.log(_CM_LARGE_DOUBLE)
_CM_SQRT_DBL_MIN = math.sqrt(sys.float_info.min)
_M_LN2 = 0.6931471805599453094  #  natural log of 2
_M_LN10 = 2.302585092994045684  #  natural log of 10

if sys.float_info.radix == 2:
    _CM_SCALE_UP = (2*(sys.float_info.mant_dig/2) + 1)
elif sys.float_info.radix == 16:
    _CM_SCALE_UP = (4*sys.float_info.mant_dig+1)
else:
    raise NotImplemented("cmath implementation expects the float base to be either 2 or 16, got "+str(sys.float_info.radix)+" instead.")
_CM_SCALE_DOWN =(-(_CM_SCALE_UP+1)/2)    

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
    if math.isinf(z.real) or math.isinf(z.imag):
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

_sqrt_special_values = [
      [complex(_INF,-_INF), complex(.0,-_INF),  complex(.0,-_INF),  complex(.0,_INF),   complex(.0,_INF),   complex(_INF,_INF), complex(_NAN,_INF)],
      [complex(_INF,-_INF), complex(_U,_U),     complex(_U,_U),     complex(_U,_U),     complex(_U,_U),     complex(_INF,_INF), complex(_NAN,_NAN)],
      [complex(_INF,-_INF), complex(_U,_U),     complex(.0,-.0),    complex(.0,.0),     complex(_U,_U),     complex(_INF,_INF), complex(_NAN,_NAN)],
      [complex(_INF,-_INF), complex(_U,_U),     complex(.0,-.0),    complex(.0,.0),     complex(_U,_U),     complex(_INF,_INF), complex(_NAN,_NAN)],
      [complex(_INF,-_INF), complex(_U,_U),     complex(_U,_U),     complex(_U,_U),     complex(_U,_U),     complex(_INF,_INF), complex(_NAN,_NAN)],
      [complex(_INF,-_INF), complex(_INF,-.0),  complex(_INF,-.0),  complex(_INF,.0),   complex(_INF,.0),   complex(_INF,_INF), complex(_INF,_NAN)],
      [complex(_INF,-_INF), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_NAN,_NAN), complex(_INF,_INF), complex(_NAN,_NAN)]
]
