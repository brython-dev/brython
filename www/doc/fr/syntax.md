Brython implémente la version 3 de Python en se basant sur la
[Référence du Langage Python](https://docs.python.org/3/reference/index.html)

L'implémentation tient compte des limites des navigateurs, notamment
l'impossibilité d'accéder au système de fichier. L'écriture est impossible, et
la lecture est limitée aux répertoires accessibles depuis le serveur par une
requête Ajax.

Mots clés et fonctions intégrées
--------------------------------

Brython supporte tous les mots-clés et les fonctions intégrées de la version 
Python de même numéro de version.

Quelques particularités liées au contexte d'exécution dans un navigateur :

- les fonctions Javascript ne peuvent pas bloquer l'exécution pendant une
  durée donnée, ou en attendant qu'un événement se produise, avant de passer à
  l'instruction suivante. Pour cette raison:

 - on ne peut pas utiliser `time.sleep()` (il faut utiliser à la place les
  fonctions du module **browser.timer** telles que `set_timeout()` ou
  `set_interval()`)
 - la fonction intégrée `input()` est simulée par la fonction Javascript
  `prompt()`. Un exemple dans la galerie montre comment simuler la fonction
  input dans une boite de dialogue personnalisée

- pour la même raison, et aussi parce que le navigateur possède une boucle
  d'événements implicite, le module `asyncio` de la distribution standard ne
  peut pas être utilisé. A la place, pour la programmation asynchrone, le
  module [**`browser.aio`**](aio.html) est fourni.

- la fonction `open()` prend comme argument l'url du fichier à ouvrir ; comme
  on utilise un appel Ajax, elle doit être dans le même domaine que le script.
  L'objet retourné par `open()` possède les méthodes de lecture et d'accès
  habituelles : `read, readlines, seek, tell, close`.

- par défaut, `print()` affiche sur la console du navigateur, et les messages
  d'erreur sont également affichés sur cette console. `sys.stderr` et
  `sys.stdout` peuvent être affectés à un objet qui implémente une méthode
  `write()`, ce qui permet par exemple d'afficher les messages d'erreurs dans
  une fenêtre

- pour lancer une impression sur imprimante, utiliser la méthode `print()` de
  l'objet `window` défini dans le module **browser** :

<blockquote>
```python
from browser import window
window.print(text)
```
</blockquote>

- le cycle de vie des objets est géré par le ramasse-miettes de Javascript,
  Brython ne gère pas le comptage de référence comme CPython, donc la
  méthode `__del__()` n'est pas appelée quand une instance de classe n'est
  plus référencée.

Bibliothèque standard
---------------------
Brython est fourni avec une partie de la bibliothèque standard de Python.

Certains des modules qui sont écrits en C dans la distribution CPython ont été
écrits en Javascript dans la distribution Brython (`math`, `random`, `re`,
`unicodedata`...).

Le module `json` est également écrit en Javascript. Il s'appuie sur l'objet
`JSON` de Javascript, ce qui implique quelques différences mineures avec le
package CPython; les valeurs `NaN, Infinity, -Infinity` qui sont reconnues par
CPython n'étant pas dans la spécification JSON produisent une `SyntaxError`
avec le module Brython.

Le package `xml` n'est pas fourni, parce que celui de la distribution
CPython utilise un module en C (`pyexpat`) qui n'est disponible ni en
Javascript ni en pur Python.

Valeur intégrée `__name__`
--------------------------

La valeur intégrée `__name__` est celle de l'attribut `id` du script. Par
exemple:

```xml
<script type="text/python" id="monscript">
assert __name__ == 'monscript'
</script>
```

Si 2 scripts ont le même `id`, une exception est déclenchée.

Pour les scripts dont l'attribut `id` n'est pas défini :

- si aucun autre script n'a un `id` qui vaut `__main__`, pour le premier
  script sans `id`, `__name__` prend la valeur `"__main__"`. Ainsi, s'il n'y a
  qu'un script dans la page, il pourra exécuter le test habituel :

<blockquote>
```xml
<script type="text/python">
if __name__=='__main__':
    print('hello !')
</script>
```
</blockquote>

- pour les autres scripts sans `id`, `__name__` prend une valeur aléatoire qui
  commence par `__main__`
