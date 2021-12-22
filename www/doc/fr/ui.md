** browser.ui **

Ce module permet de construire une interface utilisateur, sans faire appel aux
technologies web habituelles (HTML, CSS).

Il permet de créer des widgets (texte, boutons, liens hypertexte, images,
etc.) et des les insérer dans la page.

Cet exemple donne une idée de l'utilisation du module:

```python
from browser import ui

ui.Document().add(Label('Coucou !'))
```

Il signifie : ajouter au document (`ui.Document()`) le label 'Coucou !'.

## Elément racine

Pour créer une interface utilisation on choisit d'abord une racine, qui peut
être:

`Document(`_background="white", color="black", font=None_`)`

> le document entier

> _background_ est la couleur de fond (voir <a href="#colors">couleurs</a>)

> _color_ est la couleur d'écriture

> _font_ est la police de caractères (voir <a href="#fonts">polices de caractères</a>)

`Box(`_container=document, titlebar=True, title="", background="white",_
 _color="black", font=None, cursor="default", _
 _left=5, top=5, width=None, height=None,_
 _border=Border(1), padding=None_`)`

> une boîte dans la page, pourvu d'une barre de titre qui permet de le
> déplacer par glisser-déposer si _titlebar_ a la valeur `True`

> _container_ est l'élément de la page dans lequel la boite doit être insérée

> _titlebar_ indique s'il faut une barre de titre; si oui, _title_ est le
> texte dans la barre de titre

> _background, color, font_ : même chose que pour `Document()`

> _cursor_ : l'apparence du curseur (voir <a href="#cursor">curseur</a>)

> _left, top_ : la position de la boite par rapport au coin supérieur gauche
> du document. Les valeurs peuvent être un nombre de pixels, ou une chaine de
> caractères représentant une <a href="#distance">distance</a>

> _width, height_ : la largeur et la hauteur de la boite (mêmes unités que
> pour _left_ et _top_)

> _border_ : la bordure de la boite (voir <a href="#border">bordures</a>)

> _padding_ : l'espace à laisser entre le bord intérieur de la boite et les
> éléments qui y seront insérés (voir <a href="#padding">padding</a>)

<table>
<tr>
<td width="50%">
```exec
from browser import document, ui

ui.Box(container=document["example-box"],
       title="Hello !")
```
Le code ci-dessus est éditable, vous pouvez modifier les paramètres et voir
l'effet en cliquant sur le bouton ▶
</td>
<td id="example-box" valign="top" style="padding-left:3em;">
<i style="font-size:0.7em">example-box</i>
</td>
</tr>
</table>
## Widgets

`Button(`_texte, command=None, **options_`)`

> un bouton sur lequel s'affiche le _texte_

> si _command_ est spécifié, il s'agit d'une fonction qui est appelée quand
> l'utilisateur appuie sur le bouton. Elle est appelée avec le widget comme
> argument



`Label(`_valeur, **options_`)`

> représente une valeur à afficher dans le document

> les _options_ possibles sont : _background, color, font, cursor_ (mêmes
> définitions que pour `Box`)

# Construction de l'interface

Une interface est construite à l'intérieur d'un élément racine (`Document`,
`Box`) ou d'un cadre ( `Frame`).

Cet élément racine est découpé en un tableau constitué de lignes et de
colonnes. Les widgets sont ajoutés dans une cellule du tableau par la méthode

`add(`_widget, row="current", rowspan=1, column="next", columnspan=1,_
_border=None, align="center"_`)`

> _widget_ est le widget à ajouter

> _row_ est le numéro de rang dans le tableau. Par défaut, un nouveau widget
> est ajouté sur le même rang que le widget précédent. Si _row_ vaut "next",
> il est ajouté dans la ligne suivante du tableau. Si _row_ est un entier,
> il indique le numéro de ligne où mettre le widget

> _rowspan_ indique combien de lignes le widget doit occuper dans le tableau

> _column_ est le numéro de colonne dans la ligne. Par défaut, le widget est
> ajouté dans la colonne à droite du widget précédent. Si _column_ est un
> entier, il indique le numéro de colonne où mettre le widget

> _columnspan_ est le nombre de colonnes que le widget occupe dans le tableau

> _border_ est la bordure à tracer sur les bords de la cellule du tableau

> _align_ définit l'alignement du widget dans la cellule:

>> - horizontal : "left", "center" ou "right"

>> - vertical : "top", "middle" ou "bottom"

>> On peut combiner les deux alignements (par exemple "top right")

Exemple
<table>
<tr>
<td>
```exec
from browser import ui, document

zone = document["example-label"]
zone.clear()

label = ui.Label(value="test",
                 background="yellow",
                 color="red",
                 font=ui.Font("Consolas", 10, "bold"),
                 border=ui.Border(1),
                 padding=ui.Padding(3),
                 margin=ui.Margin(5, left=10))

root = ui.Box(zone, titlebar=False)
root.add(label)
```
</td>
<td id="example-label" valign="top" style="padding-left:3em;">
<i style="font-size:0.7em">example-label</i>

</td>
</tr>
</table>
