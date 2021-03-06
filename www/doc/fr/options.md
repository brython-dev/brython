Options de la fonction `brython()`
----------------------------------

Pour que les scripts Python présents sur la page soient exécutés, il faut
lancer la fonction `brython()` au chargement de la page.

`<body onload="brython(`*[options]*`)">`

*options* peut être un entier, dans ce cas il s'agit du niveau de débogage :

- 0 (valeur par défaut) : aucun débogage. A utiliser quand l'application est
  au point, cela accélère légèrement l'exécution
- 1 : les messages d'erreur sont imprimés dans la console du navigateur (ou
  vers la sortie spécifiée par `sys.stderr`)
- 2 : la traduction du code Python en code Javascript est affichée dans la
  console
- 10 : la traduction du code Python et des modules importés est affichée dans
  la console

*options* peut être un objet Javascript, dont les clés possibles sont

- *debug* : le mode de débogage, comme indiqué ci-dessus
- *cache* : si la valeur est `true`, les appels Ajax pour importer des
  modules, charger des scripts externes par `<script src="foo.py">` ou lire
  des fichiers avec `open()` utilisent le cache du navigateur. Vaut `false`
  par défaut
- *static\_stdlib\_import* : booléen qui indique si, pour importer des modules
  ou des paquetages de la bibliothèque standard, on se sert du tableau de
  correspondance statique du script __stdlib\_paths.js__. Vaut `true` par
  défaut
- *pythonpath* : une liste de chemins dans lesquels chercher les modules
  importés
- *ids* : par défaut, la fonction `brython()` exécute tous les scripts de
  la page. Cette option spécifie la liste des identifiants des balises dont le
  contenu texte doit être exécuté (attribut `id` de la balise)
- *ipy_id* : identique à *ids*. Voir
  [brythonmagic](https://github.com/kikocorreoso/brythonmagic) pour plus
  d'informations
- *indexedDB* : indique si le programme peut utiliser la base indexedDB pour
  stocker une version précompilée des modules situés dans __brython_stdlib.js__
  ou __brython_modules.js__. Vaut `true` par défaut.

Exemple
-------

>    brython({debug:1, ids:['hello']})

exécutera le contenu de l'élement dont l'identifiant est "hello" avec le niveau de débogage 1

