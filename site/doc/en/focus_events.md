Focus events
============

<script type="text/python">
from browser import document as doc
from browser import alert
</script>

Focus events are

<table cellpadding=3 border=1>
<tr>
<td>*blur*</td>
<td>an element has lost focus
</td>
</tr>

<tr>
<td>*focus*</td><td>an element has received focus</td>
</tr>

</table>

#### Example

Click in the entry field below to make it receive focus, then click somewhere outside the field to make it lose focus

<p><input id="entry"></input>&nbsp;<span id="traceFocus">&nbsp;</span>

#### Code

<div id="codeFocus">
    from browser import document
    
    def getFocus(ev):
        document["traceFocus"].text = '%s receives focus' %ev.target.id
        
    def loseFocus(ev):
        document["traceFocus"].text = '%s loses focus' %ev.target.id

    document['entry'].bind('blur', loseFocus)
    document['entry'].bind('focus', getFocus)
</div>

<script type="text/python">
from browser import document

exec(document["codeFocus"].text)
</script>

