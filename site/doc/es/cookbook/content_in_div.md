Problema
--------

Mostrar contenido en un elemento de la p&aacute;gina


Solución
--------

<table width="100%">
<tr>
<td style="width:50%;">

    <html>
    <head>
    <script src="brython.js"></script>
    </head>
    <body onload="brython()">
    
    <script type="text/python">
    from browser import document as doc
    doc['zone'] <= "blah "
    </script>
    
    </body>
    </html>

<button id="fill_zone">Pruébalo</button>
</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">Contenido inicial<p>
</td>
</tr>
</table>

<script type="text/python3">
from browser import document as doc

def fill_zone(ev):
    doc["zone"] <= "bla "

doc['fill_zone'].bind('click', fill_zone)
</script>

`doc["zone"]` es el elemento en la p&aacute;gina web con el id "zone" (aquí, la celda coloreada de la tabla)


