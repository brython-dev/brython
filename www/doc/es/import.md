Implementación de import
------------------------

Como en Python estándar, puedes instalar módulos o paquetes en tu
aplicación colocándolos en el directorio raíz o en directorios con un
fichero __\_\_init\_\_.py__.

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

```xml
<script type="text/javascript" src="brython_stdlib.js"></script>
```

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

Para ello, desde el directorio raíz de la aplicación ejecuta en la línea de comandos

```console
python -m brython --modules
```

Ten en cuenta que este programa analiza el código Brython en todos los scripts, módulos
y páginas HTML del directorio y todos sus sub-directorios. La versión CPython
usada debe ser compatible con el código Brython: por ejemplo, si existen
f-strings en el código Brython, se requiere usar CPython 3.6+, si no obtendrás
errores de sintaxis.

Puedes reemplazar todas las ocurrencias de
```xml
<script type="text/javascript" src="brython_stdlib.js"></script>
```
por
```xml
<script type="text/javascript" src="brython_modules.js"></script>
```
