//from browser import window, alert

var $module = (function($B){

_b_ = $B.builtins

var $random_obj = {}

function _rand_with_seed(){
    /*
    # if rand_obj.state is not a safe integer, Math.sin will return the same
    # result for consecutive values : use the rest of division by 360
    */
    degrees = $random_obj._state % 360
    x = Math.sin($random_obj._state) * 10000
    
    /*
    # Adding 1 is not reliable because of current integer implementation
    # If rand_obj._state is not a "safe integer" in the range [-2**53, 2**53]
    # the increment between 2 different values is a power of 2
    # It is stored in an attribute of rand_obj to avoid having to compute it
    # for each iteration
    */
    $random_obj._state += 1
    if($random_obj._state > $B.MAX_SAFE_INTEGER){$random_obj._state = 1}
    return x - Math.floor(x)
}

function _randbelow(x){
    return Math.floor(x*_random())
}

function _random(){
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
        var len, rank
        if(Array.isArray(seq)){len = seq.length}
        else{len = _b_.getattr(seq,'__len__')}
        rank = parseInt(_random()*len)
        if(Array.isArray(seq)){return seq[rank]}
        else{return _b_.getattr(seq,'__getitem__')(rank)}
    },
    
    getrandbits: function(k){
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
        return random_obj._state
    },
    
    randint: function(a, b){
        return parseInt(_random()*(b-a+1)+a)
    },
    
    random: function(){
        // Get the next random number in the range [0.0, 1.0).
        return _random()
    },
    
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

        if(!_b_.hasattr(population, '__len__')){
            throw _b_.TypeError("Population must be a sequence or set.  For dicts, use list(d).")
        }
        n = _b_.getattr(population, '__len__')()
        alert('n '+n)
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
    },
    
    setstate: function(state){
        // Restore internal state from object returned by getstate().
        random_obj._state=state
    },

    shuffle: function(x, random){
        /*
        x, random=random.random -> shuffle list x in place; return None.

        Optional arg random is a 0-argument function returning a random
        float in [0.0, 1.0); by default, the standard random.random.
        */

        if(random===undefined){random=_random}

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

    VERSION: 3
}

})(__BRYTHON__)

