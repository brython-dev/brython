import zlib
import gzip

text = b'Original text'

zc = zlib.compress(text)
assert list(zc) == [120, 156, 243, 47, 202, 76, 207, 204, 75, 204, 81, 40, 73,
                    173, 40, 1, 0, 35, 68, 5, 27]

gc = gzip.compress(text)
assert list(gc[:4]) == [31, 139, 8, 0]
assert list(gc[8:-8]) == [2, 255, 243, 47, 202, 76, 207, 204, 75, 204, 81, 40, 73, 173, 40, 1, 0]
assert list(gc[-8:]) == [26, 240, 2, 249, 13, 0, 0, 0]

[31, 139, 8, 0, 9, 1, 247, 97, 2, 255, 243, 47, 202, 76, 207, 204, 75, 204, 81, 40, 73, 173, 40, 1, 0, 26, 240, 2, 249, 13, 0, 0, 0]


cobj = zlib.compressobj(9,
                       zlib.DEFLATED,
                       -zlib.MAX_WBITS,
                       zlib.DEF_MEM_LEVEL,
                       0)
assert list(cobj.compress(text)) == []
assert list(cobj.flush()) == [243, 47, 202, 76, 207, 204, 75, 204, 81, 40, 73, 173, 40, 1, 0]

assert zlib.decompress(zc) == text

compressed = gzip.compress(text)

assert gzip.decompress(compressed) == text

# issue 1914
dbytes = bytes([203, 72, 205, 201, 201, 7, 0])
assert zlib.decompress(dbytes, wbits=-zlib.MAX_WBITS) == b'hello'

print('all tests passed...')