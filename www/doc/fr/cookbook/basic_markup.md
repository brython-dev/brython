Problème
--------

Utiliser la mise en forme HTML basique : gras, italique, entêtes...


Solution
--------


<table width="100%">
<tr>
<td style="width:50%;">

```exec
from browser import document, html

document['zone'].clear()
document['zone'] <= html.H1("Introduction à Brython")
document['zone'] <= html.H4(html.I("Python dans le navigateur"))
document['zone'] <= html.B("Salut !")
```

</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">
Contenu initial<p>
</td>
</tr>
</table>


`B` est une fonction définie dans le module `html`, correspondant à la balise
 HTML `<B>` (gras)

`B("texte")` renvoie un objet qui correspond au code HTML `<b>texte</b>`

Toutes les balises HTML ont leur propre fonction : `I, H1, H2,...`. On peut 
imbriquer les fonctions, comme on peut le voir sur la deuxième ligne :

```python
doc <= html.H4(html.I("Python dans le navigateur"))
```
