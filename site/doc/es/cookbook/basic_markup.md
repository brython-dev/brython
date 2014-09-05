Problema
--------

Uso de las etiquetas HTML b&aacute;sicas: bold, italic, headers...


Soluci&oacute;n
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
    from browser import html
    doc['zone'] <= html.H1("Presentando a Brython")
    doc['zone'] <= html.H4(html.I("Python en el navegador"))
    doc['zone'] <= html.B("Hola mundo !")
    </script>
    
    </body>
    </html>

<button id="fill_zone">Pru&eacute;balo</button>
</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">Contenido inicial<p>
</td>
</tr>
</table>

<script type="text/python3">
def fill_zone(ev):
    from browser import document as doc
    from browser import html
    doc['zone'] <= html.H1("Presentando a Brython")
    doc['zone'] <= html.H4(html.I("Python en el navegador"))
    doc['zone'] <= html.B("Hola mundo !")

doc['fill_zone'].bind('click', fill_zone)
</script>

`B` es una función definida en el módulo `browser.html`, que coincide con la etiqueta HTML `<B>` (bold)

`B("text")` devuelve un objeto que conincide con el HTML `<b>text</b>`

Todas las etiquetas HTML tienen su propia función : `I, H1, H2,...`. Puedes anidar funciones, como se muestra en la segunda línea :

    doc <= html.H4(html.I("Python en el navegador"))

