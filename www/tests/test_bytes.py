from tester import assert_raises

assert b''.join([memoryview(b'foo'), b'bar']) == b'foobar'
assert b''.join([b'bar', memoryview(b'foo')]) == b'barfoo'
assert b''.join([bytearray(b'foo'), b'bar']) == b'foobar'
assert b''.join([b'bar', bytearray(b'foo')]) == b'barfoo'

assert_raises(TypeError, bytes, [memoryview(b'foo'), b'bar'])

assert str(bytes("㋰",'utf-8')) == r"b'\xe3\x8b\xb0'"

assert [hex(c) for c in bytes('abcd', 'utf-8')] == \
    ['0x61', '0x62', '0x63', '0x64']
assert [hex(c) for c in bytes('€', 'utf-8')] == ['0xe2', '0x82', '0xac']

z = bytes("девушка","utf-8")
rz = str(z)
sz = r"b'\xd0\xb4\xd0\xb5\xd0\xb2\xd1\x83\xd1\x88\xd0\xba\xd0\xb0'"

assert rz == sz

b = bytearray('abcd', 'ascii')
b[1] = 106
assert str(b) == "bytearray(b'ajcd')"

b = bytearray([0, 1, 2, 3])
del b[1:2]
assert b == bytearray([0, 2, 3]), b
b.reverse()
assert b == bytearray([3, 2, 0])
assert_raises(AttributeError, getattr, b, "sort")
b.pop()
assert b == bytearray([3, 2]), b
b.append(5)
assert b == bytearray([3, 2, 5])
b.insert(1, 4)
assert b == bytearray([3, 4, 2, 5])

assert b'-'.join([b'a', b'b']) == b'a-b'

# encoding and decoding
for word in ['donnée', 'ήλιος', 'машина', '太陽']:
    b = word.encode('utf-8')
    assert b.decode('utf-8') == word

# issue 791
assert int.from_bytes(map(ord, 'abcd'), 'big') == 1633837924

t = [66, 'a']
assert_raises(TypeError, bytes, t, "big")

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

assert_raises(ValueError, charmap.index, 1)
assert charmap.index(0) == 0

assert_raises(ValueError, charmap.rindex, 1)
assert charmap.rindex(0) == 255

assert b'www.example.com'.partition(b'.') == (b'www', b'.', b'example.com')
assert b'www.example.com'.partition(b'example') == \
    (b'www.', b'example', b'.com')

assert b'www.example.com'.rpartition(b'.') == (b'www.example', b'.', b'com')
assert b'www.example.com'.rpartition(b'example') == \
    (b'www.', b'example', b'.com')

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
assert not b'0123456789'.endswith((b'123', b'456'), 1)

assert b'test\x09test'.expandtabs() == b'test    test', b'test\x09test'.expandtabs()
assert b'test\x09test'.expandtabs(4) == b'test    test'
assert b'test\x09test'.expandtabs(2) == b'test  test'
assert b'test\x09\x09test'.expandtabs(2) == b'test    test'

assert b'Hello World'.swapcase() == b'hELLO wORLD'

assert b'threewordsalluppercase'.islower()
assert not b'ONE WORD ALL LOWERCASE'.islower()
assert not b''.islower()
assert not b'aA'.islower()

assert not b'threewordsalluppercase'.isupper()
assert b'ONE WORD ALL LOWERCASE'.isupper()
assert not b''.isupper()
assert not b'aA'.isupper()

assert b'   '.isspace()
assert not b'  -  '.isspace()
assert b' \t\n\r\x0b\f'.isspace()

assert b"they're bill's friends from the UK".title() == \
    b"They'Re Bill'S Friends From The Uk"

assert b"They'Re Bill'S Friends From The Uk".istitle()
assert not b"They're Bill's Friends from the Uk".istitle()

assert b'45'.zfill(5) == b'00045'
assert b'+45'.zfill(5) == b'+0045'
assert b'-45'.zfill(5) == b'-0045'
assert b''.zfill(5) == b'00000'

assert b'1234'.isdigit()
assert not b'1.23'.isdigit()
assert not b''.isdigit()

assert b'ABCabc'.isalpha()
assert not b'ABCabc1'.isalpha()
assert not b''.isalpha()

assert b'ABCabc1'.isalnum()
assert not b'ABC abc1'.isalnum()
assert not b''.isalnum()

assert b'one\ntwo\nthree'.splitlines() == [b'one', b'two', b'three']
assert b'one\rtwo\rthree'.splitlines() == [b'one', b'two', b'three']
assert b'one\r\ntwo\r\nthree'.splitlines() == [b'one', b'two', b'three']
assert b'one\ntwo\nthree'.splitlines(True) == \
    [b'one\x0a', b'two\x0a', b'three']
assert b'one\rtwo\rthree'.splitlines(True) == \
    [b'one\x0d', b'two\x0d', b'three']
assert b'one\r\ntwo\r\nthree'.splitlines(True) == \
    [b'one\x0d\x0a', b'two\x0d\x0a', b'three']
assert b''.splitlines() == []
assert b''.splitlines(True) == []

assert b'45'.rjust(5) == b'   45'
assert b'45'.rjust(5, b'#') == b'###45'
assert b'45'.rjust(2) == b'45'
assert b'45'.rjust(1) == b'45'
assert b'45'.rjust(0) == b'45'

assert b'45'.ljust(5) == b'45   '
assert b'45'.ljust(5, b'#') == b'45###'
assert b'45'.ljust(2) == b'45'
assert b'45'.ljust(1) == b'45'
assert b'45'.ljust(0) == b'45'

assert b'45'.center(6) == b'  45  '
assert b'45'.center(5) == b'  45 '
assert b'45'.center(4) == b' 45 '
assert b''.center(4) == b'    '

assert b'122333444455555'.count(b'4') == 4
assert b'122333444455555'.count(b'#') == 0
assert b''.count(b'#') == 0
b'1 22 333 4444 55555'.count(b' ') == 4
b'1 22 333 4444 55555'.count(32) == 4

# issue 972
assert b'a' in b'a'

# issue 1070
try:
    b"\xff".decode('utf-8')
    raise Exception("should have raised UnicodeDecodeError")
except UnicodeDecodeError:
    pass

# issue 1090
assert bytes.fromhex('2Ef0 F1f2 ') == b'.\xf0\xf1\xf2'
assert bytearray.fromhex('2Ef0 F1f2 ') == bytearray(b'.\xf0\xf1\xf2')

# issue 1091
assert bytearray(b'\x07\xf0\xf1\xf2').hex() == "07f0f1f2"

# % formatting (PEP 461)
assert b'%x' %10 == b'a'
assert b'%4x' % 10 == b'   a'
assert b'%#4x' % 10 == b' 0xa'
assert b'%c' % 48 == b'0'
assert b'%c' % b'a' == b'a'
assert b'%b' % b'abc' == b'abc'
assert b'%b' % 'some string'.encode('utf8') == b'some string'
try:
    b'%b' % 3.14
    raise Exception("should have raised TypeError")
except TypeError:
    pass

try:
    b'%b' % 'hello world!'
    raise Exception("should have raised TypeError")
except TypeError:
    pass

assert b'%a' % 3.14 == b'3.14'
assert b'%a' % b'abc' == b"b'abc'"
assert b'%a' % 'def' == b"'def'"

# issue 1306
bstrs = [b'', b' ', b'\n', b'\n\n', b'a\nb', b'one\ntwo\nthree',
         b'one\ntwo\nthree\n', b'one\ntwo\nthree\n\n']
good = [
[], [],
[], [],
[], [],
[b' '], [b' '],
[b' '], [b' '],
[b' '], [b' '],
[b''], [b'\n'],
[b''], [b'\r'],
[b''], [b'\r\n'],
[b'', b''], [b'\n', b'\n'],
[b'', b''], [b'\r', b'\r'],
[b'', b''], [b'\r\n', b'\r\n'],
[b'a', b'b'], [b'a\n', b'b'],
[b'a', b'b'], [b'a\r', b'b'],
[b'a', b'b'], [b'a\r\n', b'b'],
[b'one', b'two', b'three'], [b'one\n', b'two\n', b'three'],
[b'one', b'two', b'three'], [b'one\r', b'two\r', b'three'],
[b'one', b'two', b'three'], [b'one\r\n', b'two\r\n', b'three'],
[b'one', b'two', b'three'], [b'one\n', b'two\n', b'three\n'],
[b'one', b'two', b'three'], [b'one\r', b'two\r', b'three\r'],
[b'one', b'two', b'three'], [b'one\r\n', b'two\r\n', b'three\r\n'],
[b'one', b'two', b'three', b''], [b'one\n', b'two\n', b'three\n', b'\n'],
[b'one', b'two', b'three', b''], [b'one\r', b'two\r', b'three\r', b'\r'],
[b'one', b'two', b'three', b''], [b'one\r\n', b'two\r\n', b'three\r\n', b'\r\n']
]
ii = 0
for ss in bstrs:
    for sep in (b'\n', b'\r', b'\r\n'):
        ss_ = ss.replace(b'\n', sep)
        for args in ((), (True,)):
            ll = ss_.splitlines(*args)
            if ll != good[ii]:
                raise AssertionError('%s%s => %s != %s' % (
                    repr(ss_), ' (keepends)' if args==(True,) else '', ll, good[ii]))
            ii += 1

# issue 1339

seq1 =  [0, 1, 2]
seq2 =  '\x00\x01\x02'
seq3 = b'\x00\x01\x02'
class foo:
    def __init__(self, x):
        self.x = x
    def __index__(self):
        return self.x

assert seq1[foo(1):] == seq1[1:]
assert seq2[foo(1):] == seq2[1:]
assert seq3[foo(1):] == seq3[1:]

# PEP 616
b = b'beforeremove'
assert b.removeprefix(b"before") == b"remove"
assert b.removeprefix(b"z") == b

b = b"removeafter"
assert b.removesuffix(b"after") == b"remove"
assert b == b"removeafter"

assert b.removesuffix(b"z") == b

# issue 1744
assert b'UUDDLRLRAB'.hex(' ', 4) == '5555 44444c52 4c524142'
assert b'UUDDLRLRAB'.hex(' ', -4) == '55554444 4c524c52 4142'
assert b'UUDDLRLRAB'.hex('-', 4) == '5555-44444c52-4c524142'
assert b'UUDDLRLRAB'.hex(':', -4) == '55554444:4c524c52:4142'

# issue 2017
class Foo:
    def __bytes__(self) -> bytes:
        return b"Bar"

assert bytes(Foo()) == b"Bar"

class WrongBytes:
    def __bytes__(self) -> bytes:
        return "Bar"

assert_raises(TypeError, bytes, WrongBytes())

print('passed all tests...')