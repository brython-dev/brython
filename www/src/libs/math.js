var $module = (function($B){

var _b_ = $B.builtins

const INF = $B.fast_float(Number.POSITIVE_INFINITY),
      NINF = $B.fast_float(Number.NEGATIVE_INFINITY),
      ZERO = $B.fast_float(0),
      NAN = $B.fast_float(Number.NaN)

var float_check = function(x) {
    // Returns a Javascript number
    if(x.__class__ === $B.long_int){
        var res = parseInt(x.value)
        if(! isFinite(res)){
            throw _b_.OverflowError.$factory('int too big for float')
        }
        return res
    }else if(x.__class__ === _b_.float){
        return x.value
    }
    return _b_.float.$factory(x).value
}

function check_int(x){
    if(! _b_.isinstance(x, _b_.int)){
        throw _b_.TypeError.$factory("'" + $B.class_name(x) +
            "' object cannot be interpreted as an integer")
    }
}

function check_int_or_round_float(x){
    return (_b_.isinstance(x, _b_.float) && Number.isInteger(x.value)) ||
            _b_.isinstance(x, _b_.int)
}

var isWholeNumber = function(x){return (x * 10) % 10 == 0}

var isOdd = function(x) {return isWholeNumber(x) && 2 * Math.floor(x / 2) != x}

var isNegZero = function(x) {return x === 0 && Math.atan2(x,x) < 0}

function overflow(){
    throw _b_.OverflowError.$factory("math range error")
}

function value_error(){
    throw _b_.ValueError.$factory("math range error")
}

var EPSILON = Math.pow(2, -52),
    MAX_VALUE = (2 - EPSILON) * Math.pow(2, 1023),
    MIN_VALUE = Math.pow(2, -1022),
    Py_HUGE_VAL = Number.POSITIVE_INFINITY,
    logpi = 1.144729885849400174143427351353058711647,
    sqrtpi = 1.772453850905516027298167483341145182798

function nextUp(x){
    if(x !== x){ // NaN
        return x
    }
    if(_b_.float.$funcs.isinf(x)){
        if(_b_.float.$funcs.isninf(x)){
            return -MAX_VALUE
        }
        return _mod.inf
    }
    if(_b_.isinstance(x, $B.long_int)){
        x = Number(x.value)
    }

    if(x == +MAX_VALUE){
        return +1 / 0
    }
    if(typeof x == "number"){
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
    // x is float
    // returns a float
    var r,
        y = fmod(fabs(x), 2.0), // float
        n = _b_.round($B.fast_float(2.0 * y.value)) // int
    switch(n){
        case 0:
            r = sin(pi.value * y.value);
            break;
        case 1:
            r = cos(pi.value * (y.value - 0.5));
            break;
        case 2:
            /* N.B. -sin(pi*(y-1.0)) is *not* equivalent: it would give
               -0.0 instead of 0.0 when y == 1.0. */
            r = sin(pi.value * (1.0 - y.value));
            break;
        case 3:
            r = _b_.float.__neg__(cos(pi.value *(y.value - 1.5)))
            break;
        case 4:
            r = sin(pi.value * (y.value - 2.0));
            break;
        }
    return $B.fast_float(copysign(1.0, x).value * r.value);
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
            return $B.fast_float(Number.POSITIVE_INFINITY); /* lgamma(+-inf) = +inf */
        }
    }

    /* integer arguments */
    var x1 = float_check(x)
    if(Number.isInteger(x1) && x1 <= 2.0){
        if(x1 <= 0.0){
            value_error()
        }else{
            return $B.fast_float(0.0); /* lgamma(1) = lgamma(2) = 0.0 */
        }
    }

    absx = fabs(x)
    /* tiny arguments: lgamma(x) ~ -log(fabs(x)) for small x */
    if (absx.value < 1e-20){
        return  $B.fast_float(-log(absx).value);
    }
    /* Lanczos' formula.  We could save a fraction of a ulp in accuracy by
       having a second set of numerator coefficients for lanczos_sum that
       absorbed the exp(-lanczos_g) term, and throwing out the lanczos_g
       subtraction below; it's probably not worth it. */
    var lsum = $B.fast_float(lanczos_sum(absx.value))
    r = log(lsum).value - lanczos_g;
    r += (absx.value - 0.5) *
        (log($B.fast_float(absx.value + lanczos_g - 0.5)).value - 1)
    if (x1 < 0.0){
        /* Use reflection formula to get value for negative x. */
        r = logpi - log(fabs(m_sinpi(absx))).value - log(absx).value - r
    }
    r = $B.fast_float(r)
    if(isinf(r)){
        overflow()
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
        return _b_.float.$factory(_mod.log(y).value + _mod.log(2).value)
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

    var y = float_check(x)
    if(_b_.float.$funcs.isninf(x)){
        return NINF
    }else if(_b_.float.$funcs.isinf(x)){
        return INF
    }
    if(y == 0 && 1 / y === -Infinity){
        return $B.fast_float(-0.0)
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

function atan2(x, y){
    $B.check_nb_args('atan2', 2, arguments)
    $B.check_no_kw('atan2', x, y)

    return _b_.float.$factory(Math.atan2(float_check(x), float_check(y)))
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

function cbrt(x){
    // Cubic root
    $B.check_nb_args('cbrt ', 1, arguments)
    $B.check_no_kw('cbrt ', x)

    var y = float_check(x)
    if(_b_.float.$funcs.isninf(x)){
        return NINF
    }else if(_b_.float.$funcs.isinf(x)){
        return INF
    }
    var _r = $B.fast_float(Math.cbrt(y))
    if(_b_.float.$funcs.isinf(_r)){
        throw _b_.OverflowError.$factory("math range error")
    }
    return _r
}

function ceil(x){
    $B.check_nb_args('ceil', 1, arguments)
    $B.check_no_kw('ceil', x)

    var res

    if(_b_.isinstance(x, _b_.float)){
        if(_b_.float.$funcs.isinf(x)){
            throw _b_.OverflowError.$factory(
                "cannot convert float infinity to integer")
        }else if(_mod.isnan(x)){
            throw _b_.OverflowError.$factory(
                "cannot convert float NaN to integer")
        }
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

const ULLONG_MAX = 2n ** 64n - 1n,
      LONG_MAX = 2147483647,
      LONG_MIN = -2147483647,
      LLONG_MAX = 9223372036854775807n,
      LLONG_MIN = -9223372036854775807n,
      p2_64 = 2n ** 64n

const reduced_factorial_odd_part = [
    0x0000000000000001n, 0x0000000000000001n, 0x0000000000000001n, 0x0000000000000003n,
    0x0000000000000003n, 0x000000000000000fn, 0x000000000000002dn, 0x000000000000013bn,
    0x000000000000013bn, 0x0000000000000b13n, 0x000000000000375fn, 0x0000000000026115n,
    0x000000000007233fn, 0x00000000005cca33n, 0x0000000002898765n, 0x00000000260eeeebn,
    0x00000000260eeeebn, 0x0000000286fddd9bn, 0x00000016beecca73n, 0x000001b02b930689n,
    0x00000870d9df20adn, 0x0000b141df4dae31n, 0x00079dd498567c1bn, 0x00af2e19afc5266dn,
    0x020d8a4d0f4f7347n, 0x335281867ec241efn, 0x9b3093d46fdd5923n, 0x5e1f9767cc5866b1n,
    0x92dd23d6966aced7n, 0xa30d0f4f0a196e5bn, 0x8dc3e5a1977d7755n, 0x2ab8ce915831734bn,
    0x2ab8ce915831734bn, 0x81d2a0bc5e5fdcabn, 0x9efcac82445da75bn, 0xbc8b95cf58cde171n,
    0xa0e8444a1f3cecf9n, 0x4191deb683ce3ffdn, 0xddd3878bc84ebfc7n, 0xcb39a64b83ff3751n,
    0xf8203f7993fc1495n, 0xbd2a2a78b35f4bddn, 0x84757be6b6d13921n, 0x3fbbcfc0b524988bn,
    0xbd11ed47c8928df9n, 0x3c26b59e41c2f4c5n, 0x677a5137e883fdb3n, 0xff74e943b03b93ddn,
    0xfe5ebbcb10b2bb97n, 0xb021f1de3235e7e7n, 0x33509eb2e743a58fn, 0x390f9da41279fb7dn,
    0xe5cb0154f031c559n, 0x93074695ba4ddb6dn, 0x81c471caa636247fn, 0xe1347289b5a1d749n,
    0x286f21c3f76ce2ffn, 0x00be84a2173e8ac7n, 0x1595065ca215b88bn, 0xf95877595b018809n,
    0x9c2efe3c5516f887n, 0x373294604679382bn, 0xaf1ff7a888adcd35n, 0x18ddf279a2c5800bn,
    0x18ddf279a2c5800bn, 0x505a90e2542582cbn, 0x5bacad2cd8d5dc2bn, 0xfe3152bcbff89f41n,
    0xe1467e88bf829351n, 0xb8001adb9e31b4d5n, 0x2803ac06a0cbb91fn, 0x1904b5d698805799n,
    0xe12a648b5c831461n, 0x3516abbd6160cfa9n, 0xac46d25f12fe036dn, 0x78bfa1da906b00efn,
    0xf6390338b7f111bdn, 0x0f25f80f538255d9n, 0x4ec8ca55b8db140fn, 0x4ff670740b9b30a1n,
    0x8fd032443a07f325n, 0x80dfe7965c83eeb5n, 0xa3dc1714d1213afdn, 0x205b7bbfcdc62007n,
    0xa78126bbe140a093n, 0x9de1dc61ca7550cfn, 0x84f0046d01b492c5n, 0x2d91810b945de0f3n,
    0xf5408b7f6008aa71n, 0x43707f4863034149n, 0xdac65fb9679279d5n, 0xc48406e7d1114eb7n,
    0xa7dc9ed3c88e1271n, 0xfb25b2efdb9cb30dn, 0x1bebda0951c4df63n, 0x5c85e975580ee5bdn,
    0x1591bc60082cb137n, 0x2c38606318ef25d7n, 0x76ca72f7c5c63e27n, 0xf04a75d17baa0915n,
    0x77458175139ae30dn, 0x0e6c1330bc1b9421n, 0xdf87d2b5797e8293n, 0xefa5c703e1e68925n,
    0x2b6b1b3278b4f6e1n, 0xceee27b382394249n, 0xd74e3829f5dab91dn, 0xfdb17989c26b5f1fn,
    0xc1b7d18781530845n, 0x7b4436b2105a8561n, 0x7ba7c0418372a7d7n, 0x9dbc5c67feb6c639n,
    0x502686d7f6ff6b8fn, 0x6101855406be7a1fn, 0x9956afb5806930e7n, 0xe1f0ee88af40f7c5n,
    0x984b057bda5c1151n, 0x9a49819acc13ea05n, 0x8ef0dead0896ef27n, 0x71f7826efe292b21n,
    0xad80a480e46986efn, 0x01cdc0ebf5e0c6f7n, 0x6e06f839968f68dbn, 0xdd5943ab56e76139n,
    0xcdcf31bf8604c5e7n, 0x7e2b4a847054a1cbn, 0x0ca75697a4d3d0f5n, 0x4703f53ac514a98bn,
];

const inverted_factorial_odd_part = [
    0x0000000000000001n, 0x0000000000000001n, 0x0000000000000001n, 0xaaaaaaaaaaaaaaabn,
    0xaaaaaaaaaaaaaaabn, 0xeeeeeeeeeeeeeeefn, 0x4fa4fa4fa4fa4fa5n, 0x2ff2ff2ff2ff2ff3n,
    0x2ff2ff2ff2ff2ff3n, 0x938cc70553e3771bn, 0xb71c27cddd93e49fn, 0xb38e3229fcdee63dn,
    0xe684bb63544a4cbfn, 0xc2f684917ca340fbn, 0xf747c9cba417526dn, 0xbb26eb51d7bd49c3n,
    0xbb26eb51d7bd49c3n, 0xb0a7efb985294093n, 0xbe4b8c69f259eabbn, 0x6854d17ed6dc4fb9n,
    0xe1aa904c915f4325n, 0x3b8206df131cead1n, 0x79c6009fea76fe13n, 0xd8c5d381633cd365n,
    0x4841f12b21144677n, 0x4a91ff68200b0d0fn, 0x8f9513a58c4f9e8bn, 0x2b3e690621a42251n,
    0x4f520f00e03c04e7n, 0x2edf84ee600211d3n, 0xadcaa2764aaacdfdn, 0x161f4f9033f4fe63n,
    0x161f4f9033f4fe63n, 0xbada2932ea4d3e03n, 0xcec189f3efaa30d3n, 0xf7475bb68330bf91n,
    0x37eb7bf7d5b01549n, 0x46b35660a4e91555n, 0xa567c12d81f151f7n, 0x4c724007bb2071b1n,
    0x0f4a0cce58a016bdn, 0xfa21068e66106475n, 0x244ab72b5a318ae1n, 0x366ce67e080d0f23n,
    0xd666fdae5dd2a449n, 0xd740ddd0acc06a0dn, 0xb050bbbb28e6f97bn, 0x70b003fe890a5c75n,
    0xd03aabff83037427n, 0x13ec4ca72c783bd7n, 0x90282c06afdbd96fn, 0x4414ddb9db4a95d5n,
    0xa2c68735ae6832e9n, 0xbf72d71455676665n, 0xa8469fab6b759b7fn, 0xc1e55b56e606caf9n,
    0x40455630fc4a1cffn, 0x0120a7b0046d16f7n, 0xa7c3553b08faef23n, 0x9f0bfd1b08d48639n,
    0xa433ffce9a304d37n, 0xa22ad1d53915c683n, 0xcb6cbc723ba5dd1dn, 0x547fb1b8ab9d0ba3n,
    0x547fb1b8ab9d0ba3n, 0x8f15a826498852e3n, 0x32e1a03f38880283n, 0x3de4cce63283f0c1n,
    0x5dfe6667e4da95b1n, 0xfda6eeeef479e47dn, 0xf14de991cc7882dfn, 0xe68db79247630ca9n,
    0xa7d6db8207ee8fa1n, 0x255e1f0fcf034499n, 0xc9a8990e43dd7e65n, 0x3279b6f289702e0fn,
    0xe7b5905d9b71b195n, 0x03025ba41ff0da69n, 0xb7df3d6d3be55aefn, 0xf89b212ebff2b361n,
    0xfe856d095996f0adn, 0xd6e533e9fdf20f9dn, 0xf8c0e84a63da3255n, 0xa677876cd91b4db7n,
    0x07ed4f97780d7d9bn, 0x90a8705f258db62fn, 0xa41bbb2be31b1c0dn, 0x6ec28690b038383bn,
    0xdb860c3bb2edd691n, 0x0838286838a980f9n, 0x558417a74b36f77dn, 0x71779afc3646ef07n,
    0x743cda377ccb6e91n, 0x7fdf9f3fe89153c5n, 0xdc97d25df49b9a4bn, 0x76321a778eb37d95n,
    0x7cbb5e27da3bd487n, 0x9cff4ade1a009de7n, 0x70eb166d05c15197n, 0xdcf0460b71d5fe3dn,
    0x5ac1ee5260b6a3c5n, 0xc922dedfdd78efe1n, 0xe5d381dc3b8eeb9bn, 0xd57e5347bafc6aadn,
    0x86939040983acd21n, 0x395b9d69740a4ff9n, 0x1467299c8e43d135n, 0x5fe440fcad975cdfn,
    0xcaa9a39794a6ca8dn, 0xf61dbd640868dea1n, 0xac09d98d74843be7n, 0x2b103b9e1a6b4809n,
    0x2ab92d16960f536fn, 0x6653323d5e3681dfn, 0xefd48c1c0624e2d7n, 0xa496fefe04816f0dn,
    0x1754a7b07bbdd7b1n, 0x23353c829a3852cdn, 0xbf831261abd59097n, 0x57a8e656df0618e1n,
    0x16e9206c3100680fn, 0xadad4c6ee921dac7n, 0x635f2b3860265353n, 0xdd6d0059f44b3d09n,
    0xac4dd6b894447dd7n, 0x42ea183eeaa87be3n, 0x15612d1550ee5b5dn, 0x226fa19d656cb623n,
]

const factorial_trailing_zeros = [
     0,  0,  1,  1,  3,  3,  4,  4,  7,  7,  8,  8, 10, 10, 11, 11,  //  0-15
    15, 15, 16, 16, 18, 18, 19, 19, 22, 22, 23, 23, 25, 25, 26, 26,  // 16-31
    31, 31, 32, 32, 34, 34, 35, 35, 38, 38, 39, 39, 41, 41, 42, 42,  // 32-47
    46, 46, 47, 47, 49, 49, 50, 50, 53, 53, 54, 54, 56, 56, 57, 57,  // 48-63
    63, 63, 64, 64, 66, 66, 67, 67, 70, 70, 71, 71, 73, 73, 74, 74,  // 64-79
    78, 78, 79, 79, 81, 81, 82, 82, 85, 85, 86, 86, 88, 88, 89, 89,  // 80-95
    94, 94, 95, 95, 97, 97, 98, 98, 101, 101, 102, 102, 104, 104, 105, 105,  // 96-111
    109, 109, 110, 110, 112, 112, 113, 113, 116, 116, 117, 117, 119, 119, 120, 120,  // 112-127
].map(BigInt)

const NULL = undefined

/* Calculate C(n, k) for n in the 63-bit range. */

function perm_comb_small(n, k, iscomb){
    if(k == 0){
        return 1n
    }

    /* For small enough n and k the result fits in the 64-bit range and can
     * be calculated without allocating intermediate PyLong objects. */
    if(iscomb){
        /* Maps k to the maximal n so that 2*k-1 <= n <= 127 and C(n, k)
         * fits into a uint64_t.  Exclude k = 1, because the second fast
         * path is faster for this case.*/
        var fast_comb_limits1 = [
            0, 0, 127, 127, 127, 127, 127, 127,  // 0-7
            127, 127, 127, 127, 127, 127, 127, 127,  // 8-15
            116, 105, 97, 91, 86, 82, 78, 76,  // 16-23
            74, 72, 71, 70, 69, 68, 68, 67,  // 24-31
            67, 67, 67  // 32-34
        ];
        if(k < fast_comb_limits1.length && n <= fast_comb_limits1[k]){
            /*
                comb(n, k) fits into a uint64_t. We compute it as
                    comb_odd_part << shift
                where 2**shift is the largest power of two dividing comb(n, k)
                and comb_odd_part is comb(n, k) >> shift. comb_odd_part can be
                calculated efficiently via arithmetic modulo 2**64, using three
                lookups and two uint64_t multiplications.
            */
            var comb_odd_part = reduced_factorial_odd_part[n]
                                   * inverted_factorial_odd_part[k]
                                   * inverted_factorial_odd_part[n - k];
            comb_odd_part %= p2_64
            var shift = factorial_trailing_zeros[n]
                      - factorial_trailing_zeros[k]
                      - factorial_trailing_zeros[n - k];
            return comb_odd_part << shift;
        }

        /* Maps k to the maximal n so that 2*k-1 <= n <= 127 and C(n, k)*k
         * fits into a long long (which is at least 64 bit).  Only contains
         * items larger than in fast_comb_limits1. */
        var fast_comb_limits2 = [
            0, ULLONG_MAX, 4294967296, 3329022, 102570, 13467, 3612, 1449,  // 0-7
            746, 453, 308, 227, 178, 147  // 8-13
        ];
        if (k < fast_comb_limits2.length && n <= fast_comb_limits2[k]) {
            /* C(n, k) = C(n, k-1) * (n-k+1) / k */
            var result = n,
                i = 1n;
            while(i < k){
                result *= --n;
                result /= ++i;
            }
            return result;
        }
    }else{
        /* Maps k to the maximal n so that k <= n and P(n, k)
         * fits into a long long (which is at least 64 bit). */
        var fast_perm_limits = [
            0, ULLONG_MAX, 4294967296, 2642246, 65537, 7133, 1627, 568,  // 0-7
            259, 142, 88, 61, 45, 36, 30, 26,  // 8-15
            24, 22, 21, 20, 20  // 16-20
        ];
        if (k < fast_perm_limits.length && n <= fast_perm_limits[k]) {
            if(n <= 127){
                /* P(n, k) fits into a uint64_t. */
                var perm_odd_part = reduced_factorial_odd_part[n]
                                       * inverted_factorial_odd_part[n - k];
                perm_odd_part %= p2_64
                var shift = factorial_trailing_zeros[n]
                          - factorial_trailing_zeros[n - k];
                var res = perm_odd_part << shift

                return res;
            }

            /* P(n, k) = P(n, k-1) * (n-k+1) */
            var result = n;
            for (var i = 1; i < k; i++) {
                result *= --n;
            }
            return result
        }
    }

    /* For larger n use recursive formulas:
     *
     *   P(n, k) = P(n, j) * P(n-j, k-j)
     *   C(n, k) = C(n, j) * C(n-j, k-j) // C(k, j)
     */
    var j = k / 2n;
    var a = perm_comb_small(n, j, iscomb);
    var b = perm_comb_small(n - j, k - j, iscomb);
    a = a * b;
    if(iscomb){
        b = perm_comb_small(k, j, 1);
        a = a / b;
    }
    return a;
}

/* Calculate P(n, k) or C(n, k) using recursive formulas.
 * It is more efficient than sequential multiplication thanks to
 * Karatsuba multiplication.
 */
function perm_comb(n, k, iscomb){
    if(k == 0){
        return 1;
    }
    if(k == 1){
        return n;
    }

    /* P(n, k) = P(n, j) * P(n-j, k-j) */
    /* C(n, k) = C(n, j) * C(n-j, k-j) // C(k, j) */
    var j = k / 2n
    var a = perm_comb(n, j, iscomb);
    //var t = j
    //n = n - t;
    var b = perm_comb(n - j, k - j, iscomb);
    a = a * b;
    if(iscomb){
        b = perm_comb_small(k, j, 1);
        a = a / b;
    }
    return a;
}

function comb(n, k){
    var $ = $B.args('comb', 2, {n: null, k: null}, ['n', 'k'],
            arguments, {}, null, null),
        n = $.n,
        k = $.k

    var result = NULL,
        temp,
        overflow, cmp;

    // accept integers or objects with __index__
    n = $B.PyNumber_Index(n)
    k = $B.PyNumber_Index(k)

    n = _b_.int.$to_bigint(n);
    k = _b_.int.$to_bigint(k);

    if(n < 0){
        throw _b_.ValueError.$factory(
                        "n must be a non-negative integer");
    }
    if(k < 0){
        throw _b_.ValueError.$factory(
                        "k must be a non-negative integer");
    }

    overflow = n > LLONG_MAX || n < LLONG_MIN
    if(! overflow){
        overflow = k > LLONG_MAX || k < LLONG_MIN
        if (overflow || k > n) {
            result = 0n;
        }else{
            if(n - k < k){
                k = n - k
            }
            if (k > 1) {
                result = perm_comb_small(n, k, 1);
            }
        }
        /* For k == 1 just return the original n in perm_comb(). */
    }else{
        /* k = min(k, n - k) */
        temp = n - k
        if(temp < 0) {
            result = 0n;
        }
        if (temp < k) {
            k = temp
        }

        overflow = k > LLONG_MAX || k < LLONG_MIN
        if (overflow) {
            throw _b_.OverflowError.$factory(
                         "min(n - k, k) must not exceed " +
                         LLONG_MAX);
        }
    }
    if(result === undefined){
        result = perm_comb(n, k, 1);
    }

    return _b_.int.$int_or_long(result)
}


function copysign(x, y){
    $B.check_nb_args_no_kw('copysign', 2, arguments)

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

    if(_b_.float.$funcs.isinf(x)){return INF}
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
    $B.check_nb_args_no_kw('dist', 2, arguments)

    function test(x){
        if(typeof x === "number"){
            return x
        }else if(x.__class__ === _b_.float){
            return x.value
        }
        var y = $B.$getattr(x, '__float__', null)
        if(y === null){
            throw _b_.TypeError.$factory('not a float')
        }
        return $B.$call(y)().value
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
        p = p.map(test)
        q = q.map(test)
        for(var i = 0, len = p.length; i < len; i++){
            var next_p = p[i],
                next_q = q[i]
            var diff = Math.abs(next_p - next_q)
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
            diffs.push(diff)
        }
    }
    for(var diff of diffs){
        if(! isFinite(diff) && ! isNaN(diff)){
            return _mod.inf
        }
    }
    for(var diff of diffs){
        if(isNaN(diff)){
            return _mod.nan
        }
    }

    var res = 0,
        scale = 1,
        max_diff = Math.max(...diffs),
        min_diff = Math.min(...diffs)
        max_value = Math.sqrt(Number.MAX_VALUE) / p.length,
        min_value = Math.sqrt(Number.MIN_VALUE) * p.length
    if(max_diff > max_value){
        var nb = 0
        while(max_diff > max_value){
            scale *= 2
            max_diff /= 2
            nb++
        }
        for(var diff of diffs){
            diff = diff / scale
            res += diff * diff
        }
        return $B.fast_float(scale * Math.sqrt(res))
    }else if(min_diff !== 0 && min_diff < min_value){
        while(min_diff < min_value){
            scale *= 2
            min_diff *= 2
        }
        for(var diff of diffs){
            diff = diff * scale
            res += diff * diff
        }
        return $B.fast_float(Math.sqrt(res) / scale)
    }else{
        for(var diff of diffs){
            res += Math.pow(diff, 2)
        }
        return $B.fast_float(Math.sqrt(res))
    }
}

const e = _b_.float.$factory(Math.E)

const ERF_SERIES_CUTOFF = 1.5,
      ERF_SERIES_TERMS = 25,
      ERFC_CONTFRAC_CUTOFF = 30.0,
      ERFC_CONTFRAC_TERMS = 50

/*
   Error function, via power series.
   Given a finite float x, return an approximation to erf(x).
   Converges reasonably fast for small x.
*/

function m_erf_series(x){
    var x2, acc, fk, result
    var i

    x2 = x * x
    acc = 0.0
    fk = ERF_SERIES_TERMS + 0.5
    for(i = 0; i < ERF_SERIES_TERMS; i++){
        acc = 2.0 + x2 * acc / fk
        fk -= 1.0
    }
    result = acc * x * exp(-x2).value / sqrtpi
    return result
}

function m_erfc_contfrac(x){
    var x2, a, da, p, p_last, q, q_last, b, result;
    var i

    if(x >= ERFC_CONTFRAC_CUTOFF){
        return 0.0
    }

    x2 = x * x
    a = 0.0
    da = 0.5
    p = 1.0
    p_last = 0.0
    q = da + x2
    q_last = 1.0
    for(i = 0; i < ERFC_CONTFRAC_TERMS; i++){
        var temp
        a += da
        da += 2.0
        b = da + x2
        temp = p; p = b * p - a * p_last; p_last = temp
        temp = q; q = b * q - a * q_last; q_last = temp
    }
    result = p / q * x * exp(-x2).value / sqrtpi
    return result
}


function erf(x){
    var absx,
        cf
    var x1 = float_check(x)
    if(isNaN(x1)){
        return x
    }
    absx = fabs(x)
    if(absx.value < ERF_SERIES_CUTOFF){
        return $B.fast_float(m_erf_series(x1))
    }else{
        cf = m_erfc_contfrac(absx.value)
        return $B.fast_float(x1 > 0.0 ? 1.0 - cf : cf - 1.0)
    }
}

function erfc(x){

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

function erfc(x){
    $B.check_nb_args_no_kw('erfc', 1, arguments)
    var absx, cf;

    var x1 = float_check(x)
    if(isNaN(x1)){
        return x
    }
    absx = fabs(x);
    if(absx.value < ERF_SERIES_CUTOFF){
        return $B.fast_float(1.0 - m_erf_series(x1))
    }else{
        cf = m_erfc_contfrac(absx.value)
        return $B.fast_float(x1 > 0.0 ? cf : 2.0 - cf)
    }
}

function exp(x){
    $B.check_nb_args('exp', 1, arguments)
    $B.check_no_kw('exp', x)

     if(_b_.float.$funcs.isninf(x)){
         return _b_.float.$factory(0)
     }
     if(_b_.float.$funcs.isinf(x)){
         return INF
     }
     var _r = Math.exp(float_check(x))
     if(! isNaN(_r) && ! isFinite(_r)){
         throw _b_.OverflowError.$factory("math range error")
     }
     return _b_.float.$factory(_r)
}

function exp2(x){
    return pow(2, x)
}

function expm1(x){
    $B.check_nb_args('expm1', 1, arguments)
    $B.check_no_kw('expm1', x)

     if(_b_.float.$funcs.isninf(x)){
         return $B.fast_float(-1)
     }else if(_b_.float.$funcs.isinf(x)){
         return INF
     }
     var _r = Math.expm1(float_check(x))
     if((! isNaN(_r)) && ! isFinite(_r)){
         overflow()
     }
     return $B.fast_float(_r)
}

function fabs(x){
    $B.check_nb_args_no_kw('fabs', 1, arguments)
    return _b_.float.$funcs.fabs(float_check(x)) // located in py_float.js
}

// factorial implementation, adapted from CPython's mathmodule.c

const SmallFactorials = [
    1n, 1n, 2n, 6n, 24n, 120n, 720n, 5040n, 40320n,
    362880n, 3628800n, 39916800n, 479001600n,
    6227020800n, 87178291200n, 1307674368000n,
    20922789888000n, 355687428096000n, 6402373705728000n,
    121645100408832000n, 2432902008176640000n
    ]

const SIZEOF_LONG = 4

function _Py_bit_length(x){
    const BIT_LENGTH_TABLE = [
        0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
    ]
    var msb = 0;
    while(x >= 32n){
        msb += 6;
        x >>= 6n;
    }
    msb += BIT_LENGTH_TABLE[parseInt(x)];
    return msb
}
function count_set_bits(n){
    var count = 0n;
    while(n != 0){
        ++count;
        n &= n - 1n; /* clear least significant bit */
    }
    return count;
}

function factorial_partial_product(start, stop, max_bits){
    var midpoint,
        num_operands,
        left,
        right,
        result

    /* If the return value will fit an unsigned long, then we can
     * multiply in a tight, fast loop where each multiply is O(1).
     * Compute an upper bound on the number of bits required to store
     * the answer.
     *
     * Storing some integer z requires floor(lg(z))+1 bits, which is
     * conveniently the value returned by bit_length(z).  The
     * product x*y will require at most
     * bit_length(x) + bit_length(y) bits to store, based
     * on the idea that lg product = lg x + lg y.
     *
     * We know that stop - 2 is the largest number to be multiplied.  From
     * there, we have: bit_length(answer) <= num_operands *
     * bit_length(stop - 2)
     */

    num_operands = (stop - start) / 2n;
    max_bits = BigInt(max_bits)
    /* The "num_operands <= 8 * SIZEOF_LONG" check guards against the
     * unlikely case of an overflow in num_operands * max_bits. */
    if(num_operands <= 8 * SIZEOF_LONG &&
        num_operands * max_bits <= 8 * SIZEOF_LONG) {
        var j,
            total;
        for (total = start, j = start + 2n; j < stop; j += 2n){
            total *= j;
        }
        return total
    }

    /* find midpoint of range(start, stop), rounded up to next odd number. */
    midpoint = (start + num_operands) | 1n;
    left = factorial_partial_product(start, midpoint,
                                     _Py_bit_length(midpoint - 2n));
    right = factorial_partial_product(midpoint, stop, max_bits);
    result = left * right
    return result;
}


function factorial_odd_part(n){
    var i,
        v, lower, upper,
        partial, tmp, inner, outer;

    inner = 1n
    outer = inner;
    upper = 3n;
    for (i = BigInt(_Py_bit_length(n)) - 2n; i >= 0; i--) {
        v = n >> i;
        if (v <= 2){
            continue
        }
        lower = upper;
        /* (v + 1) | 1 = least odd integer strictly larger than n / 2**i */
        upper = (v + 1n) | 1n;
        /* Here inner is the product of all odd integers j in the range (0,
           n/2**(i+1)].  The factorial_partial_product call below gives the
           product of all odd integers j in the range (n/2**(i+1), n/2**i]. */
        partial = factorial_partial_product(lower, upper,
                                            _Py_bit_length(upper-2n));
        /* inner *= partial */
        tmp = inner * partial
        inner = tmp;
        /* Now inner is the product of all odd integers j in the range (0,
           n/2**i], giving the inner product in the formula above. */

        /* outer *= inner; */
        tmp = outer * inner
        outer = tmp;
    }
    return outer;
}

function factorial(arg){
    var x,
        two_valuation,
        overflow,
        result,
        odd_part;
    // Check that arg can be converted to an integer, and transform it to
    // a bigint
    x = _b_.int.$to_bigint($B.PyNumber_Index(arg))
    overflow = x > LONG_MAX || x < LONG_MIN
    if(x > LONG_MAX) {
        throw _b_.OverflowError.$factory(
                     "factorial() argument should not exceed " +
                     LONG_MAX)
    }else if(x < 0) {
        throw _b_.ValueError.$factory(
                        "factorial() not defined for negative values");
    }

    /* use lookup table if x is small */
    if (x < SmallFactorials.length){
        return _b_.int.$int_or_long(SmallFactorials[x]);
    }
    /* else express in the form odd_part * 2**two_valuation, and compute as
       odd_part << two_valuation. */
    odd_part = factorial_odd_part(x);
    two_valuation = x - count_set_bits(x);
    return _b_.int.$int_or_long(odd_part << two_valuation);
}

function floor(x){
    $B.check_nb_args_no_kw('floor', 1, arguments)

    if(typeof x == "number" || x.__class__ === _b_.float){
        return Math.floor(float_check(x))
    }
    var klass = $B.get_class(x)
    try{
        return $B.$call($B.$getattr(klass, "__floor__"))(x)
    }catch(err){
        if($B.is_exc(err, [_b_.AttributeError])){
            try{
                var float = $B.$call($B.$getattr(klass, "__float__"))(x)
                return floor(float)
            }catch(err){
                if($B.is_exc(err, [_b_.AttributeError])){
                    throw _b_.TypeError.$factory("no __float__")
                }
                throw err
            }
        }
    }
}

function fmod(x, y){
    $B.check_nb_args_no_kw('fmod', 2, arguments)
    if(_b_.isinstance(x, _b_.float)){
        if(_b_.float.$funcs.isinf(x)){
            throw _b_.ValueError.$factory('math domain error')
        }
    }
    y = float_check(y)
    if(y == 0){
        throw _b_.ValueError.$factory('math domain error')
    }
    return _b_.float.$factory(float_check(x) % float_check(y))
}

function frexp(x){
    $B.check_nb_args_no_kw('frexp', 1, arguments)

    var _l = _b_.float.$funcs.frexp(x)
    return _b_.tuple.$factory([_b_.float.$factory(_l[0]), _l[1]])
}

function fsum(x){
    $B.check_nb_args_no_kw('fsum', 1, arguments)

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
            x = float_check(x)
            for(var j = 0, len = partials.length; j < len; j++){
                var y = float_check(partials[j])
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
    var res = 0
    for(var i = 0; i < partials.length; i++){
        res += partials[i]
    }
    return $B.fast_float(res)
}

function gamma(x){
    $B.check_nb_args('gamma', 1, arguments)
    $B.check_no_kw('gamma', x)
    var x_as_number = x,
        r,
        y,
        z,
        sqrtpow

    /* special cases */
    if(_b_.isinstance(x, _b_.float)){
        x_as_number = x.value
    }else if(! _b_.isinstance(x, _b_.int)){
        throw _b_.TypeError.$factory("must be real number, not " +
            $B.class_name(x))
    }
    if(x_as_number === Number.POSITIVE_INFINITY || isNaN(x_as_number)){
        return x
    }else if(x_as_number === Number.NEGATIVE_INFINITY || x_as_number == 0){
        throw _b_.ValueError.$factory("math domain error")
    }

    /* integer arguments */
    if(Number.isInteger(x_as_number)){
        if($B.rich_comp('__lt__', x, 0.0)){
            throw _b_.ValueError.$factory("math domain error")
        }
        if($B.rich_comp('__le__', x, NGAMMA_INTEGRAL)){
            return $B.fast_float(gamma_integral[x_as_number - 1])
        }
    }
    var absx = fabs(x)

    /* tiny arguments:  tgamma(x) ~ 1/x for x near 0 */
    if(absx.value < 1e-20){
        r = 1.0 / x_as_number
        if(r === Infinity || r === -Infinity){
            overflow()
        }
        return $B.fast_float(r)
    }

    /* large arguments: assuming IEEE 754 doubles, tgamma(x) overflows for
       x > 200, and underflows to +-0.0 for x < -200, not a negative
       integer. */
    if(absx.value > 200.0){
        if(x_as_number < 0.0){
            return $B.fast_float(0.0 / m_sinpi(x).value);
        }else{
            overflow()
        }
    }

    y = absx.value + lanczos_g_minus_half;
    /* compute error in sum */
    if (absx.value > lanczos_g_minus_half) {
        /* note: the correction can be foiled by an optimizing
           compiler that (incorrectly) thinks that an expression like
           a + b - a - b can be optimized to 0.0.  This shouldn't
           happen in a standards-conforming compiler. */
        var q = y - absx.value;
        z = q - lanczos_g_minus_half;
    }else{
        var q = y - lanczos_g_minus_half;
        z = q - absx.value;
    }
    z = z * lanczos_g / y;
    if (x_as_number < 0.0) {
        r = -pi.value / m_sinpi(absx).value /
                absx.value * _mod.exp(y).value /
                lanczos_sum(absx.value);
        r -= z * r;
        if(absx.value < 140.0){
            r /= pow(y, absx.value - 0.5).value;
        }else{
            sqrtpow = pow(y, absx.value / 2.0 - 0.25);
            r /= sqrtpow.value;
            r /= sqrtpow.value;
        }
    }else{
        r = lanczos_sum(absx.value) / exp(y).value;
        r += z * r;
        if(absx.value < 140.0){
            r *= pow(y, absx.value - 0.5).value;
        }else{
            sqrtpow = pow(y, absx.value / 2.0 - 0.25);
            r *= sqrtpow.value;
            r *= sqrtpow.value;
        }
    }
    if(r === Number.POSITIVE_INFINITY){
        overflow()
    }
    return $B.fast_float(r);
}


// GCD algorithm. Javascript adaptation of Python script at
// https://gist.github.com/cmpute/baa545f0c2b6be8b628e9ded3c19f6c1
// by Jacob Zhong
function bit_length(x){
    return x.toString(2).length
}

$B.nb_simple_gcd = 0

function simple_gcd(a, b){
    /* a fits into a long, so b must too */
    $B.nb_simple_gcd++
    var x = a >= 0 ? a : -a,
        y = b >= 0 ? b : -b

    /* usual Euclidean algorithm for longs */
    while (y != 0) {
        t = y;
        y = x % y;
        x = t;
    }
    return x
}

function lgcd(x, y){
    var a, b, c, d
    if(x < y){
        return lgcd(y, x)
    }
    var shift = BigInt(Math.max(Math.floor(bit_length(x) / 64),
                    Math.floor(bit_length(y) / 64))),
        xbar = x >> (shift * 64n),
        ybar = y >> (shift * 64n)
    while(y > p2_64){
        [a, b, c, d] = [1n, 0n, 0n, 1n]
        while(ybar + c != 0 && ybar + d != 0){
            q = (xbar + a) / (ybar + c)
            p = (xbar + b) / (ybar + d)
            if(q != p){
                break
            }
            [a, c] = [c, a - q * c]
            [b, d] = [d, b - q * d]
            [xbar, ybar] = [ybar, xbar - q * ybar]
        }
        if(b == 0){
            [x, y] = [y, x % y]
        }else{
            [x, y] = [a * x + b * y, c * x + d * y]
        }
    }
    return simple_gcd(x, y)
}

function xgcd(x, y){
    var xneg = x < 0 ? -1n : 1n,
        yneg = y < 0 ? -1n : 1n,
        last_r,
        last_s,
        last_t,
        q, r, s, t;

    [x, y] = [x >= 0 ? x : -x, y >= 0 ? y : -y];

    // it's maintained that r = s * x + t * y, last_r = last_s * x + last_t * y
    [last_r, r] = [x, y];
    [last_s, s] = [1n, 0n];
    [last_t, t] = [0n, 1n];

    while(r > 0){
        q = last_r / r;
        [last_r, r] = [r, last_r - q * r];
        [last_s, s] = [s, last_s - q * s];
        [last_t, t] = [t, last_t - q * t];
    }
    return [last_r, last_s * xneg, last_t * yneg]
}

function lxgcd(x, y){
    var g, cy, cx,
        s, last_s,
        t, last_t,
        a, b, c, d
    x = x >= 0 ? x : -x
    y = y >= 0 ? y : -y

    if(x < y){
        [g, cy, cx] = xgcd(y, x)
        return [g, cx, cy]
    }

    var shift = BigInt(Math.max(Math.floor(bit_length(x) / 64),
                Math.floor(bit_length(y) / 64))),
        xbar = x >> (shift * 64n),
        ybar = y >> (shift * 64n);

    [last_s, s] = [1n, 0n];
    [last_t, t] = [0n, 1n];

    while(y > p2_64){
        [a, b, c, d] = [1n, 0n, 0n, 1n]
        while(ybar + c != 0 && ybar + d != 0){
            q = (xbar + a) / (ybar + c)
            p = (xbar + b) / (ybar + d)
            if(q != p){
                break
            };
            [a, c = c], [a - q * c];
            [b, d = d], [b - q * d];
            [xbar, ybar] = [ybar, xbar - q * ybar];
        }
        if(b == 0){
            q = x / y;
            [x, y] = [y, x % y];
            [last_s, s] = [s, last_s - q * s];
            [last_t, t] = [t, last_t - q * t];
        }else{
            [x, y] = [a * x + b * y, c * x + d * y];
            [last_s, s] = [a * last_s + b * s, c * last_s + d * s];
            [last_t, t] = [a * last_t + b * t, c * last_t + d * t];
        }
    }
    // notice that here x, y could be negative
    [g, cx, cy] = xgcd(x, y)

    return [g, cx * last_s + cy * s, cx * last_t + cy * t]
}

function gcd(x, y){
    var $ = $B.args("gcd", 0, {}, [], arguments, {}, 'args', null)
    var args = $.args.map($B.PyNumber_Index)
    if(args.length == 0){
        return 0
    }else if(args.length == 1){
        return _b_.abs(args[0])
    }
    x = _b_.int.$to_bigint(args[0])
    y = _b_.int.$to_bigint(args[1])
    var res = lxgcd(x, y)[0],
        i = 2
    while(i < args.length){
        res = lxgcd(res, _b_.int.$to_bigint(args[i]))[0]
        i++
    }
    return _b_.int.$int_or_long(res)
}


function hypot(x, y){
    var $ = $B.args("hypot", 0, {}, [],
                arguments, {}, "args", null)
    var args = []
    for(var arg of $.args){
        try{
            args.push(float_check(arg))
        }catch(err){
            if($B.is_exc(err, [_b_.ValueError])){
                throw _b_.TypeError.$factory('must be real number, not ' +
                    $B.class_name(arg))
            }
            throw err
        }
    }
    return $B.fast_float(Math.hypot(...args))
}

var inf = INF

function isclose(){
    var $ = $B.args("isclose",
                      4,
                      {a: null, b: null, rel_tol: null, abs_tol: null},
                      ['a', 'b', 'rel_tol', 'abs_tol'],
                      arguments,
                      {rel_tol: $B.fast_float(1e-09),
                       abs_tol: $B.fast_float(0.0)},
                      '*',
                      null)
    var a = float_check($.a),
        b = float_check($.b),
        rel_tol = float_check($.rel_tol),
        abs_tol = float_check($.abs_tol)

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

    var diff = b - a,
        abs_diff = Math.abs(diff)
    if(abs_diff <= abs_tol){
        return true
    }
    var abs_a = Math.abs(a),
        abs_b = Math.abs(b),
        max_ab = Math.max(abs_a, abs_b)
    return abs_diff / max_ab <= rel_tol
}

function isfinite(x){
    $B.check_nb_args('isfinite', 1, arguments)
    $B.check_no_kw('isfinite', x)
    return isFinite(float_check(x))
}

function isinf(x){
    $B.check_nb_args('isinf', 1, arguments)
    $B.check_no_kw('isinf', x)
    return _b_.float.$funcs.isinf(x)
}

function isnan(x){
    $B.check_nb_args('isnan', 1, arguments)
    $B.check_no_kw('isnan', x)
    return isNaN(float_check(x))
}

function isqrt(x){
    $B.check_nb_args_no_kw('isqrt', 1, arguments)

    x = $B.PyNumber_Index(x)
    if($B.rich_comp("__lt__", x, 0)){
        throw _b_.ValueError.$factory(
            "isqrt() argument must be nonnegative")
    }
    if(typeof x == "number"){
        return Math.floor(Math.sqrt(x))
    }else{ // big integer
        // adapted from code in mathmodule.c
        var n = x.value,
            bit_length = n.toString(2).length,
            c = BigInt(Math.floor((bit_length - 1) / 2)),
            c_bit_length = c.toString(2).length,
            a = 1n,
            d = 0n,
            e

        for(var s = BigInt(c_bit_length - 1); s >= 0; s--){
            // Loop invariant: (a-1)**2 < (n >> 2*(c - d)) < (a+1)**2
            e = d
            d = c >> s
            a = (a << d - e - 1n) + (n >> 2n*c - e - d + 1n) / a
        }
        return _b_.int.$int_or_long(a - (a * a > n ? 1n : 0n))
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
    return _b_.float.$funcs.ldexp(x, i)   // in py_float.js
}

function lgamma(x){
    $B.check_nb_args('lgamma', 1, arguments)
    $B.check_no_kw('lgamma', x)

    return m_lgamma(x)
}

function longint_mant_exp(long_int){
    // Returns mantissa and exponent of a long integer
    var value = long_int.value,
        exp = value.toString(2).length,
        exp1 = exp,
        nb = 0n
    // 2 ** exp is infinite if n > 1023
    var nb = Math.floor(exp / 1023),
        exp1 = BigInt(exp - 1023 * nb)
    nb = BigInt(nb)
    var reduced_value = long_int.value / 2n ** (nb * 1023n)
    var mant = Number(reduced_value) / Number(2n ** exp1)
    return [mant, exp]
}

var log10_func = Math.log10 || (x => Math.log(x) / Math.log(10)),
    log2_func = Math.log2 || (x => Math.log(x) / Math.log(2))

function log(x, base){
    var $ = $B.args("log", 2, {x: null, base: null}, ['x', 'base'],
        arguments, {base: _b_.None}, null, null),
        x = $.x,
        base = $.base
    if(base == 10){
        return log10(x)
    }else if(base == 2){
        return log2(x)
    }
    var log
    if(_b_.isinstance(x, $B.long_int)){
        if(x.value <= 0){
            throw _b_.ValueError.$factory('math domain error')
        }
        var mant_exp = longint_mant_exp(x)
        log = Math.log(mant_exp[0]) + Math.log(2) * mant_exp[1]
    }else if(_b_.isinstance(x, _b_.int)){
        x = _b_.int.$int_value(x)
        if(x <= 0){
            throw _b_.ValueError.$factory('math domain error')
        }
        log = Math.log(x)
    }else{
        var x1 = float_check(x)
        if(x1 <= 0){
            throw _b_.ValueError.$factory('math domain error')
        }
        log = Math.log(x1)
    }
    if(x1 <= 0){
        throw _b_.ValueError.$factory("math domain error")
    }
    if(base === _b_.None){
        return $B.fast_float(log)
    }
    return $B.fast_float(log / Math.log(float_check(base)))
}

function log1p(x){
    $B.check_nb_args('log1p', 1, arguments)
    $B.check_no_kw('log1p', x)
    if(_b_.isinstance(x, $B.long_int)){
        if($B.long_int.bit_length(x) > 1024){
            throw _b_.OverflowError.$factory(
                "int too large to convert to float")
        }
        x = $B.long_int.$log2($B.fast_long_int(x.value + 1n))
        return $B.fast_float(Number(x.value) * Math.LN2)
    }
    x = float_check(x)
    if(x + 1 <= 0){
        throw _b_.ValueError.$factory("math domain error")
    }
    return $B.fast_float(Math.log1p(x))
}

function log2(x){
    $B.check_nb_args('log2', 1, arguments)
    $B.check_no_kw('log2', x)
    var log2_func = Math.log2 || (x => Math.log(x) / Math.LN2)
    if(_b_.isinstance(x, $B.long_int)){
        if(x.value <= 0){
            throw _b_.ValueError.$factory('math domain error')
        }
        var mant_exp = longint_mant_exp(x)
        return $B.fast_float(log2_func(mant_exp[0]) + mant_exp[1])
    }
    if(_b_.float.$funcs.isninf(x)){
        throw _b_.ValueError.$factory('')
    }
    x = float_check(x)
    if(x == 0){
        throw _b_.ValueError.$factory("math domain error")
    }
    if(isNaN(x)){
        return _b_.float.$factory('nan')
    }
    if(x < 0.0){
        throw _b_.ValueError.$factory('')
    }
    return $B.fast_float(log2_func(x))
}

function log10(x){
    $B.check_nb_args('log10', 1, arguments)
    $B.check_no_kw('log10', x)
    if(_b_.isinstance(x, $B.long_int)){
        return $B.fast_float($B.long_int.$log10(x).value)
    }
    x = float_check(x)
    if(x <= 0){
        throw _b_.ValueError.$factory("math domain error")
    }
    return $B.fast_float(Math.log10(x))
}

function modf(x){
    $B.check_nb_args('modf', 1, arguments)
    $B.check_no_kw('modf', x)

    if(_b_.float.$funcs.isninf(x)){
        return _b_.tuple.$factory([0.0, NINF])
    }
    if(_b_.float.$funcs.isinf(x)){
        return _b_.tuple.$factory([0.0, INF])
    }
    var x1 = float_check(x)

    if(isNaN(x1)){
        return _b_.tuple.$factory([_b_.float.$factory('nan'),
            _b_.float.$factory('nan')])
    }

    if(x1 > 0){
       var i = _b_.float.$factory(x1 - Math.floor(x1))
       return _b_.tuple.$factory([i, _b_.float.$factory(x1 - i.value)])
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
    n = $B.PyNumber_Index(n)
    k = $B.PyNumber_Index(k)

    // transform to Javascript BigInt
    var n1 = _b_.int.$to_bigint(n),
        k1 = _b_.int.$to_bigint(k);

    if(k1 < 0){
        throw _b_.ValueError.$factory("k must be a non-negative integer")
    }
    if(n1 < 0){
        throw _b_.ValueError.$factory("n must be a non-negative integer")
    }
    if(k1 == 0){
        return 1
    }
    if(k1 == 1){
        return n
    }
    if(k1 == 2){
        return _b_.int.$int_or_long(n1 * (n1 - 1n))
    }
    if(k1 > n1){
        return 0
    }
    // Evaluates to n! / (n - k)!
    var fn = _mod.factorial(n),
        fn_k = _mod.factorial(n - k)
    return $B.rich_op('__floordiv__', fn, fn_k)
}

const pi = $B.fast_float(Math.PI)

function pow(){
    var $ = $B.args("pow", 2, {base: null, exp: null}, ['base', 'exp'],
                arguments, {}, null, null),
        x = $.base,
        y = $.exp

    var x1 = float_check(x)
    var y1 = float_check(y)

    if(y1 == 0){
        return _b_.float.$factory(1)
    }
    if(x1 == 0 && y1 < 0){
        if(y1 === -Infinity){
            return INF
        }
        throw _b_.ValueError.$factory('math domain error')
    }
    if(isFinite(x1) && x1 < 0 && isFinite(y1) && ! Number.isInteger(y1)){
        throw _b_.ValueError.$factory('math domain error')
    }

    if(isNaN(y1)){
        if(x1 == 1){return _b_.float.$factory(1)}
        return NAN
    }
    if(x1 == 0){
        return ZERO
    }

    if(_b_.float.$funcs.isninf(y)){
        if(_b_.float.$funcs.isinf(x)){ // pow(INF, NINF) = 0.0
            return ZERO
        }else if(_b_.float.$funcs.isninf(x)){ // pow(NINF, NINF) = 0.0
            return ZERO
        }
        if(x1 == 1 || x1 == -1){return _b_.float.$factory(1)}
        if(x1 < 1 && x1 > -1){return INF}
        return ZERO
    }
    if(_b_.float.$funcs.isinf(y)){
        if(_b_.float.$funcs.isinf(x)){ // pow(INF, INF)
            return INF
        }
        if(_b_.float.$funcs.isninf(x)){
            return INF
        }
        if(x1 == 1 || x1 == -1){return _b_.float.$factory(1)}
        if(x1 < 1 && x1 > -1){return ZERO}
        return INF
    }

    if(isNaN(x1)){return _b_.float.$factory('nan')}
    if(_b_.float.$funcs.isninf(x)){
        if(y1 > 0 && isOdd(y1)){return NINF}
        if(y1 > 0){return INF}  // this is even or a float
        if(y1 < 0){return ZERO}
        if(_b_.float.$float.isinf(y)){return INF}
        return _b_.float.$factory(1)
    }

    if(_b_.float.$funcs.isinf(x)){
        if(y1 > 0){return INF}
        if(y1 < 0){return ZERO}
        return _b_.float.$factory(1)
    }

    var r = Math.pow(x1, y1)
    if(isNaN(r)){
        return NAN
    }
    if(! isFinite(r)){
        overflow()
    }
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

function is_finite(x){
    return typeof x == "number" ||
               (x.__class__ === _b_.floar && isFinite(x.value)) ||
               _b_.isinstance(x, _b_.int) ||
               (_b_.isinstance(x, _b_.float) && isFinite(x.value))
}

function remainder(x, y){
    $B.check_nb_args_no_kw('remainder', 2, arguments)
    float_check(x) // might raise TypeError
    /* Deal with most common case first. */
    if(is_finite(x) && is_finite(y)){
        var absx,
            absy,
            c,
            m,
            r;

        if(float_check(y) == 0.0){
            throw _b_.ValueError.$factory("math domain error")
        }

        absx = fabs(x);
        absy = fabs(y);
        m = fmod(absx, absy);

        c = absy.value - m.value
        if(m.value < c){
            r = m.value
        }else if(m.value > c){
            r = -c
        }else{
            r = m.value -
                    2.0 * fmod($B.fast_float(0.5 * (absx.value - m.value)), absy).value;
        }
        return $B.fast_float(copysign(1.0, x).value * r);
    }

    /* Special values. */
    if(float_check(y) == 0){
        if(isnan(x)){
            return x
        }
    }
    if(isinf(x)){
        if(isnan(y)){
            return y
        }
        throw _b_.ValueError.$factory("math domain error")
    }
    if(isnan(y)){
        return y;
    }
    return x;
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
    if(Math.sinh !== undefined){
        return _b_.float.$factory(Math.sinh(y))
    }
    return _b_.float.$factory(
        (Math.pow(Math.E, y) - Math.pow(Math.E, -y)) / 2)
}

function sqrt(x){
    $B.check_nb_args('sqrt ', 1, arguments)
    $B.check_no_kw('sqrt ', x)

    if(_b_.float.$funcs.isninf(x)){
        value_error()
    }else if(_b_.float.$funcs.isinf(x)){
        return INF
    }
    var y = float_check(x)
    if(y < 0){
        value_error()
    }
    var _r = $B.fast_float(Math.sqrt(y))
    if(_b_.float.$funcs.isinf(_r)){
        overflow()
    }
    return _r
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

const tau = $B.fast_float(2 * Math.PI)

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
    if(_b_.isinstance(x, _b_.float)){
        if(_b_.float.$funcs.isinf(x)){
            return _mod.inf
        }else if(_b_.float.$funcs.isnan(x)){
            return _mod.nan
        }
    }
    if(typeof x == "number"){
        return x >= 0 ? $B.fast_float(nextUp(x) - x) :
                       $B.fast_float(x - (-nextUp(-x)))
    }else if(_b_.isinstance(x, $B.long_int)){
        x = Number(_b_.int.$to_bigint(x))
        return x > 0 ? $B.fast_float(nextUp(x) - x) :
                       $B.fast_float(x - (-nextUp(-x)))
    }else{
        if($B.rich_comp('__ge__', x, 0)){
            return $B.rich_op('__sub__', $B.fast_float(nextUp(x.value)), x)
        }else{
            var neg_x = $B.$call($B.$getattr(x, "__neg__"))()
            return $B.rich_op('__sub__', x,
                $B.$call($B.$getattr($B.fast_float(nextUp(neg_x.value)), '__neg__'))())
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
    cbrt,
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
    exp2,
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
        _mod[$attr].__class__ = $B.builtin_function_or_method
    }
}

return _mod

})(__BRYTHON__)
