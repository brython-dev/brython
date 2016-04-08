Implementación de import
------------------------

Para importar módulos o paquetes Brython usa el mismo mecanismo que CPython: para resolver "import X", el programa busca un fichero en diferentes sitios, primero en la librería estándar (urls relativas a la misma de __brython.js__):

- __libs/X.js__ (módulos Javascript, para los módulos en la librería estándar que no se pueden escribir en Python)
- __Lib/X.py__
- __Lib/X/\_\_init\_\_.py__
- __&lt;current\_dir&gt;/X.py__ (current\_dir es la carpeta del script que realiza el import)
- __&lt;current\_dir&gt;/X/\_\_init\_\_.py__
- __Lib/site-packages/X.py__
- __Lib/site-packages/X/\_\_init\_\_.py__

Debido a que el navegador no tiene acceso directo al sistema de ficheros, la búsqueda de un fichero debe realizarse mediante una llamada Ajax, que devolverá un mensaje de error si no encuentra el fichero en la ruta especificada.

Éste método consume mucho tiempo para los scripts que deben importar muchos módulos (por ejemplo, para "import random", se deben importar ¡44 modules!). Para mejorar el rendimiento, Brython propone algunas opciones:

1. la librería estándar se puede cargar en la página HTML con el fichero __py\_VFS.js__ :

   `<script src="/src/py_VFS.js"></script>`

   En este caso, la búsqueda en la librería estándar consiste en chequear si el nombre del módulo está referenciado en el script; en ese caso, se obtiene el código y se ejecuta, sin necesidad de realizar una llamada.

   Este método acelera la importación de librerías de la librería estándar; los inconvenientes son que el fichero __py\_VFS.js__ es grande (alrededor de 2 MB) y que si el usuario modifica el contenido de la librería estándar (la cual no es una buena práctica pero que se podría hacer para depurar), deberá generar una nueva versión de __py\_VFS.js__ usando el script Python __scripts/make\_VFS.py__.

2. Si __py\_VFS.js__ no se incluye, las búsquedas en la librería estándar se realizan mediante una tabla que mapea los nombres de módulos con una url relativa a donde se encuentra el fichero __brython.js__: si el nombre existe en la tabla, solo se realizará una única llamada Ajax a la dirección especificada.

   El único inconveniente de este método sería que si el usuario modifica la localización de los scripts en la librería estándar deberá encargarse de generar la tabla usando el script __scripts/make\_dist.py__.

   Para deshabilita esta opción y forzar la búsqueda mediante llamadas Ajax en todas las posibles localizaciones, la función __brython()__ debe ser invocada con la opción `static_stdlib_import` establecida como `false`.

Debes notar que los módulos deben ser codificados en utf-8; la declaración del 'encoding'al inicio del script se ignorará.

### Configurando el subsistema de carga de módulos

Desde la versión 3.2.1 de Brython , la instrucción `import` sigue las reglas de un subconjunto considerable de [la especificación de carga de módulos de Python 3.5](http://docs.python.org/3/reference/import), incluyendo el PEP 302, el PEP 328, el PEP 366 y el PEP 451. En este momento otras especificaciones no están implementadas total o parcialmente, lo que incluye el PEP 402 (¿por diseño?) y el PEP 338. Los componentes de más bajo nivel (i.e. finders, loaders) están disponibles en el módulo `_importlib`.

La manera más tradicional de cargar modulos desplegados en una URL consiste en añadir la URL en `sys.path` como se muestra a continuación.

```
import sys
sys.path.append('http://samedomain.tld/new/path')
```

La URL en cuestión puede apuntar a un directorio desplegado en el servidor o a un archivo VFS creado por el usuario. En este último caso el nombre del fichero tiene que terminar con la extensión `.vfs.js`. El código de los módulos puede ser escrito en Python (i.e. tipo de fichero 'py'), Javascript (i.e. tipo de fichero 'js') o puede ser un módulo compilado (i.e. tipo de fichero '.pyc.js'). Inicialmente Brython intentará cada uno de los tipos de fichero para cargar un módulo. Una vez que se halla una coincidencia todos los intentos posteriores de cargar un módulo desde esta URL se restringirán al tipo de fichero encontrado. En otras palabras, todos los módulos desplegados en un directorio, y sus sub-directorios, tienen que ser del mismo tipo.

Es posible optimizar la búsqueda inicial especificando el tipo de fichero de la siguiente manera.

```
import _importlib
# a la variable file_type se le puede asignar
# uno de los valores 'py', 'pyc.js', 'js', 'none'
_importlib.optimize_import_for_path('http://samedomain.tld/new/path', file_type)
```

Existe otro enfoque más declarativo que consiste en añadir etiquetas <link /> con el atributo `rel=pythonpath` en el `<head />` del documento HTML, e.g.

   `<link rel="pythonpath" href="http://samedomain.tld/new/path" />`

Se puede restringir la búsqueda inicial a un tipo de archivo utilizando el atributo `hreflang` como se muestra a continuación.

   `<link rel="pythonpath" href="http://samedomain.tld/new/path" hreflang="py" />`

Los ficheros VFS pueden ser cargados durante la inicialización de Brython si se añade el valor `prefetch` en el attributo `rel` e.g.

   `<link rel="pythonpath prefetch" href="http://samedomain.tld/path/to/file.vfs.js" />`

Todas las URL especificadas en el atributo `href` pueden ser relativas. En este caso serán expandidas a una URL absoluta según las reglas propias del navegador web.

