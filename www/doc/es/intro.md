Cita de la [especificación del Document Object Model del W3C](http://www.w3.org/DOM/) :

> _¿Qué es el Document Object Model?_

> _El Document Object Model es una interfaz independiente del **lenguaje** y_
> _de la plataforma que permite a los programas y scripts acceder dinámicamente_
> _y modificar el contenido, estructura y estilo del documento_

El objetivo de Brython es reemplazar Javascript con Python como lenguaje de
scripting en los navegadores.

Un ejemplo simple :

<table>
<tr>
<td>
```xml
<html>
<head>
<script src="/brython.js"></script>
</head>
<body onload="brython()">
<script type="text/python">
from browser import document, alert

def echo(ev):
    alert(document["zone"].value)

document["mybutton"].bind("click", echo)
</script>
<input id="zone">
<button id="mybutton">click !</button>
</body>
</html>
```
</td>
<td style="padding-left:20px">

Intenta:

<script type="text/python">
from browser import document, alert

def echo(ev):
    alert(document["zone"].value)

document["mybutton"].bind("click", echo)
</script>

<input id="zone" autocomplete="off">
<button id="mybutton">click !</button>

</td>
</tr>
</table>

Para que el script Python se pueda procesar es necesario incluir
__brython.js__ y ejecutar la función `brython()` al cargarse la página
(usando el atributo _onload_ de la etiqueta `<BODY>`). Mientras nos
encontremos en la fase de desarrollo, es posible pasar un argumento a la
función _brython()_ : 1 para que los mensajes de error se muestren en la
consola del navegador, 2 para, además, mostrar el código Javascript junto
con el error.

Si el programa Python es extenso, otra opción sería escribirlo en un fichero
separado y cargarlo usando el atributo _src_ de la etiqueta _script_ :

```xml
<html>

<head>
<script src="/brython.js"></script>
</head>

<body onload="brython()">
<script type="text/python" src="test.py"></script>
<input id="zone">
<button id="mybutton">click!</button>
</body>

</html>
```

Hay que resaltar que, en este caso, el script Python será cargado mediante
una llamada Ajax : deberá, por tanto, estar localizado en el mismo dominio
que la página HTML.

En los dos ejemplos de código anteriores, cuando pulsamos el botón del ratón,
el evento onclick llama y ejecuta la función `echo()`, definida en el script
Python. Esta función obtiene el valor mediante el elemento INPUT, a través de
su id (_zone_). Esto se consigue mediante la sintaxis `document["zone"]` :
`document` definido en el módulo **browser**, es un objeto que representa el
documento que se muestra en el navegador. Se comporta como un diccionario
cuyas claves son los ids de los elementos del DOM. Por tanto, en nuestro
ejemplo, `document["zone"]` es un objeto que 'mapea' el elemento INPUT ; la
propiedad _value_ contiene el valor del objeto.

En Brython, el 'output' se puede obtener de varias formas, incluyendo la
función integrada `alert()` (también definida en el módulo **browser**) que
muestra una ventana ('popup window') con el texto que hemos pasado como
argumento.
