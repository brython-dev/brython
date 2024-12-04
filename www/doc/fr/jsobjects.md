Interactions avec Javascript
============================

Il faut gérer la période transitoire où Brython va cohabiter avec Javascript
;-)

Un document HTML peut intégrer des scripts ou des librairies Javascript, et
des scripts ou des librairies Python.

Cette page traite des interactions entre les programmes Python et les
programmes Javascript, sous deux aspects:

- <a href="#js_from_brython">utilisation de données Javascript depuis des programmes Brython</a>
- <a href="#brython_from_js">utilisation de données Brython depuis des programmes Javascript</a>

Un point important à noter est que les scripts Brython sont exécutés quand la
page HTML est complètement chargée, alors que les scripts Javascript sont
exécutés au fur et à mesure de leur chargement dans la page. Les scripts
Brython ne peuvent donc pas être utilisés par des programmes Javascript avant
le chargement complet de la page.

<a name="js_from_brython"></a>
## Utilisation de données Javascript depuis des programmes Brython

Les noms qui sont ajoutés par les programmes Javascript à l'espace de noms
Javascript sont accessibles depuis les scripts Brython comme attributs de
l'objet `window` défini dans le module **browser**.

Par exemple :

```xml
<script type="text/javascript">
circle = {surface: function(r){return 3.14 * r * r}}
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
<tr><td>`true, false`</td><td>`True, False`</td></tr>
<tr><td>`null`</td><td>inchangé (1)</td></tr>
<tr><td>`undefined`</td><td>inchangé (1)</td></tr>
<tr><td>nombre (Number)</td><td>instance de `int` ou `float`</td></tr>
<tr><td>big integer (BigInt)</td><td>instance de `int`</td></tr>
<tr><td>chaîne (String)</td><td>instance de `str`</td></tr>
<tr><td>tableau Javascript (Array)</td><td>inchangé (2)</td></tr>
<tr><td>fonction (Function)</td><td>fonction (3)</td></tr>
</table>

_(1) On peut tester la valeur en la comparant avec `is` aux constantes `NULL`_
_et `UNDEFINED` du module [javascript](javascript.html)_

_(2) Les éléments du tableau Javascript sont convertis en objets Python selon_
_ce tableau de correspondance_

_(3) Si l'objet est une fonction, les arguments passés à la fonction Python sont_
_convertis dans l'appel de la fonction Javascript en utilisant le tableau_
_inverse de celui ci-dessus. Si l'argument est un dictionnaire Python, il est_
_converti en objet Javascript; les clés du dictionnaire Python sont converties_
_en chaines de caractères dans l'objet Javascript._

Les autres objets Javascript sont convertis en une instance de la classe
`JSObject` définie dans le module **javascript**. Les objets instance de la
classe `Object` peuvent être convertis en dictionnaire Python par:

```python
py_obj = window.js_obj.to_dict()
```

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
function Rectangle(x0, y0, x1, y1){
    this.x0 = x0
    this.y0 = y0
    this.x1 = x1
    this.y1 = y1
    this.surface = function(){return (x1 - x0) * (y1 - y0)}
}
</script>

<script type="text/python">
from browser import alert, window

rectangle = window.Rectangle
alert(rectangle.new(10, 10, 30, 30).surface())
</script>
```

### Exceptions

En cas d'erreur dans un script Javascript appelé par un script Brython, une
exception de la classe `JavascriptError` est déclenchée et peut être
interceptée par le code Brython. La trace d'erreur Javascript est affichée
sur `sys.stderr`.

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
jq('#sel').append('<' + 'option>three')

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

<body>

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

Vous trouverez dans la [galerie](/gallery/gallery_fr.html) d'autres
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
<body>
<script type="text/python">
import jquery

jquery("#test").text("I can use jQuery here !")
</script>

<div id="test"></div>
</body>
</html>
```

<a name="brython_from_js"></a>

## Utilisation de données Brython depuis des programmes Javascript

Brython n'expose par défaut que deux noms dans l'espace de noms global de
Javascript :

> `brython()` : fonction qui lance l'exécution des scripts Python de la page
> (voir [Options d'exécution](options.html))

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
document['echo'].bind('click', echo)
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

### Propriétés de l'objet `__BRYTHON__`

L'objet `__BRYTHON__` expose des attributs qui peuvent être utilisés pour
interagir avec des objets définis dans des scripts Python de la même page.

*`__BRYTHON__`.whenReady*

> Un objet Javascript `Promise` qui est résolu quand Brython a été chargé
> dans la page et peut être utilisé par des programmes Javascript

<blockquote>
```xml
function use_brython(){
    // code ici
}

__BRYTHON__.whenReady.then(use_brython)
```
</blockquote>

*`__BRYTHON__`.getPythonModule(module_name)*

> si le module Python de nom _module_name_ est importé dans la page, renvoie
> l'objet Javascript dont les propriétés sont les noms définis dans le module.
>
> Pour les scripts Python de la page, `module_name` est l'identifiant du
> script (attribut `id` de la balise `<script>`).

<blockquote>
```xml
<script type="text/python" id="s1">
from browser import alert

def show_square(x):
    alert(x ** 2)
</script>

Square of <input id="num" value="2"><button id="btn">show</show>

<script>
document.getElementById('btn').addEventListener('click',
    function(ev){
        var v = document.getElementById('num').value
        __BRYTHON__.getPythonModule('s1').show_square(parseInt(v))
    }
)
</script>
```
</blockquote>

Avant d'utiliser un module Python il faut s'assurer qu'il est bien chargé dans
la page. Pour cela on peut utiliser l'événement "load" sur l'élément HTML
`<script type="text/python">`, qui est déclenché quand le script a été
exécuté:

<blockquote>
```xml
<script type="text/python" debug=1 id="s1">
x = 0
</script>


<script>
var s1 = document.getElementById('s1')
s1.addEventListener('load', function(script){
  var module = __BRYTHON__.getPythonModule('s1')
  console.log(module.x)
})
</script>
```
</blockquote>

*`__BRYTHON__`.pythonToJS(_src_[, _script_id_])*

> convertit le code source Python `src` en une chaine de caractères qui
> contient la traduction de ce code source en Javascript. Le résultat
> peut être exécuté par `eval()` pour déclencher l'exécution du script.

*`__BRYTHON__`.pythonToAST(_src_[, _filename_, _mode_])*

> génère l'AST (Abstract Syntax Tree) à partir du code Python _src_ sous la
> forme d'un objet Javascript de même structure que celui décrit dans la
> [documentation Python](https://docs.python.org/3/library/ast.html)

*`__BRYTHON__`.runPythonSource(_src_[, _attributs_])*

> exécute le code source Python `src` comme s'il s'agissait d'un script avec
> les _attributs_ spécifiés. Si _attributs_ est une chaine de caractères, elle
> correspond à l'attribut _id_. Sinon il doit s'agir d'un objet Javascript.

> Les [options d'exécution](options.html) telles que niveau de débogage,
> chemin pour les imports, etc. peuvent être passées comme attributs, par
> exemple

<blockquote>
```xml
var src = "import un_module"
__BRYTHON__.runPythonSource(src, {pythonpath: 'mes_modules', debug: 2})
```
</blockquote>


> Retourne l'objet Javascript qui représente le module (également accessible
> par `__BRYTHON__.getPythonModule(script_id)`)

<blockquote>
```xml
<script type="text/py-disabled" id="s1">
from browser import alert

string = "script s2"
integer = 8
real = 3.14

dictionary = {'a': string, 'b': integer, 'c': real}

alert('run py-disabled')
</script>

<button id="btn">Run disabled</show>

<script>
document.getElementById('btn').addEventListener('click',
    function(ev){
        var script = document.getElementById('s1'),
            modobj = __BRYTHON__.runPythonSource(script.innerText, 's1')
        console.log(modobj)
    }
)
</script>
```
</blockquote>

*`__BRYTHON__`.pyobj2jsobj(pyobj)*

> convertit un objet Python en l'objet Javascript correspondant, selon la
> table de correspondance définie ci-dessus

