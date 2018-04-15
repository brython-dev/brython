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

```exec_on_load
from browser import document

# the entry field has the id "altKey"
def keypress(ev):
    document["traceAltKey"].text = f"altKey: {ev.altKey}"

document["altKey"].bind("keypress", keypress)
```
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

```exec_on_load
from browser import document

def charCode(ev):
    trace = document["traceCharCode"]
    char = chr(ev.charCode)
    trace.text = f"charCode: {ev.charCode}, character: {char}"

document["charCode"].bind("keypress", charCode)
```
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

```exec_on_load
from browser import document

def keypress(ev):
    trace = document["traceCtrlKey"]
    trace.text = f"ctrlKey : {ev.ctrlKey}"
    ev.preventDefault()

document["ctrlKey"].bind("keypress", keypress)
```
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

```exec_on_load
from browser import document

def keyCode(ev):
    trace = document["traceKeyCode"]
    trace.text = f"event {ev.type}, keyCode : {ev.keyCode}"
    ev.stopPropagation()

document["keyCodeKeydown"].bind("keydown", keyCode)
document["keyCodeKeypress"].bind("keypress", keyCode)
document["keyCodeKeyup"].bind("keyup", keyCode)
```

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

```exec_on_load
from browser import document

def keypress(ev):
    trace = document["traceShiftKey"]
    trace.text = f"shiftKey : {ev.shiftKey}"

document["shiftKey"].bind("keypress", keypress)
```
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

```exec_on_load
from browser import document

def which(ev):
    trace = document["traceWhich"]
    trace.html = f"event : {ev.type}<br>which: {ev.which}"
    if ev.type == "keypress":
        trace.html += f"<br>character : {chr(ev.which)}"

document["whichKeydown"].bind("keydown", which)
document["whichKeypress"].bind("keypress", which)
document["whichKeyup"].bind("keyup", which)
```
 </td>
 </tr>
 </table>
</td>
</tr>
</table>
