module **javascript**
---------------------

Le module **javascript** permet d'interagir avec les objets définis dans les
bibliothèques et programmes Javascript.

**javascript**.`import_js(`_url[, alias]_`)`
> Importe le module Javascript à l'_url_ spécifiée et ajoute _alias_ à
> l'espace de noms local.
>
> Si _alias_ n'est pas fourni, le nom du module est calculé à partir de l'url;
> par exemple pour `import_js('js_test.js')` l'alias est _js_test_.
>
> Le module doit exposer le nom `$module`, un objet dont les attributs
> constituent l'espace de noms du script importé.

> Exemple: si le script Javascript à l'adresse _js_test.js_ est

<blockquote>
```xml
var $module = {
    x: 1
}
```
</blockquote>

> un script Python peut l'utiliser de la façon suivante:

<blockquote>
```python
import javascript

javascript.import_js("js_test.js", alias="js_module")
assert js_module.x == 1
```
</blockquote>

**javascript**.`py2js(`_src_`)`
> Renvoie le code Javascript généré à partir du code source Python _src_.

**javascript**.`this()`
> Renvoie l'objet Brython correspondant au mot-cle Javascript `this`. Peut
> être nécessaire dans l'utilisation de certains frameworks Javascript, par
> exemple quand une fonction de retour utilise cet objet `this`.

Le module permet également de manipuler les objets définis par le langage
Javascript. Se référer à la documentation de ces différents objets.

**javascript**.`Date` [doc](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Date)
> Constructeur d'objets de type "Date".

<blockquote>
```python
from javascript import Date

date = Date.new(2012, 6, 10)
print(date.toDateString())
```
</blockquote>

**javascript**.`JSON` [doc](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/JSON)
> Objet pour la conversion de et vers des objets au format standardisé JSON.
> Il expose deux fonctions:

>> `stringify`: sérialisation d'objets simples (dictionnaires, listes, tuples,
>> entiers, réels, chaines de caractères)

>> `parse`: conversion d'une chaine de caractères en un objet simple

**javascript**.`Math` [doc](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Math)
> objet pour les fonctions et constantes mathématiques.

**javascript**.`NULL`
> l'objet Javascript `null`. Peut servir à tester si un objet Javascript est
> `null`.

**javascript**.`Number` [doc](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Number)
> Constructeur pour les objets de type "number".

**javascript**.`RegExp` [doc](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/RegExp)
> Constructeur d'objets "expression régulière", utilisant la syntaxe propre à
> Javascript, qui ne correspond pas complètement à celle de Python.
> La méthode `exec()` d'instances de cette classe peut être appliquée à des
> chaines de caractères Python:
<blockquote>
```python
from javascript import RegExp

re = RegExp.new(r"^test(\d+)$")
print(re.exec("test44"))
```
</blockquote>

**javascript**.`String` [doc](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/String)
> Constructeur d'objets Javascript de type "string". Ils doivent être utilisés
> si on veut exploiter les méthodes qui acceptent des expressions régulières
> Javascript comme paramètre:

<blockquote>
```python
from javascript import RegExp, String

re = RegExp.new(r"^test(\d+)$")
print(String.new("test33").search(re))
```
</blockquote>

**javascript**.`UNDEFINED`
> l'objet Javascript `undefined`. Peut servir à tester si un objet Javascript
> est `undefined`.

