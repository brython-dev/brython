Syntaxe
-------

Brython est conforme à la syntaxe de Python 3

- blocs délimités par l'indentation
- définition de listes par `[]` ou `list()`, de tuples par `()` ou `tuple()`, de dictionnaires par `{}` ou `dict()`, d'ensembles par `{}` ou `set()` 
- listes, dictionnaires, ensembles en extansion : 

 - `[ expr for item in iterable if condition ]`
 - `dict((i,2*i) for i in range(5))`
 - `set(x for x in 'abcdcga')`

- générateurs (mot-clé `yield`), expressions de générateur : `foo(x for x in bar if x>5)`
- opérateur ternaire : `x = r1 if condition else r2`
- la définition des fonctions peut comporter des valeurs par défaut et des arguments et mot-clés optionnels : <br>`def foo(x,y=0,*args,**kw):`
- décompactage de listes ou de dictionnaires dans l'appel de fonctions : `x = foo(*args,**kw)`
- classes avec héritage multiple
- décorateurs
- importation : 
 - `import foo`
 - `from foo import X`
 - `import foo as bar`
 - `from foo import X as Y`
 - `from foo import *`

Contrairement à Python 2, `print` est une fonction et pas un mot-clé, les parenthèses sont donc obligatoires

Mots clés et fonctions intégrées
--------------------------------

Brython supporte tous les mots-clés et la plupart des fonctions de Python 3 :

- mots clés : `as, assert, break, class, continue, def, del, elif, else, except, False, finally, for, from, global, if, import, is, lambda, None, nonlocal, pass, return, True, try, while, with, yield`
- fonctions intégrées : `abs(), all(), any(), ascii(), bin(), bool(), bytes(), callable(), chr(), classmethod(), delattr(), dict(), dir(), divmod(), enumerate(), eval(), exec(), filter(), float(), frozenset(), getattr(), globals(), hasattr(), hash(), hex(), id(), input(), int(), isinstance(), iter(), len(), list(), locals(), map(), max(), min(), next(), object(), open(), ord(), pow(), print(), property(), range(), repr(), reversed(), round(), set(), setattr(), slice(), sorted(), str(), sum(), super(), tuple(), type(), zip(), __import__`

Quelques particularités liées au contexte d'exécution dans un navigateur :

- la fonction `open()` prend comme argument l'url du fichier à ouvrir ; comme on utilise un appel Ajax, elle doit être dans le même domaine que le script. L'objet retourné par `open()` possède les méthodes de lecture et d'accès habituelles : `read, readlines, seek, tell, close`

- par défaut, `print()` affiche sur la console du navigateur, et les messages d'erreur sont également affichés sur cette console. `sys.stderr` et `sys.stdout` peuvent être affectés à un objet qui implémente une méthode `write()`, ce qui permet par exemple d'afficher les messages d'erreurs dans une fenêtre

- `sys.stdin` n'est pas implémenté, mais on peut utiliser la fonction intégrée `input()` qui ouvre une fenêtre d'invite

- pour lancer une impression sur imprimante, utiliser la méthode `print()` de l'objet `window` défini dans le module **browser** :

>>    from browser import window
>>    window.print(text)

Ne sont pas pris en charge dans la version actuelle les fonctions intégrées `memoryview(),  vars()`

