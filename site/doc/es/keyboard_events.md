Eventos de teclado
=================

<script type="text/python">
from browser import document, alert
</script>

Los eventos del teclado son

<table cellpadding=3 border=1>
<tr>
<td>*input*</td>
<td>se desencadena cuando el valor de un elemento &lt;input&gt; o una &lt;textarea&gt; se modifica, o cuando el contenido de un elemento `contenteditable` se modifica
</td>
</tr>

<tr>
<td>*keydown*</td><td>cuando se pulsa una tecla del teclado</td>
</tr>

<tr><td>*keypress*</td><td>cuando se pulsa una tecla del teclado y esa tecla produce un 'caracter'. Por ejemplo, cuando pulsamos Ctrl+C, el evento *keypress* solo se dispara cuando la tecla C se pulsa, mientras que *keydown* se dispara inmediatamente al pulsar la tecla Ctrl</td></tr>

<tr><td>*keyup*</td><td>la tecla se deja de pulsar</td></tr>

</table>

atributos del objeto `DOMEvent`
-------------------------------

Para los eventos del teclado, la instancia `DOMEvent` posee los siguientes atributos

<table border=1 cellpadding=5>

<tr>
<td>
`altKey`
> `True` si la tecla Alt (o Option, en Mac) cuando el evento del teclado es generado

> Este atributo no aplica para el evento *input*

> Normalmente se usa con *keypress*, para poder comprobar si Alt+&lt;key&gt; fue introducido o solo &lt;key&gt;
</td>
<td>
#### Ejemplo

Introduce texto en el campo de más abajo pulsando y sin pulsar la tecla Alt
<p><input id="altKey" value=""></input>&nbsp;<span id="traceAltKey">&nbsp;</span>

#### Código

<div id="codeAltKey">
    from browser import document
    
    def altKey(ev):
        document["traceAltKey"].text = 'altKey : %s ' %ev.altKey
        
    # the entry field has the id "altKey"
    document['altKey'].bind('keypress', altKey)
</div>
</td>
</tr>

<td>
`charCode`
> El número de referencia Unicode de la tecla

> Este atributo solo se usa en el evento *keypress*

> El valor será diferente si la tecla Shift está pulsada o no
</td>
<td>
#### Ejemplo

Introduce texto en el campo de más abajo. Date cuenta que el carácter se puede leer mediante `ch(ev.charCode)`

<input id="charCode" value=""></input>&nbsp;<span id="traceCharCode">&nbsp;</span>

#### Código

<div id="codeCharCode">
    from browser import document
    
    def charCode(ev):
        trace = document["traceCharCode"]
        char = chr(ev.charCode)
        trace.text = 'charCode : %s, ' %ev.charCode
        trace.text += 'character : %s' %char
    
    document['charCode'].bind('keypress', charCode)
</div>
</td>

<tr>
<td>
`ctrlKey`
> `True` si la tecla Control está activa cuando se produce el evento del teclado

> Este atributo no aplica para el evento *input*

> Normalmente se usa con el evento *keypress*, para ser capaz de comprobar si Ctrl+&lt;key&gt; fue pulsado o solo &lt;key&gt;</td>
<td>
#### Ejemplo

Introduce texto en el campo de más abajo, presionando y sin presionar la tecla Ctrl

<input id="ctrlKey" value=""></input>
&nbsp;<span id="traceCtrlKey">&nbsp;</span>

#### Código

<div id="codeCtrlKey">
    from browser import document
        
    def ctrlKey(ev):
        trace = document["traceCtrlKey"]
        trace.text = 'ctrlKey : %s ' %ev.ctrlKey
        ev.preventDefault()
    
    document['ctrlKey'].bind('keypress', ctrlKey)
</div>
Fíjate que `ev.preventDefault()` para evitar el comportamiento por defecto de algunos atajos de teclado que usan la tecla Ctrl

</td>
</tr>

<tr>
<td>
`keyCode`
> Un código numérico dependiente del sistema y de la implementación identificando el valor sin modificar de la tecla pulsada

> El valor no cambia si se pulsan las teclas Alt, Ctrl o Shift

> Fíjate que el resultado no será el mismo dependiendo del evento a manejar, *keydown*, *keyup* o *keypress*
</td>
<td>
#### Ejemplo

Introduce texto en el campo de más abajo. Date cuenta que el carácter se puede leer mediante `ch(ev.charCode)` con el evento *keypress*

with *keydown* <input id="keyCodeKeydown" value=""></input>

<p>with *keypress* <input id="keyCodeKeypress" value=""></input>
&nbsp;<span id="traceKeyCode">&nbsp;</span>

<p>con *keyup* <input id="keyCodeKeyup" value=""></input>

#### Código

<div id="codeKeyCode">
    from browser import document
    
    def keyCode(ev):
        trace = document["traceKeyCode"]
        trace.text = 'event %s '%ev.type
        trace.text += ', keyCode : %s ' %ev.keyCode
        ev.stopPropagation()
    
    document['keyCodeKeydown'].bind('keydown', keyCode)
    document['keyCodeKeypress'].bind('keypress', keyCode)
    document['keyCodeKeyup'].bind('keyup', keyCode)
</div>

</td>
</tr>

<tr>
<td>
`shiftKey`
> `True` si la tecla Shift está activa en el momento de generar el evento

> Este atributo no aplica para el evento *input*

> Normalmente se usa con *keypress*, para ser capaz de comprobar si Shift+&lt;key&gt; fue pulsado o solo &lt;key&gt;</td>
</td>
<td>
#### Ejemplo

Introduce texto en el campo de más abajo, pulsando y sin pulsar la tecla Shift

<input id="shiftKey" value=""></input>
&nbsp;<span id="traceShiftKey">&nbsp;</span>

#### Code

<div id="codeShiftKey">
    from browser import document
    
    def shiftKey(ev):
        trace = document["traceShiftKey"]
        trace.text = 'shiftKey : %s ' %ev.shiftKey

    document['shiftKey'].bind('keypress', shiftKey)
</div>
</td>
</tr>

<tr>
<td>
`which`
> Un código numérico dependiente del sistema y de la implementación identificando el alor sin modificar de la tecla pulsada

> Fíjate que el resultado no será el mismo dependiendo del evento a manejar, *keydown*, *keyup* o *keypress*
</td>
<td>
#### Ejemplo

Introduce texto en el campo de más abajo. Date cuenta que el carácter se puede leer mediante `ch(ev.which)` del evento *keypress*


<table>
<tr>
<td>
con *keydown* <input id="whichKeydown"></input>

<p>con *keypress* <input id="whichKeypress"></input>

<p>con *keyup* <input id="whichKeyup"></input>

 </td>
 <td>
 <span id="traceWhich">&nbsp;</span>
 </td>
 </tr>
 <tr>
 <td colspan=2>
 
#### Código

 <div id="codeWhich">
    from browser import document

    def which(ev):
        trace = document["traceWhich"]
        trace.html = 'event : %s<br>' %ev.type
        trace.html += 'which : %s<br>' %ev.which
        if ev.type == 'keypress':
            trace.html += 'character : %s' %chr(ev.which)

    document['whichKeydown'].bind('keydown', which)
    document['whichKeypress'].bind('keypress', which)
    document['whichKeyup'].bind('keyup', which)
 </div>
 </td>
 </tr>
 </table>
</td>
</tr>
</table>

<script type="text/python">
from browser import document

exec(document["codeAltKey"].text)
exec(document["codeCharCode"].text)
exec(document["codeCtrlKey"].text)
exec(document["codeKeyCode"].text)
exec(document["codeShiftKey"].text)
exec(document["codeWhich"].text)
</script>
