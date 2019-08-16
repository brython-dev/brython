class A:
    def __init__(self, x):
        self.x = x

for i in range(100000):
    A(i)
