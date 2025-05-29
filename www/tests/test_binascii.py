
# issue 274
import base64
b = bytearray(b'<Z\x00N')
b64 = base64.b64encode( b )
assert b64 == b'PFoATg=='

buf = bytearray(b'EZ\x86\xdd\xabN\x86\xdd\xabNE[\x86\xdd\xabN\x86\xdd\xabN')
b64 = base64.b64encode( buf )
assert b64 == b'RVqG3atOht2rTkVbht2rTobdq04='

# issue 394
b = b"\x7F\x7B\xED\x96"
b64 = base64.b64encode(b)
assert b64 == b"f3vtlg=="
newb = base64.b64decode(b64)
assert newb == b

e = base64.b64encode(b'data to encode')
assert e == b"ZGF0YSB0byBlbmNvZGU="
assert base64.b64decode(e, validate=True) == b'data to encode'

# issue 2579
s = '5' * 100000
s_bytes = s.encode('utf-8')
s_encoded = base64.b64encode(s_bytes)
assert len(s_encoded) == 133_336

s = '5' * 1000000
s_bytes = s.encode('utf-8')
s_encoded = base64.b64encode(s_bytes)
assert len(s_encoded) == 1_333_336


from binascii import hexlify, unhexlify

# issue 1342
data = bytes(range(256))
data_hex_bytes = hexlify(data)

assert unhexlify(data_hex_bytes) == data
data_hex_string = data_hex_bytes.decode("ascii")
assert unhexlify(data_hex_string) == data

print("all tests ok...")