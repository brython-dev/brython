Implémentation de `import`
--------------------------

Pour importer des modules ou des paquetages, Brython utilise le même mécanisme que CPython : pour résoudre "import X", le programme recherche un fichier dans plusieurs emplacements, d'abord dans la bibliothèque standard (urls relatives à celle du script __brython.js__) :

- __libs/X.js__ (des modules Javascript, pour les modules de la bibliothèque standard qui ne peuvent pas être codés en Python)
- __Lib/X.py__
- __Lib/X/\_\_init\_\_.py__
- __Lib/site-packages/X.py__
- __Lib/site-packages/X/\_\_init\_\_.py__

puis, si aucun de ces fichiers n'existe, les urls __X.py__ et __X/\_\_init\_\_.py__ dans le répertoire du script qui effectue l'import

Comme le navigateur n'a pas accès directement au système de fichiers, la recherche de l'existence d'un fichier doit être effectuée par un appel Ajax, qui renvoie une erreur s'il n'y a pas de fichier à l'url indiquée

Cette méthode est couteuse en temps pour les scripts qui doivent importer plusieurs modules (par exemple, pour "import random", il faut importer pas moins de 44 modules !). Pour gagner en performance, Brython propose plusieurs options :

1. la bibliothèque standard peut être chargée dans la page HTML en utilisant le fichier __py\_VFS.js__ :

   `<script src="/src/py_VFS.js"></script>`

   Dans ce cas, la recherche dans la bibliothèque standard consistera à voir si le module est référencé dans ce script ; si oui, le code source est récupéré et exécuté, sans avoir à effectuer d'appel Ajax

   Cette méthode accélère l'import des modules de la bibliothèque standard ; son inconvénient est que le fichier __py\_VFS.js__ est assez volumineux (de l'ordre de 2 MO), et que si l'utilisateur modifie lui-même le contenu de la bibliothèque standard, il doit regénérer une version de __py\_VFS.js__ en utilisant le script Python __scripts/make\_VFS.py__

2. si on n'utilise pas __py\_VFS.js__, la recherche dans la bibliothèque standard utilise une table de correspondance entre le nom des modules et une url relative au chemin vers le script __brython.js__ : de cette façon, on n'a à essayer qu'une seule url (donc un seul appel Ajax) pour voir si le module existe dans la bibliothèque standard

   Le seul inconvénient de cette méthode est que si l'utilisateur modifie la bibliothèque standard, il doit regénérer la table de correspondance en utilisant le script __scripts/make\_dist.py__

   Pour désactiver cette option, il faut invoquer la fonction __brython()__ avec l'option `static_stdlib_import` égale à `false`

Noter que les modules doivent être encodés en utf-8 ; la déclaration d'encodage en début de module n'est pas prise en compte
 