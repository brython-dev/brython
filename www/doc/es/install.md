Sin instalación
-----------------
Puedes usar Brython sin tener que instalar nada, solo necesitas
para incluir scripts de Brython en la página HTML de un CDN.

```xml
<script src="https://cdn.jsdelivr.net/npm/brython@3/brython.min.js">
</script>
<script src="https://cdn.jsdelivr.net/npm/brython@3/brython_stdlib.js">
</script>
```

También podemos especificar la versión menor con `brython@3.10` y la versión
micro con `brython@3.10.7`.

Brython también está disponible en cdnjs:

```xml
<script src="https://cdnjs.cloudflare.com/ajax/libs/brython/3.10.7/brython.min.js">
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/brython/3.10.7/brython_stdlib.min.js">
</script>
```

Instalación local
-----------------

Para instalar Brython :

- Si tu PC dispone de CPython y pip, instala el paquete `brython` mediante
```console
pip install brython
```

El paquete instala un sotfware del cliente `brython-cli` (equivalente a `python -m brython`).

> Una vez hecho lo anterior, en un directorio vacio ejecuta
>```console
>brython-cli install
>```

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

```xml
<script type="text/javascript" src="brython.js"></script>
<script type="text/javascript" src="brython_stdlib.js"></script>
```

Actualizaciones
---------------
Cuando se publica una nueva versión de Brython, la actualización se realiza usando
el comando típico:

```console
pip install brython --upgrade
```

En el directorio de la aplicación puedes actualizar los ficheros Brython
(__brython.js__ y __brython_stdlib.js__) usando:

```console
brython-cli update
```

Instalando un paquete CPython
-----------------------------
Un paquete CPython instalado mediante `pip` se puede instalar en una aplicación Brython
mediante el comando `--add_package <package name>`.

Por ejemplo:
```console
pip install attrs
brython-cli add_package attrs
```

Todos los ficheros en el paquete deben, por supuesto, ser usables por Brython; esto,
por ejemplo, excluye ficheros escritos en C.

Otros comandos
--------------

`modules`

> crea una distribución específica para la aplicación, para reemplazar
> __`brython_stdlib.js`__ por un fichero más pequeño. Ver sección
> [import](import.html).

`make_dist`

> genera un paquete CPython, apto para ser distribuido mediante PyPI, para instalar
> una aplicación Brython. Ver sección [Desplegando una aplicación Brython](deploy.html)

Servidor Web
------------
Los ficheros HTML se pueden abrir en un navegador pero se recomienda iniciar un
servidor web en el directorio de la aplicación.

La forma más directa sería usar el módulo **http.server** en la biblioteca
estándar de CPython:

```console
python -m http.server
```

El puerto pro defecto es el 8000. Para elegir otro puerto puedes usar:

```console
python -m http.server 8001
```

Podras acceder a la web introduciendo la url _http://localhost:8001/demo.html_
 en la barra de direcciones del navegador.