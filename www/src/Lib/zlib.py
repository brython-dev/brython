from _zlib_utils import lz_generator

class BitIO:

    def __init__(self, bytestream=b''):
        self.bytestream = bytearray(bytestream)
        self.bytenum = 0
        self.bitnum = 0

    @property
    def pos(self):
        return self.bytenum * 8 + self.bitnum

    def read(self, nb, order="lsf", trace=False):
        result = 0
        coef = 1 if order == "lsf" else 2 ** (nb - 1)
        for _ in range(nb):
            if self.bitnum == 8:
                if self.bytenum == len(self.bytestream) - 1:
                    return None
                self.bytenum += 1
                self.bitnum = 0
            mask = 2 ** self.bitnum
            if trace:
                print("bit", int(bool(mask & self.bytestream[self.bytenum])))
            result += coef * bool(mask & self.bytestream[self.bytenum])
            self.bitnum += 1
            if order == "lsf":
                coef *= 2
            else:
                coef //= 2
        return result

    def move(self, nb):
        if nb == 0:
            return
        elif nb > 0:
            bitpos = self.bitnum + nb
            while bitpos > 7:
                self.bytenum += 1
                if self.bytenum == len(self.bytestream):
                    raise Exception("can't move {} bits".format(nb))
                bitpos -= 8
            self.bitnum = bitpos
        else:
            bitpos = self.bitnum + nb
            while bitpos < 0:
                self.bytenum -= 1
                if self.bytenum == -1:
                    raise Exception("can't move {} bits".format(nb))
                bitpos += 8
            self.bitnum = bitpos

    def show(self):
        res = ""
        for x in self.bytestream:
            s = str(bin(x))[2:]
            s = "0" * (8 - len(s)) + s
            res += s + " "
        return res

    def write(self, *bits):
        for bit in bits:
            if not self.bytestream:
                self.bytestream.append(0)
            byte = self.bytestream[self.bytenum]
            if self.bitnum == 8:
                if self.bytenum == len(self.bytestream) - 1:
                    byte = 0
                    self.bytestream += bytes([byte])
                self.bytenum += 1
                self.bitnum = 0
            mask = 2 ** self.bitnum
            if bit:
                byte |= mask
            else:
                byte &= ~mask
            self.bytestream[self.bytenum] = byte
            self.bitnum += 1

    def write_int(self, value, nb, order="lsf"):
        """Write integer on nb bits."""
        if value >= 2 ** nb:
            raise ValueError("can't write value on {} bits".format(nb))
        bits = []
        while value:
            bits.append(value & 1)
            value >>= 1
        # pad with 0's
        bits = bits + [0] * (nb - len(bits))
        if order != "lsf":
            bits.reverse()
        assert len(bits) == nb
        self.write(*bits)

class ResizeError(Exception):
    pass


class Node:

    def __init__(self, char=None, weight=0, level=0):
        self.char = char
        self.is_leaf = char is not None
        self.level = level
        self.weight = weight

    def add(self, children):
        self.children = children
        for child in self.children:
            child.parent = self
            child.level = self.level + 1


class Tree:

    def __init__(self, root):
        self.root = root

    def length(self):
        self.root.level = 0
        node = self.root
        nb_levels = 0
        def set_level(node):
            nonlocal nb_levels
            for child in node.children:
                child.level = node.level + 1
                nb_levels = max(nb_levels, child.level)
                if not child.is_leaf:
                    set_level(child)
        set_level(self.root)
        return nb_levels

    def reduce_tree(self):
        """Change the tree to reduce the number of levels.
        Uses the algorithm described in
        http://compressions.sourceforge.net/Huffman.html#3
        """
        currentlen = self.length()
        deepest = self.nodes_at(currentlen)
        deepest_leaves = [node for node in deepest if node.is_leaf]
        rightmost_leaf = deepest_leaves[-1]
        sibling = rightmost_leaf.parent.children[0]

        # replace rightmost_leaf's parent by rightmost_leaf
        parent = rightmost_leaf.parent
        grand_parent = parent.parent
        rank = grand_parent.children.index(parent)
        children = grand_parent.children
        children[rank] = rightmost_leaf
        grand_parent.add(children)

        # find first upper level with leaves
        up_level = rightmost_leaf.level - 2
        while up_level > 0:
            nodes = self.nodes_at(up_level)
            leaf_nodes = [node for node in nodes if node.is_leaf]
            if leaf_nodes:
                leftmost_leaf = leaf_nodes[0]
                # replace by node with leaves = [sibling, leftmost_leaf]
                parent = leftmost_leaf.parent
                rank = parent.children.index(leftmost_leaf)
                new_node = Node()
                new_node.level = leftmost_leaf.level
                children = [sibling, leftmost_leaf]
                new_node.add(children)
                parent.children[rank] = new_node
                new_node.parent = parent
                break
            else:
                up_level -= 1
        if up_level == 0:
            raise ResizeError

    def nodes_at(self, level, top=None):
        """Return list of all the nodes below top at specified level."""
        res = []
        if top is None:
            top = self.root
        if top.level == level:
            res = [top]
        elif not top.is_leaf:
            for child in top.children:
                res += self.nodes_at(level, child)
        return res

    def reduce(self, maxlevels):
        """Reduce number of levels to maxlevels, if possible."""
        while self.length() > maxlevels:
            self.reduce_tree()

    def codes(self, node=None, code=''):
        """Returns a dictionary mapping leaf characters to the Huffman code
        of the node, as a string of 0's and 1's."""
        if node is None:
            self.dic = {}
            node = self.root
        if node.is_leaf:
            self.dic[node.char] = code
        else:
            for i, child in enumerate(node.children):
                self.codes(child, code + str(i))
        return self.dic


def codelengths_from_frequencies(freqs):
    """Applies the Huffman algorithm to a dictionary of frequencies. Returns
    a list of (character, codelength), sorted by increasing codelength and
    increasing value of character.
    For compliance with the deflate algorithm, the maximum codelength is set
    to 15."""
    freqs = sorted(freqs.items(),
        key=lambda item: (item[1], -item[0]), reverse=True)
    nodes = [Node(char=key, weight=value) for (key, value) in freqs]
    while len(nodes) > 1:
        right, left = nodes.pop(), nodes.pop()
        node = Node(weight=right.weight + left.weight)
        node.add([left, right])
        if not nodes:
            nodes.append(node)
        else:
            pos = 0
            while pos < len(nodes) and nodes[pos].weight > node.weight:
                pos += 1
            nodes.insert(pos, node)

    top = nodes[0]
    tree = Tree(top)
    tree.reduce(15)

    codes = tree.codes()

    code_items = list(codes.items())
    code_items.sort(key=lambda item:(len(item[1]), item[0]))
    return [(car, len(value)) for car, value in code_items]

def normalized(codelengths):
    car, codelength = codelengths[0]
    value = 0
    codes = {car: "0" * codelength}

    for (newcar, nbits) in codelengths[1:]:
        value += 1
        bvalue = str(bin(value))[2:]
        bvalue = "0" * (codelength - len(bvalue)) + bvalue
        if nbits > codelength:
            codelength = nbits
            bvalue += "0" * (codelength - len(bvalue))
            value = int(bvalue, 2)
        assert len(bvalue) == nbits
        codes[newcar] = bvalue

    return codes

def make_tree(node, codes):
    if not hasattr(node, "parent"):
        node.code = ''
    children = []
    for bit in '01':
        next_code = node.code + bit
        if next_code in codes:
            child = Node(char=codes[next_code])
        else:
            child = Node()
        child.code = next_code
        children.append(child)
    node.add(children)
    for child in children:
        if not child.is_leaf:
            make_tree(child, codes)

def decompresser(codelengths):
    lengths = list(codelengths.items())
    # remove items with value = 0
    lengths = [x for x in lengths if x[1] > 0]
    lengths.sort(key=lambda item:(item[1], item[0]))
    codes = normalized(lengths)
    codes = {value : key for key, value in codes.items()}
    root = Node()
    make_tree(root, codes)
    return {"root": root, "codes": codes}

def tree_from_codelengths(codelengths):
    return decompresser(codelengths)["root"]

class error(Exception):
    pass


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
fixed_lit_len_tree = fixed_decomp["root"]
fixed_lit_len_codes = {value: key
    for (key, value) in fixed_decomp["codes"].items()}

def cl_encode(lengths):
    """lengths is a list of (char, code) tuples. Return a list of lengths
    encoded as specified in section 3.2.7"""
    dic = {char: len(code) for (char, code) in lengths.items()}
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

def dynamic_trees(reader):
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
                return ("length", length)
        else:
            node = child

def adler32(source):
    a = 1
    b = 0
    for byte in source:
        a += byte
        a %= 65521
        b += a
        b %= 65521
    return a, b


def compress_dynamic(out, source, store, lit_len_count, distance_count):

    # Add 1 occurrence of the End Of Block character
    lit_len_count[256] = 1

    # Build Huffman trees for literals / lengths

    # Build a representation of the Huffman tree as a dictionary mapping
    # characters in the literals / length alphabet to their binary code
    # as a string of 0's and 1's (eg. mapping character 112 to '10011')
    lit_len_codes = normalized(codelengths_from_frequencies(lit_len_count))
    HLIT = 1 + max(lit_len_codes) - 257

    # Transform the literals / length codes as per 3.2.7 : instead of a list
    # of code lengths, one per character in the range [0, 285] (this list
    # would have many 0's), transform it in a list of values in the range
    # [0, 18] where values 16 to 18 indicate repetitions of 0's or of the
    # previous value.
    coded_lit_len = list(cl_encode(lit_len_codes))

    # Same tranformations for distance values
    distance_codes = normalized(codelengths_from_frequencies(distance_count))
    HDIST = max(distance_codes)
    coded_distance = list(cl_encode(distance_codes))

    # Count the frequency of values 0...18 in the results
    codelengths_count = {}
    for coded in coded_lit_len, coded_distance:
        for item in coded:
            length = item[0] if isinstance(item, tuple) else item
            codelengths_count[length] = codelengths_count.get(length, 0) + 1

    # Create a Huffman tree for the codelengths
    codelengths_codes = normalized(
        codelengths_from_frequencies(codelengths_count))
    codelengths_dict = {char: len(value)
        for (char, value) in codelengths_codes.items()}

    alphabet = (16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1,
        15)
    # List of code lengths for the characters in the alphabet, sorted as
    # above (cf. 3.2.7)
    codelengths_list = [codelengths_dict.get(car, 0) for car in alphabet]
    # Remove trailing zeroes
    while codelengths_list[-1] == 0:
        codelengths_list.pop()
    HCLEN = len(codelengths_list) - 4

    out.write(0, 1) # BTYPE = dynamic Huffman codes

    out.write_int(HLIT, 5)
    out.write_int(HDIST, 5)
    out.write_int(HCLEN, 4)

    # Write codelengths for codelengths tree
    for length, car in zip(codelengths_list, alphabet):
        out.write_int(length, 3)

    # Write lit_len and distance tables
    for item in coded_lit_len + coded_distance:
        if isinstance(item, tuple):
            length, extra = item
            code = codelengths_codes[length]
            value, nbits = int(code, 2), len(code)
            out.write_int(value, nbits, order="msf")
            if length == 16:
                out.write_int(extra, 2)
            elif length == 17:
                out.write_int(extra, 3)
            elif length == 18:
                out.write_int(extra, 7)
        else:
            code = codelengths_codes[item]
            value, nbits = int(code, 2), len(code)
            out.write_int(value, nbits, order="msf")

    # Write items produced by the LZ algorithm, Huffman-encoded
    for item in store:
        if isinstance(item, tuple):
            length, extra_length, distance, extra_distance = item
            # Length code
            code = lit_len_codes[length]
            value, nb = int(code, 2), len(code)
            out.write_int(value, nb, order="msf")
            # Extra bits for length
            value, nb = extra_length
            if nb:
                out.write_int(value, nb)
            # Distance code
            code = distance_codes[distance]
            value, nb = int(code, 2), len(code)
            out.write_int(value, nb, order="msf")
            # Extra bits for distance
            value, nb = extra_distance
            if nb:
                out.write_int(value, nb)
        else:
            literal = item
            code = lit_len_codes[item]
            value, nb = int(code, 2), len(code)
            out.write_int(value, nb, order="msf")

def compress_fixed(out, source, items):
    """Use fixed Huffman code."""
    print("fixed", items)
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
            out.write_int(distance, 5, order="msf")
            # extra bits for distance
            value, nb = extra_distance
            if nb:
                out.write_int(value, nb)
        else:
            literal = item
            code = fixed_lit_len_codes[item]
            value, nb = int(code, 2), len(code)
            out.write_int(value, nb, order="msf")

def compress(source, window_size=32 * 1024):

    # Counter for frequency of literals and lengths, encoded in the range
    # [0, 285] (cf. 3.2.5)
    lit_len_count = {}
    # Counter for frequency of distances, encoded in the range [0, 29]
    # (cf. 3.2.5)
    distance_count = {}

    store = [] # Store of items produced by the LZ algorithm
    replaced = 0 # Count length of replaced sequences
    nb_tuples = 0 # Count number of tuples produced by the LZ algorithm

    for item in lz_generator(source, window_size):
        if isinstance(item, tuple):
            nb_tuples += 1
            length, distance = item # Raw values as integers
            replaced += length
            # Transform raw length in range [3...258] into a code in the range
            # [257, 285] and a number of extra bits
            length_code, *extra_length = length_to_code(length)
            # Increment literals / lengths counter
            lit_len_count[length_code] = lit_len_count.get(length_code, 0) + 1

            # Transform raw distance in range [1...window_size] into a code in
            # the range [0...29] and a number of extra bits
            distance_code, *extra_dist = distance_to_code(distance)
            # Increment distances counter
            distance_count[distance_code] = \
                distance_count.get(distance_code, 0) + 1

            # Add to store for use in next steps
            store.append((length_code, extra_length, distance_code,
                          extra_dist))
        else:
            literal = item
            lit_len_count[literal] = lit_len_count.get(literal, 0) + 1
            store.append(literal)

    store.append(256) # end of block

    # Estimate how many bytes would be saved with dynamic Huffman tables
    # From different tests, the tables take about 100 bytes, and each
    # (length, distance) tuple is encoded in about 20 bits
    score = replaced - 100 - (nb_tuples * 20 // 8)

    # Create the output bit stream
    out = BitIO()

    # Write zlib headers (RFC 1950)
    out.write_int(8, 4) # compression method = 8
    size = window_size >> 8
    nb = 0
    while size > 1:
        size >>= 1
        nb += 1
    out.write_int(nb, 4) # window size = 2 ** (8 + 7)
    out.write_int(0x9c, 8) # FLG

    out.write(1) # BFINAL = 1

    if score < 0:
        compress_fixed(out, source, store)
    else:
        compress_dynamic(out, source, store, lit_len_count, distance_count)

    # Pad last byte with 0's
    while out.bitnum != 8:
        out.write(0)

    # Write ADLER32 checksum
    a, b = adler32(source)
    a1, a2 = divmod(a, 256)
    b1, b2 = divmod(b, 256)
    out.write_int(b1, 8)
    out.write_int(b2, 8)
    out.write_int(a1, 8)
    out.write_int(a2, 8)

    return bytes(out.bytestream)

def decompress(buf):
    reader = BitIO(buf)

    CM = reader.read(4) # compression method (usually 8)
    if CM != 8:
        raise error("unsupported compression method: {}".format(CM))

    CINFO = reader.read(4) # ln(window size) - 8

    FLG = reader.read(8)

    result = bytearray()

    while True:
        BFINAL = reader.read(1)

        BTYPE = reader.read(2)
        
        if BTYPE == 0b01:
            # Decompression with fixed Huffman codes for literals/lengths
            # and distances
            root = fixed_lit_len_tree

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
                        distance = (1 + (2 ** half) + 
                            delta * (2 ** (half - 1)) + extra)
                    for _ in range(length):
                        result.append(result[-distance])

                    node = root
                else:
                    node = child

        elif BTYPE == 0b10:
            # Decompression with dynamic Huffman codes

            # Read Huffman code trees
            lit_len_tree, distance_tree = dynamic_trees(reader)

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
