Problème
--------

Utiliser la mise en forme HTML basique : gras, italique, entêtes...


Solution
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
    from browser import document, html
    document['zone'] <= html.H1("Introduction à Brython")
    document['zone'] <= html.H4(html.I("Python dans le navigateur"))
    document['zone'] <= html.B("Salut !")
    </script>
    
    </body>
    </html>

<button id="fill_zone">Essayez</button>
</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">Contenu initial<p>
</td>
</tr>
</table>

<script type="text/python3">
from browser import document, html

def fill_zone(ev):
    document['zone'] <= html.H1("Introduction à Brython")
    document['zone'] <= html.H4(html.I("Python dans le navigateur"))
    document['zone'] <= html.B("Salut !")

document['fill_zone'].bind('click', fill_zone)

</script>

`B` est une fonction définie dans le module `html`, correspondant à la balise HTML `<B>` (gras)

`B("texte")` renvoie un objet qui correspond au code HTML `<b>texte</b>`

Toutes les balises HTML ont leur propre fonction : `I, H1, H2,...`. On peut imbriquer les fonctions, comme on peut le voir sur la deuxième ligne :

    doc <= html.H4(html.I("Python dans le navigateur"))

