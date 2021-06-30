import io


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

print('all tests passed...')