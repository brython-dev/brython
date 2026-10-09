import io

from tester import assert_raises


# issue 1047
s = io.StringIO()
s.write(chr(8364))
assert s.getvalue() == "€"
s = chr(8364)
assert s == "€"
b = s.encode("utf-8")
assert b == bytes([0xe2, 0x82, 0xac])
s1 = b.decode("utf-8")
assert s1 == "€"

# issue 1690
s = io.StringIO('abc')
assert s.tell() == 0
assert s.write('defg') == 4
assert s.tell() == 4
assert s.getvalue() == 'defg'

s = io.StringIO('abc')
assert s.write('d') == 1
assert s.tell() == 1
assert s.getvalue() == 'dbc'
assert s.write('e') == 1
assert s.tell() == 2
assert s.getvalue() == 'dec'

s = io.StringIO('abc')
s.seek(2)
s.write('x')
assert s.getvalue() == 'abx'

# issue
s = io.StringIO('foo\n  bar\n  baz')
index = 0
t = []
while True:
    line = s.readline()
    t.append(line)
    index += 1
    if not line:
        break

assert t == ['foo\n', '  bar\n', '  baz', '']

b = io.BytesIO(b'foo\n  bar\n  baz')
index = 0
t = []
while True:
    line = b.readline()
    t.append(line)
    index += 1
    if not line:
        break

assert t == [b'foo\n', b'  bar\n', b'  baz', b'']

# issue #1763
# problem with readlines working wrong on linux text files.

def myreadlines(self):
    """Read and return the list of all logical lines using readline."""
    lines = []
    while True:
        line = self.readline()
        if not line:
            return lines
        else:
            lines.append(line)

# test readline
assert len(myreadlines(io.StringIO("foo\n\n\n"))) == 3, r"myreadline failed with \n\n"
assert (
    len(myreadlines(io.StringIO("foo\r\n\r\n\r\n"))) == 3
), r"myreadline failed with \r\n\r\n"

# Test readlines()
assert (
    len(io.StringIO("foo\r\n\r\n\r\n").readlines()) == 3
), r"readlines failed with \r\n"


assert len(io.StringIO("foo\n\n\n").readlines()) == 3, r"readlines failed with \n\n!"

# issue 1925
flike = io.BytesIO(bytes('trucmuche', encoding='ascii'))
flike.seek(-5, 2)
assert flike.read() == b'muche'

flike.seek(0, 2)
assert flike.tell() == 9

# issue 2437
import io
import array

bio = io.BytesIO(bytes('1234', encoding='ascii'))
bio.seek(0)
bio.write(b"HI")
assert bio.getvalue() == b'HI34'
buf = bio.getbuffer()
assert isinstance(buf, memoryview)
assert bytes(buf) == b'HI34'

bio = io.BytesIO(bytes('1234', encoding='ascii'))
bio.seek(14)
assert bio.getvalue() == b'1234'
bio.write(b"HI")
assert bio.getvalue() == b'1234\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00HI'
buf = bio.getbuffer()
assert bytes(buf) == bio.getvalue()

# issue 2451
s = io.StringIO('1234')
assert s.read() == '1234'
assert s.tell() == 4
assert s.getvalue() == '1234'
s.seek(2)
assert s.read() == '34'

s = io.BytesIO(b'abcd')
assert s.read() == b'abcd'
assert s.tell() == 4
assert s.getvalue() == b'abcd'

# PR 2738
io.BufferedReader(io.BytesIO(b'x')).raw

# PR 2739
array.array('Q', [1, 2])
assert array.array('i').itemsize == 4
assert array.array('i', [1]).tobytes() == b'\x01\x00\x00\x00'

# PR 2782
class R(io.RawIOBase):

    def readable(self):
        return True

    def fileno(self):
        return 42

assert io.BufferedReader(R()).fileno() == 42

# PR 2783
class R(io.RawIOBase):

    name = 'myname'

    def readable(self):
        return True

assert io.BufferedReader(R()).name == 'myname'

# issue 2926 - 'closed' and the other stream properties
sio = io.StringIO('foo')
assert sio.closed is False
assert sio.line_buffering is False
assert sio.newlines is None
sio.close()
assert sio.closed is True
assert_raises(ValueError, sio.write, 'bar')
# the other stream properties report the closed stream rather than a value
assert_raises(ValueError, lambda: sio.newlines)
assert_raises(ValueError, lambda: sio.line_buffering)

bio = io.BytesIO(b'foo')
assert bio.closed is False
bio.close()
assert bio.closed is True
assert_raises(ValueError, bio.read)
assert_raises(ValueError, bio.write, b'bar')

with io.BytesIO() as bytes_ctx:
    assert bytes_ctx.closed is False
assert bytes_ctx.closed is True

with io.StringIO() as string_ctx:
    assert string_ctx.closed is False
assert string_ctx.closed is True

# IOBase.__exit__ returns what close() returns, so a subclass whose close()
# returns a true value suppresses the exception raised in the with block
class ClosingIO(io.IOBase):

    def close(self):
        return True

assert ClosingIO().__exit__(None, None, None) is True

suppressed = True
try:
    with ClosingIO():
        raise ValueError('boom')
except ValueError:
    suppressed = False
assert suppressed

class QuietIO(io.IOBase):

    def close(self):
        return None

assert QuietIO().__exit__(None, None, None) is None
raised = False
try:
    with QuietIO():
        raise ValueError('boom')
except ValueError:
    raised = True
assert raised

# close() itself returns None, as in CPython
assert io.StringIO().close() is None

print('all tests passed...')