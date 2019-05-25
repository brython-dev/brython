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
        for x in self.bytestream:
            s = str(bin(x))[2:]
            s = "0" * (8 - len(s)) + s
            print(s, end=" ")
        print()

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

if __name__ == "__main__":
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

    #text = "adsqfqgqs"
    text = text.encode("utf-8")
    io = BitIO(text)

    while True:
        bit = io.read(1)
        if bit is None:
            break
    io.move(-16)
    print(io.read(8), io.read(8))

    io.write_bits(0, 0, 0, 0, 0, 0, 0, 1)
    print(io.bytestream[-1])

    io.write_int(ord("x"), 8)
    print(chr(io.bytestream[-1]))
