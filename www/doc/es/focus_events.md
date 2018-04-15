Eventos de foco
===============

<script type="text/python">
from browser import document as doc
from browser import alert
</script>

Los eventos de foco son

<table cellpadding=3 border=1>
<tr>
<td>*blur*</td>
<td>un elemento ha perdido el foco
</td>
</tr>

<tr>
<td>*focus*</td><td>un elemento ha recibido el foco</td>
</tr>

</table>

#### Ejemplo

Pulsa en el campo de entrada de abajo para hacer que reciba el foco, 
posteriormente pulsa en cualquier otro sitio para hacer que pierda el foco.

<p><input id="entry"></input>&nbsp;<span id="traceFocus">&nbsp;</span>

#### Código

```exec_on_load
from browser import document

def focus(ev):
    document["traceFocus"].text = f"{ev.target.id} recibe el foco"

document["entry"].bind("focus", focus)

def blur(ev):
    document["traceFocus"].text = f"{ev.target.id} pierde el foco"

document["entry"].bind("blur", blur)
```
