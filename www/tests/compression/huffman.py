class ResizeError(Exception):
    pass

def codelengths_from_frequencies(freqs):
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

class Tree:

    def __init__(self, root):
        self.root = root
        self.nb_levels = 0

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


class Node:

    def __init__(self, char=None, weight=0, level=0):
        self.char = char
        self.is_leaf = char is not None
        self.level = level
        self.weight = weight
        self.height = 0

    def add(self, children):
        self.children = children
        for child in self.children:
            child.parent = self
            child.level = self.level + 1
        self.height = max(self.height, children[0].height + 1,
            children[1].height + 1)
        node = self
        while hasattr(node, "parent"):
            node.parent.height = max(node.parent.height, node.height + 1)
            node = node.parent

    def __repr__(self):
        if self.is_leaf:
            return f'{chr(self.char)!r}'
        else:
            return f'{self.children}'


class Compresser:

    def __init__(self, text):
        if not isinstance(text, (bytes, bytearray, memoryview)):
            raise TypeError("a bytes-like object is required, not '" +
                type(text).__name__ + "'")
        self.text = text

        freqs = {}
        for car in self.text:
            freqs[car] = freqs.get(car, 0) + 1

        self.codelengths = codelengths_from_frequencies(freqs)

        self.codes = normalized(self.codelengths)

        self.max_codelength = max(len(v) for v in self.codes.values())

    def compressed_bytes(self):
        compressed = self.compressed_str() + self.codes[256]
        out = bytearray()
        pos = 0
        while pos < len(compressed):
            bits = compressed[pos:pos + 8]
            byte = int(bits, 2)
            if len(bits) < 8:
                byte <<= (8 - len(bits))
            out.append(byte)
            pos += 8
        return out

    def compressed_str(self):
        return ''.join(self.codes[car] for car in self.text)


class Decompresser:

    def __init__(self, compressed, codelengths):
        self.compressed = compressed
        codes = normalized(codelengths)
        self.codes = {value : key for key, value in codes.items()}
        self.root = Node()
        self.make_tree(self.root)

    def make_tree(self, node):
        if node is self.root:
            node.code = ''
        children = []
        for bit in '01':
            next_code = node.code + bit
            if next_code in self.codes:
                child = Node(char=self.codes[next_code])
            else:
                child = Node()
            child.code = next_code
            children.append(child)
        node.add(children)
        for child in children:
            if not child.is_leaf:
                self.make_tree(child)

    def decompress(self):
        source = self.compressed
        if isinstance(source, (bytes, bytearray)):
            return self.decompress_bytes()
        pos = 0
        node = self.root
        res = bytearray()

        while pos < len(source):
            code = int(source[pos])
            child = node.children[code]
            if child.is_leaf:
                res.append(child)
                node = self.root
            else:
                node = child
            pos += 1

        return bytes(res)

    def decompress_bytes(self):
        source = self.compressed
        pos = 0
        node = self.root
        res = bytearray()

        while pos < len(source):
            byte = source[pos]
            mask = 128
            while mask > 0:
                code = bool(byte & mask)
                child = node.children[code]
                if child.is_leaf:
                    if child.char == 256:
                        break # end of block
                    res.append(child.char)
                    node = self.root
                else:
                    node = child
                mask >>= 1
            pos += 1

        return res

def compress(text, klass=bytes):
    compr = Compresser(text)
    result = {"codelengths": compr.codelengths}
    if klass is bytes:
        result["data"] = compr.compressed_bytes()
    elif klass is str:
        result["data"] = compr.compressed_str()
    else:
        raise TypeError("second argument of compress must be bytes or "
            "str, not '{}'".format(klass))
    return result

def decompress(data, codelengths):
    decomp = Decompresser(data, codelengths)
    return decomp.decompress()
