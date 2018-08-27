from tester import assertRaises

assert str(bytes("㋰",'utf-8'))==r"b'\xe3\x8b\xb0'"

assert [hex(c) for c in bytes('abcd','utf-8')] == ['0x61', '0x62', '0x63', '0x64']
assert [hex(c) for c in bytes('€','utf-8')] == ['0xe2', '0x82', '0xac']

z = bytes("девушка","utf-8")
rz = str(z)
sz = r"b'\xd0\xb4\xd0\xb5\xd0\xb2\xd1\x83\xd1\x88\xd0\xba\xd0\xb0'"

assert rz == sz

b=bytearray('abcd','ascii')
b[1]=106
assert str(b) == "bytearray(b'ajcd')"

b = bytearray([0,1,2,3])
del b[1:2]
assert b==bytearray([0,2,3])
b.reverse()
assert b==bytearray([3,2,0])
b.sort()
assert b == bytearray([0,2,3])
b.pop()
assert b == bytearray([0,2])
b.append(5)
assert b == bytearray([0,2,5])
b.insert(1,4)
assert b == bytearray([0,4,2,5])

assert b'-'.join([b'a', b'b']) == b'a-b'

# encoding and decoding
for word in ['donnée','ήλιος','машина','太陽']:
    b = word.encode('utf-8')
    assert b.decode('utf-8') == word

# issue 791
assert int.from_bytes(map(ord, 'abcd'), 'big') == 1633837924

t = [66, 'a']
assertRaises(TypeError, bytes, t, "big")

# mentioned in issue 623
assert b''.join([memoryview(b'foo'), b'bar']) == b'foobar'
assert b''.join([b'bar', memoryview(b'foo')]) == b'barfoo'
assert b''.join([bytearray(b'foo'), b'bar']) == b'foobar'
assert b''.join([b'bar', bytearray(b'foo')]) == b'barfoo'

charmap = bytearray(256)
assert charmap.find(1, 0) == -1
assert charmap.find(0, 0) == 0

assert charmap.rfind(1, 0) == -1
assert charmap.rfind(0, 0) == 255

assertRaises(ValueError, charmap.index, 1)
assert charmap.index(0) == 0

assertRaises(ValueError, charmap.rindex, 1)
assert charmap.rindex(0) == 255

assert b'www.example.com'.partition(b'.') == (b'www', b'.', b'example.com')
assert b'www.example.com'.partition(b'example') == (b'www.', b'example', b'.com')

assert b'www.example.com'.rpartition(b'.') == (b'www.example', b'.', b'com')
assert b'www.example.com'.rpartition(b'example') == (b'www.', b'example', b'.com')

assert b'aBCDEZ'.capitalize() == b'Abcdez'
assert b'zEDCBA'.capitalize() == b'Zedcba'

assert     b'0123456789'.endswith(b'789')
assert not b'0123456789'.endswith(b'7895')
assert not b'0123456789'.endswith(b'78')
assert     b'0123456789'.endswith(b'123', 1, 4)
assert not b'0123456789'.endswith(b'123', 1, 5)
assert not b'0123456789'.endswith(b'123', 1, 3)
assert     b'0123456789'.endswith((b'123', b'456'), 1, 4)
assert     b'0123456789'.endswith((b'123', b'456'), 4, 7)
assert     b'0123456789'.endswith((b'123', b'456'), 1)

print('passed all tests...')