import huffman

def tree_from_codelengths(codelengths):
    lengths = list(codelengths.items())
    # remove items with value = 0
    lengths = [x for x in lengths if x[1] > 0]
    lengths.sort(key=lambda item:(item[1], item[0]))
    decomp = huffman.Decompresser('', lengths)
    root = decomp.root
    return root

def default_tree():
    codelengths = {}
    for car in range(144):
        codelengths[car] = 8
    for car in range(144, 256):
        codelengths[car] = 9
    for car in range(256, 280):
        codelengths[car] = 7
    for car in range(280, 288):
        codelengths[car] = 8

    return tree_from_codelengths(codelengths)

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
    msf = order == "msf"
    result = 0
    if msf:
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
    node = root
    lengths = []
    nb = 0
    while len(lengths) < num:
        code = next(reader)
        child = node.children[code]
        if child.is_leaf:
            if child.char < 16:
                lengths.append(child.char)
            elif child.char == 16:
                repeat = 3 + extra_bits(reader, 2)
                lengths += [lengths[-1]] * repeat
            elif child.char == 17:
                repeat = 3 + extra_bits(reader, 3)
                lengths += [0] * repeat
            elif child.char == 18:
                repeat = 11 + extra_bits(reader, 7)
                lengths += [0] * repeat
            node = root
        else:
            node = child
    return lengths

def make_tree(reader):
    """Reader is at the beginning of the dynamic Huffman tree.
    We have to get the code length for values from 0 to 287 included."""
    HLIT = extra_bits(reader, 5)
    HDIST = extra_bits(reader, 5)
    HCLEN = extra_bits(reader, 4)
    # read codes for lengths
    alphabet = (16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1,
        15)
    clen = {}
    for i, length in zip(range(HCLEN + 4), alphabet):
        clen[length] = extra_bits(reader, 3, "lsf")

    # tree used to decode code lengths
    clen_root = tree_from_codelengths(clen)

    # code lengths for the literal / length alphabet
    lit_len = read_codelengths(reader, clen_root, HLIT + 257)
    lit_len_tree = tree_from_codelengths(dict(enumerate(lit_len)))

    # code lengths for the distances alphabet
    distances = read_codelengths(reader, clen_root, HDIST + 1)
    distances_tree = tree_from_codelengths(dict(enumerate(distances)))

    return lit_len_tree, distances_tree

def read_distance(reader, root):
    node = root

    while True:
        code = next(reader)
        child = node.children[code]
        if child.is_leaf:
            dist_code = child.char
            if dist_code < 3:
                distance = dist_code
            else:
                nb = (dist_code // 2) - 1
                extra = extra_bits(reader, nb, "lsf")
                half, delta = divmod(dist_code, 2)
                distance = 1 + (2 ** half) + delta * (2 ** (half - 1)) + extra
            return distance
        else:
            node = child

def read_literal_or_length(reader, root):
    node = root

    while True:
        code = next(reader)
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
                    length = 11 + 2 * (child.char - 265) + extra_bits(reader, 1)
                elif child.char < 273:
                    length = 19 + 4 * (child.char - 269) + extra_bits(reader, 2)
                elif child.char < 277:
                    length = 35 + 8 * (child.char - 273) + extra_bits(reader, 3)
                elif child.char < 281:
                    length = 67 + 16 * (child.char - 277) + extra_bits(reader, 4)
                elif child.char < 285:
                    length = 131 + 31 * (child.char - 281) + extra_bits(reader, 5)
                elif child.char == 285:
                    length = 258
                else:
                    print(res)
                    raise Exception("invalid character", child.char)
                return ("length", length)
            node = root
        else:
            node = child

def decomp_default(reader):

    root = default_tree()
    node = root
    res = bytearray()

    while True:
        code = next(reader)
        child = node.children[code]
        if child.is_leaf:
            if child.char < 256:
                # literal
                res.append(child.char)
            elif child.char == 256:
                break # end of block
            elif child.char > 256:
                # length (number of bytes to copy from a previous location)
                if child.char < 265:
                    length = child.char - 254
                elif child.char < 269:
                    length = 11 + 2 * (child.char - 265) + extra_bits(reader, 1)
                elif child.char < 273:
                    length = 19 + 4 * (child.char - 269) + extra_bits(reader, 2)
                elif child.char < 277:
                    length = 35 + 8 * (child.char - 273) + extra_bits(reader, 3)
                elif child.char < 281:
                    length = 67 + 16 * (child.char - 277) + extra_bits(reader, 4)
                elif child.char < 285:
                    length = 131 + 31 * (child.char - 281) + extra_bits(reader, 5)
                elif child.char == 285:
                    length = 258
                else:
                    print(res)
                    raise Exception("invalid character", child.char)
                # next five bits are the distance code
                dist_code = extra_bits(reader, 5, "msf")
                if dist_code < 3:
                    distance = dist_code
                else:
                    nb = (dist_code // 2) - 1
                    extra = extra_bits(reader, nb)
                    half, delta = divmod(dist_code, 2)
                    distance = 1 + (2 ** half) + delta * (2 ** (half - 1)) + extra
                for _ in range(length):
                    res.append(res[-distance])

            node = root
        else:
            node = child
    return res

def decompress(buf):
    header = buf[0:2]

    data = buf[2:]
    first = data[0]

    mask = 1

    reader = bit_reader(data)

    BFINAL = next(reader)

    BTYPE = extra_bits(reader, 2)

    print("BFINAL", BFINAL)
    print("BTYPE", bin(BTYPE))

    if BTYPE == 0b01:
        return decomp_default(reader)

    elif BTYPE == 0b10:
        lit_len_tree, distance_tree = make_tree(reader)
        res = bytearray()

        while True:
            # read a literal or length
            _type, value = read_literal_or_length(reader, lit_len_tree)
            if _type == 'eob':
                return bytes(res)
            elif _type == 'literal':
                res.append(value)
            elif _type == 'length':
                # read distance
                length = value
                distance = read_distance(reader, distance_tree)
                for _ in range(length):
                    res.append(res[-distance])

        return bytes(res)
