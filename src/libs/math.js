var $module=(function($B){

var _b_ = $B.builtins
var $s=[]
for(var $b in _b_) $s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))

//for(var $py_builtin in _b_){eval("var "+$py_builtin+"=_b_[$py_builtin]")}

var float_check=function(x) {
    if (x.value !== undefined && isinstance(x, float)) return x.value
    return x
}

var isWholeNumber=function(x){return (x*10) % 10 == 0}

var isOdd=function(x) {return isWholeNumber(x) && 2*Math.floor(x/2) != x}

var isLargeNumber=function(x) {return x > Math.pow(2,32)}

// Big number Library from jsfromhell.com
// This library helps with producing "correct" results from 
// mathematic operations

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/classes/bignumber [rev. #4]


var BigNumber = function(n, p, r){
	var o = this, i;
	if(n instanceof BigNumber){
		for(i in {precision: 0, roundType: 0, _s: 0, _f: 0}) o[i] = n[i];
		o._d = n._d.slice();
		return;
	}
	o.precision = isNaN(p = Math.abs(p)) ? BigNumber.defaultPrecision : p;
	o.roundType = isNaN(r = Math.abs(r)) ? BigNumber.defaultRoundType : r;
	o._s = (n += "").charAt(0) == "-";
	o._f = ((n = n.replace(/[^\d.]/g, "").split(".", 2))[0] = n[0].replace(/^0+/, "") || "0").length;
	for(i = (n = o._d = (n.join("") || "0").split("")).length; i; n[--i] = +n[i]);
	o.round();
};
with({$: BigNumber, o: BigNumber.prototype}){
	$.ROUND_HALF_EVEN = ($.ROUND_HALF_DOWN = ($.ROUND_HALF_UP = ($.ROUND_FLOOR = ($.ROUND_CEIL = ($.ROUND_DOWN = ($.ROUND_UP = 0) + 1) + 1) + 1) + 1) + 1) + 1;
	$.defaultPrecision = 40;
	$.defaultRoundType = $.ROUND_HALF_UP;
	o.add = function(n){
		if(this._s != (n = new BigNumber(n))._s)
			return n._s ^= 1, this.subtract(n);
		var o = new BigNumber(this), a = o._d, b = n._d, la = o._f,
		lb = n._f, n = Math.max(la, lb), i, r;
		la != lb && ((lb = la - lb) > 0 ? o._zeroes(b, lb, 1) : o._zeroes(a, -lb, 1));
		i = (la = a.length) == (lb = b.length) ? a.length : ((lb = la - lb) > 0 ? o._zeroes(b, lb) : o._zeroes(a, -lb)).length;
		for(r = 0; i; r = (a[--i] = a[i] + b[i] + r) / 10 >>> 0, a[i] %= 10);
		return r && ++n && a.unshift(r), o._f = n, o.round();
	};
	o.subtract = function(n){
		if(this._s != (n = new BigNumber(n))._s)
			return n._s ^= 1, this.add(n);
		var o = new BigNumber(this), c = o.abs().compare(n.abs()) + 1, a = c ? o : n, b = c ? n : o, la = a._f, lb = b._f, d = la, i, j;
		a = a._d, b = b._d, la != lb && ((lb = la - lb) > 0 ? o._zeroes(b, lb, 1) : o._zeroes(a, -lb, 1));
		for(i = (la = a.length) == (lb = b.length) ? a.length : ((lb = la - lb) > 0 ? o._zeroes(b, lb) : o._zeroes(a, -lb)).length; i;){
			if(a[--i] < b[i]){
				for(j = i; j && !a[--j]; a[j] = 9);
				--a[j], a[i] += 10;
			}
			b[i] = a[i] - b[i];
		}
		return c || (o._s ^= 1), o._f = d, o._d = b, o.round();
	};
	o.multiply = function(n){
		var o = new BigNumber(this), r = o._d.length >= (n = new BigNumber(n))._d.length, a = (r ? o : n)._d,
		b = (r ? n : o)._d, la = a.length, lb = b.length, x = new BigNumber, i, j, s;
		for(i = lb; i; r && s.unshift(r), x.set(x.add(new BigNumber(s.join("")))))
			for(s = (new Array(lb - --i)).join("0").split(""), r = 0, j = la; j; r += a[--j] * b[i], s.unshift(r % 10), r = (r / 10) >>> 0);
		return o._s = o._s != n._s, o._f = ((r = la + lb - o._f - n._f) >= (j = (o._d = x._d).length) ? this._zeroes(o._d, r - j + 1, 1).length : j) - r, o.round();
	};
	o.divide = function(n){
		if((n = new BigNumber(n)) == "0")
			throw new Error("Division by 0");
		else if(this == "0")
			return new BigNumber;
		var o = new BigNumber(this), a = o._d, b = n._d, la = a.length - o._f,
		lb = b.length - n._f, r = new BigNumber, i = 0, j, s, l, f = 1, c = 0, e = 0;
		r._s = o._s != n._s, r.precision = Math.max(o.precision, n.precision),
		r._f = +r._d.pop(), la != lb && o._zeroes(la > lb ? b : a, Math.abs(la - lb));
		n._f = b.length, b = n, b._s = false, b = b.round();
		for(n = new BigNumber; a[0] == "0"; a.shift());
		out:
		do{
			for(l = c = 0, n == "0" && (n._d = [], n._f = 0); i < a.length && n.compare(b) == -1; ++i){
				(l = i + 1 == a.length, (!f && ++c > 1 || (e = l && n == "0" && a[i] == "0")))
				&& (r._f == r._d.length && ++r._f, r._d.push(0));
				(a[i] == "0" && n == "0") || (n._d.push(a[i]), ++n._f);
				if(e)
					break out;
				if((l && n.compare(b) == -1 && (r._f == r._d.length && ++r._f, 1)) || (l = 0))
					while(r._d.push(0), n._d.push(0), ++n._f, n.compare(b) == -1);
			}
			if(f = 0, n.compare(b) == -1 && !(l = 0))
				while(l ? r._d.push(0) : l = 1, n._d.push(0), ++n._f, n.compare(b) == -1);
			for(s = new BigNumber, j = 0; n.compare(y = s.add(b)) + 1 && ++j; s.set(y));
			n.set(n.subtract(s)), !l && r._f == r._d.length && ++r._f, r._d.push(j);
		}
		while((i < a.length || n != "0") && (r._d.length - r._f) <= r.precision);
		return r.round();
	};
	o.mod = function(n){
		return this.subtract(this.divide(n).intPart().multiply(n));
	};
	o.pow = function(n){
		var o = new BigNumber(this), i;
		if((n = (new BigNumber(n)).intPart()) == 0) return o.set(1);
		for(i = Math.abs(n); --i; o.set(o.multiply(this)));
		return n < 0 ? o.set((new BigNumber(1)).divide(o)) : o;
	};
	o.set = function(n){
		return this.constructor(n), this;
	};
	o.compare = function(n){
		var a = this, la = this._f, b = new BigNumber(n), lb = b._f, r = [-1, 1], i, l;
		if(a._s != b._s)
			return a._s ? -1 : 1;
		if(la != lb)
			return r[(la > lb) ^ a._s];
		for(la = (a = a._d).length, lb = (b = b._d).length, i = -1, l = Math.min(la, lb); ++i < l;)
			if(a[i] != b[i])
				return r[(a[i] > b[i]) ^ a._s];
		return la != lb ? r[(la > lb) ^ a._s] : 0;
	};
	o.negate = function(){
		var n = new BigNumber(this); return n._s ^= 1, n;
	};
	o.abs = function(){
		var n = new BigNumber(this); return n._s = 0, n;
	};
	o.intPart = function(){
		return new BigNumber((this._s ? "-" : "") + (this._d.slice(0, this._f).join("") || "0"));
	};
	o.valueOf = o.toString = function(){
		var o = this;
		return (o._s ? "-" : "") + (o._d.slice(0, o._f).join("") || "0") + (o._f != o._d.length ? "." + o._d.slice(o._f).join("") : "");
	};
	o._zeroes = function(n, l, t){
		var s = ["push", "unshift"][t || 0];
		for(++l; --l;  n[s](0));
		return n;
	};
	o.round = function(){
		if("_rounding" in this) return this;
		var $ = BigNumber, r = this.roundType, b = this._d, d, p, n, x;
		for(this._rounding = true; this._f > 1 && !b[0]; --this._f, b.shift());
		for(d = this._f, p = this.precision + d, n = b[p]; b.length > d && !b[b.length -1]; b.pop());
		x = (this._s ? "-" : "") + (p - d ? "0." + this._zeroes([], p - d - 1).join("") : "") + 1;
		if(b.length > p){
			n && (r == $.DOWN ? false : r == $.UP ? true : r == $.CEIL ? !this._s
			: r == $.FLOOR ? this._s : r == $.HALF_UP ? n >= 5 : r == $.HALF_DOWN ? n > 5
			: r == $.HALF_EVEN ? n >= 5 && b[p - 1] & 1 : false) && this.add(x);
			b.splice(p, b.length - p);
		}
		return delete this._rounding, this;
	};
}

var isNegZero=function(x) {return x===0 && Math.atan2(x,x) < 0}

var _mod = {
    __getattr__ : function(attr){
        var res = this[attr]
        if(res===undefined){$raise('AttributeError','module math has no attribute '+attr)}
        return res
    },
    acos: function(x) {return float(Math.acos(float_check(x)))},
    acosh: function(x) { 
        if (_b_.$isinf(x)) return float('inf');
        var y = float_check(x);
        return float(Math.log(y + Math.sqrt(y*y-1)));
    },
    asin: function(x) {return float(Math.asin(float_check(x)))},
    asinh: function(x) {
        if (_b_.$isninf(x)) return float('-inf');
        if (_b_.$isinf(x)) return float('inf');
        var y = float_check(x);
        return float(Math.log(y + Math.sqrt(y*y+1)))
    },
    atan: function(x) {
        if (_b_.$isninf(x)) return float(-Math.PI/2);
        if (_b_.$isinf(x)) return float(Math.PI/2);
        return float(Math.atan(float_check(x)))},
    atan2: function(y,x) {
        return float(Math.atan2(float_check(y),float_check(x)))
    },
    atanh: function(x) { 
       var y=float_check(x);
       if (y==0) return 0;
       return float(0.5 * Math.log((1/y+1)/(1/y-1)));
    },
    ceil: function(x) {
       try{return getattr(x,'__ceil__')()}catch(err){$B.$pop_exc()}

       if (_b_.$isninf(x)) return float('-inf')
       if (_b_.$isinf(x)) return float('inf')
       if (isNaN(x)) return float('nan')

       var y=float_check(x);
       if (!isNaN(parseFloat(y)) && isFinite(y)) return int(Math.ceil(y));
       
       $raise('ValueError', 'object is not a number and does not contain __ceil__')
    },
    copysign: function(x,y) {
        var x1=Math.abs(float_check(x))
        var y1=float_check(y)
        var sign=y1?y1<0?-1:1:1
        if (isNegZero(y1)) sign=-1   // probably need to work on adding a check for -0
        return float(x1 * sign)
    },
    cos : function(x){return float(Math.cos(float_check(x)))},
    cosh: function(x){
        if (_b_.$isinf(x)) return float('inf')
        var y = float_check(x)
        if (Math.cosh !== undefined) return float(Math.cosh(y))
        return float((Math.pow(Math.E,y) + Math.pow(Math.E,-y))/2)
    },
    degrees: function(x){return float(float_check(x) * 180/Math.PI)},
    e: float(Math.E),
    erf: function(x) {
        // inspired from 
        // http://stackoverflow.com/questions/457408/is-there-an-easily-available-implementation-of-erf-for-python
        var y =float_check(x);
        var t = 1.0 / (1.0 + 0.5 * Math.abs(y))
        var ans = 1 - t * Math.exp( -y*y - 1.26551223 +
                     t * ( 1.00002368 +
                     t * ( 0.37409196 + 
                     t * ( 0.09678418 + 
                     t * (-0.18628806 + 
                     t * ( 0.27886807 + 
                     t * (-1.13520398 + 
                     t * ( 1.48851587 + 
                     t * (-0.82215223 + 
                     t * 0.17087277)))))))))
        if (y >= 0.0) return ans

        return -ans
    },

    erfc: function(x) {
        // inspired from 
        // http://stackoverflow.com/questions/457408/is-there-an-easily-available-implementation-of-erf-for-python
        var y = float_check(x);
        var t = 1.0 / (1.0 + 0.5 * Math.abs(y))
        var ans = 1 - t * Math.exp( -y*y - 1.26551223 +
                     t * ( 1.00002368 +
                     t * ( 0.37409196 + 
                     t * ( 0.09678418 + 
                     t * (-0.18628806 + 
                     t * ( 0.27886807 + 
                     t * (-1.13520398 + 
                     t * ( 1.48851587 + 
                     t * (-0.82215223 + 
                     t * 0.17087277)))))))))
        if (y >= 0.0) return 1-ans
        return 1+ans
    },
    exp: function(x){
         if (_b_.$isninf(x)) {return float(0)}
         if (_b_.$isinf(x)) {return float('inf')}
         var _r=Math.exp(float_check(x))
         if (_b_.$isinf(_r)) {throw OverflowError("math range error")}
         return float(_r)
    },
    expm1: function(x){return float(Math.exp(float_check(x))-1)},
    //fabs: function(x){ return x>0?float(x):float(-x)},
    fabs: function(x){return _b_.$fabs(x)}, //located in py_float.js
    factorial: function(x) {
         //using code from http://stackoverflow.com/questions/3959211/fast-factorial-function-in-javascript
         var y=float_check(x);
         var r=1
         for (var i=2; i<=y; i++){r*=i}
         return r
    },
    floor:function(x){return Math.floor(float_check(x))},
    fmod:function(x,y){return float(float_check(x)%float_check(y))},
    frexp: function(x){return _b_.tuple(_b_.$frexp(x))}, // located in py_float.js
    //fsum:function(x){},
    gamma: function(x){
         //using code from http://stackoverflow.com/questions/3959211/fast-factorial-function-in-javascript
         // Lanczos Approximation of the Gamma Function
         // As described in Numerical Recipes in C (2nd ed. Cambridge University Press, 1992)
         var y=float_check(x);
         var z = y + 1;
         var d1 = Math.sqrt(2 * Math.PI) / z;

         var d2 = 1.000000000190015;
         d2 +=  76.18009172947146 / (z+1);
         d2 += -86.50532032941677 / (z+2);
         d2 +=  24.01409824083091 / (z+3); 
         d2 += -1.231739572450155 / (z+4); 
         d2 +=  1.208650973866179E-3 / (z+5);
         d2 += -5.395239384953E-6 / (z+6);

         return d1 * d2 * Math.pow(z+5.5,z+0.5) * Math.exp(-(z+5.5));
    },
    hypot: function(x,y){
       if (_b_.$isinf(x) || _b_.$isinf(y)) return float('inf')
       var x1=float_check(x);
       var y1=float_check(y);
       return float(Math.sqrt(x1*x1 + y1*y1))},
    isfinite:function(x) {return isFinite(float_check(x))},
    isinf:function(x) {return _b_.$isinf(float_check(x))},
    isnan:function(x) {return isNaN(float_check(x))},
    ldexp:function(x,i) {return _b_.$ldexp(x,i)},   //located in py_float.js
    lgamma:function(x) {
         // see gamma function for sources
         var y=float_check(x);
         var z = y + 1;
         var d1 = Math.sqrt(2 * Math.PI) / z;

         var d2 = 1.000000000190015;
         d2 +=  76.18009172947146 / (z+1);
         d2 += -86.50532032941677 / (z+2);
         d2 +=  24.01409824083091 / (z+3); 
         d2 += -1.231739572450155 / (z+4); 
         d2 +=  1.208650973866179E-3 / (z+5);
         d2 += -5.395239384953E-6 / (z+6);

         return float(Math.log(Math.abs(d1 * d2 * Math.pow(z+5.5,z+0.5) * Math.exp(-(z+5.5)))));
    },
    log: function(x, base) {
         var x1=float_check(x);
         if (base === undefined) return float(Math.log(x1));
         return float(Math.log(x1)/Math.log(float_check(base)));
    },
    log1p: function(x) {return float(Math.log(1.0 + float_check(x)))},
    log2: function(x) {
        if (isNaN(x)) return float('nan')
        if (_b_.$isninf(x)) throw ValueError('')
        var x1=float_check(x)
        if (x1 < 0.0) throw ValueError('')
        //if (isLargeNumber(x1)) x1=new BigNumber(x1)         
        return float(Math.log(x1)/Math.LN2)
    },
    log10: function(x) {return float(Math.log(float_check(x))/Math.LN10)},
    modf:function(x) {
       if (_b_.$isninf(x)) return _b_.tuple([0.0, float('-inf')])
       if (_b_.$isinf(x)) return _b_.tuple([0.0, float('inf')])
       if (isNaN(x)) return _b_.tuple([float('nan'), float('nan')])

       var x1=float_check(x);
       if (x1 > 0) {
          var i=float(x1-Math.floor(x1))
          return _b_.tuple([i, float(x1-i)])
       }

       var x2=Math.ceil(x1)
       var i=float(x1-x2)
       return _b_.tuple([i, float(x2)])
    },
    pi : float(Math.PI),
    pow: function(x,y) {
        var x1=float_check(x)
        var y1=float_check(y)
        if (y1 == 0) return float(1)        
        if (x1 == 0 && y1 < 0) throw _b_.ValueError('')

        if(isNaN(y1)) {if(x1==1) return float(1) 
                       return float('nan')
        }
        if (x1 == 0) return float(0)

        if(_b_.$isninf(y)) {if(x1==1||x1==-1) {return float(1)}
                       if(x1 < 1 && x1 > -1) return float('inf') 
                       return float(0)
        }
        if(_b_.$isinf(y)) {if(x1==1||x1==-1) {return float(1)} 
                      if(x1 < 1 && x1 > -1) return float(0) 
                      return float('inf')}

        if(isNaN(x1)) return float('nan')
        if(_b_.$isninf(x)) {
            if (y1 > 0 && isOdd(y1)) return float('-inf')
            if (y1 > 0) return float('inf')  // this is even or a float
            if (y1 < 0) return float(0)
            return float(1)
        }

        if(_b_.$isinf(x)) { 
            if (y1 > 0) return float('inf')
            if (y1 < 0) return float(0)
            return float(1)
        }

        var r
        if (isLargeNumber(x1) || isLargeNumber(y1)) {
           var x=new BigNumber(x1)
           var y=new BigNumber(y1)
           r=x.pow(y)
        } else {
           r=Math.pow(x1,y1)
        }

        if (isNaN(r)) return float('nan')
        if (_b_.$isninf(r)) return float('-inf')
        if (_b_.$isinf(r)) return float('inf')

        return r
    },
    radians: function(x){return float(float_check(x) * Math.PI/180)},
    sin : function(x){return float(Math.sin(float_check(x)))},
    sinh: function(x) { 
        //if (_b_.$isinf(x)) return float('inf');
        var y = float_check(x)
        if (Math.sinh !== undefined) { return float(Math.sinh(y))}
        return float((Math.pow(Math.E,y) - Math.pow(Math.E,-y))/2)
    },
    sqrt : function(x){
      var y = float_check(x)
      if (y < 0) { throw ValueError("math range error")}
      if (_b_.$isinf(y)) return float('inf')
      var _r=Math.sqrt(y)
      if (_b_.$isinf(_r)) {throw OverflowError("math range error")}
      return float(_r)
    },
    tan: function(x) {
        var y = float_check(x)
        return float(Math.tan(y))
    },
    tanh: function(x) {
        var y = float_check(x)
        if (Math.tanh !== undefined) return float(Math.tanh(y))
        return float((Math.pow(Math.E,y) - Math.pow(Math.E,-y))/
                     (Math.pow(Math.E,y) + Math.pow(Math.E,-y)))       
    },
    trunc: function(x) {
       try{return getattr(x,'__trunc__')()}catch(err){$B.$pop_exc()}
       var x1=float_check(x);
       if (!isNaN(parseFloat(x1)) && isFinite(x1)) {
          if (Math.trunc !== undefined) { return int(Math.trunc(x1))}
          if (x1 > 0) {return int(Math.floor(x1))}
          return int(Math.ceil(x1))  // x1 < 0
       }
       $raise('ValueError', 'object is not a number and does not contain __trunc__')
    }
}

for(var $attr in _mod){
    if(typeof _mod[$attr]==='function'){
        _mod[$attr].__repr__=(function(func){
            return function(){return '<built-in function '+func+'>'}})($attr)
        _mod[$attr].__str__=(function(func){
            return function(){return '<built-in function '+func+'>'}})($attr)
    }
}

return _mod

})(__BRYTHON__)
