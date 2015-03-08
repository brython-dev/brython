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
    alert('it works !')
```

### Trigger function launch when the element is clicked upon

```exec
document['myblock'].bind('click', myevent)
document['mymessage'].text='event bound, just click...'
```

### Désactive

```exec
document['myblock'].unbind('click', myevent)
document['mymessage'].text='click disabled'
```

</td>

<td style="padding-left:5em;">
<div id="myblock" style="width:100px; height:100px; background:red"></div>
<span id="mymessage">waiting to do something</span>
</td>

</table>