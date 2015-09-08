# python expressions

1
a = 2
a += 3
b = a - 4
c = b / a
d = b ** 2
c = d // b * (a + c)
r = d % b
b = 3 | 2
b = 2 & -1
a, b = 5, 6


t = True
f = False
b = t and f
b = t or f
b = not f
n = 0 or 2
m = 1 and 50
b = (1+3 and f) or t


b = t == b
b = t is b
b = t != b
b = n < m
b = n > m
b = n <= m
b = n >= m

l = [a, b, c, d]
s = {a, b, c, d}
d = {"a": a, "c": c}
t = (a, c)

if t:
    print("true")

if b:
    print("True")
else:
    print("False")

if b:
    print("true")
elif b:
    print("true")
else:
    print("true")

while m > n:
    m /= n
    print(m)

while m > 0:
    m = m // 2
    print(m)
    while n > 0:
        n = n // 2
    n = m

# loop over list
for i in l:
    print(i)

# loop over list accessing the values
for i in range(len(l)):
    print(l[i])

r = range(2)
# loop over range
for i in r:
    print(i)

[x for x in l]

[x for x in l if x > 20]


def baz():
    pass


def bar(a):
    return a


def biz(a, *args, **kwgs):
    pass


def boo(a=3):
    pass


def buk(a=3):
    global b
    b = 4


def bla():
    for i in range(10):
        print(l[i])


def foo(): print ("in foo")

foo()


def rec(n):
    if (not n):
        return
    print(n)
    rec(n-1)

rec(2)
