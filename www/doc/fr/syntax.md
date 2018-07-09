Brython implémente la version 3 de Python en se basant sur la
[Référence du Langage Python](https://docs.python.org/3/reference/index.html)

L'implémentation tient compte des limites des navigateurs, notamment
l'impossibilité d'accéder au système de fichier. L'écriture est impossible, et
la lecture est limitée aux répertoires accessibles depuis le serveur par une
requête Ajax.

Mots clés et fonctions intégrées
--------------------------------

Brython supporte la plupart des mots-clés et des fonctions de Python 3 :

- mots clés : `and, as, assert, async, await, break, class, continue, def, del, elif, else, `
  `except, False, finally, for, from, global, if, import, in, is, lambda, None, `
  `nonlocal, not, or, pass, raise, return, True, try, while, with, yield`
- fonctions et classes intégrées : `abs, all, any, ascii, bin, bool, bytes,`
  `callable, chr, classmethod, delattr, dict, dir, divmod, `
  `enumerate, eval, exec, filter, float, frozenset, getattr, `
  `globals, hasattr, hash, hex, id, input, int, isinstance, `
  `iter, len, list, locals, map, max, memoryview, min, `
  `next, object, open, ord, pow, print, property, range, `
  `repr, reversed, round, set, setattr, slice, sorted, str, `
  `sum, super, tuple, type, vars, zip, __import__`


Quelques particularités liées au contexte d'exécution dans un navigateur :

- les fonctions Javascript ne peuvent pas bloquer l'exécution pendant une 
  durée donnée, ou en attendant qu'un événement se produise, avant de passer à
  l'instruction suivante. Pour cette raison, on ne peut pas utiliser
  `time.sleep()` (il faut utiliser à la place les fonctions du module
  **browser.timer** telles que `set_timeout()` ou `set_interval()`) ; la
  fonction intégrée `input()` est simulée par la fonction Javascript
  `prompt()` ; les méthodes bloquantes du module `asyncio` ne sont en fait
  pas bloquantes, c'est-à-dire que les instructions qui suivent sont
  exécutées immédiatement.

- la fonction `open()` prend comme argument l'url du fichier à ouvrir ; comme
  on utilise un appel Ajax, elle doit être dans le même domaine que le script.
  L'objet retourné par `open()` possède les méthodes de lecture et d'accès
  habituelles : `read, readlines, seek, tell, close`. Seul le mode texte est
  pris en compte: l'appel Ajax est bloquant et dans ce mode, on ne peut pas
  donner de valeur à l'attribut `responseType`

- par défaut, `print()` affiche sur la console du navigateur, et les messages
  d'erreur sont également affichés sur cette console. `sys.stderr` et
  `sys.stdout` peuvent être affectés à un objet qui implémente une méthode
  `write()`, ce qui permet par exemple d'afficher les messages d'erreurs dans
  une fenêtre

- `sys.stdin` n'est pas implémenté, mais on peut utiliser la fonction intégrée
  `input()` qui ouvre une fenêtre d'invite

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

- le parseur JSON réutilise celui de Javascript ; à cause de cela, les
  nombres réels égaux à des entiers (par exemple 1.0) sont convertis en
  entiers dans la sérialisation par `json.dumps()`.

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
