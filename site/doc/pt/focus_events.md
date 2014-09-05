Eventos de Foco
---------------

<script type="text/python">
from browser import doc, alert
</script>

Os eventos de foco são os seguintes:

<table cellpadding=3 border=1>
<tr>
<td>*blur*</td>
<td>um elemento perdeu foco
</td>
</tr>

<tr>
<td>*focus*</td><td>um elemento recebeu foco</td>
</tr>

</table>

#### Exemplo

Clique no campo de entrada de texto abaixo para fazê-lo receber foco,
e então clique em algum lugar fora deste campo para fazê-lo perder
foco.

<p><input id="entry"></input>&nbsp;<span id="traceFocus">&nbsp;</span>

#### Código

<div id="codeFocus">
    def getFocus(ev):
        doc["traceFocus"].text = '%s receives focus' %ev.target.id
        
    def loseFocus(ev):
        doc["traceFocus"].text = '%s loses focus' %ev.target.id

    doc['entry'].bind('blur', loseFocus)
    doc['entry'].bind('focus', getFocus)
</div>

<script type="text/python">
exec(doc["codeFocus"].text)
</script>
