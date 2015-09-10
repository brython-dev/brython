// Javascript implementation of the random module
// Based on Ian Bicking's implementation of the Mersenne twister

var $module = (function($B){

_b_ = $B.builtins

var VERSION = 3

// Code copied from https://github.com/ianb/whrandom/blob/master/mersenne.js
// by Ian Bicking

// this program is a JavaScript version of Mersenne Twister,
// a straight conversion from the original program, mt19937ar.c,
// translated by y. okada on july 17, 2006.
// and modified a little at july 20, 2006, but there are not any substantial differences.
// modularized by Ian Bicking, March 25, 2013 (found original version at http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/VERSIONS/JAVASCRIPT/java-script.html)
// in this program, procedure descriptions and comments of original source code were not removed.
// lines commented with //c// were originally descriptions of c procedure. and a few following lines are appropriate JavaScript descriptions.
// lines commented with /* and */ are original comments.
// lines commented with // are additional comments in this JavaScript version.
/*
   A C-program for MT19937, with initialization improved 2002/1/26.
   Coded by Takuji Nishimura and Makoto Matsumoto.

   Before using, initialize the state by using init_genrand(seed)
   or init_by_array(init_key, key_length).

   Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
   All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:

     1. Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.

     2. Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.

     3. The names of its contributors may not be used to endorse or promote
        products derived from this software without specific prior written
        permission.

   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


   Any feedback is very welcome.
   http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
   email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)
*/

function RandomStream(seed) {

  /*jshint bitwise:false */
  /* Period parameters */
  //c//#define N 624
  //c//#define M 397
  //c//#define MATRIX_A 0x9908b0dfUL   /* constant vector a */
  //c//#define UPPER_MASK 0x80000000UL /* most significant w-r bits */
  //c//#define LOWER_MASK 0x7fffffffUL /* least significant r bits */
  var N = 624;
  var M = 397;
  var MATRIX_A = 0x9908b0df;   /* constant vector a */
  var UPPER_MASK = 0x80000000; /* most significant w-r bits */
  var LOWER_MASK = 0x7fffffff; /* least significant r bits */
  //c//static unsigned long mt[N]; /* the array for the state vector  */
  //c//static int mti=N+1; /* mti==N+1 means mt[N] is not initialized */
  var mt = new Array(N);   /* the array for the state vector  */
  var mti = N+1;           /* mti==N+1 means mt[N] is not initialized */

  function unsigned32 (n1) // returns a 32-bits unsiged integer from an operand to which applied a bit operator.
  {
    return n1 < 0 ? (n1 ^ UPPER_MASK) + UPPER_MASK : n1;
  }

  function subtraction32 (n1, n2) // emulates lowerflow of a c 32-bits unsiged integer variable, instead of the operator -. these both arguments must be non-negative integers expressible using unsigned 32 bits.
  {
    return n1 < n2 ? unsigned32((0x100000000 - (n2 - n1)) & 0xffffffff) : n1 - n2;
  }

  function addition32 (n1, n2) // emulates overflow of a c 32-bits unsiged integer variable, instead of the operator +. these both arguments must be non-negative integers expressible using unsigned 32 bits.
  {
    return unsigned32((n1 + n2) & 0xffffffff);
  }

  function multiplication32 (n1, n2) // emulates overflow of a c 32-bits unsiged integer variable, instead of the operator *. these both arguments must be non-negative integers expressible using unsigned 32 bits.
  {
    var sum = 0;
    for (var i = 0; i < 32; ++i){
      if ((n1 >>> i) & 0x1){
        sum = addition32(sum, unsigned32(n2 << i));
      }
    }
    return sum;
  }

  /* initializes mt[N] with a seed */
  //c//void init_genrand(unsigned long s)
  function init_genrand(s) {
    //c//mt[0]= s & 0xffffffff;
    mt[0]= unsigned32(s & 0xffffffff);
    for (mti=1; mti<N; mti++) {
      mt[mti] =
      //c//(1812433253 * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti);
      addition32(multiplication32(1812433253, unsigned32(mt[mti-1] ^ (mt[mti-1] >>> 30))), mti);
      /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
      /* In the previous versions, MSBs of the seed affect   */
      /* only MSBs of the array mt[].                        */
      /* 2002/01/09 modified by Makoto Matsumoto             */
      //c//mt[mti] &= 0xffffffff;
      mt[mti] = unsigned32(mt[mti] & 0xffffffff);
      /* for >32 bit machines */
    }
  }

  /* initialize by an array with array-length */
  /* init_key is the array for initializing keys */
  /* key_length is its length */
  /* slight change for C++, 2004/2/26 */
  //c//void init_by_array(unsigned long init_key[], int key_length)
  function init_by_array(init_key, key_length) {
    //c//int i, j, k;
    var i, j, k;
    init_genrand(19650218);
    i=1; j=0;
    k = (N>key_length ? N : key_length);
    for (; k; k--) {
      //c//mt[i] = (mt[i] ^ ((mt[i-1] ^ (mt[i-1] >> 30)) * 1664525))
      //c// + init_key[j] + j; /* non linear */
      mt[i] = addition32(addition32(unsigned32(mt[i] ^ multiplication32(unsigned32(mt[i-1] ^ (mt[i-1] >>> 30)), 1664525)), init_key[j]), j);
      mt[i] =
      //c//mt[i] &= 0xffffffff; /* for WORDSIZE > 32 machines */
      unsigned32(mt[i] & 0xffffffff);
      i++; j++;
      if (i>=N) { mt[0] = mt[N-1]; i=1; }
      if (j>=key_length) {
        j=0;
      }
    }
    for (k=N-1; k; k--) {
      //c//mt[i] = (mt[i] ^ ((mt[i-1] ^ (mt[i-1] >> 30)) * 1566083941))
      //c//- i; /* non linear */
      mt[i] = subtraction32(unsigned32((mt[i]) ^ multiplication32(unsigned32(mt[i-1] ^ (mt[i-1] >>> 30)), 1566083941)), i);
      //c//mt[i] &= 0xffffffff; /* for WORDSIZE > 32 machines */
      mt[i] = unsigned32(mt[i] & 0xffffffff);
      i++;
      if (i>=N) { mt[0] = mt[N-1]; i=1; }
    }
    mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */
  }

  /* generates a random number on [0,0xffffffff]-interval */
  //c//unsigned long genrand_int32(void)
  function genrand_int32() {
    //c//unsigned long y;
    //c//static unsigned long mag01[2]={0x0UL, MATRIX_A};
    var y;
    var mag01 = [0x0, MATRIX_A];
    /* mag01[x] = x * MATRIX_A  for x=0,1 */

    if (mti >= N) { /* generate N words at one time */
      //c//int kk;
      var kk;

      if (mti == N+1) {   /* if init_genrand() has not been called, */
        init_genrand(Date.now()); /* a default initial seed is used */
      }

      for (kk=0;kk<N-M;kk++) {
        //c//y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
        //c//mt[kk] = mt[kk+M] ^ (y >> 1) ^ mag01[y & 0x1];
        y = unsigned32((mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK));
        mt[kk] = unsigned32(mt[kk+M] ^ (y >>> 1) ^ mag01[y & 0x1]);
      }
      for (;kk<N-1;kk++) {
        //c//y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
        //c//mt[kk] = mt[kk+(M-N)] ^ (y >> 1) ^ mag01[y & 0x1];
        y = unsigned32((mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK));
        mt[kk] = unsigned32(mt[kk+(M-N)] ^ (y >>> 1) ^ mag01[y & 0x1]);
      }
      //c//y = (mt[N-1]&UPPER_MASK)|(mt[0]&LOWER_MASK);
      //c//mt[N-1] = mt[M-1] ^ (y >> 1) ^ mag01[y & 0x1];
      y = unsigned32((mt[N-1]&UPPER_MASK)|(mt[0]&LOWER_MASK));
      mt[N-1] = unsigned32(mt[M-1] ^ (y >>> 1) ^ mag01[y & 0x1]);
      mti = 0;
    }

    y = mt[mti++];

    /* Tempering */
    //c//y ^= (y >> 11);
    //c//y ^= (y << 7) & 0x9d2c5680;
    //c//y ^= (y << 15) & 0xefc60000;
    //c//y ^= (y >> 18);
    y = unsigned32(y ^ (y >>> 11));
    y = unsigned32(y ^ ((y << 7) & 0x9d2c5680));
    y = unsigned32(y ^ ((y << 15) & 0xefc60000));
    y = unsigned32(y ^ (y >>> 18));

    return y;
  }

  /* generates a random number on [0,0x7fffffff]-interval */
  //c//long genrand_int31(void)
  function genrand_int31() {
    //c//return (genrand_int32()>>1);
    return (genrand_int32()>>>1);
  }

  /* generates a random number on [0,1]-real-interval */
  //c//double genrand_real1(void)
  function genrand_real1() {
    return genrand_int32()*(1.0/4294967295.0);
    /* divided by 2^32-1 */
  }

  /* generates a random number on [0,1)-real-interval */
  //c//double genrand_real2(void)
  function genrand_real2() {
    return genrand_int32()*(1.0/4294967296.0);
    /* divided by 2^32 */
  }

  /* generates a random number on (0,1)-real-interval */
  //c//double genrand_real3(void)
  function genrand_real3() {
    return ((genrand_int32()) + 0.5)*(1.0/4294967296.0);
    /* divided by 2^32 */
  }

  /* generates a random number on [0,1) with 53-bit resolution*/
  //c//double genrand_res53(void)
  function genrand_res53() {
    //c//unsigned long a=genrand_int32()>>5, b=genrand_int32()>>6;
    var a=genrand_int32()>>>5, b=genrand_int32()>>>6;
    return (a*67108864.0+b)*(1.0/9007199254740992.0);
  }
  /* These real versions are due to Isaku Wada, 2002/01/09 added */

  var random = genrand_res53;

  random.seed = function (seed) {
    if (! seed) {
      seed = Date.now();
    }
    if (typeof seed != "number") {
      seed = parseInt(seed, 10);
    }
    if ((seed !== 0 && ! seed) || isNaN(seed)) {
      throw "Bad seed";
    }
    init_genrand(seed);
  };

  random.seed(seed);

  random.int31 = genrand_int31;
  random.real1 = genrand_real1;
  random.real2 = genrand_real2;
  random.real3 = genrand_real3;
  random.res53 = genrand_res53;
  
  // Added for compatibility with Python
  random.getstate = function(){return [VERSION, mt, mti]}
  
  random.setstate = function(state){
    mt = state[1]
    mti = state[2]
  }

  return random;

}

function _Random(){
    var _random = RandomStream()
    
    _b_ = $B.builtins
    
    var NV_MAGICCONST = 4 * Math.exp(-0.5)/Math.sqrt(2),
        gauss_next = null
    
    function _randbelow(x){
        return Math.floor(x*_random())
    }
    
    function _urandom(n){
        /*
        urandom(n) -> str
        Return n random bytes suitable for cryptographic use.
        */
        
        randbytes= []
        for(i=0;i<n;i++){randbytes.push(parseInt(_random()*256))}
        return _b_.bytes(randbytes)
    }
    
    var res = {
        // magic constants
        NV_MAGICCONST: 1.71552776992141,
        TWOPI: 6.28318530718,
        LOG4: 1.38629436111989,
        SG_MAGICCONST: 2.50407739677627,

        choice: function(seq){
            var $ = $B.args('choice', 1,
                {seq:null},['seq'],arguments, {}, null, null),
                seq = $.seq
            var len, rank
            if(Array.isArray(seq)){len = seq.length}
            else{len = _b_.getattr(seq,'__len__')()}
            if(len==0){throw _b_.IndexError("Cannot choose from an empty sequence")}
            rank = parseInt(_random()*len)
            if(Array.isArray(seq)){return seq[rank]}
            else{return _b_.getattr(seq,'__getitem__')(rank)}
        },
    
        expovariate: function(lambd){
            /*
            Exponential distribution.
    
            lambd is 1.0 divided by the desired mean.  It should be
            nonzero.  (The parameter would be called "lambda", but that is
            a reserved word in Python.)  Returned values range from 0 to
            positive infinity if lambd is positive, and from negative
            infinity to 0 if lambd is negative.
    
            */
            // lambd: rate lambd = 1/mean
            // ('lambda' is a Python reserved word)
    
            // we use 1-random() instead of random() to preclude the
            // possibility of taking the log of zero.
            return -Math.log(1.0 - _random())/lambd
        },
    
        gammavariate: function(alpha, beta){
            /* Gamma distribution.  Not the gamma function!
    
            Conditions on the parameters are alpha > 0 and beta > 0.
    
            The probability distribution function is:
    
                        x ** (alpha - 1) * math.exp(-x / beta)
              pdf(x) =  --------------------------------------
                          math.gamma(alpha) * beta ** alpha
    
            */
    
            // alpha > 0, beta > 0, mean is alpha*beta, variance is alpha*beta**2
    
            // Warning: a few older sources define the gamma distribution in terms
            // of alpha > -1.0
            
            var $ = $B.args('gammavariate', 2,
                    {alpha:null, beta:null}, ['alpha', 'beta'],
                    arguments, {}, null, null),
                alpha = $.alpha,
                beta = $.beta,
                LOG4 = Math.log(4),
                SG_MAGICCONST = 1.0 + Math.log(4.5)
                
            if(alpha <= 0.0 || beta <= 0.0){
                throw _b_.ValueError('gammavariate: alpha and beta must be > 0.0')
            }
    
            if(alpha > 1.0){
    
                // Uses R.C.H. Cheng, "The generation of Gamma
                // variables with non-integral shape parameters",
                // Applied Statistics, (1977), 26, No. 1, p71-74
    
                ainv = Math.sqrt(2.0 * alpha - 1.0)
                bbb = alpha - LOG4
                ccc = alpha + ainv
    
                while(true){
                    u1 = _random()
                    if(!((1e-7 < u1) && (u1 < .9999999))){
                        continue
                    }
                    u2 = 1.0 - _random()
                    v = Math.log(u1/(1.0-u1))/ainv
                    x = alpha*Math.exp(v)
                    z = u1*u1*u2
                    r = bbb+ccc*v-x
                    if((r + SG_MAGICCONST - 4.5*z >= 0.0) || r >= Math.log(z)){
                        return x * beta
                    }
                }
            }else if(alpha == 1.0){
                // expovariate(1)
                u = _random()
                while(u <= 1e-7){u = _random()}
                return -Math.log(u) * beta
            }else{
                // alpha is between 0 and 1 (exclusive)
    
                // Uses ALGORITHM GS of Statistical Computing - Kennedy & Gentle
    
                while(true){
                    u = _random()
                    b = (Math.E + alpha)/Math.E
                    p = b*u
                    if(p <= 1.0){x = Math.pow(p, (1.0/alpha))}
                    else{x = -Math.log((b-p)/alpha)}
                    u1 = _random()
                    if(p > 1.0){
                        if(u1 <= Math.pow(x, alpha - 1.0)){
                            break
                        }
                    }else if(u1 <= Math.exp(-x)){
                        break
                    }
                }
                return x * beta
            }
        },
        
        gauss:function(){
    
            /* Gaussian distribution.
    
            mu is the mean, and sigma is the standard deviation.  This is
            slightly faster than the normalvariate() function.
    
            Not thread-safe without a lock around calls.
    
            # When x and y are two variables from [0, 1), uniformly
            # distributed, then
            #
            #    cos(2*pi*x)*sqrt(-2*log(1-y))
            #    sin(2*pi*x)*sqrt(-2*log(1-y))
            #
            # are two *independent* variables with normal distribution
            # (mu = 0, sigma = 1).
            # (Lambert Meertens)
            # (corrected version; bug discovered by Mike Miller, fixed by LM)
    
            # Multithreading note: When two threads call this function
            # simultaneously, it is possible that they will receive the
            # same return value.  The window is very small though.  To
            # avoid this, you have to use a lock around all calls.  (I
            # didn't want to slow this down in the serial case by using a
            # lock here.)
            */
    
            var $ = $B.args('gauss', 2, {mu:null, sigma:null},
                    ['mu', 'sigma'], arguments, {}, null, null),
                mu = $.mu,
                sigma = $.sigma
    
            z = gauss_next
            gauss_next = null
            if(z===null){
                x2pi = _random() * Math.PI * 2
                g2rad = Math.sqrt(-2.0 * Math.log(1.0 - _random()))
                z = Math.cos(x2pi) * g2rad
                gauss_next = Math.sin(x2pi) * g2rad
            }
            return mu + z*sigma
        },
             
        getrandbits: function(k){
            var $ = $B.args('getrandbits', 1,
                {k:null},['k'],arguments, {}, null, null),
                k = $B.$GetInt($.k)
            // getrandbits(k) -> x.  Generates a long int with k random bits.
            if(k <= 0){
                throw _b_.ValueError('number of bits must be greater than zero')
            }
            if(k != _b_.int(k)){
                throw _b_.TypeError('number of bits should be an integer')
            }
            numbytes = (k + 7) // bits / 8 and rounded up
            x = _b_.int.$dict.from_bytes(_urandom(numbytes), 'big')
            return _b_.getattr(x, '__rshift__')(
                _b_.getattr(numbytes*8,'__sub__')(k))
        },
        
        getstate: function(){
            // Return internal state; can be passed to setstate() later.
            var $ = $B.args('getstate', 0, {}, [], arguments, {}, null, null)
            return _random.getstate()
        },
        
        normalvariate: function(mu, sigma){
            /*
            Normal distribution.
    
            mu is the mean, and sigma is the standard deviation.
    
            */
    
            // mu = mean, sigma = standard deviation
    
            // Uses Kinderman and Monahan method. Reference: Kinderman,
            // A.J. and Monahan, J.F., "Computer generation of random
            // variables using the ratio of uniform deviates", ACM Trans
            // Math Software, 3, (1977), pp257-260.
            
            var $=$B.args('normalvariate', 2,
                {mu:null, sigma:null}, ['mu', 'sigma'],
                arguments, {}, null, null),
                mu = $.mu,
                sigma = $.sigma
    
            while(true){
                u1 = _random()
                u2 = 1.0 - _random()
                z = NV_MAGICCONST*(u1-0.5)/u2
                zz = z*z/4.0
                if(zz <= -Math.log(u2)){break}
            }
            return mu + z*sigma
        },
        
        paretovariate: function(){
            /* Pareto distribution.  alpha is the shape parameter.*/
            // Jain, pg. 495
            
            var $ = $B.args('paretovariate', 1, {alpha:null}, ['alpha'],
                        arguments, {}, null, null)
    
            u = 1 - _random()
            return 1 / Math.pow(u,1/$.alpha)
        },
            
        randint: function(a, b){
            var $ = $B.args('randint', 2,
                {a:null, b:null},
                ['a', 'b'],
                arguments, {}, null, null)
            return parseInt(_random()*($.b-$.a+1)+$.a)
        },
        
        random: _random,
        
        randrange: function(){
            var $ = $B.args('randrange', 3,
                {x:null, stop:null, step:null},
                ['x', 'stop', 'step'],
                arguments, {stop:null, step:null}, null, null)
            if($.stop===null){
                var start = 0, stop = $.x, step = 1
            }else{
                var start = $.x, stop = $.stop, 
                    step = $.step===null ? 1 : $.step
                if(step==0){throw _b_.ValueError('step cannot be 0')}
            }
            if(typeof start=='number' && typeof stop == 'number' &&
                typeof step=='number'){
                return start+step*Math.floor(_random()*Math.floor((stop-start)/step))
            }else{
                var d = _b_.getattr(stop,'__sub__')(start)
                d = _b_.getattr(d, '__floordiv__')(step)
                // Force d to be a LongInt
                d = $B.LongInt(d)
                // d is a long integer with n digits ; to choose a random number
                // between 0 and d the most simple is to take a random digit
                // at each position, except the first one
                var s = d.value, _len = s.length,
                    res = Math.floor(_random()*(parseInt(s.charAt(0))+(_len==1 ? 0 : 1)))+''
                var same_start = res.charAt(0)==s.charAt(0)
                for(var i=1;i<_len;i++){
                    if(same_start){
                        // If it's the last digit, don't allow stop as valid
                        if(i==_len-1){
                            res += Math.floor(_random()*parseInt(s.charAt(i)))+''
                        }else{
                            res += Math.floor(_random()*(parseInt(s.charAt(i))+1))+''
                            same_start = res.charAt(i)==s.charAt(i)
                        }
                    }else{
                        res += Math.floor(_random()*10)+''
                    }
                }
                var offset = {__class__:$B.LongInt.$dict, value: res, 
                    pos: true}
                d = _b_.getattr(step, '__mul__')(offset)
                d = _b_.getattr(start, '__add__')(d)
                return _b_.int(d)
            }
        },
    
        sample: function(){
            /*
            Chooses k unique random elements from a population sequence or set.
    
            Returns a new list containing elements from the population while
            leaving the original population unchanged.  The resulting list is
            in selection order so that all sub-slices will also be valid random
            samples.  This allows raffle winners (the sample) to be partitioned
            into grand prize and second place winners (the subslices).
    
            Members of the population need not be hashable or unique.  If the
            population contains repeats, then each occurrence is a possible
            selection in the sample.
    
            To choose a sample in a range of integers, use range as an argument.
            This is especially fast and space efficient for sampling from a
            large population:   sample(range(10000000), 60)
            
            # Sampling without replacement entails tracking either potential
            # selections (the pool) in a list or previous selections in a set.
    
            # When the number of selections is small compared to the
            # population, then tracking selections is efficient, requiring
            # only a small set and an occasional reselection.  For
            # a larger number of selections, the pool tracking method is
            # preferred since the list takes less space than the
            # set and it doesn't suffer from frequent reselections.'
            
            */
            var $ = $B.args('sample',2,{population:null,k:null},
                ['population','k'], arguments,{},null,null),
                population = $.population,
                k = $.k
    
            if(!_b_.hasattr(population, '__len__')){
                throw _b_.TypeError("Population must be a sequence or set.  For dicts, use list(d).")
            }
            n = _b_.getattr(population, '__len__')()
    
            if(k<0 || k>n){
                throw _b_.ValueError("Sample larger than population")
            }
            result = []
            setsize = 21        // size of a small set minus size of an empty list
            if(k > 5){
                setsize += Math.pow(4, Math.ceil(Math.log(k * 3, 4))) // table size for big sets
            }
            if(n <= setsize){
                // An n-length list is smaller than a k-length set
                if(Array.isArray(population)){
                    var pool = population.slice()
                }else{var pool = _b_.list(population)}
                for(var i=0;i<k;i++){ //invariant:  non-selected at [0,n-i)
                    j = _randbelow(n-i)
                    result[i] = pool[j]
                    pool[j] = pool[n-i-1]   // move non-selected item into vacancy
                }
            }else{
                selected = {}
                for(var i=0;i<k;i++){
                    j = _randbelow(n)
                    while(selected[j]!==undefined){
                        j = _randbelow(n)
                    }
                    selected[j] = true
                    result[i] = Array.isArray(population) ? population[j] :
                                    _b_.getattr(population, '__getitem__')(j)
                }
            }
            return result
        },
            
        seed: function(){
            /*
            Initialize internal state from hashable object.
        
            None or no argument seeds from current time or from an operating
            system specific randomness source if available.
        
            If *a* is an int, all bits are used.
            */
            var $=$B.args('seed',2,{a:null, version:null},['a', 'version'],
                    arguments,{a:new Date(), version:2},null,null),
                a = $.a,
                version = $.version
    
            if(version==1){a = _b_.hash(a)}
            else if(version==2){
                if(_b_.isinstance(a, _b_.str)){
                    a = _b_.int.$dict.from_bytes(_b_.bytes(a, 'utf-8'), 'big')
                }else if(_b_.isinstance(a, [_b_.bytes, _b_.bytearray])){
                    a = _b_.int.$dict.from_bytes(a, 'big')
                }else if(!_b_.isinstance(a, _b_.int)){
                    throw _b_.TypeError('wrong argument')
                }
                if(a.__class__===$B.LongInt.$dict){
                    // In this implementation, seed() only accepts safe integers
                    // Generate a random one from the underlying string value,
                    // using an arbitrary seed (99) to always return the same
                    // integer
                    var numbers = a.value, res = '', pos
                    _random.seed(99)
                    for(var i=0;i<17;i++){
                        pos = parseInt(_random()*numbers.length)
                        res += numbers.charAt(pos)
                    }
                    a = parseInt(res)
                }
            }else{
                throw ValueError('version can only be 1 or 2')
            }
    
            _random.seed(a)
            gauss_next = null
        },
        
        setstate: function(state){
            // Restore internal state from object returned by getstate().
            var $ = $B.args('setstate', 1, {state:null}, ['state'], 
                arguments, {}, null, null)
            var state = _random.getstate()
            if(!Array.isArray($.state)){
                throw _b_.TypeError('state must be a list, not '+
                    $B.get_class($.state).__name__)
            }
            if($.state.length<state.length){
                throw _b_.ValueError("need more than "+$.state.length+
                    " values to unpack")
            }else if($.state.length>state.length){
                throw _b_.ValueError("too many values to unpack (expected "+
                    state.length+")")
            }
            if($.state[0]!=3){
                throw _b_.ValueError("ValueError: state with version "+
                    $.state[0]+" passed to Random.setstate() of version 3")
            }
            var second = _b_.list($.state[1])
            if(second.length!==state[1].length){
                throw _b_.ValueError('state vector is the wrong size')
            }
            for(var i=0;i<second.length;i++){
                if(typeof second[i] != 'number'){
                    throw _b_.ValueError('state vector items must be integers')
                }
            }
            _random.setstate($.state)
        },
    
        shuffle: function(x, random){
            /*
            x, random=random.random -> shuffle list x in place; return None.
    
            Optional arg random is a 0-argument function returning a random
            float in [0.0, 1.0); by default, the standard random.random.
            */
    
            var $ = $B.args('shuffle',2,{x:null,random:null},
                ['x','random'],
                arguments,{random:null},null,null),
                x = $.x,
                random = $.random
    
            if(random===null){random=_random}
    
            if(Array.isArray(x)){
                for(var i=x.length-1;i>=0;i--){
                    j = Math.floor(random() * (i+1))
                    var temp = x[j]
                    x[j] = x[i]
                    x[i] = temp
                }
            }else{
                var len = _b_.getattr(x, '__len__')(), temp,
                    x_get = _b_.getattr(x, '__getitem__'),
                    x_set = _b_.getattr(x, '__setitem__')
                
                for(i=len-1;i>=0;i--){
                    j = Math.floor(random() * (i+1))
                    var temp = x_get(j)
                    x_set(j, x_get(i))
                    x_set(i, temp)
                }
            }
        },
    
        triangular: function(){
            /*
            Triangular distribution.
    
            Continuous distribution bounded by given lower and upper limits,
            and having a given mode value in-between.
    
            http://en.wikipedia.org/wiki/Triangular_distribution
            */
            var $=$B.args('triangular',3,
                {low:null, high:null, mode:null},
                ['low', 'high', 'mode'],
                arguments,{low:0, high:1, mode:null}, null, null),
                low = $.low,
                high = $.high,
                mode = $.mode
                
            var u = _random(),
                c = mode===null ? 0.5 : (mode - low) / (high - low)
            if(u > c){
                u = 1 - u
                c = 1 - c
                var temp = low
                low = high
                high = temp
            }
            return low + (high - low) * Math.pow(u * c, 0.5)
        },
            
        uniform: function(){
            var $ = $B.args('uniform',2,{a:null,b:null},['a','b'],
                arguments,{},null,null),
                a = $B.$GetInt($.a),
                b = $B.$GetInt($.b)
            
            return a + (b-a)*_random()
        },
    
        vonmisesvariate: function(mu, kappa){
            /* Circular data distribution.
    
            mu is the mean angle, expressed in radians between 0 and 2*pi, and
            kappa is the concentration parameter, which must be greater than or
            equal to zero.  If kappa is equal to zero, this distribution reduces
            to a uniform random angle over the range 0 to 2*pi.
    
            */
            // mu:    mean angle (in radians between 0 and 2*pi)
            // kappa: concentration parameter kappa (>= 0)
            // if kappa = 0 generate uniform random angle
    
            // Based upon an algorithm published in: Fisher, N.I.,
            // "Statistical Analysis of Circular Data", Cambridge
            // University Press, 1993.
    
            // Thanks to Magnus Kessler for a correction to the
            // implementation of step 4.
            
            var $=$B.args('vonmisesvariate', 2,
                    {mu: null, kappa:null}, ['mu', 'kappa'],
                    arguments, {}, null, null),
                mu = $.mu,
                kappa = $.kappa,
                TWOPI = 2*Math.PI
    
            if(kappa <= 1e-6){return TWOPI * _random()}
    
            s = 0.5 / kappa
            r = s + Math.sqrt(1.0 + s * s)
    
            while(true){
                u1 = _random()
                z = Math.cos(Math.PI * u1)
    
                d = z / (r + z)
                u2 = _random()
                if((u2 < 1.0 - d * d) || 
                    (u2 <= (1.0 - d) * Math.exp(d))){
                        break
                }
            }
            q = 1.0 / r
            f = (q + z) / (1.0 + q * z)
            u3 = _random()
            if(u3 > 0.5){theta = (mu + Math.acos(f)) % TWOPI}
            else{theta = (mu - Math.acos(f)) % TWOPI}
            return theta
        },
    
        weibullvariate: function(){
            /*Weibull distribution.
    
            alpha is the scale parameter and beta is the shape parameter.
    
            */
            // Jain, pg. 499; bug fix courtesy Bill Arms
    
            var $ = $B.args('weibullvariate', 2, {alpha:null, beta:null},
                    ['alpha', 'beta'], arguments, {}, null, null),
                alpha = $.alpha,
                beta = $.beta
    
            u = 1 - _random()
            return alpha * Math.pow(-Math.log(u), 1/beta)
        },
        
        VERSION: VERSION
    }

    res.lognormvariate = function(){
        /*
        Log normal distribution.
    
        If you take the natural logarithm of this distribution, you'll get a
        normal distribution with mean mu and standard deviation sigma.
        mu can have any value, and sigma must be greater than zero.
    
        */
    
        return Math.exp(res.normalvariate.apply(null, arguments))
    }
    
    res.betavariate = function(){
        /* Beta distribution.
    
        Conditions on the parameters are alpha > 0 and beta > 0.
        Returned values range between 0 and 1.
    
    
        # This version due to Janne Sinkkonen, and matches all the std
        # texts (e.g., Knuth Vol 2 Ed 3 pg 134 "the beta distribution").
        */
        
        var $ = $B.args('betavariate', 2, {alpha:null, beta:null},
                ['alpha', 'beta'], arguments, {}, null, null),
            alpha = $.alpha,
            beta = $.beta
    
        y = res.gammavariate(alpha, 1)
        if(y == 0){return _b_.float(0)}
        else{return y / (y + res.gammavariate(beta, 1))}
    }
    
    return res

}

function Random(){
    var obj = {__class__: Random.$dict}
    Random.$dict.__init__(obj)
    return obj
}
Random.__class__ = $B.$factory
Random.$dict = {
    __class__: $B.$type,
    __name__: 'Random',
    $factory: Random,
    __init__: function(self){self.$r = _Random()},
    __getattribute__: function(self, attr){return self.$r[attr]}
}
Random.$dict.__mro__ = [Random.$dict, $B.builtins.object.$dict]

var $module = _Random()

$module.Random = Random

$module.SystemRandom = function(){
    var f = function(){return {__class__:f.$dict}}
    f.__class__ = $B.$factory
    f.$dict = {
        __class__: $B.$type,
        __name__: 'SystemRandom',
        $factory: f,
        __getattribute__: function(){
            throw $B.builtins.NotImplementedError()
        }
    }
    f.$dict.__mro__ = [f.$dict, $B.builtins.object.$dict]
    return f()
}

return $module

})(__BRYTHON__)

