interpreter
-----------

Ce module permet d'ouvrir un interpréteur Python interactif dans une page. Il
est utilisé par la [console](https://www.brython.info/tests/console.html) et
l'[éditeur](https://www.brython.info/tests/editor.html) du site
[brython.info](https://brython.info).

### Classes

`Interpreter(element=None, title="Interactive Interpreter", globals=None, locals=None, rows=30, cols=84, default_css=True)`

- si _element_ est `None`, l'interpréteur est ouvert dans une nouvelle boite
  de dialogue (cf. le module [browser.widgets.dialog](widgets-dialog.html)).
  Sinon, _element_ peut être un élément TEXTAREA de la page, ou si c'est une
  chaine de caractères, elle doit correspondre à l'attribut `id` d'un élément
  TEXTAREA de la page
- _title_ est le titre à afficher dans la boite de dialogue
- _globals_ et _locals_ sont l'environnement dans lequel les commandes de
  l'interpréteur seront exécutés (par défaut, des dictionnaires vides)
- _rows_ et _cols_ sont les dimensions du TEXTAREA
- _default_css_ indique s'il faut utiliser la feuille de style fournie par le
  module. Si la valeur est `False`, les styles définis dans la page HTML sont
  utilisés (voir "Style CSS" ci-dessous)

<blockquote>
```exec
from interpreter import Interpreter

Interpreter()
```
</blockquote>


`Inspector(title="Frames inspector", rows=30, cols=84, default_css=True)`
> Ouvre une boite de dialogue comprenant un interpréteur interactif qui
> s'exécute dans les cadres (frames) d'exécution du programme. Ceci peut
> être utilisé pour le débogage.
>
> Noter que l'ouverture de l'inspecteur ne bloque pas l'exécution du
> programme; en revanche, les espaces de nom utilisés dans l'interpréteur
> représentent l'état au moment de l'ouverture

> Ainsi, dans l'exemple suivant, la valeur de `y` dans le cadre `f` vaudra
> 8 et non pas 9:
<blockquote>
```exec
from interpreter import Inspector

def f(x):
  y = 8
  Inspector()
  y = 9

f(5)
```
</blockquote>


### Style CSS

Si un interpréteur est ouvert dans un TEXTAREA existant, c'est la feuille de
style de la page HTML qui est utilisée.

Sinon, si l'argument _default_css_ vaut `True` (valeur par défaut), la feuille 
de style suivante est insérée dans le document courant:

<blockquote>
```css
.brython-interpreter {
    background-color: #000;
    color: #fff;
    font-family: consolas, courier;
}
```
</blockquote>

Pour personnaliser l'apparence des boites, il faut passer comme argument
`default_css=False` et redéfinir la classe CSS `brython-interpreter`. Le plus
simple est de copier-coller la feuille de style ci-dessus et de l'éditer.
