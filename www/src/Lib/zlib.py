"""
Reference: https://www.rfc-editor.org/rfc/rfc1951.pdf
"""

from _zlib_utils import (lz_generator, crc32, BitWriter, BitReader, adler32,
                         _write_items, _decompresser,
                         _decomp_dynamic, _decomp_fixed)

from time import perf_counter as timer

DEFLATED = 8
DEF_BUF_SIZE = 16384
DEF_MEM_LEVEL = 8
MAX_WBITS = 15
ZLIB_RUNTIME_VERSION = '1.2.11'
ZLIB_VERSION = '1.2.11'
Z_BEST_COMPRESSION = 9
Z_BEST_SPEED = 1
Z_BLOCK = 5
Z_DEFAULT_COMPRESSION = -1
Z_DEFAULT_STRATEGY = 0
Z_FILTERED = 1
Z_FINISH = 4
Z_FIXED = 4
Z_FULL_FLUSH = 3
Z_HUFFMAN_ONLY = 2
Z_NO_COMPRESSION = 0
Z_NO_FLUSH = 0
Z_PARTIAL_FLUSH = 1
Z_RLE = 3
Z_SYNC_FLUSH = 2
Z_TREES = 6

trace = 1

class Error(Exception):
    pass


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

    def __repr__(self):
        return f"<Node char={self.char} level={self.level} weight={self.level}>"

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


def codelengths_from_frequencies(freqs, maxlength):
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
    tree.reduce(maxlength)

    codes = tree.codes()

    code_items = list(codes.items())
    code_items.sort(key=lambda item:(len(item[1]), item[0]))
    return [(car, len(value)) for car, value in code_items]

def normalized(codelengths):
    car, codelength = codelengths[0]
    v = 0
    codes = {car: (0, codelength)}

    for (newcar, nbits) in codelengths[1:]:
        v += 1
        if nbits > codelength:
            v <<= nbits - codelength
            codelength = nbits
        codes[newcar] = (v, codelength)

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


fixed_codelengths = {}
for car in range(144):
    fixed_codelengths[car] = 8
for car in range(144, 256):
    fixed_codelengths[car] = 9
for car in range(256, 280):
    fixed_codelengths[car] = 7
for car in range(280, 288):
    fixed_codelengths[car] = 8

fixed_decomp = _decompresser(fixed_codelengths)
fixed_lit_len_tree = fixed_decomp["root"]
codes = fixed_decomp["codes"]

fixed_lit_len_codes = {codes[key]: key for key in codes}

def decomp_repeat(n):
    if n <= 6:
        return [n]
    elif n <= 9:
        return [n - 3, 3]
    elif n <= 12:
        return [6, n - 6]
    t = []
    while n > 12:
        t.append(6)
        n -= 6
    t += decomp(n)
    return t

def cl_encode(lengths):
    """lengths is a dictionary lengths[char] = (value, length).
    Return a list of lengths encoded as specified in section 3.2.7"""
    dic = {char: code[1] for (char, code) in lengths.items()}
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
                for n in decomp_repeat(repeat):
                    yield (16, n - 3)
            pos += repeat + 1


def compress_dynamic(writer, store, lit_len_count, distance_count):
    t0 = timer()

    # Add 1 occurrence of the End Of Block character
    lit_len_count[256] = 1

    # Build Huffman trees for literals / lengths

    # Build a representation of the Huffman tree as a dictionary mapping
    # characters in the literals / length alphabet to their binary code
    # as a string of 0's and 1's (eg. mapping character 112 to '10011')
    lengths = codelengths_from_frequencies(lit_len_count, 15)
    lit_len_codes = normalized(lengths)

    HLIT = 1 + max(lit_len_codes) - 257

    # Transform the literals / length codes as per 3.2.7 : instead of a list
    # of code lengths, one per character in the range [0, 285] (this list
    # would have many 0's), transform it into a list of values in the range
    # [0, 18] where values 16 to 18 indicate repetitions of 0's or of the
    # previous value.
    coded_lit_len = list(cl_encode(lit_len_codes))

    # Same tranformations for distance values
    distance_codes = normalized(codelengths_from_frequencies(distance_count, 15))
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
        codelengths_from_frequencies(codelengths_count, 7))
    codelengths_dict = {char: value[1]
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

    # BTYPE for dynamic coding = 10
    writer.writeBit(0)
    writer.writeBit(1)
    
    writer.writeInt(HLIT, 5) # number of literal / length codes - 257
    writer.writeInt(HDIST, 5) # number of distance codes - 1
    writer.writeInt(HCLEN, 4) # number of code length codes - 4

    # Write codelengths for codelengths tree
    for length, car in zip(codelengths_list, alphabet):
        writer.writeInt(length, 3)

    # Write lit_len and distance tables
    for item in coded_lit_len + coded_distance:
        if isinstance(item, tuple):
            length, extra = item
            value, nbits = codelengths_codes[length]
            writer.writeInt(value, nbits, 'msf')
            if length == 16:
                writer.writeInt(extra, 2)
            elif length == 17:
                writer.writeInt(extra, 3)
            elif length == 18:
                writer.writeInt(extra, 7)
        else:
            value, nbits  = codelengths_codes[item]
            writer.writeInt(value, nbits, 'msf')

    if trace:
        print('write lit-len and distance tables', timer() - t0)
        t0 = timer()

    # Write items produced by the LZ algorithm, Huffman-encoded
    _write_items(writer, store, lit_len_codes, distance_codes)

    if trace:
        print('write items produced by LZ', timer() - t0)


def compress_fixed(writer, items):
    """Use fixed Huffman code."""
    writer.writeBit(1)
    writer.writeBit(0)

    for item in items:
        if isinstance(item, tuple):
            length, extra_length, distance, extra_distance = item
            # length code
            code = fixed_lit_len_codes[length]
            value, nb = int(code, 2), len(code)
            writer.writeInt(value, nb, 'msf')
            # extra bits for length
            value, nb = extra_length
            if nb:
                writer.writeInt(value, nb)
            # distance
            writer.writeInt(distance, 5, 'msf')
            # extra bits for distance
            value, nb = extra_distance
            if nb:
                writer.writeInt(value, nb)
        else:
            literal = item
            code = fixed_lit_len_codes[item]
            value, nb = int(code, 2), len(code)
            writer.writeInt(value, nb, 'msf')

def compress(data, /, level=-1, wbits=MAX_WBITS):
    compressor = _Compressor(level, wbits=wbits)
    return bytes(compressor.compress(data) + compressor.flush())


class _Compressor:

    def __init__(self, level=-1, method=DEFLATED, wbits=MAX_WBITS,
                 memLevel=DEF_MEM_LEVEL, strategy=Z_DEFAULT_STRATEGY,
                 zdict=None):
        self.level = level
        self.method = method
        self.wbits = wbits
        if 9 <= wbits <= 15:
            self.window_size = 1 << wbits
            self.header_trailer = 'zlib'
        elif -15 <= wbits <= -9:
            self.window_size = 1 << abs(wbits)
            self.header_trailer = None
        elif 25 <= wibts <= 31:
            self.window_size = 1 << (wbits - 16)
            self.header_trailer = 'gzip'
        else:
            raise ValueError(f'invalid value for wbits: {wbits}')
        self.memLevel = memLevel
        self.strategy = strategy
        self.zdict = zdict
        self._flushed = False
        self.started = False
        self.adler_a = 1
        self.adler_b = 0

    def header(self):
        if self.header_trailer == 'zlib':
            out = BitWriter()
            # Write zlib headers (RFC 1950)
            out.writeInt(8, 4) # compression method = 8
            size = self.window_size >> 8
            nb = 0
            while size > 1:
                size >>= 1
                nb += 1
            out.writeInt(nb, 4) # window size = 2 ** (8 + 7)
            out.writeInt(0x9c, 8) # FLG
            return out.current
        elif self.header_trailer == 'gzip':
            pass # todo
        else:
            return []

    def checksum(self):
        if self.header_trailer == 'zlib':
            return divmod(self.adler_b, 256) + divmod(self.adler_a, 256)
        elif self.header_trailer == 'gzip':
            return divmod(self.adler_b, 256) + divmod(self.adler_a, 256)
        return []

    def compress(self, source):
        if not self.started:
            self._compressed = bytes(self.header())
            self.started = True
        else:
            self._compressed = bytes()

        t0 = timer()

        is_final = False
        nb_chunks = 0
        # output bit stream
        writer = BitWriter()

        for chunk in lz_generator(source, self.window_size):
            nb_chunks += 1
            is_final, store, lit_len_count, distance_count, replaced, \
                nb_tuples = chunk

            # Estimate how many bytes would be saved with dynamic Huffman tables
            # From different tests, the tables take about 100 bytes, and each
            # (length, distance) tuple is encoded in about 20 bits
            score = replaced - 100 - (nb_tuples * 20 // 8)


            writer.writeBit(is_final) # BFINAL = 1

            if score < 0:
                compress_fixed(writer, store)
            else:
                compress_dynamic(writer, store, lit_len_count, distance_count)

        t0 = timer()
        # Pad last byte with 0's
        writer.padLast()

        self._compressed += bytes(writer.current)
        if trace:
            print('transform to bytes', timer() - t0)
            t0 = timer()

        adler = adler32(source, self.adler_a, self.adler_b)
        self.adler_a = adler.a
        self.adler_b = adler.b

        if trace:
            print('compute adler32', timer() - t0)

        return b''

    def flush(self, mode=Z_FINISH):
        if self._flushed:
            raise Error('inconsistent flush state')
        self._flushed = True
        return self._compressed + bytes(self.checksum())


def compressobj(level=-1, method=DEFLATED, wbits=MAX_WBITS,
                 memLevel=DEF_MEM_LEVEL, strategy=Z_DEFAULT_STRATEGY,
                 zdict=None):
    return _Compressor(level, method, wbits, memLevel, strategy, zdict)


def decompress(data, /, wbits=MAX_WBITS, bufsize=DEF_BUF_SIZE):
    if wbits > 0:
        if trace:
            t0 = timer()
        decompressor = _Decompressor(wbits, bufsize)
        source = BitReader(data)
        assert source.read(4) == 8
        nb = source.read(4)
        window_size = 2 ** (nb + 8)
        assert source.read(8) == 0x9c
        checksum = data[-4:]
        a = 256 * checksum[2] + checksum[3]
        b = 256 * checksum[0] + checksum[1]
        adler = adler32(data)
        assert a, b == (adler.a, adler.b)
        if trace:
            print('decompress, end of checks', timer() - t0)
        return decompressor.decompress(data[2:-4])
    else:
        decompressor = _Decompressor(-wbits, bufsize)
        return decompressor.decompress(data)


class _Decompressor:

    def __init__(self, wbits=MAX_WBITS, bufsize=DEF_BUF_SIZE, zdict=None):
        self.wbits = wbits
        self.bufsize = bufsize
        self.zdict = zdict
        self.eof = False
        self.unconsumed_tail = b''
        self.unused_data = b''

    def decompress(self, data, max_length=0):
        self.data = data
        if data == b'':
            return data

        reader = self._reader = BitReader(data)

        result = []

        while True:
            BFINAL = reader.read(1)
            BTYPE = reader.read(2)

            if BTYPE == 0b01:
                # Decompression with fixed Huffman codes for literals/lengths
                # and distances
                result = _decomp_fixed(reader)

            elif BTYPE == 0b10:
                # Decompression with dynamic Huffman codes
                if trace:
                    t0 = timer()
                _decomp_dynamic(reader, result)
                if trace:
                    print('decompress, read data', timer() - t0)

            if BFINAL:
                rank = reader.index
                self.unused_data = bytes(data[rank + 1:])
                self.eof = True
                break

        return bytes(result)

def decompressobj(wbits=MAX_WBITS, zdict=None):
    return _Decompressor(wbits, zdict)