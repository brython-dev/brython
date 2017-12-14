Utiliser des objets Javascript
------------------------------

Il faut gérer la période transitoire où Brython va cohabiter avec Javascript
;-)

### Accès aux objets Brython depuis Javascript

Brython n'expose par défaut que deux noms dans l'espace de noms global de
Javascript :

> `brython()` : la fonction exécutée au lancement de la page web.

> `__BRYTHON__` : un objet utilisé en interne par Brython pour stocker les
> objets nécessaires à l'exécution des scripts.

Par défaut, un programme Javascript ne donc peut pas accéder aux objets
Brython. Par exemple, si on veut utiliser une fonction `echo()` définie dans
un script Brython pour réagir à un événement sur un élément de la page, au
lieu de la syntaxe

```xml
<button onclick="echo()">
```

qui ne fonctionne pas puisque le nom _echo_ n'est pas accessible depuis
Javascript, il faut plutôt affecter un id à l'élément :

```xml
<button id="echo">
```

et définir le lien entre cet élément et un événement _click_ par :

```python
document['echo'].bind('click',echo)
```

Une autre possibilité est de forcer l'inscription de _echo_ dans l'espace de
noms Javascript en le définissant comme attribut de l'objet `window` du module
**browser** :

```python
from browser import window
window.echo = echo
```

Cette méthode n'est pas recommandée, parce qu'elle introduit un risque de
conflit avec des noms définis dans un programme ou une librairie Javascript
utilisée dans la page.

### Utilisation d'objets Javascript dans un script Brython

Un document HTML peut utiliser des scripts ou des librairies Javascript, et
des scripts ou des librairies Python.

Les noms qui sont ajoutés par les programmes Javascript à l'espace de noms
Javascript sont accessibles depuis les scripts Brython comme attributs de
l'objet `window` défini dans le module **browser**.

Par exemple :

```xml
<script type="text/javascript">
circle = {surface:function(r){return 3.14*r*r}}
</script>

<script type="text/python">
from browser import document, window

document['result'].value = window.circle.surface(10)
</script>
```

Les objets Javascript sont convertis en leurs équivalents Python selon le
tableau suivant :

<table border='1' cellpadding=3>

<tr><th>Objet Javascript (js\_obj)</th><th>Objet Python (window.js\_obj)</th>
</tr>
<tr><td>Elément DOM</td><td>instance de `DOMNode`</td></tr>
<tr><td>Evénement DOM</td><td>instance de `DOMEvent`</td></tr>
<tr><td>Collection d’éléments DOM</td><td>liste d'instances de `DOMNode`</td>
</tr>
<tr><td>`null, true, false`</td><td>`None, True, False`</td></tr>
<tr><td>entier (Integer)</td><td>instance de `int`</td></tr>
<tr><td>réel (Float)</td><td>instance de `float`</td></tr>
<tr><td>chaîne (String)</td><td>instance de `str`</td></tr>
<tr><td>tableau Javascript (Array)</td><td>instance de `list`</td></tr>
</table>

Les autres objets Javascript sont convertis en une instance de la classe
`JSObject` définie dans le module **javascript**. On peut les convertir
en dictionnaire Python par :

```python
py_obj = window.js_obj.to_dict()
```

Si l'objet est une fonction, les arguments passés à la fonction Python sont
convertis dans l'appel de la fonction Javascript en utilisant le tableau
inverse de celui ci-dessus.

Attention, une fonction Javascript ne peut pas être appelée avec des
arguments par mots-clés, cela déclenche une exception `TypeError` : si la
fonction est définie par

```python
function foo(x, y)
```
et qu'on l'appelle depuis un script Brython par

```python
window.foo(y=0, x=1)
```
la conversion des arguments dans le bon ordre n'est pas possible, parce que le
script Brython ne connait pas la signature de la fonction Javascript.

### Utilisation de constructeurs Javascript dans un script Brython

Si une fonction Javascript est un constructeur d'objets, qu'on peut appeler
dans du code Javascript avec le mot-clé `new`, on peut l'utiliser avec Brython
en utilisant la méthode spéciale `new` ajoutée par Brython à l'objet
Javascript.

Par exemple :

```xml
<script type="text/javascript">
function Rectangle(x0,y0,x1,y1){
    this.x0 = x0
    this.y0 = y0
    this.x1 = x1
    this.y1 = y1
    this.surface = function(){return (x1-x0)*(y1-y0)}
}
</script>

<script type="text/python">
from browser import alert, window

rectangle = window.Rectangle
alert(rectangle.new(10,10,30,30).surface())
</script>
```

### Exemple d'interface avec jQuery

Voici un exemple plus complet qui montre comment utiliser la populaire
librairie jQuery :

```xml
<html>
<head>
<script src="//ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js">
</script>
<script src="/src/brython.js"></script>
</head>

<script type="text/python">
from browser import window

jq = window.jQuery

# appel Ajax
def onSuccess(data, status, req):
    print(data)
    print(status)

jq.ajax('/cgi-bin/post_test.py',
    {'data':
        {'foo': 56},
     'success': onSuccess
    }
)

# ajouter une option à un menu déroulant SELECT
jq('#sel').append('<option>three')

# accéder aux attributs d'un élément
assert jq('#c').attr('id') == 'c'

# définir une fonction associée au clic sur un bouton
def callback(ev):
    print(jq(ev.target).text())

jq('#btn').on('click', callback)

# on peut même utiliser "each" pour itérer sur des éléments
def show(i, obj):
    print(i, obj)

jq.each(jq('span'), show)
</script>

<body onload="brython(1)">

<select id="sel">
  <option value="one">one
  <option value="two">two
</select>

<span id="c"></span>

<button id="btn">click</button>

</body>
</html>
```

### Autres exemples

Vous trouverez dans la [galerie](../../gallery/gallery_fr.html) d'autres
exemples d'utilisation de librairies Javascript (Three, Highcharts, Raphael)
dans des scripts Brython.

### Intégration d'une librairie Javascript dans un module Python

Une autre façon d'intégrer une librairie est de créer un module Python qui
peut être importé par des scripts, sans que la librairie soit chargée dans
la page du script.

Pour cela, la librairie doit être accessible par un appel Ajax. Elle est
chargée par la fonction `load(url)` du module [browser](browser.html), et
les noms qu'elle ajoute à l'espace de noms global de Javascript sont
exposés dans le module Python.

Par exemple, on peut créer un module **jquery**:

```python
from browser import window, load

load("/path/to/jquery.min.js")

# jQuery ajoute le nom jQuery à l'espace de noms global Javascript
# (aussi appelé $, mais ce n'est pas un identifiant Python valide)
jq = window.jQuery
```

On peut ensuite utiliser ce module dans une page Brython (notez qu'on n'y
charge pas jquery):

```xml
<html>
<head>
<script src="brython.js"></script>
</head>
<body onload="brython(1)">
<script type="text/python">
import jquery

jquery("#test").text("I can use jQuery here !")
</script>

<div id="test"></div>
</body>
</html>
```
