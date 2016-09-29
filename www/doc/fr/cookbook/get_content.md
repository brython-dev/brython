Problème
--------
Obtenir le contenu d'un élément de la page web


Solution
--------

<table width="100%">
<tr>
<td style="width:50%;">

### Montrer le texte

```exec
from browser import document, alert
# document['zone'] est la cellule colorée
alert(document['zone'].text)
```

### Montrer le code HTML

```exec
from browser import document, alert
alert(document['zone'].html)
```

### Montrer la valeur saisie dans le champ

```exec
from browser import document, alert
# document['entry'] est le champ de saisie
alert(document['entry'].value)
```
</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">
<B>Contenu de la cellule</B><p>
<INPUT id="entry" value="champ de saisie">
</td>
</tr>
</table>


Chaque élément de la page a un attribut `text`, une chaine de caractères avec
 le texte visible dans l'élément

Il possède aussi un attribut `html`, une chaine avec le code HTML contenu dans 
l'élément

Les champs de saisie ont un attribut `value`, une chaine avec la valeur saisie

`alert()` est une fonction du module **browser** qui affiche ses arguments 
dans une fenêtre

