Módulos **browser.local\_storage** y **browser.session\_storage**
-----------------------------------------------------------------

Este módulo usa el almacenamiento local definido en HTML5. La especificación se puede encontrar siguiendo [este enlace](http://dev.w3.org/html5/webstorage/#the-localstorage-attribute)

¿Qué es el el almacenamiento local (**`localStorage de HTML5`**): 

- localStorage es una base de datos clave-valor que funciona en el cliente, i.e. los datos se almacenan en el navegador del usuario. Esto significa que los datos se guardan dentro del navegador en tu máquina. Esto también significa que los datos almacenados solo estarán disponibles para el usuario en la misma máquina y mismo navegador. Recuerda que `local_storage` es por navegador y no por ordenador.
- Las claves y valores son cadenas.
- Las claves y valores se almacenan de forma persistente en un protocolo, dominio y puerto específicos. Las bases de datos `local_storage` trabajan en el ámbito de un origen HTML5, basicamente la tupla (esquema, host, puerto, i.e. `scheme://host:port`). Esto significa que la base de datos será compartida en todas las páginas alojadas en el mismo dominio, incluso de forma concurrente mediante múltiples pestañas del navegador. Sin embargo, una página que se conecte por `http://` no podrá ver una base de datos que fue creada mediante una sesión `https://`.

HTML5 define dos tipos de almacenamiento, *local storage* y *session storage* ; 
el primero es *persistente*, i.e. mantiene los datos en el almacén cuando el 
usuario cierra la ventana ; con el segundo se pierden los datos cuando el 
usuario cierra la ventana. 

En Brython, el **local storage de HTML5** se encuentra implementado en el paquete **`browser`** en los siguientes módulos:

- **local\_storage**
> Este módulo permite acceder a un único objeto `storage`, el cual da acceso a 
> _local storage_. Se puede interactuar con el mismo como si fuera un diccionario 
> Python, sin embargo, hay que tener en cuenta que las claves y los valores están 
> restringidos a cadenas.
- **session\_storage**
> Este módulo también permite acceder al objeto `storage`, que permite acceder a
> _session storage_ que es similar al anterior. Usa **session\_storage** cuando 
> no deseas que los datos se compartan entre diferentes sesiones del navegador 
> o entre pestañas del mismo. Un caso de uso típico es un token para hacer log-in.

Un ejemplo simple sería como sigue:

```python
from browser.local_storage import storage
storage['foo']='bar'
print(storage['foo'])
```

Ahora, si cierras la pestaña, tu navegador o incluso la máquina cuando la vuelvas a 
abrir el mismo navegador tendrás acceso a los valores almacenados por la clave `'foo'` 
en el mismo `scheme://host:port` donde el par clave-valor fue almacenado.

Si quieres eliminar de forma permanente un par clave-valor puedes usar la siguiente sintaxis:

```python
del storage['foo']
print(storage['foo']) # raises KeyError
```

El objeto `storage` imita la funcionalidad de un diccionario y soportan:

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

Un ejemplo más completo que hace uso de `local_storage`, una aplicación que almacena listas de cosas a hacer (TO-DO), se puede ver en el siguiente iframe de más abajo.

<iframe src="../en/examples/local_storage/local-storage-example.html" width=800, height=500></iframe>
