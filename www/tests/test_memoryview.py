b = b'essai'
m = memoryview(b)

assert m[0] == 101
assert m[1:2] == memoryview(b's')
assert m[1:2] != memoryview(b'x')
assert bytes(m[2:4]) == b'sa'

data = bytearray(b'abcefg')
v = memoryview(data)
assert v.tobytes() == b'abcefg'
assert v.hex() == '616263656667'
assert v.format == 'B'
assert v.itemsize == 1
assert v.tolist() == [97, 98, 99, 101, 102, 103]
assert v.shape == (6,)
assert v.strides == (1,)