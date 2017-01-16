Options de la fonction `brython()`
----------------------------------

Pour que les scripts Python présents sur la page soient exécutés, il faut lancer la fonction `brython()` au chargement de la page

`<body onload="brython(`*[options]*`)">`

*options* peut être un entier, dans ce cas il s'agit du niveau de débogage :

- 0 (valeur par défaut) : aucun débogage. A utiliser quand l'application est au point, cela accélère légèrement l'exécution
- 1 : les messages d'erreur sont imprimés dans la console du navigateur (ou vers la sortie spécifiée par `sys.stderr`)
- 2 : la traduction du code Python en code Javascript est affichée dans la console
- 10 : la traduction du code Python et des modules importés est affichée dans la console

*options* peut être un objet Javascript, dont les clés possibles sont

- *debug* : le mode de débogage, comme indiqué ci-dessus
- *static\_stdlib\_import* : booléen qui indique si, pour importer des modules ou des paquetages de la bibliothèque standard, on se sert du tableau de correspondance statique du script __stdlib\_paths.js__. Vaut `true` par défault
- *pythonpath* : une liste de chemins dans lesquels chercher les modules importés
- *ipy_id* : par défaut, la fonction `brython()` exécute tous les scripts de la page. Cette option spécifie la liste des identifiants des balises dont le contenu texte doit être exécuté (attribut `id` de la balise). Voir [brythonmagic](https://github.com/kikocorreoso/brythonmagic) pour plus d'informations
- *profile* : quand l'option `profile` est > 0 le compilateur ajoute du code additionel qui récupère des informations de profilage. Le module `profile` donne accès à ces informations. Il fournit une interface très proche de celle du module `profile` de la distribution standard Python. Voir la section (Test, débogage et profilage)[http://brython.info/static_doc/fr/test.html] pour plus d'informations

Exemple
-------

>    brython({debug:1, ipy_id:['hello']})

exécutera le contenu de l'élement dont l'identifiant est "hello" avec le niveau de débogage 1

