Problema
--------

Almacenar objetos localmente usando 'local storage' disponible en HTML5


Solución
--------

Brython proporciona un módulo llamado `browser.local_storage` que permite 
almacenar cadenas de valores asociados a cadenas de claves

### Almacenar valor

<input id="zone" value="Local Storage">

```exec
from browser import document
from browser.local_storage import storage

storage['brython_test'] = document['zone'].value
```

### Mostrar valor almacenado

```exec
from browser import alert
from browser.local_storage import storage

alert(storage['brython_test'])
```

Si un objeto Python puede ser serializado mediante el módulo `json`, podríamos 
almacenar la versión serializada para, más tarde, volver a obtener el objeto 
original :

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

Ten cuidado ya que `json` convierte las claves del diccionario a una cadena. 
Debido a ello es por lo que hemos usado `b['1515']` en lugar de `b[1515]` en 
el ejemplo anterior
