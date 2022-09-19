import secrets

assert secrets.choice([ 4, 1, 3, 2 ]) in [ 4, 1, 3, 2 ]

assert 0 <= secrets.randbelow(20) < 20
assert len(bin(secrets.randbits(24))) <= 26
assert isinstance(secrets.token_bytes(32), bytes)
assert len(secrets.token_bytes(32)) >= 32
assert isinstance(secrets.token_hex(16), str)
assert len(secrets.token_hex(16)) == 32
assert isinstance(secrets.token_urlsafe(32), str)
assert len(secrets.token_hex(32)) >= 32
assert secrets.compare_digest(b"test_bytes", b"test_bytes")
assert secrets.compare_digest("test_str", "test_str")
assert not secrets.compare_digest(b"test_bytes", b"test_other")

print("passed all tests...")
