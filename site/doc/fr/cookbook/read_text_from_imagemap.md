Problème
--------

Afficher une information au cours du déplacement de la souris sur une image


Solution
--------

On utilise l'attribut `onmouseover` de la balise HTML `area` en lui affectant une fonction qui affiche une chaine de caractères dépendant de la position de la souris dans l'image

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
<area shape="rect" coords="0,0,160,95" onmouseover="writetext('Avion volant dans le ciel par une belle journée')" />
<area shape="rect" coords="180,0,400,165" onmouseover="writetext('Le soleil et les planètes gazeuses géantes comme Jupiter sont, de loin, les plus gros objets de notre système solaire.')" />
<area shape="rect" coords="0,120,180,400" onmouseover="writetext('C\'est toi ou c\'est moi.')" />
<area shape="rect" coords="175,235,270,400" onmouseover="writetext('Daniel la menace!!!!!!!!')" />
</map>

</td>
</tr>

<tr>
<td></td>
<td style="background-color:#ccccee;">
<div id="description"><blink><b>Déplacer la souris sur les différents éléments pour voir une description.</b></blink></div>
</td>
</tr>
</table>

<script type="text/python3">
from browser import doc, window
def writetext(txt):
    doc["description"].text = ""
    doc["description"] <= txt
window.writetext = writetext
</script>
