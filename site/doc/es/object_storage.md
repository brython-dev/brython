Módulo **browser.object_storage**
--------------------------------

Éste módulo extiende a **local\_storage** y **session\_storage** permitiendo 
que las claves y valores sean objetos Python, no únicamente cadenas. Para conseguir esto
el objeto se serializa; actualmente solo se  pueden usar objetos que pueden ser Json 
serializables, como por ejemplo `list` o `dict`. También hay que resaltar que los objetos 
se convierten en inmutable una vez que han sido almacenados, de esta forma 
`ObjecStorage()['foo'].update({"bar": "zoo"})`  no haría nada.

El módulo expone una clase:

`ObjectStorage(`_storage_`)`

> devuelve un objeto store. _storage_ es el objeto `storage` accesible también desde 
> *session\_storage*  *local\_storage*

Ejemplo:

```python
from browser.session_storage import storage
from browser.object_storage import ObjectStorage

object_storage = ObjectStorage(storage)
object_storage[['do', 're', 'me']] = {"tune": "in tune"}

# to update the value, need to copy out first
tmp = object_storage[['do', 're', 'me']]
tmp.update({"duration": "one hour"})
object_storage[['do', 're', 'me']] = tmp
```
