module **browser.html**
-----------------------

Ce module définit des classes correspondant aux balises HTML, en majuscules.

Les classes définies sont :

- les balises HTML4 : <code>A, ABBR, ACRONYM, ADDRESS, APPLET, AREA, B, BASE,
BASEFONT, BDO, BIG, BLOCKQUOTE, BODY, BR, BUTTON,
CAPTION, CENTER, CITE, CODE, COL, COLGROUP, DD,
DEL, DFN, DIR, DIV, DL, DT, EM, FIELDSET, FONT,
FORM, FRAME, FRAMESET, H1, H2, H3, H4, H5, H6,
HEAD, HR, HTML, I, IFRAME, IMG, INPUT, INS,
ISINDEX, KBD, LABEL, LEGEND, LI, LINK, MAP, MENU,
META, NOFRAMES, NOSCRIPT, OBJECT, OL, OPTGROUP,
OPTION, P, PARAM, PRE, Q, S, SAMP, SCRIPT, SELECT,
SMALL, SPAN, STRIKE, STRONG, STYLE, SUB, SUP, SVG,
TABLE, TBODY, TD, TEXTAREA, TFOOT, TH, THEAD,
TITLE, TR, TT, U, UL, VAR</code>

- les balises HTML5 : <code>ARTICLE, ASIDE, AUDIO, BDI, CANVAS,
COMMAND, DATA, DATALIST, EMBED, FIGCAPTION,
FIGURE, FOOTER, HEADER, KEYGEN, MAIN, MARK,
MATH, METER, NAV, OUTPUT, PROGRESS, RB,
RP, RT, RTC, RUBY, SECTION, SOURCE,
SUMMARY, TEMPLATE, TIME, TRACK, VIDEO,
WBR</code>

- les balises HTML5.1 : `DETAILS, DIALOG, MENUITEM, PICTURE, SUMMARY`

> En suivant [ce lien](https://w3c.github.io/elements-of-html/),
> vous trouverez la liste des balises HTML ainsi que leur documentation. Cette
> spécification est encore provisoire.

La syntaxe pour créer un objet (par exemple un lien hypertexte) est :

`A(`*[content,[attributes]]*`)`

> *content* est le noeud «fils» de l'objet ; il peut s'agir d'un objet Python
> comme une chaîne de caractères, un nombre, etc., ou bien une
> instance d'une autre classe du module **html**.

> *attributes* est une suite de mots-clés correspondant aux
> [attributs](http://www.w3.org/TR/html5-author/index.html#attributes-1) de la
> balise HTML. Les traits d'union (`-`) doivent être remplacés par des soulignés
> (`_`) : *http\_equiv* et pas *http-equiv* (sinon le `-` serait interprété comme
> le signe moins).

Si *content* est un itérable autre qu'une chaine de caractères, tous les
éléments sont ajoutés comme descendants de l'élément. Par exemple :

```python
html.UL(html.LI('item %s' %i) for i in range(5))
```

crée une liste non ordonnée avec les balises `<li>` définies dans l'expression
générateur.

Pour l’attribut *style*, la valeur fournie doit être un dictionnaire :

```python
d = html.DIV('Brython', style={'height':100, 'width':200})
```

ou

```python
d = html.DIV('Brython', style=dict(height=100, width=200))
```

Les mots-clé de *style* doivent être écrits avec la syntaxe Javascript, pas
CSS : *backgroundColor* et non *background-color*.

Pour éviter les conflits avec le mot-clé de Python, l'attribut
*class* doit être écrit avec une majuscule :

```python
d = html.DIV('Brython', Class="container")
```

On peut aussi créer un objet sans argument, puis le compléter :

- pour ajouter un noeud enfant, utiliser l'opérateur **<=**
- pour ajouter des attributs, utiliser la syntaxe Python classique :
  `objet.attribut = valeur`

Exemple :

```python
link = html.A()
link <= html.B('connexion')
link.href = 'http://example.com'
```

On peut aussi créer plusieurs éléments de même niveau par addition (symbole
**+**) :

```python
row = html.TR(html.TH('Nom')+html.TH('Prénom'))
```

et on peut ajouter tous les éléments d'un itérable en une seule opération :

```python
from browser.html import *

t = TABLE()
t <= TR(TH('Number')+TH('Square'))
t <= (TR(TD(i)+TD(i*i)) for i in range(10))
```

En combinant ces opérateurs et la syntaxe Python, voici comment créer une boîte
de sélection à partir d'une liste :

```python
from browser import document
from browser.html import *

document <= SELECT(OPTION(elt, value=i)
    for i, elt in enumerate(['one', 'two', 'three']))
```

Noter que la création d'une instance d'une classe relative aux balises HTML
entraîne la création d'un unique objet DOM. Si on affecte l'instance à une
variable, on ne peut pas l'utiliser à plusieurs endroits. Par exemple :

```python
link = html.A('Python',href='http://www.python.org')
doc <= 'Site officiel de Python : ' + link
doc <= html.BR() + 'Je répète : le site est ' + link
```

le lien ne sera montré que dans la deuxième ligne. Une solution est de cloner
l'objet initial :

```python
link = html.A('Python',href='http://www.python.org')
doc <= 'Site officiel de Python : '+link
doc <= html.BR() + 'Je répète : le site est ' + link.clone()
```

En général, les classes relatives au HTML ont des attributs portant le même nom
que l’objet DOM correspondant. Par exemple, on a accès à l’option choisie par
l’utilisateur au travers de l’attribut `selectedIndex` d’un objet `SELECT`.
Brython permet une approche encore plus pythonique avec quelques ajouts.

Voyons un exemple plus complet. Le code ci-dessous a généré la structure dans
la partie bleue (une `div` identifiée par `id=container`). Nous allons insérer
une structure HTML fictive dans cette `div` : une `div`, un `table`, un `form`
et un `canvas` HTML5 :

<div style="padding-left:50px;">
<table cellpadding=10>
<tr>
<td style="width:100px;">

```exec_on_load
# Tout d’abord, l’import de quelques bibliothèques.
from browser import document as doc
from browser import html

# Nous allons ajouter les éléments à la div identifiée "container".
container = doc['container']

# Création d’une nouvelle div,
newdiv = html.DIV(id = "new-div")
# à laquelle on ajoute du style.
newdiv.style = {"padding": "5px",
               "backgroundColor": "#ADD8E6"}

# Créons un tableau à deux colonnes, une pour le numéro de ligne,
# une pour les mots.
text = "Brython is really cool"
textlist = text.split()
table = html.TABLE()
for i, word in enumerate(textlist):
    table <= html.TR(html.TD(i + 1) +
                     html.TD(word))
# Un peu de style pour ce tableau:
table.style = {"padding": "5px",
               "backgroundColor": "#aaaaaa",
               "width": "100%"}
# Maintenant, on ajoute le tableau à la div précédemment créée
newdiv <= table + html.BR()

# Un formulaire? Pourquoi pas!
form = html.FORM()
input1 = html.INPUT(type="text", name="firstname", value="Prénom")
input2 = html.INPUT(type="text", name="lastname", value="Nom")
input3 = html.BUTTON("Bouton inactif pour l’exemple!")
form <= input1 + html.BR() + input2 + html.BR() + input3

newdiv <= form + html.BR()

# Finalement, quelque chose de plus orienté HTML5, un canvas avec un
# gradient de couleurs.
canvas = html.CANVAS(width = 300, height = 300)
canvas.style = {"width": "100%"}
ctx = canvas.getContext('2d')
ctx.rect(0, 0, 300, 300)
grd = ctx.createRadialGradient(150, 150, 10, 150, 150, 150)
grd.addColorStop(0, '#8ED6FF')
grd.addColorStop(1, '#004CB3')
ctx.fillStyle = grd
ctx.fill()

newdiv <= canvas

# La div est finalement insérée dans le conteneur.
container <= newdiv
```

</td>
<td>
<div id="container"></div>
</td>
</tr>
</table>
</div>

### Création de nouvelles balises

Le module expose la fonction

`maketag(`_nom_`)`

> Crée une nouvelle classe pour une balise avec le nom indiqué. On peut
> cette classe comme celles associées aux noms des balises HTML :

```python
p2 = maketag('P2')
document <= p2('test')
```

Le module possède un autre attribut :

_tags_

> Dictionnaire qui associe des noms de balises (chaines de caractères)
> aux classes correspondantes. Si de nouvelles balises sont ajoutées
> par la fonction `maketag()` elles sont ajoutées à ce dictionnaire.

