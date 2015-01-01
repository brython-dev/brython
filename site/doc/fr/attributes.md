Attributs et méthodes des éléments
----------------------------------

Les éléments de la page possèdent des attributs et des méthodes qui dépendent du type de l'objet ; on peut les trouver sur de nombreux sites Internet

Comme le nom des attributs peut être différent d'un navigateur à l'autre, Brython définit des attributs supplémentaires qui fonctionnent dans tous les cas :

<table border=1 cellpadding=3>
<tr>
<th>Nom</th><th>Type</th><th>Description</th><th>L = lecture seule<br>L/E = lecture + écriture</th>
</tr>
<tr>
<td>*text*</td><td>chaine</td><td>le texte contenu dans l'élément</td><td>L/E</td>
</tr>
<tr>
<td>*html*</td><td>chaine</td><td>le code HTML  contenu dans l'élément</td><td>L/E</td>
</tr>
<tr>
<td>*left, top*</td><td>entiers</td><td>la position de l'élément par rapport au bord supérieur gauche de la page</td><td>L</td>
</tr>
<tr>
<td>*children*</td><td>liste</td><td>les éléments "descendants" de l'élément</td><td>L</td>
</tr>
<tr>
<td>*parent*</td><td>instance de `DOMNode`</td><td>l'élément parent de l'élément (`None` pour `document`)</td><td>L</td>
</tr>
<tr>
<td>*class_name*</td><td>chaine</td><td>le nom de la classe de l'élément (attribut *class* de la balise)<br></td><td>L/E</td>
</tr>
<tr>
<td>*clear*</td><td>fonction</td><td><code>`elt.clear()</code>` supprime tous les descendants de l'élément</td><td>L</td>
</tr>
<tr>
<td>*remove*</td><td>fonction</td><td><code>`elt.remove(`_child_`)`</code> supprime *child* de la liste des descendants de l'élément</td><td>L</td>
</tr>
</table>

Pour ajouter un descendant à un élément, on utilise l'opérateur `<=` (à visualiser comme une flèche vers la gauche, pas comme "inférieur ou égal")

>    from browser import document, html
>    document['zone'] <= html.INPUT(Id="data")

On peut itérer sur les enfants d'un élément par la syntaxe classique Python : 
>    for child in element:
>        (...)

Pour détruire un élément, utiliser le mot-clé `del`
>    zone = document['zone']
>    del zone

La collection `options` associée à un objet SELECT a l'interface d'une liste Python :

- accès à une option par son index : `option = elt.options[index]`
- insertion d'une option à la position _index_ : `elt.options.insert(index,option)`
- insertion d'une option en fin de liste : `elt.options.append(option)`
- suppression d'une option : `del elt.options[index]`
