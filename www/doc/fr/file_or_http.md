Limitations du protocole "file"
===============================
Les fichiers HTML présents sur un ordinateur peuvent être chargés dans le
navigateur de deux façons différentes:

- par le menu Fichier / Ouvrir du navigateur : dans ce cas le protocole
  utilisé est "file"
- en lançant un serveur web (par exemple celui de la distribution standard
  Python : `brython-cli server`) et en entrant l'adresse du fichier dans la
  barre d'adresse du navigateur (par exemple _localhost:8000//app.html_). Le
  protocole correspondant est "http" (ou "https")

Pour l'essentiel, ces deux solutions sont équivalentes. La première comporte
néanmoins une limitation sur plusieurs points:

- on ne peut pas charger des scripts externes par la syntaxe
  `<script type="text/python" src="test.py"></script>`
- il n'est pas possible d'importer des modules ou des packages situés dans le
  même dossier que l'application
- on ne peut pas ouvrir et lire des fichiers avec `open()`

La raison est que ces fonctionnalités reposent sur des appels Ajax pour
récupérer le code source des modules / packages, ou le contenu du fichier; or
les navigateurs ne permettent pas d'effectuer des appels Ajax quand le
protocole est "file".

Avec ce protocole, il est toujours possible d'importer les modules de la
bibliothèque standard si le fichier __`brython_stdlib.js`__ est chargé dans la
page, ainsi que les [packages Brython](brython-packages.html), ou les modules
qui ont été regroupés dans le fichier __`brython_modules.js`__ créé par la
commande `brython-cli`&nbsp;` modules` 
(voir la section [Implémentation de import](import.html)).
