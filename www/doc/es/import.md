Implementación de import
------------------------

Como en Python estándar, puedes instalar módulos o paquetes en tu
aplicación colocándolos en el directorio raíz o en directorios con un 
fichero __\_\_init.py\_\___.

Destacar que los módulos deben ser codificados en utf-8 ; la declaración de codificación al inicio 
del script será ignarada.

Por ejemplo, la aplicación podría disponer de los siguientes ficheros y
directorios :

    .bundle-include
    app.html
    brython.js
    brython_modules.js
    brython_stdlib.js
    index.html
    users.py
    utils.py
    + app
        __init__.py
        records.py
        tables.py

Un script Python en __app.html__ puede ejecutar los _imports_

```python
import users
import app.records
```

Si la distribución estándar ha sido incluida en la página mediante

    <script type="text/javascript" src="brython_stdlib.js"></script>

el script podrá también hacer, por ejemplo, 

```python
import datetime
import re
```

Para importar módulos o paquetes Brython usa el mismo mecanismo que CPython: 
para resolver "import X", el programa busca un fichero en diferentes sitios:

- un módulo __X__ en la distribución estándar
- un fichero __X.py__ en el directorio raíz
- un fichero __\_\_init\_\_.py__ en el directorio __X__

Debido a que el navegador no tiene acceso directo al sistema de ficheros, 
la búsqueda de un fichero debe realizarse mediante una llamada Ajax, 
que devolverá un mensaje de error si no encuentra el fichero en la ruta especificada.

Optimización
============

El proceso descrito anteriormente tiene dos pegas principales :

- el relativo gran tamaño de __brython_stdlib.js__ (más de 3 Mb)
- el tiempo consumido en las llamadas Ajax

Para optimizar los _imports, si Brython fue instalado usando `pip`, puedes generar
un fichero __brython_modules.js__ que solo contendrá los módulos usados por la
aplicación.

Para ello, la lista de los módulos debe ser añadida en un fichero __.bundle-include__ 
en el directorio raíz y luego ejecutar en la línea de comandos

`python -m brython --update`

Para obtener la lista de los módulos usados puedes ejecutar la aplicación en un navegador, 
abre la consola del navegador y ejecuta el comando:

`__BRYTHON__.imports()`

Esto abre una nueva ventana con la lista de los módulos usados que puedes copiar y pegar
en __.bundle-include__.
