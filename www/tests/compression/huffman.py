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



class Compresser:

    class Node:

        def __init__(self, f1, f2):
            self.f1 = f1
            self.f2 = f2
            self.w = f1[1] + f2[1]

        def __repr__(self):
            return f"<{self.f1[0]},{self.f2[0]} : {self.w}>"


    def __init__(self, text):
        if not isinstance(text, (bytes, bytearray, memoryview)):
            raise TypeError("a bytes-like object is required, not '" +
                type(text).__name__ + "'")
        self.text = text
        self.dic = {}
        self.frequencies()
        self.make_tree()
        self.make_dict()
        self.make_codelengths()
        self.codes = normalized(self.codelengths)
        self.compressed = ''.join(self.codes[car] for car in text)
        self.out = bytearray()
        pos = 0
        while pos < len(self.compressed):
            bits = self.compressed[pos:pos + 8]
            byte = int(bits, 2)
            if len(bits) < 8:
                byte << (8 - len(bits))
            self.out.append(byte)
            pos += 8

    def frequencies(self):
        freqs = {}
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

    def parse(self, node, code):
        if isinstance(node.f1[0], Compresser.Node):
            self.parse(node.f1[0], code + "1")
        else:
            self.dic[node.f1[0]] = code + "1"
        if isinstance(node.f2[0], Compresser.Node):
            self.parse(node.f2[0], code + "0")
        else:
            self.dic[node.f2[0]] = code + "0"

    def make_dict(self):
        root = self.freqs[0][0]
        self.parse(root, "")

    def make_codelengths(self):
        dic_items = list(self.dic.items())
        dic_items.sort(key=lambda item:(len(item[1]), item[0]))
        self.codelengths = [(car, len(value)) for car, value in dic_items]

class Decompresser:

    class Node:

        def __init__(self, code=''):
            self.code = code
            self.children = []


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
        txt = self.compressed
        pos = 0
        code = ''
        node = self.root

        res = bytearray()

        while pos < len(txt):
            code = int(txt[pos])
            child = node.children[code]
            if isinstance(child, int):
                res.append(child)
                node = self.root
            else:
                node = child
            pos += 1

        return res