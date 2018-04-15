
Focus events
============

<script type="text/python">
from browser import document as doc
from browser import alert
</script>
Les événement focus sont :

<table cellpadding=3 border=1>
<tr>
<td>*blur*</td>
<td>un élément a perdu le focus
</td>
</tr>

<tr>
<td>*focus*</td><td>un élément a reçu le focus</td>
</tr>

</table>

#### Exemple

Cliquer sur le champ de saisie ci-dessous pour qu'il reçoive le focus, puis
cliquer ailleurs dans la page pour que le champ de saisie perde le focus.

<p><input id="entry" autocomplete="off">&nbsp;<span id="traceFocus">&nbsp;</span>

#### Code

```exec_on_load
from browser import document

def focus(ev):
    document["traceFocus"].text = f"{ev.target.id} reçoit le focus"

document["entry"].bind("focus", focus)

def blur(ev):
    document["traceFocus"].text = f"{ev.target.id} perd le focus"

document["entry"].bind("blur", blur)
```
