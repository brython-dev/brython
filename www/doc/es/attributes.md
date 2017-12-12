Atributos y métodos de los elementos
------------------------------------

Los elementos contenidos en una página tienen atributos y métodos que dependen del tipo de elemento ;
los define el W3C y se pueden encontrar en muchos sitios de internet

Debido a que sus nombres pueden variar dependiendo del navegador, Brython define atributos adicionales que funcionan en todos los casos :

<table border=1 cellpadding=3>
<tr>
<th>Nombre</th><th>Tipo</th><th>Descripción</th><th>R = read only (solo lectura)<br>R/W = read + write (lectura y escritura)</th>
</tr>

<tr>
<td>*abs_left*</td><td>entero</td><td>posición relativa con respecto al borde izquierdo de la ventana de un elemento</td><td>R</td>
</tr>

<tr>
<td>*abs_top*</td><td>integer</td><td>posición relativa con respecto al borde superior de la ventana de un elemento</td><td>R</td>
</tr>

<tr>
<td>*children*</td><td>list</td><td>el hijo del elemento en el árbol del documento</td><td>R</td>
</tr>

<tr>
<td>*class_name*</td><td>string</td><td>el nombre de la clase del elemento (atributo *class* de la etiqueta)</td><td>R/W</td>
</tr>

<tr>
<td>*clear*</td><td>método</td><td><code>`elt.clear()</code>` elimina todos los descendientes del elemento</td><td>-</td>
</tr>

<tr>
<td>*height*</td><td>entero</td><td>Altura del elemento en píxeles (2)</td><td>R/W</td>
</tr>

<tr>
<td>*html*</td><td>string</td><td>el código HTML dentro de un elemento</td><td>R/W</td>
</tr>

<tr>
<td>*inside*</td><td>método</td><td>`elt.inside(other)` comprueba si `elt` se encuentra contenido dentro del elemento `other`</td><td>-</td>
</tr>

<tr>
<td>*left*</td><td>entero</td><td>la posición del elemento relativa al borde izquierdo del primer padre posicionado (1)</td><td>R/W</td>
</tr>

<tr>
<td>*parent*</td><td>instancia `DOMNode`</td><td>el padre del elemento (`None` para `doc`)</td><td>R</td>
</tr>

<tr>
<td>*select*</td><td>método</td>
<td>`elt.select(css_selector)` : una lista con todos los elementos que
descienden de elt cuyo selector CSS coincide con `css_selector`
</td>
<td>-</td>
</tr>

<tr>
<td>*select_one*</td>
<td>método</td>
<td>`elt.select_one(css_selector)`: el elemento que
descienden de elt cuyo selector CSS coincide con `css_selector`, si no `None`</td>
<td>-</td>
</tr>

<tr>
<td>*text*</td><td>string</td><td>el texto dentro de un elemento</td><td>R/W</td>
</tr>

<tr>
<td>*top*</td><td>entero</td><td>la posición de un elemento relativa al borde superior del primer padre posicionado (1)</td><td>R/W</td>
</tr>

<tr>
<td>*width*</td><td>entero</td><td>Anchura del elemento en píxeles (2)</td><td>R/W</td>
</tr>

</table>

(1) Cuando se va hacia arriba en el árbol del DOM, paramos en el primero padre cuyo atributo
`style.position` se encuentra asignado a un valor diferente a "static". `left` y `top` se
computan como `style.left` y `style.top` pero son enteros en lugar de cadenas que acaban con
`px`.

(2) Lo mismo que `style.height` y `style.width` pero como enteros.

Para añadir un hijo a un elemento se usa el operador `<=` (piensa en ello como una flecha que indica asignación)

>    from browser import document, html
>    document['zone'] <= html.INPUT(Id="data")

La iteración sobre los hijos de un elemento se puede hacer usando la sintaxis Python habitual :

>    for child in element:
>        (...)

Para destruir un elemento se usa la palabra clave `del`

>    zone = document['zone']
>    del zone

La colección `options` asociada con un objeto SELECT tiene una interfaz que funciona como una lista Python :

- accede a una opción mediante su índice : `option = elt.options[index]`
- inserta una opción en la posición *index* : `elt.options.insert(index,option)`
- inserta una opción al final de la lista : `elt.options.append(option)`
- elimina una opción : `del elt.options[index]`

