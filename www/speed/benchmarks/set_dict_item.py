a = {0:0}

for i in range(1000000):
    a[0] = i

assert a[0]==999999
