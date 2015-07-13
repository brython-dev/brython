import random

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
