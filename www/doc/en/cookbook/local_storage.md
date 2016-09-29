Problem
-------

Store objects locally, using HTML5 Local Storage


Solution
--------

Brython provides a built-in module `browser.local_storage` that stores string 
values associated to string keys

### Store value in input field

<input id="zone" value="Local Storage">

```exec
from browser import document as doc
from browser.local_storage import storage
storage['brython_test'] = doc['zone'].value
```

### Show stored value

```exec
from browser import alert
from browser.local_storage import storage
alert(storage['brython_test'])
```

If a Python object can be serialized by the `json` module, you can store the 
serialized version, then retrieve the original object :

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

Beware that `json` converts dictionary keys to their string value, this is why 
we use `b['1515']` instead of `b[1515]`
