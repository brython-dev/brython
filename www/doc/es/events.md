Eventos
=======

<script type="text/python">
from browser import document as doc
from browser import alert
</script>

Introducción
------------

Supón que tenemos un elemento del tipo botón en una página, como el siguiente : <button>un botón</button>

Si pulsas sobre el mismo no sucederá nada, debido a que no eexiste ninguna instrucción sobre como reaccionar con un click (i.e., al pulsar el botón). Para ello, la acción para definir esto se realiza mediante la siguiente sintaxis :

>    btn.bind('click', show)

El primer argumento de `bind` es el tipo de eveento que el botón deberá manejar ; El segundo argumento es una función que toma un único argumento, una instancia de la clase `DOMEvent`. Por ejemplo :

>    def show(ev):
>        print('ok !')

(recuerda que para ver llos resultados del `print` deberás tener abierta la consola del navegador)

Las instancias de `DOMEvent` poseen un número de atributos que dependen del tipo de evente. En el caso de un click y, de forma más general para eventos relacionados con el ratón, los atributos incluyen

- `target` : el elemento que despachó el evento
- `x, y` : posición del ratón en relación a la esquina superior izquierda de la ventana

Por ejemplo, para imprimir el texto del botón y la posiviónn del ratón :

>    def show(ev):
>        print(ev.target.text, ev.x, ev.y)

Interfaz
--------

Para la gestión de eventos, los elementos de una página disponen de los siguientes métodos :

<code>elt.bind(_evt\_name, handler_)</code>

> asocia la función _handler_ al evento llamado _evt\_name_

<code>elt.unbind(_evt\_name[, handler_])</code>

> elimina la asociación de la  función _handler_ al  evento llamado _evt\_name_. Si se omite _handler_, elimina todas las asociaciones para el evento

<code>elt.events(_evt\_name_)</code>

> devuelve la lista de funciones que maneja el evento llamado _evt\_name_

Objetos `DOMEvent`
------------------

(información de Mozilla Contributors, encontrada en [https://developer.mozilla.org/en-US/docs/Web/API/event](https://developer.mozilla.org/en-US/docs/Web/API/event))

Cualquiera que sea el tipo de evento, las instancias de la clase `DOMEvent` poseen llos siguientes atributos

<table border=1 cellpadding=5>

<tr>
<td>
`bubbles`
> boolean0, indica si el evento ascenderá a través del DOM o no
</td>
<td>
<button id="_bubbles">test</button>
<script type="text/python">
from browser import document, alert

document['_bubbles'].bind('click',lambda ev:alert('bubbles : %s ' %ev.bubbles))
</script>
</td>
</tr>

<tr>
<td>
`cancelable`
> booleano, indica si el evento se puede cancelar o no
</td>
<td>
<button id="_cancelable">test</button>
<script type="text/python">
from browser import document, alert

document['_cancelable'].bind('click',lambda ev:alert('cancelable : %s ' %ev.cancelable))
</script>
</td>
</tr>

<tr>
<td>
`currentTarget`
> instancia de `DOMNode` ; identifica el objetivo del evento, a medida que el evento atraviesa el DOM. Siempre  se refiere al elemento al que se ha asociado el manejador del evento en  oposición a event.target que identifica el elemento donde ocurre el evento.
</td>
<td>
<button id="_currentTarget">test</button>
<script type="text/python">
from browser import document, alert

document['_currentTarget'].bind('click',lambda ev:alert('currentTarget : %s ' %ev.currentTarget))
</script>
</td>
</tr>

<tr>
<td>
`defaultPrevented`
> booleano, indica si event.preventDefault() fue invocado por el evento o no
</td>
<td>
<button id="_defaultPrevented">test</button>
<script type="text/python">
from browser import document, alert

document['_defaultPrevented'].bind('click',lambda ev:alert('defaultPrevented : %s ' %ev.defaultPrevented))
</script>
</td>
</tr>

<tr>
<td>
`eventPhase`
> entero, indica la fase del flujo del evento([event flow](http://www.w3.org/TR/DOM-Level-3-Events/#event-flow)) que está siendo evaluada
</td>
<td>
<button id="_eventPhase">test</button>
<script type="text/python">
from browser import document, alert

document['_eventPhase'].bind('click',lambda ev:alert('eventPhase : %s ' %ev.eventPhase))
</script>
</td>
</tr>

<tr>
<td>
`target`
> Instancia `DOMNode` ; el objeto desde el que el evento fue despachado. Es diferente a `event.currentTarget` cuando el manejador del evento es invocado al ser ascendido (bubbling) o en la captura de la fase del evento
</td>
<td>
<button id="_target">test</button>
<script type="text/python">
from browser import document, alert

document['_target'].bind('click',lambda ev:alert('target : %s ' %ev.target))
</script>
</td>
</tr>

<tr>
<td>
`timeStamp`
> entero, el tiempo (en milisegundos desde el 1 de ennero de 1970 a las 0h) en el que el evento fue creado
</td>
<td>
<button id="_timeStamp">test</button>
<script type="text/python">
from browser import document, alert

document['_timeStamp'].bind('click',lambda ev:alert('timeStamp : %s ' %ev.timeStamp))
</script>
</td>
</tr>

<tr>
<td>
`type`
> cadena, contiene el tipo del evento
</td>
<td>
<button id="_type">test</button>
<script type="text/python">
from browser import document, alert

document['_type'].bind('click',lambda ev:alert('type : %s ' %ev.type))
</script>
</td>
</tr>

</table>

y los siguientes métodos

`preventDefault()`
> previene de ls ejecución de la acción por defecto asociada al evento

> **Ejemplo**

> Cuando una checkbox se pulsa, la acción por defecto será mostrar u ocultar una marca dentro del checkbox : 

>> checkbox (comportamiento por defecto) <input type="checkbox">

> Para deshabilitar este comportamiento en el checkbox : 

<blockquote>
<div id="disable_cbox">
    from browser import document
    
    def _cancel(ev):
        ev.preventDefault()
    
    document["disabled_cbox"].bind('click',_cancel)
</div>
</blockquote>

>> resultado :

>> checkbox deshabilitado <input type="checkbox" id="disabled_cbox">

<script type="text/python">
from browser import document
exec(document["disable_cbox"].text)
</script>

`stopPropagation()`
> previene la propagación del evento

> **Ejemplo**

> En la zona coloreada de más abajo

<div id="yellow" style="background-color:yellow;width:200px;padding:20px;margin-left:100px;">outer<p>
<div id="blue" style="background-color:blue;color:white;padding:20px;">inner, normal propagation</div>
<div id="green" style="background-color:green;color:white;padding:20px;">inner, propagation stopped</div>
</div>

> los 3 elementos (el frame amarillo exterior y los frames interiores azul y verde) manejan el evento 'click'

<blockquote>
<div id="zzz_source">
    from browser import document, alert
    
    def show(ev):
        alert('click on %s' %ev.currentTarget.id)
    
    def show_stop(ev):
        alert('clic on %s' %ev.currentTarget.id)
        ev.stopPropagation()
    
    document["yellow"].bind('click',show)
    document["blue"].bind('click',show)
    document["green"].bind('click',show_stop)
</div>
</blockquote>

<div id="zzz"></div>

> Pulsando en la zona amarilla provoca la llamada a la función `show()`, la cual muestra el mensaje "click on yellow"

> Pulsando en la zona azul provoca el mensaje "click on blue". A posteriori el evento se propaga al padre, el frame amarillo. SDebido a que este frame tambien maneja el evento "click", el navegador llama a la acción asociada, la misma función `show()`, y muestra el mensaje "click on yellow" (fíjate que el atributo `currentTarget` se actualiza cuando el evento se propaga)

> Pulsando sobre  la zona verde provoca que se muestre el mensaje "click on green". Este evento está manejado por la función `show_stop()`, la cual finaliza en

>>    ev.stopPropagation()

> De esta forma el evento no se propaga a un nivel superior y la ejecución termina sin un mensaje de alerta "click on yellow"


<script type="text/python">
from browser import document

eval(document["zzz_source"].text)
</script>


Creando y ejecutando un evento
------------------------------

`DOMEvent(`_evt\_name_`)` 
> Crea un evento del tipo _evt\_name_ como si fuera cualquier otro tipo de evento, e.g. _keydown, mousemove_, etc.

`element.dispatchEvent(`event`)`
> Ejecuta el evento en el `elemento` especificado

