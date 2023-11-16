// Javascript implementation of the _random module
// Based on Ian Bicking's implementation of the Mersenne twister

(function($B){

var _b_ = $B.builtins

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
    var N = 624
    var M = 397
    var MATRIX_A = 0x9908b0df   /* constant vector a */
    var UPPER_MASK = 0x80000000 /* most significant w-r bits */
    var LOWER_MASK = 0x7fffffff /* least significant r bits */
    //c//static unsigned long mt[N]; /* the array for the state vector  */
    //c//static int mti=N+1; /* mti==N+1 means mt[N] is not initialized */
    var mt = new Array(N)   /* the array for the state vector  */
    var mti = N + 1           /* mti==N+1 means mt[N] is not initialized */

    function unsigned32(n1){
        // returns a 32-bits unsiged integer from an operand to which applied a
        // bit operator.
        return n1 < 0 ? (n1 ^ UPPER_MASK) + UPPER_MASK : n1
    }

    function subtraction32(n1, n2){
    // emulates lowerflow of a c 32-bits unsiged integer variable, instead of
    // the operator -. these both arguments must be non-negative integers
    // expressible using unsigned 32 bits.
        return n1 < n2 ? unsigned32((0x100000000 - (n2 - n1)) & 0xffffffff) :
          n1 - n2
    }

    function addition32(n1, n2){
        // emulates overflow of a c 32-bits unsiged integer variable, instead of
        // the operator +. these both arguments must be non-negative integers
        // expressible using unsigned 32 bits.
        return unsigned32((n1 + n2) & 0xffffffff)
    }

    function multiplication32(n1, n2){
        // emulates overflow of a c 32-bits unsiged integer variable, instead of the
        // operator *. these both arguments must be non-negative integers
        // expressible using unsigned 32 bits.
        var sum = 0
        for (var i = 0; i < 32; ++i){
            if((n1 >>> i) & 0x1){
                sum = addition32(sum, unsigned32(n2 << i))
            }
        }
        return sum
    }

    /* initializes mt[N] with a seed */
    //c//void init_genrand(unsigned long s)
    function init_genrand(s) {
        //c//mt[0]= s & 0xffffffff;
        mt[0] = unsigned32(s & 0xffffffff)
        for(mti = 1; mti < N; mti++){
            mt[mti] =
                //c//(1812433253 * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti);
                addition32(multiplication32(1812433253,
                    unsigned32(mt[mti - 1] ^ (mt[mti - 1] >>> 30))), mti)
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
        var i, j, k
        init_genrand(19650218)
        i = 1
        j = 0
        k = (N > key_length ? N : key_length)
        for(; k; k--){
          //c//mt[i] = (mt[i] ^ ((mt[i-1] ^ (mt[i-1] >> 30)) * 1664525))
          //c// + init_key[j] + j; /* non linear */
          mt[i] = addition32(
              addition32(unsigned32(mt[i] ^
                  multiplication32(unsigned32(mt[i - 1] ^ (mt[i - 1] >>> 30)),
                  1664525)),
              init_key[j]), j)
          mt[i] =
              //c//mt[i] &= 0xffffffff; /* for WORDSIZE > 32 machines */
              unsigned32(mt[i] & 0xffffffff)
          i++
          j++
          if(i >= N){mt[0] = mt[N - 1]; i = 1}
          if(j >= key_length){j = 0}
        }
        for(k = N - 1; k; k--){
            //c//mt[i] = (mt[i] ^ ((mt[i-1] ^ (mt[i-1] >> 30)) * 1566083941))
            //c//- i; /* non linear */
            mt[i] = subtraction32(
                unsigned32(
                    (mt[i]) ^
                        multiplication32(
                            unsigned32(mt[i - 1] ^ (mt[i - 1] >>> 30)),
                    1566083941)),
                i
            )
            //c//mt[i] &= 0xffffffff; /* for WORDSIZE > 32 machines */
            mt[i] = unsigned32(mt[i] & 0xffffffff)
            i++
            if(i >= N){mt[0] = mt[N - 1]; i = 1}
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

        if(mti >= N){ /* generate N words at one time */
            //c//int kk;
            var kk

            if(mti == N + 1){   /* if init_genrand() has not been called, */
              init_genrand(Date.now()) /* a default initial seed is used */
            }

            for(kk = 0; kk < N - M; kk++){
              //c//y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
              //c//mt[kk] = mt[kk+M] ^ (y >> 1) ^ mag01[y & 0x1];
              y = unsigned32((mt[kk]&UPPER_MASK) | (mt[kk + 1]&LOWER_MASK))
              mt[kk] = unsigned32(mt[kk + M] ^ (y >>> 1) ^ mag01[y & 0x1])
            }
            for(;kk < N - 1; kk++){
              //c//y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
              //c//mt[kk] = mt[kk+(M-N)] ^ (y >> 1) ^ mag01[y & 0x1];
              y = unsigned32((mt[kk]&UPPER_MASK) | (mt[kk + 1]&LOWER_MASK))
              mt[kk] = unsigned32(mt[kk + (M - N)] ^ (y >>> 1) ^ mag01[y & 0x1])
            }
            //c//y = (mt[N-1]&UPPER_MASK)|(mt[0]&LOWER_MASK);
            //c//mt[N-1] = mt[M-1] ^ (y >> 1) ^ mag01[y & 0x1];
            y = unsigned32((mt[N - 1] & UPPER_MASK) | (mt[0] & LOWER_MASK))
            mt[N - 1] = unsigned32(mt[M - 1] ^ (y >>> 1) ^ mag01[y & 0x1])
            mti = 0
        }

        y = mt[mti++]

        /* Tempering */
        //c//y ^= (y >> 11);
        //c//y ^= (y << 7) & 0x9d2c5680;
        //c//y ^= (y << 15) & 0xefc60000;
        //c//y ^= (y >> 18);
        y = unsigned32(y ^ (y >>> 11))
        y = unsigned32(y ^ ((y << 7) & 0x9d2c5680))
        y = unsigned32(y ^ ((y << 15) & 0xefc60000))
        y = unsigned32(y ^ (y >>> 18))

        return y
    }

    /* generates a random number on [0,0x7fffffff]-interval */
    //c//long genrand_int31(void)
    function genrand_int31(){
        //c//return (genrand_int32()>>1);
        return (genrand_int32()>>>1)
    }

    /* generates a random number on [0,1]-real-interval */
    //c//double genrand_real1(void)
    function genrand_real1(){
        return genrand_int32()*(1.0/4294967295.0)
        /* divided by 2^32-1 */
    }

    /* generates a random number on [0,1)-real-interval */
    //c//double genrand_real2(void)
    function genrand_real2(){
        return genrand_int32() * (1.0 / 4294967296.0)
        /* divided by 2^32 */
    }

    /* generates a random number on (0,1)-real-interval */
    //c//double genrand_real3(void)
    function genrand_real3() {
        return ((genrand_int32()) + 0.5) * (1.0 / 4294967296.0)
        /* divided by 2^32 */
    }

    /* generates a random number on [0,1) with 53-bit resolution*/
    //c//double genrand_res53(void)
    function genrand_res53() {
        //c//unsigned long a=genrand_int32()>>5, b=genrand_int32()>>6;
        var a = genrand_int32() >>> 5,
            b = genrand_int32() >>> 6
        return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0)
    }
    /* These real versions are due to Isaku Wada, 2002/01/09 added */

    var random = genrand_res53

    random.seed = function(seed){
        if(seed === undefined || $B.is_none(seed)){
            const entries = new Uint32Array(N)
            crypto.getRandomValues(entries)
            init_by_array(Array.from(entries), N)
            return
        }

        if(!$B.$isinstance(seed, _b_.int)){
            seed = _b_.hash(seed)
        }

        // Transform to long integer
        if(typeof seed == "number"){
            seed = BigInt(seed)
        }else if(seed.__class__ === $B.long_int){
            seed = seed.value
        }else{
            return random.seed(seed.$brython_value)
        }

        // Take abs(seed)
        seed = seed > 0 ? seed : -seed

        var keys = []
        var int32_1 = 2n ** 32n - 1n

        // decomposition in factors of 2 ** 32
        while(seed >= int32_1){
            var quot = seed / int32_1,
                rest = seed % int32_1
            // Rest is a JS number (< 2 ** 32)
            keys.push(Number(rest))
            // Quotient is either a JS number or a instance of long_int
            // but seed must be long_int
            seed = quot
        }
        keys.push(Number(seed))

        init_by_array(keys, keys.length)
    }

    random.seed(seed)

    random.int31 = genrand_int31
    random.int32 = genrand_int32
    random.real1 = genrand_real1
    random.real2 = genrand_real2
    random.real3 = genrand_real3
    random.res53 = genrand_res53

    // Added for compatibility with Python
    random.getstate = function(){
        return $B.fast_tuple(mt.concat([mti]))
    }

    random.setstate = function(state){
        mt = state.slice(0, state.length - 1)
        mti = state[state.length - 1]
    }

    return random

}

var Random = $B.make_class("Random",
    function(){
        return {
            __class__: Random,
            _random: RandomStream(Date.now())
        }
    }
)

Random.getrandbits = function(){
    var $ = $B.args("getrandbits", 2, {self: null, k:null}, ["self", "k"],
        arguments, {}, null, null),
        self = $.self,
        k = $B.$GetInt($.k)

    if(k < 0)
        throw _b_.ValueError.$factory('number of bits must be non-negative')

    if(k === 0)
        return 0

    const words = Math.floor((k - 1) / 32) + 1
    const wordarray = new ArrayBuffer(words * 4)
    const wordarray_view = new DataView(wordarray)

    /* Fill-out bits of long integer, by 32-bit words, from least significant
       to most significant. */
    for(i = 0; i < words; i++, k -= 32){
        r = self._random.int32()
        if (k < 32)
            r >>>= (32 - k)  /* Drop least significant bits */
        wordarray_view.setUint32(i * 4, r, true)
    }

    return _b_.int.from_bytes(_b_.bytes.$factory(Array.from(new Uint8Array(wordarray))), "little")
}

Random.getstate = function(){
    var $ = $B.args('getstate', 1, {self: null},
        ["self"], arguments, {}, null, null),
        self = $.self
    return self._random.getstate()
}

Random.random = function(){
    var $ = $B.args('random', 1, {self: null}, ["self"],
        arguments, {}, null, null),
        self = $.self
    return $B.fast_float(self._random())
}

Random.seed = function(){
    var $ = $B.args('seed', 2, {self: null, n: null}, ['self', 'n'],
        arguments, {}, null, null),
        self = $.self,
        n = $.n

    if (self._random === undefined)
        self._random = RandomStream(n)
    else
        self._random.seed(n)
}

Random.setstate = function(){
    var $ = $B.args('setstate', 2, {self: null, state:null}, ['self', 'state'],
        arguments, {}, null, null),
        self = $.self,
        state = $.state
    return self._random.setstate(state)
}

$B.set_func_names(Random, "_random")

$B.imported._random = { Random }

})(__BRYTHON__)
