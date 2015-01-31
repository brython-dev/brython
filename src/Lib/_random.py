from browser import window

def _randint(a, b):
    return int(window.Math.random()*(b-a+1)+a)
    
def _urandom(n):
    """urandom(n) -> str    
    Return n random bytes suitable for cryptographic use."""
    randbytes= [_randint(0,255) for i in range(n)]
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
        x = int.from_bytes(_urandom(numbytes), 'big')
        return x >> (numbytes * 8 - k)                # trim excess bits
