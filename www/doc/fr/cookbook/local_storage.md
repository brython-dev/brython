Problème
--------

Stocker des objets localement, en utilisant le Local Storage de HTML5


Solution
--------

Brython fournit un module intégré `local_storage` qui stocke des valeurs 
associées à des clés (clés et valeurs sont des chaines de caractères)

### Stocker la valeur contenue dans le champ de saisie

<input id="zone" value="Local Storage">

```exec
from browser import document, alert
from browser.local_storage import storage

storage['brython_test'] = document['zone'].value
``` 

### Montrer la valeur stockée

```exec
from browser import alert
from browser.local_storage import storage
alert(storage['brython_test'])
```

Si un objet Python peut être sérialisé par le module `json`, on peut stocker 
la version sérialisée, puis récupérer l'objet original :

```exec
from browser import alert
from browser.local_storage import storage
import json

a = {'foo':1,1515:'Marignan'}

storage["brython_test"] = json.dumps(a)

b = json.loads(storage['brython_test'])
alert(b['foo'])
alert(b['1515'])
```

Bien faire attention que `json` convertit les clés de dictionnaires en chaine 
de caractères, c'est pour cela qu'on utilise `b['1515']` au lieu de `b[1515]`
