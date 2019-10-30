import zlib
import deflate
import lz77

compresser = zlib.compressobj(wbits=15)

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

with open("du cote de chez swann.txt", "rb") as f:
    text = f.read()

chars = {x for x in text}

"""
lz = lz77.LZ77()
gen = lz.compress(text, 32 * 1024, 3)
literals = set()
lengths = set()
distances = set()
for item in gen:
    if isinstance(item, tuple):
        lengths.add(item[0])
        distances.add(item[1])
    else:
        literals.add(item)

print("lengths", lengths)
print(len(literals | lengths), "literals/lengths")
print(len(distances), "distances")

cd = set()
for d in distances:
    if d < 4:
        cd.add(d)
    else:
        coef = 2
        p = 0
        while coef < d:
            coef *= 2
            p += 1
        code = p * 2
        if d - (coef // 2) > coef // 4:
            code += 1
        cd.add(code)
"""
buf = compresser.compress(text)
buf += compresser.flush()

dec = deflate.decompress(buf)

if dec != text:
    for i, car in enumerate(dec):
        if text[i] != car:
            print("erreur", i , car, text[i])