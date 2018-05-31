Attributs et méthodes des éléments
----------------------------------

### Attributs et propriétés DOM

Le DOM définit deux concepts différents pour les éléments d'une page:

- les _attributs_, qui sont définis dans une balise HTML (ou SVG) : par
  exemple, `<img src="icon.png">` définit l'attribut `src` de l'élément créé
  par la balise `<img>`
- les _propriétés_, qui peuvent être attachés à l'élément par la syntaxe
  pointée : affectation par `element.nom_propriete = valeur`, lecture par
  `valeur = element.nom_propriete`

Le DOM définit également une relation entre _certains_ attributs et
_certaines_ propriétés. En général, en ce qui concerne les attributs attendus
pour une balise donnée (par exemple "id" ou "class" pour n'importe quel type
de balise, "src" pour une balise IMG, "href" pour une balise A, etc), quand on
affecte une valeur à l'attribut, une propriété correspondante reçoit aussi une
valeur. Dans la plupart des cas, le nom de la propriété est le même que celui
de l'attribut, mais il y a des exceptions : la propriété pour l'attribut
"class" est "className". En général, la valeur de la propriété est la même que
celle de l'attribut, mais pas toujours : par exemple, dans le cas d'un élément
défini par `<INPUT type="checkbox" checked="checked">`, la valeur de
l'attribut "checked" est "checked", et la valeur de la propriété "checked" est
le booléen "true".

En plus des attributs définis par la spécification pour une balise donnée, des
attributs additionnels peuvent être définis (les moteurs de template en
utilisent souvent) ; pour ces attributs, il n'y a pas de propriété du même
nom. Des propriétés spécifiques peuvent aussi être définies pour un élément,
et ceci ne définit pas d'attribut du même nom.

Les valeurs des attributs sont toujours des chaines de caractères, alors que
les valeurs des propriétés peuvent être de n'importe quel type. Les attributs
sont insensibles à la casse pour les éléments HTML et sensibles à la casse
pour les éléments SVG ; les propriétés sont toujours sensibles à la casse.

### Gestion des attributs et des propriétés en Brython

Brython gère les attributs DOM à travers l'attribut `attrs` des instances de
`DOMNode` ; et les propriétés par la syntaxe pointée.

`element.attrs` est un objet qui se comporte comme un dictionnaire.

```python
# affecte une valeur à un attribut
element.attrs[nom] = valeur

# lit la valeur d'un attribut
valeur = element.attrs[nom] # déclenche une KeyError si l'élément n'a pas
                            # l'attribut "nom"
valeur = element.attrs.get(nom, defaut)

# teste si un attribut est présent
if nom in element.attrs:
    ...

# enlève un attribut
del element.attrs[nom]

# itère sur les attributs d'un élément
for nom in element.attrs:
    ...

for nom in element.attrs.keys():
    ...

for valeur in element.attrs.values():
    ...

for nom, valeur in element.attrs.items():
    ...
```

### Propriétés et méthodes propres à Brython

Par commodité, Brython définit un certain nombre de propriétés et de méthodes:

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
<td>*bind*</td><td>méthode</td><td>gestionnaire d'événements, voir la section [événements](events.html)</td><td>-</td>
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
<td>*closest*</td>
<td>méthode</td>
<td><code>elt.closest(nom_balise)</code> renvoie le premier élément parent
de `elt` avec la balise spécifiée. Déclenche une `KeyError` si aucun élément
n'est trouvé.</td>
<td>-</td>
</tr>

<tr>
<td>*get*</td><td>méthode</td><td>sélectionne des éléments (cf <a href="access.html">accéder aux éléments</a>)</td><td>-</td>
</tr>

<tr>
<td>*height*</td><td>entier</td><td>hauteur de l'élément en pixels (2)</td><td>L/E</td>
</tr>

<tr>
<td>*html*</td><td>chaine</td><td>le code HTML  contenu dans l'élément</td><td>L/E</td>
</tr>

<tr>
<td>*index*</td><td>méthode</td><td>`elt.index([selector])` renvoie le rang (entier) de l'élément parmi les enfants de son parent.
Si _selector_ est spécifié, seuls les enfants correspondant à ce sélecteur sont retenus ; dans ce cas, si l'élément
ne correspond pas au sélecteur, la méthode renvoie -1</td><td>-</td>
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
<td>*select*</td><td>méthode</td><td>`elt.select(css_selector)` renvoie les éléments correspondant au sélecteur CSS spécifié</td><td>-</td>
</tr>

<tr>
<td>*select_one*</td>
<td>méthode</td>
<td>`elt.select_one(css_selector)` renvoie l'élément correspondant au sélecteur CSS spécifié, sinon `None`</td>
<td>-</td>
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
