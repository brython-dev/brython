Problem
-------

Show information when the mouse is over an area of the image


Solution
--------

We will use the `onmouseover` atribute of the `area` HTML tag. A text will be shown on screen depending on the position of the mouse :

<table width="100%">
<tr>
<td style="width:40%;padding-right:10px;">

    from browser import document as doc

    def writetext(txt):
        doc["description"].text = ""
        doc["description"] <= txt

</td>
<td style="background-color:#FF7400;text-align:center;">
<img src="../images/imagemap_example.png" width ="400" height ="400" alt="Happy Family" usemap="#familymap" />

<map name="familymap">
<area shape="rect" coords="0,0,160,95" onmouseover="writetext('This plane was flying to wonderland in a sunny day')" />
<area shape="rect" coords="180,0,400,165" onmouseover="writetext('The Sun and the gas giant planets like Jupiter are by far the largest objects in our Solar System.')" />
<area shape="rect" coords="0,120,180,400" onmouseover="writetext('This is me or you.')" />
<area shape="rect" coords="175,235,270,400" onmouseover="writetext('Dennis the menace!!!!!!!!')" />
</map>
</td>
</tr>

<tr>
<td></td>
<td style="background-color:#ccccee;text-align:center;">
<div id="description"><blink><b>Mouse over the items in the image to see the different descriptions.</b></blink></div>
</td>
</tr>
</table>

<script type="text/python3">
from browser import document as doc
from browser import window
def writetext(txt):
    doc["description"].text = ""
    doc["description"] <= txt
window.writetext = writetext
</script>
