Entorno de desarrollo
---------------------

Los desarrolladores deberían usar el entorno de desarrollo disponible para 
descarga en [downloads](https://github.com/brython-dev/brython/releases) : 
elige el fichero zip cuyo nombre comienza por "BrythonX.Y.Z_site_mirror" donde 
X.Y.Z es el número de versión y descomprímelo en una carpeta (la llamaremos la 
carpeta Brython  en los siguientes párrafos).

Es necesario un servidor web para poder probar los scripts localmente mientras 
nos encontramos desarrollando. Cualquier servidor web que sea capaz de servir 
ficheros con la carpeta *brython_directory/www* como documento raíz es válido ; 
puedes usar el servidor incluido con la distribución : abre una consola, muévete 
hasta la carpeta donde se encuentra el fichero server.py y ejecuta 
`python server.py`. Esto arrancará un servidor en el puerto 8000 y creará una 
carpeta *static_doc*. Opciones para el script *server.py*:

* `--port <int>`: si deseas usar un puerto diferente puedes usar esta opción.
Por ejemplo, `python server.py --port 8001` para usar el puerto 8001.
* `--no-docs`: cuando estás haciendo pruebas no siempre es necesario crear la
carpeta *static_doc*. Si quieres evitar este paso lo puedes hacer usando 
`python server.py --no-docs`. AVISO: Si usas esta opción la documentación no
estará disponible en el localhost.

Una vez que el servidor ha arrancado, apunta tu navegador a 
_http://localhost:8000/site_ (o http://localhost:<port> si usaste la opción 
`python server.py --port <port>`): deberías poder ver la misma página que en 
[la página de inicio oficial de Brython](http://www.brython.info)

Crea una nueva carpeta (eg "whatever") en la carpeta *brython_directory/www*. 
Con un editor de texto crea un fichero llamado __index.html__ con el contenido 
mostrado más abajo y guárdalo en la carpeta 
*brython_directory/www/whatever/index.html*

>    <html>
>    <head>
>    <meta charset="iso-8859-1">
>    <script src="../src/brython.js"></script>
>    </head>
>    <body onLoad="brython()">
>    <script type="text/python">
>    from browser import document as doc
>    from browser import alert
>
>    def echo(ev):
>        alert("Hola %s !" %doc["zone"].value)
>
>    doc["echo"].bind('click', echo)
>    </script>
>    <p>Tu nombre es : <input id="zone"><button id="echo">click !</button>
>    </body>
>    </html>

Apunta el navegador hacia *http://localhost:8000/whatever/index.html * : bingo ! 
Acabas de escribir tu primera aplicación Brython.

Usa este entorno para pruebas y desarrollo. Solo debes acordarte de apuntar el 
script _brython.js_ a la localización correcta en relación a la carpeta donde se 
encuentran las páginas HTML que lo usen.
