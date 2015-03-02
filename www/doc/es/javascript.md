módulo **javascript**
---------------------

El módulo **javascript** permite la interacción con objetos definidos en otros programas o librerías escritos en javascript presentes en la misma página donde se encuentra el script Brython

Define dos clases :

**javascript**.`JSObject`
>  es una clase cuyas instancias envuelven a los objetos Javascript

> _**Warning : **_ Normalmente, esta clase no se usa directamente. Cuando se obtiene una referencia a un objeto Javascript con `window.js_obj` devuelve una instancia de `JSObject`

> <code>JSObject(_jsobj_)</code> devuelve un objeto *brobj* que envuelve al objeto Javascript *jsobj*. Las operaciones realizadas sobre la instancia `JSObject` impactan en el objeto Javascript convirtiendo de la forma más precisa los tipos Python en tipos Javascript

> Si *jsobj* es una función, los argumentos que se pasen a *brobj* serán convertidos antes de ser pasados a *jsobj* de la siguiente forma

<blockquote>
<table border='1' cellpadding=3>
<tr><th>Argumento en la llamada de la función Brython</th><th>Argumento que se pasa a la función Javascript</th></tr>
<tr><td>instancia `DOMNode`</td><td>elemento del DOM</td></tr>
<tr><td>instancia `DOMEvent`</td><td>evento DOM</td></tr>
<tr><td>lista de instancias `DOMNode`</td><td>lista de nodos DOM</td></tr>
<tr><td>`None, True, False`</td><td>`null, true, false`</td></tr>
<tr><td>instancia `int`</td><td>integer</td></tr>
<tr><td>instancia `float`</td><td>float</td></tr>
<tr><td>instancia `str`</td><td>string</td></tr>
<tr><td>instancia `list`</td><td>array Javascript</td></tr>
<tr><td>instancia `JSObject`</td><td>objeto Javascript</td></tr>
</table>
</blockquote>

> El resultado se convierte en un objeto Brython usando operaciones inversas.

**javascript**.`JSConstructor`
> es una clase cuyas instancias representan constructores Javascript, (ie funciones usadas con la palabra clave en Javascript `new`)

> <code>JSConstructor(_jsconstr_)</code> devuelve un objeto Brython. Este objeto permite llamadas; devuelve una instancia de `JSObject` representando el Javascript obtenido al pasar los argumentos, convertidos como se detalla en la tabla anterior, al constructor *jsconstr* 

Ejemplo
-------

Usando `JSConstructor` con la librería javascript three.js:

>    from javascript import JSConstructor
>    
>    cameraC = JSConstructor( THREE.PerspectiveCamera )
>    camera = cameraC( 75, 1, 1, 10000 )

> Ver [three](../../gallery/three.html) para ver el ejemplo en acción
