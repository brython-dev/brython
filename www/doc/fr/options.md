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
- *open* : une implémentation spécifique de la fonction intégrée `open`, par exemple reposant sur le stockage local (_local storage_). Mais **pour rester compatible avec Python la bonne méthode est de redéfinir `__builtins__.open` - ce qui ne fonctionne pas dans la version actuelle. Dès que ce sera le cas cette option sera supprimée** 
- *re\_module* permet aux utilisateurs de spécifier le module `re` (expressions régulières) à utiliser par défaut. Les valeurs acceptées sont 'pyre' pour le module Python `re` et 'jsre' pour une version reposant sur l'objet `RegExp`  de Javascript. Par défaut Brython devine quel module utiliser selon la complexité du _pattern_. **Cette version sera supprimée dans les versions futures de Brython : le module Python `re` sera utilisé, le moteur Javascript pouvant être utilisé explicitement via le constructeur `RegExp`, comme dans le code suivant:**

```python
from browser import window
from javascript import JSConstructor

jsre = JSConstructor(window.RegExp)
mo = jsre(r'a(.*)e').exec('aBCDe')
print(mo)
```

Exemple
-------

>    brython({debug:1, ipy_id:['hello']})

exécutera le contenu de l'élement dont l'identifiant est "hello" avec le niveau de débogage 1

