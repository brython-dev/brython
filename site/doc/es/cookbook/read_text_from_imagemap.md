Problema
--------

Mostrar información al mover el ratón sobre una imagen


Solución
--------

Usaremos el atributo `onmouseover` de la etiqueta HTML `area` y le pasaremos una función python que, en función de su posición, devolverá una cadena de texto.

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
<area shape="rect" coords="0,0,160,95" onmouseover="writetext('Avión volando a wonderland en un soleado día')" />
<area shape="rect" coords="180,0,400,165" onmouseover="writetext('El sol y los planetas gigantes gaseosos como Jupiter son, a distancia, los mayores objetos de nuestro sistema solar.')" />
<area shape="rect" coords="0,120,180,400" onmouseover="writetext('Este soy yo o eres tú.')" />
<area shape="rect" coords="175,235,270,400" onmouseover="writetext('Daniel el travieso!!!!!!!!')" />
</map>
</td>
</tr>

<tr>
<td></td>
<td style="background-color:#ccccee;">
<div id="description"><blink><b>Mueve el ratón sobre los diferentes elementos de la imagen para ver una descripción.</b></blink></div>
</td>
</tr>
</table>

<script type="text/python3">
from browser import document as doc
def writetext(txt):
    doc["description"].text = ""
    doc["description"] <= txt
window.writetext = writetext
</script>
