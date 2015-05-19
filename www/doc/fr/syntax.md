Brython implémente la version 3 de Python en se basant sur la 
[Référence du Langage Python](https://docs.python.org/3/reference/index.html)

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

Ne sont pas pris en charge dans la version actuelle les fonctions intégrées `memoryview(),  vars()`

