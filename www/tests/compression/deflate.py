import bitio
import huffman
import lz77

class Error(Exception):
    pass

def decompresser(codelengths):
    lengths = list(codelengths.items())
    # remove items with value = 0
    lengths = [x for x in lengths if x[1] > 0]
    lengths.sort(key=lambda item:(item[1], item[0]))
    return huffman.Decompresser('', lengths)

def tree_from_codelengths(codelengths):
    return decompresser(codelengths).root

fixed_codelengths = {}
for car in range(144):
    fixed_codelengths[car] = 8
for car in range(144, 256):
    fixed_codelengths[car] = 9
for car in range(256, 280):
    fixed_codelengths[car] = 7
for car in range(280, 288):
    fixed_codelengths[car] = 8

fixed_decomp = decompresser(fixed_codelengths)
fixed_lit_len_tree = fixed_decomp.root
fixed_lit_len_codes = {value: key
    for (key, value) in fixed_decomp.codes.items()}

def cl_encode(lengths):
    """lengths is a list of (char, nb) tuples. Return a list of lengths
    encoded as specified in section 3.2.7"""
    dic = dict(lengths)
    items = [dic.get(i, 0) for i in range(max(dic) + 1)]
    pos = 0
    while pos < len(items):
        if items[pos] == 0:
            # count repetitions of 0
            i = pos + 1
            while i < len(items) and items[i] == 0:
                i += 1
            if i - pos < 3:
                for i in range(pos, i):
                    yield items[i]
                pos = i + 1
            else:
                repeat = i - pos
                if repeat < 11:
                    yield (17, repeat - 3)
                else:
                    yield (18, repeat - 11)
                pos = i
        else:
            item = items[pos]
            yield item
            i = pos + 1
            while i < len(items) and items[i] == item:
                i += 1
            repeat = i - pos - 1 # number of repetitions after 1st occurrence
            if repeat < 3:
                for i in range(repeat):
                    yield item
            else:
                nb = repeat - 3
                while nb > 3:
                    yield (16, 3)
                    nb -= 3
                yield (16, nb)
            pos += repeat + 1

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
    # read codes for lengths
    alphabet = (16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1,
        15)
    clen = {}
    c = []
    for i, length in zip(range(HCLEN + 4), alphabet):
        c.append(reader.read(3))
        clen[length] = c[-1] #reader.read(3)

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
        return (distance - 1, 0, 0)
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
    lz = lz77.LZ77()
    lit_len_count = {}
    distance_count = {}
    store = []
    replaced = 0
    nb_tuples = 0
    for item in lz.compress(source, window_size):
        if isinstance(item, tuple):
            nb_tuples += 1
            length, distance = item
            replaced += length
            length_code, *extra_length = length_to_code(length)
            lit_len_count[length_code] = lit_len_count.get(length_code, 0) + 1
            distance_code, *extra_dist = distance_to_code(distance)
            distance_count[distance_code] = \
                distance_count.get(distance_code, 0) + 1
            store.append((length_code, extra_length, distance_code,
                          extra_dist))
        else:
            literal = item
            lit_len_count[literal] = lit_len_count.get(literal, 0) + 1
            store.append(literal)

    store.append(256)

    # Estimate how many bytes would be saved with dynamic Huffman tables
    # The tables take about 100 bytes, and each (length, distance) tuple is
    # encoded in about 20 bits
    score = replaced - 100 - (nb_tuples * 20 // 8)
    if score < 0:
        # If dynamic tables is going to be inefficient, use fixed tables
        return compress_fixed(source, store)

    lit_len_count[256] = 1 # end of block

    lit_len_codelengths = huffman.codelengths_from_frequencies(lit_len_count)
    lit_len_codes = huffman.normalized(lit_len_codelengths)

    coded_lit_len = list(cl_encode(lit_len_codelengths))
    HLIT = 1 + max(car for (car, _) in lit_len_codelengths) - 257

    coded_distance = []
    HDIST = 1
    if distance_count:
        distance_codelengths = huffman.codelengths_from_frequencies(distance_count)
        distance_codes = huffman.normalized(distance_codelengths)
        coded_distance = list(cl_encode(distance_codelengths))
        HDIST = 1 + max(dist for (dist, _) in distance_codelengths) - 1
    else:
        return compress_fixed(source, store)

    codelengths_count = {}
    for coded in coded_lit_len, coded_distance:
        for item in coded:
            length = item[0] if isinstance(item, tuple) else item
            codelengths_count[length] = codelengths_count.get(length, 0) + 1

    codelengths_codelengths = huffman.codelengths_from_frequencies(
        codelengths_count)
    codelengths_dict = dict(codelengths_codelengths)
    cl_codes = huffman.normalized(codelengths_codelengths)

    alphabet = (16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1,
        15)
    codelengths_list = [codelengths_dict.get(car, 0) for car in alphabet]
    while codelengths_list[-1] == 0:
        codelengths_list.pop()
    HCLEN = len(codelengths_list) - 4

    out = bitio.BitIO()
    out.write_int(8, 4) # compression method = 8
    out.write_int(7, 4) # window size = 2 ** (8 + 7)
    out.write_int(0x9c, 8) # FLG

    out.write(1) # BFINAL = 1
    out.write(0, 1) # BTYPE = dynamic Huffman codes

    out.write_int(HLIT, 5)
    out.write_int(HDIST, 5)
    out.write_int(HCLEN, 4)

    # write codelengths for codelengths tree
    for length, car in zip(codelengths_list, alphabet):
        out.write_int(length, 3)

    # write lit_len and distance tables
    for item in coded_lit_len + coded_distance:
        if isinstance(item, tuple):
            length, extra = item
            code = cl_codes[length]
            value, nbits = int(code, 2), len(code)
            out.write_int(value, nbits, order="msf")
            if length == 16:
                out.write_int(extra, 2)
            elif length == 17:
                out.write_int(extra, 3)
            elif length == 18:
                out.write_int(extra, 7)
        else:
            code = cl_codes[item]
            value, nbits = int(code, 2), len(code)
            out.write_int(value, nbits, order="msf")

    for item in store:
        if isinstance(item, tuple):
            length, extra_length, distance, extra_distance = item
            # length code
            code = lit_len_codes[length]
            value, nb = int(code, 2), len(code)
            out.write_int(value, nb, order="msf")
            # extra bits for length
            value, nb = extra_length
            if nb:
                out.write_int(value, nb)
            # distance
            code = distance_codes[distance]
            value, nb = int(code, 2), len(code)
            out.write_int(value, nb, order="msf")
            # extra bits for distance
            value, nb = extra_distance
            if nb:
                out.write_int(value, nb)
        else:
            literal = item
            code = lit_len_codes[item]
            value, nb = int(code, 2), len(code)
            out.write_int(value, nb, order="msf")

    # pad with 0
    while out.bitnum != 8:
        out.write(0)
    # write ADLER32 checksum
    a, b = adler32(source)
    a1, a2 = divmod(a, 256)
    b1, b2 = divmod(b, 256)
    out.write_int(b1, 8)
    out.write_int(b2, 8)
    out.write_int(a1, 8)
    out.write_int(a2, 8)

    return bytes(out.bytestream)

def compress_fixed(source, items):
    """Use fixed Huffman code."""
    out = bitio.BitIO()
    out.write_int(8, 4) # compression method = 8
    out.write_int(7, 4) # window size = 2 ** (8 + 7)
    out.write_int(0x9c, 8) # FLG

    out.write(1) # BFINAL = 1
    out.write(1, 0) # BTYPE = fixed Huffman codes

    for item in items:
        if isinstance(item, tuple):
            length, extra_length, distance, extra_distance = item
            # length code
            code = fixed_lit_len_codes[length]
            value, nb = int(code, 2), len(code)
            out.write_int(value, nb, order="msf")
            # extra bits for length
            value, nb = extra_length
            if nb:
                out.write_int(value, nb)
            # distance
            code = distance - 1
            value, nb = code, 5
            out.write_int(value, nb, order="msf")
            # extra bits for distance
            value, nb = extra_distance
            if nb:
                out.write_int(value, nb)
        else:
            literal = item
            code = fixed_lit_len_codes[item]
            value, nb = int(code, 2), len(code)
            out.write_int(value, nb, order="msf")

    # pad with 0
    while out.bitnum != 8:
        out.write(0)

    # write ADLER32 checksum
    a, b = adler32(source)
    a1, a2 = divmod(a, 256)
    b1, b2 = divmod(b, 256)
    out.write_int(b1, 8)
    out.write_int(b2, 8)
    out.write_int(a1, 8)
    out.write_int(a2, 8)

    return bytes(out.bytestream)


def adler32(source):
    a = 1
    b = 0
    for byte in source:
        a += byte
        a %= 65521
        b += a
        b %= 65521
    return a, b

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
                    for _ in range(length):
                        result.append(result[-distance])

        if BFINAL:
            # read ADLER32 checksum in last 4 bytes
            b1 = 256 * buf[-4] + buf[-3]
            a1 = 256 * buf[-2] + buf[-1]
            # compute it from result
            a, b = adler32(result)
            # assert that checksum is correct
            assert a == a1
            assert b == b1

            return bytes(result)
