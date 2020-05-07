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
from browser.widgets.dialog import InfoDialog

def myevent(ev):
    InfoDialog("bind", "ça marche !")

def compteur():
    nb_events = len(document["myblock"].events("click"))
    InfoDialog("bind", f'{nb_events} événement(s) attaché(s) à "click"')

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