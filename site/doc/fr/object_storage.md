module **browser.object_storage**
--------------------------------

Ce module étend **local\_storage** et **session\_storage** en permettant 
d'avoir comme clés et comme valeurs des objets Python, et pas seulement des 
chaines de caractères. Pour y parvenir, l'objet est sérialisé ; actuellement 
seuls les objets sérialisables en JSON sont pris en charge, tels que `list` ou
`dict`. Noter également que les objets deviennent immuables une fois qu'ils 
sont stockés, ainsi  `ObjecStorage()['foo'].update({"bar": "zoo"})` ne 
produira aucun effet.

Ce module expose une classe:

`ObjectStorage(`_storage_`)`

> renvoie un magasin d'objets. _storage_ est l'objet `storage` exposé soit par
> *session\_storage* ou par *local\_storage*

Exemple:

```python
from browser.session_storage import storage
from browser.object_storage import ObjectStorage

object_storage = ObjectStorage(storage)
object_storage[['do', 're', 'me']] = {"tune": "in tune"}

# pour mettre à jour la valeur il faut d'abord la copier
tmp = object_storage[['do', 're', 'me']]
tmp.update({"duration": "one hour"})
object_storage[['do', 're', 'me']] = tmp
```
