# "High performance data structures
# "
# copied from pypy repo

#
# Copied and completed from the sandbox of CPython
#   (nondist/sandbox/collections/pydeque.py rev 1.1, Raymond Hettinger)
#
# edited for Brython line 558 : catch ImportError instead of AttributeError

import operator
#try:
#    from thread import get_ident as _thread_ident
#except ImportError:
def _thread_ident():
    return -1


n = 30
LFTLNK = n
RGTLNK = n+1
BLOCKSIZ = n+2

# The deque's size limit is d.maxlen.  The limit can be zero or positive, or
# None.  After an item is added to a deque, we check to see if the size has
# grown past the limit. If it has, we get the size back down to the limit by
# popping an item off of the opposite end.  The methods that can trigger this
# are append(), appendleft(), extend(), and extendleft().

#class deque(object):
class deque:

    def __new__(cls, iterable=(), *args, **kw):
        #fixme
        #self = super(deque, cls).__new__(cls, *args, **kw)
        self=object.__new__(cls, *args, **kw)
        self.clear()
        return self

    def __init__(self, iterable=(), maxlen=None):
        object.__init__(self)
        self.clear()
        if maxlen is not None:
            if maxlen < 0:
                raise ValueError("maxlen must be non-negative")
        self._maxlen = maxlen
        add = self.append
        for elem in iterable:
            add(elem)

    @property
    def maxlen(self):
        return self._maxlen

    def clear(self):
        self.right = self.left = [None] * BLOCKSIZ
        self.rightndx = n//2   # points to last written element
        self.leftndx = n//2+1
        self.length = 0
        self.state = 0

    def append(self, x):
        self.state += 1
        self.rightndx += 1
        if self.rightndx == n:
            newblock = [None] * BLOCKSIZ
            self.right[RGTLNK] = newblock
            newblock[LFTLNK] = self.right
            self.right = newblock
            self.rightndx = 0
        self.length += 1
        self.right[self.rightndx] = x
        if self.maxlen is not None and self.length > self.maxlen:
            self.popleft()

    def appendleft(self, x):
        self.state += 1
        self.leftndx -= 1
        if self.leftndx == -1:
            newblock = [None] * BLOCKSIZ
            self.left[LFTLNK] = newblock
            newblock[RGTLNK] = self.left
            self.left = newblock
            self.leftndx = n-1
        self.length += 1
        self.left[self.leftndx] = x
        if self.maxlen is not None and self.length > self.maxlen:
            self.pop()

    def extend(self, iterable):
        if iterable is self:
            iterable = list(iterable)
        for elem in iterable:
            self.append(elem)

    def extendleft(self, iterable):
        if iterable is self:
            iterable = list(iterable)
        for elem in iterable:
            self.appendleft(elem)

    def pop(self):
        if self.left is self.right and self.leftndx > self.rightndx:
            #raise IndexError, "pop from an empty deque"  # does not work in brython
            raise IndexError("pop from an empty deque")
        x = self.right[self.rightndx]
        self.right[self.rightndx] = None
        self.length -= 1
        self.rightndx -= 1
        self.state += 1
        if self.rightndx == -1:
            prevblock = self.right[LFTLNK]
            if prevblock is None:
                # the deque has become empty; recenter instead of freeing block
                self.rightndx = n//2
                self.leftndx = n//2+1
            else:
                prevblock[RGTLNK] = None
                self.right[LFTLNK] = None
                self.right = prevblock
                self.rightndx = n-1
        return x

    def popleft(self):
        if self.left is self.right and self.leftndx > self.rightndx:
            #raise IndexError, "pop from an empty deque"
            raise IndexError("pop from an empty deque")
        x = self.left[self.leftndx]
        self.left[self.leftndx] = None
        self.length -= 1
        self.leftndx += 1
        self.state += 1
        if self.leftndx == n:
            prevblock = self.left[RGTLNK]
            if prevblock is None:
                # the deque has become empty; recenter instead of freeing block
                self.rightndx = n//2
                self.leftndx = n//2+1
            else:
                prevblock[LFTLNK] = None
                self.left[RGTLNK] = None
                self.left = prevblock
                self.leftndx = 0
        return x

    def count(self, value):
        c = 0
        for item in self:
            if item == value:
                c += 1
        return c

    def remove(self, value):
        # Need to be defensive for mutating comparisons
        for i in range(len(self)):
            if self[i] == value:
                del self[i]
                return
        raise ValueError("deque.remove(x): x not in deque")

    def rotate(self, n=1):
        length = len(self)
        if length == 0:
            return
        halflen = (length+1) >> 1
        if n > halflen or n < -halflen:
            n %= length
            if n > halflen:
                n -= length
            elif n < -halflen:
                n += length
        while n > 0:
            self.appendleft(self.pop())
            n -= 1
        while n < 0:
            self.append(self.popleft())
            n += 1

    def reverse(self):
        "reverse *IN PLACE*"
        leftblock = self.left
        rightblock = self.right
        leftindex = self.leftndx
        rightindex = self.rightndx
        for i in range(self.length // 2):
            # Validate that pointers haven't met in the middle
            assert leftblock != rightblock or leftindex < rightindex

            # Swap
            (rightblock[rightindex], leftblock[leftindex]) = (
                leftblock[leftindex], rightblock[rightindex])

            # Advance left block/index pair
            leftindex += 1
            if leftindex == n:
                leftblock = leftblock[RGTLNK]
                assert leftblock is not None
                leftindex = 0

            # Step backwards with the right block/index pair
            rightindex -= 1
            if rightindex == -1:
                rightblock = rightblock[LFTLNK]
                assert rightblock is not None
                rightindex = n - 1

    def __repr__(self):
        threadlocalattr = '__repr' + str(_thread_ident())
        if threadlocalattr in self.__dict__:
            return 'deque([...])'
        else:
            self.__dict__[threadlocalattr] = True
            try:
                if self.maxlen is not None:
                    return 'deque(%r, maxlen=%s)' % (list(self), self.maxlen)
                else:
                    return 'deque(%r)' % (list(self),)
            finally:
                del self.__dict__[threadlocalattr]

    def __iter__(self):
        return deque_iterator(self, self._iter_impl)

    def _iter_impl(self, original_state, giveup):
        if self.state != original_state:
            giveup()
        block = self.left
        while block:
            l, r = 0, n
            if block is self.left:
                l = self.leftndx
            if block is self.right:
                r = self.rightndx + 1
            for elem in block[l:r]:
                yield elem
                if self.state != original_state:
                    giveup()
            block = block[RGTLNK]

    def __reversed__(self):
        return deque_iterator(self, self._reversed_impl)

    def _reversed_impl(self, original_state, giveup):
        if self.state != original_state:
            giveup()
        block = self.right
        while block:
            l, r = 0, n
            if block is self.left:
                l = self.leftndx
            if block is self.right:
                r = self.rightndx + 1
            for elem in reversed(block[l:r]):
                yield elem
                if self.state != original_state:
                    giveup()
            block = block[LFTLNK]

    def __len__(self):
        #sum = 0
        #block = self.left
        #while block:
        #    sum += n
        #    block = block[RGTLNK]
        #return sum + self.rightndx - self.leftndx + 1 - n
        return self.length

    def __getref(self, index):
        if index >= 0:
            block = self.left
            while block:
                l, r = 0, n
                if block is self.left:
                    l = self.leftndx
                if block is self.right:
                    r = self.rightndx + 1
                span = r-l
                if index < span:
                    return block, l+index
                index -= span
                block = block[RGTLNK]
        else:
            block = self.right
            while block:
                l, r = 0, n
                if block is self.left:
                    l = self.leftndx
                if block is self.right:
                    r = self.rightndx + 1
                negative_span = l-r
                if index >= negative_span:
                    return block, r+index
                index -= negative_span
                block = block[LFTLNK]
        raise IndexError("deque index out of range")

    def __getitem__(self, index):
        block, index = self.__getref(index)
        return block[index]

    def __setitem__(self, index, value):
        block, index = self.__getref(index)
        block[index] = value

    def __delitem__(self, index):
        length = len(self)
        if index >= 0:
            if index >= length:
                raise IndexError("deque index out of range")
            self.rotate(-index)
            self.popleft()
            self.rotate(index)
        else:
            #index = ~index      #todo until bit wise operators are in bython
            index= index^(2**31)
            if index >= length:
                raise IndexError("deque index out of range")
            self.rotate(index)
            self.pop()
            self.rotate(-index)

    def __reduce_ex__(self, proto):
        return type(self), (list(self), self.maxlen)

    def __hash__(self):
        #raise TypeError, "deque objects are unhashable"
        raise TypeError("deque objects are unhashable")

    def __copy__(self):
        return self.__class__(self, self.maxlen)

    # XXX make comparison more efficient
    def __eq__(self, other):
        if isinstance(other, deque):
            return list(self) == list(other)
        else:
            return NotImplemented

    def __ne__(self, other):
        if isinstance(other, deque):
            return list(self) != list(other)
        else:
            return NotImplemented

    def __lt__(self, other):
        if isinstance(other, deque):
            return list(self) < list(other)
        else:
            return NotImplemented

    def __le__(self, other):
        if isinstance(other, deque):
            return list(self) <= list(other)
        else:
            return NotImplemented

    def __gt__(self, other):
        if isinstance(other, deque):
            return list(self) > list(other)
        else:
            return NotImplemented

    def __ge__(self, other):
        if isinstance(other, deque):
            return list(self) >= list(other)
        else:
            return NotImplemented

    def __iadd__(self, other):
        self.extend(other)
        return self


class deque_iterator(object):

    def __init__(self, deq, itergen):
        self.counter = len(deq)
        def giveup():
            self.counter = 0
            #raise RuntimeError, "deque mutated during iteration"
            raise RuntimeError("deque mutated during iteration")
        self._gen = itergen(deq.state, giveup)

    def __next__(self):
        res =  self._gen.__next__()
        self.counter -= 1
        return res

    def __iter__(self):
        return self

class defaultdict(dict):

    def __init__(self, *args, **kwds):
        if len(args) > 0:
            default_factory = args[0]
            args = args[1:]
            if not callable(default_factory) and default_factory is not None:
                raise TypeError("first argument must be callable")
        else:
            default_factory = None
        dict.__init__(self, args, kwds)
        self.default_factory = default_factory
        self.update(args, kwds)
        super(defaultdict, self).__init__(*args, **kwds)

    def __missing__(self, key):
        # from defaultdict docs
        if self.default_factory is None:
            raise KeyError(key)
        self[key] = value = self.default_factory()
        return value

    def __repr__(self, recurse=set()):
        if id(self) in recurse:
            return "defaultdict(...)"
        try:
            recurse.add(id(self))
            return "defaultdict(%s, %s)" % (repr(self.default_factory), super(defaultdict, self).__repr__())
        finally:
            recurse.remove(id(self))

    def copy(self):
        return type(self)(self.default_factory, self)

    def __copy__(self):
        return self.copy()

    def __reduce__(self):
        #
        #__reduce__ must return a 5-tuple as follows:
        #
        #   - factory function
        #   - tuple of args for the factory function
        #   - additional state (here None)
        #   - sequence iterator (here None)
        #   - dictionary iterator (yielding successive (key, value) pairs

        #   This API is used by pickle.py and copy.py.
        #
        return (type(self), (self.default_factory,), None, None, self.items())

from operator import itemgetter as _itemgetter
from keyword import iskeyword as _iskeyword
import sys as _sys

def namedtuple(typename, field_names, verbose=False, rename=False):
    """Returns a new subclass of tuple with named fields.

    >>> Point = namedtuple('Point', 'x y')
    >>> Point.__doc__                   # docstring for the new class
    'Point(x, y)'
    >>> p = Point(11, y=22)             # instantiate with positional args or keywords
    >>> p[0] + p[1]                     # indexable like a plain tuple
    33
    >>> x, y = p                        # unpack like a regular tuple
    >>> x, y
    (11, 22)
    >>> p.x + p.y                       # fields also accessable by name
    33
    >>> d = p._asdict()                 # convert to a dictionary
    >>> d['x']
    11
    >>> Point(**d)                      # convert from a dictionary
    Point(x=11, y=22)
    >>> p._replace(x=100)               # _replace() is like str.replace() but targets named fields
    Point(x=100, y=22)

    """

    # Parse and validate the field names.  Validation serves two purposes,
    # generating informative error messages and preventing template injection attacks.
    if isinstance(field_names, str):
        field_names = field_names.replace(',', ' ').split() # names separated by whitespace and/or commas
    field_names = tuple(map(str, field_names))
    if rename:
        names = list(field_names)
        seen = set()
        for i, name in enumerate(names):
            if (not min(c.isalnum() or c=='_' for c in name) or _iskeyword(name)
                or not name or name[0].isdigit() or name.startswith('_')
                or name in seen):
                    names[i] = '_%d' % i
            seen.add(name)
        field_names = tuple(names)
    for name in (typename,) + field_names:
        if not min(c.isalnum() or c=='_' for c in name):
            raise ValueError('Type names and field names can only contain alphanumeric characters and underscores: %r' % name)
        if _iskeyword(name):
            raise ValueError('Type names and field names cannot be a keyword: %r' % name)
        if name[0].isdigit():
            raise ValueError('Type names and field names cannot start with a number: %r' % name)
    seen_names = set()
    for name in field_names:
        if name.startswith('_') and not rename:
            raise ValueError('Field names cannot start with an underscore: %r' % name)
        if name in seen_names:
            raise ValueError('Encountered duplicate field name: %r' % name)
        seen_names.add(name)

    # Create and fill-in the class template
    numfields = len(field_names)
    argtxt = repr(field_names).replace("'", "")[1:-1]   # tuple repr without parens or quotes
    reprtxt = ', '.join('%s=%%r' % name for name in field_names)

    template = '''class %(typename)s(tuple):
        '%(typename)s(%(argtxt)s)' \n
        __slots__ = () \n
        _fields = %(field_names)r \n
        def __new__(_cls, %(argtxt)s):
            return tuple.__new__(_cls, (%(argtxt)s)) \n
        @classmethod
        def _make(cls, iterable, new=tuple.__new__, len=len):
            'Make a new %(typename)s object from a sequence or iterable'
            result = new(cls, iterable)
            if len(result) != %(numfields)d:
                raise TypeError('Expected %(numfields)d arguments, got %%d' %% len(result))
            return result \n
        def __repr__(self):
            return '%(typename)s(%(reprtxt)s)' %% self \n
        def _asdict(self):
            'Return a new dict which maps field names to their values'
            return dict(zip(self._fields, self)) \n
        def _replace(_self, **kwds):
            'Return a new %(typename)s object replacing specified fields with new values'
            result = _self._make(map(kwds.pop, %(field_names)r, _self))
            if kwds:
                raise ValueError('Got unexpected field names: %%r' %% kwds.keys())
            return result \n
        def __getnewargs__(self):
            return tuple(self) \n\n''' % locals()
    for i, name in enumerate(field_names):
        template += '        %s = _property(_itemgetter(%d))\n' % (name, i)

    if verbose:
        print(template)

    # Execute the template string in a temporary namespace
    namespace = dict(_itemgetter=_itemgetter, __name__='namedtuple_%s' % typename,
                     _property=property, _tuple=tuple)
    try:
        exec(template,namespace)
    except SyntaxError as e:
        raise SyntaxError(e.message + ':\n' + template)
    result = namespace[typename]

    # For pickling to work, the __module__ variable needs to be set to the frame
    # where the named tuple is created.  Bypass this step in enviroments where
    # sys._getframe is not defined (Jython for example) or sys._getframe is not
    # defined for arguments greater than 0 (IronPython).
    try:
        result.__module__ = _sys._getframe(1).f_globals.get('__name__', '__main__')
    except (AttributeError, ValueError):
        pass

    return result

if __name__ == '__main__':
    Point = namedtuple('Point', ['x', 'y'])
    p = Point(11, y=22)
    print(p[0]+p[1])
    x,y=p
    print(x,y)
    print(p.x+p.y)
    print(p)
