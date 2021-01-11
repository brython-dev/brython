var $module = (function($B){

var _b_ = $B.builtins,
    $s = [],
    i
for(var $b in _b_){$s.push('var ' + $b +' = _b_["'+$b+'"]')}
eval($s.join(';'))

//for(var $py_builtin in _b_){eval("var "+$py_builtin+"=_b_[$py_builtin]")}

var float_check = function(x) {
    if(x.__class__ === $B.long_int){
        return parseInt(x.value)
    }
    return _b_.float.$factory(x)
}

function check_int(x){
    if(! _b_.isinstance(x, int)){
        throw _b_.TypeError.$factory("'" + $B.class_name(x) +
            "' object cannot be interpreted as an integer")
    }
}

function check_int_or_round_float(x){
    return (x instanceof Number && x == Math.floor(x)) ||
            _b_.isinstance(x, int)
}

var isWholeNumber = function(x){return (x * 10) % 10 == 0}

var isOdd = function(x) {return isWholeNumber(x) && 2 * Math.floor(x / 2) != x}

var isNegZero = function(x) {return x === 0 && Math.atan2(x,x) < 0}

var EPSILON = Math.pow(2, -52),
    MAX_VALUE = (2 - EPSILON) * Math.pow(2, 1023);
    MIN_VALUE = Math.pow(2, -1022);

function nextUp(x){
    if(x !== x){
        return x
    }
    if(_b_.$isinf(x)){
        if(_b_.$isninf(x)){
            return -MAX_VALUE
        }
        return _mod.inf
    }
    /*
    if(x == -1 / 0){
        return -MAX_VALUE
    }
    if(x == +1 / 0){
        return +1 / 0
    }
    */
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
        var y = $B.rich_op("mul", x , factor)
        if(y == x){
            y = MIN_VALUE * EPSILON > 0 ?
                    $B.rich_op('add', x, MIN_VALUE * EPSILON) :
                    $B.rich_op('add', x, MIN_VALUE)
        }
        if(y === +1 / 0){
            y = +MAX_VALUE
        }
        var y_minus_x = $B.rich_op('sub', y, x)
        var z = $B.rich_op('truediv', y_minus_x, 2) // (y - x) / 2

        var b = $B.rich_op('add', x, z)
        if($B.rich_comp('__lt__', x, b) && $B.rich_comp('__lt__', b, y)){
            y = b;
        }
        var c = $B.rich_op('truediv', $B.rich_op('add', y, x), 2)
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
        a = $B.rich_op("mod", a, b)
        if(a == 0){
            return b
        }
        b = $B.rich_op("mod", b, a)
    }
}

var _mod = {
    __getattr__: function(attr){
        $B.check_nb_args('__getattr__ ', 1, arguments)
        $B.check_no_kw('__getattr__ ', attr)

        var res = this[attr]
        if(res === undefined){
            throw _b_.AttributeError.$factory(
                'module math has no attribute ' + attr)
        }
        return res
    },
    acos: function(x){
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
            return float.$factory(Math.acos(x))
        }
    },
    acosh: function(x){
        $B.check_nb_args('acosh', 1, arguments)
        $B.check_no_kw('acosh', x)

        if(_b_.$isinf(x)){
            if(_b_.$isninf(x)){
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
        return float.$factory(Math.log(y + Math.sqrt(y * y - 1)))
    },
    asin: function(x){
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
            return float.$factory(Math.asin(x))
        }
    },
    asinh: function(x){
        $B.check_nb_args('asinh', 1, arguments)
        $B.check_no_kw('asinh', x)

        if(_b_.$isninf(x)){return float.$factory('-inf')}
        if(_b_.$isinf(x)){return float.$factory('inf')}
        var y = float_check(x)
        if(y == 0 && 1 / y === -Infinity){
            return new Number(-0.0)
        }
        return float.$factory(Math.asinh(y))
    },
    atan: function(x){
        $B.check_nb_args('atan', 1, arguments)
        $B.check_no_kw('atan', x)

        if(_b_.$isninf(x)){return float.$factory(-Math.PI / 2)}
        if(_b_.$isinf(x)){return float.$factory(Math.PI / 2)}
        return float.$factory(Math.atan(float_check(x)))
    },
    atan2: function(y, x){
        $B.check_nb_args('atan2', 2, arguments)
        $B.check_no_kw('atan2', y, x)

        return float.$factory(Math.atan2(float_check(y), float_check(x)))
    },
    atanh: function(x){
        $B.check_nb_args('atanh', 1, arguments)
        $B.check_no_kw('atanh', x)
        if(_b_.$isinf(x)){
            throw _b_.ValueError.$factory("math domain error")
        }
        var y = float_check(x)
        if(y == 0){
            return 0
        }else if(y <= -1 || y >= 1){
            throw _b_.ValueError.$factory("math domain error")
        }
        return float.$factory(0.5 * Math.log((1 / y + 1)/(1 / y - 1)));
    },
    ceil: function(x){
        $B.check_nb_args('ceil', 1, arguments)
        $B.check_no_kw('ceil', x)

        var res

        if(x instanceof Number){
            x = _b_.float.numerator(x)
            if(_b_.$isinf(x) || _mod.isnan(x)){
                return x
            }
            return _b_.int.$factory(Math.ceil(x))
        }

        try{
            // Use attribute of the object's class, not of the object
            // itself (special method)
            return $B.$call($B.$getattr(x.__class__, '__ceil__'))(x)
        }catch(err){
            if(! $B.is_exc(err, [_b_.AttributeError])){
                throw err
            }
        }

        try{
            x = $B.$call($B.$getattr(x.__class__, '__float__'))(x)
        }catch(err){
            if(! $B.is_exc(err, [_b_.AttributeError])){
                throw err
            }else{
                throw _b_.TypeError.$factory("must be real number, not " +
                   $B.class_name(x))
            }
        }
        return _mod.ceil(x)
    },
    comb: function(n, k){
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
    },
    copysign: function(x, y){
        $B.check_nb_args('copysign', 2, arguments)
        $B.check_no_kw('copysign', x,y)

        var x1 = Math.abs(float_check(x))
        var y1 = float_check(y)
        var sign = Math.sign(y1)
        sign = (sign == 1 || Object.is(sign, +0)) ? 1 : - 1
        return float.$factory(x1 * sign)
    },
    cos : function(x){
        $B.check_nb_args('cos ', 1, arguments)
        $B.check_no_kw('cos ', x)
        return float.$factory(Math.cos(float_check(x)))
    },
    cosh: function(x){
        $B.check_nb_args('cosh', 1, arguments)
        $B.check_no_kw('cosh', x)

        if(_b_.$isinf(x)) {return float.$factory('inf')}
        var y = float_check(x)
        if(Math.cosh !== undefined){return float.$factory(Math.cosh(y))}
        return float.$factory((Math.pow(Math.E, y) +
            Math.pow(Math.E, -y)) / 2)
    },
    degrees: function(x){
        $B.check_nb_args('degrees', 1, arguments)
        $B.check_no_kw('degrees', x)
        return float.$factory(float_check(x) * 180 / Math.PI)
    },
    dist: function(p, q){
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
                if(_b_.$isinf(diff)){
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
                if(_b_.$isinf(diff)){
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
        }else if(min_diff < min_value){
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
    },
    e: float.$factory(Math.E),
    erf: function(x){
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
    },
    erfc: function(x){

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
    },
    exp: function(x){
        $B.check_nb_args('exp', 1, arguments)
        $B.check_no_kw('exp', x)

         if(_b_.$isninf(x)){return float.$factory(0)}
         if(_b_.$isinf(x)){return float.$factory('inf')}
         var _r = Math.exp(float_check(x))
         if(_b_.$isinf(_r)){throw _b_.OverflowError.$factory("math range error")}
         return float.$factory(_r)
    },
    expm1: function(x){
        $B.check_nb_args('expm1', 1, arguments)
        $B.check_no_kw('expm1', x)

         if(_b_.$isninf(x)){return float.$factory(0)}
         if(_b_.$isinf(x)){return float.$factory('inf')}
         var _r = Math.expm1(float_check(x))
         if(_b_.$isinf(_r)){throw _b_.OverflowError.$factory("math range error")}
         return float.$factory(_r)
    },
    //fabs: function(x){ return x>0?float.$factory(x):float.$factory(-x)},
    fabs: function(x){
        $B.check_nb_args('fabs', 1, arguments)
        $B.check_no_kw('fabs', x)
        return _b_.$fabs(x) // located in py_float.js
    },
    factorial: function(x){
        $B.check_nb_args('factorial', 1, arguments)
        $B.check_no_kw('factorial', x)

        if(x instanceof Number || _b_.isinstance(x, float)){
            var warning = _b_.DeprecationWarning.$factory(
                "Using factorial() with floats is deprecated")
            // module _warning is in builtin_modules.js
            $B.imported._warnings.warn(warning)
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
    },
    floor: function(x){
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
    },
    fmod: function(x,y){
        $B.check_nb_args('fmod', 2, arguments)
        $B.check_no_kw('fmod', x,y)
        return float.$factory(float_check(x) % float_check(y))
    },
    frexp: function(x){
        $B.check_nb_args('frexp', 1, arguments)
        $B.check_no_kw('frexp', x)

        var _l = _b_.$frexp(x)
        return _b_.tuple.$factory([float.$factory(_l[0]), _l[1]])
    },
    fsum: function(x){
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
    },
    gamma: function(x){
        $B.check_nb_args('gamma', 1, arguments)
        $B.check_no_kw('gamma', x)

        if(_b_.isinstance(x, int)){
            if(i < 1){
                throw _b_.ValueError.$factory("math domain error")
            }
            var res = 1
            for(var i = 1; i < x; i++){res *= i}
            return new Number(res)
        }
        // Adapted from https://en.wikipedia.org/wiki/Lanczos_approximation
        var p = [676.5203681218851,
            -1259.1392167224028,
            771.32342877765313,
            -176.61502916214059,
            12.507343278686905,
            -0.13857109526572012,
            9.9843695780195716e-6,
            1.5056327351493116e-7
            ]

        var EPSILON = 1e-07
        function drop_imag(z){
            if(Math.abs(z.imag) <= EPSILON){
                z = z.real
            }
            return z
        }
        var z = x
        if(z < 0.5){
            var y = Math.PI / (Math.sin(Math.PI * z) * _mod.gamma(1-z)) // Reflection formula
        }else{
            z -= 1
            var x = 0.99999999999980993,
                i = 0
            for(var i = 0, len = p.length; i < len; i++){
                var pval = p[i]
                x += pval / (z + i + 1)
            }
            var t = z + p.length - 0.5,
                sq = Math.sqrt(2 * Math.PI),
                y = sq * Math.pow(t, (z + 0.5)) * Math.exp(-t) * x
        }
        return drop_imag(y)
    },
    gcd: function(){
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
    },
    hypot: function(x, y){
        var $ = $B.args("hypot", 2, {x: null, y:null}, ['x', 'y'],
                    arguments, {}, "args", null),
            args = [x, y].concat($.args),
            res = 0
        return float.$factory(Math.hypot(...args))
    },
    inf: float.$factory('inf'),
    isclose: function(){
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
            throw ValueError.$factory('tolerances must be non-negative')
        }

        if(a == b){
            return True
        }
        if(_b_.$isinf(a) || _b_.$isinf(b)){
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

        var diff = $B.$call($B.$getattr(b, '__sub__'))(a),
            abs_diff = $B.$call($B.$getattr(diff, "__abs__"))()
        if($B.rich_comp("__le__", abs_diff, abs_tol)){
            return true
        }
        var abs_a = $B.$call($B.$getattr(a, '__abs__'))(),
            abs_b = $B.$call($B.$getattr(b, '__abs__'))(),
            max_ab = abs_a
        if($B.rich_comp("__gt__", abs_b, abs_a)){
            max_ab = abs_b
        }
        return $B.rich_comp("__le__",
            $B.$call($B.$getattr(abs_diff, "__truediv__"))(max_ab),
            rel_tol)
    },
    isfinite: function(x){
        $B.check_nb_args('isfinite', 1, arguments)
        $B.check_no_kw('isfinite', x)
        return isFinite(float_check(x))
    },
    isinf: function(x){
        $B.check_nb_args('isinf', 1, arguments)
        $B.check_no_kw('isinf', x)
        return _b_.$isinf(float_check(x))
    },
    isnan: function(x){
        $B.check_nb_args('isnan', 1, arguments)
        $B.check_no_kw('isnan', x)
        return isNaN(float_check(x))
    },
    isqrt: function(x){
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
    },
    lcm: function(){
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
    },
    ldexp: function(x, i){
        $B.check_nb_args('ldexp', 2, arguments)
        $B.check_no_kw('ldexp', x, i)
        return _b_.$ldexp(x, i)   //located in py_float.js
    },
    lgamma: function(x){
        $B.check_nb_args('lgamma', 1, arguments)
        $B.check_no_kw('lgamma', x)

        return new Number(Math.log(Math.abs(_mod.gamma(x))))
    },
    log: function(x, base){
        var $ = $B.args("log", 2, {x: null, base: null}, ['x', 'base'],
            arguments, {base: _b_.None}, null, null),
            x = $.x,
            base = $.base

         var x1 = float_check(x)
         if(base === _b_.None){return float.$factory(Math.log(x1))}
         return float.$factory(Math.log(x1) / Math.log(float_check(base)))
    },
    log1p: function(x){
        $B.check_nb_args('log1p', 1, arguments)
        $B.check_no_kw('log1p', x)
        return float.$factory(Math.log1p(float_check(x)))
    },
    log2: function(x){
        $B.check_nb_args('log2', 1, arguments)
        $B.check_no_kw('log2', x)

        if(isNaN(x)){return float.$factory('nan')}
        if(_b_.$isninf(x)) {throw ValueError.$factory('')}
        var x1 = float_check(x)
        if(x1 < 0.0){throw ValueError.$factory('')}
        return float.$factory(Math.log(x1) / Math.LN2)
    },
    log10: function(x){
        $B.check_nb_args('log10', 1, arguments)
        $B.check_no_kw('log10', x)

        return float.$factory(Math.log10(float_check(x)))
    },
    modf: function(x){
        $B.check_nb_args('modf', 1, arguments)
        $B.check_no_kw('modf', x)

       if(_b_.$isninf(x)){
           return _b_.tuple.$factory([0.0, float.$factory('-inf')])
       }
       if(_b_.$isinf(x)){
           return _b_.tuple.$factory([0.0, float.$factory('inf')])
       }
       if(isNaN(x)){
           return _b_.tuple.$factory([float.$factory('nan'),
               float.$factory('nan')])
       }

       var x1 = float_check(x)
       if(x1 > 0){
          var i = float.$factory(x1 - Math.floor(x1))
          return _b_.tuple.$factory([i, float.$factory(x1 - i)])
       }

       var x2 = Math.ceil(x1)
       var i = float.$factory(x1 - x2)
       return _b_.tuple.$factory([i, float.$factory(x2)])
    },
    nan: float.$factory('nan'),
    nextafter: function(){
        var $ = $B.args("nextafter", 2, {x: null, y: null}, ['x', 'y'],
                    arguments, {}, null, null),
            x = $.x,
            y = $.y
        return y < x ? -nextUp(-x) : (y > x ? nextUp(x) : (x !== x ? x : y))
    },
    perm: function(n, k){
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
    },
    pi : float.$factory(Math.PI),
    pow: function(){
        var $ = $B.args("pow", 2, {base: null, exp: null}, ['base', 'exp'],
                    arguments, {}, null, null),
            x = $.base,
            y = $.exp

        var x1 = float_check(x)
        var y1 = float_check(y)
        if(y1 == 0){return float.$factory(1)}
        if(x1 == 0 && y1 < 0){throw _b_.ValueError.$factory('')}

        if(isNaN(y1)){
            if(x1 == 1){return float.$factory(1)}
            return float.$factory('nan')
        }
        if(x1 == 0){return float.$factory(0)}

        if(_b_.$isninf(y)){
            if(x1 == 1 || x1 == -1){return float.$factory(1)}
            if(x1 < 1 && x1 > -1){return float.$factory('inf')}
            return float.$factory(0)
        }
        if(_b_.$isinf(y)){
            if(x1 == 1 || x1 == -1){return float.$factory(1)}
            if(x1 < 1 && x1 > -1){return float.$factory(0)}
            return float.$factory('inf')
        }

        if(isNaN(x1)){return float.$factory('nan')}
        if(_b_.$isninf(x)){
            if(y1 > 0 && isOdd(y1)){return float.$factory('-inf')}
            if(y1 > 0){return float.$factory('inf')}  // this is even or a float
            if(y1 < 0){return float.$factory(0)}
            return float.$factory(1)
        }

        if(_b_.$isinf(x)){
            if(y1 > 0){return float.$factory('inf')}
            if(y1 < 0){return float.$factory(0)}
            return float.$factory(1)
        }

        var r = Math.pow(x1, y1)
        if(isNaN(r)){return float.$factory('nan')}
        if(_b_.$isninf(r)){return float.$factory('-inf')}
        if(_b_.$isinf(r)){return float.$factory('inf')}

        return r
    },
    prod: function(){
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
    },
    radians: function(x){
        $B.check_nb_args('radians', 1, arguments)
        $B.check_no_kw('radians', x)

        return float.$factory(float_check(x) * Math.PI / 180)
    },
    remainder: function(x, y){
        $B.check_nb_args('remainder', 2, arguments)
        $B.check_no_kw('remainder', x, y)
        if(_mod.isnan(x) || _mod.isnan(y)){
            return _mod.nan
        }
        if(_b_.$isinf(x) || y == 0){
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
        if(_b_.$isinf(res)){
            // happens if rounded * y is infinite
            res = _b_.float.$factory(rounded * (x / rounded - y))
        }
        return res
    },
    sin : function(x){
        $B.check_nb_args('sin ', 1, arguments)
        $B.check_no_kw('sin ', x)
        return float.$factory(Math.sin(float_check(x)))},
    sinh: function(x) {
        $B.check_nb_args('sinh', 1, arguments)
        $B.check_no_kw('sinh', x)

        var y = float_check(x)
        if(Math.sinh !== undefined){return float.$factory(Math.sinh(y))}
        return float.$factory(
            (Math.pow(Math.E, y) - Math.pow(Math.E, -y)) / 2)
    },
    sqrt: function(x){
        $B.check_nb_args('sqrt ', 1, arguments)
        $B.check_no_kw('sqrt ', x)

      var y = float_check(x)
      if(y < 0){throw ValueError.$factory("math range error")}
      if(_b_.$isinf(y)){return float.$factory('inf')}
      var _r = Math.sqrt(y)
      if(_b_.$isinf(_r)){throw _b_.OverflowError.$factory("math range error")}
      return float.$factory(_r)
    },
    tan: function(x) {
        $B.check_nb_args('tan', 1, arguments)
        $B.check_no_kw('tan', x)

        var y = float_check(x)
        return float.$factory(Math.tan(y))
    },
    tanh: function(x) {
        $B.check_nb_args('tanh', 1, arguments)
        $B.check_no_kw('tanh', x)

        var y = float_check(x)
        if(Math.tanh !== undefined){return float.$factory(Math.tanh(y))}
        return float.$factory((Math.pow(Math.E, y) - Math.pow(Math.E, -y))/
             (Math.pow(Math.E, y) + Math.pow(Math.E, -y)))
    },
    tau: 6.283185307179586,
    trunc: function(x) {
        $B.check_nb_args('trunc', 1, arguments)
        $B.check_no_kw('trunc', x)

       try{return getattr(x, '__trunc__')()}catch(err){}
       var x1 = float_check(x)
       if(!isNaN(parseFloat(x1)) && isFinite(x1)){
          if(Math.trunc !== undefined){return int.$factory(Math.trunc(x1))}
          if(x1 > 0){return int.$factory(Math.floor(x1))}
          return int.$factory(Math.ceil(x1))  // x1 < 0
       }
       throw _b_.ValueError.$factory(
           'object is not a number and does not contain __trunc__')
    },
    ulp: function(){
        var $ = $B.args("ulp", 1, {x: null}, ['x'], arguments, {}, null, null),
            x = $.x
        if(x == MAX_VALUE){
            return MAX_VALUE - _mod.nextafter(MAX_VALUE, 0)
        }else if(_b_.$isinf(x)){
            return _mod.inf
        }
        if(typeof x == "number" || x instanceof Number){
            return x > 0 ? nextUp(x) - x : x - (-nextUp(-x))
        }else{
            if($B.rich_comp('__gt__', x, 0)){
                return $B.rich_op('sub', nextUp(x), x)
            }else{
                var neg_x = $B.$call($B.$getattr(x, "__neg__"))()
                return $B.rich_op('sub', x,
                    $B.$call($B.$getattr(nextUp(neg_x), '__neg__'))())
            }
        }
    }
}

for(var $attr in _mod){
    if(typeof _mod[$attr] === 'function'){
        _mod[$attr].__class__ = $B.builtin_function
    }
}

return _mod

})(__BRYTHON__)
