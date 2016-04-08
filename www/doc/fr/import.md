Implémentation de `import`
--------------------------

Pour importer des modules ou des paquetages, Brython utilise le même mécanisme 
que CPython : pour résoudre "import X", le programme recherche un fichier dans 
plusieurs emplacements, d'abord dans la bibliothèque standard (urls relatives 
à celle du script __brython.js__) :

- __libs/X.js__ (des modules Javascript, pour les modules de la bibliothèque 
 standard qui ne peuvent pas être codés en Python)
- __Lib/X.py__
- __Lib/X/\_\_init\_\_.py__
- __&lt;rep\_courant&gt;/X.py__ (rep\_courant est le répertoire du script qui 
  effectue l'import)
- __&lt;rep\_courant&gt;/X/\_\_init\_\_.py__
- __Lib/site-packages/X.py__
- __Lib/site-packages/X/\_\_init\_\_.py__


Comme le navigateur n'a pas accès directement au système de fichiers, la
recherche de l'existence d'un fichier doit être effectuée par un appel Ajax,
qui renvoie une erreur s'il n'y a pas de fichier à l'url indiquée

Cette méthode est couteuse en temps pour les scripts qui doivent importer 
plusieurs modules (par exemple, pour "import random", il faut importer pas 
moins de 44 modules !). Pour gagner en performance, Brython propose plusieurs 
options :

1. la bibliothèque standard peut être chargée dans la page HTML en utilisant 
le fichier __py\_VFS.js__ :

   `<script src="/src/py_VFS.js"></script>`

   Dans ce cas, la recherche dans la bibliothèque standard consistera à voir 
   si le module est référencé dans ce script ; si oui, le code source est 
   récupéré et exécuté, sans avoir à effectuer d'appel Ajax

   Cette méthode accélère l'import des modules de la bibliothèque standard ; 
   son inconvénient est que le fichier __py\_VFS.js__ est assez volumineux (de 
   l'ordre de 2 MO), et que si l'utilisateur modifie lui-même le contenu de la 
   bibliothèque standard, il doit regénérer une version de __py\_VFS.js__ en 
   utilisant le script Python __scripts/make\_VFS.py__

2. si on n'utilise pas __py\_VFS.js__, la recherche dans la bibliothèque 
standard utilise une table de correspondance entre le nom des modules et une 
url relative au chemin vers le script __brython.js__ : de cette façon, on n'a 
à essayer qu'une seule url (donc un seul appel Ajax) pour voir si le module 
existe dans la bibliothèque standard.

   Le seul inconvénient de cette méthode est que si l'utilisateur modifie la 
   bibliothèque standard, il doit regénérer la table de correspondance en 
   utilisant le script __scripts/make\_dist.py__.

   Pour désactiver cette option, il faut invoquer la fonction __brython()__ 
   avec l'option `static_stdlib_import` égale à `false`.

Noter que les modules doivent être encodés en utf-8 ; la déclaration 
d'encodage en début de module n'est pas prise en compte.

### Configurer le mécanisme d'import

Depuis la version 3.2.1 le mécanisme d'import de Brython est cohérent avec
une partie significative de la 
[spécification du système d'import de Python 3.5](http://docs.python.org/3/reference/import), incluant les PEP 302, 
PEP 328, PEP 366, PEP 451. Actuellement le support d'autres spécifications
est partiel ou nul, c'est le cas pour PEP 402 et PEP 338. L'accès aux
_finders_ et _loaders_ intégrés de Brython est possible en important le
module `_importlib`.

La façon la plus simple d'importer des modules utilisateur sous une URL
spécifique est d'ajouter l'URL à `sys.path` de la façon suivante :

```python
import sys
sys.path.append('http://memedomaine.tld/nouveau/chemin')
```

L'URL doit pointer vers un répertoire déployé sur le serveur, ou vers un 
fichier VFS (Virtual File System) fourni par l'utilisateur. Dans le deuxième
cas le nom du fichier doit se terminer par l'extension `.vfs.js`. Le code des
modules peut être écrit en Python (type de fichier `.py`), ou il peut d'agir 
de modules Javascript compilés (type `pyc.js`) ou de modules en pur Javascript 
(type `.js`). Au départ le mécanisme d'import cherche une correspondance pour 
chaque type de fichier dans un chemin donné. Quand on en a trouvé un, pour des
raisons de performance, seul le type de fichier correspondant sera utilisé 
pour ce chemin quand les instructions d'import suivantes seront exécutées.
Autrement dit, tous les modules déployés dans un répertoire donné et ses
sous-répertoires doivent être du même type.

Il est possible d'optimiser le processus de découverte du type de fichier
initial en contournant le mécanisme d'import comme suit:

```python
import _importlib
# type_fichier doit être parmi of 'py', 'pyc.js', 'js', 'none'
_importlib.optimize_import_for_path('http://memedomain.tld/nouveau/chemin', type_fichier)
```

Une approche beaucoup plus déclarative pour ajouter un élément dans `sys.path` 
consiste à inclure, dans la partie `<head />` de la page, des balises `<link />` 
avec l'attribut `rel="pythonpath"` fourni, p.ex.

   `<link rel="pythonpath" href="http://memedomain.tld/nouveau/chemin" />`

L'optimisation du type de fichier est possible en ajoutant l'attribut standard
`hreflang`, p.ex.

   `<link rel="pythonpath" href="http://memedomain.tld/nouveau/chemin" hreflang="py" />`

Les fichiers VFS peuvent être pré-chargées à l'initialisation de Brython en 
ajoutant `prefetch` dans l'attribut `rel` de l'élément, comme ci-dessous:

   `<link rel="pythonpath prefetch" href="http://memedomain.tld/chemin/vers/fichier.vfs.js" />`

Les valeurs fournies dans l'attribut `href` peuvent être relatives et seront 
résolues par le navigateur en fonction de ses propres règles.

 