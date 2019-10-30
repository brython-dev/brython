Atributos y métodos de los elementos
------------------------------------

### Atributos DOM y propiedades

El DOM define dos conceptos diferentes para los elementos:

- _attributes_, los cuales se definen en la etiqueta HTML (o SVG): por ejemplo,
  `<img src="icon.png">` define el atributo `src` del elemento creado mediante
  la etiqueta `<img>`
- _properties_, las cuales pueden ser añadidas a un elemento mediante la sintaxis 
  de puntos: mediante `element.property_name = value`, leído como`value = element.property_name`

El DOM también define una relación entre _algunos_ atributos y _algunas_
propiedades:

- de forma general, para los atributos esperados para una etiqueta dada
  (e.g. "id" o "class" para cualquier tipo de etiqueta, "src"  para las etiquetas
  IMG, "href" para las etiquetas A, etc), cuando se define el atributo, la
  propiedad también se definirá 
- la mayoría de las veces el nombre de la propiedad es el mismo que el del 
  atributo pero hay excepciones: la propiedad para el atributo"class" es 
  "className"
- generalmente, el valor de la propiedades el mismo que el valor del atributo, 
  pero no siempre: por ejemplo, para un elemento definido mediante
  `<INPUT type="checkbox" checked="checked">`, el valor del _atributo_
  "checked" es el *string* "checked" y el valor de la _propiedad_ "checked" es
  el booleano `true`

Aparte de los atributos definidos por la especificación para una etiqueta
determinada se pueden definir atributos (los motores de plantillas usan esto
de forma generalizada); para estos atributos la propiedad del mismo nombre
no se define. Para un elemento también podemos definir propiedades y,
de la misma forma que antes, esto no define el nombre para el atributo.

Los valores de los atributos son siempre *strings* mientras que valores de las 
propiedades pueden ser de cualquier tipo.

Los atributos son case-insensitive para elementos HTML y case-sensitive para
elementos SVG; las propiedades son siempre case-sensitive.

### Gestión de atributos y propiedades en Brython

Brython gestiona los atributos del DOM mediante el atributo `attrs` de las instancias
`DOMNode`; maneja las propiedades usando *dotted syntax*.

`element.attrs` es un objeto que funciona como un diccionario.

```python
# define un valor para un atributo
element.attrs[name] = value

# obtener un valor de un atributo
value = element.attrs[name] # lanza KeyError si el elemento no tiene el 
                            # atributo "name"
value = element.attrs.get(name, default)

# comprueba si un atributo se encuentra presente
if name in element.attrs:
    ...

# elimina un atributo
del element.attrs[name]

# itera sobre los atributos de un elemento
for name in element.attrs:
    ...

for attr in element.attrs.keys():
    ...

for value in element.attrs.values():
    ...

for attr, value in element.attrs.items():
    ...
```

### Métodos y propiedades específicas de Brython

Por conveniencia, Brython define unos pocos métodos y propiedades adicionales:

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
<td>*bind*</td><td>método</td><td>añadido de eventos, ver la sección [events](events.html)</td><td>-</td>
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
<td>*closest*</td>
<td>método</td>
<td><code>elt.closest(tag_name)</code> devuelve el primer elemento padre de
`elt` con el nombre de etiqueta especificado. Lanzará un `KeyError` si no se 
encuentra un elemento.</td>
<td>-</td>
</tr>

<tr>
<td>*get*</td><td>método</td><td>selecciona elementos(cf <a href="access.html">acceso a elementos</a>)</td><td>-</td>
</tr>

<tr>
<td>*height*</td><td>entero</td><td>Altura del elemento en píxeles (2)</td><td>R/W</td>
</tr>

<tr>
<td>*html*</td><td>string</td><td>el código HTML dentro de un elemento</td><td>R/W</td>
</tr>

<tr>
<td>*index*</td>
<td>método</td>
<td>`elt.index([selector])` devuelve el índice (un entero) del elemento entre
los hijos de su padre. Si se especifica _selector_ , solamente los elementos
que contengan el selector CSS serán tenidos en cuenta ; en este caso, si no
se encuentran devolverá -1.
</td><td>-</td>
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

```python
from browser import document, html
document['zone'] <= html.INPUT(Id="data")
```

La iteración sobre los hijos de un elemento se puede hacer usando la sintaxis Python habitual :
```python
for child in element:
    ...
```
Para destruir un elemento se usa la palabra clave `del`

```python
del document['zone']
```

La colección `options` asociada con un objeto SELECT tiene una interfaz que funciona como una lista Python :

- accede a una opción mediante su índice : `option = elt.options[index]`
- inserta una opción en la posición *index* : `elt.options.insert(index,option)`
- inserta una opción al final de la lista : `elt.options.append(option)`
- elimina una opción : `del elt.options[index]`

