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
    alert('ça marche !')
```

### Active l'exécution d'une fonction quand on clique sur l'élément

```exec
document['myblock'].bind('click', myevent)
document['mymessage'].text='événement attaché, cliquer pour voir...'
```

### Désactive

```exec
document['myblock'].unbind('click', myevent)
document['mymessage'].text='clic désactivé'
```

</td>

<td style="padding-left:5em;">
<div id="myblock" style="width:100px; height:100px; background:red"></div>
<span id="mymessage">en attente d'activation</span>
</td>

</table>