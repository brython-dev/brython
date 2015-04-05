import sys

def _f(): pass

FunctionType = type(_f)
assert isinstance(_f, FunctionType)


LambdaType = type(lambda: None)         # Same as FunctionType
assert isinstance(lambda: None, LambdaType)

CodeType = type(_f.__code__)
assert isinstance(_f.__code__, CodeType)

MappingProxyType = type(type.__dict__)
assert isinstance(type.__dict__, MappingProxyType)

SimpleNamespace = type(sys.implementation)
assert isinstance(sys.implementation, SimpleNamespace)

def _g():
    yield 1

GeneratorType = type(_g())
assert isinstance(_g(), GeneratorType)

class _C:
    def _m(self): pass

MethodType = type(_C()._m)
assert(_C()._m, MethodType)

BuiltinFunctionType = type(len)
assert isinstance(len, BuiltinFunctionType)

BuiltinMethodType = type([].append)     # Same as BuiltinFunctionType
assert isinstance([].append, BuiltinMethodType)

ModuleType = type(sys)
assert isinstance(sys, ModuleType)

try:
    raise TypeError
except TypeError:
    tb = sys.exc_info()[2]
    TracebackType = type(tb)
    FrameType = type(tb.tb_frame)

assert isinstance(tb, TracebackType)
assert isinstance(tb.tb_frame, FrameType)

GetSetDescriptorType = type(FunctionType.__code__)
assert isinstance(FunctionType.__code__, GetSetDescriptorType)

MemberDescriptorType = type(FunctionType.__globals__)
assert isinstance(FunctionType.__globals__, MemberDescriptorType)

print("Passed all tests...")
