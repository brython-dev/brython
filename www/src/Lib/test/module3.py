class Integral:
    def __int__(self):
        return 42

for base in [object]:
    class TruncReturnsNonInt(base):
        def __trunc__(self):
            return Integral()

assert int(TruncReturnsNonInt()) == 42

class TruncReturnsTrunc:
    def __trunc__(self):
        return '56' #TruncReturnsTrunc()

int(TruncReturnsTrunc())
