module **javascript**
---------------------

Le module **javascript** permet d'interagir avec les objets définis dans les
bibliothèques et programmes Javascript présents dans la même page que le
programme Brython.

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
> Objet pour les fonctions et constantes mathématiques.

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

