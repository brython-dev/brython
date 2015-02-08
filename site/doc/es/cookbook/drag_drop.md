Problema
--------
Arrastrar y colocar (drag and drop) un elemento en una página web


Solución
--------

Brython implementa una API basada en la especificación 'drag and drop' HTML5. 
En la forma básica en que se presenta en el siguiente ejemplo consiste en 
definir funciones de llamada para 3 eventos :

- _dragstart_ sobre el elemento arrastrable (cuando el usuario comienza a 
  arrastrarlo)
- _dragover_ sobre la zona de destino (cuando el elemento arrastrable se mueve 
  a la zona de destino)
- _drop_ sobre la zona de destino (cuando el usuario deja de apretar el botón 
  del ratón)

Para añadir la función _callback_ a un _event_ en un _element_, usamos el 
método _element_<code>.bind(_event,callback_)</code>

Las funciones de respuesta (callbacks) toman un único elemento, una instancia 
de `DOMEvent`. Para comunicar la información durante la operación de arrastrar 
y soltar, el evento posee un atributo _data_ que recibe un valor en la 
respuesta asociada a _dragstart_ ; este valor será usado en la respuesta 
asociada con _drop_ para identificar el elemento que está siendo soltado

En el ejemplo, cuando el objeto arrastrable ha sido soltado, ya no se puede 
volver a arrastrar ; para ello, eliminamos los 'bindings' añadidos al _event_ 
sobre este objeto usando el método _element_<code>.unbind(_event_)</code>

<div style="width:400px;height:150px;background-color:yellow" id="panel">
<div id="dest" style="position:absolute;width:180px;height:80px;background-color:green;color:white;">Zona de destino</div>
<div id="source" style="position:absolute;width:80px;height:40px;background-color:red;">Objeto arrastrable</div>
</div>

```exec_on_load
from browser import document

panel = document["panel"] # yellow zone

source = document["source"] # red zone
# localizado en (10,10) desde la esquina superior izquierda del panel
source.style.top = "%spx" %(10+panel.top)
source.style.left = "%spx" %(10+panel.left)
# hacer roja a la zona arrastrable
source.draggable = True

dest = document["dest"] # green zone
# localizado en (10,150) desde la esquina superior izquierda del panel
dest.style.top = "%spx" %(10+panel.top)
dest.style.left = "%spx" %(150+panel.left)

# Cuando el ratón se encuentra sobre el elemento arrastrable, cambiar el cursor
def mouse_over(ev):
    print('Ratón sobre el elemento ! ')
    ev.target.style.cursor = "pointer"

# offset del ratón en relación con el objeto arrastrable cuando comienza el arrastrado
m0 = [None,None]

# función a llamar cuando el usuario inicia el arrastrado del objeto
def drag_start(ev):
    global m0
    # calcular el offset del ratón
    # ev.x y ev.y son las coordenadas del ratón cuando el evento se dispara
    # ev.target es el elemento arrastrado. Sus atributos "left" y "top" son
    # enteros, la distancia desde los bordes izquierdo y superior en el documento
    m0 = [ev.x-ev.target.left,ev.y-ev.target.top]
    # asociar datos al proceso de arrastrado
    ev.dataTransfer.setData('text',ev.target.id)
    # permitir al elemento arrastrable que sea movido
    ev.dataTransfer.effectAllowed = 'move'

# función a llamar cuando el elemento arrastrable llega sobre la zona de destino
def drag_over(ev):
    ev.dataTransfer.dropEffect = 'move'
    # aquí hemos de prevenir el comportamiento por defecto para este tipo de evento
    ev.preventDefault()

# función asociada a la zona de destino
# describe que sucede cuando se suelta el objeto, ie cuando se suelta el botón del ratón
# mientras el objeto se encuentra sobre la zona    
def drop(ev):
    # obtiene los datos almacenados en drag_start (la id del elemento arrastrable)
    src_id = ev.dataTransfer.getData('text')
    elt = document[src_id]
    # establece las nuevas coordenadas del objeto arrastrado
    elt.style.left = "%spx" %(ev.x-m0[0])
    elt.style.top = "%spx" %(ev.y-m0[1])
    # no arrastrar el objeto una vez soltado
    elt.draggable = False
    # eliminar la función de respuesta
    elt.unbind('mouseover')
    elt.style.cursor = "auto"
    ev.preventDefault()

# asocia eventos a los elementos arrastrables    
source.bind('mouseover',mouse_over)
source.bind('dragstart',drag_start)

# asocia elementos a la zona de destino
dest.bind('dragover',drag_over)
dest.bind('drop',drop)
```
