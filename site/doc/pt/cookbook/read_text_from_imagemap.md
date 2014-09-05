Problema
--------

Mostrar informação quando o mouse estiver sobre uma área de uma
imagem.


Solução
-------

Usaremos o atributo `onmouseover` da etiqueta HTML `area`. Um texto
será mostrado na tela dependendo da posição do mouse:

<table width="100%">
<tr>
<td style="width:40%;padding-right:10px;">

    from browser import doc

    def writetext(txt):
        doc["description"].text = ""
        doc["description"] <= txt

</td>
<td style="background-color:#FF7400;text-align:center;">
<img src="../images/imagemap_example.png" width ="400" height ="400" alt="Família Feliz" usemap="#familymap" />

<map name="familymap">
<area shape="rect" coords="0,0,160,95" onmouseover="writetext('Este avião estava voando para o país das maravilhas em um dia ensolarado')" />
<area shape="rect" coords="180,0,400,165" onmouseover="writetext('O Sol e os planetas gigantes gasosos como Júpiter são, de longe, os maiores objetos em nosso Sistema Solar.')" />
<area shape="rect" coords="0,120,180,400" onmouseover="writetext('Este sou eu ou você.')" />
<area shape="rect" coords="175,235,270,400" onmouseover="writetext('Dennis, o perigoso!!!!!!!!')" />
</map>
</td>
</tr>

<tr>
<td></td>
<td style="background-color:#ccccee;text-align:center;">
<div id="description"><blink><b>Passe o mouse sobre os itens na imagem para ver as diferentes descrições.</b></blink></div>
</td>
</tr>
</table>

<script type="text/python3">
from browser import doc
def writetext(txt):
    doc["description"].text = ""
    doc["description"] <= txt
window.writetext = writetext
</script>
