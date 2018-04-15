Problema
-------

Habilitar / Deshabilitar un evento de un elemento


Solución
--------


<table>
<tr>
<td>

```exec_on_load
from browser import document
from browser import alert

def myevent(ev):
    alert("¡Funciona!")

def counter():
    alert('%s evento(s) vinculados con "click"'
        %len(document["myblock"].events("click")))

def bind_click(ev):
    document["myblock"].bind("click", myevent)
    counter()
    document["mymessage"].text="evento añadido, clicka para verlo..."

document["bind_click"].bind("click", bind_click)

def unbind_click(ev):
    if document["myblock"].events("click"):
        document["myblock"].unbind("click", myevent)
        counter()
        document["mymessage"].text="click desactivado"

document["unbind_click"].bind("click", unbind_click)
```
</td>

<td style="padding-left:5em;">
<div id="myblock" style="width:100px; height:100px; background:red"></div>
<span id="mymessage">esperando para hacer algo</span>
<div><button id="bind_click">Vincular evento</button>
<button id="unbind_click">Desvincular</button>
</td>

</table>
