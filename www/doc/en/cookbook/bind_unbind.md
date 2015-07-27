Problem
-------

Enable / disable an event on an element


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

def counter():
    alert('%s event(s) attached to "click"' 
        %len(document['myblock'].events('click')))

def bind_click(ev):
    document['myblock'].bind('click', myevent)
    counter()
    document['mymessage'].text='événement attaché, cliquer pour voir...'

def unbind_click(ev):
    if document['myblock'].events('click'):
        document['myblock'].unbind('click', myevent)
        counter()
        document['mymessage'].text='clic désactivé'

document['bind_click'].bind('click', bind_click)
document['unbind_click'].bind('click', unbind_click)
```
</td>

<td style="padding-left:5em;">
<div id="myblock" style="width:100px; height:100px; background:red"></div>
<span id="mymessage">waiting to do something</span>
<div><button id="bind_click">Bind event</button>
<button id="unbind_click">Unbind</button>
</td>

</table>