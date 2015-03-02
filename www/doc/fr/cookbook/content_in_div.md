Problème
--------

Afficher du contenu dans un élément de la page web


Solution
--------

<table width="100%">
<tr>
<td style="width:50%;">

```exec
from browser import document
document['zone'] <= "bla "
```

</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">Contenu initial<p>
</td>
</tr>
</table>

`document["zone"]` est l'élément dans la page web qui possède l'id "zone" (ici, la cellule colorée)


