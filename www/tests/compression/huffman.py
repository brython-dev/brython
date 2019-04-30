import time

text = "this is an example of a huffman tree"


text = """Pleurez, doux alcyons, ô vous, oiseaux sacrés,
Oiseaux chers à Thétis, doux alcyons, pleurez.

Elle a vécu, Myrto, la jeune Tarentine.
Un vaisseau la portait aux bords de Camarine.
Là l'hymen, les chansons, les flûtes, lentement,
Devaient la reconduire au seuil de son amant.
Une clef vigilante a pour cette journée
Dans le cèdre enfermé sa robe d'hyménée
Et l'or dont au festin ses bras seraient parés
Et pour ses blonds cheveux les parfums préparés.
Mais, seule sur la proue, invoquant les étoiles,
Le vent impétueux qui soufflait dans les voiles
L'enveloppe. Étonnée, et loin des matelots,
Elle crie, elle tombe, elle est au sein des flots.

Elle est au sein des flots, la jeune Tarentine.
Son beau corps a roulé sous la vague marine.
Thétis, les yeux en pleurs, dans le creux d'un rocher
Aux monstres dévorants eut soin de la cacher.
Par ses ordres bientôt les belles Néréides
L'élèvent au-dessus des demeures humides,
Le portent au rivage, et dans ce monument
L'ont, au cap du Zéphir, déposé mollement.
Puis de loin à grands cris appelant leurs compagnes,
Et les Nymphes des bois, des sources, des montagnes,
Toutes frappant leur sein et traînant un long deuil,
Répétèrent : « hélas ! » autour de son cercueil.

Hélas ! chez ton amant tu n'es point ramenée.
Tu n'as point revêtu ta robe d'hyménée.
L'or autour de tes bras n'a point serré de nœuds.
Les doux parfums n'ont point coulé sur tes cheveux."""


with open("20190404/www/src/unicode.txt", encoding="ascii") as f:
    text = f.read()

t0 = time.time()

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


class Node:

    def __init__(self, f1, f2):
        self.f1 = f1
        self.f2 = f2
        self.w = f1[1] + f2[1]

    def __repr__(self):
        return f"<{self.f1[0]},{self.f2[0]} : {self.w}>"


class Compresser:

    def __init__(self, text):
        if not isinstance(text, (bytes, bytearray, memoryview)):
            raise TypeError("a bytes-like object is required, not '" +
                types(text).__name__ + "'")
        self.text = text
        self.dic = {}
        self.frequencies()
        self.make_tree()
        self.make_dict()
        self.make_codelengths()
        self.codes = normalized(self.codelengths)
        self.compressed = ''.join(self.codes[car] for car in text)

    def frequencies(self):
        freqs = {}
        for car in self.text:
            freqs[car] = freqs.get(car, 0) + 1
        self.freqs = list(freqs.items())
        self.freqs.sort(key=lambda item: item[1], reverse=True)

    def make_tree(self):
        while len(self.freqs) > 1:
            node = Node(self.freqs.pop(), self.freqs.pop())
            if not self.freqs:
                self.freqs.append([node, node.w])
            else:
                pos = len(self.freqs) - 1
                while pos and self.freqs[pos][1] < node.w:
                    pos -= 1
                self.freqs.insert(pos, [node, node.w])

    def parse(self, node, code):
        if isinstance(node.f1[0], Node):
            self.parse(node.f1[0], code + "1")
        else:
            self.dic[node.f1[0]] = code + "1"
        if isinstance(node.f2[0], Node):
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

    def __init__(self, compressed, codelengths):
        self.compressed = compressed
        self.codes = normalized(codelengths)

    def decompress(self):
        code_items = dict((v, bytes([car])) for car, v in self.codes.items())
        print(code_items)

        pos = 0
        s = ''
        result = b''
        while pos < len(self.compressed):
            s += self.compressed[pos]
            if s in code_items:
                result += code_items[s]
                s = ''
            pos += 1
        return result


compr = Compresser(text.encode("utf-8"))
codelengths = compr.codelengths

print(8 * len(text), len(compr.compressed))

decomp = Decompresser(compr.compressed, compr.codelengths)

assert decomp.decompress().decode("utf-8") == text
