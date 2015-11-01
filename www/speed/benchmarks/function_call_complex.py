def f(x, y=0, *args, **kw):
    return x
for i in range(100000):
    f(i, 5, 6, a=8)

