var $module = (function($B){

var _b_ = $B.builtins


var float_check = function(x) {
    if(x.__class__ === $B.long_int){
        return parseInt(x.value)
    }
    return _b_.float.$factory(x)
}

function check_int(x){
    if(! _b_.isinstance(x, _b_.int)){
        throw _b_.TypeError.$factory("'" + $B.class_name(x) +
            "' object cannot be interpreted as an integer")
    }
}

function check_int_or_round_float(x){
    return (x instanceof Number && x == Math.floor(x)) ||
            _b_.isinstance(x, _b_.int)
}

var isWholeNumber = function(x){return (x * 10) % 10 == 0}

var isOdd = function(x) {return isWholeNumber(x) && 2 * Math.floor(x / 2) != x}

var isNegZero = function(x) {return x === 0 && Math.atan2(x,x) < 0}

var EPSILON = Math.pow(2, -52),
    MAX_VALUE = (2 - EPSILON) * Math.pow(2, 1023),
    MIN_VALUE = Math.pow(2, -1022),
    Py_HUGE_VAL = Number.POSITIVE_INFINITY,
    logpi = 1.144729885849400174143427351353058711647

function nextUp(x){
    if(x !== x){
        return x
    }
    if(_b_.float.$funcs.isinf(x)){
        if(_b_.float.$funcs.isninf(x)){
            return -MAX_VALUE
        }
        return _mod.inf
    }

    if(x == +MAX_VALUE){
        return +1 / 0
    }
    if(typeof x == "number" || x instanceof Number){
        var y = x * (x < 0 ? 1 - EPSILON / 2 : 1 + EPSILON)
        if(y == x){
            y = MIN_VALUE * EPSILON > 0 ? x + MIN_VALUE * EPSILON : x + MIN_VALUE
        }
        if(y === +1 / 0){
            y = +MAX_VALUE
        }
        var b = x + (y - x) / 2
        if(x < b && b < y){
            y = b;
        }
        var c = (y + x) / 2
        if(x < c && c < y){
            y = c;
        }
        return y === 0 ? -0 : y
    }else{
        var factor = $B.rich_comp('__lt__', x, 0) ? 1 - EPSILON / 2 :
                                                   1 + EPSILON
        var y = $B.rich_op("__mul__", x , factor)
        if(y == x){
            y = MIN_VALUE * EPSILON > 0 ?
                    $B.rich_op('__add__', x, MIN_VALUE * EPSILON) :
                    $B.rich_op('__add__', x, MIN_VALUE)
        }
        if(y === +1 / 0){
            y = +MAX_VALUE
        }
        var y_minus_x = $B.rich_op('__sub__', y, x)
        var z = $B.rich_op('__truediv__', y_minus_x, 2) // (y - x) / 2

        var b = $B.rich_op('__add__', x, z)
        if($B.rich_comp('__lt__', x, b) && $B.rich_comp('__lt__', b, y)){
            y = b;
        }
        var c = $B.rich_op('__truediv__', $B.rich_op('__add__', y, x), 2)
        if($B.rich_comp('__lt__', x, c) && $B.rich_comp('__lt__', c, y)){
            y = c;
        }
        return y === 0 ? -0 : y
    }
}

function gcd2(a, b){
    // GCD of 2 factors
    if($B.rich_comp("__gt__", b, a)){
        var temp = a
        a = b
        b = temp
    }
    while(true){
        if(b == 0){
            return a
        }
        a = $B.rich_op("__mod__", a, b)
        if(a == 0){
            return b
        }
        b = $B.rich_op("__mod__", b, a)
    }
}

const LANCZOS_N = 13,
      lanczos_g = 6.024680040776729583740234375,
      lanczos_g_minus_half = 5.524680040776729583740234375,
      lanczos_num_coeffs = [
    23531376880.410759688572007674451636754734846804940,
    42919803642.649098768957899047001988850926355848959,
    35711959237.355668049440185451547166705960488635843,
    17921034426.037209699919755754458931112671403265390,
    6039542586.3520280050642916443072979210699388420708,
    1439720407.3117216736632230727949123939715485786772,
    248874557.86205415651146038641322942321632125127801,
    31426415.585400194380614231628318205362874684987640,
    2876370.6289353724412254090516208496135991145378768,
    186056.26539522349504029498971604569928220784236328,
    8071.6720023658162106380029022722506138218516325024,
    210.82427775157934587250973392071336271166969580291,
    2.5066282746310002701649081771338373386264310793408
    ],
    /* denominator is x*(x+1)*...*(x+LANCZOS_N-2) */
    lanczos_den_coeffs = [
    0.0, 39916800.0, 120543840.0, 150917976.0, 105258076.0, 45995730.0,
    13339535.0, 2637558.0, 357423.0, 32670.0, 1925.0, 66.0, 1.0],
    /* gamma values for small positive integers, 1 though NGAMMA_INTEGRAL */
    NGAMMA_INTEGRAL = 23,
    gamma_integral = [
    1.0, 1.0, 2.0, 6.0, 24.0, 120.0, 720.0, 5040.0, 40320.0, 362880.0,
    3628800.0, 39916800.0, 479001600.0, 6227020800.0, 87178291200.0,
    1307674368000.0, 20922789888000.0, 355687428096000.0,
    6402373705728000.0, 121645100408832000.0, 2432902008176640000.0,
    51090942171709440000.0, 1124000727777607680000.0]

/* Lanczos' sum L_g(x), for positive x */
function lanczos_sum(x){
    var num = 0.0,
        den = 0.0,
        i
    /* evaluate the rational function lanczos_sum(x).  For large
       x, the obvious algorithm risks overflow, so we instead
       rescale the denominator and numerator of the rational
       function by x**(1-LANCZOS_N) and treat this as a
       rational function in 1/x.  This also reduces the error for
       larger x values.  The choice of cutoff point (5.0 below) is
       somewhat arbitrary; in tests, smaller cutoff values than
       this resulted in lower accuracy. */
    if (x < 5.0) {
        for (i = LANCZOS_N; --i >= 0; ) {
            num = num * x + lanczos_num_coeffs[i];
            den = den * x + lanczos_den_coeffs[i];
        }
    }else{
        for (i = 0; i < LANCZOS_N; i++) {
            num = num / x + lanczos_num_coeffs[i];
            den = den / x + lanczos_den_coeffs[i];
        }
    }
    return num/den;
}

function m_sinpi(x){
    var r,
        y = fmod(fabs(x), 2.0),
        n = _b_.round(2.0 * y)

    switch(n){
        case 0:
            r = sin(pi*y);
            break;
        case 1:
            r = cos(pi*(y-0.5));
            break;
        case 2:
            /* N.B. -sin(pi*(y-1.0)) is *not* equivalent: it would give
               -0.0 instead of 0.0 when y == 1.0. */
            r = sin(pi*(1.0-y));
            break;
        case 3:
            r = -cos(pi*(y-1.5));
            break;
        case 4:
            r = sin(pi*(y-2.0));
            break;
        }
    return copysign(1.0, x) * r;
}

/*
   lgamma:  natural log of the absolute value of the Gamma function.
   For large arguments, Lanczos' formula works extremely well here.
*/
function m_lgamma(x){
    var r,
        absx

    /* special cases */
    if(! isfinite(x)){
        if(isnan(x)){
            return x;  /* lgamma(nan) = nan */
        }else{
            return Number.POSITIVE_INFINITY; /* lgamma(+-inf) = +inf */
        }
    }

    /* integer arguments */
    if(x == floor(x) && x <= 2.0){
        if(x <= 0.0){
            errno = EDOM;  /* lgamma(n) = inf, divide-by-zero for */
            return Py_HUGE_VAL; /* integers n <= 0 */
        }else{
            return 0.0; /* lgamma(1) = lgamma(2) = 0.0 */
        }
    }

    absx = fabs(x);
    /* tiny arguments: lgamma(x) ~ -log(fabs(x)) for small x */
    if (absx < 1e-20){
        return -log(absx);
    }
    /* Lanczos' formula.  We could save a fraction of a ulp in accuracy by
       having a second set of numerator coefficients for lanczos_sum that
       absorbed the exp(-lanczos_g) term, and throwing out the lanczos_g
       subtraction below; it's probably not worth it. */
    r = log(lanczos_sum(absx)) - lanczos_g;
    r += (absx - 0.5) * (log(absx + lanczos_g - 0.5) - 1);
    if (x < 0.0){
        /* Use reflection formula to get value for negative x. */
        r = logpi - log(fabs(m_sinpi(absx))) - log(absx) - r;
    }
    if (isinf(r)){
        throw _b_.ValueError.$factory("math domain error")
    }
    return r;
}

function __getattr__(attr){
    $B.check_nb_args('__getattr__ ', 1, arguments)
    $B.check_no_kw('__getattr__ ', attr)

    var res = this[attr]
    if(res === undefined){
        throw _b_.AttributeError.$factory(
            'module math has no attribute ' + attr)
    }
    return res
}

function acos(x){
    $B.check_nb_args('acos', 1, arguments)
    $B.check_no_kw('acos', x)
    if(_mod.isinf(x)){
        throw _b_.ValueError.$factory("math domain error")
    }else if(_mod.isnan(x)){
        return _mod.nan
    }else{
        x = float_check(x)
        if(x > 1 || x < -1){
            throw _b_.ValueError.$factory("math domain error")
        }
        return _b_.float.$factory(Math.acos(x))
    }
}

function acosh(x){
    $B.check_nb_args('acosh', 1, arguments)
    $B.check_no_kw('acosh', x)

    if(_b_.float.$funcs.isinf(x)){
        if(_b_.float.$funcs.isninf(x)){
            throw _b_.ValueError.$factory("math domain error")
        }
        return _mod.inf
    }else if(_mod.isnan(x)){
        return _mod.nan
    }
    var y = float_check(x)
    if(y <= 0){
        throw _b_.ValueError.$factory("math domain error")
    }
    if(y > Math.pow(2, 28)){ // issue 1590
        return _b_.float.$factory(_mod.log(y) + _mod.log(2))
    }
    return _b_.float.$factory(Math.log(y + Math.sqrt(y * y - 1)))
}

function asin(x){
    $B.check_nb_args('asin', 1, arguments)
    $B.check_no_kw('asin', x)
    if(_mod.isinf(x)){
        throw _b_.ValueError.$factory("math domain error")
    }else if(_mod.isnan(x)){
        return _mod.nan
    }else{
        x = float_check(x)
        if(x > 1 || x < -1){
            throw _b_.ValueError.$factory("math domain error")
        }
        return _b_.float.$factory(Math.asin(x))
    }
}

function asinh(x){
    $B.check_nb_args('asinh', 1, arguments)
    $B.check_no_kw('asinh', x)

    if(_b_.float.$funcs.isninf(x)){return _b_.float.$factory('-inf')}
    if(_b_.float.$funcs.isinf(x)){return _b_.float.$factory('inf')}
    var y = float_check(x)
    if(y == 0 && 1 / y === -Infinity){
        return new Number(-0.0)
    }
    return _b_.float.$factory(Math.asinh(y))
}

function atan(x){
    $B.check_nb_args('atan', 1, arguments)
    $B.check_no_kw('atan', x)

    if(_b_.float.$funcs.isninf(x)){return _b_.float.$factory(-Math.PI / 2)}
    if(_b_.float.$funcs.isinf(x)){return _b_.float.$factory(Math.PI / 2)}
    return _b_.float.$factory(Math.atan(float_check(x)))
}

function atan2(y, x){
    $B.check_nb_args('atan2', 2, arguments)
    $B.check_no_kw('atan2', y, x)

    return _b_.float.$factory(Math.atan2(float_check(y), float_check(x)))
}

function atanh(x){
    $B.check_nb_args('atanh', 1, arguments)
    $B.check_no_kw('atanh', x)
    if(_b_.float.$funcs.isinf(x)){
        throw _b_.ValueError.$factory("math domain error")
    }
    var y = float_check(x)
    if(y == 0){
        return 0
    }else if(y <= -1 || y >= 1){
        throw _b_.ValueError.$factory("math domain error")
    }
    return _b_.float.$factory(0.5 * Math.log((1 / y + 1)/(1 / y - 1)));
}

function ceil(x){
    $B.check_nb_args('ceil', 1, arguments)
    $B.check_no_kw('ceil', x)

    var res

    if(x instanceof Number){
        x = _b_.float.numerator(x)
        if(_b_.float.$funcs.isinf(x) || _mod.isnan(x)){
            return x
        }
        return _b_.int.$factory(Math.ceil(x))
    }

    var klass = x.__class__ || $B.get_class(x)

    try{
        // Use attribute of the object's class, not of the object
        // itself (special method)
        return $B.$call($B.$getattr(klass, '__ceil__'))(x)
    }catch(err){
        if(! $B.is_exc(err, [_b_.AttributeError])){
            throw err
        }
    }

    try{
        x = $B.$call($B.$getattr(klass, '__float__'))(x)
    }catch(err){
        if(! $B.is_exc(err, [_b_.AttributeError])){
            throw err
        }else{
            throw _b_.TypeError.$factory("must be real number, not " +
               $B.class_name(x))
        }
    }
    return _mod.ceil(x)
}

function comb(n, k){
    $B.check_nb_args('comb', 2, arguments)
    $B.check_no_kw('comb', n, k)

    // raise TypeError if n or k is not an integer
    check_int(n)
    check_int(k)

    if(k < 0){
        throw _b_.ValueError.$factory("k must be a non-negative integer")
    }
    if(n < 0){
        throw _b_.ValueError.$factory("n must be a non-negative integer")
    }

    if(k > n){
        return 0
    }
    // Evaluates to n! / (k! * (n - k)!)
    var fn = _mod.factorial(n),
        fk = _mod.factorial(k),
        fn_k = _mod.factorial(n - k)
    return $B.floordiv(fn, $B.mul(fk, fn_k))
}

function copysign(x, y){
    $B.check_nb_args('copysign', 2, arguments)
    $B.check_no_kw('copysign', x,y)

    var x1 = Math.abs(float_check(x))
    var y1 = float_check(y)
    var sign = Math.sign(y1)
    sign = (sign == 1 || Object.is(sign, +0)) ? 1 : - 1
    return _b_.float.$factory(x1 * sign)
}

function cos(x){
    $B.check_nb_args('cos ', 1, arguments)
    $B.check_no_kw('cos ', x)
    return _b_.float.$factory(Math.cos(float_check(x)))
}

function cosh(x){
    $B.check_nb_args('cosh', 1, arguments)
    $B.check_no_kw('cosh', x)

    if(_b_.float.$funcs.isinf(x)){return _b_.float.$factory('inf')}
    var y = float_check(x)
    if(Math.cosh !== undefined){return _b_.float.$factory(Math.cosh(y))}
    return _b_.float.$factory((Math.pow(Math.E, y) +
        Math.pow(Math.E, -y)) / 2)
}

function degrees(x){
    $B.check_nb_args('degrees', 1, arguments)
    $B.check_no_kw('degrees', x)
    return _b_.float.$factory(float_check(x) * 180 / Math.PI)
}

function dist(p, q){
    $B.check_nb_args('dist', 2, arguments)
    $B.check_no_kw('dist', p, q)

    function test(x){
        if(typeof x === "number" || x instanceof Number){
            return x
        }
        var y = $B.$getattr(x, '__float__', null)
        if(y === null){
            throw _b_.TypeError.$factory('not a float')
        }
        return $B.$call(y)()
    }

    // build list of differences (as floats) between coordinates of p and q
    var diffs = [],
        diff

    if(Array.isArray(p) && Array.isArray(q)){
        // simple case : p and q are lists of tuples
        if(p.length != q.length){
            throw _b_.ValueError.$factory("both points must have " +
                "the same number of dimensions")
        }
        for(var i = 0, len = p.length; i < len; i++){
            var next_p = test(p[i]),
                next_q = test(q[i]),
                diff = Math.abs(next_p - next_q)
            if(_b_.float.$funcs.isinf(diff)){
                return _mod.inf
            }
            diffs.push(diff)
        }
    }else{
        var itp = _b_.iter(p),
            itq = _b_.iter(q),
            res = 0

        while(true){
            try{
                var next_p = _b_.next(itp)
            }catch(err){
                if(err.__class__ === _b_.StopIteration){
                    // check that the other iterator is also exhausted
                    try{
                        var next_q = _b_.next(itq)
                        throw _b_.ValueError.$factory("both points must have " +
                            "the same number of dimensions")
                    }catch(err){
                        if(err.__class__ === _b_.StopIteration){
                            break
                        }
                        throw err
                    }
                }
                throw err
            }
            next_p = test(next_p)
            try{
                var next_q = _b_.next(itq)
            }catch(err){
                if(err.__class__ === _b_.StopIteration){
                    throw _b_.ValueError.$factory("both points must have " +
                        "the same number of dimensions")
                }
                throw err
            }
            next_q = test(next_q)
            diff = Math.abs(next_p - next_q)
            if(_b_.float.$funcs.isinf(diff)){
                return _mod.inf
            }
            diffs.push(diff)
        }
    }

    var res = 0,
        scale = 1,
        max_diff = Math.max(...diffs),
        min_diff = Math.min(...diffs)
        max_value = Math.sqrt(Number.MAX_VALUE) / p.length,
        min_value = Math.sqrt(Number.MIN_VALUE) * p.length
    if(max_diff > max_value){
        while(max_diff > max_value){
            scale *= 2
            max_diff /= 2
        }
        for(var diff of diffs){
            diff = diff / scale
            res += diff * diff
        }
        return scale * _mod.sqrt(res)
    }else if(min_diff !== 0 && min_diff < min_value){
        while(min_diff < min_value){
            scale *= 2
            min_diff *= 2
        }
        for(var diff of diffs){
            diff = diff * scale
            res += diff * diff
        }
        return _mod.sqrt(res) / scale
    }else{
        for(var diff of diffs){
            res += Math.pow(diff, 2)
        }
        return _mod.sqrt(res)
    }
}

var e = _b_.float.$factory(Math.E)

function erf(x){
    $B.check_nb_args('erf', 1, arguments)
    $B.check_no_kw('erf', x)

    // inspired from
    // http://stackoverflow.com/questions/457408/is-there-an-easily-available-implementation-of-erf-for-python
    var y = float_check(x)
    var t = 1.0 / (1.0 + 0.5 * Math.abs(y))
    var ans = 1 - t * Math.exp( -y * y - 1.26551223 +
                 t * ( 1.00002368 +
                 t * ( 0.37409196 +
                 t * ( 0.09678418 +
                 t * (-0.18628806 +
                 t * ( 0.27886807 +
                 t * (-1.13520398 +
                 t * ( 1.48851587 +
                 t * (-0.82215223 +
                 t * 0.17087277)))))))))
    if(y >= 0.0){return ans}
    return -ans
}

function erfc(x){
    $B.check_nb_args('erfc', 1, arguments)
    $B.check_no_kw('erfc', x)

    // inspired from
    // http://stackoverflow.com/questions/457408/is-there-an-easily-available-implementation-of-erf-for-python
    var y = float_check(x)
    var t = 1.0 / (1.0 + 0.5 * Math.abs(y))
    var ans = 1 - t * Math.exp( -y * y - 1.26551223 +
                 t * ( 1.00002368 +
                 t * ( 0.37409196 +
                 t * ( 0.09678418 +
                 t * (-0.18628806 +
                 t * ( 0.27886807 +
                 t * (-1.13520398 +
                 t * ( 1.48851587 +
                 t * (-0.82215223 +
                 t * 0.17087277)))))))))
    if(y >= 0.0){return 1 - ans}
    return 1 + ans
}

function exp(x){
    $B.check_nb_args('exp', 1, arguments)
    $B.check_no_kw('exp', x)

     if(_b_.float.$funcs.isninf(x)){return _b_.float.$factory(0)}
     if(_b_.float.$funcs.isinf(x)){return _b_.float.$factory('inf')}
     var _r = Math.exp(float_check(x))
     if(_b_.float.$funcs.isinf(_r)){throw _b_.OverflowError.$factory("math range error")}
     return _b_.float.$factory(_r)
}

function expm1(x){
    $B.check_nb_args('expm1', 1, arguments)
    $B.check_no_kw('expm1', x)

     if(_b_.float.$funcs.isninf(x)){return _b_.float.$factory(0)}
     if(_b_.float.$funcs.isinf(x)){return _b_.float.$factory('inf')}
     var _r = Math.expm1(float_check(x))
     if(_b_.float.$funcs.isinf(_r)){throw _b_.OverflowError.$factory("math range error")}
     return _b_.float.$factory(_r)
}

function fabs(x){
    $B.check_nb_args('fabs', 1, arguments)
    $B.check_no_kw('fabs', x)
    return _b_.float.$funcs.fabs(x) // located in py_float.js
}

function factorial(x){
    $B.check_nb_args('factorial', 1, arguments)
    $B.check_no_kw('factorial', x)

    if(x instanceof Number || _b_.isinstance(x, _b_.float)){
        throw _b_.TypeError.$factory("'float' object cannot be " +
            "interpreted as an integer")
     }

    if(! _b_.isinstance(x, [_b_.float, _b_.int])){
        throw _b_.TypeError.$factory(`'${$B.class_name(x)}' object ` +
            "cannot be interpreted as an integer")
    }

    //using code from http://stackoverflow.com/questions/3959211/fast-factorial-function-in-javascript
    if(! check_int_or_round_float(x)){
        throw _b_.ValueError.$factory("factorial() only accepts integral values")
    }else if($B.rich_comp("__lt__", x, 0)){
        throw _b_.ValueError.$factory("factorial() not defined for negative values")
    }
    var r = 1
    for(var i = 2; i <= x; i++){
        r = $B.mul(r, i)
    }
    return r
}

function floor(x){
    $B.check_nb_args('floor', 1, arguments)
    $B.check_no_kw('floor', x)
    if(typeof x == "number" ||
            x instanceof Number){
        return Math.floor(float_check(x))
    }
    try{
        return $B.$call($B.$getattr(x, "__floor__"))()
    }catch(err){
        if($B.is_exc(err, [_b_.AttributeError])){
            try{
                var f = $B.$call($B.$getattr(x, "__float__"))()
                return _mod.floor(f)
            }catch(err){
                if($B.is_exc(err, [_b_.AttributeError])){
                    throw _b_.TypeError.$factory("no __float__")
                }
                throw err
            }
        }
    }
}

function fmod(x,y){
    $B.check_nb_args('fmod', 2, arguments)
    $B.check_no_kw('fmod', x,y)
    return _b_.float.$factory(float_check(x) % float_check(y))
}

function frexp(x){
    $B.check_nb_args('frexp', 1, arguments)
    $B.check_no_kw('frexp', x)

    var _l = _b_.float.$funcs.frexp(x)
    return _b_.tuple.$factory([_b_.float.$factory(_l[0]), _l[1]])
}

function fsum(x){
    $B.check_nb_args('fsum', 1, arguments)
    $B.check_no_kw('fsum', x)

    /* Translation into Javascript of the function msum in an Active
       State Cookbook recipe : https://code.activestate.com/recipes/393090/
       by Raymond Hettinger
    */
    var partials = [],
        res = new Number(),
        _it = _b_.iter(x)
    while(true){
        try{
            var x = _b_.next(_it),
                i = 0
            for(var j = 0, len = partials.length; j < len; j++){
                var y = partials[j]
                if(Math.abs(x) < Math.abs(y)){
                    var z = x
                    x = y
                    y = z
                }
                var hi = x + y,
                    lo = y - (hi - x)
                if(lo){
                    partials[i] = lo
                    i++
                }
                x = hi
            }
            partials = partials.slice(0, i).concat([x])
        }catch(err){
            if(_b_.isinstance(err, _b_.StopIteration)){break}
            throw err
        }
    }
    var res = new Number(0)
    for(var i = 0; i < partials.length; i++){
        res += new Number(partials[i])
    }
    return new Number(res)
}

function gamma(x){
    $B.check_nb_args('gamma', 1, arguments)
    $B.check_no_kw('gamma', x)
    var r,
        y,
        z,
        sqrtpow

    /* special cases */
    if(x === Number.POSITIVE_INFINITY || isNaN(x)){
        return x
    }else if(x === Number.NEGATIVE_INFINITY || x == 0){
        throw _b_.ValueError.$factory("math domain error")
    }

    /* integer arguments */
    if(x == floor(x)){
        if($B.rich_comp('__lt__', x, 0.0)){
            throw _b_.ValueError.$factory("math domain error")
        }
        if($B.rich_comp('__le__', x, NGAMMA_INTEGRAL)){
            return new Number(gamma_integral[x - 1])
        }
    }
    var absx = fabs(x);

    /* tiny arguments:  tgamma(x) ~ 1/x for x near 0 */
    if(absx < 1e-20){
        r = 1.0 / x
        if(r === Number.POSITIVE_INFINITY){
            throw _b_.ValueError.$factory("math domain error")
        }
    }

    /* large arguments: assuming IEEE 754 doubles, tgamma(x) overflows for
       x > 200, and underflows to +-0.0 for x < -200, not a negative
       integer. */
    if(absx > 200.0){
        if(x < 0.0){
            return 0.0 / m_sinpi(x);
        }else{
            throw _b_.ValueError.$factory("math domain error")
        }
    }

    y = absx + lanczos_g_minus_half;
    /* compute error in sum */
    if (absx > lanczos_g_minus_half) {
        /* note: the correction can be foiled by an optimizing
           compiler that (incorrectly) thinks that an expression like
           a + b - a - b can be optimized to 0.0.  This shouldn't
           happen in a standards-conforming compiler. */
        var q = y - absx;
        z = q - lanczos_g_minus_half;
    }else{
        var q = y - lanczos_g_minus_half;
        z = q - absx;
    }
    z = z * lanczos_g / y;
    if (x < 0.0) {
        r = -pi / m_sinpi(absx) / absx * exp(y) / lanczos_sum(absx);
        r -= z * r;
        if(absx < 140.0){
            r /= pow(y, absx - 0.5);
        }else{
            sqrtpow = pow(y, absx / 2.0 - 0.25);
            r /= sqrtpow;
            r /= sqrtpow;
        }
    }else{
        r = lanczos_sum(absx) / exp(y);
        r += z * r;
        if(absx < 140.0){
            r *= pow(y, absx - 0.5);
        }else{
            sqrtpow = pow(y, absx / 2.0 - 0.25);
            r *= sqrtpow;
            r *= sqrtpow;
        }
    }
    if(r === Number.POSITIVE_INFINITY){
        throw _b_.ValueError.$factory("math domain error")
    }

    return r;
}


function gcd(){
    var $ = $B.args("gcd", 0, {}, [], arguments, {}, 'args', null)
    var args = $.args.map($B.PyNumber_Index)

    if(args.length == 0){
        return 0
    }else if(args.length == 1){
        return _b_.abs(args[0])
    }
    // https://stackoverflow.com/questions/17445231/js-how-to-find-the-greatest-common-divisor
    var a = _b_.abs(args[0]),
        b
    for(var i = 1, len = args.length; i < len; i++){
        a = gcd2(a, _b_.abs(args[i]))
    }
    return a
}

function hypot(x, y){
    var $ = $B.args("hypot", 0, {}, [],
                arguments, {}, "args", null)
    $.args.map(float_check)
    return _b_.float.$factory(Math.hypot(...$.args))
}

var inf = _b_.float.$factory('inf')

function isclose(){
    var $ = $B.args("isclose",
                      4,
                      {a: null, b: null, rel_tol: null, abs_tol: null},
                      ['a', 'b', 'rel_tol', 'abs_tol'],
                      arguments,
                      {rel_tol: 1e-09, abs_tol: 0.0},
                      '*',
                      null)
    var a = $.a,
        b = $.b,
        rel_tol = $.rel_tol,
        abs_tol = $.abs_tol
    if(rel_tol < 0.0 || abs_tol < 0.0){
        throw _b_.ValueError.$factory('tolerances must be non-negative')
    }

    if(a == b){
        return _b_.True
    }
    if(_b_.float.$funcs.isinf(a) || _b_.float.$funcs.isinf(b)){
        return a === b
    }
    // isclose(a, b, rel_tol, abs_tol) is the same as
    // abs_diff = abs(a - b)
    // max_ab = max(abs(a), abs(b))
    // abs_diff <= abs_tol or abs_diff / max_ab <= rel_tol
    // This is more correct than in Python docs:
    // "abs(a-b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol)"
    // because this fails for Decimal instances, which do not support
    // multiplication by floats

    var diff = $B.rich_op('__sub__', b, a),
        abs_diff = _b_.abs(diff)
    if($B.rich_comp("__le__", abs_diff, abs_tol)){
        return true
    }
    var abs_a = _b_.abs(a),
        abs_b = _b_.abs(b),
        max_ab = abs_a
    if($B.rich_comp("__gt__", abs_b, abs_a)){
        max_ab = abs_b
    }
    return $B.rich_comp("__le__",
        $B.rich_op('__truediv__', abs_diff, max_ab),
        rel_tol)
}

function isfinite(x){
    $B.check_nb_args('isfinite', 1, arguments)
    $B.check_no_kw('isfinite', x)
    return isFinite(float_check(x))
}

function isinf(x){
    $B.check_nb_args('isinf', 1, arguments)
    $B.check_no_kw('isinf', x)
    return _b_.float.$funcs.isinf(float_check(x))
}

function isnan(x){
    $B.check_nb_args('isnan', 1, arguments)
    $B.check_no_kw('isnan', x)
    return isNaN(float_check(x))
}

function isqrt(x){
    $B.check_nb_args('isqrt', 1, arguments)
    $B.check_no_kw('isqrt', x)

    x = $B.PyNumber_Index(x)
    if($B.rich_comp("__lt__", x, 0)){
        throw _b_.ValueError.$factory(
            "isqrt() argument must be nonnegative")
    }
    if(typeof x == "number"){
        return Math.floor(Math.sqrt(x))
    }else{ // big integer
        var v = parseInt(x.value),
            candidate = Math.floor(Math.sqrt(v)),
            c1
        // Use successive approximations : sqr = (sqr + (x / sqr)) / 2
        // Limit to 100 iterations
        for(var i = 0; i < 100; i++){
            c1 = $B.floordiv($B.add(candidate,
                $B.floordiv(x, candidate)), 2)
            if(c1 === candidate || c1.value === candidate.value){
                break
            }
            candidate = c1
        }
        if($B.rich_comp("__gt__", $B.mul(candidate, candidate), x)){
            // Result might be greater by 1
            candidate = $B.sub(candidate, 1)
        }
        return candidate
    }
}

function lcm(){
    var $ = $B.args("lcm", 0, {}, [], arguments, {}, 'args', null),
        product = 1

    var args = $.args.map($B.PyNumber_Index)
    if(args.length == 0){
        return 1
    }else if(args.length == 1){
        return _b_.abs(args[0])
    }
    var a = _b_.abs(args[0]),
        b,
        product, gcd
    for(var i = 0, len = args.length; i < len; i++){
        b = _b_.abs(args[i])
        if(b == 0){
            return 0
        }
        gcd = gcd2(a, b)
        product = $B.mul(a, b)
        a = $B.$getattr(product, "__floordiv__")(gcd)
    }
    return a
}

function ldexp(x, i){
    $B.check_nb_args('ldexp', 2, arguments)
    $B.check_no_kw('ldexp', x, i)
    return _b_.float.$funcs.ldexp(x, i)   //located in py_float.js
}

function lgamma(x){
    $B.check_nb_args('lgamma', 1, arguments)
    $B.check_no_kw('lgamma', x)

    return m_lgamma(x)
}

function log(x, base){
    var $ = $B.args("log", 2, {x: null, base: null}, ['x', 'base'],
        arguments, {base: _b_.None}, null, null),
        x = $.x,
        base = $.base
    if(_b_.isinstance(x, $B.long_int)){
        var log = $B.long_int.$log2(x) * Math.LN2
    }else{
        var x1 = float_check(x),
            log = Math.log(x1)
    }
    if(base === _b_.None){return log}
    return _b_.float.$factory(log / Math.log(float_check(base)))
}

function log1p(x){
    $B.check_nb_args('log1p', 1, arguments)
    $B.check_no_kw('log1p', x)
    if(_b_.isinstance(x, $B.long_int)){
        if(x.pos && $B.long_int.bit_length(x) > 1024){
            throw _b_.OverflowError.$factory(
                "int too large to convert to float")
        }
        return new Number($B.long_int.$log2($B.long_int.__add__(x, 1)) *
            Math.LN2)
    }
    return _b_.float.$factory(Math.log1p(float_check(x)))
}

function log2(x){
    $B.check_nb_args('log2', 1, arguments)
    $B.check_no_kw('log2', x)
    if(_b_.isinstance(x, $B.long_int)){
        return $B.long_int.$log2(x)
    }
    if(isNaN(x)){return _b_.float.$factory('nan')}
    if(_b_.float.$funcs.isninf(x)) {throw _b_.ValueError.$factory('')}
    var x1 = float_check(x)
    if(x1 < 0.0){throw _b_.ValueError.$factory('')}
    return _b_.float.$factory(Math.log(x1) / Math.LN2)
}

function log10(x){
    $B.check_nb_args('log10', 1, arguments)
    $B.check_no_kw('log10', x)
    if(_b_.isinstance(x, $B.long_int)){
        return $B.long_int.$log10(x)
    }
    return _b_.float.$factory(Math.log10(float_check(x)))
}

function modf(x){
    $B.check_nb_args('modf', 1, arguments)
    $B.check_no_kw('modf', x)

   if(_b_.float.$funcs.isninf(x)){
       return _b_.tuple.$factory([0.0, _b_.float.$factory('-inf')])
   }
   if(_b_.float.$funcs.isinf(x)){
       return _b_.tuple.$factory([0.0, _b_.float.$factory('inf')])
   }
   if(isNaN(x)){
       return _b_.tuple.$factory([_b_.float.$factory('nan'),
           _b_.float.$factory('nan')])
   }

   var x1 = float_check(x)
   if(x1 > 0){
      var i = _b_.float.$factory(x1 - Math.floor(x1))
      return _b_.tuple.$factory([i, _b_.float.$factory(x1 - i)])
   }

   var x2 = Math.ceil(x1)
   var i = _b_.float.$factory(x1 - x2)
   return _b_.tuple.$factory([i, _b_.float.$factory(x2)])
}

var nan = _b_.float.$factory('nan')

function nextafter(){
    var $ = $B.args("nextafter", 2, {x: null, y: null}, ['x', 'y'],
                arguments, {}, null, null),
        x = $.x,
        y = $.y
    return y < x ? -nextUp(-x) : (y > x ? nextUp(x) : (x !== x ? x : y))
}

function perm(n, k){
    var $ = $B.args("perm", 2, {n: null, k: null}, ['n', 'k'],
                    arguments, {k: _b_.None}, null, null),
        n = $.n,
        k = $.k

    if(k === _b_.None){
        check_int(n)
        return _mod.factorial(n)
    }
    // raise TypeError if n or k is not an integer
    check_int(n)
    check_int(k)

    if(k < 0){
        throw _b_.ValueError.$factory("k must be a non-negative integer")
    }
    if(n < 0){
        throw _b_.ValueError.$factory("n must be a non-negative integer")
    }

    if(k > n){
        return 0
    }
    // Evaluates to n! / (n - k)!
    var fn = _mod.factorial(n),
        fn_k = _mod.factorial(n - k)
    return $B.floordiv(fn, fn_k)
}

var pi = _b_.float.$factory(Math.PI)

function pow(){
    var $ = $B.args("pow", 2, {base: null, exp: null}, ['base', 'exp'],
                arguments, {}, null, null),
        x = $.base,
        y = $.exp

    var x1 = float_check(x)
    var y1 = float_check(y)
    if(y1 == 0){return _b_.float.$factory(1)}
    if(x1 == 0 && y1 < 0){throw _b_.ValueError.$factory('')}

    if(isNaN(y1)){
        if(x1 == 1){return _b_.float.$factory(1)}
        return _b_.float.$factory('nan')
    }
    if(x1 == 0){return _b_.float.$factory(0)}

    if(_b_.float.$funcs.isninf(y)){
        if(x1 == 1 || x1 == -1){return _b_.float.$factory(1)}
        if(x1 < 1 && x1 > -1){return _b_.float.$factory('inf')}
        return _b_.float.$factory(0)
    }
    if(_b_.float.$funcs.isinf(y)){
        if(x1 == 1 || x1 == -1){return _b_.float.$factory(1)}
        if(x1 < 1 && x1 > -1){return _b_.float.$factory(0)}
        return _b_.float.$factory('inf')
    }

    if(isNaN(x1)){return _b_.float.$factory('nan')}
    if(_b_.float.$funcs.isninf(x)){
        if(y1 > 0 && isOdd(y1)){return _b_.float.$factory('-inf')}
        if(y1 > 0){return _b_.float.$factory('inf')}  // this is even or a float
        if(y1 < 0){return _b_.float.$factory(0)}
        return _b_.float.$factory(1)
    }

    if(_b_.float.$funcs.isinf(x)){
        if(y1 > 0){return _b_.float.$factory('inf')}
        if(y1 < 0){return _b_.float.$factory(0)}
        return _b_.float.$factory(1)
    }

    var r = Math.pow(x1, y1)
    if(isNaN(r)){return _b_.float.$factory('nan')}
    if(_b_.float.$funcs.isninf(r)){return _b_.float.$factory('-inf')}
    if(_b_.float.$funcs.isinf(r)){return _b_.float.$factory('inf')}

    return _b_.float.$factory(r)
}

function prod(){
    var $ = $B.args("prod", 1, {iterable:null, start:null},
                    ["iterable", "start"], arguments, {start: 1}, "*",
                    null),
        iterable = $.iterable,
        start = $.start
    var res = start,
        it = _b_.iter(iterable),
        x
    while(true){
        try{
            x = _b_.next(it)
            if(x == 0){
                return 0
            }
            res = $B.mul(res, x)
        }catch(err){
            if(err.__class__ === _b_.StopIteration){
                return res
            }
            throw err
        }
    }
}

function radians(x){
    $B.check_nb_args('radians', 1, arguments)
    $B.check_no_kw('radians', x)

    return _b_.float.$factory(float_check(x) * Math.PI / 180)
}

function remainder(x, y){
    $B.check_nb_args('remainder', 2, arguments)
    $B.check_no_kw('remainder', x, y)
    if(_mod.isnan(x) || _mod.isnan(y)){
        return _mod.nan
    }
    if(_b_.float.$funcs.isinf(x) || y == 0){
        throw _b_.ValueError.$factory("math domain error")
    }
    x = float_check(x)
    y = float_check(y)
    var quotient = x / y,
        rounded = _b_.round(quotient)
    if(rounded == 0){
        return _b_.float.$factory(x)
    }
    var res = _b_.float.$factory(x - rounded * y)
    if(_b_.float.$funcs.isinf(res)){
        // happens if rounded * y is infinite
        res = _b_.float.$factory(rounded * (x / rounded - y))
    }
    return res
}

function sin(x){
    $B.check_nb_args('sin ', 1, arguments)
    $B.check_no_kw('sin ', x)
    return _b_.float.$factory(Math.sin(float_check(x)))
}

function sinh(x) {
    $B.check_nb_args('sinh', 1, arguments)
    $B.check_no_kw('sinh', x)

    var y = float_check(x)
    if(Math.sinh !== undefined){return _b_.float.$factory(Math.sinh(y))}
    return _b_.float.$factory(
        (Math.pow(Math.E, y) - Math.pow(Math.E, -y)) / 2)
}

function sqrt(x){
    $B.check_nb_args('sqrt ', 1, arguments)
    $B.check_no_kw('sqrt ', x)

  var y = float_check(x)
  if(y < 0){throw _b_.ValueError.$factory("math range error")}
  if(_b_.float.$funcs.isinf(y)){return _b_.float.$factory('inf')}
  var _r = Math.sqrt(y)
  if(_b_.float.$funcs.isinf(_r)){throw _b_.OverflowError.$factory("math range error")}
  return _b_.float.$factory(_r)
}

function tan(x) {
    $B.check_nb_args('tan', 1, arguments)
    $B.check_no_kw('tan', x)

    var y = float_check(x)
    return _b_.float.$factory(Math.tan(y))
}

function tanh(x) {
    $B.check_nb_args('tanh', 1, arguments)
    $B.check_no_kw('tanh', x)

    var y = float_check(x)
    if(Math.tanh !== undefined){return _b_.float.$factory(Math.tanh(y))}
    return _b_.float.$factory((Math.pow(Math.E, y) - Math.pow(Math.E, -y))/
         (Math.pow(Math.E, y) + Math.pow(Math.E, -y)))
}

var tau = 6.283185307179586

function trunc(x) {
    $B.check_nb_args('trunc', 1, arguments)
    $B.check_no_kw('trunc', x)

   try{return $B.$getattr(x, '__trunc__')()}catch(err){}
   var x1 = float_check(x)
   if(!isNaN(parseFloat(x1)) && isFinite(x1)){
      if(Math.trunc !== undefined){return _b_.int.$factory(Math.trunc(x1))}
      if(x1 > 0){return _b_.int.$factory(Math.floor(x1))}
      return _b_.int.$factory(Math.ceil(x1))  // x1 < 0
   }
   throw _b_.ValueError.$factory(
       'object is not a number and does not contain __trunc__')
}

function ulp(){
    var $ = $B.args("ulp", 1, {x: null}, ['x'], arguments, {}, null, null),
        x = $.x
    if(x == MAX_VALUE){
        return MAX_VALUE - _mod.nextafter(MAX_VALUE, 0)
    }else if(_b_.float.$funcs.isinf(x)){
        return _mod.inf
    }
    if(typeof x == "number" || x instanceof Number){
        return x > 0 ? nextUp(x) - x : x - (-nextUp(-x))
    }else{
        if($B.rich_comp('__gt__', x, 0)){
            return $B.rich_op('__sub__', nextUp(x), x)
        }else{
            var neg_x = $B.$call($B.$getattr(x, "__neg__"))()
            return $B.rich_op('__sub__', x,
                $B.$call($B.$getattr(nextUp(neg_x), '__neg__'))())
        }
    }
}

var _mod = {
    __getattr__,
    acos,
    acosh,
    asin,
    asinh,
    atan,
    atan2,
    atanh,
    ceil,
    comb,
    copysign,
    cos,
    cosh,
    degrees,
    dist,
    e,
    erf,
    erfc,
    exp,
    expm1,
    fabs,
    factorial,
    floor,
    fmod,
    frexp,
    fsum,
    gamma,
    gcd,
    hypot,
    inf,
    isclose,
    isfinite,
    isinf,
    isnan,
    isqrt,
    lcm,
    ldexp,
    lgamma,
    log,
    log1p,
    log2,
    log10,
    modf,
    nan,
    nextafter,
    perm,
    pi,
    pow,
    prod,
    radians,
    remainder,
    sin,
    sinh,
    sqrt,
    tan,
    tanh,
    tau,
    trunc,
    ulp
}

for(var $attr in _mod){
    if(typeof _mod[$attr] === 'function'){
        _mod[$attr].__class__ = $B.builtin_function
    }
}

return _mod

})(__BRYTHON__)
