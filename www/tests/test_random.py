import random

from tester import assertRaises

random.seed(b'azerty')
x1 = random.random()
assert 0 <= x1 <=1
random.seed(b'azerty')
x2 = random.random()
assert x1 == x2

assert random.random() <= 1
assert random.randint(4, 10) >= 4
assert random.randint(4, 10) >= 4

random.uniform(10,20)

x = list(range(10))
random.shuffle(x)
for i in range(10):
    assert i in x

s = random.sample(x, 5)
assert len(s) == 5
for item in s:
    assert item in x

random.getrandbits(20)

state = random.getstate()
x1 = random.random()
random.setstate(state)
x2 = random.random()
assert x1==x2

tries = 8000
stat = [0,0,0,0,0,0]

for i in range(tries):
    dice = random.randint(1,6)
    stat[dice-1] += 1

print("STATISTICS ON {0} DICE THROWS".format(tries))
print("-----------------------------")
for i in range(0, 6):
    percent = (float(stat[i]) * 100.) / float(tries)
    print("{0} : {1} ({2:.1f}%)".format(i+1, stat[i], percent))

random.triangular(10,20,17)
random.normalvariate(10, 4)
random.lognormvariate(3, 1.6)
random.expovariate(3)
random.vonmisesvariate(2, 1)
random.gauss(10,4)
random.betavariate(10,4)
random.paretovariate(5)
random.weibullvariate(10,6)


# issue 169
first = list(range(20))
random.seed(31416)
random.shuffle(first)
second = list(range(20))
random.seed(31416)
random.shuffle(second)
assert first == second, "Same seed does not produce same random results"

# issue 728
assertRaises(ValueError, random.randint, 1, 0)
assertRaises(ValueError, random.randint, 2, 0)
assertRaises(ValueError, random.randrange, 1, 1)

assert random.randint(1, 1) == 1

# issue 731
from random import randrange
assert set([randrange(1, 4, 1) for i in range(100)]) == set([1, 2, 3])
assert set([randrange(1, 4, 2) for i in range(100)]) == set([1, 3])
assert set([randrange(0, 4, 2) for i in range(100)]) == set([0, 2])
assert set([randrange(0, 5, 2) for i in range(100)]) == set([0, 2, 4])
assert set([randrange(1, 4, 3) for i in range(100)]) == set([1])
assert set([randrange(0, 4, 3) for i in range(100)]) == set([0, 3])
assert set([randrange(0, 5, 3) for i in range(100)]) == set([0, 3])
assert set([randrange(0, 6, 3) for i in range(100)]) == set([0, 3])
assert set([randrange(0, 7, 3) for i in range(100)]) == set([0, 3, 6])
assert set([randrange(1, 4, 3) for i in range(100)]) == set([1])
assert set([randrange(1, 5, 3) for i in range(100)]) == set([1, 4])
assert set([randrange(1, 6, 3) for i in range(100)]) == set([1, 4])
assert set([randrange(1, 7, 3) for i in range(100)]) == set([1, 4])
assert set([randrange(1, 8, 3) for i in range(100)]) == set([1, 4, 7])

# issue 795
n = 10 ** 3

a = [random.randint(0, 10 ** 8) for _ in range(n)]

unique = len(set(a))
assert 100 * unique / n > 99

# issue 1073
def test(func, *args):
    try:
        func(*args)
        raise Exception("should have raised ValueError")
    except:
        pass

for (a, b) in [(1.3, 5), (1, 4.5), (2.2, 3.8)]:
    test(random.randint, a, b)

test(random.randrange, 2.5)

for (a, b) in [(0, 2.5), (0.5, 2)]:
    test(random.randrange, a, b)

random.randint(0, 1.0)
random.randrange(1.0, 3.0, 1.0)

# issue 1121
random.seed(31416)
ch1 = random.choices([0, 1, 2], [2, 1, 1], k = 50)
random.seed(31416)
ch2 = random.choices([0, 1, 2], [2, 1, 1], k = 50)
assert ch1 == ch2

# issue 1268
random.choices('abc', k=2)

# issue 1622
from random import sample
M = sample(range(100), k=4).sort()
assert M is None

# issue 1627
random.randint(2 ** 63, 2 ** 64 - 1)

# issue 2016
assert len(random.randbytes(5)) == 5

print("passed all tests...")