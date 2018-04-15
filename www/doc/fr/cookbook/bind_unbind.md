Problème
--------

Activer / désactiver un événement sur un élément

Solution
--------

<table>
<tr>
<td>

```exec_on_load
from browser import document
from browser import alert

def myevent(ev):
    alert("ça marche !")

def compteur():
    alert('%s événement(s) attaché(s) à "click"'
        %len(document["myblock"].events("click")))

def attache(ev):
    document["myblock"].bind("click", myevent)
    compteur()
    document["mymessage"].text = "événement attaché, cliquer pour voir..."

document["attache"].bind("click", attache)

def detache(ev):
    if document["myblock"].events("click"):
        document["myblock"].unbind("click", myevent)
        compteur()
        document["mymessage"].text = "clic désactivé"

document["detache"].bind("click", detache)
```

</td>

<td style="padding-left:5em;">
<div id="myblock" style="width:100px; height:100px; background:red"></div>
<span id="mymessage">en attente d'activation</span>
<div><button id="attache">Attache événement</button>
<button id="detache">Détache</button>
</td>

</table>