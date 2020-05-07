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
from browser.widgets.dialog import InfoDialog

def myevent(ev):
    InfoDialog("bind", "it works !")

def counter():
    nb_events = len(document["myblock"].events("click"))
    InfoDialog("bind", f'{nb_events} event(s) attached to "click"')

def bind_click(ev):
    document["myblock"].bind("click", myevent)
    counter()
    document["mymessage"].text="event is bound, just click to see..."

document["bind_click"].bind("click", bind_click)

def unbind_click(ev):
    if document["myblock"].events("click"):
        document["myblock"].unbind("click", myevent)
        counter()
        document["mymessage"].text="click disabled"

document["unbind_click"].bind("click", unbind_click)
```
</td>

<td style="padding-left:5em;">
<div id="myblock" style="width:100px; height:100px; background:red"></div>
<span id="mymessage">waiting to do something</span>
<div><button id="bind_click">Bind event</button>
<button id="unbind_click">Unbind</button>
</td>

</table>