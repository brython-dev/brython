Problem
-------

Show information when the mouse is over an area of the image


Solution
--------

We will use the `onmouseover` atribute of the `area` HTML tag. A text will be
shown on screen depending on the position of the mouse :

```exec_on_load
from browser import document, html

def writetext(txt):
    # write text in the description zone (white on red)
    document["description"].text = txt

coords = [
    (0, 0, 160, 95),
    (180, 0, 400, 165),
    (0, 120, 180, 400),
    (175, 235, 270, 400)
]

messages = ["This plane was flying to wonderland in a sunny day",
    "The Sun and the gas giant planets like Jupiter are by far the largest \
    objects in our Solar System.",
    "This is me or you.",
    "Dennis the menace!!!!!!!!"]
prompt = "Mouse over the items in the image to see the different \
    descriptions."

writetext(prompt)

for coord, msg in zip(coords, messages):
    # define areas in the image
    area = html.AREA(shape="rect", coords=coord)

    # define actions when mouse moves over or out of the area
    area.bind('mouseover', lambda ev, msg=msg:writetext(msg))
    area.bind('mouseout', lambda ev:writetext(prompt))

    document["familymap"] <= area

```

<div id="description" style="background-color:#700;padding:10px;color:#FFF;"></div>

<img src="/static_doc/images/imagemap_example.png" width ="400" height ="400" alt="Happy Family" usemap="#familymap" />

<map name="familymap" id="familymap">
</map>
