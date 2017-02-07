class A:
    def __init__(self, x):
        self.x = x

    def f(self):
        return self.x

a = A(1)

for i in range(100000):
    a.f()
