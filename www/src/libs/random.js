//from browser import window, alert

var $module = (function($B){

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

  var random = genrand_real2;

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
  random.getstate = function(){return [mt, mti]}
  random.setstate = function(state){
    mt = state[0]
    mti = state[1]
  }

  return random;

}


var _random = RandomStream()

_b_ = $B.builtins

var $random_obj = {}

function _rand_with_seed(){
    /*
    # if rand_obj.state is not a safe integer, Math.sin will return the same
    # result for consecutive values : use the rest of division by 360
    */
    degrees = $random_obj._state % 360
    x = Math.sin($random_obj._state) * 10000

    $random_obj._state += 1
    if($random_obj._state > $B.MAX_SAFE_INTEGER){$random_obj._state = 1}
    return x - Math.floor(x)
}

function _randbelow(x){
    return Math.floor(x*_random())
}

function __random(){
    if($random_obj._state!==undefined){return _rand_with_seed()}
    else{return Math.random()}
}

function _urandom(n){
    /*
    urandom(n) -> str
    Return n random bytes suitable for cryptographic use.
    */
    
    if($random_obj._state===undefined){
        randbytes= []
        for(i=0;i<n;i++){randbytes.push(randint(0,255))}
    }else{
        randbytes= []
        for(i=0;i<n;i++){
            var item = _rand_with_seed(i)
            randbytes.push(parseInt(256*item))
        }
    }
    return _b_.bytes(randbytes)
}

return {
    choice: function(seq){
        var $ = $B.$MakeArgs1('choice', 1,
            {seq:null},['seq'],arguments, {}, null, null),
            seq = $.seq
        var len, rank
        if(Array.isArray(seq)){len = seq.length}
        else{len = _b_.getattr(seq,'__len__')}
        if(len==0){throw _b_.IndexError("Cannot choose from an empty sequence")}
        rank = parseInt(_random()*len)
        if(Array.isArray(seq)){return seq[rank]}
        else{return _b_.getattr(seq,'__getitem__')(rank)}
    },
    
    getrandbits: function(k){
        var $ = $B.$MakeArgs1('getrandbits', 1,
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
        var $ = $B.$MakeArgs1('getstate', 0, {}, [], arguments, {}, null, null)
        return _random.getstate()
    },
    
    randint: function(a, b){
        var $ = $B.$MakeArgs1('randint', 2,
            {a:null, b:null},
            ['a', 'b'],
            arguments, {}, null, null)
        return parseInt(_random()*($.b-$.a+1)+$.a)
    },
    
    random: _random,
    
    randrange: function(){
        var $ = $B.$MakeArgs1('randrange', 3,
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
        var nb = Math.floor((stop-start)/step)
        return start + Math.floor(_random()*nb)*step
    },

    sample: function(population, k){
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
        var $ = $B.$MakeArgs1('sample',2,{population:null,k:null},
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
            pool = _b_.list(population)
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
        
    seed: function(a){
        /*
        Initialize internal state from hashable object.
    
        None or no argument seeds from current time or from an operating
        system specific randomness source if available.
    
        If *a* is an int, all bits are used.
        */
        var $=$B.$MakeArgs1('seed',1,{a:null},['a'],arguments,{},null,null)
    
        $random_obj._state = $.a
        $random_obj.gauss_next = _b_.None
        _random.seed($.a)
    },
    
    setstate: function(state){
        // Restore internal state from object returned by getstate().
        var $ = $B.$MakeArgs1('setstate', 1, {state:null}, ['state'], 
            arguments, {}, null, null)
        _random.setstate($.state)
    },

    shuffle: function(x, random){
        /*
        x, random=random.random -> shuffle list x in place; return None.

        Optional arg random is a 0-argument function returning a random
        float in [0.0, 1.0); by default, the standard random.random.
        */

        var $ = $B.$MakeArgs1('shuffle',2,{x:null,random:null},
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
    
    uniform: function(){
        var $ = $B.$MakeArgs1('uniform',2,{a:null,b:null},['a','b'],
            arguments,{},null,null),
            a = $B.$GetInt($.a),
            b = $B.$GetInt($.b)
        
        return a + (b-a)*_random()
    },

    VERSION: 3
}

})(__BRYTHON__)

