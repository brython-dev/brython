Events
==========

<script type="text/python">
from browser import document as doc
from browser import alert
</script>

Introduction
------------

Suppose we have in a page a element of type button, like this one :
 <button>a button</button>

If you click on it, nothing will happen, because no instruction was given on
how to react to a click. For that, the action to take is defined by this
syntax :

```python
def show(ev):
    ...

btn.bind("click", show)
```

`btn` is a reference to the lement. The arguments of `bind` are the type of
event the button must handle, and the function to call when this event occurs.
The following pages give many examples of such events for mouse, keyboard,
drag-and-drop, etc.

The callback function takes a single argument, an instance of the class
`DOMEvent` defined in module **browser**. For instance :

```python
def show(ev):
    print('ok')

btn.bind("click", show)
```

(remember that to see the results of `print` the browser console must be open)

Instances of `DOMEvent` have a number of attributes that depend on the event
type. In the case of a click, and more generally for events related to the
mouse, the attributes include

- `target` : the element the event was dispatched on
- `x, y` : position of the mouse relatively to the upper left corner of the window

For instance, to print the button text and the mouse position :

```python
def show(ev):
    print(ev.target.text, ev.x, ev.y)

btn.bind("click", show)
```

Interface
---------
For events management, the elements of a page have the following methods :

<code>elt.bind(_evt_name, handler_)</code>

> the _handler_ function is called when the event _event_name_ occurs on the
> element

<code>elt.unbind(_evt\_name[, handler_])</code>

> removes the association of function _handler_ to the event named
> _evt\_name_. If _handler_ is omitted, removes all the associations for the
> event

<code>elt.events(_evt\_name_)</code>

> returns the list of functions that handle the event named _evt\_name_

Using the decorator `browser.bind`
----------------------------------
_New in version 3.6.0_

The **browser** module defines a function `bind` that can be used as a
decorator for an event handler. Its syntax is

<code>@bind(_target, evt_)</code>

If _target_ is a `DOMNode` instance, the decorated function handles the
event _evt_ on this element.

If _target_ is a string, it is interpreted as a CSS selector ; for all
the elements in the page that match this selector, the event _evt_ is
managed by the decorated function.

Examples:

```python
from browser import document, bind

@bind(document[element_id], "mouseover")
def mouseover(ev):
    ...

@bind("div.foo", "enter") # all the DIV elements with attribute class="foo"
def enter(ev):
    ...
```

`DOMEvent` objects
------------------
(information by Mozilla Contributors, found at [https://developer.mozilla.org/en-US/docs/Web/API/event](https://developer.mozilla.org/en-US/docs/Web/API/event))

Whatever the event type, instances of class `DOMEvent` have the following attributes

<table border=1 cellpadding=5>

<tr>
<td>
`bubbles`
> boolean, indicates whether the given event bubbles up through the DOM or not
</td>
<td>
<button id="_bubbles">test</button>
<script type="text/python">
from browser import document, alert

document["_bubbles"].bind("click", lambda ev:alert("bubbles : %s " %ev.bubbles))
</script>
</td>
</tr>

<tr>
<td>
`cancelable`
> boolean, indicates whether the event is cancelable or not
</td>
<td>
<button id="_cancelable">test</button>
<script type="text/python">
from browser import document, alert

document["_cancelable"].bind("click", lambda ev:alert("cancelable : %s " %ev.cancelable))
</script>
</td>
</tr>

<tr>
<td>
`currentTarget`
> instance of `DOMNode` ; identifies the current target for the event, as the event traverses the DOM. It always refers to the element the event handler has been attached to as opposed to event.target which identifies the element on which the event occurred.
</td>
<td>
<button id="_currentTarget">test</button>
<script type="text/python">
from browser import document, alert

document["_currentTarget"].bind("click",
    lambda ev: alert("currentTarget : %s " %ev.currentTarget))
</script>
</td>
</tr>

<tr>
<td>
`defaultPrevented`
> boolean indicating whether or not event.preventDefault() was called on the event
</td>
<td>
<button id="_defaultPrevented">test</button>
<script type="text/python">
from browser import document, alert

document["_defaultPrevented"].bind("click",
    lambda ev:alert("defaultPrevented : %s " %ev.defaultPrevented))
</script>
</td>
</tr>

<tr>
<td>
`eventPhase`
> integer, indicates which phase of the [event flow](http://www.w3.org/TR/DOM-Level-3-Events/#event-flow) is currently being evaluated
</td>
<td>
<button id="_eventPhase">test</button>
<script type="text/python">
from browser import document, alert

document["_eventPhase"].bind("click",
    lambda ev:alert("eventPhase : %s " %ev.eventPhase))
</script>
</td>
</tr>

<tr>
<td>
`target`
> `DOMNode` instance ; the object the event was dispatched on. It is different than `event.currentTarget` when the event handler is called in bubbling or capturing phase of the event
</td>
<td>
<button id="_target">test</button>
<script type="text/python">
from browser import document, alert

document["_target"].bind("click", lambda ev:alert("target : %s " %ev.target))
</script>
</td>
</tr>

<tr><td>`timeStamp`
> integer, the time (in milliseconds since Jan. 1st, 1970 at 0h) at which the event was created
</td>
<td>
<button id="_timeStamp">test</button>
<script type="text/python">
from browser import document, alert

document["_timeStamp"].bind("click",
    lambda ev: alert("timeStamp : %s " %ev.timeStamp))
</script>
</td>
</tr>

<tr><td>`type`
> string, contains the event type
</td>
<td>
<button id="_type">test</button>
<script type="text/python">
from browser import document, alert

document["_type"].bind("click", lambda ev:alert("type : %s " %ev.type))
</script>
</td>
</tr>

</table>

and the following methods

`preventDefault()`
> prevents the execution of the action associated by default to the event

> **Example**

> When a checkbox is clicked on, the default action is to show or hide a tick inside the checkbox :

>> checkbox (default behaviour) <input type="checkbox">

> To disable this behaviour on the checkbox :

<blockquote>
```exec_on_load
from browser import document

def _cancel(ev):
    ev.preventDefault()

document["disabled_cbox"].bind("click",_cancel)
```
</blockquote>

>> result :

>> disabled checkbox <input type="checkbox" id="disabled_cbox">


`stopPropagation()`
> prevents further propagation of the current event

> **Example**

> In the coloured zone below

<div id="yellow" style="background-color:yellow;width:200px;padding:20px;margin-left:100px;">outer<p>
<div id="blue" style="background-color:blue;color:white;padding:20px;">inner, normal propagation</div>
<div id="green" style="background-color:green;color:white;padding:20px;">inner, propagation stopped</div>
</div>

> the 3 elements (the outer yellow frame and the inner blue and green frames) handle the click event

<blockquote>
```exec_on_load
from browser import document, alert

def show(ev):
    alert("click on %s" %ev.currentTarget.id)

def show_stop(ev):
    alert("clic on %s" %ev.currentTarget.id)
    ev.stopPropagation()

document["yellow"].bind("click",show)
document["blue"].bind("click",show)
document["green"].bind("click",show_stop)
```
</blockquote>

> Clicking on the yellow zone triggers the call of function `show()`, which
> prints the message "click on yellow".

> A click on the blue zone triggers the alert message "click on blue". Then
> the event propagates to the parent, the yellow frame. Since this frame also
> handles the event "click", the browser calls the associated action, the same
> function `show()`, and shows the message "click on yellow" (notice that the
> attribute `currentTarget` is updated when the event propagates).

> Clicking on the green zone cause the message "click on green" to pop up.
> This event is handled by the function `show_stop()`, which ends in

>>    ev.stopPropagation()

> So the event does not propagate to the upper level and the execution exits
> without an alert box "click on yellow".

Creating and firing an event
----------------------------

If you want to fire an event on an element, first check the
[Event reference](https://developer.mozilla.org/en-US/docs/Web/Events) ; for
instance, the event "click" uses the DOM interface `MouseEvent`, available
in Brython by `window.MouseEvent`.

`MouseEvent` is a constructor, so to create the event object use its
attribute `new` :

```python
event = window.MouseEvent.new("click")
```

then

```python
element.dispatchEvent(event)
```

fires the event on the specified element.