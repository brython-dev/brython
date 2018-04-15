Problema
--------

Mostrar información al mover el ratón sobre una imagen


Solución
--------

Usaremos el atributo `onmouseover` de la etiqueta HTML `area` y le pasaremos una función python que, en función de su posición, devolverá una cadena de texto.


```exec_on_load
from browser import document, html

def writetext(txt):
    document["description"] <= txt

coords = [
    (0, 0, 160, 95),
    (180, 0, 400, 165),
    (0, 120, 180, 400),
    (175, 235, 270, 400)
]

messages = ["Avión volando a wonderland en un soleado día",
    "El sol y los planetas gigantes gaseosos como Jupiter son, a distancia, \
        los mayores objetos de nuestro sistema solar.",
    "Este soy yo o eres tú.",
    "Daniel el travieso!!!!!!!!"]
prompt = "Mueve el ratón sobre los diferentes elementos de la imagen para ver \
    una descripción."

writetext(prompt)

for coord, msg in zip(coords, messages):
    area = html.AREA(shape="rect", coords=coord)
    area.bind('mouseover', lambda ev, msg=msg:writetext(msg))
    area.bind('mouseout', lambda ev:writetext(prompt))
    document["familymap"] <= area
```

<div id="description" style="background-color:#700;padding:10px;color:#FFF;"></div>


<img src="/static_doc/images/imagemap_example.png" width ="400" height ="400" alt="Happy Family" usemap="#familymap" />

<map name="familymap" id="familymap">
</map>
