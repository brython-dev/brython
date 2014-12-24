# issue 5
assert(isinstance(__debug__,bool))

# issue #6 : unknown encoding: windows-1250
s = "Dziś jeść ryby"
b = s.encode('windows-1250')
assert b == b'Dzi\x9c je\x9c\xe6 ryby'
assert b.decode('windows-1250') == "Dziś jeść ryby"

# issue #7 : attribute set on module is not available from inside the module
import inject_name_in_module
inject_name_in_module.xxx = 123
assert inject_name_in_module.xxx == 123
assert inject_name_in_module.yyy() == 246

# issue #15 in PierreQuentel/brython
class a(object):
    def __init__(self):
        self.x = 9
a.__init__
class b(a):
    def __init__(s):
        super().__init__()
        assert s.x==9
z = b()

# issue 12
x = {'a':1}
assert 'a' in x

class ToDir:
    def init(self):
        pass

instanceToDir = ToDir()

dictToDir=({k: getattr(instanceToDir,k) 
    for k in dir(instanceToDir) if '__' not in k})

castdictToDir={str(k): getattr(instanceToDir,k) 
    for k in dir(instanceToDir) if '__' not in k}


assert 'init' in castdictToDir, 'init not in castdictToDir: %s' % list(dictToDir.keys())
assert castdictToDir["init"]==instanceToDir.init , 'init not init method: %s' % castdictToDir["init"]
assert 'init' in dictToDir, 'init not in dictToDir: %s' % list(dictToDir.keys())
assert dictToDir["init"]==instanceToDir.init , 'init not init method: %s' % dictToDir["init"]

# issue 32
assert 5 < 10 < 5 * 10 < 100

# issue 16 : isolate Python Namespacing
i = 5
def foo():
    def bar():
        return i
    res = []
    for i in range(5):
        res.append(bar())
    return res
assert foo() == [0, 1, 2, 3, 4]

# issues 62, 63 and 64
import test_sp

s = 'a = 3'
exec(s, test_sp.__dict__)
assert test_sp.a == 3
del test_sp.__dict__['a']
try:
    test_sp.a
    raise ValueError('should have raised AttributeError')
except AttributeError:
    pass
except:
    raise ValueError('should have raised AttributeError')

#issue 83
import sys
assert sys.version_info > (3,0,0)
assert sys.version_info >= (3,0,0)

assert not sys.version_info == (3,0,0)
assert sys.version_info != (3,0,0)

assert not sys.version_info < (3,0,0)
assert not sys.version_info <= (3,0,0)

print('passed all tests')
