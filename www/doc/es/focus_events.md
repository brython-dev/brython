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

Pulsa en el campo de entrada de abajo para hacer que reciba el foco, posteriormente pulsa en cualquier otro sitio para hacer que pierda el foco

<p><input id="entry"></input>&nbsp;<span id="traceFocus">&nbsp;</span>

#### Código

<div id="codeFocus">
    from browser import document
    
    def getFocus(ev):
        document["traceFocus"].text = '%s recibe el foco' %ev.target.id
        
    def loseFocus(ev):
        document["traceFocus"].text = '%s pierde el foco' %ev.target.id

    document['entry'].bind('blur', loseFocus)
    document['entry'].bind('focus', getFocus)
</div>

<script type="text/python">
from browser import document

exec(document["codeFocus"].text)
</script>
