Este tutorial explica como desarrollar una aplicación que se ejecuta en el navegador usando el lenguaje de programación Python. Usaremos el ejemplo de crear una calculadora.

Necesitarás un editor de texto y, por supuesto, un navegador con acceso a internet.

Los contenidos de este tutorial asume que dispones de conocimientos basicos de HTML (estructura general de la página, las etiquetas más usadas), de hojas de estilos (CSS) y del lenguaje Python.

En el editor de texto crea una página HTML con el siguiente contenido:

```xml
<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <script type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/brython@{implementation}/brython.min.js">
    </script>
    <script type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/brython@{implementation}/brython_stdlib.js">
    </script>
</head>

<body onload="brython()">

<script type="text/python">
from browser import document

document <= "Hola !"
</script>


</body>

</html>
```

Guarda la página en un directorio vacio con el nombre __`index.html`__. Para verlo en el navegador dispones de varias opciones:

- usa el menú File/Open del navegador: es la solución más simple. Tiene ciertas limitaciones [ciertas limitaciones](/static_doc/en/file_or_http.html) para un uso más avanzado pero esta opción funcionará sin problemas para poder llevar este tutorial a cabo.
- lanza un servidor web : por ejemplo, si el intérprete de Python que se descarga del site python.org está instalado en el equipo, ejecuta `python -m http.server` en el directorio donde hemos guardado el fichero. Luego puedes introducir _localhost:8000/index.html_ en la barra de direcciones del navegador (para esta opción SÍ que te hará falta tener instalado un intérprete de CPython).

Cuando abras la página deberías ver el mensaje "Hola !" mostrado en la ventana del navegador.

Estructura de la página
=======================
Echemos un vistazo a los contenidos de la página. En la zona del `<head>` llamamos al script __`brython.js`__ : Es la biblioteca Brython, el programa que encontrará y ejecutará los scripts Python incluidos en la página. En este ejemplo obtenemos la biblioteca usando un CDN de tal forma que no hace falta instalar nada en el PC. El número de versión (`brython@{implementation}`) se puede actualizar para cada nueva versión de Brython.

La etiqueta `<body>` contiene el atributo `onload="brython()"`. Significa que cuando la página termine de cargarse el navegador llamará a la función `brython()`, la cual está definida en la biblioteca Brython ya cargada en la página. La función busca todas las etiquetas `<script>` que contienen el atributo `type="text/python"` y ejecuta el código contenido en ellas.

Nuestra página __`index.html`__ contiene este script:

```python
from browser import document

document <= "Hello !"
```

Este es un programa Python estándar, empezando por la importación del módulo __`browser`__ (en este caso, un módulo contenido con la biblioteca Brython __`brython.js`__). El módulo contiene un atributo `document` que referencia al contenido mostrado en la ventana del navegador.

Para añadir un texto al documento - concretamente, para mostrar texto en el navegador - la sintaxis usada por Brython es

```python
document <= "Hello !"
```

Puedes ver el operador `<=` como una flecha apuntando a la izquierda : el documento 'recibe' un nuevo elemento, en este caso el texto "Hello !". Verás en la página de ejemplo que siempre se posible usar la forma estándar de la sintaxis del DOM para interactuar con la página. Pero Brython proporciona unos pocos atajos para que el código sea más corto.

Formateado de texto con etiquetas HTML
======================================
Las etiquetas HTML permiten formatear el texto para escribirlo, por ejemplo, en negrita (etiqueta `<B>`), en cursiva (`<I>`), etc.

Con Brython estas etiquetas están disponibles como funciones definidas en el modulo __`html`__ del paquete __`browser`__. Aquí puedes ver cómo usarlo:

```python
from browser import document, html

document <= html.B("Hola !")
```

Se pueden anidar las etiquetas:

```python
document <= html.B(html.I("Hola !"))
```

Las etiquetas se pueden añadir unas a otras como _strings_:

```python
document <= html.B("Hola, ") + "mundo !"
```

El primer argumento de la función de etiqueta HTML puede ser un _string_, un número, otra etiqueta. Puede ser, también, un "iterable" Python (list, comprehension, generador): en este caso, todos los elementos creados en la iteración se añaden a la etiqueta.

```python
document <= html.UL(html.LI(i) for i in range(5))
```

Los atributos de una etiqueta se pueden mandar a la etiqueta usando palabras clave en la función:

```python
html.A("Brython", href="http://brython.info")
```

Dibujando la calculadora
========================
Podemos dibujar nuestra calculadora como una tabla HTML.

La primera línea contendrá la zona de resultados seguida de un botón de reseteo. Las siguientes tres líneas contienen los dígitos, operaciones,...

```python
from browser import document, html

calc = html.TABLE()
calc <= html.TR(html.TH(html.DIV("0", id="result"), colspan=3) +
                html.TD("C", id="clear"))
lines = ["789/",
         "456*",
         "123-",
         "0.=+"]

calc <= (html.TR(html.TD(x) for x in line) for line in lines)

document <= calc
```

Estamos usando generadores Python para que el tamaño del programa sea más pequeño pero siga siendo legible.

Vamos a añadir estilo a las etiquetas `<TD>` en una hoja de estilos de tal forma que la calculadora tenga mejor aspecto visual:

```xml
<style>
*{
    font-family: sans-serif;
    font-weight: normal;
    font-size: 1.1em;
}
td{
    background-color: #ccc;
    padding: 10px 30px 10px 30px;
    border-radius: 0.2em;
    text-align: center;
    cursor: default;
}
#result{
    border-color: #000;
    border-width: 1px;
    border-style: solid;
    padding: 10px 30px 10px 30px;
    text-align: right;
}
</style>
```

Gestión de eventos
==================
El siguiente paso será desencadenar una acción cuando el usuario presione los botones de la calculadora:

- Para los dígitos y las operaciones : Muestra el dígito o la operación en la zona de resultados.
- Para el signo = : ejecuta la operación y muestra el resultado o un mensaje de error en el caso de que la entrada sea inválida.
- Para la letra C : resetea la zona de resultados.

Para manejar los elementos mostrados en la página el programa necesitará primero obtener una referencia a esos elementos. Los botones han sido creados como etiquetas `<TD>`; la sintaxis para obtener una referencia a todas estas etiquetas será;

```python
document.select("td")
```

El argumento usado en el método `select()` es un _CSS selector_. Los más típicos son: un nombre de etiqueta ("td"), el atributo `id` del elemento ("#result") o su atributo "class" (".classname"). El resultado de `select()` será siempre una lista de elementos.

Los eventos que pueden ocurrir en los elementos de una página tienen un nombre normalizado: cuando el usuario pulsa en un botón, el evento llamado "click" sucede. Enel programa, este evento provocará la ejecución de una función. La asociación entre elemento, evento y función se define usando la siguiente sintaxis

```python
element.bind("click", action)
```

Para la calculadora, podemos asociar la misma función a los eventos "click" de todos los botones mediante:

```python
for button in document.select("td"):
    button.bind("click", action)
```

Para que cumpla con la sintaxis Python, la función `action()` debe estar definida en algún lugar previo del programa. Estas funciones "callback" toman un único parámetro, un objeto que representa el evento.

Programa completo
=================
Aquí está el código con una versión minima de la calculadora. La parte más importante es la función `action(event)`.

```python
from browser import document, html

# Construction de la calculatrice
calc = html.TABLE()
calc <= html.TR(html.TH(html.DIV("0", id="result"), colspan=3) +
                html.TD("C"))
lines = ["789/", "456*", "123-", "0.=+"]

calc <= (html.TR(html.TD(x) for x in line) for line in lines)

document <= calc

result = document["result"] # acceso directo a un elemento mediante su id

def action(event):
    """Gestiona el evento "click" en un botón de la calculadora."""
    # El elemento pulsado por el usuario es el atributo "target" del
    # objeto event
    element = event.target
    # El texto mostrado en el botón es el atributo "text" del elemento
    value = element.text
    if value not in "=C":
        # actualiza la zona de resultados
        if result.text in ["0", "error"]:
            result.text = value
        else:
            result.text = result.text + value
    elif value == "C":
        # reset
        result.text = "0"
    elif value == "=":
        # ejecuta la fórmula en la zona de resultados
        try:
            result.text = eval(result.text)
        except:
            result.text = "error"

# Asocia la función action() al evento "click" en todos los botones
for button in document.select("td"):
    button.bind("click", action)
```

Resultado
=========
<iframe width="800", height="400" src="/gallery/calculator.html"></iframe>
