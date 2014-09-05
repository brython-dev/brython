Eventos de arrastre (Drag)
==========================

<script type="text/python">
from browser import document as doc
from browser import alert
</script>

Los eventos de arrastre son

<table cellpadding=3 border=1>
<tr>
<td>*drag*</td>
<td>un elemento o una selección de texto se está arrastrando
</td>
</tr>

<tr>
<td>*dragend*</td><td>una operación de arrastre se termina (liberando el botón del ratón o pulsando la tecla de escape)</td>
</tr>

<tr>
<td>*dragenter*</td><td>un elemento arrastrado o una selección de texto entra dentro de un objetivo válido donde soltar (drop)</td>
</tr>

<tr>
<td>*dragleave*</td><td>un elemento o selección de texto arrastrado abandona un objetivo válido donde soltar (drop)</td>
</tr>

<tr>
<td>*dragover*</td><td>aun elemento o selección de texto está siendo arrastrado sobre un objetivo válido donde soltar (drop)</td>
</tr>

<tr>
<td>*dragstart*</td><td>el usuario inicia el arrastre de un elemento o una selección de texto</td>
</tr>

<tr>
<td>*drop*</td><td>un elemento se suelta en un un objetivo válido donde soltar (drop)</td>
</tr>

</table>

Atributo del objeto `DOMEvent`
------------------------------

`dataTransfer`
> un "data store" usado para almacenar infurmación durante el proceso de arrastrar y soltar (drag and drop)

Atributos y métodos del data store
---------------------------------

El "data store" posee los siguientes atributos y métodos :

`dropEffect`

> una cadena que representa el fecto que se usará, y deberá ser siempre uno de los valores posibles de `effectAllowed`.

> para los eventos *dragenter* y *dragover*, el `dropEffect` se inicializará basándose en la acción que esté solicitando el usuario. Como se determine esto depende de la plataforma, pero el usuario, normalmente, puede pulsar teclas de modificación que ajusten la acción que se desea. Dentro del manejador de un evento para los eventos *dragenter* y *dragover*, el `dropEffect` debería ser modificado si la acción solicitada por el usuario no es la deseada.

> Para los eventos *dragstart*, *drag*, y *dragleave*, el `dropEffect` se inicializa como "none". Cualquier valor asignado al `dropEffect` no será usado para nada.

> Para los eventos *drop* y *dragend*, el `dropEffect` será inicializado a la acción deseada, que será el valor que el `dropEffect` tendrá después del último evento *dragenter* o *dragover*.

> Valores posibles:

> -    "copy" : se hará una copia del item fuente en la nueva localización.
> -    "move" : un item se moverá a la nueva localización.
> -    "link" : se establece un enlace a la fuente en la nueva localización.
> -    "none" : el item no podrá soltarse.

> Asignar cualquier otro valor no tendrá efecto y permanecerá el valor antiguo.


`effectAllowed`

> Una cadena que especifica los efectos permitidos para este arrastre. Puedes establecer esto en el evento *dragstart* para seleccionar el efecto deseado para la fuente, y dentro de los eventos *dragenter* y *dragover* para seleccionar los efectos deseados para el objetivo. El valor no se usa para otros eventos.

> Valores posibles:

> - "copy" : se hará una copia del item fuente en la nueva localización.
> - "move" : un item se moverá a la nueva localización.
> - "link" : se establece un enlace a la fuente en la nueva localización.
> - "copyLink" : se permite una operación de copia o enlace.
> - "copyMove" : se permite una operación de copia o movimiento.
> - "linkMove" : se permite una operación de movimiento o enlace.
> - "all" : se permten todas las operaciones.
> - "none" : el item no se podrá soltar.
> - "uninitialized" : el valor defecto cuando no se ha establecido el efecto, equivalente a "all".

> Asignar cualquier otro valor no tendrá efecto y permanecerá el valor antiguo.

`ficheros`

> Contiene una lista de todos los ficheros locales disponibles en la transferencia de datos. Si la operación de arrastre no implica arrastrar ficheros, esta propiedad será una lista vacia. Un índice de acceso inválido a la lista de ficheros especificados por esta propiedad devolverá `None`.

<code>getData(_type_)</code>

> Recupera los datos para un tipo dado o una cadena vacia si los datos para ese tipo no existen o la tranferencia de datos no contiene información

<code>setData(_type_, _value_)</code>

> Establece los datos para un tipo dado. Si los datos para el tipo no existen se añadirán al final, de manera que el último item de la lista de tipos será del nuevo formato. Si los datos para el tipo ya existen serán reemplazados en la misma posición. Esto es, el orden de la lista de tipos no se cambia cuando se reemplazan datos del mismo tipo.


`tipos`

> Almacena una lista de los tipos de formato de los datos que se encuentran almacenados para el primer item, en el miso orden en que los datos fueron añadidos. Si no se añadieron datos se obtendrá una lista vacía.


#### Ejemplo

Ver la receta 'drag and drop' en el menú del recetario ('cookbook')
