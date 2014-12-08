Módulo browser.local_storage
----------------------------

Este módulo usa el almacenamiento local definido en HTML5. La especificación se puede encontrar siguiendo [este enlace](http://dev.w3.org/html5/webstorage/#the-localstorage-attribute)

¿Qué es el **`localStorage de HTML5`**: 

- localStorage es una base de datos clave-valor qye funciona en el cliente, i.e. los datos se almacenan en el navegador del usuario. Esto significa que los datos se guardan dentro del navegador en tu máquina. Esto también significa que los datos almacenados solo estarán disponibles para el usuario en la misma máquina y mismo navegador. Recuerda que `local_storage` es por navegador y no por ordenador.
- Las claves y valores son cadenas por lo que si introduces, por ejemplo, una lista cuando intentes acceder a esos valores obtendrás una cadena en lugar de la lista original. ¡¡Recuerda esto!!
- Las claves y valores se almacenan de forma persistente en un protocolo, dominio y puerto específicos. Las bases de datos `local_storage` trabajan en el ámbito de un origen HTML5, basicamente la tupla (esquema, host, puerto, i.e. `scheme://host:port`). Esto significa que la base de datos será compartida en todas las páginas alojadas en el mismo dominio, incluso de forma concurrente mediante múltiples pestañas del navegador. Sin embargo, una página que se conecte por `http://` no podrá ver una base de datos que fue creada mediante una sesión `https://`.

En Brython, el **localStorage de HTML5** se encuentra implementado en el módulo **`browser.local_storage`**. El módulo define los siguientes objetos:

- LocalStorage
  - Esta clase permite acceder al objeto `localStorage`. Se puede interactuar con el mismo como si fuera un diccionario Python, sin embargo, hay que tener en cuenta que las claves y los valores están restringidos a cadenas.
- SessionStorage
  - Esta clase permite acceder al objeto `sessionStorage`. Es similar a `LocalStorage`. Usa `sessionStorage` cuando no deseas que los datos se compartan entre diferentes sesiones del navegador o entre pestañas del mismo. Un caso de uso típico es un token para hacer log-in.
- ObjectStorage
  - Esta clase permite acceder tanto a `LocalStorage` como a `SessionStorage` con objetos en lugar de solo como cadenas. Esto se puede hacer amediante serialización de claves/valores. Se limita a la funcionalidad pickle de Brython Brython, la cual solo soporta objetos JSON serializables, como una `list` o un `dict`. Además, hay que tener en cuenta que los objetos se convierten en inmutables una vez han sido almacenados, por tanto  `ObjecStorage()['foo'].update({"bar": "zoo"})` en realidad no estaría haciendo nada.

Un ejemplo simple sería como sigue:

>    from browser import LocalStorage
>    storage = LocalStorage()
>    storage['foo']='bar'
>    print(storage['foo'])

Ahora, si cierras la pestaña, tu navegador o incluso la máquina cuando la vuelvas a abrir el mismo navegador tendrás acceso a los valores almacenados por la clave `'foo'` en el mismo `scheme://host:port` donde el par clave-valor fue almacenado.

Si quieres eliminar de forma permanente un par clave-valor puedes usar la siguiente sintaxis:

>    del storage['foo']
>    print(storage['foo']) # raises KeyError

LocalStorage, SessionStorage y ObjectStorage imitan la funcionalidad de un diccionario y soportan:

- `get`
- `pop`
- `keys`
- `values`
- `items`
- `clear`
- `__len__`
- `__contains__`
- `__iter__`

Destacar que `keys`, `values` e `items` devuelven una copia de una lista en lugar de una vista.

Ejemplo de `ObjectStorage`:

>    from browser import ObjectStorage, SessionStorage
>    object_storage = ObjectStorage(SessionStorage())
>    object_storage[['do', 're', 'me']] = {"tune": "in tune"}
>    # to update the value, need to copy out first
>    tmp = object_storage[['do', 're', 'me']]
>    tmp.update({"duration": "one hour"})
>    object_storage[['do', 're', 'me']] = tmp

SessionStorage y LocalStorage se pueden importar directamente sin hacer una instancia de la clase en el código.

>    from browser.local_storage import storage
>    from browser.session_storage import storage as sess_storage
>    storage.clear()
>    sess_storage.get("foo")

Un ejemplo más completo que hace uso de `local_storage`, una aplicación que almacena listas de cosas a hacer (TO-DO), se puede ver en el siguiente iframe de más abajo.

<iframe src="../en/examples/local_storage/local-storage-example.html" width=800, height=500></iframe>
