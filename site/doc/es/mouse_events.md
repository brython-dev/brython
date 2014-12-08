Eventos del ratón
============

<script type="text/python">
from browser import doc, alert
</script>

Los eventos relacionados con el ratón (mover o pulsar un  botón) son

<table cellpadding=3 border=1>
<tr>
<td>*mouseenter*</td>
<td>cuando el puntero se mueve sobre un elemento que tiene la función anexada que espera a que suceda el evento</td>
</tr>
<tr><td>*mouseleave*</td><td>cuando el puntero se mueve fuera de un elemento que tiene la función anexada que espera a que suceda el evento</td></tr>

<tr><td>*mouseover*</td><td>cuando el puntero se mueve sobre un elemento que tiene la función anexada que espera a que suceda el evento o sobre uno de sus elementos hijos</td></tr>
<tr><td>*mouseout*</td><td>cuando el puntero se mueve fuera de un elemento que tiene la función anexada que espera a que suceda el evento o cuando sale de alguno de sus elementos hijos</td></tr>

<tr><td>*mousemove*</td><td>cuando el puntero se mueve en un elemento que tiene la función anexada que espera a que suceda el evento</td></tr>

<tr><td>*mousedown*</td><td>cuando se pulsa un botón (normalmente del ratón) sobre un elemento que tiene la función anexada que espera a que suceda el evento</td></tr>
<tr><td>*mouseup*</td><td>cuando se libera un botón (normalmente del ratón) sobre un elemento que tiene la función anexada que espera a que suceda el evento</td></tr>

<tr><td>*click*</td><td>cuando se pulsa y libera un botón (normalmente del ratón) sobre un elemento que tiene la función anexada que espera a que suceda el evento</td></tr>
<tr><td>*dblclick*</td><td>cuando se pulsa y libera un botón dos veces (normalmente del ratón) sobre un elemento que tiene la función anexada que espera a que suceda el evento</td></tr>

</table>

Ejemplos
--------

*mouseenter* y *mouseleave*

> estos eventos ocurrirán cuando el puntero del ratónentran o abandonan un elemento. Si un elemento incluye a otros, el evento ocurrirá cada vez que el ratón entre o salga de un elemento hijo

<table>
<tr>
<td>
<div id="yellow1" style="background-color:yellow;width:200px;padding:20px;margin-left:100px;">outer<p>
<div id="blue1" style="background-color:blue;color:white;padding:20px;">inner</div>
</td>
<td><div id="trace1">&nbsp;</div></td>
</tr>
<tr>
<td colspan=2>
<blockquote>
<div id="enter_leave">
    from browser import document
    
    def _mouseenter(ev):
        document["trace1"].text = 'entering %s' %ev.currentTarget.id
    
    def _mouseleave(ev):
        document["trace1"].text = 'leaving %s' %ev.currentTarget.id
    
    document["yellow1"].bind('mouseenter',_mouseenter)
    document["yellow1"].bind('mouseleave',_mouseleave)
    document["blue1"].bind('mouseenter',_mouseenter)
    document["blue1"].bind('mouseleave',_mouseleave)
</div>
</blockquote>
</td>
</tr>
</table>

<script type="text/python">
from browser import document

exec(document["enter_leave"].text)
</script>

*mouseover* y *mouseout*

> la diferencia con *mouseenter* y *mouseleave* es que, una vez que el puntero entrado o salido de un elemento, el evento  no se propagará a los elementos hijo

<table>
<tr>
<td>
<div id="yellow2" style="background-color:yellow;width:200px;padding:20px;margin-left:100px;">outer<p>
<div id="blue2" style="background-color:blue;color:white;padding:20px;">inner</div>
</td>
<td>
<div id="trace2">&nbsp;</div>
</td>
</tr>
<tr>
<td colspan=2>
<blockquote>
<div id="over_out">
    from browser import document
    
    def _mouseover(ev):
        document["trace2"].text = 'entering %s' %ev.currentTarget.id
    
    def _mouseout(ev):
        document["trace2"].text = 'leaving %s' %ev.currentTarget.id
    
    document["yellow2"].bind('mouseover',_mouseover)
    document["yellow2"].bind('mouseout',_mouseout)
    document["blue2"].bind('mouseover',_mouseover)
    document["blue2"].bind('mouseout',_mouseout)

</div>
</blockquote>
</td>
</tr>
</table>

<script type="text/python">
from browser import document

exec(doc["over_out"].text)
</script>

*mousemove*

<table>
<tr><td>
<div id="green" style="padding:5px;background-color:#8F8;width:150px;">mueve el ratón</div>
</td>
<td><div id="trace3">&nbsp;</div></td>
</tr>
<tr>
<td colspan=2>
<blockquote>
<div id="move">
    from browser import document
    
    def _mousemove(ev):
        document["trace3"].text = 'coordinates : %s, %s' %(ev.x,ev.y)
    
    document["green"].bind('mousemove',_mousemove)
</div>
</blockquote>
</td>
</tr>
</table>

<script type="text/python">
from browser import document

exec(document["move"].text)
</script>

Atributos de la instancia `DOMEvent`
------------------------------------

Para eventos de ratón, la instancia de `DOMEvent` posee los siguientes atributos

<table cellpadding=3 border=1>
<tr><td>*button*</td><td>indica cual fue el botón pulsado que desencadenó el evento</td></tr>
<tr><td>*buttons*</td><td>indica cuales fueron los botones pulsados que han desencadenado el evento.

Cada botón que puede sser pulsado se representa mediante un número (1  : botón izquierdo, 2  : botón derecho, 4  : rueda del ratón). Si se aprieta más de un botón, el valor de los botones se combina para obtener un nuevo número. Por ejemplo, si se pulsa el botón derecho (2) y el botón rueda (4) el valor será igual a 2|4, que es 6</td></tr>

<tr><td>*x*</td><td>posición del ratón (en píxeles) en relación a la esquina superior izquierda de la ventana</td></tr>
<tr><td>*y*</td><td>posición del ratón (en píxeles) en relación a la esquina superior izquierda de la ventana</td></tr>

<tr><td>*clientX*</td><td>la coordenada X del puntero del ratón en las coordenadas locales (DOM content)</td></tr>
<tr><td>*clientY*</td><td>la coordenada Y del puntero del ratón en las coordenadas locales (DOM content)</td></tr>

<tr><td>*screenX*</td><td>la coordenada X del puntero del ratón en las coordenadas globales (pantalla)</td></tr>
<tr><td>*screenY*</td><td>la coordenada Y del puntero del ratón en las coordenadas globales (pantalla)</td></tr>

</table>

