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
        if(y > Math.pow(2, 28)){ // issue 1590
            return float.$factory(_mod.log(y) + _mod.log(2))
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

        if(x === Number.POSITIVE_INFINITY){
            return _mod.inf
        }else if(x === Number.NEGATIVE_INFINITY){
            throw _b_.ValueError.$factory("math domain error")
        }
        if(_b_.isinstance(x, _b_.int) ||
                (_b_.isinstance(x, _b_.float) && x == _b_.int.$factory(x))){
            if(x < 1){
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
        if(z < 0){
            // Use formula Γ(z) = Γ(z + n + 1) / z (z + 1) ... (z + n)
            // with n such that z + n + 1 > 0
            var n = Math.ceil(-z - 1),
                g = _mod.gamma(new Number(z + n + 1))
            for(var i = 0; i <= n; i++){
                g = g / (z + i)
            }
            return g
        }else if(z < 0.5){
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

        // copied from
        // https://github.com/czurnieden/ieee745gamma/blob/master/ieee745gamma.js
        // by Christoph Zurnieden
        // see "LICENCE math lgamma.txt"
        var double_int = new DataView(new ArrayBuffer(8))
        var half = 5.00000000000000000000e-01 /* 0x3FE00000, 0x00000000 */
        var one = 1.00000000000000000000e+00 /* 0x3FF00000, 0x00000000 */
        var pi = 3.14159265358979311600e+00 /* 0x400921FB, 0x54442D18 */
        var a0 = 7.72156649015328655494e-02 /* 0x3FB3C467, 0xE37DB0C8 */
        var a1 = 3.22467033424113591611e-01 /* 0x3FD4A34C, 0xC4A60FAD */
        var a2 = 6.73523010531292681824e-02 /* 0x3FB13E00, 0x1A5562A7 */
        var a3 = 2.05808084325167332806e-02 /* 0x3F951322, 0xAC92547B */
        var a4 = 7.38555086081402883957e-03 /* 0x3F7E404F, 0xB68FEFE8 */
        var a5 = 2.89051383673415629091e-03 /* 0x3F67ADD8, 0xCCB7926B */
        var a6 = 1.19270763183362067845e-03 /* 0x3F538A94, 0x116F3F5D */
        var a7 = 5.10069792153511336608e-04 /* 0x3F40B6C6, 0x89B99C00 */
        var a8 = 2.20862790713908385557e-04 /* 0x3F2CF2EC, 0xED10E54D */
        var a9 = 1.08011567247583939954e-04 /* 0x3F1C5088, 0x987DFB07 */
        var a10 = 2.52144565451257326939e-05 /* 0x3EFA7074, 0x428CFA52 */
        var a11 = 4.48640949618915160150e-05 /* 0x3F07858E, 0x90A45837 */
        var tc = 1.46163214496836224576e+00 /* 0x3FF762D8, 0x6356BE3F */
        var tf = -1.21486290535849611461e-01 /* 0xBFBF19B9, 0xBCC38A42 */
        /* tt = -(tail of tf) */
        var tt = -3.63867699703950536541e-18 /* 0xBC50C7CA, 0xA48A971F */
        var t0 = 4.83836122723810047042e-01 /* 0x3FDEF72B, 0xC8EE38A2 */
        var t1 = -1.47587722994593911752e-01 /* 0xBFC2E427, 0x8DC6C509 */
        var t2 = 6.46249402391333854778e-02 /* 0x3FB08B42, 0x94D5419B */
        var t3 = -3.27885410759859649565e-02 /* 0xBFA0C9A8, 0xDF35B713 */
        var t4 = 1.79706750811820387126e-02 /* 0x3F9266E7, 0x970AF9EC */
        var t5 = -1.03142241298341437450e-02 /* 0xBF851F9F, 0xBA91EC6A */
        var t6 = 6.10053870246291332635e-03 /* 0x3F78FCE0, 0xE370E344 */
        var t7 = -3.68452016781138256760e-03 /* 0xBF6E2EFF, 0xB3E914D7 */
        var t8 = 2.25964780900612472250e-03 /* 0x3F6282D3, 0x2E15C915 */
        var t9 = -1.40346469989232843813e-03 /* 0xBF56FE8E, 0xBF2D1AF1 */
        var t10 = 8.81081882437654011382e-04 /* 0x3F4CDF0C, 0xEF61A8E9 */
        var t11 = -5.38595305356740546715e-04 /* 0xBF41A610, 0x9C73E0EC */
        var t12 = 3.15632070903625950361e-04 /* 0x3F34AF6D, 0x6C0EBBF7 */
        var t13 = -3.12754168375120860518e-04 /* 0xBF347F24, 0xECC38C38 */
        var t14 = 3.35529192635519073543e-04 /* 0x3F35FD3E, 0xE8C2D3F4 */
        var u0 = -7.72156649015328655494e-02 /* 0xBFB3C467, 0xE37DB0C8 */
        var u1 = 6.32827064025093366517e-01 /* 0x3FE4401E, 0x8B005DFF */
        var u2 = 1.45492250137234768737e+00 /* 0x3FF7475C, 0xD119BD6F */
        var u3 = 9.77717527963372745603e-01 /* 0x3FEF4976, 0x44EA8450 */
        var u4 = 2.28963728064692451092e-01 /* 0x3FCD4EAE, 0xF6010924 */
        var u5 = 1.33810918536787660377e-02 /* 0x3F8B678B, 0xBF2BAB09 */
        var v1 = 2.45597793713041134822e+00 /* 0x4003A5D7, 0xC2BD619C */
        var v2 = 2.12848976379893395361e+00 /* 0x40010725, 0xA42B18F5 */
        var v3 = 7.69285150456672783825e-01 /* 0x3FE89DFB, 0xE45050AF */
        var v4 = 1.04222645593369134254e-01 /* 0x3FBAAE55, 0xD6537C88 */
        var v5 = 3.21709242282423911810e-03 /* 0x3F6A5ABB, 0x57D0CF61 */
        var s0 = -7.72156649015328655494e-02 /* 0xBFB3C467, 0xE37DB0C8 */
        var s1 = 2.14982415960608852501e-01 /* 0x3FCB848B, 0x36E20878 */
        var s2 = 3.25778796408930981787e-01 /* 0x3FD4D98F, 0x4F139F59 */
        var s3 = 1.46350472652464452805e-01 /* 0x3FC2BB9C, 0xBEE5F2F7 */
        var s4 = 2.66422703033638609560e-02 /* 0x3F9B481C, 0x7E939961 */
        var s5 = 1.84028451407337715652e-03 /* 0x3F5E26B6, 0x7368F239 */
        var s6 = 3.19475326584100867617e-05 /* 0x3F00BFEC, 0xDD17E945 */
        var r1 = 1.39200533467621045958e+00 /* 0x3FF645A7, 0x62C4AB74 */
        var r2 = 7.21935547567138069525e-01 /* 0x3FE71A18, 0x93D3DCDC */
        var r3 = 1.71933865632803078993e-01 /* 0x3FC601ED, 0xCCFBDF27 */
        var r4 = 1.86459191715652901344e-02 /* 0x3F9317EA, 0x742ED475 */
        var r5 = 7.77942496381893596434e-04 /* 0x3F497DDA, 0xCA41A95B */
        var r6 = 7.32668430744625636189e-06 /* 0x3EDEBAF7, 0xA5B38140 */
        var w0 = 4.18938533204672725052e-01 /* 0x3FDACFE3, 0x90C97D69 */
        var w1 = 8.33333333333329678849e-02 /* 0x3FB55555, 0x5555553B */
        var w2 = -2.77777777728775536470e-03 /* 0xBF66C16C, 0x16B02E5C */
        var w3 = 7.93650558643019558500e-04 /* 0x3F4A019F, 0x98CF38B6 */
        var w4 = -5.95187557450339963135e-04 /* 0xBF4380CB, 0x8C0FE741 */
        var w5 = 8.36339918996282139126e-04 /* 0x3F4B67BA, 0x4CDAD5D1 */
        var w6 = -1.63092934096575273989e-03 /* 0xBF5AB89D, 0x0B9E43E4 */
        var zero = 0.00000000000000000000e+00

        var t, y, z, nadj = 0,
          p, p1, p2, p3, q, r, w

        var i = 0 | 0,
          hx = 0 | 0,
          lx = 0 | 0,
          ix = 0 | 0

        double_int.setFloat64(0, x)

        hx = double_int.getInt32(0) /* high word */
        lx = double_int.getInt32(4) /* low word */

        /* purge off +-inf, NaN, +-0, and negative arguments */
        lgamma_sign = 1
        ix = hx & 0x7fffffff
        if(ix >= 0x7ff00000){
          return new Number(x * x)
        }
        if((ix | lx) == 0){
          if(hx & 0x80000000){
            lgamma_sign = -1
          }
          return new Number(one / zero)
        }
        if(ix < 0x3b900000){ /* |x|<2**-70, return -log(|x|) */
          if(hx < 0){
            lgamma_sign = -1
            return new Number(-Math.log(-x))
          } else {
            return new Number(-Math.log(x))
          }
        }
        if(hx < 0){
          if(ix >= 0x43300000){ /* |x|>=2**52, must be -integer */
            return new Number(one / zero)
          }
          t = sin_pi(x)
          if(t == zero){
            return new Number(one / zero)
          } /* -integer */
          nadj = Math.log(pi / Math.abs(t * x))
          if(t < zero){
            lgamma_sign = -1
          }
          x = -x
        }
        /* purge off 1 and 2 */
        if((((ix - 0x3ff00000) | lx) == 0) || (((ix - 0x40000000) | lx) == 0)){
          r = 0
        }
        /* for x < 2.0 */
        else if(ix < 0x40000000){
          if(ix <= 0x3feccccc){ /* lgamma(x) = lgamma(x+1)-log(x) */
            r = -Math.log(x)
            if(ix >= 0x3FE76944){
              y = one - x
              i = 0
            }else if(ix >= 0x3FCDA661){
              y = x - (tc - one)
              i = 1
            }else{
              y = x
              i = 2
            }
          }else{
            r = zero
            if(ix >= 0x3FFBB4C3){
              y = 2.0 - x
              i = 0
            } /* [1.7316,2] */
            else if(ix >= 0x3FF3B4C4){
              y = x - tc
              i = 1
            } /* [1.23,1.73] */
            else{
              y = x - one
              i = 2
            }
          }
          switch(i){
            case 0:
              z = y * y
              p1 = a0 + z * (a2 + z * (a4 + z * (a6 + z * (a8 + z * a10))))
              p2 = z * (a1 + z * (a3 + z * (a5 + z * (a7 + z * (a9 + z * a11)))))
              p = y * p1 + p2
              r += (p - 0.5 * y)
              break
            case 1:
              z = y * y
              w = z * y
              p1 = t0 + w * (t3 + w * (t6 + w * (t9 + w * t12))) /* parallel comp */
              p2 = t1 + w * (t4 + w * (t7 + w * (t10 + w * t13)))
              p3 = t2 + w * (t5 + w * (t8 + w * (t11 + w * t14)))
              p = z * p1 - (tt - w * (p2 + y * p3))
              r += (tf + p)
              break
            case 2:
              p1 = y * (u0 + y * (u1 + y * (u2 + y * (u3 + y * (u4 + y * u5)))))
              p2 = one + y * (v1 + y * (v2 + y * (v3 + y * (v4 + y * v5))))
              r += (-0.5 * y + p1 / p2)
          }
        }else if(ix < 0x40200000){ /* x < 8.0 */
          i = x | 0
          t = zero
          y = x - i
          p = y * (s0 + y * (s1 + y * (s2 + y * (s3 + y * (s4 + y * (s5 + y *
            s6))))))
          q = one + y * (r1 + y * (r2 + y * (r3 + y * (r4 + y * (r5 + y * r6)))))
          r = half * y + p / q
          z = one /* lgamma(1+s) = log(s) + lgamma(s) */
          switch(i){
            case 7:
              z *= (y + 6.0) /* FALLTHRU */
            case 6:
              z *= (y + 5.0) /* FALLTHRU */
            case 5:
              z *= (y + 4.0) /* FALLTHRU */
            case 4:
              z *= (y + 3.0) /* FALLTHRU */
            case 3:
              z *= (y + 2.0) /* FALLTHRU */
              r += Math.log(z)
              break
          }
          /* 8.0 <= x < 2**58 */
        }else if(ix < 0x43900000){
          t = Math.log(x)
          z = one / x
          y = z * z
          w = w0 + z * (w1 + y * (w2 + y * (w3 + y * (w4 + y * (w5 + y * w6)))))
          r = (x - half) * (t - one) + w
        }else{
          /* 2**58 <= x <= inf */
          r = x * (Math.log(x) - one)
        }
        if(hx < 0){
          r = nadj - r
        }
        return new Number(r)
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
