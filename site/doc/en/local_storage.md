module **browser.local_storage**
--------------------------------

This module uses the local storage defined in HTML5. The specification can be found following [this link](http://dev.w3.org/html5/webstorage/#the-localstorage-attribute)

What is **`HTML5 localStorage`** ?: 

- localStorage is a client-side key-value database, i.e. the data is stored in the users browser. This means the users data is saved on their machine inside their browser. This also means that the stored data is only available to them when the user is on that machine and in that browser. Remember that `local_storage` is per browser not per computer.
- Keys and values are strings so if you enter, for example, a list when you try to get the values you will obtain a string and not the original list. Remember this!!
- Keys and values are stored persistently on a specific protocol, domain and port. `local_storage` databases are scoped to an HTML5 origin, basically the tuple (scheme, host, port, i.e. `scheme://host:port`). This means that the database is shared across all pages on the same domain, even concurrently by multiple browser tabs. However, a page connecting over `http://` cannot see a database that was created during an `https://` session.

The **HTML5 localStorage** is implemented in Brython in the module **`browser.local_storage`**. The module defines an object, `storage`, which is used as a typical Python dictionary

A simple example of use is as follows:

>    from browser.local_storage import storage
>    storage['foo']='bar'
>    print(storage['foo'])

Now, if you close your tab, your browser or even your computer when you open again the same browser you will have access to the values stored by the `'foo'` key in the same `scheme://host:port` where the key-value pair was stored.

If you want to remove permanently a key-value pair you can use the following:

>    del storage['foo']
>    print(storage['foo']) # raises KeyError

A more complete example using `local_storage`, a TO-DO list app, can be found in the iframe below.

<iframe src="./examples/local_storage/local-storage-example.html" width=800, height=500></iframe>
