Problem
-------
Drag and drop an element on the web page


Solution
--------

Brython implements an API based on HTML5 drag and drop specification. In the basic form presented in this example, it consists in defining callback functions for 3 events :
- _dragstart_ on the draggable element (when the user starts dragging it)
- _dragover_ on the destination zone (when the draggable element is moved over it)
- _drop_ on the destination zone (when the user releases the mouse button)

To attach the function _callback_ to an _event_ on an _element_, we use the method _element_<code>.bind(_event,callback_)</code>

The callback functions take a single argument, an instance of `DOMEvent`. To communicate information during the drag and drop operation, the event has an attribute _data_ that receives a value in the callback associated to _dragstart_ ; this value is used in the callback associated with _drop_ to identify the element that is being dropped

In the example, when the draggable object has been dropped, it can't be dragged any more ; for this, we remove the bindings attached to an _event_ on this object using the method _element_<code>.unbind(_event_)</code>

<div style="width:400px;height:150px;background-color:yellow" id="panel">
<div id="dest" style="position:absolute;width:180px;height:80px;background-color:green;color:white;">destination zone</div>
<div id="source" style="position:absolute;width:80px;height:40px;background-color:red;">draggable object</div>
</div>

```exec_on_load
from browser import document as doc

panel = doc["panel"] # yellow zone

source = doc["source"] # red zone
# place it at (10,10) from panel top left corner
source.style.top = "%spx" %(10+panel.top)
source.style.left = "%spx" %(10+panel.left)
# make red zone draggable
source.draggable = True

dest = doc["dest"] # green zone
# place it at (10,150) from panel top left corner
dest.style.top = "%spx" %(10+panel.top)
dest.style.left = "%spx" %(150+panel.left)

# when mouse is over the draggable element, change cursor
def mouse_over(ev):
    print('mouse over ! ')
    ev.target.style.cursor = "pointer"

# offset of mouse relatively to dragged object when dragging starts
m0 = [None,None]

# function called when the user starts dragging the object
def drag_start(ev):
    global m0
    # compute mouse offset
    # ev.x and ev.y are the coordinates of the mouse when the event is fired
    # ev.target is the dragged element. Its attributes "left" and "top" are
    # integers, the distance from the left and top borders of the document
    m0 = [ev.x-ev.target.left,ev.y-ev.target.top]
    # associate data to the dragging process
    ev.dataTransfer.setData('text',ev.target.id)
    # allow dragged object to be moved
    ev.dataTransfer.effectAllowed = 'move'

# function called when the draggable object comes over the destination zone
def drag_over(ev):
    ev.dataTransfer.dropEffect = 'move'
    # here we must prevent the default behaviour for this kind of event
    ev.preventDefault()

# function attached to the destination zone
# describes what happens when the object is dropped, ie when the mouse is
# released while the object is over the zone    
def drop(ev):
    # retrieve data stored in drag_start (the draggable element's id)
    src_id = ev.dataTransfer.getData('text')
    elt = doc[src_id]
    # set the new coordinates of the dragged object
    elt.style.left = "%spx" %(ev.x-m0[0])
    elt.style.top = "%spx" %(ev.y-m0[1])
    # don't drag the object any more
    elt.draggable = False
    # remove the callback function
    elt.unbind('mouseover')
    elt.style.cursor = "auto"
    ev.preventDefault()

# bind events to the draggable objects    
source.bind('mouseover',mouse_over)
source.bind('dragstart',drag_start)

# bind events to the destination zone    
dest.bind('dragover',drag_over)
dest.bind('drop',drop)
```
