from binascii import hexlify, unhexlify

# issue 1342
data = bytes(range(256))
data_hex_bytes = hexlify(data)

assert unhexlify(data_hex_bytes) == data
data_hex_string = data_hex_bytes.decode("ascii")
assert unhexlify(data_hex_string) == data

print("all tests ok...")