import itertools
import operator

##########################
## Tests for accumulate ##
##########################
a = itertools.accumulate([1,2,3])
assert next(a) == 1
assert next(a) == 3
assert next(a) == 6

a = itertools.accumulate([1,2,3,4], operator.mul)
assert next(a) == 1
assert next(a) == 2
assert next(a) == 6
assert next(a) == 24

assert str(list(a)) == '[]'

a = itertools.accumulate(['a',1,2,3], operator.mul)
assert next(a) == 'a'
assert next(a) == 'a'
assert next(a) == 'aa'
assert next(a) == 'aaaaaa'

a = itertools.accumulate([1,'a',2,3])
#assert list(a) = Should provide a TypeError but there is something wrong in the list conversion

#####################
## Tests for chain ##
#####################
a = itertools.chain('ab','cd')
assert next(a) == 'a'
assert next(a) == 'b'
assert next(a) == 'c'
assert next(a) == 'd'

a = itertools.chain('ab','cd')
assert next(a) == 'a'
assert next(a) == 'b'
assert next(a) == 'c'
assert next(a) == 'd'

a = itertools.chain([1,2],[3,4])
assert next(a) == 1
assert next(a) == 2
assert next(a) == 3
assert next(a) == 4

a = itertools.chain.from_iterable([[1,2],[3,4]])
assert next(a) == 1
assert next(a) == 2
assert next(a) == 3
assert next(a) == 4

a = itertools.chain('ab','cd')
assert list(a) == ['a','b','c','d']

a = itertools.chain.from_iterable(['ab','cd'])
assert list(a) == ['a','b','c','d']

############################
## Tests for combinations ##
############################
a = itertools.combinations('abc', 2)
assert list(a) == [('a','b'),('a','c'),('b','c')]

a = itertools.combinations('abc', 2)
assert next(a) == ('a','b')

a = itertools.combinations(range(3), 2)
assert next(a) == (0,1)

a = itertools.combinations(range(3), 4)
assert list(a) == []

#############################################
## Tests for combinations_with_replacement ##
#############################################
a = itertools.combinations_with_replacement('ABC', 2)
assert list(a) == [('A', 'A'),('A', 'B'),('A', 'C'),('B', 'B'),('B', 'C'),('C', 'C')]

a = itertools.combinations_with_replacement('abc', 2)
assert next(a) == ('a','a')

a = itertools.combinations_with_replacement(range(3), 2)
assert next(a) == (0,0)

a = itertools.combinations_with_replacement(range(3), 4)
assert next(a) == (0,0,0,0)

########################
## Tests for compress ##
########################
a = itertools.compress('abcd', [1,0,1,1])
assert list(a) == ['a','c','d']

a = itertools.compress('abcd', [1,False,1,1])
assert list(a) == ['a','c','d']

a = itertools.compress('abcd', [1,False,'a',1])
assert list(a) == ['a','c','d']

a = itertools.compress('abcd', [1,False,1])
assert list(a) == ['a','c']

#####################
## Tests for count ##
#####################
a = itertools.count(10,1)
assert next(a) == 10
assert next(a) == 11

a = itertools.count(2,0.5)
assert next(a) == 2
assert next(a) == 2.5

#####################
## Tests for cycle ##
#####################
a = itertools.cycle('abc')
assert next(a) == 'a'
assert next(a) == 'b'
assert next(a) == 'c'
assert next(a) == 'a'

a = itertools.cycle(range(3))
assert next(a) == 0
assert next(a) == 1
assert next(a) == 2
assert next(a) == 0
assert next(a) == 1
assert next(a) == 2

#########################
## Tests for dropwhile ##
#########################
a = itertools.dropwhile(lambda x: x<5, [1,4,6,4,1])
assert next(a) == 6
assert next(a) == 4
assert next(a) == 1

a = itertools.dropwhile(lambda x: x == 'p', 'pbrython')
assert list(a) == ['b','r','y','t','h','o','n']

###########################
## Tests for filterfalse ##
###########################
a = itertools.filterfalse(lambda x: x%2, range(10))
assert next(a) == 0
assert next(a) == 2
assert next(a) == 4

a = itertools.filterfalse(lambda x: x == 'p', 'pbprpyptphpopnp')
assert list(a) == ['b','r','y','t','h','o','n']

#######################
## Tests for groupby ##
#######################
a = [k for k, g in itertools.groupby('AAAABBBCCDAABBB')]
assert a == ['A', 'B', 'C', 'D', 'A', 'B']
a = [list(g) for k, g in itertools.groupby('AAAABBBCCD')]
assert a == [['A', 'A', 'A', 'A'], ['B', 'B', 'B'], ['C', 'C'], ['D']]

######################
## Tests for islice ##
######################
a = itertools.islice('abcdefg', 2)
assert list(a) == ['a','b']

a = itertools.islice('abcdefg', 0, 2)
assert list(a) == ['a','b']

a = itertools.islice('abcdefg', 0, 2, 1)
assert list(a) == ['a','b']

a = itertools.islice('abcdefg', 0, None)
assert list(a) == ['a','b','c','d','e','f','g']

a = itertools.islice('abcdefg', None)
assert list(a) == ['a','b','c','d','e','f','g']

a = itertools.islice('abcdefg', 0,100,2)
assert list(a) == ['a','c','e','g']

############################
## Tests for permutations ##
############################
a = itertools.permutations('abc', 2)
assert list(a) == [('a','b'),('a','c'),('b','a'),('b','c'),('c','a'),('c','b')]

a = itertools.permutations('abc', 2)
assert next(a) == ('a','b')

a = itertools.permutations('abc', 5)
assert list(a) == []

########################
## Tests for product  ##
########################
a = itertools.product('abc', '12')
assert list(a) == [('a','1'),('a','2'),('b','1'),('b','2'),('c','1'),('c','2')]

a = itertools.product(range(2), repeat = 3)
assert list(a) == [(0,0,0),(0,0,1),(0,1,0),(0,1,1),(1,0,0),(1,0,1),(1,1,0),(1,1,1)]

a = itertools.product('abc', [2])
assert list(a) == [('a',2),('b',2),('c',2)]

a = itertools.product('abc', [])
assert list(a) == []

a = itertools.product('abc', repeat = 0)
assert list(a) == [()]

#######################
## Tests for repeat  ##
#######################
a = itertools.repeat('abc', 3)
assert list(a) == ['abc','abc','abc']

a = itertools.repeat('abc', -1)
assert list(a) == []

########################
## Tests for starmap  ##
########################
def f1(x,y,z):
    return x+y+z
    
a = itertools.starmap(f1, [(1,2,3),(4,5,6)])
assert list(a) == [6, 15]

a = itertools.starmap(f1, [[1,2,3],[4,5,6]])
assert list(a) == [6, 15]

def func1(*args):
    return sum(args)

a = itertools.starmap(func1, [(1,2,3),(4,5,6)])
assert list(a) == [6, 15]

#########################
## Tests for takewhile ##
#########################
a = itertools.takewhile(lambda x: x<5, [1,4,6,4,1])
assert list(a) == [1,4]

a = itertools.takewhile(lambda x: x!=None, ['a','b','c',None,'d'])
assert list(a) == ['a','b','c']

###################
## Tests for tee ##
###################
r = range(5)
i1, i2 = itertools.tee(r)
assert next(i1) == 0
assert next(i2) == 0
assert next(i1) == 1
assert next(i2) == 1
assert next(i1) == 2
assert next(i2) == 2
assert next(i1) == 3
assert next(i2) == 3
assert next(i1) == 4
assert next(i2) == 4

r = range(2)
i1, i2, i3 = itertools.tee(r, n=3)
assert next(i1) == 0
assert next(i2) == 0
assert next(i3) == 0
assert next(i1) == 1
assert next(i2) == 1
assert next(i3) == 1

###########################
## Tests for zip_longest ##
###########################
a = itertools.zip_longest('ABCD', 'xy', fillvalue='-')
assert next(a) == ('A','x')
assert next(a) == ('B','y')
assert next(a) == ('C','-')
assert next(a) == ('D','-')

a = itertools.zip_longest('ABCD', [1,2,3], '-+')
assert next(a) == ('A',1,'-')
assert next(a) == ('B',2,'+')
assert next(a) == ('C',3,None)
assert next(a) == ('D',None,None)

print("passed all tests...")
