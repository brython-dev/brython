import bitio
import huffman
import lz77

class Error(Exception):
    pass

def tree_from_codelengths(codelengths):
    lengths = list(codelengths.items())
    # remove items with value = 0
    lengths = [x for x in lengths if x[1] > 0]
    lengths.sort(key=lambda item:(item[1], item[0]))
    decomp = huffman.Decompresser('', lengths)
    return decomp.root

codelengths = {}
for car in range(144):
    codelengths[car] = 8
for car in range(144, 256):
    codelengths[car] = 9
for car in range(256, 280):
    codelengths[car] = 7
for car in range(280, 288):
    codelengths[car] = 8

fixed_lit_len_tree = tree_from_codelengths(codelengths)

def bit_reader(bytestream):
    """Generator of bits from bytestream."""
    mask = 1
    for byte in bytestream:
        while mask < 256:
            yield int(bool(byte & mask))
            mask <<= 1
        mask = 1

def extra_bits(reader, nb, order="lsf"):
    """Read nb bits from reader and return the result as an integer."""
    result = 0
    if order == "msf":
        coef = 2 ** (nb - 1)
        for _ in range(nb):
            result += coef * next(reader)
            coef //= 2
    else:
        coef = 1
        for _ in range(nb):
            bit = next(reader)
            result += coef * bit
            coef *= 2
    return result

def read_codelengths(reader, root, num):
    """Read the num codelengths from the bits in reader, using the Huffman
    tree specified by root.
    """
    node = root
    lengths = []
    nb = 0
    while len(lengths) < num:
        code = reader.read(1)
        child = node.children[code]
        if child.is_leaf:
            if child.char < 16:
                lengths.append(child.char)
            elif child.char == 16:
                repeat = 3 + reader.read(2)
                lengths += [lengths[-1]] * repeat
            elif child.char == 17:
                repeat = 3 + reader.read(3)
                lengths += [0] * repeat
            elif child.char == 18:
                repeat = 11 + reader.read(7)
                lengths += [0] * repeat
            node = root
        else:
            node = child
    return lengths

def dynamic_tree(reader):
    """Reader is at the beginning of the dynamic Huffman tree.
    We have to get the code length for values from 0 to 287 included."""
    HLIT = reader.read(5)
    HDIST = reader.read(5)
    HCLEN = reader.read(4)
    print("decompress, HLIT", HLIT, "HDIST", HDIST, "HCLEN", HCLEN)
    # read codes for lengths
    alphabet = (16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1,
        15)
    clen = {}
    for i, length in zip(range(HCLEN + 4), alphabet):
        clen[length] = reader.read(3)

    # tree used to decode code lengths
    clen_root = tree_from_codelengths(clen)

    # code lengths for the literal / length alphabet
    lit_len = read_codelengths(reader, clen_root, HLIT + 257)
    print("decompress, lengths", lit_len[257:])
    lit_len_tree = tree_from_codelengths(dict(enumerate(lit_len)))

    # code lengths for the distances alphabet
    distances = read_codelengths(reader, clen_root, HDIST + 1)
    distances_tree = tree_from_codelengths(dict(enumerate(distances)))

    return lit_len_tree, distances_tree

def read_distance(reader, root):
    """Read distance value."""
    node = root

    while True:
        code = reader.read(1)
        child = node.children[code]
        if child.is_leaf:
            dist_code = child.char
            if dist_code < 3:
                distance = dist_code + 1
            else:
                nb = (dist_code // 2) - 1
                extra = reader.read(nb)
                half, delta = divmod(dist_code, 2)
                distance = 1 + (2 ** half) + delta * (2 ** (half - 1)) + extra
            return distance
        else:
            node = child

def distance_to_code(distance):
    if distance < 5:
        return (1 + distance, 0, 0)
    else:
        d = distance
        coef = 2
        p = 2
        while 2 ** (p + 1) < d:
            p += 1
        d0 = 2 ** p + 1
        a, b = divmod(d - d0, 2 ** (p - 1))
        return 2 * p + a, b, p - 1

def length_to_code(length):
    if length < 11:
        return (254 + length, 0, 0)
    elif length < 19:
        a, b = divmod(length - 11, 2)
        return (265 + a, b, 1)
    elif length < 35:
        a, b = divmod(length - 19, 4)
        return (269 + a, b, 2)
    elif length < 67:
        a, b = divmod(length - 35, 8)
        return (273 + a, b, 3)
    elif length < 131:
        a, b = divmod(length - 67, 16)
        return (277 + a, b, 4)
    elif length < 258:
        a, b = divmod(length - 131, 32)
        return (281 + a, b, 5)
    elif length == 258:
        return (285, 0, 0)

def read_literal_or_length(reader, root):
    node = root

    while True:
        code = reader.read(1)
        child = node.children[code]
        if child.is_leaf:
            if child.char < 256:
                # literal
                return ("literal", child.char)
            elif child.char == 256:
                return ("eob", None)
            elif child.char > 256:
                # length (number of bytes to copy from a previous location)
                if child.char < 265:
                    length = child.char - 254
                elif child.char < 269:
                    length = 11 + 2 * (child.char - 265) + reader.read(1)
                elif child.char < 273:
                    length = 19 + 4 * (child.char - 269) + reader.read(2)
                elif child.char < 277:
                    length = 35 + 8 * (child.char - 273) + reader.read(3)
                elif child.char < 281:
                    length = 67 + 16 * (child.char - 277) + reader.read(4)
                elif child.char < 285:
                    length = 131 + 31 * (child.char - 281) + reader.read(5)
                elif child.char == 285:
                    length = 258
                else:
                    print(res)
                    raise Error("invalid character: {}".format(child.char))
                return ("length", length)
        else:
            node = child

def decomp_fixed(reader):
    """Decompress with fixed Huffman codes."""
    root = fixed_lit_len_tree
    result = bytearray()

    while True:
        # read a literal or length
        _type, value = read_literal_or_length(reader, root)
        if _type == 'eob':
            break
        elif _type == 'literal':
            result.append(value)
        elif _type == 'length':
            length = value
            # next five bits are the distance code
            dist_code = reader.read(5, "msf")
            if dist_code < 3:
                distance = dist_code + 1
            else:
                nb = (dist_code // 2) - 1
                extra = reader.read(nb)
                half, delta = divmod(dist_code, 2)
                distance = 1 + (2 ** half) + delta * (2 ** (half - 1)) + extra
            for _ in range(length):
                result.append(result[-distance])

            node = root
        else:
            node = child
    return result

def compress(source, window_size=32 * 1024):
    print("compress")
    lz = lz77.LZ77()
    lit_len_count = {}
    distance_count = {}
    for item in lz.compress(source, window_size):
        if isinstance(item, tuple):
            length, distance = item
            print("compress, distance", distance, "length", length)
            length_code, extra, nb = length_to_code(length)
            lit_len_count[length_code] = lit_len_count.get(length_code, 0) + 1
            distance_code, extra, nb = distance_to_code(distance)
            distance_count[distance_code] = \
                distance_count.get(distance_code, 0) + 1
        else:
            literal = item
            lit_len_count[literal] = lit_len_count.get(literal, 0) + 1

    lit_len_codelengths = huffman.codelengths_from_frequencies(lit_len_count)
    print("compress", [item for item in lit_len_codelengths if item[0]>256])
    HLIT = max(car for (car, _) in lit_len_codelengths) - 257
    distance_codelengths = huffman.codelengths_from_frequencies(distance_count)
    HDIST = max(dist for (dist, _) in distance_codelengths) - 1
    codelengths_count = {}
    for car, length in lit_len_codelengths + distance_codelengths:
        codelengths_count[length] = codelengths_count.get(length, 0) - 1
    codelengths_codelengths = huffman.codelengths_from_frequencies(
        codelengths_count)
    HCLEN = max(length for (length, _) in codelengths_codelengths) - 4
    codelengths_dict = dict(codelengths_codelengths)

    alphabet = (16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1,
        15)
    codelengths_list = [codelengths_dict.get(car, 0) for car in alphabet]
    while codelengths_list[-1] == 0:
        codelengths_list.pop()

    out = bitio.BitIO()
    out.write_int(8, 4) # compression method = 8
    out.write_int(7, 4) # window size = 2 ** (8 + 7)
    out.write_int(0x9c, 8) # FLG

    out.write(1) # BFINAL = 1
    out.write(0, 1) # BTYPE = dynamic Huffman codes
    print("compress, HLIT", HLIT, "HDIST", HDIST, "HCLEN", HCLEN)
    input()

    out.write_int(HLIT, 5)
    out.write_int(HDIST, 5)
    out.write_int(HCLEN, 4)

    # write codelengths for codelengths tree
    for length in codelengths_list:
        out.write_int(length, 3)

    return bytes(out.bytestream)

def decompress(buf):
    reader = bitio.BitIO(buf)

    CM = reader.read(4) # compression method (usually 8)
    if CM != 8:
        raise Error("unsupported compression method: {}".format(CM))

    CINFO = reader.read(4) # ln(window size) - 8

    FLG = reader.read(8)

    result = bytearray()

    while True:
        BFINAL = reader.read(1)

        BTYPE = reader.read(2)

        if BTYPE == 0b01:
            # compression with fixed Huffman codes for literals/lengths
            # and distances
            result += decomp_fixed(reader)

        elif BTYPE == 0b10:
            # compression with dynamic Huffman codes
            lit_len_tree, distance_tree = dynamic_tree(reader)

            while True:
                # read a literal or length
                _type, value = read_literal_or_length(reader, lit_len_tree)
                if _type == 'eob':
                    break
                elif _type == 'literal':
                    result.append(value)
                elif _type == 'length':
                    # read a distance
                    length = value
                    distance = read_distance(reader, distance_tree)
                    print("distance", distance, "length", length)
                    for _ in range(length):
                        result.append(result[-distance])

        if BFINAL:
            # read ADLER32 checksum in last 4 bytes
            b1 = 256 * buf[-4] + buf[-3]
            a1 = 256 * buf[-2] + buf[-1]
            # compute it from result
            a = 1
            b = 0
            for byte in result:
                a += byte
                a %= 65521
                b += a
                b %= 65521
            # assert that checksum is correct
            assert a == a1
            assert b == b1

            return bytes(result)

if __name__ == "__main__":

    for i in range(12, 27):
        print(i, distance_to_code(i))