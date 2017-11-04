import struct

def test1():
    #    https://github.com/brython-dev/brython/issues/263
    #    struct.pack() raises an OverflowError when it shouldn't

    #    > indicates big-endian alignment
    #    q is long long
    #    ASCII 42 is *
    x = struct.pack('>q', 42)
    assert( x == b'\x00\x00\x00\x00\x00\x00\x00*' )


def test2():
    packed = struct.pack("Bf", 1,2)
    assert( len(packed) == 8 )

    unpacked = struct.unpack("Bf", packed)
    assert( unpacked == (1,2.0) )


def test3():
    class X(object):
        def __init__(self, a,b):
            self.a, self.b = a,b  # ubyte, float
        def __eq__(self, other):
            return  self.a == other.a  and  abs(self.b - other.b) < 1e-6

    x = [ X(1, .1), X(2, .2) ]
    fmt = "=Bf"

    x_bytes = struct.calcsize(fmt)
    assert( x_bytes == 5 )

    buf = bytearray( len(x) * x_bytes )

    for i,n in enumerate(x):
        struct.pack_into( fmt, buf, i*x_bytes,  n.a, n.b )

    back = []
    count = int( len(buf) / x_bytes )
    for i in range(count):
        ab = struct.unpack_from( fmt, buf, i*x_bytes )
        back += [ X(*ab) ]

    assert( back == x )


test1()
test2()
test3()

# issue 687
assert struct.unpack('I', struct.pack ('I', 1234)) == (1234,)
