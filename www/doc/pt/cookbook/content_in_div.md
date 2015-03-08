Problema
--------

Mostrar conteúdo em um elemento da página web


Solução
-------

<table width="100%">
<tr>
<td style="width:50%;">

    <html>
    <head>
    <script src="brython.js"></script>
    </head>
    <body onload="brython()">
    
    <script type="text/python">
    from browser import doc
    doc['zone'] <= "blah "
    </script>
    
    </body>
    </html>

<button id="fill_zone">Teste</button>
</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">Conteúdo inicial<p>
</td>
</tr>
</table>

<script type="text/python3">
from browser import doc

def fill_zone(ev):
    doc["zone"] <= "bla "

doc['fill_zone'].bind('click', fill_zone)
</script>

`doc["zone"]` é o elemento na página web com id "zone" (a célula
colorida da tabela).

