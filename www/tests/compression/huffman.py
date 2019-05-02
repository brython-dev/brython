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

    def length(self, node=None):
        if node is None:
            node = self.root
            self.nb_levels = 0
        if not node.is_leaf:
            self.nb_levels = max(self.nb_levels, node.level + 1)
            for child in node.children:
                self.length(child)

    def reduce_tree(self):
        self.length()
        currentlen = self.nb_levels
        deepest = self.nodes_at(currentlen)
        deepest_leaves = [node for node in deepest if node.is_leaf]
        rightmost_leaf = deepest_leaves[-1]
        sibling = rightmost_leaf.parent.children[0]
        
        # replace rightmost_leaf parent by rightmost_leaf
        parent = rightmost_leaf.parent
        grand_parent = parent.parent
        rank = grand_parent.children.index(parent)
        children = grand_parent.children
        children[rank] = rightmost_leaf
        grand_parent.add(children)

        # find level with leaves
        up_level = rightmost_leaf.level - 2
        while up_level > 0:
            nodes = self.nodes_at(up_level)
            leaf_nodes = [node for node in nodes if node.is_leaf]
            if leaf_nodes:
                leftmost_leaf = leaf_nodes[0]
                # replace by node with leaves = [sibling, leftmost_leaf]
                parent = leftmost_leaf.parent
                rank = parent.children.index(leftmost_leaf)
                new_node = Node1(parent.code)
                new_node.level = leftmost_leaf.level
                children = [sibling, leftmost_leaf]
                new_node.add(children)
                parent.children[rank] = new_node
                new_node.parent = parent
                break
            else:
                up_level -= 1
        if up_level == 0:
            raise Exception("cannot resize tree")

    def rightmost_leaf(self):
        """Find rightmost leaf at level in the tree."""
        node = self.root
        rank = 1
        while True:
            if not node.is_leaf:
                left, right = node.children
                if not right.is_leaf:
                    node = right
                    rank += 1
                elif not left.is_leaf:
                    node = left
                    rank += 1
                else:
                    return right

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
        self.length()
        while self.nb_levels > maxlevels:
            self.reduce_tree()
            self.length()

    def to_dict(self, node=None, code=''):
        if node is None:
            self.dic = {}
            node = self.root
        if node.is_leaf:
            self.dic[node.char] = code
        else:
            for i, child in enumerate(node.children):
                self.to_dict(child, code + str(i))
        return self.dic


class Node1:

    def __init__(self, code='', char=None):
        self.code = code
        self.char = char
        self.is_leaf = char is not None
        self.level = 0

    def add(self, children):
        self.children = children
        for child in self.children:
            child.parent = self
            child.level = self.level + 1

    def __repr__(self):
        if self.is_leaf:
            return f'Leaf({self.char} level {self.level})'
        else:
            return f'Node({self.code} level {self.level})'

class Compresser:

    class Node:

        def __init__(self, f1, f2):
            self.f1 = f1
            self.f2 = f2
            self.w = f1[1] + f2[1]


    def __init__(self, text):
        if not isinstance(text, (bytes, bytearray, memoryview)):
            raise TypeError("a bytes-like object is required, not '" +
                type(text).__name__ + "'")
        self.text = text
        self.dic = {}
        self.frequencies()

        self.make_tree()
        self.make_dict()

        raw_tree = self.build_tree()
        dic = raw_tree.to_dict()
        raw_tree.reduce(15)

        new_dic = raw_tree.to_dict()
        self.dic = new_dic

        dic_items = list(self.dic.items())
        dic_items.sort(key=lambda item:(len(item[1]), item[0]))
        self.codelengths = [(car, len(value)) for car, value in dic_items]

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

    def frequencies(self):
        freqs = {256: 1}
        for car in self.text:
            freqs[car] = freqs.get(car, 0) + 1
        self.freqs = list(freqs.items())
        self.freqs.sort(key=lambda item: item[1], reverse=True)

    def make_tree(self):
        while len(self.freqs) > 1:
            node = Compresser.Node(self.freqs.pop(), self.freqs.pop())
            if not self.freqs:
                self.freqs.append([node, node.w])
            else:
                pos = len(self.freqs) - 1
                while pos and self.freqs[pos][1] < node.w:
                    pos -= 1
                self.freqs.insert(pos, [node, node.w])

    def build_tree(self):
        root = Node1()
        codes = {value : key for key, value in self.dic.items()}

        def make_tree(codes, node):
            children = []
            for bit in '01':
                next_code = node.code + bit
                if next_code in codes:
                    children.append(Node1(next_code, codes[next_code]))
                else:
                    new_node = Node1(next_code)
                    children.append(new_node)
            node.add(children)
            for child in children:
                if not child.is_leaf:
                    make_tree(codes, child)

        make_tree(codes, root)
        return Tree(root)

    def make_dict(self):

        def parse(node, code):
            if isinstance(node.f1[0], Compresser.Node):
                parse(node.f1[0], code + "0")
            else:
                self.dic[node.f1[0]] = code + "0"
            if isinstance(node.f2[0], Compresser.Node):
                parse(node.f2[0], code + "1")
            else:
                self.dic[node.f2[0]] = code + "1"

        root = self.freqs[0][0]
        parse(root, "")

class Decompresser:

    class Node:

        def __init__(self, code=''):
            self.code = code
            self.children = []

        def __repr__(self):
            return str(self.code) + str(self.children)

    def __init__(self, compressed, codelengths):
        self.compressed = compressed
        codes = normalized(codelengths)
        self.codes = {value : key for key, value in codes.items()}
        self.root = Decompresser.Node()
        self.make_tree(self.root)

    def make_tree(self, node):
        children = []
        for bit in '01':
            next_code = node.code + bit
            if next_code in self.codes:
                children.append(self.codes[next_code])
            else:
                new_node = Decompresser.Node(next_code)
                children.append(new_node)
        node.children = children
        for child in children:
            if isinstance(child, Decompresser.Node):
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
            if isinstance(child, int):
                res.append(child)
                node = self.root
            else:
                node = child
            pos += 1

        return res

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
                if isinstance(child, int):
                    if child == 256:
                        break # end of block
                    res.append(child)
                    node = self.root
                else:
                    node = child
                mask >>= 1
            pos += 1

        return res
