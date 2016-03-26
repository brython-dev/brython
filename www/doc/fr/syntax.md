Brython implémente la version 3 de Python en se basant sur la 
[Référence du Langage Python](https://docs.python.org/3/reference/index.html)

L'implémentation tient compte des limites des navigateurs, notamment 
l'impossibilité d'accéder au système de fichier. L'écriture est impossible, et
la lecture est limitée aux répertoires accessibles depuis le serveur par une
requête Ajax.

Mots clés et fonctions intégrées
--------------------------------

Brython supporte tous les mots-clés et la plupart des fonctions de Python 3 :

- mots clés : `as, assert, break, class, continue, def, del, elif, else, `
  `except, False, finally, for, from, global, if, import, is, lambda, None, `
  `nonlocal, pass, return, True, try, while, with, yield`
- fonctions intégrées : `abs(), all(), any(), ascii(), bin(), bool(), bytes(),`
  `callable(), chr(), classmethod(), delattr(), dict(), dir(), divmod(), `
  `enumerate(), eval(), exec(), filter(), float(), frozenset(), getattr(), `
  `globals(), hasattr(), hash(), hex(), id(), input(), int(), isinstance(), `
  `iter(), len(), list(), locals(), map(), max(), min(), next(), object(), `
  `open(), ord(), pow(), print(), property(), range(), repr(), reversed(), `
  `round(), set(), setattr(), slice(), sorted(), str(), sum(), super(), `
  `tuple(), type(), zip(), __import__`

Ne sont pas pris en charge dans la version actuelle les fonctions intégrées 
`memoryview(),  vars()`

Quelques particularités liées au contexte d'exécution dans un navigateur :

- la fonction `open()` prend comme argument l'url du fichier à ouvrir ; comme 
  on utilise un appel Ajax, elle doit être dans le même domaine que le script. 
  L'objet retourné par `open()` possède les méthodes de lecture et d'accès 
  habituelles : `read, readlines, seek, tell, close`

- par défaut, `print()` affiche sur la console du navigateur, et les messages 
  d'erreur sont également affichés sur cette console. `sys.stderr` et 
  `sys.stdout` peuvent être affectés à un objet qui implémente une méthode 
  `write()`, ce qui permet par exemple d'afficher les messages d'erreurs dans 
  une fenêtre

- `sys.stdin` n'est pas implémenté, mais on peut utiliser la fonction intégrée 
  `input()` qui ouvre une fenêtre d'invite

- pour lancer une impression sur imprimante, utiliser la méthode `print()` de 
  l'objet `window` défini dans le module **browser** :

>>    from browser import window
>>    window.print(text)

- le cycle de vie des objets est géré par le ramasse-miettes de Javascript,
  Brython ne gère pas le comptage de référence comme CPython, donc la
  méthode `__del__()` n'est pas appelée quand une instance de classe n'est 
  plus référencée.

- les fonctions comme `time.sleep()` qui bloquent l'exécution pendant une
  durée donnée, ou en attendant qu'un événement se produise, ne sont pas
  gérées parce qu'il n'y a pas d'équivalent en Javascript : il faut utiliser
  dans ce cas les fonctions du module **browser.timer** telles que 
  `set_timeout()` ou `set_interval()`, ou des gestionnaires d'événements
  (méthode `bind()` des éléments DOM).


Valeur intégrée `__name__`
--------------------------

La valeur intégrée `__name__` est celle de l'attribut `id` du script. Par
exemple:

```python
<script type="text/python" id="monscript">
assert __name__ == 'monscript'
</script>
```

Si 2 scripts ont le même `id`, une exception est déclenchée.

Pour les scripts dont l'attribut `id` n'est pas défini :

- si aucun autre script n'a un `id` qui vaut `__main__`, pour le premier 
  script sans `id`, '__name__' prend la valeur `__main__`. Ainsi, s'il n'y a
  qu'un script dans la page, il pourra exécuter le test habituel :

<blockquote>
```python
<script type="text/python">
if __name__=='__main__':
    print('hello !')
</script>
```
</blockquote>

- pour les autres scripts sans `id`, `__name__` prend une valeur aléatoire qui
  commence par `__main__`
