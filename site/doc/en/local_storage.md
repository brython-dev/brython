module **browser.local_storage**
--------------------------------

This module uses the local storage defined in HTML5. The specification can be found following [this link](http://dev.w3.org/html5/webstorage/#the-localstorage-attribute)

What is **`HTML5 localStorage`** ?: 

- localStorage is a client-side key-value database, i.e. the data is stored in the users browser. This means the users data is saved on their machine inside their browser. This also means that the stored data is only available to them when the user is on that machine and in that browser. Remember that `localStorage` is per browser not per computer.
- Keys and values are strings.
- Keys and values are stored persistently on a specific protocol, domain and port. `localStorage` databases are scoped to an HTML5 origin, basically the tuple (scheme, host, port, i.e. `scheme://host:port`). This means that the database is shared across all pages on the same domain, even concurrently by multiple browser tabs. However, a page connecting over `http://` cannot see a database that was created during an `https://` session.

**HTML5 localStorage** is implemented in Brython under the browser module as the following objects:

- LocalStorage
  - This class provides access to the `localStorage` object. You can interact with it like a dictionary, however, keep in mind that keys and values are restricted to strings.
- SessionStorage
  - This class provides access to the `sessionStorage` object. It is otherwise the same as `LocalStorage`. Use `sessionStorage` when you do not wish data to be shared across browser sessions or tabs. A typical use case is a log-in token.
- ObjectStorage
  - This class allows you to interact with either `LocalStorage` or `SessionStorage` with objects instead of only strings. This is done by pickling the keys/values. This is limited to the implemented pickle functionality of Brython, which currently only supports JSON serializable objects, such as a `list` or `dict`. Also note that objects become immutable once they are stored, so  `ObjecStorage()['foo'].update({"bar": "zoo"})` won't actually do anything.

A simple example of `LocalStorage` is as follows:

>    from browser import LocalStorage
>    storage = LocalStorage()
>    storage['foo']='bar'
>    print(storage['foo'])

Now, if you close your tab, your browser or even your computer when you open again the same browser you will have access to the values stored by the `'foo'` key in the same `scheme://host:port` where the key-value pair was stored.

If you want to remove permanently a key-value pair you can use the following:

>    del storage['foo']
>    print(storage['foo']) # raises KeyError

LocalStorage, SessionStorage, and ObjectStorage all mimic the interface of a dict object, and support:

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

Example of `ObjectStorage`:

>    from browser import ObjectStorage, SessionStorage
>    object_storage = ObjectStorage(SessionStorage())
>    object_storage[['do', 're', 'me']] = {"tune": "in tune"}
>    # to update the value, need to copy out first
>    tmp = object_storage[['do', 're', 'me']]
>    tmp.update({"duration": "one hour"})
>    object_storage[['do', 're', 'me']] = tmp

SessionStorage and LocalStorage can also be directly imported without instantiating an instance of the class in your code.

>    from browser.local_storage import storage
>    from browser.session_storage import storage as sess_storage
>    storage.clear()
>    sess_storage.get("foo")

A more complete example using `local_storage`, a TO-DO list app, can be found in the iframe below.

<iframe src="./examples/local_storage/local-storage-example.html" width=800, height=500></iframe>
