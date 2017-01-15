Para instalar Brython :

- Si tu PC dispone de CPython y pip, instala el paquete `brython` mediante

```
    pip install brython
```

> Una vez hecho lo anterior, en un directorio vacio ejecuta

```
    python -m brython --install
```

- Si no puedes instalar Brython de esta forma, ve a la [página de _releases_](https://github.com/brython-dev/brython/releases)
en Github, selecciona la última versión, descarga y descomprime __Brython-x.y.z.zip__.

En ambos casos, el directorio tiene los siguientes ficheros :

- __brython.js__ : el motor (*engine*) Brython, que hay que incluir en la página HTML
- __brython_stdlib.js__ : agrupa todos los módulos y paquetes de parte de la librería estándar soportados por Brython
- __demo.html__ : una página con unos pocos exemplos sobre cómo usar Brython 
  para desarrollo en el cliente

__brython.js__ incluye los módulos de uso frecuente : `browser, browser.html, javascript`.

Si tu aplicación usa módulos de la distribución estándar necesitarás incluir
 __brython_stdlib.js__ además de __brython.js__ en tu página HTML:

```
<script type="text/javascript" src="brython.js"></script>
<script type="text/javascript" src="brython_stdlib.js"></script>
```
