Preguntas frecuentes
--------------------

__P__ : _¿Cómo es el rendimiento de Brython cuando se compara con Javascript u otras soluciones que permiten usar Python en el navegador?_

__R__ : Comparado a Javascript, el ratio puede ser muy diferente de un programa a otro. Dispones de una consola Javascript en la propia distribución de Brython o en la [página oficial del proyecto](http://brython.info/tests/js_console.html), se puede usar para medir el tiempo de ejecución de un programa Javascript comparado a su equivalente en Python (deseleccionando el checkbox "debug").

La diferencia se debe a dos factores :

- el tiempo de traducir al vuelo de Python  a Javascript en el navegador. Para hacerse una idea, el módulo datetime (2130 líneas de código Python) se analiza sintácticamente y se traduce a Javascript en 0,5 segundos en un PC ordinario.

- El código Javascript generado por Brython debe cumplir con las especificaciones de Python, incluyendo la naturaleza dinámica de la búsqueda de atributos, lo que provoca que el código Javascript creado no esté optimizado.

Algunas [comparaciones imaginativas](http://pyppet.blogspot.fr/2013/11/brython-vs-pythonjs.html) mencionan una proporción de 1 a 7500 frente a Brython : no se proporciona ninguna información pero es obvio que la comparación no está hecha en condiciones comparables ; en las mismas condiciones (corriendo un script en un navegador web) es complicado imaginar como se puede ser más rápido que Javascript nativo...

Comparado con otras soluciones que traducen Python a Javascript, un benchmark está disponible en el [blog de Pierre Quentel](https://brythonista.wordpress.com/2015/03/28/comparing-the-speed-of-cpython-brython-skulpt-and-pypy-js/) (creador y principal desarrollador de Brython). Se compara Brython, [Skulpt](http://skulpt.org) y [pypy.js](http://pypyjs.org/demo/). Hay que ser prudente con este tipo de benchmarks entre implementaciones, pero con las capacidades incluidas en las pruebas, Brython es, en general, más rápido que pypy.js, el cual, a su vez, es más rápido que Skulpt. En algunos casos, Brython es más rápido que la implementación Python de referencia, CPython.

__P__ : _Veo muchos errores 404 en la consola del navegador cuando se ejecutan scripts Brython, ¿A qué es debido?_

__R__ : Esto es debido a la forma en que Brython implementa el mecanismo "import" para importar librerías. Cuando un script tiene que importar el módulo X, Brython busca un fichero o un paquete en diferentes carpetas : la librería estándar (carpeta libs para los módulos Javascript, Lib para los módulos Python), la carpeta Lib/site-packages, la carpeta de la página actual. Para ello, las llamadas Ajax se envían a las distintas urls ; si el fichero no se encuentra en esa url, el mensaje de error 404 se muestra en la consola del navegador, pero Brython entiende y maneja el error y sigue buscando el módulo o lanza un `ImportError` si después de buscar en las diferentes carpetas no ha sido posible encontrar el módulo 

__P__ : _¿Por qué se usa el operador <= para crear un árbol de elementos DOM? Esto no es pythónico!_

__R__ : Python no posee una estructura integrada para manipular árboles, i.e. añadir nodos "hijos" o "hermanos" a un árbol. Para estas operaciones se podrían usar funciones; la sintaxis propuesta por Brython sería la de usar operadores: es más sencillo de escribir (no hay paréntesis) y es más legible.

Para añadir un nodo hermano se puede usar el operador `+`.

Para añadir un nodo hijo se podría usar el operador `<=`, el cual fue elegido por las siguientes razones:

- - tiene la forma de una flecha hacia la izquierda. Las anotaciones de función (function annotations) de Python usan un nuevo operador `->` que fue elegido por su forma de flecha.
- parece una asignación aumentada debido al signo igual.
- no podría ser confundido con "menor o igual" debido a que una línea con `document <= elt` sería un 'no-op' si fuera "menor o igual", que se usa siempre en una condición.
- estamos tan acostumbrados a interpretar los dos signos `<` y `=` como "menor o igual" que nos olvidamos que son una convención para los lenguajes de programación, para reemplazar el signo real `≤`.
- en Python, `<=` se usa como un operador para conjuntos con un significado diferente a "menor o igual".
- el signo `<` se usa frecuentemente en ciencias de la computación para indicar algo diferente a "menor que": en Python y muchos otros lenguajes, `<<` significa desplazamiento hacia la izquierda; en HTML las etiquetas se encierran con `<` y `>`.
- Python usa el operador `%` para operaciones muy diferentes: 'modulo' y formateo de cadenas.

__P__ : ¿Qué navegadores son compatibles con Brython?

__R__ : Debajo se muestra una lista de los navegadores soportados:

// todo: get images from http://www.paulirish.com/2010/high-res-browser-icons/

<table border="1">
  <tr><td>Chrome</td><td>FireFox</td><td>IE</td><td>Opera</td><td>Safari</td><td>Android Browser</td><td>Chrome para Android</td><td>iOS Safari</td><td>Opera Mini</td></tr>
  <tr><td>36+</td><td>31+</td><td>9+</td><td>26+</td><td>5.1+</td><td>4.1+</td><td>39+</td><td>7.1+</td><td>8+</td></tr>
</table>
