Preguntas frecuentes
--------------------

__Q__ : _¿Qué significa "Brython"?_

__A__ : <u>Br</u>owser P<u>ython</u>. También es la palabra galesa para "brittonic-speaking Celt".

__P__ : ¿Qué navegadores son compatibles con Brython?

__R__ : Todos los navegadores modernos, incluyendo los que funcionan en smartphones. El Javascript generado evita a proposito el uso de sintaxis nueva hasta que sea soportada por la mayoría de navegadores.

Destacar que el rendimiento es normalmente mejor (algunas veces _mucho_ mejor) con Firefox que con Chrome.

__P__ : _¿Cómo es el rendimiento de Brython cuando se compara con Javascript u otras soluciones que permiten usar Python en el navegador?_

__R__ : Comparado a Javascript, el ratio puede ser muy diferente de un programa a otro. Dispones de una consola Javascript en la propia distribución de Brython o en la [página oficial del proyecto](http://brython.info/tests/js_console.html), se puede usar para medir el tiempo de ejecución de un programa Javascript comparado a su equivalente en Python (deseleccionando el checkbox "debug").

La diferencia se debe a dos factores :

- el tiempo de traducir al vuelo de Python  a Javascript en el navegador. Para hacerse una idea, el módulo datetime (2130 líneas de código Python) se analiza sintácticamente y se traduce a Javascript en 0,5 segundos en un PC ordinario.

- El código Javascript generado por Brython debe cumplir con las especificaciones de Python, incluyendo la naturaleza dinámica de la búsqueda de atributos, lo que provoca que el código Javascript creado no esté optimizado.

Comparado con otras soluciones que traducen Python a Javascript, un benchmark está disponible en el [blog de Pierre Quentel](https://brythonista.wordpress.com/2015/03/28/comparing-the-speed-of-cpython-brython-skulpt-and-pypy-js/) (creador y principal desarrollador de Brython). Se compara Brython, [Skulpt](http://skulpt.org) y [pypy.js](http://pypyjs.org/demo/). Hay que ser prudente con este tipo de benchmarks entre implementaciones, pero con las capacidades incluidas en las pruebas, Brython es, en general, más rápido que pypy.js, el cual, a su vez, es más rápido que Skulpt. En algunos casos, Brython es más rápido que la implementación Python de referencia, CPython.

El repositorio de Brython incluye un script, en la dirección _localhost:8000/speed_, que
compara la velocidad de Brython y CPython en la máquina local para una variedad de
operaciones elementales.

__P__ : _Veo muchos errores 404 en la consola del navegador cuando se ejecutan scripts Brython, ¿A qué es debido?_

__R__ : Esto es debido a la forma en que Brython implementa el mecanismo "import" para importar librerías. Cuando un script tiene que importar el módulo X, Brython busca un fichero o un paquete en diferentes carpetas : la librería estándar (carpeta libs para los módulos Javascript, Lib para los módulos Python), la carpeta Lib/site-packages, la carpeta de la página actual. Para ello, las llamadas Ajax se envían a las distintas urls ; si el fichero no se encuentra en esa url, el mensaje de error 404 se muestra en la consola del navegador, pero Brython entiende y maneja el error y sigue buscando el módulo o lanza un `ImportError` si después de buscar en las diferentes carpetas no ha sido posible encontrar el módulo 

__Q__ : _¿Por qué aparece el siguiente mensaje en la consola del navegador: "Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help http://xhr.spec.whatwg.org/"?_

__A__ : Esto también está relacionado con los imports o con la lectura de ficheros. Para realizar estas operaciones, Brython usa llamadas Ajax bloqueantes : un módulo importado debe ser cargado antes de que pueda usarse. No parece que los creadores de navegadores vayan a eliminar las llamadas bloqueantes en un futuro cercano.

__Q__ : _¿Es posible precompilar scripts Brython de tal forma que se pueda reducir el tiempo de ejecución?_

__A__ : Brython ha sido diseñado para ser tan simple de ejecutar como Javascript : poner código Python en una sección `<script>` de una página HTML, cargar la página, editar el código, recargar la página, etc. No es como otros proyectos dónde el código Python se traduce a Javascript mediante un programa Python, de tal forma que para cualquier modificación debas ejecutar este programa Python antes de recargar la página.

Otra razón por la que no es buena idea precompilar Brython es porque el código generado es, normalmente, 10 veces más grande que el código Python original - este es el precio a pagar para cumplir con la especificación del lenguaje. La página tardaría más en cargar y no hemos encontrado que esto sería más rápido que compilar al vuelo.

Sin embargo, desde la versión 3.6.0, una versión precompilada de los scripts en la biblioteca estándar se almacena en un base de datos indexedDB anexada al navegador dónde el código se ejecuta. La compilación se realiza la primera vez que se importa el script o si la versión de Brython ha cambiado desde la última compilación. Esto mejora de forma dramática el tiempo de carga de los imports.

__P__ : _¿Por qué se usa el operador `<=` para crear un árbol de elementos DOM? ¡Esto no es pythónico!_

__R__ : Python no posee una estructura integrada para manipular árboles, i.e. añadir nodos "hijos" o "hermanos" a un árbol. Para estas operaciones se podrían usar funciones; la sintaxis propuesta por Brython sería la de usar operadores: es más sencillo de escribir (no hay paréntesis) y es más legible.

Para añadir un nodo hermano se puede usar el operador `+`.

Para añadir un nodo hijo se podría usar el operador `<=`, el cual fue elegido por las siguientes razones:

- tiene la forma de una flecha hacia la izquierda. Las anotaciones de función (function annotations) de Python usan un nuevo operador `->` que fue elegido por su forma de flecha.
- parece una asignación aumentada debido al signo igual.
- no podría ser confundido con "menor o igual" debido a que una línea con `document <= elt` sería un 'no-op' si fuera "menor o igual", que se usa siempre en una condición.
- estamos tan acostumbrados a interpretar los dos signos `<` y `=` como "menor o igual" que nos olvidamos que son una convención para los lenguajes de programación, para reemplazar el signo real `≤`.
- en Python, `<=` se usa como un operador para conjuntos con un significado diferente a "menor o igual".
- el signo `<` se usa frecuentemente en ciencias de la computación para indicar algo diferente a "menor que": en Python y muchos otros lenguajes, `<<` significa desplazamiento hacia la izquierda; en HTML las etiquetas se encierran con `<` y `>`.
- Python usa el operador `%` para operaciones muy diferentes: 'modulo' y formateo de cadenas.

