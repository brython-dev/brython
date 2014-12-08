Atributos y métodos de los elementos
------------------------------------

Los elementos contenidos en una página tienen atributos y métodos que dependen del tipo de elemento ; se pueden encontrar en muchos sitios de internet

Debido a que sus nombres pueden variar dependiendo del navegador, Brython define atributos adicionales que funcionan en todos los casos :

<table border=1 cellpadding=3>
<tr>
<th>Nombre</th><th>Tipo</th><th>Descripción</th><th>R = read only (solo lectura)<br>R/W = read + write (lectura y escritura)</th>
</tr>
<tr>
<td>*text*</td><td>string</td><td>el texto dentro de un elemento</td><td>R/W</td>
</tr>
<tr>
<td>*html*</td><td>string</td><td>el código HTML dentro de un elemento</td><td>R/W</td>
</tr>
<tr>
<td>*left, top*</td><td>integers</td><td>la posición de un elemento relativa al borde superior izquierdo de la página</td><td>R</td>
</tr>
<tr>
<td>*children*</td><td>list</td><td>el hijo del elemento en el árbol del documento</td><td>R</td>
</tr>
<tr>
<td>*parent*</td><td>instancia `DOMNode`</td><td>el padre del elemento (`None` para `doc`)</td><td>R</td>
</tr>
<tr>
<td>*class_name*</td><td>string</td><td>el nombre de la clase del elemento (atributo *class* de la etiqueta)</td><td>R/W</td>
</tr>
<tr>
<td>*remove*</td><td>función</td><td><code>remove(_child_)</code> elimina *child* de la lista de elementos hijon</td><td>R</td>
</tr>
</table>

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

