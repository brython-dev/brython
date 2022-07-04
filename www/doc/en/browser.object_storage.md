module **browser.object_storage**
--------------------------------

This module extends **local\_storage** and **session\_storage** by allowing 
keys and values to be Python objects, not just strings. To achieve this, the 
object is serialised ; currently only JSON serializable objects are supported, 
such as as a `list` or `dict`. Also note that objects become immutable once 
they are stored, so  `ObjecStorage()['foo'].update({"bar": "zoo"})`  won't 
actually do anything.

The module exposes a class:

`ObjectStorage(`_storage_`)`

> returns an object store. _storage_ is the `storage` object exposed either by 
> *session\_storage* or *local\_storage*

Example:

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
