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
