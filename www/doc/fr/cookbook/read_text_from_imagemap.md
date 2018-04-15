Problème
--------

Afficher une information au cours du déplacement de la souris sur une image


Solution
--------

On utilise l'attribut `onmouseover` de la balise HTML `area` en lui affectant
une fonction qui affiche une chaine de caractères dépendant de la position de
la souris dans l'image

```exec_on_load
from browser import document, html

def writetext(txt):
    document["description"].text = txt

coords = [
    (0, 0, 160, 95),
    (180, 0, 400, 165),
    (0, 120, 180, 400),
    (175, 235, 270, 400)
]
messages = ["Avion volant dans le ciel par une belle journée",
    "Le soleil et les planètes gazeuses géantes comme Jupiter sont, de loin, \
    les plus gros objets de notre système solaire.",
    "C\"est toi ou c\"est moi.",
    "Daniel la menace!!!!!!!!"]
prompt = "Déplacer la souris sur les différents éléments pour voir une \
    description."

writetext(prompt)

for coord, msg in zip(coords, messages):
    area = html.AREA(shape="rect", coords=coord)
    area.bind("mouseover", lambda ev, msg=msg:writetext(msg))
    area.bind("mouseout", lambda ev:writetext(prompt))
    document["familymap"] <= area

```

<div id="description" style="background-color:#700;padding:10px;color:#FFF;"></div>

<img src="/static_doc/images/imagemap_example.png" width ="400" height ="400" alt="Happy Family" usemap="#familymap" />

<map name="familymap" id="familymap">
</map>



