import time
t0 = time.time()

a = [0]

for i in range(1000000):
    a[0] = i

print(time.time()-t0)
