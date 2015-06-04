from browser import window, alert

def _randint(a, b):
    return int(window.Math.random()*(b-a+1)+a)
    
def _rand_with_seed(x, rand_obj):
    # if rand_obj.state is not a safe integer, Math.sin will return the same
    # result for consecutive values : use the rest of division by 360
    degrees = rand_obj._state % 360
    x = window.Math.sin(degrees/(2*window.Math.PI)) * 10000
    # Adding 1 is not reliable because of current integer implementation
    # If rand_obj._state is not a "safe integer" in the range [-2**53, 2**53]
    # the increment between 2 different values is a power of 2
    # It is stored in an attribute of rand_obj to avoid having to compute it
    # for each iteration
    if not hasattr(rand_obj, 'incr'):
        rand_obj.incr = 1
    rand_obj._state += rand_obj.incr
    return x - window.Math.floor(x)

def _urandom(n, rand_obj=None):
    """urandom(n) -> str    
    Return n random bytes suitable for cryptographic use."""
    
    if rand_obj is None or rand_obj._state is None:
        randbytes= [_randint(0,255) for i in range(n)]
    else:
        randbytes= []
        for i in range(n):
            randbytes.append(int(256*_rand_with_seed(i, rand_obj)))
    return bytes(randbytes)
    
class Random:
    """Random number generator base class used by bound module functions.

    Used to instantiate instances of Random to get generators that don't
    share state.

    Class Random can also be subclassed if you want to use a different basic
    generator of your own devising: in that case, override the following
    methods:  random(), seed(), getstate(), and setstate().
    Optionally, implement a getrandbits() method so that randrange()
    can cover arbitrarily large ranges.

    """
    #random
    #seed
    #getstate
    #setstate


    VERSION = 3     # used by getstate/setstate

    def __init__(self, x=None):
        """Initialize an instance.

        Optional argument x controls seeding, as for Random.seed().
        """

        self._state=x

    def seed(self, a=None, version=2):
        """Initialize internal state from hashable object.

        None or no argument seeds from current time or from an operating
        system specific randomness source if available.

        For version 2 (the default), all of the bits are used if *a* is a str,
        bytes, or bytearray.  For version 1, the hash() of *a* is used instead.

        If *a* is an int, all bits are used.

        """

        self._state=a
        self.gauss_next = None

    def getstate(self):
        """Return internal state; can be passed to setstate() later."""
        return self._state

    def setstate(self, state):
        """Restore internal state from object returned by getstate()."""
        self._state=state

    def random(self):
        """Get the next random number in the range [0.0, 1.0)."""
        return window.Math.random()

    def getrandbits(self, k):
        """getrandbits(k) -> x.  Generates a long int with k random bits."""
        if k <= 0:
            raise ValueError('number of bits must be greater than zero')
        if k != int(k):
            raise TypeError('number of bits should be an integer')
        numbytes = (k + 7) // 8                       # bits / 8 and rounded up
        x = int.from_bytes(_urandom(numbytes, self), 'big')
            
        return x >> (numbytes * 8 - k)                # trim excess bits
