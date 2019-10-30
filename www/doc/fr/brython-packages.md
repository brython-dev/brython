Packages Brython
================
_Nouveau en version 3.7.5_

Un "package Brython" peut être inséré dans la page HTML pour donner accès à
des modules importables. Il s'agit d'un fichier avec l'extension
__`.brython.js`__ qui contient les modules et packages à distribuer; on
l'insère par la syntaxe habituelle

```xml
<script src="http://anyhost/path/nom_package.brython.js"></script>
```

Les packages Brython peuvent être situés sur n'importe quel serveur, ce qui
rend leur déploiement et leur utilisation très simples.

Pour générer un "package Brython", il faut utiliser le package CPython
`brython` et, dans le répertoire où se situent les fichiers à inclure dans
le package, exécuter:

```console
python -m brython --make_package <nom_package>
```

Si le répertoire contient un fichier __`__init.py__`__, les modules seront
relatifs à ce package. Par exemple si la structure du répertoire est

    __init__.py
    dialog.py
    menu.py

et qu'on veut générer le package __`widgets`__ à partir de ce répertoire,
alors les modules seront importés par

```python
import widgets.dialog
from widgets import menu
```

Si le répertoire ne contient pas __`__init__.py`__, les modules seront
importés par leur nom seul. Donc si le répertoire contient seulement

    dialog.py
    menu.py

les modules seront importés par
```python
import dialog
import menu
```