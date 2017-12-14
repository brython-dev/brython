Usando objetos Javascript
-------------------------

Tenemos que manejar el periodo de transición en el que Brython va a coexistir
con Javascript ;-)

### Accessing Brython objects from Javascript

Por defecto, Brython solo expone dos nombres en el espacio de nombres global
de Javascript :

> `brython()` : la función que se ejecuta al cargarse la página

> `__BRYTHON__` : un objeto usado internamente por Brython para almacenar los
> objetos necesarios para ejecutar los scripts

Por tanto, por defecto, un programa Javascript no podría acceder a los objetos
Brython.
Por ejemplo, para que la función `echo()` definida en un script Brython
reaccione a un evento en un elemento de la página, en lugar de usar la sintaxis
javascript:

```xml
<button onclick="echo()">
```

(debido a que la función _echo_ no es accesible directamente desde
Javascript), la solución sería definir un atributo id al elemento:

```xml
<button id="mybutton">
```
y definir un enlace entre este elemento y el evento _click_ mediante :

```python
from browser import document
document['mybutton'].bind('click',echo)
```

Otra opción sería forzar la instroducción de la función _echo_ en el espacio
de nombres de Javascript, definiéndola como un atributo del objeto `window`
presente en el módulo **browser** :

```python
from browser import window
window.echo = echo
```

<strong>NOTA: No se recomienda usar este segundo método ya que introduce un
riesgo de conflicto con nombres ya definidos por otros programas o librerías
Javascript usadas en la página.
</strong>

### Objetos en programas Javascript

Un documento HTML puede usar librerías o scripts Javascript, además de
librerías y scripts Python.

Los nombres añadidos al espacio global de nombres de javascript mediante
scripts Javascript se encuentran disponibles para los scripts Brython como
atributos del objeto `window` definido en el módulo **browser**

Por ejemplo :

```xml
<script type="text/javascript">
circle = {surface:function(r){return 3.14*r*r}}
</script>

<script type="text/python">
from browser import document, window

document['result'].value = window.circle.surface(10)
</script>
```

Los objetos Javascript se convierten a su equivalente en Python mediante de la
siguiente forma:

<table border='1' cellpadding=3>

<tr><th>Objeto Javascript (js\_obj)</th><th>Objeto Python (window.js\_obj)</th>
</tr>
<tr><td>Elemento DOM</td><td>instancia de `DOMNode`</td></tr>
<tr><td>Evento DOM</td><td>instancia de `DOMEvent`</td></tr>
<tr><td>Colección de elementos DOM</td><td>lista de instancias de `DOMNode`</td>
</tr>
<tr><td>`null, true, false`</td><td>`None, True, False`</td></tr>
<tr><td>Integer</td><td>instancia de `int`</td></tr>
<tr><td>Float</td><td>instancia de `float`</td></tr>
<tr><td>String</td><td>instancia de `str`</td></tr>
<tr><td>Array</td><td>instancia de `list`</td></tr>
</table>

Los otros objetos Javascript se convierten a una instancia de la clase
`JSObject` definida en el módulo **javascript**. Se pueden convertir a un
diccionario Python mediante:

```python
py_obj = window.js_obj.to_dict()
```

Si el objeto Javascript es una función, los argumentos que se le pasan a la
función Python se convierten a objetos Javascripts, usando la tabla anterior
de forma opuesta

Hay que tener cuidado, una función Javascript no se puede llamar con *kwargs*, esto
lanzará una excepción `TypeError` : si la función está definida por

```python
function foo(x, y)
```

y se la llama desde un script Brython mediante

```python
window.foo(y=0, x=1)
```

pasando los argumentos en el orden incorrecto no sería posible, ya que
el script Brython no conoce como ha sifo definida la función Javascript.

### Usando constructores Javascript

Si una función Javascript es un objeto constructor, puede ser llamado en
código Javascript mediante la palabra clave `new`, se podría llamar en Brython
usando el método especial `new` añadida por Brython al objeto Javascript.

Por ejemplo :

```xml
<script type="text/javascript">
function Rectangle(x0,y0,x1,y1){
    this.x0 = x0
    this.y0 = y0
    this.x1 = x1
    this.y1 = y1
    this.surface = function(){return (x1-x0)*(y1-y0)}
}
</script>

<script type="text/python">
from browser import alert, window

rectangle = window.Rectangle
alert(rectangle.new(10,10,30,30).surface())
</script>
```

### jQuery example

En la siguiente porción de código tenemos un ejemplo más completo de cómo
podrías usar la popular librería jQuery :

```xml
<html>
<head>
<script src="//ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js">
</script>
<script src="/src/brython.js"></script>
</head>

<script type="text/python">
from browser import window

jq = window.jQuery

# Ajax call
def onSuccess(data, status, req):
    print(data)
    print(status)

jq.ajax('/cgi-bin/post_test.py',
    {'data':
        {'foo': 56},
     'success': onSuccess
    }
)

# add an option to a SELECT box
jq('#sel').append('<option>three')

# access element attributes
assert jq('#c').attr('id') == 'c'

# define a callback for a click on a button
def callback(ev):
    print(jq(ev.target).text())

jq('#btn').on('click', callback)

# we can even use "each" to iterate on SPAN elements
def show(i, obj):
    print(i, obj)

jq.each(jq('span'), show)
</script>

<body onload="brython(1)">

<select id="sel">
  <option value="one">one
  <option value="two">two
</select>

<span id="c"></span>

<button id="btn">click</button>

</body>
</html>
```

### Otros ejemplos

Puedes encontrar otros ejemplos en la [galería](../../gallery/gallery_en.html)
para ver como usar librerías Javascript (Three, Highcharts, Raphael) en
scripts Brython.
