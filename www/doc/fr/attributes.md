Attributs et méthodes des éléments
----------------------------------

Les éléments de la page possèdent des attributs et des méthodes qui dépendent du type de l'objet ; ils sont définis dans les spécifications du W3C et on peut les trouver sur de nombreux sites Internet.

Comme le nom des attributs peut être différent d'un navigateur à l'autre, Brython définit des attributs supplémentaires qui fonctionnent dans tous les cas :

<table border=1 cellpadding=3>
<tr>
<th>Nom</th><th>Type</th><th>Description</th><th>L = lecture seule<br>L/E = lecture + écriture</th>
</tr>

<tr>
<td>*abs_left*</td><td>entier</td><td>position de l'élément par rapport au bord gauche de l'écran</td><td>L</td>
</tr>

<tr>
<td>*abs_top*</td><td>entier</td><td>position de l'élément par rapport au bord supérieur de l'écran</td><td>L</td>
</tr>

<tr>
<td>*children*</td><td>liste</td><td>les éléments "descendants" de l'élément</td><td>L</td>
</tr>

<tr>
<td>*class_name*</td><td>chaine</td><td>le nom de la classe de l'élément (attribut *class* de la balise)<br></td><td>L/E</td>
</tr>

<tr>
<td>*clear*</td><td>méthode</td><td><code>`elt.clear()</code>` supprime tous les descendants de l'élément</td><td>-</td>
</tr>

<tr>
<td>*height*</td><td>entier</td><td>hauteur de l'élément en pixels (2)</td><td>L/E</td>
</tr>

<tr>
<td>*html*</td><td>chaine</td><td>le code HTML  contenu dans l'élément</td><td>L/E</td>
</tr>

<tr>
<td>*inside*</td><td>méthode</td><td>`elt.inside(autre)` teste si `elt` est contenu dans l'élément `autre`</td><td>-</td>
</tr>

<tr>
<td>*left*</td><td>entier</td><td>la position de l'élément par rapport au bord gauche du premier parent positionné (1)</td><td>L/E</td>
</tr>

<tr>
<td>*parent*</td><td>instance de `DOMNode`</td><td>l'élément parent de l'élément (`None` pour `document`)</td><td>L</td>
</tr>

<tr>
<td>*remove*</td><td>fonction</td><td><code>`elt.remove(`_child_`)`</code> supprime *child* de la liste des descendants de l'élément</td><td>L</td>
</tr>

<tr>
<td>*text*</td><td>chaine</td><td>le texte contenu dans l'élément</td><td>L/E</td>
</tr>

<tr>
<td>*top*</td><td>entier</td><td>la position de l'élément par rapport au bord supérieur du premier parent positionné (1) </td><td>L/E</td>
</tr>

<tr>
<td>*width*</td><td>entier</td><td>largeur de l'élément en pixels (2)</td><td>L/E</td>
</tr>


</table>

(1) En remontant dans l'arbre DOM, on s'arrête au premier élément dont l'attribut `style.position` est défini à une valeur autre que "static". `left` et `top` ont le même mode de calcul que `style.left` et `style.top` mais sont des valeurs entières et pas des chaines de caractères se terminant par `px`.

(2) Même mode de calcul que `style.height` ou `style.width` mais ce sont des valeurs entières

Pour ajouter un descendant à un élément, on utilise l'opérateur __<=__ (à visualiser comme une flèche vers la gauche, pas comme "inférieur ou égal")

```python
from browser import document, html
document['zone'] <= html.INPUT(Id="data")
```

On peut itérer sur les enfants d'un élément par la syntaxe classique Python : 

```python
for child in element:
    (...)
```

Pour détruire un élément, utiliser le mot-clé `del`
```python
zone = document['zone']
del zone
```

La collection `options` associée à un objet SELECT a l'interface d'une liste Python :

- accès à une option par son index : `option = elt.options[index]`
- insertion d'une option à la position _index_ : `elt.options.insert(index,option)`
- insertion d'une option en fin de liste : `elt.options.append(option)`
- suppression d'une option : `del elt.options[index]`
