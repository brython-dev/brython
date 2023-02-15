class A:
    
    def f(self):
        pass

a = A()
for i in range(100000):
    a.f()
