Problema
--------

Mostrar contenido en un elemento de la p&aacute;gina


Solución
--------

<table width="100%">
<tr>
<td style="width:50%;">

```exec
from browser import document
document['zone'] <= "blah "
```
</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">Contenido 
inicial<p>
</td>
</tr>
</table>

`doc["zone"]` es el elemento en la p&aacute;gina web con el id "zone" (aquí, 
la celda coloreada de la tabla)


