Problema
--------
Manejar la selección de opciones en un elemento SELECT y en *checkboxes*.

Solución
--------
Los elementos SELECT están compuestos por elementos OPTION. Un elemento OPTION 
posee un atributo booleano _selected_. Este atributo puede ser leído para 
comprobar si la opción ha sido seleccionada ; asignándole un valor `True` o 
`False` selecciona o deselecciona la opción.

Los elementos Checkbox (INPUT type="checkbox") poseenun atributo booleano 
_checked_ que se puede usar de la misma forma : para conocer si una caja ha 
sido chequeada, o para chequearla/deschequearla.

El ejemplo de más bajo selecciona o deselecciona opciones de acuerdo al estado
 (chequeado/deschequeado) de los elementos checkbox ; de la misma forma, un 
 click en un elemento SELECT provoca el chequeo/deschequeo del checkbox 
 asociado.

La función `show_selected()` muestra como obtener la lista de los elementos 
seleccionados; `for option in sel` itera itera sobre las opciones posibles. 
Para un elemento SELECT con una única opción (sin atributo _multiple_) el 
rango de la opción seleccionada también se obtiene a partir de 
`sel.selectedIndex`

```exec_on_load
from browser import document, html, alert

def update_select(ev):
    # selecciona / deseleccona opciones en la caja SELECT
    # ev.target es el checkbox que acabamos de clickar
    rank = choices.index(ev.target.value)
    sel.options[rank].selected = ev.target.checked

def show_selected(ev):
    alert([option.value for option in sel if option.selected])

def update_checkboxes(ev):
    # actualiza checkboxes cuando la selección ha cambiado
    selected = [option.value for option in sel if option.selected]
    for elt in document.get(selector='input[type="checkbox"]'):
        elt.checked = elt.value in selected
    
choices = ["one", "two", "three", "four", "five"]
sel = html.SELECT(size=5, multiple=True)
for item in choices:
    sel <= html.OPTION(item)
sel.bind("change", update_checkboxes)

for item in choices:
    chbox = html.INPUT(Type="checkbox", value=item)
    chbox.bind("click", update_select)
    document["panel"] <= item + chbox

document["panel"] <= sel

b_show = html.BUTTON("show selected")
b_show.bind("click", show_selected)
document["panel"] <= b_show
```

<div id="panel"></div>

