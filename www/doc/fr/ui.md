** browser.ui **

Ce module permet de construire une interface utilisateur, sans faire appel aux
technologies web habituelles (HTML, CSS).

# Introduction

```python
from browser import ui

box = ui.Box()
element = ui.Label("Coucou")
box.add(element)
```

L'interface utilisateur est construite en ajoutant des éléments (ou "widgets")
à des boites de dialogue définis par la classe `ui.Box`:

La boite est elle-même insérée dans un conteneur, qui est le document par
défaut, mais qui peut être spécifié par l'argument _container_:

<table width="100%">
<tr>
<td width="50%">
```exec
from browser import document, ui

container = document["example-box-container"]
container.clear()

box = ui.Box(container)
box.add(ui.Label("Coucou"))
```
</td>
<td valign="top">
<i style="font-size:0.7em">example-box-container</i>
<div id="example-box-container" style="position:relative;"></div>
</td>
</tr>
</table>
_Le code ci-dessus est éditable, vous pouvez modifier les paramètres (par_
_exemple le texte du `Label`) et voir l'effet en cliquant sur le bouton_ ▶

Par défaut, la boite occupe toute la largeur du conteneur. Pour en occuper
seulement une partie, on passe l'argument _width_ comme argument de `Box`:

<table width="100%">
<tr>
<td width="50%">
```exec
from browser import document, ui

container = document["example-box-width"]
container.clear()

box = ui.Box(container, width="50%")
box.add(ui.Label("Coucou"))
```
</td>
<td valign="top">
<i style="font-size:0.7em">example-box-width</i>
<div id="example-box-width" style="position:relative;"></div>
</td>
</tr>
</table>



Chaque élément est positionné dans une _cellule_ du conteneur.

Par défaut, la méthode *add()* ajoute chaque élément dans la cellule à droite
de l'élément précédent.

<table>
<tr>
<td width="50%">
```exec
from browser import document, ui

root = ui.Box(container=document["example-add-1"])
root.add(ui.Label("Un"))
root.add(ui.Label("Deux"))
```
</td>
<td id="example-add-1" valign="top" style="padding-left:3em;">
<i style="font-size:0.7em">example-add-1</i>
</td>
</tr>
</table>

Pour passer à la ligne suivante, il suffit d'ajouter l'argument
_row="next"_.

<table>
<tr>
<td width="50%">
```exec
from browser import document, ui

root = ui.Box(container=document["example-add-2"])
root.add(ui.Label("Un"))
root.add(ui.Label("Deux"), row='next')
```
</td>
<td id="example-add-2" valign="top" style="padding-left:3em;">
<i style="font-size:0.7em">example-add-2</i>
</td>
</tr>
</table>

On peut spécifier la couleur de fond de la boite par l'argument _background_,
qui peut prendre comme valeur un nom de couleur en anglais:

<table>
<tr>
<td width="50%">
```exec
from browser import document, ui

root = ui.Box(container=document["example-background-1"],
              background='yellow')
root.add(ui.Label("gauche"))
root.add(ui.Label("droite"))
```
</td>
<td id="example-background-1" valign="top" style="padding-left:3em;">
<i style="font-size:0.7em">example-background-1</i>
</td>
</tr>
</table>

On peut également spécifier la couleur de chaque `Label` par _background_, et
la couleur du texte par _color_:

<table>
<tr>
<td width="50%">
```exec
from browser import document, ui

root = ui.Box(container=document["example-background-2"])
root.add(ui.Label("gauche", background="red", color="white"))
root.add(ui.Label("droite", background="blue", color="yellow"))
```
</td>
<td id="example-background-2" valign="top" style="padding-left:3em;">
<i style="font-size:0.7em">example-background-2</i>
</td>
</tr>
</table>


## Alignement des cellules

Par défaut, un élément est inséré dans une cellule et la largeur des cellules
s'ajuste selon le contenu le plus long dans chaque colonne.

<table>
<tr>
<td width="50%">
```exec
from browser import document, ui

playground = document["example-cells-width"]
playground.clear()

root = ui.Box(container=playground)

root.add(ui.Label("texte sur fond vert", background='green', color='white'))
root.add(ui.Label("texte sur fond rouge", background='red', color='white'))
root.add(ui.Label("je suis un texte sur fond violet", background='purple',
    color='white'), row='next')
root.add(ui.Label("orange", background='orange', color='blue'))
```
</td>
<td id="example-cells-width" valign="top" style="padding-left:3em;">
<i style="font-size:0.7em">example-cells-width</i>
</td>
</tr>
</table>

Pour qu'un élement occupe plus d'une colonne, on passe l'argument _columnspan_
à la méthode _add()_.

Noter aussi l'argument _align_ qui indique comment aligner l'élément à
l'intérieur de la cellule.

<table>
<tr>
<td width="50%">
```exec
from browser import document, ui

playground = document["example-columnspan"]
playground.clear()

root = ui.Box(container=playground)

root.add(ui.Label("texte sur fond vert", background="green", color="white"),
         columnspan=2,
         align="center")
root.add(ui.Label("je suis un texte sur fond violet", background="purple",
    color="white"), row='next')
root.add(ui.Label("orange", background="orange", color="blue"))
```
</td>
<td id="example-columnspan" valign="top" style="padding-left:3em;">
<i style="font-size:0.7em">example-columnspan</i>
</td>
</tr>
</table>

En combinant avec l'argument _rowspan_:

<table>
<tr>
<td width="50%">
```exec
from browser import document, ui

playground = document["example-rowspan"]
playground.clear()

root = ui.Box(container=playground)

root.add(ui.Label("texte sur fond vert", background="green", color="white"),
         columnspan=2,
         align="center")
root.add(ui.Label("je suis un texte sur fond violet", background="purple",
    color="white"), row='next', rowspan=2)
root.add(ui.Label("orange", background="orange", color="blue"))
root.add(ui.Label("jaune", background="yellow", color="blue"),
         row='next')

```
</td>
<td id="example-rowspan" valign="top" style="padding-left:3em;">
<i style="font-size:0.7em">example-rowspan</i>
</td>
</tr>
</table>

Dans ce dernier exemple, le texte sur fond violet est contenu dans une cellule
sur fond blanc. Pour spécifier le style de la cellule elle-même, les arguments
doivent être passés à *add()*:

<table>
<tr>
<td width="50%">
```exec_on_load
from browser import document, ui

playground = document["example-cell-background"]
playground.clear()

root = ui.Box(container=playground)

root.add(ui.Label("texte sur fond vert", background="green", color="white"),
         columnspan=2,
         align="center")

root.add(ui.Label("je suis un texte sur fond violet", color="white"),
         row="next",
         rowspan=2,
         background="purple")
root.add(ui.Label("orange", background="orange", color="blue"))
root.add(ui.Label("jaune", background="yellow", color="blue"),
         row='next')
```
</td>
<td id="example-cell-background" valign="top" style="padding-left:3em;padding-top:3em;">
<i style="font-size:0.7em">example-cell-background</i>
</td>
</tr>
</table>


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

Tous les widgets héritent de la classe `Widget`, qui possède les méthodes
suivantes

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
