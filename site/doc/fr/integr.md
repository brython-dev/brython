Mots clés et fonction intégrées
-------------------------------

Brython supporte l'essentiel des mots-clés et des fonctions de Python 3 :
- mots clés : `as, assert, break, class, continue, def, del, elif, else, except, False, finally, for, from, global, if, import, is, lambda, None, pass, return, True, try, while, with, yield`
- fonctions intégrées : `abs(), all(), any(), ascii(), bin(), bool(), callable(), chr(), classmethod(), delattr(), dict(), dir(), divmod(), enumerate(), eval(), exec(), filter(), float(), frozenset(), getattr(), globals(), hasattr(), hash(), hex(), id(), input(), int(), isinstance(), iter(), len(), list(), locals(), map(), max(), min(), next(), object(), open(), ord(), pow(), print(), property(), range(), repr(), reversed(), round(), set(), setattr(), slice(), sorted(), str(), sum(), tuple(), type(), zip()`

Par défaut, `print()` affiche sur la console du navigateur, et les messages d'erreur sont également affichés sur cette console. `sys.stderr` et `sys.stdout` peuvent être affectés à un objet qui implémente une méthode `write()`, ce qui permet par exemple d'afficher les messages d'erreurs dans une fenêtre ou un textarea par exemple

`sys.stdin` n'est pas implémenté, mais on peut utiliser la fonction intégrée `input()` qui ouvre une fenêtre d'invite

Pour lancer une impression sur imprimante, utiliser `win.print`

Ne sont pas pris en charge dans la version actuelle : 

- le mot-clé `nonlocal`
- les fonctions intégrées `bytearray(), bytes(), compile(), complex(), format(), help(),  memoryview(), super(), vars(), __import__`
- les nombres complexes

Contrairement à Python, on peut ajouter des attributs aux objets créés par la fonction intégrée `object()` :

>    x = object()
>    x.foo = 44
>    del x.foo

Enfin, certains mots clés et fonctions intégrées adaptés au fonctionnement dans un navigateur sont ajoutés :

- les fonctions intégrées `alert(), confirm(), prompt()` correspondent à leur équivalent Javascript
- la fonction intégrée `ajax()` permet l'exécution de requêtes HTTP en mode Ajax
- la fonction intégrée `websocket()` permet la communication client-serveur via le protocole WebSocket
- le mot clé `win` représente la fenêtre (objet _window_ en JS) et `doc` représente le document HTML (_document_ en JS)
