Problem
-------
Drag and drop an element on the web page


Solution
--------

Brython implements an API based on HTML5 drag and drop specification. In the
basic form presented in this example, it consists in defining callback
functions for 3 events :

- _dragstart_ on the draggable element (when the user starts dragging it)
- _dragover_ on the destination zone (when the draggable element is moved over
  it)
- _drop_ on the destination zone (when the user releases the mouse button)

To attach the function _callback_ to an _event_ on an _element_, we use the
method _element_<code>.bind(_event,callback_)</code>

The callback functions take a single argument, an instance of `DOMEvent`. To
communicate information during the drag and drop operation, the event has an
attribute _data_ that receives a value in the callback associated to
_dragstart_ ; this value is used in the callback associated with _drop_ to
identify the element that is being dropped.

In the example, when the draggable object has been dropped, it can't be
dragged any more ; for this, we remove the bindings attached to an _event_ on
this object using the method _element_<code>.unbind(_event_)</code>

<div style="width:400px;height:150px;background-color:yellow" id="panel">
<div id="dest" style="position:absolute;width:180px;height:80px;background-color:green;color:white;">destination zone</div>
<div id="source" style="position:absolute;width:80px;height:40px;background-color:red;">draggable object</div>
</div>

```exec_on_load
from browser import document

panel = document["panel"] # yellow zone

source = document["source"] # red zone
# place it at (10, 10) from panel top left corner
source.style.top = "{}px".format(10 + panel.abs_top)
source.style.left = "{}px".format(10 + panel.abs_left)
# make red zone draggable
source.draggable = True

dest = document["dest"] # green zone
# place it at (10, 150) from panel top left corner
dest.style.top = "{}px".format(10 + panel.abs_top)
dest.style.left = "{}px".format(150 + panel.abs_left)

# offset of mouse relatively to dragged object when dragging starts
m0 = [None, None]

def mouseover(ev):
    """When mouse is over the draggable element, change cursor."""
    print('mouse over ! ')
    ev.target.style.cursor = "pointer"

source.bind("mouseover", mouseover)

def dragstart(ev):
    """Function called when the user starts dragging the object."""
    global m0
    # compute mouse offset
    # ev.x and ev.y are the coordinates of the mouse when the event is fired
    # ev.target is the dragged element. Its attributes "left" and "top" are
    # integers, the distance from the left and top borders of the document
    m0 = [ev.x - ev.target.left, ev.y - ev.target.top]
    # associate data to the dragging process
    ev.dataTransfer.setData("text", ev.target.id)
    # allow dragged object to be moved
    ev.dataTransfer.effectAllowed = "move"

source.bind("dragstart", dragstart)

def dragover(ev):
    """Function called when the draggable object comes over the destination
    zone.
    """
    ev.dataTransfer.dropEffect = "move"
    # here we must prevent the default behaviour for this kind of event
    ev.preventDefault()

dest.bind("dragover", dragover)

def drop(ev):
    """Function attached to the destination zone.
    Describes what happens when the object is dropped, ie when the mouse is
    released while the object is over the zone.
    """
    # retrieve data stored in drag_start (the draggable element's id)
    src_id = ev.dataTransfer.getData('text')
    elt = document[src_id]
    # set the new coordinates of the dragged object
    elt.style.left = "{}px".format(ev.x - m0[0])
    elt.style.top = "{}px".format(ev.y - m0[1])
    # don't drag the object any more
    elt.draggable = False
    # remove the callback function
    elt.unbind("mouseover")
    elt.style.cursor = "auto"
    ev.preventDefault()

dest.bind("drop", drop)
```
