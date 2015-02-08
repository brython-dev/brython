modules **browser.local\_storage** and **browser.session\_storage**
-------------------------------------------------------------------

This module uses the local storage defined in HTML5. The specification can be 
found following [this link](http://dev.w3.org/html5/webstorage/#the-localstorage-attribute)

What is **`HTML5 local storage`** ?: 

- local storage is a client-side key-value database, i.e. the data is stored in 
the users browser. This means the users data is saved on their machine inside 
their browser. This also means that the stored data is only available to them 
when the user is on that machine and in that browser. Remember that 
local storage is per browser not per computer.
- Keys and values are strings.
- Keys and values are stored persistently on a specific protocol, domain and 
port. Local storage databases are scoped to an HTML5 origin, basically the 
tuple (scheme, host, port, i.e. `scheme://host:port`). This means that the 
database is shared across all pages on the same domain, even concurrently by 
multiple browser tabs. However, a page connecting over `http://` cannot see a 
database that was created during an `https://` session.

HTML5 defines two kinds of storage, _local storage_ and _session storage_ ; 
the first one is _persistent_, i.e. keeps the data in the store when the user 
closes the browser window ; the second loses the data when the browser window
is closed.

**HTML5 local storage** is implemented in Brython under the browser package as 
the following modules:

- **local_storage**
> This module exposes a single object, `storage`, which gives acces to the 
>  _local storage_. You can interact with it like a dictionary, however, 
>  keep in mind that keys and values are restricted to strings.
- **session_storage**
> This module also exposes the object `storage`, which provides access to 
>  the _session storage_. It is otherwise the same as above. Use 
>  **session_storage** when you do not wish data to be shared across browser 
>  sessions or tabs. A typical use case is a log-in token.

A simple example of `local_storage` is as follows:

```python
from browser.local_storage import storage
storage['foo']='bar'
print(storage['foo'])
```

Now, if you close your tab, your browser or even your computer when you open 
again the same browser you will have access to the values stored by the 
`'foo'` key in the same `scheme://host:port` where the key-value pair was 
stored.

If you want to remove permanently a key-value pair you can use the following:

```python
del storage['foo']
print(storage['foo']) # raises KeyError
```

The storage object mimics the interface of a dict object, and supports:

- `get`
- `pop`
- `keys`
- `values`
- `items`
- `clear`
- `__len__`
- `__contains__`
- `__iter__`

Note that `keys`, `values`, and `items` return a list copy instead of a view.

A more complete example using `local_storage`, a TO-DO list app, can be found 
in the iframe below.

<iframe src="./examples/local_storage/local-storage-example.html" width=800, height=500></iframe>
