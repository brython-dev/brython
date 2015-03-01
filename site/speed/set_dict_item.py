import time
t0 = time.time()

a = {0:0}

for i in range(1000000):
    a[0] = i

assert a[0]==999999

print(time.time()-t0)
